'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Project = {
  id: string;
  name: string;
  client_id: string;
  status: string;
  service: string;
  start_date: string | null;
  end_date: string | null;
  budget: number | null;
  platform: string | null;
  description: string | null;
  clients: { business_name: string } | null;
  project_members: { profile_id: string; profiles: { full_name: string; avatar_url: string | null } | null }[];
};

const statusColors: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  on_hold: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-slate-50 text-slate-600 border-slate-200',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On Hold',
  pending: 'Pending',
};

const services = ['All', 'Web Design', 'SEO', 'Social Media', 'Branding', 'Content Marketing', 'PPC'];

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [serviceFilter, setServiceFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function fetchProjects() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single();

      if (!profile?.tenant_id) {
        // Owner: get tenant by owner_id
        const { data: tenant } = await supabase
          .from('tenants')
          .select('id')
          .eq('owner_id', user.id)
          .single();

        if (!tenant) { setLoading(false); return; }

        const { data } = await supabase
          .from('projects')
          .select('*, clients(business_name), project_members(profile_id, profiles(full_name, avatar_url))')
          .eq('tenant_id', tenant.id)
          .order('created_at', { ascending: false });

        setProjects((data as unknown as Project[]) || []);
      } else {
        const { data } = await supabase
          .from('projects')
          .select('*, clients(business_name), project_members(profile_id, profiles(full_name, avatar_url))')
          .eq('tenant_id', profile.tenant_id)
          .order('created_at', { ascending: false });

        setProjects((data as unknown as Project[]) || []);
      }
      setLoading(false);
    }
    fetchProjects();
  }, []);

  const filtered = projects.filter((p) => {
    if (statusFilter !== 'all' && p.status !== statusFilter) return false;
    if (serviceFilter !== 'All' && p.service !== serviceFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        p.name.toLowerCase().includes(q) ||
        p.clients?.business_name.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const statuses = ['all', 'active', 'pending', 'on_hold', 'completed'];

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  const initialsColors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500', 'bg-cyan-500'];
  function getColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return initialsColors[Math.abs(hash) % initialsColors.length];
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-48 bg-slate-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 h-48 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">Projects</h1>
          <p className="text-sm text-[var(--muted)] mt-1">{filtered.length} project{filtered.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-hover)] transition-colors shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="hidden sm:inline">New Project</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-3 sm:p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 sm:gap-4">
          <div className="relative sm:flex-1 sm:min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search projects or clients..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
            <span className="text-xs font-medium text-[var(--muted)] shrink-0">Status:</span>
            <div className="flex gap-1">
              {statuses.map((s) => (
                <button
                  key={s}
                  onClick={() => setStatusFilter(s)}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                    statusFilter === s
                      ? 'bg-[var(--accent)] text-white'
                      : 'bg-slate-100 text-[var(--muted)] hover:bg-slate-200'
                  }`}
                >
                  {s === 'all' ? 'All' : statusLabels[s] || s}
                </button>
              ))}
            </div>
          </div>

          <select
            value={serviceFilter}
            onChange={(e) => setServiceFilter(e.target.value)}
            className="px-3 py-2 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
          >
            {services.map((s) => (
              <option key={s} value={s}>{s === 'All' ? 'All Services' : s}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((project) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-5 shadow-sm hover:shadow-md hover:border-[var(--accent)]/30 transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[var(--foreground)] group-hover:text-[var(--accent)] transition-colors truncate">
                  {project.name}
                </h3>
                <p className="text-xs text-[var(--muted)] mt-0.5">{project.clients?.business_name}</p>
              </div>
              <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${statusColors[project.status] || 'bg-slate-50 text-slate-600'}`}>
                {statusLabels[project.status] || project.status}
              </span>
            </div>

            {project.service && (
              <div className="mb-4">
                <span className="inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                  {project.service}
                </span>
              </div>
            )}

            <div className="space-y-2 text-xs text-[var(--muted)]">
              {project.start_date && (
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(project.start_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {project.end_date && (
                    <>
                      {' — '}
                      {new Date(project.end_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </>
                  )}
                </div>
              )}
              {project.platform && (
                <div className="flex items-center gap-2">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {project.platform}
                </div>
              )}
            </div>

            {/* Team & Budget */}
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-[var(--border)]/50">
              <div className="flex -space-x-2">
                {project.project_members?.slice(0, 4).map((m) => (
                  <div
                    key={m.profile_id}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-medium text-white ring-2 ring-white ${getColor(m.profiles?.full_name || '')}`}
                  >
                    {getInitials(m.profiles?.full_name || '?')}
                  </div>
                ))}
                {(project.project_members?.length || 0) > 4 && (
                  <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium text-[var(--muted)] ring-2 ring-white">
                    +{project.project_members.length - 4}
                  </div>
                )}
              </div>
              {project.budget && (
                <span className="text-xs font-semibold text-[var(--foreground)]">
                  ${project.budget.toLocaleString()}
                </span>
              )}
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12">
          <svg className="w-12 h-12 text-[var(--muted)]/30 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-[var(--muted)]">No projects found matching your filters.</p>
        </div>
      )}
    </div>
  );
}
