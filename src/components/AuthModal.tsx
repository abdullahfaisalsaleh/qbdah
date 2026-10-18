import React, { useState } from 'react';
import { X, Eye, EyeOff, Lock, Mail, User, ShieldCheck, Sparkles, Check, AlertCircle } from 'lucide-react';
import { CurrencyCode, Language, UserProfile } from '../types/index.ts';
import { StorageService } from '../services/storage.ts';
import { CURRENCIES } from '../utils/finance.ts';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onLoginSuccess: (user: UserProfile) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  language,
  onLoginSuccess,
  initialMode = 'login',
}) => {
  const isAr = language === 'ar';
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [preferredCurrency, setPreferredCurrency] = useState<CurrencyCode>('EGP');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!email.trim() || !password) {
      setErrorMessage(isAr ? 'يرجى إدخال البريد الإلكتروني وكلمة المرور.' : 'Please enter email and password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const users = StorageService.getUsers();
      const existingUser = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

      if (!existingUser) {
        setLoading(false);
        setErrorMessage(
          isAr
            ? 'البريد الإلكتروني غير مسجل، أو كلمة المرور غير صحيحة.'
            : 'Account not found or password incorrect.'
        );
        return;
      }

      // Successful login
      StorageService.setCurrentUser(existingUser);
      StorageService.addAuditLog(existingUser.id, 'LOGIN', 'User logged in successfully');
      setLoading(false);
      onLoginSuccess(existingUser);
      onClose();
    }, 400);
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!name.trim()) {
      setErrorMessage(isAr ? 'يرجى إدخال الاسم الكامل.' : 'Please enter your full name.');
      return;
    }

    if (!email.trim() || !email.includes('@') || !email.includes('.')) {
      setErrorMessage(isAr ? 'صيغة البريد الإلكتروني غير صحيحة.' : 'Please enter a valid email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage(isAr ? 'كلمة المرور يجب أن لا تقل عن 6 أحرف أو أرقام.' : 'Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(isAr ? 'كلمتا المرور غير متطابقتين.' : 'Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage(isAr ? 'يجب الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة.' : 'Please agree to terms and privacy policy.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      const users = StorageService.getUsers();
      const duplicate = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());

      if (duplicate) {
        setLoading(false);
        setErrorMessage(isAr ? 'هذا البريد الإلكتروني مسجل بالفعل. يرجى تسجيل الدخول.' : 'Email is already registered. Please sign in.');
        return;
      }

      const newUserId = 'user_' + Math.random().toString(36).substring(2, 10);
      const newUser: UserProfile = {
        id: newUserId,
        name: name.trim(),
        email: email.trim().toLowerCase(),
        currency: preferredCurrency,
        language,
        theme: 'light',
        plan: 'free',
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      // Save user profile & initialize fresh isolated workspace with standard accounts
      users.push(newUser);
      StorageService.saveUsers(users);
      StorageService.setCurrentUser(newUser);
      StorageService.initializeUserData(newUserId, false);

      setLoading(false);
      onLoginSuccess(newUser);
      onClose();
    }, 500);
  };

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMessage(isAr ? 'يرجى إدخال بريدك الإلكتروني.' : 'Please enter your email.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccessMessage(
        isAr
          ? 'تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك الإلكتروني بنجاح.'
          : 'Password reset link sent to your email.'
      );
    }, 600);
  };

  const handleInstantDemoLogin = () => {
    setLoading(true);
    setTimeout(() => {
      const demoUserId = 'user_demo_qabdah';
      const demoUser: UserProfile = {
        id: demoUserId,
        name: isAr ? 'أحمد كمال (حساب تجريبي)' : 'Ahmed Kamal (Demo Account)',
        email: 'ahmed.demo@qabdah.com',
        currency: 'EGP',
        language,
        theme: 'light',
        plan: 'premium',
        role: 'user',
        createdAt: new Date().toISOString(),
      };

      const users = StorageService.getUsers();
      if (!users.some((u) => u.id === demoUserId)) {
        users.push(demoUser);
        StorageService.saveUsers(users);
      }
      StorageService.setCurrentUser(demoUser);
      // Initialize with full realistic demo data!
      StorageService.initializeUserData(demoUserId, true);

      setLoading(false);
      onLoginSuccess(demoUser);
      onClose();
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-in fade-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          aria-label={isAr ? 'إغلاق' : 'Close'}
          className="absolute top-4 end-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-500 text-white font-serif font-black text-2xl shadow-md shadow-emerald-600/30 mb-3">
            ق
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {mode === 'login'
              ? isAr
                ? 'مرحباً بعودتك إلى قَبْضَة'
                : 'Welcome back to Qabdah'
              : mode === 'register'
              ? isAr
                ? 'إنشاء حساب جديد'
                : 'Create your Qabdah account'
              : isAr
              ? 'استعادة كلمة المرور'
              : 'Reset Password'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr ? 'فلوسك في إيدك، ومستقبلك في حسابك.' : 'Your money in hand, your future in sight.'}
          </p>
        </div>

        {/* Mode Tabs */}
        {mode !== 'forgot' && (
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-5 text-xs font-bold">
            <button
              onClick={() => {
                setMode('login');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg transition ${
                mode === 'login'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isAr ? 'تسجيل الدخول' : 'Sign In'}
            </button>
            <button
              onClick={() => {
                setMode('register');
                setErrorMessage('');
              }}
              className={`flex-1 py-2 rounded-lg transition ${
                mode === 'register'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {isAr ? 'إنشاء حساب جديد' : 'Sign Up'}
            </button>
          </div>
        )}

        {/* Quick Demo Button */}
        <button
          type="button"
          onClick={handleInstantDemoLogin}
          className="w-full py-2.5 px-4 mb-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 transition shadow-xs"
        >
          <Sparkles className="w-4 h-4 text-emerald-600" />
          <span>{isAr ? 'دخول فوري بحساب تجريبي مليء بالبيانات' : 'Instant 1-Click Demo Login'}</span>
        </button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="px-2 bg-white dark:bg-slate-900 text-slate-400">
              {isAr ? 'أو عبر البريد الإلكتروني' : 'or with email'}
            </span>
          </div>
        </div>

        {/* Error / Success Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Forms */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute top-3 start-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setMode('forgot');
                    setErrorMessage('');
                  }}
                  className="text-[11px] text-emerald-600 dark:text-emerald-400 hover:underline"
                >
                  {isAr ? 'نسيت كلمة المرور؟' : 'Forgot password?'}
                </button>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 absolute top-3 start-3 text-slate-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full ps-9 pe-10 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={isAr ? 'إظهار كلمة المرور' : 'Show Password'}
                  className="absolute top-2.5 end-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {loading ? (isAr ? 'جاري التحقق...' : 'Signing in...') : isAr ? 'دخول إلى حسابي' : 'Sign In'}
            </button>
          </form>
        )}

        {mode === 'register' && (
          <form onSubmit={handleRegister} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <div className="relative">
                <User className="w-4 h-4 absolute top-3 start-3 text-slate-400" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? 'أحمد محمد' : 'John Doe'}
                  required
                  className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute top-3 start-3 text-slate-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  required
                  className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'كلمة المرور' : 'Password'}
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'تأكيد المرور' : 'Confirm'}
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'العملة الأساسية للحساب' : 'Base Currency'}
              </label>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value as CurrencyCode)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              >
                {Object.keys(CURRENCIES).map((c) => (
                  <option key={c} value={c}>
                    {c} - {isAr ? CURRENCIES[c as CurrencyCode].nameAr : CURRENCIES[c as CurrencyCode].nameEn}
                  </option>
                ))}
              </select>
            </div>

            <label className="flex items-start gap-2 pt-1 text-[11px] text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={agreeTerms}
                onChange={(e) => setAgreeTerms(e.target.checked)}
                className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
              />
              <span>
                {isAr
                  ? 'أوافق على شروط الاستخدام وسياسة الخصوصية وأقر بصحة البيانات.'
                  : 'I agree to the Terms of Service and Privacy Policy.'}
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {loading ? (isAr ? 'جاري إنشاء الحساب...' : 'Creating...') : isAr ? 'إنشاء حساب جديد مجاناً' : 'Create Free Account'}
            </button>
          </form>
        )}

        {mode === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="space-y-4">
            <p className="text-xs text-slate-600 dark:text-slate-400">
              {isAr
                ? 'أدخل بريدك الإلكتروني المسجل وسنرسل لك تعليمات استعادة كلمة المرور فوراً.'
                : 'Enter your email address to receive password reset instructions.'}
            </p>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'البريد الإلكتروني' : 'Email Address'}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {loading ? (isAr ? 'جاري الإرسال...' : 'Sending...') : isAr ? 'إرسال رابط الاستعادة' : 'Send Reset Link'}
            </button>

            <div className="text-center">
              <button
                type="button"
                onClick={() => setMode('login')}
                className="text-xs text-slate-500 dark:text-slate-400 hover:underline"
              >
                {isAr ? 'العودة لتسجيل الدخول' : 'Back to Sign In'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
