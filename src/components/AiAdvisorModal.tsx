import React, { useState } from 'react';
import {
  Bot,
  Send,
  X,
  Sparkles,
  HelpCircle,
  Lightbulb,
  ShieldCheck,
  Loader2,
  Check,
} from 'lucide-react';
import {
  Account,
  Budget,
  Category,
  CurrencyCode,
  Debt,
  Language,
  RecurringBill,
  SavingsGoal,
  Transaction,
  UserProfile,
} from '../types/index.ts';
import {
  calculateCategoryExpenses,
  calculateDebtSummary,
  calculateMonthlyCashflow,
  calculateNetWorth,
  formatMoney,
} from '../utils/finance.ts';

interface AiAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  accounts: Account[];
  transactions: Transaction[];
  categories: Category[];
  budgets: Budget[];
  debts: Debt[];
  savingsGoals: SavingsGoal[];
  recurringBills: RecurringBill[];
  language: Language;
  currency: CurrencyCode;
}

interface Message {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
}

export const AiAdvisorModal: React.FC<AiAdvisorModalProps> = ({
  isOpen,
  onClose,
  user,
  accounts,
  transactions,
  categories,
  budgets,
  debts,
  savingsGoals,
  recurringBills,
  language,
  currency,
}) => {
  const isAr = language === 'ar';

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'msg_welcome',
      sender: 'assistant',
      text: isAr
        ? `أهلاً بك يا ${user.name}! أنا مستشارك المالي الذكي في قَبْضَة. اطلعتُ على بياناتك وسجلاتك المالية، كيف أساعدك اليوم في إدارة مصاريفك أو ميزانيتك؟`
        : `Hello ${user.name}! I am your personal financial advisor in Qabdah. How can I assist you with your budget, savings, or spending today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);

  if (!isOpen) return null;

  const today = new Date();
  const curMonth = today.getMonth() + 1;
  const curYear = today.getFullYear();

  // Suggested prompt ideas
  const suggestedQueries = isAr
    ? [
        'كم إجمالي ما صرفته هذا الشهر؟',
        'ما هي أكبر 3 بنود للمصروفات في سجلي؟',
        'كم يتبقى لي من الميزانية العامة؟',
        'ما هي الفواتير القادمة قريباً؟',
        'كيف يمكنني توفير 20% الشهر القادم؟',
      ]
    : [
        'How much did I spend this month?',
        'What are my top 3 expense categories?',
        'How much is remaining in my budget?',
        'What upcoming bills are due soon?',
        'How can I save 20% next month?',
      ];

  const handleSendMessage = async (queryText?: string) => {
    const textToSend = queryText || inputQuery;
    if (!textToSend.trim() || loading) return;

    const userMsg: Message = {
      id: 'u_' + Date.now(),
      sender: 'user',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    // Compute live user financial context to pass securely to the server endpoint
    const netWorth = calculateNetWorth(accounts, transactions, currency);
    const cashflow = calculateMonthlyCashflow(transactions, curMonth, curYear, currency, accounts);
    const catExpenses = calculateCategoryExpenses(transactions, curMonth, curYear, currency, accounts);
    const debtSum = calculateDebtSummary(debts, currency);
    const activeBudget = budgets.find((b) => b.categoryId === 'all');

    const financialContext = {
      userCurrency: currency,
      totalNetWorth: netWorth,
      currentMonthIncome: cashflow.totalIncome,
      currentMonthExpenses: cashflow.totalExpenses,
      currentMonthNetSavings: cashflow.netCashflow,
      savingsRatePercent: cashflow.savingsRate,
      overallBudgetAmount: activeBudget?.amount || 'غير محددة',
      budgetSpent: cashflow.totalExpenses,
      totalDebtsReceivable: debtSum.totalReceivable,
      totalDebtsPayable: debtSum.totalPayable,
      expensesByCategory: catExpenses,
      activeSavingsGoals: savingsGoals.map((g) => ({
        name: g.name,
        target: g.targetAmount,
        saved: g.currentAmount,
      })),
      upcomingBills: recurringBills.filter((b) => b.isActive).map((b) => ({
        name: b.name,
        amount: b.amount,
        dueDate: b.nextDueDate,
      })),
    };

    try {
      const response = await fetch('/api/ai/advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: textToSend.trim(),
          financialContext,
          language,
        }),
      });

      const data = await response.json();
      const botMsg: Message = {
        id: 'bot_' + Date.now(),
        sender: 'assistant',
        text: data.answer || (isAr ? 'عذراً، حدث خطأ أثناء المعالجة.' : 'Sorry, an error occurred.'),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'err_' + Date.now(),
          sender: 'assistant',
          text: isAr
            ? 'تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
            : 'Connection error. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full h-[600px] max-h-[90vh] shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden relative">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-900 to-teal-900 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20">
              <Bot className="w-6 h-6 text-emerald-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-sm">
                  {isAr ? 'مستشار قَبْضَة المالي الذكي' : 'Qabdah AI Financial Advisor'}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 font-medium">
                  Gemini 3.8 Flash
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80">
                {isAr ? 'تحليل مباشر لبياناتك المالية الخاصة' : 'Real-time analysis of your financial ledger'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label={isAr ? 'إغلاق' : 'Close'}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {messages.map((m) => {
            const isBot = m.sender === 'assistant';
            return (
              <div
                key={m.id}
                className={`flex gap-2.5 ${isBot ? 'justify-start' : 'justify-end'}`}
              >
                {isBot && (
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed whitespace-pre-wrap ${
                    isBot
                      ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-100'
                      : 'bg-emerald-600 text-white'
                  }`}
                >
                  <p>{m.text}</p>
                  <span
                    className={`text-[9px] block text-end mt-1 ${
                      isBot ? 'text-slate-400' : 'text-emerald-200'
                    }`}
                  >
                    {m.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {loading && (
            <div className="flex items-center gap-2 text-slate-400 text-xs py-2">
              <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
              <span>{isAr ? 'المستشار الذكي يحلل أرقامك المالية...' : 'Advisor is analyzing your finances...'}</span>
            </div>
          )}
        </div>

        {/* Suggested Queries Chips */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 border-t border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none flex items-center gap-2 shrink-0">
          <Lightbulb className="w-3.5 h-3.5 text-amber-500 shrink-0 ms-1" />
          {suggestedQueries.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(q)}
              className="px-2.5 py-1 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 hover:text-emerald-600 text-[11px] whitespace-nowrap transition cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center gap-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={
              isAr
                ? 'اطرح سؤالاً على المستشار المالي (مثال: كم أنفقت على المواصلات؟)...'
                : 'Ask a question about your finances...'
            }
            className="flex-1 px-4 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button
            onClick={() => handleSendMessage()}
            disabled={!inputQuery.trim() || loading}
            aria-label={isAr ? 'إرسال' : 'Send'}
            className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-40 transition shadow-xs cursor-pointer"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
