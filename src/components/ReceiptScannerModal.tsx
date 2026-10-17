import React, { useState, useRef } from 'react';
import {
  ScanLine,
  Camera,
  Upload,
  X,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
  DollarSign,
  Store,
  Tag,
} from 'lucide-react';
import {
  Account,
  Category,
  CurrencyCode,
  Language,
  Transaction,
} from '../types/index.ts';

interface ReceiptScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  accounts: Account[];
  language: Language;
  currency: CurrencyCode;
  onConfirmTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
}

export const ReceiptScannerModal: React.FC<ReceiptScannerModalProps> = ({
  isOpen,
  onClose,
  categories,
  accounts,
  language,
  currency,
  onConfirmTransaction,
}) => {
  const isAr = language === 'ar';
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Extracted & Editable Fields for User Review
  const [merchant, setMerchant] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('');
  const [notes, setNotes] = useState('');
  const [isExtracted, setIsExtracted] = useState(false);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(isAr ? 'يرجى اختيار ملف صورة صالح.' : 'Please choose a valid image file.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setImagePreview(base64);
      processImageWithAI(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const processImageWithAI = async (base64Image: string, mimeType: string) => {
    setLoading(true);
    setErrorMessage('');
    setIsExtracted(false);

    try {
      const response = await fetch('/api/ai/scan-receipt', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          imageBase64: base64Image,
          mimeType,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to analyze image');
      }

      const data = await response.json();

      setMerchant(data.merchant || (isAr ? 'فاتورة مشتريات' : 'Purchase Receipt'));
      setAmount(data.totalAmount ? String(data.totalAmount) : '');
      setDate(data.date || new Date().toISOString().slice(0, 10));
      setNotes(data.summary || '');

      // Match suggested category
      const expenseCats = categories.filter((c) => c.type === 'expense');
      const matched = expenseCats.find((c) =>
        c.id.includes(data.suggestedCategory) || c.name.toLowerCase().includes(data.suggestedCategory?.toLowerCase() || '')
      );
      setSelectedCategory(matched?.id || expenseCats[0]?.id || '');

      if (accounts.length > 0) {
        setSelectedAccount(accounts[0].id);
      }

      setIsExtracted(true);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(
        isAr
          ? 'تعذر قراءة الفاتورة تلقائياً. يمكنك كتابة البيانات يدوياً وتأكيدها.'
          : 'Could not automatically parse receipt. You can manually enter details below.'
      );
      setMerchant(isAr ? 'فاتورة مشتريات' : 'Receipt');
      setAmount('');
      setIsExtracted(true);
      if (accounts.length > 0) setSelectedAccount(accounts[0].id);
      const expenseCats = categories.filter((c) => c.type === 'expense');
      setSelectedCategory(expenseCats[0]?.id || '');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(amount);
    if (!merchant.trim()) {
      setErrorMessage(isAr ? 'يرجى إدخال اسم المتجر أو وصف الفاتورة.' : 'Please enter merchant or store name.');
      return;
    }
    if (isNaN(amountNum) || amountNum <= 0) {
      setErrorMessage(isAr ? 'يرجى إدخال مبلغ صحيح أكبر من الصفر.' : 'Please enter a valid amount greater than zero.');
      return;
    }

    onConfirmTransaction({
      userId: '',
      type: 'expense',
      amount: amountNum,
      description: merchant.trim(),
      categoryId: selectedCategory,
      sourceAccountId: selectedAccount || accounts[0]?.id,
      date,
      paymentMethod: 'cash',
      notes: notes.trim() || (isAr ? 'تم مسحها بالذكاء الاصطناعي' : 'AI scanned receipt'),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200 dark:border-slate-800 relative">
        <button
          onClick={onClose}
          aria-label={isAr ? 'إغلاق' : 'Close'}
          className="absolute top-4 end-4 p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 flex items-center justify-center">
            <ScanLine className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
              {isAr ? 'فحص واستخراج الفاتورة بالذكاء الاصطناعي' : 'AI Receipt OCR Scanner'}
            </h3>
            <p className="text-[11px] text-slate-400">
              {isAr
                ? 'التقط صورة الفاتورة لاستخراج المبلغ والمتجر ومراجعتها قبل الحفظ.'
                : 'Snap a receipt to extract totals and merchant before confirming.'}
            </p>
          </div>
        </div>

        {/* Upload / Camera Dropzone */}
        {!imagePreview && (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="p-8 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-center cursor-pointer transition bg-slate-50 dark:bg-slate-800/40"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="w-12 h-12 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 mx-auto flex items-center justify-center mb-3">
              <Camera className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
              {isAr ? 'اضغط لتصوير الفاتورة أو رفع صورة' : 'Click to take photo or upload image'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1">PNG, JPG, WebP</p>
          </div>
        )}

        {/* Image Preview & Scanner State */}
        {imagePreview && (
          <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden max-h-48 border border-slate-200 dark:border-slate-800 bg-slate-950 flex items-center justify-center">
              <img src={imagePreview} alt="Receipt preview" className="max-h-48 object-contain" />
              {loading && (
                <div className="absolute inset-0 bg-slate-950/70 backdrop-blur-xs flex flex-col items-center justify-center text-white text-xs gap-2">
                  <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
                  <span>{isAr ? 'جاري استخراج بيانات الفاتورة...' : 'Extracting receipt details...'}</span>
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => {
                setImagePreview(null);
                setIsExtracted(false);
              }}
              className="text-xs text-slate-500 hover:text-emerald-600 hover:underline"
            >
              {isAr ? 'إعادة اختيار صورة أخرى' : 'Change image'}
            </button>
          </div>
        )}

        {/* Error Notice */}
        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 text-amber-800 dark:text-amber-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Review & Confirmation Form */}
        {isExtracted && (
          <form onSubmit={handleConfirm} className="mt-4 space-y-3 text-xs border-t border-slate-100 dark:border-slate-800 pt-4">
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-[11px] flex items-center gap-2 font-medium">
              <Check className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>
                {isAr
                  ? 'تم استخراج البيانات بنجاح. راجعها وعدلها إن لزم الأمر ثم اضغط تأكيد الحفظ.'
                  : 'Extracted successfully. Please verify values before saving.'}
              </span>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'اسم المتجر أو الجهة' : 'Merchant'}
              </label>
              <input
                type="text"
                value={merchant}
                onChange={(e) => setMerchant(e.target.value)}
                required
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'المبلغ الإجمالي' : 'Total Amount'} ({currency})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  required
                  className="w-full px-3 py-2 text-base font-black rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none text-emerald-600"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'تاريخ الفاتورة' : 'Receipt Date'}
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'التصنيف المقترح' : 'Category'}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {categories
                    .filter((c) => c.type === 'expense')
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {isAr ? c.name : c.nameEn}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'الحساب المسدد منه' : 'Account'}
                </label>
                <select
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  {accounts.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {isAr ? 'ملخص الأصناف / ملاحظات' : 'Summary / Notes'}
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-md"
              >
                {isAr ? 'تأكيد وحفظ في سجل المصروفات' : 'Confirm & Save to Expenses'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
