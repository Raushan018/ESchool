import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { ProgressBar } from '../../components/ui/ProgressBar';

export function StudentFeesPage() {
  const { user } = useAuthStore();
  const { fees } = useDataStore();

  const myFees = fees.filter((f) => f.studentId === user?.id);
  const totalAmount = myFees.reduce((a, f) => a + f.amount, 0);
  const totalPaid = myFees.reduce((a, f) => a + f.paid, 0);
  const totalDue = myFees.reduce((a, f) => a + f.due, 0);
  const paymentPct = totalAmount > 0 ? Math.round((totalPaid / totalAmount) * 100) : 0;

  const STATUS_CONFIG = {
    paid: { icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
    pending: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
    overdue: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
    partial: { icon: DollarSign, color: 'text-blue-600', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Status</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Your fee payment history and dues</p>
      </div>

      {myFees.length === 0 ? (
        <div className="card">
          <EmptyState icon={DollarSign} title="No fee records" description="No fee records found for your account." />
        </div>
      ) : (
        <>
          {/* Summary Card */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`card p-6 ${totalDue > 0 ? 'border-l-4 border-l-amber-400' : 'border-l-4 border-l-emerald-400'}`}
          >
            <div className="flex flex-col lg:flex-row lg:items-center gap-6">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Payment Overview</h3>
                <div className="flex items-center gap-3 mb-3">
                  <span className={`text-3xl font-black ${totalDue > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {paymentPct}%
                  </span>
                  <span className="text-sm text-gray-500 dark:text-gray-400">paid</span>
                </div>
                <ProgressBar value={paymentPct} size="md" color={totalDue > 0 ? 'yellow' : 'green'} />
              </div>

              <div className="flex gap-6 lg:border-l lg:border-gray-100 lg:dark:border-gray-800 lg:pl-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Total</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-600">{formatCurrency(totalPaid)}</p>
                  <p className="text-xs text-gray-400 mt-0.5">Paid</p>
                </div>
                {totalDue > 0 && (
                  <div className="text-center">
                    <p className="text-2xl font-bold text-red-500">{formatCurrency(totalDue)}</p>
                    <p className="text-xs text-gray-400 mt-0.5">Due</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Fee Records */}
          <div className="space-y-3">
            {myFees.map((fee, i) => {
              const config = STATUS_CONFIG[fee.status];
              const Icon = config.icon;
              return (
                <motion.div
                  key={fee.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="card-hover p-5"
                >
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl flex-shrink-0 ${config.bg}`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">{fee.feeType}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{fee.semester}</p>
                        </div>
                        <StatusBadge status={fee.status} />
                      </div>

                      <div className="mt-3 grid grid-cols-2 lg:grid-cols-4 gap-3 text-sm">
                        <div>
                          <p className="text-xs text-gray-400">Total Amount</p>
                          <p className="font-semibold text-gray-900 dark:text-white">{formatCurrency(fee.amount)}</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-400">Paid</p>
                          <p className="font-semibold text-emerald-600">{formatCurrency(fee.paid)}</p>
                        </div>
                        {fee.due > 0 && (
                          <div>
                            <p className="text-xs text-gray-400">Balance Due</p>
                            <p className="font-semibold text-red-500">{formatCurrency(fee.due)}</p>
                          </div>
                        )}
                        <div>
                          <p className="text-xs text-gray-400">Due Date</p>
                          <p className="font-semibold text-gray-700 dark:text-gray-300">{formatDate(fee.dueDate)}</p>
                        </div>
                      </div>

                      {fee.status !== 'paid' && fee.due > 0 && (
                        <div className="mt-3">
                          <button className="btn-primary text-sm py-2 px-4">
                            Pay Now — {formatCurrency(fee.due)}
                          </button>
                        </div>
                      )}

                      {fee.paidDate && (
                        <p className="mt-2 text-xs text-gray-400">
                          Paid on {formatDate(fee.paidDate)}
                          {fee.transactionId && ` · Txn: ${fee.transactionId}`}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
