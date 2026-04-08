import { getInitials } from '../../utils/helpers';
import { cn } from '../../utils/cn';

interface AvatarProps {
  name: string;
  src?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
  xl: 'w-16 h-16 text-lg',
};

const colors = [
  'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300',
  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
  'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
  'bg-rose-100 text-rose-700 dark:bg-rose-900/50 dark:text-rose-300',
  'bg-brand-100 text-brand-700 dark:bg-brand-900/50 dark:text-brand-300',
];

export function Avatar({ name, src, size = 'md', className }: AvatarProps) {
  const colorIdx = name.charCodeAt(0) % colors.length;
  const colorClass = colors[colorIdx];

  if (src) {
    return (
      <img
        src={src}
        alt={name}
        className={cn('rounded-full object-cover flex-shrink-0', sizeMap[size], className)}
        onError={(e) => {
          e.currentTarget.style.display = 'none';
        }}
      />
    );
  }

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold flex-shrink-0',
        sizeMap[size],
        colorClass,
        className
      )}
    >
      {getInitials(name)}
    </div>
  );
}
