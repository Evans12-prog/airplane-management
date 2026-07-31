import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useDashboardStats, useDelayTrends } from '@/hooks/useAnalytics';
import { useFlights } from '@/hooks/useFlights';
import { TrendingUp, DollarSign, Percent, Clock } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

const COLORS = ['hsl(217, 91%, 60%)', 'hsl(142, 71%, 45%)', 'hsl(38, 92%, 50%)', 'hsl(0, 72%, 51%)', 'hsl(262, 83%, 58%)'];

export default function AnalyticsPage() {
  const { stats } = useDashboardStats();
  const { data: delayData } = useDelayTrends();
  const { flights } = useFlights();

  const monthlyFlights = useMemo(() => {
    const monthly: Record<string, number> = {};
    flights.forEach((f) => {
      const month = new Date(f.departure_time).toLocaleString('default', { month: 'short' });
      monthly[month] = (monthly[month] || 0) + 1;
    });
    return Object.entries(monthly).map(([month, count]) => ({ month, flights: count }));
  }, [flights]);

  const delayReasons = useMemo(() => {
    const reasons = flights
      .filter((f) => f.delay_reason)
      .reduce((acc, f) => {
        acc[f.delay_reason!] = (acc[f.delay_reason!] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
    return Object.entries(reasons).map(([reason, count]) => ({ reason, count }));
  }, [flights]);

  const routeStats = useMemo(() => {
    const routes: Record<string, { flights: number; passengers: number; delays: number }> = {};
    flights.forEach((f) => {
      if (!f.routes) return;
      const key = `${f.routes.origin_code}-${f.routes.destination_code}`;
      if (!routes[key]) routes[key] = { flights: 0, passengers: 0, delays: 0 };
      routes[key].flights++;
      routes[key].passengers += f.passenger_count || 0;
      if (f.status === 'delayed') routes[key].delays++;
    });
    return Object.entries(routes).map(([route, data]) => ({
      route,
      ...data,
      avgPassengers: Math.round(data.passengers / data.flights),
    }));
  }, [flights]);

  const estimatedRevenue = useMemo(() => {
    return flights.reduce((sum, f) => sum + (f.passenger_count || 0) * 1800, 0);
  }, [flights]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analytics & Insights</h2>
        <p className="text-sm text-muted-foreground">Comprehensive operational metrics and performance data</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full lg:w-auto">
          <TabsTrigger value="overview" data-testid="tab-overview">Overview</TabsTrigger>
          <TabsTrigger value="delays" data-testid="tab-delays">Delay Trends</TabsTrigger>
          <TabsTrigger value="routes" data-testid="tab-routes">Routes</TabsTrigger>
          <TabsTrigger value="aircraft" data-testid="tab-aircraft">Aircraft</TabsTrigger>
          <TabsTrigger value="crew" data-testid="tab-crew">Crew</TabsTrigger>
          <TabsTrigger value="financial" data-testid="tab-financial">Financial</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: 'Total Flights', value: stats?.totalFlights || 0, icon: TrendingUp, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-950' },
              { title: 'On-Time Performance', value: `${stats?.onTimePerformance || 0}%`, icon: Percent, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-950' },
              { title: 'Avg Delay (min)', value: '12', icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-950' },
              { title: 'Est. Revenue', value: `R${(estimatedRevenue / 1000000).toFixed(1)}M`, icon: DollarSign, color: 'text-purple-600', bg: 'bg-purple-50 dark:bg-purple-950' },
            ].map((metric, i) => (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-card-border rounded-xl p-6"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className={`${metric.bg} ${metric.color} p-2 rounded-lg`}>
                    <metric.icon className="h-5 w-5" />
                  </div>
                </div>
                <p className="text-3xl font-bold text-foreground">{metric.value}</p>
                <p className="text-sm text-muted-foreground mt-1">{metric.title}</p>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-card border border-card-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Monthly Flights</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyFlights}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="flights" fill="hsl(217, 91%, 60%)" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-card border border-card-border rounded-xl p-6">
              <h3 className="text-lg font-semibold mb-4 text-foreground">Delay Reasons</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={delayReasons}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ reason, percent }) => `${reason}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {delayReasons.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>

        {/* Delay Trends Tab */}
        <TabsContent value="delays" className="space-y-6">
          <div className="bg-card border border-card-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">6-Month Delay Analysis</h3>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={delayData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="delays" stroke="hsl(38, 92%, 50%)" strokeWidth={3} name="Delayed" />
                <Line type="monotone" dataKey="onTime" stroke="hsl(142, 71%, 45%)" strokeWidth={3} name="On Time" />
                <Line type="monotone" dataKey="cancelled" stroke="hsl(0, 72%, 51%)" strokeWidth={3} name="Cancelled" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </TabsContent>

        {/* Routes Tab */}
        <TabsContent value="routes" className="space-y-6">
          <div className="bg-card border border-card-border rounded-xl p-6">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Route Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Route</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Total Flights</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Avg Passengers</th>
                    <th className="text-left py-3 px-4 font-semibold text-foreground">Delays</th>
                  </tr>
                </thead>
                <tbody>
                  {routeStats.map((route, i) => (
                    <tr key={i} className="border-t border-border hover:bg-muted/30">
                      <td className="py-3 px-4 font-mono font-semibold text-foreground">{route.route}</td>
                      <td className="py-3 px-4 text-muted-foreground">{route.flights}</td>
                      <td className="py-3 px-4 text-muted-foreground">{route.avgPassengers}</td>
                      <td className="py-3 px-4 text-muted-foreground">{route.delays}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </TabsContent>

        {/* Aircraft, Crew, Financial placeholders */}
        <TabsContent value="aircraft" className="bg-card border border-card-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground">Aircraft utilization analytics coming soon</p>
        </TabsContent>
        <TabsContent value="crew" className="bg-card border border-card-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground">Crew utilization analytics coming soon</p>
        </TabsContent>
        <TabsContent value="financial" className="bg-card border border-card-border rounded-xl p-12 text-center">
          <p className="text-muted-foreground">Financial analytics coming soon</p>
        </TabsContent>
      </Tabs>
    </div>
  );
}
