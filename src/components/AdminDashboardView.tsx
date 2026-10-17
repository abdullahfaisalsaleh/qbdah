import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Crown,
  DollarSign,
  TrendingUp,
  Activity,
  Lock,
  X,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Language, UserProfile } from '../types/index.ts';
import { StorageService } from '../services/storage.ts';

interface AdminDashboardViewProps {
  user: UserProfile;
  language: Language;
  onClose: () => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({
  user,
  language,
  onClose,
}) => {
  const isAr = language === 'ar';

  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(user.role === 'admin');
  const [errorMsg, setErrorMsg] = useState('');

  const users = StorageService.getUsers();
  const auditLogs = StorageService.getAuditLogs();

  const totalUsers = users.length || 1;
  const premiumUsers = users.filter((u) => u.plan === 'premium').length;
  const freeUsers = totalUsers - premiumUsers;
  const simulatedMRR = premiumUsers * 2.99;

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (StorageService.verifyAdminAccess(passcode)) {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg(isAr ? 'رمز المرور الإداري غير صحيح.' : 'Invalid admin passcode.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        <button
          onClick={onClose}
          aria-label={isAr ? 'إغلاق' : 'Close'}
          className="absolute top-5 end-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Lock Screen if not authenticated */}
        {!isAuthenticated ? (
          <div className="max-w-sm mx-auto text-center py-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 mx-auto flex items-center justify-center mb-3">
              <Lock className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
              {isAr ? 'منطقة الإدارة الآمنة' : 'Admin Security Verification'}
            </h2>
            <p className="text-xs text-slate-400 mt-1 mb-5">
              {isAr ? 'أدخل الرمز الإداري المعتمد للمتابعة (الافتراضي: admin2026)' : 'Enter admin passcode (default: admin2026)'}
            </p>

            <form onSubmit={handleVerify} className="space-y-3">
              <input
                type="password"
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full px-4 py-2 text-center text-sm tracking-widest rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />

              {errorMsg && <p className="text-xs text-rose-600 font-medium">{errorMsg}</p>}

              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs transition shadow-md"
              >
                {isAr ? 'تأكيد الدخول الإداري' : 'Verify & Enter'}
              </button>
            </form>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 flex items-center justify-center">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                  {isAr ? 'لوحة القيادة الإدارية والعمليات' : 'Admin Operations & Analytics'}
                </h2>
                <p className="text-xs text-slate-400">
                  {isAr ? 'مؤشرات أداء منصة قَبْضَة وحسابات المشتركين' : 'Platform KPIs, subscriptions & audit trails'}
                </p>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400 font-medium">{isAr ? 'إجمالي الحسابات' : 'Total Users'}</span>
                <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-1">{totalUsers}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400 font-medium">{isAr ? 'مشتركو Premium' : 'Premium Users'}</span>
                <p className="text-2xl font-black text-amber-600 mt-1">{premiumUsers}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400 font-medium">{isAr ? 'الإيراد الشهري (MRR)' : 'Monthly MRR'}</span>
                <p className="text-2xl font-black text-emerald-600 mt-1">${simulatedMRR.toFixed(2)}</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <span className="text-[11px] text-slate-400 font-medium">{isAr ? 'حالة السيرفر والـ API' : 'System Health'}</span>
                <p className="text-sm font-bold text-emerald-600 mt-2 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <span>100% Operational</span>
                </p>
              </div>
            </div>

            {/* Registered Users Table */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                {isAr ? 'قائمة المستخدمين المسجلين' : 'Registered Users'}
              </h3>
              <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
                <table className="w-full text-start divide-y divide-slate-200 dark:divide-slate-700">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                    <tr>
                      <th className="py-2.5 px-4 text-start">{isAr ? 'الاسم' : 'Name'}</th>
                      <th className="py-2.5 px-4 text-start">{isAr ? 'البريد' : 'Email'}</th>
                      <th className="py-2.5 px-4 text-start">{isAr ? 'الخطة' : 'Plan'}</th>
                      <th className="py-2.5 px-4 text-start">{isAr ? 'العملة' : 'Currency'}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="py-2.5 px-4 font-bold">{u.name}</td>
                        <td className="py-2.5 px-4 text-slate-500">{u.email}</td>
                        <td className="py-2.5 px-4">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                              u.plan === 'premium'
                                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                                : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                            }`}
                          >
                            {u.plan}
                          </span>
                        </td>
                        <td className="py-2.5 px-4 font-mono font-bold text-slate-600 dark:text-slate-300">{u.currency}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Audit Logs */}
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">
                {isAr ? 'سجل العمليات والتدقيق الأمني (Audit Logs)' : 'Security Audit Trail'}
              </h3>
              <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                {auditLogs.length === 0 ? (
                  <p className="p-4 text-slate-400 text-center">{isAr ? 'لا توجد سجلات' : 'No logs'}</p>
                ) : (
                  auditLogs.map((log) => (
                    <div key={log.id} className="p-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}: </span>
                        <span className="text-slate-500">{log.details}</span>
                      </div>
                      <span className="text-[10px] text-slate-400 whitespace-nowrap ms-2">
                        {log.createdAt.slice(0, 19).replace('T', ' ')}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
