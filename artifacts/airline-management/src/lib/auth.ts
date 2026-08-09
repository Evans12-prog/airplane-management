import type { Database } from '@/types/supabase';
import type { User } from '@supabase/supabase-js';
import { isSupabaseConfigured, supabase } from './supabase';

export interface AuthUser {
  id: string;
  email: string;
  role?: string;
  fullName?: string;
}

export interface RegistrationData {
  fullName: string;
  employeeId: string;
  email: string;
  phone: string;
  password: string;
  department: string;
  jobRole: string;
  role?: RoleName;
  gender: string;
  dateOfBirth: string;
  nationality: string;
  avatarUrl?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

export type RoleName =
  | 'super_admin'
  | 'airline_manager'
  | 'hr_manager'
  | 'operations_manager'
  | 'crew_manager'
  | 'fleet_manager'
  | 'route_planner'
  | 'maintenance_officer'
  | 'finance_officer'
  | 'customer_service_officer'
  | 'security_officer'
  | 'employee';

export interface ProfileLike {
  roles?: { name?: string | null } | null;
  departments?: { id?: string | null; name?: string | null } | null;
}

export interface UserMetadataLike {
  app_metadata?: {
    role?: string | null;
    department?: string | null;
    departmentSlug?: string | null;
  };
  user_metadata?: {
    role?: string | null;
    department?: string | null;
    departmentSlug?: string | null;
  };
}

const isLocalhost =
  typeof window !== 'undefined' &&
  ['localhost', '127.0.0.1'].includes(window.location.hostname);

const isLocalDemoEnvironment = !isSupabaseConfigured || import.meta.env.DEV || isLocalhost;

export function mergeProfileWithUserMetadata(
  profile?: ProfileLike | null,
  user?: UserMetadataLike | User | null,
): ProfileLike | null {
  if (!profile && !user) return null;

  const metadata = user as UserMetadataLike | null | undefined;
  const roleName =
    profile?.roles?.name ||
    metadata?.app_metadata?.role ||
    metadata?.user_metadata?.role ||
    null;
  const departmentName =
    profile?.departments?.name ||
    metadata?.app_metadata?.department ||
    metadata?.user_metadata?.department ||
    null;
  const departmentSlug =
    profile?.departments?.id ||
    metadata?.app_metadata?.departmentSlug ||
    metadata?.user_metadata?.departmentSlug ||
    null;

  if (!roleName && !departmentName && !departmentSlug) {
    return profile ?? null;
  }

  return {
    roles: { name: roleName },
    departments: { id: departmentSlug, name: departmentName },
  };
}

export const ROLE_LABELS: Record<RoleName, string> = {
  super_admin: 'Super Admin',
  airline_manager: 'Airline Manager',
  hr_manager: 'HR Manager',
  operations_manager: 'Operations Manager',
  crew_manager: 'Crew Manager',
  fleet_manager: 'Fleet Manager',
  route_planner: 'Route Planner',
  maintenance_officer: 'Maintenance Officer',
  finance_officer: 'Finance Officer',
  customer_service_officer: 'Customer Service Officer',
  security_officer: 'Security Officer',
  employee: 'Employee',
};

export interface LocalDemoAccount {
  id: string;
  email: string;
  password: string;
  fullName: string;
  department: string;
  departmentSlug: string;
  roleName: RoleName;
}

const LOCAL_STORAGE_KEYS = {
  session: 'skyair-local-session',
  users: 'skyair-local-users',
};

const LOCAL_EMPLOYEES_STORAGE_KEY = 'skyair-local-employees';

export const AUTH_STATE_EVENT = 'skyair-auth-state-changed';

export const DEMO_ACCOUNT_OPTIONS: LocalDemoAccount[] = [
  {
    id: 'local-admin-user',
    email: 'menyahevans@gmail.com',
    password: 'Evans123!',
    fullName: 'Administrator',
    department: 'Administration',
    departmentSlug: 'administration',
    roleName: 'super_admin',
  },
  {
    id: 'local-admin-user-2',
    email: 'admin@gmail.com',
    password: 'Admin123!',
    fullName: 'Super Admin',
    department: 'Administration',
    departmentSlug: 'administration',
    roleName: 'super_admin',
  },
  {
    id: 'local-operations-manager',
    email: 'operations.manager@gmail.com',
    password: 'SkyAir2026!',
    fullName: 'Operations Manager',
    department: 'Flight Operations',
    departmentSlug: 'flight-operations',
    roleName: 'operations_manager',
  },
  {
    id: 'local-crew-manager',
    email: 'crew.manager@gmail.com',
    password: 'SkyAir2026!',
    fullName: 'Crew Manager',
    department: 'Crew Management',
    departmentSlug: 'crew-management',
    roleName: 'crew_manager',
  },
  {
    id: 'local-fleet-manager',
    email: 'fleet.manager@gmail.com',
    password: 'SkyAir2026!',
    fullName: 'Fleet Manager',
    department: 'Fleet Management',
    departmentSlug: 'fleet-management',
    roleName: 'fleet_manager',
  },
  {
    id: 'local-route-planner',
    email: 'route.planner@gmail.com',
    password: 'SkyAir2026!',
    fullName: 'Route Planner',
    department: 'Route Planning',
    departmentSlug: 'route-planning',
    roleName: 'route_planner',
  },
  {
    id: 'local-maintenance-officer',
    email: 'maintenance@gmail.com',
    password: 'SkyAir2026!',
    fullName: 'Maintenance Officer',
    department: 'Maintenance',
    departmentSlug: 'maintenance',
    roleName: 'maintenance_officer',
  },
  {
    id: 'local-finance',
    email: 'finance@gmail.com',
    password: 'SkyAir2026!',
    fullName: 'Finance Manager',
    department: 'Finance',
    departmentSlug: 'finance',
    roleName: 'finance_officer',
  },
  {
    id: 'local-hr',
    email: 'human.resources@gmail.com',
    password: 'SkyAir2026!',
    fullName: 'HR Manager',
    department: 'Human Resource',
    departmentSlug: 'human-resource',
    roleName: 'hr_manager',
  },
  {
    id: 'local-airline-manager',
    email: 'airline.manager@gmail.com',
    password: 'SkyAir2026!',
    fullName: 'Airline Manager',
    department: 'Administration',
    departmentSlug: 'administration',
    roleName: 'airline_manager',
  },
  {
    id: 'local-customer-service-officer',
    email: 'customer.service@gmail.com',
    password: 'SkyAir2026!',
    fullName: 'Customer Service Officer',
    department: 'Customer Service',
    departmentSlug: 'customer-service',
    roleName: 'customer_service_officer',
  },
  {
    id: 'local-security-officer',
    email: 'security@gmail.com',
    password: 'SkyAir2026!',
    fullName: 'Security Officer',
    department: 'Security',
    departmentSlug: 'security',
    roleName: 'security_officer',
  },
  {
    id: 'local-cargo-staff',
    email: 'cargo@gmail.com',
    password: 'SkyAir2026!',
    fullName: 'Cargo Operations Staff',
    department: 'Cargo',
    departmentSlug: 'cargo',
    roleName: 'employee',
  },
  {
    id: 'local-it-staff',
    email: 'it.operations@gmail.com',
    password: 'SkyAir2026!',
    fullName: 'IT Operations Staff',
    department: 'IT',
    departmentSlug: 'it',
    roleName: 'employee',
  },
];

const DEFAULT_DEMO_ACCOUNTS: LocalDemoAccount[] = DEMO_ACCOUNT_OPTIONS;

function normalizeName(value?: string | null) {
  return (value || '').trim().toLowerCase();
}

function getAcceptedPasswordVariants(password: string) {
  const trimmed = password.trim();
  const variants = new Set<string>([trimmed]);

  const lowercase = trimmed.toLowerCase();
  if (lowercase !== trimmed) {
    variants.add(lowercase);
  }

  if (!trimmed.endsWith('!')) {
    variants.add(`${trimmed}!`);
  }

  const withoutTrailingBang = trimmed.replace(/!+$/, '');
  if (withoutTrailingBang !== trimmed) {
    variants.add(withoutTrailingBang);
  } else {
    variants.add(trimmed.replace(/!$/, ''));
  }

  const lowercaseWithoutBang = withoutTrailingBang.toLowerCase();
  if (lowercaseWithoutBang !== lowercase) {
    variants.add(lowercaseWithoutBang);
  }

  return Array.from(variants);
}

async function ensureRoleRecord(roleName: RoleName) {
  const normalizedRole = (roleName || 'employee').trim();
  const { data: existingRole, error: selectError } = await (supabase.from('roles') as any)
    .select('id')
    .eq('name', normalizedRole)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existingRole?.id) return existingRole.id;

  const { data: insertedRole, error: insertError } = await (supabase.from('roles') as any)
    .insert({
      name: normalizedRole,
      description: ROLE_LABELS[normalizedRole as RoleName] || normalizedRole.replace(/_/g, ' '),
      permissions: {},
    })
    .select('id')
    .single();

  if (insertError) throw insertError;
  return insertedRole.id;
}

async function ensureDepartmentRecord(departmentName: string) {
  const normalizedDepartment = (departmentName || 'General').trim();
  const { data: existingDepartment, error: selectError } = await (supabase.from('departments') as any)
    .select('id')
    .ilike('name', normalizedDepartment)
    .maybeSingle();

  if (selectError) throw selectError;
  if (existingDepartment?.id) return existingDepartment.id;

  const { data: insertedDepartment, error: insertError } = await (supabase.from('departments') as any)
    .insert({
      name: normalizedDepartment,
      description: `${normalizedDepartment} department`,
    })
    .select('id')
    .single();

  if (insertError) throw insertError;
  return insertedDepartment.id;
}

function getStoredLocalUsers(): LocalDemoAccount[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const value = window.localStorage.getItem(LOCAL_STORAGE_KEYS.users);
    return value ? (JSON.parse(value) as LocalDemoAccount[]) : [];
  } catch {
    return [];
  }
}

function saveStoredLocalUsers(accounts: LocalDemoAccount[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LOCAL_STORAGE_KEYS.users, JSON.stringify(accounts));
}

function getAllDemoAccounts() {
  const storedUsers = getStoredLocalUsers();

  if (!storedUsers.length) {
    saveStoredLocalUsers(DEFAULT_DEMO_ACCOUNTS);
    return [...DEFAULT_DEMO_ACCOUNTS];
  }

  const seen = new Set<string>();
  return [...DEFAULT_DEMO_ACCOUNTS, ...storedUsers].filter((account) => {
    const key = account.email.trim().toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

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

function saveStoredLocalEmployees(employees: Array<Record<string, unknown>>) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(LOCAL_EMPLOYEES_STORAGE_KEY, JSON.stringify(employees));
}

function upsertLocalEmployeeRecord(regData: RegistrationData, account: LocalDemoAccount) {
  const nextEmployee = {
    id: account.id,
    employee_number: regData.employeeId || `EMP-${Date.now().toString().slice(-4)}`,
    profile_id: account.id,
    full_name: regData.fullName,
    email: regData.email.trim().toLowerCase(),
    phone: regData.phone || null,
    department_id: regData.department || account.department,
    role_id: regData.role || account.roleName,
    job_title: regData.jobRole || 'Employee',
    employment_type: 'full_time',
    status: 'active',
    hire_date: new Date().toISOString().split('T')[0],
    salary: null,
    address: null,
    emergency_contact: regData.emergencyContactName || regData.emergencyContactPhone || regData.emergencyContactRelation
      ? {
          name: regData.emergencyContactName,
          phone: regData.emergencyContactPhone,
          relation: regData.emergencyContactRelation,
        }
      : null,
    certifications: [],
    notes: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const existingEmployees = getStoredLocalEmployees();
  const nextEmployees = [nextEmployee, ...existingEmployees.filter((employee) => employee.id !== account.id)];
  saveStoredLocalEmployees(nextEmployees);
}

function notifyAuthStateChanged() {
  if (typeof window === 'undefined') {
    return;
  }

  window.dispatchEvent(new Event(AUTH_STATE_EVENT));
}

function saveLocalSession(account: LocalDemoAccount) {
  if (typeof window === 'undefined') {
    return;
  }

  const existingUsers = getStoredLocalUsers();
  const hasAccount = existingUsers.some((savedAccount) => savedAccount.email.toLowerCase() === account.email.toLowerCase());
  if (!hasAccount) {
    saveStoredLocalUsers([...existingUsers, account]);
  }

  window.localStorage.setItem(
    LOCAL_STORAGE_KEYS.session,
    JSON.stringify({
      account,
      savedAt: new Date().toISOString(),
    }),
  );

  notifyAuthStateChanged();
}

export function getStoredLocalSession() {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const value = window.localStorage.getItem(LOCAL_STORAGE_KEYS.session);
    return value ? JSON.parse(value) : null;
  } catch {
    return null;
  }
}

export function clearStoredLocalSession() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(LOCAL_STORAGE_KEYS.session);
  notifyAuthStateChanged();
}

export function getLocalDemoProfile(account: LocalDemoAccount) {
  return {
    id: account.id,
    email: account.email,
    full_name: account.fullName,
    avatar_url: null,
    phone: null,
    role_id: account.roleName,
    dark_mode: false,
    language: 'en',
    notification_settings: {},
    roles: { id: account.roleName, name: account.roleName, permissions: {} },
    departments: { id: account.departmentSlug, name: account.department },
  };
}

export function getLocalDemoAccount(email: string, password: string) {
  const normalizedEmail = email.trim().toLowerCase();
  const normalizedPassword = password.trim();

  return getAllDemoAccounts().find((account) => {
    const matchesEmail = account.email.toLowerCase() === normalizedEmail;
    const matchesPassword = getAcceptedPasswordVariants(account.password).some((variant) => {
      const candidate = variant.trim();
      return candidate === normalizedPassword || candidate.toLowerCase() === normalizedPassword.toLowerCase();
    });
    return matchesEmail && matchesPassword;
  });
}

export function getRoleName(profile?: ProfileLike | null) {
  return profile?.roles?.name || null;
}

export function getDepartmentName(profile?: ProfileLike | null) {
  return profile?.departments?.name || null;
}

export function getDepartmentSlug(profile?: ProfileLike | null) {
  const departmentId = profile?.departments?.id;
  const departmentName = getDepartmentName(profile);
  const roleName = getRoleName(profile);

  const source = departmentId || departmentName || roleName || 'operations';
  const normalized = normalizeName(source)
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

  const aliases: Record<string, string> = {
    administration: 'administration',
    'flight-operations': 'flight-operations',
    'crew-management': 'crew-management',
    'fleet-management': 'fleet-management',
    'route-planning': 'route-planning',
    maintenance: 'maintenance',
    'finance': 'finance',
    'human-resource': 'human-resource',
    hr: 'human-resource',
    'customer-service': 'customer-service',
    security: 'security',
    cargo: 'cargo',
    it: 'it',
    operations: 'operations-center',
    'operations-center': 'operations-center',
    'super-admin': 'operations-center',
    admin: 'operations-center',
    manager: 'operations-center',
    'airline-manager': 'operations-center',
    'airline_manager': 'operations-center',
    'operations-manager': 'operations-center',
    'operations_manager': 'operations-center',
    'route-planner': 'route-planning',
    'route_planner': 'route-planning',
    'maintenance-officer': 'maintenance',
    'maintenance_officer': 'maintenance',
    'finance-officer': 'finance',
    'finance_officer': 'finance',
    'customer-service-officer': 'customer-service',
    'customer_service_officer': 'customer-service',
    'security-officer': 'security',
    'security_officer': 'security',
    staff: 'employee-portal',
    employee: 'employee-portal',
  };

  return aliases[normalized] || normalized || 'operations-center';
}

export function isAdminProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  return ['admin', 'super_admin'].includes(roleName);
}

export function isEmployeeProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  return roleName === 'employee' || roleName === 'staff';
}

export function isAirlineManagerProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  const departmentName = normalizeName(getDepartmentName(profile));
  return roleName === 'airline_manager' || departmentName.includes('airline') || departmentName.includes('administration');
}

export function isHrManagerProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  const departmentName = normalizeName(getDepartmentName(profile));
  return roleName === 'hr_manager' || departmentName.includes('human') || departmentName.includes('resource');
}

export function isOperationsManagerProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  const departmentName = normalizeName(getDepartmentName(profile));
  return roleName === 'operations_manager' || departmentName.includes('operations') || departmentName.includes('operations-center');
}

export function isCrewManagerProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  const departmentName = normalizeName(getDepartmentName(profile));
  return roleName === 'crew_manager' || departmentName.includes('crew');
}

export function isFleetManagerProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  const departmentName = normalizeName(getDepartmentName(profile));
  return roleName === 'fleet_manager' || departmentName.includes('fleet');
}

export function isRoutePlannerProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  const departmentName = normalizeName(getDepartmentName(profile));
  return roleName === 'route_planner' || departmentName.includes('route');
}

export function isMaintenanceOfficerProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  const departmentName = normalizeName(getDepartmentName(profile));
  return roleName === 'maintenance_officer' || departmentName.includes('maintenance');
}

export function isFinanceOfficerProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  const departmentName = normalizeName(getDepartmentName(profile));
  return roleName === 'finance_officer' || departmentName.includes('finance');
}

export function isCustomerServiceOfficerProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  const departmentName = normalizeName(getDepartmentName(profile));
  return roleName === 'customer_service_officer' || departmentName.includes('customer-service') || departmentName.includes('customer service');
}

export function isSecurityOfficerProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  const departmentName = normalizeName(getDepartmentName(profile));
  return roleName === 'security_officer' || departmentName.includes('security');
}

export function isManagerProfile(profile?: ProfileLike | null) {
  return (
    isAdminProfile(profile) ||
    isAirlineManagerProfile(profile) ||
    isHrManagerProfile(profile) ||
    isOperationsManagerProfile(profile) ||
    isCrewManagerProfile(profile) ||
    isFleetManagerProfile(profile) ||
    isRoutePlannerProfile(profile) ||
    isMaintenanceOfficerProfile(profile) ||
    isFinanceOfficerProfile(profile) ||
    isCustomerServiceOfficerProfile(profile) ||
    isSecurityOfficerProfile(profile)
  );
}

export function isHrProfile(profile?: ProfileLike | null) {
  return isHrManagerProfile(profile) || normalizeName(getDepartmentName(profile)).includes('human') || normalizeName(getDepartmentName(profile)).includes('resource');
}

export function isFinanceProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  const departmentName = normalizeName(getDepartmentName(profile));
  return roleName === 'finance' || departmentName.includes('finance');
}

export function isItProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  const departmentName = normalizeName(getDepartmentName(profile));
  return roleName === 'it' || departmentName.includes('it');
}

export function isFlightTeamProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  const departmentName = normalizeName(getDepartmentName(profile));
  const flightTeamTokens = [
    'pilot',
    'crew',
    'flight operations',
    'crew management',
    'route planning',
    'maintenance',
    'fleet management',
  ];
  return flightTeamTokens.some((token) => departmentName.includes(token) || roleName.includes(token));
}

export function isCargoProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  const departmentName = normalizeName(getDepartmentName(profile));
  return roleName === 'cargo' || departmentName.includes('cargo');
}

export function isSecurityProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  const departmentName = normalizeName(getDepartmentName(profile));
  return roleName === 'security' || departmentName.includes('security');
}

export function isStaffProfile(profile?: ProfileLike | null) {
  const roleName = normalizeName(getRoleName(profile));
  return roleName === 'staff' || roleName === 'employee';
}

export function canAccessFlights(profile?: ProfileLike | null) {
  return (
    isAdminProfile(profile) ||
    isAirlineManagerProfile(profile) ||
    isOperationsManagerProfile(profile) ||
    isCrewManagerProfile(profile) ||
    isMaintenanceOfficerProfile(profile) ||
    isSecurityOfficerProfile(profile) ||
    isRoutePlannerProfile(profile)
  );
}

export function canAccessEmployees(profile?: ProfileLike | null) {
  return isAdminProfile(profile) || isAirlineManagerProfile(profile) || isHrManagerProfile(profile);
}

export function canAccessAnalytics(profile?: ProfileLike | null) {
  return (
    isAdminProfile(profile) ||
    isAirlineManagerProfile(profile) ||
    isFinanceOfficerProfile(profile) ||
    isOperationsManagerProfile(profile) ||
    isRoutePlannerProfile(profile) ||
    isMaintenanceOfficerProfile(profile)
  );
}

export function canAccessAircraft(profile?: ProfileLike | null) {
  return (
    isAdminProfile(profile) ||
    isAirlineManagerProfile(profile) ||
    isFleetManagerProfile(profile) ||
    isMaintenanceOfficerProfile(profile)
  );
}

export function canAccessRoutes(profile?: ProfileLike | null) {
  return (
    isAdminProfile(profile) ||
    isAirlineManagerProfile(profile) ||
    isRoutePlannerProfile(profile) ||
    isOperationsManagerProfile(profile)
  );
}

export function canAccessMaintenance(profile?: ProfileLike | null) {
  return (
    isAdminProfile(profile) ||
    isAirlineManagerProfile(profile) ||
    isMaintenanceOfficerProfile(profile) ||
    isFleetManagerProfile(profile)
  );
}

export function canAccessLogs(profile?: ProfileLike | null) {
  return isAdminProfile(profile) || isAirlineManagerProfile(profile) || isSecurityOfficerProfile(profile);
}

export function canAccessDepartments(profile?: ProfileLike | null) {
  return isAdminProfile(profile) || isAirlineManagerProfile(profile) || isHrManagerProfile(profile) || isOperationsManagerProfile(profile);
}

export function getLandingPath(profile?: ProfileLike | null) {
  return `/department/${getDepartmentSlug(profile)}`;
}

export function getAccessibleNavigationItems(profile?: ProfileLike | null) {
  const items = [
    { href: '/', label: 'Dashboard' },
    { href: '/flights', label: 'Flights' },
    { href: '/employees', label: 'Employees' },
    { href: '/analytics', label: 'Analytics' },
    { href: '/departments', label: 'Departments' },
    { href: '/aircraft', label: 'Aircraft' },
    { href: '/routes', label: 'Routes' },
    { href: '/maintenance', label: 'Maintenance' },
    { href: '/logs', label: 'System Logs' },
    { href: '/notifications', label: 'Notifications' },
    { href: '/settings', label: 'Settings' },
  ];

  return items.filter((item) => {
    if (item.href === '/') return true;
    if (item.href === '/flights') return canAccessFlights(profile);
    if (item.href === '/employees') return canAccessEmployees(profile);
    if (item.href === '/analytics') return canAccessAnalytics(profile);
    if (item.href === '/departments') return canAccessDepartments(profile);
    if (item.href === '/aircraft') return canAccessAircraft(profile);
    if (item.href === '/routes') return canAccessRoutes(profile);
    if (item.href === '/maintenance') return canAccessMaintenance(profile);
    if (item.href === '/logs') return canAccessLogs(profile);
    return true;
  });
}

export async function signIn(email: string, password: string) {
  const localAccount = getLocalDemoAccount(email, password);

  if (localAccount) {
    saveLocalSession(localAccount);
    return {
      data: {
        user: {
          id: localAccount.id,
          email: localAccount.email,
          app_metadata: {
            role: localAccount.roleName,
            department: localAccount.department,
            departmentSlug: localAccount.departmentSlug,
            full_name: localAccount.fullName,
          },
        },
        session: {
          access_token: `local-${localAccount.id}-token`,
          user: {
            id: localAccount.id,
            email: localAccount.email,
            app_metadata: {
              role: localAccount.roleName,
              department: localAccount.department,
              departmentSlug: localAccount.departmentSlug,
              full_name: localAccount.fullName,
            },
          },
        },
      },
      error: null,
    } as any;
  }

  if (!isSupabaseConfigured) {
    throw new Error('Supabase is not configured. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY or use a valid internal demo account.');
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      throw error;
    }
    return data;
  } catch (error) {
    throw error;
  }
}

export async function signUp(regData: RegistrationData) {
  if (!isSupabaseConfigured) {
    const normalizedEmail = regData.email.trim().toLowerCase();
    const existing = getAllDemoAccounts().some((account) => account.email.toLowerCase() === normalizedEmail);

    if (existing) {
      throw new Error('An account with this email already exists. Please sign in.');
    }

    const roleName = regData.role || 'employee';
    const departmentSlug = getDepartmentSlug({
      roles: { name: roleName },
      departments: { name: regData.department },
    });

    const account: LocalDemoAccount = {
      id: `local-user-${Date.now()}`,
      email: normalizedEmail,
      password: regData.password,
      fullName: regData.fullName,
      department: regData.department,
      departmentSlug,
      roleName,
    };

    const nextAccounts = [...getStoredLocalUsers(), account];
    saveStoredLocalUsers(nextAccounts);
    upsertLocalEmployeeRecord(regData, account);
    saveLocalSession(account);

    return {
      data: {
        user: {
          id: account.id,
          email: account.email,
          app_metadata: {
            role: account.roleName,
            department: account.department,
            departmentSlug,
            full_name: account.fullName,
          },
        },
        session: {
          access_token: `local-${account.id}-token`,
          user: {
            id: account.id,
            email: account.email,
            app_metadata: {
              role: account.roleName,
              department: account.department,
              departmentSlug,
              full_name: account.fullName,
            },
          },
        },
      },
      error: null,
    } as any;
  }

  // 1. Create Supabase auth user — store all extra fields in user_metadata
  const roleName = regData.role || 'employee';
  const signUpResult = await supabase.auth.signUp({
    email: regData.email,
    password: regData.password,
    options: {
      data: {
        full_name: regData.fullName,
        employee_id: regData.employeeId,
        phone: regData.phone,
        role: roleName,
        department: regData.department,
        job_role: regData.jobRole,
        gender: regData.gender,
        date_of_birth: regData.dateOfBirth,
        nationality: regData.nationality,
        avatar_url: regData.avatarUrl || null,
        emergency_contact_name: regData.emergencyContactName,
        emergency_contact_phone: regData.emergencyContactPhone,
        emergency_contact_relation: regData.emergencyContactRelation,
      },
    },
  });
  const signUpData = signUpResult.data as { user: { id: string; email: string | null; identities?: unknown[] } | null } | null;
  const error = signUpResult.error;
  if (error) throw error;

  const user = signUpData?.user ?? null;
  if (!user) {
    return signUpData;
  }

  // 2. Ensure department and role records exist
  const roleId = await ensureRoleRecord(roleName);
  const departmentId = await ensureDepartmentRecord(regData.department);

  // 3. Create profile
  await (supabase.from('profiles') as any).upsert({
    id: user.id,
    email: regData.email,
    full_name: regData.fullName,
    phone: regData.phone,
    avatar_url: regData.avatarUrl || null,
    department_id: departmentId,
    role_id: roleId,
  });

  // 4. Create employee record
  await (supabase.from('employees') as any).upsert({
    id: user.id,
    employee_number: regData.employeeId,
    profile_id: user.id,
    full_name: regData.fullName,
    email: regData.email,
    phone: regData.phone,
    department_id: departmentId,
    role_id: roleId,
    job_title: regData.jobRole,
    employment_type: 'full_time',
    status: 'active',
    hire_date: new Date().toISOString().split('T')[0],
    emergency_contact: {
      name: regData.emergencyContactName,
      phone: regData.emergencyContactPhone,
      relation: regData.emergencyContactRelation,
    },
  });

  return signUpData;
}

export async function signOut() {
  clearStoredLocalSession();

  if (!isSupabaseConfigured) {
    return;
  }

  try {
    await Promise.race([
      supabase.auth.signOut(),
      new Promise<{ error: Error | null }>((resolve) => {
        const timeout = (typeof window !== 'undefined' ? window.setTimeout : globalThis.setTimeout)(() => resolve({ error: null }), 1200);
        return () => {
          if (typeof window !== 'undefined') {
            window.clearTimeout(timeout as number);
          } else {
            globalThis.clearTimeout(timeout as number);
          }
        };
      }),
    ]);
  } catch {
    // Ignore sign-out network issues and keep the local session cleared.
  }
}

export async function resetPassword(email: string) {
  if (!isSupabaseConfigured) {
    return;
  }

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });
  if (error) throw error;
}

export async function updatePassword(newPassword: string) {
  if (!isSupabaseConfigured) {
    return;
  }

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

export async function getProfile(userId: string) {
  const { data, error } = await (supabase.from('profiles') as any)
    .select('*, roles(*), departments(*)')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function createProfile(userId: string, email: string, fullName?: string) {
  const { data: { user } } = await supabase.auth.getUser();
  const metadata = user?.user_metadata ?? {};
  const roleName = (metadata.role as RoleName | undefined) || 'employee';
  const departmentName = (metadata.department as string | undefined) || 'General';

  const roleId = await ensureRoleRecord(roleName);
  const departmentId = await ensureDepartmentRecord(departmentName);

  const { error } = await (supabase.from('profiles') as any).upsert({
    id: userId,
    email,
    full_name: fullName || metadata.full_name || null,
    role_id: roleId,
    department_id: departmentId,
    phone: metadata.phone || null,
  });
  if (error) throw error;
}
