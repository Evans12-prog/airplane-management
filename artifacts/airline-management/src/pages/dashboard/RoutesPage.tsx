import { motion } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { isAdminProfile, isRoutePlannerProfile, isOperationsManagerProfile } from '@/lib/auth';

const routeHighlights = [
  { title: 'Active routes', value: '18 live', detail: 'Operational services currently running across the network.' },
  { title: 'On-time performance', value: '92%', detail: 'Current punctuality across the active route map.' },
  { title: 'Slots in review', value: '4 pending', detail: 'Capacity requests waiting for coordination.' },
];

const routePriorityItems = [
  'Review slot availability for the next operating cycle.',
  'Track weather-sensitive departures and airport constraints.',
  'Prioritize route adjustments for punctuality protection.',
];

export default function RoutesPage() {
  const { profile } = useAuthContext();
  const hasAccess = isAdminProfile(profile) || isRoutePlannerProfile(profile) || isOperationsManagerProfile(profile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Routes</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Route planning and schedule overview for your airline operations.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-base text-muted-foreground">
          {hasAccess
            ? 'You have access to route planning tools and operational schedule controls.'
            : 'Access route planning tools if you are a planner, operations leader, or manager.'}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Route operations snapshot</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {routeHighlights.map((item) => (
            <div key={item.title} className="rounded-xl border border-border bg-background/70 p-4">
              <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{item.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-xl border border-border bg-background/70 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Current priorities</h3>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            {routePriorityItems.map((item) => (
              <li key={item} className="flex items-start gap-2">
                <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </motion.div>
  );
}
