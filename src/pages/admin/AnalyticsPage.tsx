import { motion } from 'framer-motion';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell,
} from 'recharts';
import { formatCurrency } from '../../utils/helpers';
import {
  ENROLLMENT_TREND, REVENUE_DATA, DEPARTMENT_DISTRIBUTION,
  ATTENDANCE_OVERVIEW, PERFORMANCE_DATA,
} from '../../data/mockData';

export function AnalyticsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Comprehensive institute performance overview</p>
      </div>

      {/* Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Enrollment Growth</h3>
          <p className="text-xs text-gray-400 mb-4">Monthly student enrollment</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ENROLLMENT_TREND} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="c1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip />
              <Area type="monotone" dataKey="students" stroke="#6366f1" strokeWidth={2} fill="url(#c1)" name="Students" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Revenue Trend</h3>
          <p className="text-xs text-gray-400 mb-4">Monthly revenue vs expenses (₹)</p>
          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v))]} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} dot={false} name="Revenue" />
              <Line type="monotone" dataKey="expenses" stroke="#10b981" strokeWidth={2.5} dot={false} name="Expenses" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5 lg:col-span-2">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Course Performance</h3>
          <p className="text-xs text-gray-400 mb-4">Average, highest and pass rate by subject</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={PERFORMANCE_DATA} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
              <XAxis dataKey="subject" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Bar dataKey="avg" name="Average %" fill="#6366f1" radius={[3, 3, 0, 0]} />
              <Bar dataKey="passing" name="Pass Rate %" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Students by Dept</h3>
          <p className="text-xs text-gray-400 mb-4">Department-wise distribution</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={DEPARTMENT_DISTRIBUTION} cx="50%" cy="50%" outerRadius={70} dataKey="value" paddingAngle={3}>
                {DEPARTMENT_DISTRIBUTION.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} students`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-2 mt-2">
            {DEPARTMENT_DISTRIBUTION.map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600 dark:text-gray-400">{d.name}</span>
                </div>
                <span className="font-semibold text-gray-900 dark:text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Row 3 */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card p-5">
        <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Attendance Overview</h3>
        <p className="text-xs text-gray-400 mb-4">Present, absent and late breakdown per course</p>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={ATTENDANCE_OVERVIEW} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
            <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <Tooltip formatter={(v) => [`${v}%`]} />
            <Legend />
            <Bar dataKey="present" name="Present %" fill="#10b981" radius={[3, 3, 0, 0]} stackId="a" />
            <Bar dataKey="absent" name="Absent %" fill="#ef4444" stackId="a" />
            <Bar dataKey="late" name="Late %" fill="#f59e0b" radius={[0, 0, 0, 0]} stackId="a" />
          </BarChart>
        </ResponsiveContainer>
      </motion.div>
    </div>
  );
}
