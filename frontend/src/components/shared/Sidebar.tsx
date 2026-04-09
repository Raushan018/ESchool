import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, GraduationCap, BookOpen,
  ClipboardList, DollarSign, FileText, BarChart3,
  ChevronLeft, ChevronRight, LogOut, Settings,
  CalendarCheck, Trophy, X,
} from 'lucide-react';
import logoImg from '../../assets/E-School logo with vibrant colors.png';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';
import { Avatar } from '../ui/Avatar';
import { cn } from '../../utils/cn';

type NavItem = { to: string; icon: React.FC<{ className?: string }>; label: string; end?: boolean };
type NavGroup = { group: string; items: NavItem[] };

const ADMIN_NAV: NavGroup[] = [
  { group: 'Overview', items: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  ]},
  { group: 'Management', items: [
    { to: '/admin/students', icon: GraduationCap, label: 'Students' },
    { to: '/admin/teachers', icon: Users, label: 'Teachers' },
    { to: '/admin/courses', icon: BookOpen, label: 'Courses' },
  ]},
  { group: 'Academic', items: [
    { to: '/admin/attendance', icon: CalendarCheck, label: 'Attendance' },
    { to: '/admin/exams', icon: FileText, label: 'Exams & Results' },
  ]},
  { group: 'Finance', items: [
    { to: '/admin/fees', icon: DollarSign, label: 'Fee Management' },
  ]},
  { group: 'Reports', items: [
    { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
  ]},
];

const STUDENT_NAV: NavGroup[] = [
  { group: 'Overview', items: [
    { to: '/student', icon: LayoutDashboard, label: 'Dashboard', end: true },
  ]},
  { group: 'Learning', items: [
    { to: '/student/courses', icon: BookOpen, label: 'My Courses' },
    { to: '/student/tests', icon: ClipboardList, label: 'Exams' },
  ]},
  { group: 'Academic', items: [
    { to: '/student/results', icon: Trophy, label: 'Results' },
    { to: '/student/attendance', icon: CalendarCheck, label: 'Attendance' },
  ]},
  { group: 'Finance', items: [
    { to: '/student/fees', icon: DollarSign, label: 'Fee Status' },
  ]},
];

interface SidebarProps {
  role: 'admin' | 'student';
}

export function Sidebar({ role }: SidebarProps) {
  const { user, logout } = useAuthStore();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();
  const nav = role === 'admin' ? ADMIN_NAV : STUDENT_NAV;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 z-20 lg:hidden"
            onClick={toggleSidebar}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        animate={{ width: sidebarOpen ? 240 : 64 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
        className={cn(
          'fixed left-0 top-0 bottom-0 z-30 flex flex-col',
          'bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800',
          'overflow-hidden shadow-sm',
          !sidebarOpen && 'lg:flex hidden'
        )}
        style={{ width: sidebarOpen ? 240 : 64 }}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-24 px-4 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
          <AnimatePresence mode="wait">
            {sidebarOpen ? (
              <motion.div
                key="expanded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2 overflow-hidden"
              >
                <img src={logoImg} alt="E-School" className="w-16 h-16 object-contain flex-shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-gray-900 dark:text-white leading-none truncate">E-School</p>
                  <p className="text-xs text-gray-400 mt-0.5">Smart Learning Platform</p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="collapsed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mx-auto"
              >
                <img src={logoImg} alt="E-School" className="w-12 h-12 object-contain" />
              </motion.div>
            )}
          </AnimatePresence>

          {sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors lg:flex hidden"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4 scrollbar-thin">
          {nav.map((group) => (
            <div key={group.group} className="mb-6">
              {sidebarOpen && (
                <p className="px-4 mb-2.5 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                  {group.group}
                </p>
              )}
              <ul className="space-y-0.5 px-2">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      end={item.end}
                      className={({ isActive }) =>
                        cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                          'group relative',
                          isActive
                            ? 'bg-brand-600 dark:bg-brand-700 text-white shadow-md shadow-brand-200 dark:shadow-brand-900/30'
                            : 'text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400'
                        )
                      }
                    >
                      {({ isActive }) => (
                        <>
                          <item.icon className={cn('w-4 h-4 flex-shrink-0 transition-transform duration-200', isActive ? '' : 'group-hover:scale-110')} />
                          {sidebarOpen && <span className="truncate">{item.label}</span>}
                          {!sidebarOpen && (
                            <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium rounded-lg shadow-lg
                                            opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                              {item.label}
                            </div>
                          )}
                        </>
                      )}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* User profile */}
        <div className="flex-shrink-0 p-4 border-t border-gray-200 dark:border-gray-700 space-y-2 bg-gray-50 dark:bg-gray-800/50">
          {/* Settings Button */}
          <button
            onClick={() => navigate(`/${role}/settings`)}
            className={cn('w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 text-gray-700 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20 hover:text-brand-600 dark:hover:text-brand-400 group relative', !sidebarOpen && 'justify-center')}
          >
            <Settings className="w-4 h-4 flex-shrink-0" />
            {sidebarOpen && <span className="truncate">Settings</span>}
            {!sidebarOpen && (
              <div className="absolute left-full ml-2 px-3 py-2 bg-gray-900 dark:bg-gray-800 text-white text-xs font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                Settings
              </div>
            )}
          </button>

          {/* User Profile */}
          <div className={cn('flex items-center gap-3 p-2.5 rounded-lg hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-all duration-200', !sidebarOpen && 'justify-center')}>
            <Avatar name={user?.name || ''} src={user?.avatar} size="sm" />
            {sidebarOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{user?.name}</p>
                <p className="text-xs text-gray-400 capitalize">{user?.role}</p>
              </div>
            )}
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/25 transition-all duration-200 hover:scale-110"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
          {!sidebarOpen && (
            <button
              onClick={toggleSidebar}
              className="w-full flex items-center justify-center p-2 rounded-lg text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-600 transition-colors mt-1"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </motion.aside>
    </>
  );
}
