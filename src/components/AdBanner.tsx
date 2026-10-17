import React, { useState } from 'react';
import { Crown, Sparkles, X } from 'lucide-react';
import { Language, PlanTier } from '../types/index.ts';

interface AdBannerProps {
  userPlan: PlanTier;
  language: Language;
  onUpgradeClick: () => void;
}

export const AdBanner: React.FC<AdBannerProps> = ({ userPlan, language, onUpgradeClick }) => {
  const [dismissed, setDismissed] = useState(false);
  const isAr = language === 'ar';

  // Do NOT render ads for Premium users!
  if (userPlan === 'premium' || dismissed) {
    return null;
  }

  return (
    <div className="no-print max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <div className="relative p-3 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100 dark:from-emerald-950/40 dark:via-teal-950/30 dark:to-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-400 text-amber-950 flex items-center justify-center shrink-0 shadow-xs">
            <Crown className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-slate-800 dark:text-slate-100">
              {isAr ? 'ترقية إلى Qabdah Premium لتجربة خالية تماماً من الإعلانات' : 'Upgrade to Qabdah Premium for 100% Ad-Free Experience'}
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              {isAr ? 'احصل على فحص غير محدود للفواتير والمستشار المالي الذكي مقابل 2.99$ شهرياً.' : 'Unlock unlimited AI scans and advisor for just $2.99/mo.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onUpgradeClick}
            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition"
          >
            {isAr ? 'ترقية الآن' : 'Upgrade Now'}
          </button>
          <button
            onClick={() => setDismissed(true)}
            aria-label={isAr ? 'إغلاق الإعلان' : 'Dismiss Ad'}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
