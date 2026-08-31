import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import ServiceCard from '../components/shared/ServiceCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = ['Web development', 'Design & creative', 'Writing & translation', 'Marketing', 'Video & animation', 'Data & analytics'];

const ServicesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [services, setServices] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    minPrice: '',
    maxPrice: '',
    rating: '',
    sort: '-createdAt',
    page: 1,
  });

  const fetchServices = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const { data } = await api.get('/services', { params });
      setServices(data.services);
      setPagination(data.pagination);
    } catch {
      setServices([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
    if (key === 'search' || key === 'category') setSearchParams({ [key]: value });
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink-900">Browse services</h1>
        <p className="text-ink-500 mt-1.5">{pagination.total} services from freelancers ready to work</p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
          <input
            value={filters.search}
            onChange={(e) => updateFilter('search', e.target.value)}
            placeholder="Search services…"
            className="input-field pl-10"
          />
        </div>
        <button onClick={() => setFiltersOpen((o) => !o)} className="btn-secondary flex items-center gap-2">
          <SlidersHorizontal size={15} /> Filters
        </button>
        <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} className="input-field max-w-[180px]">
          <option value="-createdAt">Newest</option>
          <option value="-rating">Top rated</option>
          <option value="packages.basic.price">Price: low to high</option>
          <option value="-packages.basic.price">Price: high to low</option>
        </select>
      </div>

      {filtersOpen && (
        <div className="card p-5 mb-6 grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">Category</label>
            <select value={filters.category} onChange={(e) => updateFilter('category', e.target.value)} className="input-field">
              <option value="">All categories</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">Min price</label>
            <input type="number" value={filters.minPrice} onChange={(e) => updateFilter('minPrice', e.target.value)} className="input-field" placeholder="$0" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">Max price</label>
            <input type="number" value={filters.maxPrice} onChange={(e) => updateFilter('maxPrice', e.target.value)} className="input-field" placeholder="No limit" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">Min rating</label>
            <select value={filters.rating} onChange={(e) => updateFilter('rating', e.target.value)} className="input-field">
              <option value="">Any rating</option>
              <option value="4">4+ stars</option>
              <option value="4.5">4.5+ stars</option>
            </select>
          </div>
          <button
            onClick={() => setFilters({ search: '', category: '', minPrice: '', maxPrice: '', rating: '', sort: '-createdAt', page: 1 })}
            className="text-sm text-blush-600 font-medium flex items-center gap-1 sm:col-span-4 justify-end"
          >
            <X size={14} /> Clear filters
          </button>
        </div>
      )}

      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <div key={i} className="aspect-[4/3] bg-ink-100 rounded-xl2 animate-pulse" />)}
        </div>
      ) : services.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-xl text-ink-700">No services match those filters</p>
          <p className="text-ink-400 mt-1.5 text-sm">Try widening your search or clearing filters above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
          {services.map((s) => <ServiceCard key={s._id} service={s} />)}
        </div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))}
              className={`w-9 h-9 rounded-lg text-sm font-medium ${pagination.page === i + 1 ? 'bg-ink-900 text-paper' : 'bg-white border border-ink-200 text-ink-600'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
