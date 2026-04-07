import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, TrendingUp, TrendingDown, Users } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { Avatar } from '../../components/ui/Avatar';
import { SearchInput } from '../../components/ui/SearchInput';
import { getAttendanceColor } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { ATTENDANCE_OVERVIEW } from '../../data/mockData';

export function AttendancePage() {
  const { students, attendance } = useDataStore();
  const [search, setSearch] = useState('');

  // Build per-student attendance summary
  const summaries = students.map((s) => {
    const records = attendance.filter((a) => a.studentId === s.id);
    const total = records.length;
    const present = records.filter((a) => a.status === 'present').length;
    const absent = records.filter((a) => a.status === 'absent').length;
    const late = records.filter((a) => a.status === 'late').length;
    const pct = total > 0 ? Math.round((present / total) * 100) : 0;
    return { student: s, total, present, absent, late, pct };
  });

  const filtered = summaries.filter((s) => {
    const q = search.toLowerCase();
    return !search || s.student.name.toLowerCase().includes(q) || s.student.rollNumber.toLowerCase().includes(q);
  });

  const avgPct = Math.round(summaries.reduce((a, s) => a + s.pct, 0) / summaries.length);
  const below75 = summaries.filter((s) => s.pct < 75).length;
  const above90 = summaries.filter((s) => s.pct >= 90).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track and monitor student attendance across courses</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Average Attendance', value: `${avgPct}%`, icon: CalendarCheck, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Total Records', value: attendance.length, icon: Users, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
          { label: 'Above 90%', value: above90, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Below 75%', value: below75, icon: TrendingDown, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20' },
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

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-5"
      >
        <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Attendance by Course</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={ATTENDANCE_OVERVIEW} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => [`${v}%`]} />
            <Legend />
            <Bar dataKey="present" name="Present %" fill="#10b981" radius={[3, 3, 0, 0]} />
            <Bar dataKey="absent" name="Absent %" fill="#ef4444" radius={[3, 3, 0, 0]} />
            <Bar dataKey="late" name="Late %" fill="#f59e0b" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Student-wise Table */}
      <div className="card">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white">Student-wise Attendance</h3>
          <SearchInput value={search} onChange={setSearch} placeholder="Search..." className="w-48" />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-800/50">
                {['Student', 'Present', 'Absent', 'Late', 'Total', 'Attendance %'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
              {filtered.map(({ student, present, absent, late, total, pct }, i) => (
                <motion.tr
                  key={student.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="table-row-hover"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={student.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                        <p className="text-xs text-gray-400">{student.rollNumber}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-emerald-600 dark:text-emerald-400 font-medium">{present}</td>
                  <td className="px-4 py-3 text-sm text-red-500 font-medium">{absent}</td>
                  <td className="px-4 py-3 text-sm text-amber-500 font-medium">{late}</td>
                  <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{total}</td>
                  <td className="px-4 py-3 min-w-32">
                    <div className="flex items-center gap-2">
                      <ProgressBar value={pct} showValue={false} size="sm" color="brand" />
                      <span className={`text-xs font-semibold whitespace-nowrap ${getAttendanceColor(pct)}`}>{pct}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
