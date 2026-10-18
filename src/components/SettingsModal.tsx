import React, { useState } from 'react';
import {
  Settings,
  ShieldCheck,
  Download,
  Upload,
  Copy,
  Check,
  X,
  User,
  Globe,
  DollarSign,
  Moon,
  Sun,
  Database,
  Trash2,
  FileCode,
  Sparkles,
} from 'lucide-react';
import { CurrencyCode, Language, Theme, UserProfile } from '../types/index.ts';
import { StorageService } from '../services/storage.ts';
import { CURRENCIES } from '../utils/finance.ts';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currency: CurrencyCode;
  setCurrency: (curr: CurrencyCode) => void;
  onUpdateUser: (u: UserProfile) => void;
  initialTab?: string;
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  user,
  language,
  setLanguage,
  theme,
  setTheme,
  currency,
  setCurrency,
  onUpdateUser,
  initialTab = 'general',
  onOpenAbout,
  onOpenContact,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  const isAr = language === 'ar';
  const [activeTab, setActiveTab] = useState<'general' | 'supabase' | 'backup'>(initialTab as any);

  const [name, setName] = useState(user.name);
  const [copiedSql, setCopiedSql] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseAnonKey, setSupabaseAnonKey] = useState('');
  const [supabaseConnected, setSupabaseConnected] = useState(false);
  const [backupStatus, setBackupStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserProfile = {
      ...user,
      name: name.trim(),
      currency,
      language,
      theme,
    };
    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = StorageService.exportFullBackup(user.id);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qabdah_backup_${user.name}_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUploadBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importFullBackup(user.id, content);
      if (success) {
        setBackupStatus({
          type: 'success',
          message: isAr
            ? 'تم استعادة النسخة الاحتياطية بنجاح! جاري تطبيق البيانات...'
            : 'Backup restored successfully! Applying data...',
        });
        setTimeout(() => {
          window.location.reload();
        }, 1200);
      } else {
        setBackupStatus({
          type: 'error',
          message: isAr
            ? 'فشل استعادة الملف، يرجى التأكد من صحة تنسيق JSON.'
            : 'Failed to import backup file. Please verify JSON format.',
        });
      }
    };
    reader.readAsText(file);
  };

  const sqlSample = `-- 1. إنشاء جدول المستخدمين والمحافظ
CREATE TABLE IF NOT EXISTS public.accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'EGP',
  initial_balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  balance NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own accounts" ON public.accounts FOR ALL USING (auth.uid() = user_id);

-- 2. جدول المعاملات المالية
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  amount NUMERIC(15, 2) NOT NULL CHECK (amount > 0),
  source_account_id UUID NOT NULL REFERENCES public.accounts(id),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  description TEXT NOT NULL
);
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own transactions" ON public.transactions FOR ALL USING (auth.uid() = user_id);`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(sqlSample);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const handleConnectSupabase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabaseUrl.trim() || !supabaseAnonKey.trim()) return;
    setSupabaseConnected(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        <button
          onClick={onClose}
          aria-label={isAr ? 'إغلاق' : 'Close'}
          className="absolute top-5 end-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
              {isAr ? 'إعدادات الحساب والبيانات' : 'Settings & Data Management'}
            </h2>
            <p className="text-xs text-slate-400">
              {isAr ? 'التحكم في العملة الأساسية، النسخ الاحتياطي، ومزامنة السحاب' : 'Manage preferences, backups and cloud sync'}
            </p>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold mb-6">
          <button
            type="button"
            onClick={() => setActiveTab('general')}
            className={`flex-1 py-2 rounded-lg transition ${
              activeTab === 'general'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            {isAr ? 'عام والملف الشخصي' : 'General & Profile'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('backup')}
            className={`flex-1 py-2 rounded-lg transition ${
              activeTab === 'backup'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            {isAr ? 'النسخ الاحتياطي والاستعادة' : 'Backup & Restore'}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('supabase')}
            className={`flex-1 py-2 rounded-lg transition flex items-center justify-center gap-1.5 ${
              activeTab === 'supabase'
                ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            <Database className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isAr ? 'قاعدة بيانات Supabase' : 'Supabase Cloud'}</span>
          </button>
        </div>

        {/* TAB 1: General */}
        {activeTab === 'general' && (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'البريد الإلكتروني المسجل' : 'Registered Email'}
              </label>
              <input
                type="email"
                value={user.email}
                disabled
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/50 text-slate-400 cursor-not-allowed outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'العملة الأساسية' : 'Base Currency'}
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {Object.keys(CURRENCIES).map((c) => {
                    const cfg = CURRENCIES[c as CurrencyCode];
                    return (
                      <option key={c} value={c}>
                        {cfg.flag} {c} - {isAr ? cfg.nameAr : cfg.nameEn} ({isAr ? cfg.countryAr || cfg.nameAr : cfg.countryEn || cfg.nameEn})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'لغة الواجهة' : 'Language'}
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value as Language)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="ar">العربية (RTL)</option>
                  <option value="en">English (LTR)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'المظهر' : 'Theme'}
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    theme === 'light'
                      ? 'border-emerald-500 bg-emerald-50/50 text-emerald-800'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>{isAr ? 'الوضع الفاتح' : 'Light Mode'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex-1 py-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                    theme === 'dark'
                      ? 'border-emerald-500 bg-emerald-950/40 text-emerald-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>{isAr ? 'الوضع الليلي' : 'Dark Mode'}</span>
                </button>
              </div>
            </div>

            {savedSuccess && (
              <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                <Check className="w-4 h-4" />
                <span>{isAr ? 'تم حفظ التعديلات بنجاح!' : 'Changes saved!'}</span>
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md"
            >
              {isAr ? 'حفظ إعدادات الملف الشخصي' : 'Save Profile'}
            </button>
          </form>
        )}

        {/* TAB 2: Backup & Restore */}
        {activeTab === 'backup' && (
          <div className="space-y-4 text-xs">
            {backupStatus && (
              <div
                className={`p-3 rounded-xl border flex items-center gap-2 ${
                  backupStatus.type === 'success'
                    ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 text-emerald-700 dark:text-emerald-300'
                    : 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 text-rose-700 dark:text-rose-300'
                }`}
              >
                <span className="font-bold">{backupStatus.message}</span>
              </div>
            )}

            {/* POLICIES & SUPPORT TRANSPARENCY */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/20 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
              <div className="space-y-1">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 text-sm">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isAr ? 'السياسات والشفافية والدعم الفني' : 'Policies, Transparency & Support'}</span>
                </h3>
                <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                  {isAr
                    ? 'منصة قَبْضَة تلتزم بأعلى معايير الشفافية وحماية البيانات. يمكنك في أي وقت مراجعة سياسة الخصوصية، شروط الاستخدام، أو التواصل المباشر مع فريق الدعم الفني.'
                    : 'Qabdah adheres to the highest privacy and transparency standards. Review our terms, privacy disclosures, or contact our support team.'}
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
                {onOpenAbout && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenAbout();
                    }}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 text-center transition shadow-xs"
                  >
                    {isAr ? 'من نحن' : 'About Us'}
                  </button>
                )}
                {onOpenPrivacy && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenPrivacy();
                    }}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 text-center transition shadow-xs"
                  >
                    {isAr ? 'سياسة الخصوصية' : 'Privacy Policy'}
                  </button>
                )}
                {onOpenTerms && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenTerms();
                    }}
                    className="p-2.5 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-200 text-center transition shadow-xs"
                  >
                    {isAr ? 'شروط الاستخدام' : 'Terms of Use'}
                  </button>
                )}
                {onOpenContact && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenContact();
                    }}
                    className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-center transition shadow-xs"
                  >
                    {isAr ? 'اتصل بنا' : 'Contact Us'}
                  </button>
                )}
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Download className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'تصدير نسخة احتياطية كاملة (JSON)' : 'Export Full Backup (JSON)'}</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                {isAr
                  ? 'قم بتنزيل ملف JSON يحتوي على كامل بياناتك (المعاملات، المحافظ، الميزانيات، الديون، وأهداف الادخار) للرجوع إليها في أي وقت.'
                  : 'Download an encrypted JSON snapshot of your accounts, transactions, and budgets.'}
              </p>
              <button
                onClick={handleDownloadBackup}
                className="mt-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{isAr ? 'تنزيل ملف النسخة الاحتياطية' : 'Download JSON Backup'}</span>
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
              <h3 className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <span>{isAr ? 'استعادة من نسخة احتياطية' : 'Restore from Backup'}</span>
              </h3>
              <p className="text-slate-500 dark:text-slate-400 text-[11px]">
                {isAr
                  ? 'اختر ملف JSON محفوظ مسبقاً لاسترجاع كافة الحسابات والبيانات بدقة.'
                  : 'Select a previously exported JSON backup to restore your workspace.'}
              </p>
              <label className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold transition shadow-xs cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>{isAr ? 'اختيار ملف الاستعادة' : 'Choose Backup File'}</span>
                <input type="file" accept=".json" onChange={handleUploadBackup} className="hidden" />
              </label>
            </div>
          </div>
        )}

        {/* TAB 3: Supabase Cloud Sync */}
        {activeTab === 'supabase' && (
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 space-y-1">
              <h3 className="font-bold flex items-center gap-1.5 text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'ربط قاعدة بيانات Supabase السحابية' : 'Supabase Cloud Database Integration'}</span>
              </h3>
              <p className="text-[11px] leading-relaxed">
                {isAr
                  ? 'تم تجهيز قَبْضَة بمخطط قاعدة بيانات PostgreSQL متكامل ومحمي بـ Row Level Security (RLS) ومطابق تماماً لمعايير Supabase.'
                  : 'Qabdah is built with complete Supabase PostgreSQL DDL and strict RLS policies ready to deploy.'}
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-800 dark:text-slate-200">
                  {isAr ? 'كود الـ SQL المعتمد لقاعدة بياناتك:' : 'Complete PostgreSQL Schema Migration:'}
                </span>
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:underline"
                >
                  {copiedSql ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSql ? (isAr ? 'تم النسخ!' : 'Copied!') : isAr ? 'نسخ الكود' : 'Copy SQL'}</span>
                </button>
              </div>

              <pre className="p-3 rounded-xl bg-slate-900 text-slate-100 font-mono text-[10px] overflow-x-auto max-h-40 border border-slate-800 leading-normal">
                {sqlSample}
              </pre>
            </div>

            <form onSubmit={handleConnectSupabase} className="space-y-3 pt-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'رابط مشروع Supabase (Project URL)' : 'Supabase Project URL'}
                </label>
                <input
                  type="url"
                  value={supabaseUrl}
                  onChange={(e) => setSupabaseUrl(e.target.value)}
                  placeholder="https://xyzcompany.supabase.co"
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'مفتاح العميل العام (Anon Public Key)' : 'Supabase Anon Public Key'}
                </label>
                <input
                  type="password"
                  value={supabaseAnonKey}
                  onChange={(e) => setSupabaseAnonKey(e.target.value)}
                  placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {supabaseConnected && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] flex items-center gap-2 font-bold">
                  <Check className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? 'تم حفظ إعدادات Supabase وتفعيل المزامنة السحابية!' : 'Supabase config saved and synced!'}</span>
                </div>
              )}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md"
              >
                {isAr ? 'حفظ والربط مع Supabase' : 'Save & Connect Supabase'}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
