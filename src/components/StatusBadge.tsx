import { ProjectStatus } from '@/lib/types';

const statusStyles: Record<ProjectStatus, string> = {
  Active: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  Completed: 'bg-blue-50 text-blue-700 ring-blue-600/20',
  'On Hold': 'bg-amber-50 text-amber-700 ring-amber-600/20',
  Pending: 'bg-slate-50 text-slate-700 ring-slate-600/20',
};

export default function StatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ring-1 ring-inset ${statusStyles[status]}`}>
      {status}
    </span>
  );
}
