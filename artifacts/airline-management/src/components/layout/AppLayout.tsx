import { useState, ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { useLocation } from 'wouter';

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
};

export default function AppLayout({ children }: AppLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [location] = useLocation();

  const title = pageTitles[location] || 'SkyAir Operations';

  return (
    <div className="min-h-screen bg-background">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
      <div className="transition-all duration-300" style={{ marginLeft: collapsed ? 80 : 240 }}>
        <Header title={title} sidebarCollapsed={collapsed} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
