import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { useStudentId } from '../../hooks/useStudentId';

// ─── Grade → Grade Point ───────────────────────────────────────────────────────
function gradeToPoint(grade: string): number {
  const map: Record<string, number> = {
    'O': 4.0, 'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'D': 1.0, 'F': 0.0,
  };
  return map[grade] ?? 0;
}

// ─── SVG Donut Chart ───────────────────────────────────────────────────────────
function DonutChart({
  value, max, size = 110, stroke = 10, color = '#1a3a6b',
  label, sublabel,
}: {
  value: number; max: number; size?: number; stroke?: number;
  color?: string; label: string; sublabel?: string;
}) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max > 0 ? value / max : 0;
  const dash = pct * circ;
  const cx = size / 2;

  return (
    <div className="flex flex-col items-center gap-1">
      <div style={{ position: 'relative', width: size, height: size }}>
        <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
          <circle cx={cx} cy={cx} r={r} fill="none" stroke="#e5e7eb" strokeWidth={stroke} />
          <circle
            cx={cx} cy={cx} r={r} fill="none"
            stroke={color} strokeWidth={stroke}
            strokeDasharray={`${dash} ${circ}`}
            strokeLinecap="round"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <span className="font-black text-gray-800 dark:text-white" style={{ fontSize: size * 0.18, lineHeight: 1 }}>{label}</span>
          {sublabel && <span className="text-gray-400 text-center leading-tight mt-0.5" style={{ fontSize: size * 0.1 }}>{sublabel}</span>}
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function StudentResultsPage() {
  const { user }  = useAuthStore();
  const { results, exams, students, courses, attendance } = useDataStore();
  const studentId = useStudentId();

  const student   = students.find((s) => s.id === studentId);
  const myResults = results.filter((r) => r.studentId === studentId);
  const myAttendance = attendance.filter((a) => a.studentId === studentId);

  // Derive semester options from exam dates
  const semesterOptions = useMemo(() => {
    const sems = new Set<string>();
    myResults.forEach((r) => {
      const exam = exams.find((e) => e.id === r.examId);
      if (exam) {
        const [y, m] = exam.date.split('-').map(Number);
        const sem = m <= 6 ? `Spring ${y}` : `Fall ${y}`;
        sems.add(sem);
      }
    });
    if (sems.size === 0) sems.add('Fall 2024');
    return Array.from(sems).sort().reverse();
  }, [myResults, exams]);

  const [selectedSem, setSelectedSem] = useState(semesterOptions[0] ?? 'Fall 2024');

  // Filter results for selected semester
  const semResults = useMemo(() => {
    return myResults.filter((r) => {
      const exam = exams.find((e) => e.id === r.examId);
      if (!exam) return false;
      const [y, m] = exam.date.split('-').map(Number);
      const sem = m <= 6 ? `Spring ${y}` : `Fall ${y}`;
      return sem === selectedSem;
    });
  }, [myResults, exams, selectedSem]);

  // Group by course → best/avg result per course
  const courseRows = useMemo(() => {
    const map = new Map<string, { courseId: string; grade: string; marks: number; total: number; pct: number }>();
    semResults.forEach((r) => {
      const exam = exams.find((e) => e.id === r.examId);
      if (!exam) return;
      const existing = map.get(exam.courseId);
      if (!existing || r.percentage > existing.pct) {
        map.set(exam.courseId, { courseId: exam.courseId, grade: r.grade, marks: r.marksObtained, total: r.totalMarks, pct: r.percentage });
      }
    });
    return Array.from(map.values()).map((row) => {
      const course = courses.find((c) => c.id === row.courseId);
      return { ...row, course };
    }).filter((r) => r.course);
  }, [semResults, exams, courses]);

  // SGPA
  const totalCredits = courseRows.reduce((a, r) => a + (r.course?.credits ?? 0), 0);
  const weightedGP   = courseRows.reduce((a, r) => a + gradeToPoint(r.grade) * (r.course?.credits ?? 0), 0);
  const sgpa         = totalCredits > 0 ? (weightedGP / totalCredits).toFixed(2) : '—';

  // Quiz stats
  const quizExams    = exams.filter((e) => e.type === 'quiz' && courses.some((c) => c.id === e.courseId && student?.enrolledCourses.includes(c.id)));
  const quizResults  = semResults.filter((r) => quizExams.some((e) => e.id === r.examId));
  const quizTotal    = quizExams.length;
  const quizDone     = quizResults.length;
  const avgMarks     = semResults.length > 0 ? Math.round(semResults.reduce((a, r) => a + r.percentage, 0) / semResults.length) : 0;

  // Attendance stats
  const totalClasses   = myAttendance.length;
  const presentClasses = myAttendance.filter((a) => a.status === 'present').length;

  // Assignment / overall
  const assignmentExams  = exams.filter((e) => e.type === 'assignment' && courses.some((c) => c.id === e.courseId && student?.enrolledCourses.includes(c.id)));
  const assignmentsDone  = semResults.filter((r) => assignmentExams.some((e) => e.id === r.examId)).length;

  const studentInfo = {
    name:       student?.name ?? user?.name ?? '—',
    rollNumber: student?.rollNumber ?? '—',
    department: student?.department ?? '—',
    batch:      student?.batch ?? '—',
    email:      student?.email ?? '—',
    joinDate:   student?.joinDate ?? '—',
  };

  const initials = studentInfo.name.split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="space-y-5">

      {/* ── Page Title ── */}
      <div>
        <h1 className="text-2xl font-black text-gray-900 dark:text-white">Live Results</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">View your semester-wise academic performance</p>
      </div>

      {/* ── Filter Bar ── */}
      <motion.div initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-4 flex flex-wrap items-end gap-4">
        {/* Student ID */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-400 mb-1 font-medium">Student ID</label>
          <div className="px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-sm font-bold text-gray-800 dark:text-gray-200">
            {studentInfo.rollNumber}
          </div>
        </div>
        {/* Semester */}
        <div className="flex-1 min-w-[200px]">
          <label className="block text-xs text-gray-400 mb-1 font-medium">Select Semester</label>
          <select
            value={selectedSem}
            onChange={(e) => setSelectedSem(e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm font-bold text-gray-800 dark:text-gray-200 focus:outline-none focus:border-brand-400 cursor-pointer"
          >
            {semesterOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        {/* Submit */}
        <button
          className="px-10 py-2.5 rounded-lg text-white font-black text-sm tracking-wide transition-colors"
          style={{ background: '#1a3a6b' }}
        >
          SUBMIT
        </button>
      </motion.div>

      {/* ── Middle: Table + Quiz Card ── */}
      <div className="flex gap-4 items-start">

        {/* Results Table */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 dark:border-gray-800">
                  {['Course Code', 'Course Title', 'Credit', 'Grade', 'Grade Point'].map((h) => (
                    <th key={h} className="text-left px-5 py-3.5 font-bold text-sm" style={{ color: '#1a3a6b' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/60">
                {courseRows.length === 0 ? (
                  <tr><td colSpan={5} className="px-5 py-10 text-center text-sm text-gray-400">No results for this semester.</td></tr>
                ) : courseRows.map((row, i) => (
                  <motion.tr key={row.courseId}
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.06 }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                    <td className="px-5 py-3.5 font-bold text-gray-800 dark:text-gray-100">{row.course?.code}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{row.course?.name}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{row.course?.credits}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{row.grade}</td>
                    <td className="px-5 py-3.5 text-gray-600 dark:text-gray-300">{gradeToPoint(row.grade).toFixed(1)}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totals footer */}
          {courseRows.length > 0 && (
            <div className="px-5 py-3.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/60 dark:bg-gray-800/30 flex flex-wrap gap-6 text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Total Credit Requirement: <span className="font-bold" style={{ color: '#1a3a6b' }}>{totalCredits}</span>
              </span>
              <span className="text-gray-500 dark:text-gray-400">
                Total Credit Taken: <span className="font-bold" style={{ color: '#1a3a6b' }}>{totalCredits}</span>
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-auto">
                SGPA: <span className="font-black text-base" style={{ color: '#1a3a6b' }}>{sgpa}</span>
              </span>
            </div>
          )}
        </motion.div>

        {/* Quiz Stats Card */}
        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }}
          className="w-52 flex-shrink-0 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5 flex flex-col items-center gap-4">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed">
            You have completed{' '}
            <span className="font-black" style={{ color: '#1a3a6b' }}>{quizDone}</span>
            {' '}quizzes this semester!
          </p>
          <DonutChart
            value={quizDone} max={quizTotal || 1}
            size={110} stroke={10} color="#1a3a6b"
            label={`${quizDone}/${quizTotal || 1}`}
            sublabel="Quiz Completed"
          />
          <div className="w-full space-y-2 text-xs border-t border-gray-100 dark:border-gray-800 pt-3">
            <div className="flex justify-between">
              <span className="text-gray-400">Average Marks:</span>
              <span className="font-bold text-gray-800 dark:text-white">{avgMarks}/100</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Score:</span>
              <span className="font-bold" style={{ color: '#1a3a6b' }}>
                {avgMarks >= 90 ? 'Top 5%' : avgMarks >= 75 ? 'Top 10%' : avgMarks >= 60 ? 'Top 25%' : 'Average'}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* ── Bottom: Student Info + Performance ── */}
      <div className="flex gap-4 items-start">

        {/* Student Basic Info */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
          className="w-72 flex-shrink-0 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <div className="flex items-start gap-4">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 flex-shrink-0 flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700">
              <span className="text-xl font-black text-gray-500 dark:text-gray-300">{initials}</span>
            </div>
            <div>
              <p className="text-xs font-bold" style={{ color: '#1a3a6b' }}>Student Basic Info</p>
              <p className="text-[10px] text-gray-400 mt-0.5">EduManage Institute</p>
            </div>
          </div>

          <div className="mt-4 space-y-2.5 text-sm">
            {[
              { label: 'Name',        value: studentInfo.name,        highlight: true },
              { label: 'Department',  value: studentInfo.department,  highlight: true },
              { label: 'Student ID',  value: studentInfo.rollNumber,  highlight: true },
              { label: 'Enrollment',  value: studentInfo.joinDate ? new Date(studentInfo.joinDate).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : '—', highlight: true },
              { label: 'Batch',       value: studentInfo.batch,       highlight: false },
            ].map(({ label, value, highlight }) => (
              <div key={label} className="flex gap-2">
                <span className="text-gray-400 text-xs w-24 flex-shrink-0">{label}:</span>
                <span className={`text-xs font-semibold ${highlight ? '' : 'text-gray-700 dark:text-gray-200'}`}
                  style={highlight ? { color: '#1a3a6b' } : {}}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Overall Performance */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
          className="flex-1 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 shadow-sm p-5">
          <p className="font-bold text-sm mb-4" style={{ color: '#1a3a6b' }}>Your Overall Performance This Semester</p>

          <div className="flex gap-5 items-center">
            {/* Stats list */}
            <div className="flex-1 space-y-3">
              {[
                { label: 'Class Attended',        value: presentClasses,    total: totalClasses },
                { label: 'Quiz Taken',             value: quizDone,          total: quizTotal || 1 },
                { label: 'Assignment Submitted',   value: assignmentsDone,   total: assignmentExams.length || 1 },
                { label: 'Exams Completed',        value: semResults.length, total: semResults.length + 1 },
              ].map(({ label, value, total }) => (
                <div key={label} className="flex items-center justify-between py-2 border-b border-gray-50 dark:border-gray-800/60 last:border-0">
                  <span className="text-sm text-gray-600 dark:text-gray-300">{label}:</span>
                  <span className="text-sm font-black text-gray-900 dark:text-white">
                    {value}<span className="text-gray-400 font-medium">/{total}</span>
                  </span>
                </div>
              ))}
            </div>

            {/* Donut */}
            <div className="flex-shrink-0 flex flex-col items-center gap-2">
              <DonutChart
                value={avgMarks} max={100}
                size={120} stroke={11} color="#1a3a6b"
                label={`${avgMarks}%`}
                sublabel="Marks Achieved!"
              />
              <p className="text-xs text-gray-400 text-center max-w-[110px] leading-tight">
                {avgMarks >= 80
                  ? 'Congratulations! You are a top scorer!'
                  : avgMarks >= 60
                  ? 'Good job! Keep it up.'
                  : 'Work harder to improve your score.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
