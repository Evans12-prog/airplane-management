import { useState, useEffect, useCallback } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { getDepartmentName } from '@/lib/auth';
import type { Database } from '@/types/supabase';

const fallbackEmployees = [
  {
    id: 'demo-employee-1',
    employee_number: 'EMP-001',
    profile_id: null,
    full_name: 'Mina Khumalo',
    email: 'mina@skyair.example',
    phone: '+27 82 111 1111',
    department_id: 'dept-ops',
    role_id: 'role-captain',
    job_title: 'Captain',
    employment_type: 'full_time',
    status: 'active',
    hire_date: new Date().toISOString(),
    salary: 180000,
    address: null,
    emergency_contact: null,
    certifications: [],
    notes: 'Demo employee',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    departments: { id: 'dept-ops', name: 'Flight Operations', description: null, manager_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    roles: { id: 'role-captain', name: 'Captain', description: null, permissions: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  },
  {
    id: 'demo-employee-2',
    employee_number: 'EMP-002',
    profile_id: null,
    full_name: 'Aisha Peters',
    email: 'aisha@skyair.example',
    phone: '+27 83 222 2222',
    department_id: 'dept-maint',
    role_id: 'role-maintenance',
    job_title: 'Maintenance Supervisor',
    employment_type: 'full_time',
    status: 'active',
    hire_date: new Date().toISOString(),
    salary: 140000,
    address: null,
    emergency_contact: null,
    certifications: [],
    notes: 'Demo employee',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    departments: { id: 'dept-maint', name: 'Maintenance', description: null, manager_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
    roles: { id: 'role-maintenance', name: 'Maintenance Supervisor', description: null, permissions: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  },
] as unknown as Employee[];

type Employee = Database['public']['Tables']['employees']['Row'] & {
  departments?: Database['public']['Tables']['departments']['Row'] | null;
  roles?: Database['public']['Tables']['roles']['Row'] | null;
};

export function useEmployees(
  filters?: { status?: string; department?: string; search?: string },
  profile?: { roles?: { name?: string | null } | null; departments?: { name?: string | null } | null } | null,
) {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const profileDepartment = getDepartmentName(profile)?.trim().toLowerCase();
  const profileRole = profile?.roles?.name?.trim().toLowerCase();
  const isAdmin = ['admin', 'super_admin'].includes(profileRole || '');
  const isHr = profileRole === 'hr' || profileDepartment?.includes('human') || profileDepartment?.includes('resource');
  const restrictByDepartment = !isAdmin && !isHr && Boolean(profileDepartment);

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    try {
      if (!isSupabaseConfigured) {
        let nextEmployees = fallbackEmployees;
        if (restrictByDepartment && profileDepartment) {
          nextEmployees = nextEmployees.filter((employee) => {
            const employeeDepartment = employee.departments?.name?.trim().toLowerCase() || '';
            return employeeDepartment === profileDepartment;
          });
        }
        setEmployees(nextEmployees);
        setLoading(false);
        return;
      }

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

      let nextEmployees = (data || []) as Employee[];
      if (restrictByDepartment && profileDepartment) {
        nextEmployees = nextEmployees.filter((employee) => {
          const employeeDepartment = employee.departments?.name?.trim().toLowerCase() || '';
          return employeeDepartment === profileDepartment;
        });
      }

      setEmployees(nextEmployees);
    } catch (err) {
      let nextEmployees = fallbackEmployees;
      if (restrictByDepartment && profileDepartment) {
        nextEmployees = nextEmployees.filter((employee) => {
          const employeeDepartment = employee.departments?.name?.trim().toLowerCase() || '';
          return employeeDepartment === profileDepartment;
        });
      }
      setEmployees(nextEmployees);
      setError(err instanceof Error ? err.message : 'Failed to fetch employees');
    } finally {
      setLoading(false);
    }
  }, [filters?.status, filters?.department, filters?.search, profileDepartment, restrictByDepartment]);

  useEffect(() => {
    fetchEmployees();
  }, [fetchEmployees]);

  const createEmployee = async (employee: Database['public']['Tables']['employees']['Insert']) => {
    const { data, error } = await (supabase.from('employees') as any).insert(employee).select().single();
    if (error) throw error;
    await fetchEmployees();
    return data;
  };

  const updateEmployee = async (id: string, updates: Database['public']['Tables']['employees']['Update']) => {
    const { data, error } = await (supabase.from('employees') as any).update(updates).eq('id', id).select().single();
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
