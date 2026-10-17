import React, { useState } from 'react';
import {
  CalendarDays,
  Plus,
  CheckCircle2,
  AlertCircle,
  X,
  CreditCard,
  Edit2,
  Trash2,
  Clock,
  Zap,
} from 'lucide-react';
import {
  Account,
  Category,
  CurrencyCode,
  Language,
  RecurringBill,
  RecurringFrequency,
} from '../types/index.ts';
import { formatMoney } from '../utils/finance.ts';

interface BillsViewProps {
  recurringBills: RecurringBill[];
  accounts: Account[];
  categories: Category[];
  language: Language;
  currency: CurrencyCode;
  onAddBill: (bill: Omit<RecurringBill, 'id' | 'createdAt'>) => void;
  onUpdateBill: (bill: RecurringBill) => void;
  onDeleteBill: (id: string) => void;
  onPayBillNow: (bill: RecurringBill) => void;
}

export const BillsView: React.FC<BillsViewProps> = ({
  recurringBills,
  accounts,
  categories,
  language,
  currency,
  onAddBill,
  onUpdateBill,
  onDeleteBill,
  onPayBillNow,
}) => {
  const isAr = language === 'ar';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingBill, setEditingBill] = useState<RecurringBill | null>(null);

  // Form
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [frequency, setFrequency] = useState<RecurringFrequency>('monthly');
  const [nextDueDate, setNextDueDate] = useState('');
  const [accountId, setAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [autoRecord, setAutoRecord] = useState(false);

  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const categoryMap = new Map(categories.map((c) => [c.id, c]));

  const todayStr = new Date().toISOString().slice(0, 10);

  const handleOpenAdd = () => {
    setEditingBill(null);
    setName('');
    setAmount('');
    setFrequency('monthly');
    const d = new Date();
    d.setDate(d.getDate() + 7);
    setNextDueDate(d.toISOString().slice(0, 10));
    if (accounts.length > 0) setAccountId(accounts[0].id);
    const billCats = categories.filter((c) => c.id === 'cat-bills' || c.id === 'cat-subscriptions');
    setCategoryId(billCats[0]?.id || categories[0]?.id || '');
    setAutoRecord(false);
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (bill: RecurringBill) => {
    setEditingBill(bill);
    setName(bill.name);
    setAmount(String(bill.amount));
    setFrequency(bill.frequency);
    setNextDueDate(bill.nextDueDate);
    setAccountId(bill.accountId);
    setCategoryId(bill.categoryId);
    setAutoRecord(bill.autoRecord);
    setIsAddModalOpen(true);
  };

  const handleSaveBill = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!name.trim() || isNaN(amountNum) || amountNum <= 0) return;

    if (editingBill) {
      onUpdateBill({
        ...editingBill,
        name: name.trim(),
        amount: amountNum,
        frequency,
        nextDueDate,
        accountId,
        categoryId,
        autoRecord,
      });
    } else {
      onAddBill({
        userId: '',
        name: name.trim(),
        amount: amountNum,
        frequency,
        nextDueDate,
        accountId,
        categoryId,
        autoRecord,
        reminderDays: 3,
        isActive: true,
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
            {isAr ? 'الفواتير والالتزامات الدورية' : 'Recurring Bills & Subscriptions'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? 'تتبع فواتير الإنترنت، الكهرباء، الإيجار، والاشتراكات الشهرية وتلقَّ تذكيرات قبل موعدها.'
              : 'Keep recurring subscriptions and utility bills organized with due alerts.'}
          </p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>{isAr ? 'إضافة فاتورة دورية' : 'New Recurring Bill'}</span>
        </button>
      </div>

      {/* Bills List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {recurringBills.length === 0 ? (
          <div className="col-span-full p-12 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400">
            <CalendarDays className="w-12 h-12 text-emerald-600 mx-auto mb-2 opacity-60" />
            <h3 className="font-bold text-slate-700 dark:text-slate-300 text-sm">
              {isAr ? 'لا توجد فواتير دورية مسجلة' : 'No recurring bills scheduled'}
            </h3>
            <p className="text-xs mt-1">
              {isAr
                ? 'سجل فاتورة الإنترنت أو الإيجار لتلقي تذكيرات وتسهيل الدفع بضغطة زر.'
                : 'Schedule your internet, rent, or recurring expenses.'}
            </p>
            <button
              onClick={handleOpenAdd}
              className="mt-4 px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition"
            >
              {isAr ? 'إضافة أول فاتورة' : 'Add First Bill'}
            </button>
          </div>
        ) : (
          recurringBills.map((b) => {
            const isDueSoon = b.nextDueDate <= todayStr;
            const targetAcc = accountMap.get(b.accountId);
            const targetCat = categoryMap.get(b.categoryId);

            return (
              <div
                key={b.id}
                className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{b.name}</h3>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {b.frequency === 'monthly'
                          ? isAr
                            ? 'شهرياً'
                            : 'Monthly'
                          : b.frequency === 'yearly'
                          ? isAr
                            ? 'سنوياً'
                            : 'Yearly'
                          : b.frequency === 'weekly'
                          ? isAr
                            ? 'أسبوعياً'
                            : 'Weekly'
                          : isAr
                          ? 'يومياً'
                          : 'Daily'}
                        {targetCat && ` • ${isAr ? targetCat.name : targetCat.nameEn}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(b)}
                        className="p-1 text-slate-400 hover:text-slate-600 rounded"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteBill(b.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Amount & Due Date */}
                  <div className="mt-4">
                    <span className="text-[11px] text-slate-400">{isAr ? 'المبلغ المستحق:' : 'Due Amount:'}</span>
                    <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-0.5">
                      {formatMoney(b.amount, currency, language)}
                    </p>
                  </div>

                  <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 text-xs flex items-center justify-between">
                    <span className="text-slate-500">{isAr ? 'الاستحقاق القادم:' : 'Next Due:'}</span>
                    <span className={`font-bold ${isDueSoon ? 'text-rose-600' : 'text-slate-800 dark:text-slate-200'}`}>
                      {b.nextDueDate} {isDueSoon ? `(${isAr ? 'مستحق!' : 'Due!'})` : ''}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-400 truncate max-w-[120px]">
                    {targetAcc?.name || (isAr ? 'حساب افتراضي' : 'Default Account')}
                  </span>

                  <button
                    onClick={() => onPayBillNow(b)}
                    className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition shadow-xs cursor-pointer"
                  >
                    {isAr ? 'تسجيل السداد الآن' : 'Pay & Record Now'}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Bill Modal */}
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
              {editingBill ? (isAr ? 'تعديل الفاتورة الدورية' : 'Edit Bill') : isAr ? 'إضافة فاتورة دورية جديدة' : 'New Recurring Bill'}
            </h3>

            <form onSubmit={handleSaveBill} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'اسم الفاتورة أو الخدمة' : 'Bill Title'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? 'إنترنت منزلي WE، إيجار، نتفلكس...' : 'Internet WE, Rent, Netflix...'}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'المبلغ' : 'Amount'} ({currency})
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                    required
                    className="w-full px-3 py-2 text-base font-black rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-rose-600"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'التكرار' : 'Frequency'}
                  </label>
                  <select
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="monthly">{isAr ? 'شهري' : 'Monthly'}</option>
                    <option value="weekly">{isAr ? 'أسبوعي' : 'Weekly'}</option>
                    <option value="yearly">{isAr ? 'سنوي' : 'Yearly'}</option>
                    <option value="daily">{isAr ? 'يومي' : 'Daily'}</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'موعد الاستحقاق القادم' : 'Next Due Date'}
                </label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الحساب الافتراضي للدفع' : 'Payment Account'}
                  </label>
                  <select
                    value={accountId}
                    onChange={(e) => setAccountId(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {accounts.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'التصنيف' : 'Category'}
                  </label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {categories
                      .filter((c) => c.type === 'expense')
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {isAr ? c.name : c.nameEn}
                        </option>
                      ))}
                  </select>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md"
                >
                  {editingBill ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : isAr ? 'حفظ الفاتورة' : 'Save Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
