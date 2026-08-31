import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/shared/StarRating';
import { Check, Clock, RefreshCw, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const ServiceDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [service, setService] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tier, setTier] = useState('basic');
  const [ordering, setOrdering] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data } = await api.get(`/services/${id}`);
        setService(data.service);
        setReviews(data.reviews);
      } catch {
        toast.error('Could not load this service');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id]);

  const handleOrder = async () => {
    if (!user) return navigate('/login', { state: { from: `/services/${id}` } });
    if (user.role !== 'client') return toast.error('Only clients can order services');

    setOrdering(true);
    try {
      const pkg = service.packages[tier];
      const { data } = await api.post('/contracts', {
        freelancerId: service.freelancer._id,
        serviceId: service._id,
        title: `${service.title} — ${pkg.name}`,
        description: pkg.description,
        totalAmount: pkg.price,
        paymentType: 'fixed',
        deadline: new Date(Date.now() + pkg.deliveryDays * 86400000),
      });
      toast.success('Contract created — fund escrow to begin');
      navigate(`/contracts/${data.contract._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create contract');
    } finally {
      setOrdering(false);
    }
  };

  if (loading) return <div className="max-w-7xl mx-auto px-5 py-20 text-center text-ink-400">Loading…</div>;
  if (!service) return <div className="max-w-7xl mx-auto px-5 py-20 text-center text-ink-400">Service not found</div>;

  const pkg = service.packages[tier];

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <p className="text-xs font-semibold text-peach-600 uppercase tracking-wide">{service.category}</p>
          <h1 className="font-display text-3xl font-bold text-ink-900 mt-2">{service.title}</h1>

          <div className="flex items-center gap-3 mt-4">
            <div className="w-9 h-9 rounded-full bg-ink-900 text-paper flex items-center justify-center font-semibold">
              {service.freelancer?.name?.[0]?.toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-ink-900">{service.freelancer?.name}</p>
              <div className="flex items-center gap-3 text-xs text-ink-400">
                <StarRating rating={service.freelancer?.rating} totalReviews={service.freelancer?.totalReviews} size={12} />
                {service.freelancer?.location && (
                  <span className="flex items-center gap-1"><MapPin size={11} /> {service.freelancer.location}</span>
                )}
              </div>
            </div>
          </div>

          <div className="aspect-video bg-ink-100 rounded-xl2 mt-7 overflow-hidden">
            {service.images?.[0] ? (
              <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-ink-300 font-display text-5xl">{service.title?.[0]}</div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="font-display text-xl font-bold text-ink-900 mb-3">About this service</h2>
            <p className="text-ink-600 whitespace-pre-line leading-relaxed">{service.description}</p>
          </div>

          {service.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-5">
              {service.tags.map((t) => <span key={t} className="badge bg-ink-100 text-ink-600">{t}</span>)}
            </div>
          )}

          <div className="mt-10">
            <h2 className="font-display text-xl font-bold text-ink-900 mb-4">Reviews ({service.totalReviews})</h2>
            {reviews.length === 0 ? (
              <p className="text-sm text-ink-400">No reviews yet for this service.</p>
            ) : (
              <div className="space-y-5">
                {reviews.map((r) => (
                  <div key={r._id} className="border-b border-ink-100 pb-5">
                    <div className="flex items-center gap-2.5 mb-1.5">
                      <div className="w-7 h-7 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center text-xs font-semibold">
                        {r.reviewer?.name?.[0]?.toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-ink-900">{r.reviewer?.name}</span>
                      <span className="text-xs text-ink-300">{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
                    </div>
                    <StarRating rating={r.rating} showValue={false} size={12} />
                    <p className="text-sm text-ink-600 mt-2">{r.comment}</p>
                    {r.response?.comment && (
                      <div className="mt-3 ml-4 pl-4 border-l-2 border-peach-200">
                        <p className="text-xs font-semibold text-ink-700">Response from {service.freelancer?.name}</p>
                        <p className="text-sm text-ink-500 mt-1">{r.response.comment}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card p-1.5 sticky top-24">
            <div className="grid grid-cols-3 gap-1 p-1">
              {['basic', 'standard', 'premium'].map((t) => (
                service.packages[t]?.price && (
                  <button
                    key={t}
                    onClick={() => setTier(t)}
                    className={`py-2 text-xs font-semibold rounded-lg transition-colors ${tier === t ? 'bg-ink-900 text-paper' : 'text-ink-500 hover:bg-ink-50'}`}
                  >
                    {service.packages[t].name}
                  </button>
                )
              ))}
            </div>
            <div className="p-5 pt-3">
              <div className="flex items-baseline gap-1.5 mb-3">
                <span className="tabular text-3xl font-bold text-ink-900">${pkg.price}</span>
              </div>
              <p className="text-sm text-ink-600 mb-4">{pkg.description}</p>
              <div className="space-y-2.5 text-sm text-ink-600 mb-5">
                <div className="flex items-center gap-2"><Clock size={15} className="text-ink-400" /> {pkg.deliveryDays}-day delivery</div>
                <div className="flex items-center gap-2"><RefreshCw size={15} className="text-ink-400" /> {pkg.revisions === -1 ? 'Unlimited' : pkg.revisions} revisions</div>
                {pkg.features?.map((f) => (
                  <div key={f} className="flex items-center gap-2"><Check size={15} className="text-peach-500" /> {f}</div>
                ))}
              </div>
              <button onClick={handleOrder} disabled={ordering} className="btn-accent w-full">
                {ordering ? 'Creating contract…' : `Continue — $${pkg.price}`}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
