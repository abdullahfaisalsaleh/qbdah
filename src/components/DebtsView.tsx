import React, { useState, useMemo } from 'react';
import {
  HandCoins,
  Plus,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Calendar,
  History,
  DollarSign,
} from 'lucide-react';
import {
  Account,
  CurrencyCode,
  Debt,
  DebtPayment,
  DebtType,
  Language,
} from '../types/index.ts';
import { calculateDebtSummary, formatMoney } from '../utils/finance.ts';

interface DebtsViewProps {
  debts: Debt[];
  accounts: Account[];
  language: Language;
  currency: CurrencyCode;
  onAddDebt: (debt: Omit<Debt, 'id' | 'createdAt'>) => void;
  onRecordDebtPayment: (payment: {
    debtId: string;
    amount: number;
    accountId: string;
    notes?: string;
    date: string;
  }) => void;
  onCancelDebt: (id: string) => void;
}

export const DebtsView: React.FC<DebtsViewProps> = ({
  debts,
  accounts,
  language,
  currency,
  onAddDebt,
  onRecordDebtPayment,
  onCancelDebt,
}) => {
  const isAr = language === 'ar';

  const [activeTab, setActiveTab] = useState<'receivable' | 'payable'>('receivable');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [payingDebt, setPayingDebt] = useState<Debt | null>(null);

  // Add Debt Form
  const [personName, setPersonName] = useState('');
  const [originalAmount, setOriginalAmount] = useState('');
  const [debtType, setDebtType] = useState<DebtType>('receivable');
  const [dueDate, setDueDate] = useState('');
  const [description, setDescription] = useState('');

  // Payment Form
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentAccount, setPaymentAccount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [paymentNotes, setPaymentNotes] = useState('');

  const summary = useMemo(() => calculateDebtSummary(debts, currency), [debts, currency]);

  const filteredDebts = useMemo(() => {
    return debts.filter((d) => d.type === activeTab);
  }, [debts, activeTab]);

  const handleOpenAdd = (type: DebtType) => {
    setDebtType(type);
    setPersonName('');
    setOriginalAmount('');
    setDueDate('');
    setDescription('');
    setIsAddModalOpen(true);
  };

  const handleOpenPayment = (debt: Debt) => {
    setPayingDebt(debt);
    setPaymentAmount(String(debt.remainingAmount));
    if (accounts.length > 0) setPaymentAccount(accounts[0].id);
    setPaymentDate(new Date().toISOString().slice(0, 10));
    setPaymentNotes('');
  };

  const handleSaveDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(originalAmount);
    if (!personName.trim() || isNaN(amountNum) || amountNum <= 0) return;

    onAddDebt({
      userId: '',
      type: debtType,
      personName: personName.trim(),
      originalAmount: amountNum,
      remainingAmount: amountNum,
      currency,
      startDate: new Date().toISOString().slice(0, 10),
      dueDate: dueDate || undefined,
      description: description.trim() || undefined,
      status: 'open',
    });

    setIsAddModalOpen(false);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingDebt) return;
    const amountNum = parseFloat(paymentAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    onRecordDebtPayment({
      debtId: payingDebt.id,
      amount: amountNum,
      accountId: paymentAccount,
      date: paymentDate,
      notes: paymentNotes.trim() || undefined,
    });

    setPayingDebt(null);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {isAr ? 'دفتر الديون والسلف' : 'Debts & Receivables'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? 'متابعة دقيقة للأموال التي لك عند الآخرين، والديون المستحقة عليك مع تسجيل الدفعات.'
              : 'Keep tight control over receivables and loan obligations with payment logs.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenAdd('receivable')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'مستحق لي (سلفة لشخص)' : 'New Receivable'}</span>
          </button>

          <button
            onClick={() => handleOpenAdd('payable')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'دين عليّ (التزام)' : 'New Payable'}</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div
          onClick={() => setActiveTab('receivable')}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === 'receivable'
              ? 'bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-500 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4" />
              <span>{isAr ? 'أموال لك عند الآخرين (مستحقات)' : 'Owed to You (Receivables)'}</span>
            </span>
            <span className="text-xs font-black text-emerald-600">
              {debts.filter((d) => d.type === 'receivable' && d.status !== 'paid').length} {isAr ? 'حالات' : 'cases'}
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {formatMoney(summary.totalReceivable, currency, language)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {isAr ? 'مبالغ متوقع تحصيلها لصالحك' : 'Expected to be collected'}
          </p>
        </div>

        <div
          onClick={() => setActiveTab('payable')}
          className={`p-5 rounded-2xl border transition cursor-pointer ${
            activeTab === 'payable'
              ? 'bg-rose-50/50 dark:bg-rose-950/20 border-rose-500 shadow-xs'
              : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-700 dark:text-rose-400 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4" />
              <span>{isAr ? 'أموال مستحقة عليك (ديون للغير)' : 'Debts You Owe (Payables)'}</span>
            </span>
            <span className="text-xs font-black text-rose-600">
              {debts.filter((d) => d.type === 'payable' && d.status !== 'paid').length} {isAr ? 'حالات' : 'cases'}
            </span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-slate-100 mt-2">
            {formatMoney(summary.totalPayable, currency, language)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {isAr ? 'التزامات مالية واجبة السداد' : 'Outstanding liabilities to settle'}
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold max-w-sm">
        <button
          onClick={() => setActiveTab('receivable')}
          className={`flex-1 py-2 rounded-lg transition ${
            activeTab === 'receivable'
              ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
              : 'text-slate-500'
          }`}
        >
          {isAr ? 'أموال لي عند الناس' : 'Receivables'}
        </button>
        <button
          onClick={() => setActiveTab('payable')}
          className={`flex-1 py-2 rounded-lg transition ${
            activeTab === 'payable'
              ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
              : 'text-slate-500'
          }`}
        >
          {isAr ? 'ديون عليّ للناس' : 'Payables'}
        </button>
      </div>

      {/* Debts List */}
      <div className="space-y-3">
        {filteredDebts.length === 0 ? (
          <div className="p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            <HandCoins className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-60" />
            <p className="font-semibold text-slate-600 dark:text-slate-300">
              {isAr ? 'لا توجد سجلات ديون في هذا القسم حالياً' : 'No records found in this category'}
            </p>
            <p className="text-[11px] mt-1">
              {isAr ? 'استخدم الأزرار بالأعلى لتسجيل دين أو سلفة جديدة.' : 'Click above to record a new loan or receivable.'}
            </p>
          </div>
        ) : (
          filteredDebts.map((d) => {
            const isPaid = d.status === 'paid';
            const isPartiallyPaid = d.status === 'partially_paid';
            const todayStr = new Date().toISOString().slice(0, 10);
            const isOverdue = !isPaid && d.dueDate && d.dueDate < todayStr;
            const paidAmount = d.originalAmount - d.remainingAmount;
            const progress = Math.round((paidAmount / d.originalAmount) * 100);

            return (
              <div
                key={d.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{d.personName}</h3>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isPaid
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : isOverdue
                          ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                          : isPartiallyPaid
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {isPaid
                        ? isAr
                          ? 'مسدد بالكامل'
                          : 'Fully Paid'
                        : isOverdue
                        ? isAr
                          ? 'متأخر عن الموعد'
                          : 'Overdue'
                        : isPartiallyPaid
                        ? isAr
                          ? 'مسدد جزئياً'
                          : 'Partially Paid'
                        : isAr
                        ? 'مفتوح'
                        : 'Open'}
                    </span>
                  </div>

                  {d.description && <p className="text-xs text-slate-500 dark:text-slate-400">{d.description}</p>}

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-1">
                    <span>
                      {isAr ? 'تاريخ البدء:' : 'Start:'} {d.startDate}
                    </span>
                    {d.dueDate && (
                      <>
                        <span>•</span>
                        <span className={isOverdue ? 'text-rose-600 font-bold' : ''}>
                          {isAr ? 'موعد الاستحقاق:' : 'Due:'} {d.dueDate}
                        </span>
                      </>
                    )}
                  </div>

                  {/* Payment progress */}
                  <div className="w-full max-w-md pt-2">
                    <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                      <div
                        className="h-full bg-emerald-500 rounded-full"
                        style={{ width: `${Math.min(100, progress)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                      <span>
                        {isAr ? 'المدفوع:' : 'Paid:'} {formatMoney(paidAmount, d.currency, language)} ({progress}%)
                      </span>
                      <span>
                        {isAr ? 'الأصلي:' : 'Original:'} {formatMoney(d.originalAmount, d.currency, language)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:items-end justify-between gap-3 shrink-0">
                  <div className="text-start sm:text-end">
                    <span className="text-[11px] text-slate-400 block">{isAr ? 'المبلغ المتبقي:' : 'Remaining:'}</span>
                    <p
                      className={`text-xl font-black ${
                        isPaid ? 'text-slate-400' : d.type === 'receivable' ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {formatMoney(d.remainingAmount, d.currency, language)}
                    </p>
                  </div>

                  {!isPaid && (
                    <button
                      onClick={() => handleOpenPayment(d)}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                    >
                      {isAr ? 'تسجيل دفعة سداد' : 'Record Payment'}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add Debt Modal */}
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
              {debtType === 'receivable'
                ? isAr
                  ? 'تسجيل مستحق لي (سلفة لشخص)'
                  : 'New Receivable'
                : isAr
                ? 'تسجيل دين عليّ للغير'
                : 'New Payable'}
            </h3>

            <form onSubmit={handleSaveDebt} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'اسم الشخص أو الجهة' : 'Person or Institution Name'}
                </label>
                <input
                  type="text"
                  value={personName}
                  onChange={(e) => setPersonName(e.target.value)}
                  placeholder={isAr ? 'أحمد كمال، شركة التقسيط...' : 'Ahmed Kamal, Bank...'}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'المبلغ الإجمالي' : 'Original Amount'} ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={originalAmount}
                  onChange={(e) => setOriginalAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-3 py-2 text-base font-black rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'موعد الاستحقاق المتفق عليه (اختياري)' : 'Due Date (Optional)'}
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'وصف أو ملاحظات' : 'Description or Notes'}
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder={isAr ? 'سلفة طارئة، قسط جهاز...' : 'Emergency loan, purchase installment...'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md"
                >
                  {isAr ? 'حفظ الدين' : 'Save Debt Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Record Payment Modal */}
      {payingDebt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setPayingDebt(null)}
              className="absolute top-4 end-4 p-1 rounded-lg text-slate-400 hover:text-slate-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-1">
              {isAr ? 'تسجيل دفعة سداد' : 'Record Payment Installment'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              {payingDebt.personName} • {isAr ? 'المتبقي:' : 'Remaining:'}{' '}
              {formatMoney(payingDebt.remainingAmount, payingDebt.currency, language)}
            </p>

            <form onSubmit={handleSavePayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'مبلغ الدفعة' : 'Payment Amount'} ({payingDebt.currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  max={payingDebt.remainingAmount}
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-base font-black rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {payingDebt.type === 'receivable'
                    ? isAr
                      ? 'الحساب المستلم للمبلغ'
                      : 'Account Receiving Funds'
                    : isAr
                    ? 'الحساب المسدد منه'
                    : 'Account Paid From'}
                </label>
                <select
                  value={paymentAccount}
                  onChange={(e) => setPaymentAccount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name} ({a.currency})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'تاريخ السداد' : 'Payment Date'}
                </label>
                <input
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'ملاحظات الدفعة' : 'Notes'}
                </label>
                <input
                  type="text"
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  placeholder={isAr ? 'دفعة جزئية أولى...' : 'First installment...'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md"
                >
                  {isAr ? 'تأكيد تسجيل الدفعة' : 'Confirm Payment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
