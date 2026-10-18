import React from 'react';
import { X, Scale, FileText, AlertTriangle, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { Language } from '../types/index.ts';

interface TermsOfServiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const TermsOfServiceModal: React.FC<TermsOfServiceModalProps> = ({
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
      aria-labelledby="terms-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <h2 id="terms-modal-title" className="text-lg font-black text-slate-900 dark:text-slate-100">
                {isAr ? 'شروط الاستخدام والأحكام القانونية' : 'Terms of Service & Legal Agreement'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'القواعد المنظمة لاستخدام منصة قَبْضَة وأدواتها المالية' : 'Terms governing the use of Qabdah platform and financial calculators'}
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
          {/* Section 1: Acceptance */}
          <section className="space-y-2">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isAr ? '1. قبول الشروط والأهلية' : '1. Acceptance of Terms & Eligibility'}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isAr
                ? 'باستخدامك لمنصة وتطبيق قَبْضَة (Qabdah)، فإنك توافق على الالتزام الكامل بهذه الشروط والأحكام. إذا كنت لا توافق على أي جزء منها، يُرجى عدم استخدام المنصة أو خدماتها.'
                : 'By accessing or using Qabdah, you agree to be bound by these Terms of Service. If you disagree with any portion of these terms, please refrain from using the platform.'}
            </p>
          </section>

          {/* Section 2: Educational & Informational Nature */}
          <section className="space-y-2 p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2 text-blue-800 dark:text-blue-300">
              <AlertTriangle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <span>{isAr ? '2. إخلاء مسؤولية الاستشارات المالية والاستثمارية' : '2. Financial & Investment Advice Disclaimer'}</span>
            </h3>
            <p className="text-xs text-slate-700 dark:text-slate-300">
              {isAr
                ? 'منصة قَبْضَة هي أداة برمجية وتقنية لتنظيم الميزانيات، وحساب أرقام السداد، وتتبع المعاملات الشخصية، وأسعار صرف العملات الاسترشادية. قَبْضَة ليست بنكاً ولا وسيطاً مالياً ولا تقدم نصائح استثمارية أو ضريبية أو قانونية معتمدة. يجب دائماً استشارة خبير مالي أو قانوني معتمد قبل اتخاذ قرارات مالية كبرى أو التزامات اقتراض مصيرية.'
                : 'Qabdah provides software calculations, ledger management, budget tracking, and indicative exchange rate tools. Qabdah is not a bank, broker, or licensed investment advisor. Content and calculations are for personal planning and informational purposes only and should not be construed as certified financial, legal, or tax advice.'}
            </p>
          </section>

          {/* Section 3: User Accounts & Data Security */}
          <section className="space-y-2">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isAr ? '3. حسابات المستخدمين ومسؤولية الحماية' : '3. User Accounts & Account Security'}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isAr
                ? 'المستخدم مسؤول عن حماية وسيلة وصوله إلى حسابه وجهازه. نظراً لاعتماد قَبْضَة على التخزين المحلي الآمن والتشفير السحابي المباشر، فإن الحفاظ على سرية كلمة المرور ومفاتيح المزامنة الخاصة بـ Supabase تقع على عاتق المستخدم وحده.'
                : 'Users are responsible for safeguarding device access and credentials. Because Qabdah employs secure local storage and user-controlled database keys, maintaining password confidentiality rests with the user.'}
            </p>
          </section>

          {/* Section 4: Acceptable Use */}
          <section className="space-y-2">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isAr ? '4. الاستخدام المقبول والنزيه' : '4. Acceptable Use Policy'}</span>
            </h3>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600 dark:text-slate-300 ps-1">
              <li>{isAr ? 'يُحظر استخدام المنصة في أي أنشطة غير مشروعة أو غسيل أموال أو احتيال.' : 'Prohibited from using the platform for illegal acts, fraud, or illicit money operations.'}</li>
              <li>{isAr ? 'يُحظر محاولة اختراق خوادم المنصة أو إرسال طلبات آلية ضارة تعطل الخدمة.' : 'No attempts to breach platform infrastructure or send abusive automated requests.'}</li>
              <li>{isAr ? 'يُمنع استغلال واجهات برمجة التطبيقات بطرق تخالف سياسة الاستخدام العادل.' : 'Prohibited from exploiting APIs in violation of reasonable fair-use guidelines.'}</li>
            </ul>
          </section>

          {/* Section 5: Intellectual Property */}
          <section className="space-y-2">
            <h3 className="font-black text-slate-900 dark:text-slate-100 text-sm flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isAr ? '5. الملكية الفكرية وحقوق النشر' : '5. Intellectual Property Rights'}</span>
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {isAr
                ? 'جميع العلامات التجارية، والشعارات، والتصميمات، والنصوص، والشفرات البرمجية الخاصة بمنصة قَبْضَة هي ملكية فكرية حصرية لمطوري المنصة ومحمية بموجب قوانين الملكية الفكرية المعمول بها.'
                : 'All trademarks, logos, UI designs, code, and content of Qabdah are the intellectual property of the platform developers, protected under applicable intellectual property laws.'}
            </p>
          </section>

          {/* Section 6: Limitation of Liability */}
          <section className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-1">
            <span className="font-bold text-slate-900 dark:text-slate-100 block">
              {isAr ? '6. حدود المسؤولية والقانون الحاكم' : '6. Limitation of Liability & Governing Law'}
            </span>
            <p className="text-slate-600 dark:text-slate-400">
              {isAr
                ? 'يتم تقديم المنصة "كما هي" دون ضمانات صريحة أو ضمنية باستمرار عملها دون انقطاع. لا تتحمل المنصة أي مسؤولية عن أي خسائر ناتجة عن أخطاء إدخال المستخدم أو تذبذب أسعار صرف العملات في الأسواق المصرفية. تخضع هذه الشروط للقوانين المنظمة للاتصالات والتقنية في جمهورية مصر العربية.'
                : 'The platform is provided "as is" without warranty of any kind. Qabdah shall not be liable for any direct or indirect damages resulting from user data entry errors or currency market fluctuations. Governed under applicable technology and electronic commerce laws.'}
            </p>
            <p className="text-[11px] text-slate-400 pt-1">
              {isAr ? 'آخر تحديث: أكتوبر 2026' : 'Last updated: October 2026'}
            </p>
          </section>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isAr ? 'شروط استخدام قانونية واضحة وشفافة' : 'Clear & Transparent Terms of Service'}</span>
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
