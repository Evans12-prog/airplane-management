import { useState, useEffect, useCallback } from 'react';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import { getDepartmentName } from '@/lib/auth';
import type { Database } from '@/types/supabase';

type Employee = Database['public']['Tables']['employees']['Row'] & {
  departments?: Database['public']['Tables']['departments']['Row'] | null;
  roles?: Database['public']['Tables']['roles']['Row'] | null;
};

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

const LOCAL_EMPLOYEES_STORAGE_KEY = 'skyair-local-employees';

function getStoredLocalEmployees(): Employee[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const value = window.localStorage.getItem(LOCAL_EMPLOYEES_STORAGE_KEY);
    return value ? (JSON.parse(value) as Employee[]) : [];
  } catch {
    return [];
  }
}

function saveStoredLocalEmployees(employees: Employee[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LOCAL_EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
}

function getLocalEmployees(): Employee[] {
  const persisted = getStoredLocalEmployees();
  const merged = [...fallbackEmployees, ...persisted];
  const uniqueById = new Map<string, Employee>();

  merged.forEach((employee) => {
    if (employee.id) {
      uniqueById.set(employee.id, employee);
    }
  });

  return Array.from(uniqueById.values());
}

function buildLocalEmployee(employee: Database['public']['Tables']['employees']['Insert'] & Partial<Employee>, id?: string): Employee {
  return {
    id: id || `local-employee-${Date.now()}`,
    employee_number: employee.employee_number || 'EMP-NEW',
    profile_id: employee.profile_id ?? null,
    full_name: employee.full_name || 'New Employee',
    email: employee.email || 'new-employee@skyair.local',
    phone: employee.phone ?? null,
    department_id: employee.department_id ?? null,
    role_id: employee.role_id ?? null,
    job_title: employee.job_title || 'Employee',
    employment_type: employee.employment_type || 'full_time',
    status: employee.status || 'active',
    hire_date: employee.hire_date || new Date().toISOString().split('T')[0],
    salary: employee.salary ?? null,
    address: employee.address ?? null,
    emergency_contact: employee.emergency_contact ?? null,
    certifications: Array.isArray(employee.certifications) ? employee.certifications : [],
    notes: employee.notes ?? null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    departments: employee.department_id
      ? {
          id: employee.department_id,
          name: employee.department_id,
          description: null,
          manager_id: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      : null,
    roles: employee.role_id
      ? {
          id: employee.role_id,
          name: employee.role_id,
          description: null,
          permissions: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }
      : null,
  } as Employee;
}

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
        let nextEmployees = getLocalEmployees();
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
        (query as any).eq('status', filters.status);
      }
      if (filters?.department && filters.department !== 'all') {
        (query as any).eq('department_id', filters.department);
      }
      if (filters?.search) {
        (query as any).or(`full_name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,employee_number.ilike.%${filters.search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;

      let nextEmployees = (data || []) as unknown as Employee[];
      if (restrictByDepartment && profileDepartment) {
        nextEmployees = nextEmployees.filter((employee) => {
          const employeeDepartment = employee.departments?.name?.trim().toLowerCase() || '';
          return employeeDepartment === profileDepartment;
        });
      }

      setEmployees(nextEmployees);
    } catch (err) {
      let nextEmployees = getLocalEmployees();
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

    const EMP_EVENT = 'skyair-employees-updated';
    const onEmployeesEvent = () => fetchEmployees();
    if (typeof window !== 'undefined') {
      window.addEventListener(EMP_EVENT, onEmployeesEvent);
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener(EMP_EVENT, onEmployeesEvent);
      }
    };
  }, [fetchEmployees]);

  const createEmployee = async (employee: Database['public']['Tables']['employees']['Insert']) => {
    if (!isSupabaseConfigured) {
      const nextEmployee = buildLocalEmployee(employee);
      const nextEmployees = [nextEmployee, ...getStoredLocalEmployees()];
      saveStoredLocalEmployees(nextEmployees);
      setEmployees(getLocalEmployees());
      return nextEmployee;
    }
    try {
      const { data, error } = await (supabase.from('employees') as any).insert(employee).select().single();
      if (error) throw error;
      await fetchEmployees();
      return data as Employee;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Remote createEmployee failed, falling back to local storage:', err);
      const nextEmployee = buildLocalEmployee(employee as any);
      const nextEmployees = [nextEmployee, ...getStoredLocalEmployees()];
      saveStoredLocalEmployees(nextEmployees);
      setEmployees(getLocalEmployees());
      // notify other parts of the app
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('skyair-employees-updated'));
      }
      return nextEmployee;
    }
  };

  const updateEmployee = async (id: string, updates: Database['public']['Tables']['employees']['Update']) => {
    if (!isSupabaseConfigured) {
      const storedEmployees = getStoredLocalEmployees();
      const existing = storedEmployees.find((employee) => employee.id === id);
      const nextEmployee = existing
        ? ({ ...existing, ...updates, id, updated_at: new Date().toISOString() } as Employee)
        : buildLocalEmployee(updates as Database['public']['Tables']['employees']['Insert'] & Partial<Employee>, id);
      const nextEmployees = [nextEmployee, ...storedEmployees.filter((employee) => employee.id !== id)];
      saveStoredLocalEmployees(nextEmployees);
      setEmployees(getLocalEmployees());
      return nextEmployee;
    }

    try {
      const { data, error } = await (supabase.from('employees') as any).update(updates).eq('id', id).select().single();
      if (error) throw error;
      await fetchEmployees();
      return data;
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Remote updateEmployee failed, falling back to local storage:', err);
      const storedEmployees = getStoredLocalEmployees();
      const existing = storedEmployees.find((employee) => employee.id === id);
      const nextEmployee = existing
        ? ({ ...existing, ...updates, id, updated_at: new Date().toISOString() } as Employee)
        : buildLocalEmployee(updates as Database['public']['Tables']['employees']['Insert'] & Partial<Employee>, id);
      const nextEmployees = [nextEmployee, ...storedEmployees.filter((employee) => employee.id !== id)];
      saveStoredLocalEmployees(nextEmployees);
      setEmployees(getLocalEmployees());
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('skyair-employees-updated'));
      }
      return nextEmployee;
    }
  };

  const deleteEmployee = async (id: string) => {
    if (!isSupabaseConfigured) {
      const nextEmployees = getStoredLocalEmployees().filter((employee) => employee.id !== id);
      saveStoredLocalEmployees(nextEmployees);
      setEmployees(getLocalEmployees());
      return;
    }
    try {
      const { error } = await (supabase.from('employees') as any).delete().eq('id', id);
      if (error) throw error;
      await fetchEmployees();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Remote deleteEmployee failed, falling back to local storage:', err);
      const nextEmployees = getStoredLocalEmployees().filter((employee) => employee.id !== id);
      saveStoredLocalEmployees(nextEmployees);
      setEmployees(getLocalEmployees());
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new Event('skyair-employees-updated'));
      }
    }
  };

  const suspendEmployee = async (id: string) => updateEmployee(id, { status: 'suspended' });
  const activateEmployee = async (id: string) => updateEmployee(id, { status: 'active' });

  return { employees, loading, error, refetch: fetchEmployees, createEmployee, updateEmployee, deleteEmployee, suspendEmployee, activateEmployee };
}
