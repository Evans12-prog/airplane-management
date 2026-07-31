import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export interface DashboardStats {
  totalFlights: number;
  activeFlights: number;
  delayedFlights: number;
  cancelledFlights: number;
  totalEmployees: number;
  activeEmployees: number;
  totalAircraft: number;
  aircraftInMaintenance: number;
  onTimePerformance: number;
  totalPassengersToday: number;
}

export function useDashboardStats() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      const today = new Date().toISOString().split('T')[0];

      const [flightsRes, employeesRes, aircraftRes] = await Promise.all([
        supabase.from('flights').select('status, passenger_count, departure_time'),
        supabase.from('employees').select('status'),
        supabase.from('aircraft').select('status'),
      ]);

      const flights = flightsRes.data || [];
      const employees = employeesRes.data || [];
      const aircraft = aircraftRes.data || [];

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
        aircraftInMaintenance: aircraft.filter((a) => a.status === 'maintenance').length,
        onTimePerformance,
        totalPassengersToday: todayFlights.reduce(
          (sum, f) => sum + (f.passenger_count || 0),
          0
        ),
      });
      setLoading(false);
    };

    fetchStats();
  }, []);

  return { stats, loading };
}

export function useDelayTrends() {
  const [data, setData] = useState<{ month: string; delays: number; onTime: number; cancelled: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrends = async () => {
      const { data: flights } = await supabase
        .from('flights')
        .select('status, departure_time')
        .gte('departure_time', new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000).toISOString());

      if (flights) {
        const monthly: Record<string, { delays: number; onTime: number; cancelled: number }> = {};
        flights.forEach((f) => {
          const month = new Date(f.departure_time).toLocaleString('default', { month: 'short' });
          if (!monthly[month]) monthly[month] = { delays: 0, onTime: 0, cancelled: 0 };
          if (f.status === 'delayed') monthly[month].delays++;
          else if (f.status === 'arrived') monthly[month].onTime++;
          else if (f.status === 'cancelled') monthly[month].cancelled++;
        });

        setData(
          Object.entries(monthly).map(([month, values]) => ({ month, ...values }))
        );
      }
      setLoading(false);
    };
    fetchTrends();
  }, []);

  return { data, loading };
}
