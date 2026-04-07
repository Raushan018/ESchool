import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { BookOpen, Trophy, Clock, ChevronLeft, ChevronRight } from 'lucide-react';
import teacherImg from '../../assets/Teacher.png';
import studentImg from '../../assets/Student.jpg';
import banner1 from '../../assets/2024 eSchool admission registration banner.png';
import banner2 from '../../assets/eSchool Bright Future 2024 registration ad.png';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { StatusBadge } from '../../components/ui/Badge';
import { formatCurrency, formatDate } from '../../utils/helpers';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, Tooltip } from 'recharts';

const BANNER_IMAGES = [banner1, banner2];
const BANNER_INTERVAL = 4000;

function BannerSlider() {
  const [current, setCurrent] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setCurrent((c) => (c + 1) % BANNER_IMAGES.length);
    }, BANNER_INTERVAL);
  };

  useEffect(() => {
    startTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const go = (idx: number) => {
    setCurrent((idx + BANNER_IMAGES.length) % BANNER_IMAGES.length);
    if (timerRef.current) clearInterval(timerRef.current);
    startTimer();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.18 }}
      className="relative w-full rounded-2xl overflow-hidden shadow-lg group"
      style={{ aspectRatio: '21/3' }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={current}
          src={BANNER_IMAGES[current]}
          alt={`Banner ${current + 1}`}
          className="absolute inset-0 w-full h-full object-cover"
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -60 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
        />
      </AnimatePresence>

      {/* Prev / Next arrows */}
      <button
        onClick={() => go(current - 1)}
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      <button
        onClick={() => go(current + 1)}
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2">
        {BANNER_IMAGES.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current ? 'w-6 h-2.5 bg-white' : 'w-2.5 h-2.5 bg-white/50 hover:bg-white/80'
            }`}
          />
        ))}
      </div>
    </motion.div>
  );
}

export function StudentDashboard() {
  const { user } = useAuthStore();
  const { students, courses, exams, results, attendance, fees } = useDataStore();

  const student = students.find((s) => s.id === user?.id);
  if (!student) return null;

  const myCourses = courses.filter((c) => student.enrolledCourses.includes(c.id));
  const myResults = results.filter((r) => r.studentId === student.id);
  const myFees = fees.filter((f) => f.studentId === student.id);
  const myAttendance = attendance.filter((a) => a.studentId === student.id);

  const presentCount = myAttendance.filter((a) => a.status === 'present').length;
  const attendancePct = myAttendance.length > 0 ? Math.round((presentCount / myAttendance.length) * 100) : 0;
  const avgScore = myResults.length > 0 ? Math.round(myResults.reduce((a, r) => a + r.percentage, 0) / myResults.length) : 0;
  const totalDue = myFees.reduce((a, f) => a + f.due, 0);

  const upcomingExams = exams.filter((e) => e.status === 'upcoming' && myCourses.some((c) => c.id === e.courseId));

  const radarData = myCourses.map((c) => {
    const courseResults = myResults.filter((r) => {
      const exam = exams.find((e) => e.id === r.examId);
      return exam?.courseId === c.id;
    });
    const avg = courseResults.length > 0 ? Math.round(courseResults.reduce((a, r) => a + r.percentage, 0) / courseResults.length) : 0;
    return { subject: c.code, score: avg };
  });

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
          <rect x="8" y="14" width="21" height="36" rx="3" fill="#6366f1"/>
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
              className="inline-block mt-7 px-8 py-3 bg-brand-600 hover:bg-brand-700 text-white font-semibold rounded-xl transition-colors shadow-sm shadow-brand-200"
            >
              View My Courses
            </a>
          </div>

          {/* Right — two separated circles like PW */}
          <div className="hidden md:block relative flex-shrink-0 w-[420px] h-72 overflow-visible">

            {/* floating dots */}
            <div className="absolute w-3 h-3 rounded-full bg-blue-400 top-6 left-20 z-10" />
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
        className="card relative z-10 -mt-16 mx-20 shadow-xl"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100 dark:divide-gray-800">
          {stripStats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1.5 py-3 px-3 cursor-pointer transition-all duration-200 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:scale-105 rounded-xl group">
              <div className="w-10 h-10 [&>svg]:w-10 [&>svg]:h-10">{s.svg}</div>
              <p className="text-lg font-bold text-gray-900 dark:text-white">{s.value}</p>
              <div className="text-center">
                <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{s.label}</p>
                <p className="text-xs text-gray-400">{s.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.div>

      </div>{/* end hero+strip wrapper */}

      {/* ── Sliding Banner ── */}
      <BannerSlider />

      {/* ── My Courses + Performance Radar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card lg:col-span-2"
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
                <StatusBadge status={course.status} />
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="card p-5"
        >
          <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Performance</h3>
          <p className="text-xs text-gray-400 mb-3">Score by subject</p>
          {radarData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10 }} />
                <Radar name="Score" dataKey="score" stroke="#6366f1" fill="#6366f1" fillOpacity={0.2} />
                <Tooltip formatter={(v) => [`${v}%`]} />
              </RadarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-40 text-sm text-gray-400">No results yet</div>
          )}
        </motion.div>
      </div>

      {/* ── Upcoming Exams + Course-wise Attendance ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="card">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white">Upcoming Exams</h3>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {upcomingExams.length === 0 ? (
              <div className="px-5 py-8 text-center text-sm text-gray-400">No upcoming exams 🎉</div>
            ) : upcomingExams.map((exam) => (
              <div key={exam.id} className="px-5 py-3.5 flex items-center gap-3">
                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                  <Clock className="w-4 h-4 text-amber-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{exam.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDate(exam.date)} · {exam.duration} min</p>
                </div>
                <span className="text-xs font-medium text-amber-600 bg-amber-50 dark:bg-amber-900/20 px-2 py-0.5 rounded-full">{exam.totalMarks} marks</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="card p-5">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-5">Course-wise Attendance</h3>
          {myCourses.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-4">No courses enrolled</p>
          ) : (
            <div className="flex flex-wrap justify-around gap-4">
              {myCourses.map((course, idx) => {
                const cRecords = myAttendance.filter((a) => a.courseId === course.id);
                const cPresent = cRecords.filter((a) => a.status === 'present').length;
                const cPct = cRecords.length > 0 ? Math.round((cPresent / cRecords.length) * 100) : 0;
                const r = 38;
                const circ = 2 * Math.PI * r;
                const offset = circ - (cPct / 100) * circ;
                const strokeColor = cPct >= 80 ? '#10b981' : cPct >= 65 ? '#f59e0b' : '#ef4444';
                const bgColor = cPct >= 80 ? '#d1fae5' : cPct >= 65 ? '#fef3c7' : '#fee2e2';
                const textColor = cPct >= 80 ? 'text-emerald-600' : cPct >= 65 ? 'text-amber-500' : 'text-red-500';
                return (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4 + idx * 0.1, type: 'spring', stiffness: 200 }}
                    className="flex flex-col items-center gap-2"
                  >
                    <div className="relative w-24 h-24">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                        {/* track */}
                        <circle cx="50" cy="50" r={r} stroke={bgColor} strokeWidth="10" fill="none" />
                        {/* progress */}
                        <motion.circle
                          cx="50" cy="50" r={r}
                          stroke={strokeColor} strokeWidth="10" fill="none"
                          strokeLinecap="round"
                          strokeDasharray={circ}
                          initial={{ strokeDashoffset: circ }}
                          animate={{ strokeDashoffset: offset }}
                          transition={{ duration: 1.2, delay: 0.5 + idx * 0.1, ease: 'easeOut' }}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-base font-bold ${textColor}`}>{cPct}%</span>
                      </div>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{course.code}</p>
                      <p className="text-xs text-gray-400">{cPresent}/{cRecords.length} classes</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* ── Recent Results ── */}
      {myResults.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="card">
          <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Results</h3>
            <a href="/student/results" className="text-xs text-brand-600 hover:underline">View all →</a>
          </div>
          <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
            {myResults.slice(0, 3).map((r) => (
              <div key={r.id} className="px-5 py-3.5 flex items-center gap-4 table-row-hover">
                <div className={`p-2 rounded-lg ${r.status === 'pass' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-red-50 dark:bg-red-900/20'}`}>
                  <Trophy className={`w-4 h-4 ${r.status === 'pass' ? 'text-emerald-600' : 'text-red-500'}`} />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{r.examTitle}</p>
                  <p className="text-xs text-gray-400">{r.marksObtained}/{r.totalMarks} marks</p>
                </div>
                <div className="text-right">
                  <p className={`text-lg font-bold ${r.percentage >= 80 ? 'text-emerald-600' : r.percentage >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                    {r.grade}
                  </p>
                  <p className="text-xs text-gray-400">{r.percentage}%</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
}
