import React, { useState } from 'react';
import {
  Crown,
  CheckCircle2,
  X,
  ShieldCheck,
  CreditCard,
  Smartphone,
  Zap,
  Loader2,
} from 'lucide-react';
import { Language, UserProfile } from '../types/index.ts';

interface SubscriptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  language: Language;
  onUpgradeSuccess: (updatedUser: UserProfile) => void;
}

export const SubscriptionsModal: React.FC<SubscriptionsModalProps> = ({
  isOpen,
  onClose,
  user,
  language,
  onUpgradeSuccess,
}) => {
  const isAr = language === 'ar';

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'fawry' | 'wallet'>('card');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  const price = billingCycle === 'monthly' ? 2.99 : 24.99;

  const handleCheckout = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/subscription/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: 'premium',
          billingCycle,
          paymentMethod: selectedMethod,
          amount: price,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          onUpgradeSuccess({
            ...user,
            plan: 'premium',
            subscriptionEndDate: data.endDate,
          });
          onClose();
        }, 1200);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-slate-800 relative animate-in fade-in zoom-in-95">
        <button
          onClick={onClose}
          aria-label={isAr ? 'إغلاق' : 'Close'}
          className="absolute top-5 end-5 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-300 text-white shadow-lg shadow-amber-500/30 mb-3">
            <Crown className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-slate-100">
            {isAr ? 'ترقية إلى Qabdah Premium' : 'Upgrade to Qabdah Premium'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isAr
              ? 'احصل على كامل قوة المستشار المالي وفحص الفواتير بالذكاء الاصطناعي وبلا إعلانات.'
              : 'Unlock full AI advisor powers, OCR bill scans, and an ad-free experience.'}
          </p>
        </div>

        {/* Success Banner */}
        {success ? (
          <div className="p-6 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 text-center space-y-2">
            <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
            <h3 className="text-base font-black text-emerald-800 dark:text-emerald-300">
              {isAr ? 'تم تفعيل اشتراك Premium بنجاح!' : 'Premium Activated Successfully!'}
            </h3>
            <p className="text-xs text-emerald-700 dark:text-emerald-400">
              {isAr ? 'شكراً لثقتك في قَبْضَة. تم فتح جميع الميزات المتقدمة لحسابك.' : 'All premium features are now unlocked.'}
            </p>
          </div>
        ) : (
          <>
            {/* Billing Cycle Switcher */}
            <div className="flex items-center justify-center mb-6">
              <div className="flex rounded-xl bg-slate-100 dark:bg-slate-800 p-1 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-lg transition ${
                    billingCycle === 'monthly'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  {isAr ? 'شهري ($2.99 / شهر)' : 'Monthly ($2.99/mo)'}
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('yearly')}
                  className={`px-4 py-2 rounded-lg transition flex items-center gap-1.5 ${
                    billingCycle === 'yearly'
                      ? 'bg-white dark:bg-slate-900 text-emerald-700 dark:text-emerald-400 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  <span>{isAr ? 'سنوي ($24.99 / سنة)' : 'Yearly ($24.99/yr)'}</span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    {isAr ? 'وفر 30%' : 'Save 30%'}
                  </span>
                </button>
              </div>
            </div>

            {/* Checklist of Features */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs space-y-2.5 mb-6">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? 'فحص فواتير غير محدود بتقنية OCR والذكاء الاصطناعي' : 'Unlimited AI receipt OCR scanner'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? 'المستشار المالي الذكي الشخصي (تحليل غير محدود)' : 'Personal AI Financial Advisor'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? 'حسابات ومحافظ مالية غير محدودة ودعم كامل لتعدد العملات' : 'Unlimited accounts & multi-currency'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? 'تصدير كشوف حسابات PDF وإكسيل احترافية معتمدة' : 'Official PDF & Excel statement exports'}</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isAr ? 'تجربة سريعة خالية تماماً من أي إعلانات' : '100% Ad-Free Experience'}</span>
              </div>
            </div>

            {/* Payment Method Selector */}
            <div className="mb-6 space-y-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                {isAr ? 'اختر طريقة الدفع' : 'Payment Method'}
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMethod('card')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    selectedMethod === 'card'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>{isAr ? 'بطاقة بنكية' : 'Card / Stripe'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('wallet')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    selectedMethod === 'wallet'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Smartphone className="w-4 h-4" />
                  <span>{isAr ? 'محفظة ذكية' : 'Mobile Wallet'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedMethod('fawry')}
                  className={`p-3 rounded-xl border text-xs font-bold flex flex-col items-center gap-1.5 transition ${
                    selectedMethod === 'fawry'
                      ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Zap className="w-4 h-4" />
                  <span>{isAr ? 'فوري / كود دفع' : 'Fawry Pay'}</span>
                </button>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={handleCheckout}
              disabled={loading}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/30 transition transform active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>{isAr ? 'جاري تأكيد الدفع والترقية...' : 'Processing payment...'}</span>
                </>
              ) : (
                <>
                  <Crown className="w-4 h-4 text-amber-300" />
                  <span>
                    {isAr
                      ? `تأكيد الاشتراك الآن ($${price})`
                      : `Confirm Subscription ($${price})`}
                  </span>
                </>
              )}
            </button>
          </>
        )}
      </div>
    </div>
  );
};
