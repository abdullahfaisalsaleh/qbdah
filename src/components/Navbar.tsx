import React, { useState } from 'react';
import {
  Wallet,
  LayoutDashboard,
  ReceiptText,
  CreditCard,
  PieChart,
  HandCoins,
  PiggyBank,
  CalendarDays,
  FileSpreadsheet,
  Bot,
  ScanLine,
  Bell,
  Sun,
  Moon,
  Globe,
  Plus,
  Crown,
  Settings,
  LogOut,
  ShieldCheck,
  ChevronDown,
  Coins,
  Mail,
} from 'lucide-react';
import { CurrencyCode, Language, NotificationItem, PlanTier, Theme, UserProfile } from '../types/index.ts';
import { CURRENCIES } from '../utils/finance.ts';

interface NavbarProps {
  user: UserProfile | null;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  currency: CurrencyCode;
  setCurrency: (curr: CurrencyCode) => void;
  notifications: NotificationItem[];
  onOpenQuickAdd: (type: 'expense' | 'income' | 'transfer') => void;
  onOpenAiAdvisor: () => void;
  onOpenReceiptScanner: () => void;
  onOpenSubscriptions: () => void;
  onOpenSettings: (initialTab?: string) => void;
  onOpenCurrencyConverter: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  onSignOut: () => void;
  onMarkNotificationsRead: () => void;
  onOpenAbout?: () => void;
  onOpenContact?: () => void;
  onOpenPrivacy?: () => void;
  onOpenTerms?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  activeTab,
  setActiveTab,
  language,
  setLanguage,
  theme,
  setTheme,
  currency,
  setCurrency,
  notifications,
  onOpenQuickAdd,
  onOpenAiAdvisor,
  onOpenReceiptScanner,
  onOpenSubscriptions,
  onOpenSettings,
  onOpenCurrencyConverter,
  onOpenAdmin,
  onOpenAuth,
  onSignOut,
  onMarkNotificationsRead,
  onOpenAbout,
  onOpenContact,
  onOpenPrivacy,
  onOpenTerms,
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showQuickAddMenu, setShowQuickAddMenu] = useState(false);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const isAr = language === 'ar';

  const navItems = [
    { id: 'dashboard', label: isAr ? 'لوحة التحكم' : 'Dashboard', icon: LayoutDashboard },
    { id: 'transactions', label: isAr ? 'المعاملات' : 'Transactions', icon: ReceiptText },
    { id: 'accounts', label: isAr ? 'الحسابات' : 'Accounts', icon: CreditCard },
    { id: 'budgets', label: isAr ? 'الميزانيات' : 'Budgets', icon: PieChart },
    { id: 'debts', label: isAr ? 'الديون والسلف' : 'Debts & Loans', icon: HandCoins },
    { id: 'savings', label: isAr ? 'الادخار' : 'Savings', icon: PiggyBank },
    { id: 'bills', label: isAr ? 'الفواتير' : 'Recurring Bills', icon: CalendarDays },
    { id: 'reports', label: isAr ? 'التقارير' : 'Reports', icon: FileSpreadsheet },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand & Slogan */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab(user ? 'dashboard' : 'landing')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-800 via-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 ring-2 ring-emerald-400/30">
              <span className="font-black text-xl font-serif">ق</span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-800 to-teal-600 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent">
                  {isAr ? 'قَبْضَة' : 'Qabdah'}
                </span>
                {user?.plan === 'premium' && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-300 dark:border-amber-700">
                    <Crown className="w-3 h-3 text-amber-500" />
                    PREMIUM
                  </span>
                )}
              </div>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
                {isAr ? 'فلوسك في إيدك، ومستقبلك في حسابك' : 'Your money in hand, your future in sight'}
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links (>= xl) */}
          {user && (
            <nav className="hidden xl:flex items-center gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                      isActive
                        ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
                    }`}
                  >
                    <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-emerald-600 dark:text-emerald-400' : ''}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          )}

          {/* Action Tools & User Profile */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {user ? (
              <>
                {/* AI Advisor Button */}
                <button
                  onClick={onOpenAiAdvisor}
                  aria-label={isAr ? 'المساعد المالي الذكي' : 'AI Financial Advisor'}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-xs hover:from-emerald-700 hover:to-teal-700 transition"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>{isAr ? 'المستشار الذكي' : 'AI Advisor'}</span>
                </button>

                {/* Scan Receipt Button */}
                <button
                  onClick={onOpenReceiptScanner}
                  aria-label={isAr ? 'مسح فاتورة' : 'Scan Receipt'}
                  className="p-2 rounded-lg text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  title={isAr ? 'مسح فاتورة ذكي (OCR)' : 'Scan Receipt (OCR)'}
                >
                  <ScanLine className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </button>

                {/* Quick Add Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowQuickAddMenu(!showQuickAddMenu)}
                    aria-label={isAr ? 'إضافة معاملة سريعة' : 'Quick Add Transaction'}
                    className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">{isAr ? 'إضافة' : 'Add'}</span>
                  </button>

                  {showQuickAddMenu && (
                    <div className="absolute top-full mt-2 end-0 w-44 rounded-xl bg-white dark:bg-slate-800 shadow-xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs">
                      <button
                        onClick={() => {
                          onOpenQuickAdd('expense');
                          setShowQuickAddMenu(false);
                        }}
                        className="w-full text-start px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-medium"
                      >
                        <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                        {isAr ? 'إضافة مصروف جديد' : 'New Expense'}
                      </button>
                      <button
                        onClick={() => {
                          onOpenQuickAdd('income');
                          setShowQuickAddMenu(false);
                        }}
                        className="w-full text-start px-3 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-medium"
                      >
                        <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                        {isAr ? 'إضافة دخل جديد' : 'New Income'}
                      </button>
                      <button
                        onClick={() => {
                          onOpenQuickAdd('transfer');
                          setShowQuickAddMenu(false);
                        }}
                        className="w-full text-start px-3 py-2 text-blue-600 dark:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 font-medium"
                      >
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        {isAr ? 'تحويل بين الحسابات' : 'Account Transfer'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Notifications Bell */}
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowNotifications(!showNotifications);
                      if (!showNotifications && unreadCount > 0) {
                        onMarkNotificationsRead();
                      }
                    }}
                    aria-label={isAr ? 'الإشعارات' : 'Notifications'}
                    className="relative p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 end-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute top-full mt-2 end-0 w-72 sm:w-80 rounded-xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 p-3 z-50 text-xs">
                      <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-700 font-bold">
                        <span>{isAr ? 'مركز الإشعارات' : 'Notifications'}</span>
                        <span className="text-[10px] text-slate-400">{notifications.length} {isAr ? 'تنبيه' : 'alerts'}</span>
                      </div>
                      <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-700/60 mt-2">
                        {notifications.length === 0 ? (
                          <p className="py-6 text-center text-slate-400">
                            {isAr ? 'لا توجد إشعارات حالياً' : 'No notifications'}
                          </p>
                        ) : (
                          notifications.map((notif) => (
                            <div key={notif.id} className="py-2.5">
                              <p className="font-semibold text-slate-800 dark:text-slate-100">{notif.title}</p>
                              <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <button
                onClick={onOpenAuth}
                className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
              >
                {isAr ? 'تسجيل الدخول' : 'Sign In'}
              </button>
            )}

            {/* Currency Selector & Live Converter */}
            <div className="flex items-center gap-1">
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
                aria-label={isAr ? 'العملة الأساسية' : 'Base Currency'}
                className="bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold px-2 py-1.5 rounded-lg border-0 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {Object.keys(CURRENCIES).map((c) => {
                  const cfg = CURRENCIES[c as CurrencyCode];
                  return (
                    <option key={c} value={c}>
                      {cfg.flag} {c} ({isAr ? cfg.symbolAr : cfg.symbolEn})
                    </option>
                  );
                })}
              </select>
              <button
                type="button"
                onClick={onOpenCurrencyConverter}
                title={isAr ? 'محول العملات وأسعار الصرف الحية' : 'Live Currency Converter'}
                className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/60 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 transition border border-emerald-200 dark:border-emerald-800 flex items-center gap-1 text-[11px] font-bold"
              >
                <Coins className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span className="hidden md:inline">{isAr ? 'تحويل' : 'Convert'}</span>
              </button>
            </div>

            {/* Language Toggle */}
            <button
              onClick={() => setLanguage(language === 'ar' ? 'en' : 'ar')}
              aria-label={isAr ? 'تغيير اللغة' : 'Change Language'}
              className="p-1.5 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition text-xs font-bold flex items-center gap-1"
              title={isAr ? 'التبديل إلى الإنجليزية' : 'Switch to Arabic'}
            >
              <Globe className="w-3.5 h-3.5" />
              <span>{language === 'ar' ? 'EN' : 'عربي'}</span>
            </button>

            {/* Theme Toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              aria-label={isAr ? 'تغيير المظهر' : 'Toggle Theme'}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              title={theme === 'dark' ? 'الوضع الفاتح' : 'الوضع الليلي'}
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
            </button>

            {/* User Profile Menu */}
            {user && (
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  aria-label={isAr ? 'قائمة المستخدم' : 'User Menu'}
                  className="flex items-center gap-1.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-700 to-teal-500 text-white font-bold flex items-center justify-center text-xs ring-2 ring-emerald-500/20">
                    {user.name ? user.name.slice(0, 1).toUpperCase() : 'U'}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
                </button>

                {showUserMenu && (
                  <div className="absolute top-full mt-2 end-0 w-56 rounded-xl bg-white dark:bg-slate-800 shadow-2xl border border-slate-200 dark:border-slate-700 py-1.5 z-50 text-xs">
                    <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-700">
                      <p className="font-bold text-slate-900 dark:text-slate-100">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center gap-1.5">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${user.plan === 'premium' ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-700 dark:text-slate-300'}`}>
                          {user.plan === 'premium' ? 'Qabdah Premium' : (isAr ? 'الخطة المجانية' : 'Free Plan')}
                        </span>
                      </div>
                    </div>

                    {user.plan === 'free' && (
                      <button
                        onClick={() => {
                          onOpenSubscriptions();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-start px-3 py-2 text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-950/40 flex items-center gap-2 font-bold"
                      >
                        <Crown className="w-3.5 h-3.5" />
                        <span>{isAr ? 'ترقية إلى Premium' : 'Upgrade to Premium'}</span>
                      </button>
                    )}

                    <button
                      onClick={() => {
                        onOpenSettings('general');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-start px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>{isAr ? 'الإعدادات والبيانات' : 'Settings & Data'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenSettings('supabase');
                        setShowUserMenu(false);
                      }}
                      className="w-full text-start px-3 py-2 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isAr ? 'قاعدة بيانات Supabase & السحاب' : 'Supabase Cloud Sync'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenAdmin();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-start px-3 py-2 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>{isAr ? 'لوحة الإدارة (Admin)' : 'Admin Portal'}</span>
                    </button>

                    <button
                      onClick={() => {
                        onOpenCurrencyConverter();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-start px-3 py-2 text-teal-600 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 flex items-center gap-2 font-medium"
                    >
                      <Coins className="w-3.5 h-3.5" />
                      <span>{isAr ? 'محول العملات والأسعار الحية' : 'Currency Converter & Live Rates'}</span>
                    </button>

                    {onOpenAbout && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenAbout();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-start px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{isAr ? 'عن منصة قَبْضَة (من نحن)' : 'About Qabdah Platform'}</span>
                      </button>
                    )}

                    {onOpenContact && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenContact();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-start px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2"
                      >
                        <Mail className="w-3.5 h-3.5 text-blue-500" />
                        <span>{isAr ? 'اتصل بنا والدعم الفني' : 'Contact Us & Support'}</span>
                      </button>
                    )}

                    {onOpenPrivacy && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenPrivacy();
                          setShowUserMenu(false);
                        }}
                        className="w-full text-start px-3 py-2 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-2 text-[11px]"
                      >
                        <span>{isAr ? '📄 سياسة الخصوصية والكوكيز' : '📄 Privacy & Cookies'}</span>
                      </button>
                    )}

                    <div className="border-t border-slate-100 dark:border-slate-700 my-1"></div>

                    <button
                      onClick={() => {
                        onSignOut();
                        setShowUserMenu(false);
                      }}
                      className="w-full text-start px-3 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>{isAr ? 'تسجيل الخروج' : 'Sign Out'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Secondary / Mobile Navigation Bar (visible below xl) */}
        {user && (
          <div className="xl:hidden flex items-center gap-1 overflow-x-auto py-2 border-t border-slate-100 dark:border-slate-800 scrollbar-none overscroll-x-contain touch-pan-x scroll-smooth px-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  ref={(el) => {
                    if (isActive && el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
                    }
                  }}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition active:scale-95 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
