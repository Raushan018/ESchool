import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, GraduationCap, Filter } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { SearchInput } from '../../components/ui/SearchInput';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { formatDate, generateId } from '../../utils/helpers';
import type { Student } from '../../types';

const DEPARTMENTS = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil'];
const BATCHES = ['All', '2024-A', '2024-B', '2023-A', '2023-B'];

const EMPTY_STUDENT: Omit<Student, 'id'> = {
  rollNumber: '', name: '', email: '', phone: '',
  department: 'Computer Science', batch: '2024-A',
  enrolledCourses: [], joinDate: new Date().toISOString().slice(0, 10),
  status: 'active', address: '', guardianName: '', guardianPhone: '', dateOfBirth: '',
};

export function StudentsPage() {
  const { students, addStudent, updateStudent, deleteStudent } = useDataStore();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [batchFilter, setBatchFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Student, 'id'>>(EMPTY_STUDENT);

  const filtered = students.filter((s) => {
    const q = search.toLowerCase();
    const matchSearch = !search || s.name.toLowerCase().includes(q) || s.email.toLowerCase().includes(q) || s.rollNumber.toLowerCase().includes(q);
    const matchDept = deptFilter === 'All' || s.department === deptFilter;
    const matchBatch = batchFilter === 'All' || s.batch === batchFilter;
    const matchStatus = statusFilter === 'All' || s.status === statusFilter;
    return matchSearch && matchDept && matchBatch && matchStatus;
  });

  const openAdd = () => {
    setEditStudent(null);
    setForm(EMPTY_STUDENT);
    setModalOpen(true);
  };

  const openEdit = (s: Student) => {
    setEditStudent(s);
    const { id: _, ...rest } = s;
    setForm(rest);
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email || !form.rollNumber) return;
    if (editStudent) {
      updateStudent(editStudent.id, form);
    } else {
      addStudent({ id: generateId(), ...form });
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Students</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{students.length} total students enrolled</p>
        </div>
        <button onClick={openAdd} className="btn-primary self-start sm:self-auto">
          <Plus className="w-4 h-4" /> Add Student
        </button>
      </div>

      {/* Filters */}
      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, email, roll no..." className="flex-1" />
        <div className="flex gap-2 flex-wrap">
          <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="input w-auto text-sm">
            {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
          </select>
          <select value={batchFilter} onChange={(e) => setBatchFilter(e.target.value)} className="input w-auto text-sm">
            {BATCHES.map((b) => <option key={b}>{b}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input w-auto text-sm">
            {['All', 'active', 'inactive', 'suspended'].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Results count */}
      <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
        <Filter className="w-3 h-3" />
        Showing {filtered.length} of {students.length} students
      </p>

      {/* Table */}
      <motion.div layout className="card overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={GraduationCap} title="No students found" description="Try adjusting your search or filters." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/50">
                  {['Student', 'Roll No', 'Department', 'Batch', 'Courses', 'Joined', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50 dark:divide-gray-800/50">
                {filtered.map((s, i) => (
                  <motion.tr
                    key={s.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="table-row-hover"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={s.name} src={s.avatar} size="sm" />
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{s.name}</p>
                          <p className="text-xs text-gray-400 truncate">{s.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 font-mono text-xs">{s.rollNumber}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap">{s.department}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{s.batch}</td>
                    <td className="px-4 py-3 text-sm text-gray-600 dark:text-gray-300">{s.enrolledCourses.length}</td>
                    <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">{formatDate(s.joinDate)}</td>
                    <td className="px-4 py-3"><StatusBadge status={s.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => openEdit(s)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteId(s.id)}
                          className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Student Form Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editStudent ? 'Edit Student' : 'Add New Student'}
        size="lg"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary">
              {editStudent ? 'Save Changes' : 'Add Student'}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Arjun Sharma" />
          </div>
          <div>
            <label className="label">Roll Number *</label>
            <input className="input" value={form.rollNumber} onChange={(e) => setForm({ ...form, rollNumber: e.target.value })} placeholder="CS2024001" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="student@edu.com" />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+91 98765 43210" />
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              {DEPARTMENTS.filter(d => d !== 'All').map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Batch</label>
            <select className="input" value={form.batch} onChange={(e) => setForm({ ...form, batch: e.target.value })}>
              {BATCHES.filter(b => b !== 'All').map((b) => <option key={b}>{b}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date of Birth</label>
            <input className="input" type="date" value={form.dateOfBirth} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Student['status'] })}>
              {['active', 'inactive', 'suspended'].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Address</label>
            <input className="input" value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="123, Street, City" />
          </div>
          <div>
            <label className="label">Guardian Name</label>
            <input className="input" value={form.guardianName} onChange={(e) => setForm({ ...form, guardianName: e.target.value })} />
          </div>
          <div>
            <label className="label">Guardian Phone</label>
            <input className="input" value={form.guardianPhone} onChange={(e) => setForm({ ...form, guardianPhone: e.target.value })} />
          </div>
        </div>
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteStudent(deleteId)}
        title="Remove Student"
        message="This will permanently remove the student and all their data. This cannot be undone."
        confirmLabel="Remove Student"
        destructive
      />
    </div>
  );
}
