import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Receipt,
  ScanLine,
  HandCoins,
  PiggyBank,
  Sparkles,
  CheckCircle2,
  Lock,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  Layers,
  Smartphone,
  Zap,
  BarChart3,
  Crown,
  Mail,
  HelpCircle,
} from 'lucide-react';
import { Language } from '../types/index.ts';
import { PublicFinancialTools } from './PublicFinancialTools.tsx';

interface LandingPageProps {
  language: Language;
  onGetStarted: () => void;
  onSignIn: () => void;
  onTryDemo: () => void;
  onOpenSubscriptions: () => void;
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
  onOpenCurrencyConverter?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  language,
  onGetStarted,
  onSignIn,
  onTryDemo,
  onOpenSubscriptions,
  onOpenAbout,
  onOpenContact,
  onOpenPrivacy,
  onOpenTerms,
  onOpenCurrencyConverter,
}) => {
  const isAr = language === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const features = [
    {
      icon: TrendingUp,
      title: isAr ? 'إدارة الدخل والمصروفات' : 'Income & Expense Tracking',
      desc: isAr
        ? 'سجل كل قرش يدخل أو يخرج بدقة وسرعة من هاتفك، مع تصنيفات مخصصة وحساب فوري للأرصدة.'
        : 'Track every penny earned and spent with custom categories and real-time balance calculations.',
    },
    {
      icon: Layers,
      title: isAr ? 'محافظ وحسابات متعددة' : 'Multi-Account & Wallets',
      desc: isAr
        ? 'إدارة الكاش، الحساب البنكي، ومحافظ انستاباي وفودافون كاش مع تحويلات داخلية لا تكرر الدخل أو المصروف.'
        : 'Manage Cash, Bank, and Mobile Wallets with inter-account transfers that maintain clean accounting.',
    },
    {
      icon: HandCoins,
      title: isAr ? 'دفتر الديون والسلف' : 'Debts & Receivables Ledger',
      desc: isAr
        ? 'تابع الأموال التي لك عند الآخرين والديون المستحقة عليك، مع سجل للأقساط وتنبيهات الاستحقاق.'
        : 'Monitor money owed to you and debts you owe, with partial installments and due date alerts.',
    },
    {
      icon: PiggyBank,
      title: isAr ? 'أهداف الادخار الذكية' : 'Smart Savings Goals',
      desc: isAr
        ? 'حدد أهدافك المالية (صندوق طوارئ، سيارة، لابتوب)، واحسب المبلغ المطلوب ادخاره يومياً وشهرياً.'
        : 'Set targets for emergency funds or purchases, and get daily/monthly calculated savings plans.',
    },
    {
      icon: ScanLine,
      title: isAr ? 'فحص الفواتير بالذكاء الاصطناعي' : 'AI Receipt & Invoice OCR',
      desc: isAr
        ? 'صور أي فاتورة ورقية، وسيقوم الذكاء الاصطناعي باستخراج المتجر والمبلغ والتاريخ والتصنيف تلقائياً.'
        : 'Snap photos of receipts. AI extracts merchant, total amount, date, and suggested category in seconds.',
    },
    {
      icon: Sparkles,
      title: isAr ? 'مستشار مالي ذكي' : 'AI Financial Advisor',
      desc: isAr
        ? 'اسأل المساعد الذكي عن وضعك المالي، وتلقَّ تحليلاً واقعياً لنفقاتك ونصائح لتقليل الهدر وزيادة الادخار.'
        : 'Ask your private AI advisor questions about your spending patterns and receive actionable saving tips.',
    },
  ];

  const faqs = [
    {
      q: isAr ? 'هل بياناتي المالية آمنة وخاصة؟' : 'Is my financial data secure and private?',
      a: isAr
        ? 'نعم بالكامل. تطبيق قَبْضَة يتبع معايير أمان صارمة مع عزل تام لبيانات كل مستخدم (Row Level Security)، وتشفير كامل للاتصال، ولا نشارك بياناتك مع أي طرف ثالث أو إعلانات تستهدف بياناتك المالية.'
        : 'Absolutely. Qabdah enforces strict row-level security, end-to-end encrypted sessions, and isolated workspaces. We never share or sell your financial records.',
    },
    {
      q: isAr ? 'هل يدعم التطبيق الجنيه المصري والعملات العربية؟' : 'Does Qabdah support Egyptian Pound and Arab currencies?',
      a: isAr
        ? 'نعم، الجنيه المصري (EGP) هو العملة الافتراضية، مع دعم كامل للريال السعودي، الدرهم الإماراتي، الدينار الكويتي، الدولار الأمريكي، واليورو بأسعار صرف شفافة.'
        : 'Yes, EGP is the primary default currency, alongside SAR, AED, KWD, USD, and EUR with transparent exchange rates.',
    },
    {
      q: isAr ? 'ما الفرق بين الخطة المجانية وQabdah Premium؟' : 'What is the difference between Free and Premium?',
      a: isAr
        ? 'الخطة المجانية تتيح لك الاستخدام الكامل لتسجيل المعاملات والمحفظة الأساسية والميزانية. خطة Premium تمنحك فحص الفواتير غير المحدود بالذكاء الاصطناعي، المستشار المالي المتقدم، تقارير PDF وإكسيل احترافية، وحسابات متعددة غير محدودة وتجربة خالية تماماً من الإعلانات.'
        : 'The Free plan covers complete transaction tracking and core budgeting. Premium unlocks unlimited AI OCR receipt scans, smart financial advisor, multi-account ledger, PDF/Excel export, and an ad-free experience.',
    },
    {
      q: isAr ? 'هل يمكنني استخدام التطبيق كتطبيق هاتف (PWA) بدون متجر؟' : 'Can I install this on my smartphone as a PWA?',
      a: isAr
        ? 'نعم، يدعم التطبيق التثبيت الفوري كـ Progressive Web App (PWA) على آيفون وأندرويد وأجهزة الكمبيوتر مع العمل السلس ودعم الاستخدام دون اتصال مستمر.'
        : 'Yes! Qabdah is built as an installable PWA for iOS, Android, and desktop with offline support.',
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32">
        {/* Subtle decorative background glow */}
        <div className="absolute top-0 start-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-3xl mx-auto">
            {/* Arabic Slogan Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold mb-6 shadow-xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {isAr ? '«فلوسك في إيدك، ومستقبلك في حسابك»' : 'Your money in hand, your future in sight'}
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-tight">
              {isAr ? (
                <>
                  تحكم في مصاريفك وابنِ مستقبلك المالي مع{' '}
                  <span className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-500 dark:from-emerald-400 dark:via-emerald-300 dark:to-teal-200 bg-clip-text text-transparent">
                    قَبْضَة
                  </span>
                </>
              ) : (
                <>
                  Master your finances and budget with confidence using{' '}
                  <span className="bg-gradient-to-r from-emerald-700 to-teal-500 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                    Qabdah
                  </span>
                </>
              )}
            </h1>

            <p className="mt-6 text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
              {isAr
                ? 'التطبيق المالي الشخصي المتكامل لمتابعة المصروفات والدخل، وإدارة الديون، وتحقيق أهداف الادخار، مع فحص ذكي للفواتير ومستشار مالي مدعوم بالذكاء الاصطناعي.'
                : 'The all-in-one personal finance suite to track spending, manage debts, plan budgets, hit savings goals, and scan receipts with AI assistance.'}
            </p>

            {/* CTA Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={onGetStarted}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-base shadow-lg shadow-emerald-600/25 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isAr ? 'ابدأ مجاناً الآن' : 'Get Started Free'}</span>
                <Arrow className="w-5 h-5" />
              </button>

              <button
                onClick={onTryDemo}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 font-bold text-base transition shadow-xs flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-emerald-500" />
                <span>{isAr ? 'تجربة سريعة بحساب تجريبي' : 'Try Live Demo Account'}</span>
              </button>

              <button
                onClick={onSignIn}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold text-sm transition cursor-pointer"
              >
                {isAr ? 'لديك حساب بالفعل؟ تسجيل الدخول' : 'Already have an account? Sign In'}
              </button>
            </div>

            {/* Trust Metrics Bar */}
            <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 dark:text-emerald-400">100%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'حماية وخصوصية تامة' : 'Private & Secure'}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">0%</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'أخطاء حسابية أو تكرار' : 'Double-counting Error'}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-teal-600 dark:text-teal-400">7+</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'عملات عربية ودولية' : 'Supported Currencies'}</p>
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">PWA</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'تثبيت فوري على الجوال' : 'Installable on Mobile'}</p>
              </div>
            </div>
          </div>

          {/* Interactive Live App Mockup / Dashboard Preview */}
          <div className="mt-16 relative mx-auto max-w-5xl rounded-2xl p-2 bg-gradient-to-b from-slate-200 to-slate-100 dark:from-slate-800 dark:to-slate-900 shadow-2xl border border-slate-300 dark:border-slate-700">
            <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-inner">
              {/* Browser mockup top bar */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-xs">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-rose-400"></span>
                  <span className="w-3 h-3 rounded-full bg-amber-400"></span>
                  <span className="w-3 h-3 rounded-full bg-emerald-400"></span>
                </div>
                <div className="flex items-center gap-2 px-3 py-1 bg-white dark:bg-slate-900 rounded-md text-[11px] text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
                  <Lock className="w-3 h-3 text-emerald-600" />
                  <span>https://qabdah.com/dashboard</span>
                </div>
                <div className="text-[10px] text-slate-400 font-mono">v1.0 Pro</div>
              </div>

              {/* Realistic Preview Screen Content */}
              <div className="p-4 sm:p-6 lg:p-8 space-y-6">
                {/* 4 Top KPI Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                  <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-800 text-white shadow-md">
                    <p className="text-xs text-emerald-100 font-medium">{isAr ? 'صافي الثروة المتاحة' : 'Total Net Worth'}</p>
                    <p className="text-xl sm:text-2xl font-black mt-1">47,700 ج.م</p>
                    <p className="text-[10px] text-emerald-200 mt-1">{isAr ? 'موزعة في 4 محافظ وحسابات' : 'Across 4 active accounts'}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'دخل الشهر الحالي' : 'Monthly Income'}</p>
                    <p className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">+31,500 ج.م</p>
                    <p className="text-[10px] text-emerald-600 mt-1 font-bold">↑ 12% {isAr ? 'مقارنة بالشهر الماضي' : 'vs last month'}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'مصروفات الشهر' : 'Monthly Expenses'}</p>
                    <p className="text-xl sm:text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">-10,050 ج.م</p>
                    <p className="text-[10px] text-slate-400 mt-1">{isAr ? 'ضمن الحدود الآمنة للميزانية' : 'Within budget target'}</p>
                  </div>

                  <div className="p-4 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs">
                    <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{isAr ? 'صافي التوفير والادخار' : 'Net Cashflow'}</p>
                    <p className="text-xl sm:text-2xl font-black text-teal-600 dark:text-teal-400 mt-1">+21,450 ج.م</p>
                    <p className="text-[10px] text-teal-600 font-bold mt-1">68% {isAr ? 'معدل الادخار' : 'Savings rate'}</p>
                  </div>
                </div>

                {/* Sub row: Mini Cashflow Chart & Accounts Snapshot */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-bold text-xs">{isAr ? 'مؤشر التدفق المالي (الدخل مقابل المصروف)' : 'Cashflow Performance'}</span>
                      <span className="text-[11px] text-emerald-600 font-bold">{isAr ? 'شهري' : 'Monthly'}</span>
                    </div>
                    {/* SVG Graphic mockup */}
                    <div className="h-32 w-full flex items-end gap-3 pt-4 px-2">
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-emerald-500/80 rounded-t-sm" style={{ height: '70px' }}></div>
                        <span className="text-[10px] text-slate-400">مايو</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-emerald-500/80 rounded-t-sm" style={{ height: '85px' }}></div>
                        <span className="text-[10px] text-slate-400">يونيو</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-emerald-500/80 rounded-t-sm" style={{ height: '75px' }}></div>
                        <span className="text-[10px] text-slate-400">يوليو</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-emerald-500/80 rounded-t-sm" style={{ height: '90px' }}></div>
                        <span className="text-[10px] text-slate-400">أغسطس</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-emerald-500/80 rounded-t-sm" style={{ height: '95px' }}></div>
                        <span className="text-[10px] text-slate-400">سبتمبر</span>
                      </div>
                      <div className="flex-1 flex flex-col items-center gap-1">
                        <div className="w-full bg-emerald-600 rounded-t-sm" style={{ height: '110px' }}></div>
                        <span className="text-[10px] font-bold text-emerald-600">أكتوبر</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col justify-between">
                    <span className="font-bold text-xs">{isAr ? 'محافظك النشطة' : 'Your Wallets'}</span>
                    <div className="space-y-2 mt-2">
                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span>حساب بنكي (CIB)</span>
                        <span className="font-bold">28,500 ج.م</span>
                      </div>
                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span>انستاباي / محفظة ذكية</span>
                        <span className="font-bold">4,200 ج.م</span>
                      </div>
                      <div className="flex items-center justify-between text-xs p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                        <span>صندوق ادخار الطوارئ</span>
                        <span className="font-bold text-emerald-600">15,000 ج.م</span>
                      </div>
                    </div>
                    <button
                      onClick={onTryDemo}
                      className="mt-3 w-full py-2 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-700 transition"
                    >
                      {isAr ? 'استكشف لوحة التحكم بالكامل' : 'Explore Full Live App'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {isAr ? 'كل ما تحتاجه لإدارة أموالك في تطبيق واحد' : 'Everything you need to master personal wealth'}
            </h2>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              {isAr
                ? 'صُممت قَبْضَة لتناسب المستخدم العربي بمميزات عملية، واجهة واضحة، وحسابات مالية موثوقة بنسبة 100%.'
                : 'Built with rigorous accounting rules, zero guesswork, and AI enhancements.'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 hover:border-emerald-500/50 transition group shadow-xs"
                >
                  <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center mb-4 group-hover:scale-110 transition">
                    <Icon className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100">{feat.title}</h3>
                  <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Pricing Comparison Section */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-widest">{isAr ? 'الخطط والأسعار' : 'Pricing Plans'}</span>
          <h2 className="text-3xl font-black mt-2">
            {isAr ? 'اختر الخطة المناسبة لأهدافك المالية' : 'Choose the best plan for your financial goals'}
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            {isAr ? 'ابدأ مجاناً دائماً، أو تمتع بكامل مميزات الذكاء الاصطناعي مع Premium' : 'Always start free, or upgrade anytime for unlimited AI'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Free Plan */}
          <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold">{isAr ? 'الخطة المجانية' : 'Free Plan'}</h3>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {isAr ? 'مدى الحياة' : 'Lifetime'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{isAr ? 'المثالية للبدء والتسجيل اليومي' : 'Ideal for daily expense logging'}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black">$0</span>
                <span className="text-xs text-slate-400">/ {isAr ? 'دائماً' : 'forever'}</span>
              </div>

              <ul className="mt-6 space-y-3 text-xs sm:text-sm">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAr ? 'تسجيل غير محدود للمعاملات (دخل ومصروف)' : 'Unlimited transaction tracking'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAr ? 'حتى 3 حسابات مالية نشطة (كاش، بنك، محفظة)' : 'Up to 3 active accounts'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAr ? 'لوحة التحكم والميزانية الشهرية' : 'Full dashboard & monthly budget'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAr ? 'دفتر الديون والسلف الأساسي' : 'Basic debt & loans tracker'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{isAr ? 'تطبيق هاتف PWA وتخزين محلي آمن' : 'Installable mobile PWA'}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onGetStarted}
              className="mt-8 w-full py-3 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-sm transition"
            >
              {isAr ? 'ابدأ مجاناً' : 'Get Started Free'}
            </button>
          </div>

          {/* Premium Plan */}
          <div className="p-8 rounded-2xl bg-gradient-to-b from-emerald-50 via-white to-white dark:from-emerald-950/40 dark:via-slate-900 dark:to-slate-900 border-2 border-emerald-500 shadow-xl relative flex flex-col justify-between">
            <div className="absolute -top-3 end-6 px-3 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-extrabold uppercase tracking-wider shadow-sm">
              {isAr ? 'الأكثر تميزاً' : 'Most Popular'}
            </div>

            <div>
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <span>Qabdah Premium</span>
                  <Crown className="w-4 h-4 text-amber-500" />
                </h3>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{isAr ? 'قوة الذكاء الاصطناعي والتقارير المتقدمة' : 'Full AI powers & advanced analytics'}</p>

              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-black text-emerald-700 dark:text-emerald-400">$2.99</span>
                <span className="text-xs text-slate-400">/ {isAr ? 'شهرياً أو 24.99$ سنوياً' : 'month or $24.99/year'}</span>
              </div>

              <ul className="mt-6 space-y-3 text-xs sm:text-sm">
                <li className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? 'فحص فواتير غير محدود بالذكاء الاصطناعي (OCR)' : 'Unlimited AI receipt OCR scanning'}</span>
                </li>
                <li className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? 'المستشار المالي الذكي الشخصي' : 'Smart AI Financial Advisor'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? 'عدد غير محدود من الحسابات والمحافظ والعملات' : 'Unlimited accounts & multi-currency'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? 'تصدير كشوف الحساب PDF وإكسيل احترافية' : 'PDF & Excel statement export'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? 'مقارنة الفترات والتقارير المتقدمة' : 'Advanced period comparison analytics'}</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{isAr ? 'تجربة سريعة خالية تماماً من الإعلانات' : '100% Ad-Free Experience'}</span>
                </li>
              </ul>
            </div>

            <button
              onClick={onOpenSubscriptions}
              className="mt-8 w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition transform active:scale-98"
            >
              {isAr ? 'اشترك في Premium الآن' : 'Subscribe to Premium'}
            </button>
          </div>
        </div>
      </section>

      {/* Free Interactive Public Financial Tools Hub */}
      <PublicFinancialTools
        language={language}
        onOpenLiveConverter={onOpenCurrencyConverter}
      />

      {/* FAQ Section */}
      <section className="py-16 bg-slate-100/70 dark:bg-slate-900/60 border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-extrabold">{isAr ? 'الأسئلة الشائعة' : 'Frequently Asked Questions'}</h2>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
              {isAr ? 'إجابات على أهم تساؤلاتك حول الأمان والمميزات' : 'Answers to your top questions'}
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div
                  key={idx}
                  className="rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-start p-4 flex items-center justify-between font-bold text-sm cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-4 pb-4 text-xs sm:text-sm text-slate-600 dark:text-slate-300 border-t border-slate-100 dark:border-slate-700/60 pt-3 leading-relaxed">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Comprehensive AdSense-Ready Footer */}
      <footer className="bg-slate-900 text-slate-400 pt-12 pb-8 border-t border-slate-800 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-10 border-b border-slate-800">
            {/* Brand column */}
            <div className="md:col-span-1 space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 text-white flex items-center justify-center font-black text-sm shadow-md">
                  ق
                </div>
                <span className="font-extrabold text-base text-white">قَبْضَة | Qabdah</span>
              </div>
              <p className="text-slate-400 text-xs leading-relaxed">
                {isAr
                  ? 'منصة مالية شخصية متكاملة تهدف لتمكين الأفراد والعائلات في مصر والعالم العربي من إدارة الميزانيات وتتبع المصروفات وسداد الديون بأمان تام.'
                  : 'Empowering individuals and families across Egypt and the Arab world with private personal budgeting, debt payoff tools, and financial clarity.'}
              </p>
              <p className="text-[11px] text-slate-500">
                {isAr ? '📍 القاهرة، جمهورية مصر العربية' : '📍 Cairo, Egypt'}
              </p>
            </div>

            {/* Quick Tools */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                {isAr ? 'الأدوات المالية المجانية' : 'Free Financial Tools'}
              </h4>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <a href="#free-tools-hub" className="hover:text-emerald-400 transition">
                    {isAr ? 'حاسبة الميزانية 50/30/20' : '50/30/20 Budget Calculator'}
                  </a>
                </li>
                <li>
                  <a href="#free-tools-hub" className="hover:text-emerald-400 transition">
                    {isAr ? 'حاسبة سداد الديون وتسريع التحرر' : 'Debt Payoff Calculator'}
                  </a>
                </li>
                <li>
                  <a href="#free-tools-hub" className="hover:text-emerald-400 transition">
                    {isAr ? 'حاسبة صندوق الطوارئ والأمان' : 'Emergency Fund Target'}
                  </a>
                </li>
                <li>
                  <a href="#free-tools-hub" className="hover:text-emerald-400 transition">
                    {isAr ? 'حاسبة أقساط التمويل والقروض' : 'Loan Installment Calculator'}
                  </a>
                </li>
                {onOpenCurrencyConverter && (
                  <li>
                    <button
                      type="button"
                      onClick={onOpenCurrencyConverter}
                      className="hover:text-emerald-400 transition text-start"
                    >
                      {isAr ? 'محول أسعار العملات الحية' : 'Live Currency Rates'}
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Important Legal & Compliance Links */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                {isAr ? 'السياسات والشفافية' : 'Transparency & Policies'}
              </h4>
              <ul className="space-y-1.5 text-xs">
                {onOpenAbout && (
                  <li>
                    <button
                      type="button"
                      onClick={onOpenAbout}
                      className="hover:text-emerald-400 transition text-start"
                    >
                      {isAr ? 'من نحن (عن منصة قبضة)' : 'About Us (Qabdah Mission)'}
                    </button>
                  </li>
                )}
                {onOpenPrivacy && (
                  <li>
                    <button
                      type="button"
                      onClick={onOpenPrivacy}
                      className="hover:text-emerald-400 transition text-start"
                    >
                      {isAr ? 'سياسة الخصوصية وملفات الكوكيز' : 'Privacy Policy & Cookies'}
                    </button>
                  </li>
                )}
                {onOpenTerms && (
                  <li>
                    <button
                      type="button"
                      onClick={onOpenTerms}
                      className="hover:text-emerald-400 transition text-start"
                    >
                      {isAr ? 'شروط الاستخدام وإخلاء المسؤولية' : 'Terms of Service & Disclaimer'}
                    </button>
                  </li>
                )}
                {onOpenContact && (
                  <li>
                    <button
                      type="button"
                      onClick={onOpenContact}
                      className="hover:text-emerald-400 transition text-start"
                    >
                      {isAr ? 'اتصل بنا وقنوات الدعم' : 'Contact Us & Support'}
                    </button>
                  </li>
                )}
              </ul>
            </div>

            {/* Direct Contact info */}
            <div className="space-y-2">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                {isAr ? 'التواصل المباشر' : 'Direct Support'}
              </h4>
              <p className="text-xs text-slate-400">
                {isAr
                  ? 'فريق الدعم الفني والاستفسارات الإعلانية متاح للرد على رسائلكم خلال 24-48 ساعة.'
                  : 'Customer support and media inquiries are handled within 24-48 business hours.'}
              </p>
              <div className="space-y-1 text-xs">
                <a
                  href="mailto:bodyfs2030@gmail.com"
                  className="text-emerald-400 hover:underline block font-mono"
                >
                  bodyfs2030@gmail.com
                </a>
                <span className="text-slate-500 block font-mono text-[11px]">
                  support@qabdah.com
                </span>
              </div>
              {onOpenContact && (
                <button
                  type="button"
                  onClick={onOpenContact}
                  className="mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 font-bold text-xs transition border border-emerald-500/30"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>{isAr ? 'إرسال رسالة فورية' : 'Send Direct Message'}</span>
                </button>
              )}
            </div>
          </div>

          {/* Bottom Copyright & Disclaimer */}
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
            <div>
              <span>قَبْضَة | Qabdah © {new Date().getFullYear()} — </span>
              <span>{isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved'}</span>
            </div>
            <div className="flex items-center gap-4">
              <span>{isAr ? 'حماية تامة للبيانات' : 'Zero-Bank-Credentials Privacy'}</span>
              <span>•</span>
              <span>{isAr ? 'مصر والعالم العربي' : 'Egypt & Arab League'}</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
