import { useMemo } from 'react';
import { useLocation, useRoute } from 'wouter';
import { motion } from 'framer-motion';
import {
  ArrowRight,
  Building2,
  Plane,
  Users,
  Bell,
  BarChart3,
  ShieldCheck,
  Sparkles,
  Settings,
  Activity,
} from 'lucide-react';
import { useAuthContext } from '@/contexts/AuthContext';
import { getAccessibleNavigationItems, getDepartmentName, getRoleName } from '@/lib/auth';
import { Link } from 'wouter';

type DepartmentWorkstream = {
  title: string;
  detail: string;
  status: string;
};

type DepartmentSummaryCard = {
  title: string;
  value: string;
  detail: string;
};

const departmentConfig: Record<string, { title: string; description: string; highlights: string[]; accent: string; workstreams: DepartmentWorkstream[] }> = {
  'administration': {
    title: 'Administration Center',
    description: 'Operational oversight, approvals, and coordination for senior leadership.',
    highlights: ['Executive approvals', 'Cross-department coordination', 'Policy updates'],
    accent: 'from-slate-600 to-slate-500',
    workstreams: [
      { title: 'Executive approvals', detail: 'Reviewing leadership requests and sign-off items for the day’s airport operations.', status: 'In progress' },
      { title: 'Policy coordination', detail: 'Aligning internal procedures with current terminal and operational requirements.', status: 'Priority' },
      { title: 'Cross-team briefings', detail: 'Preparing daily updates for finance, operations, and customer service leads.', status: 'Scheduled' },
    ],
  },
  'flight-operations': {
    title: 'Flight Operations Hub',
    description: 'Live flight readiness updates, dispatch coordination, and schedule control.',
    highlights: ['Dispatch board', 'Flight readiness', 'Route monitoring'],
    accent: 'from-blue-600 to-cyan-500',
    workstreams: [
      { title: 'Dispatch board', detail: 'Monitoring departures, arrivals, and turnaround readiness across the airport.', status: 'Live' },
      { title: 'Weather coordination', detail: 'Updating flight plans and gate readiness based on changing airport conditions.', status: 'In progress' },
      { title: 'Turnaround monitoring', detail: 'Checking aircraft turnaround timing to keep slots on schedule.', status: 'Priority' },
    ],
  },
  'crew-management': {
    title: 'Crew Management Workspace',
    description: 'Crew assignments, availability, and duty coordination stay organized here.',
    highlights: ['Roster visibility', 'Crew availability', 'Duty handovers'],
    accent: 'from-purple-600 to-violet-500',
    workstreams: [
      { title: 'Crew pairing', detail: 'Assigning crews to upcoming rotations and standby duties for the airport schedule.', status: 'In progress' },
      { title: 'Availability checks', detail: 'Confirming duty limits, rest requirements, and replacement coverage.', status: 'Priority' },
      { title: 'Duty handover', detail: 'Preparing shift handovers for arriving and departing crew teams.', status: 'Scheduled' },
    ],
  },
  'fleet-management': {
    title: 'Fleet Management Workspace',
    description: 'Aircraft health, maintenance windows, and fleet readiness all in one space.',
    highlights: ['Aircraft status', 'Maintenance planning', 'Fleet utilization'],
    accent: 'from-emerald-600 to-green-500',
    workstreams: [
      { title: 'Aircraft availability', detail: 'Checking the fleet roster and aircraft readiness for the next operating window.', status: 'Live' },
      { title: 'Maintenance planning', detail: 'Scheduling checks, inspections, and turnaround support windows.', status: 'In progress' },
      { title: 'Utilization review', detail: 'Balancing aircraft deployment across routes and airport demand.', status: 'Priority' },
    ],
  },
  'route-planning': {
    title: 'Route Planning Center',
    description: 'Planning new services, constraints, and route performance insights.',
    highlights: ['Route analysis', 'Capacity planning', 'Performance trends'],
    accent: 'from-amber-600 to-orange-500',
    workstreams: [
      { title: 'Capacity planning', detail: 'Reviewing airport slot demand and route capacity for upcoming services.', status: 'In progress' },
      { title: 'Performance analysis', detail: 'Assessing route profitability, delays, and punctuality indicators.', status: 'Priority' },
      { title: 'Constraint review', detail: 'Checking restrictions, approvals, and operational limitations affecting service plans.', status: 'Scheduled' },
    ],
  },
  'maintenance': {
    title: 'Maintenance Operations',
    description: 'Work orders, aircraft checks, and maintenance scheduling are managed here.',
    highlights: ['Work orders', 'Inspection tracking', 'Maintenance logs'],
    accent: 'from-stone-600 to-zinc-500',
    workstreams: [
      { title: 'Open work orders', detail: 'Tracking urgent repairs, inspections, and aircraft release status.', status: 'Live' },
      { title: 'Inspection control', detail: 'Coordinating scheduled checks and service compliance tasks.', status: 'In progress' },
      { title: 'Log review', detail: 'Updating maintenance records and service history before the next dispatch window.', status: 'Priority' },
    ],
  },
  'finance': {
    title: 'Finance Operations',
    description: 'Financial operations, budgets, and reporting insights are surfaced for your team.',
    highlights: ['Budget review', 'Cost reporting', 'Financial trends'],
    accent: 'from-rose-600 to-pink-500',
    workstreams: [
      { title: 'Budget review', detail: 'Reviewing operating costs, fuel spend, and department allocations for the week.', status: 'In progress' },
      { title: 'Invoice reconciliation', detail: 'Matching airport and vendor charges to current financial records.', status: 'Priority' },
      { title: 'Cost reporting', detail: 'Preparing summaries for leadership on operating performance and variance.', status: 'Scheduled' },
    ],
  },
  'human-resource': {
    title: 'Human Resources Hub',
    description: 'Employee records, onboarding, and staffing visibility are streamlined here.',
    highlights: ['Staffing overview', 'Employee records', 'Onboarding workflow'],
    accent: 'from-indigo-600 to-blue-500',
    workstreams: [
      { title: 'Staffing readiness', detail: 'Matching team coverage to flight schedules and airport operating demands.', status: 'In progress' },
      { title: 'Onboarding workflow', detail: 'Supporting new staff onboarding and role setup for the current shift cycle.', status: 'Priority' },
      { title: 'Training compliance', detail: 'Tracking required certifications and training deadlines for frontline teams.', status: 'Scheduled' },
    ],
  },
  'customer-service': {
    title: 'Customer Service Desk',
    description: 'Passenger support requests and service escalations are coordinated from here.',
    highlights: ['Support queue', 'Escalations', 'Service insights'],
    accent: 'from-teal-600 to-cyan-500',
    workstreams: [
      { title: 'Passenger support', detail: 'Handling travel disruptions, rebooking requests, and on-the-ground assistance.', status: 'Live' },
      { title: 'Escalation handling', detail: 'Managing priority complaints and service recovery for affected travelers.', status: 'In progress' },
      { title: 'Service insights', detail: 'Reviewing recurring issues to improve the airport guest experience.', status: 'Priority' },
    ],
  },
  'security': {
    title: 'Security Operations',
    description: 'Security checks, incident monitoring, and access coordination for your team.',
    highlights: ['Incident tracking', 'Access monitoring', 'Risk visibility'],
    accent: 'from-red-600 to-rose-500',
    workstreams: [
      { title: 'Access control', detail: 'Monitoring secure entry points and verifying active airport access permissions.', status: 'Live' },
      { title: 'Incident monitoring', detail: 'Tracking security events and responding to urgent operational alerts.', status: 'In progress' },
      { title: 'Risk visibility', detail: 'Reviewing overnight and peak-hour security readiness across the terminal.', status: 'Priority' },
    ],
  },
  'cargo': {
    title: 'Cargo Operations Center',
    description: 'Cargo readiness, tracking, and team coordination for freight operations.',
    highlights: ['Cargo tracking', 'Load planning', 'Logistics updates'],
    accent: 'from-lime-600 to-green-500',
    workstreams: [
      { title: 'Load planning', detail: 'Preparing cargo assignments and loading priorities for outgoing flights.', status: 'In progress' },
      { title: 'Tracking updates', detail: 'Monitoring shipments, transfers, and arrival readiness across the airside network.', status: 'Live' },
      { title: 'Warehouse coordination', detail: 'Aligning storage, transfers, and handoff timing with airline operations.', status: 'Priority' },
    ],
  },
  'it': {
    title: 'IT Operations Center',
    description: 'Systems health, support requests, and technology coordination are managed here.',
    highlights: ['System health', 'Support requests', 'Platform updates'],
    accent: 'from-fuchsia-600 to-violet-500',
    workstreams: [
      { title: 'System monitoring', detail: 'Tracking critical platforms, check-in services, and internal operational tools.', status: 'Live' },
      { title: 'Support tickets', detail: 'Responding to user issues affecting airport operations and staff workflows.', status: 'In progress' },
      { title: 'Platform updates', detail: 'Rolling out maintenance and release changes while minimizing service disruption.', status: 'Priority' },
    ],
  },
  'operations-center': {
    title: 'Operations Center',
    description: 'A centralized workspace for leadership, coordination, and daily operations.',
    highlights: ['Cross-team visibility', 'Daily briefings', 'Priority review'],
    accent: 'from-sky-600 to-blue-500',
    workstreams: [
      { title: 'Daily briefing', detail: 'Reviewing the airport’s most important departures, disruptions, and priorities.', status: 'Live' },
      { title: 'Cross-team coordination', detail: 'Aligning leaders across operations, security, and customer service.', status: 'In progress' },
      { title: 'Priority review', detail: 'Tracking the highest-impact issues requiring immediate leadership attention.', status: 'Priority' },
    ],
  },
  'employee-portal': {
    title: 'Employee Portal',
    description: 'Your personal workspace for everyday tasks, updates, and requests.',
    highlights: ['Self-service', 'Notifications', 'Daily overview'],
    accent: 'from-violet-600 to-indigo-500',
    workstreams: [
      { title: 'Daily tasks', detail: 'Reviewing personal action items, shifts, and assigned work for the day.', status: 'In progress' },
      { title: 'Notifications', detail: 'Keeping up with schedule changes, approvals, and team updates.', status: 'Priority' },
      { title: 'Self-service requests', detail: 'Accessing forms and personal information updates without leaving the portal.', status: 'Scheduled' },
    ],
  },
};

const quickLinkIcons: Record<string, typeof Plane | typeof Users | typeof Bell | typeof BarChart3 | typeof Settings> = {
  '/flights': Plane,
  '/employees': Users,
  '/notifications': Bell,
  '/analytics': BarChart3,
  '/settings': Settings,
};

const quickLinks = [
  { href: '/flights', title: 'Flights', icon: Plane, description: 'Open flight operations' },
  { href: '/employees', title: 'Employees', icon: Users, description: 'View staff and team records' },
  { href: '/notifications', title: 'Notifications', icon: Bell, description: 'Review recent updates' },
  { href: '/analytics', title: 'Analytics', icon: BarChart3, description: 'Inspect performance metrics' },
];

const departmentSummaryCards: Record<string, DepartmentSummaryCard[]> = {
  administration: [
    { title: 'Leadership focus', value: '24 priorities', detail: 'Executive approvals and daily governance items.' },
    { title: 'Cross-team sync', value: '3 branches', detail: 'Coordination aligned across operations and support teams.' },
    { title: 'Decision load', value: 'High', detail: 'Leadership attention required for active airport issues.' },
  ],
  'flight-operations': [
    { title: 'Dispatch health', value: '12 departures', detail: 'Live departures and arrivals under active monitoring.' },
    { title: 'Turnaround pace', value: '18 ready', detail: 'Aircraft prepared for rapid turnarounds and slot protection.' },
    { title: 'Operational risk', value: 'Medium', detail: 'Weather and gate constraints require close oversight.' },
  ],
  'crew-management': [
    { title: 'Crew coverage', value: '8 shifts', detail: 'Duty and standby coverage currently being adjusted.' },
    { title: 'Rest compliance', value: '100%', detail: 'Crew limits are being checked before the next rotation.' },
    { title: 'Readiness level', value: 'Stable', detail: 'Assignments remain balanced across current demand.' },
  ],
  'fleet-management': [
    { title: 'Fleet readiness', value: '24 active', detail: 'Aircraft available for the next operating window.' },
    { title: 'Maintenance overlap', value: '6 items', detail: 'Open checks and release actions still pending.' },
    { title: 'Utilization', value: 'High', detail: 'Aircraft deployment remains tightly aligned with demand.' },
  ],
  'route-planning': [
    { title: 'Active routes', value: '18 live', detail: 'Current services being tracked for performance and capacity.' },
    { title: 'Slot review', value: '4 pending', detail: 'Capacity requests are awaiting coordination.' },
    { title: 'Punctuality', value: '92%', detail: 'Current service reliability is trending above target.' },
  ],
  maintenance: [
    { title: 'Work orders', value: '6 open', detail: 'Urgent inspections and repairs remain active.' },
    { title: 'Release checks', value: '2 due', detail: 'Aircraft awaiting clearance before returning to service.' },
    { title: 'Readiness', value: '18 cleared', detail: 'Aircraft confirmed ready for dispatch after checks.' },
  ],
  finance: [
    { title: 'Budget review', value: '4 active', detail: 'Department cost reviews are underway for the week.' },
    { title: 'Invoice matching', value: '12 pending', detail: 'Vendor and operating charges need reconciliation.' },
    { title: 'Cost posture', value: 'Controlled', detail: 'Spending remains within the current operating plan.' },
  ],
  'human-resource': [
    { title: 'Staffing needs', value: '7 items', detail: 'Coverage gaps and onboarding tasks are being managed.' },
    { title: 'Training status', value: '92%', detail: 'Required certifications are being tracked for the shift.' },
    { title: 'Support load', value: 'Moderate', detail: 'Staffing support remains active across departments.' },
  ],
  'customer-service': [
    { title: 'Guest demand', value: '11 escalations', detail: 'Current support needs remain concentrated on service recovery.' },
    { title: 'Response pace', value: 'Live', detail: 'Passenger support is being handled in real time.' },
    { title: 'Recovery focus', value: 'High', detail: 'Priority cases are being managed for travel disruption.' },
  ],
  security: [
    { title: 'Security alerts', value: '3 active', detail: 'Access and incident monitoring remain in view.' },
    { title: 'Access checks', value: '24 points', detail: 'Secure entry points are being reviewed across the terminal.' },
    { title: 'Readiness', value: 'High', detail: 'The airport remains prepared for peak operations.' },
  ],
  cargo: [
    { title: 'Cargo loads', value: '6 pending', detail: 'Outgoing freight assignments still need coordination.' },
    { title: 'Transfer status', value: 'Live', detail: 'Shipments are being tracked across the airside network.' },
    { title: 'Support level', value: 'Steady', detail: 'Warehouse handoffs remain aligned with operations.' },
  ],
  it: [
    { title: 'System health', value: '98.6%', detail: 'Platform uptime remains strong across core systems.' },
    { title: 'Support queue', value: '12 tickets', detail: 'User issues are being triaged for operations continuity.' },
    { title: 'Alert volume', value: '92', detail: 'Monitoring views remain active for critical services.' },
  ],
  'operations-center': [
    { title: 'Daily brief', value: 'Live', detail: 'The most urgent airport issues are being reviewed now.' },
    { title: 'Priority queue', value: '5 issues', detail: 'Leadership attention remains focused on critical items.' },
    { title: 'Coordination', value: 'Active', detail: 'Teams across the airport are aligned in the current shift.' },
  ],
  'employee-portal': [
    { title: 'Daily tasks', value: 'In progress', detail: 'Personal actions and assignments are ready for review.' },
    { title: 'Notifications', value: 'Pending', detail: 'Team updates and operational notices are available.' },
    { title: 'Self-service', value: 'Ready', detail: 'Staff can access the tools needed for everyday work.' },
  ],
};

export default function DepartmentPage() {
  const [, params] = useRoute('/department/:slug');
  const [, setLocation] = useLocation();
  const { profile } = useAuthContext();

  const slug = params?.slug || 'operations-center';
  const department = departmentConfig[slug] || departmentConfig['operations-center'];
  const departmentName = getDepartmentName(profile) || 'Operations';
  const roleName = getRoleName(profile) || 'Staff';
  const summaryCards = departmentSummaryCards[slug] || departmentSummaryCards['operations-center'];

  const accessibleQuickLinks = useMemo(() => {
    const accessibleItems = getAccessibleNavigationItems(profile).filter((item) =>
      ['/flights', '/employees', '/notifications', '/analytics'].includes(item.href),
    );

    if (!accessibleItems.length) {
      return quickLinks;
    }

    return accessibleItems.map((item) => ({
      href: item.href,
      title: item.label,
      icon: quickLinkIcons[item.href] ?? ArrowRight,
      description: `Open ${item.label.toLowerCase()}`,
    }));
  }, [profile]);

  const welcomeText = useMemo(() => {
    const normalizedRole = roleName.toLowerCase();
    if (normalizedRole.includes('admin') || normalizedRole.includes('super')) {
      return 'Leadership access is active for your team.';
    }
    if (normalizedRole.includes('manager')) {
      return 'Manager tools and departmental insights are ready.';
    }
    return 'Your department workspace has been prepared for day-to-day operations.';
  }, [roleName]);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-3">
            <div className={`inline-flex items-center gap-2 rounded-full bg-gradient-to-r ${department.accent} px-3 py-1 text-sm font-medium text-white`}>
              <Building2 className="h-4 w-4" />
              {departmentName}
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-foreground">{department.title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-muted-foreground">{department.description}</p>
            </div>
            <div className="flex flex-wrap gap-2">
              {department.highlights.map((item) => (
                <span key={item} className="rounded-full border border-border bg-muted/50 px-3 py-1 text-xs text-muted-foreground">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="rounded-xl border border-border bg-background/80 p-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2 font-medium text-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" />
              {roleName}
            </div>
            <p className="mt-2 max-w-xs">{welcomeText}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-gradient-to-br from-primary/10 via-background to-background p-6"
      >
        <div className="flex items-center gap-2 text-sm font-medium text-primary">
          <Sparkles className="h-4 w-4" />
          Personalized workspace
        </div>
        <h2 className="mt-3 text-xl font-semibold text-foreground">Welcome back, {profile?.full_name?.split(' ')[0] || 'there'}.</h2>
        <p className="mt-2 max-w-xl text-sm text-muted-foreground">
          You are currently viewing the {departmentName} experience. Use the quick links below to jump into the tools you need most.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setLocation('/dashboard')}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
          >
            Go to main dashboard
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              <Activity className="h-4 w-4" />
              Ongoing airport work
            </div>
            <h3 className="mt-1 text-lg font-semibold text-foreground">Current priorities for {departmentName}</h3>
            <p className="mt-1 text-sm text-muted-foreground">This workspace highlights the day-to-day responsibilities active in the airport environment.</p>
          </div>
          <div className="rounded-full border border-border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground">
            Live operations
          </div>
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-3">
          {summaryCards.map((card) => (
            <div key={card.title} className="rounded-xl border border-border bg-background/80 p-4">
              <p className="text-sm font-medium text-muted-foreground">{card.title}</p>
              <p className="mt-2 text-xl font-semibold text-foreground">{card.value}</p>
              <p className="mt-1 text-sm text-muted-foreground">{card.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-5 grid gap-3 xl:grid-cols-3">
          {department.workstreams.map((stream) => (
            <div key={stream.title} className="rounded-xl border border-border bg-background/80 p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-foreground">{stream.title}</p>
                <span className="rounded-full border border-border bg-muted px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-muted-foreground">
                  {stream.status}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">{stream.detail}</p>
            </div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border bg-card p-6"
      >
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">Quick links</h3>
        <div className="mt-4 space-y-3">
          {accessibleQuickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <Link key={item.href} href={item.href} className="block">
                <div className="rounded-xl border border-border p-3 transition hover:border-primary/50 hover:bg-muted/50">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-muted p-2">
                      <Icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.title}</p>
                      <p className="text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
