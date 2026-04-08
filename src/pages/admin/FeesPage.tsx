import { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, CheckCircle, Clock, AlertTriangle, TrendingUp } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { SearchInput } from '../../components/ui/SearchInput';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency, formatDate } from '../../utils/helpers';
import type { FeeRecord } from '../../types';

export function FeesPage() {
  const { fees, updateFee } = useDataStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedFee, setSelectedFee] = useState<FeeRecord | null>(null);
  const [markingPaid, setMarkingPaid] = useState(false);

  const totalAmount = fees.reduce((a, f) => a + f.amount, 0);
  const totalCollected = fees.reduce((a, f) => a + f.paid, 0);
  const totalPending = fees.reduce((a, f) => a + f.due, 0);
  const collectionRate = Math.round((totalCollected / totalAmount) * 100);

  const filtered = fees.filter((f) => {
    const q = search.toLowerCase();
    return (
      (!search || f.studentName.toLowerCase().includes(q) || f.rollNumber.toLowerCase().includes(q)) &&
      (statusFilter === 'All' || f.status === statusFilter)
    );
  });

  const handleMarkPaid = () => {
    if (!selectedFee) return;
    updateFee(selectedFee.id, {
      paid: selectedFee.amount,
      due: 0,
      status: 'paid',
      paidDate: new Date().toISOString().slice(0, 10),
      transactionId: `TXN${Date.now()}`,
    });
    setMarkingPaid(false);
    setSelectedFee(null);
  };

  const STATUS_ICONS = {
    paid: <CheckCircle className="w-4 h-4 text-emerald-500" />,
    pending: <Clock className="w-4 h-4 text-amber-500" />,
    overdue: <AlertTriangle className="w-4 h-4 text-red-500" />,
    partial: <TrendingUp className="w-4 h-4 text-brand-600" />,
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Fee Management</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track and manage student fee payments</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Billed', value: formatCurrency(totalAmount), icon: DollarSign, color: 'text-gray-600', bg: 'bg-gray-100 dark:bg-gray-800' },
          { label: 'Collected', value: formatCurrency(totalCollected), icon: CheckCircle, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Pending', value: formatCurrency(totalPending), icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
          { label: 'Collection Rate', value: `${collectionRate}%`, icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-4 flex items-center gap-3"
          >
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${item.bg}`}>
              <item.icon className={`w-5 h-5 ${item.color}`} />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{item.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name or roll no..." className="flex-1" />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto text-sm">
          {['All', 'paid', 'pending', 'overdue', 'partial'].map((s) => <option key={s}>{s}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={DollarSign} title="No fee records found" />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  {['Student', 'Semester', 'Amount', 'Paid', 'Due', 'Due Date', 'Status', 'Action'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {filtered.map((f, i) => (
                  <motion.tr
                    key={f.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.03 }}
                    className="table-row-hover"
                  >
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{f.studentName}</p>
                      <p className="text-xs text-gray-400 font-mono">{f.rollNumber}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{f.semester}</td>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(f.amount)}</td>
                    <td className="px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">{formatCurrency(f.paid)}</td>
                    <td className="px-4 py-3 text-sm text-red-500 font-medium">{f.due > 0 ? formatCurrency(f.due) : '—'}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(f.dueDate)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {STATUS_ICONS[f.status]}
                        <StatusBadge status={f.status} />
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      {f.status !== 'paid' && (
                        <button
                          onClick={() => { setSelectedFee(f); setMarkingPaid(true); }}
                          className="text-xs btn-primary py-1 px-2.5"
                        >
                          Mark Paid
                        </button>
                      )}
                      {f.status === 'paid' && f.transactionId && (
                        <span className="text-xs text-gray-400 font-mono">{f.transactionId}</span>
                      )}
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Mark Paid Modal */}
      <Modal
        open={markingPaid}
        onClose={() => { setMarkingPaid(false); setSelectedFee(null); }}
        title="Mark Fee as Paid"
        size="sm"
        footer={
          <>
            <button onClick={() => setMarkingPaid(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleMarkPaid} className="btn-primary">Confirm Payment</button>
          </>
        }
      >
        {selectedFee && (
          <div className="space-y-3">
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-xl space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Student</span>
                <span className="font-medium text-gray-900 dark:text-white">{selectedFee.studentName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Amount Due</span>
                <span className="font-semibold text-red-500">{formatCurrency(selectedFee.due)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 dark:text-gray-400">Total Amount</span>
                <span className="font-semibold text-gray-900 dark:text-white">{formatCurrency(selectedFee.amount)}</span>
              </div>
            </div>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              This will mark the full amount as collected and generate a transaction ID.
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
}
