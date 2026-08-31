import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StatusBadge from '../components/shared/StatusBadge';
import { format } from 'date-fns';

const TABS = ['all', 'pending', 'active', 'completed', 'cancelled'];

const ContractsPage = () => {
  const [contracts, setContracts] = useState([]);
  const [tab, setTab] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get('/contracts', { params: tab === 'all' ? {} : { status: tab } })
      .then(({ data }) => setContracts(data.contracts))
      .finally(() => setLoading(false));
  }, [tab]);

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-ink-900 mb-1">Contracts</h1>
      <p className="text-ink-500 mb-7">Every agreement you're a party to, in one place.</p>

      <div className="flex gap-1 border-b border-ink-100 mb-6">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-2.5 text-sm font-medium capitalize border-b-2 transition-colors ${tab === t ? 'border-ink-900 text-ink-900' : 'border-transparent text-ink-400 hover:text-ink-600'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-ink-100 rounded-xl2 animate-pulse" />)}</div>
      ) : contracts.length === 0 ? (
        <p className="text-center text-ink-400 py-16">No contracts here yet.</p>
      ) : (
        <div className="space-y-3">
          {contracts.map((c) => (
            <Link key={c._id} to={`/contracts/${c._id}`} className="card p-5 flex items-center justify-between hover:border-peach-300 transition-colors">
              <div>
                <p className="font-medium text-ink-900">{c.title}</p>
                <p className="text-xs text-ink-400 mt-1">
                  {c.job?.title || c.service?.title || 'Direct contract'} · {format(new Date(c.createdAt), 'MMM d, yyyy')}
                </p>
              </div>
              <div className="text-right">
                <p className="tabular font-semibold text-ink-900">${c.totalAmount.toFixed(2)}</p>
                <StatusBadge status={c.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContractsPage;
