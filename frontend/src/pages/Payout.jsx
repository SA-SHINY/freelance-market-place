import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Landmark, Smartphone, ShieldCheck, Trash2 } from 'lucide-react';

const Payout = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existing, setExisting] = useState(null);

  const [accountType, setAccountType] = useState('bank');
  const [form, setForm] = useState({
    accountHolderName: '',
    accountNumber: '',
    ifsc: '',
    upi: '',
  });

  useEffect(() => {
    api.get('/payouts/payout-status')
      .then(({ data }) => {
        if (data.success && data.account) {
          setExisting(data.account);
          setAccountType(data.account.accountType || 'bank');
          setForm({
            accountHolderName: data.account.accountHolderName || '',
            accountNumber: data.account.accountNumber || '',
            ifsc: data.account.ifsc || '',
            upi: data.account.upi || '',
          });
        }
      })
      .catch(() => {
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = { accountType, ...form };
      const { data } = await api.post('/payouts/save-payout', payload);
      setExisting(data.account);
      toast.success(data.message || 'Payout details saved');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save payout details');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    if (!window.confirm('Remove your saved payout details?')) return;
    try {
      await api.delete('/payouts/delete-payout');
      setExisting(null);
      setForm({ accountHolderName: '', accountNumber: '', ifsc: '', upi: '' });
      toast.success('Payout details removed');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not remove payout details');
    }
  };

  if (loading) {
    return <div className="max-w-xl mx-auto px-5 py-20 text-center text-ink-400">Loading…</div>;
  }

  return (
    <div className="max-w-xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-ink-900 mb-1">Payout details</h1>
      <p className="text-ink-500 mb-7">
        Add your bank account or UPI ID so released escrow funds can reach you directly.
      </p>

      {existing?.status === 'active' && (
        <div className="card p-4 mb-6 flex items-center gap-2.5 bg-sage-100/40 border-sage-200">
          <ShieldCheck size={16} className="text-sage-600 shrink-0" />
          <p className="text-sm text-sage-700">
            Payout details on file{existing.bankName ? ` — ${existing.bankName}` : ''}
            {existing.accountLast4 ? ` (••••${existing.accountLast4})` : ''}
          </p>
        </div>
      )}

      <div className="flex gap-2 mb-6">
        <button
          type="button"
          onClick={() => setAccountType('bank')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
            accountType === 'bank' ? 'border-ink-900 bg-ink-900 text-paper' : 'border-ink-200 text-ink-600'
          }`}
        >
          <Landmark size={15} /> Bank account
        </button>
        <button
          type="button"
          onClick={() => setAccountType('upi')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
            accountType === 'upi' ? 'border-ink-900 bg-ink-900 text-paper' : 'border-ink-200 text-ink-600'
          }`}
        >
          <Smartphone size={15} /> UPI
        </button>
      </div>

      <form onSubmit={handleSave} className="card p-6 space-y-5">
        {accountType === 'bank' ? (
          <>
            <div>
              <label className="text-sm font-medium text-ink-700 block mb-1.5">Account holder name</label>
              <input
                required
                className="input-field"
                value={form.accountHolderName}
                onChange={(e) => setForm({ ...form, accountHolderName: e.target.value })}
                placeholder="As per bank records"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700 block mb-1.5">Account number</label>
              <input
                required
                className="input-field"
                value={form.accountNumber}
                onChange={(e) => setForm({ ...form, accountNumber: e.target.value })}
                placeholder="9–18 digit account number"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700 block mb-1.5">IFSC code</label>
              <input
                required
                className="input-field uppercase"
                value={form.ifsc}
                onChange={(e) => setForm({ ...form, ifsc: e.target.value.toUpperCase() })}
                placeholder="e.g. HDFC0001234"
                maxLength={11}
              />
            </div>
          </>
        ) : (
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">UPI ID</label>
            <input
              required
              className="input-field"
              value={form.upi}
              onChange={(e) => setForm({ ...form, upi: e.target.value })}
              placeholder="yourname@bank"
            />
          </div>
        )}

        <button type="submit" disabled={saving} className="btn-primary w-full">
          {saving ? 'Saving…' : existing ? 'Update payout details' : 'Save payout details'}
        </button>

        {existing && (
          <button
            type="button"
            onClick={handleRemove}
            className="w-full flex items-center justify-center gap-2 text-sm font-medium text-blush-600 hover:underline"
          >
            <Trash2 size={14} /> Remove payout details
          </button>
        )}
      </form>

      <button
        type="button"
        onClick={() => navigate('/dashboard')}
        className="text-sm text-ink-400 hover:text-ink-600 mt-6 block mx-auto"
      >
        ← Back to dashboard
      </button>
    </div>
  );
};

export default Payout;
