import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../services/api';
import JobCard from '../components/shared/JobCard';
import { Search, SlidersHorizontal, X } from 'lucide-react';

const CATEGORIES = ['Web development', 'Design & creative', 'Writing & translation', 'Marketing', 'Video & animation', 'Data & analytics'];

const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    category: searchParams.get('category') || '',
    experienceLevel: '',
    budgetMin: '',
    budgetMax: '',
    sort: '-createdAt',
    page: 1,
  });

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const { data } = await api.get('/jobs', { params });
      setJobs(data.jobs);
      setPagination(data.pagination);
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchJobs(); }, [fetchJobs]);

  const updateFilter = (key, value) => {
    setFilters((f) => ({ ...f, [key]: value, page: 1 }));
    if (key === 'search' || key === 'category') setSearchParams({ [key]: value });
  };

  return (
    <div className="max-w-7xl mx-auto px-5 sm:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold text-ink-900">Find work</h1>
        <p className="text-ink-500 mt-1.5">{pagination.total} open jobs waiting for proposals</p>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-300" />
          <input value={filters.search} onChange={(e) => updateFilter('search', e.target.value)} placeholder="Search jobs…" className="input-field pl-10" />
        </div>
        <button onClick={() => setFiltersOpen((o) => !o)} className="btn-secondary flex items-center gap-2">
          <SlidersHorizontal size={15} /> Filters
        </button>
        <select value={filters.sort} onChange={(e) => updateFilter('sort', e.target.value)} className="input-field max-w-[180px]">
          <option value="-createdAt">Newest</option>
          <option value="-budgetMax">Highest budget</option>
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
            <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">Experience level</label>
            <select value={filters.experienceLevel} onChange={(e) => updateFilter('experienceLevel', e.target.value)} className="input-field">
              <option value="">Any level</option>
              <option value="entry">Entry</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">Min budget</label>
            <input type="number" value={filters.budgetMin} onChange={(e) => updateFilter('budgetMin', e.target.value)} className="input-field" placeholder="$0" />
          </div>
          <div>
            <label className="text-xs font-semibold text-ink-500 uppercase tracking-wide block mb-1.5">Max budget</label>
            <input type="number" value={filters.budgetMax} onChange={(e) => updateFilter('budgetMax', e.target.value)} className="input-field" placeholder="No limit" />
          </div>
          <button
            onClick={() => setFilters({ search: '', category: '', experienceLevel: '', budgetMin: '', budgetMax: '', sort: '-createdAt', page: 1 })}
            className="text-sm text-blush-600 font-medium flex items-center gap-1 sm:col-span-4 justify-end"
          >
            <X size={14} /> Clear filters
          </button>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">{Array.from({ length: 5 }).map((_, i) => <div key={i} className="h-36 bg-ink-100 rounded-xl2 animate-pulse" />)}</div>
      ) : jobs.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-xl text-ink-700">No jobs match those filters</p>
        </div>
      ) : (
        <div className="space-y-4">{jobs.map((j) => <JobCard key={j._id} job={j} />)}</div>
      )}

      {pagination.pages > 1 && (
        <div className="flex justify-center gap-2 mt-10">
          {Array.from({ length: pagination.pages }).map((_, i) => (
            <button key={i} onClick={() => setFilters((f) => ({ ...f, page: i + 1 }))} className={`w-9 h-9 rounded-lg text-sm font-medium ${pagination.page === i + 1 ? 'bg-ink-900 text-paper' : 'bg-white border border-ink-200 text-ink-600'}`}>
              {i + 1}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default JobsPage;
