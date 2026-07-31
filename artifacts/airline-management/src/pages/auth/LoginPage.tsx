import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Plane, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuthContext } from '@/contexts/AuthContext';
import { signIn, signUp, resetPassword } from '@/lib/auth';
import { toast } from 'sonner';

/* ─── Schemas ──────────────────────────────────────────────── */
const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
});

const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const resetSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

/* ─── Password input with toggle ───────────────────────────── */
function PasswordInput({ field, placeholder, testId, autoComplete }: {
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

/* ─── Page ──────────────────────────────────────────────────── */
export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { user, loading } = useAuthContext();
  const [mode, setMode] = useState<'signin' | 'reset'>('signin');
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState<'signin' | 'register'>('signin');

  const loginForm = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const registerForm = useForm<z.infer<typeof registerSchema>>({
    resolver: zodResolver(registerSchema),
    defaultValues: { fullName: '', email: '', password: '', confirmPassword: '' },
  });

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: { email: '' },
  });

  useEffect(() => {
    if (!loading && user) setLocation('/');
  }, [user, loading, setLocation]);

  /* ── Sign in ── */
  const onSignIn = async (values: z.infer<typeof loginSchema>) => {
    setSubmitting(true);
    try {
      await signIn(values.email, values.password);
      toast.success('Welcome back!');
      setLocation('/');
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Invalid email or password');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Register ── */
  const onRegister = async (values: z.infer<typeof registerSchema>) => {
    setSubmitting(true);
    try {
      const result = await signUp(values.email, values.password, values.fullName);
      if (result.session) {
        toast.success('Account created! Welcome aboard.');
        setLocation('/');
      } else {
        toast.success(
          'Account created! Please check your email to confirm your account before signing in.',
          { duration: 8000 }
        );
        registerForm.reset();
        setActiveTab('signin');
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to create account');
    } finally {
      setSubmitting(false);
    }
  };

  /* ── Password reset ── */
  const onReset = async (values: z.infer<typeof resetSchema>) => {
    setSubmitting(true);
    try {
      await resetPassword(values.email);
      toast.success('Password reset link sent — check your inbox.');
      setMode('signin');
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
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-sidebar flex-col justify-between p-12 relative overflow-hidden">
        {/* Background grid lines */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div>
          <div className="flex items-center gap-3 text-sidebar-foreground">
            <div className="bg-sidebar-primary rounded-lg p-2">
              <Plane className="h-6 w-6 text-sidebar-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight">SkyAir Operations</span>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-sidebar-foreground leading-tight mb-4">
            Command your<br />fleet from anywhere.
          </h2>
          <p className="text-sidebar-foreground/60 text-lg leading-relaxed">
            Real-time flight operations, crew management, and analytics — all in one professional dashboard built for airline teams.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-4">
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

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="bg-primary rounded-lg p-2">
              <Plane className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground">SkyAir Operations</span>
          </div>

          {mode === 'reset' ? (
            /* ── Reset password ── */
            <div className="bg-card border border-card-border rounded-2xl shadow-sm p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">Reset your password</h2>
                <p className="text-sm text-muted-foreground mt-1">
                  Enter your email and we'll send you a reset link.
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
                    {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Sending link...</> : 'Send Reset Link'}
                  </Button>
                </form>
              </Form>
              <button
                type="button"
                onClick={() => setMode('signin')}
                className="mt-4 text-sm text-primary hover:underline w-full text-center"
                data-testid="button-back-to-signin"
              >
                Back to sign in
              </button>
            </div>
          ) : (
            /* ── Sign in / Register tabs ── */
            <div className="bg-card border border-card-border rounded-2xl shadow-sm p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {activeTab === 'signin' ? 'Welcome back' : 'Create your account'}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">
                  {activeTab === 'signin'
                    ? 'Sign in to your SkyAir Operations account'
                    : 'Register to access the airline management system'}
                </p>
              </div>

              <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'signin' | 'register')}>
                <TabsList className="w-full mb-6">
                  <TabsTrigger value="signin" className="flex-1" data-testid="tab-signin">Sign In</TabsTrigger>
                  <TabsTrigger value="register" className="flex-1" data-testid="tab-register">Register</TabsTrigger>
                </TabsList>

                {/* ── Sign In tab ── */}
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
                              <Input type="email" placeholder="you@skyair.com" {...field} data-testid="input-email" />
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
                              <PasswordInput field={field as any} testId="input-password" />
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

                {/* ── Register tab ── */}
                <TabsContent value="register" className="mt-0">
                  <Form {...registerForm}>
                    <form onSubmit={registerForm.handleSubmit(onRegister)} className="space-y-4">
                      <FormField
                        control={registerForm.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Full name</FormLabel>
                            <FormControl>
                              <Input placeholder="James Osei" {...field} data-testid="input-full-name" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email address</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder="you@skyair.com" {...field} data-testid="input-register-email" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <PasswordInput field={field as any} placeholder="Min. 8 characters" testId="input-register-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={registerForm.control}
                        name="confirmPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Confirm password</FormLabel>
                            <FormControl>
                              <PasswordInput field={field as any} placeholder="Repeat your password" testId="input-confirm-password" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" className="w-full mt-2" disabled={submitting} data-testid="button-register">
                        {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating account...</> : 'Create Account'}
                      </Button>
                      <p className="text-xs text-muted-foreground text-center pt-1">
                        By registering, you agree to our terms of service. Your account will require admin approval for full access.
                      </p>
                    </form>
                  </Form>
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
