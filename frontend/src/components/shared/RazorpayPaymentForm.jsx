import { useState, useEffect } from 'react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { Lock } from 'lucide-react';

const loadRazorpayScript = () =>
  new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload  = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

const RazorpayPaymentForm = ({ contractId, amount, contractTitle, clientName, clientEmail, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [scriptReady, setScriptReady] = useState(false);

  useEffect(() => {
    loadRazorpayScript().then(setScriptReady);
  }, []);

  const handlePay = async () => {
    if (!scriptReady) {
      toast.error('Razorpay is still loading — please try again in a moment');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/payments/create-order', { contractId });

      const options = {
        key:      data.keyId,
        amount:   data.amount,      // already in cents
        currency: data.currency,
        name:     'SkillBridge Marketplace',
        description: `Escrow for: ${contractTitle}`,
        order_id: data.orderId,
        prefill: {
          name:  clientName  || '',
          email: clientEmail || '',
        },
        theme: { color: '#F2814A' },
        handler: async (response) => {
          try {
            await api.post('/payments/verify', {
              contractId,
              razorpay_order_id:   response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature:  response.razorpay_signature,
            });
            toast.success('Payment successful — escrow funded!');
            onSuccess?.();
          } catch (err) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            toast('Payment cancelled');
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on('payment.failed', (response) => {
        toast.error(`Payment failed: ${response.error.description}`);
        setLoading(false);
      });

      rzp.open();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not initiate payment');
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-ink-50 rounded-lg p-4 text-sm text-ink-600 space-y-1.5">
        <p className="flex items-center gap-2 font-medium text-ink-900">
          <Lock size={14} className="text-peach-500" /> Secured by Razorpay
        </p>
        <p>Pay with UPI, NetBanking, Credit / Debit card, or Wallets.</p>
        <p className="tabular font-semibold text-lg text-ink-900">${amount.toFixed(2)}</p>
      </div>

      <div className="bg-amber-100 border border-amber-400/40 rounded-lg px-4 py-3 text-xs text-amber-600 space-y-1">
        <p><strong>Test mode credentials:</strong></p>
        <p>• UPI ID: <code className="bg-amber-200 px-1 rounded">success@razorpay</code> → click Pay (instant success)</p>
        <p>• Card: <code className="bg-amber-200 px-1 rounded">4111 1111 1111 1111</code> | Expiry: <code className="bg-amber-200 px-1 rounded">12/26</code> | CVV: <code className="bg-amber-200 px-1 rounded">123</code> | OTP: <code className="bg-amber-200 px-1 rounded">1234</code></p>
        <p>• Name on card: any name (e.g. <code className="bg-amber-200 px-1 rounded">Test User</code>)</p>
      </div>

      <button
        onClick={handlePay}
        disabled={loading || !scriptReady}
        className="btn-accent w-full flex items-center justify-center gap-2"
      >
        {loading ? 'Opening payment window…' : `Pay $${amount.toFixed(2)} via Razorpay`}
      </button>
    </div>
  );
};

export default RazorpayPaymentForm;
