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

const LOCAL_FLIGHTS_STORAGE_KEY = 'skyair-local-flights';

function getStoredLocalFlights(): Flight[] {
  if (typeof window === 'undefined') return [];

  try {
    const value = window.localStorage.getItem(LOCAL_FLIGHTS_STORAGE_KEY);
    return value ? (JSON.parse(value) as Flight[]) : [];
  } catch {
    return [];
  }
}

function saveStoredLocalFlights(flights: Flight[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(LOCAL_FLIGHTS_STORAGE_KEY, JSON.stringify(flights));
}

function getLocalFlights(): Flight[] {
  const persisted = getStoredLocalFlights();
  const merged = [...fallbackFlights, ...persisted];
  const uniqueById = new Map<string, Flight>();

  merged.forEach((flight) => {
    if (flight.id) {
      uniqueById.set(flight.id, flight);
    }
  });

  return Array.from(uniqueById.values());
}

function buildLocalFlight(flight: Database['public']['Tables']['flights']['Insert'], id?: string): Flight {
  const aircraftFromFallback = fallbackFlights.find((item) => item.aircraft_id === flight.aircraft_id)?.aircraft ?? null;
  const routeFromFallback = fallbackFlights.find((item) => item.route_id === flight.route_id)?.routes ?? null;
  const captainFromFallback = fallbackFlights.find((item) => item.captain_id === flight.captain_id)?.captain ?? null;

  return {
    id: id || `local-flight-${Date.now()}`,
    flight_number: flight.flight_number || 'FLIGHT-NEW',
    aircraft_id: flight.aircraft_id || null,
    route_id: flight.route_id || null,
    captain_id: flight.captain_id || null,
    departure_time: flight.departure_time || new Date().toISOString(),
    arrival_time: flight.arrival_time || new Date().toISOString(),
    actual_departure: flight.actual_departure ?? null,
    actual_arrival: flight.actual_arrival ?? null,
    status: flight.status || 'scheduled',
    gate: flight.gate ?? null,
    terminal: flight.terminal ?? null,
    passenger_count: flight.passenger_count ?? 0,
    available_seats: flight.available_seats ?? null,
    delay_minutes: flight.delay_minutes ?? 0,
    delay_reason: flight.delay_reason ?? null,
    cancellation_reason: flight.cancellation_reason ?? null,
    fuel_used_liters: flight.fuel_used_liters ?? null,
    notes: flight.notes ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    aircraft: aircraftFromFallback,
    routes: routeFromFallback,
    captain: captainFromFallback,
  } as Flight;
}

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
        setFlights(getLocalFlights());
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

    // Listen for explicit flight update events (local/demo flows)
    const FLIGHTS_EVENT = 'skyair-flights-updated';
    const onFlightsEvent = () => fetchFlights();
    if (typeof window !== 'undefined') {
      window.addEventListener(FLIGHTS_EVENT, onFlightsEvent);
    }

    if (!isSupabaseConfigured) {
      return () => {
        if (typeof window !== 'undefined') {
          window.removeEventListener(FLIGHTS_EVENT, onFlightsEvent);
        }
      };
    }

    // Subscribe to real-time flight updates (Supabase)
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
      if (typeof window !== 'undefined') {
        window.removeEventListener(FLIGHTS_EVENT, onFlightsEvent);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.status, filters?.search]);

  const createFlight = async (flight: Database['public']['Tables']['flights']['Insert']) => {
    if (!isSupabaseConfigured) {
      const nextFlight = buildLocalFlight(flight);
      const nextFlights = [nextFlight, ...getStoredLocalFlights()];
      saveStoredLocalFlights(nextFlights);
      setFlights(getLocalFlights());
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('skyair-flights-updated'));
      }
      return nextFlight;
    }
    try {
      const { data, error } = await (supabase.from('flights') as any).insert(flight).select().single();
      if (error) throw error;
      await fetchFlights();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('skyair-flights-updated'));
      }
      return data as Flight;
    } catch (err) {
      // If remote insert fails (network, CORS, permissions), fallback to local storage so hosted demo still works
      // eslint-disable-next-line no-console
      console.error('Remote createFlight failed, falling back to local storage:', err);
      const nextFlight = buildLocalFlight(flight as any);
      const nextFlights = [nextFlight, ...getStoredLocalFlights()];
      saveStoredLocalFlights(nextFlights);
      setFlights(getLocalFlights());
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('skyair-flights-updated'));
      }
      return nextFlight;
    }
  };

  const updateFlight = async (id: string, updates: Database['public']['Tables']['flights']['Update']) => {
    if (!isSupabaseConfigured) {
      const storedFlights = getStoredLocalFlights();
      const existing = storedFlights.find((flight) => flight.id === id);
      const nextFlight = existing
        ? ({ ...existing, ...updates, id, updated_at: new Date().toISOString() } as Flight)
        : buildLocalFlight(updates as Database['public']['Tables']['flights']['Insert'], id);
      const nextFlights = [nextFlight, ...storedFlights.filter((flight) => flight.id !== id)];
      saveStoredLocalFlights(nextFlights);
      setFlights(getLocalFlights());
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('skyair-flights-updated'));
      }
      return nextFlight;
    }

    try {
      const { data, error } = await (supabase.from('flights') as any).update(updates).eq('id', id).select().single();
      if (error) throw error;
      await fetchFlights();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('skyair-flights-updated'));
      }
      return data;
    } catch (err) {
      // fallback to local update on error
      // eslint-disable-next-line no-console
      console.error('Remote updateFlight failed, falling back to local storage:', err);
      const storedFlights = getStoredLocalFlights();
      const existing = storedFlights.find((flight) => flight.id === id);
      const nextFlight = existing
        ? ({ ...existing, ...updates, id, updated_at: new Date().toISOString() } as Flight)
        : buildLocalFlight(updates as Database['public']['Tables']['flights']['Insert'], id);
      const nextFlights = [nextFlight, ...storedFlights.filter((flight) => flight.id !== id)];
      saveStoredLocalFlights(nextFlights);
      setFlights(getLocalFlights());
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('skyair-flights-updated'));
      }
      return nextFlight;
    }
  };

  const deleteFlight = async (id: string) => {
    if (!isSupabaseConfigured) {
      const nextFlights = getStoredLocalFlights().filter((flight) => flight.id !== id);
      saveStoredLocalFlights(nextFlights);
      setFlights(getLocalFlights());
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('skyair-flights-updated'));
      }
      return;
    }
    try {
      const { error } = await (supabase.from('flights') as any).delete().eq('id', id);
      if (error) throw error;
      await fetchFlights();
    } catch (err) {
      // fallback to local delete on error
      // eslint-disable-next-line no-console
      console.error('Remote deleteFlight failed, falling back to local storage:', err);
      const nextFlights = getStoredLocalFlights().filter((flight) => flight.id !== id);
      saveStoredLocalFlights(nextFlights);
      setFlights(getLocalFlights());
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('skyair-flights-updated'));
      }
    }
  };

  return { flights, loading, error, refetch: fetchFlights, createFlight, updateFlight, deleteFlight };
}
