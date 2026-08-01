import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { ThemeProvider } from 'next-themes';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { AuthProvider } from '@/contexts/AuthContext';
import ProtectedRoute from '@/components/shared/ProtectedRoute';
import AppLayout from '@/components/layout/AppLayout';
import LoginPage from '@/pages/auth/LoginPage';
import DashboardPage from '@/pages/dashboard/DashboardPage';
import DepartmentPage from '@/pages/dashboard/DepartmentPage';
import DepartmentsPage from '@/pages/dashboard/DepartmentsPage';
import AircraftPage from '@/pages/dashboard/AircraftPage';
import RoutesPage from '@/pages/dashboard/RoutesPage';
import MaintenancePage from '@/pages/dashboard/MaintenancePage';
import SystemLogsPage from '@/pages/dashboard/SystemLogsPage';
import FlightsPage from '@/pages/flights/FlightsPage';
import NewFlightPage from '@/pages/flights/NewFlightPage';
import EmployeesPage from '@/pages/employees/EmployeesPage';
import EmployeeFormPage from '@/pages/employees/EmployeeFormPage';
import AnalyticsPage from '@/pages/analytics/AnalyticsPage';
import NotificationsPage from '@/pages/notifications/NotificationsPage';
import SettingsPage from '@/pages/settings/SettingsPage';
import NotFound from '@/pages/not-found';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 30000,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/(.*)">
        {() => (
          <ProtectedRoute>
            <AppLayout>
              <Switch>
                <Route path="/" component={DashboardPage} />
                <Route path="/department/:slug" component={DepartmentPage} />
                <Route path="/flights" component={FlightsPage} />
                <Route path="/flights/new" component={NewFlightPage} />
                <Route path="/flights/edit/:id" component={NewFlightPage} />
                <Route path="/employees" component={EmployeesPage} />
                <Route path="/employees/new" component={EmployeeFormPage} />
                <Route path="/employees/edit/:id" component={EmployeeFormPage} />
                <Route path="/analytics" component={AnalyticsPage} />
                <Route path="/departments" component={DepartmentsPage} />
                <Route path="/aircraft" component={AircraftPage} />
                <Route path="/routes" component={RoutesPage} />
                <Route path="/maintenance" component={MaintenancePage} />
                <Route path="/logs" component={SystemLogsPage} />
                <Route path="/notifications" component={NotificationsPage} />
                <Route path="/settings" component={SettingsPage} />
                <Route component={NotFound} />
              </Switch>
            </AppLayout>
          </ProtectedRoute>
        )}
      </Route>
    </Switch>
  );
}

export default function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster richColors position="top-right" />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ThemeProvider>
  );
}
