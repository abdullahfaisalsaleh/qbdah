/**
 * Types & Domain Interfaces for قَبْضَة | Qabdah
 */

export type CurrencyCode =
  // جميع الدول العربية (21 دولة)
  | 'EGP' // مصر
  | 'SAR' // السعودية
  | 'AED' // الإمارات
  | 'KWD' // الكويت
  | 'QAR' // قطر
  | 'BHD' // البحرين
  | 'OMR' // عُمان
  | 'JOD' // الأردن
  | 'IQD' // العراق
  | 'LBP' // لبنان
  | 'SYP' // سوريا
  | 'YER' // اليمن
  | 'LYD' // ليبيا
  | 'TND' // تونس
  | 'DZD' // الجزائر
  | 'MAD' // المغرب
  | 'SDG' // السودان
  | 'MRU' // موريتانيا
  | 'SOS' // الصومال
  | 'DJF' // جيبوتي
  | 'KMF' // جزر القمر
  // العملات الدولية الرئيسية
  | 'USD' // الدولار الأمريكي
  | 'EUR' // اليورو الأوروبي
  | 'GBP'; // الجنيه الإسترليني

export interface CurrencyConfig {
  code: CurrencyCode;
  symbolAr: string;
  symbolEn: string;
  nameAr: string;
  nameEn: string;
  countryAr?: string;
  countryEn?: string;
  flag?: string;
  rateToUSD: number; // reference exchange rate
}

export type Language = 'ar' | 'en';
export type Theme = 'light' | 'dark';
export type UserRole = 'user' | 'admin';
export type PlanTier = 'free' | 'premium';
export type SubscriptionStatus = 'active' | 'cancelled' | 'expired' | 'grace_period';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  currency: CurrencyCode;
  language: Language;
  theme: Theme;
  plan: PlanTier;
  role: UserRole;
  subscriptionEndDate?: string;
  createdAt: string;
}

export type AccountType = 'cash' | 'bank' | 'wallet' | 'savings' | 'custom';

export interface Account {
  id: string;
  userId: string;
  name: string;
  type: AccountType;
  currency: CurrencyCode;
  initialBalance: number;
  balance: number;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense' | 'transfer';
export type PaymentMethod = 'cash' | 'card' | 'bank_transfer' | 'mobile_wallet' | 'other';

export interface Category {
  id: string;
  userId?: string; // undefined if system default
  name: string;
  nameEn: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isCustom?: boolean;
}

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  sourceAccountId: string; // From Account (or Account for regular expense/income)
  destinationAccountId?: string; // For transfers
  categoryId: string;
  date: string; // ISO date YYYY-MM-DD
  time?: string; // HH:mm
  description: string;
  notes?: string;
  receiptUrl?: string;
  paymentMethod: PaymentMethod;
  isRecurring?: boolean;
  recurringBillId?: string;
  exchangeRate?: number; // If transfer across currencies
  createdAt: string;
}

export interface Budget {
  id: string;
  userId: string;
  categoryId: string; // 'all' for overall budget, or specific categoryId
  amount: number;
  period: 'monthly';
  month: number; // 1-12
  year: number;
  alertThresholds: number[]; // e.g. [50, 80, 100]
  createdAt: string;
}

export type DebtType = 'receivable' | 'payable'; // receivable = فلوس ليا عند الناس, payable = ديون عليا للناس
export type DebtStatus = 'open' | 'partially_paid' | 'paid' | 'cancelled';

export interface Debt {
  id: string;
  userId: string;
  type: DebtType;
  personName: string;
  originalAmount: number;
  remainingAmount: number;
  currency: CurrencyCode;
  startDate: string;
  dueDate?: string;
  description?: string;
  status: DebtStatus;
  createdAt: string;
}

export interface DebtPayment {
  id: string;
  debtId: string;
  userId: string;
  amount: number;
  date: string;
  accountId: string;
  notes?: string;
  createdAt: string;
}

export interface SavingsGoal {
  id: string;
  userId: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  currency: CurrencyCode;
  targetDate: string;
  priority: 'low' | 'medium' | 'high';
  icon: string;
  color: string;
  status: 'active' | 'completed' | 'paused';
  createdAt: string;
}

export interface SavingsTransaction {
  id: string;
  goalId: string;
  userId: string;
  type: 'deposit' | 'withdraw';
  amount: number;
  accountId?: string;
  date: string;
  notes?: string;
  createdAt: string;
}

export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface RecurringBill {
  id: string;
  userId: string;
  name: string;
  amount: number;
  frequency: RecurringFrequency;
  nextDueDate: string;
  accountId: string;
  categoryId: string;
  autoRecord: boolean;
  reminderDays: number;
  isActive: boolean;
  lastProcessedDate?: string;
  createdAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'bill' | 'debt' | 'budget' | 'savings' | 'system';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: PlanTier;
  status: SubscriptionStatus;
  billingCycle: 'monthly' | 'yearly';
  startDate: string;
  endDate: string;
  amount: number;
  currency: CurrencyCode;
  paymentMethod: string;
}

export interface AuditLog {
  id: string;
  userId: string;
  action: string;
  details: string;
  ip?: string;
  createdAt: string;
}
