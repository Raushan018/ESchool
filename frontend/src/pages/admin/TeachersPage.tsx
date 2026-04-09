import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Pencil, Trash2, Users, Mail, Phone } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { SearchInput } from '../../components/ui/SearchInput';
import { Avatar } from '../../components/ui/Avatar';
import { StatusBadge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Modal } from '../../components/ui/Modal';
import { formatCurrency, generateId } from '../../utils/helpers';
import type { Teacher } from '../../types';

const DEPARTMENTS = ['All', 'Computer Science', 'Electronics', 'Mechanical', 'Civil'];

const EMPTY: Omit<Teacher, 'id'> = {
  employeeId: '', name: '', email: '', phone: '',
  department: 'Computer Science', subjects: [],
  qualification: '', joinDate: new Date().toISOString().slice(0, 10),
  status: 'active', salary: 0, experience: 0,
};

export function TeachersPage() {
  const { teachers, addTeacher, updateTeacher, deleteTeacher } = useDataStore();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Teacher, 'id'>>(EMPTY);
  const [subjectInput, setSubjectInput] = useState('');

  const filtered = teachers.filter((t) => {
    const q = search.toLowerCase();
    return (
      (!search || t.name.toLowerCase().includes(q) || t.email.toLowerCase().includes(q) || t.employeeId.toLowerCase().includes(q)) &&
      (deptFilter === 'All' || t.department === deptFilter)
    );
  });

  const openAdd = () => { setEditTeacher(null); setForm(EMPTY); setSubjectInput(''); setModalOpen(true); };
  const openEdit = (t: Teacher) => {
    setEditTeacher(t);
    const { id: _, ...rest } = t;
    setForm(rest);
    setSubjectInput(t.subjects.join(', '));
    setModalOpen(true);
  };

  const handleSave = () => {
    if (!form.name || !form.email) return;
    const subjects = subjectInput.split(',').map((s) => s.trim()).filter(Boolean);
    const data = { ...form, subjects };
    if (editTeacher) updateTeacher(editTeacher.id, data);
    else addTeacher({ id: generateId(), ...data });
    setModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Teachers</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{teachers.length} faculty members</p>
        </div>
        <button onClick={openAdd} className="btn-primary self-start">
          <Plus className="w-4 h-4" /> Add Teacher
        </button>
      </div>

      <div className="card p-4 flex flex-col sm:flex-row gap-3">
        <SearchInput value={search} onChange={setSearch} placeholder="Search by name, ID..." className="flex-1" />
        <select value={deptFilter} onChange={(e) => setDeptFilter(e.target.value)} className="input w-auto text-sm">
          {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
        </select>
      </div>

      {/* Teacher Cards */}
      {filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon={Users} title="No teachers found" description="Try a different search term." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((t, i) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card-hover p-5"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar name={t.name} src={t.avatar} size="lg" />
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900 dark:text-white text-sm leading-tight">{t.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 font-mono mt-0.5">{t.employeeId}</p>
                    <StatusBadge status={t.status} />
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(t)} className="p-1.5 rounded-md text-gray-400 hover:text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20 transition-colors">
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setDeleteId(t.id)} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Mail className="w-3.5 h-3.5 flex-shrink-0" />
                  <span className="truncate">{t.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
                  <Phone className="w-3.5 h-3.5 flex-shrink-0" />
                  {t.phone}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Department</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t.department}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Experience</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{t.experience} years</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500 dark:text-gray-400">Salary</span>
                  <span className="font-medium text-gray-700 dark:text-gray-300">{formatCurrency(t.salary)}/mo</span>
                </div>
              </div>

              <div className="mt-3">
                <p className="text-xs text-gray-400 mb-1.5">Subjects</p>
                <div className="flex flex-wrap gap-1">
                  {t.subjects.map((s) => (
                    <span key={s} className="badge-purple text-xs">{s}</span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editTeacher ? 'Edit Teacher' : 'Add New Teacher'}
        size="lg"
        footer={
          <>
            <button onClick={() => setModalOpen(false)} className="btn-secondary">Cancel</button>
            <button onClick={handleSave} className="btn-primary">{editTeacher ? 'Save Changes' : 'Add Teacher'}</button>
          </>
        }
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="label">Full Name *</label>
            <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Dr. Name" />
          </div>
          <div>
            <label className="label">Employee ID *</label>
            <input className="input" value={form.employeeId} onChange={(e) => setForm({ ...form, employeeId: e.target.value })} placeholder="FAC001" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input className="input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </div>
          <div>
            <label className="label">Phone</label>
            <input className="input" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <div>
            <label className="label">Department</label>
            <select className="input" value={form.department} onChange={(e) => setForm({ ...form, department: e.target.value })}>
              {DEPARTMENTS.filter(d => d !== 'All').map((d) => <option key={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Experience (years)</label>
            <input className="input" type="number" min={0} value={form.experience} onChange={(e) => setForm({ ...form, experience: +e.target.value })} />
          </div>
          <div>
            <label className="label">Salary (₹/month)</label>
            <input className="input" type="number" min={0} value={form.salary} onChange={(e) => setForm({ ...form, salary: +e.target.value })} />
          </div>
          <div>
            <label className="label">Status</label>
            <select className="input" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Teacher['status'] })}>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label">Qualification</label>
            <input className="input" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="Ph.D. Computer Science, IIT Delhi" />
          </div>
          <div className="sm:col-span-2">
            <label className="label">Subjects (comma separated)</label>
            <input className="input" value={subjectInput} onChange={(e) => setSubjectInput(e.target.value)} placeholder="Data Structures, Algorithms" />
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && deleteTeacher(deleteId)}
        title="Remove Teacher"
        message="This will permanently remove this teacher record."
        confirmLabel="Remove"
        destructive
      />
    </div>
  );
}
