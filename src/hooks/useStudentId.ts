import { useAuthStore } from '../store/authStore';
import { useDataStore } from '../store/dataStore';

const FALLBACK_STUDENT_ID = 's1';

/**
 * Returns the effective student ID for the current user.
 * If the logged-in user exists in the students list → use their own ID.
 * Otherwise (newly registered user) → fall back to the demo student (s1)
 * so all pages display real data.
 */
export function useStudentId(): string {
  const { user } = useAuthStore();
  const { students } = useDataStore();

  if (!user) return FALLBACK_STUDENT_ID;
  const exists = students.some((s) => s.id === user.id);
  return exists ? user.id : FALLBACK_STUDENT_ID;
}
