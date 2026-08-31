import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Briefcase, Hammer, Check } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [role, setRole] = useState('freelancer');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      const user = await register({ ...form, role });
      toast.success(`Welcome to SkillBridge, ${user.name.split(' ')[0]}`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-bold text-ink-900">Create your account</h1>
          <p className="text-sm text-ink-500 mt-2">Join SkillBridge as a freelancer or a client</p>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            type="button"
            onClick={() => setRole('freelancer')}
            className={`relative p-4 rounded-xl2 border text-left transition-colors ${role === 'freelancer' ? 'border-peach-500 bg-peach-100/40' : 'border-ink-200 bg-white'}`}
          >
            {role === 'freelancer' && <Check size={16} className="absolute top-3 right-3 text-peach-600" />}
            <Hammer size={20} className="text-ink-700 mb-2" />
            <p className="font-semibold text-sm text-ink-900">I'm a freelancer</p>
            <p className="text-xs text-ink-500 mt-0.5">Offer services, find work</p>
          </button>
          <button
            type="button"
            onClick={() => setRole('client')}
            className={`relative p-4 rounded-xl2 border text-left transition-colors ${role === 'client' ? 'border-peach-500 bg-peach-100/40' : 'border-ink-200 bg-white'}`}
          >
            {role === 'client' && <Check size={16} className="absolute top-3 right-3 text-peach-600" />}
            <Briefcase size={20} className="text-ink-700 mb-2" />
            <p className="font-semibold text-sm text-ink-900">I'm a client</p>
            <p className="text-xs text-ink-500 mt-0.5">Hire talent, post jobs</p>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="card p-7 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Full name</label>
            <input required className="input-field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Jordan Lee" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Email</label>
            <input type="email" required className="input-field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="you@example.com" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Password</label>
            <input type="password" required minLength={6} className="input-field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="At least 6 characters" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
            {loading ? 'Creating account…' : `Sign up as ${role === 'freelancer' ? 'a freelancer' : 'a client'}`}
          </button>
        </form>

        <p className="text-center text-sm text-ink-500 mt-6">
          Already have an account? <Link to="/login" className="text-peach-600 font-medium hover:underline">Log in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
