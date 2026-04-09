import { cn } from '../../utils/cn';

type BadgeVariant = 'green' | 'red' | 'yellow' | 'blue' | 'purple' | 'gray';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const variants: Record<BadgeVariant, string> = {
  green: 'badge-green',
  red: 'badge-red',
  yellow: 'badge-yellow',
  blue: 'badge-blue',
  purple: 'badge-purple',
  gray: 'badge bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
};

export function Badge({ children, variant = 'gray', className }: BadgeProps) {
  return (
    <span className={cn(variants[variant], className)}>
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, BadgeVariant> = {
    active: 'green',
    inactive: 'gray',
    suspended: 'red',
    paid: 'green',
    pending: 'yellow',
    overdue: 'red',
    partial: 'blue',
    pass: 'green',
    fail: 'red',
    upcoming: 'blue',
    ongoing: 'yellow',
    completed: 'purple',
  };
  return <Badge variant={map[status] ?? 'gray'}>{status}</Badge>;
}
