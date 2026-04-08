import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, AlertTriangle, CheckCircle } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { useStudentId } from '../../hooks/useStudentId';

function getMonthLabel(key: string) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

// ─── Status icon ───────────────────────────────────────────────────────────────
function StatusCheck({ active, color }: { active: boolean; color: string }) {
  return (
    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mx-auto transition-colors ${active ? `${color} border-transparent` : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'}`}>
      {active && (
        <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function StudentAttendancePage() {
  const { user } = useAuthStore();
  const { students, courses, attendance } = useDataStore();
  const studentId = useStudentId();

  const student = students.find((s) => s.id === studentId);
  const myCourses = courses.filter((c) => student?.enrolledCourses.includes(c.id));
  const myAttendance = attendance.filter((a) => a.studentId === studentId);

  // Available months
  const availableMonths = useMemo(() => {
    const keys = new Set<string>();
    myAttendance.forEach((a) => {
      const [y, m] = a.date.split('-');
      keys.add(`${y}-${m}`);
    });
    return Array.from(keys).sort().reverse();
  }, [myAttendance]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] ?? '');
  const [dropdownOpen, setDropdownOpen]   = useState(false);

  // All dates in the selected month that have any record for this student
  const datesInMonth = useMemo(() => {
    const d = new Set<string>();
    myAttendance.filter((a) => a.date.startsWith(selectedMonth)).forEach((a) => d.add(a.date));
    return Array.from(d).sort().reverse();
  }, [myAttendance, selectedMonth]);

  const [selectedDate, setSelectedDate] = useState<string>('');

  // When month changes, reset date
  const handleMonthChange = (key: string) => {
    setSelectedMonth(key);
    setDropdownOpen(false);
    setSelectedDate('');
  };

  // Attendance records for the current view
  const viewRecords = useMemo(() => {
    const source = selectedDate
      ? myAttendance.filter((a) => a.date === selectedDate)
      : myAttendance.filter((a) => a.date.startsWith(selectedMonth));
    return source;
  }, [myAttendance, selectedMonth, selectedDate]);

  // Monthly overall stats (for summary banner, always month-wide)
  const monthRecords = myAttendance.filter((a) => a.date.startsWith(selectedMonth));
  const presentTotal = monthRecords.filter((a) => a.status === 'present').length;
  const absentTotal  = monthRecords.filter((a) => a.status === 'absent').length;
  const lateTotal    = monthRecords.filter((a) => a.status === 'late').length;
  const overallPct   = monthRecords.length > 0 ? Math.round((presentTotal / monthRecords.length) * 100) : 0;

  // Per-course stats for the table
  const courseStats = useMemo(() => {
    return myCourses.map((c) => {
      const recs = viewRecords.filter((a) => a.courseId === c.id);
      const p = recs.filter((a) => a.status === 'present').length;
      const a = recs.filter((a) => a.status === 'absent').length;
      const l = recs.filter((a) => a.status === 'late').length;
      const total = recs.length;
      const pct   = total > 0 ? Math.round((p / total) * 100) : null;

      // For daily view: single status
      const dayStatus = selectedDate ? (recs[0]?.status ?? null) : null;

      return { course: c, p, a, l, total, pct, dayStatus };
    });
  }, [myCourses, viewRecords, selectedDate]);

  const isDailyView = !!selectedDate;

  return (
    <div className="space-y-5">

      {/* ── Page Header ── */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Attendance</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Monthly attendance across all subjects</p>
      </div>

      {/* ── Summary Banner ── */}
      <motion.div
        key={selectedMonth}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl p-5 text-white"
        style={{ background: 'linear-gradient(135deg, #1a3a6b 0%, #2c5aa0 100%)' }}
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1">
              {selectedMonth ? getMonthLabel(selectedMonth) : ''} — Overall
            </p>
            <div className="flex items-center gap-3">
              <span className="text-4xl font-black">{overallPct}%</span>
              {overallPct < 75 ? (
                <span className="flex items-center gap-1 text-xs bg-white/20 px-2.5 py-1 rounded-full">
                  <AlertTriangle className="w-3 h-3" /> Below 75%
                </span>
              ) : overallPct >= 90 ? (
                <span className="flex items-center gap-1 text-xs bg-white/20 px-2.5 py-1 rounded-full">
                  <CheckCircle className="w-3 h-3" /> Excellent
                </span>
              ) : null}
            </div>
            <div className="mt-2 w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-white rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${overallPct}%` }}
                transition={{ duration: 0.8 }}
              />
            </div>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: 'Present', value: presentTotal, color: 'text-emerald-300' },
              { label: 'Absent',  value: absentTotal,  color: 'text-red-300' },
              { label: 'Late',    value: lateTotal,     color: 'text-amber-300' },
              { label: 'Total',   value: monthRecords.length, color: 'text-white' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-white/60 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* ── Legend ── */}
      <div className="flex items-center gap-5 text-xs font-semibold flex-wrap">
        {[
          { color: 'bg-emerald-500', label: 'P — Present' },
          { color: 'bg-red-500',     label: 'A — Absent' },
          { color: 'bg-amber-400',   label: 'L — Late' },
          { color: 'bg-gray-200 dark:bg-gray-700', label: 'No class' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <span className={`w-4 h-4 rounded ${color} inline-block flex-shrink-0`} />
            {label}
          </div>
        ))}
      </div>

      {/* ── Attendance Sheet Card ── */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden"
      >
        {/* Card header + filters */}
        <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <p className="text-sm font-bold text-gray-700 dark:text-gray-200 mb-3">Attendance Sheet</p>
          <div className="flex flex-wrap gap-4">

            {/* Month dropdown */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Month</label>
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen((o) => !o)}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-800 dark:text-gray-200 hover:border-gray-400 transition-colors min-w-[200px] justify-between"
                >
                  <span>{selectedMonth ? getMonthLabel(selectedMonth) : 'Select month'}</span>
                  <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {dropdownOpen && (
                  <div className="absolute left-0 mt-1 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden">
                    {availableMonths.map((key) => (
                      <button
                        key={key}
                        onClick={() => handleMonthChange(key)}
                        className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                          key === selectedMonth
                            ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 font-semibold'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                      >
                        {getMonthLabel(key)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Date picker */}
            <div className="flex flex-col gap-1">
              <label className="text-xs text-gray-500 dark:text-gray-400 font-medium">Date</label>
              <select
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-medium text-gray-800 dark:text-gray-200 hover:border-gray-400 transition-colors min-w-[180px] focus:outline-none focus:border-brand-400"
              >
                <option value="">All dates (monthly)</option>
                {datesInMonth.map((d) => (
                  <option key={d} value={d}>
                    {new Date(d).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr style={{ background: '#1a3a6b' }}>
                <th className="text-left px-6 py-3.5 text-white font-semibold text-sm w-1/2">Subjects</th>
                <th className="text-center px-4 py-3.5 text-white font-semibold text-sm">Present</th>
                <th className="text-center px-4 py-3.5 text-white font-semibold text-sm">Late</th>
                <th className="text-center px-4 py-3.5 text-white font-semibold text-sm">Absent</th>
                <th className="text-center px-4 py-3.5 text-white font-semibold text-sm">
                  {isDailyView ? 'Holiday' : 'Total / %'}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
              {courseStats.map(({ course, p, a, l, total, pct, dayStatus }, idx) => {
                const hasRecord = total > 0;
                return (
                  <motion.tr
                    key={course.id}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors"
                  >
                    {/* Subject */}
                    <td className="px-6 py-3.5">
                      <p className="font-semibold text-gray-800 dark:text-gray-100">{course.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{course.code} · {course.teacherName}</p>
                    </td>

                    {isDailyView ? (
                      <>
                        <td className="px-4 py-3.5 text-center">
                          <StatusCheck active={dayStatus === 'present'} color="bg-emerald-500" />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <StatusCheck active={dayStatus === 'late'} color="bg-amber-400" />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <StatusCheck active={dayStatus === 'absent'} color="bg-red-500" />
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <StatusCheck active={dayStatus === null && !hasRecord} color="bg-gray-300" />
                        </td>
                      </>
                    ) : (
                      <>
                        {/* Monthly summary columns */}
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${p > 0 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'text-gray-300 dark:text-gray-600'}`}>
                            {p > 0 ? p : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${l > 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' : 'text-gray-300 dark:text-gray-600'}`}>
                            {l > 0 ? l : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${a > 0 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' : 'text-gray-300 dark:text-gray-600'}`}>
                            {a > 0 ? a : '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {pct !== null ? (
                            <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-bold ${
                              pct >= 75 ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
                              : pct >= 60 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                            }`}>
                              {total} cls · {pct}%
                            </span>
                          ) : (
                            <span className="text-gray-300 dark:text-gray-600 text-xs">—</span>
                          )}
                        </td>
                      </>
                    )}
                  </motion.tr>
                );
              })}

              {courseStats.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-sm text-gray-400">
                    No attendance records for this period.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
