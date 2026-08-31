import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/shared/StarRating';
import StatusBadge from '../components/shared/StatusBadge';
import toast from 'react-hot-toast';
import { formatDistanceToNow, format } from 'date-fns';

const JobDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [proposal, setProposal] = useState({ coverLetter: '', bidAmount: '', deliveryDays: '' });
  const [submitting, setSubmitting] = useState(false);

  const fetchJob = async () => {
    try {
      const { data } = await api.get(`/jobs/${id}`);
      setJob(data.job);
    } catch {
      toast.error('Could not load this job');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJob(); }, [id]);

  const handleSubmitProposal = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await api.post(`/jobs/${id}/proposals`, {
        coverLetter: proposal.coverLetter,
        bidAmount: Number(proposal.bidAmount),
        deliveryDays: Number(proposal.deliveryDays),
      });
      toast.success('Proposal submitted');
      setShowProposalForm(false);
      fetchJob();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit proposal');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProposalAction = async (proposalId, status) => {
    try {
      await api.put(`/jobs/${id}/proposals/${proposalId}`, { status });
      toast.success(`Proposal ${status}`);
      fetchJob();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleCreateContract = async (proposal) => {
    try {
      const { data } = await api.post('/contracts', {
        freelancerId: proposal.freelancer._id,
        jobId: job._id,
        title: job.title,
        description: job.description,
        totalAmount: proposal.bidAmount,
        paymentType: job.budgetType === 'hourly' ? 'hourly' : 'fixed',
        deadline: new Date(Date.now() + proposal.deliveryDays * 86400000),
      });
      toast.success('Contract created');
      navigate(`/contracts/${data.contract._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create contract');
    }
  };

  if (loading) return <div className="max-w-5xl mx-auto px-5 py-20 text-center text-ink-400">Loading…</div>;
  if (!job) return <div className="max-w-5xl mx-auto px-5 py-20 text-center text-ink-400">Job not found</div>;

  const isOwner = user && job.client?._id === user._id;
  const myProposal = job.proposals?.find((p) => p.freelancer?._id === user?._id);

  return (
    <div className="max-w-5xl mx-auto px-5 sm:px-8 py-10">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          <div className="flex items-center gap-2 mb-3">
            <StatusBadge status={job.status} />
            <span className="text-xs text-ink-400">Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
          </div>
          <h1 className="font-display text-3xl font-bold text-ink-900">{job.title}</h1>

          <div className="flex items-center gap-3 mt-5">
            <div className="w-9 h-9 rounded-full bg-ink-900 text-paper flex items-center justify-center font-semibold">{job.client?.name?.[0]?.toUpperCase()}</div>
            <div>
              <p className="text-sm font-medium text-ink-900">{job.client?.name}{job.client?.company && ` · ${job.client.company}`}</p>
              <StarRating rating={job.client?.rating} size={12} />
            </div>
          </div>

          <div className="mt-8">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-2">Description</h2>
            <p className="text-ink-600 whitespace-pre-line leading-relaxed">{job.description}</p>
          </div>

          {job.skills?.length > 0 && (
            <div className="mt-6">
              <h2 className="font-display text-lg font-bold text-ink-900 mb-2">Skills required</h2>
              <div className="flex flex-wrap gap-2">{job.skills.map((s) => <span key={s} className="badge bg-ink-100 text-ink-600">{s}</span>)}</div>
            </div>
          )}

          {isOwner && (
            <div className="mt-10">
              <h2 className="font-display text-lg font-bold text-ink-900 mb-4">Proposals ({job.proposals?.length || 0})</h2>
              {job.proposals?.length === 0 ? (
                <p className="text-sm text-ink-400">No proposals yet.</p>
              ) : (
                <div className="space-y-4">
                  {job.proposals.map((p) => (
                    <div key={p._id} className="card p-5">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-ink-100 text-ink-700 flex items-center justify-center font-semibold">{p.freelancer?.name?.[0]?.toUpperCase()}</div>
                          <div>
                            <p className="text-sm font-medium text-ink-900">{p.freelancer?.name}</p>
                            <StarRating rating={p.freelancer?.rating} totalReviews={p.freelancer?.totalReviews} size={12} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="tabular text-lg font-bold text-ink-900">${p.bidAmount}</p>
                          <p className="text-xs text-ink-400">{p.deliveryDays} days</p>
                        </div>
                      </div>
                      <p className="text-sm text-ink-600 mt-3">{p.coverLetter}</p>
                      <div className="flex items-center gap-2 mt-4">
                        <StatusBadge status={p.status} />
                        {p.status === 'pending' && job.status === 'open' && (
                          <div className="flex gap-2 ml-auto">
                            <button onClick={() => handleProposalAction(p._id, 'rejected')} className="btn-secondary text-xs px-3 py-1.5">Decline</button>
                            <button onClick={() => handleProposalAction(p._id, 'accepted')} className="btn-accent text-xs px-3 py-1.5">Accept</button>
                          </div>
                        )}
                        {p.status === 'accepted' && (
                          <button onClick={() => handleCreateContract(p)} className="btn-primary text-xs px-3 py-1.5 ml-auto">Create contract</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div>
          <div className="card p-6 sticky top-24">
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-1">Budget</p>
            <p className="tabular text-2xl font-bold text-ink-900">
              ${job.budgetMin}–${job.budgetMax}{job.budgetType === 'hourly' && '/hr'}
            </p>
            <div className="mt-5 space-y-3 text-sm">
              <div className="flex justify-between"><span className="text-ink-400">Type</span><span className="capitalize text-ink-700">{job.budgetType}</span></div>
              <div className="flex justify-between"><span className="text-ink-400">Experience</span><span className="capitalize text-ink-700">{job.experienceLevel}</span></div>
              {job.deadline && <div className="flex justify-between"><span className="text-ink-400">Deadline</span><span className="text-ink-700">{format(new Date(job.deadline), 'MMM d, yyyy')}</span></div>}
              <div className="flex justify-between"><span className="text-ink-400">Proposals</span><span className="text-ink-700">{job.proposals?.length || 0}</span></div>
            </div>

            {!isOwner && user?.role === 'freelancer' && job.status === 'open' && (
              myProposal ? (
                <div className="mt-6 p-3 bg-peach-100/50 rounded-lg text-sm text-peach-700 text-center">
                  You submitted a proposal <StatusBadge status={myProposal.status} />
                </div>
              ) : (
                <button onClick={() => setShowProposalForm((o) => !o)} className="btn-primary w-full mt-6">
                  {showProposalForm ? 'Cancel' : 'Submit a proposal'}
                </button>
              )
            )}

            {!user && (
              <button onClick={() => navigate('/login', { state: { from: `/jobs/${id}` } })} className="btn-primary w-full mt-6">Log in to apply</button>
            )}
          </div>

          {showProposalForm && (
            <form onSubmit={handleSubmitProposal} className="card p-5 mt-4 space-y-4">
              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5">Cover letter</label>
                <textarea required rows={4} className="input-field" value={proposal.coverLetter} onChange={(e) => setProposal({ ...proposal, coverLetter: e.target.value })} placeholder="Explain why you're a good fit" />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5">Your bid (USD)</label>
                <input type="number" required min="1" className="input-field" value={proposal.bidAmount} onChange={(e) => setProposal({ ...proposal, bidAmount: e.target.value })} />
              </div>
              <div>
                <label className="text-sm font-medium text-ink-700 block mb-1.5">Delivery time (days)</label>
                <input type="number" required min="1" className="input-field" value={proposal.deliveryDays} onChange={(e) => setProposal({ ...proposal, deliveryDays: e.target.value })} />
              </div>
              <button type="submit" disabled={submitting} className="btn-accent w-full">{submitting ? 'Submitting…' : 'Submit proposal'}</button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobDetailPage;
