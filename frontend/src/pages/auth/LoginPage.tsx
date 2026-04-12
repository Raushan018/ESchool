import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';
import logoImg from '../../assets/E-School logo with vibrant colors.png';
import { useAuthStore } from '../../store/authStore';
import { useUIStore } from '../../store/uiStore';

// ─── Decorative SVG illustration ──────────────────────────────────────────────
function SchoolIllustration() {
  return (
    <svg viewBox="0 0 380 340" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm">
      {/* Stars */}
      {[[30,30],[60,80],[15,140],[80,200],[20,260],[50,310]].map(([x,y],i) => (
        <text key={i} x={x} y={y} fontSize="18" fill="#fbbf24" opacity="0.7">★</text>
      ))}
      {[[330,40],[350,110],[360,180],[340,250]].map(([x,y],i) => (
        <text key={i} x={x} y={y} fontSize="14" fill="#fbbf24" opacity="0.5">★</text>
      ))}

      {/* Desk / surface */}
      <rect x="30" y="265" width="320" height="14" rx="7" fill="#d1d5db" />

      {/* Green book */}
      <rect x="40" y="210" width="50" height="60" rx="4" fill="#16a34a" />
      <rect x="40" y="210" width="8" height="60" rx="2" fill="#15803d" />
      <rect x="48" y="218" width="30" height="3" rx="1.5" fill="#bbf7d0" />
      <rect x="48" y="225" width="24" height="3" rx="1.5" fill="#bbf7d0" />

      {/* Orange book */}
      <rect x="95" y="220" width="48" height="50" rx="4" fill="#ea580c" />
      <rect x="95" y="220" width="7" height="50" rx="2" fill="#c2410c" />
      <rect x="104" y="228" width="28" height="3" rx="1.5" fill="#fed7aa" />

      {/* Stack of books base */}
      <rect x="38" y="255" width="115" height="12" rx="3" fill="#7c3aed" opacity="0.8" />
      <rect x="35" y="260" width="120" height="7" rx="3" fill="#6d28d9" opacity="0.6" />

      {/* Monitor */}
      <rect x="160" y="160" width="130" height="90" rx="8" fill="#374151" />
      <rect x="168" y="168" width="114" height="74" rx="4" fill="#1e40af" opacity="0.9" />
      {/* Screen content lines */}
      <rect x="176" y="178" width="70" height="4" rx="2" fill="white" opacity="0.6" />
      <rect x="176" y="186" width="55" height="4" rx="2" fill="white" opacity="0.4" />
      <rect x="176" y="194" width="65" height="4" rx="2" fill="white" opacity="0.4" />
      <rect x="176" y="202" width="45" height="4" rx="2" fill="white" opacity="0.3" />
      {/* Monitor stand */}
      <rect x="218" y="250" width="14" height="16" rx="2" fill="#4b5563" />
      <rect x="205" y="263" width="40" height="5" rx="2" fill="#6b7280" />

      {/* Backpack - purple */}
      <rect x="258" y="120" width="80" height="95" rx="12" fill="#7c3aed" />
      <rect x="268" y="130" width="60" height="40" rx="8" fill="#6d28d9" />
      {/* Backpack zipper */}
      <path d="M268 150 Q298 158 328 150" stroke="#a78bfa" strokeWidth="2" fill="none" />
      {/* Backpack handles */}
      <path d="M278 120 Q278 105 288 105 Q298 105 298 120" stroke="#5b21b6" strokeWidth="6" fill="none" strokeLinecap="round" />
      {/* Yellow pocket */}
      <rect x="270" y="175" width="56" height="32" rx="8" fill="#eab308" />
      <path d="M270 191 Q298 198 326 191" stroke="#ca8a04" strokeWidth="2" fill="none" />
      {/* Straps */}
      <rect x="265" y="130" width="8" height="50" rx="4" fill="#5b21b6" />
      <rect x="325" y="130" width="8" height="50" rx="4" fill="#5b21b6" />

      {/* Alarm clock */}
      <circle cx="118" cy="215" r="28" fill="#ef4444" />
      <circle cx="118" cy="215" r="22" fill="#fef2f2" />
      <circle cx="118" cy="215" r="3" fill="#374151" />
      {/* Clock hands */}
      <line x1="118" y1="215" x2="118" y2="200" stroke="#374151" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="118" y1="215" x2="128" y2="218" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
      {/* Bell bumps */}
      <circle cx="97" cy="196" r="6" fill="#ef4444" />
      <circle cx="139" cy="196" r="6" fill="#ef4444" />
      <rect x="113" y="237" width="10" height="6" rx="2" fill="#dc2626" />

      {/* Ruler/pencil */}
      <rect x="155" y="100" width="10" height="80" rx="5" fill="#fbbf24" transform="rotate(-30 155 100)" />
      <polygon points="155,100 165,100 160,88" fill="#374151" transform="rotate(-30 155 100)" />

      {/* Paper airplane */}
      <path d="M55 60 L90 75 L70 80 Z" fill="white" opacity="0.8" />
      <path d="M55 60 L90 75 L72 68 Z" fill="#e5e7eb" opacity="0.6" />

      {/* Magnifying glass */}
      <circle cx="205" cy="248" r="22" stroke="#9ca3af" strokeWidth="4" fill="white" opacity="0.7" />
      <line x1="221" y1="264" x2="235" y2="278" stroke="#6b7280" strokeWidth="5" strokeLinecap="round" />

      {/* Dots decoration */}
      {[[340,290],[350,300],[345,315],[355,285]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#1a3a6b" opacity="0.3" />
      ))}
    </svg>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────
export function LoginPage() {
  const { login, isAuthenticated, user } = useAuthStore();
  const { theme } = useUIStore();
  const navigate = useNavigate();

  const [tab,      setTab]      = useState<'student' | 'admin'>('student');
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [showPw,   setShowPw]   = useState(false);
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  useEffect(() => {
    if (isAuthenticated && user) {
      navigate(user.role === 'admin' ? '/admin' : '/student', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Switch tab → clear fields
  const handleTabSwitch = (t: 'student' | 'admin') => {
    setTab(t);
    setEmail('');
    setPassword('');
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields.'); return; }
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) setError(result.error || 'Invalid credentials.');
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #e8edf5 0%, #f0f4fb 50%, #e8edf5 100%)' }}
    >
      <div className="w-full max-w-5xl flex items-center gap-8">

        {/* ── Left: Illustration ── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col items-center flex-1"
        >
          {/* Logo + name */}
          <div className="flex items-center gap-3 mb-6">
            <img src={logoImg} alt="E-School" className="w-14 h-14 object-contain drop-shadow" />
            <div>
              <p className="text-2xl font-black" style={{ color: '#1a3a6b' }}>E-School</p>
              <p className="text-sm text-gray-500">Smart Learning Platform</p>
            </div>
          </div>
          <SchoolIllustration />
        </motion.div>

        {/* ── Center/Right: Login Card area ── */}
        <div className="flex-1 flex flex-col items-center gap-5 max-w-sm mx-auto">

          {/* Role tabs */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="flex items-center bg-white rounded-full shadow-sm border border-gray-200 p-1"
          >
            {(['student', 'admin'] as const).map((t) => (
              <button
                key={t}
                onClick={() => handleTabSwitch(t)}
                className="relative px-7 py-2 rounded-full text-sm font-bold transition-all capitalize"
                style={tab === t ? { background: '#1a3a6b', color: 'white' } : { color: '#374151' }}
              >
                {t === 'student' ? 'Student' : 'Admin'}
                {tab === t && (
                  <motion.div
                    layoutId="tab-bg"
                    className="absolute inset-0 rounded-full -z-10"
                    style={{ background: '#1a3a6b' }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </motion.div>

          {/* Login Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="w-full bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Card header */}
            <div className="py-5 text-center" style={{ background: '#1a3a6b' }}>
              <h1 className="text-2xl font-black text-white tracking-widest">LOG IN</h1>
            </div>

            {/* Card body */}
            <div className="px-8 py-7">
              <AnimatePresence mode="wait">
                {error && (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-center gap-2 p-3 mb-4 bg-red-50 rounded-lg border border-red-200"
                  >
                    <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                    <p className="text-sm text-red-600">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Email / Mobile */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">Email Address or Mobile</label>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={tab === 'student' ? 'student@school.edu or mobile' : 'admin@school.edu or mobile'}
                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#1a3a6b] transition-colors bg-white"
                    autoComplete="username"
                  />
                </div>

                {/* Password */}
                <div>
                  <label className="block text-sm text-gray-500 mb-1.5">Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-4 py-2.5 pr-11 rounded-lg border border-gray-300 text-sm text-gray-800 focus:outline-none focus:border-[#1a3a6b] transition-colors bg-white"
                      autoComplete="current-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPw(!showPw)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Forgot password */}
                <div className="text-right -mt-2">
                  <button type="button" className="text-sm font-medium" style={{ color: '#1a3a6b' }}>
                    Forgot Password?
                  </button>
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-lg text-white font-bold text-sm tracking-wide transition-opacity disabled:opacity-70 flex items-center justify-center gap-2"
                  style={{ background: '#1a3a6b' }}
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : 'Log in'}
                </button>
              </form>

              <p className="mt-3 text-center text-xs text-gray-400">
                Don't have an account?{' '}
                <Link to="/register" className="font-bold hover:underline" style={{ color: '#1a3a6b' }}>
                  Create one
                </Link>
              </p>
            </div>
          </motion.div>

          {/* Footer */}
          <p className="text-xs text-gray-400">© 2024 E-School. All rights reserved.</p>
        </div>

      </div>
    </div>
  );
}
