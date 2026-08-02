import { useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

export interface DashboardStats {
  totalFlights: number;
  activeFlights: number;
  delayedFlights: number;
  cancelledFlights: number;
  totalEmployees: number;
  activeEmployees: number;
  totalAircraft: number;
  availableAircraft: number;
  aircraftInMaintenance: number;
  pilotsAvailable: number;
  cabinCrewAvailable: number;
  totalRoutes: number;
  revenue: number;
  onTimePerformance: number;
  totalPassengersToday: number;
}

const fallbackStats: DashboardStats = {
  totalFlights: 3,
  activeFlights: 2,
  delayedFlights: 1,
  cancelledFlights: 0,
  totalEmployees: 2,
  activeEmployees: 2,
  totalAircraft: 3,
  availableAircraft: 2,
  aircraftInMaintenance: 1,
  pilotsAvailable: 4,
  cabinCrewAvailable: 8,
  totalRoutes: 5,
  revenue: 720000,
  onTimePerformance: 94,
  totalPassengersToday: 472,
};

const fallbackDelayData = [
  { month: 'Jan', delays: 2, onTime: 7, cancelled: 0 },
  { month: 'Feb', delays: 1, onTime: 9, cancelled: 0 },
  { month: 'Mar', delays: 3, onTime: 8, cancelled: 1 },
  { month: 'Apr', delays: 2, onTime: 10, cancelled: 0 },
  { month: 'May', delays: 1, onTime: 11, cancelled: 0 },
  { month: 'Jun', delays: 2, onTime: 9, cancelled: 1 },
];

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(fallbackStats);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchStats = async () => {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          setStats(fallbackStats);
          setLoading(false);
        }
        return;
      }

      const today = new Date().toISOString().split('T')[0];

      const [flightsRes, employeesRes, aircraftRes, crewRes, routesRes] = await Promise.all([
        (supabase.from('flights') as any).select('status,passenger_count,departure_time,delay_minutes,fuel_used_liters'),
        (supabase.from('employees') as any).select('status'),
        (supabase.from('aircraft') as any).select('status'),
        (supabase.from('crew') as any).select('crew_type,is_available'),
        (supabase.from('routes') as any).select('id'),
      ]);

      const flights = (flightsRes.data || []) as Array<Pick<Database['public']['Tables']['flights']['Row'], 'status' | 'passenger_count' | 'departure_time' | 'delay_minutes' | 'fuel_used_liters'>>;
      const employees = (employeesRes.data || []) as Array<Pick<Database['public']['Tables']['employees']['Row'], 'status'>>;
      const aircraft = (aircraftRes.data || []) as Array<Pick<Database['public']['Tables']['aircraft']['Row'], 'status'>>;
      const crew = (crewRes.data || []) as Array<Pick<Database['public']['Tables']['crew']['Row'], 'crew_type' | 'is_available'>>;
      const routes = (routesRes.data || []) as Database['public']['Tables']['routes']['Row'][];

      const todayFlights = flights.filter(
        (f) => f.departure_time?.startsWith(today)
      );

      const completedFlights = flights.filter(
        (f) => f.status === 'arrived' || f.status === 'departed'
      );
      const delayedFlights = flights.filter((f) => f.status === 'delayed');
      const onTimeFlights = completedFlights.filter(
        (f) => f.status === 'arrived'
      );
      const onTimePerformance =
        completedFlights.length > 0
          ? Math.round((onTimeFlights.length / completedFlights.length) * 100)
          : 94;
      const availableAircraft = aircraft.filter((a) => a.status === 'active').length;
      const inMaintenance = aircraft.filter((a) => a.status === 'maintenance').length;
      const pilotsAvailable = crew.filter((c) => c.crew_type === 'pilot' && c.is_available).length;
      const cabinCrewAvailable = crew.filter((c) => c.crew_type === 'flight_attendant' && c.is_available).length;
      const totalRoutes = routes.length;
      const revenue = flights.reduce((sum, f) => sum + ((f.passenger_count || 0) * 1800), 0);

      if (isMounted) {
        setStats({
          totalFlights: flights.length,
          activeFlights: flights.filter((f) =>
            ['scheduled', 'boarding', 'departed'].includes(f.status)
          ).length,
          delayedFlights: delayedFlights.length,
          cancelledFlights: flights.filter((f) => f.status === 'cancelled').length,
          totalEmployees: employees.length,
          activeEmployees: employees.filter((e) => e.status === 'active').length,
          totalAircraft: aircraft.length,
          availableAircraft,
          aircraftInMaintenance: inMaintenance,
          pilotsAvailable,
          cabinCrewAvailable,
          totalRoutes,
          revenue,
          onTimePerformance,
          totalPassengersToday: todayFlights.reduce(
            (sum, f) => sum + (f.passenger_count || 0),
            0
          ),
        });
        setLoading(false);
      }
    };

    fetchStats().catch(() => {
      if (isMounted) {
        setStats(fallbackStats);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return { stats, loading };
}

export function useDelayTrends() {
  const [data, setData] = useState<{ month: string; delays: number; onTime: number; cancelled: number }[]>(fallbackDelayData);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchTrends = async () => {
      if (!isSupabaseConfigured) {
        if (isMounted) {
          setData(fallbackDelayData);
          setLoading(false);
        }
        return;
      }

      const { data: flights } = await (supabase.from('flights') as any)
        .select('status,departure_time')
        .gte('departure_time', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      const trendFlights = (flights || []) as Array<Pick<Database['public']['Tables']['flights']['Row'], 'status' | 'departure_time'>>;
      if (trendFlights.length) {
        const monthly: Record<string, { delays: number; onTime: number; cancelled: number }> = {};
        trendFlights.forEach((f) => {
          const month = new Date(f.departure_time).toLocaleString('default', { month: 'short' });
          if (!monthly[month]) monthly[month] = { delays: 0, onTime: 0, cancelled: 0 };
          if (f.status === 'delayed') monthly[month].delays++;
          else if (f.status === 'arrived') monthly[month].onTime++;
          else if (f.status === 'cancelled') monthly[month].cancelled++;
        });

        if (isMounted) {
          setData(
            Object.entries(monthly).map(([month, values]) => ({ month, ...values }))
          );
        }
      }
      if (isMounted) {
        setLoading(false);
      }
    };
    fetchTrends().catch(() => {
      if (isMounted) {
        setData(fallbackDelayData);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return { data, loading };
}
