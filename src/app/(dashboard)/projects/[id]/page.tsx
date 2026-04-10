'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
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
  contract_url: string | null;
  clients: { id: string; business_name: string; contact_name: string; contact_email: string } | null;
  project_members: { profile_id: string; role: string; profiles: { full_name: string; email: string; avatar_url: string | null } | null }[];
};

type Task = {
  id: string;
  title: string;
  status: string;
  priority: number;
  due_date: string | null;
  assigned_to: string | null;
  profiles: { full_name: string } | null;
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

const priorityLabels: Record<number, { label: string; color: string }> = {
  1: { label: 'Urgent', color: 'text-red-600' },
  2: { label: 'High', color: 'text-orange-600' },
  3: { label: 'Medium', color: 'text-yellow-600' },
  4: { label: 'Low', color: 'text-slate-500' },
};

const taskStatusLabels: Record<string, string> = {
  todo: 'To Do',
  in_progress: 'In Progress',
  in_review: 'In Review',
  done: 'Done',
};

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();

      const { data: proj } = await supabase
        .from('projects')
        .select('*, clients(id, business_name, contact_name, contact_email), project_members(profile_id, role, profiles(full_name, email, avatar_url))')
        .eq('id', id)
        .single();

      if (proj) {
        setProject(proj as unknown as Project);

        const { data: taskData } = await supabase
          .from('tasks')
          .select('id, title, status, priority, due_date, assigned_to, profiles:assigned_to(full_name)')
          .eq('project_id', id)
          .order('priority', { ascending: true })
          .limit(20);

        setTasks((taskData as unknown as Task[]) || []);
      }
      setLoading(false);
    }
    fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 h-48 animate-pulse" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[var(--card)] rounded-xl border border-[var(--border)] h-64 animate-pulse" />
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] h-64 animate-pulse" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">Project Not Found</h1>
        <Link href="/projects" className="text-[var(--accent)] hover:underline text-sm">Back to Projects</Link>
      </div>
    );
  }

  const startDate = project.start_date ? new Date(project.start_date) : null;
  const endDate = project.end_date ? new Date(project.end_date) : null;
  let progress = 0;
  if (startDate && endDate) {
    const now = new Date();
    const total = endDate.getTime() - startDate.getTime();
    const elapsed = now.getTime() - startDate.getTime();
    progress = Math.min(100, Math.max(0, Math.round((elapsed / total) * 100)));
  }
  if (project.status === 'completed') progress = 100;

  function getInitials(name: string) {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  }

  const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-violet-500', 'bg-amber-500', 'bg-rose-500'];
  function getColor(name: string) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
    return colors[Math.abs(hash) % colors.length];
  }

  const details = [
    { label: 'Client', value: project.clients?.business_name || 'Unknown' },
    { label: 'Contact', value: project.clients?.contact_name || 'Unknown' },
    { label: 'Contact Email', value: project.clients?.contact_email || 'Unknown', isEmail: true },
    { label: 'Service', value: project.service || 'Not set' },
    { label: 'Platform', value: project.platform || 'Not set' },
    { label: 'Start Date', value: startDate ? startDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set' },
    { label: 'End Date', value: endDate ? endDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Not set' },
    { label: 'Budget', value: project.budget ? `$${project.budget.toLocaleString()}` : 'Not set' },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <Link href="/projects" className="hover:text-[var(--accent)] transition-colors">Projects</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-[var(--foreground)] font-medium">{project.name}</span>
      </nav>

      {/* Header */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">{project.name}</h1>
            <p className="text-[var(--muted)] mt-1">
              <Link href={`/clients/${project.clients?.id}`} className="hover:text-[var(--accent)] transition-colors">
                {project.clients?.business_name}
              </Link>
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full border ${statusColors[project.status] || ''}`}>
              {statusLabels[project.status] || project.status}
            </span>
            {project.service && (
              <span className="inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full bg-violet-50 text-violet-700 border border-violet-200">
                {project.service}
              </span>
            )}
          </div>
        </div>

        {project.description && (
          <p className="text-sm text-[var(--muted)] mb-6">{project.description}</p>
        )}

        {/* Progress */}
        <div className="mb-2 flex items-center justify-between text-xs text-[var(--muted)]">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all ${
              project.status === 'completed' ? 'bg-emerald-500' : project.status === 'on_hold' ? 'bg-amber-500' : 'bg-[var(--accent)]'
            }`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm">
            <div className="px-6 py-4 border-b border-[var(--border)]">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Project Details</h2>
            </div>
            <div className="p-6">
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
                {details.map((d) => (
                  <div key={d.label}>
                    <dt className="text-xs font-medium text-[var(--muted)] uppercase tracking-wider mb-1">{d.label}</dt>
                    <dd className="text-sm font-medium text-[var(--foreground)]">
                      {d.isEmail ? (
                        <a href={`mailto:${d.value}`} className="text-[var(--accent)] hover:underline">{d.value}</a>
                      ) : d.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
            {/* Contract */}
            <div className="px-6 py-4 border-t border-[var(--border)]">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-[var(--foreground)]">Contract</h3>
                  <p className="text-xs text-[var(--muted)] mt-0.5">
                    {project.contract_url ? 'Contract uploaded' : 'No contract uploaded yet'}
                  </p>
                </div>
                <button className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[var(--accent)] bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                  </svg>
                  Upload Contract
                </button>
              </div>
            </div>
          </div>

          {/* Tasks */}
          <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm">
            <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
              <h2 className="text-lg font-semibold text-[var(--foreground)]">Tasks</h2>
              <span className="text-xs text-[var(--muted)]">{tasks.length} task{tasks.length !== 1 ? 's' : ''}</span>
            </div>
            {tasks.length > 0 ? (
              <div className="divide-y divide-[var(--border)]">
                {tasks.map((task) => (
                  <div key={task.id} className="px-6 py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span className={`text-xs font-medium ${priorityLabels[task.priority]?.color || ''}`}>
                        {priorityLabels[task.priority]?.label || 'P' + task.priority}
                      </span>
                      <span className="text-sm text-[var(--foreground)] truncate">{task.title}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {task.profiles && (
                        <span className="text-xs text-[var(--muted)]">{task.profiles.full_name}</span>
                      )}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 text-[var(--muted)]">
                        {taskStatusLabels[task.status] || task.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-sm text-[var(--muted)]">No tasks yet for this project.</div>
            )}
          </div>
        </div>

        {/* Team Sidebar */}
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm h-fit">
          <div className="px-6 py-4 border-b border-[var(--border)]">
            <h2 className="text-lg font-semibold text-[var(--foreground)]">Team</h2>
          </div>
          <div className="p-4 space-y-3">
            {project.project_members?.length > 0 ? (
              project.project_members.map((m) => (
                <div
                  key={m.profile_id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-medium text-white ${getColor(m.profiles?.full_name || '')}`}>
                    {getInitials(m.profiles?.full_name || '?')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--foreground)]">{m.profiles?.full_name}</p>
                    <p className="text-xs text-[var(--muted)]">{m.role || 'Member'}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-[var(--muted)] text-center py-4">No team members assigned.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
