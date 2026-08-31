import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Mail } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="w-12 h-12 rounded-full bg-peach-100 flex items-center justify-center mx-auto mb-4">
            <Mail size={20} className="text-peach-600" />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Reset your password</h1>
          <p className="text-sm text-ink-500 mt-2">We'll email you a link to get back in</p>
        </div>

        {sent ? (
          <div className="card p-7 text-center">
            <p className="text-sm text-ink-700">If an account exists for <span className="font-medium">{email}</span>, a reset link is on its way.</p>
            <Link to="/login" className="btn-secondary w-full mt-5 inline-block">Back to log in</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card p-7 space-y-4">
            <div>
              <label className="text-sm font-medium text-ink-700 block mb-1.5">Email</label>
              <input type="email" required className="input-field" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Sending…' : 'Send reset link'}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-ink-500 mt-6">
          <Link to="/login" className="text-peach-600 font-medium hover:underline">Back to log in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
