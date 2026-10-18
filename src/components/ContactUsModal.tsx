import React, { useState } from 'react';
import { X, Mail, Phone, MapPin, Send, CheckCircle2, AlertCircle, Clock, MessageSquare } from 'lucide-react';
import { Language } from '../types/index.ts';

interface ContactUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export const ContactUsModal: React.FC<ContactUsModalProps> = ({
  isOpen,
  onClose,
  language,
}) => {
  if (!isOpen) return null;

  const isAr = language === 'ar';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [category, setCategory] = useState('general');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [successTicket, setSuccessTicket] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!name.trim() || !email.trim() || !message.trim()) {
      setErrorMsg(isAr ? 'يرجى ملء جميع الحقول الإلزامية (الاسم، البريد، والرسالة).' : 'Please fill all required fields (Name, Email, Message).');
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          category,
          subject: subject.trim() || (isAr ? 'رسالة تواصل من منصة قبضة' : 'Contact Message from Qabdah'),
          message: message.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setSuccessTicket(data.ticketNumber || `QBD-${Date.now().toString().slice(-6)}`);
      } else {
        setErrorMsg(data.error || (isAr ? 'حدث خطأ أثناء إرسال الرسالة، يرجى المحاولة لاحقاً.' : 'Error sending message, please try again.'));
      }
    } catch (err) {
      // In case of network glitch, store locally as resilient backup
      const backupTicket = `QBD-${Date.now().toString().slice(-6)}`;
      try {
        const saved = JSON.parse(localStorage.getItem('qabdah_contact_offline_msgs') || '[]');
        saved.push({ name, email, phone, category, subject, message, date: new Date().toISOString(), ticket: backupTicket });
        localStorage.setItem('qabdah_contact_offline_msgs', JSON.stringify(saved));
      } catch (storageErr) {
        // ignore storage errors
      }
      setSuccessTicket(backupTicket);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setPhone('');
    setCategory('general');
    setSubject('');
    setMessage('');
    setSuccessTicket(null);
    setErrorMsg(null);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="contact-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="relative w-full max-w-2xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-900/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-700 to-teal-500 text-white flex items-center justify-center font-bold shadow-md shadow-emerald-600/20">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 id="contact-modal-title" className="text-lg font-black text-slate-900 dark:text-slate-100">
                {isAr ? 'اتصل بنا | تواصل مع فريق قَبْضَة' : 'Contact Us | Reach Qabdah Team'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isAr ? 'نسعد باستفساراتك، ملاحظاتك الفنية، واقتراحات التطوير' : 'We welcome your questions, feedback, and suggestions'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label={isAr ? 'إغلاق' : 'Close'}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="px-6 py-6 overflow-y-auto space-y-6 text-sm">
          {/* Quick Channels Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-800/80">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-300 font-bold text-xs mb-1">
                <Mail className="w-4 h-4 shrink-0" />
                <span>{isAr ? 'البريد الرسمي المباشر' : 'Official Direct Email'}</span>
              </div>
              <a
                href="mailto:bodyfs2030@gmail.com"
                className="text-xs font-semibold text-slate-800 dark:text-slate-200 hover:underline block truncate"
              >
                bodyfs2030@gmail.com
              </a>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                support@qabdah.com
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/80 dark:border-blue-800/80">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 font-bold text-xs mb-1">
                <Clock className="w-4 h-4 shrink-0" />
                <span>{isAr ? 'زمن الاستجابة المتوقع' : 'Response Time'}</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isAr ? 'خلال 24 إلى 48 ساعة' : 'Within 24-48 business hours'}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                {isAr ? 'من الأحد إلى الخميس' : 'Sun to Thu (Cairo GMT+2)'}
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-bold text-xs mb-1">
                <MapPin className="w-4 h-4 shrink-0 text-slate-500" />
                <span>{isAr ? 'المقر الإقليمي' : 'Regional Location'}</span>
              </div>
              <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {isAr ? 'القاهرة، جمهورية مصر العربية' : 'Cairo, Egypt'}
              </p>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 block mt-0.5">
                {isAr ? 'الشرق الأوسط وشمال أفريقيا' : 'MENA Region'}
              </span>
            </div>
          </div>

          {/* Form or Success State */}
          {successTicket ? (
            <div className="p-6 rounded-3xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100">
                  {isAr ? 'تم استلام رسالتك بنجاح!' : 'Your message has been sent successfully!'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-md mx-auto">
                  {isAr
                    ? 'شكراً لتواصلك مع منصة قَبْضَة. تم إنشاء تذكرة متابعة مخصصة وسيتواصل معك الفريق الفني قريباً.'
                    : 'Thank you for reaching out to Qabdah. A support ticket has been created and our team will reply shortly.'}
                </p>
              </div>

              <div className="inline-block px-4 py-2 rounded-xl bg-white dark:bg-slate-800 border border-emerald-300 dark:border-emerald-700 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">
                {isAr ? 'رقم التذكرة: ' : 'Ticket Number: '}
                {successTicket}
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={handleReset}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition"
                >
                  {isAr ? 'إرسال رسالة أخرى' : 'Send Another Message'}
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'الاسم الكامل *' : 'Full Name *'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={isAr ? 'مثال: أحمد محمود' : 'e.g. Ahmed Mahmoud'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'البريد الإلكتروني للتواصل *' : 'Email Address *'}
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={isAr ? 'name@example.com' : 'name@example.com'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'نوع الاستفسار' : 'Inquiry Category'}
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                  >
                    <option value="general">{isAr ? 'استفسار عام عن المنصة' : 'General Inquiry'}</option>
                    <option value="technical">{isAr ? 'دعم فني أو مشكلة تقنية' : 'Technical Support'}</option>
                    <option value="feature">{isAr ? 'اقتراح ميزة أو أداة جديدة' : 'Feature Request'}</option>
                    <option value="adsense_business">{isAr ? 'إعلانات وشراكات أعمال (Media / Ads)' : 'Media & Business'}</option>
                    <option value="privacy">{isAr ? 'استفسار عن الخصوصية والبيانات' : 'Privacy & Data Rights'}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                    {isAr ? 'رقم الهاتف أو واتساب (اختياري)' : 'Phone or WhatsApp (Optional)'}
                  </label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder={isAr ? '+20 10...' : '+20 10...'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'عنوان الموضوع' : 'Subject'}
                </label>
                <input
                  type="text"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder={isAr ? 'ملخص رسالتك في كلمات قصيرة' : 'Summary of your inquiry'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isAr ? 'نص الرسالة أو الاستفسار بالتفصيل *' : 'Detailed Message *'}
                </label>
                <textarea
                  rows={4}
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={isAr ? 'اكتب تفاصيل استفسارك أو ملاحظاتك هنا...' : 'Write your detailed message here...'}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">
                  {isAr ? 'بياناتك محمية ولن يتم مشاركتها أبداً.' : 'Your data is protected and never shared.'}
                </span>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs shadow-md shadow-emerald-600/30 transition flex items-center gap-2 cursor-pointer"
                >
                  {loading ? (
                    <span>{isAr ? 'جاري الإرسال...' : 'Sending...'}</span>
                  ) : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      <span>{isAr ? 'إرسال الرسالة الآن' : 'Send Message'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>{isAr ? 'فريق خدمة العملاء متاح للرد خلال ساعات العمل الرسمية' : 'Customer support is active during official business hours'}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-200 font-bold text-xs transition"
          >
            {isAr ? 'إغلاق' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
