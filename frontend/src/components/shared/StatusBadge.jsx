const STYLES = {
  open: 'bg-sage-100 text-sage-600',
  in_progress: 'bg-amber-100 text-amber-600',
  completed: 'bg-sage-100 text-sage-600',
  cancelled: 'bg-blush-100 text-blush-600',
  pending: 'bg-ink-100 text-ink-600',
  active: 'bg-amber-100 text-amber-600',
  paused: 'bg-ink-100 text-ink-600',
  disputed: 'bg-blush-100 text-blush-600',
  accepted: 'bg-sage-100 text-sage-600',
  rejected: 'bg-blush-100 text-blush-600',
  withdrawn: 'bg-ink-100 text-ink-500',
};

const LABELS = {
  in_progress: 'In progress',
};

const StatusBadge = ({ status }) => (
  <span className={`badge ${STYLES[status] || 'bg-ink-100 text-ink-600'}`}>
    {LABELS[status] || status?.replace(/_/g, ' ')}
  </span>
);

export default StatusBadge;
