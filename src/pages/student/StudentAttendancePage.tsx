import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, AlertTriangle, CheckCircle, BookOpen } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';

// ─── Helpers ───────────────────────────────────────────────────────────────────
function getDaysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

function getMonthLabel(key: string) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

// ─── Day Cell ──────────────────────────────────────────────────────────────────
function DayCell({ day, status }: { day: number; status: 'present' | 'absent' | 'late' | null }) {
  if (!status) {
    return (
      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-[10px] font-semibold text-gray-300 dark:text-gray-600 bg-gray-50 dark:bg-gray-800/40 border border-gray-100 dark:border-gray-800">
        {day}
      </div>
    );
  }
  const styles = {
    present: 'bg-emerald-500 text-white border-emerald-500',
    absent:  'bg-red-500 text-white border-red-500',
    late:    'bg-amber-400 text-white border-amber-400',
  };
  const label = { present: 'P', absent: 'A', late: 'L' };
  return (
    <div className={`w-8 h-8 rounded-lg flex flex-col items-center justify-center border ${styles[status]}`}>
      <span className="text-[9px] font-semibold leading-none opacity-75">{day}</span>
      <span className="text-[11px] font-black leading-none">{label[status]}</span>
    </div>
  );
}

// ─── Course Attendance Card ────────────────────────────────────────────────────
function CourseCard({
  courseName, courseCode, teacherName,
  records, year, month, index,
}: {
  courseName: string; courseCode: string; teacherName: string;
  records: Record<number, 'present' | 'absent' | 'late'>;
  year: number; month: number; index: number;
}) {
  const days = getDaysInMonth(year, month);
  const allDays = Array.from({ length: 30 }, (_, i) => i + 1); // show 30 slots always

  const presentCount = Object.values(records).filter((s) => s === 'present').length;
  const absentCount  = Object.values(records).filter((s) => s === 'absent').length;
  const lateCount    = Object.values(records).filter((s) => s === 'late').length;
  const total = Object.keys(records).length;
  const pct = total > 0 ? Math.round((presentCount / total) * 100) : 0;
  const pctColor = pct >= 75 ? 'text-emerald-600' : pct >= 60 ? 'text-amber-500' : 'text-red-500';
  const barColor = pct >= 75 ? 'bg-emerald-500' : pct >= 60 ? 'bg-amber-400' : 'bg-red-500';

  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
      className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm"
    >
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-50 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
            <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
          </div>
          <div>
            <p className="font-bold text-gray-900 dark:text-white text-sm">{courseName}</p>
            <p className="text-xs text-gray-400 mt-0.5">{courseCode} · {teacherName}</p>
          </div>
        </div>

        {/* Stats summary */}
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 font-semibold text-emerald-600">
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> {presentCount} P
            </span>
            <span className="flex items-center gap-1 font-semibold text-red-500">
              <span className="w-2 h-2 rounded-full bg-red-500 inline-block" /> {absentCount} A
            </span>
            {lateCount > 0 && (
              <span className="flex items-center gap-1 font-semibold text-amber-500">
                <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" /> {lateCount} L
              </span>
            )}
          </div>
          <div className="text-right">
            <p className={`text-xl font-black ${pctColor}`}>{pct}%</p>
            <p className="text-[10px] text-gray-400">{total} classes</p>
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="px-5 pt-3">
        <div className="w-full h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${barColor}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8, delay: index * 0.08 + 0.2 }}
          />
        </div>
        {pct < 75 && (
          <div className="mt-2 flex items-center gap-1.5 text-xs text-red-500">
            <AlertTriangle className="w-3 h-3" /> Below 75% — at risk of exam debarment
          </div>
        )}
      </div>

      {/* 30-day grid */}
      <div className="px-5 py-4">
        <div className="flex flex-wrap gap-1.5">
          {allDays.map((day) => {
            const status = day <= days ? (records[day] ?? null) : null;
            // days beyond month's last day are greyed completely
            if (day > days) {
              return (
                <div key={day} className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-gray-800/20 border border-dashed border-gray-100 dark:border-gray-800 opacity-30" />
              );
            }
            return <DayCell key={day} day={day} status={status} />;
          })}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function StudentAttendancePage() {
  const { user } = useAuthStore();
  const { students, courses, attendance } = useDataStore();

  const student = students.find((s) => s.id === user?.id);
  const myCourses = courses.filter((c) => student?.enrolledCourses.includes(c.id));
  const myAttendance = attendance.filter((a) => a.studentId === user?.id);

  // Build sorted list of months that have data
  const availableMonths = useMemo(() => {
    const keys = new Set<string>();
    myAttendance.forEach((a) => {
      const [y, m] = a.date.split('-');
      keys.add(`${y}-${m}`);
    });
    return Array.from(keys).sort().reverse(); // most recent first
  }, [myAttendance]);

  const [selectedMonth, setSelectedMonth] = useState<string>(availableMonths[0] ?? '');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const [selYear, selMonth] = selectedMonth
    ? selectedMonth.split('-').map(Number)
    : [new Date().getFullYear(), new Date().getMonth() + 1];

  // Filter attendance for selected month
  const monthAttendance = myAttendance.filter((a) => a.date.startsWith(selectedMonth));

  // Overall stats for selected month
  const presentTotal = monthAttendance.filter((a) => a.status === 'present').length;
  const absentTotal  = monthAttendance.filter((a) => a.status === 'absent').length;
  const lateTotal    = monthAttendance.filter((a) => a.status === 'late').length;
  const overallPct   = monthAttendance.length > 0 ? Math.round((presentTotal / monthAttendance.length) * 100) : 0;

  // Per-course day map: courseId → { day → status }
  const courseRecords = useMemo(() => {
    const map: Record<string, Record<number, 'present' | 'absent' | 'late'>> = {};
    myCourses.forEach((c) => { map[c.id] = {}; });
    monthAttendance.forEach((a) => {
      const day = parseInt(a.date.split('-')[2], 10);
      if (map[a.courseId]) {
        map[a.courseId][day] = a.status as 'present' | 'absent' | 'late';
      }
    });
    return map;
  }, [monthAttendance, myCourses]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Monthly attendance across all subjects</p>
        </div>

        {/* Month dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-brand-200 dark:border-brand-700 bg-white dark:bg-gray-900 text-sm font-semibold text-gray-900 dark:text-white hover:border-brand-400 transition-colors shadow-sm min-w-[180px] justify-between"
          >
            <span>{selectedMonth ? getMonthLabel(selectedMonth) : 'Select month'}</span>
            <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
          </button>
          {dropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-52 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-lg z-20 overflow-hidden">
              {availableMonths.map((key) => (
                <button
                  key={key}
                  onClick={() => { setSelectedMonth(key); setDropdownOpen(false); }}
                  className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                    key === selectedMonth
                      ? 'bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-400 font-semibold'
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

      {/* Overall summary for selected month */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        key={selectedMonth}
        className="rounded-2xl bg-gradient-to-r from-brand-600 to-indigo-600 p-5 text-white"
      >
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <p className="text-brand-200 text-xs font-semibold uppercase tracking-wider mb-1">
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
              { label: 'Late',    value: lateTotal,    color: 'text-amber-300' },
              { label: 'Total',   value: monthAttendance.length, color: 'text-white' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`text-2xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-white/60 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs font-semibold">
        {[
          { color: 'bg-emerald-500', label: 'P — Present' },
          { color: 'bg-red-500',     label: 'A — Absent' },
          { color: 'bg-amber-400',   label: 'L — Late' },
          { color: 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700', label: 'No class' },
        ].map(({ color, label }) => (
          <div key={label} className="flex items-center gap-1.5 text-gray-600 dark:text-gray-400">
            <span className={`w-5 h-5 rounded-md ${color} inline-block flex-shrink-0`} />
            {label}
          </div>
        ))}
      </div>

      {/* Per-course cards */}
      {monthAttendance.length === 0 ? (
        <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-10 text-center">
          <p className="text-gray-400 text-sm">No attendance records for this month.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {myCourses.map((course, i) => (
            <CourseCard
              key={course.id}
              courseName={course.name}
              courseCode={course.code}
              teacherName={course.teacherName}
              records={courseRecords[course.id] ?? {}}
              year={selYear}
              month={selMonth}
              index={i}
            />
          ))}
        </div>
      )}
    </div>
  );
}
