import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, AlertCircle, AlertTriangle } from 'lucide-react';
import teacherImg from '../../assets/Teacher.png';
import studentImg from '../../assets/Student.jpg';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { useStudentId } from '../../hooks/useStudentId';
import { StatusBadge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { AIChatbot } from '../../components/shared/AIChatbot';

export function StudentDashboard() {
  useAuthStore();
  const navigate = useNavigate();
  const { students, courses, results, attendance, fees } = useDataStore();
  const studentId = useStudentId();

  const student = students.find((s) => s.id === studentId);
  if (!student) return null;

  const myCourses = courses.filter((c) => student.enrolledCourses.includes(c.id));
  const myResults = results.filter((r) => r.studentId === student.id);
  const myFees = fees.filter((f) => f.studentId === student.id);
  const myAttendance = attendance.filter((a) => a.studentId === student.id);

  const presentCount = myAttendance.filter((a) => a.status === 'present').length;
  const attendancePct = myAttendance.length > 0 ? Math.round((presentCount / myAttendance.length) * 100) : 0;
  const avgScore = myResults.length > 0 ? Math.round(myResults.reduce((a, r) => a + r.percentage, 0) / myResults.length) : 0;
  const totalDue = myFees.reduce((a, f) => a + f.due, 0);

  const noticeBoard = [
    {
      id: 'n1',
      type: 'warning' as const,
      title: 'Midterm Form Submission',
      message: 'Submit your midterm exam form by 12 April to avoid late fees.',
      date: '2026-04-09',
    },
    {
      id: 'n2',
      type: 'info' as const,
      title: 'Library Hours Updated',
      message: 'Central library will remain open until 8:00 PM on weekdays.',
      date: '2026-04-08',
    },
    {
      id: 'n3',
      type: 'success' as const,
      title: 'Scholarship List Published',
      message: 'Merit scholarship shortlist is now available on the student portal.',
      date: '2026-04-07',
    },
    {
  id: 'n4',
  type: 'warning' as const,
  title: 'Assignment Submission Deadline',
  message: 'Submit your assignments before 15 April to avoid penalty.',
  date: '2026-04-10',
},
{
  id: 'n5',
  type: 'info' as const,
  title: 'Workshop on Web Development',
  message: 'Join the live workshop on modern web development this Saturday.',
  date: '2026-04-11',
},
{
  id: 'n6',
  type: 'success' as const,
  title: 'Results Announced',
  message: 'Semester results have been घोषित. Check your dashboard now.',
  date: '2026-04-12',
}
  ];

  const greetingHour = new Date().getHours();
  const greeting = greetingHour < 12 ? 'Good morning' : greetingHour < 17 ? 'Good afternoon' : 'Good evening';

  const [displayedName, setDisplayedName] = useState('');
  const [typingDone, setTypingDone] = useState(false);
  useEffect(() => {
    setDisplayedName('');
    setTypingDone(false);
    let i = 0;
    const timer = setInterval(() => {
      i++;
      setDisplayedName(student.name.slice(0, i));
      if (i >= student.name.length) {
        clearInterval(timer);
        setTypingDone(true);
      }
    }, 60);
    return () => clearInterval(timer);
  }, [student.name]);

  const stripStats = [
    {
      label: 'My Courses', value: String(myCourses.length), sub: 'Enrolled subjects',
      svg: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          {/* left page */}
          <rect x="8" y="14" width="21" height="36" rx="3" fill="#1a3a6b"/>
          <rect x="10" y="22" width="15" height="2.5" rx="1.2" fill="white" opacity="0.7"/>
          <rect x="10" y="28" width="12" height="2.5" rx="1.2" fill="white" opacity="0.7"/>
          <rect x="10" y="34" width="14" height="2.5" rx="1.2" fill="white" opacity="0.7"/>
          {/* spine */}
          <rect x="29" y="12" width="6" height="40" rx="2" fill="#4f46e5"/>
          {/* right page */}
          <rect x="35" y="14" width="21" height="36" rx="3" fill="#818cf8"/>
          <rect x="39" y="22" width="13" height="2.5" rx="1.2" fill="white" opacity="0.5"/>
          <rect x="39" y="28" width="10" height="2.5" rx="1.2" fill="white" opacity="0.5"/>
          <rect x="39" y="34" width="12" height="2.5" rx="1.2" fill="white" opacity="0.5"/>
          {/* bookmark */}
          <path d="M46 8 L50 8 L50 20 L48 17 L46 20 Z" fill="#f43f5e"/>
        </svg>
      ),
    },
    {
      label: 'Attendance', value: `${attendancePct}%`, sub: `${presentCount} of ${myAttendance.length} classes`,
      svg: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          {/* calendar body */}
          <rect x="8" y="16" width="48" height="38" rx="6" fill="#d1fae5"/>
          {/* header bar */}
          <rect x="8" y="16" width="48" height="16" rx="6" fill="#10b981"/>
          <rect x="8" y="24" width="48" height="8" fill="#10b981"/>
          {/* ring pins */}
          <rect x="20" y="10" width="5" height="12" rx="2.5" fill="#6ee7b7"/>
          <rect x="39" y="10" width="5" height="12" rx="2.5" fill="#6ee7b7"/>
          {/* grid dots */}
          <circle cx="20" cy="40" r="2.5" fill="#10b981"/>
          <circle cx="32" cy="40" r="2.5" fill="#10b981"/>
          <circle cx="44" cy="40" r="2.5" fill="#10b981"/>
          <circle cx="20" cy="49" r="2.5" fill="#10b981"/>
          <circle cx="32" cy="49" r="2.5" fill="#10b981"/>
          {/* big checkmark */}
          <path d="M25 42 L30 48 L42 34" stroke="#10b981" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M25 42 L30 48 L42 34" stroke="#047857" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.6"/>
        </svg>
      ),
    },
    {
      label: 'Avg Score', value: `${avgScore}%`, sub: `${myResults.length} exams graded`,
      svg: (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          {/* left handle */}
          <path d="M20 20 H12 C10 20 9 21 9 23 C9 31 14 36 20 36" stroke="#f59e0b" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          {/* right handle */}
          <path d="M44 20 H52 C54 20 55 21 55 23 C55 31 50 36 44 36" stroke="#f59e0b" strokeWidth="3.5" fill="none" strokeLinecap="round"/>
          {/* cup body */}
          <path d="M20 12 H44 V34 C44 42 20 42 20 34 Z" fill="#fbbf24"/>
          {/* shine */}
          <ellipse cx="27" cy="22" rx="4" ry="6" fill="white" opacity="0.25" transform="rotate(-15 27 22)"/>
          {/* star inside */}
          <path d="M32 19 L33.2 23.1 L37.5 23.1 L34 25.6 L35.2 29.7 L32 27.2 L28.8 29.7 L30 25.6 L26.5 23.1 L30.8 23.1 Z" fill="white" opacity="0.55"/>
          {/* stem */}
          <rect x="28" y="42" width="8" height="7" fill="#f59e0b"/>
          {/* base */}
          <rect x="20" y="49" width="24" height="5" rx="2.5" fill="#d97706"/>
        </svg>
      ),
    },
    {
      label: 'Fee Status',
      value: totalDue > 0 ? formatCurrency(totalDue) : 'Clear',
      sub: totalDue > 0 ? 'Amount outstanding' : 'All dues cleared',
      svg: totalDue > 0 ? (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <circle cx="32" cy="32" r="24" fill="#fee2e2"/>
          <circle cx="32" cy="32" r="18" fill="#ef4444"/>
          <text x="32" y="39" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold" fontFamily="Arial, sans-serif">$</text>
          {/* coin edge lines */}
          <circle cx="32" cy="32" r="21" stroke="#fca5a5" strokeWidth="1.5" strokeDasharray="4 3"/>
        </svg>
      ) : (
        <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-12 h-12">
          <circle cx="32" cy="32" r="24" fill="#d1fae5"/>
          <circle cx="32" cy="32" r="18" fill="#10b981"/>
          {/* coin edge */}
          <circle cx="32" cy="32" r="21" stroke="#6ee7b7" strokeWidth="1.5" strokeDasharray="4 3"/>
          {/* dollar sign */}
          <text x="32" y="39" textAnchor="middle" fill="white" fontSize="24" fontWeight="bold" fontFamily="Arial, sans-serif">$</text>
          {/* small checkmark badge */}
          <circle cx="48" cy="18" r="8" fill="#059669"/>
          <path d="M44 18 L47 21 L52 15" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-5">

      {/* ── PW-Style Hero + overlapping strip wrapper ── */}
      <div className="relative">

      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden relative"
        style={{ background: 'linear-gradient(135deg, #eef0ff 0%, #f3eeff 45%, #fce8f3 100%)' }}
      >
        <div className="flex items-center justify-between px-12 pt-20 pb-20 gap-6">

          {/* Left — text content */}
          <div className="flex-1 min-w-0">
            <p className="text-gray-500 text-sm font-medium">{greeting},</p>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mt-1">
              <span className="text-brand-600">{displayedName}</span>
              {!typingDone && <span className="animate-pulse text-brand-400">|</span>}
              {typingDone && <span> 👋</span>}
            </h1>
            <p className="text-gray-400 text-sm mt-1.5">
              {student.rollNumber} · {student.department} · {student.batch}
            </p>

            {/* Inline stats */}
            <div className="flex flex-wrap items-center gap-6 mt-6">
              <div>
                <p className="text-3xl font-bold text-gray-900">{myCourses.length}</p>
                <p className="text-xs text-gray-400 mt-0.5">Enrolled Courses</p>
              </div>
              <div className="w-px h-10 bg-gray-300" />
              <div>
                <p className="text-3xl font-bold text-gray-900">{attendancePct}%</p>
                <p className="text-xs text-gray-400 mt-0.5">Attendance</p>
              </div>
              <div className="w-px h-10 bg-gray-300" />
              <div>
                <p className="text-3xl font-bold text-gray-900">{avgScore}%</p>
                <p className="text-xs text-gray-400 mt-0.5">Avg Score</p>
              </div>
            </div>

            <a
              href="/student/courses"
              className="inline-block mt-7 px-8 py-3 bg-brand-600 hover:bg-white hover:border-brand-600 hover:text-brand-600 text-white font-semibold rounded-xl transition-colors shadow-sm shadow-brand-200 border border-transparent"
            >
              View My Courses
            </a>
          </div>

          {/* Right — two separated circles like PW */}
          <div className="hidden md:block relative flex-shrink-0 w-[420px] h-72 overflow-visible">

            {/* floating dots */}
            <div className="absolute w-3 h-3 rounded-full bg-brand-400 top-6 left-20 z-10" />
            <div className="absolute w-2.5 h-2.5 rounded-full bg-pink-400 top-4 right-6 z-10" />
            <div className="absolute w-3 h-3 rounded-full bg-orange-400 bottom-6 right-28 z-10" />

            {/* ── LEFT circle — Teacher (center-low) ── */}
            <div className="absolute left-[-80px] bottom-5 flex items-center justify-center w-48 h-48 z-10">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-300/80" />
              <div className="absolute inset-[-16px] rounded-full border-2 border-dashed border-gray-300/40" />
              {/* image circle */}
              <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-white shadow-xl z-10">
                <img src={teacherImg} alt="Teacher" className="w-full h-full object-cover" />
              </div>
            </div>

            {/* ── RIGHT circle — Student (top-right) ── */}
            <div className="absolute right-5 top-[-10] flex items-center justify-center w-52 h-52 z-20">
              <div className="absolute inset-0 rounded-full border-2 border-dashed border-gray-300/80" />
              <div className="absolute inset-[-16px] rounded-full border-2 border-dashed border-gray-300/40" />
              {/* image circle */}
              <div className="w-40 h-40 rounded-full overflow-hidden ring-4 ring-white shadow-xl z-10">
                <img src={studentImg} alt="Student" className="w-full h-full object-cover object-top" />
              </div>
            </div>

            {/* Chat bubble — student question (pointing to girl's head) */}
            <div className="absolute top-[0] right-[120px] bg-white rounded-2xl rounded-br-sm shadow-md px-3 py-2 text-xs font-medium text-gray-700 whitespace-nowrap z-30">
              Sir, what is online school?
            </div>

            {/* Chat bubble — teacher reply (above left circle) */}
            <div className="absolute bottom-[195px] left-[20px] bg-brand-600 rounded-2xl rounded-bl-sm shadow-md px-3 py-2 text-xs font-medium text-white z-30 max-w-[180px] leading-relaxed">
              Online class is a modern teaching platform 🎓
            </div>
          </div>
        </div>
      </motion.div>

      {/* overlaps hero bottom */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        whileHover={{ y: -8, transition: { duration: 0.2 } }}
        className="card relative z-10 -mt-16 mx-20 transition-all duration-300"
        style={{
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 10px 25px -5px rgba(99, 102, 241, 0.15), 0 20px 50px -15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100 dark:divide-gray-800">
          {stripStats.map((s) => (
            <motion.div 
              key={s.label} 
              whileHover={{ y: -4 }}
              className="flex flex-col items-center gap-1.5 py-3 px-3 cursor-pointer transition-all duration-200 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-xl"
            >
              <div className="w-10 h-10 [&>svg]:w-10 [&>svg]:h-10">{s.svg}</div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{s.label}</p>
                <p className="text-xs text-gray-400">{s.sub}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      </div>{/* end hero+strip wrapper */}

      {/* ── Main Dashboard Grid: My Courses + Notice Board (spanning full height) + Performance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 auto-rows-max lg:auto-rows-[minmax(0,1fr)]">
        
        {/* My Courses - Left Side, Row 1 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="card lg:col-span-2 transition-all duration-300"
          style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 10px 25px -5px rgba(99, 102, 241, 0.15), 0 20px 50px -15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">My Courses</h3>
            <a href="/student/courses" className="text-xs text-brand-600 dark:text-brand-400 hover:underline">View all →</a>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {myCourses.map((course) => (
              <div key={course.id} className="px-5 py-3.5 flex items-center gap-4 table-row-hover">
                <div className="w-9 h-9 rounded-lg bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-4 h-4 text-brand-600 dark:text-brand-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{course.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{course.teacherName} · {course.schedule}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusBadge status={course.status} />
                  <button
                    onClick={() => navigate(`/student/courses/${course.id}`)}
                    className="inline-flex items-center gap-1.5 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-600 transition-colors hover:bg-white hover:border-brand-600 dark:border-brand-900/40 dark:bg-brand-900/20 dark:text-brand-300 dark:hover:bg-white dark:hover:border-brand-600 dark:hover:text-brand-600"
                  >
                    Explore
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Notice Board - Right Side, Spanning Full Height (Rows 1-2) */}
        <motion.div 
          initial={{ opacity: 0, y: 16 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.25 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="card lg:row-span-2 overflow-y-auto transition-all duration-300"
          style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 10px 25px -5px rgba(99, 102, 241, 0.15), 0 20px 50px -15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
            <h3 className="font-semibold text-gray-900 dark:text-white">Announcement</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {noticeBoard.map((notice) => {
              const icon = notice.type === 'warning'
                ? <AlertTriangle className="w-4 h-4 text-amber-600" />
                : notice.type === 'success'
                  ? <CheckCircle className="w-4 h-4 text-emerald-600" />
                  : <AlertCircle className="w-4 h-4 text-brand-600" />;
              const iconBg = notice.type === 'warning'
                ? 'bg-amber-50 dark:bg-amber-900/20'
                : notice.type === 'success'
                  ? 'bg-emerald-50 dark:bg-emerald-900/20'
                  : 'bg-brand-50 dark:bg-brand-900/20';

              return (
                <motion.div 
                  key={notice.id} 
                  whileHover={{ y: -3 }}
                  className="px-5 py-3.5 flex items-start gap-3 transition-all duration-200 hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer rounded-lg hover:shadow-sm"
                >
                  <div className={`mt-0.5 p-2 rounded-lg ${iconBg} transition-all duration-200 hover:shadow-md`}>
                    {icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200 hover:text-brand-600 dark:hover:text-brand-400">{notice.title}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 leading-relaxed">{notice.message}</p>
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap transition-colors duration-200 hover:text-gray-600 dark:hover:text-gray-300">{formatDate(notice.date)}</span>
                </motion.div>
              );
            })}
          </div>
        </motion.div>

        {/* Performance - Left Side, Row 2 */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          whileHover={{ y: -8, transition: { duration: 0.2 } }}
          className="card lg:col-span-2 transition-all duration-300"
          style={{
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.07), 0 10px 25px -5px rgba(99, 102, 241, 0.15), 0 20px 50px -15px rgba(0, 0, 0, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Performance</h3>
            <a href="/student/results" className="text-xs text-brand-600 hover:underline">View all →</a>
          </div>
          {myResults.length > 0 ? (
            <>
              {/* Marks Table by Subject */}
              <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
                <div className="px-5 py-3">
                  <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold mb-2">Marks by Subject</p>
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="text-left py-2 px-0 text-xs font-semibold text-gray-600 dark:text-gray-400">Subject</th>
                        <th className="text-center py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">Marks</th>
                        <th className="text-center py-2 px-2 text-xs font-semibold text-gray-600 dark:text-gray-400">%</th>
                        <th className="text-right py-2 px-0 text-xs font-semibold text-gray-600 dark:text-gray-400">Grade</th>
                      </tr>
                    </thead>
                    <tbody>
                      {myResults.map((result) => (
                        <tr key={result.id} className="border-b border-gray-100 dark:border-gray-800">
                          <td className="py-2 px-0 text-sm text-gray-900 dark:text-gray-100">{result.examTitle}</td>
                          <td className="text-center py-2 px-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                            {result.marksObtained}/{result.totalMarks}
                          </td>
                          <td className={`text-center py-2 px-2 text-sm font-semibold ${result.percentage >= 80 ? 'text-emerald-600' : result.percentage >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                            {result.percentage}%
                          </td>
                          <td className={`text-right py-2 px-0 text-sm font-bold ${result.percentage >= 80 ? 'text-emerald-600' : result.percentage >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                            {result.grade}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Last Exam CGPA */}
                <div className="px-5 py-3 bg-brand-50 dark:bg-brand-900/10">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">Last SRM CGPA</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5">
                        {myResults[0].examTitle}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className={`text-3xl font-bold ${myResults[0].percentage >= 80 ? 'text-emerald-600' : myResults[0].percentage >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                        {myResults[0].percentage}%
                      </p>
                      <p className={`text-sm font-semibold mt-1 ${myResults[0].percentage >= 80 ? 'text-emerald-600' : myResults[0].percentage >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                        {myResults[0].grade}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="px-5 py-8 text-center text-sm text-gray-400">No results yet</div>
          )}
        </motion.div>
      </div>
      <AIChatbot />
    </div>
  );
}
