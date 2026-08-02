import { motion } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { isAdminProfile, isFleetManagerProfile, isMaintenanceOfficerProfile } from '@/lib/auth';

const aircraftHighlights = [
  { title: 'Active fleet', value: '24 aircraft', detail: 'Ready for dispatch and scheduled departures.' },
  { title: 'Maintenance queue', value: '6 open items', detail: 'Inspections and release checks need follow-up.' },
  { title: 'Turnaround readiness', value: '18 ready', detail: 'Aircraft prepared for the next operating window.' },
];

const aircraftPriorityItems = [
  'Gate readiness checks for the next wave of departures.',
  'Fuel and cabin preparation for aircraft entering service.',
  'Maintenance clearance updates before the next dispatch window.',
];

function AircraftIllustration() {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-sky-500/10 via-background to-background p-5">
      <svg viewBox="0 0 320 180" className="h-40 w-full" role="img" aria-label="Aircraft operations illustration">
        <rect x="24" y="32" width="272" height="120" rx="20" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
        <path d="M84 108 L146 84 L188 84 L244 70 L256 90 L208 104 L166 104 L128 120 L94 118 Z" fill="hsl(217, 91%, 60%)" fillOpacity="0.88" />
        <path d="M98 86 L74 72 L60 76 L86 94 Z" fill="hsl(142, 71%, 45%)" />
        <circle cx="108" cy="120" r="10" fill="hsl(38, 92%, 50%)" />
        <circle cx="208" cy="102" r="10" fill="hsl(262, 83%, 58%)" />
      </svg>
    </div>
  );
}

export default function AircraftPage() {
  const { profile } = useAuthContext();
  const hasAccess = isAdminProfile(profile) || isFleetManagerProfile(profile) || isMaintenanceOfficerProfile(profile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h1 className="text-2xl font-semibold text-foreground">Aircraft</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Fleet and aircraft overview for {profile?.full_name || 'your team'}.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-2xl border border-border bg-card p-6">
          <p className="text-base text-muted-foreground">
            {hasAccess
              ? 'You have access to aircraft and fleet overview tools.'
              : 'This area is designed for fleet, maintenance and senior operations roles.'}
          </p>
        </div>
        <AircraftIllustration />
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Aircraft operations snapshot</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {aircraftHighlights.map((item) => (
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
            {aircraftPriorityItems.map((item) => (
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
