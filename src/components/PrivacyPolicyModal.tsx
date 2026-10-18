import React from 'react';
import { X, ShieldCheck, Cookie, Lock, EyeOff, UserCheck, FileText, CheckCircle2 } from 'lucide-react';
import { Language } from '../types/index.ts';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  const isAr = language === 'ar';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="privacy-modal-title" className="text-lg font-black text-slate-900 dark:text-slate-100">
                {isAr ? 'سياسة الخصوصية وحماية البيانات' : 'Privacy Policy & Data Protection'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'متوافقة مع معايير Google AdSense والشفافية الدولية' : 'Compliant with Google AdSense standards and international transparency'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={isAr ? 'إغلاق' : 'Close'}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-6 overflow-y-auto space-y-6 text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
          {/* Key Statement */}
          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-start gap-3">
            <Lock className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <p className="font-extrabold text-slate-900 dark:text-slate-100 mb-1">
                {isAr ? 'التزامنا الأساسي: بياناتك المالية ملكك وحدك' : 'Our Foundational Commitment: Your Financial Data Belongs Exclusively to You'}
              </p>
              <p className="text-slate-600 dark:text-slate-300">
                {isAr
                  ? 'في منصة قَبْضَة (Qabdah)، لا نطلب ربط حساباتك البنكية ولا نسحب بياناتك السرية. جميع مدخلاتك المحاسبية وميزانياتك مشفرة ومحمية، ولا نقوم إطلاقاً ببيع أو تأجير معلوماتك المالية لأي جهة أو شبكة تجارية.'
                  : 'At Qabdah, we never request bank login credentials. All your ledger balances and budgets are strictly protected. We never sell, rent, or trade your personal financial transactions to any third party.'}
              </p>
            </div>
          </div>

          {/* Section 1: Data Collection */}
          <section className="space-y-2">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isAr ? '1. البيانات التي نجمعها وطبيعة استخدامها' : '1. Information We Collect and How It Is Used'}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isAr
                ? 'نقوم بجمع البيانات التي تدخلها طواعية بهدف تمكين وظائف التطبيق، وتشمل: اسم الحساب، البريد الإلكتروني، المعاملات المالية (المصروفات والإيرادات)، أسماء المحافظ والأهداف الادخارية، وتفضيلات العملة واللغة. تُستخدم هذه البيانات حصرياً لحساب تقاريرك المالية وعرض مؤشرات أدائك المالي.'
                : 'We collect information you voluntarily provide to power application features: user profile name, email, transactions (income/expenses), account/wallet labels, savings targets, and currency/language preferences. This information is used strictly to compute your financial dashboards and reports.'}
            </p>
          </section>

          {/* Section 2: Google AdSense and Third-Party Advertising */}
          <section className="space-y-3 p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Cookie className="w-4 h-4 text-amber-600 dark:text-amber-400" />
              <span>{isAr ? '2. إعلانات Google AdSense وملفات تعريف الارتباط (Cookies)' : '2. Google AdSense Advertising & Cookies Disclosure'}</span>
            </h3>
            <div className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
              <p>
                {isAr
                  ? 'تتعاون منصة قَبْضَة مع شركات إعلانية تابعة لجهات خارجية، وتحديداً شركة Google (Google AdSense)، لعرض الإعلانات عند زيارتك للموقع لدعم تشغيل الخوادم والخدمات المجانية للمستخدمين.'
                  : 'Qabdah partners with third-party advertising vendors, specifically Google (Google AdSense), to serve advertisements when you visit our website to support our free financial tools.'}
              </p>
              <ul className="list-disc list-inside space-y-1 ps-1 text-slate-600 dark:text-slate-400">
                <li>
                  {isAr
                    ? 'تستخدم Google بصفتها مورداً تابعاً لجهات خارجية، ملفات تعريف الارتباط (Cookies)، بما في ذلك ملف تعريف الارتباط DART، لعرض الإعلانات للمستخدمين استناداً إلى زياراتهم السابقة لهذا الموقع أو لمواقع أخرى على شبكة الإنترنت.'
                    : 'Google, as a third-party vendor, uses cookies (including the DoubleClick/DART cookie) to serve ads based on a user’s prior visits to this website or other websites across the Internet.'}
                </li>
                <li>
                  {isAr
                    ? 'لا ترتبط هذه الإعلانات بسجلات معاملاتك المالية المحفوظة في التطبيق، حيث تظل تلك السجلات معزولة وخاصة بحسابك.'
                    : 'These ads are never linked to your private financial transaction records stored in Qabdah.'}
                </li>
              </ul>
              <p className="font-semibold text-slate-800 dark:text-slate-200 pt-1">
                {isAr ? 'خيارات إلغاء الاشتراك في الإعلانات المخصصة:' : 'Opting Out of Personalized Advertising:'}
              </p>
              <p>
                {isAr ? (
                  <>
                    يمكن للمستخدمين إلغاء استخدام ملف تعريف الارتباط للإعلانات المخصصة عبر زيارة{' '}
                    <a
                      href="https://www.google.com/settings/ads"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 font-bold underline"
                    >
                      إعدادات إعلانات Google
                    </a>
                    ، أو عبر زيارة الموقع المستقل لمبادرة إعلانات الشبكة{' '}
                    <a
                      href="https://www.aboutads.info"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 font-bold underline"
                    >
                      www.aboutads.info
                    </a>
                    .
                  </>
                ) : (
                  <>
                    Users may opt out of personalized advertising by visiting{' '}
                    <a
                      href="https://www.google.com/settings/ads"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 font-bold underline"
                    >
                      Google Ads Settings
                    </a>{' '}
                    or by visiting{' '}
                    <a
                      href="https://www.aboutads.info"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-600 dark:text-emerald-400 font-bold underline"
                    >
                      www.aboutads.info
                    </a>
                    .
                  </>
                )}
              </p>
            </div>
          </section>

          {/* Section 3: Storage & Security */}
          <section className="space-y-2">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <EyeOff className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isAr ? '3. التخزين المحلي وأمن البيانات' : '3. Storage & Technical Security'}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isAr
                ? 'يستخدم التطبيق تقنيات التخزين المحلي الآمن (Local Storage) في متصفحك للحفاظ على سرعة التشغيل الفائقة والعمل حتى دون اتصال بالإنترنت (Offline-First). وعند مزامنة البيانات عبر سحابة Supabase الخاصة بالمستخدم، يتم تطبيق قواعد عزل البيانات على مستوى الصف (Row Level Security - RLS) بحيث لا يمكن لأي مستخدم آخر الوصول إلى سجلاتك.'
                : 'The application utilizes secure browser Local Storage to guarantee fast load speeds and offline-first availability. When syncing with user Supabase cloud databases, Row-Level Security (RLS) policies ensure no other account can access your records.'}
            </p>
          </section>

          {/* Section 4: User Rights */}
          <section className="space-y-2">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isAr ? '4. حقوق المستخدم في التحكم ببياناته' : '4. User Data Ownership & Rights'}</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                  {isAr ? 'حق التصدير الكامل' : 'Full Data Export'}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {isAr ? 'تصدير معاملاتك بصيغ CSV و JSON في أي وقت بضغطة زر.' : 'Export transactions to CSV or JSON anytime.'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                  {isAr ? 'حق الحذف النهائي' : 'Complete Deletion'}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {isAr ? 'مسح كافة سجلاتك من جهازك والخادم فوراً من شاشة الإعدادات.' : 'Erase all records from your device immediately.'}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
                  {isAr ? 'حق التصحيح والتعديل' : 'Right to Rectify'}
                </span>
                <span className="text-slate-500 text-[11px]">
                  {isAr ? 'تعديل وتصحيح أي معاملة أو حساب بكل مرونة ودون قيود.' : 'Modify any transaction or balance without restrictions.'}
                </span>
              </div>
            </div>
          </section>

          {/* Section 5: Contact for Privacy */}
          <section className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs">
            <span className="font-bold text-slate-900 dark:text-slate-100 block mb-1">
              {isAr ? '5. التواصل بشأن سياسة الخصوصية وتحديثاتها' : '5. Contact for Privacy Inquiries'}
            </span>
            <p className="text-slate-600 dark:text-slate-400">
              {isAr
                ? 'إذا كان لديك أي سؤال حول سياسة الخصوصية أو معالجة البيانات، يمكنك التواصل مباشرة عبر البريد الإلكتروني: bodyfs2030@gmail.com أو support@qabdah.com. يتم مراجعة وتحديث هذه السياسة دورياً ويسري أي تحديث فور نشره على هذه الصفحة.'
                : 'For any inquiries regarding this policy or your data rights, contact us at bodyfs2030@gmail.com or support@qabdah.com. This policy is reviewed periodically and any updates are effective upon publication.'}
            </p>
            <p className="text-[11px] text-slate-400 mt-2">
              {isAr ? 'تاريخ السريان: أكتوبر 2026' : 'Effective Date: October 2026'}
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isAr ? 'سياسة خصوصية معتمدة ومطابقة لمتطلبات الناشرين' : 'Verified Publisher-Compliant Privacy Policy'}</span>
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
