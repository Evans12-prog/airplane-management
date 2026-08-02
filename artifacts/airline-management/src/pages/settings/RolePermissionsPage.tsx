import { ShieldCheck, Sparkles, Eye, Lock, Users, Plane, Wrench, BarChart3, AlertTriangle, BadgeCheck } from 'lucide-react';

const roleCards = [
  {
    title: 'Super Admin',
    badge: 'Full access',
    summary: 'Complete platform control for the airline operations suite.',
    examples: [
      'Dashboard with company overview, analytics, flight statistics, revenue, delays, and system health.',
      'Manage all employees, roles, departments, flights, aircraft, routes, maintenance, notifications, and logs.',
      'Change settings and back up data.',
    ],
    cannot: ['No restrictions — full administrative control.'],
    icon: ShieldCheck,
  },
  {
    title: 'Airline Manager',
    badge: 'Leadership',
    summary: 'Views the full airline picture without changing core system settings.',
    examples: [
      'Review overall airline performance, flight activity, delays, revenue, and fleet status.',
      'View reports, analytics, employee performance, and maintenance summaries.',
      'Approve major requests across departments.',
    ],
    cannot: ['Delete users', 'Change system settings'],
    icon: Sparkles,
  },
  {
    title: 'HR Manager',
    badge: 'People operations',
    summary: 'Owns the employee lifecycle and workforce administration.',
    examples: [
      'Register employees, edit details, suspend or transfer staff, and manage leave.',
      'Track attendance, training records, and performance reviews.',
    ],
    cannot: ['Manage aircraft', 'Schedule flights'],
    icon: Users,
  },
  {
    title: 'Operations Manager',
    badge: 'Flight control',
    summary: 'Coordinates schedules and day-of-operations activity.',
    examples: [
      'Schedule flights, edit flight schedules, assign gates, and monitor active flights.',
      'Handle delays and produce operational flight reports.',
    ],
    cannot: ['Manage employee records beyond operational workflows'],
    icon: Plane,
  },
  {
    title: 'Crew Manager',
    badge: 'Crew planning',
    summary: 'Plans crew availability and operational staffing.',
    examples: [
      'Assign pilots and cabin crew, review licenses, training records, and medical certificates.',
      'Manage shift schedules and leave requests.',
    ],
    cannot: ['Control fleet assets or route creation'],
    icon: BadgeCheck,
  },
  {
    title: 'Fleet Manager',
    badge: 'Asset oversight',
    summary: 'Maintains fleet readiness and aircraft lifecycle records.',
    examples: [
      'Add, edit, and retire aircraft; review maintenance history and inspections.',
      'Monitor fuel status and fleet utilization.',
    ],
    cannot: ['Manage route planning workflows'],
    icon: Plane,
  },
  {
    title: 'Route Planner',
    badge: 'Network design',
    summary: 'Builds and updates the airline network.',
    examples: [
      'Create, edit, and remove routes; calculate distances and flight durations.',
      'Review airport information and route profitability.',
    ],
    cannot: ['Operate maintenance scheduling'],
    icon: Map,
  },
  {
    title: 'Maintenance Officer',
    badge: 'Aircraft upkeep',
    summary: 'Keeps aircraft safe and serviceable.',
    examples: [
      'Schedule maintenance, update repair status, record inspections, and log replacement parts.',
      'Track aircraft service history and maintenance due items.',
    ],
    cannot: ['Manage employee roles or full financial reports'],
    icon: Wrench,
  },
  {
    title: 'Finance Officer',
    badge: 'Financial control',
    summary: 'Oversees budgets, payroll, and airline profitability.',
    examples: [
      'Review revenue, expenses, payroll, fuel costs, budgets, taxes, and flight profitability.',
      'Prepare financial reports for leadership.',
    ],
    cannot: ['Edit flights', 'Manage employees'],
    icon: BarChart3,
  },
  {
    title: 'Customer Service Officer',
    badge: 'Passenger support',
    summary: 'Handles escalations and passenger care.',
    examples: [
      'Manage complaints, refund requests, lost baggage, feedback, and customer communication.',
      'Monitor service issues and support recovery workflows.',
    ],
    cannot: ['Access full fleet or flight scheduling tools'],
    icon: Eye,
  },
  {
    title: 'Security Officer',
    badge: 'Risk & access',
    summary: 'Monitors security and system activity.',
    examples: [
      'Review security alerts, login history, incident reports, and employee access logs.',
      'Coordinate incident management and system activity review.',
    ],
    cannot: ['Edit operational schedules or employee records'],
    icon: AlertTriangle,
  },
  {
    title: 'Employee',
    badge: 'Personal workspace',
    summary: 'Access is scoped to personal work and self-service tasks.',
    examples: [
      'View and edit personal profile, change password, review work schedule, and submit leave requests.',
      'See notifications and assigned flights when relevant.',
    ],
    cannot: ['Access other employees\' information', 'Modify company data', 'Access reports or analytics outside their own work'],
    icon: Lock,
  },
];

export default function RolePermissionsPage() {
  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-primary">Role & Permissions</p>
            <h2 className="mt-2 text-2xl font-semibold text-foreground">Permission examples for the airline operations portal</h2>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
              These examples mirror the access pattern used in the admin experience and are available in the hosted Vercel build via the new Role & Permissions section.
            </p>
          </div>
          <div className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
            Visible in production
          </div>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        {roleCards.map((role) => {
          const Icon = role.icon;
          return (
            <div key={role.title} className="rounded-2xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-primary/10 p-2 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{role.title}</h3>
                    <p className="text-sm text-muted-foreground">{role.badge}</p>
                  </div>
                </div>
              </div>

              <p className="mt-4 text-sm text-muted-foreground">{role.summary}</p>

              <div className="mt-4 space-y-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Examples</p>
                  <ul className="mt-2 space-y-2 text-sm text-foreground">
                    {role.examples.map((item) => (
                      <li key={item} className="flex gap-2">
                        <span className="mt-1 h-2 w-2 rounded-full bg-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">Cannot</p>
                  <p className="mt-2 text-sm text-muted-foreground">{role.cannot[0]}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
