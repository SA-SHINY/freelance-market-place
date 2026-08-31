import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/shared/StarRating';
import ServiceCard from '../components/shared/ServiceCard';
import { MapPin, Briefcase, Link as LinkIcon } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ProfilePage = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api.get(`/users/${id}`).then(({ data }) => setData(data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="max-w-5xl mx-auto px-5 py-20 text-center text-ink-400">Loading…</div>;
  if (!data) return <div className="max-w-5xl mx-auto px-5 py-20 text-center text-ink-400">Profile not found</div>;

  const { user, reviews, services } = data;
  const isMe = currentUser?._id === user._id;

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
      <div className="card p-7">
        <div className="flex flex-col sm:flex-row sm:items-start gap-5">
          <div className="w-20 h-20 rounded-full bg-ink-900 text-paper flex items-center justify-center text-2xl font-semibold shrink-0">
            {user.name?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h1 className="font-display text-2xl font-bold text-ink-900">{user.name}</h1>
                <p className="text-sm text-ink-500 capitalize">{user.role}{user.company && ` at ${user.company}`}</p>
              </div>
              {isMe && <a href="/settings" className="btn-secondary text-sm">Edit profile</a>}
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-ink-500">
              <StarRating rating={user.rating} totalReviews={user.totalReviews} />
              {user.location && <span className="flex items-center gap-1"><MapPin size={13} /> {user.location}</span>}
              {user.role === 'freelancer' && <span className="flex items-center gap-1"><Briefcase size={13} /> ${user.hourlyRate || 0}/hr</span>}
              {user.website && <a href={user.website} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-peach-600"><LinkIcon size={13} /> Website</a>}
            </div>
            {user.bio && <p className="text-sm text-ink-600 mt-4 leading-relaxed">{user.bio}</p>}
            {user.skills?.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {user.skills.map((s) => <span key={s} className="badge bg-ink-100 text-ink-600">{s}</span>)}
              </div>
            )}
          </div>
        </div>
      </div>

      {user.role === 'freelancer' && services?.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink-900 mb-4">Services</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {services.map((s) => <ServiceCard key={s._id} service={{ ...s, freelancer: user }} />)}
          </div>
        </div>
      )}

      {user.portfolio?.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-xl font-bold text-ink-900 mb-4">Portfolio</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {user.portfolio.map((p, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="aspect-video bg-ink-100">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />}
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium text-ink-900">{p.title}</p>
                  <p className="text-xs text-ink-500 mt-0.5 line-clamp-2">{p.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-10">
        <h2 className="font-display text-xl font-bold text-ink-900 mb-4">Reviews ({user.totalReviews})</h2>
        {reviews?.length === 0 ? (
          <p className="text-sm text-ink-400">No reviews yet.</p>
        ) : (
          <div className="space-y-5">
            {reviews?.map((r) => (
              <div key={r._id} className="border-b border-ink-100 pb-5">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="w-7 h-7 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center text-xs font-semibold">{r.reviewer?.name?.[0]?.toUpperCase()}</div>
                  <Link to={`/profile/${r.reviewer?._id}`} className="text-sm font-medium text-ink-900 hover:text-peach-600">{r.reviewer?.name}</Link>
                  <span className="text-xs text-ink-300">{formatDistanceToNow(new Date(r.createdAt), { addSuffix: true })}</span>
                </div>
                <StarRating rating={r.rating} showValue={false} size={12} />
                <p className="text-sm text-ink-600 mt-2">{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;
