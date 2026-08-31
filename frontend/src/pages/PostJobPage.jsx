import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';

const CATEGORIES = ['Web development', 'Design & creative', 'Writing & translation', 'Marketing', 'Video & animation', 'Data & analytics'];

const PostJobPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', category: CATEGORIES[0], skills: [],
    budgetType: 'fixed', budgetMin: '', budgetMax: '', deadline: '',
    duration: '1_to_3_months', experienceLevel: 'intermediate',
  });

  const addSkill = (e) => {
    if (e.key === 'Enter' && skillInput.trim()) {
      e.preventDefault();
      setForm((f) => ({ ...f, skills: [...new Set([...f.skills, skillInput.trim()])] }));
      setSkillInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/jobs', {
        ...form,
        budgetMin: Number(form.budgetMin),
        budgetMax: Number(form.budgetMax),
      });
      toast.success('Job posted');
      navigate(`/jobs/${data.job._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not post job');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-ink-900 mb-1">Post a job</h1>
      <p className="text-ink-500 mb-8">Describe what you need done and start receiving proposals.</p>

      <form onSubmit={handleSubmit} className="card p-6 space-y-5">
        <div>
          <label className="text-sm font-medium text-ink-700 block mb-1.5">Job title</label>
          <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Build a responsive marketing website" />
        </div>
        <div>
          <label className="text-sm font-medium text-ink-700 block mb-1.5">Description</label>
          <textarea required rows={6} className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What needs to be done, and what does success look like?" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Category</label>
            <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Experience level</label>
            <select className="input-field" value={form.experienceLevel} onChange={(e) => setForm({ ...form, experienceLevel: e.target.value })}>
              <option value="entry">Entry</option>
              <option value="intermediate">Intermediate</option>
              <option value="expert">Expert</option>
            </select>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-ink-700 block mb-1.5">Skills</label>
          <input className="input-field" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={addSkill} placeholder="Type a skill and press Enter" />
          <div className="flex flex-wrap gap-2 mt-2">
            {form.skills.map((s) => (
              <span key={s} className="badge bg-ink-100 text-ink-600 gap-1">
                {s}
                <button type="button" onClick={() => setForm((f) => ({ ...f, skills: f.skills.filter((x) => x !== s) }))}><X size={11} /></button>
              </span>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Budget type</label>
            <select className="input-field" value={form.budgetType} onChange={(e) => setForm({ ...form, budgetType: e.target.value })}>
              <option value="fixed">Fixed price</option>
              <option value="hourly">Hourly</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Min budget</label>
            <input type="number" required min="1" className="input-field" value={form.budgetMin} onChange={(e) => setForm({ ...form, budgetMin: e.target.value })} />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Max budget</label>
            <input type="number" required min="1" className="input-field" value={form.budgetMax} onChange={(e) => setForm({ ...form, budgetMax: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Project duration</label>
            <select className="input-field" value={form.duration} onChange={(e) => setForm({ ...form, duration: e.target.value })}>
              <option value="less_than_1_month">Less than 1 month</option>
              <option value="1_to_3_months">1 to 3 months</option>
              <option value="3_to_6_months">3 to 6 months</option>
              <option value="more_than_6_months">More than 6 months</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Deadline</label>
            <input type="date" className="input-field" value={form.deadline} onChange={(e) => setForm({ ...form, deadline: e.target.value })} />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full py-3">{loading ? 'Posting…' : 'Post job'}</button>
      </form>
    </div>
  );
};

export default PostJobPage;
