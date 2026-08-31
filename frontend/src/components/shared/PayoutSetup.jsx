import { useState } from 'react';
import {
  Landmark, ShieldCheck, CheckCircle2, Loader2,
  Building2, CreditCard, ChevronRight, X, Eye, EyeOff,
} from 'lucide-react';
import toast from 'react-hot-toast';

const BANKS = [
  'State Bank of India', 'HDFC Bank', 'ICICI Bank', 'Axis Bank',
  'Kotak Mahindra Bank', 'Punjab National Bank', 'Bank of Baroda',
  'Canara Bank', 'IndusInd Bank', 'Yes Bank',
];

const STEPS = ['Bank details', 'Verify account', 'Done'];

const PayoutSetup = ({ onComplete }) => {
  const [open,    setOpen]    = useState(false);
  const [step,    setStep]    = useState(0);
  const [loading, setLoading] = useState(false);
  const [showAcc, setShowAcc] = useState(false);

  const [form, setForm] = useState({
    accountHolder: '',
    accountNumber: '',
    confirmAccount: '',
    ifsc: '',
    bankName: '',
    accountType: 'savings',
  });

  const [savedAccount, setSavedAccount] = useState(null);

  const update = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmitDetails = (e) => {
    e.preventDefault();
    if (!form.accountHolder.trim())  return toast.error('Enter account holder name');
    if (form.accountNumber.length < 9) return toast.error('Enter a valid account number');
    if (form.accountNumber !== form.confirmAccount) return toast.error('Account numbers do not match');
    if (form.ifsc.length !== 11)     return toast.error('IFSC must be 11 characters');
    if (!form.bankName)              return toast.error('Select your bank');
    setStep(1);
  };

  const [otp, setOtp] = useState(['', '', '', '', '', '']);

  const handleOtpChange = (i, val) => {
    if (!/^\d?$/.test(val)) return;
    const next = [...otp];
    next[i] = val;
    setOtp(next);
    if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
  };

  const handleVerify = (e) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length < 6) return toast.error('Enter the 6-digit OTP');
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSavedAccount({
        accountHolder: form.accountHolder,
        accountLast4:  form.accountNumber.slice(-4),
        ifsc:          form.ifsc.toUpperCase(),
        bankName:      form.bankName,
        accountType:   form.accountType,
        status:        'verified',
      });
      setStep(2);
      toast.success('🎉 Payout account linked successfully!');
      onComplete?.();
    }, 1800);
  };

  const [resending, setResending] = useState(false);
  const handleResend = () => {
    setResending(true);
    setTimeout(() => { setResending(false); toast.success('OTP resent (demo: use any 6 digits)'); }, 1000);
  };

  if (savedAccount) {
    return (
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sand-900">Payout account linked</h3>
            <p className="text-xs text-sand-400">Payments will be transferred here automatically</p>
          </div>
        </div>
        <div className="bg-peach-50 border border-peach-100 rounded-xl p-4 space-y-2.5 text-sm">
          <div className="flex justify-between">
            <span className="text-sand-500">Account holder</span>
            <span className="font-medium text-sand-900">{savedAccount.accountHolder}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sand-500">Account number</span>
            <span className="font-medium text-sand-900 tabular">•••• •••• {savedAccount.accountLast4}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sand-500">IFSC code</span>
            <span className="font-medium text-sand-900 tabular">{savedAccount.ifsc}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sand-500">Bank</span>
            <span className="font-medium text-sand-900">{savedAccount.bankName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sand-500">Account type</span>
            <span className="font-medium text-sand-900 capitalize">{savedAccount.accountType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sand-500">Status</span>
            <span className="badge bg-green-100 text-green-700">✓ Verified</span>
          </div>
        </div>
        <button
          onClick={() => { setSavedAccount(null); setStep(0); setOtp(['','','','','','']); setOpen(true); }}
          className="btn-ghost text-xs mt-4"
        >
          Update bank account
        </button>
      </div>
    );
  }

  return (
    <>
      {/* ── Trigger card ── */}
      <div className="card p-6">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-peach-100 flex items-center justify-center">
            <Landmark className="w-5 h-5 text-peach-600" />
          </div>
          <div>
            <h3 className="font-semibold text-sand-900">Payout details</h3>
            <p className="text-xs text-sand-400">Receive payments directly to your bank</p>
          </div>
        </div>
        <p className="text-sm text-sand-500 mb-5 mt-2">
          Set up your Razorpay payout details to receive released funds directly to your bank account.
        </p>
        <button onClick={() => { setOpen(true); setStep(0); }} className="btn-primary inline-flex items-center gap-2">
          <Building2 size={15} />
          Set up bank account
          <ChevronRight size={15} />
        </button>
        <p className="text-xs text-sand-400 mt-3 flex items-center gap-1">
          <ShieldCheck size={13} className="text-peach-400" />
          Secured by Razorpay · Bank-grade encryption
        </p>
      </div>

      {/* ── Modal ── */}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <div className="absolute inset-0 bg-sand-900/50 backdrop-blur-sm" onClick={() => setOpen(false)} />

          <div className="relative bg-white rounded-2xl shadow-lift w-full max-w-md overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-peach-100 bg-peach-50">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-peach-gradient flex items-center justify-center">
                  <Landmark size={15} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sand-900 text-sm">Razorpay Payout Setup</p>
                  <p className="text-xs text-sand-400">Step {step + 1} of {STEPS.length}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="p-1.5 rounded-lg hover:bg-peach-100 transition-colors">
                <X size={16} className="text-sand-500" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="flex items-center px-6 py-3 border-b border-peach-50 gap-0">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center flex-1">
                  <div className="flex items-center gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      i < step  ? 'bg-peach-500 text-white' :
                      i === step ? 'bg-peach-100 text-peach-600 border-2 border-peach-400' :
                                   'bg-sand-100 text-sand-400'
                    }`}>
                      {i < step ? '✓' : i + 1}
                    </div>
                    <span className={`text-xs font-medium hidden sm:block ${i === step ? 'text-peach-600' : 'text-sand-400'}`}>{s}</span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 transition-all ${i < step ? 'bg-peach-400' : 'bg-sand-100'}`} />
                  )}
                </div>
              ))}
            </div>

            {/* ── Step 0: Bank details form ── */}
            {step === 0 && (
              <form onSubmit={handleSubmitDetails} className="p-6 space-y-4">
                <div>
                  <label className="text-xs font-semibold text-sand-700 block mb-1.5">Account holder name</label>
                  <input className="input-field" placeholder="As per bank records" value={form.accountHolder} onChange={e => update('accountHolder', e.target.value)} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-sand-700 block mb-1.5">Bank name</label>
                  <select className="input-field" value={form.bankName} onChange={e => update('bankName', e.target.value)}>
                    <option value="">Select your bank</option>
                    {BANKS.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-sand-700 block mb-1.5">Account type</label>
                  <div className="flex gap-3">
                    {['savings', 'current'].map(t => (
                      <button key={t} type="button"
                        onClick={() => update('accountType', t)}
                        className={`flex-1 py-2.5 rounded-xl border text-sm font-medium transition-all capitalize ${form.accountType === t ? 'border-peach-400 bg-peach-50 text-peach-700' : 'border-sand-200 text-sand-500 hover:border-peach-200'}`}>
                        {t}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-sand-700 block mb-1.5">Account number</label>
                  <div className="relative">
                    <input
                      className="input-field pr-10"
                      type={showAcc ? 'text' : 'password'}
                      placeholder="Enter account number"
                      value={form.accountNumber}
                      onChange={e => update('accountNumber', e.target.value.replace(/\D/g,''))}
                    />
                    <button type="button" onClick={() => setShowAcc(s => !s)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-sand-400 hover:text-sand-700">
                      {showAcc ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-sand-700 block mb-1.5">Confirm account number</label>
                  <input className="input-field" type="password" placeholder="Re-enter account number"
                    value={form.confirmAccount} onChange={e => update('confirmAccount', e.target.value.replace(/\D/,''))} />
                </div>
                <div>
                  <label className="text-xs font-semibold text-sand-700 block mb-1.5">IFSC code</label>
                  <input className="input-field uppercase" placeholder="e.g. SBIN0001234" maxLength={11}
                    value={form.ifsc} onChange={e => update('ifsc', e.target.value.toUpperCase())} />
                  <p className="text-xs text-sand-400 mt-1">11-character code found on your cheque book</p>
                </div>
                <button type="submit" className="btn-primary w-full mt-2">
                  Continue to verify →
                </button>
              </form>
            )}

            {/* ── Step 1: OTP verification ── */}
            {step === 1 && (
              <form onSubmit={handleVerify} className="p-6">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-peach-100 flex items-center justify-center mx-auto mb-3">
                    <CreditCard size={24} className="text-peach-600" />
                  </div>
                  <p className="font-semibold text-sand-900">Verify your bank account</p>
                  <p className="text-sm text-sand-500 mt-1">
                    A 6-digit OTP has been sent to your registered mobile number ending in <span className="font-mono font-semibold">••••</span>
                  </p>
                  <div className="mt-2 px-3 py-2 bg-peach-50 rounded-lg inline-block">
                    <p className="text-xs text-peach-600 font-medium">Demo: enter any 6 digits to verify</p>
                  </div>
                </div>

                {/* OTP input boxes */}
                <div className="flex gap-2 justify-center mb-6">
                  {otp.map((val, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={val}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => e.key === 'Backspace' && !val && i > 0 && document.getElementById(`otp-${i-1}`)?.focus()}
                      className={`w-11 h-12 text-center text-lg font-bold border-2 rounded-xl outline-none transition-all ${
                        val ? 'border-peach-400 bg-peach-50 text-peach-700' : 'border-sand-200 text-sand-900 focus:border-peach-300'
                      }`}
                    />
                  ))}
                </div>

                <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
                  {loading ? <><Loader2 size={15} className="animate-spin" /> Verifying…</> : 'Verify & Link Account'}
                </button>

                <div className="flex items-center justify-between mt-4 text-xs text-sand-400">
                  <button type="button" onClick={() => setStep(0)} className="hover:text-peach-600 transition-colors">← Back</button>
                  <button type="button" onClick={handleResend} disabled={resending} className="hover:text-peach-600 transition-colors">
                    {resending ? 'Sending…' : 'Resend OTP'}
                  </button>
                </div>
              </form>
            )}

            {/* ── Step 2: Success ── */}
            {step === 2 && (
              <div className="p-8 text-center">
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={28} className="text-green-600" />
                </div>
                <h3 className="font-display text-xl font-bold text-sand-900 mb-2">Account Linked! 🎉</h3>
                <p className="text-sm text-sand-500 mb-6">
                  Your bank account has been verified. Payments released by clients will be transferred directly to your account within 1–2 business days.
                </p>
                <div className="bg-peach-50 border border-peach-100 rounded-xl p-4 text-left space-y-2 mb-6 text-sm">
                  <div className="flex justify-between">
                    <span className="text-sand-500">Bank</span>
                    <span className="font-medium text-sand-900">{form.bankName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand-500">Account</span>
                    <span className="font-medium text-sand-900 tabular">•••• {form.accountNumber.slice(-4)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand-500">IFSC</span>
                    <span className="font-medium text-sand-900 tabular">{form.ifsc}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sand-500">Status</span>
                    <span className="badge bg-green-100 text-green-700">✓ Verified</span>
                  </div>
                </div>
                <button onClick={() => setOpen(false)} className="btn-primary w-full">Done</button>
              </div>
            )}

            {/* Secured footer */}
            <div className="px-6 pb-4 flex items-center justify-center gap-1.5 text-xs text-sand-400">
              <ShieldCheck size={12} className="text-peach-400" />
              256-bit SSL encryption · Powered by Razorpay
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PayoutSetup;
