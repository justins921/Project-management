import { projects, getClient, getTeamMember } from '@/lib/data';
import StatusBadge from '@/components/StatusBadge';
import ServiceBadge from '@/components/ServiceBadge';
import Avatar from '@/components/Avatar';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projects.find((p) => p.id === id);
  if (!project) return notFound();

  const client = getClient(project.clientId);
  const members = project.teamMemberIds.map(getTeamMember).filter(Boolean);

  const startDate = new Date(project.startDate);
  const endDate = new Date(project.endDate);
  const today = new Date();
  const totalDuration = endDate.getTime() - startDate.getTime();
  const elapsed = today.getTime() - startDate.getTime();
  const progress = Math.min(100, Math.max(0, Math.round((elapsed / totalDuration) * 100)));

  const details = [
    { label: 'Client', value: client?.name || 'Unknown' },
    { label: 'Contact', value: client?.contactName || 'Unknown' },
    { label: 'Contact Email', value: client?.contactEmail || 'Unknown' },
    { label: 'Service', value: project.service, badge: true },
    { label: 'Platform', value: project.platform },
    { label: 'Hosting', value: project.hostingLocation },
    { label: 'Start Date', value: startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
    { label: 'End Date', value: endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) },
    { label: 'Budget', value: project.budget ? `$${project.budget.toLocaleString()}` : 'Not set' },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted">
        <Link href="/projects" className="hover:text-accent transition-colors">
          Projects
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-foreground font-medium">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-card-bg rounded-xl border border-card-border p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground">{project.name}</h1>
            <p className="text-muted mt-1">
              <Link href={`/clients/${client?.id}`} className="hover:text-accent transition-colors">
                {client?.name}
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge status={project.status} />
            <ServiceBadge service={project.service} />
          </div>
        </div>

        {project.description && (
          <p className="text-sm text-muted mb-6">{project.description}</p>
        )}

        {/* Progress bar */}
        <div className="mb-2 flex items-center justify-between text-xs text-muted">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              project.status === 'Completed'
                ? 'bg-emerald-500'
                : project.status === 'On Hold'
                ? 'bg-amber-500'
                : 'bg-accent'
            }`}
            style={{ width: `${project.status === 'Completed' ? 100 : progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 bg-card-bg rounded-xl border border-card-border shadow-sm">
          <div className="px-6 py-4 border-b border-card-border">
            <h2 className="text-lg font-semibold text-foreground">Project Details</h2>
          </div>
          <div className="p-6">
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
              {details.map((detail) => (
                <div key={detail.label}>
                  <dt className="text-xs font-medium text-muted uppercase tracking-wider mb-1">
                    {detail.label}
                  </dt>
                  <dd className="text-sm font-medium text-foreground">
                    {detail.label === 'Contact Email' ? (
                      <a href={`mailto:${detail.value}`} className="text-accent hover:text-accent-hover">
                        {detail.value}
                      </a>
                    ) : (
                      detail.value
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>

          {/* Contract section */}
          <div className="px-6 py-4 border-t border-card-border">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Contract</h3>
                <p className="text-xs text-muted mt-0.5">
                  {project.contractUrl ? 'Contract uploaded' : 'No contract uploaded yet'}
                </p>
              </div>
              <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-accent bg-accent-light rounded-lg hover:bg-blue-100 transition-colors">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                Upload Contract
              </button>
            </div>
          </div>
        </div>

        {/* Team */}
        <div className="bg-card-bg rounded-xl border border-card-border shadow-sm">
          <div className="px-6 py-4 border-b border-card-border">
            <h2 className="text-lg font-semibold text-foreground">Team</h2>
          </div>
          <div className="p-4 space-y-3">
            {members.map((member) => (
              <Link
                key={member!.id}
                href={`/team`}
                className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Avatar name={member!.name} size="md" />
                <div>
                  <p className="text-sm font-medium text-foreground">{member!.name}</p>
                  <p className="text-xs text-muted">{member!.role}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
