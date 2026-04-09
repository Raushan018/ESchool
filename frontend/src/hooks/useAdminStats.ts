import { useEffect, useState } from 'react';
import api from '../lib/api';

interface AdminStats {
  totalStudents: number;
  activeStudents: number;
  totalTeachers: number;
  activeTeachers: number;
  totalCourses: number;
  activeCourses: number;
  totalRevenue: number;
  pendingRevenue: number;
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [studentsRes, teachersRes, coursesRes, feesRes] = await Promise.all([
          api.get('/students/stats'),
          api.get('/teachers?limit=1'),
          api.get('/courses?limit=1'),
          api.get('/fees/summary'),
        ]);

        const studentSummary = studentsRes.data.data.summary;
        const teacherTotal = teachersRes.data.meta.total;
        const courseTotal = coursesRes.data.meta.total;

        const feeBreakdown: Array<{ _id: string; totalAmount: number; count: number }> =
          feesRes.data.data.breakdown;
        const paidEntry = feeBreakdown.find((b) => b._id === 'paid');
        const pendingEntry = feeBreakdown.find((b) => b._id === 'pending');

        setStats({
          totalStudents: studentSummary.total,
          activeStudents: studentSummary.total,
          totalTeachers: teacherTotal,
          activeTeachers: teacherTotal,
          totalCourses: courseTotal,
          activeCourses: courseTotal,
          totalRevenue: paidEntry?.totalAmount ?? 0,
          pendingRevenue: pendingEntry?.totalAmount ?? 0,
        });
      } catch {
        // keep null — dashboard falls back to mock data
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  return { stats, loading };
}
