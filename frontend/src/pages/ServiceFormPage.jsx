import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import { Plus, X } from 'lucide-react';

const CATEGORIES = ['Web development', 'Design & creative', 'Writing & translation', 'Marketing', 'Video & animation', 'Data & analytics'];

const emptyPackage = { name: '', description: '', price: '', deliveryDays: '', revisions: 1, features: [''] };

const ServiceFormPage = () => {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const [form, setForm] = useState({
    title: '', description: '', category: CATEGORIES[0], tags: [],
    packages: {
      basic: { ...emptyPackage, name: 'Basic' },
      standard: { ...emptyPackage, name: 'Standard', revisions: 3 },
      premium: { ...emptyPackage, name: 'Premium', revisions: -1 },
    },
  });

  useEffect(() => {
    if (isEdit) {
      api.get(`/services/${id}`).then(({ data }) => setForm(data.service)).catch(() => toast.error('Could not load service'));
    }
  }, [id, isEdit]);

  const updatePackage = (tier, field, value) => {
    setForm((f) => ({ ...f, packages: { ...f.packages, [tier]: { ...f.packages[tier], [field]: value } } }));
  };

  const updateFeature = (tier, idx, value) => {
    const features = [...form.packages[tier].features];
    features[idx] = value;
    updatePackage(tier, 'features', features);
  };

  const addFeature = (tier) => updatePackage(tier, 'features', [...form.packages[tier].features, '']);
  const removeFeature = (tier, idx) => updatePackage(tier, 'features', form.packages[tier].features.filter((_, i) => i !== idx));

  const addTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setForm((f) => ({ ...f, tags: [...new Set([...f.tags, tagInput.trim()])] }));
      setTagInput('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        packages: {
          basic: { ...form.packages.basic, price: Number(form.packages.basic.price), deliveryDays: Number(form.packages.basic.deliveryDays), features: form.packages.basic.features.filter(Boolean) },
          standard: form.packages.standard.price ? { ...form.packages.standard, price: Number(form.packages.standard.price), deliveryDays: Number(form.packages.standard.deliveryDays), features: form.packages.standard.features.filter(Boolean) } : undefined,
          premium: form.packages.premium.price ? { ...form.packages.premium, price: Number(form.packages.premium.price), deliveryDays: Number(form.packages.premium.deliveryDays), features: form.packages.premium.features.filter(Boolean) } : undefined,
        },
      };
      if (isEdit) {
        await api.put(`/services/${id}`, payload);
        toast.success('Service updated');
      } else {
        await api.post('/services', payload);
        toast.success('Service published');
      }
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not save service');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-5 sm:px-8 py-10">
      <h1 className="font-display text-3xl font-bold text-ink-900 mb-1">{isEdit ? 'Edit service' : 'Create a service listing'}</h1>
      <p className="text-ink-500 mb-8">Describe what you offer and set your pricing tiers.</p>

      <form onSubmit={handleSubmit} className="space-y-7">
        <div className="card p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Service title</label>
            <input required className="input-field" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="I will design a modern logo for your brand" />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Description</label>
            <textarea required rows={5} className="input-field" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Explain what's included, your process, and what makes your work stand out." />
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Category</label>
            <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-ink-700 block mb-1.5">Tags</label>
            <input className="input-field" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={addTag} placeholder="Type a tag and press Enter" />
            <div className="flex flex-wrap gap-2 mt-2">
              {form.tags.map((t) => (
                <span key={t} className="badge bg-ink-100 text-ink-600 gap-1">
                  {t}
                  <button type="button" onClick={() => setForm((f) => ({ ...f, tags: f.tags.filter((x) => x !== t) }))}><X size={11} /></button>
                </span>
              ))}
            </div>
          </div>
        </div>

        {['basic', 'standard', 'premium'].map((tier) => (
          <div key={tier} className="card p-6 space-y-4">
            <h3 className="font-display text-lg font-bold text-ink-900 capitalize">{tier} package {tier !== 'basic' && <span className="text-xs font-normal text-ink-400">(optional)</span>}</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5">Price (USD)</label>
                <input type="number" min="5" required={tier === 'basic'} className="input-field" value={form.packages[tier].price} onChange={(e) => updatePackage(tier, 'price', e.target.value)} />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5">Delivery days</label>
                <input type="number" min="1" required={tier === 'basic'} className="input-field" value={form.packages[tier].deliveryDays} onChange={(e) => updatePackage(tier, 'deliveryDays', e.target.value)} />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700 block mb-1.5">Package description</label>
              <input className="input-field" value={form.packages[tier].description} onChange={(e) => updatePackage(tier, 'description', e.target.value)} placeholder="What's included at this tier" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink-700 block mb-1.5">Features</label>
              <div className="space-y-2">
                {form.packages[tier].features.map((f, i) => (
                  <div key={i} className="flex gap-2">
                    <input className="input-field" value={f} onChange={(e) => updateFeature(tier, i, e.target.value)} placeholder="e.g. 2 design concepts" />
                    <button type="button" onClick={() => removeFeature(tier, i)} className="text-blush-500 px-2"><X size={16} /></button>
                  </div>
                ))}
                <button type="button" onClick={() => addFeature(tier)} className="text-sm text-peach-600 font-medium flex items-center gap-1">
                  <Plus size={14} /> Add feature
                </button>
              </div>
            </div>
          </div>
        ))}

        <button type="submit" disabled={loading} className="btn-primary w-full py-3">
          {loading ? 'Saving…' : isEdit ? 'Save changes' : 'Publish service'}
        </button>
      </form>
    </div>
  );
};

export default ServiceFormPage;
