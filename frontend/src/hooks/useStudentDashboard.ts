import { useEffect, useState } from 'react';
import api from '../lib/api';

interface StudentProfile {
  _id: string;
  batch: string;
  phone: string;
  feesStatus: string;
  userId: { name: string; email: string };
  courseId: { _id: string; name: string; description: string; duration: string; fee: number };
}

interface AttendanceSummary {
  total: number;
  present: number;
  absent: number;
  percentage: number;
}

interface FeesSummary {
  total: number;
  paid: number;
  pending: number;
}

interface ResultPerformance {
  totalTests: number;
  passed: number;
  failed: number;
  avgPercentage: number;
}

export interface StudentDashboardData {
  profile: StudentProfile;
  attendance: AttendanceSummary;
  fees: FeesSummary;
  performance: ResultPerformance;
}

export function useStudentDashboard() {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const [profileRes, attendanceRes, feesRes, resultsRes] = await Promise.all([
          api.get('/students/me'),
          api.get('/attendance/my'),
          api.get('/fees/my'),
          api.get('/results/my'),
        ]);

        setData({
          profile: profileRes.data.data,
          attendance: attendanceRes.data.data.summary,
          fees: feesRes.data.data.summary,
          performance: resultsRes.data.data.performance,
        });
      } catch (e: unknown) {
        setError((e as { message?: string })?.message ?? 'Failed to load data');
      } finally {
        setLoading(false);
      }
    };

    fetch();
  }, []);

  return { data, loading, error };
}
