import { motion } from 'framer-motion';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  positive?: boolean;
  icon: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  delay?: number;
}

export function StatCard({
  title, value, change, positive = true,
  icon: Icon, iconColor = 'text-brand-600', iconBg = 'bg-brand-50 dark:bg-brand-900/20',
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay }}
      className="card-hover p-6"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">{title}</p>
          <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white tracking-tight">{value}</p>
          {change && (
            <p className={cn('mt-1 text-xs font-medium', positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500')}>
              {positive ? '↑' : '↓'} {change}
            </p>
          )}
        </div>
        <div className={cn('p-3 rounded-xl flex-shrink-0', iconBg)}>
          <Icon className={cn('w-6 h-6', iconColor)} />
        </div>
      </div>
    </motion.div>
  );
}
