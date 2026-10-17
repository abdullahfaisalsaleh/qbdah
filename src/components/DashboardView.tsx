import React, { useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PieChart as PieIcon,
  HandCoins,
  PiggyBank,
  CalendarDays,
  PlusCircle,
  MinusCircle,
  ArrowRightLeft,
  ScanLine,
  ArrowUpRight,
  ArrowDownRight,
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import {
  Account,
  Budget,
  Category,
  CurrencyCode,
  Debt,
  Language,
  RecurringBill,
  SavingsGoal,
  Transaction,
  UserProfile,
} from '../types/index.ts';
import {
  calculateCategoryExpenses,
  calculateDebtSummary,
  calculateMonthlyCashflow,
  calculateNetWorth,
  formatMoney,
} from '../utils/finance.ts';

interface DashboardViewProps {
  user: UserProfile;
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  debts: Debt[];
  savingsGoals: SavingsGoal[];
  recurringBills: RecurringBill[];
  language: Language;
  currency: CurrencyCode;
  customRates?: Partial<Record<CurrencyCode, number>>;
  onOpenQuickAdd: (type: 'expense' | 'income' | 'transfer') => void;
  onOpenReceiptScanner: () => void;
  onOpenCurrencyConverter?: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  accounts,
  transactions,
  categories,
  budgets,
  debts,
  savingsGoals,
  recurringBills,
  language,
  currency,
  customRates,
  onOpenQuickAdd,
  onOpenReceiptScanner,
  onOpenCurrencyConverter,
  onNavigateTab,
}) => {
  const isAr = language === 'ar';

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  // Previous month
  const prevMonth = currentMonth === 1 ? 12 : currentMonth - 1;
  const prevYear = currentMonth === 1 ? currentYear - 1 : currentYear;

  // Real Financial Calculations with live custom exchange rates
  const netWorth = useMemo(
    () => calculateNetWorth(accounts, transactions, currency, customRates),
    [accounts, transactions, currency, customRates]
  );

  const currentCashflow = useMemo(
    () => calculateMonthlyCashflow(transactions, currentMonth, currentYear, currency, accounts, customRates),
    [transactions, currentMonth, currentYear, currency, accounts, customRates]
  );

  const prevCashflow = useMemo(
    () => calculateMonthlyCashflow(transactions, prevMonth, prevYear, currency, accounts, customRates),
    [transactions, prevMonth, prevYear, currency, accounts, customRates]
  );

  // Debt Summary
  const debtSummary = useMemo(() => calculateDebtSummary(debts, currency, customRates), [debts, currency, customRates]);

  // Total Savings across active goals
  const totalSavings = useMemo(() => {
    return savingsGoals.reduce((sum, g) => sum + Number(g.currentAmount || 0), 0);
  }, [savingsGoals]);

  // Overall Budget
  const overallBudget = useMemo(() => {
    return (
      budgets.find((b) => b.categoryId === 'all' && b.month === currentMonth && b.year === currentYear) ||
      budgets.find((b) => b.categoryId === 'all')
    );
  }, [budgets, currentMonth, currentYear]);

  const overallBudgetAmount = overallBudget ? Number(overallBudget.amount) : 0;
  const budgetSpent = currentCashflow.totalExpenses;
  const budgetRemaining = Math.max(0, overallBudgetAmount - budgetSpent);
  const budgetPercentage = overallBudgetAmount > 0 ? Math.round((budgetSpent / overallBudgetAmount) * 100) : 0;

  // Category breakdown for current month
  const categoryExpenses = useMemo(
    () => calculateCategoryExpenses(transactions, currentMonth, currentYear, currency, accounts),
    [transactions, currentMonth, currentYear, currency, accounts]
  );

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Top spending categories
  const topCategories = useMemo(() => {
    return Object.entries(categoryExpenses)
      .map(([catId, amount]) => {
        const cat = categoryMap.get(catId);
        return {
          catId,
          name: cat ? (isAr ? cat.name : cat.nameEn) : catId,
          color: cat?.color || '#94a3b8',
          amount,
          percentage: currentCashflow.totalExpenses > 0 ? Math.round((amount / currentCashflow.totalExpenses) * 100) : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [categoryExpenses, categoryMap, currentCashflow.totalExpenses, isAr]);

  // Recent 6 transactions
  const recentTransactions = useMemo(() => {
    return [...transactions]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 6);
  }, [transactions]);

  // Upcoming bills in next 14 days
  const upcomingBills = useMemo(() => {
    const todayStr = today.toISOString().slice(0, 10);
    return recurringBills.filter((b) => b.isActive && b.nextDueDate >= todayStr).slice(0, 3);
  }, [recurringBills, today]);

  // Month-over-month comparison
  const expenseDiff = currentCashflow.totalExpenses - prevCashflow.totalExpenses;
  const expensePercentChange = prevCashflow.totalExpenses > 0
    ? Math.round((expenseDiff / prevCashflow.totalExpenses) * 100)
    : 0;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-teal-900 text-white shadow-xl shadow-emerald-950/20">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black">
              {isAr ? `أهلاً بك، ${user.name}` : `Welcome back, ${user.name}`}
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 font-medium">
              {new Intl.DateTimeFormat(isAr ? 'ar-EG' : 'en-US', { month: 'long', year: 'numeric' }).format(today)}
            </span>
          </div>
          <p className="text-xs text-emerald-100/80 mt-1">
            {isAr
              ? 'تابع حركاتك المالية بدقة وسرعة من لوحة تحكم قَبْضَة الشاملة.'
              : 'Keep full command over your cash flow and net worth.'}
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenQuickAdd('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-bold text-xs shadow-md shadow-rose-900/30 transition transform active:scale-95 cursor-pointer"
          >
            <MinusCircle className="w-4 h-4" />
            <span>{isAr ? 'إضافة مصروف' : 'Add Expense'}</span>
          </button>

          <button
            onClick={() => onOpenQuickAdd('income')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs shadow-md shadow-emerald-900/30 transition transform active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isAr ? 'إضافة دخل' : 'Add Income'}</span>
          </button>

          <button
            onClick={() => onOpenQuickAdd('transfer')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition border border-white/20 cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>{isAr ? 'تحويل' : 'Transfer'}</span>
          </button>

          <button
            onClick={onOpenReceiptScanner}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-teal-500 hover:bg-teal-600 text-white font-bold text-xs shadow-md transition cursor-pointer"
            title={isAr ? 'فحص فاتورة بالكاميرا' : 'Scan Receipt'}
          >
            <ScanLine className="w-4 h-4" />
            <span>{isAr ? 'مسح فاتورة' : 'Scan'}</span>
          </button>
        </div>
      </div>

      {/* Main KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Net Worth */}
        <div
          onClick={() => onNavigateTab('accounts')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isAr ? 'إجمالي الأموال المتاحة (صافي الثروة)' : 'Total Net Worth'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {formatMoney(netWorth, currency, language)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1">
            <span>{accounts.filter((a) => a.isActive).length} {isAr ? 'محافظ وحسابات نشطة' : 'active accounts'}</span>
            <ChevronRight className="w-3 h-3 ms-auto" />
          </p>
        </div>

        {/* 2. Monthly Income */}
        <div
          onClick={() => onNavigateTab('transactions')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isAr ? 'إجمالي دخل الشهر' : 'Monthly Income'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center group-hover:scale-110 transition">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-2">
            +{formatMoney(currentCashflow.totalIncome, currency, language)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {isAr ? 'الدخل المحقق للشهر الجاري' : 'Received this month'}
          </p>
        </div>

        {/* 3. Monthly Expenses */}
        <div
          onClick={() => onNavigateTab('transactions')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-500/50 transition cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isAr ? 'إجمالي مصروفات الشهر' : 'Monthly Expenses'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center group-hover:scale-110 transition">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            -{formatMoney(currentCashflow.totalExpenses, currency, language)}
          </p>
          <div className="flex items-center gap-1 text-[11px] mt-1">
            {expensePercentChange !== 0 ? (
              <span className={`font-bold flex items-center ${expensePercentChange > 0 ? 'text-rose-600' : 'text-emerald-600'}`}>
                {expensePercentChange > 0 ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                {Math.abs(expensePercentChange)}%
              </span>
            ) : null}
            <span className="text-slate-400">{isAr ? 'مقارنة بالشهر السابق' : 'vs previous month'}</span>
          </div>
        </div>

        {/* 4. Net Cash Flow & Savings Rate */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              {isAr ? 'صافي التدفق (الفائض)' : 'Net Cashflow'}
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-50 dark:bg-teal-950/60 text-teal-600 flex items-center justify-center">
              <PiggyBank className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black mt-2 ${currentCashflow.netCashflow >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600'}`}>
            {currentCashflow.netCashflow >= 0 ? '+' : ''}{formatMoney(currentCashflow.netCashflow, currency, language)}
          </p>
          <p className="text-[11px] text-teal-600 dark:text-teal-400 font-bold mt-1">
            {currentCashflow.savingsRate}% {isAr ? 'معدل التوفير والادخار' : 'Savings rate'}
          </p>
        </div>
      </div>

      {/* Secondary Metrics Row: Budgets, Debts & Savings */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Budget Status Widget */}
        <div
          onClick={() => onNavigateTab('budgets')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <PieIcon className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'حالة الميزانية الشهرية' : 'Monthly Budget Health'}</span>
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              budgetPercentage >= 100
                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                : budgetPercentage >= 80
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
            }`}>
              {budgetPercentage}% {isAr ? 'مستهلك' : 'spent'}
            </span>
          </div>

          {overallBudgetAmount > 0 ? (
            <div>
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="text-slate-500">{isAr ? 'المتبقي للإنفاق:' : 'Remaining:'}</span>
                <span className="font-bold text-slate-900 dark:text-slate-100">
                  {formatMoney(budgetRemaining, currency, language)}
                </span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className={`h-full transition-all ${
                    budgetPercentage >= 100 ? 'bg-rose-500' : budgetPercentage >= 80 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, budgetPercentage)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-2">
                {isAr
                  ? `تم إنفاق ${formatMoney(budgetSpent, currency, language)} من أصل ${formatMoney(overallBudgetAmount, currency, language)}`
                  : `Spent ${formatMoney(budgetSpent, currency, language)} of ${formatMoney(overallBudgetAmount, currency, language)}`}
              </p>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-3">
              {isAr ? 'لم تحدد ميزانية شهرية بعد. اضغط هنا لإنشائها.' : 'No budget set yet. Click to define one.'}
            </p>
          )}
        </div>

        {/* Debts Summary Widget */}
        <div
          onClick={() => onNavigateTab('debts')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <HandCoins className="w-4 h-4 text-indigo-600" />
              <span>{isAr ? 'موقف الديون والسلف' : 'Debts & Receivables'}</span>
            </span>
            {debtSummary.overdueCount > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300">
                {debtSummary.overdueCount} {isAr ? 'متأخر' : 'overdue'}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'لك عند الآخرين' : 'Owed to you'}</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 text-sm">
                {formatMoney(debtSummary.totalReceivable, currency, language)}
              </span>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80">
              <span className="text-[10px] text-slate-400 block">{isAr ? 'عليك للآخرين' : 'You owe'}</span>
              <span className="font-bold text-rose-600 dark:text-rose-400 text-sm">
                {formatMoney(debtSummary.totalPayable, currency, language)}
              </span>
            </div>
          </div>
        </div>

        {/* Savings Goals Widget */}
        <div
          onClick={() => onNavigateTab('savings')}
          className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 transition cursor-pointer"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-bold text-xs text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <PiggyBank className="w-4 h-4 text-emerald-600" />
              <span>{isAr ? 'أهداف الادخار' : 'Savings Goals'}</span>
            </span>
            <span className="text-[10px] text-slate-400 font-semibold">{savingsGoals.length} {isAr ? 'أهداف' : 'goals'}</span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-500">{isAr ? 'إجمالي المحقق:' : 'Total saved:'}</span>
            <span className="font-black text-emerald-600 dark:text-emerald-400 text-base">
              {formatMoney(totalSavings, currency, language)}
            </span>
          </div>

          {savingsGoals.length > 0 ? (
            <div className="mt-2 text-xs">
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span className="truncate">{savingsGoals[0].name}</span>
                <span>{Math.round((Number(savingsGoals[0].currentAmount) / Number(savingsGoals[0].targetAmount)) * 100)}%</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden mt-1">
                <div
                  className="h-full bg-emerald-500 rounded-full"
                  style={{
                    width: `${Math.min(100, Math.round((Number(savingsGoals[0].currentAmount) / Number(savingsGoals[0].targetAmount)) * 100))}%`,
                  }}
                />
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-400 mt-2">{isAr ? 'لا توجد أهداف نشطة حالياً' : 'No active goals'}</p>
          )}
        </div>
      </div>

      {/* Visual Analytics & Breakdown Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Expenses by Category Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {isAr ? 'توزيع المصروفات حسب التصنيف' : 'Expenses by Category'}
            </h3>
            <span className="text-[10px] text-slate-400 font-medium">{isAr ? 'الشهر الحالي' : 'This Month'}</span>
          </div>

          {topCategories.length === 0 ? (
            <p className="text-center py-10 text-xs text-slate-400">
              {isAr ? 'لا توجد مصروفات مسجلة لهذا الشهر.' : 'No expenses recorded this month.'}
            </p>
          ) : (
            <div className="space-y-3">
              {topCategories.slice(0, 5).map((cat) => (
                <div key={cat.catId} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                      <span>{cat.name}</span>
                    </span>
                    <span className="font-bold text-slate-900 dark:text-slate-100">
                      {formatMoney(cat.amount, currency, language)} ({cat.percentage}%)
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Transactions List */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              {isAr ? 'أحدث المعاملات المالية' : 'Recent Transactions'}
            </h3>
            <button
              onClick={() => onNavigateTab('transactions')}
              className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              <span>{isAr ? 'عرض الكل' : 'View All'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentTransactions.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              <p>{isAr ? 'لا توجد معاملات مسجلة حتى الآن.' : 'No transactions recorded yet.'}</p>
              <button
                onClick={() => onOpenQuickAdd('expense')}
                className="mt-3 px-4 py-2 bg-emerald-600 text-white rounded-xl font-bold text-xs hover:bg-emerald-700 transition"
              >
                {isAr ? 'سجل أول حركة' : 'Add First Transaction'}
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {recentTransactions.map((tx) => {
                const cat = categoryMap.get(tx.categoryId);
                const isExpense = tx.type === 'expense';
                const isIncome = tx.type === 'income';

                return (
                  <div key={tx.id} className="py-3 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                          isIncome
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                            : isExpense
                            ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                            : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
                        }`}
                      >
                        {isIncome ? (
                          <PlusCircle className="w-4 h-4" />
                        ) : isExpense ? (
                          <MinusCircle className="w-4 h-4" />
                        ) : (
                          <ArrowRightLeft className="w-4 h-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-slate-100">{tx.description}</p>
                        <p className="text-[11px] text-slate-400">
                          {cat ? (isAr ? cat.name : cat.nameEn) : tx.type} • {tx.date}
                        </p>
                      </div>
                    </div>

                    <div className="text-end">
                      <p
                        className={`font-black text-sm ${
                          isIncome
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : isExpense
                            ? 'text-rose-600 dark:text-rose-400'
                            : 'text-blue-600 dark:text-blue-400'
                        }`}
                      >
                        {isIncome ? '+' : isExpense ? '-' : ''}
                        {formatMoney(Number(tx.amount), currency, language)}
                      </p>
                      <span className="text-[10px] text-slate-400 capitalize">{tx.paymentMethod.replace('_', ' ')}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Recurring Bills */}
      {upcomingBills.length > 0 && (
        <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-200/60 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300 flex items-center justify-center shrink-0">
              <CalendarDays className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-amber-900 dark:text-amber-200">
                {isAr ? 'فواتير قادمة تستحق السداد قريباً' : 'Upcoming Bills Due Soon'}
              </p>
              <p className="text-amber-700 dark:text-amber-300/80 text-[11px]">
                {upcomingBills.map((b) => `${b.name} (${formatMoney(b.amount, currency, language)})`).join(' • ')}
              </p>
            </div>
          </div>

          <button
            onClick={() => onNavigateTab('bills')}
            className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition shrink-0 cursor-pointer"
          >
            {isAr ? 'عرض الفواتير وجدولها' : 'View Bills'}
          </button>
        </div>
      )}
    </div>
  );
};
