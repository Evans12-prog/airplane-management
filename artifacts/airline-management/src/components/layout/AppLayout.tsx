import { useEffect, useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useLocation } from 'wouter';
import { cn } from '@/lib/utils';

interface AppLayoutProps {
  children: ReactNode;
}

const pageTitles: Record<string, string> = {
  '/': 'Operations Dashboard',
  '/flights': 'Flight Management',
  '/flights/new': 'Schedule New Flight',
  '/employees': 'Employee Directory',
  '/analytics': 'Analytics & Insights',
  '/notifications': 'Notifications Center',
  '/settings': 'Settings',
  '/departments': 'Departments',
};

function getTitle(location: string) {
  if (location.startsWith('/department')) return 'Department Workspace';
  return pageTitles[location] || 'SkyAir Operations';
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const title = getTitle(location);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />
      <div className={cn('transition-all duration-300', collapsed ? 'lg:ml-[80px]' : 'lg:ml-[240px]')}>
        <Header
          title={title}
          onMenuToggle={() => setMobileOpen((value) => !value)}
          mobileMenuOpen={mobileOpen}
        />
        <main className="p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
}
