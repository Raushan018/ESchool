import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';

const DEMO_STUDENT_ID = 's1';

/**
 * Always returns a valid student ID so all pages show data.
 * Real user name comes from authStore — data comes from mock.
 */
export function useStudentId(): string {
  const { user } = useAuthStore();
  const { students } = useDataStore();

  if (!user) return DEMO_STUDENT_ID;
  // If user exists in mock data, use their ID; otherwise use demo student for data
  const match = students.find((s) => s.id === user.id);
  return match ? match.id : DEMO_STUDENT_ID;
}
