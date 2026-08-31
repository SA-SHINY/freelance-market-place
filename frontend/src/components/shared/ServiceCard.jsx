import { Link } from 'react-router-dom';
import StarRating from './StarRating';

const ServiceCard = ({ service }) => (
  <Link to={`/services/${service._id}`} className="card overflow-hidden group hover:shadow-lift transition-shadow">
    <div className="aspect-[4/3] bg-ink-100 overflow-hidden">
      {service.images?.[0] ? (
        <img src={service.images[0]} alt={service.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-ink-300 font-display text-3xl">
          {service.title?.[0]}
        </div>
      )}
    </div>
    <div className="p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className="w-6 h-6 rounded-full bg-ink-900 text-paper flex items-center justify-center text-xs font-semibold shrink-0">
          {service.freelancer?.name?.[0]?.toUpperCase()}
        </div>
        <span className="text-xs font-medium text-ink-600 truncate">{service.freelancer?.name}</span>
      </div>
      <p className="text-sm font-medium text-ink-900 line-clamp-2 leading-snug min-h-[2.5rem]">{service.title}</p>
      <div className="flex items-center justify-between mt-3">
        <StarRating rating={service.rating} totalReviews={service.totalReviews} size={12} />
        <div className="text-right">
          <span className="text-xs text-ink-400">From </span>
          <span className="tabular text-sm font-semibold text-ink-900">${service.packages?.basic?.price}</span>
        </div>
      </div>
    </div>
  </Link>
);

export default ServiceCard;
