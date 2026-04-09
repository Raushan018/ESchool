import { useState } from 'react';
import { motion } from 'framer-motion';
import { FileText, Play, Link2, File, Download, BookMarked } from 'lucide-react';
import { useDataStore } from '../../store/dataStore';
import { useStudentId } from '../../hooks/useStudentId';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatDate } from '../../utils/helpers';

const TYPE_ICONS = {
  pdf: FileText,
  video: Play,
  link: Link2,
  doc: File,
};

const TYPE_COLORS = {
  pdf: 'text-red-500 bg-red-50 dark:bg-red-900/20',
  video: 'text-purple-500 bg-purple-50 dark:bg-purple-900/20',
  link: 'text-brand-600 bg-brand-50 dark:bg-brand-900/20',
  doc: 'text-amber-500 bg-amber-50 dark:bg-amber-900/20',
};

export function StudyMaterialsPage() {
  const { students, courses } = useDataStore();
  const studentId = useStudentId();
  const [activeTab, setActiveTab] = useState<string>('all');

  const student = students.find((s) => s.id === studentId);
  const myCourses = courses.filter((c) => student?.enrolledCourses.includes(c.id));

  const allMaterials = myCourses.flatMap((c) =>
    c.materials.map((m) => ({ ...m, courseName: c.name, courseCode: c.code }))
  );

  const filteredMaterials = activeTab === 'all'
    ? allMaterials
    : allMaterials.filter((m) => {
        const course = myCourses.find((c) => c.code === activeTab);
        return course?.materials.some((cm) => cm.id === m.id);
      });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Study Materials</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{allMaterials.length} resources across your courses</p>
      </div>

      {/* Course Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
        <button
          onClick={() => setActiveTab('all')}
          className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === 'all'
              ? 'bg-brand-600 text-white'
              : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          All ({allMaterials.length})
        </button>
        {myCourses.map((c) => (
          <button
            key={c.code}
            onClick={() => setActiveTab(c.code)}
            className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === c.code
                ? 'bg-brand-600 text-white'
                : 'bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800'
            }`}
          >
            {c.code} ({c.materials.length})
          </button>
        ))}
      </div>

      {filteredMaterials.length === 0 ? (
        <div className="card">
          <EmptyState
            icon={BookMarked}
            title="No materials yet"
            description="Your instructors haven't uploaded any materials for this course yet."
          />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredMaterials.map((material, i) => {
            const IconComp = TYPE_ICONS[material.type] || File;
            const colorClass = TYPE_COLORS[material.type] || TYPE_COLORS.doc;

            return (
              <motion.div
                key={material.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                className="card-hover p-4"
              >
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-xl flex-shrink-0 ${colorClass}`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">{material.title}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {(material as any).courseCode} · {(material as any).courseName}
                    </p>
                    {material.description && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1.5 line-clamp-2">{material.description}</p>
                    )}
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-3">
                    <span className="capitalize px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-800 font-medium text-gray-600 dark:text-gray-400">
                      {material.type}
                    </span>
                    {material.size && <span>{material.size}</span>}
                  </div>
                  <span>{formatDate(material.uploadedAt)}</span>
                </div>

                <button className="mt-3 w-full flex items-center justify-center gap-2 py-2 rounded-lg border border-gray-200 dark:border-gray-700
                                   text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-brand-50 dark:hover:bg-brand-900/20
                                   hover:text-brand-600 dark:hover:text-brand-400 hover:border-brand-200 transition-colors">
                  <Download className="w-3.5 h-3.5" />
                  {material.type === 'video' ? 'Watch' : material.type === 'link' ? 'Open Link' : 'Download'}
                </button>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
