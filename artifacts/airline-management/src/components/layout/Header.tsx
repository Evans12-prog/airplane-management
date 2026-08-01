import { Bell, Moon, Sun, Search, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTheme } from 'next-themes';
import { useAuthContext } from '@/contexts/AuthContext';
import { useNotifications } from '@/hooks/useNotifications';
import { useLocation } from 'wouter';

interface HeaderProps {
  title: string;
  onMenuToggle: () => void;
  mobileMenuOpen: boolean;
}

export function Header({ title, onMenuToggle, mobileMenuOpen }: HeaderProps) {
  const { theme, setTheme } = useTheme();
  const { user } = useAuthContext();
  const { unreadCount } = useNotifications(user?.id);
  const [, setLocation] = useLocation();

  return (
    <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-card-border bg-card px-4 sm:px-6">
      <div className="flex flex-1 items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={onMenuToggle}
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        <h1 className="text-lg font-bold text-foreground sm:text-xl">{title}</h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search flights, employees..."
            className="w-64 bg-background pl-9"
            data-testid="input-search-global"
          />
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="relative"
          onClick={() => setLocation('/notifications')}
          data-testid="button-notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -right-1 -top-1 min-w-[20px] rounded-full bg-destructive px-1.5 py-0.5 text-center text-xs font-bold text-destructive-foreground">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>

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
