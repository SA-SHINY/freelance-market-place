import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, size = 14, showValue = true, totalReviews }) => {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            size={size}
            className={i <= Math.round(rating) ? 'fill-amber-400 text-amber-400' : 'fill-ink-100 text-ink-100'}
          />
        ))}
      </div>
      {showValue && (
        <span className="text-xs font-medium text-ink-600 tabular ml-0.5">
          {rating > 0 ? rating.toFixed(1) : 'New'}
          {totalReviews !== undefined && totalReviews > 0 && ` (${totalReviews})`}
        </span>
      )}
    </div>
  );
};

export default StarRating;
