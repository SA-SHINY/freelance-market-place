import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';

const JobCard = ({ job }) => (
  <Link to={`/jobs/${job._id}`} className="card p-6 block hover:border-peach-300 hover:shadow-lift transition-all">
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="font-display text-lg font-bold text-ink-900">{job.title}</p>
        <p className="text-xs text-ink-400 mt-1">Posted {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })} by {job.client?.name}</p>
      </div>
      <div className="text-right shrink-0">
        <p className="tabular text-sm font-semibold text-ink-900">
          {job.budgetType === 'hourly' ? `$${job.budgetMin}–${job.budgetMax}/hr` : `$${job.budgetMin}–${job.budgetMax}`}
        </p>
        <p className="text-xs text-ink-400">{job.budgetType === 'hourly' ? 'Hourly' : 'Fixed price'}</p>
      </div>
    </div>
    <p className="text-sm text-ink-600 mt-3 line-clamp-2">{job.description}</p>
    <div className="flex flex-wrap gap-2 mt-4">
      {job.skills?.slice(0, 5).map((s) => <span key={s} className="badge bg-ink-100 text-ink-600">{s}</span>)}
    </div>
    <div className="flex items-center gap-4 mt-4 text-xs text-ink-400">
      <span>{job.proposals?.length || 0} proposals</span>
      <span className="capitalize">{job.experienceLevel} level</span>
    </div>
  </Link>
);

export default JobCard;
