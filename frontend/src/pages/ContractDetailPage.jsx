import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatusBadge from '../components/shared/StatusBadge';
import RazorpayPaymentForm from '../components/shared/RazorpayPaymentForm';
import ReviewForm from '../components/shared/ReviewForm';
import StarRating from '../components/shared/StarRating';
import toast from 'react-hot-toast';
import { format } from 'date-fns';
import { Send, Lock, CheckCircle2, Trophy, Clock, AlertCircle, RotateCcw } from 'lucide-react';

const ContractDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [contract, setContract] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [deliveryNote, setDeliveryNote] = useState('');
  const [reviewed, setReviewed] = useState(false);
  const [revisionComment, setRevisionComment] = useState('');
  const [showRevisionForm, setShowRevisionForm] = useState(false);
  const [requestingRevision, setRequestingRevision] = useState(false);
  const [existingReview, setExistingReview] = useState(null);
  const messagesEndRef = useRef(null);

  const fetchContract = async () => {
    try {
      const { data } = await api.get(`/contracts/${id}`);
      setContract(data.contract);

      if (data.contract.status === 'completed') {
        try {
          const { data: reviewData } = await api.get(`/reviews/contract/${id}`);
          const myReview = reviewData.reviews?.find(r => r.reviewer?._id === user?._id);
          if (myReview) {
            setExistingReview(myReview);
            setReviewed(true);
          }
        } catch { /* no reviews yet */ }
      }
    } catch {
      toast.error('Could not load contract');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchContract(); }, [id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [contract?.messages]);

  const isClient     = user?._id === contract?.client?._id;
  const isFreelancer = user?._id === contract?.freelancer?._id;

  const handleAccept = async () => {
    try {
      await api.put(`/contracts/${id}/status`, { status: 'active' });
      toast.success('Contract accepted! Waiting for client to fund escrow.');
      fetchContract();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel this contract?')) return;
    try {
      await api.put(`/contracts/${id}/status`, { status: 'cancelled', reason: 'Cancelled by user' });
      toast.success('Contract cancelled');
      fetchContract();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    setSending(true);
    try {
      await api.post(`/contracts/${id}/messages`, { content: message });
      setMessage('');
      fetchContract();
    } catch {
      toast.error('Could not send message');
    } finally {
      setSending(false);
    }
  };

  const handleDeliver = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/contracts/${id}/deliver`, { note: deliveryNote });
      toast.success('Delivery submitted! Waiting for client approval.');
      setDeliveryNote('');
      fetchContract();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit delivery');
    }
  };

  const handleReleasePayment = async () => {
    if (!window.confirm(
      `Approve the delivery and release $${contract.freelancerAmount.toFixed(2)} to ${contract.freelancer.name}?\n\nThis will mark the project as COMPLETED and cannot be undone.`
    )) return;
    try {
      await api.post(`/payments/release/${id}`);
      toast.success('Payment released! Project marked as completed.');
      fetchContract();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not release payment');
    }
  };

  const handleRequestRevision = async (e) => {
    e.preventDefault();
    if (!revisionComment.trim()) return;
    setRequestingRevision(true);
    try {
      await api.post(`/contracts/${id}/revision`, { comment: revisionComment });
      toast.success('Revision requested — freelancer has been notified');
      setRevisionComment('');
      setShowRevisionForm(false);
      fetchContract();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not request revision');
    } finally {
      setRequestingRevision(false);
    }
  };

  if (loading) return (
    <div className="max-w-4xl mx-auto px-5 py-20 text-center">
      <div className="w-8 h-8 border-2 border-ink-200 border-t-peach-500 rounded-full animate-spin mx-auto" />
    </div>
  );

  if (!contract) return (
    <div className="max-w-4xl mx-auto px-5 py-20 text-center text-ink-400">Contract not found</div>
  );

  const otherParty   = isClient ? contract.freelancer : contract.client;
  const escrowFunded = Boolean(contract.razorpayPaymentId);
  const isCompleted  = contract.status === 'completed';
  const isCancelled  = contract.status === 'cancelled';

  return (
    <div className="max-w-4xl mx-auto px-5 sm:px-8 py-10">

      {isCompleted && (
        <div className="bg-peach-500 text-white rounded-xl2 p-6 mb-8 flex items-center gap-4">
          <Trophy size={32} className="shrink-0" />
          <div>
            <p className="font-display text-xl font-bold">Project completed</p>
            <p className="text-peach-100 text-sm mt-1">
              This project was completed on {format(new Date(contract.completedAt), 'MMMM d, yyyy')}.
              {isClient && ' Payment has been released to the freelancer.'}
              {isFreelancer && ' Payment has been transferred to your account.'}
            </p>
          </div>
        </div>
      )}

      {isCancelled && (
        <div className="bg-blush-100 border border-blush-200 rounded-xl2 p-5 mb-8 flex items-center gap-3">
          <AlertCircle size={20} className="text-blush-600 shrink-0" />
          <p className="text-sm text-blush-700">
            This contract was cancelled{contract.cancelledAt && ` on ${format(new Date(contract.cancelledAt), 'MMM d, yyyy')}`}.
            {contract.cancellationReason && ` Reason: ${contract.cancellationReason}`}
          </p>
        </div>
      )}

      <div className="flex items-start justify-between mb-1 flex-wrap gap-2">
        <h1 className="font-display text-2xl font-bold text-ink-900">{contract.title}</h1>
        <StatusBadge status={contract.status} />
      </div>

      <div className="flex items-center gap-3 text-sm text-ink-500 mb-8">
        <span>With <Link to={`/profile/${otherParty?._id}`} className="text-peach-600 font-medium hover:underline">{otherParty?.name}</Link></span>
        <span>·</span>
        <span>Created {format(new Date(contract.createdAt), 'MMM d, yyyy')}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">

          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-3">Project Scope</h2>
            <p className="text-sm text-ink-600 whitespace-pre-line leading-relaxed">
              {contract.description || 'No description provided.'}
            </p>
          </div>

          {contract.status === 'pending' && isFreelancer && (
            <div className="card p-6 border-amber-200 bg-amber-50">
              <h2 className="font-display text-lg font-bold text-ink-900 mb-2">
                You have a new contract offer
              </h2>
              <p className="text-sm text-ink-600 mb-5">
                Review the project scope above. If you accept, the client will be prompted to fund escrow and work can begin.
              </p>
              <div className="flex gap-3">
                <button onClick={handleAccept} className="btn-accent flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={15} /> Accept contract
                </button>
                <button onClick={handleCancel} className="btn-secondary">Decline</button>
              </div>
            </div>
          )}

          {contract.status === 'pending' && isClient && (
            <div className="card p-5 flex items-center gap-3 bg-ink-50">
              <Clock size={18} className="text-ink-400 shrink-0" />
              <div>
                <p className="text-sm font-medium text-ink-700">Waiting for {contract.freelancer?.name} to accept</p>
                <p className="text-xs text-ink-400 mt-0.5">You'll be notified when they respond.</p>
              </div>
              <button onClick={handleCancel} className="ml-auto text-xs text-blush-600 font-medium hover:underline">
                Withdraw
              </button>
            </div>
          )}

          {contract.status === 'active' && isClient && !escrowFunded && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-ink-900 mb-1 flex items-center gap-2">
                <Lock size={16} className="text-peach-500" /> Fund Escrow to Start Work
              </h2>
              <p className="text-sm text-ink-500 mb-5">
                {contract.freelancer?.name} has accepted the contract. Fund the escrow to unlock work — your payment is held securely by Razorpay and only released when you approve the delivered work.
              </p>
              <RazorpayPaymentForm
                contractId={contract._id}
                amount={contract.totalAmount}
                contractTitle={contract.title}
                clientName={user?.name}
                clientEmail={user?.email}
                onSuccess={fetchContract}
              />
            </div>
          )}

          {contract.status === 'active' && escrowFunded && isFreelancer && !contract.deliveredAt && (
            <div className="card p-5 bg-peach-50 border-peach-200">
              <div className="flex items-center gap-3 mb-4">
                <CheckCircle2 size={20} className="text-peach-500 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-peach-800">Escrow funded — you can start work!</p>
                  <p className="text-xs text-peach-600 mt-0.5">${contract.totalAmount.toFixed(2)} is secured. Complete the work and submit your delivery below.</p>
                </div>
              </div>
              <h3 className="font-semibold text-sm text-ink-900 mb-2">Submit your delivery</h3>
              <form onSubmit={handleDeliver} className="space-y-3">
                <textarea
                  required rows={4} className="input-field"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder="Describe what you've completed. Include links to files, GitHub repos, live URLs, or Google Drive."
                />
                <button type="submit" className="btn-accent w-full">
                  Submit delivery for review
                </button>
              </form>
            </div>
          )}

          {contract.status === 'active' && escrowFunded && isClient && !contract.deliveredAt && (
            <div className="card p-5 flex items-center gap-3 bg-peach-50 border-peach-200">
              <CheckCircle2 size={18} className="text-peach-500 shrink-0" />
              <div>
                <p className="text-sm font-medium text-peach-800">Escrow funded — waiting for delivery</p>
                <p className="text-xs text-peach-600 mt-0.5">Payment ID: <span className="tabular">{contract.razorpayPaymentId}</span></p>
              </div>
            </div>
          )}

          {contract.deliveredAt && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-ink-900 mb-3 flex items-center gap-2">
                <CheckCircle2 size={18} className="text-peach-500" />
                {isCompleted ? 'Delivery Accepted' : 'Delivery Submitted — Awaiting Approval'}
              </h2>
              <div className="bg-ink-50 rounded-lg p-4 mb-4">
                <p className="text-sm text-ink-700 leading-relaxed">{contract.deliveryNote}</p>
              </div>
              <p className="text-xs text-ink-400">
                Delivered on {format(new Date(contract.deliveredAt), 'MMMM d, yyyy \'at\' h:mm a')}
              </p>

              {isClient && contract.status === 'active' && (
                <div className="mt-5 space-y-3">
                  <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                    <p className="text-sm font-semibold text-ink-900 mb-1">Satisfied with the work?</p>
                    <p className="text-xs text-ink-500 mb-4">
                      Approving releases <span className="tabular font-semibold text-ink-900">${contract.freelancerAmount.toFixed(2)}</span> to {contract.freelancer?.name} and marks the project <strong>Completed</strong>.
                    </p>
                    <button onClick={handleReleasePayment} className="btn-accent w-full flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={15} /> Approve & Release Payment — ${contract.freelancerAmount.toFixed(2)}
                    </button>
                  </div>
                  <div className="p-4 bg-blush-100/60 border border-blush-200 rounded-lg">
                    <p className="text-sm font-semibold text-ink-900 mb-1">Need changes?</p>
                    <p className="text-xs text-ink-500 mb-3">
                      Request a revision — the freelancer will be notified and can resubmit their work.
                    </p>
                    {!showRevisionForm ? (
                      <button onClick={() => setShowRevisionForm(true)} className="btn-secondary text-sm w-full flex items-center justify-center gap-1.5">
                        <RotateCcw size={14} /> Request revision
                      </button>
                    ) : (
                      <form onSubmit={handleRequestRevision} className="space-y-2">
                        <textarea
                          required rows={3} className="input-field text-sm"
                          value={revisionComment}
                          onChange={e => setRevisionComment(e.target.value)}
                          placeholder="Describe what needs to be changed or improved…"
                        />
                        <div className="flex gap-2">
                          <button type="submit" disabled={requestingRevision} className="btn-primary flex-1 text-sm">
                            {requestingRevision ? 'Sending…' : 'Send revision request'}
                          </button>
                          <button type="button" onClick={() => setShowRevisionForm(false)} className="btn-secondary text-sm px-3">
                            Cancel
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              )}

              {isFreelancer && contract.status === 'active' && (
                <div className="mt-4 p-3 bg-ink-50 rounded-lg text-sm text-ink-500 text-center">
                  Waiting for {contract.client?.name} to review and approve your delivery.
                </div>
              )}
            </div>
          )}

          {isCompleted && (
            <div className="card p-6">
              <h2 className="font-display text-lg font-bold text-ink-900 mb-4">Review</h2>
              {reviewed && existingReview ? (
                <div className="bg-ink-50 rounded-lg p-4">
                  <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">Your review</p>
                  <StarRating rating={existingReview.rating} showValue={false} size={16} />
                  <p className="text-sm text-ink-700 mt-2">{existingReview.comment}</p>
                </div>
              ) : (
                <ReviewForm
                  contractId={contract._id}
                  revieweeName={otherParty?.name}
                  onSubmitted={() => { setReviewed(true); fetchContract(); }}
                />
              )}
            </div>
          )}

          <div className="card p-6">
            <h2 className="font-display text-lg font-bold text-ink-900 mb-4">Messages</h2>
            <div className="space-y-3 max-h-80 overflow-y-auto scrollbar-thin mb-4 pr-1">
              {(!contract.messages || contract.messages.length === 0) && (
                <p className="text-sm text-ink-400 text-center py-4">No messages yet.</p>
              )}
              {contract.messages?.map((m, i) => {
                const fromMe = m.sender?._id === user?._id;
                return (
                  <div key={i} className={`flex ${fromMe ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-xl px-4 py-2.5 text-sm ${fromMe ? 'bg-ink-900 text-paper' : 'bg-ink-100 text-ink-700'}`}>
                      <p>{m.content}</p>
                      <p className={`text-xs mt-1 ${fromMe ? 'text-ink-400' : 'text-ink-400'}`}>
                        {format(new Date(m.createdAt), 'h:mm a')}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
            {!isCancelled && (
              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  className="input-field"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write a message…"
                />
                <button type="submit" disabled={sending} className="btn-primary px-4">
                  <Send size={16} />
                </button>
              </form>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="card p-6 sticky top-24">
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-1">Contract Value</p>
            <p className="tabular text-3xl font-bold text-ink-900">${contract.totalAmount.toFixed(2)}</p>

            <div className="mt-5 space-y-2.5 text-sm border-t border-ink-100 pt-4">
              <div className="flex justify-between">
                <span className="text-ink-400">Platform fee (10%)</span>
                <span className="tabular text-ink-700">${contract.platformFee.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Freelancer receives</span>
                <span className="tabular font-medium text-ink-900">${contract.freelancerAmount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-400">Payment type</span>
                <span className="capitalize text-ink-700">{contract.paymentType}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-400">Escrow</span>
                <span className={`font-semibold text-sm flex items-center gap-1 ${escrowFunded ? 'text-peach-600' : 'text-ink-400'}`}>
                  {escrowFunded ? <><CheckCircle2 size={13} /> Funded</> : 'Not funded'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-ink-400">Status</span>
                <StatusBadge status={contract.status} />
              </div>
              {contract.deadline && (
                <div className="flex justify-between">
                  <span className="text-ink-400">Deadline</span>
                  <span className="text-ink-700">{format(new Date(contract.deadline), 'MMM d, yyyy')}</span>
                </div>
              )}
              {isCompleted && contract.completedAt && (
                <div className="flex justify-between">
                  <span className="text-ink-400">Completed</span>
                  <span className="text-peach-600 font-medium">{format(new Date(contract.completedAt), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>

            <div className="mt-5 pt-4 border-t border-ink-100">
              <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">
                {isClient ? 'Freelancer' : 'Client'}
              </p>
              <Link to={`/profile/${otherParty?._id}`} className="flex items-center gap-2 hover:opacity-80">
                <div className="w-8 h-8 rounded-full bg-ink-900 text-paper flex items-center justify-center text-sm font-semibold">
                  {otherParty?.name?.[0]?.toUpperCase()}
                </div>
                <span className="text-sm font-medium text-ink-900">{otherParty?.name}</span>
              </Link>
            </div>

            {['pending', 'active'].includes(contract.status) && (
              <button onClick={handleCancel} className="text-xs text-blush-500 font-medium mt-5 hover:underline w-full text-left">
                Cancel contract
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContractDetailPage;
