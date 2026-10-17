import React, { useState, useEffect } from 'react';
import { Smartphone, Download, X, Info } from 'lucide-react';
import { Language } from '../types/index.ts';

interface InstallPromptProps {
  language: Language;
}

export const InstallPrompt: React.FC<InstallPromptProps> = ({ language }) => {
  const isAr = language === 'ar';
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showManualGuide, setShowManualGuide] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsVisible(true);
    };

    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      setShowManualGuide(true);
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsVisible(false);
    }
    setDeferredPrompt(null);
  };

  if (!isVisible && !showManualGuide) return null;

  return (
    <>
      {isVisible && (
        <div className="no-print fixed bottom-4 start-4 end-4 sm:start-auto sm:end-4 sm:w-96 z-40 bg-white dark:bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-2xl flex items-center justify-between gap-3 text-xs animate-in slide-in-from-bottom-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold font-serif text-lg shrink-0">
              ق
            </div>
            <div>
              <p className="font-bold text-slate-900 dark:text-slate-100">
                {isAr ? 'تثبيت تطبيق قَبْضَة على هاتفك' : 'Install Qabdah on your device'}
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isAr ? 'وصول أسرع وتجربة تطبيق مستقلة دون متجر' : 'Fast offline access as a native app'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition cursor-pointer"
            >
              {isAr ? 'تثبيت' : 'Install'}
            </button>
            <button
              onClick={() => setIsVisible(false)}
              aria-label={isAr ? 'إغلاق' : 'Close'}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {showManualGuide && (
        <div className="no-print fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowManualGuide(false)}
              className="absolute top-4 end-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400">
                <Smartphone className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {isAr ? 'تثبيت التطبيق على جهازك' : 'Install App on Your Device'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {isAr ? 'خطوات سريعة لإضافة التطبيق لشاشتك الرئيسية' : 'Quick steps to add app to your home screen'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs text-slate-700 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  {isAr ? 'لهواتف آيفون (iOS Safari):' : 'For iPhone (iOS Safari):'}
                </p>
                <p>
                  {isAr
                    ? '1. اضغط على أيقونة المشاركة (Share) في شريط المتصفح أسفل الشاشة.'
                    : '1. Tap the Share icon in the browser navigation bar.'}
                </p>
                <p>
                  {isAr
                    ? '2. اختر "إضافة إلى الصفحة الرئيسية" (Add to Home Screen).'
                    : '2. Select "Add to Home Screen".'}
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800">
                <p className="font-bold text-emerald-600 dark:text-emerald-400 mb-1">
                  {isAr ? 'لهواتف أندرويد وكمبيوتر (Chrome/Edge):' : 'For Android & Desktop (Chrome/Edge):'}
                </p>
                <p>
                  {isAr
                    ? '1. اضغط على قائمة الخيارات (⋮) أعلى المتصفح.'
                    : '1. Tap the options menu (⋮) at top of browser.'}
                </p>
                <p>
                  {isAr
                    ? '2. اختر "تثبيت التطبيق" (Install App).'
                    : '2. Select "Install App".'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowManualGuide(false)}
              className="mt-5 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition cursor-pointer"
            >
              {isAr ? 'فهمت، حسناً' : 'Got it'}
            </button>
          </div>
        </div>
      )}
    </>
  );
};
