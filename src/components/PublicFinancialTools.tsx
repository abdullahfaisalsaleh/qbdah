import React, { useState } from 'react';
import {
  PieChart,
  HandCoins,
  ShieldAlert,
  Calculator,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  TrendingUp,
  Info,
  Calendar,
  DollarSign,
  Coins,
  RefreshCw,
} from 'lucide-react';
import { CurrencyCode, Language } from '../types/index.ts';
import { CURRENCIES, formatMoney } from '../utils/finance.ts';
import { CurrencyService } from '../services/currencyService.ts';

interface PublicFinancialToolsProps {
  language: Language;
  defaultCurrency?: CurrencyCode;
  onOpenLiveConverter?: () => void;
}

export const PublicFinancialTools: React.FC<PublicFinancialToolsProps> = ({
  language,
  defaultCurrency = 'EGP',
  onOpenLiveConverter,
}) => {
  const isAr = language === 'ar';
  const Arrow = isAr ? ArrowLeft : ArrowRight;

  const [activeTool, setActiveTool] = useState<'budget' | 'debt' | 'emergency' | 'loan'>('budget');

  // 1. Budget 50/30/20 State
  const [budgetIncome, setBudgetIncome] = useState<number>(15000);
  const [budgetCurrency, setBudgetCurrency] = useState<CurrencyCode>(defaultCurrency);

  // 2. Debt Payoff State
  const [debtBalance, setDebtBalance] = useState<number>(45000);
  const [debtAnnualRate, setDebtAnnualRate] = useState<number>(18);
  const [debtMonthlyPayment, setDebtMonthlyPayment] = useState<number>(2500);

  // 3. Emergency Fund State
  const [emergencyMonthlyExpenses, setEmergencyMonthlyExpenses] = useState<number>(9000);
  const [emergencyTargetMonths, setEmergencyTargetMonths] = useState<number>(6);
  const [emergencyCurrentSaved, setEmergencyCurrentSaved] = useState<number>(18000);
  const [emergencyMonthlySavings, setEmergencyMonthlySavings] = useState<number>(2000);

  // 4. Loan / Installment State
  const [loanPrincipal, setLoanPrincipal] = useState<number>(60000);
  const [loanMonths, setLoanMonths] = useState<number>(24);
  const [loanAnnualRate, setLoanAnnualRate] = useState<number>(14);

  // Computations
  // 50/30/20
  const needs50 = Math.round(budgetIncome * 0.5);
  const wants30 = Math.round(budgetIncome * 0.3);
  const savings20 = Math.round(budgetIncome * 0.2);

  // Debt Payoff Computation
  const r = debtAnnualRate / 100 / 12;
  let monthsToPayoff = 0;
  let totalDebtInterest = 0;
  let debtCalculable = true;

  if (r === 0) {
    monthsToPayoff = debtMonthlyPayment > 0 ? Math.ceil(debtBalance / debtMonthlyPayment) : 0;
    totalDebtInterest = 0;
  } else {
    if (debtMonthlyPayment <= debtBalance * r) {
      debtCalculable = false; // monthly payment doesn't even cover interest
    } else {
      monthsToPayoff = Math.ceil(
        Math.log(debtMonthlyPayment / (debtMonthlyPayment - debtBalance * r)) / Math.log(1 + r)
      );
      totalDebtInterest = Math.max(0, Math.round(monthsToPayoff * debtMonthlyPayment - debtBalance));
    }
  }

  // Emergency Fund Computation
  const emergencyTargetTotal = emergencyMonthlyExpenses * emergencyTargetMonths;
  const emergencyGap = Math.max(0, emergencyTargetTotal - emergencyCurrentSaved);
  const emergencyMonthsNeeded =
    emergencyMonthlySavings > 0 ? Math.ceil(emergencyGap / emergencyMonthlySavings) : 0;
  const emergencyProgressPercent =
    emergencyTargetTotal > 0
      ? Math.min(100, Math.round((emergencyCurrentSaved / emergencyTargetTotal) * 100))
      : 0;

  // Loan Computation (Standard Amortization or Flat approximation)
  const loanMonthlyRate = loanAnnualRate / 100 / 12;
  let loanMonthlyInstallment = 0;
  let loanTotalInterest = 0;
  let loanTotalRepayment = 0;

  if (loanMonthlyRate === 0) {
    loanMonthlyInstallment = loanMonths > 0 ? Math.round(loanPrincipal / loanMonths) : 0;
    loanTotalRepayment = loanPrincipal;
    loanTotalInterest = 0;
  } else {
    loanMonthlyInstallment = Math.round(
      (loanPrincipal * (loanMonthlyRate * Math.pow(1 + loanMonthlyRate, loanMonths))) /
        (Math.pow(1 + loanMonthlyRate, loanMonths) - 1)
    );
    loanTotalRepayment = loanMonthlyInstallment * loanMonths;
    loanTotalInterest = Math.max(0, loanTotalRepayment - loanPrincipal);
  }

  const toolTabs = [
    {
      id: 'budget' as const,
      name: isAr ? 'حاسبة الميزانية 50/30/20' : '50/30/20 Budget Calculator',
      icon: PieChart,
      badge: isAr ? 'شائع وموصى به' : 'Popular',
    },
    {
      id: 'debt' as const,
      name: isAr ? 'حاسبة سداد الديون' : 'Debt Payoff Planner',
      icon: HandCoins,
      badge: isAr ? 'سريع ودقيق' : 'Fast',
    },
    {
      id: 'emergency' as const,
      name: isAr ? 'حاسبة صندوق الطوارئ' : 'Emergency Fund Target',
      icon: ShieldAlert,
      badge: isAr ? 'أمان مالي' : 'Safety',
    },
    {
      id: 'loan' as const,
      name: isAr ? 'حاسبة القروض والأقساط' : 'Loan & Installment Calculator',
      icon: Calculator,
      badge: isAr ? 'شفاف' : 'Transparent',
    },
  ];

  return (
    <section id="free-tools-hub" className="py-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold mb-3">
            <Calculator className="w-3.5 h-3.5" />
            <span>{isAr ? 'أدوات مالية مجانية ومفتوحة للجميع' : 'Free Open Financial Calculators'}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 dark:text-slate-100 tracking-tight">
            {isAr ? 'حاسبات ذكية تُحول أرقامك إلى قرارات واعية' : 'Smart Calculators That Turn Numbers Into Clarity'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-2.5 leading-relaxed">
            {isAr
              ? 'أدوات حسابية تفاعلية مجانية تماماً، تعمل فوراً دون الحاجة لتسجيل دخول، مع شروحات وأمثلة تطبيقية واقعية.'
              : 'Interactive calculators available publicly without login requirements, complete with verified mathematical formulas and real-world examples.'}
          </p>

          {/* Quick open live currency converter banner */}
          {onOpenLiveConverter && (
            <div className="mt-4 inline-flex items-center gap-2">
              <button
                type="button"
                onClick={onOpenLiveConverter}
                className="px-4 py-2 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/60 dark:hover:bg-teal-900/60 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-200 text-xs font-bold transition flex items-center gap-2"
              >
                <Coins className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                <span>{isAr ? 'فتح محول أسعار صرف العملات الحية (21 دولة عربية)' : 'Open Live Currency Converter (21 Arab Nations)'}</span>
                <Arrow className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Tab Selection */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
          {toolTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTool === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTool(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all shadow-xs cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-emerald-600/20'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700/80 border border-slate-200 dark:border-slate-700/80'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold hidden md:inline-block ${
                    isActive ? 'bg-emerald-700 text-emerald-100' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Active Tool Interactive Container */}
        <div className="bg-slate-50/70 dark:bg-slate-900/60 rounded-3xl border border-slate-200 dark:border-slate-800 p-5 sm:p-8 shadow-xs">
          {/* TOOL 1: 50/30/20 BUDGET */}
          {activeTool === 'budget' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Form & Controls */}
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>{isAr ? 'بيانات راتبك أو دخلك الشهري' : 'Your Monthly Income Details'}</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'صافي الدخل الشهري المستلم' : 'Net Monthly Income Received'}
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        min="500"
                        step="100"
                        value={budgetIncome}
                        onChange={(e) => setBudgetIncome(Math.max(0, Number(e.target.value) || 0))}
                        className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                      />
                      <span className="absolute end-3 top-2.5 text-xs font-bold text-slate-400">
                        {budgetCurrency}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'العملة المعروضة' : 'Display Currency'}
                    </label>
                    <select
                      value={budgetCurrency}
                      onChange={(e) => setBudgetCurrency(e.target.value as CurrencyCode)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-semibold text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                    >
                      {Object.keys(CURRENCIES).map((c) => {
                        const cfg = CURRENCIES[c as CurrencyCode];
                        return (
                          <option key={c} value={c}>
                            {cfg.flag} {c} - {isAr ? cfg.nameAr : cfg.nameEn}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="pt-2 flex items-center gap-2">
                    {[10000, 15000, 25000, 50000].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => setBudgetIncome(preset)}
                        className="px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-700 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 hover:text-emerald-600 text-slate-600 dark:text-slate-300 transition"
                      >
                        {preset.toLocaleString()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Educational Box */}
                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                  <h4 className="font-black text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-1.5">
                    <Info className="w-4 h-4" />
                    <span>{isAr ? 'كيف تعمل قاعدة 50/30/20 الشهيرة؟' : 'How does the 50/30/20 rule work?'}</span>
                  </h4>
                  <p>
                    {isAr
                      ? 'قاعدة الميزانية 50/30/20 هي إحدى أكثر استراتيجيات إدارة الأموال نجاحاً حول العالم. تُقسم صافي دخلك الشهري إلى 3 مسارات واضحة تمنع تراكم الديون وتضمن بناء ثروة مستدامة:'
                      : 'The 50/30/20 budget framework divides after-tax income into three balanced buckets that prevent overspending while fostering long-term wealth:'}
                  </p>
                  <ul className="list-disc list-inside space-y-1 ps-1 text-slate-600 dark:text-slate-400">
                    <li>
                      <strong>50% {isAr ? 'للاحتياجات الأساسية' : 'Needs'}:</strong>{' '}
                      {isAr ? 'الإيجار، الفواتير، الغذاء، الدواء والمواصلات.' : 'Housing, utilities, groceries, medicines, transport.'}
                    </li>
                    <li>
                      <strong>30% {isAr ? 'للرغبات والترفيه' : 'Wants'}:</strong>{' '}
                      {isAr ? 'الخروجات، المطاعم، التسوق الترفيهي، والهوايات.' : 'Dining out, leisure, shopping, subscriptions.'}
                    </li>
                    <li>
                      <strong>20% {isAr ? 'للادخار وسداد الديون' : 'Savings & Debt'}:</strong>{' '}
                      {isAr ? 'صندوق الطوارئ، التخلص من الأقساط، والاستثمار.' : 'Emergency reserve, debt repayment, investments.'}
                    </li>
                  </ul>
                </div>
              </div>

              {/* Results & Visual Breakdown */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-2">
                    <div>
                      <span className="text-xs text-slate-400 block font-semibold">
                        {isAr ? 'إجمالي الراتب الموزع' : 'Total Distributed Income'}
                      </span>
                      <p className="text-2xl font-black text-slate-900 dark:text-slate-100">
                        {formatMoney(budgetIncome, budgetCurrency, language)}
                      </p>
                    </div>
                    <span className="self-start sm:self-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      {isAr ? 'توزيع متوازن ومثالي' : 'Optimized Distribution'}
                    </span>
                  </div>

                  {/* 3 Metric Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60">
                      <div className="flex items-center justify-between text-blue-700 dark:text-blue-300 text-xs font-bold mb-1">
                        <span>50% {isAr ? 'الأساسيات' : 'Needs'}</span>
                        <span>0.50</span>
                      </div>
                      <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                        {formatMoney(needs50, budgetCurrency, language)}
                      </p>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                        {isAr ? 'سقف المصروفات الحتمية' : 'Essential ceiling'}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60">
                      <div className="flex items-center justify-between text-amber-700 dark:text-amber-300 text-xs font-bold mb-1">
                        <span>30% {isAr ? 'الرغبات' : 'Wants'}</span>
                        <span>0.30</span>
                      </div>
                      <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                        {formatMoney(wants30, budgetCurrency, language)}
                      </p>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                        {isAr ? 'ترفيه بدون شعور بالذنب' : 'Guilt-free lifestyle'}
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60">
                      <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-300 text-xs font-bold mb-1">
                        <span>20% {isAr ? 'الادخار والديون' : 'Savings'}</span>
                        <span>0.20</span>
                      </div>
                      <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                        {formatMoney(savings20, budgetCurrency, language)}
                      </p>
                      <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
                        {isAr ? 'بناء الأمان والمستقبل' : 'Future safety & freedom'}
                      </span>
                    </div>
                  </div>

                  {/* Progress Bar representation */}
                  <div>
                    <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden flex">
                      <div className="h-full bg-blue-500" style={{ width: '50%' }} title="50% Needs" />
                      <div className="h-full bg-amber-500" style={{ width: '30%' }} title="30% Wants" />
                      <div className="h-full bg-emerald-500" style={{ width: '20%' }} title="20% Savings" />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-400 mt-2 px-1">
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-blue-500"></span>50% {isAr ? 'أساسيات' : 'Needs'}</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span>30% {isAr ? 'رغبات' : 'Wants'}</span>
                      <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span>20% {isAr ? 'ادخار' : 'Savings'}</span>
                    </div>
                  </div>

                  {/* Practical Example */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      💡 {isAr ? 'مثال عملي تطبيقي لأسرة في مصر أو العالم العربي:' : 'Practical Real-World Example:'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {isAr
                        ? `عند استلام راتب قدره ${formatMoney(budgetIncome, budgetCurrency, 'ar')}، لا تنفق عشوائياً. خصص فوراً ${formatMoney(needs50, budgetCurrency, 'ar')} للإيجار وفواتير الكهرباء والإنترنت وطعام البيت. ثم خصص ${formatMoney(savings20, budgetCurrency, 'ar')} مباشرة في أول الشهر لصندوق الطوارئ أو لسداد أقساط الكريدت كارد، واترك ${formatMoney(wants30, budgetCurrency, 'ar')} للمطاعم والخروج بحرية كاملة.`
                        : `Upon receiving a net salary of ${formatMoney(budgetIncome, budgetCurrency, 'en')}, do not spend arbitrarily. Allocate ${formatMoney(needs50, budgetCurrency, 'en')} to rent, utilities, and groceries. Automatically transfer ${formatMoney(savings20, budgetCurrency, 'en')} into emergency reserves, leaving ${formatMoney(wants30, budgetCurrency, 'en')} for guilt-free leisure.`}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TOOL 2: DEBT PAYOFF */}
          {activeTool === 'debt' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <HandCoins className="w-5 h-5 text-rose-600 dark:text-rose-400" />
                    <span>{isAr ? 'أرقام المديونية أو القسط' : 'Debt & Payment Details'}</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'إجمالي أصل الدين الحالي' : 'Current Principal Debt Balance'}
                    </label>
                    <input
                      type="number"
                      min="100"
                      step="500"
                      value={debtBalance}
                      onChange={(e) => setDebtBalance(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'معدل الفائدة السنوي % (اكتب 0 للديون بدون فوائد)' : 'Annual Interest Rate % (0 for interest-free loans)'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.5"
                      value={debtAnnualRate}
                      onChange={(e) => setDebtAnnualRate(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'المبلغ الذي تدفعه شهرياً' : 'Monthly Payment Amount'}
                    </label>
                    <input
                      type="number"
                      min="50"
                      step="100"
                      value={debtMonthlyPayment}
                      onChange={(e) => setDebtMonthlyPayment(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-rose-50/70 dark:bg-rose-950/30 p-5 rounded-2xl border border-rose-200/80 dark:border-rose-800/80 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                  <h4 className="font-black text-rose-800 dark:text-rose-300 text-sm flex items-center gap-1.5">
                    <Info className="w-4 h-4" />
                    <span>{isAr ? 'استراتيجية كرة الثلج مقابل الانهيار الجليدي' : 'Debt Snowball vs Debt Avalanche'}</span>
                  </h4>
                  <p>
                    {isAr
                      ? '• استراتيجية كرة الثلج (Snowball): تسدد أصغر ديونك قيمة أولاً بغض النظر عن الفائدة. يمنحك ذلك دافعاً نفسياً هائلاً عند شطب أول دين بالكامل.'
                      : '• Debt Snowball: Pay off the smallest balance first regardless of interest rate, giving you quick psychological wins.'}
                  </p>
                  <p>
                    {isAr
                      ? '• استراتيجية الانهيار الجليدي (Avalanche): تسدد الديون ذات أعلى فائدة أولاً. يوفر عليك رياضياً أكبر قدر من الفوائد المهدرة.'
                      : '• Debt Avalanche: Pay off debts with the highest interest rates first, mathematically saving the most money over time.'}
                  </p>
                </div>
              </div>

              {/* Debt Results */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
                  {!debtCalculable ? (
                    <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-200 text-xs">
                      ⚠️ {isAr
                        ? 'تنبيه: القسط الشهري المدخل أقل من الفائدة المستحقة شهرياً! لن ينخفض أصل الدين أبداً بهذه الدفعة. يرجى زيادة القسط الشهري.'
                        : 'Warning: Your monthly payment is lower than monthly accrued interest. Increase your monthly payment to pay down principal.'}
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-2">
                        <div>
                          <span className="text-xs text-slate-400 block font-semibold">
                            {isAr ? 'المدة المطلوبة للتحرر التام من الدين' : 'Time Required to Debt Freedom'}
                          </span>
                          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                            {monthsToPayoff} {isAr ? 'شهراً' : 'Months'}{' '}
                            <span className="text-sm font-semibold text-slate-400">
                              ({(monthsToPayoff / 12).toFixed(1)} {isAr ? 'سنة' : 'years'})
                            </span>
                          </p>
                        </div>
                        <span className="self-start sm:self-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                          {isAr ? 'خطة سداد واقعية' : 'Feasible Plan'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          <span className="text-xs text-slate-400 block mb-1">
                            {isAr ? 'إجمالي الفوائد التي ستدفعها' : 'Total Interest Accrued'}
                          </span>
                          <p className="text-lg font-black text-rose-600 dark:text-rose-400">
                            {totalDebtInterest.toLocaleString()} {defaultCurrency}
                          </p>
                          <span className="text-[11px] text-slate-400 block mt-1">
                            {debtAnnualRate === 0 ? (isAr ? 'دين بدون فوائد (سلف عائلية)' : 'Interest-free debt') : (isAr ? 'تكلفة التمويل الإضافية' : 'Extra financing cost')}
                          </span>
                        </div>

                        <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                          <span className="text-xs text-slate-400 block mb-1">
                            {isAr ? 'إجمالي ما ستدفعه بالكامل' : 'Total Repaid (Principal + Interest)'}
                          </span>
                          <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                            {(debtBalance + totalDebtInterest).toLocaleString()} {defaultCurrency}
                          </p>
                          <span className="text-[11px] text-slate-400 block mt-1">
                            {isAr ? 'أصل الدين + الفوائد' : 'Principal + Total interest'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5">
                        <p className="font-bold text-slate-800 dark:text-slate-200">
                          🎯 {isAr ? 'نصيحة لتسريع سداد الدين بمقدار النصف:' : 'Pro tip to accelerate debt freedom:'}
                        </p>
                        <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                          {isAr
                            ? `إذا رفعت دفعتك الشهرية من ${debtMonthlyPayment.toLocaleString()} إلى ${(debtMonthlyPayment * 1.3).toFixed(0)} فقط، ستوفر آلاف الجنيهات من الفوائد وستصل إلى حريتك المالية في شهور أقل بكثير!`
                            : `Increasing your monthly payment by just 30% cuts months off your term and saves significant interest.`}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TOOL 3: EMERGENCY FUND */}
          {activeTool === 'emergency' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>{isAr ? 'حساب ملاذ الأمان المالي' : 'Emergency Fund Target Inputs'}</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'مصروفات المعيشة الأساسية شهرياً' : 'Essential Monthly Living Expenses'}
                    </label>
                    <input
                      type="number"
                      min="500"
                      step="500"
                      value={emergencyMonthlyExpenses}
                      onChange={(e) => setEmergencyMonthlyExpenses(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'عدد أشهر الأمان المستهدفة' : 'Safety Margin (Months)'}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[3, 6, 9, 12].map((m) => (
                        <button
                          key={m}
                          type="button"
                          onClick={() => setEmergencyTargetMonths(m)}
                          className={`py-2 rounded-xl text-xs font-bold transition ${
                            emergencyTargetMonths === m
                              ? 'bg-emerald-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {m} {isAr ? 'أشهر' : 'Mo'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'المبلغ المدخر حالياً في صندوق الطوارئ' : 'Current Accumulated Reserve'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="500"
                      value={emergencyCurrentSaved}
                      onChange={(e) => setEmergencyCurrentSaved(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'المبلغ الذي يمكنك ادخاره شهرياً' : 'Monthly Planned Contribution'}
                    </label>
                    <input
                      type="number"
                      min="100"
                      step="200"
                      value={emergencyMonthlySavings}
                      onChange={(e) => setEmergencyMonthlySavings(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-emerald-50/70 dark:bg-emerald-950/30 p-5 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/80 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                  <h4 className="font-black text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-1.5">
                    <Info className="w-4 h-4" />
                    <span>{isAr ? 'أين تحتفظ بصندوق الطوارئ؟' : 'Where to store emergency funds?'}</span>
                  </h4>
                  <p>
                    {isAr
                      ? 'صندوق الطوارئ لا يُوضع في البورصة أو العملات المشفرة أو العقارات! يجب أن يكون في وعاء عالي السيولة (حساب بنكي جاري ذو عائد يومي أو محفظة إلكترونية آمنة) لتتمكن من الوصول إليه في أي لحظة عند وقوع ظرف طبيعي أو طارئ وظيفي.'
                      : 'Emergency funds must stay in highly liquid, risk-free accounts (high-yield savings or checking), accessible within minutes.'}
                  </p>
                </div>
              </div>

              {/* Emergency Results */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-2">
                    <div>
                      <span className="text-xs text-slate-400 block font-semibold">
                        {isAr ? 'المبلغ المستهدف لصندوق الأمان' : 'Target Emergency Reserve'}
                      </span>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                        {emergencyTargetTotal.toLocaleString()} {defaultCurrency}
                      </p>
                    </div>
                    <span className="self-start sm:self-center px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      {emergencyTargetMonths} {isAr ? 'أشهر تغطية كاملة' : 'Months Coverage'}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                      <span>{isAr ? 'نسبة الإنجاز المحققة' : 'Current Funding Progress'}</span>
                      <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">{emergencyProgressPercent}%</span>
                    </div>
                    <div className="h-4 w-full rounded-full bg-slate-100 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                        style={{ width: `${emergencyProgressPercent}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-400 block mb-1">
                        {isAr ? 'المبلغ المتبقي للوصول للهدف' : 'Funding Gap Remaining'}
                      </span>
                      <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                        {emergencyGap.toLocaleString()} {defaultCurrency}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-400 block mb-1">
                        {isAr ? 'الوقت اللازم بالايداع الحالي' : 'Estimated Time to Completion'}
                      </span>
                      <p className="text-lg font-black text-blue-600 dark:text-blue-400">
                        {emergencyMonthsNeeded} {isAr ? 'شهراً' : 'Months'}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      🛡️ {isAr ? 'لماذا يعتبر صندوق الطوارئ أول خطوة نحو راحة البال؟' : 'Why an emergency reserve is non-negotiable:'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {isAr
                        ? 'وجود صندوق يغطي 3 إلى 6 أشهر من مصاريفك الأساسية يحميك من الاضطرار للاستدانة أو بيع مقتنياتك عند انقطاع مفاجئ في الدخل أو الإصلاحات المنزلية غير المتوقعة.'
                        : 'Covering 3 to 6 months of baseline living costs prevents having to resort to expensive loans or selling assets during job transitions or medical emergencies.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TOOL 4: LOAN INSTALLMENT */}
          {activeTool === 'loan' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5 space-y-5">
                <div className="bg-white dark:bg-slate-800 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
                  <h3 className="font-extrabold text-slate-900 dark:text-slate-100 text-base flex items-center gap-2">
                    <Calculator className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                    <span>{isAr ? 'بيانات القرض أو التمويل' : 'Loan & Installment Inputs'}</span>
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'قيمة القرض أو السلعة الممولة' : 'Loan Principal / Amount'}
                    </label>
                    <input
                      type="number"
                      min="1000"
                      step="5000"
                      value={loanPrincipal}
                      onChange={(e) => setLoanPrincipal(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'فترة السداد بالأشهر' : 'Repayment Period (Months)'}
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {[12, 24, 36, 48].map((mo) => (
                        <button
                          key={mo}
                          type="button"
                          onClick={() => setLoanMonths(mo)}
                          className={`py-2 rounded-xl text-xs font-bold transition ${
                            loanMonths === mo
                              ? 'bg-indigo-600 text-white shadow-xs'
                              : 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                          }`}
                        >
                          {mo} {isAr ? 'شهر' : 'Mo'}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'معدل الفائدة أو الربح السنوي %' : 'Annual Interest / Profit Rate %'}
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="60"
                      step="0.5"
                      value={loanAnnualRate}
                      onChange={(e) => setLoanAnnualRate(Math.max(0, Number(e.target.value) || 0))}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 font-bold text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-indigo-50/70 dark:bg-indigo-950/30 p-5 rounded-2xl border border-indigo-200/80 dark:border-indigo-800/80 text-xs space-y-2 text-slate-700 dark:text-slate-300">
                  <h4 className="font-black text-indigo-800 dark:text-indigo-300 text-sm flex items-center gap-1.5">
                    <Info className="w-4 h-4" />
                    <span>{isAr ? 'انتبه للفائدة التراكمية والمصاريف الإدارية' : 'Beware of Amortization & Admin Fees'}</span>
                  </h4>
                  <p>
                    {isAr
                      ? 'العديد من عروض "التقسيط بدون فوائد" قد تخفي مصاريف إدارية أو رسوم تسجيل مرتفعة. احرص دائماً على حساب إجمالي ما ستدفعه فعلياً ومقارنته بسعر الكاش المباشر.'
                      : 'Many zero-interest promotional offers conceal high administrative or processing fees. Always compare the total amortized cost against the upfront cash price.'}
                  </p>
                </div>
              </div>

              {/* Loan Results */}
              <div className="lg:col-span-7 space-y-5">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700 gap-2">
                    <div>
                      <span className="text-xs text-slate-400 block font-semibold">
                        {isAr ? 'القسط الشهري التقريبي المستحق' : 'Estimated Monthly Installment'}
                      </span>
                      <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">
                        {loanMonthlyInstallment.toLocaleString()} {defaultCurrency}
                      </p>
                    </div>
                    <span className="self-start sm:self-center px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 text-xs font-bold">
                      {loanMonths} {isAr ? 'قسط شهري' : 'Installments'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-400 block mb-1">
                        {isAr ? 'إجمالي تكلفة الفائدة الإضافية' : 'Total Financing Interest Charge'}
                      </span>
                      <p className="text-lg font-black text-rose-600 dark:text-rose-400">
                        {loanTotalInterest.toLocaleString()} {defaultCurrency}
                      </p>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                      <span className="text-xs text-slate-400 block mb-1">
                        {isAr ? 'إجمالي المبلغ المسدد في نهاية المدة' : 'Total Repaid Amount'}
                      </span>
                      <p className="text-lg font-black text-slate-900 dark:text-slate-100">
                        {loanTotalRepayment.toLocaleString()} {defaultCurrency}
                      </p>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700/80 text-xs space-y-1.5">
                    <p className="font-bold text-slate-800 dark:text-slate-200">
                      ⚖️ {isAr ? 'قاعدة الأقساط الآمنة لدخلك:' : 'Safe Installment Ratio Rule:'}
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
                      {isAr
                        ? 'ينصح الخبراء بألا تتجاوز مجموع أقساطك الشهرية لكافة القروض والسلع أكثر من 30% إلى 35% من صافي راتبك الشهري لتجنب التعثر المالي.'
                        : 'Financial experts advise keeping total monthly installment obligations below 30-35% of your net monthly income to prevent financial distress.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
