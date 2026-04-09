import { cn } from '../../utils/cn';

interface ProgressBarProps {
  value: number;
  max?: number;
  label?: string;
  showValue?: boolean;
  size?: 'sm' | 'md';
  color?: 'brand' | 'green' | 'yellow' | 'red';
}

const colorMap = {
  brand: 'bg-brand-500',
  green: 'bg-emerald-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
};

export function ProgressBar({ value, max = 100, label, showValue = false, size = 'sm', color = 'brand' }: ProgressBarProps) {
  const pct = Math.min(100, Math.round((value / max) * 100));

  const barColor = pct >= 80 ? colorMap.green : pct >= 60 ? colorMap.yellow : colorMap.red;

  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1">
          {label && <span className="text-xs text-gray-500 dark:text-gray-400">{label}</span>}
          {showValue && <span className="text-xs font-medium text-gray-700 dark:text-gray-300">{pct}%</span>}
        </div>
      )}
      <div className={cn('w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden', size === 'sm' ? 'h-1.5' : 'h-2.5')}>
        <div
          className={cn('h-full rounded-full transition-all duration-500', color === 'brand' ? colorMap.brand : barColor)}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
