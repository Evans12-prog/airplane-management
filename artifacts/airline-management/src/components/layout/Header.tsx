import { Bell, Moon, Sun, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useLocation } from 'wouter';

interface HeaderProps {
  title: string;
  sidebarCollapsed: boolean;
}

export function Header({ title, sidebarCollapsed }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthContext();
  const { unreadCount } = useNotifications(user?.id);
  const [, setLocation] = useLocation();

  return (
    <header
      className="h-16 bg-card border-b border-card-border flex items-center justify-between px-6 sticky top-0 z-40"
    >
      <div className="flex items-center gap-4 flex-1">
        <h1 className="text-xl font-bold text-foreground">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search flights, employees..."
            className="pl-9 w-64 bg-background"
            data-testid="input-search-global"
          />
        </div>

        {/* Notifications */}
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setLocation('/notifications')}
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>

        {/* Dark Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          data-testid="button-theme-toggle"
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
        </Button>
      </div>
    </header>
  );
}
