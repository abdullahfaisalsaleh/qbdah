import test from 'node:test';
import assert from 'node:assert/strict';
import {
  convertCurrency,
  calculateAccountBalance,
  calculateMonthlyCashflow,
  calculateBudgetProgress,
  calculateDebtSummary,
  calculateSavingsPlan,
  formatMoney,
} from './finance.ts';
import type { Account, Budget, Debt, SavingsGoal, Transaction } from '../types/index.ts';

test('Currency conversion handles identity and cross-rates', () => {
  assert.equal(convertCurrency(100, 'USD', 'USD'), 100);
  assert.equal(convertCurrency(100, 'USD', 'EGP'), 5000); // 100 * 50
  assert.equal(convertCurrency(5000, 'EGP', 'USD'), 100);
});

test('Currency conversion applies custom live exchange rates', () => {
  const liveRates = {
    USD: 1.0,
    EGP: 50.5,
    EUR: 0.95,
    SAR: 3.75,
  };
  assert.equal(convertCurrency(100, 'USD', 'EGP', liveRates), 5050);
  assert.equal(convertCurrency(100, 'USD', 'EUR', liveRates), 95);
  assert.equal(convertCurrency(375, 'SAR', 'USD', liveRates), 100);
});

test('Account balance reflects income, expenses, and inter-account transfers correctly', () => {
  const accCash: Account = {
    id: 'acc-1',
    userId: 'u1',
    name: 'Cash',
    type: 'cash',
    currency: 'EGP',
    initialBalance: 1000,
    balance: 1000,
    color: '#10b981',
    icon: 'wallet',
    isActive: true,
    createdAt: '2026-01-01',
  };

  const accBank: Account = {
    id: 'acc-2',
    userId: 'u1',
    name: 'Bank',
    type: 'bank',
    currency: 'EGP',
    initialBalance: 5000,
    balance: 5000,
    color: '#3b82f6',
    icon: 'landmark',
    isActive: true,
    createdAt: '2026-01-01',
  };

  const txs: Transaction[] = [
    {
      id: 'tx-1',
      userId: 'u1',
      type: 'income',
      amount: 2000,
      sourceAccountId: 'acc-1',
      categoryId: 'cat-salary',
      date: '2026-10-01',
      description: 'Freelance payout',
      paymentMethod: 'cash',
      createdAt: '2026-10-01',
    },
    {
      id: 'tx-2',
      userId: 'u1',
      type: 'expense',
      amount: 500,
      sourceAccountId: 'acc-1',
      categoryId: 'cat-groceries',
      date: '2026-10-02',
      description: 'Market groceries',
      paymentMethod: 'cash',
      createdAt: '2026-10-02',
    },
    {
      id: 'tx-3',
      userId: 'u1',
      type: 'transfer',
      amount: 1000,
      sourceAccountId: 'acc-1',
      destinationAccountId: 'acc-2',
      categoryId: 'cat-transfer',
      date: '2026-10-03',
      description: 'Deposit to bank',
      paymentMethod: 'bank_transfer',
      createdAt: '2026-10-03',
    },
  ];

  // Cash: 1000 initial + 2000 income - 500 expense - 1000 transfer out = 1500
  const cashBal = calculateAccountBalance(accCash, txs);
  assert.equal(cashBal, 1500);

  // Bank: 5000 initial + 1000 transfer in = 6000
  const bankBal = calculateAccountBalance(accBank, txs);
  assert.equal(bankBal, 6000);
});

test('Cashflow calculation ignores inter-account transfers completely', () => {
  const accounts: Account[] = [
    {
      id: 'acc-1',
      userId: 'u1',
      name: 'Cash',
      type: 'cash',
      currency: 'EGP',
      initialBalance: 1000,
      balance: 1000,
      color: '#10b981',
      icon: 'wallet',
      isActive: true,
      createdAt: '2026-01-01',
    },
    {
      id: 'acc-2',
      userId: 'u1',
      name: 'Bank',
      type: 'bank',
      currency: 'EGP',
      initialBalance: 5000,
      balance: 5000,
      color: '#3b82f6',
      icon: 'landmark',
      isActive: true,
      createdAt: '2026-01-01',
    },
  ];

  const txs: Transaction[] = [
    {
      id: 'tx-1',
      userId: 'u1',
      type: 'income',
      amount: 10000,
      sourceAccountId: 'acc-1',
      categoryId: 'cat-salary',
      date: '2026-10-05',
      description: 'Monthly salary',
      paymentMethod: 'bank_transfer',
      createdAt: '2026-10-05',
    },
    {
      id: 'tx-2',
      userId: 'u1',
      type: 'expense',
      amount: 3000,
      sourceAccountId: 'acc-1',
      categoryId: 'cat-rent',
      date: '2026-10-06',
      description: 'Rent',
      paymentMethod: 'cash',
      createdAt: '2026-10-06',
    },
    {
      id: 'tx-3',
      userId: 'u1',
      type: 'transfer',
      amount: 4000,
      sourceAccountId: 'acc-1',
      destinationAccountId: 'acc-2',
      categoryId: 'cat-transfer',
      date: '2026-10-07',
      description: 'Internal transfer',
      paymentMethod: 'bank_transfer',
      createdAt: '2026-10-07',
    },
  ];

  const flow = calculateMonthlyCashflow(txs, 10, 2026, 'EGP', accounts);

  // Income should strictly be 10000, not affected by the 4000 transfer
  assert.equal(flow.totalIncome, 10000);
  // Expense should strictly be 3000, not affected by the 4000 transfer
  assert.equal(flow.totalExpenses, 3000);
  // Net cashflow: 10000 - 3000 = 7000
  assert.equal(flow.netCashflow, 7000);
  // Savings rate: (7000 / 10000) * 100 = 70%
  assert.equal(flow.savingsRate, 70);
});

test('Budget progress correctly determines threshold statuses', () => {
  const budget: Budget = {
    id: 'b-1',
    userId: 'u1',
    categoryId: 'cat-food',
    amount: 1000,
    period: 'monthly',
    month: 10,
    year: 2026,
    alertThresholds: [50, 80, 100],
    createdAt: '2026-10-01',
  };

  const res1 = calculateBudgetProgress(budget, { 'cat-food': 300 });
  assert.equal(res1.status, 'normal');
  assert.equal(res1.percentage, 30);
  assert.equal(res1.remaining, 700);

  const res2 = calculateBudgetProgress(budget, { 'cat-food': 600 });
  assert.equal(res2.status, 'warning'); // >= 50%

  const res3 = calculateBudgetProgress(budget, { 'cat-food': 850 });
  assert.equal(res3.status, 'danger'); // >= 80%

  const res4 = calculateBudgetProgress(budget, { 'cat-food': 1100 });
  assert.equal(res4.status, 'exceeded'); // >= 100%
  assert.equal(res4.remaining, 0);
});

test('Debt summary splits receivables and payables and tracks overdue', () => {
  const debts: Debt[] = [
    {
      id: 'd-1',
      userId: 'u1',
      type: 'receivable',
      personName: 'Ahmed',
      originalAmount: 1500,
      remainingAmount: 1000,
      currency: 'EGP',
      startDate: '2026-09-01',
      dueDate: '2026-10-01', // Overdue
      status: 'partially_paid',
      createdAt: '2026-09-01',
    },
    {
      id: 'd-2',
      userId: 'u1',
      type: 'payable',
      personName: 'Store',
      originalAmount: 2000,
      remainingAmount: 2000,
      currency: 'EGP',
      startDate: '2026-10-01',
      dueDate: '2026-11-01',
      status: 'open',
      createdAt: '2026-10-01',
    },
  ];

  const summary = calculateDebtSummary(debts, 'EGP');
  assert.equal(summary.totalReceivable, 1000);
  assert.equal(summary.totalPayable, 2000);
  assert.equal(summary.openCount, 2);
  assert.equal(summary.overdueCount, 1);
});

test('Savings goal calculates daily and monthly pace', () => {
  const goal: SavingsGoal = {
    id: 'sg-1',
    userId: 'u1',
    name: 'New Laptop',
    targetAmount: 30000,
    currentAmount: 15000,
    currency: 'EGP',
    targetDate: '2026-11-15',
    priority: 'high',
    icon: 'laptop',
    color: '#059669',
    status: 'active',
    createdAt: '2026-09-01',
  };

  const fixedDate = new Date('2026-10-16T00:00:00Z');
  const plan = calculateSavingsPlan(goal, fixedDate);

  assert.equal(plan.remaining, 15000);
  assert.equal(plan.percentage, 50);
  assert.equal(plan.isOverdue, false);
  assert.ok(plan.daysRemaining > 0);
  assert.ok(plan.dailyRequired > 0);
});

test('Formatting money correctly prints currency symbols in Arabic and English', () => {
  const arStr = formatMoney(1250, 'EGP', 'ar');
  assert.ok(arStr.includes('ج.م'));
  const enStr = formatMoney(1250, 'USD', 'en');
  assert.ok(enStr.includes('$'));
});

test('All 21 Arab nations currencies are defined with valid configs and positive exchange rates', () => {
  const arabCodes = [
    'EGP', 'SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD',
    'IQD', 'LBP', 'SYP', 'YER', 'LYD', 'TND', 'DZD', 'MAD',
    'SDG', 'MRU', 'SOS', 'DJF', 'KMF',
  ] as const;

  assert.equal(arabCodes.length, 21);

  for (const code of arabCodes) {
    const converted = convertCurrency(100, 'USD', code);
    assert.ok(converted > 0, `Conversion for ${code} must be greater than 0`);
  }

  // Cross conversion between Arab currencies
  const sarToAed = convertCurrency(100, 'SAR', 'AED');
  assert.ok(sarToAed > 0);
  const kwdToJod = convertCurrency(10, 'KWD', 'JOD');
  assert.ok(kwdToJod > 0);
});
