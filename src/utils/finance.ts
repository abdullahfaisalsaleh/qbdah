/**
 * Pure Financial Engine & Logic for قَبْضَة | Qabdah
 * Zero DOM or side effects, thoroughly unit tested.
 */

import type {
  Account,
  Budget,
  CurrencyCode,
  CurrencyConfig,
  Debt,
  SavingsGoal,
  Transaction,
} from '../types/index.ts';

// Standard Currency Configurations with realistic base rates (base: USD = 1.0)
// Includes all 21 Arab countries plus key global currencies
export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  // الدول العربية
  EGP: {
    code: 'EGP',
    symbolAr: 'ج.م',
    symbolEn: 'EGP',
    nameAr: 'جنيه مصري',
    nameEn: 'Egyptian Pound',
    countryAr: 'مصر',
    countryEn: 'Egypt',
    flag: '🇪🇬',
    rateToUSD: 50.0,
  },
  SAR: {
    code: 'SAR',
    symbolAr: 'ر.س',
    symbolEn: 'SAR',
    nameAr: 'ريال سعودي',
    nameEn: 'Saudi Riyal',
    countryAr: 'المملكة العربية السعودية',
    countryEn: 'Saudi Arabia',
    flag: '🇸🇦',
    rateToUSD: 3.75,
  },
  AED: {
    code: 'AED',
    symbolAr: 'د.إ',
    symbolEn: 'AED',
    nameAr: 'درهم إماراتي',
    nameEn: 'UAE Dirham',
    countryAr: 'الإمارات العربية المتحدة',
    countryEn: 'United Arab Emirates',
    flag: '🇦🇪',
    rateToUSD: 3.67,
  },
  KWD: {
    code: 'KWD',
    symbolAr: 'د.ك',
    symbolEn: 'KWD',
    nameAr: 'دينار كويتي',
    nameEn: 'Kuwaiti Dinar',
    countryAr: 'الكويت',
    countryEn: 'Kuwait',
    flag: '🇰🇼',
    rateToUSD: 0.31,
  },
  QAR: {
    code: 'QAR',
    symbolAr: 'ر.ق',
    symbolEn: 'QAR',
    nameAr: 'ريال قطري',
    nameEn: 'Qatari Riyal',
    countryAr: 'قطر',
    countryEn: 'Qatar',
    flag: '🇶🇦',
    rateToUSD: 3.64,
  },
  BHD: {
    code: 'BHD',
    symbolAr: 'د.ب',
    symbolEn: 'BHD',
    nameAr: 'دينار بحريني',
    nameEn: 'Bahraini Dinar',
    countryAr: 'البحرين',
    countryEn: 'Bahrain',
    flag: '🇧🇭',
    rateToUSD: 0.376,
  },
  OMR: {
    code: 'OMR',
    symbolAr: 'ر.ع',
    symbolEn: 'OMR',
    nameAr: 'ريال عماني',
    nameEn: 'Omani Rial',
    countryAr: 'سلطنة عُمان',
    countryEn: 'Oman',
    flag: '🇴🇲',
    rateToUSD: 0.385,
  },
  JOD: {
    code: 'JOD',
    symbolAr: 'د.أ',
    symbolEn: 'JOD',
    nameAr: 'دينار أردني',
    nameEn: 'Jordanian Dinar',
    countryAr: 'الأردن',
    countryEn: 'Jordan',
    flag: '🇯🇴',
    rateToUSD: 0.709,
  },
  IQD: {
    code: 'IQD',
    symbolAr: 'د.ع',
    symbolEn: 'IQD',
    nameAr: 'دينار عراقي',
    nameEn: 'Iraqi Dinar',
    countryAr: 'العراق',
    countryEn: 'Iraq',
    flag: '🇮🇶',
    rateToUSD: 1310.0,
  },
  LBP: {
    code: 'LBP',
    symbolAr: 'ل.ل',
    symbolEn: 'LBP',
    nameAr: 'ليرة لبنانية',
    nameEn: 'Lebanese Pound',
    countryAr: 'لبنان',
    countryEn: 'Lebanon',
    flag: '🇱🇧',
    rateToUSD: 89500.0,
  },
  SYP: {
    code: 'SYP',
    symbolAr: 'ل.س',
    symbolEn: 'SYP',
    nameAr: 'ليرة سورية',
    nameEn: 'Syrian Pound',
    countryAr: 'سوريا',
    countryEn: 'Syria',
    flag: '🇸🇾',
    rateToUSD: 13000.0,
  },
  YER: {
    code: 'YER',
    symbolAr: 'ر.ي',
    symbolEn: 'YER',
    nameAr: 'ريال يمني',
    nameEn: 'Yemeni Rial',
    countryAr: 'اليمن',
    countryEn: 'Yemen',
    flag: '🇾🇪',
    rateToUSD: 250.0,
  },
  LYD: {
    code: 'LYD',
    symbolAr: 'د.ل',
    symbolEn: 'LYD',
    nameAr: 'دينار ليبي',
    nameEn: 'Libyan Dinar',
    countryAr: 'ليبيا',
    countryEn: 'Libya',
    flag: '🇱🇾',
    rateToUSD: 4.85,
  },
  TND: {
    code: 'TND',
    symbolAr: 'د.ت',
    symbolEn: 'TND',
    nameAr: 'دينار تونسي',
    nameEn: 'Tunisian Dinar',
    countryAr: 'تونس',
    countryEn: 'Tunisia',
    flag: '🇹🇳',
    rateToUSD: 3.12,
  },
  DZD: {
    code: 'DZD',
    symbolAr: 'د.ج',
    symbolEn: 'DZD',
    nameAr: 'دينار جزائري',
    nameEn: 'Algerian Dinar',
    countryAr: 'الجزائر',
    countryEn: 'Algeria',
    flag: '🇩🇿',
    rateToUSD: 134.5,
  },
  MAD: {
    code: 'MAD',
    symbolAr: 'د.م',
    symbolEn: 'MAD',
    nameAr: 'درهم مغربي',
    nameEn: 'Moroccan Dirham',
    countryAr: 'المملكة المغربية',
    countryEn: 'Morocco',
    flag: '🇲🇦',
    rateToUSD: 10.0,
  },
  SDG: {
    code: 'SDG',
    symbolAr: 'ج.س',
    symbolEn: 'SDG',
    nameAr: 'جنيه سوداني',
    nameEn: 'Sudanese Pound',
    countryAr: 'السودان',
    countryEn: 'Sudan',
    flag: '🇸🇩',
    rateToUSD: 600.0,
  },
  MRU: {
    code: 'MRU',
    symbolAr: 'أ.م',
    symbolEn: 'MRU',
    nameAr: 'أوقية موريتانية',
    nameEn: 'Mauritanian Ouguiya',
    countryAr: 'موريتانيا',
    countryEn: 'Mauritania',
    flag: '🇲🇷',
    rateToUSD: 39.8,
  },
  SOS: {
    code: 'SOS',
    symbolAr: 'ش.ص',
    symbolEn: 'SOS',
    nameAr: 'شلن صومالي',
    nameEn: 'Somali Shilling',
    countryAr: 'الصومال',
    countryEn: 'Somalia',
    flag: '🇸🇴',
    rateToUSD: 571.0,
  },
  DJF: {
    code: 'DJF',
    symbolAr: 'ف.ج',
    symbolEn: 'DJF',
    nameAr: 'فرنك جيبوتي',
    nameEn: 'Djiboutian Franc',
    countryAr: 'جيبوتي',
    countryEn: 'Djibouti',
    flag: '🇩🇯',
    rateToUSD: 177.7,
  },
  KMF: {
    code: 'KMF',
    symbolAr: 'ف.ق',
    symbolEn: 'KMF',
    nameAr: 'فرنك قمري',
    nameEn: 'Comorian Franc',
    countryAr: 'جزر القمر',
    countryEn: 'Comoros',
    flag: '🇰🇲',
    rateToUSD: 450.0,
  },
  // العملات الدولية
  USD: {
    code: 'USD',
    symbolAr: '$',
    symbolEn: '$',
    nameAr: 'دولار أمريكي',
    nameEn: 'US Dollar',
    countryAr: 'الولايات المتحدة',
    countryEn: 'United States',
    flag: '🇺🇸',
    rateToUSD: 1.0,
  },
  EUR: {
    code: 'EUR',
    symbolAr: '€',
    symbolEn: '€',
    nameAr: 'يورو',
    nameEn: 'Euro',
    countryAr: 'الاتحاد الأوروبي',
    countryEn: 'European Union',
    flag: '🇪🇺',
    rateToUSD: 0.92,
  },
  GBP: {
    code: 'GBP',
    symbolAr: '£',
    symbolEn: '£',
    nameAr: 'جنيه إسترليني',
    nameEn: 'British Pound',
    countryAr: 'المملكة المتحدة',
    countryEn: 'United Kingdom',
    flag: '🇬🇧',
    rateToUSD: 0.78,
  },
};

/**
 * Currency conversion between any two supported currencies
 */
export function convertCurrency(
  amount: number,
  from: CurrencyCode,
  to: CurrencyCode,
  customRates?: Partial<Record<CurrencyCode, number>>
): number {
  if (from === to) return amount;
  if (!amount || isNaN(amount)) return 0;

  const fromRate = customRates?.[from] ?? CURRENCIES[from]?.rateToUSD ?? 1;
  const toRate = customRates?.[to] ?? CURRENCIES[to]?.rateToUSD ?? 1;

  // Convert from origin to USD, then from USD to target
  const inUSD = amount / fromRate;
  const inTarget = inUSD * toRate;

  // Round to 2 decimal places
  return Math.round((inTarget + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate dynamic account balance based on initial balance and all transaction history.
 * RULES:
 * - Income on account: +amount
 * - Expense on account: -amount
 * - Transfer FROM account: -amount
 * - Transfer TO account: +amount (or converted amount if exchange rate applies)
 */
export function calculateAccountBalance(account: Account, transactions: Transaction[]): number {
  let balance = Number(account.initialBalance || 0);

  for (const tx of transactions) {
    const amount = Number(tx.amount || 0);
    if (tx.type === 'income' && tx.sourceAccountId === account.id) {
      balance += amount;
    } else if (tx.type === 'expense' && tx.sourceAccountId === account.id) {
      balance -= amount;
    } else if (tx.type === 'transfer') {
      if (tx.sourceAccountId === account.id) {
        balance -= amount;
      }
      if (tx.destinationAccountId === account.id) {
        // If an explicit exchange rate was applied, credit destination account properly
        const destinationAmount = tx.exchangeRate ? amount * tx.exchangeRate : amount;
        balance += destinationAmount;
      }
    }
  }

  return Math.round((balance + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate total net worth across all active accounts converted into a base currency
 */
export function calculateNetWorth(
  accounts: Account[],
  transactions: Transaction[],
  baseCurrency: CurrencyCode,
  customRates?: Partial<Record<CurrencyCode, number>>
): number {
  let total = 0;
  for (const acc of accounts) {
    if (!acc.isActive) continue;
    const currentBal = calculateAccountBalance(acc, transactions);
    const inBase = convertCurrency(currentBal, acc.currency, baseCurrency, customRates);
    total += inBase;
  }
  return Math.round((total + Number.EPSILON) * 100) / 100;
}

/**
 * Calculate monthly cash flow (Total Income, Total Expenses, Net Cash Flow).
 * CRITICAL RULE:
 * Transfers between user accounts do NOT count towards income or expense.
 */
export function calculateMonthlyCashflow(
  transactions: Transaction[],
  month: number, // 1-12
  year: number,
  baseCurrency: CurrencyCode,
  accounts: Account[],
  customRates?: Partial<Record<CurrencyCode, number>>
): {
  totalIncome: number;
  totalExpenses: number;
  netCashflow: number;
  savingsRate: number;
} {
  const accountMap = new Map(accounts.map((a) => [a.id, a]));

  let totalIncome = 0;
  let totalExpenses = 0;

  for (const tx of transactions) {
    if (!tx.date) continue;
    const [txYearStr, txMonthStr] = tx.date.split('-');
    const txYear = parseInt(txYearStr, 10);
    const txMonth = parseInt(txMonthStr, 10);

    if (txYear !== year || txMonth !== month) continue;

    const sourceAcc = accountMap.get(tx.sourceAccountId);
    const accCurrency = sourceAcc?.currency || baseCurrency;
    const amountInBase = convertCurrency(Number(tx.amount || 0), accCurrency, baseCurrency, customRates);

    if (tx.type === 'income') {
      totalIncome += amountInBase;
    } else if (tx.type === 'expense') {
      totalExpenses += amountInBase;
    }
    // 'transfer' is purposefully omitted from income and expense!
  }

  const roundedIncome = Math.round((totalIncome + Number.EPSILON) * 100) / 100;
  const roundedExpenses = Math.round((totalExpenses + Number.EPSILON) * 100) / 100;
  const netCashflow = Math.round((roundedIncome - roundedExpenses + Number.EPSILON) * 100) / 100;
  const savingsRate = roundedIncome > 0 ? Math.max(0, Math.round((netCashflow / roundedIncome) * 100)) : 0;

  return {
    totalIncome: roundedIncome,
    totalExpenses: roundedExpenses,
    netCashflow,
    savingsRate,
  };
}

/**
 * Group expenses by category for a given month & year
 */
export function calculateCategoryExpenses(
  transactions: Transaction[],
  month: number,
  year: number,
  baseCurrency: CurrencyCode,
  accounts: Account[],
  customRates?: Partial<Record<CurrencyCode, number>>
): Record<string, number> {
  const accountMap = new Map(accounts.map((a) => [a.id, a]));
  const categoryTotals: Record<string, number> = {};

  for (const tx of transactions) {
    if (tx.type !== 'expense' || !tx.date) continue;
    const [txYearStr, txMonthStr] = tx.date.split('-');
    if (parseInt(txYearStr, 10) !== year || parseInt(txMonthStr, 10) !== month) continue;

    const sourceAcc = accountMap.get(tx.sourceAccountId);
    const accCurrency = sourceAcc?.currency || baseCurrency;
    const amountInBase = convertCurrency(Number(tx.amount || 0), accCurrency, baseCurrency, customRates);

    categoryTotals[tx.categoryId] = (categoryTotals[tx.categoryId] || 0) + amountInBase;
  }

  // Round all totals
  for (const key of Object.keys(categoryTotals)) {
    categoryTotals[key] = Math.round((categoryTotals[key] + Number.EPSILON) * 100) / 100;
  }

  return categoryTotals;
}

/**
 * Calculate budget status: spent, remaining, percentage, and alert level
 */
export function calculateBudgetProgress(
  budget: Budget,
  categoryExpenses: Record<string, number>
): {
  spent: number;
  remaining: number;
  percentage: number;
  status: 'normal' | 'warning' | 'danger' | 'exceeded';
} {
  let spent = 0;
  if (budget.categoryId === 'all') {
    spent = Object.values(categoryExpenses).reduce((sum, val) => sum + val, 0);
  } else {
    spent = categoryExpenses[budget.categoryId] || 0;
  }

  const budgetAmount = Number(budget.amount || 0);
  const remaining = Math.max(0, budgetAmount - spent);
  const percentage = budgetAmount > 0 ? Math.round((spent / budgetAmount) * 100) : 0;

  let status: 'normal' | 'warning' | 'danger' | 'exceeded' = 'normal';
  if (percentage >= 100) {
    status = 'exceeded';
  } else if (percentage >= 80) {
    status = 'danger';
  } else if (percentage >= 50) {
    status = 'warning';
  }

  return {
    spent: Math.round((spent + Number.EPSILON) * 100) / 100,
    remaining: Math.round((remaining + Number.EPSILON) * 100) / 100,
    percentage,
    status,
  };
}

/**
 * Summary for debts: total owed to user (receivable) vs total owed by user (payable)
 */
export function calculateDebtSummary(
  debts: Debt[],
  baseCurrency: CurrencyCode,
  customRates?: Partial<Record<CurrencyCode, number>>
): {
  totalReceivable: number;
  totalPayable: number;
  openCount: number;
  overdueCount: number;
} {
  let totalReceivable = 0;
  let totalPayable = 0;
  let openCount = 0;
  let overdueCount = 0;

  const todayStr = new Date().toISOString().slice(0, 10);

  for (const debt of debts) {
    if (debt.status === 'paid' || debt.status === 'cancelled') continue;

    const remainingInBase = convertCurrency(
      Number(debt.remainingAmount || 0),
      debt.currency,
      baseCurrency,
      customRates
    );

    if (debt.type === 'receivable') {
      totalReceivable += remainingInBase;
    } else {
      totalPayable += remainingInBase;
    }

    openCount++;
    if (debt.dueDate && debt.dueDate < todayStr) {
      overdueCount++;
    }
  }

  return {
    totalReceivable: Math.round((totalReceivable + Number.EPSILON) * 100) / 100,
    totalPayable: Math.round((totalPayable + Number.EPSILON) * 100) / 100,
    openCount,
    overdueCount,
  };
}

/**
 * Savings goal required daily and monthly rate to reach target by targetDate
 */
export function calculateSavingsPlan(
  goal: SavingsGoal,
  referenceDate: Date = new Date()
): {
  remaining: number;
  percentage: number;
  daysRemaining: number;
  dailyRequired: number;
  monthlyRequired: number;
  isOverdue: boolean;
} {
  const target = Number(goal.targetAmount || 0);
  const current = Number(goal.currentAmount || 0);
  const remaining = Math.max(0, target - current);
  const percentage = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 100;

  const targetDateObj = new Date(goal.targetDate);
  const diffTime = targetDateObj.getTime() - referenceDate.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  const isOverdue = diffTime < 0 && remaining > 0;

  const monthsRemaining = Math.max(1, daysRemaining / 30.4);

  const dailyRequired = daysRemaining > 0 ? Math.round((remaining / daysRemaining) * 100) / 100 : remaining;
  const monthlyRequired = Math.round((remaining / monthsRemaining) * 100) / 100;

  return {
    remaining: Math.round((remaining + Number.EPSILON) * 100) / 100,
    percentage,
    daysRemaining,
    dailyRequired,
    monthlyRequired,
    isOverdue,
  };
}

/**
 * Format currency amount with appropriate symbols and separators
 */
export function formatMoney(
  amount: number,
  currency: CurrencyCode = 'EGP',
  language: 'ar' | 'en' = 'ar'
): string {
  const safeAmount = isNaN(amount) ? 0 : amount;
  const formatted = new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(safeAmount);

  const cfg = CURRENCIES[currency] || CURRENCIES.EGP;
  const symbol = language === 'ar' ? cfg.symbolAr : cfg.symbolEn;

  return language === 'ar' ? `${formatted} ${symbol}` : `${symbol}${formatted}`;
}
