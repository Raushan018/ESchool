// ─── Auth ───────────────────────────────────────────────────────────────────
export type UserRole = 'admin' | 'student';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
}

// ─── Student ────────────────────────────────────────────────────────────────
export interface Student {
  id: string;
  rollNumber: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  department: string;
  batch: string;
  enrolledCourses: string[];
  joinDate: string;
  status: 'active' | 'inactive' | 'suspended';
  address: string;
  guardianName: string;
  guardianPhone: string;
  dateOfBirth: string;
}

// ─── Teacher ────────────────────────────────────────────────────────────────
export interface Teacher {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  avatar?: string;
  department: string;
  subjects: string[];
  qualification: string;
  joinDate: string;
  status: 'active' | 'inactive';
  salary: number;
  experience: number;
}

// ─── Course ─────────────────────────────────────────────────────────────────
export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  teacherId: string;
  teacherName: string;
  department: string;
  batch: string;
  credits: number;
  duration: string;
  enrolledCount: number;
  maxCapacity: number;
  thumbnail?: string;
  status: 'active' | 'completed' | 'upcoming';
  startDate: string;
  endDate: string;
  materials: CourseMaterial[];
  schedule: string;
}

export interface CourseMaterial {
  id: string;
  title: string;
  type: 'pdf' | 'video' | 'link' | 'doc';
  url: string;
  size?: string;
  uploadedAt: string;
  description?: string;
}

// ─── Attendance ──────────────────────────────────────────────────────────────
export interface AttendanceRecord {
  id: string;
  studentId: string;
  courseId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string;
}

export interface AttendanceSummary {
  studentId: string;
  courseId: string;
  courseName: string;
  totalClasses: number;
  present: number;
  absent: number;
  late: number;
  percentage: number;
}

// ─── Fee ────────────────────────────────────────────────────────────────────
export interface FeeRecord {
  id: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  amount: number;
  paid: number;
  due: number;
  dueDate: string;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue' | 'partial';
  semester: string;
  feeType: string;
  transactionId?: string;
}

// ─── Exam & Results ──────────────────────────────────────────────────────────
export interface Exam {
  id: string;
  title: string;
  courseId: string;
  courseName: string;
  type: 'midterm' | 'final' | 'quiz' | 'assignment';
  date: string;
  duration: number;
  totalMarks: number;
  passingMarks: number;
  status: 'upcoming' | 'ongoing' | 'completed';
  instructions?: string;
  questions?: ExamQuestion[];
}

export interface ExamQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  marks: number;
}

export interface ExamResult {
  id: string;
  examId: string;
  examTitle: string;
  studentId: string;
  marksObtained: number;
  totalMarks: number;
  percentage: number;
  grade: string;
  status: 'pass' | 'fail';
  submittedAt: string;
  answers?: number[];
}

// ─── Notification ────────────────────────────────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
}

// ─── Dashboard Stats ─────────────────────────────────────────────────────────
export interface AdminStats {
  totalStudents: number;
  totalTeachers: number;
  totalCourses: number;
  totalRevenue: number;
  pendingFees: number;
  activeExams: number;
  avgAttendance: number;
  newEnrollments: number;
}

export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: string | number;
}
