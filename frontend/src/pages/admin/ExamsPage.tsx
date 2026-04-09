import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Trophy, Users, Clock, BarChart3 } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/helpers';
import { PERFORMANCE_DATA } from '../../data/mockData';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';

export function ExamsPage() {
  const { exams, results, students } = useDataStore();
  const [activeTab, setActiveTab] = useState<'exams' | 'results' | 'analytics'>('exams');

  const totalPassed = results.filter((r) => r.status === 'pass').length;
  const avgScore = results.length
    ? Math.round(results.reduce((a, r) => a + r.percentage, 0) / results.length)
    : 0;

  const TABS = [
    { id: 'exams' as const, label: 'Exams', count: exams.length },
    { id: 'results' as const, label: 'Results', count: results.length },
    { id: 'analytics' as const, label: 'Analytics', count: null },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Exams & Results</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Manage examinations and view performance analytics</p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Exams', value: exams.length, icon: FileText, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Results Published', value: results.length, icon: Trophy, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Pass Count', value: totalPassed, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Average Score', value: `${avgScore}%`, icon: BarChart3, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
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
              <p className="text-xl font-bold text-gray-900 dark:text-white">{item.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{item.label}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 rounded-xl p-1 w-fit">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all border ${
              activeTab === tab.id
                ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm border-brand-600'
                : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent hover:border-brand-600 hover:bg-white dark:hover:bg-gray-800'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400' : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'}`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Exams Tab */}
      {activeTab === 'exams' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {exams.length === 0 ? (
            <div className="card lg:col-span-2">
              <EmptyState icon={FileText} title="No exams scheduled" />
            </div>
          ) : exams.map((exam, i) => (
            <motion.div
              key={exam.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card-hover p-5"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <StatusBadge status={exam.status} />
                    <span className="badge-gray capitalize">{exam.type}</span>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">{exam.title}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{exam.courseName}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-lg font-bold text-gray-900 dark:text-white">{exam.totalMarks}</p>
                  <p className="text-xs text-gray-400">total marks</p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                <div>
                  <p className="text-gray-400">Date</p>
                  <p className="font-medium text-gray-700 dark:text-gray-300 mt-0.5">{formatDate(exam.date)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Duration</p>
                  <p className="font-medium text-gray-700 dark:text-gray-300 mt-0.5 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {exam.duration} min
                  </p>
                </div>
                <div>
                  <p className="text-gray-400">Passing</p>
                  <p className="font-medium text-gray-700 dark:text-gray-300 mt-0.5">{exam.passingMarks} marks</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Results Tab */}
      {activeTab === 'results' && (
        <div className="card overflow-hidden">
          {results.length === 0 ? (
            <EmptyState icon={Trophy} title="No results available" />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800/50">
                    {['Student', 'Exam', 'Marks', 'Percentage', 'Grade', 'Status', 'Date'].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                  {results.map((r, i) => {
                    const student = students.find((s) => s.id === r.studentId);
                    return (
                      <motion.tr
                        key={r.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.03 }}
                        className="table-row-hover"
                      >
                        <td className="px-4 py-3 text-sm font-medium text-gray-900 dark:text-white">{student?.name || 'Unknown'}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{r.examTitle}</td>
                        <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{r.marksObtained}/{r.totalMarks}</td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-semibold ${r.percentage >= 80 ? 'text-emerald-600' : r.percentage >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                            {r.percentage}%
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span className={`text-sm font-bold ${r.percentage >= 80 ? 'text-emerald-600' : r.percentage >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                            {r.grade}
                          </span>
                        </td>
                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{formatDate(r.submittedAt)}</td>
                      </motion.tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {activeTab === 'analytics' && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-5"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Performance Analytics by Subject</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={PERFORMANCE_DATA} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
              <XAxis dataKey="subject" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}`} />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg" name="Average Score" fill="#1a3a6b" radius={[3, 3, 0, 0]} />
              <Bar dataKey="highest" name="Highest Score" fill="#10b981" radius={[3, 3, 0, 0]} />
              <Bar dataKey="passing" name="Pass Rate %" fill="#f59e0b" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      )}
    </div>
  );
}
