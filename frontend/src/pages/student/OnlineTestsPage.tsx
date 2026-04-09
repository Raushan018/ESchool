import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, CheckCircle, AlertTriangle, ChevronLeft, ChevronRight,
  RefreshCw, CalendarDays, BookOpenCheck, Play, Eye,
  Target, ClipboardList, RotateCcw, Trophy,
} from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { useStudentId } from '../../hooks/useStudentId';
import { StatusBadge } from '../../components/ui/Badge';
import type { Exam } from '../../types';

// ─── Demo Test ─────────────────────────────────────────────────────────────────
// const DEMO_QUESTIONS: ExamQuestion[] = [
//   { id: 'd1', question: 'What does CPU stand for?', options: ['Central Process Unit', 'Central Processing Unit', 'Computer Personal Unit', 'Core Processing Unit'], correctAnswer: 1, marks: 2 },
//   { id: 'd2', question: 'Which data structure follows the LIFO principle?', options: ['Queue', 'Array', 'Stack', 'Linked List'], correctAnswer: 2, marks: 2 },
//   { id: 'd3', question: 'What is the time complexity of Binary Search?', options: ['O(n)', 'O(n²)', 'O(log n)', 'O(n log n)'], correctAnswer: 2, marks: 2 },
//   { id: 'd4', question: 'Which of the following is NOT an OOP language?', options: ['Java', 'Python', 'C', 'C++'], correctAnswer: 2, marks: 2 },
//   { id: 'd5', question: 'What does HTML stand for?', options: ['Hyper Transfer Markup Language', 'HyperText Markup Language', 'High Text Machine Language', 'Hyper Tool Multi Language'], correctAnswer: 1, marks: 2 },
//   { id: 'd6', question: 'Which sorting algorithm has the best average-case complexity?', options: ['Bubble Sort', 'Insertion Sort', 'Merge Sort', 'Selection Sort'], correctAnswer: 2, marks: 2 },
//   { id: 'd7', question: 'What is the primary function of an operating system?', options: ['Run web browsers', 'Manage hardware and software resources', 'Compile programs', 'Connect to the internet'], correctAnswer: 1, marks: 2 },
//   { id: 'd8', question: 'In a relational database, a "primary key" is used to:', options: ['Sort data alphabetically', 'Uniquely identify each record', 'Encrypt data', 'Link two databases'], correctAnswer: 1, marks: 2 },
// ];

// const DEMO_EXAM: Exam = {
//   id: 'demo', title: 'CS Practice Quiz', courseId: 'demo',
//   courseName: 'General CS Practice', type: 'quiz',
//   date: new Date().toISOString(), duration: 10,
//   totalMarks: 16, passingMarks: 10, status: 'ongoing',
//   instructions: 'Practice test — no data is saved. Select the best answer for each question.',
//   questions: DEMO_QUESTIONS,
// };

// ─── Types ─────────────────────────────────────────────────────────────────────
type View = 'list' | 'instructions' | 'test' | 'result' | 'review';
interface TestSession {
  exam: Exam;
  answers: (number | null)[];
  currentQ: number;
  timeLeft: number;
  submitted: boolean;
  score?: number;
  startedAt: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

// ─── Live Clock ────────────────────────────────────────────────────────────────
function LiveClock() {
  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-600 text-white font-mono text-sm font-bold shadow-sm">
      <Clock className="w-4 h-4 text-brand-200" />
      {time.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
    </div>
  );
}

// ─── Countdown Timer ──────────────────────────────────────────────────────────
function Timer({ seconds }: { seconds: number }) {
  const m = Math.floor(seconds / 60), s = seconds % 60;
  const isLow = seconds < 120, isVeryLow = seconds < 60;
  return (
    <div className={`flex items-center gap-2 px-4 py-2 rounded-xl font-mono text-sm font-bold transition-colors ${
      isVeryLow ? 'bg-red-500 text-white animate-pulse' :
      isLow ? 'bg-red-50 dark:bg-red-900/20 text-red-600' :
      'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200'}`}>
      <Clock className="w-4 h-4" />
      {String(m).padStart(2, '0')}:{String(s).padStart(2, '0')}
    </div>
  );
}

// ─── Instructions Screen ──────────────────────────────────────────────────────
function InstructionsScreen({ exam, studentName, onBegin, onBack }: {
  exam: Exam; studentName: string; onBegin: () => void; onBack: () => void;
}) {
  const rules = [
    'Read every question carefully before selecting your answer.',
    'Use the question palette to jump between questions at any time.',
    'Answered questions are highlighted in green in the palette.',
    'You may change your answer any time before final submission.',
    'The exam auto-submits when the countdown reaches zero.',
    'Once submitted, answers cannot be modified.',
    'Do not refresh or close the tab during the exam.',
  ];
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-4">

      {/* Welcome */}
      <div className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            Welcome, <span className="font-bold">{studentName}</span> — please read the instructions before starting.
          </p>
        </div>
        <LiveClock />
      </div>

      {/* Exam info card */}
      <div className="rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-sm">
        <div className="bg-gradient-to-r from-brand-600 to-indigo-600 p-6 text-white">
          <p className="text-brand-200 text-xs font-semibold uppercase tracking-wider mb-1">{exam.courseName}</p>
          <h2 className="text-xl font-black">{exam.title}</h2>
          <div className="flex flex-wrap items-center gap-5 mt-4 text-sm text-brand-100">
            <span className="flex items-center gap-1.5"><ClipboardList className="w-4 h-4" />{exam.questions?.length} Questions</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4" />{exam.duration} Minutes</span>
            <span className="flex items-center gap-1.5"><Target className="w-4 h-4" />{exam.totalMarks} Total Marks</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4" />{exam.passingMarks} Passing Marks</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 p-6 space-y-5">
          {/* Instructions list */}
          <div>
            <h3 className="text-sm font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-3">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Instructions
            </h3>
            <div className="border border-gray-100 dark:border-gray-800 rounded-xl overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
              {rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-2.5">
                  <span className="w-5 h-5 rounded-full bg-brand-100 dark:bg-brand-900/40 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{rule}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex gap-3">
            <button onClick={onBack} className="flex-1 py-3 rounded-xl border-2 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 font-semibold text-sm hover:bg-white hover:border-brand-600 hover:text-brand-600 transition-colors">
              ← Go Back
            </button>
            <button onClick={onBegin} className="flex-[2] py-3 rounded-xl bg-brand-600 text-white font-bold text-sm flex items-center justify-center gap-2 hover:bg-white hover:text-brand-600 hover:border-brand-600 border border-transparent transition-colors shadow-sm">
              <Play className="w-4 h-4 fill-current" /> Start Exam
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Test Interface ────────────────────────────────────────────────────────────
function TestInterface({ session, onAnswer, onNavigate, onSubmit }: {
  session: TestSession;
  onAnswer: (idx: number) => void;
  onNavigate: (idx: number) => void;
  onSubmit: () => void;
}) {
  const qs = session.exam.questions!;
  const q = qs[session.currentQ];
  const answered = session.answers.filter((a) => a !== null).length;
  const pct = Math.round((answered / qs.length) * 100);

  return (
    <div className="max-w-5xl mx-auto space-y-3">
      {/* Top bar */}
      <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 px-5 py-3 flex items-center gap-4 shadow-sm">
        <BookOpenCheck className="w-5 h-5 text-brand-500 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="font-bold text-gray-900 dark:text-white text-sm truncate">{session.exam.title}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <motion.div className="h-full bg-brand-500 rounded-full" animate={{ width: `${pct}%` }} transition={{ duration: 0.4 }} />
            </div>
            <span className="text-xs text-gray-400 whitespace-nowrap">{answered}/{qs.length} answered</span>
          </div>
        </div>
        <Timer seconds={session.timeLeft} />
        <button onClick={onSubmit} className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-white hover:text-emerald-600 hover:border-emerald-600 border border-transparent transition-colors">
          Submit
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-3">
        {/* Question */}
        <div className="lg:col-span-3 space-y-3">
          <AnimatePresence mode="wait">
            <motion.div key={session.currentQ}
              initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}
              transition={{ duration: 0.2 }}
              className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-6 shadow-sm"
            >
              <div className="flex items-start gap-3 mb-6">
                <div className="w-9 h-9 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {session.currentQ + 1}
                </div>
                <p className="text-base font-semibold text-gray-900 dark:text-white leading-relaxed pt-1">{q.question}</p>
              </div>
              <div className="space-y-2.5">
                {q.options.map((opt, oi) => {
                  const sel = session.answers[session.currentQ] === oi;
                  return (
                    <motion.button key={oi} whileTap={{ scale: 0.985 }} onClick={() => onAnswer(oi)}
                      className={`w-full text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-150 flex items-center gap-3 ${
                        sel ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20 text-brand-700 dark:text-brand-300'
                            : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-brand-200 hover:bg-gray-50 dark:hover:bg-gray-800/60'}`}
                    >
                      <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 transition-colors ${sel ? 'bg-brand-500 text-white' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                        {['A', 'B', 'C', 'D'][oi]}
                      </span>
                      {opt}
                    </motion.button>
                  );
                })}
              </div>
              <p className="text-xs text-gray-400 mt-4 text-right">{q.marks} mark{q.marks > 1 ? 's' : ''} · Q{session.currentQ + 1} of {qs.length}</p>
            </motion.div>
          </AnimatePresence>

          <div className="flex items-center justify-between">
            <button onClick={() => onNavigate(session.currentQ - 1)} disabled={session.currentQ === 0}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 text-sm font-medium hover:bg-white hover:border-brand-600 hover:text-brand-600 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
            {session.currentQ < qs.length - 1 ? (
              <button onClick={() => onNavigate(session.currentQ + 1)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors">
                Next <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={onSubmit}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors">
                <CheckCircle className="w-4 h-4" /> Finish Exam
              </button>
            )}
          </div>
        </div>

        {/* Palette sidebar */}
        <div className="lg:col-span-1">
          <div className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4 shadow-sm sticky top-4">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Question Palette</p>
            <div className="grid grid-cols-5 gap-1.5 mb-4">
              {qs.map((_, i) => (
                <button key={i} onClick={() => onNavigate(i)}
                  className={`h-8 rounded-lg text-xs font-semibold transition-all ${
                    i === session.currentQ ? 'bg-brand-600 text-white ring-2 ring-brand-300 dark:ring-brand-700' :
                    session.answers[i] !== null ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' :
                    'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  {i + 1}
                </button>
              ))}
            </div>
            <div className="space-y-1.5 text-xs text-gray-500 border-t border-gray-100 dark:border-gray-800 pt-3 mb-3">
              {[['bg-brand-600', 'Current'], ['bg-emerald-100 dark:bg-emerald-900/30', 'Answered'], ['bg-gray-100 dark:bg-gray-800', 'Not visited']].map(([bg, label]) => (
                <div key={label} className="flex items-center gap-2"><span className={`w-4 h-4 rounded ${bg} inline-block`} />{label}</div>
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-emerald-50 dark:bg-emerald-900/20 rounded-xl p-2 text-center">
                <p className="text-lg font-black text-emerald-600">{answered}</p>
                <p className="text-[10px] text-emerald-600 font-medium">Answered</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-2 text-center">
                <p className="text-lg font-black text-gray-500">{qs.length - answered}</p>
                <p className="text-[10px] text-gray-400 font-medium">Remaining</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Result Screen ─────────────────────────────────────────────────────────────
function ResultScreen({ session, onBack, onReview }: { session: TestSession; onBack: () => void; onReview: () => void }) {
  const score = session.score ?? 0;
  const qs = session.exam.questions!;
  const passed = score >= Math.round((session.exam.passingMarks / session.exam.totalMarks) * 100);
  const correct = session.answers.filter((a, i) => a === qs[i].correctAnswer).length;
  const wrong = session.answers.filter((a, i) => a !== null && a !== qs[i].correctAnswer).length;
  const skipped = session.answers.filter((a) => a === null).length;
  const timeTaken = session.exam.duration * 60 - session.timeLeft;
  const grade = score >= 90 ? 'A+' : score >= 80 ? 'A' : score >= 70 ? 'B' : score >= 60 ? 'C' : score >= 50 ? 'D' : 'F';

  return (
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-w-2xl mx-auto space-y-4">
      <div className={`rounded-2xl overflow-hidden shadow-lg border-2 ${passed ? 'border-emerald-200 dark:border-emerald-700' : 'border-red-200 dark:border-red-800'}`}>
        <div className={`p-8 text-center ${passed ? 'bg-gradient-to-br from-emerald-400 to-teal-500' : 'bg-gradient-to-br from-red-400 to-rose-500'}`}>
          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 200, delay: 0.1 }}
            className="w-24 h-24 rounded-full bg-white/20 backdrop-blur flex items-center justify-center mx-auto mb-3">
            {passed ? <Trophy className="w-12 h-12 text-white" /> : <RotateCcw className="w-12 h-12 text-white" />}
          </motion.div>
          <h2 className="text-2xl font-black text-white">{passed ? 'Excellent Work!' : 'Keep Practising!'}</h2>
          <p className="text-white/80 text-sm mt-1">{session.exam.title}</p>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="text-7xl font-black text-white mt-5">{score}%</div>
            <div className="text-white/70 text-sm mt-1">Grade: <span className="text-white font-bold text-lg">{grade}</span></div>
          </motion.div>
        </div>
        <div className="bg-white dark:bg-gray-900 p-5">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { label: 'Correct', value: correct, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'Wrong', value: wrong, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' },
              { label: 'Skipped', value: skipped, color: 'text-gray-500', bg: 'bg-gray-50 dark:bg-gray-800' },
              { label: 'Time', value: `${Math.floor(timeTaken / 60)}m ${timeTaken % 60}s`, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                <p className={`text-xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-gray-400 font-medium mt-0.5">{label}</p>
              </div>
            ))}
          </div>
          <div className="mb-5">
            <div className="flex justify-between text-xs text-gray-500 mb-1.5">
              <span>Your score</span>
              <span>Passing: {Math.round((session.exam.passingMarks / session.exam.totalMarks) * 100)}%</span>
            </div>
            <div className="relative h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div className="absolute top-0 bottom-0 w-0.5 bg-amber-400 z-10"
                style={{ left: `${Math.round((session.exam.passingMarks / session.exam.totalMarks) * 100)}%` }} />
              <motion.div className={`h-full rounded-full ${passed ? 'bg-emerald-500' : 'bg-red-500'}`}
                initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 1, delay: 0.3 }} />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={onReview} className="flex-1 py-2.5 rounded-xl border-2 border-brand-200 dark:border-brand-700 text-brand-600 dark:text-brand-400 font-semibold text-sm flex items-center justify-center gap-2 hover:bg-white hover:border-brand-600 transition-colors">
              <Eye className="w-4 h-4" /> Review Answers
            </button>
            <button onClick={onBack} className="flex-1 py-2.5 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-white hover:text-brand-600 hover:border-brand-600 border border-transparent transition-colors">
              Back to Exams
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ─── Review Screen ─────────────────────────────────────────────────────────────
function ReviewScreen({ session, onBack }: { session: TestSession; onBack: () => void }) {
  const qs = session.exam.questions!;
  return (
    <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-white hover:border-brand-600 transition-colors">
          <ChevronLeft className="w-4 h-4 text-gray-600 dark:text-gray-400 hover:text-brand-600" />
        </button>
        <div>
          <h2 className="font-bold text-gray-900 dark:text-white">Answer Review</h2>
          <p className="text-xs text-gray-400">{session.exam.title}</p>
        </div>
      </div>
      {qs.map((q, i) => {
        const userAns = session.answers[i];
        const isCorrect = userAns === q.correctAnswer;
        const isSkipped = userAns === null;
        return (
          <motion.div key={q.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
            className={`rounded-2xl border-2 p-5 bg-white dark:bg-gray-900 ${isSkipped ? 'border-gray-200 dark:border-gray-700' : isCorrect ? 'border-emerald-200 dark:border-emerald-700' : 'border-red-200 dark:border-red-700'}`}>
            <div className="flex items-start gap-3 mb-4">
              <span className={`w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center flex-shrink-0 ${isSkipped ? 'bg-gray-100 dark:bg-gray-800 text-gray-500' : isCorrect ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 'bg-red-100 dark:bg-red-900/30 text-red-600'}`}>{i + 1}</span>
              <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">{q.question}</p>
              <div className="ml-auto flex-shrink-0">
                {isSkipped ? <span className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-1 rounded-lg font-medium">Skipped</span>
                  : isCorrect ? <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-2 py-1 rounded-lg font-medium">+{q.marks}</span>
                  : <span className="text-xs bg-red-100 dark:bg-red-900/30 text-red-600 px-2 py-1 rounded-lg font-medium">0</span>}
              </div>
            </div>
            <div className="space-y-1.5 ml-10">
              {q.options.map((opt, oi) => {
                const isSel = userAns === oi, isRight = q.correctAnswer === oi;
                return (
                  <div key={oi} className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm ${isRight ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300 font-medium' : isSel && !isRight ? 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 line-through' : 'text-gray-500 dark:text-gray-500'}`}>
                    <span className={`w-5 h-5 rounded-md text-xs font-bold flex items-center justify-center flex-shrink-0 ${isRight ? 'bg-emerald-200 dark:bg-emerald-800 text-emerald-700' : isSel ? 'bg-red-200 dark:bg-red-800 text-red-600' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>{['A', 'B', 'C', 'D'][oi]}</span>
                    {opt}
                    {isRight && <CheckCircle className="w-3.5 h-3.5 text-emerald-500 ml-auto flex-shrink-0" />}
                  </div>
                );
              })}
            </div>
          </motion.div>
        );
      })}
      <button onClick={onBack} className="w-full py-3 rounded-xl bg-brand-600 text-white font-semibold text-sm hover:bg-white hover:text-brand-600 hover:border-brand-600 border border-transparent transition-colors">
        ← Back to Results
      </button>
    </motion.div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function OnlineTestsPage() {
  useAuthStore();
  const { students, courses, exams, results } = useDataStore();
  const [view, setView] = useState<View>('list');
  const [pendingExam, setPendingExam] = useState<Exam | null>(null);
  const [session, setSession] = useState<TestSession | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [spinning, setSpinning] = useState(false);

  const studentId = useStudentId();
  const student = students.find((s) => s.id === studentId);
  const myCourses = courses.filter((c) => student?.enrolledCourses.includes(c.id));
  const availableExams = exams.filter((e) =>
    e.status === 'ongoing' &&
    myCourses.some((c) => c.id === e.courseId) &&
    e.questions && e.questions.length > 0
  );
  const allExams = exams.filter((e) => myCourses.some((c) => c.id === e.courseId));
  // const completedExams = allExams.filter((e) => e.status === 'completed');

  // Timer
  useEffect(() => {
    if (!session || session.submitted || view !== 'test') return;
    if (session.timeLeft <= 0) { submitTest(); return; }
    const t = setInterval(() => setSession((p) => p ? { ...p, timeLeft: p.timeLeft - 1 } : null), 1000);
    return () => clearInterval(t);
  }, [session?.timeLeft, session?.submitted, view]);

  const handleStart = (exam: Exam) => { setPendingExam(exam); setView('instructions'); };
  const handleBegin = () => {
    if (!pendingExam?.questions) return;
    setSession({ exam: pendingExam, answers: new Array(pendingExam.questions.length).fill(null), currentQ: 0, timeLeft: pendingExam.duration * 60, submitted: false, startedAt: Date.now() });
    setView('test');
  };
  const selectAnswer = (oi: number) => setSession((p) => { if (!p) return null; const a = [...p.answers]; a[p.currentQ] = oi; return { ...p, answers: a }; });
  const submitTest = useCallback(() => {
    if (!session?.exam.questions) return;
    let earned = 0;
    session.exam.questions.forEach((q, i) => { if (session.answers[i] === q.correctAnswer) earned += q.marks; });
    setSession((p) => p ? { ...p, submitted: true, score: Math.round((earned / p.exam.totalMarks) * 100) } : null);
    setView('result');
  }, [session]);
  const resetToList = () => { setSession(null); setPendingExam(null); setView('list'); };
  const handleRefresh = () => { setSpinning(true); setRefreshKey((k) => k + 1); setTimeout(() => setSpinning(false), 600); };

  if (view === 'instructions' && pendingExam)
    return <InstructionsScreen exam={pendingExam} studentName={student?.name ?? 'Student'} onBegin={handleBegin} onBack={resetToList} />;
  if (view === 'test' && session)
    return <TestInterface session={session} onAnswer={selectAnswer} onNavigate={(i) => setSession((p) => p ? { ...p, currentQ: i } : null)} onSubmit={submitTest} />;
  if (view === 'result' && session)
    return <ResultScreen session={session} onBack={resetToList} onReview={() => setView('review')} />;
  if (view === 'review' && session)
    return <ReviewScreen session={session} onBack={() => setView('result')} />;

  // ── Exam List ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5" key={refreshKey}>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-gray-900 dark:text-white">Exams</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Home / Exams</p>
        </div>
        <LiveClock />
      </div>

      {/* Welcome banner */}
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 px-5 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
            Welcome, <span className="font-bold">{student?.name ?? 'Student'}</span>
            <span className="font-normal text-emerald-600 dark:text-emerald-400 ml-1">— Good luck with your exams!</span>
          </p>
        </div>
        <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">{student?.rollNumber}</span>
      </motion.div>

      {/* Instructions panel */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
        className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3 border-b border-amber-200 dark:border-amber-800">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <h2 className="text-sm font-bold text-amber-800 dark:text-amber-400">Instructions</h2>
        </div>
        <ul className="px-5 py-3 space-y-1.5">
          {[
            'Students are advised to start their examination not later than 15 minutes of exam start time.',
            'Ensure a stable internet connection before beginning any exam.',
            'Once started, the timer cannot be paused. Auto-submission occurs when time expires.',
          ].map((rule, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-amber-800 dark:text-amber-300">
              <span className="text-amber-500 mt-0.5 flex-shrink-0">•</span>{rule}
            </li>
          ))}
        </ul>
      </motion.div>

      {/* Available For Examination Now */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-sm font-bold text-gray-900 dark:text-white">Subjects Available For Examination Now</h2>
          </div>
          <button onClick={handleRefresh}
            className="p-2 rounded-lg bg-brand-600 text-white hover:bg-white hover:text-brand-600 hover:border-brand-600 border border-transparent transition-colors">
            <RefreshCw className={`w-4 h-4 transition-transform duration-500 ${spinning ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {availableExams.length === 0 ? (
          <div className="px-5 py-6 flex items-center gap-3 bg-red-50 dark:bg-red-900/10 m-4 rounded-xl border border-red-100 dark:border-red-800">
            <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <p className="text-sm text-red-600 dark:text-red-400 font-medium">No Paper Found. Check back later or contact your instructor.</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            {availableExams.map((exam, i) => (
              <motion.div key={exam.id} initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.07 }}
                className="w-full rounded-2xl border-2 border-brand-100 dark:border-brand-800 bg-gradient-to-r from-brand-50 via-indigo-50 to-white dark:from-brand-900/20 dark:via-indigo-900/10 dark:to-gray-900 px-6 py-5 flex items-center gap-6 hover:shadow-md hover:border-brand-300 dark:hover:border-brand-600 transition-all group">
                {/* Left — icon */}
                <div className="w-12 h-12 rounded-xl bg-brand-600 flex items-center justify-center flex-shrink-0 shadow-md shadow-brand-200 dark:shadow-brand-900/40">
                  <BookOpenCheck className="w-6 h-6 text-white" />
                </div>

                {/* Title + course */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug">{exam.title}</h3>
                    <StatusBadge status={exam.status} />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{exam.courseName}</p>
                </div>

                {/* Stats */}
                <div className="hidden sm:flex items-center gap-1 flex-shrink-0">
                  {[
                    { icon: ClipboardList, label: 'Questions', value: exam.questions?.length ?? 0 },
                    { icon: Clock, label: 'Duration', value: `${exam.duration} min` },
                    { icon: Target, label: 'Total Marks', value: exam.totalMarks },
                    { icon: CheckCircle, label: 'Passing', value: exam.passingMarks },
                  ].map(({ icon: Icon, label, value }, si) => (
                    <div key={label} className={`flex flex-col items-center px-4 py-2 ${si < 3 ? 'border-r border-gray-200 dark:border-gray-700' : ''}`}>
                      <Icon className="w-4 h-4 text-gray-400 mb-1" />
                      <p className="text-sm font-black text-gray-900 dark:text-white">{value}</p>
                      <p className="text-[10px] text-gray-400 font-medium">{label}</p>
                    </div>
                  ))}
                </div>

                {/* CTA */}
                <button onClick={() => handleStart(exam)}
                  className="flex-shrink-0 px-6 py-3 rounded-xl bg-brand-600 text-white text-sm font-bold flex items-center gap-2 hover:bg-white hover:text-brand-600 hover:border-brand-600 border border-transparent transition-colors shadow-sm group-hover:shadow-md">
                  <Play className="w-4 h-4 fill-current" /> Start Exam
                </button>
              </motion.div>
            ))}

          </div>
        )}
      </motion.div>

      {/* List of All Subjects */}
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
        className="rounded-2xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
        <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
          <CalendarDays className="w-4 h-4 text-brand-500" />
          <h2 className="text-sm font-bold text-gray-900 dark:text-white">List of All Subjects</h2>
          <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 px-2 py-0.5 rounded-full font-medium">{allExams.length} exams</span>
        </div>
        <div className="divide-y divide-gray-50 dark:divide-gray-800/50">
          {allExams.map((exam, i) => {
            const myResult = results.find((r) => r.examId === exam.id && r.studentId === studentId);
            return (
              <motion.div key={exam.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${exam.status === 'ongoing' ? 'bg-emerald-500' : exam.status === 'upcoming' ? 'bg-amber-400' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{exam.title}</p>
                  <p className="text-xs text-gray-400 mt-0.5 flex items-center gap-2">
                    <span>{exam.courseName}</span>
                    <span>·</span>
                    <CalendarDays className="w-3 h-3" />
                    <span>{fmtDate(exam.date)}</span>
                    <span>·</span>
                    <Clock className="w-3 h-3" />
                    <span>{exam.duration} min</span>
                  </p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {myResult ? (
                    <div className="text-right">
                      <p className={`text-sm font-black ${myResult.percentage >= 80 ? 'text-emerald-600' : myResult.percentage >= 60 ? 'text-amber-600' : 'text-red-500'}`}>{myResult.grade}</p>
                      <p className="text-[10px] text-gray-400">{myResult.percentage}%</p>
                    </div>
                  ) : null}
                  <StatusBadge status={exam.status} />
                </div>
              </motion.div>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
}
