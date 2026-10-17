/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar.tsx';
import { LandingPage } from './components/LandingPage.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { TransactionsView } from './components/TransactionsView.tsx';
import { AccountsView } from './components/AccountsView.tsx';
import { BudgetsView } from './components/BudgetsView.tsx';
import { DebtsView } from './components/DebtsView.tsx';
import { SavingsView } from './components/SavingsView.tsx';
import { BillsView } from './components/BillsView.tsx';
import { ReportsView } from './components/ReportsView.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { AiAdvisorModal } from './components/AiAdvisorModal.tsx';
import { ReceiptScannerModal } from './components/ReceiptScannerModal.tsx';
import { SubscriptionsModal } from './components/SubscriptionsModal.tsx';
import { SettingsModal } from './components/SettingsModal.tsx';
import { AdminDashboardView } from './components/AdminDashboardView.tsx';
import { AdBanner } from './components/AdBanner.tsx';
import { InstallPrompt } from './components/InstallPrompt.tsx';
import { CurrencyConverterModal } from './components/CurrencyConverterModal.tsx';
import { CurrencyService } from './services/currencyService.ts';

import {
  Account,
  Budget,
  Category,
  CurrencyCode,
  Debt,
  Language,
  NotificationItem,
  RecurringBill,
  SavingsGoal,
  Theme,
  Transaction,
  UserProfile,
} from './types/index.ts';
import { StorageService } from './services/storage.ts';

export default function App() {
  // Session & Preferences State
  const [user, setUser] = useState<UserProfile | null>(() => StorageService.getCurrentUser());
  const [language, setLanguage] = useState<Language>(() => user?.language || 'ar');
  const [theme, setTheme] = useState<Theme>(() => user?.theme || 'light');
  const [currency, setCurrency] = useState<CurrencyCode>(() => user?.currency || 'EGP');
  const [activeTab, setActiveTab] = useState<string>(() => (user ? 'dashboard' : 'landing'));

  // Data States
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [debts, setDebts] = useState<Debt[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [recurringBills, setRecurringBills] = useState<RecurringBill[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  // Modals & Panels State
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authInitialMode, setAuthInitialMode] = useState<'login' | 'register'>('login');
  const [isAiAdvisorOpen, setIsAiAdvisorOpen] = useState(false);
  const [isReceiptScannerOpen, setIsReceiptScannerOpen] = useState(false);
  const [isSubscriptionsOpen, setIsSubscriptionsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [settingsInitialTab, setSettingsInitialTab] = useState('general');
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isCurrencyConverterOpen, setIsCurrencyConverterOpen] = useState(false);

  // Live Exchange Rates State (USD base)
  const [exchangeRates, setExchangeRates] = useState<Partial<Record<CurrencyCode, number>>>(
    () => CurrencyService.getCachedRates().rates
  );

  // Subscribe to live currency rates updates
  useEffect(() => {
    CurrencyService.fetchLatestRates().then((data) => {
      setExchangeRates(data.rates);
    });
    const unsubscribe = CurrencyService.subscribe((data) => {
      setExchangeRates(data.rates);
    });
    return unsubscribe;
  }, []);

  // Sync RTL / LTR direction and Dark mode class
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Load user isolated dataset whenever user changes
  useEffect(() => {
    if (user) {
      setAccounts(StorageService.getAccounts(user.id));
      setTransactions(StorageService.getTransactions(user.id));
      setCategories(StorageService.getCategories(user.id));
      setBudgets(StorageService.getBudgets(user.id));
      setDebts(StorageService.getDebts(user.id));
      setSavingsGoals(StorageService.getSavingsGoals(user.id));
      setRecurringBills(StorageService.getRecurringBills(user.id));
      setNotifications(StorageService.getNotifications(user.id));
      setCurrency(user.currency || 'EGP');
      setLanguage(user.language || 'ar');
      setTheme(user.theme || 'light');
    } else {
      setActiveTab('landing');
    }
  }, [user?.id]);

  // Handle Login Success
  const handleLoginSuccess = (loggedInUser: UserProfile) => {
    setUser(loggedInUser);
    setActiveTab('dashboard');
  };

  // Handle Sign Out
  const handleSignOut = () => {
    StorageService.setCurrentUser(null);
    setUser(null);
    setActiveTab('landing');
  };

  // --- Transactions Handlers ---
  const handleAddTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newTx: Transaction = {
      ...txData,
      id: 'tx_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now(),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    const updated = [newTx, ...transactions];
    setTransactions(updated);
    StorageService.saveTransactions(user.id, updated);
    StorageService.addAuditLog(user.id, 'ADD_TRANSACTION', `${newTx.type}: ${newTx.amount} for ${newTx.description}`);
  };

  const handleUpdateTransaction = (tx: Transaction) => {
    if (!user) return;
    const updated = transactions.map((t) => (t.id === tx.id ? tx : t));
    setTransactions(updated);
    StorageService.saveTransactions(user.id, updated);
    StorageService.addAuditLog(user.id, 'UPDATE_TRANSACTION', `Updated: ${tx.description}`);
  };

  const handleDeleteTransaction = (id: string) => {
    if (!user) return;
    const updated = transactions.filter((t) => t.id !== id);
    setTransactions(updated);
    StorageService.saveTransactions(user.id, updated);
    StorageService.addAuditLog(user.id, 'DELETE_TRANSACTION', `Deleted transaction: ${id}`);
  };

  // --- Accounts Handlers ---
  const handleAddAccount = (accData: Omit<Account, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newAcc: Account = {
      ...accData,
      id: 'acc_' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    const updated = [...accounts, newAcc];
    setAccounts(updated);
    StorageService.saveAccounts(user.id, updated);
    StorageService.addAuditLog(user.id, 'ADD_ACCOUNT', `Created account: ${newAcc.name}`);
  };

  const handleUpdateAccount = (acc: Account) => {
    if (!user) return;
    const updated = accounts.map((a) => (a.id === acc.id ? acc : a));
    setAccounts(updated);
    StorageService.saveAccounts(user.id, updated);
  };

  // --- Budgets Handlers ---
  const handleAddBudget = (bData: Omit<Budget, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newB: Budget = {
      ...bData,
      id: 'b_' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    const updated = [...budgets, newB];
    setBudgets(updated);
    StorageService.saveBudgets(user.id, updated);
  };

  const handleUpdateBudget = (b: Budget) => {
    if (!user) return;
    const updated = budgets.map((item) => (item.id === b.id ? b : item));
    setBudgets(updated);
    StorageService.saveBudgets(user.id, updated);
  };

  const handleDeleteBudget = (id: string) => {
    if (!user) return;
    const updated = budgets.filter((b) => b.id !== id);
    setBudgets(updated);
    StorageService.saveBudgets(user.id, updated);
  };

  // --- Debts Handlers ---
  const handleAddDebt = (debtData: Omit<Debt, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newDebt: Debt = {
      ...debtData,
      id: 'debt_' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    const updated = [newDebt, ...debts];
    setDebts(updated);
    StorageService.saveDebts(user.id, updated);
  };

  const handleRecordDebtPayment = (payment: {
    debtId: string;
    amount: number;
    accountId: string;
    notes?: string;
    date: string;
  }) => {
    if (!user) return;
    const debt = debts.find((d) => d.id === payment.debtId);
    if (!debt) return;

    const newRemaining = Math.max(0, debt.remainingAmount - payment.amount);
    const newStatus = newRemaining === 0 ? 'paid' : 'partially_paid';

    const updatedDebts = debts.map((d) =>
      d.id === payment.debtId ? { ...d, remainingAmount: newRemaining, status: newStatus as any } : d
    );
    setDebts(updatedDebts);
    StorageService.saveDebts(user.id, updatedDebts);

    // Also record transaction in ledger:
    // If receivable (فلوس لي عند الناس): user received money -> income on account
    // If payable (دين عليّ): user paid money -> expense on account
    const isReceivable = debt.type === 'receivable';
    handleAddTransaction({
      userId: user.id,
      type: isReceivable ? 'income' : 'expense',
      amount: payment.amount,
      description: isReceivable
        ? `سداد دفعة من سلفة: ${debt.personName}`
        : `سداد قسط دين لصالح: ${debt.personName}`,
      categoryId: isReceivable ? 'cat-income-other' : 'cat-expense-other',
      sourceAccountId: payment.accountId,
      date: payment.date,
      paymentMethod: 'bank_transfer',
      notes: payment.notes,
    });
  };

  const handleCancelDebt = (id: string) => {
    if (!user) return;
    const updated = debts.map((d) => (d.id === id ? { ...d, status: 'cancelled' as any } : d));
    setDebts(updated);
    StorageService.saveDebts(user.id, updated);
  };

  // --- Savings Handlers ---
  const handleAddGoal = (goalData: Omit<SavingsGoal, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newGoal: SavingsGoal = {
      ...goalData,
      id: 'goal_' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    const updated = [...savingsGoals, newGoal];
    setSavingsGoals(updated);
    StorageService.saveSavingsGoals(user.id, updated);
  };

  const handleUpdateGoal = (goal: SavingsGoal) => {
    if (!user) return;
    const updated = savingsGoals.map((g) => (g.id === goal.id ? goal : g));
    setSavingsGoals(updated);
    StorageService.saveSavingsGoals(user.id, updated);
  };

  const handleDeleteGoal = (id: string) => {
    if (!user) return;
    const updated = savingsGoals.filter((g) => g.id !== id);
    setSavingsGoals(updated);
    StorageService.saveSavingsGoals(user.id, updated);
  };

  const handleDepositWithdrawGoal = (goalId: string, amount: number, type: 'deposit' | 'withdraw') => {
    if (!user) return;
    const updated = savingsGoals.map((g) => {
      if (g.id !== goalId) return g;
      const current = Number(g.currentAmount || 0);
      const newCurrent = type === 'deposit' ? current + amount : Math.max(0, current - amount);
      const status = newCurrent >= g.targetAmount ? 'completed' : g.status;
      return { ...g, currentAmount: newCurrent, status: status as any };
    });
    setSavingsGoals(updated);
    StorageService.saveSavingsGoals(user.id, updated);
  };

  // --- Recurring Bills Handlers ---
  const handleAddBill = (billData: Omit<RecurringBill, 'id' | 'createdAt'>) => {
    if (!user) return;
    const newBill: RecurringBill = {
      ...billData,
      id: 'bill_' + Math.random().toString(36).substring(2, 9),
      userId: user.id,
      createdAt: new Date().toISOString(),
    };
    const updated = [...recurringBills, newBill];
    setRecurringBills(updated);
    StorageService.saveRecurringBills(user.id, updated);
  };

  const handleUpdateBill = (bill: RecurringBill) => {
    if (!user) return;
    const updated = recurringBills.map((b) => (b.id === bill.id ? bill : b));
    setRecurringBills(updated);
    StorageService.saveRecurringBills(user.id, updated);
  };

  const handleDeleteBill = (id: string) => {
    if (!user) return;
    const updated = recurringBills.filter((b) => b.id !== id);
    setRecurringBills(updated);
    StorageService.saveRecurringBills(user.id, updated);
  };

  const handlePayBillNow = (bill: RecurringBill) => {
    if (!user) return;
    // Record expense in transactions
    handleAddTransaction({
      userId: user.id,
      type: 'expense',
      amount: bill.amount,
      description: `سداد فاتورة: ${bill.name}`,
      categoryId: bill.categoryId || 'cat-bills',
      sourceAccountId: bill.accountId || accounts[0]?.id,
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'mobile_wallet',
      notes: 'سداد دوري مباشر',
    });

    // Advance next due date by 1 month or 1 frequency step
    const currentDue = new Date(bill.nextDueDate);
    if (bill.frequency === 'yearly') {
      currentDue.setFullYear(currentDue.getFullYear() + 1);
    } else if (bill.frequency === 'weekly') {
      currentDue.setDate(currentDue.getDate() + 7);
    } else {
      currentDue.setMonth(currentDue.getMonth() + 1);
    }

    const updatedBills = recurringBills.map((b) =>
      b.id === bill.id ? { ...b, nextDueDate: currentDue.toISOString().slice(0, 10), lastProcessedDate: new Date().toISOString() } : b
    );
    setRecurringBills(updatedBills);
    StorageService.saveRecurringBills(user.id, updatedBills);
  };

  const handleMarkNotificationsRead = () => {
    if (!user) return;
    const updated = notifications.map((n) => ({ ...n, isRead: true }));
    setNotifications(updated);
    StorageService.saveNotifications(user.id, updated);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col transition-colors selection:bg-emerald-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        user={user}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        language={language}
        setLanguage={setLanguage}
        theme={theme}
        setTheme={setTheme}
        currency={currency}
        setCurrency={setCurrency}
        notifications={notifications}
        onOpenQuickAdd={(type) => {
          setActiveTab('transactions');
        }}
        onOpenAiAdvisor={() => setIsAiAdvisorOpen(true)}
        onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
        onOpenSubscriptions={() => setIsSubscriptionsOpen(true)}
        onOpenSettings={(tab) => {
          setSettingsInitialTab(tab || 'general');
          setIsSettingsOpen(true);
        }}
        onOpenCurrencyConverter={() => setIsCurrencyConverterOpen(true)}
        onOpenAdmin={() => setIsAdminOpen(true)}
        onOpenAuth={() => {
          setAuthInitialMode('login');
          setIsAuthOpen(true);
        }}
        onSignOut={handleSignOut}
        onMarkNotificationsRead={handleMarkNotificationsRead}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {!user || activeTab === 'landing' ? (
          <LandingPage
            language={language}
            onGetStarted={() => {
              setAuthInitialMode('register');
              setIsAuthOpen(true);
            }}
            onSignIn={() => {
              setAuthInitialMode('login');
              setIsAuthOpen(true);
            }}
            onTryDemo={() => {
              setAuthInitialMode('login');
              setIsAuthOpen(true);
            }}
            onOpenSubscriptions={() => setIsSubscriptionsOpen(true)}
          />
        ) : activeTab === 'dashboard' ? (
          <DashboardView
            user={user}
            accounts={accounts}
            transactions={transactions}
            categories={categories}
            budgets={budgets}
            debts={debts}
            savingsGoals={savingsGoals}
            recurringBills={recurringBills}
            language={language}
            currency={currency}
            customRates={exchangeRates}
            onOpenQuickAdd={(type) => {
              setActiveTab('transactions');
            }}
            onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
            onOpenCurrencyConverter={() => setIsCurrencyConverterOpen(true)}
            onNavigateTab={setActiveTab}
          />
        ) : activeTab === 'transactions' ? (
          <TransactionsView
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            language={language}
            currency={currency}
            onAddTransaction={handleAddTransaction}
            onUpdateTransaction={handleUpdateTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenReceiptScanner={() => setIsReceiptScannerOpen(true)}
          />
        ) : activeTab === 'accounts' ? (
          <AccountsView
            accounts={accounts}
            transactions={transactions}
            language={language}
            currency={currency}
            onAddAccount={handleAddAccount}
            onUpdateAccount={handleUpdateAccount}
            onOpenTransferModal={() => {
              setActiveTab('transactions');
            }}
          />
        ) : activeTab === 'budgets' ? (
          <BudgetsView
            budgets={budgets}
            categories={categories}
            transactions={transactions}
            accounts={accounts}
            language={language}
            currency={currency}
            onAddBudget={handleAddBudget}
            onUpdateBudget={handleUpdateBudget}
            onDeleteBudget={handleDeleteBudget}
          />
        ) : activeTab === 'debts' ? (
          <DebtsView
            debts={debts}
            accounts={accounts}
            language={language}
            currency={currency}
            onAddDebt={handleAddDebt}
            onRecordDebtPayment={handleRecordDebtPayment}
            onCancelDebt={handleCancelDebt}
          />
        ) : activeTab === 'savings' ? (
          <SavingsView
            savingsGoals={savingsGoals}
            accounts={accounts}
            language={language}
            currency={currency}
            onAddGoal={handleAddGoal}
            onUpdateGoal={handleUpdateGoal}
            onDeleteGoal={handleDeleteGoal}
            onDepositWithdraw={handleDepositWithdrawGoal}
          />
        ) : activeTab === 'bills' ? (
          <BillsView
            recurringBills={recurringBills}
            accounts={accounts}
            categories={categories}
            language={language}
            currency={currency}
            onAddBill={handleAddBill}
            onUpdateBill={handleUpdateBill}
            onDeleteBill={handleDeleteBill}
            onPayBillNow={handlePayBillNow}
          />
        ) : activeTab === 'reports' ? (
          <ReportsView
            user={user}
            transactions={transactions}
            accounts={accounts}
            categories={categories}
            debts={debts}
            savingsGoals={savingsGoals}
            language={language}
            currency={currency}
            customRates={exchangeRates}
          />
        ) : null}
      </main>

      {/* Ad banner container for Free users */}
      {user && (
        <AdBanner
          userPlan={user.plan}
          language={language}
          onUpgradeClick={() => setIsSubscriptionsOpen(true)}
        />
      )}

      {/* PWA Install prompt */}
      <InstallPrompt language={language} />

      {/* Auth Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        language={language}
        onLoginSuccess={handleLoginSuccess}
        initialMode={authInitialMode}
      />

      {/* AI Advisor Modal */}
      {user && (
        <AiAdvisorModal
          isOpen={isAiAdvisorOpen}
          onClose={() => setIsAiAdvisorOpen(false)}
          user={user}
          accounts={accounts}
          transactions={transactions}
          categories={categories}
          budgets={budgets}
          debts={debts}
          savingsGoals={savingsGoals}
          recurringBills={recurringBills}
          language={language}
          currency={currency}
        />
      )}

      {/* AI Receipt Scanner Modal */}
      <ReceiptScannerModal
        isOpen={isReceiptScannerOpen}
        onClose={() => setIsReceiptScannerOpen(false)}
        categories={categories}
        accounts={accounts}
        language={language}
        currency={currency}
        onConfirmTransaction={handleAddTransaction}
      />

      {/* Subscriptions Modal */}
      {user && (
        <SubscriptionsModal
          isOpen={isSubscriptionsOpen}
          onClose={() => setIsSubscriptionsOpen(false)}
          user={user}
          language={language}
          onUpgradeSuccess={(upUser) => {
            setUser(upUser);
            StorageService.setCurrentUser(upUser);
          }}
        />
      )}

      {/* Settings & Supabase Modal */}
      {user && (
        <SettingsModal
          isOpen={isSettingsOpen}
          onClose={() => setIsSettingsOpen(false)}
          user={user}
          language={language}
          setLanguage={setLanguage}
          theme={theme}
          setTheme={setTheme}
          currency={currency}
          setCurrency={setCurrency}
          onUpdateUser={(updated) => {
            setUser(updated);
            StorageService.setCurrentUser(updated);
          }}
          initialTab={settingsInitialTab}
        />
      )}

      {/* Admin Dashboard View */}
      {user && isAdminOpen && (
        <AdminDashboardView
          user={user}
          language={language}
          onClose={() => setIsAdminOpen(false)}
        />
      )}

      {/* Real-Time Currency Converter & Rates Modal */}
      <CurrencyConverterModal
        isOpen={isCurrencyConverterOpen}
        onClose={() => setIsCurrencyConverterOpen(false)}
        language={language}
        currentCurrency={currency}
        onSelectCurrency={(newCurr) => {
          setCurrency(newCurr);
          if (user) {
            const updated = { ...user, currency: newCurr };
            setUser(updated);
            StorageService.setCurrentUser(updated);
          }
        }}
      />
    </div>
  );
}
