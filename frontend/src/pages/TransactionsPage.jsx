import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

const TYPE_LABELS = {
  escrow: 'Escrow funded',
  release: 'Payment released',
  refund: 'Refund',
  milestone: 'Milestone payment',
};

const TransactionsPage = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/payments/transactions').then(({ data }) => setTransactions(data.transactions)).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-ink-900 mb-1">Transaction history</h1>
      <p className="text-ink-500 mb-7">A record of every payment in and out of your account.</p>

      {loading ? (
        <div className="space-y-3">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-16 bg-ink-100 rounded-xl2 animate-pulse" />)}</div>
      ) : transactions.length === 0 ? (
        <div className="card p-10 text-center text-ink-500">No transactions yet.</div>
      ) : (
        <div className="card divide-y divide-ink-100 overflow-hidden">
          {transactions.map((t) => {
            const isIncoming = t.payee?._id === user._id;
            return (
              <div key={t._id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${isIncoming ? 'bg-peach-100 text-peach-600' : 'bg-ink-100 text-ink-500'}`}>
                    {isIncoming ? <ArrowDownLeft size={16} /> : <ArrowUpRight size={16} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-900">{TYPE_LABELS[t.type] || t.type}</p>
                    <p className="text-xs text-ink-400 mt-0.5">{t.contract?.title || t.description} · {format(new Date(t.createdAt), 'MMM d, yyyy')}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`tabular text-sm font-semibold ${isIncoming ? 'text-peach-600' : 'text-ink-900'}`}>
                    {isIncoming ? '+' : '−'}${(isIncoming ? t.netAmount : t.amount).toFixed(2)}
                  </p>
                  <p className="text-xs text-ink-400 capitalize">{t.status}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TransactionsPage;