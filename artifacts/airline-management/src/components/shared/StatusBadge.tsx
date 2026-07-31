import { cn } from '@/lib/utils';

type FlightStatus = 'scheduled' | 'boarding' | 'departed' | 'arrived' | 'delayed' | 'cancelled' | 'diverted';
type EmployeeStatus = 'active' | 'suspended' | 'terminated' | 'on_leave';
type AircraftStatus = 'active' | 'maintenance' | 'grounded' | 'retired';

interface StatusBadgeProps {
  status: FlightStatus | EmployeeStatus | AircraftStatus | string;
  type?: 'flight' | 'employee' | 'aircraft';
}

export function StatusBadge({ status, type = 'flight' }: StatusBadgeProps) {
  const getStyles = () => {
    if (type === 'flight') {
      switch (status as FlightStatus) {
        case 'scheduled':
          return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
        case 'boarding':
          return 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300';
        case 'departed':
          return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
        case 'arrived':
          return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        case 'delayed':
          return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300';
        case 'cancelled':
          return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
        case 'diverted':
          return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300';
        default:
          return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      }
    }

    if (type === 'employee') {
      switch (status as EmployeeStatus) {
        case 'active':
          return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
        case 'suspended':
          return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300';
        case 'terminated':
          return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
        case 'on_leave':
          return 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300';
        default:
          return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      }
    }

    if (type === 'aircraft') {
      switch (status as AircraftStatus) {
        case 'active':
          return 'bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300';
        case 'maintenance':
          return 'bg-orange-100 text-orange-700 dark:bg-orange-950 dark:text-orange-300';
        case 'grounded':
          return 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300';
        case 'retired':
          return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
        default:
          return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
      }
    }

    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors',
        getStyles()
      )}
      data-testid={`badge-status-${status}`}
    >
      {status.replace(/_/g, ' ')}
    </span>
  );
}
