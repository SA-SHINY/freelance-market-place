import { useState } from 'react';
import { Star } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const ReviewForm = ({ contractId, revieweeName, onSubmitted }) => {
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (rating === 0) return toast.error('Please select a star rating');
    setSubmitting(true);
    try {
      await api.post('/reviews', { contractId, rating, comment });
      toast.success('Review submitted');
      onSubmitted?.();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not submit review');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-5 space-y-4">
      <p className="font-semibold text-sm text-ink-900">Leave a review for {revieweeName}</p>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((i) => (
          <button key={i} type="button" onClick={() => setRating(i)} onMouseEnter={() => setHover(i)} onMouseLeave={() => setHover(0)}>
            <Star size={26} className={(hover || rating) >= i ? 'fill-amber-400 text-amber-400' : 'fill-ink-100 text-ink-100'} />
          </button>
        ))}
      </div>
      <textarea required rows={3} className="input-field" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="How did the work go?" />
      <button type="submit" disabled={submitting} className="btn-primary w-full">{submitting ? 'Submitting…' : 'Submit review'}</button>
    </form>
  );
};

export default ReviewForm;
