import { motion } from 'framer-motion';
import { Link } from 'wouter';
import { ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { isAdminProfile, isHrManagerProfile, isOperationsManagerProfile } from '@/lib/auth';
import { airportOperationsSummary, departmentCards } from './departmentsData';

export default function DepartmentsPage() {
  const { profile } = useAuthContext();
  const isEligible = isAdminProfile(profile) || isHrManagerProfile(profile) || isOperationsManagerProfile(profile);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Department operations</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Review department staffing, access levels, and the airport activity running across each team.
            </p>
          </div>
          <div className="rounded-full border border-border bg-muted/60 px-3 py-1 text-sm text-muted-foreground">
            {departmentCards.length} departments tracked
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-4 md:grid-cols-2">
        {airportOperationsSummary.map((item) => (
          <div key={item.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
            <p className="text-sm font-medium text-muted-foreground">{item.title}</p>
            <p className="mt-2 text-2xl font-semibold text-foreground">{item.value}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.detail}</p>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Department overview</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {isEligible
                ? 'Administrators and authorized leaders can open each department workspace and review its current activity.'
                : 'Leadership roles can review department operations and staffing levels from this overview.'}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted/70 px-3 py-1 text-sm text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-primary" />
            Access-enabled view
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3 lg:grid-cols-2">
          {departmentCards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.slug} className="rounded-2xl border border-border bg-background/70 p-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-xl bg-gradient-to-r ${card.accent} p-2 text-white`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{card.name}</h3>
                      <p className="text-sm text-muted-foreground">{card.description}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  {card.highlights.map((item) => (
                    <span key={item} className="rounded-full border border-border bg-muted/70 px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                      {item}
                    </span>
                  ))}
                </div>

                <div className="mt-4 grid gap-2 rounded-xl border border-border bg-card/70 p-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Panel focus</span>
                    <span className="font-semibold text-foreground">{card.panelFocus}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Live signal</span>
                    <span className="font-semibold text-foreground">{card.panelMetric}</span>
                  </div>
                </div>

                <div className="mt-4 rounded-lg border border-border bg-card/80 p-3 text-sm text-muted-foreground">
                  Open the dedicated panel for the full operational view, live status, and action items for this area.
                </div>

                <Link href={`/department/${card.slug}`} className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                  Open department workspace
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}
