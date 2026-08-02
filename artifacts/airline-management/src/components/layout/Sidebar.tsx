import { Link, useLocation } from 'wouter';
import {
  LayoutDashboard,
  Plane,
  Users,
  BarChart3,
  Bell,
  Settings,
  Layers,
  Map,
  Wrench,
  ShieldAlert,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Building2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { mergeProfileWithUserMetadata, getAccessibleNavigationItems, getDepartmentSlug, signOut } from '@/lib/auth';
import { toast } from 'sonner';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

const navItemIcons: Record<string, typeof LayoutDashboard> = {
  '/': LayoutDashboard,
  '/flights': Plane,
  '/employees': Users,
  '/analytics': BarChart3,
  '/departments': Layers,
  '/aircraft': Plane,
  '/routes': Map,
  '/maintenance': Wrench,
  '/logs': ShieldAlert,
  '/notifications': Bell,
  '/settings': Settings,
};

export function Sidebar({ collapsed, onToggle, mobileOpen, onMobileClose }: SidebarProps) {
  const [location] = useLocation();
  const { profile, user } = useAuthContext();
  const { unreadCount } = useNotifications(user?.id);
  const fallbackProfile = mergeProfileWithUserMetadata(profile, user);
  const departmentSlug = getDepartmentSlug(fallbackProfile);
  const departmentWorkspaceHref = `/department/${departmentSlug}`;
  const departmentWorkspaceLabel = fallbackProfile?.departments?.name ? `${fallbackProfile.departments.name} Workspace` : 'Department Workspace';

  const navItems = [
    {
      href: departmentWorkspaceHref,
      label: departmentWorkspaceLabel,
      icon: Building2,
      featured: true,
    },
    ...getAccessibleNavigationItems(fallbackProfile).map((item) => ({
      ...item,
      icon: navItemIcons[item.href] || LayoutDashboard,
      featured: false,
    })),
  ];

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success('Logged out successfully');
    } catch (error) {
      toast.error('Failed to log out');
    }
  };

  const initials = profile?.full_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U';

  return (
    <>
      <div
        className={cn(
          'fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 md:hidden',
          mobileOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        )}
        onClick={onMobileClose}
      />

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-sidebar-border bg-sidebar transition-transform duration-300 md:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full',
          collapsed ? 'md:w-[80px]' : 'md:w-[240px]',
          'w-[280px]',
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-sidebar-border px-4">
          <Link href="/" className="flex items-center gap-2 text-sidebar-foreground" onClick={onMobileClose}>
            <Plane className="h-6 w-6 text-sidebar-primary" />
            {!collapsed && (
              <span className="text-base font-bold tracking-tight">SkyAir Operations</span>
            )}
          </Link>
        </div>

        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          className="absolute -right-3 top-20 z-10 hidden h-6 w-6 rounded-full border border-sidebar-border bg-sidebar hover:bg-sidebar-accent md:flex"
          data-testid="button-toggle-sidebar"
        >
          {collapsed ? (
            <ChevronRight className="h-3 w-3 text-sidebar-foreground" />
          ) : (
            <ChevronLeft className="h-3 w-3 text-sidebar-foreground" />
          )}
        </Button>

        <div className={cn('mx-3 mb-3 mt-3 rounded-xl border border-sidebar-border/70 bg-sidebar-accent/20 p-3', collapsed ? 'px-2 py-2' : 'px-3 py-3')}>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sidebar-primary/15 text-sidebar-primary">
              <Building2 className="h-4 w-4" />
            </div>
            {!collapsed && (
              <div>
                <p className="text-[11px] uppercase tracking-[0.24em] text-sidebar-foreground/60">Department</p>
                <p className="text-sm font-semibold text-sidebar-foreground">{departmentWorkspaceLabel}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <p className="mt-2 text-xs text-sidebar-foreground/70">Jump straight into your team’s day-to-day workspace.</p>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
          {navItems.map((item) => {
            const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
            const Icon = item.icon;
            const showBadge = item.label === 'Notifications' && unreadCount > 0;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                className={cn(
                  'group relative flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all',
                  isActive
                    ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  item.featured && !isActive && 'border border-sidebar-border/70 bg-sidebar-accent/10',
                )}
                data-testid={`link-nav-${item.label.toLowerCase()}`}
              >
                <Icon className="h-5 w-5 flex-shrink-0" />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                {showBadge && (
                  <span className="ml-auto min-w-[20px] rounded-full bg-destructive px-1.5 py-0.5 text-center text-xs font-bold text-destructive-foreground">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-3">
          <div className={cn('flex items-center gap-3', collapsed ? 'justify-center' : '')}>
            <Avatar className="h-9 w-9 flex-shrink-0">
              <AvatarFallback className="bg-sidebar-primary text-sm font-semibold text-sidebar-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-sidebar-foreground">{profile?.full_name || user?.email || 'User'}</p>
                <p className="truncate text-xs text-sidebar-foreground/60">{user?.email}</p>
              </div>
            )}
          </div>
          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLogout}
              className="mt-3 w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              data-testid="button-logout"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          )}
          {collapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="mt-2 w-full text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              data-testid="button-logout-icon"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          )}
        </div>
      </aside>
    </>
  );
}
