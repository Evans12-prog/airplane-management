import { useMemo, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plane, Clock, AlertCircle, XCircle, Users, Wrench, TrendingUp, TrendingDown } from 'lucide-react';
import { useDashboardStats, useDelayTrends } from '@/hooks/useAnalytics';
import { useFlights } from '@/hooks/useFlights';
import { useNotifications } from '@/hooks/useNotifications';
import { useAuthContext } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { StatCardSkeleton, TableSkeleton } from '@/components/shared/LoadingSkeleton';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { format } from 'date-fns';

const statVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.4 },
  }),
};

function SimpleLineChart({ data }: { data: Array<{ month: string; delays: number; onTime: number; cancelled: number }> }) {
  const width = 320;
  const height = 220;
  const padding = 24;
  const maxValue = Math.max(1, ...data.flatMap((item) => [item.delays, item.onTime, item.cancelled]));

  const toPoint = (key: 'delays' | 'onTime' | 'cancelled', index: number) => {
    const value = data[index]?.[key] ?? 0;
    const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
    const y = height - padding - (value / maxValue) * (height - padding * 2);
    return `${x},${y}`;
  };

  const series = {
    delays: data.map((_, index) => toPoint('delays', index)).join(' '),
    onTime: data.map((_, index) => toPoint('onTime', index)).join(' '),
    cancelled: data.map((_, index) => toPoint('cancelled', index)).join(' '),
  };

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-[250px]">
      <line x1={padding} y1={height - padding} x2={width - padding} y2={height - padding} stroke="hsl(var(--border))" />
      <line x1={padding} y1={padding} x2={padding} y2={height - padding} stroke="hsl(var(--border))" />
      {Array.from({ length: 4 }).map((_, index) => {
        const y = padding + ((height - padding * 2) / 3) * index;
        return <line key={y} x1={padding} y1={y} x2={width - padding} y2={y} stroke="hsl(var(--border))" strokeDasharray="4 4" />;
      })}
      {data.map((item, index) => (
        <text key={item.month} x={padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1)} y={height - 6} textAnchor="middle" fontSize="11" fill="hsl(var(--muted-foreground))">
          {item.month}
        </text>
      ))}
      <polyline fill="none" stroke="hsl(38, 92%, 50%)" strokeWidth="3" points={series.delays} />
      <polyline fill="none" stroke="hsl(142, 71%, 45%)" strokeWidth="3" points={series.onTime} />
      <polyline fill="none" stroke="hsl(0, 72%, 51%)" strokeWidth="3" points={series.cancelled} />
    </svg>
  );
}

function SimpleDonutChart({ data }: { data: Array<{ name: string; value: number; color: string }> }) {
  const width = 220;
  const height = 220;
  const radius = 72;
  const center = 110;
  const circumference = 2 * Math.PI * radius;
  const total = Math.max(data.reduce((sum, item) => sum + item.value, 0), 1);

  let offset = 0;

  return (
    <div className="flex flex-col items-center gap-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full max-w-[220px] h-[220px]">
        <circle cx={center} cy={center} r={radius} fill="none" stroke="hsl(var(--muted))" strokeWidth="24" />
        {data.map((item) => {
          const segmentLength = (item.value / total) * circumference;
          const strokeDasharray = `${segmentLength} ${circumference}`;
          const strokeDashoffset = -offset;
          offset += segmentLength;
          return (
            <circle
              key={item.name}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={item.color}
              strokeWidth="24"
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              transform={`rotate(-90 ${center} ${center})`}
            />
          );
        })}
        <circle cx={center} cy={center} r={radius - 28} fill="hsl(var(--card))" />
        <text x={center} y={center - 4} textAnchor="middle" fontSize="18" fontWeight="700" fill="hsl(var(--foreground))">
          {total}
        </text>
        <text x={center} y={center + 18} textAnchor="middle" fontSize="12" fill="hsl(var(--muted-foreground))">
          Aircraft
        </text>
      </svg>
      <div className="flex flex-wrap justify-center gap-3 text-sm">
        {data.map((item) => (
          <div key={item.name} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
            <span className="text-muted-foreground">{item.name}: {item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { stats, loading: statsLoading } = useDashboardStats();
  const { data: delayData, loading: delayLoading } = useDelayTrends();
  const { flights, loading: flightsLoading } = useFlights();
  const { user } = useAuthContext();
  const { notifications } = useNotifications(user?.id);

  const todayFlights = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return flights.filter((f) => f.departure_time?.startsWith(today)).slice(0, 8);
  }, [flights]);

  const [highlightId, setHighlightId] = useState<string | null>(null);

  useEffect(() => {
    const onNewFlight = (event: Event) => {
      const custom = event as CustomEvent<any>;
      const id = custom?.detail?.id ?? null;
      const flightNumber = custom?.detail?.flight_number ?? null;
      if (flightNumber) {
        toast.success(`New flight scheduled: ${flightNumber}`);
      } else {
        toast.success('Flights updated');
      }
      if (id) {
        setHighlightId(id);
        setTimeout(() => setHighlightId(null), 6000);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('skyair-new-flight', onNewFlight as EventListener);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('skyair-new-flight', onNewFlight as EventListener);
      }
    };
  }, []);

  const recentNotifications = useMemo(() => notifications.slice(0, 5), [notifications]);

  const aircraftStatusData = [
    { name: 'Active', value: (stats?.totalAircraft || 0) - (stats?.aircraftInMaintenance || 0), color: 'hsl(142, 71%, 45%)' },
    { name: 'Maintenance', value: stats?.aircraftInMaintenance || 0, color: 'hsl(38, 92%, 50%)' },
  ];

  const statCards = [
    {
      title: 'Total Flights Today',
      value: stats?.totalFlights || 0,
      icon: Plane,
      trend: '+12.3%',
      trendUp: true,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      title: 'Active Flights',
      value: stats?.activeFlights || 0,
      icon: Clock,
      trend: '+5.2%',
      trendUp: true,
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-950',
    },
    {
      title: 'Delayed',
      value: stats?.delayedFlights || 0,
      icon: AlertCircle,
      trend: '-2.1%',
      trendUp: false,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50 dark:bg-orange-950',
    },
    {
      title: 'Cancelled',
      value: stats?.cancelledFlights || 0,
      icon: XCircle,
      trend: '-8.4%',
      trendUp: false,
      color: 'text-red-600',
      bgColor: 'bg-red-50 dark:bg-red-950',
    },
    {
      title: 'Total Employees',
      value: stats?.totalEmployees || 0,
      icon: Users,
      trend: '+3.1%',
      trendUp: true,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50 dark:bg-purple-950',
    },
    {
      title: 'Aircraft in Maintenance',
      value: stats?.aircraftInMaintenance || 0,
      icon: Wrench,
      trend: '-1.2%',
      trendUp: false,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {statsLoading
          ? Array.from({ length: 6 }).map((_, i) => <StatCardSkeleton key={i} />)
          : statCards.map((stat, i) => (
              <motion.div
                key={stat.title}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={statVariants}
                className="bg-card border border-card-border rounded-xl p-5 hover:shadow-lg transition-shadow"
                data-testid={`stat-card-${stat.title.toLowerCase().replace(/\s+/g, '-')}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`${stat.bgColor} ${stat.color} p-2 rounded-lg`}>
                    <stat.icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1 text-xs">
                    {stat.trendUp ? (
                      <TrendingUp className="h-3 w-3 text-green-600" />
                    ) : (
                      <TrendingDown className="h-3 w-3 text-red-600" />
                    )}
                    <span className={stat.trendUp ? 'text-green-600' : 'text-red-600'}>{stat.trend}</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-2xl font-bold text-foreground">{stat.value}</p>
                  <p className="text-xs text-muted-foreground font-medium">{stat.title}</p>
                </div>
              </motion.div>
            ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live Flights Table */}
        <div className="lg:col-span-2 bg-card border border-card-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Live Flights Today</h2>
          {flightsLoading ? (
            <TableSkeleton rows={8} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Flight</th>
                    <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Route</th>
                    <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Departure</th>
                    <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 font-semibold text-muted-foreground">Gate</th>
                  </tr>
                </thead>
                <tbody>
                  {todayFlights.map((flight) => (
                    <tr
                      key={flight.id}
                      className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${highlightId === flight.id ? 'ring-2 ring-primary/40 bg-primary/10' : ''}`}
                    >
                      <td className="py-3 px-2 font-mono font-semibold text-foreground">{flight.flight_number}</td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {flight.routes ? `${flight.routes.origin_code} → ${flight.routes.destination_code}` : 'N/A'}
                      </td>
                      <td className="py-3 px-2 text-muted-foreground">
                        {flight.departure_time ? format(new Date(flight.departure_time), 'HH:mm') : 'N/A'}
                      </td>
                      <td className="py-3 px-2">
                        <StatusBadge status={flight.status} type="flight" />
                      </td>
                      <td className="py-3 px-2 font-medium text-foreground">{flight.gate || 'TBA'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {todayFlights.length === 0 && (
                <p className="text-center py-8 text-muted-foreground">No flights scheduled for today</p>
              )}
            </div>
          )}
        </div>

        {/* Recent Notifications */}
        <div className="bg-card border border-card-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Recent Notifications</h2>
          <div className="space-y-3">
            {recentNotifications.map((notif) => (
              <div
                key={notif.id}
                className="p-3 bg-muted/30 rounded-lg border border-border/50 hover:border-primary/50 transition-colors"
              >
                <p className="text-sm font-medium text-foreground mb-1">{notif.title}</p>
                <p className="text-xs text-muted-foreground line-clamp-2">{notif.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {format(new Date(notif.created_at), 'MMM d, HH:mm')}
                </p>
              </div>
            ))}
            {recentNotifications.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-8">No notifications</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delay Trends Chart */}
        <div className="bg-card border border-card-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Delay Trends (6 Months)</h2>
          {delayLoading ? (
            <div className="h-64 flex items-center justify-center">
              <p className="text-muted-foreground">Loading chart...</p>
            </div>
          ) : (
            <SimpleLineChart data={delayData.length ? delayData : [{ month: 'Jan', delays: 2, onTime: 7, cancelled: 0 }, { month: 'Feb', delays: 1, onTime: 9, cancelled: 0 }, { month: 'Mar', delays: 3, onTime: 8, cancelled: 1 }, { month: 'Apr', delays: 2, onTime: 10, cancelled: 0 }, { month: 'May', delays: 1, onTime: 11, cancelled: 0 }, { month: 'Jun', delays: 2, onTime: 9, cancelled: 1 }]} />
          )}
        </div>

        {/* Aircraft Status */}
        <div className="bg-card border border-card-border rounded-xl p-6">
          <h2 className="text-lg font-semibold mb-4 text-foreground">Aircraft Status</h2>
          <SimpleDonutChart data={aircraftStatusData} />
        </div>
      </div>
    </div>
  );
}
