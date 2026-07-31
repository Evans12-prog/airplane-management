import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type Employee = Database['public']['Tables']['employees']['Row'] & {
  departments?: Database['public']['Tables']['departments']['Row'] | null;
  roles?: Database['public']['Tables']['roles']['Row'] | null;
};

export function useEmployees(filters?: { status?: string; department?: string; search?: string }) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('employees')
        .select('*, departments(*), roles(*)')
        .order('full_name', { ascending: true });

      if (filters?.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }
      if (filters?.department && filters.department !== 'all') {
        query = query.eq('department_id', filters.department);
      }
      if (filters?.search) {
        query = query.or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,employee_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEmployees(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.department, filters?.search]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const createEmployee = async (employee: Database['public']['Tables']['employees']['Insert']) => {
    const { data, error } = await supabase.from('employees').insert(employee).select().single();
    if (error) throw error;
    await fetchEmployees();
    return data;
  };

  const updateEmployee = async (id: string, updates: Database['public']['Tables']['employees']['Update']) => {
    const { data, error } = await supabase.from('employees').update(updates).eq('id', id).select().single();
    if (error) throw error;
    await fetchEmployees();
    return data;
  };

  const deleteEmployee = async (id: string) => {
    const { error } = await supabase.from('employees').delete().eq('id', id);
    if (error) throw error;
    await fetchEmployees();
  };

  const suspendEmployee = async (id: string) => updateEmployee(id, { status: 'suspended' });
  const activateEmployee = async (id: string) => updateEmployee(id, { status: 'active' });

  return { employees, loading, error, refetch: fetchEmployees, createEmployee, updateEmployee, deleteEmployee, suspendEmployee, activateEmployee };
}
