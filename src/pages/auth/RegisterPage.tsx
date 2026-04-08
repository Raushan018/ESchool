import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, AlertCircle, CheckCircle, User, Mail, Phone, Lock, BookOpen } from 'lucide-react';
import logoImg from '../../assets/E-School logo with vibrant colors.png';
import { useUIStore } from '../../store/uiStore';
import { getRegisteredUsers, saveRegisteredUser } from '../../store/authStore';

// ─── SVG Illustration (same style as login) ───────────────────────────────────
function RegisterIllustration() {
  return (
    <svg viewBox="0 0 380 320" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-sm">
      {/* Stars */}
      {[[25,25],[55,80],[12,145],[75,205],[22,265],[48,310]].map(([x,y],i) => (
        <text key={i} x={x} y={y} fontSize="18" fill="#fbbf24" opacity="0.7">★</text>
      ))}
      {[[330,35],[355,105],[362,178],[338,248]].map(([x,y],i) => (
        <text key={i} x={x} y={y} fontSize="14" fill="#fbbf24" opacity="0.5">★</text>
      ))}

      {/* Open book */}
      <path d="M80 120 Q130 110 180 120 L180 230 Q130 220 80 230 Z" fill="#1a3a6b" opacity="0.9" />
      <path d="M180 120 Q230 110 280 120 L280 230 Q230 220 180 230 Z" fill="#2c5aa0" opacity="0.9" />
      <rect x="178" y="115" width="4" height="120" rx="2" fill="#0e213d" />
      {/* Page lines left */}
      {[140,152,164,176,188,200].map((y,i) => (
        <line key={i} x1="95" y1={y} x2="170" y2={y} stroke="white" strokeWidth="2" opacity="0.4" />
      ))}
      {/* Page lines right */}
      {[140,152,164,176,188,200].map((y,i) => (
        <line key={i} x1="190" y1={y} x2="265" y2={y} stroke="white" strokeWidth="2" opacity="0.4" />
      ))}
      {/* Book shadow */}
      <ellipse cx="180" cy="238" rx="105" ry="8" fill="#1a3a6b" opacity="0.15" />

      {/* Graduation cap */}
      <rect x="145" y="55" width="70" height="10" rx="2" fill="#1a3a6b" />
      <polygon points="180,32 145,55 215,55" fill="#1a3a6b" />
      <circle cx="215" cy="62" r="4" fill="#1a3a6b" />
      <path d="M215 62 Q215 80 208 88" stroke="#1a3a6b" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx="206" cy="92" r="5" fill="#fbbf24" />

      {/* Pencil */}
      <rect x="280" y="90" width="12" height="80" rx="3" fill="#fbbf24" transform="rotate(20 280 90)" />
      <polygon points="280,90 292,90 286,78" fill="#374151" transform="rotate(20 280 90)" />
      <rect x="280" y="164" width="12" height="8" rx="1" fill="#fca5a5" transform="rotate(20 280 90)" />

      {/* Certificate / scroll */}
      <rect x="60" y="248" width="100" height="65" rx="6" fill="white" stroke="#d1d5db" strokeWidth="1.5" />
      <rect x="60" y="248" width="100" height="18" rx="6" fill="#1a3a6b" />
      <rect x="60" y="260" width="100" height="6" fill="#1a3a6b" />
      <line x1="74" y1="280" x2="146" y2="280" stroke="#9ca3af" strokeWidth="1.5" />
      <line x1="74" y1="289" x2="140" y2="289" stroke="#9ca3af" strokeWidth="1.5" />
      <line x1="74" y1="298" x2="133" y2="298" stroke="#9ca3af" strokeWidth="1.5" />
      <circle cx="110" cy="305" r="8" fill="#fbbf24" opacity="0.8" />

      {/* Trophy */}
      <path d="M285 245 Q275 255 275 270 L295 270 Q295 255 285 245 Z" fill="#fbbf24" />
      <rect x="280" y="270" width="10" height="8" rx="1" fill="#ca8a04" />
      <rect x="274" y="278" width="22" height="5" rx="2" fill="#fbbf24" />
      <path d="M275 252 Q265 250 265 260 Q265 268 275 265" stroke="#fbbf24" strokeWidth="3" fill="none" />
      <path d="M295 252 Q305 250 305 260 Q305 268 295 265" stroke="#fbbf24" strokeWidth="3" fill="none" />

      {/* Dots */}
      {[[340,290],[352,302],[344,316],[358,284]].map(([x,y],i) => (
        <circle key={i} cx={x} cy={y} r="4" fill="#1a3a6b" opacity="0.25" />
      ))}
    </svg>
  );
}

// ─── Input field component ────────────────────────────────────────────────────
function Field({
  label, icon: Icon, type = 'text', value, onChange, placeholder, error,
  rightEl,
}: {
  label: string;
  icon: React.ElementType;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  error?: string;
  rightEl?: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
      <div className={`flex items-center gap-2 px-3 py-2.5 rounded-lg border bg-white transition-colors ${error ? 'border-red-400' : 'border-gray-300 focus-within:border-[#1a3a6b]'}`}>
        <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 text-sm text-gray-800 bg-transparent focus:outline-none placeholder-gray-300"
        />
        {rightEl}
      </div>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export function RegisterPage() {
  const { theme } = useUIStore();
  const navigate  = useNavigate();

  const [tab,       setTab]       = useState<'student' | 'admin'>('student');
  const [name,      setName]      = useState('');
  const [email,     setEmail]     = useState('');
  const [mobile,    setMobile]    = useState('');
  const [password,  setPassword]  = useState('');
  const [confirm,   setConfirm]   = useState('');
  const [showPw,    setShowPw]    = useState(false);
  const [showCf,    setShowCf]    = useState(false);
  const [success,   setSuccess]   = useState(false);
  const [errors,    setErrors]    = useState<Record<string, string>>({});

  useEffect(() => {
    if (theme === 'dark') document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [theme]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())                         e.name     = 'Full name is required.';
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) e.email = 'Enter a valid email address.';
    if (!mobile.match(/^\+?\d{10,13}$/))      e.mobile   = 'Enter a valid mobile number (10–13 digits).';
    if (password.length < 6)                  e.password = 'Password must be at least 6 characters.';
    if (password !== confirm)                 e.confirm  = 'Passwords do not match.';

    // Check duplicates
    const existing = getRegisteredUsers();
    if (existing.some((u) => u.email === email))   e.email  = 'This email is already registered.';
    if (existing.some((u) => u.mobile === mobile)) e.mobile = 'This mobile is already registered.';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newUser = {
      id:       `reg_${Date.now()}`,
      name:     name.trim(),
      email:    email.trim().toLowerCase(),
      mobile:   mobile.trim(),
      password,
      role:     tab as 'student' | 'admin',
      avatar:   `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(name)}`,
    };

    saveRegisteredUser(newUser);
    setSuccess(true);
    setTimeout(() => navigate('/login'), 2200);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6"
      style={{ background: 'linear-gradient(135deg, #e8edf5 0%, #f0f4fb 50%, #e8edf5 100%)' }}
    >
      <div className="w-full max-w-5xl flex items-center gap-10">

        {/* ── Left: Illustration ── */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="hidden lg:flex flex-col items-center flex-1"
        >
          <div className="flex items-center gap-3 mb-6">
            <img src={logoImg} alt="E-School" className="w-14 h-14 object-contain drop-shadow" />
            <div>
              <p className="text-2xl font-black" style={{ color: '#1a3a6b' }}>E-School</p>
              <p className="text-sm text-gray-500">Smart Learning Platform</p>
            </div>
          </div>
          <RegisterIllustration />
          <div className="mt-4 text-center space-y-1">
            <p className="text-sm font-semibold text-gray-600">Join thousands of learners</p>
            <p className="text-xs text-gray-400">Create your account and start learning today</p>
          </div>
        </motion.div>

        {/* ── Right: Register Card ── */}
        <div className="flex-1 flex flex-col items-center gap-4 max-w-sm mx-auto">

          {/* Role tabs */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center bg-white rounded-full shadow-sm border border-gray-200 p-1"
          >
            {(['student', 'admin'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
                className="relative px-7 py-2 rounded-full text-sm font-bold transition-all capitalize z-10"
                style={tab === t ? { background: '#1a3a6b', color: 'white' } : { color: '#374151' }}
              >
                {t === 'student' ? 'Student' : 'Admin'}
              </button>
            ))}
          </motion.div>

          {/* Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="w-full bg-white rounded-2xl shadow-xl overflow-hidden"
          >
            {/* Header */}
            <div className="py-4 text-center" style={{ background: '#1a3a6b' }}>
              <h1 className="text-xl font-black text-white tracking-widest">CREATE ACCOUNT</h1>
              <p className="text-blue-200 text-xs mt-0.5">Register as {tab === 'student' ? 'Student' : 'Admin'}</p>
            </div>

            {/* Body */}
            <div className="px-7 py-6">
              <AnimatePresence mode="wait">
                {success ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex flex-col items-center gap-3 py-6 text-center"
                  >
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ background: '#e8edf5' }}>
                      <CheckCircle className="w-9 h-9" style={{ color: '#1a3a6b' }} />
                    </div>
                    <p className="text-lg font-black text-gray-800">Registration Successful!</p>
                    <p className="text-sm text-gray-500">Redirecting to login…</p>
                  </motion.div>
                ) : (
                  <motion.form
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onSubmit={handleSubmit}
                    className="space-y-3.5"
                  >
                    {/* Global error */}
                    {errors.global && (
                      <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg border border-red-200">
                        <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                        <p className="text-sm text-red-600">{errors.global}</p>
                      </div>
                    )}

                    <Field
                      label="Full Name"
                      icon={User}
                      value={name}
                      onChange={setName}
                      placeholder="Enter your full name"
                      error={errors.name}
                    />

                    <Field
                      label="Email Address"
                      icon={Mail}
                      type="email"
                      value={email}
                      onChange={setEmail}
                      placeholder="you@example.com"
                      error={errors.email}
                    />

                    <Field
                      label="Mobile Number"
                      icon={Phone}
                      type="tel"
                      value={mobile}
                      onChange={setMobile}
                      placeholder="+91 98765 43210"
                      error={errors.mobile}
                    />

                    <Field
                      label="Password"
                      icon={Lock}
                      type={showPw ? 'text' : 'password'}
                      value={password}
                      onChange={setPassword}
                      placeholder="Min. 6 characters"
                      error={errors.password}
                      rightEl={
                        <button type="button" onClick={() => setShowPw(!showPw)} className="text-gray-400 hover:text-gray-600">
                          {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />

                    <Field
                      label="Confirm Password"
                      icon={Lock}
                      type={showCf ? 'text' : 'password'}
                      value={confirm}
                      onChange={setConfirm}
                      placeholder="Re-enter your password"
                      error={errors.confirm}
                      rightEl={
                        <button type="button" onClick={() => setShowCf(!showCf)} className="text-gray-400 hover:text-gray-600">
                          {showCf ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      }
                    />

                    {/* Password strength */}
                    {password.length > 0 && (
                      <div className="space-y-1">
                        <div className="flex gap-1">
                          {[1,2,3,4].map((lvl) => {
                            const strength = password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password) ? 4
                              : password.length >= 8 && /[0-9]/.test(password) ? 3
                              : password.length >= 6 ? 2 : 1;
                            return (
                              <div key={lvl} className="flex-1 h-1.5 rounded-full transition-colors"
                                style={{ background: lvl <= strength
                                  ? strength >= 4 ? '#16a34a' : strength >= 3 ? '#2563eb' : strength >= 2 ? '#f59e0b' : '#ef4444'
                                  : '#e5e7eb' }} />
                            );
                          })}
                        </div>
                        <p className="text-xs text-gray-400">
                          {password.length >= 10 && /[A-Z]/.test(password) && /[0-9]/.test(password) ? 'Strong password' :
                           password.length >= 8 ? 'Good password' :
                           password.length >= 6 ? 'Weak — add numbers or symbols' : 'Too short'}
                        </p>
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full py-3 rounded-lg text-white font-black text-sm tracking-wide transition-opacity hover:opacity-90 mt-1 flex items-center justify-center gap-2"
                      style={{ background: '#1a3a6b' }}
                    >
                      <BookOpen className="w-4 h-4" />
                      Create Account
                    </button>

                    <p className="text-center text-xs text-gray-400 pt-1">
                      Already have an account?{' '}
                      <Link to="/login" className="font-bold hover:underline" style={{ color: '#1a3a6b' }}>
                        Log in
                      </Link>
                    </p>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <p className="text-xs text-gray-400">© 2024 E-School. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
