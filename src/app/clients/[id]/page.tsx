import { clients, getProjectsByClient, getTeamMember } from '@/lib/data';
import StatusBadge from '@/components/StatusBadge';
import ServiceBadge from '@/components/ServiceBadge';
import Avatar from '@/components/Avatar';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const client = clients.find((c) => c.id === id);
  if (!client) return notFound();

  const clientProjects = getProjectsByClient(client.id);
  const totalBudget = clientProjects.reduce((sum, p) => sum + (p.budget || 0), 0);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted">
        <Link href="/clients" className="hover:text-accent transition-colors">
          Clients
        </Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-foreground font-medium">{client.name}</span>
      </nav>

      {/* Client Header */}
      <div className="bg-card-bg rounded-xl border border-card-border p-4 sm:p-6 shadow-sm">
        <div className="flex items-start gap-4 sm:gap-5">
          <Avatar name={client.name} size="lg" />
          <div className="flex-1 min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-foreground truncate">{client.name}</h1>
            {client.company && (
              <p className="text-sm text-muted mt-0.5">{client.company}</p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider">Contact</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{client.contactName}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider">Email</p>
                <a
                  href={`mailto:${client.contactEmail}`}
                  className="text-sm font-medium text-accent hover:text-accent-hover mt-0.5 block"
                >
                  {client.contactEmail}
                </a>
              </div>
              <div>
                <p className="text-xs font-medium text-muted uppercase tracking-wider">Phone</p>
                <p className="text-sm font-medium text-foreground mt-0.5">{client.phone || 'Not set'}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-card-bg rounded-xl border border-card-border p-4 shadow-sm">
          <p className="text-xs text-muted">Total Projects</p>
          <p className="text-2xl font-bold text-foreground mt-1">{clientProjects.length}</p>
        </div>
        <div className="bg-card-bg rounded-xl border border-card-border p-4 shadow-sm">
          <p className="text-xs text-muted">Active Projects</p>
          <p className="text-2xl font-bold text-emerald-600 mt-1">
            {clientProjects.filter((p) => p.status === 'Active').length}
          </p>
        </div>
        <div className="bg-card-bg rounded-xl border border-card-border p-4 shadow-sm">
          <p className="text-xs text-muted">Total Value</p>
          <p className="text-2xl font-bold text-violet-600 mt-1">${totalBudget.toLocaleString()}</p>
        </div>
      </div>

      {/* Projects */}
      <div className="bg-card-bg rounded-xl border border-card-border shadow-sm">
        <div className="px-6 py-4 border-b border-card-border">
          <h2 className="text-lg font-semibold text-foreground">Projects</h2>
        </div>
        <div className="divide-y divide-card-border/50">
          {clientProjects.map((project) => {
            const members = project.teamMemberIds.map(getTeamMember).filter(Boolean);
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block p-4 sm:p-5 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="text-sm font-semibold text-foreground hover:text-accent transition-colors">
                        {project.name}
                      </h3>
                      <StatusBadge status={project.status} />
                      <ServiceBadge service={project.service} />
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted flex-wrap">
                      <span>{project.platform} · {project.hostingLocation}</span>
                      <span>
                        {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        {' — '}
                        {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 sm:ml-4">
                    <div className="flex -space-x-2">
                      {members.slice(0, 3).map((m) => (
                        <Avatar key={m!.id} name={m!.name} size="sm" />
                      ))}
                    </div>
                    {project.budget && (
                      <span className="text-sm font-semibold text-foreground">
                        ${project.budget.toLocaleString()}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
