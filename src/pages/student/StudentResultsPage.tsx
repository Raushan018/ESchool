import { motion } from 'framer-motion';
import { Trophy, TrendingUp, Award, Target } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { useDataStore } from '../../store/dataStore';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate, getGradeColor } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function StudentResultsPage() {
  const { user } = useAuthStore();
  const { results, exams } = useDataStore();

  const myResults = results.filter((r) => r.studentId === user?.id);
  const avgScore = myResults.length > 0 ? Math.round(myResults.reduce((a, r) => a + r.percentage, 0) / myResults.length) : 0;
  const bestScore = myResults.length > 0 ? Math.max(...myResults.map((r) => r.percentage)) : 0;
  const passCount = myResults.filter((r) => r.status === 'pass').length;

  const chartData = myResults.map((r) => ({
    name: r.examTitle.split(' ').slice(0, 2).join(' '),
    score: r.percentage,
    marks: r.marksObtained,
    total: r.totalMarks,
  }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Results</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Track your academic performance and scores</p>
      </div>

      {myResults.length === 0 ? (
        <div className="card">
          <EmptyState icon={Trophy} title="No results yet" description="Your exam results will appear here once published." />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: 'Exams Taken', value: myResults.length, icon: Target, color: 'text-brand-600', bg: 'bg-brand-50 dark:bg-brand-900/20' },
              { label: 'Average Score', value: `${avgScore}%`, icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
              { label: 'Best Score', value: `${bestScore}%`, icon: Award, color: 'text-amber-600', bg: 'bg-amber-50 dark:bg-amber-900/20' },
              { label: 'Tests Passed', value: `${passCount}/${myResults.length}`, icon: Trophy, color: 'text-sky-600', bg: 'bg-sky-50 dark:bg-sky-900/20' },
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

          {/* Score Chart */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="card p-5">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Performance History</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="text-gray-100 dark:text-gray-800" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                <Tooltip formatter={(v) => [`${v}%`, 'Score']} />
                <Bar dataKey="score" fill="#6366f1" radius={[4, 4, 0, 0]} name="Score %" />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>

          {/* Results List */}
          <div className="space-y-3">
            {myResults.map((result, i) => {
              const exam = exams.find((e) => e.id === result.examId);
              return (
                <motion.div
                  key={result.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="card-hover p-5 flex items-center gap-5"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                    result.percentage >= 80 ? 'bg-emerald-50 dark:bg-emerald-900/20' :
                    result.percentage >= 60 ? 'bg-amber-50 dark:bg-amber-900/20' :
                    'bg-red-50 dark:bg-red-900/20'
                  }`}>
                    <span className={`text-xl font-black ${getGradeColor(result.grade)}`}>{result.grade}</span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white">{result.examTitle}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                      {exam?.courseName} · {exam && exam.type ? exam.type.charAt(0).toUpperCase() + exam.type.slice(1) : ''}
                    </p>
                    <p className="text-xs text-gray-400 mt-1">{formatDate(result.submittedAt)}</p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <p className={`text-lg font-bold ${result.percentage >= 80 ? 'text-emerald-600' : result.percentage >= 60 ? 'text-amber-600' : 'text-red-500'}`}>
                      {result.percentage}%
                    </p>
                    <p className="text-xs text-gray-400">{result.marksObtained}/{result.totalMarks} marks</p>
                    <div className="mt-1">
                      <StatusBadge status={result.status} />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
