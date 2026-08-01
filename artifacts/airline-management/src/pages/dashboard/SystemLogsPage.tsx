import { motion } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { isAdminProfile, isOperationsManagerProfile } from '@/lib/auth';

const systemHighlights = [
  { title: 'Alerts', value: '92 active', detail: 'Operational events and monitoring notifications.' },
  { title: 'Audit entries', value: '148 today', detail: 'Recent platform activity and secure access records.' },
  { title: 'System health', value: '98.6%', detail: 'Current availability across key airport systems.' },
];

const systemPriorityItems = [
  'Investigate repeated authentication and access deviations.',
  'Review recent audit events tied to operations and staff changes.',
  'Monitor system health for check-in, dispatch, and support services.',
];

export default function SystemLogsPage() {
  const { profile } = useAuthContext();
  const hasFullAccess = isAdminProfile(profile) || isOperationsManagerProfile(profile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">System Logs</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Monitor security, audit, and system event logs for your airline operations.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-base text-muted-foreground">
          {hasFullAccess
            ? 'You have access to system logs, audit events, and security monitoring tools.'
            : 'Access is restricted to security, operations, and senior leadership roles.'}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">System monitoring snapshot</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {systemHighlights.map((item) => (
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
            {systemPriorityItems.map((item) => (
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
