import { useState, useEffect } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuthContext } from '@/contexts/AuthContext';
import { canAccessEmployees } from '@/lib/auth';
import * as z from 'zod';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useEmployees } from '@/hooks/useEmployees';
import { isSupabaseConfigured, supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';
import { toast } from 'sonner';

type EmployeeRow = Database['public']['Tables']['employees']['Row'];
type Department = Database['public']['Tables']['departments']['Row'];
type Role = Database['public']['Tables']['roles']['Row'];

type EmployeeFormValues = z.infer<typeof employeeSchema>;

const LOCAL_EMPLOYEES_STORAGE_KEY = 'skyair-local-employees';

const fallbackDepartments: Department[] = [
  { id: 'dept-ops', name: 'Flight Operations', description: null, manager_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'dept-maint', name: 'Maintenance', description: null, manager_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'dept-crew', name: 'Crew Management', description: null, manager_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'dept-admin', name: 'Administration', description: null, manager_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'dept-hr', name: 'Human Resources', description: null, manager_id: null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
] as Department[];

const fallbackRoles: Role[] = [
  { id: 'role-captain', name: 'Captain', description: null, permissions: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'role-first-officer', name: 'First Officer', description: null, permissions: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'role-maintenance', name: 'Maintenance Supervisor', description: null, permissions: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'role-hr', name: 'HR Manager', description: null, permissions: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
  { id: 'role-employee', name: 'Employee', description: null, permissions: {}, created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
] as Role[];

function getStoredLocalEmployees() {
  if (typeof window === 'undefined') {
    return [] as Array<Record<string, unknown>>;
  }

  try {
    const value = window.localStorage.getItem(LOCAL_EMPLOYEES_STORAGE_KEY);
    return value ? (JSON.parse(value) as Array<Record<string, unknown>>) : [];
  } catch {
    return [] as Array<Record<string, unknown>>;
  }
}

const employeeSchema = z.object({
  employee_number: z.string().min(3, 'Employee number is required').max(32),
  full_name: z.string().min(3, 'Full name is required'),
  email: z.string().email('Enter a valid email'),
  phone: z.string().optional(),
  department_id: z.string().optional(),
  role_id: z.string().optional(),
  job_title: z.string().min(3, 'Job title is required'),
  employment_type: z.enum(['full_time', 'part_time', 'contract', 'intern']).default('full_time'),
  status: z.enum(['active', 'suspended', 'terminated', 'on_leave']).default('active'),
  hire_date: z.string().min(1, 'Hire date is required'),
  salary: z.coerce.number().min(0, 'Salary must be positive').optional(),
  address: z.string().optional(),
  emergency_contact: z.string().optional(),
  notes: z.string().optional(),
});

export default function EmployeeFormPage() {
  const [, setLocation] = useLocation();
  const [match, params] = useRoute('/employees/edit/:id');
  const employeeId = params?.id;
  const isEditing = Boolean(match && employeeId);
  const { profile } = useAuthContext();

  useEffect(() => {
    if (!canAccessEmployees(profile)) {
      setLocation('/');
    }
  }, [profile, setLocation]);

  const { createEmployee, updateEmployee } = useEmployees();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      employee_number: '',
      full_name: '',
      email: '',
      phone: '',
      department_id: '',
      role_id: '',
      job_title: '',
      employment_type: 'full_time',
      status: 'active',
      hire_date: new Date().toISOString().slice(0, 10),
      salary: 0,
      address: '',
      emergency_contact: '',
      notes: '',
    },
  });

  useEffect(() => {
    const fetchFormData = async () => {
      if (!isSupabaseConfigured) {
        setDepartments(fallbackDepartments);
        setRoles(fallbackRoles);

        if (isEditing && employeeId) {
          const storedEmployee = getStoredLocalEmployees().find((employee) => employee.id === employeeId);
          if (storedEmployee) {
            form.reset({
              employee_number: String(storedEmployee.employee_number || ''),
              full_name: String(storedEmployee.full_name || ''),
              email: String(storedEmployee.email || ''),
              phone: String(storedEmployee.phone || ''),
              department_id: String(storedEmployee.department_id || ''),
              role_id: String(storedEmployee.role_id || ''),
              job_title: String(storedEmployee.job_title || ''),
              employment_type: (storedEmployee.employment_type as EmployeeFormValues['employment_type']) || 'full_time',
              status: (storedEmployee.status as EmployeeFormValues['status']) || 'active',
              hire_date: String(storedEmployee.hire_date || new Date().toISOString().slice(0, 10)),
              salary: Number(storedEmployee.salary ?? 0),
              address: String(storedEmployee.address || ''),
              emergency_contact: typeof storedEmployee.emergency_contact === 'string' ? storedEmployee.emergency_contact : JSON.stringify(storedEmployee.emergency_contact ?? '', null, 2),
              notes: String(storedEmployee.notes || ''),
            });
          }
        }

        setLoading(false);
        return;
      }

      const [departmentsRes, rolesRes] = await Promise.all([
        supabase.from('departments').select('*').order('name', { ascending: true }),
        supabase.from('roles').select('*').order('name', { ascending: true }),
      ]);

      setDepartments((departmentsRes.data as Department[] | null) || []);
      setRoles((rolesRes.data as Role[] | null) || []);

      if (isEditing && employeeId) {
        const { data: employee, error } = await (supabase.from('employees') as any)
          .select('*')
          .eq('id', employeeId)
          .single();

        if (error) {
          toast.error('Failed to load employee details');
          setLoading(false);
          return;
        }

        if (employee) {
          form.reset({
            employee_number: employee.employee_number,
            full_name: employee.full_name,
            email: employee.email,
            phone: employee.phone || '',
            department_id: employee.department_id || '',
            role_id: employee.role_id || '',
            job_title: employee.job_title,
            employment_type: employee.employment_type,
            status: employee.status,
            hire_date: employee.hire_date.slice(0, 10),
            salary: employee.salary ?? 0,
            address: employee.address || '',
            emergency_contact: typeof employee.emergency_contact === 'string' ? employee.emergency_contact : JSON.stringify(employee.emergency_contact ?? '', null, 2),
            notes: employee.notes || '',
          });
        }
      }

      setLoading(false);
    };

    fetchFormData().catch(() => {
      toast.error('Unable to load employee data');
      setLoading(false);
    });
  }, [employeeId, form, isEditing]);

  const onSubmit = async (values: EmployeeFormValues) => {
    setIsSubmitting(true);

    try {
      const payload: Database['public']['Tables']['employees']['Insert'] = {
        employee_number: values.employee_number,
        full_name: values.full_name,
        email: values.email,
        phone: values.phone || null,
        department_id: values.department_id || null,
        role_id: values.role_id || null,
        job_title: values.job_title,
        employment_type: values.employment_type,
        status: values.status,
        hire_date: values.hire_date,
        salary: values.salary || null,
        address: values.address || null,
        emergency_contact: values.emergency_contact ? values.emergency_contact : null,
        certifications: [],
        notes: values.notes || null,
        profile_id: null,
      };

      if (isEditing && employeeId) {
        await updateEmployee(employeeId, payload);
        toast.success('Employee updated successfully');
      } else {
        await createEmployee(payload);
        toast.success('Employee added successfully');
      }

      setLocation('/employees');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to save employee');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" onClick={() => setLocation('/employees')} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Employees
      </Button>

      <div className="bg-card border border-card-border rounded-xl p-8">
        <h2 className="text-2xl font-bold mb-4 text-foreground">
          {isEditing ? 'Edit Employee' : 'Add New Employee'}
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="employee_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employee Number</FormLabel>
                    <FormControl>
                      <Input placeholder="EMP-001" {...field} data-testid="input-employee-number" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="full_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Amina Khumalo" {...field} data-testid="input-full-name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="amina@skyair.example" {...field} data-testid="input-email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="+27 82 123 4567" {...field} data-testid="input-phone" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="department_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-department">
                          <SelectValue placeholder="Select department" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {departments.map((department) => (
                          <SelectItem key={department.id} value={department.id}>
                            {department.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-role">
                          <SelectValue placeholder="Select role" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">None</SelectItem>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="job_title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Job Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Captain" {...field} data-testid="input-job-title" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="employment_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-employment-type">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="full_time">Full Time</SelectItem>
                        <SelectItem value="part_time">Part Time</SelectItem>
                        <SelectItem value="contract">Contract</SelectItem>
                        <SelectItem value="intern">Intern</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="terminated">Terminated</SelectItem>
                        <SelectItem value="on_leave">On Leave</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hire_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hire Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} data-testid="input-hire-date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="salary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Salary</FormLabel>
                    <FormControl>
                      <Input type="number" min={0} step={100} {...field} data-testid="input-salary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl>
                      <Input placeholder="123 Aviation Way" {...field} data-testid="input-address" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="emergency_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Emergency Contact</FormLabel>
                    <FormControl>
                      <Input placeholder="Name / Phone" {...field} data-testid="input-emergency-contact" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem className="col-span-1 md:col-span-2">
                    <FormLabel>Notes</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Optional notes for this employee" {...field} data-testid="textarea-notes" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
              <Button variant="secondary" type="button" onClick={() => setLocation('/employees')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} data-testid="button-submit-employee">
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Employee' : 'Create Employee'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
