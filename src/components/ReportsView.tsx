import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Calendar,
  TrendingUp,
  TrendingDown,
  PieChart,
  ArrowRight,
  Filter,
} from 'lucide-react';
import {
  Account,
  Category,
  CurrencyCode,
  Debt,
  Language,
  SavingsGoal,
  Transaction,
  UserProfile,
} from '../types/index.ts';
import {
  calculateCategoryExpenses,
  calculateDebtSummary,
  calculateMonthlyCashflow,
  calculateNetWorth,
  convertCurrency,
  formatMoney,
} from '../utils/finance.ts';

interface ReportsViewProps {
  user: UserProfile;
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  debts: Debt[];
  savingsGoals: SavingsGoal[];
  language: Language;
  currency: CurrencyCode;
  customRates?: Partial<Record<CurrencyCode, number>>;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  user,
  transactions,
  accounts,
  categories,
  debts,
  savingsGoals,
  language,
  currency,
  customRates,
}) => {
  const isAr = language === 'ar';

  const today = new Date();
  const [period, setPeriod] = useState<'this_month' | 'last_month' | 'this_year' | 'all'>('this_month');

  const curMonth = today.getMonth() + 1;
  const curYear = today.getFullYear();

  const prevMonth = curMonth === 1 ? 12 : curMonth - 1;
  const prevYear = curMonth === 1 ? curYear - 1 : curYear;

  // Filtered transactions by selected period
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (!tx.date) return false;
      const [y, m] = tx.date.split('-');
      const txYear = parseInt(y, 10);
      const txMonth = parseInt(m, 10);

      if (period === 'this_month') return txYear === curYear && txMonth === curMonth;
      if (period === 'last_month') return txYear === prevYear && txMonth === prevMonth;
      if (period === 'this_year') return txYear === curYear;
      return true;
    });
  }, [transactions, period, curMonth, curYear, prevMonth, prevYear]);

  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  // Aggregate stats converted to user's selected viewing currency
  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => {
        const acc = accountMap.get(t.sourceAccountId);
        const accCurr = acc?.currency || currency;
        return sum + convertCurrency(Number(t.amount || 0), accCurr, currency, customRates);
      }, 0);
  }, [filteredTransactions, accountMap, currency, customRates]);

  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => {
        const acc = accountMap.get(t.sourceAccountId);
        const accCurr = acc?.currency || currency;
        return sum + convertCurrency(Number(t.amount || 0), accCurr, currency, customRates);
      }, 0);
  }, [filteredTransactions, accountMap, currency, customRates]);

  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round((netSavings / totalIncome) * 100)) : 0;

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Expenses grouped by category converted to selected currency
  const categoryStats = useMemo(() => {
    const stats: Record<string, number> = {};
    for (const tx of filteredTransactions) {
      if (tx.type === 'expense') {
        const acc = accountMap.get(tx.sourceAccountId);
        const accCurr = acc?.currency || currency;
        const converted = convertCurrency(Number(tx.amount || 0), accCurr, currency, customRates);
        stats[tx.categoryId] = (stats[tx.categoryId] || 0) + converted;
      }
    }
    return Object.entries(stats)
      .map(([catId, amount]) => {
        const cat = categoryMap.get(catId);
        return {
          catId,
          name: cat ? (isAr ? cat.name : cat.nameEn) : catId,
          color: cat?.color || '#94a3b8',
          amount,
          percentage: totalExpense > 0 ? Math.round((amount / totalExpense) * 100) : 0,
        };
      })
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactions, accountMap, currency, customRates, categoryMap, isAr, totalExpense]);

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = isAr
      ? ['المعرف', 'النوع', 'البيان', 'المبلغ', 'العملة', 'التاريخ', 'التصنيف']
      : ['ID', 'Type', 'Description', 'Amount', 'Currency', 'Date', 'Category'];

    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.type,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.amount,
      currency,
      tx.date,
      `"${(categoryMap.get(tx.categoryId)?.name || tx.categoryId).replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qabdah_financial_statement_${period}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Non-print Top Controls */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {isAr ? 'التقارير المالية وكشوف الحساب' : 'Financial Reports & Statements'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? 'كشف حساب تحليلي مفصل وتصدير رسمي معتمد يدعم الطباعة بصيغة PDF والإكسيل.'
              : 'Detailed analytic financial statement with printable PDF & CSV export.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Period Selector */}
          <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
            <button
              onClick={() => setPeriod('this_month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                period === 'this_month'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              {isAr ? 'هذا الشهر' : 'This Month'}
            </button>
            <button
              onClick={() => setPeriod('last_month')}
              className={`px-3 py-1.5 rounded-lg transition ${
                period === 'last_month'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              {isAr ? 'الشهر الماضي' : 'Last Month'}
            </button>
            <button
              onClick={() => setPeriod('this_year')}
              className={`px-3 py-1.5 rounded-lg transition ${
                period === 'this_year'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              {isAr ? 'هذا العام' : 'This Year'}
            </button>
            <button
              onClick={() => setPeriod('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                period === 'all'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              {isAr ? 'الكل' : 'All Time'}
            </button>
          </div>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>{isAr ? 'تصدير إكسيل' : 'Export Excel'}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>{isAr ? 'طباعة / حفظ PDF' : 'Print / Save PDF'}</span>
          </button>
        </div>
      </div>

      {/* Official Financial Statement Document Container */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-md p-6 sm:p-10 space-y-8">
        {/* Document Header */}
        <div className="border-b border-slate-200 dark:border-slate-800 pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-emerald-800 to-teal-600 text-white font-serif font-black text-2xl flex items-center justify-center">
              ق
            </div>
            <div>
              <h2 className="text-xl font-black text-slate-900 dark:text-slate-100">
                {isAr ? 'تقرير التدفقات المالية وكشف الحساب' : 'Financial Statement & Cash Flow Report'}
              </h2>
              <p className="text-xs text-slate-400">
                قَبْضَة | Qabdah Financial Platform • {user.name} ({user.email})
              </p>
            </div>
          </div>

          <div className="text-start sm:text-end text-xs text-slate-500">
            <p>
              {isAr ? 'تاريخ التقرير:' : 'Date Issued:'}{' '}
              <strong>{today.toISOString().slice(0, 10)}</strong>
            </p>
            <p>
              {isAr ? 'العملة الأساسية:' : 'Base Currency:'} <strong>{currency}</strong>
            </p>
            <p>
              {isAr ? 'نطاق الفترة:' : 'Period:'}{' '}
              <strong className="capitalize">{period.replace('_', ' ')}</strong>
            </p>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-400 block font-medium">
              {isAr ? 'إجمالي الإيرادات (الدخل)' : 'Total Inflows (Income)'}
            </span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              +{formatMoney(totalIncome, currency, language)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-400 block font-medium">
              {isAr ? 'إجمالي النفقات (المصروفات)' : 'Total Outflows (Expenses)'}
            </span>
            <p className="text-xl font-black text-rose-600 dark:text-rose-400 mt-1">
              -{formatMoney(totalExpense, currency, language)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-400 block font-medium">
              {isAr ? 'صافي الفائض والادخار' : 'Net Savings Surplus'}
            </span>
            <p
              className={`text-xl font-black mt-1 ${
                netSavings >= 0 ? 'text-teal-600 dark:text-teal-400' : 'text-rose-600'
              }`}
            >
              {netSavings >= 0 ? '+' : ''}
              {formatMoney(netSavings, currency, language)}
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="text-[11px] text-slate-400 block font-medium">
              {isAr ? 'معدل التوفير الفعلي' : 'Actual Savings Rate'}
            </span>
            <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
              {savingsRate}%
            </p>
          </div>
        </div>

        {/* Expenses by Category Breakdown Table */}
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-3">
            {isAr ? 'تحليل المصروفات حسب التصنيف' : 'Expense Breakdown by Category'}
          </h3>

          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-start divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                <tr>
                  <th className="py-2.5 px-4 text-start">{isAr ? 'التصنيف' : 'Category'}</th>
                  <th className="py-2.5 px-4 text-start">{isAr ? 'المبلغ الإجمالي' : 'Total Spent'}</th>
                  <th className="py-2.5 px-4 text-start">{isAr ? 'النسبة من المصروفات' : 'Share of Expense'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {categoryStats.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="py-6 text-center text-slate-400">
                      {isAr ? 'لا توجد بيانات مصروفات لهذه الفترة.' : 'No expense data for this period.'}
                    </td>
                  </tr>
                ) : (
                  categoryStats.map((c) => (
                    <tr key={c.catId}>
                      <td className="py-2.5 px-4 font-bold flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                        <span>{c.name}</span>
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-slate-900 dark:text-slate-100">
                        {formatMoney(c.amount, currency, language)}
                      </td>
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2">
                          <div className="w-24 h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                            <div
                              className="h-full rounded-full"
                              style={{ width: `${c.percentage}%`, backgroundColor: c.color }}
                            />
                          </div>
                          <span className="text-slate-400 font-bold">{c.percentage}%</span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detailed Itemized Transactions Table */}
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 mb-3">
            {isAr ? 'سجل العمليات التفصيلي خلال الفترة' : 'Itemized Transaction Ledger'}
          </h3>

          <div className="border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-start divide-y divide-slate-200 dark:divide-slate-700">
              <thead className="bg-slate-50 dark:bg-slate-800 text-slate-500 font-bold">
                <tr>
                  <th className="py-2.5 px-4 text-start">{isAr ? 'التاريخ' : 'Date'}</th>
                  <th className="py-2.5 px-4 text-start">{isAr ? 'البيان' : 'Description'}</th>
                  <th className="py-2.5 px-4 text-start">{isAr ? 'النوع' : 'Type'}</th>
                  <th className="py-2.5 px-4 text-start">{isAr ? 'التصنيف' : 'Category'}</th>
                  <th className="py-2.5 px-4 text-end">{isAr ? 'المبلغ' : 'Amount'}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredTransactions.slice(0, 50).map((tx) => {
                  const cat = categoryMap.get(tx.categoryId);
                  const isExp = tx.type === 'expense';
                  const isInc = tx.type === 'income';

                  return (
                    <tr key={tx.id}>
                      <td className="py-2.5 px-4 text-slate-400 whitespace-nowrap">{tx.date}</td>
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-slate-100">
                        {tx.description}
                        {tx.notes && <span className="text-[10px] text-slate-400 block font-normal">{tx.notes}</span>}
                      </td>
                      <td className="py-2.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            isInc
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : isExp
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                          }`}
                        >
                          {isInc ? (isAr ? 'دخل' : 'Income') : isExp ? (isAr ? 'مصروف' : 'Expense') : (isAr ? 'تحويل' : 'Transfer')}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 dark:text-slate-300">
                        {cat ? (isAr ? cat.name : cat.nameEn) : tx.type}
                      </td>
                      <td
                        className={`py-2.5 px-4 text-end font-black ${
                          isInc ? 'text-emerald-600' : isExp ? 'text-rose-600' : 'text-blue-600'
                        }`}
                      >
                        {isInc ? '+' : isExp ? '-' : ''}
                        {formatMoney(tx.amount, currency, language)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Report Footer / Signature */}
        <div className="pt-6 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <p>{isAr ? 'تم إنشاء التقرير آلياً عبر منصة قَبْضَة المالية' : 'Generated automatically by Qabdah Platform'}</p>
          <p>{isAr ? 'جميع الحقوق محفوظة' : 'All rights reserved'} © {curYear}</p>
        </div>
      </div>
    </div>
  );
};
