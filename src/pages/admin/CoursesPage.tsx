import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, BookOpen, Users, Clock } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { SearchInput } from '../../components/ui/SearchInput';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { formatDate, generateId } from '../../utils/helpers';
import type { Course } from '../../types';

const DEPTS = ['Computer Science', 'Electronics', 'Mechanical', 'Civil'];
const BATCHES = ['2024-A', '2024-B', '2023-A', '2023-B'];

const EMPTY: Omit<Course, 'id' | 'materials'> = {
  code: '', name: '', description: '',
  teacherId: 't1', teacherName: 'Dr. Anil Kumar',
  department: 'Computer Science', batch: '2024-A',
  credits: 3, duration: '14 weeks',
  enrolledCount: 0, maxCapacity: 40,
  status: 'active', startDate: '', endDate: '',
  schedule: '',
};

export function CoursesPage() {
  const { courses, teachers, addCourse, updateCourse, deleteCourse } = useDataStore();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Course, 'id' | 'materials'>>(EMPTY);

  const filtered = courses.filter((c) => {
    const q = search.toLowerCase();
    return (
      (!search || c.name.toLowerCase().includes(q) || c.code.toLowerCase().includes(q)) &&
      (deptFilter === 'All' || c.department === deptFilter) &&
      (statusFilter === 'All' || c.status === statusFilter)
    );
  });

  const openAdd = () => { setEditCourse(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (c: Course) => {
    setEditCourse(c);
    const { id: _, materials: __, ...rest } = c;
    setForm(rest);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.code) return;
    const teacher = teachers.find((t) => t.id === form.teacherId);
    const data = { ...form, teacherName: teacher?.name || form.teacherName };
    if (editCourse) updateCourse(editCourse.id, data);
    else addCourse({ id: generateId(), materials: [], ...data });
    setModalOpen(false);
  };

  const STATUS_COLORS: Record<string, string> = {
    active: 'border-l-emerald-500',
    completed: 'border-l-gray-300',
    upcoming: 'border-l-amber-500',
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Courses</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{courses.length} courses across all departments</p>
        </div>
        <button onClick={openAdd} className="btn-primary self-start">
          <Plus className="w-4 h-4" /> Add Course
        </button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search courses..." className="flex-1" />
        <div className="flex gap-2">
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="input w-auto text-sm">
            {['All', ...DEPTS].map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto text-sm">
            {['All', 'active', 'completed', 'upcoming'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={BookOpen} title="No courses found" />
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((c, i) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className={`card-hover p-5 border-l-4 ${STATUS_COLORS[c.status] || 'border-l-gray-200'}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-mono text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded">{c.code}</span>
                    <StatusBadge status={c.status} />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white truncate">{c.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-2">{c.description}</p>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => openEdit(c)} className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(c.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-3 text-xs">
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <Users className="w-3.5 h-3.5" />
                  <span>{c.enrolledCount}/{c.maxCapacity}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{c.duration}</span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500 dark:text-gray-400">
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>{c.credits} credits</span>
                </div>
              </div>

              <div className="mt-3">
                <ProgressBar value={c.enrolledCount} max={c.maxCapacity} showValue label="Capacity" color="brand" />
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-gray-400">By </span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{c.teacherName}</span>
                </div>
                <div className="text-gray-400">
                  {formatDate(c.startDate)} — {formatDate(c.endDate)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editCourse ? 'Edit Course' : 'Add Course'}
        size="lg"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary">{editCourse ? 'Save' : 'Add Course'}</button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Course Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label">Course Code *</label>
            <input className="input" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} placeholder="CS301" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Description</label>
            <textarea className="input resize-none" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="label">Instructor</label>
            <select className="input" value={form.teacherId} onChange={(e) => setForm({ ...form, teacherId: e.target.value })}>
              {teachers.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              {DEPTS.map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Batch</label>
            <select className="input" value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}>
              {BATCHES.map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Credits</label>
            <input className="input" type="number" min={1} max={6} value={form.credits} onChange={(e) => setForm({ ...form, credits: +e.target.value })} />
          </div>
          <div>
            <label className="label">Max Capacity</label>
            <input className="input" type="number" min={1} value={form.maxCapacity} onChange={(e) => setForm({ ...form, maxCapacity: +e.target.value })} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Course['status'] })}>
              {['active', 'upcoming', 'completed'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Start Date</label>
            <input className="input" type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} />
          </div>
          <div>
            <label className="label">End Date</label>
            <input className="input" type="date" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} />
          </div>
          <div>
            <label className="label">Schedule</label>
            <input className="input" value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} placeholder="Mon, Wed - 10:00 AM" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteCourse(deleteId)}
        title="Delete Course"
        message="This action cannot be undone."
        confirmLabel="Delete"
        destructive
      />
    </div>
  );
}
