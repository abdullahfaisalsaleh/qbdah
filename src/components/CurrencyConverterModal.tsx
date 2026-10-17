import React, { useState, useEffect } from 'react';
import {
  X,
  RefreshCw,
  ArrowRightLeft,
  Coins,
  Globe2,
  TrendingUp,
  CheckCircle,
  ExternalLink,
  Clock,
  Sparkles,
} from 'lucide-react';
import { CurrencyCode, Language } from '../types/index.ts';
import { CURRENCIES, formatMoney } from '../utils/finance.ts';
import { CurrencyService, ExchangeRatesData } from '../services/currencyService.ts';

interface CurrencyConverterModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  currentCurrency: CurrencyCode;
  onSelectCurrency: (curr: CurrencyCode) => void;
}

export const CurrencyConverterModal: React.FC<CurrencyConverterModalProps> = ({
  isOpen,
  onClose,
  language,
  currentCurrency,
  onSelectCurrency,
}) => {
  const isAr = language === 'ar';

  const [ratesData, setRatesData] = useState<ExchangeRatesData>(() => CurrencyService.getCachedRates());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [amount, setAmount] = useState<string>('100');
  const [fromCurrency, setFromCurrency] = useState<CurrencyCode>(currentCurrency);
  const [toCurrency, setToCurrency] = useState<CurrencyCode>(() => (currentCurrency === 'USD' ? 'SAR' : 'USD'));
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'arab' | 'popular' | 'all'>('arab');
  const [searchQuery, setSearchQuery] = useState('');

  // Subscribe to rates changes and fetch on open
  useEffect(() => {
    if (isOpen) {
      setRatesData(CurrencyService.getCachedRates());
      setIsRefreshing(true);
      CurrencyService.fetchLatestRates(true).then((data) => {
        setRatesData(data);
        setIsRefreshing(false);
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    const data = await CurrencyService.fetchLatestRates(true);
    setRatesData(data);
    setIsRefreshing(false);
    setSuccessToast(isAr ? 'تم تحديث أسعار الصرف الحية بنجاح!' : 'Exchange rates updated live!');
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const handleSwap = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const parsedAmount = parseFloat(amount) || 0;
  const convertedResult = CurrencyService.convert(parsedAmount, fromCurrency, toCurrency, ratesData.rates);
  const directRate = CurrencyService.getCrossRate(fromCurrency, toCurrency, ratesData.rates);
  const inverseRate = CurrencyService.getCrossRate(toCurrency, fromCurrency, ratesData.rates);

  const handleSetPrimary = (code: CurrencyCode) => {
    onSelectCurrency(code);
    setSuccessToast(
      isAr
        ? `تم تعيين ${code} كعملة العرض الأساسية لجميع المحافظ والتقارير`
        : `${code} set as primary viewing currency across accounts & reports`
    );
    setTimeout(() => setSuccessToast(null), 3000);
  };

  const arabCurrencies: CurrencyCode[] = [
    'EGP', 'SAR', 'AED', 'KWD', 'QAR', 'BHD', 'OMR', 'JOD',
    'IQD', 'LBP', 'SYP', 'YER', 'LYD', 'TND', 'DZD', 'MAD',
    'SDG', 'MRU', 'SOS', 'DJF', 'KMF',
  ];
  const globalCurrencies: CurrencyCode[] = ['USD', 'EUR', 'GBP'];
  const allCurrenciesList: CurrencyCode[] = [...arabCurrencies, ...globalCurrencies];

  const popularList: CurrencyCode[] = ['EGP', 'SAR', 'AED', 'KWD', 'QAR', 'JOD', 'MAD', 'USD', 'EUR', 'GBP'];

  const displayedCurrencies = allCurrenciesList.filter((code) => {
    const config = CURRENCIES[code];
    if (activeTab === 'arab' && !arabCurrencies.includes(code)) return false;
    if (activeTab === 'popular' && !popularList.includes(code)) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      return (
        code.toLowerCase().includes(q) ||
        config.nameAr.toLowerCase().includes(q) ||
        config.nameEn.toLowerCase().includes(q) ||
        (config.countryAr && config.countryAr.toLowerCase().includes(q)) ||
        (config.countryEn && config.countryEn.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div
        className="w-full max-w-3xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-emerald-50 via-teal-50 to-white dark:from-emerald-950/30 dark:via-slate-900 dark:to-slate-900">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{isAr ? 'محول العملات وأسعار الصرف لجميع الدول العربية' : 'Arab & Global Live Currency Converter'}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  {isAr ? 'مباشر' : 'Live'}
                </span>
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr
                  ? 'دعم كامل لجميع عملات الدول العربية الـ 21 والعملات العالمية بأسعار السوق الحية والمحدثة'
                  : 'Full support for all 21 Arab national currencies and world currencies with live market rates'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {successToast && (
            <div className="p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successToast}</span>
            </div>
          )}

          {/* Interactive Calculator Card */}
          <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                {isAr ? 'حاسبة التحويل الفوري' : 'Instant Conversion Calculator'}
              </span>
              <button
                onClick={handleRefresh}
                disabled={isRefreshing}
                className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 font-semibold disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{isAr ? 'تحديث أسعار الصرف الآن' : 'Refresh Rates'}</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
              {/* Amount & From Currency */}
              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {isAr ? 'المبلغ المطلوب تحويله' : 'Amount to Convert'}
                </label>
                <div className="flex rounded-xl overflow-hidden border border-slate-300 dark:border-slate-600 focus-within:ring-2 focus-within:ring-emerald-500 bg-white dark:bg-slate-900">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full px-3 py-2 text-sm font-bold bg-transparent border-0 focus:outline-hidden text-slate-900 dark:text-slate-100"
                    placeholder="100"
                  />
                  <select
                    value={fromCurrency}
                    onChange={(e) => setFromCurrency(e.target.value as CurrencyCode)}
                    className="px-2.5 py-2 text-xs font-bold bg-slate-100 dark:bg-slate-800 border-s border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 focus:outline-hidden cursor-pointer max-w-[130px]"
                  >
                    <optgroup label={isAr ? 'الدول العربية' : 'Arab Countries'}>
                      {arabCurrencies.map((c) => (
                        <option key={c} value={c}>
                          {CURRENCIES[c].flag} {c} ({isAr ? CURRENCIES[c].symbolAr : CURRENCIES[c].symbolEn})
                        </option>
                      ))}
                    </optgroup>
                    <optgroup label={isAr ? 'العملات العالمية' : 'Global Currencies'}>
                      {globalCurrencies.map((c) => (
                        <option key={c} value={c}>
                          {CURRENCIES[c].flag} {c} ({isAr ? CURRENCIES[c].symbolAr : CURRENCIES[c].symbolEn})
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>
              </div>

              {/* Swap Button */}
              <div className="sm:col-span-2 flex justify-center pt-3 sm:pt-4">
                <button
                  type="button"
                  onClick={handleSwap}
                  title={isAr ? 'تبديل العملتين' : 'Swap Currencies'}
                  className="w-10 h-10 rounded-full bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 hover:border-emerald-500 text-slate-600 dark:text-slate-300 hover:text-emerald-600 shadow-sm flex items-center justify-center transition active:scale-95"
                >
                  <ArrowRightLeft className="w-4 h-4" />
                </button>
              </div>

              {/* To Currency */}
              <div className="sm:col-span-5 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300">
                  {isAr ? 'التحويل إلى عملة' : 'Convert To'}
                </label>
                <select
                  value={toCurrency}
                  onChange={(e) => setToCurrency(e.target.value as CurrencyCode)}
                  className="w-full px-3 py-2 text-sm font-bold rounded-xl border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500 cursor-pointer"
                >
                  <optgroup label={isAr ? 'الدول العربية' : 'Arab Countries'}>
                    {arabCurrencies.map((c) => (
                      <option key={c} value={c}>
                        {CURRENCIES[c].flag} {c} - {isAr ? CURRENCIES[c].nameAr : CURRENCIES[c].nameEn} ({isAr ? CURRENCIES[c].countryAr : CURRENCIES[c].countryEn})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label={isAr ? 'العملات العالمية' : 'Global Currencies'}>
                    {globalCurrencies.map((c) => (
                      <option key={c} value={c}>
                        {CURRENCIES[c].flag} {c} - {isAr ? CURRENCIES[c].nameAr : CURRENCIES[c].nameEn}
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>
            </div>

            {/* Converted Display Result */}
            <div className="p-4 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-700 text-white shadow-md space-y-1">
              <span className="text-[11px] text-emerald-100 font-medium">
                {parsedAmount.toLocaleString(isAr ? 'ar-EG' : 'en-US')} {CURRENCIES[fromCurrency]?.flag} {fromCurrency} =
              </span>
              <div className="text-2xl sm:text-3xl font-black tracking-tight flex items-baseline gap-2">
                <span>
                  {convertedResult.toLocaleString(isAr ? 'ar-EG' : 'en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>
                <span className="text-lg font-bold text-emerald-200">
                  {CURRENCIES[toCurrency]?.flag} {isAr ? CURRENCIES[toCurrency].symbolAr : CURRENCIES[toCurrency].symbolEn} ({toCurrency})
                </span>
              </div>
              <div className="pt-2 text-[11px] text-emerald-100 flex flex-wrap items-center justify-between gap-2 border-t border-emerald-500/40 mt-2">
                <span>
                  1 {fromCurrency} = {directRate.toLocaleString(isAr ? 'ar-EG' : 'en-US', { maximumFractionDigits: 4 })} {toCurrency}
                </span>
                <span>
                  1 {toCurrency} = {inverseRate.toLocaleString(isAr ? 'ar-EG' : 'en-US', { maximumFractionDigits: 4 })} {fromCurrency}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Currency Presets / Switcher */}
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Globe2 className="w-4 h-4 text-emerald-600" />
                <span>{isAr ? 'عرض الحسابات والتقارير بأي عملة عربية أو عالمية' : 'View Accounts & Reports in Any Currency'}</span>
              </h3>
              <span className="text-[11px] text-slate-400">
                {isAr ? 'العملة الأساسية الحالية:' : 'Active:'} <strong className="text-emerald-600 font-black">{CURRENCIES[currentCurrency]?.flag} {currentCurrency}</strong>
              </span>
            </div>

            {/* Filter Tabs & Search */}
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setActiveTab('arab')}
                  className={`px-3 py-1 rounded-lg transition ${
                    activeTab === 'arab'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {isAr ? 'الدول العربية (21 دولة)' : 'Arab Countries (21)'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('popular')}
                  className={`px-3 py-1 rounded-lg transition ${
                    activeTab === 'popular'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {isAr ? 'الأكثر تداولاً' : 'Popular'}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1 rounded-lg transition ${
                    activeTab === 'all'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {isAr ? 'الكل (24 عملة)' : 'All (24)'}
                </button>
              </div>

              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={isAr ? 'ابحث باسم الدولة أو العملة...' : 'Search country or currency...'}
                className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 w-full sm:w-56"
              />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-72 overflow-y-auto p-1">
              {displayedCurrencies.map((code) => {
                const isSelected = currentCurrency === code;
                const rateVsUSD = ratesData.rates[code] || CURRENCIES[code].rateToUSD;
                const cfg = CURRENCIES[code];
                return (
                  <div
                    key={code}
                    className={`p-3 rounded-2xl border transition text-start relative group flex flex-col justify-between ${
                      isSelected
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/20'
                        : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="font-black text-sm text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                          <span className="text-base">{cfg.flag}</span>
                          <span>{code}</span>
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {isAr ? cfg.symbolAr : cfg.symbolEn}
                        </span>
                      </div>
                      <p className="text-[11px] font-semibold text-slate-700 dark:text-slate-200 mt-1 truncate">
                        {isAr ? cfg.nameAr : cfg.nameEn}
                      </p>
                      {cfg.countryAr && (
                        <p className="text-[10px] text-slate-400 truncate">
                          {isAr ? cfg.countryAr : cfg.countryEn}
                        </p>
                      )}
                      <div className="mt-1.5 text-[10px] text-slate-400">
                        1 USD = {rateVsUSD.toLocaleString(undefined, { maximumFractionDigits: 2 })} {code}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(code)}
                      className={`mt-2.5 w-full py-1.5 rounded-lg text-[10px] font-bold transition ${
                        isSelected
                          ? 'bg-emerald-600 text-white cursor-default'
                          : 'bg-slate-100 hover:bg-emerald-600 text-slate-700 hover:text-white dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-emerald-600'
                      }`}
                    >
                      {isSelected ? (isAr ? '✓ العملة الأساسية' : '✓ Active') : (isAr ? 'اعتماد كعملة العرض' : 'Set as Active')}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rates Table & Metadata */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>
                  {isAr ? 'آخر تحديث للأسعار:' : 'Last rate update:'}{' '}
                  {new Date(ratesData.lastUpdated).toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
                {ratesData.source}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
              {isAr
                ? 'ملاحظة: يتم تحديث أسعار الصرف تلقائياً من خوادم السوق المالي المفتوحة لتتيح لك تقييم إجمالي ثروتك ومصروفاتك بأي عملة (دولار، يورو، ريال سعودي، درهم، دينار، جنيه مصري).'
                : 'Note: Real-time rates are refreshed continuously from global market feeds to calculate your net worth, expenses, and debts in your desired currency.'}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold transition"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
