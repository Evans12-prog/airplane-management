import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Plane, Loader2, Eye, EyeOff, ChevronRight, ChevronLeft,
  User, Mail, Phone, Building2, Briefcase, Globe, Calendar,
  ShieldCheck, Camera, AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuthContext } from '@/contexts/AuthContext';
import { getLandingPath, signIn, signUp, resetPassword, type RoleName } from '@/lib/auth';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

/* ─── Constants ─────────────────────────────────────────────── */
const DEPARTMENTS = [
  'Administration',
  'Flight Operations',
  'Crew Management',
  'Fleet Management',
  'Route Planning',
  'Maintenance',
  'Finance',
  'Human Resource',
  'Customer Service',
  'Security',
  'Cargo',
  'IT',
] as const;

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say'] as const;

const NATIONALITIES = [
  'Ghanaian', 'Nigerian', 'South African', 'Kenyan', 'Ugandan',
  'Tanzanian', 'Ethiopian', 'Rwandan', 'Zambian', 'Zimbabwean',
  'British', 'American', 'Canadian', 'Australian', 'Other',
] as const;

const RELATIONS = ['Spouse', 'Parent', 'Sibling', 'Child', 'Friend', 'Other'] as const;

/* ─── Schemas ────────────────────────────────────────────────── */
const loginSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').refine((value) => value === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value), {
    message: 'Enter a valid email address',
  }),
  password: z.string().min(1, 'Password is required').refine((value) => value.length >= 1, {
    message: 'Password must be at least 6 characters',
  }),
});

const step1Schema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  employeeId: z.string().min(2, 'Employee ID is required'),
  email: z.string().email('Enter a valid email address'),
  phone: z.string().min(7, 'Enter a valid phone number'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const ROLES: Array<{ value: RoleName; label: string }> = [
  { value: 'employee', label: 'Employee' },
  { value: 'airline_manager', label: 'Airline Manager' },
  { value: 'hr_manager', label: 'HR Manager' },
  { value: 'operations_manager', label: 'Operations Manager' },
  { value: 'crew_manager', label: 'Crew Manager' },
  { value: 'fleet_manager', label: 'Fleet Manager' },
  { value: 'route_planner', label: 'Route Planner' },
  { value: 'maintenance_officer', label: 'Maintenance Officer' },
  { value: 'finance_officer', label: 'Finance Officer' },
  { value: 'customer_service_officer', label: 'Customer Service Officer' },
  { value: 'security_officer', label: 'Security Officer' },
];

const step2Schema = z.object({
  department: z.string().min(1, 'Select a department'),
  jobRole: z.string().min(2, 'Job role is required'),
  role: z.string().min(1, 'Select a role'),
  gender: z.string().min(1, 'Select a gender'),
  dateOfBirth: z.string().min(1, 'Date of birth is required'),
  nationality: z.string().min(1, 'Select a nationality'),
  avatarUrl: z.string().url('Enter a valid URL').optional().or(z.literal('')),
  emergencyContactName: z.string().min(2, 'Emergency contact name is required'),
  emergencyContactPhone: z.string().min(7, 'Enter a valid phone number'),
  emergencyContactRelation: z.string().min(1, 'Select relationship'),
});

const resetSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

type Step1Values = z.infer<typeof step1Schema>;
type Step2Values = z.infer<typeof step2Schema>;

/* ─── Password Toggle Input ──────────────────────────────────── */
function PasswordInput({
  field, placeholder, testId, autoComplete,
}: {
  field: React.InputHTMLAttributes<HTMLInputElement> & { value?: string };
  placeholder?: string;
  testId?: string;
  autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        placeholder={placeholder ?? '••••••••'}
        className="pr-10"
        data-testid={testId}
        autoComplete={autoComplete ?? 'current-password'}
        {...field}
      />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        tabIndex={-1}
        aria-label={show ? 'Hide password' : 'Show password'}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  );
}

/* ─── Field Section Label ─────────────────────────────────────── */
function SectionLabel({ icon: Icon, label }: { icon: React.ElementType; label: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 mt-5 first:mt-0">
      <Icon className="h-4 w-4 text-primary" />
      <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</span>
      <div className="flex-1 h-px bg-border" />
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────────────── */
export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { user, loading, profile } = useAuthContext();
  const [mode, setMode] = useState<'auth' | 'reset'>('auth');
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');
  const [regStep, setRegStep] = useState<1 | 2>(1);
  const [step1Data, setStep1Data] = useState<Step1Values | null>(null);
  const [submitting, setSubmitting] = useState(false);

  /* Forms */
  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const step1Form = useForm<Step1Values>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      fullName: '', employeeId: '', email: '',
      phone: '', password: '', confirmPassword: '',
    },
  });

  const step2Form = useForm<Step2Values>({
    resolver: zodResolver(step2Schema),
    defaultValues: {
      department: '', jobRole: '', role: 'employee', gender: '', dateOfBirth: '',
      nationality: '', avatarUrl: '',
      emergencyContactName: '', emergencyContactPhone: '', emergencyContactRelation: '',
    },
  });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    if (!loading && user && profile) {
      setLocation(getLandingPath(profile) || '/');
    }
  }, [user, loading, profile, setLocation]);

  /* Handlers */
  const onSignIn = async (values: z.infer<typeof loginSchema>) => {
    setSubmitting(true);
    try {
      const result = await signIn(values.email.trim(), values.password);
      const authUser = result?.data?.user || result?.user;
      const roleName = authUser?.app_metadata?.role || authUser?.user_metadata?.role || profile?.roles?.name || 'employee';
      const departmentName = authUser?.app_metadata?.department || authUser?.user_metadata?.department || profile?.departments?.name || 'Administration';
      const departmentSlug = authUser?.app_metadata?.departmentSlug || authUser?.user_metadata?.departmentSlug || null;
      const destinationProfile = {
        roles: { name: roleName },
        departments: { id: departmentSlug, name: departmentName },
      };
      toast.success('Welcome back!');
      setLocation(getLandingPath(destinationProfile) || '/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  const onStep1Next = async (values: Step1Values) => {
    setStep1Data(values);
    setRegStep(2);
  };

  const onStep2Submit = async (values: Step2Values) => {
    if (!step1Data) return;
    setSubmitting(true);
    try {
      const result = await signUp({
        ...step1Data,
        ...values,
        role: values.role as RoleName,
      });

      const authUser = result?.user || result?.data?.user;
      const roleName = authUser?.app_metadata?.role || authUser?.user_metadata?.role || values.role || 'employee';
      const departmentSlug = authUser?.app_metadata?.departmentSlug || authUser?.user_metadata?.departmentSlug || null;
      const destinationProfile = {
        roles: { name: roleName },
        departments: { id: departmentSlug, name: values.department },
      };

      const isEmailConfirmationRequired = !result?.data?.session?.user;
      if (isEmailConfirmationRequired) {
        toast.success('Account created! Please confirm your email before signing in.');
      } else {
        toast.success('Account created! Sign in to continue.');
      }

      step1Form.reset();
      step2Form.reset();
      setRegStep(1);
      setStep1Data(null);
      setActiveTab('signin');
      setLocation(getLandingPath(destinationProfile) || '/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  const onReset = async (values: z.infer<typeof resetSchema>) => {
    setSubmitting(true);
    try {
      await resetPassword(values.email);
      toast.success('Password reset link sent — check your inbox.');
      setMode('auth');
      resetForm.reset();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to send reset email');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex lg:w-[420px] xl:w-1/2 bg-sidebar flex-col justify-between p-12 relative overflow-hidden flex-shrink-0">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'linear-gradient(to right,#fff 1px,transparent 1px),linear-gradient(to bottom,#fff 1px,transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="flex items-center gap-3 text-sidebar-foreground relative">
          <div className="bg-sidebar-primary rounded-lg p-2">
            <Plane className="h-6 w-6 text-sidebar-primary-foreground" />
          </div>
          <span className="text-xl font-bold tracking-tight">SkyAir Operations</span>
        </div>

        <div className="relative">
          <h2 className="text-4xl font-bold text-sidebar-foreground leading-tight mb-4">
            Command your<br />fleet from anywhere.
          </h2>
          <p className="text-sidebar-foreground/60 text-lg leading-relaxed">
            Real-time flight operations, crew management, and analytics — built for airline teams.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4 relative">
          {[
            { label: 'Flights Managed', value: '50K+' },
            { label: 'On-Time Rate', value: '94.2%' },
            { label: 'Crew Members', value: '1,200+' },
          ].map((s) => (
            <div key={s.label} className="bg-sidebar-accent rounded-xl p-4">
              <div className="text-2xl font-bold text-sidebar-primary">{s.value}</div>
              <div className="text-xs text-sidebar-foreground/60 mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-start justify-center p-6 lg:p-10 overflow-y-auto min-h-screen">
        <div className="w-full max-w-xl py-8">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="bg-primary rounded-lg p-2">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">SkyAir Operations</span>
          </div>

          {/* ── Password reset ── */}
          {mode === 'reset' ? (
            <div className="bg-card border border-card-border rounded-2xl shadow-sm p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Reset password</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your email and we'll send a reset link.
                </p>
              </div>
              <Form {...resetForm}>
                <form onSubmit={resetForm.handleSubmit(onReset)} className="space-y-4">
                  <FormField
                    control={resetForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email address</FormLabel>
                        <FormControl>
                          <Input type="email" placeholder="you@skyair.com" {...field} data-testid="input-reset-email" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={submitting} data-testid="button-send-reset">
                    {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending...</> : 'Send Reset Link'}
                  </Button>
                </form>
              </Form>
              <button
                type="button"
                onClick={() => setMode('auth')}
                className="mt-4 text-sm text-primary hover:underline w-full text-center"
                data-testid="button-back-to-signin"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            /* ── Auth tabs ── */
            <div className="bg-card border border-card-border rounded-2xl shadow-sm p-8">
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-foreground">
                  {activeTab === 'signin' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTab === 'signin'
                    ? 'Sign in to access SkyAir Operations'
                    : 'Register to join the airline management system'}
                </p>
              </div>

              <Tabs
                value={activeTab}
                onValueChange={(v) => {
                  setActiveTab(v as 'signin' | 'register');
                  setRegStep(1);
                  setStep1Data(null);
                }}
              >
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="signin" className="flex-1" data-testid="tab-signin">Sign In</TabsTrigger>
                  <TabsTrigger value="register" className="flex-1" data-testid="tab-register">Register</TabsTrigger>
                </TabsList>

                {/* ══ SIGN IN ══ */}
                <TabsContent value="signin" className="mt-0">
                  <Form {...loginForm}>
                    <form onSubmit={loginForm.handleSubmit(onSignIn)} className="space-y-4">
                      <FormField
                        control={loginForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@skyair.com" autoComplete="email" {...field} data-testid="input-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={loginForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex items-center justify-between">
                              <FormLabel>Password</FormLabel>
                              <button
                                type="button"
                                onClick={() => setMode('reset')}
                                className="text-xs text-primary hover:underline"
                                data-testid="button-forgot-password"
                              >
                                Forgot password?
                              </button>
                            </div>
                            <FormControl>
                              <PasswordInput field={field as any} autoComplete="current-password" testId="input-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full mt-2" disabled={submitting} data-testid="button-sign-in">
                        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Signing in...</> : 'Sign In'}
                      </Button>
                    </form>
                  </Form>
                </TabsContent>

                {/* ══ REGISTRATION (2 steps) ══ */}
                <TabsContent value="register" className="mt-0">
                  {/* Step indicator */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className={cn('font-medium', regStep === 1 ? 'text-primary' : 'text-muted-foreground')}>
                        Step 1: Account Info
                      </span>
                      <span className={cn('font-medium', regStep === 2 ? 'text-primary' : 'text-muted-foreground')}>
                        Step 2: Profile Info
                      </span>
                    </div>
                    <Progress value={regStep === 1 ? 50 : 100} className="h-1.5" />
                  </div>

                  {/* ── Step 1: Account Info ── */}
                  {regStep === 1 && (
                    <Form {...step1Form}>
                      <form onSubmit={step1Form.handleSubmit(onStep1Next)} className="space-y-0">
                        <SectionLabel icon={User} label="Personal Details" />
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={step1Form.control}
                              name="fullName"
                              render={({ field }) => (
                                <FormItem className="col-span-2">
                                  <FormLabel>Full Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="James Kofi Osei" autoComplete="name" {...field} data-testid="input-full-name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={step1Form.control}
                              name="employeeId"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Employee ID</FormLabel>
                                  <FormControl>
                                    <Input placeholder="EMP-001" {...field} data-testid="input-employee-id" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={step1Form.control}
                              name="phone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Phone Number</FormLabel>
                                  <FormControl>
                                    <Input type="tel" placeholder="+233 55 000 0000" autoComplete="tel" {...field} data-testid="input-phone" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <SectionLabel icon={Mail} label="Login Credentials" />
                        <div className="space-y-4">
                          <FormField
                            control={step1Form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="you@skyair.com" autoComplete="email" {...field} data-testid="input-register-email" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={step1Form.control}
                              name="password"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Password</FormLabel>
                                  <FormControl>
                                    <PasswordInput field={field as any} placeholder="Min. 8 chars" autoComplete="new-password" testId="input-register-password" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={step1Form.control}
                              name="confirmPassword"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Confirm Password</FormLabel>
                                  <FormControl>
                                    <PasswordInput field={field as any} placeholder="Repeat password" autoComplete="new-password" testId="input-confirm-password" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <Button type="submit" className="w-full mt-6" data-testid="button-next-step">
                          Continue <ChevronRight className="ml-1 h-4 w-4" />
                        </Button>
                      </form>
                    </Form>
                  )}

                  {/* ── Step 2: Profile Info ── */}
                  {regStep === 2 && (
                    <Form {...step2Form}>
                      <form onSubmit={step2Form.handleSubmit(onStep2Submit)} className="space-y-0">
                        <SectionLabel icon={Building2} label="Work Information" />
                        <div className="space-y-4">
                          <FormField
                            control={step2Form.control}
                            name="department"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Department</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-department">
                                      <SelectValue placeholder="Select your department" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {DEPARTMENTS.map((d) => (
                                      <SelectItem key={d} value={d}>{d}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={step2Form.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-role">
                                      <SelectValue placeholder="Select your role" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {ROLES.map((role) => (
                                      <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={step2Form.control}
                            name="jobRole"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Job Role / Title</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. Senior Flight Attendant" {...field} data-testid="input-job-role" />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <SectionLabel icon={Globe} label="Personal Information" />
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={step2Form.control}
                              name="gender"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Gender</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-gender">
                                        <SelectValue placeholder="Select gender" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {GENDERS.map((g) => (
                                        <SelectItem key={g} value={g}>{g}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={step2Form.control}
                              name="dateOfBirth"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Date of Birth</FormLabel>
                                  <FormControl>
                                    <Input type="date" {...field} data-testid="input-dob" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                          <FormField
                            control={step2Form.control}
                            name="nationality"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Nationality</FormLabel>
                                <Select onValueChange={field.onChange} value={field.value}>
                                  <FormControl>
                                    <SelectTrigger data-testid="select-nationality">
                                      <SelectValue placeholder="Select nationality" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    {NATIONALITIES.map((n) => (
                                      <SelectItem key={n} value={n}>{n}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <SectionLabel icon={Camera} label="Profile Picture" />
                        <FormField
                          control={step2Form.control}
                          name="avatarUrl"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Profile Picture URL <span className="text-muted-foreground font-normal">(optional)</span></FormLabel>
                              <FormControl>
                                <Input
                                  type="url"
                                  placeholder="https://example.com/photo.jpg"
                                  {...field}
                                  data-testid="input-avatar-url"
                                />
                              </FormControl>
                              <p className="text-xs text-muted-foreground mt-1">Paste a direct link to your profile photo</p>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <SectionLabel icon={AlertCircle} label="Emergency Contact" />
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <FormField
                              control={step2Form.control}
                              name="emergencyContactName"
                              render={({ field }) => (
                                <FormItem className="col-span-2">
                                  <FormLabel>Contact Name</FormLabel>
                                  <FormControl>
                                    <Input placeholder="Abena Mensah" {...field} data-testid="input-emergency-name" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={step2Form.control}
                              name="emergencyContactPhone"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Contact Phone</FormLabel>
                                  <FormControl>
                                    <Input type="tel" placeholder="+233 24 000 0000" {...field} data-testid="input-emergency-phone" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <FormField
                              control={step2Form.control}
                              name="emergencyContactRelation"
                              render={({ field }) => (
                                <FormItem>
                                  <FormLabel>Relationship</FormLabel>
                                  <Select onValueChange={field.onChange} value={field.value}>
                                    <FormControl>
                                      <SelectTrigger data-testid="select-relation">
                                        <SelectValue placeholder="Relationship" />
                                      </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                      {RELATIONS.map((r) => (
                                        <SelectItem key={r} value={r}>{r}</SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => setRegStep(1)}
                            className="flex-1"
                            data-testid="button-back-step"
                          >
                            <ChevronLeft className="mr-1 h-4 w-4" /> Back
                          </Button>
                          <Button
                            type="submit"
                            className="flex-1"
                            disabled={submitting}
                            data-testid="button-register"
                          >
                            {submitting
                              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</>
                              : <>
                                  <ShieldCheck className="mr-2 h-4 w-4" />
                                  Create Account
                                </>}
                          </Button>
                        </div>

                        <p className="text-xs text-muted-foreground text-center pt-4">
                          By registering, you agree to our terms of service. Your account may require admin approval for elevated access.
                        </p>
                      </form>
                    </Form>
                  )}
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
