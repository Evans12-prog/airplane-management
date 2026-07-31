import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

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
        query = query.eq('status', filters.status);
      }

      if (filters?.search) {
        query = query.ilike('flight_number', `%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setFlights(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch flights');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlights();

    // Subscribe to real-time flight updates
    const channel = supabase
      .channel('flights-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'flights' }, () => {
        fetchFlights();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters?.status, filters?.search]);

  const createFlight = async (flight: Database['public']['Tables']['flights']['Insert']) => {
    const { data, error } = await supabase.from('flights').insert(flight).select().single();
    if (error) throw error;
    await fetchFlights();
    return data;
  };

  const updateFlight = async (id: string, updates: Database['public']['Tables']['flights']['Update']) => {
    const { data, error } = await supabase.from('flights').update(updates).eq('id', id).select().single();
    if (error) throw error;
    await fetchFlights();
    return data;
  };

  const deleteFlight = async (id: string) => {
    const { error } = await supabase.from('flights').delete().eq('id', id);
    if (error) throw error;
    await fetchFlights();
  };

  return { flights, loading, error, refetch: fetchFlights, createFlight, updateFlight, deleteFlight };
}
