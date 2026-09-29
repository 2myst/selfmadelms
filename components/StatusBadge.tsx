import { STATUS_LABEL, type Status } from '@/lib/grading';

export function StatusBadge({ status }: { status: Status }) {
  return <span className={`badge badge-${status}`}>{STATUS_LABEL[status]}</span>;
}
