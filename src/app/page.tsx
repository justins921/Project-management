import { projects, clients, teamMembers, getClient } from '@/lib/data';
import GanttChart from '@/components/GanttChart';
import StatusBadge from '@/components/StatusBadge';
import ServiceBadge from '@/components/ServiceBadge';
import Link from 'next/link';

export default function Dashboard() {
  const activeProjects = projects.filter((p) => p.status === 'Active');
  const totalRevenue = projects
    .filter((p) => p.status !== 'On Hold')
    .reduce((sum, p) => sum + (p.budget || 0), 0);
  const completedProjects = projects.filter((p) => p.status === 'Completed');

  const stats = [
    {
      label: 'Active Projects',
      value: activeProjects.length,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      ),
    },
    {
      label: 'Total Clients',
      value: clients.length,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      ),
    },
    {
      label: 'Total Revenue',
      value: `$${totalRevenue.toLocaleString()}`,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Completed',
      value: completedProjects.length,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm text-muted mt-1 hidden sm:block">Welcome back. Here&apos;s what&apos;s happening with your projects.</p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">New Project</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-card-bg rounded-xl border border-card-border p-3 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted">{stat.label}</p>
                <p className={`text-xl sm:text-2xl font-bold mt-1 ${stat.color}`}>
                  {stat.value}
                </p>
              </div>
              <div className={`${stat.bg} ${stat.color} p-2.5 sm:p-3 rounded-xl hidden sm:flex`}>
                {stat.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gantt Chart */}
      <GanttChart projects={projects} />

      {/* Recent Projects Table */}
      <div className="bg-card-bg rounded-xl border border-card-border shadow-sm">
        <div className="px-6 py-4 border-b border-card-border flex items-center justify-between">
          <h2 className="text-lg font-semibold text-foreground">Active Projects</h2>
          <Link
            href="/projects"
            className="text-sm text-accent hover:text-accent-hover font-medium"
          >
            View all →
          </Link>
        </div>
        {/* Mobile: card list */}
        <div className="sm:hidden divide-y divide-card-border/50">
          {activeProjects.map((project) => {
            const client = getClient(project.clientId);
            return (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block p-4 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <p className="text-sm font-medium text-foreground">{project.name}</p>
                  <StatusBadge status={project.status} />
                </div>
                <p className="text-xs text-muted mb-2">{client?.name}</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <ServiceBadge service={project.service} />
                  <span className="text-xs text-muted">
                    {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    {' — '}
                    {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
        {/* Desktop: table */}
        <div className="hidden sm:block overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border bg-slate-50/50">
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Project
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Client
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Service
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-muted uppercase tracking-wider">
                  Timeline
                </th>
              </tr>
            </thead>
            <tbody>
              {activeProjects.map((project) => {
                const client = getClient(project.clientId);
                return (
                  <tr
                    key={project.id}
                    className="border-b border-card-border/50 hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-sm font-medium text-foreground hover:text-accent transition-colors"
                      >
                        {project.name}
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {client?.name}
                    </td>
                    <td className="px-6 py-4">
                      <ServiceBadge service={project.service} />
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={project.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-muted">
                      {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      {' — '}
                      {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
