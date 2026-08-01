import {
  Bell,
  Building2,
  CircleDollarSign,
  ClipboardList,
  HardHat,
  Map,
  Plane,
  ShieldCheck,
  Users,
  Wrench,
} from 'lucide-react';

export type DepartmentCard = {
  slug: string;
  name: string;
  description: string;
  panelFocus: string;
  panelMetric: string;
  accent: string;
  icon: typeof Building2;
  highlights: string[];
  airportActivity: Array<{
    title: string;
    detail: string;
    status: string;
  }>;
};

export const departmentCards: DepartmentCard[] = [
  {
    slug: 'administration',
    name: 'Administration',
    description: 'Leadership coordination, approvals, and daily airport governance.',
    panelFocus: 'Executive oversight',
    panelMetric: '24 leadership priorities',
    accent: 'from-slate-600 to-slate-500',
    icon: Building2,
    highlights: ['Executive approvals', 'Policy alignment', 'Branch coordination'],
    airportActivity: [
      { title: 'Daily leadership brief', detail: 'Reviewing critical airport priorities and operational disruptions.', status: 'Live' },
      { title: 'Governance review', detail: 'Approving policy updates and cross-team decisions before the next shift.', status: 'Priority' },
    ],
  },
  {
    slug: 'flight-operations',
    name: 'Flight Operations',
    description: 'Dispatch oversight, schedules, and live flight readiness.',
    panelFocus: 'Flight readiness',
    panelMetric: '12 departures tracked',
    accent: 'from-blue-600 to-cyan-500',
    icon: Plane,
    highlights: ['Dispatch coordination', 'Turnaround monitoring', 'Schedule protection'],
    airportActivity: [
      { title: 'Departure board', detail: 'Monitoring departures, arrivals, and gate readiness across the terminal.', status: 'Live' },
      { title: 'Turnaround pacing', detail: 'Protecting slot timing for aircraft turnarounds and transfer connections.', status: 'Priority' },
    ],
  },
  {
    slug: 'crew-management',
    name: 'Crew Management',
    description: 'Staff assignments, crew availability, and duty planning.',
    panelFocus: 'Crew availability',
    panelMetric: '8 duty changes',
    accent: 'from-purple-600 to-violet-500',
    icon: Users,
    highlights: ['Crew pairing', 'Duty handovers', 'Rest checks'],
    airportActivity: [
      { title: 'Crew pairing', detail: 'Assigning crews to upcoming rotations and standby duties for the airport schedule.', status: 'In progress' },
      { title: 'Rest compliance', detail: 'Ensuring duty limits and replacement coverage are clear for the next shift.', status: 'Priority' },
    ],
  },
  {
    slug: 'fleet-management',
    name: 'Fleet Management',
    description: 'Aircraft availability and fleet utilization planning.',
    panelFocus: 'Aircraft availability',
    panelMetric: '24 aircraft active',
    accent: 'from-emerald-600 to-green-500',
    icon: Plane,
    highlights: ['Fleet readiness', 'Aircraft utilization', 'Maintenance coordination'],
    airportActivity: [
      { title: 'Fleet readiness', detail: 'Checking aircraft availability for the next operating window.', status: 'Live' },
      { title: 'Utilization review', detail: 'Balancing aircraft deployment across routes and demand.', status: 'Priority' },
    ],
  },
  {
    slug: 'route-planning',
    name: 'Route Planning',
    description: 'Network planning, slot review, and route performance insight.',
    panelFocus: 'Route capacity',
    panelMetric: '18 active routes',
    accent: 'from-amber-600 to-orange-500',
    icon: Map,
    highlights: ['Slot planning', 'Demand review', 'Punctuality tracking'],
    airportActivity: [
      { title: 'Capacity planning', detail: 'Reviewing routes against airport slot demands and operational constraints.', status: 'In progress' },
      { title: 'Performance trends', detail: 'Tracking service reliability and punctuality across current routes.', status: 'Priority' },
    ],
  },
  {
    slug: 'maintenance',
    name: 'Maintenance',
    description: 'Aircraft inspections, work orders, and maintenance execution.',
    panelFocus: 'Maintenance queue',
    panelMetric: '6 open work orders',
    accent: 'from-stone-600 to-zinc-500',
    icon: Wrench,
    highlights: ['Work orders', 'Inspection control', 'Log review'],
    airportActivity: [
      { title: 'Open work orders', detail: 'Tracking urgent repairs, inspections, and aircraft release status.', status: 'Live' },
      { title: 'Inspection control', detail: 'Coordinating check cycles before the next departure window.', status: 'Priority' },
    ],
  },
  {
    slug: 'finance',
    name: 'Finance',
    description: 'Budget review, cost reporting, and financial oversight.',
    panelFocus: 'Budget health',
    panelMetric: '4 cost reviews',
    accent: 'from-rose-600 to-pink-500',
    icon: CircleDollarSign,
    highlights: ['Budget reporting', 'Invoice review', 'Cost variance'],
    airportActivity: [
      { title: 'Budget review', detail: 'Reviewing weekly operating costs and department allocations.', status: 'In progress' },
      { title: 'Invoice reconciliation', detail: 'Matching airport and vendor charges to the current ledger.', status: 'Priority' },
    ],
  },
  {
    slug: 'human-resource',
    name: 'Human Resources',
    description: 'Staffing readiness, certifications, and employee coordination.',
    panelFocus: 'Staffing readiness',
    panelMetric: '7 training items',
    accent: 'from-indigo-600 to-blue-500',
    icon: Users,
    highlights: ['Staffing', 'Onboarding', 'Training tracking'],
    airportActivity: [
      { title: 'Staffing readiness', detail: 'Matching team coverage to current airport operations demand.', status: 'In progress' },
      { title: 'Training compliance', detail: 'Tracking certifications and required airport readiness training.', status: 'Priority' },
    ],
  },
  {
    slug: 'customer-service',
    name: 'Customer Service',
    description: 'Passenger support, service recovery, and guest issues.',
    panelFocus: 'Passenger support',
    panelMetric: '11 escalations',
    accent: 'from-teal-600 to-cyan-500',
    icon: Bell,
    highlights: ['Guest support', 'Escalations', 'Service recovery'],
    airportActivity: [
      { title: 'Passenger support', detail: 'Responding to travel disruptions and guest issues on the ground.', status: 'Live' },
      { title: 'Escalation handling', detail: 'Managing service recovery where delays or disruptions affect travelers.', status: 'Priority' },
    ],
  },
  {
    slug: 'security',
    name: 'Security',
    description: 'Access control, incident coordination, and security readiness.',
    panelFocus: 'Security readiness',
    panelMetric: '3 active alerts',
    accent: 'from-red-600 to-rose-500',
    icon: ShieldCheck,
    highlights: ['Access control', 'Incident response', 'Risk monitoring'],
    airportActivity: [
      { title: 'Access control', detail: 'Monitoring secure points and active airport access permissions.', status: 'Live' },
      { title: 'Incident monitoring', detail: 'Tracking alerts and fast-response activity across the terminal.', status: 'Priority' },
    ],
  },
  {
    slug: 'cargo',
    name: 'Cargo',
    description: 'Cargo readiness, tracking, and load coordination.',
    panelFocus: 'Cargo movement',
    panelMetric: '6 loads pending',
    accent: 'from-lime-600 to-green-500',
    icon: ClipboardList,
    highlights: ['Cargo tracking', 'Load planning', 'Warehouse handoffs'],
    airportActivity: [
      { title: 'Load planning', detail: 'Preparing cargo assignments for outgoing flights and transfers.', status: 'In progress' },
      { title: 'Tracking updates', detail: 'Monitoring freight transfers and arrival readiness.', status: 'Priority' },
    ],
  },
  {
    slug: 'it',
    name: 'IT',
    description: 'Platform uptime, support desks, and airport systems coordination.',
    panelFocus: 'System monitoring',
    panelMetric: '92 alerts',
    accent: 'from-fuchsia-600 to-violet-500',
    icon: HardHat,
    highlights: ['System monitoring', 'Support tickets', 'Platform updates'],
    airportActivity: [
      { title: 'System monitoring', detail: 'Tracking key airport platforms and support services.', status: 'Live' },
      { title: 'Support tickets', detail: 'Responding to user issues affecting daily operations.', status: 'Priority' },
    ],
  },
];

export const airportOperationsSummary = [
  { title: 'Aircraft', value: '24 active', detail: 'Fleet availability and turnaround status' },
  { title: 'Routes', value: '18 live', detail: 'Operational routes and performance tracking' },
  { title: 'Maintenance', value: '6 open', detail: 'Open work orders and inspections' },
  { title: 'System Logs', value: '92 alerts', detail: 'Recent events and operational notifications' },
];
