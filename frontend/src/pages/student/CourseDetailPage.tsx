import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useState, useRef, useEffect, useCallback } from 'react';
import { ArrowLeft, Clock, Calendar, BookOpen, FileText, Video, Link2, Download, GraduationCap, Award, Play, Pause, Volume2, VolumeX, Maximize, SkipBack, SkipForward, ExternalLink } from 'lucide-react';

function VideoPlayer({}: { title: string; description?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fmt = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  const resetHideTimer = useCallback(() => {
    setShowControls(true);
    if (hideTimer.current) clearTimeout(hideTimer.current);
    hideTimer.current = setTimeout(() => { if (playing) setShowControls(false); }, 2500);
  }, [playing]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const v = videoRef.current;
      if (!v) return;
      if (e.key === 'ArrowRight') { v.currentTime = Math.min(v.currentTime + 10, v.duration); resetHideTimer(); }
      if (e.key === 'ArrowLeft')  { v.currentTime = Math.max(v.currentTime - 10, 0); resetHideTimer(); }
      if (e.key === ' ') { e.preventDefault(); togglePlay(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [resetHideTimer]);

  const togglePlay = () => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) { v.play(); setPlaying(true); } else { v.pause(); setPlaying(false); }
    resetHideTimer();
  };

  const seek = (e: React.MouseEvent<HTMLDivElement>) => {
    const v = videoRef.current;
    const tl = timelineRef.current;
    if (!v || !tl || !duration) return;
    const rect = tl.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    v.currentTime = pct * duration;
    resetHideTimer();
  };

  const fullscreen = () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) el.requestFullscreen();
    else document.exitFullscreen();
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className="w-full aspect-video bg-black rounded-xl overflow-hidden relative group select-none"
      onMouseMove={resetHideTimer}
      onMouseLeave={() => { if (playing) setShowControls(false); }}
    >
      {/* Demo: gradient background since URLs are mock */}
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        onTimeUpdate={() => setCurrentTime(videoRef.current?.currentTime ?? 0)}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration ?? 0)}
        onEnded={() => setPlaying(false)}
      />
      {/* Overlay background when no real video */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-800 to-indigo-900 flex items-center justify-center pointer-events-none">
        <div className="flex flex-col items-center gap-2 opacity-60">
          <Video className="w-12 h-12 text-white/50" />
          <p className="text-white/50 text-xs">Demo Video</p>
        </div>
      </div>

      {/* Click to play/pause */}
      <div className="absolute inset-0 cursor-pointer" onClick={togglePlay} />

      {/* Centre play indicator */}
      {!playing && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
            <Play className="w-7 h-7 text-white ml-1" />
          </div>
        </div>
      )}

      {/* Controls bar */}
      <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent px-3 pb-3 pt-6 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        {/* Timeline */}
        <div
          ref={timelineRef}
          className="w-full h-1.5 bg-white/30 rounded-full cursor-pointer mb-2.5 group/tl relative"
          onClick={seek}
        >
          <div className="h-full bg-brand-400 rounded-full relative" style={{ width: `${progress}%` }}>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow opacity-0 group-hover/tl:opacity-100 transition-opacity" />
          </div>
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between gap-3">
          {/* Left controls */}
          <div className="flex items-center gap-2">
            <button onClick={() => { const v = videoRef.current; if (v) { v.currentTime = Math.max(v.currentTime - 10, 0); resetHideTimer(); } }} className="text-white/80 hover:text-white transition-colors" title="Rewind 10s (←)">
              <SkipBack className="w-4 h-4" />
            </button>
            <button onClick={togglePlay} className="text-white hover:text-brand-300 transition-colors">
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
            </button>
            <button onClick={() => { const v = videoRef.current; if (v) { v.currentTime = Math.min(v.currentTime + 10, v.duration || 0); resetHideTimer(); } }} className="text-white/80 hover:text-white transition-colors" title="Forward 10s (→)">
              <SkipForward className="w-4 h-4" />
            </button>
            <span className="text-white/70 text-xs font-mono">{fmt(currentTime)} / {fmt(duration)}</span>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            {/* Volume */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setMuted(!muted); if (videoRef.current) videoRef.current.muted = !muted; }}
                className="text-white/80 hover:text-white transition-colors flex-shrink-0"
              >
                {muted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <div className="relative w-20 h-1.5 bg-white/30 rounded-full cursor-pointer flex-shrink-0"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const v = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
                  setVolume(v); setMuted(v === 0);
                  if (videoRef.current) { videoRef.current.volume = v; videoRef.current.muted = v === 0; }
                }}
              >
                <div className="h-full bg-white rounded-full relative" style={{ width: `${(muted ? 0 : volume) * 100}%` }}>
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md" />
                </div>
              </div>
            </div>
            <button onClick={fullscreen} className="text-white/80 hover:text-white transition-colors" title="Fullscreen">
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Arrow key hints */}
      <div className={`absolute top-2 right-2 text-xs text-white/40 transition-opacity duration-300 ${showControls ? 'opacity-100' : 'opacity-0'}`}>
        ← → to seek · Space to play/pause
      </div>
    </div>
  );
}
import { useDataStore } from '../../store/dataStore';
import { StatusBadge } from '../../components/ui/Badge';
import { formatDate } from '../../utils/helpers';
import dsaImg from '../../assets/DSA.png';
import dbmsImg from '../../assets/DBMS.png';
import osImg from '../../assets/os.png';
import defaultImg from '../../assets/education.gif';

const COURSE_IMAGES: Record<string, string> = {
  CS301: dsaImg,
  CS302: dbmsImg,
  CS201: osImg,
};

const MATERIAL_ICONS: Record<string, typeof FileText> = {
  pdf: FileText,
  video: Video,
  link: Link2,
  doc: FileText,
};

const MATERIAL_COLORS: Record<string, string> = {
  pdf: 'bg-red-50 text-red-500 dark:bg-red-900/20',
  video: 'bg-brand-50 text-brand-600 dark:bg-brand-900/20',
  link: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20',
  doc: 'bg-amber-50 text-amber-600 dark:bg-amber-900/20',
};

export function CourseDetailPage() {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { courses } = useDataStore();
  const [activeMaterialId, setActiveMaterialId] = useState<string | null>(null);
  const [materialTab, setMaterialTab] = useState<'live' | 'recorded'>('recorded');

  const course = courses.find((c) => c.id === courseId);

  if (!course) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <BookOpen className="w-12 h-12 text-gray-300" />
      <p className="text-gray-400">Course not found.</p>
      <button onClick={() => navigate('/student/courses')} className="bg-brand-600 hover:bg-white hover:border-brand-600 text-white hover:text-brand-600 border border-transparent text-sm px-4 py-2 rounded-lg font-semibold transition-colors">Back to Courses</button>
    </div>
  );


  const stats = [
    { label: 'Duration', value: course.duration, icon: Clock },
    { label: 'Delivery Mode', value: 'Virtual Live', icon: Video },
    { label: 'Credits', value: `${course.credits} Credits`, icon: Award },
    { label: 'Ends On', value: formatDate(course.endDate), icon: Calendar },
  ];

  return (
    <div className="space-y-5">
      {/* Back button */}
      <button
        onClick={() => navigate('/student/courses')}
        className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-brand-600 hover:border-b hover:border-brand-600 transition-colors pb-1"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to My Courses
      </button>

      {/* ── Hero Section ── */}
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #eef0ff 0%, #f3eeff 45%, #fce8f3 100%)' }}
      >
        <div className="flex flex-col lg:flex-row items-center gap-8 px-8 py-10">
          {/* Left */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-mono bg-brand-100 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2 py-0.5 rounded">
                {course.code}
              </span>
              <StatusBadge status={course.status} />
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 leading-tight">{course.name}</h1>
            <p className="text-gray-500 mt-2 text-sm max-w-lg">{course.description}</p>

            <div className="flex items-center gap-2 mt-4">
              <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
                <GraduationCap className="w-4 h-4 text-brand-600" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Instructor</p>
                <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{course.teacherName}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <a
                href="/student/materials"
                className="px-6 py-2.5 bg-brand-600 text-white text-sm font-semibold rounded-xl border border-transparent hover:bg-white hover:text-brand-600 hover:border-brand-600 transition-colors shadow-sm"
              >
                Study Materials
              </a>
              <a
                href="/student/tests"
                className="px-6 py-2.5 border border-brand-300 text-brand-600 text-sm font-semibold rounded-xl hover:bg-white hover:border-brand-600 hover:text-brand-600 transition-colors"
              >
                Take a Test
              </a>
            </div>
          </div>

          {/* Right — course image card */}
          <div className="flex-shrink-0 w-96 rounded-2xl overflow-hidden shadow-2xl">
            <img
              src={COURSE_IMAGES[course.code] ?? defaultImg}
              alt={course.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </motion.div>

      {/* ── Stats Strip ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="card"
      >
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y lg:divide-y-0 divide-gray-100 dark:divide-gray-800">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col items-center gap-1 py-4 px-4">
              <div className="p-2 rounded-xl bg-brand-50 dark:bg-brand-900/20">
                <s.icon className="w-4 h-4 text-brand-600" />
              </div>
              <p className="text-sm font-bold text-gray-900 dark:text-white mt-1">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          ))}
        </div>
      </motion.div>


      {/* ── Study Materials ── */}
      {course.materials.length > 0 && (() => {
        const filteredMaterials = course.materials.filter((m) => (m.category ?? 'recorded') === materialTab);
        const active = filteredMaterials.find((m) => m.id === activeMaterialId) ?? filteredMaterials[0];
        return (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="card overflow-hidden"
          >
            <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">Study Materials</h3>
                <span className="text-xs text-gray-400">{filteredMaterials.length} file{filteredMaterials.length !== 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5 mt-2 w-fit">
                {(['live', 'recorded'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => { setMaterialTab(tab); setActiveMaterialId(null); }}
                    className={`px-3 py-1 text-xs font-medium rounded-md transition-colors capitalize border ${materialTab === tab ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm border-brand-600' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border-transparent hover:border-brand-600'}`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col lg:flex-row">
              {/* Left — compact list (50% smaller) */}
              <div className="lg:w-2/5 divide-y divide-gray-50 dark:divide-gray-800/50 border-r border-gray-100 dark:border-gray-800">
                {filteredMaterials.length === 0 ? (
                  <p className="px-4 py-8 text-center text-xs text-gray-400">No {materialTab} sessions available</p>
                ) : filteredMaterials.map((m) => {
                  const Icon = MATERIAL_ICONS[m.type] ?? FileText;
                  const colorClass = MATERIAL_COLORS[m.type] ?? MATERIAL_COLORS.doc;
                  const isActive = m.id === (activeMaterialId ?? filteredMaterials[0].id);
                  return (
                    <button
                      key={m.id}
                      onClick={() => setActiveMaterialId(m.id)}
                      className={`w-full px-3 py-2.5 flex items-center gap-2.5 text-left transition-colors ${isActive ? 'bg-brand-50 dark:bg-brand-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800/40'}`}
                    >
                      <div className={`p-1.5 rounded-lg flex-shrink-0 ${colorClass}`}>
                        <Icon className="w-3 h-3" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-medium truncate ${isActive ? 'text-brand-600 dark:text-brand-400' : 'text-gray-800 dark:text-gray-200'}`}>{m.title}</p>
                        <p className="text-xs text-gray-400 truncate">{m.size ?? m.type.toUpperCase()}</p>
                      </div>
                      <span className="text-xs uppercase font-semibold text-gray-300 dark:text-gray-600">{m.type}</span>
                    </button>
                  );
                })}
              </div>

              {/* Right — player / viewer */}
              <div className="flex-1 p-4 flex flex-col items-center justify-center min-h-[220px] bg-gray-50 dark:bg-gray-900/40">
                {!active ? (
                  <p className="text-xs text-gray-400">No content to preview</p>
                ) : active.type === 'video' ? (
                  <div className="w-full">
                    <VideoPlayer title={active.title} description={active.description} />
                    <p className="text-xs text-gray-400 mt-2 text-center">{active.description}</p>
                  </div>
                ) : active.type === 'pdf' ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-20 bg-red-50 dark:bg-red-900/20 rounded-xl flex items-center justify-center shadow-sm">
                      <FileText className="w-8 h-8 text-red-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{active.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{active.description}{active.size ? ` · ${active.size}` : ''}</p>
                    </div>
                    <a
                      href={active.url}
                      download
                      className="flex items-center gap-2 px-5 py-2 bg-red-500 hover:bg-red-600 text-white text-xs font-semibold rounded-xl transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download PDF
                    </a>
                  </div>
                ) : active.type === 'link' ? (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center justify-center">
                      <ExternalLink className="w-8 h-8 text-emerald-500" />
                    </div>
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{active.title}</p>
                    <a href={active.url} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-semibold rounded-xl transition-colors">
                      <ExternalLink className="w-3.5 h-3.5" />
                      Open Link
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-16 h-20 bg-amber-50 dark:bg-amber-900/20 rounded-xl flex items-center justify-center shadow-sm">
                      <FileText className="w-8 h-8 text-amber-500" />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{active.title}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{active.description}{active.size ? ` · ${active.size}` : ''}</p>
                    </div>
                    <a href={active.url} download
                      className="flex items-center gap-2 px-5 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold rounded-xl transition-colors">
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </a>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        );
      })()}
    </div>
  );
}
