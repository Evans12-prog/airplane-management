import { motion } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { isAdminProfile, isMaintenanceOfficerProfile, isFleetManagerProfile } from '@/lib/auth';

const maintenanceHighlights = [
  { title: 'Open work orders', value: '6 active', detail: 'Urgent repairs and inspection follow-up items.' },
  { title: 'Inspection window', value: '2 due today', detail: 'Checks awaiting review before release.' },
  { title: 'Readiness status', value: '18 cleared', detail: 'Aircraft confirmed ready for dispatch.' },
];

const maintenancePriorityItems = [
  'Resolve open deferrals before the next departure wave.',
  'Review maintenance log updates for overnight aircraft.',
  'Confirm inspection signoff for all scheduled returns to service.',
];

export default function MaintenancePage() {
  const { profile } = useAuthContext();
  const hasAccess = isAdminProfile(profile) || isMaintenanceOfficerProfile(profile) || isFleetManagerProfile(profile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Maintenance</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Maintenance workflows, inspections, and aircraft readiness status.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6">
        <p className="text-base text-muted-foreground">
          {hasAccess
            ? 'You have access to maintenance workflows, inspections, and aircraft readiness tools.'
            : 'This page is ideal for maintenance officers, fleet managers, and operations staff.'}
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Maintenance operations snapshot</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {maintenanceHighlights.map((item) => (
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
            {maintenancePriorityItems.map((item) => (
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
