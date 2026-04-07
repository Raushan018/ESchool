import { create } from 'zustand';
import type { Student, Teacher, Course, FeeRecord, AttendanceRecord, Exam, ExamResult, Notification } from '../types';
import {
  STUDENTS, TEACHERS, COURSES, ATTENDANCE,
  FEES, EXAMS, EXAM_RESULTS, NOTIFICATIONS,
} from '../data/mockData';

interface DataState {
  students: Student[];
  teachers: Teacher[];
  courses: Course[];
  fees: FeeRecord[];
  attendance: AttendanceRecord[];
  exams: Exam[];
  results: ExamResult[];
  notifications: Notification[];

  // Students
  addStudent: (s: Student) => void;
  updateStudent: (id: string, data: Partial<Student>) => void;
  deleteStudent: (id: string) => void;

  // Teachers
  addTeacher: (t: Teacher) => void;
  updateTeacher: (id: string, data: Partial<Teacher>) => void;
  deleteTeacher: (id: string) => void;

  // Courses
  addCourse: (c: Course) => void;
  updateCourse: (id: string, data: Partial<Course>) => void;
  deleteCourse: (id: string) => void;

  // Fees
  updateFee: (id: string, data: Partial<FeeRecord>) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
  markAllRead: () => void;
}

export const useDataStore = create<DataState>()((set) => ({
  students: STUDENTS,
  teachers: TEACHERS,
  courses: COURSES,
  fees: FEES,
  attendance: ATTENDANCE,
  exams: EXAMS,
  results: EXAM_RESULTS,
  notifications: NOTIFICATIONS,

  addStudent: (s) => set((state) => ({ students: [...state.students, s] })),
  updateStudent: (id, data) =>
    set((state) => ({
      students: state.students.map((s) => (s.id === id ? { ...s, ...data } : s)),
    })),
  deleteStudent: (id) =>
    set((state) => ({ students: state.students.filter((s) => s.id !== id) })),

  addTeacher: (t) => set((state) => ({ teachers: [...state.teachers, t] })),
  updateTeacher: (id, data) =>
    set((state) => ({
      teachers: state.teachers.map((t) => (t.id === id ? { ...t, ...data } : t)),
    })),
  deleteTeacher: (id) =>
    set((state) => ({ teachers: state.teachers.filter((t) => t.id !== id) })),

  addCourse: (c) => set((state) => ({ courses: [...state.courses, c] })),
  updateCourse: (id, data) =>
    set((state) => ({
      courses: state.courses.map((c) => (c.id === id ? { ...c, ...data } : c)),
    })),
  deleteCourse: (id) =>
    set((state) => ({ courses: state.courses.filter((c) => c.id !== id) })),

  updateFee: (id, data) =>
    set((state) => ({
      fees: state.fees.map((f) => (f.id === id ? { ...f, ...data } : f)),
    })),

  markNotificationRead: (id) =>
    set((state) => ({
      notifications: state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      ),
    })),

  markAllRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
    })),
}));
