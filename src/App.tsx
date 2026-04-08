import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useUIStore } from './store/uiStore';
import { useAuthStore } from './store/authStore';

// Layouts
import { AdminLayout } from './layouts/AdminLayout';
import { StudentLayout } from './layouts/StudentLayout';

// Auth
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { AuthGuard } from './components/shared/AuthGuard';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StudentsPage } from './pages/admin/StudentsPage';
import { TeachersPage } from './pages/admin/TeachersPage';
import { CoursesPage } from './pages/admin/CoursesPage';
import { AttendancePage } from './pages/admin/AttendancePage';
import { FeesPage } from './pages/admin/FeesPage';
import { ExamsPage } from './pages/admin/ExamsPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { MyCoursesPage } from './pages/student/MyCoursesPage';
import { StudyMaterialsPage } from './pages/student/StudyMaterialsPage';
import { OnlineTestsPage } from './pages/student/OnlineTestsPage';
import { StudentResultsPage } from './pages/student/StudentResultsPage';
import { StudentAttendancePage } from './pages/student/StudentAttendancePage';
import { StudentFeesPage } from './pages/student/StudentFeesPage';
import { CourseDetailPage } from './pages/student/CourseDetailPage';

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <Navigate to={user?.role === 'admin' ? '/admin' : '/student'} replace />;
}

export default function App() {
  const { theme } = useUIStore();

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <AuthGuard requireRole="admin">
              <AdminLayout />
            </AuthGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="courses" element={<CoursesPage />} />
          <Route path="attendance" element={<AttendancePage />} />
          <Route path="fees" element={<FeesPage />} />
          <Route path="exams" element={<ExamsPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
        </Route>

        {/* Student Routes */}
        <Route
          path="/student"
          element={
            <AuthGuard requireRole="student">
              <StudentLayout />
            </AuthGuard>
          }
        >
          <Route index element={<StudentDashboard />} />
          <Route path="courses" element={<MyCoursesPage />} />
          <Route path="materials" element={<StudyMaterialsPage />} />
          <Route path="tests" element={<OnlineTestsPage />} />
          <Route path="results" element={<StudentResultsPage />} />
          <Route path="attendance" element={<StudentAttendancePage />} />
          <Route path="fees" element={<StudentFeesPage />} />
          <Route path="courses/:courseId" element={<CourseDetailPage />} />
        </Route>

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
