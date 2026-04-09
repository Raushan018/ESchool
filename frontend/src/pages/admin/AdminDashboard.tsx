import { motion } from 'framer-motion';
import {
  GraduationCap, Users, BookOpen, DollarSign,
  TrendingUp, Clock, CalendarCheck, Award,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { StatCard } from '../../components/ui/StatCard';
import { useDataStore } from '../../store/dataStore';
import { formatCurrency } from '../../utils/helpers';
import { AIChatbot } from '../../components/shared/AIChatbot';
import { useAdminStats } from '../../hooks/useAdminStats';
import {
  ENROLLMENT_TREND, REVENUE_DATA, DEPARTMENT_DISTRIBUTION, ATTENDANCE_OVERVIEW,
} from '../../data/mockData';

export function AdminDashboard() {
  const { students } = useDataStore();
  const { stats: apiStats } = useAdminStats();

  const stats = [
    {
      title: 'Total Students',
      value: apiStats?.totalStudents ?? students.length,
      change: `${apiStats?.activeStudents ?? students.filter(s => s.status === 'active').length} active`,
      icon: GraduationCap, iconColor: 'text-brand-600', iconBg: 'bg-brand-50 dark:bg-brand-900/20',
    },
    {
      title: 'Faculty Members',
      value: apiStats?.totalTeachers ?? '—',
      change: `${apiStats?.activeTeachers ?? '—'} active`,
      icon: Users, iconColor: 'text-emerald-600', iconBg: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      title: 'Active Courses',
      value: apiStats?.activeCourses ?? '—',
      change: `${apiStats?.totalCourses ?? '—'} total`,
      icon: BookOpen, iconColor: 'text-amber-600', iconBg: 'bg-amber-50 dark:bg-amber-900/20',
    },
    {
      title: 'Revenue Collected',
      value: apiStats ? formatCurrency(apiStats.totalRevenue) : '—',
      change: apiStats ? `${formatCurrency(apiStats.pendingRevenue)} pending` : '...',
      positive: false,
      icon: DollarSign, iconColor: 'text-brand-600', iconBg: 'bg-brand-50 dark:bg-brand-900/20',
    },
  ];

  const recentStudents = students.slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Welcome back! Here's what's happening today.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <StatCard key={s.title} {...s} delay={i * 0.1} />
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Enrollment Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="card p-5 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Student Enrollment</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monthly enrollment trend</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
              <TrendingUp className="w-3 h-3" />
              +24.8% this quarter
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={ENROLLMENT_TREND} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a3a6b" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#1a3a6b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--tw-bg-opacity)',
                  border: '1px solid #e5e7eb',
                  borderRadius: '0.5rem',
                  fontSize: '12px',
                }}
              />
              <Area type="monotone" dataKey="students" stroke="#1a3a6b" strokeWidth={2} fill="url(#colorStudents)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Department Distribution */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.3 }}
          className="card p-5"
        >
          <div className="mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Departments</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Student distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={DEPARTMENT_DISTRIBUTION} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                {DEPARTMENT_DISTRIBUTION.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v} students`]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="mt-2 space-y-1.5">
            {DEPARTMENT_DISTRIBUTION.slice(0, 3).map((d) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }} />
                  <span className="text-gray-600 dark:text-gray-400 truncate">{d.name}</span>
                </div>
                <span className="font-medium text-gray-900 dark:text-white">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Revenue */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.35 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">Revenue vs Expenses</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Monthly financial overview</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REVENUE_DATA} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip formatter={(v) => [formatCurrency(Number(v))]} />
              <Legend />
              <Bar dataKey="revenue" name="Revenue" fill="#1a3a6b" radius={[3, 3, 0, 0]} />
              <Bar dataKey="expenses" name="Expenses" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Attendance Overview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="card p-5"
        >
          <div className="mb-5">
            <h3 className="font-semibold text-gray-900 dark:text-white">Attendance by Course</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Average attendance percentage</p>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ATTENDANCE_OVERVIEW} layout="vertical" margin={{ top: 4, right: 4, left: 40, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
              <XAxis type="number" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`${v}%`]} />
              <Bar dataKey="present" name="Present" fill="#10b981" radius={[0, 3, 3, 0]} stackId="a" />
              <Bar dataKey="absent" name="Absent" fill="#ef4444" radius={[0, 0, 0, 0]} stackId="a" />
              <Bar dataKey="late" name="Late" fill="#f59e0b" radius={[0, 3, 3, 0]} stackId="a" />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Students */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.45 }}
        className="card"
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Enrollments</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">Latest students who joined</p>
          </div>
          <a href="/admin/students" className="text-xs text-brand-600 dark:text-brand-400 hover:underline font-medium">View all →</a>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {recentStudents.map((student) => (
            <div key={student.id} className="flex items-center gap-4 px-5 py-3.5 table-row-hover">
              <div className="w-9 h-9 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center text-sm font-semibold text-brand-700 dark:text-brand-400 flex-shrink-0">
                {student.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white">{student.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{student.rollNumber} · {student.department}</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-xs text-gray-500 dark:text-gray-400">{student.batch}</p>
                <p className="text-xs text-gray-400 mt-0.5">{student.enrolledCourses.length} courses</p>
              </div>
              <span className={`badge text-xs ${student.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                {student.status}
              </span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Avg Attendance', value: '84.6%', icon: CalendarCheck, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Exams This Month', value: '4', icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
          { label: 'Pass Rate', value: '91.2%', icon: Award, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
          { label: 'Fee Collection Rate', value: '72%', icon: TrendingUp, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 + i * 0.05 }}
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
      <AIChatbot />
    </div>
  );
}
