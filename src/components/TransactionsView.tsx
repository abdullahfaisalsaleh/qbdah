import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  PlusCircle,
  MinusCircle,
  ArrowRightLeft,
  ScanLine,
  Download,
  Trash2,
  Edit2,
  Calendar,
  X,
  CreditCard,
  Tag,
  ArrowUpDown,
  AlertCircle,
} from 'lucide-react';
import {
  Account,
  Category,
  CurrencyCode,
  Language,
  PaymentMethod,
  Transaction,
  TransactionType,
} from '../types/index.ts';
import { formatMoney } from '../utils/finance.ts';

interface TransactionsViewProps {
  transactions: Transaction[];
  accounts: Account[];
  categories: Category[];
  language: Language;
  currency: CurrencyCode;
  onAddTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  onUpdateTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onOpenReceiptScanner: () => void;
  initialOpenAdd?: 'expense' | 'income' | 'transfer' | null;
  onClearInitialOpenAdd?: () => void;
}

export const TransactionsView: React.FC<TransactionsViewProps> = ({
  transactions,
  accounts,
  categories,
  language,
  currency,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onOpenReceiptScanner,
  initialOpenAdd,
  onClearInitialOpenAdd,
}) => {
  const isAr = language === 'ar';

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [accountFilter, setAccountFilter] = useState<string>('all');
  const [dateRangeFilter, setDateRangeFilter] = useState<string>('all'); // 'all', 'today', 'week', 'month', 'last_month'
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest' | 'highest' | 'lowest'>('newest');

  // Modals state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [modalType, setModalType] = useState<TransactionType>('expense');
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form inputs
  const [formAmount, setFormAmount] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategoryId, setFormCategoryId] = useState('');
  const [formSourceAccount, setFormSourceAccount] = useState('');
  const [formDestinationAccount, setFormDestinationAccount] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formPaymentMethod, setFormPaymentMethod] = useState<PaymentMethod>('cash');
  const [formNotes, setFormNotes] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const categoryMap = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);
  const accountMap = useMemo(() => new Map(accounts.map((a) => [a.id, a])), [accounts]);

  // Open modal for add
  const handleOpenAdd = (type: TransactionType) => {
    setModalType(type);
    setEditingTransaction(null);
    setFormAmount('');
    setFormDescription('');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormPaymentMethod('cash');
    setFormNotes('');
    setFormError(null);

    // Preselect valid category
    const validCats = categories.filter((c) => c.type === (type === 'income' ? 'income' : 'expense'));
    setFormCategoryId(validCats[0]?.id || '');

    // Preselect accounts
    if (accounts.length > 0) {
      setFormSourceAccount(accounts[0].id);
      setFormDestinationAccount(accounts[1]?.id || accounts[0].id);
    }
    setIsAddModalOpen(true);
  };

  useEffect(() => {
    if (initialOpenAdd) {
      handleOpenAdd(initialOpenAdd);
      onClearInitialOpenAdd?.();
    }
  }, [initialOpenAdd]);

  // Open modal for edit
  const handleOpenEdit = (tx: Transaction) => {
    setEditingTransaction(tx);
    setModalType(tx.type);
    setFormAmount(String(tx.amount));
    setFormDescription(tx.description);
    setFormCategoryId(tx.categoryId);
    setFormSourceAccount(tx.sourceAccountId);
    setFormDestinationAccount(tx.destinationAccountId || '');
    setFormDate(tx.date);
    setFormPaymentMethod(tx.paymentMethod);
    setFormNotes(tx.notes || '');
    setFormError(null);
    setIsAddModalOpen(true);
  };

  const handleSaveTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    const amountNum = parseFloat(formAmount);
    if (isNaN(amountNum) || amountNum <= 0) return;

    if (modalType === 'transfer' && formSourceAccount === formDestinationAccount) {
      setFormError(isAr ? 'لا يمكن التحويل إلى نفس الحساب، يرجى اختيار حساب مختلف.' : 'Source and destination accounts must be different.');
      return;
    }

    if (editingTransaction) {
      onUpdateTransaction({
        ...editingTransaction,
        type: modalType,
        amount: amountNum,
        description: formDescription.trim(),
        categoryId: formCategoryId,
        sourceAccountId: formSourceAccount,
        destinationAccountId: modalType === 'transfer' ? formDestinationAccount : undefined,
        date: formDate,
        paymentMethod: formPaymentMethod,
        notes: formNotes.trim(),
      });
    } else {
      onAddTransaction({
        userId: '',
        type: modalType,
        amount: amountNum,
        description: formDescription.trim(),
        categoryId: formCategoryId,
        sourceAccountId: formSourceAccount,
        destinationAccountId: modalType === 'transfer' ? formDestinationAccount : undefined,
        date: formDate,
        paymentMethod: formPaymentMethod,
        notes: formNotes.trim(),
      });
    }

    setIsAddModalOpen(false);
  };

  // Filtered & Sorted Transactions
  const filteredTransactions = useMemo(() => {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth() + 1;
    const todayStr = today.toISOString().slice(0, 10);

    return transactions.filter((tx) => {
      // Search
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(query);
        const matchesAmount = String(tx.amount).includes(query);
        const matchesCat = categoryMap.get(tx.categoryId)?.name.toLowerCase().includes(query) || false;
        if (!matchesDesc && !matchesAmount && !matchesCat) return false;
      }

      // Type filter
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;

      // Category filter
      if (categoryFilter !== 'all' && tx.categoryId !== categoryFilter) return false;

      // Account filter
      if (accountFilter !== 'all') {
        if (tx.sourceAccountId !== accountFilter && tx.destinationAccountId !== accountFilter) {
          return false;
        }
      }

      // Date Range filter
      if (dateRangeFilter === 'today' && tx.date !== todayStr) return false;
      if (dateRangeFilter === 'month') {
        const [y, m] = tx.date.split('-');
        if (parseInt(y, 10) !== curYear || parseInt(m, 10) !== curMonth) return false;
      }
      if (dateRangeFilter === 'last_month') {
        const prevM = curMonth === 1 ? 12 : curMonth - 1;
        const prevY = curMonth === 1 ? curYear - 1 : curYear;
        const [y, m] = tx.date.split('-');
        if (parseInt(y, 10) !== prevY || parseInt(m, 10) !== prevM) return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.date).getTime() - new Date(a.date).getTime();
      if (sortOrder === 'oldest') return new Date(a.date).getTime() - new Date(b.date).getTime();
      if (sortOrder === 'highest') return b.amount - a.amount;
      if (sortOrder === 'lowest') return a.amount - b.amount;
      return 0;
    });
  }, [transactions, searchTerm, typeFilter, categoryFilter, accountFilter, dateRangeFilter, sortOrder, categoryMap]);

  // Export to CSV with UTF-8 BOM
  const handleExportCSV = () => {
    const headers = isAr
      ? ['المعرف', 'النوع', 'البيان', 'المبلغ', 'التاريخ', 'التصنيف', 'الحساب', 'طريقة الدفع', 'ملاحظات']
      : ['ID', 'Type', 'Description', 'Amount', 'Date', 'Category', 'Account', 'Payment Method', 'Notes'];

    const rows = filteredTransactions.map((tx) => [
      tx.id,
      tx.type,
      `"${tx.description.replace(/"/g, '""')}"`,
      tx.amount,
      tx.date,
      `"${(categoryMap.get(tx.categoryId)?.name || tx.categoryId).replace(/"/g, '""')}"`,
      `"${(accountMap.get(tx.sourceAccountId)?.name || tx.sourceAccountId).replace(/"/g, '""')}"`,
      tx.paymentMethod,
      `"${(tx.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `qabdah_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header with Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {isAr ? 'سجل المعاملات المالية' : 'Transactions Ledger'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? `إجمالي ${filteredTransactions.length} معاملة مطابقة للتصفية`
              : `Showing ${filteredTransactions.length} matching transactions`}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => handleOpenAdd('expense')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <MinusCircle className="w-4 h-4" />
            <span>{isAr ? 'مصروف جديد' : 'Add Expense'}</span>
          </button>

          <button
            onClick={() => handleOpenAdd('income')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{isAr ? 'دخل جديد' : 'Add Income'}</span>
          </button>

          <button
            onClick={() => handleOpenAdd('transfer')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>{isAr ? 'تحويل' : 'Transfer'}</span>
          </button>

          <button
            onClick={onOpenReceiptScanner}
            className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition cursor-pointer"
            title={isAr ? 'فحص فاتورة OCR' : 'Scan Receipt'}
          >
            <ScanLine className="w-4 h-4 text-emerald-600" />
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition cursor-pointer"
            title={isAr ? 'تصدير إكسيل / CSV' : 'Export CSV'}
          >
            <Download className="w-4 h-4" />
            <span className="hidden sm:inline">{isAr ? 'تصدير' : 'Export'}</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute top-3 start-3 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={isAr ? 'ابحث بالاسم، المبلغ، أو التصنيف...' : 'Search description, amount or category...'}
              className="w-full ps-9 pe-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex items-center rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold shrink-0">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition ${
                typeFilter === 'all'
                  ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              {isAr ? 'الكل' : 'All'}
            </button>
            <button
              onClick={() => setTypeFilter('expense')}
              className={`px-3 py-1.5 rounded-lg transition ${
                typeFilter === 'expense'
                  ? 'bg-white dark:bg-slate-900 text-rose-600 dark:text-rose-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              {isAr ? 'المصروفات' : 'Expenses'}
            </button>
            <button
              onClick={() => setTypeFilter('income')}
              className={`px-3 py-1.5 rounded-lg transition ${
                typeFilter === 'income'
                  ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              {isAr ? 'الدخل' : 'Income'}
            </button>
            <button
              onClick={() => setTypeFilter('transfer')}
              className={`px-3 py-1.5 rounded-lg transition ${
                typeFilter === 'transfer'
                  ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              {isAr ? 'التحويلات' : 'Transfers'}
            </button>
          </div>
        </div>

        {/* Secondary Filters row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-xs">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">{isAr ? 'جميع التصنيفات' : 'All Categories'}</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {isAr ? c.name : c.nameEn}
              </option>
            ))}
          </select>

          {/* Account Filter */}
          <select
            value={accountFilter}
            onChange={(e) => setAccountFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">{isAr ? 'جميع الحسابات' : 'All Accounts'}</option>
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name}
              </option>
            ))}
          </select>

          {/* Date Filter */}
          <select
            value={dateRangeFilter}
            onChange={(e) => setDateRangeFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="all">{isAr ? 'كل الفترات' : 'All Time'}</option>
            <option value="today">{isAr ? 'اليوم' : 'Today'}</option>
            <option value="month">{isAr ? 'هذا الشهر' : 'This Month'}</option>
            <option value="last_month">{isAr ? 'الشهر الماضي' : 'Last Month'}</option>
          </select>

          {/* Sort Order */}
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="newest">{isAr ? 'الأحدث أولاً' : 'Newest'}</option>
            <option value="oldest">{isAr ? 'الأقدم أولاً' : 'Oldest'}</option>
            <option value="highest">{isAr ? 'الأعلى مبلغاً' : 'Highest Amount'}</option>
            <option value="lowest">{isAr ? 'الأقل مبلغاً' : 'Lowest Amount'}</option>
          </select>
        </div>
      </div>

      {/* Transactions Table / List */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
        {filteredTransactions.length === 0 ? (
          <div className="text-center py-16 text-slate-400 text-xs">
            <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
              {isAr ? 'لا توجد معاملات مطابقة لخيارات البحث والتصفية' : 'No transactions match current filters'}
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setTypeFilter('all');
                setCategoryFilter('all');
                setAccountFilter('all');
                setDateRangeFilter('all');
              }}
              className="mt-3 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold transition"
            >
              {isAr ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {filteredTransactions.map((tx) => {
              const cat = categoryMap.get(tx.categoryId);
              const sourceAcc = accountMap.get(tx.sourceAccountId);
              const destAcc = tx.destinationAccountId ? accountMap.get(tx.destinationAccountId) : null;
              const isExpense = tx.type === 'expense';
              const isIncome = tx.type === 'income';

              return (
                <div
                  key={tx.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition text-xs"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isIncome
                          ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600'
                          : isExpense
                          ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600'
                          : 'bg-blue-50 dark:bg-blue-950/60 text-blue-600'
                      }`}
                    >
                      {isIncome ? (
                        <PlusCircle className="w-5 h-5" />
                      ) : isExpense ? (
                        <MinusCircle className="w-5 h-5" />
                      ) : (
                        <ArrowRightLeft className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">{tx.description}</p>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          <span>{tx.date}</span>
                        </span>
                        <span>•</span>
                        <span className="font-medium text-slate-600 dark:text-slate-300">
                          {cat ? (isAr ? cat.name : cat.nameEn) : tx.type}
                        </span>
                        <span>•</span>
                        <span>
                          {sourceAcc?.name}
                          {destAcc && ` ➔ ${destAcc.name}`}
                        </span>
                        {tx.notes && (
                          <>
                            <span>•</span>
                            <span className="italic truncate max-w-[150px]">{tx.notes}</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-start sm:text-end">
                      <p
                        className={`text-base font-black ${
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

                    {/* Action buttons (Edit & Delete) */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleOpenEdit(tx)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                        title={isAr ? 'تعديل المعاملة' : 'Edit Transaction'}
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => setDeletingId(tx.id)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                        title={isAr ? 'حذف المعاملة' : 'Delete Transaction'}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-5 shadow-2xl border border-slate-200 dark:border-slate-800 text-center">
            <div className="w-12 h-12 rounded-full bg-rose-100 text-rose-600 mx-auto flex items-center justify-center mb-3">
              <Trash2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">
              {isAr ? 'تأكيد حذف المعاملة' : 'Confirm Transaction Deletion'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isAr
                ? 'هل أنت متأكد من حذف هذه المعاملة؟ سيتم تحديث رصيد الحساب وإحصائيات الميزانية فوراً.'
                : 'Are you sure? Account balance and budget totals will be updated automatically.'}
            </p>
            <div className="mt-5 flex items-center gap-2">
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold text-xs transition"
              >
                {isAr ? 'إلغاء' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  onDeleteTransaction(deletingId);
                  setDeletingId(null);
                }}
                className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs transition shadow-xs"
              >
                {isAr ? 'تأكيد الحذف' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Transaction Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 end-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-black text-slate-900 dark:text-slate-100 mb-4">
              {editingTransaction
                ? isAr
                  ? 'تعديل المعاملة المالية'
                  : 'Edit Transaction'
                : modalType === 'income'
                ? isAr
                  ? 'تسجيل دخل جديد'
                  : 'Add New Income'
                : modalType === 'expense'
                ? isAr
                  ? 'تسجيل مصروف جديد'
                  : 'Add New Expense'
                : isAr
                ? 'تحويل بين الحسابات'
                : 'Inter-Account Transfer'}
            </h3>

            {/* Type selector buttons if adding fresh */}
            {!editingTransaction && (
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 mb-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setModalType('expense')}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    modalType === 'expense'
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isAr ? 'مصروف' : 'Expense'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalType('income')}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    modalType === 'income'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isAr ? 'دخل' : 'Income'}
                </button>
                <button
                  type="button"
                  onClick={() => setModalType('transfer')}
                  className={`flex-1 py-1.5 rounded-lg transition ${
                    modalType === 'transfer'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {isAr ? 'تحويل' : 'Transfer'}
                </button>
              </div>
            )}

            <form onSubmit={handleSaveTransaction} className="space-y-3 text-xs">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                  <span className="font-semibold">{formError}</span>
                </div>
              )}
              {/* Amount */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'المبلغ' : 'Amount'} ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-3 py-2 text-base font-black rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-600 dark:text-emerald-400"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {modalType === 'income'
                    ? isAr
                      ? 'مصدر الدخل / البيان'
                      : 'Income Source'
                    : modalType === 'expense'
                    ? isAr
                      ? 'عنوان المصروف / المتجر'
                      : 'Merchant / Description'
                    : isAr
                    ? 'بيان التحويل'
                    : 'Transfer Description'}
                </label>
                <input
                  type="text"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder={
                    modalType === 'income'
                      ? isAr
                        ? 'راتب، عمل حر، بيع جهاز...'
                        : 'Salary, freelance...'
                      : isAr
                      ? 'سوبرماركت، بنزين، مطعم...'
                      : 'Supermarket, gas...'
                  }
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Category (if income or expense) */}
              {modalType !== 'transfer' && (
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'التصنيف' : 'Category'}
                  </label>
                  <select
                    value={formCategoryId}
                    onChange={(e) => setFormCategoryId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    {categories
                      .filter((c) => c.type === (modalType === 'income' ? 'income' : 'expense'))
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {isAr ? c.name : c.nameEn}
                        </option>
                      ))}
                  </select>
                </div>
              )}

              {/* Accounts */}
              {modalType === 'transfer' ? (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'من حساب' : 'From Account'}
                    </label>
                    <select
                      value={formSourceAccount}
                      onChange={(e) => setFormSourceAccount(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
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
                      {isAr ? 'إلى حساب' : 'To Account'}
                    </label>
                    <select
                      value={formDestinationAccount}
                      onChange={(e) => setFormDestinationAccount(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      {accounts.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.name} ({a.currency})
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      {isAr ? 'الحساب' : 'Account'}
                    </label>
                    <select
                      value={formSourceAccount}
                      onChange={(e) => setFormSourceAccount(e.target.value)}
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
                      {isAr ? 'طريقة الدفع' : 'Payment Method'}
                    </label>
                    <select
                      value={formPaymentMethod}
                      onChange={(e) => setFormPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                    >
                      <option value="cash">{isAr ? 'نقدي (كاش)' : 'Cash'}</option>
                      <option value="card">{isAr ? 'بطاقة بنكية / فيزا' : 'Debit/Credit Card'}</option>
                      <option value="mobile_wallet">{isAr ? 'محفظة إلكترونية (انستاباي)' : 'Mobile Wallet / InstaPay'}</option>
                      <option value="bank_transfer">{isAr ? 'تحويل بنكي' : 'Bank Transfer'}</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Date */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'تاريخ المعاملة' : 'Date'}
                </label>
                <input
                  type="date"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'ملاحظات إضافية (اختياري)' : 'Notes (Optional)'}
                </label>
                <input
                  type="text"
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  placeholder={isAr ? 'فاتورة رقم #12، مشتريات للمنزل...' : 'Invoice #12, family items...'}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  className={`w-full py-2.5 rounded-xl text-white font-bold transition shadow-md ${
                    modalType === 'expense'
                      ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-900/20'
                      : modalType === 'income'
                      ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-900/20'
                      : 'bg-blue-600 hover:bg-blue-700 shadow-blue-900/20'
                  }`}
                >
                  {editingTransaction ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : isAr ? 'إضافة المعاملة الآن' : 'Save Transaction'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
