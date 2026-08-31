import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import PayoutSetup from '../components/shared/PayoutSetup';
import StatusBadge from '../components/shared/StatusBadge';
import { format } from 'date-fns';
import { Plus, Wallet, Briefcase, CheckCircle2, Clock } from 'lucide-react';
import toast from 'react-hot-toast';

const StatCard = ({ label, value, icon: Icon }) => (
  <div className="card p-5">
    <div className="flex items-center justify-between">
      <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide">{label}</p>
      <Icon size={16} className="text-ink-300" />
    </div>
    <p className="tabular text-2xl font-bold text-ink-900 mt-2">{value}</p>
  </div>
);

const DashboardPage = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentContracts, setRecentContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onboarding, setOnboarding] = useState(false);

  useEffect(() => {
    api.get('/users/dashboard')
      .then(({ data }) => { setStats(data.stats); setRecentContracts(data.recentContracts); })
      .finally(() => setLoading(false));
  }, []);

  const handleRazorpayOnboard = async () => {
    setOnboarding(true);
    try {
      const { data } = await api.post('/payments/onboard-freelancer');
      window.location.href = data.url;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not start onboarding');
      setOnboarding(false);
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-5 py-20 text-center text-ink-400">Loading…</div>;

  const isFreelancer = user.role === 'freelancer';

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
        <div>
          <h1 className="font-display text-3xl font-bold text-ink-900">Welcome back, {user.name.split(' ')[0]}</h1>
          <p className="text-ink-500 mt-1">Here's what's happening with your work.</p>
        </div>
        {isFreelancer ? (
          <Link to="/services/new" className="btn-primary flex items-center gap-2"><Plus size={15} /> New service</Link>
        ) : (
          <Link to="/jobs/post" className="btn-primary flex items-center gap-2"><Plus size={15} /> Post a job</Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
        {isFreelancer ? (
          <>
            <StatCard label="Active contracts" value={stats.activeContracts} icon={Briefcase} />
            <StatCard label="Completed" value={stats.completedContracts} icon={CheckCircle2} />
            <StatCard label="Total earnings" value={`$${stats.totalEarnings.toFixed(0)}`} icon={Wallet} />
            <StatCard label="Pending proposals" value={stats.pendingProposals} icon={Clock} />
          </>
        ) : (
          <>
            <StatCard label="Active contracts" value={stats.activeContracts} icon={Briefcase} />
            <StatCard label="Completed" value={stats.completedContracts} icon={CheckCircle2} />
            <StatCard label="Total spent" value={`$${stats.totalSpent.toFixed(0)}`} icon={Wallet} />
            <StatCard label="Open jobs" value={stats.openJobs} icon={Clock} />
          </>
        )}
      </div>

      {isFreelancer && (
        <div className="mb-10">
          <PayoutSetup onComplete={() => {}} />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-xl font-bold text-ink-900">Recent contracts</h2>
        <Link to="/contracts" className="text-sm font-medium text-peach-600 hover:underline">View all</Link>
      </div>

      {recentContracts.length === 0 ? (
        <div className="card p-10 text-center">
          <p className="text-ink-500">No contracts yet.</p>
          <Link to={isFreelancer ? '/jobs' : '/services'} className="text-peach-600 font-medium text-sm hover:underline mt-2 inline-block">
            {isFreelancer ? 'Find work to apply for' : 'Browse services to hire'}
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {recentContracts.map((c) => (
            <Link key={c._id} to={`/contracts/${c._id}`} className="card p-5 flex items-center justify-between hover:border-peach-300 transition-colors">
              <div>
                <p className="font-medium text-ink-900">{c.title}</p>
                <p className="text-xs text-ink-400 mt-1">with {isFreelancer ? c.client?.name : c.freelancer?.name} · {format(new Date(c.createdAt), 'MMM d, yyyy')}</p>
              </div>
              <div className="text-right">
                <p className="tabular font-semibold text-ink-900">${c.totalAmount?.toFixed(2)}</p>
                <StatusBadge status={c.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardPage;
