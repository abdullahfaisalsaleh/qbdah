/**
 * Persistent Storage & Database Service for قَبْضَة | Qabdah
 * Supports user data isolation, seed templates, and Supabase cloud sync setup.
 */

import {
  Account,
  AuditLog,
  Budget,
  Category,
  Debt,
  NotificationItem,
  RecurringBill,
  SavingsGoal,
  Transaction,
  UserProfile,
} from '../types/index.ts';

// Default standard Categories
export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  {
    id: 'cat-groceries',
    name: 'طعام ومشتريات',
    nameEn: 'Food & Groceries',
    type: 'expense',
    icon: 'Utensils',
    color: '#ef4444',
  },
  {
    id: 'cat-transport',
    name: 'مواصلات وبنزين',
    nameEn: 'Transportation',
    type: 'expense',
    icon: 'Car',
    color: '#f97316',
  },
  {
    id: 'cat-housing',
    name: 'سكن وإيجار',
    nameEn: 'Housing & Rent',
    type: 'expense',
    icon: 'Home',
    color: '#8b5cf6',
  },
  {
    id: 'cat-bills',
    name: 'فواتير وخدمات',
    nameEn: 'Bills & Utilities',
    type: 'expense',
    icon: 'Zap',
    color: '#eab308',
  },
  {
    id: 'cat-health',
    name: 'صحة وعلاج',
    nameEn: 'Health & Medical',
    type: 'expense',
    icon: 'Activity',
    color: '#06b6d4',
  },
  {
    id: 'cat-education',
    name: 'تعليم ودورات',
    nameEn: 'Education',
    type: 'expense',
    icon: 'GraduationCap',
    color: '#3b82f6',
  },
  {
    id: 'cat-shopping',
    name: 'تسوق وملابس',
    nameEn: 'Shopping',
    type: 'expense',
    icon: 'ShoppingBag',
    color: '#ec4899',
  },
  {
    id: 'cat-entertainment',
    name: 'ترفيه وخروجات',
    nameEn: 'Entertainment',
    type: 'expense',
    icon: 'Film',
    color: '#14b8a6',
  },
  {
    id: 'cat-subscriptions',
    name: 'اشتراكات وخدمات',
    nameEn: 'Subscriptions',
    type: 'expense',
    icon: 'CreditCard',
    color: '#6366f1',
  },
  {
    id: 'cat-family',
    name: 'مصاريف أسرية',
    nameEn: 'Family & Home',
    type: 'expense',
    icon: 'Users',
    color: '#a855f7',
  },
  {
    id: 'cat-expense-other',
    name: 'مصاريف أخرى',
    nameEn: 'Other Expense',
    type: 'expense',
    icon: 'MoreHorizontal',
    color: '#64748b',
  },

  // Incomes
  {
    id: 'cat-salary',
    name: 'راتب شهري',
    nameEn: 'Salary',
    type: 'income',
    icon: 'Briefcase',
    color: '#10b981',
  },
  {
    id: 'cat-freelance',
    name: 'عمل حر ومشاريع',
    nameEn: 'Freelance & Side Gig',
    type: 'income',
    icon: 'Laptop',
    color: '#059669',
  },
  {
    id: 'cat-profits',
    name: 'أرباح وتجارة',
    nameEn: 'Business Profits',
    type: 'income',
    icon: 'TrendingUp',
    color: '#047857',
  },
  {
    id: 'cat-investments',
    name: 'عوائد استثمار',
    nameEn: 'Investments & Dividends',
    type: 'income',
    icon: 'LineChart',
    color: '#0d9488',
  },
  {
    id: 'cat-gifts',
    name: 'مكافآت وهدايا',
    nameEn: 'Gifts & Bonuses',
    type: 'income',
    icon: 'Gift',
    color: '#d97706',
  },
  {
    id: 'cat-income-other',
    name: 'دخل إضافي',
    nameEn: 'Other Income',
    type: 'income',
    icon: 'PlusCircle',
    color: '#475569',
  },
];

// Key storage constants
const USERS_LIST_KEY = 'qabdah_registered_users';
const CURRENT_USER_KEY = 'qabdah_session_user';
const ADMIN_PASSCODE = 'admin2026';

export class StorageService {
  /**
   * Get all registered users from auth registry
   */
  static getUsers(): UserProfile[] {
    try {
      const data = localStorage.getItem(USERS_LIST_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save users registry
   */
  static saveUsers(users: UserProfile[]): void {
    try {
      localStorage.setItem(USERS_LIST_KEY, JSON.stringify(users));
    } catch (e) {
      console.error('Failed to save users', e);
    }
  }

  /**
   * Get current authenticated user session
   */
  static getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(CURRENT_USER_KEY);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * Set current user session
   */
  static setCurrentUser(user: UserProfile | null): void {
    try {
      if (user) {
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
        // Update user in registry if exists
        const users = this.getUsers();
        const index = users.findIndex((u) => u.id === user.id);
        if (index >= 0) {
          users[index] = user;
        } else {
          users.push(user);
        }
        this.saveUsers(users);
      } else {
        localStorage.removeItem(CURRENT_USER_KEY);
      }
    } catch (e) {
      console.error('Failed to set current user', e);
    }
  }

  /**
   * Initialize a new user's isolated workspace with starter accounts
   */
  static initializeUserData(userId: string, isDemo: boolean = false): void {
    const today = new Date();
    const curYear = today.getFullYear();
    const curMonth = today.getMonth() + 1;
    const curMonthStr = String(curMonth).padStart(2, '0');
    const datePrefix = `${curYear}-${curMonthStr}`;

    // 1. Starter Accounts
    const defaultAccounts: Account[] = [
      {
        id: `acc-cash-${userId}`,
        userId,
        name: 'كاش / نقدي',
        type: 'cash',
        currency: 'EGP',
        initialBalance: isDemo ? 3500 : 0,
        balance: isDemo ? 3500 : 0,
        color: '#10b981',
        icon: 'Wallet',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: `acc-bank-${userId}`,
        userId,
        name: 'حساب بنكي (CIB / الأهلي)',
        type: 'bank',
        currency: 'EGP',
        initialBalance: isDemo ? 28500 : 0,
        balance: isDemo ? 28500 : 0,
        color: '#3b82f6',
        icon: 'Landmark',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: `acc-wallet-${userId}`,
        userId,
        name: 'محفظة إلكترونية (InstaPay / فودافون كاش)',
        type: 'wallet',
        currency: 'EGP',
        initialBalance: isDemo ? 4200 : 0,
        balance: isDemo ? 4200 : 0,
        color: '#f97316',
        icon: 'Smartphone',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: `acc-savings-${userId}`,
        userId,
        name: 'حساب ادخار للطوارئ',
        type: 'savings',
        currency: 'EGP',
        initialBalance: isDemo ? 15000 : 0,
        balance: isDemo ? 15000 : 0,
        color: '#8b5cf6',
        icon: 'PiggyBank',
        isActive: true,
        createdAt: new Date().toISOString(),
      },
    ];
    this.saveAccounts(userId, defaultAccounts);

    // 2. Default Categories
    this.saveCategories(userId, DEFAULT_CATEGORIES);

    // If demo mode requested, add rich starter transactions and budget
    if (isDemo) {
      const demoTxs: Transaction[] = [
        {
          id: `tx-1-${userId}`,
          userId,
          type: 'income',
          amount: 25000,
          sourceAccountId: `acc-bank-${userId}`,
          categoryId: 'cat-salary',
          date: `${datePrefix}-01`,
          description: 'راتب الشهر الأساسي',
          notes: 'تحويل الحساب البنكي',
          paymentMethod: 'bank_transfer',
          createdAt: `${datePrefix}-01T08:00:00Z`,
        },
        {
          id: `tx-2-${userId}`,
          userId,
          type: 'income',
          amount: 6500,
          sourceAccountId: `acc-wallet-${userId}`,
          categoryId: 'cat-freelance',
          date: `${datePrefix}-04`,
          description: 'مشروع تصميم وبرمجة موقع',
          notes: 'استلام عبر انستاباي',
          paymentMethod: 'mobile_wallet',
          createdAt: `${datePrefix}-04T14:30:00Z`,
        },
        {
          id: `tx-3-${userId}`,
          userId,
          type: 'expense',
          amount: 5500,
          sourceAccountId: `acc-bank-${userId}`,
          categoryId: 'cat-housing',
          date: `${datePrefix}-02`,
          description: 'إيجار الشقة الشهري',
          notes: 'تحويل للمالك',
          paymentMethod: 'bank_transfer',
          createdAt: `${datePrefix}-02T10:00:00Z`,
        },
        {
          id: `tx-4-${userId}`,
          userId,
          type: 'expense',
          amount: 2800,
          sourceAccountId: `acc-cash-${userId}`,
          categoryId: 'cat-groceries',
          date: `${datePrefix}-05`,
          description: 'مشتريات السوبرماركت الأسبوعية',
          paymentMethod: 'cash',
          createdAt: `${datePrefix}-05T18:00:00Z`,
        },
        {
          id: `tx-5-${userId}`,
          userId,
          type: 'expense',
          amount: 1100,
          sourceAccountId: `acc-wallet-${userId}`,
          categoryId: 'cat-transport',
          date: `${datePrefix}-08`,
          description: 'شحن بنزين وصيانة دورية للسيارة',
          paymentMethod: 'mobile_wallet',
          createdAt: `${datePrefix}-08T11:20:00Z`,
        },
        {
          id: `tx-6-${userId}`,
          userId,
          type: 'expense',
          amount: 650,
          sourceAccountId: `acc-wallet-${userId}`,
          categoryId: 'cat-bills',
          date: `${datePrefix}-10`,
          description: 'فاتورة الإنترنت المنزلي والأرضي',
          paymentMethod: 'mobile_wallet',
          createdAt: `${datePrefix}-10T16:00:00Z`,
        },
        {
          id: `tx-7-${userId}`,
          userId,
          type: 'transfer',
          amount: 3000,
          sourceAccountId: `acc-bank-${userId}`,
          destinationAccountId: `acc-wallet-${userId}`,
          categoryId: 'cat-transfer',
          date: `${datePrefix}-11`,
          description: 'تغذية المحفظة عبر تطبيق انستاباي',
          paymentMethod: 'mobile_wallet',
          createdAt: `${datePrefix}-11T12:00:00Z`,
        },
      ];
      this.saveTransactions(userId, demoTxs);

      // Budgets
      const demoBudgets: Budget[] = [
        {
          id: `b-all-${userId}`,
          userId,
          categoryId: 'all',
          amount: 16000,
          period: 'monthly',
          month: curMonth,
          year: curYear,
          alertThresholds: [50, 80, 100],
          createdAt: new Date().toISOString(),
        },
        {
          id: `b-food-${userId}`,
          userId,
          categoryId: 'cat-groceries',
          amount: 4500,
          period: 'monthly',
          month: curMonth,
          year: curYear,
          alertThresholds: [50, 80, 100],
          createdAt: new Date().toISOString(),
        },
        {
          id: `b-trans-${userId}`,
          userId,
          categoryId: 'cat-transport',
          amount: 2000,
          period: 'monthly',
          month: curMonth,
          year: curYear,
          alertThresholds: [50, 80, 100],
          createdAt: new Date().toISOString(),
        },
      ];
      this.saveBudgets(userId, demoBudgets);

      // Debts
      const demoDebts: Debt[] = [
        {
          id: `debt-rec-1-${userId}`,
          userId,
          type: 'receivable',
          personName: 'محمود عبد الرحيم (زميل عمل)',
          originalAmount: 4000,
          remainingAmount: 2500,
          currency: 'EGP',
          startDate: `${datePrefix}-01`,
          dueDate: `${datePrefix}-28`,
          description: 'سلفة طارئة لحين موعد الراتب',
          status: 'partially_paid',
          createdAt: new Date().toISOString(),
        },
        {
          id: `debt-pay-1-${userId}`,
          userId,
          type: 'payable',
          personName: 'قسط جهاز إلكتروني (B.TECH)',
          originalAmount: 6000,
          remainingAmount: 3000,
          currency: 'EGP',
          startDate: `${datePrefix}-01`,
          dueDate: `${datePrefix}-25`,
          description: 'قسط 3 من 6',
          status: 'partially_paid',
          createdAt: new Date().toISOString(),
        },
      ];
      this.saveDebts(userId, demoDebts);

      // Savings Goal
      const demoGoals: SavingsGoal[] = [
        {
          id: `goal-1-${userId}`,
          userId,
          name: 'صندوق الطوارئ 6 أشهر',
          targetAmount: 50000,
          currentAmount: 22000,
          currency: 'EGP',
          targetDate: `${curYear + 1}-06-30`,
          priority: 'high',
          icon: 'Shield',
          color: '#10b981',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
        {
          id: `goal-2-${userId}`,
          userId,
          name: 'تحديث جهاز اللابتوب للعمل',
          targetAmount: 35000,
          currentAmount: 18000,
          currency: 'EGP',
          targetDate: `${curYear}-12-31`,
          priority: 'medium',
          icon: 'Laptop',
          color: '#3b82f6',
          status: 'active',
          createdAt: new Date().toISOString(),
        },
      ];
      this.saveSavingsGoals(userId, demoGoals);

      // Recurring Bills
      const demoBills: RecurringBill[] = [
        {
          id: `bill-1-${userId}`,
          userId,
          name: 'فاتورة الإنترنت المنزلي (WE)',
          amount: 650,
          frequency: 'monthly',
          nextDueDate: `${datePrefix}-22`,
          accountId: `acc-wallet-${userId}`,
          categoryId: 'cat-bills',
          autoRecord: false,
          reminderDays: 3,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
        {
          id: `bill-2-${userId}`,
          userId,
          name: 'اشتراك برامج العمل السحابية',
          amount: 450,
          frequency: 'monthly',
          nextDueDate: `${datePrefix}-27`,
          accountId: `acc-bank-${userId}`,
          categoryId: 'cat-subscriptions',
          autoRecord: true,
          reminderDays: 2,
          isActive: true,
          createdAt: new Date().toISOString(),
        },
      ];
      this.saveRecurringBills(userId, demoBills);

      // Initial Notifications
      const demoNotifs: NotificationItem[] = [
        {
          id: `notif-1-${userId}`,
          userId,
          title: 'مرحباً بك في قَبْضَة',
          message: 'تم تفعيل حسابك بنجاح! يمكنك الآن تسجيل معاملاتك ومتابعة تدفق أموالك.',
          type: 'system',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: `notif-2-${userId}`,
          userId,
          title: 'تذكير فاتورة الإنترنت',
          message: `فاتورة الإنترنت المنزلي (WE) بقيمة 650 ج.م تستحق خلال أيام.`,
          type: 'bill',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ];
      this.saveNotifications(userId, demoNotifs);
    } else {
      // Empty fresh start: save empty lists
      this.saveTransactions(userId, []);
      this.saveBudgets(userId, []);
      this.saveDebts(userId, []);
      this.saveSavingsGoals(userId, []);
      this.saveRecurringBills(userId, []);
      this.saveNotifications(userId, [
        {
          id: `notif-welcome-${userId}`,
          userId,
          title: 'أهلاً بك في تطبيق قَبْضَة',
          message: 'ابدأ بإضافة أول حركة دخل أو مصروف لتتبع أموالك بكل سهولة.',
          type: 'system',
          isRead: false,
          createdAt: new Date().toISOString(),
        },
      ]);
    }

    this.addAuditLog(userId, 'INIT_WORKSPACE', isDemo ? 'Workspace initialized with demo data' : 'Empty workspace created');
  }

  // --- ACCOUNTS ---
  static getAccounts(userId: string): Account[] {
    try {
      const data = localStorage.getItem(`qabdah_accounts_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveAccounts(userId: string, accounts: Account[]): void {
    try {
      localStorage.setItem(`qabdah_accounts_${userId}`, JSON.stringify(accounts));
    } catch (e) {
      console.error(e);
    }
  }

  // --- CATEGORIES ---
  static getCategories(userId: string): Category[] {
    try {
      const data = localStorage.getItem(`qabdah_categories_${userId}`);
      return data ? JSON.parse(data) : DEFAULT_CATEGORIES;
    } catch {
      return DEFAULT_CATEGORIES;
    }
  }

  static saveCategories(userId: string, categories: Category[]): void {
    try {
      localStorage.setItem(`qabdah_categories_${userId}`, JSON.stringify(categories));
    } catch (e) {
      console.error(e);
    }
  }

  // --- TRANSACTIONS ---
  static getTransactions(userId: string): Transaction[] {
    try {
      const data = localStorage.getItem(`qabdah_transactions_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveTransactions(userId: string, transactions: Transaction[]): void {
    try {
      localStorage.setItem(`qabdah_transactions_${userId}`, JSON.stringify(transactions));
    } catch (e) {
      console.error(e);
    }
  }

  // --- BUDGETS ---
  static getBudgets(userId: string): Budget[] {
    try {
      const data = localStorage.getItem(`qabdah_budgets_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveBudgets(userId: string, budgets: Budget[]): void {
    try {
      localStorage.setItem(`qabdah_budgets_${userId}`, JSON.stringify(budgets));
    } catch (e) {
      console.error(e);
    }
  }

  // --- DEBTS ---
  static getDebts(userId: string): Debt[] {
    try {
      const data = localStorage.getItem(`qabdah_debts_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveDebts(userId: string, debts: Debt[]): void {
    try {
      localStorage.setItem(`qabdah_debts_${userId}`, JSON.stringify(debts));
    } catch (e) {
      console.error(e);
    }
  }

  // --- SAVINGS GOALS ---
  static getSavingsGoals(userId: string): SavingsGoal[] {
    try {
      const data = localStorage.getItem(`qabdah_savings_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveSavingsGoals(userId: string, goals: SavingsGoal[]): void {
    try {
      localStorage.setItem(`qabdah_savings_${userId}`, JSON.stringify(goals));
    } catch (e) {
      console.error(e);
    }
  }

  // --- RECURRING BILLS ---
  static getRecurringBills(userId: string): RecurringBill[] {
    try {
      const data = localStorage.getItem(`qabdah_bills_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveRecurringBills(userId: string, bills: RecurringBill[]): void {
    try {
      localStorage.setItem(`qabdah_bills_${userId}`, JSON.stringify(bills));
    } catch (e) {
      console.error(e);
    }
  }

  // --- NOTIFICATIONS ---
  static getNotifications(userId: string): NotificationItem[] {
    try {
      const data = localStorage.getItem(`qabdah_notifications_${userId}`);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static saveNotifications(userId: string, notifications: NotificationItem[]): void {
    try {
      localStorage.setItem(`qabdah_notifications_${userId}`, JSON.stringify(notifications));
    } catch (e) {
      console.error(e);
    }
  }

  // --- AUDIT LOGS ---
  static getAuditLogs(userId?: string): AuditLog[] {
    try {
      const key = userId ? `qabdah_audit_${userId}` : 'qabdah_global_audit';
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  static addAuditLog(userId: string, action: string, details: string): void {
    try {
      const log: AuditLog = {
        id: 'log_' + Math.random().toString(36).substring(2, 9),
        userId,
        action,
        details,
        createdAt: new Date().toISOString(),
      };
      const userLogs = this.getAuditLogs(userId);
      userLogs.unshift(log);
      if (userLogs.length > 100) userLogs.pop();
      localStorage.setItem(`qabdah_audit_${userId}`, JSON.stringify(userLogs));

      // Global admin logs
      const globalLogs = this.getAuditLogs();
      globalLogs.unshift(log);
      if (globalLogs.length > 200) globalLogs.pop();
      localStorage.setItem('qabdah_global_audit', JSON.stringify(globalLogs));
    } catch (e) {
      console.error(e);
    }
  }

  // --- EXPORT & IMPORT ---
  static exportFullBackup(userId: string): string {
    const backup = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      user: this.getCurrentUser(),
      accounts: this.getAccounts(userId),
      categories: this.getCategories(userId),
      transactions: this.getTransactions(userId),
      budgets: this.getBudgets(userId),
      debts: this.getDebts(userId),
      savingsGoals: this.getSavingsGoals(userId),
      recurringBills: this.getRecurringBills(userId),
      notifications: this.getNotifications(userId),
    };
    return JSON.stringify(backup, null, 2);
  }

  static importFullBackup(userId: string, jsonString: string): boolean {
    try {
      const backup = JSON.parse(jsonString);
      if (backup.accounts) this.saveAccounts(userId, backup.accounts);
      if (backup.categories) this.saveCategories(userId, backup.categories);
      if (backup.transactions) this.saveTransactions(userId, backup.transactions);
      if (backup.budgets) this.saveBudgets(userId, backup.budgets);
      if (backup.debts) this.saveDebts(userId, backup.debts);
      if (backup.savingsGoals) this.saveSavingsGoals(userId, backup.savingsGoals);
      if (backup.recurringBills) this.saveRecurringBills(userId, backup.recurringBills);
      this.addAuditLog(userId, 'IMPORT_BACKUP', 'Successfully restored backup data');
      return true;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  static verifyAdminAccess(passcode: string): boolean {
    return passcode === ADMIN_PASSCODE;
  }
}
