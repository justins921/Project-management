'use client';

import { useState } from 'react';
import Link from 'next/link';
import { projects, getClient, getTeamMember } from '@/lib/data';
import { ProjectStatus, ServiceType } from '@/lib/types';
import StatusBadge from '@/components/StatusBadge';
import ServiceBadge from '@/components/ServiceBadge';
import Avatar from '@/components/Avatar';

export default function ProjectsPage() {
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'All'>('All');
  const [serviceFilter, setServiceFilter] = useState<ServiceType | 'All'>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = projects.filter((p) => {
    if (statusFilter !== 'All' && p.status !== statusFilter) return false;
    if (serviceFilter !== 'All' && p.service !== serviceFilter) return false;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const client = getClient(p.clientId);
      return (
        p.name.toLowerCase().includes(query) ||
        client?.name.toLowerCase().includes(query)
      );
    }
    return true;
  });

  const statuses: (ProjectStatus | 'All')[] = ['All', 'Active', 'Pending', 'On Hold', 'Completed'];
  const services: (ServiceType | 'All')[] = [
    'All',
    'Web Design',
    'SEO',
    'Social Media Marketing',
    'Content Marketing',
    'Branding',
    'PPC Advertising',
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-sm text-muted mt-1">
            {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          </p>
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

      {/* Filters */}
      <div className="bg-card-bg rounded-xl border border-card-border p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
          {/* Search */}
          <div className="relative sm:flex-1 sm:min-w-[200px]">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search projects or clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-medium text-muted shrink-0">Status:</span>
            <div className="flex gap-1">
              {statuses.map((status) => (
                <button
                  key={status}
                  onClick={() => setStatusFilter(status)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    statusFilter === status
                      ? 'bg-accent text-white'
                      : 'bg-slate-100 text-muted hover:bg-slate-200'
                  }`}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>

          {/* Service filter */}
          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value as ServiceType | 'All')}
            className="px-3 py-2 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent"
          >
            {services.map((service) => (
              <option key={service} value={service}>
                {service === 'All' ? 'All Services' : service}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredProjects.map((project) => {
          const client = getClient(project.clientId);
          const members = project.teamMemberIds.map(getTeamMember).filter(Boolean);

          return (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="bg-card-bg rounded-xl border border-card-border p-5 shadow-sm hover:shadow-md hover:border-accent/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                    {project.name}
                  </h3>
                  <p className="text-xs text-muted mt-0.5">{client?.name}</p>
                </div>
                <StatusBadge status={project.status} />
              </div>

              <div className="flex items-center gap-2 mb-4">
                <ServiceBadge service={project.service} />
              </div>

              <div className="space-y-2 text-xs text-muted">
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' — '}
                  {new Date(project.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {project.platform} · {project.hostingLocation}
                </div>
              </div>

              {/* Team */}
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-card-border/50">
                <div className="flex -space-x-2">
                  {members.slice(0, 4).map((member) => (
                    <Avatar key={member!.id} name={member!.name} size="sm" />
                  ))}
                  {members.length > 4 && (
                    <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-muted ring-2 ring-white">
                      +{members.length - 4}
                    </div>
                  )}
                </div>
                {project.budget && (
                  <span className="text-xs font-semibold text-foreground">
                    ${project.budget.toLocaleString()}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted">No projects found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
