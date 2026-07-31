import { Link, useLocation } from 'wouter';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Plane,
  Users,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { signOut } from '@/lib/auth';
import { toast } from 'sonner';

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const navItems = [
  { href: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/flights', icon: Plane, label: 'Flights' },
  { href: '/employees', icon: Users, label: 'Employees' },
  { href: '/analytics', icon: BarChart3, label: 'Analytics' },
  { href: '/notifications', icon: Bell, label: 'Notifications' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const [location] = useLocation();
  const { profile, user } = useAuthContext();
  const { unreadCount } = useNotifications(user?.id);

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
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 240 }}
      transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className="fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col z-50"
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-sidebar-border">
        <Link href="/" className="flex items-center gap-2 text-sidebar-foreground">
          <Plane className="h-6 w-6 text-sidebar-primary" />
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="font-bold text-base tracking-tight"
            >
              SkyAir Operations
            </motion.span>
          )}
        </Link>
      </div>

      {/* Toggle Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onToggle}
        className="absolute -right-3 top-20 h-6 w-6 rounded-full bg-sidebar border border-sidebar-border hover:bg-sidebar-accent z-10"
        data-testid="button-toggle-sidebar"
      >
        {collapsed ? (
          <ChevronRight className="h-3 w-3 text-sidebar-foreground" />
        ) : (
          <ChevronLeft className="h-3 w-3 text-sidebar-foreground" />
        )}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href !== '/' && location.startsWith(item.href));
          const Icon = item.icon;
          const showBadge = item.label === 'Notifications' && unreadCount > 0;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all relative group',
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              )}
              data-testid={`link-nav-${item.label.toLowerCase()}`}
            >
              <Icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm font-medium"
                >
                  {item.label}
                </motion.span>
              )}
              {showBadge && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User Profile */}
      <div className="p-3 border-t border-sidebar-border">
        <div className={cn('flex items-center gap-3', collapsed ? 'justify-center' : '')}>
          <Avatar className="h-9 w-9 flex-shrink-0">
            <AvatarFallback className="bg-sidebar-primary text-sidebar-primary-foreground text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.full_name || user?.email || 'User'}
              </p>
              <p className="text-xs text-sidebar-foreground/60 truncate">{user?.email}</p>
            </div>
          )}
        </div>
        {!collapsed && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLogout}
            className="w-full mt-3 justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
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
            className="w-full mt-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            data-testid="button-logout-icon"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.aside>
  );
}
