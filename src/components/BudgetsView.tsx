import React, { useState, useMemo } from 'react';
import {
  PieChart as PieIcon,
  Plus,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  TrendingDown,
  Info,
} from 'lucide-react';
import {
  Account,
  Budget,
  Category,
  CurrencyCode,
  Language,
  Transaction,
} from '../types/index.ts';
import {
  calculateBudgetProgress,
  calculateCategoryExpenses,
  calculateMonthlyCashflow,
  formatMoney,
} from '../utils/finance.ts';

interface BudgetsViewProps {
  budgets: Budget[];
  categories: Category[];
  transactions: Transaction[];
  accounts: Account[];
  language: Language;
  currency: CurrencyCode;
  onAddBudget: (budget: Omit<Budget, 'id' | 'createdAt'>) => void;
  onUpdateBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  categories,
  transactions,
  accounts,
  language,
  currency,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
}) => {
  const isAr = language === 'ar';

  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState(currentMonth);
  const [selectedYear, setSelectedYear] = useState(currentYear);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);

  // Form
  const [formCategory, setFormCategory] = useState<string>('all');
  const [formAmount, setFormAmount] = useState('');

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  // Calculated category expenses for selected month & year
  const categoryExpenses = useMemo(() => {
    return calculateCategoryExpenses(transactions, selectedMonth, selectedYear, currency, accounts);
  }, [transactions, selectedMonth, selectedYear, currency, accounts]);

  const monthlyCashflow = useMemo(() => {
    return calculateMonthlyCashflow(transactions, selectedMonth, selectedYear, currency, accounts);
  }, [transactions, selectedMonth, selectedYear, currency, accounts]);

  // Filter budgets for active view
  const activeBudgets = useMemo(() => {
    return budgets.filter((b) => b.month === selectedMonth && b.year === selectedYear);
  }, [budgets, selectedMonth, selectedYear]);

  const overallBudget = useMemo(() => {
    return activeBudgets.find((b) => b.categoryId === 'all');
  }, [activeBudgets]);

  const overallProgress = useMemo(() => {
    if (!overallBudget) return null;
    return calculateBudgetProgress(overallBudget, categoryExpenses);
  }, [overallBudget, categoryExpenses]);

  const handleOpenAdd = () => {
    setEditingBudget(null);
    setFormCategory('all');
    setFormAmount('');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (b: Budget) => {
    setEditingBudget(b);
    setFormCategory(b.categoryId);
    setFormAmount(String(b.amount));
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    if (editingBudget) {
      onUpdateBudget({
        ...editingBudget,
        categoryId: formCategory,
        amount: amountNum,
        month: selectedMonth,
        year: selectedYear,
      });
    } else {
      onAddBudget({
        userId: '',
        categoryId: formCategory,
        amount: amountNum,
        period: 'monthly',
        month: selectedMonth,
        year: selectedYear,
        alertThresholds: [50, 80, 100],
      });
    }
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {isAr ? 'الميزانيات والتحكم في الإنفاق' : 'Budgets & Expense Control'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? 'حدد حدود الإنفاق الشهرية العامة أو لكل تصنيف، وتلقَّ تنبيهات ذكية قبل تجاوزها.'
              : 'Set monthly spending limits by category and track consumption percentages.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إنشاء ميزانية جديدة' : 'New Budget'}</span>
        </button>
      </div>

      {/* Overall Budget Hero Card */}
      {overallProgress ? (
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {isAr ? 'الميزانية الشهرية الإجمالية الشاملة' : 'Overall Monthly Budget'}
              </span>
              <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-1">
                {formatMoney(Number(overallBudget?.amount || 0), currency, language)}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 ${
                  overallProgress.status === 'exceeded'
                    ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                    : overallProgress.status === 'danger'
                    ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                    : overallProgress.status === 'warning'
                    ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                    : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                }`}
              >
                {overallProgress.status === 'exceeded' ? (
                  <AlertTriangle className="w-3.5 h-3.5" />
                ) : (
                  <CheckCircle2 className="w-3.5 h-3.5" />
                )}
                <span>
                  {overallProgress.status === 'exceeded'
                    ? isAr
                      ? 'تم تجاوز الميزانية!'
                      : 'Budget Exceeded!'
                    : overallProgress.status === 'danger'
                    ? isAr
                      ? 'تحذير: 80% فما فوق'
                      : 'Warning: ≥ 80%'
                    : overallProgress.status === 'warning'
                    ? isAr
                      ? 'استهلاك 50% فما فوق'
                      : 'Halfway: ≥ 50%'
                    : isAr
                    ? 'ضمن الحدود الآمنة'
                    : 'Safe Spending'}
                </span>
              </span>

              <button
                onClick={() => handleOpenEdit(overallBudget!)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className={`h-full transition-all ${
                  overallProgress.status === 'exceeded'
                    ? 'bg-rose-500'
                    : overallProgress.status === 'danger'
                    ? 'bg-amber-500'
                    : overallProgress.status === 'warning'
                    ? 'bg-blue-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(100, overallProgress.percentage)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-medium pt-1">
              <span>
                {isAr ? 'تم صرف:' : 'Spent:'}{' '}
                <strong className="text-slate-900 dark:text-slate-100">
                  {formatMoney(overallProgress.spent, currency, language)}
                </strong>{' '}
                ({overallProgress.percentage}%)
              </span>
              <span>
                {isAr ? 'المتبقي:' : 'Remaining:'}{' '}
                <strong className="text-emerald-600 dark:text-emerald-400">
                  {formatMoney(overallProgress.remaining, currency, language)}
                </strong>
              </span>
            </div>
          </div>
        </div>
      ) : (
        <div className="p-8 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-300 dark:border-slate-800 text-center">
          <PieIcon className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
            {isAr ? 'لم تقم بإنشاء ميزانية عامة لهذا الشهر بعد' : 'No overall budget defined for this month'}
          </h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {isAr
              ? 'تحديد الميزانية يساعدك على ضبط مصروفاتك وحماية مدخراتك من التآكل غير المحسوب.'
              : 'Defining a monthly limit protects your wealth and prevents accidental overspending.'}
          </p>
          <button
            onClick={handleOpenAdd}
            className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition"
          >
            {isAr ? 'إنشاء الميزانية العامة الآن' : 'Create Overall Budget'}
          </button>
        </div>
      )}

      {/* Category Budgets Grid */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-4">
          {isAr ? 'ميزانيات التصنيفات المحددة' : 'Category Specific Budgets'}
        </h2>

        {activeBudgets.filter((b) => b.categoryId !== 'all').length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            {isAr
              ? 'لا توجد ميزانيات مخصصة لتصنيفات منفردة (مثل ميزانية الطعام أو المواصلات). يمكنك إضافة واحدة بالضغط على الزر بالأعلى.'
              : 'No category-specific budgets set. Click New Budget to create one.'}
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeBudgets
              .filter((b) => b.categoryId !== 'all')
              .map((b) => {
                const cat = categoryMap.get(b.categoryId);
                const progress = calculateBudgetProgress(b, categoryExpenses);

                return (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: cat?.color || '#10b981' }}
                          />
                          <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                            {cat ? (isAr ? cat.name : cat.nameEn) : b.categoryId}
                          </h3>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => handleOpenEdit(b)}
                            className="p-1 text-slate-400 hover:text-slate-600 rounded"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onDeleteBudget(b.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4">
                        <span className="text-[11px] text-slate-400">{isAr ? 'الحد المخصص:' : 'Limit:'}</span>
                        <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                          {formatMoney(Number(b.amount), currency, language)}
                        </p>
                      </div>

                      {/* Bar */}
                      <div className="mt-3 space-y-1">
                        <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                          <div
                            className={`h-full ${
                              progress.status === 'exceeded'
                                ? 'bg-rose-500'
                                : progress.status === 'danger'
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, progress.percentage)}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-400 pt-0.5">
                          <span>
                            {isAr ? 'المصروف:' : 'Spent:'} {formatMoney(progress.spent, currency, language)}
                          </span>
                          <span className="font-bold">{progress.percentage}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">{isAr ? 'المتبقي:' : 'Left:'}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(progress.remaining, currency, language)}
                      </span>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>

      {/* Add / Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 end-4 p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-4">
              {editingBudget ? (isAr ? 'تعديل الميزانية' : 'Edit Budget') : isAr ? 'إنشاء ميزانية جديدة' : 'Create New Budget'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'نطاق الميزانية' : 'Budget Scope'}
                </label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="all">
                    {isAr ? '🌟 ميزانية عامة شاملة لكل المصروفات' : '🌟 Overall Budget (All Expenses)'}
                  </option>
                  {categories
                    .filter((c) => c.type === 'expense')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {isAr ? c.name : c.nameEn}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'الحد الأقصى للإنفاق' : 'Spending Limit'} ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-3 py-2 text-base font-black rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-600 dark:text-emerald-400"
                />
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 text-[11px] flex items-center gap-2">
                <Info className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  {isAr
                    ? 'سيتم تفعيل التنبيهات تلقائياً عند استهلاك 50% و80% و100% من المبلغ المحدد.'
                    : 'Smart alerts will trigger at 50%, 80%, and 100% of this limit.'}
                </span>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md"
                >
                  {editingBudget ? (isAr ? 'حفظ الميزانية' : 'Save Budget') : isAr ? 'اعتماد الميزانية' : 'Set Budget'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
