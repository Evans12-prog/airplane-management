import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2, User, Lock, Settings as SettingsIcon, Bell } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Switch } from '@/components/ui/switch';
import { useAuthContext } from '@/contexts/AuthContext';
import { updatePassword } from '@/lib/auth';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

const profileSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().optional(),
  avatar_url: z.string().url().optional().or(z.literal('')),
});

const passwordSchema = z
  .object({
    currentPassword: z.string().min(6, 'Password must be at least 6 characters'),
    newPassword: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export default function SettingsPage() {
  const { profile, user } = useAuthContext();
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(profile?.dark_mode || false);

  const profileForm = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile?.full_name || '',
      phone: profile?.phone || '',
      avatar_url: profile?.avatar_url || '',
    },
  });

  const passwordForm = useForm<z.infer<typeof passwordSchema>>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const onProfileSubmit = async (values: z.infer<typeof profileSchema>) => {
    if (!user) return;
    setIsUpdatingProfile(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: values.full_name,
          phone: values.phone || null,
          avatar_url: values.avatar_url || null,
        })
        .eq('id', user.id);

      if (error) throw error;
      toast.success('Profile updated successfully');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const onPasswordSubmit = async (values: z.infer<typeof passwordSchema>) => {
    setIsUpdatingPassword(true);
    try {
      await updatePassword(values.newPassword);
      toast.success('Password updated successfully');
      passwordForm.reset();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleDarkModeToggle = async (enabled: boolean) => {
    if (!user) return;
    setDarkMode(enabled);
    try {
      const { error } = await supabase.from('profiles').update({ dark_mode: enabled }).eq('id', user.id);
      if (error) throw error;
      toast.success(`Dark mode ${enabled ? 'enabled' : 'disabled'}`);
    } catch (error) {
      toast.error('Failed to update dark mode preference');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full lg:w-auto">
          <TabsTrigger value="profile" data-testid="tab-profile">
            <User className="h-4 w-4 mr-2" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" data-testid="tab-security">
            <Lock className="h-4 w-4 mr-2" />
            Security
          </TabsTrigger>
          <TabsTrigger value="preferences" data-testid="tab-preferences">
            <SettingsIcon className="h-4 w-4 mr-2" />
            Preferences
          </TabsTrigger>
          <TabsTrigger value="notifications" data-testid="tab-notifications">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </TabsTrigger>
        </TabsList>

        {/* Profile Tab */}
        <TabsContent value="profile">
          <div className="bg-card border border-card-border rounded-xl p-8">
            <h3 className="text-lg font-semibold mb-6 text-foreground">Profile Information</h3>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <FormField
                  control={profileForm.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} data-testid="input-full-name" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="+27 12 345 6789" {...field} data-testid="input-phone" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="avatar_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Avatar URL (Optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com/avatar.jpg" {...field} data-testid="input-avatar" />
                      </FormControl>
                      <FormDescription>Enter a URL to your profile picture</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isUpdatingProfile} data-testid="button-save-profile">
                  {isUpdatingProfile ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Changes'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security">
          <div className="bg-card border border-card-border rounded-xl p-8">
            <h3 className="text-lg font-semibold mb-6 text-foreground">Change Password</h3>
            <Form {...passwordForm}>
              <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-6">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Current Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} data-testid="input-current-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} data-testid="input-new-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirm New Password</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} data-testid="input-confirm-password" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isUpdatingPassword} data-testid="button-change-password">
                  {isUpdatingPassword ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Change Password'
                  )}
                </Button>
              </form>
            </Form>
          </div>
        </TabsContent>

        {/* Preferences Tab */}
        <TabsContent value="preferences">
          <div className="bg-card border border-card-border rounded-xl p-8 space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Application Preferences</h3>
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Enable dark theme</p>
              </div>
              <Switch checked={darkMode} onCheckedChange={handleDarkModeToggle} data-testid="switch-dark-mode" />
            </div>
            <div className="flex items-center justify-between py-4 border-b border-border">
              <div>
                <p className="font-medium text-foreground">Language</p>
                <p className="text-sm text-muted-foreground">Currently: English</p>
              </div>
              <Button variant="outline" size="sm" disabled data-testid="button-change-language">
                Change
              </Button>
            </div>
          </div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <div className="bg-card border border-card-border rounded-xl p-8 space-y-6">
            <h3 className="text-lg font-semibold text-foreground">Notification Preferences</h3>
            <div className="space-y-4">
              {['Email notifications', 'Push notifications', 'SMS notifications', 'Flight delay alerts', 'Maintenance reminders'].map(
                (pref, i) => (
                  <div key={i} className="flex items-center justify-between py-3 border-b border-border">
                    <p className="text-foreground">{pref}</p>
                    <Switch defaultChecked={i < 3} data-testid={`switch-notif-${i}`} />
                  </div>
                )
              )}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
