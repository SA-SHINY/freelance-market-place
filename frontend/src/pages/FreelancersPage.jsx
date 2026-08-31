import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import StarRating from '../components/shared/StarRating';
import { Search, SlidersHorizontal, X, MapPin, Briefcase, ChevronRight } from 'lucide-react';

const CATEGORIES = [
  'Web development', 'Design & creative', 'Writing & translation',
  'Marketing', 'Video & animation', 'Data & analytics',
];

const ServicePreviewCard = ({ service }) => (
  <Link
    to={`/services/${service._id}`}
    onClick={e => e.stopPropagation()}
    className="flex-shrink-0 w-36 rounded-lg border border-ink-100 overflow-hidden hover:border-peach-300 hover:shadow-md transition-all bg-white"
  >
    <div className="h-20 bg-ink-100 flex items-center justify-center overflow-hidden">
      {service.images?.[0] ? (
        <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover" />
      ) : (
        <span className="text-2xl font-display text-ink-300">{service.title?.[0]}</span>
      )}
    </div>
    <div className="p-2">
      <p className="text-xs font-medium text-ink-800 line-clamp-2 leading-tight">{service.title}</p>
      <p className="tabular text-xs font-bold text-peach-600 mt-1">
        From ${service.packages?.basic?.price}
      </p>
    </div>
  </Link>
);

const FreelancerCard = ({ freelancer }) => (
  <div className="card overflow-hidden hover:shadow-lift hover:border-peach-200 transition-all">
    <div className="p-5">
      <div className="flex items-start gap-4">
        <Link to={`/profile/${freelancer._id}`} className="shrink-0">
          <div className="w-14 h-14 rounded-full bg-ink-900 text-paper flex items-center justify-center text-xl font-semibold overflow-hidden">
            {freelancer.avatar ? (
              <img src={freelancer.avatar} alt={freelancer.name} className="w-full h-full object-cover" />
            ) : freelancer.name?.[0]?.toUpperCase()}
          </div>
        </Link>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 flex-wrap">
            <div>
              <Link to={`/profile/${freelancer._id}`}>
                <p className="font-display font-bold text-ink-900 text-lg hover:text-peach-600 transition-colors">
                  {freelancer.name}
                </p>
              </Link>
              <p className="text-sm text-peach-600 font-medium">{freelancer.category || 'Freelancer'}</p>
            </div>
            <div className="text-right">
              <p className="tabular text-lg font-bold text-ink-900">${freelancer.hourlyRate || 0}<span className="text-xs font-normal text-ink-400">/hr</span></p>
              <span className={`badge text-xs mt-0.5 ${
                freelancer.availability === 'available'
                  ? 'bg-peach-100 text-peach-600'
                  : freelancer.availability === 'busy'
                  ? 'bg-amber-100 text-amber-600'
                  : 'bg-ink-100 text-ink-400'
              }`}>
                {freelancer.availability === 'available' ? '● Available' : freelancer.availability === 'busy' ? '● Busy' : '● Unavailable'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-1.5 flex-wrap">
            <StarRating rating={freelancer.rating} totalReviews={freelancer.totalReviews} size={12} />
            {freelancer.location && (
              <span className="text-xs text-ink-400 flex items-center gap-1">
                <MapPin size={11} />{freelancer.location}
              </span>
            )}
            {freelancer.totalReviews > 0 && (
              <span className="text-xs text-ink-400 flex items-center gap-1">
                <Briefcase size={11} />{freelancer.totalReviews} completed
              </span>
            )}
          </div>
        </div>
      </div>

      {freelancer.bio && (
        <p className="text-sm text-ink-500 mt-3 line-clamp-2">{freelancer.bio}</p>
      )}

      {freelancer.skills?.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-3">
          {freelancer.skills.slice(0, 5).map(s => (
            <span key={s} className="badge bg-ink-100 text-ink-600 text-xs">{s}</span>
          ))}
          {freelancer.skills.length > 5 && (
            <span className="badge bg-ink-100 text-ink-400 text-xs">+{freelancer.skills.length - 5} more</span>
          )}
        </div>
      )}
    </div>
    {freelancer.services?.length > 0 && (
      <div className="border-t border-ink-100 px-5 py-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-xs font-semibold text-ink-500 uppercase tracking-wide">Services</p>
          <Link
            to={`/profile/${freelancer._id}`}
            className="text-xs text-peach-600 font-medium flex items-center gap-0.5 hover:underline"
          >
            View all <ChevronRight size={12} />
          </Link>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-thin">
          {freelancer.services.map(s => (
            <ServicePreviewCard key={s._id} service={s} />
          ))}
        </div>
      </div>
    )}

    <div className="px-5 pb-5 pt-3 flex gap-2">
      <Link to={`/profile/${freelancer._id}`} className="btn-primary flex-1 text-center text-sm">
        View profile
      </Link>
      {freelancer.services?.length > 0 && (
        <Link to={`/services/${freelancer.services[0]._id}`} className="btn-secondary flex-1 text-center text-sm">
          Hire now
        </Link>
      )}
    </div>
  </div>
);

const FreelancersPage = () => {
  const [freelancers, setFreelancers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    search: '', category: '', minRate: '', maxRate: '',
    rating: '', availability: '', sort: '-rating', page: 1,
  });

  const fetchFreelancers = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const { data } = await api.get('/users/freelancers', { params });
      setFreelancers(data.freelancers);
      setPagination(data.pagination);
    } catch {
      setFreelancers([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchFreelancers(); }, [fetchFreelancers]);

  const updateFilter = (key, value) => setFilters(f => ({ ...f, [key]: value, page: 1 }));
  const clearFilters = () => setFilters({ search:'', category:'', minRate:'', maxRate:'', rating:'', availability:'', sort:'-rating', page:1 });

  const activeFilterCount = [filters.category, filters.minRate, filters.maxRate, filters.rating, filters.availability].filter(Boolean).length;

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
      <div className="mb-8">
        <p className="tabular text-xs text-peach-600 font-semibold tracking-wider mb-2">HIRE TALENT</p>
        <h1 className="font-display text-3xl font-bold text-ink-900">Find a Freelancer</h1>
        <p className="text-ink-500 mt-1.5">
          {pagination.total} freelancers across {CATEGORIES.length} categories — browse their profiles and services
        </p>
      </div>
      <div className="flex gap-2 flex-wrap mb-6">
        <button
          onClick={() => updateFilter('category', '')}
          className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${!filters.category ? 'bg-ink-900 text-paper' : 'bg-white border border-ink-200 text-ink-600 hover:border-ink-400'}`}
        >
          All
        </button>
        {CATEGORIES.map(c => (
          <button
            key={c}
            onClick={() => updateFilter('category', filters.category === c ? '' : c)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${filters.category === c ? 'bg-ink-900 text-paper' : 'bg-white border border-ink-200 text-ink-600 hover:border-ink-400'}`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="flex gap-3 mb-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            placeholder="Search by name, skill, or keyword…"
            className="input-field pl-10"
          />
        </div>
        <button
          onClick={() => setFiltersOpen(o => !o)}
          className={`btn-secondary flex items-center gap-2 ${activeFilterCount > 0 ? 'border-peach-400 text-peach-700' : ''}`}
        >
          <SlidersHorizontal size={15} />
          Filters
          {activeFilterCount > 0 && (
            <span className="w-5 h-5 bg-peach-500 text-white rounded-full text-xs flex items-center justify-center font-bold">{activeFilterCount}</span>
          )}
        </button>
        <select value={filters.sort} onChange={e => updateFilter('sort', e.target.value)} className="input-field max-w-[200px]">
          <option value="-rating">Top rated</option>
          <option value="-totalReviews">Most reviewed</option>
          <option value="hourlyRate">Rate: low → high</option>
          <option value="-hourlyRate">Rate: high → low</option>
          <option value="-createdAt">Newest</option>
        </select>
      </div>

      {filtersOpen && (
        <div className="card p-5 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">Min rating</label>
            <select value={filters.rating} onChange={e => updateFilter('rating', e.target.value)} className="input-field">
              <option value="">Any rating</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">Min rate ($/hr)</label>
            <input type="number" value={filters.minRate} onChange={e => updateFilter('minRate', e.target.value)} className="input-field" placeholder="$0" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">Max rate ($/hr)</label>
            <input type="number" value={filters.maxRate} onChange={e => updateFilter('maxRate', e.target.value)} className="input-field" placeholder="No limit" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">Availability</label>
            <select value={filters.availability} onChange={e => updateFilter('availability', e.target.value)} className="input-field">
              <option value="">Any</option>
              <option value="available">Available now</option>
              <option value="busy">Busy</option>
            </select>
          </div>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="text-sm text-blush-600 font-medium flex items-center gap-1 sm:col-span-4 justify-end">
              <X size={14} /> Clear all filters
            </button>
          )}
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-64 bg-ink-100 rounded-xl2 animate-pulse" />
          ))}
        </div>
      ) : freelancers.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-2xl text-ink-700">No freelancers found</p>
          <p className="text-ink-400 mt-2 text-sm">Try clearing some filters or a different search term.</p>
          {activeFilterCount > 0 && (
            <button onClick={clearFilters} className="btn-secondary mt-4">Clear filters</button>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-ink-400 mb-4">{pagination.total} result{pagination.total !== 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {freelancers.map(f => <FreelancerCard key={f._id} freelancer={f} />)}
          </div>
        </>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setFilters(f => ({ ...f, page: i + 1 }))}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${pagination.page === i + 1 ? 'bg-ink-900 text-paper' : 'bg-white border border-ink-200 text-ink-600 hover:border-ink-400'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FreelancersPage;
