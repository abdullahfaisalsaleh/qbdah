import React, { useState } from 'react';
import {
  Wallet,
  Landmark,
  Smartphone,
  PiggyBank,
  Plus,
  ArrowRightLeft,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  X,
  CreditCard,
  Edit2,
} from 'lucide-react';
import {
  Account,
  AccountType,
  CurrencyCode,
  Language,
  Transaction,
} from '../types/index.ts';
import {
  calculateAccountBalance,
  calculateNetWorth,
  CURRENCIES,
  formatMoney,
} from '../utils/finance.ts';

interface AccountsViewProps {
  accounts: Account[];
  transactions: Transaction[];
  language: Language;
  currency: CurrencyCode;
  onAddAccount: (acc: Omit<Account, 'id' | 'createdAt'>) => void;
  onUpdateAccount: (acc: Account) => void;
  onOpenTransferModal: () => void;
}

export const AccountsView: React.FC<AccountsViewProps> = ({
  accounts,
  transactions,
  language,
  currency,
  onAddAccount,
  onUpdateAccount,
  onOpenTransferModal,
}) => {
  const isAr = language === 'ar';

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);

  // Form
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('cash');
  const [accountCurrency, setAccountCurrency] = useState<CurrencyCode>('EGP');
  const [initialBalance, setInitialBalance] = useState('');
  const [color, setColor] = useState('#10b981');

  const totalNetWorth = calculateNetWorth(accounts, transactions, currency);

  const getAccountIcon = (accType: AccountType) => {
    switch (accType) {
      case 'bank':
        return Landmark;
      case 'wallet':
        return Smartphone;
      case 'savings':
        return PiggyBank;
      default:
        return Wallet;
    }
  };

  const handleOpenAdd = () => {
    setEditingAccount(null);
    setName('');
    setType('bank');
    setAccountCurrency(currency);
    setInitialBalance('0');
    setColor('#3b82f6');
    setIsAddModalOpen(true);
  };

  const handleOpenEdit = (acc: Account) => {
    setEditingAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setAccountCurrency(acc.currency);
    setInitialBalance(String(acc.initialBalance));
    setColor(acc.color);
    setIsAddModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    const initBal = parseFloat(initialBalance) || 0;

    if (editingAccount) {
      onUpdateAccount({
        ...editingAccount,
        name: name.trim(),
        type,
        currency: accountCurrency,
        initialBalance: initBal,
        color,
      });
    } else {
      onAddAccount({
        userId: '',
        name: name.trim(),
        type,
        currency: accountCurrency,
        initialBalance: initBal,
        balance: initBal,
        color,
        icon: type,
        isActive: true,
      });
    }
    setIsAddModalOpen(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {isAr ? 'الحسابات والمحافظ المالية' : 'Accounts & Wallets'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? 'إدارة أرصدتك النقدية والبنكية والمحافظ الإلكترونية، مع التحويلات المباشرة بينها.'
              : 'Manage your Cash, Bank accounts, and Mobile Wallets with balance precision.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenTransferModal}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <ArrowRightLeft className="w-4 h-4" />
            <span>{isAr ? 'تحويل بين الحسابات' : 'Transfer Funds'}</span>
          </button>

          <button
            onClick={handleOpenAdd}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? 'إضافة حساب جديد' : 'New Account'}</span>
          </button>
        </div>
      </div>

      {/* Net Worth Summary Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-tr from-emerald-900 via-emerald-800 to-teal-800 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-emerald-200">
            {isAr ? 'إجمالي الرصيد المتاح (صافي الثروة عبر كل الحسابات)' : 'Total Net Worth Across All Accounts'}
          </span>
          <p className="text-3xl sm:text-4xl font-black mt-1">
            {formatMoney(totalNetWorth, currency, language)}
          </p>
          <p className="text-[11px] text-emerald-200/80 mt-1">
            {isAr ? `المعادل بالعملة الأساسية (${currency})` : `Converted to base currency (${currency})`}
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-xs border border-white/20 text-xs">
          <span className="text-emerald-100 block">{isAr ? 'عدد الحسابات المتاحة:' : 'Active accounts:'}</span>
          <span className="font-black text-lg text-white">{accounts.length} {isAr ? 'محافظ' : 'wallets'}</span>
        </div>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {accounts.map((acc) => {
          const Icon = getAccountIcon(acc.type);
          const currentBal = calculateAccountBalance(acc, transactions);
          const txCount = transactions.filter(
            (t) => t.sourceAccountId === acc.id || t.destinationAccountId === acc.id
          ).length;

          return (
            <div
              key={acc.id}
              className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500/50 transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm"
                      style={{ backgroundColor: acc.color }}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{acc.name}</h3>
                      <span className="text-[11px] text-slate-400 capitalize">
                        {acc.type === 'wallet'
                          ? isAr
                            ? 'محفظة إلكترونية'
                            : 'Mobile Wallet'
                          : acc.type === 'bank'
                          ? isAr
                            ? 'حساب بنكي'
                            : 'Bank Account'
                          : acc.type === 'savings'
                          ? isAr
                            ? 'حساب توفير'
                            : 'Savings'
                          : isAr
                          ? 'كاش نقدي'
                          : 'Cash'}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleOpenEdit(acc)}
                    className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                    title={isAr ? 'تعديل الحساب' : 'Edit Account'}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Balances */}
                <div className="mt-5">
                  <span className="text-[11px] text-slate-400 font-medium">{isAr ? 'الرصيد الفعلي الحالي:' : 'Current Balance:'}</span>
                  <p className="text-2xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                    {formatMoney(currentBal, acc.currency, language)}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:divide-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
                <span>
                  {isAr ? 'الرصيد الافتتاحي:' : 'Starting:'} {formatMoney(acc.initialBalance, acc.currency, language)}
                </span>
                <span>
                  {txCount} {isAr ? 'معاملة' : 'transactions'}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Account Modal */}
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
              {editingAccount ? (isAr ? 'تعديل بيانات الحساب' : 'Edit Account') : isAr ? 'إضافة حساب مالي جديد' : 'Add New Account'}
            </h3>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'اسم الحساب أو المحفظة' : 'Account Name'}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={isAr ? 'حساب بنك مصر، فودافون كاش...' : 'CIB Bank, PayPal...'}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'نوع الحساب' : 'Account Type'}
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as AccountType)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                  >
                    <option value="cash">{isAr ? 'نقدي (كاش)' : 'Cash'}</option>
                    <option value="bank">{isAr ? 'حساب بنكي' : 'Bank Account'}</option>
                    <option value="wallet">{isAr ? 'محفظة إلكترونية' : 'Mobile Wallet'}</option>
                    <option value="savings">{isAr ? 'حساب ادخار' : 'Savings Account'}</option>
                    <option value="custom">{isAr ? 'مخصص' : 'Custom'}</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'العملة' : 'Currency'}
                  </label>
                  <select
                    value={accountCurrency}
                    onChange={(e) => setAccountCurrency(e.target.value as CurrencyCode)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
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
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'الرصيد الافتتاحي' : 'Initial Starting Balance'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={initialBalance}
                  onChange={(e) => setInitialBalance(e.target.value)}
                  placeholder="0.00"
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'لون التمييز' : 'Accent Color'}
                </label>
                <div className="flex items-center gap-2">
                  {['#10b981', '#3b82f6', '#f97316', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'].map((c) => (
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
                  {editingAccount ? (isAr ? 'حفظ التعديلات' : 'Save Changes') : isAr ? 'إنشاء الحساب' : 'Create Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
