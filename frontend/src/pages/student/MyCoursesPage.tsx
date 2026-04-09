import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Users, Clock, Calendar } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useStudentId } from '../../hooks/useStudentId';
import { StatusBadge } from '../../components/ui/Badge';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/helpers';
import dsaImg from '../../assets/DSA.png';
import dbmsImg from '../../assets/DBMS.png';
import osImg from '../../assets/os.png';
import defaultImg from '../../assets/education.gif';

const COURSE_IMAGES: Record<string, string> = {
  CS301: dsaImg,
  CS302: dbmsImg,
  CS201: osImg,
};

export function MyCoursesPage() {
  const navigate = useNavigate();
  const { students, courses } = useDataStore();
  const studentId = useStudentId();

  const student = students.find((s) => s.id === studentId);
  const myCourses = courses.filter((c) => student?.enrolledCourses.includes(c.id));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">You are enrolled in {myCourses.length} course{myCourses.length !== 1 ? 's' : ''}</p>
      </div>

      {myCourses.length === 0 ? (
        <div className="card">
          <EmptyState icon={BookOpen} title="No courses enrolled" description="Contact your administrator to enroll in courses." />
        </div>
      ) : (
        <div className="flex flex-wrap justify-center gap-10">
          {myCourses.map((course, i) => (
            <motion.div
              key={course.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              className="card-hover overflow-hidden w-64"
            >
              {/* Header */}
              <div className="relative h-40 bg-gradient-to-br from-brand-700 to-indigo-800 overflow-hidden">
                <img
                  src={COURSE_IMAGES[course.code] ?? defaultImg}
                  alt={course.name}
                  className="w-full h-full object-cover opacity-90"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-3">
                  <span className="text-xs font-mono bg-white/20 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">{course.code}</span>
                  <h3 className="mt-1 font-bold text-white text-sm leading-tight line-clamp-2">{course.name}</h3>
                </div>
                <div className="absolute top-2 right-2">
                  <StatusBadge status={course.status} />
                </div>
              </div>

              <div className="p-3">
                <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2">{course.description}</p>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <Users className="w-3 h-3 flex-shrink-0" />
                    <span>By {course.teacherName.split(' ').slice(-1)[0]}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                    <Clock className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{course.schedule}</span>
                  </div>
                  <div className="flex items-center justify-between text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1.5">
                      <BookOpen className="w-3 h-3 flex-shrink-0" />
                      <span>{course.credits} credits</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3 h-3 flex-shrink-0" />
                      <span>{formatDate(course.endDate)}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gray-500 dark:text-gray-400">Capacity</span>
                    <span className="text-gray-700 dark:text-gray-300">{course.enrolledCount}/{course.maxCapacity}</span>
                  </div>
                  <ProgressBar value={course.enrolledCount} max={course.maxCapacity} color="brand" />
                  <p className="text-xs text-gray-400 mt-2">{course.materials.length} material{course.materials.length !== 1 ? 's' : ''} available</p>
                </div>

                <button
                  onClick={() => navigate(`/student/courses/${course.id}`)}
                  className="mt-3 flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg bg-brand-50 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400 text-xs font-semibold border border-transparent hover:bg-white hover:border-brand-600 dark:hover:bg-white dark:hover:border-brand-600 dark:hover:text-brand-600 transition-colors"
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  Explore
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
