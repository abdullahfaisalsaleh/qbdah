import React from 'react';
import { X, ShieldCheck, HeartHandshake, Sparkles, Building2, Globe2, Target, Award, Mail } from 'lucide-react';
import { Language } from '../types/index.ts';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  onOpenContact?: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({
  isOpen,
  onClose,
  language,
  onOpenContact,
}) => {
  if (!isOpen) return null;

  const isAr = language === 'ar';

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="about-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-emerald-600/20">
              ق
            </div>
            <div>
              <h2 id="about-modal-title" className="text-lg font-black text-slate-900 dark:text-slate-100">
                {isAr ? 'من نحن | عن منصة قَبْضَة المالية' : 'About Us | About Qabdah Platform'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'رسالتنا، رؤيتنا، ومعاييرنا في تمكين الاستقلال المالي' : 'Our mission, vision, and principles in financial empowerment'}
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
          {/* Mission Hero Banner */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
            <div className="flex items-start gap-3">
              <Sparkles className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 mb-1">
                  {isAr ? '«فلوسك في إيدك، ومستقبلك في حسابك»' : '"Your money in your control, your future in your account"'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                  {isAr
                    ? 'منصة قَبْضَة (Qabdah) هي منصة وتطبيق رقمي مالي مستقل، صُممت خصيصاً لتلبية الواقع المالي الفعلي للمواطن والأسرة وأصحاب العمل الحر في مصر ومختلف أرجاء الوطن العربي. هدفنا هو كسر دائرة الضباب المالي وتمكين كل فرد من إدارة مدخراته ومصروفاته وديونه بكل وضوح وكرامة.'
                    : 'Qabdah is an independent personal finance platform designed specifically to match the everyday financial reality of individuals, families, and freelancers in Egypt and across the Arab region. Our mission is to eliminate financial ambiguity and empower everyone to manage savings, debts, and budgets with dignity.'}
                </p>
              </div>
            </div>
          </div>

          {/* Core Values */}
          <div>
            <h4 className="font-black text-slate-900 dark:text-slate-100 text-sm mb-3 flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>{isAr ? 'المبادئ والقيم الحاكمة لمنصة قبضة' : 'Our Guiding Principles and Values'}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>{isAr ? 'الخصوصية التامة وعزل البيانات' : 'Total Privacy & Data Isolation'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isAr
                    ? 'لا نطلب بيانات حساباتك البنكية السرية إطلاقاً. حساباتك ودفاترك ملكك وحدك ولا نقوم ببيع أو مشاركة أي معلومة مالية شخصية لأي طرف ثالث أو شبكات إعلانية.'
                    : 'We never ask for your confidential banking credentials. Your records belong exclusively to you, and we never sell or share your personal data with third-party advertisers.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-1.5">
                  <Globe2 className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                  <span>{isAr ? 'ملاءمة الواقع العربي والعملات' : 'Arab Regional & Currency Fit'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isAr
                    ? 'دعم مخصص لجميع العملات العربية الـ 21، ومحافظ الكاش، إنستاباي، فودافون كاش، STC Pay والمحافظ الرقمية مع تحويلات بينية تمنع الازدواج المحاسبي.'
                    : 'Native support for all 21 Arab League currencies, cash balances, InstaPay, Vodafone Cash, STC Pay, and local wallets with dual-entry transfer protection.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-1.5">
                  <Target className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span>{isAr ? 'أدوات حسابية تفاعلية وحقيقية' : 'Real, Interactive Financial Calculators'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isAr
                    ? 'نوفر حاسبات مفتوحة لقاعدة 50/30/20، سداد الديون (كرة الثلج والانهيار الجليدي)، وصندوق الطوارئ ليعرف المستخدم أين يذهب كل قرش بالمعادلات الدقيقة.'
                    : 'We provide open mathematical calculators for 50/30/20 budgeting, debt snowball/avalanche, and emergency funds so users see exact numbers.'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80">
                <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm mb-1.5">
                  <HeartHandshake className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>{isAr ? 'التوعية والشفافية بدون تعقيد' : 'Financial Literacy & Transparency'}</span>
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400">
                  {isAr
                    ? 'لا نروج لمنتجات قروض مشبوهة أو استثمارات احتيالية. هدفنا الوحيد هو التوعية والترتيب الحسابي السليم لنمط حياتك والتزاماتك.'
                    : 'We do not promote predatory loans or get-rich-quick schemes. Our focus is honest personal budgeting and disciplined financial planning.'}
                </p>
              </div>
            </div>
          </div>

          {/* Editorial & Operational Commitment */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700/60 space-y-2 text-xs">
            <h4 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-slate-500" />
              <span>{isAr ? 'فريق العمل والاتصال المباشر' : 'Team and Direct Contact'}</span>
            </h4>
            <p className="text-slate-600 dark:text-slate-300">
              {isAr
                ? 'يُدار مشروع قَبْضَة بواسطة فريق متخصص في هندسة البرمجيات والتكنولوجيا المالية في جمهورية مصر العربية، مع التزام كامل بتحديث أسعار الصرف وتحسين خوارزميات فحص الفواتير والتحليل التنبئي.'
                : 'Qabdah is maintained by a dedicated software and financial engineering team based in Cairo, Egypt, committed to maintaining accurate currency benchmarks, OCR tools, and budgeting models.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4 text-slate-500 dark:text-slate-400 font-medium">
              <span>{isAr ? '📍 القاهرة، جمهورية مصر العربية' : '📍 Cairo, Egypt'}</span>
              <span>•</span>
              <span>{isAr ? '✉️ الدعم الفني: bodyfs2030@gmail.com' : '✉️ Support: bodyfs2030@gmail.com'}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isAr ? 'منصة قَبْضَة المالية © جميع الحقوق محفوظة' : 'Qabdah Financial Platform © All rights reserved'}
          </p>
          <div className="flex items-center gap-2">
            {onOpenContact && (
              <button
                onClick={() => {
                  onClose();
                  onOpenContact();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{isAr ? 'تواصل معنا مباشرة' : 'Contact Us'}</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
            >
              {isAr ? 'إغلاق' : 'Close'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
