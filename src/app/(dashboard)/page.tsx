'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import Link from 'next/link';

interface Profile {
  id: string;
  full_name: string;
  email: string;
  role: string;
  tenant_id: string;
  avatar_url: string | null;
}

interface Tenant {
  id: string;
  agency_name: string;
}

interface OwnerStats {
  activeClients: number;
  activeProjects: number;
  openTickets: number;
  pendingRequests: number;
}

interface FreelancerStats {
  myTasks: number;
  myClients: number;
  completedThisWeek: number;
}

interface ActivityItem {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface DeadlineItem {
  id: string;
  title?: string;
  name?: string;
  due_date?: string;
  end_date?: string;
  type: 'task' | 'project';
}

interface SiteHealthAlert {
  id: string;
  url: string;
  performance_score: number | null;
  seo_score: number | null;
  last_checked: string | null;
  client_id: string;
}

interface TaskItem {
  id: string;
  title: string;
  status: string;
  priority: string;
  due_date: string | null;
  project_id: string | null;
}

interface ClientItem {
  client_id: string;
  clients: {
    id: string;
    business_name: string;
    contact_name: string;
    contact_email: string;
    status: string;
  };
}

// ---------------------------------------------------------------------------
// Loading skeleton
// ---------------------------------------------------------------------------
function DashboardSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      {/* Header skeleton */}
      <div>
        <div className="h-7 w-64 rounded-md" style={{ background: 'var(--card-border)' }} />
        <div className="h-4 w-96 rounded-md mt-2" style={{ background: 'var(--card-border)' }} />
      </div>

      {/* Stat cards skeleton */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="rounded-xl border p-4 sm:p-5"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <div className="h-4 w-24 rounded" style={{ background: 'var(--card-border)' }} />
            <div className="h-8 w-16 rounded mt-3" style={{ background: 'var(--card-border)' }} />
          </div>
        ))}
      </div>

      {/* Content sections skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border p-5"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <div className="h-5 w-40 rounded mb-4" style={{ background: 'var(--card-border)' }} />
            <div className="space-y-3">
              {[1, 2, 3].map((j) => (
                <div key={j} className="h-4 w-full rounded" style={{ background: 'var(--card-border)' }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Stat Card
// ---------------------------------------------------------------------------
function StatCard({
  label,
  value,
  icon,
  accent,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  accent: string;
}) {
  return (
    <div
      className="rounded-xl border p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>{label}</p>
          <p className="text-2xl sm:text-3xl font-bold mt-1" style={{ color: accent }}>
            {value}
          </p>
        </div>
        <div
          className="hidden sm:flex items-center justify-center w-11 h-11 rounded-xl"
          style={{ background: `${accent}18`, color: accent }}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Priority badge
// ---------------------------------------------------------------------------
function PriorityBadge({ priority }: { priority: string }) {
  const colors: Record<string, { bg: string; text: string }> = {
    urgent: { bg: '#fef2f2', text: '#dc2626' },
    high: { bg: '#fff7ed', text: '#ea580c' },
    medium: { bg: '#fefce8', text: '#ca8a04' },
    low: { bg: '#f0fdf4', text: '#16a34a' },
  };
  const c = colors[priority?.toLowerCase()] || colors.medium;
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium"
      style={{ background: c.bg, color: c.text }}
    >
      {priority}
    </span>
  );
}

// ---------------------------------------------------------------------------
// Status dot
// ---------------------------------------------------------------------------
function StatusDot({ status }: { status: string }) {
  const colorMap: Record<string, string> = {
    active: 'var(--success)',
    completed: 'var(--accent)',
    in_progress: 'var(--warning)',
    pending: 'var(--warning)',
    closed: 'var(--muted)',
    open: 'var(--danger)',
  };
  const color = colorMap[status?.toLowerCase()] || 'var(--muted)';
  return (
    <span
      className="inline-block w-2 h-2 rounded-full mr-2 shrink-0"
      style={{ background: color }}
    />
  );
}

// ---------------------------------------------------------------------------
// SVG icons
// ---------------------------------------------------------------------------
const Icons = {
  users: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  projects: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  ticket: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
    </svg>
  ),
  request: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  tasks: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  check: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
    </svg>
  ),
  alert: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
    </svg>
  ),
  clock: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// ---------------------------------------------------------------------------
// Owner Dashboard
// ---------------------------------------------------------------------------
function OwnerDashboard({
  profile,
  tenant,
}: {
  profile: Profile;
  tenant: Tenant | null;
}) {
  const [stats, setStats] = useState<OwnerStats | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [healthAlerts, setHealthAlerts] = useState<SiteHealthAlert[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchOwnerData() {
      const supabase = createClient();
      const tid = profile.tenant_id;

      const [
        clientsRes,
        projectsRes,
        ticketsRes,
        requestsRes,
        activityRes,
        taskDeadlinesRes,
        projectDeadlinesRes,
        healthRes,
      ] = await Promise.all([
        supabase
          .from('clients')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tid)
          .eq('status', 'active'),
        supabase
          .from('projects')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tid)
          .eq('status', 'active'),
        supabase
          .from('support_tickets')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tid)
          .neq('status', 'closed'),
        supabase
          .from('client_requests')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tid)
          .eq('status', 'pending'),
        supabase
          .from('activity_log')
          .select('id, action, entity_type, entity_id, metadata, created_at')
          .eq('tenant_id', tid)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('tasks')
          .select('id, title, due_date')
          .eq('tenant_id', tid)
          .not('due_date', 'is', null)
          .gte('due_date', new Date().toISOString())
          .neq('status', 'completed')
          .order('due_date', { ascending: true })
          .limit(5),
        supabase
          .from('projects')
          .select('id, name, end_date')
          .eq('tenant_id', tid)
          .not('end_date', 'is', null)
          .gte('end_date', new Date().toISOString())
          .neq('status', 'completed')
          .order('end_date', { ascending: true })
          .limit(5),
        supabase
          .from('site_health')
          .select('id, url, performance_score, seo_score, last_checked, client_id')
          .eq('tenant_id', tid)
          .or('performance_score.lt.50,seo_score.lt.50'),
      ]);

      setStats({
        activeClients: clientsRes.count ?? 0,
        activeProjects: projectsRes.count ?? 0,
        openTickets: ticketsRes.count ?? 0,
        pendingRequests: requestsRes.count ?? 0,
      });

      setActivity(activityRes.data ?? []);

      // Merge tasks and projects into deadlines, sort by date
      const taskItems: DeadlineItem[] = (taskDeadlinesRes.data ?? []).map((t) => ({
        id: t.id,
        title: t.title,
        due_date: t.due_date,
        type: 'task' as const,
      }));
      const projectItems: DeadlineItem[] = (projectDeadlinesRes.data ?? []).map((p) => ({
        id: p.id,
        name: p.name,
        end_date: p.end_date,
        type: 'project' as const,
      }));
      const merged = [...taskItems, ...projectItems]
        .sort((a, b) => {
          const dateA = a.due_date || a.end_date || '';
          const dateB = b.due_date || b.end_date || '';
          return dateA.localeCompare(dateB);
        })
        .slice(0, 5);
      setDeadlines(merged);

      setHealthAlerts(healthRes.data ?? []);
      setLoading(false);
    }

    fetchOwnerData();
  }, [profile.tenant_id]);

  if (loading) return <DashboardSkeleton />;

  const agencyName = tenant?.agency_name || 'Your Agency';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          Welcome back, {profile.full_name}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          {agencyName} &mdash; here&apos;s your agency overview.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatCard label="Active Clients" value={stats?.activeClients ?? 0} icon={Icons.users} accent="var(--accent)" />
        <StatCard label="Active Projects" value={stats?.activeProjects ?? 0} icon={Icons.projects} accent="#16a34a" />
        <StatCard label="Open Tickets" value={stats?.openTickets ?? 0} icon={Icons.ticket} accent="#ea580c" />
        <StatCard label="Pending Requests" value={stats?.pendingRequests ?? 0} icon={Icons.request} accent="#8b5cf6" />
      </div>

      {/* Two-column layout: Activity + Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Recent Activity */}
        <div
          className="rounded-xl border shadow-sm"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--card-border)' }}
          >
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              Recent Activity
            </h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
            {activity.length === 0 ? (
              <p className="px-5 py-8 text-sm text-center" style={{ color: 'var(--muted)' }}>
                No recent activity.
              </p>
            ) : (
              activity.map((item) => (
                <div key={item.id} className="px-5 py-3 flex items-start gap-3">
                  <div
                    className="mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                    style={{ background: 'var(--accent-light)', color: 'var(--accent)' }}
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm" style={{ color: 'var(--foreground)' }}>
                      <span className="font-medium capitalize">{item.action.replace(/_/g, ' ')}</span>
                      {' '}
                      <span style={{ color: 'var(--muted)' }}>{item.entity_type}</span>
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                      {new Date(item.created_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div
          className="rounded-xl border shadow-sm"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--card-border)' }}
          >
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              Upcoming Deadlines
            </h2>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
            {deadlines.length === 0 ? (
              <p className="px-5 py-8 text-sm text-center" style={{ color: 'var(--muted)' }}>
                No upcoming deadlines.
              </p>
            ) : (
              deadlines.map((item) => {
                const dateStr = item.due_date || item.end_date || '';
                const label = item.title || item.name || 'Untitled';
                return (
                  <div key={`${item.type}-${item.id}`} className="px-5 py-3 flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                        {label}
                      </p>
                      <p className="text-xs mt-0.5 capitalize" style={{ color: 'var(--muted)' }}>
                        {item.type}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 text-xs" style={{ color: 'var(--muted)' }}>
                      {Icons.clock}
                      {dateStr
                        ? new Date(dateStr).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })
                        : 'No date'}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Site Health Alerts */}
      {healthAlerts.length > 0 && (
        <div
          className="rounded-xl border shadow-sm"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div
            className="px-5 py-4 border-b flex items-center gap-2"
            style={{ borderColor: 'var(--card-border)' }}
          >
            <span style={{ color: 'var(--danger)' }}>{Icons.alert}</span>
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              Site Health Alerts
            </h2>
            <span
              className="ml-auto inline-flex items-center justify-center rounded-full text-xs font-medium px-2 py-0.5"
              style={{ background: '#fef2f2', color: 'var(--danger)' }}
            >
              {healthAlerts.length}
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr
                  className="border-b text-left"
                  style={{ borderColor: 'var(--card-border)' }}
                >
                  <th className="px-5 py-2.5 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    URL
                  </th>
                  <th className="px-5 py-2.5 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    Performance
                  </th>
                  <th className="px-5 py-2.5 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    SEO
                  </th>
                  <th className="px-5 py-2.5 font-medium text-xs uppercase tracking-wider" style={{ color: 'var(--muted)' }}>
                    Last Checked
                  </th>
                </tr>
              </thead>
              <tbody>
                {healthAlerts.map((site) => (
                  <tr
                    key={site.id}
                    className="border-b last:border-b-0"
                    style={{ borderColor: 'var(--card-border)' }}
                  >
                    <td className="px-5 py-3 font-medium truncate max-w-[200px]" style={{ color: 'var(--foreground)' }}>
                      {site.url}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            site.performance_score !== null && site.performance_score < 50
                              ? 'var(--danger)'
                              : 'var(--success)',
                        }}
                      >
                        {site.performance_score ?? 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className="font-semibold"
                        style={{
                          color:
                            site.seo_score !== null && site.seo_score < 50
                              ? 'var(--danger)'
                              : 'var(--success)',
                        }}
                      >
                        {site.seo_score ?? 'N/A'}
                      </span>
                    </td>
                    <td className="px-5 py-3" style={{ color: 'var(--muted)' }}>
                      {site.last_checked
                        ? new Date(site.last_checked).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        : 'Never'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Freelancer Dashboard
// ---------------------------------------------------------------------------
function FreelancerDashboard({ profile }: { profile: Profile }) {
  const [stats, setStats] = useState<FreelancerStats | null>(null);
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const [clients, setClients] = useState<ClientItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchFreelancerData() {
      const supabase = createClient();
      const uid = profile.id;
      const tid = profile.tenant_id;

      // Start of current week (Monday)
      const now = new Date();
      const dayOfWeek = now.getDay();
      const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() + mondayOffset);
      weekStart.setHours(0, 0, 0, 0);

      const [
        tasksCountRes,
        clientsCountRes,
        completedWeekRes,
        tasksListRes,
        clientsListRes,
      ] = await Promise.all([
        supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tid)
          .eq('assigned_to', uid)
          .neq('status', 'completed'),
        supabase
          .from('client_freelancers')
          .select('client_id', { count: 'exact', head: true })
          .eq('freelancer_id', uid),
        supabase
          .from('tasks')
          .select('id', { count: 'exact', head: true })
          .eq('tenant_id', tid)
          .eq('assigned_to', uid)
          .eq('status', 'completed')
          .gte('due_date', weekStart.toISOString()),
        supabase
          .from('tasks')
          .select('id, title, status, priority, due_date, project_id')
          .eq('tenant_id', tid)
          .eq('assigned_to', uid)
          .neq('status', 'completed')
          .order('due_date', { ascending: true, nullsFirst: false })
          .limit(10),
        supabase
          .from('client_freelancers')
          .select('client_id, clients(id, business_name, contact_name, contact_email, status)')
          .eq('freelancer_id', uid),
      ]);

      setStats({
        myTasks: tasksCountRes.count ?? 0,
        myClients: clientsCountRes.count ?? 0,
        completedThisWeek: completedWeekRes.count ?? 0,
      });

      setTasks(tasksListRes.data ?? []);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      setClients((clientsListRes.data as any) ?? []);
      setLoading(false);
    }

    fetchFreelancerData();
  }, [profile.id, profile.tenant_id]);

  if (loading) return <DashboardSkeleton />;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
          Welcome back, {profile.full_name}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Here&apos;s what you&apos;re working on.
        </p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <StatCard label="My Tasks" value={stats?.myTasks ?? 0} icon={Icons.tasks} accent="var(--accent)" />
        <StatCard label="My Clients" value={stats?.myClients ?? 0} icon={Icons.users} accent="#16a34a" />
        <StatCard label="Completed This Week" value={stats?.completedThisWeek ?? 0} icon={Icons.check} accent="#8b5cf6" />
      </div>

      {/* Two-column: tasks + clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* My Tasks */}
        <div
          className="rounded-xl border shadow-sm"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--card-border)' }}
          >
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              My Tasks
            </h2>
            <Link
              href="/tasks"
              className="text-sm font-medium"
              style={{ color: 'var(--accent)' }}
            >
              View all &rarr;
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
            {tasks.length === 0 ? (
              <p className="px-5 py-8 text-sm text-center" style={{ color: 'var(--muted)' }}>
                No tasks assigned. You&apos;re all caught up!
              </p>
            ) : (
              tasks.map((task) => (
                <div key={task.id} className="px-5 py-3 flex items-center justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <StatusDot status={task.status} />
                      <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                        {task.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-4">
                      <PriorityBadge priority={task.priority} />
                      {task.due_date && (
                        <span className="text-xs" style={{ color: 'var(--muted)' }}>
                          Due{' '}
                          {new Date(task.due_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* My Clients */}
        <div
          className="rounded-xl border shadow-sm"
          style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
        >
          <div
            className="px-5 py-4 border-b flex items-center justify-between"
            style={{ borderColor: 'var(--card-border)' }}
          >
            <h2 className="text-base font-semibold" style={{ color: 'var(--foreground)' }}>
              My Clients
            </h2>
            <Link
              href="/clients"
              className="text-sm font-medium"
              style={{ color: 'var(--accent)' }}
            >
              View all &rarr;
            </Link>
          </div>
          <div className="divide-y" style={{ borderColor: 'var(--card-border)' }}>
            {clients.length === 0 ? (
              <p className="px-5 py-8 text-sm text-center" style={{ color: 'var(--muted)' }}>
                No clients assigned yet.
              </p>
            ) : (
              clients.map((item) => {
                const client = item.clients;
                if (!client) return null;
                return (
                  <Link
                    key={client.id}
                    href={`/clients/${client.id}`}
                    className="block px-5 py-3 hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium truncate" style={{ color: 'var(--foreground)' }}>
                          {client.business_name}
                        </p>
                        <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                          {client.contact_name} &middot; {client.contact_email}
                        </p>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <StatusDot status={client.status} />
                        <span className="text-xs capitalize" style={{ color: 'var(--muted)' }}>
                          {client.status}
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Dashboard Page
// ---------------------------------------------------------------------------
export default function Dashboard() {
  const router = useRouter();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUserData() {
      if (!isSupabaseConfigured()) {
        // Show demo/setup state when Supabase isn't configured
        setProfile({ id: '', full_name: 'Agency Owner', email: '', role: 'owner', tenant_id: '', avatar_url: null });
        setTenant({ id: '', agency_name: 'Solo Agency OS' });
        setLoading(false);
        return;
      }

      const supabase = createClient();

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.push('/login');
        return;
      }

      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, full_name, email, role, tenant_id, avatar_url')
        .eq('id', user.id)
        .single();

      if (!profileData) {
        router.push('/login');
        return;
      }

      // Client role redirects to portal
      if (profileData.role === 'client') {
        router.push('/portal');
        return;
      }

      setProfile(profileData);

      // Fetch tenant info for owner dashboard
      if (profileData.role === 'owner' && profileData.tenant_id) {
        const { data: tenantData } = await supabase
          .from('tenants')
          .select('id, agency_name')
          .eq('id', profileData.tenant_id)
          .single();

        setTenant(tenantData);
      }

      setLoading(false);
    }

    loadUserData();
  }, [router]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!profile) {
    return null;
  }

  if (profile.role === 'owner') {
    return <OwnerDashboard profile={profile} tenant={tenant} />;
  }

  if (profile.role === 'freelancer') {
    return <FreelancerDashboard profile={profile} />;
  }

  // Fallback for any other role - show a simple welcome
  return (
    <div className="space-y-4">
      <h1 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
        Welcome, {profile.full_name}
      </h1>
      <p className="text-sm" style={{ color: 'var(--muted)' }}>
        Your dashboard is being set up.
      </p>
    </div>
  );
}
