import { useState, useEffect } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

const fallbackFlights = [
  {
    id: 'demo-flight-1',
    flight_number: 'SKY101',
    aircraft_id: 'ac-1',
    route_id: 'route-1',
    captain_id: 'emp-1',
    departure_time: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    arrival_time: new Date(Date.now() + 5 * 60 * 60 * 1000).toISOString(),
    actual_departure: null,
    actual_arrival: null,
    status: 'scheduled',
    gate: 'A12',
    terminal: 'T1',
    passenger_count: 182,
    available_seats: 18,
    delay_minutes: 0,
    delay_reason: null,
    cancellation_reason: null,
    fuel_used_liters: null,
    notes: 'Demo flight for local preview',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    aircraft: { id: 'ac-1', registration: 'ZS-AIR', model: 'A320', manufacturer: 'Airbus', capacity: 180, cargo_capacity_kg: 18000, fuel_capacity_liters: 24000, status: 'active', last_maintenance_date: new Date().toISOString(), next_maintenance_date: new Date().toISOString(), total_flight_hours: 15200, year_manufactured: 2021, notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    routes: { id: 'route-1', origin_code: 'JHB', origin_city: 'Johannesburg', destination_code: 'CPT', destination_city: 'Cape Town', distance_km: 1390, estimated_duration_minutes: 120, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    captain: { id: 'emp-1', employee_number: 'EMP-001', profile_id: null, full_name: 'Mina Khumalo', email: 'mina@skyair.example', phone: null, department_id: null, role_id: null, job_title: 'Captain', employment_type: 'full_time', status: 'active', hire_date: new Date().toISOString(), salary: null, address: null, emergency_contact: null, certifications: [], notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  },
  {
    id: 'demo-flight-2',
    flight_number: 'SKY205',
    aircraft_id: 'ac-2',
    route_id: 'route-2',
    captain_id: 'emp-2',
    departure_time: new Date(Date.now() + 6 * 60 * 60 * 1000).toISOString(),
    arrival_time: new Date(Date.now() + 9 * 60 * 60 * 1000).toISOString(),
    actual_departure: null,
    actual_arrival: null,
    status: 'boarding',
    gate: 'B04',
    terminal: 'T2',
    passenger_count: 156,
    available_seats: 24,
    delay_minutes: 12,
    delay_reason: 'Weather',
    cancellation_reason: null,
    fuel_used_liters: null,
    notes: 'Demo delayed flight',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    aircraft: { id: 'ac-2', registration: 'ZS-ALP', model: 'A321', manufacturer: 'Airbus', capacity: 220, cargo_capacity_kg: 20000, fuel_capacity_liters: 28000, status: 'active', last_maintenance_date: new Date().toISOString(), next_maintenance_date: new Date().toISOString(), total_flight_hours: 18400, year_manufactured: 2022, notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    routes: { id: 'route-2', origin_code: 'CPT', origin_city: 'Cape Town', destination_code: 'DUR', destination_city: 'Durban', distance_km: 1600, estimated_duration_minutes: 135, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    captain: { id: 'emp-2', employee_number: 'EMP-002', profile_id: null, full_name: 'Aisha Peters', email: 'aisha@skyair.example', phone: null, department_id: null, role_id: null, job_title: 'Captain', employment_type: 'full_time', status: 'active', hire_date: new Date().toISOString(), salary: null, address: null, emergency_contact: null, certifications: [], notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  },
  {
    id: 'demo-flight-3',
    flight_number: 'SKY330',
    aircraft_id: 'ac-3',
    route_id: 'route-3',
    captain_id: 'emp-3',
    departure_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    arrival_time: new Date(Date.now() + 1 * 60 * 60 * 1000).toISOString(),
    actual_departure: null,
    actual_arrival: null,
    status: 'departed',
    gate: 'C08',
    terminal: 'T3',
    passenger_count: 134,
    available_seats: 46,
    delay_minutes: 0,
    delay_reason: null,
    cancellation_reason: null,
    fuel_used_liters: null,
    notes: 'Demo completed flight',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    aircraft: { id: 'ac-3', registration: 'ZS-BEE', model: 'B737', manufacturer: 'Boeing', capacity: 180, cargo_capacity_kg: 16000, fuel_capacity_liters: 26000, status: 'active', last_maintenance_date: new Date().toISOString(), next_maintenance_date: new Date().toISOString(), total_flight_hours: 12000, year_manufactured: 2020, notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    routes: { id: 'route-3', origin_code: 'DUR', origin_city: 'Durban', destination_code: 'JHB', destination_city: 'Johannesburg', distance_km: 570, estimated_duration_minutes: 70, is_active: true, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    captain: { id: 'emp-3', employee_number: 'EMP-003', profile_id: null, full_name: 'Lerato Moyo', email: 'lerato@skyair.example', phone: null, department_id: null, role_id: null, job_title: 'Captain', employment_type: 'full_time', status: 'active', hire_date: new Date().toISOString(), salary: null, address: null, emergency_contact: null, certifications: [], notes: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  },
] as unknown as Flight[];

type Flight = Database['public']['Tables']['flights']['Row'] & {
  aircraft?: Database['public']['Tables']['aircraft']['Row'] | null;
  routes?: Database['public']['Tables']['routes']['Row'] | null;
  captain?: Database['public']['Tables']['employees']['Row'] | null;
};

export function useFlights(filters?: {
  status?: string;
  date?: string;
  search?: string;
}) {
  const [flights, setFlights] = useState<Flight[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFlights = async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        setFlights(fallbackFlights);
        setLoading(false);
        return;
      }

      let query = supabase
        .from('flights')
        .select(`
          *,
          aircraft(*),
          routes(*),
          captain:employees!captain_id(*)
        `)
        .order('departure_time', { ascending: true });

      if (filters?.status && filters.status !== 'all') {
        (query as any).eq('status', filters.status);
      }

      if (filters?.search) {
        (query as any).ilike('flight_number', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setFlights((data || []) as unknown as Flight[]);
    } catch (err) {
      setFlights(fallbackFlights);
      setError(err instanceof Error ? err.message : 'Failed to fetch flights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();

    if (!isSupabaseConfigured) {
      return;
    }

    // Subscribe to real-time flight updates
    const channelName = `flights-changes-${Math.random().toString(36).slice(2)}`;
    const channel = supabase
      .channel(channelName)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flights' }, () => {
        fetchFlights();
      })
      .subscribe();

    return () => {
      channel.unsubscribe?.();
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.status, filters?.search]);

  const createFlight = async (flight: Database['public']['Tables']['flights']['Insert']) => {
    const { data, error } = await (supabase.from('flights') as any).insert(flight).select().single();
    if (error) throw error;
    await fetchFlights();
    return data;
  };

  const updateFlight = async (id: string, updates: Database['public']['Tables']['flights']['Update']) => {
    const { data, error } = await (supabase.from('flights') as any).update(updates).eq('id', id).select().single();
    if (error) throw error;
    await fetchFlights();
    return data;
  };

  const deleteFlight = async (id: string) => {
    const { error } = await (supabase.from('flights') as any).delete().eq('id', id);
    if (error) throw error;
    await fetchFlights();
  };

  return { flights, loading, error, refetch: fetchFlights, createFlight, updateFlight, deleteFlight };
}
