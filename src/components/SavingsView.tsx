import React, { useState } from 'react';
import {
  PiggyBank,
  Plus,
  Target,
  Calendar,
  CheckCircle2,
  TrendingUp,
  X,
  Edit2,
  Trash2,
  Shield,
  Laptop,
  Car,
  Home,
  Plane,
  Heart,
  Sparkles,
} from 'lucide-react';
import {
  Account,
  CurrencyCode,
  Language,
  SavingsGoal,
} from '../types/index.ts';
import { calculateSavingsPlan, formatMoney } from '../utils/finance.ts';

interface SavingsViewProps {
  savingsGoals: SavingsGoal[];
  accounts: Account[];
  language: Language;
  currency: CurrencyCode;
  onAddGoal: (goal: Omit<SavingsGoal, 'id' | 'createdAt'>) => void;
  onUpdateGoal: (goal: SavingsGoal) => void;
  onDeleteGoal: (id: string) => void;
  onDepositWithdraw: (goalId: string, amount: number, type: 'deposit' | 'withdraw') => void;
}

export const SavingsView: React.FC<SavingsViewProps> = ({
  savingsGoals,
  accounts,
  language,
  currency,
  onAddGoal,
  onUpdateGoal,
  onDeleteGoal,
  onDepositWithdraw,
}) => {
  const isAr = language === 'ar';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingsGoal | null>(null);

  // Goal Form
  const [name, setName] = useState('');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [color, setColor] = useState('#10b981');

  // Deposit/Withdraw Modal
  const [actionGoal, setActionGoal] = useState<SavingsGoal | null>(null);
  const [actionType, setActionType] = useState<'deposit' | 'withdraw'>('deposit');
  const [actionAmount, setActionAmount] = useState('');

  const totalSaved = savingsGoals.reduce((sum, g) => sum + Number(g.currentAmount || 0), 0);
  const totalTarget = savingsGoals.reduce((sum, g) => sum + Number(g.targetAmount || 0), 0);
  const totalProgress = totalTarget > 0 ? Math.round((totalSaved / totalTarget) * 100) : 0;

  const handleOpenAdd = () => {
    setEditingGoal(null);
    setName('');
    setTargetAmount('');
    const nextYear = new Date();
    nextYear.setFullYear(nextYear.getFullYear() + 1);
    setTargetDate(nextYear.toISOString().slice(0, 10));
    setPriority('medium');
    setColor('#10b981');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (g: SavingsGoal) => {
    setEditingGoal(g);
    setName(g.name);
    setTargetAmount(String(g.targetAmount));
    setTargetDate(g.targetDate);
    setPriority(g.priority);
    setColor(g.color);
    setIsAddModalOpen(true);
  };

  const handleSaveGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(targetAmount);
    if (!name.trim() || isNaN(amountNum) || amountNum <= 0) return;

    if (editingGoal) {
      onUpdateGoal({
        ...editingGoal,
        name: name.trim(),
        targetAmount: amountNum,
        targetDate,
        priority,
        color,
      });
    } else {
      onAddGoal({
        userId: '',
        name: name.trim(),
        targetAmount: amountNum,
        currentAmount: 0,
        currency,
        targetDate,
        priority,
        icon: 'Target',
        color,
        status: 'active',
      });
    }
    setIsAddModalOpen(false);
  };

  const handleSaveAction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!actionGoal) return;
    const amountNum = parseFloat(actionAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    onDepositWithdraw(actionGoal.id, amountNum, actionType);
    setActionGoal(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {isAr ? 'أهداف الادخار وبناء الثروة' : 'Savings Goals & Wealth Building'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? 'خطط لأهدافك المستقبلية (صندوق طوارئ، سيارة، لابتوب)، واعرف المبلغ المطلوب ادخاره يومياً وشهرياً.'
              : 'Set savings milestones and calculate exact required daily and monthly contributions.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'هدف ادخار جديد' : 'New Savings Goal'}</span>
        </button>
      </div>

      {/* Hero Overview Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-emerald-900 via-teal-900 to-slate-900 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-semibold text-emerald-200">
            {isAr ? 'إجمالي المبالغ المدخرة حالياً' : 'Total Accumulated Savings'}
          </span>
          <p className="text-3xl sm:text-4xl font-black mt-1">
            {formatMoney(totalSaved, currency, language)}
          </p>
          <p className="text-xs text-emerald-100/80 mt-1">
            {isAr
              ? `من إجمالي مستهدف: ${formatMoney(totalTarget, currency, language)} (${totalProgress}% محقق)`
              : `Of ${formatMoney(totalTarget, currency, language)} overall target (${totalProgress}% achieved)`}
          </p>
        </div>

        <div className="w-full md:w-64 space-y-1.5">
          <div className="flex justify-between text-xs text-emerald-100 font-bold">
            <span>{isAr ? 'نسبة الإنجاز الشاملة:' : 'Overall Progress:'}</span>
            <span>{totalProgress}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/20 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-emerald-400 to-teal-300 rounded-full transition-all"
              style={{ width: `${Math.min(100, totalProgress)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {savingsGoals.length === 0 ? (
          <div className="col-span-full p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            <PiggyBank className="w-12 h-12 text-emerald-600 mx-auto mb-2 opacity-60" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              {isAr ? 'لا توجد أهداف ادخار مسجلة حتى الآن' : 'No savings goals set yet'}
            </h3>
            <p className="text-xs mt-1">
              {isAr
                ? 'حدد هدفك الأول مثل "صندوق الطوارئ" أو "شراء لابتوب" وابدأ بالادخار خطوة بخطوة.'
                : 'Define your first milestone and let Qabdah calculate your daily saving pace.'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition"
            >
              {isAr ? 'إنشاء أول هدف ادخار' : 'Create First Goal'}
            </button>
          </div>
        ) : (
          savingsGoals.map((g) => {
            const plan = calculateSavingsPlan(g);

            return (
              <div
                key={g.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                        style={{ backgroundColor: g.color }}
                      >
                        <Target className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{g.name}</h3>
                        <span className="text-[11px] text-slate-400">
                          {isAr ? 'الموعد:' : 'Target:'} {g.targetDate}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(g)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteGoal(g.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amounts */}
                  <div className="mt-4 flex items-baseline justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400">{isAr ? 'المحقق حالياً:' : 'Current:'}</span>
                      <p className="text-xl font-black text-slate-900 dark:text-slate-100">
                        {formatMoney(g.currentAmount, g.currency, language)}
                      </p>
                    </div>
                    <div className="text-end">
                      <span className="text-[11px] text-slate-400">{isAr ? 'المستهدف:' : 'Target:'}</span>
                      <p className="text-sm font-bold text-slate-500">
                        {formatMoney(g.targetAmount, g.currency, language)}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="mt-2 space-y-1">
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(100, plan.percentage)}%`,
                          backgroundColor: g.color,
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400">
                      <span>{plan.percentage}% {isAr ? 'مكتمل' : 'completed'}</span>
                      <span>{isAr ? 'متبقي:' : 'Left:'} {formatMoney(plan.remaining, g.currency, language)}</span>
                    </div>
                  </div>

                  {/* Daily / Monthly Pace Calculator Box */}
                  <div className="mt-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-[11px] text-slate-600 dark:text-slate-300 space-y-1">
                    <div className="flex items-center justify-between">
                      <span>{isAr ? 'المتبقي من الأيام:' : 'Days Left:'}</span>
                      <span className="font-bold">{plan.daysRemaining} {isAr ? 'يوم' : 'days'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{isAr ? 'المطلوب شهرياً:' : 'Monthly Pace:'}</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {formatMoney(plan.monthlyRequired, g.currency, language)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>{isAr ? 'المطلوب يومياً:' : 'Daily Pace:'}</span>
                      <span className="font-bold text-teal-600 dark:text-teal-400">
                        {formatMoney(plan.dailyRequired, g.currency, language)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
                  <button
                    onClick={() => {
                      setActionGoal(g);
                      setActionType('deposit');
                      setActionAmount('');
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs"
                  >
                    {isAr ? '+ إيداع مبلغ' : '+ Deposit'}
                  </button>

                  <button
                    onClick={() => {
                      setActionGoal(g);
                      setActionType('withdraw');
                      setActionAmount('');
                    }}
                    className="flex-1 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs transition"
                  >
                    {isAr ? '- سحب' : '- Withdraw'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Goal Modal */}
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
              {editingGoal ? (isAr ? 'تعديل هدف الادخار' : 'Edit Goal') : isAr ? 'إنشاء هدف ادخار جديد' : 'New Savings Goal'}
            </h3>

            <form onSubmit={handleSaveGoal} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'اسم الهدف' : 'Goal Title'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? 'صندوق طوارئ، سيارة جديدة، لابتوب...' : 'Emergency fund, new car...'}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'المبلغ المستهدف' : 'Target Amount'} ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={targetAmount}
                  onChange={(e) => setTargetAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-3 py-2 text-base font-black rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'الموعد المستهدف للوصول للهدف' : 'Target Deadline'}
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'درجة الأولوية' : 'Priority'}
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="high">{isAr ? 'عالية (أساسي/طارئ)' : 'High'}</option>
                  <option value="medium">{isAr ? 'متوسطة' : 'Medium'}</option>
                  <option value="low">{isAr ? 'منخفضة (رغبات)' : 'Low'}</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'لون الهدف' : 'Goal Color'}
                </label>
                <div className="flex items-center gap-2">
                  {['#10b981', '#3b82f6', '#8b5cf6', '#ec4899', '#f97316', '#06b6d4'].map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-7 h-7 rounded-full transition-transform ${color === c ? 'scale-125 ring-2 ring-emerald-500' : ''}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md"
                >
                  {editingGoal ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : isAr ? 'إنشاء الهدف' : 'Create Goal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit / Withdraw Action Modal */}
      {actionGoal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setActionGoal(null)}
              className="absolute top-4 end-4 p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 mb-1">
              {actionType === 'deposit' ? (isAr ? 'إيداع في الهدف' : 'Deposit to Goal') : isAr ? 'سحب من الهدف' : 'Withdraw from Goal'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">{actionGoal.name}</p>

            <form onSubmit={handleSaveAction} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'المبلغ' : 'Amount'} ({actionGoal.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={actionType === 'withdraw' ? actionGoal.currentAmount : undefined}
                  value={actionAmount}
                  onChange={(e) => setActionAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-3 py-2 text-base font-black rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-600"
                />
              </div>

              <button
                type="submit"
                className={`w-full py-2.5 rounded-xl text-white font-bold transition shadow-md ${
                  actionType === 'deposit' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                {actionType === 'deposit' ? (isAr ? 'تأكيد الإيداع' : 'Confirm Deposit') : isAr ? 'تأكيد السحب' : 'Confirm Withdrawal'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
