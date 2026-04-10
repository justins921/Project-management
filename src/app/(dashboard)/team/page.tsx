'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, FreelancerStatus } from '@/lib/types/database';

/* ---------- types ---------- */
interface TeamMember {
  id: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  role: string;
  skills: string[];
  hourly_rate: number | null;
  status: FreelancerStatus;
  bio: string | null;
  client_count: number;
  task_count: number;
  assigned_clients: { id: string; business_name: string }[];
  assigned_tasks: { id: string; title: string; status: string }[];
}

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  inactive: 'bg-slate-100 text-slate-500 border-slate-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  'on-deck': 'bg-blue-50 text-blue-700 border-blue-200',
};

/* ---------- skeleton ---------- */
function CardSkeleton() {
  return (
    <div
      className="rounded-xl border p-5 shadow-sm animate-pulse"
      style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full shrink-0" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--muted)' }} />
          <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--muted)' }} />
          <div className="h-3 rounded w-2/3" style={{ backgroundColor: 'var(--muted)' }} />
        </div>
      </div>
      <div className="flex gap-1.5 mb-4 flex-wrap">
        <div className="h-5 w-16 rounded-full" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="h-5 w-14 rounded-full" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="h-5 w-12 rounded-full" style={{ backgroundColor: 'var(--muted)' }} />
      </div>
      <div className="pt-3 border-t flex justify-between" style={{ borderColor: 'var(--border)' }}>
        <div className="h-3 rounded w-20" style={{ backgroundColor: 'var(--muted)' }} />
        <div className="h-3 rounded w-16" style={{ backgroundColor: 'var(--muted)' }} />
      </div>
    </div>
  );
}

/* ---------- avatar helper ---------- */
function MemberAvatar({ name, avatarUrl, size = 'lg' }: { name: string; avatarUrl: string | null; size?: 'sm' | 'md' | 'lg' }) {
  const sizeClasses = { sm: 'w-7 h-7 text-xs', md: 'w-9 h-9 text-sm', lg: 'w-12 h-12 text-base' };
  const colors = ['bg-blue-500','bg-emerald-500','bg-violet-500','bg-amber-500','bg-pink-500','bg-cyan-500','bg-rose-500','bg-teal-500'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  const color = colors[Math.abs(hash) % colors.length];
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        className={`${sizeClasses[size]} rounded-full object-cover shrink-0`}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} ${color} rounded-full flex items-center justify-center text-white font-semibold shrink-0`}>
      {initials}
    </div>
  );
}

/* ---------- page ---------- */
export default function TeamPage() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Invite modal
  const [showInvite, setShowInvite] = useState(false);
  const [inviteName, setInviteName] = useState('');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [inviteSending, setInviteSending] = useState(false);

  const loadData = useCallback(async () => {
    const supabase = createClient();

    // Get current user profile
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { setLoading(false); return; }

    const { data: prof } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!prof) { setLoading(false); return; }
    setProfile(prof as Profile);

    // Only owner can view this page
    if (prof.role !== 'owner') { setLoading(false); return; }

    // Determine tenant_id
    let tenantId = prof.tenant_id;
    if (!tenantId) {
      const { data: t } = await supabase
        .from('tenants')
        .select('id')
        .eq('owner_id', user.id)
        .single();
      tenantId = t?.id ?? null;
    }
    if (!tenantId) { setLoading(false); return; }

    // Fetch freelancer profiles joined with profiles
    const { data: freelancers } = await supabase
      .from('freelancer_profiles')
      .select(`
        id,
        skills,
        hourly_rate,
        status,
        bio,
        profile:profiles!inner(id, full_name, email, avatar_url, role, tenant_id)
      `)
      .eq('tenant_id', tenantId);

    if (!freelancers) { setLoading(false); return; }

    // Fetch client_freelancers for counts
    const { data: clientFreelancers } = await supabase
      .from('client_freelancers')
      .select('client_id, freelancer_id');

    // Fetch clients for names
    const { data: clients } = await supabase
      .from('clients')
      .select('id, business_name')
      .eq('tenant_id', tenantId);

    // Fetch tasks assigned to any freelancer
    const freelancerIds = freelancers.map((f: any) => f.id);
    const { data: tasks } = await supabase
      .from('tasks')
      .select('id, title, status, assigned_to')
      .eq('tenant_id', tenantId)
      .in('assigned_to', freelancerIds.length > 0 ? freelancerIds : ['__none__']);

    const clientMap = new Map((clients || []).map((c: any) => [c.id, c]));

    const result: TeamMember[] = freelancers.map((f: any) => {
      const p = Array.isArray(f.profile) ? f.profile[0] : f.profile;
      const cfLinks = (clientFreelancers || []).filter((cf: any) => cf.freelancer_id === f.id);
      const assignedClients = cfLinks
        .map((cf: any) => clientMap.get(cf.client_id))
        .filter(Boolean) as { id: string; business_name: string }[];

      const assignedTasks = (tasks || []).filter((t: any) => t.assigned_to === f.id);

      return {
        id: f.id,
        full_name: p?.full_name ?? 'Unknown',
        email: p?.email ?? '',
        avatar_url: p?.avatar_url ?? null,
        role: p?.role ?? 'freelancer',
        skills: Array.isArray(f.skills) ? f.skills : [],
        hourly_rate: f.hourly_rate,
        status: f.status as FreelancerStatus,
        bio: f.bio ?? null,
        client_count: assignedClients.length,
        task_count: assignedTasks.length,
        assigned_clients: assignedClients,
        assigned_tasks: assignedTasks.map((t: any) => ({ id: t.id, title: t.title, status: t.status })),
      };
    });

    setMembers(result);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  function handleInvite() {
    if (!inviteEmail.trim() || !inviteName.trim()) return;
    setInviteSending(true);
    // Placeholder: In a real app, would call a server action to send invite via Resend
    setTimeout(() => {
      setInviteSending(false);
      setInviteSuccess(true);
    }, 800);
  }

  function closeInviteModal() {
    setShowInvite(false);
    setInviteName('');
    setInviteEmail('');
    setInviteSuccess(false);
  }

  // Access denied for non-owners
  if (!loading && profile && profile.role !== 'owner') {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div
          className="rounded-xl border p-8 text-center max-w-md"
          style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
        >
          <svg className="w-16 h-16 mx-auto mb-4" style={{ color: 'var(--muted)' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
          </svg>
          <h2 className="text-xl font-bold mb-2" style={{ color: 'var(--foreground)' }}>Access Denied</h2>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            Only agency owners can manage the team. Please contact your administrator.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--foreground)' }}>Team</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {loading ? '...' : `${members.length} team member${members.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition-colors"
          style={{ backgroundColor: 'var(--accent)' }}
          onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')}
          onMouseLeave={e => (e.currentTarget.style.backgroundColor = 'var(--accent)')}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Invite Freelancer
        </button>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      )}

      {/* Empty state */}
      {!loading && members.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16" style={{ color: 'var(--muted)' }}>
          <svg className="w-16 h-16 mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <p className="text-sm font-medium">No team members yet</p>
          <p className="text-xs mt-1">Invite freelancers to get started</p>
        </div>
      )}

      {/* Team Grid */}
      {!loading && members.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {members.map(member => {
            const isExpanded = expandedId === member.id;
            return (
              <div
                key={member.id}
                className="rounded-xl border shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
                onClick={() => setExpandedId(isExpanded ? null : member.id)}
              >
                <div className="p-5">
                  {/* Top section */}
                  <div className="flex items-start gap-4 mb-4">
                    <MemberAvatar name={member.full_name} avatarUrl={member.avatar_url} size="lg" />
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold truncate" style={{ color: 'var(--foreground)' }}>
                        {member.full_name}
                      </h3>
                      <a
                        href={`mailto:${member.email}`}
                        className="text-xs hover:underline block truncate"
                        style={{ color: 'var(--accent)' }}
                        onClick={e => e.stopPropagation()}
                      >
                        {member.email}
                      </a>
                      <div className="mt-1.5">
                        <span className={`inline-flex text-[10px] font-medium px-2 py-0.5 rounded-full border ${statusStyles[member.status] || statusStyles['inactive']}`}>
                          {member.status.charAt(0).toUpperCase() + member.status.slice(1).replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Skills */}
                  {member.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {member.skills.map(skill => (
                        <span
                          key={skill}
                          className="text-[10px] px-2 py-0.5 rounded-full font-medium"
                          style={{
                            backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                            color: 'var(--accent)',
                            border: '1px solid color-mix(in srgb, var(--accent) 30%, transparent)',
                          }}
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Stats row */}
                  <div className="flex items-center gap-4 text-xs pt-3 border-t" style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}>
                    {member.hourly_rate != null && (
                      <span className="font-medium">${member.hourly_rate}/hr</span>
                    )}
                    <span>{member.client_count} client{member.client_count !== 1 ? 's' : ''}</span>
                    <span>{member.task_count} task{member.task_count !== 1 ? 's' : ''}</span>
                    <svg className={`w-4 h-4 ml-auto transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Expanded detail panel */}
                {isExpanded && (
                  <div className="px-5 pb-5 pt-0 space-y-4 border-t" style={{ borderColor: 'var(--border)' }}>
                    {/* Bio */}
                    {member.bio && (
                      <p className="text-xs leading-relaxed pt-3" style={{ color: 'var(--muted)' }}>{member.bio}</p>
                    )}

                    {/* Assigned Clients */}
                    <div className="pt-2">
                      <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
                        Assigned Clients
                      </h4>
                      {member.assigned_clients.length === 0 ? (
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>No clients assigned</p>
                      ) : (
                        <div className="space-y-1">
                          {member.assigned_clients.map(c => (
                            <div key={c.id} className="text-xs px-2 py-1.5 rounded-lg" style={{ backgroundColor: 'var(--background)', color: 'var(--foreground)' }}>
                              {c.business_name}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Assigned Tasks */}
                    <div>
                      <h4 className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: 'var(--muted)' }}>
                        Assigned Tasks
                      </h4>
                      {member.assigned_tasks.length === 0 ? (
                        <p className="text-xs" style={{ color: 'var(--muted)' }}>No tasks assigned</p>
                      ) : (
                        <div className="space-y-1">
                          {member.assigned_tasks.map(t => (
                            <div key={t.id} className="text-xs px-2 py-1.5 rounded-lg flex items-center justify-between" style={{ backgroundColor: 'var(--background)' }}>
                              <span style={{ color: 'var(--foreground)' }}>{t.title}</span>
                              <span
                                className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                                style={{
                                  backgroundColor: 'color-mix(in srgb, var(--accent) 10%, transparent)',
                                  color: 'var(--accent)',
                                }}
                              >
                                {t.status.replace('_', ' ')}
                              </span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Hours placeholder */}
                    <div className="flex items-center justify-between text-xs px-2 py-2 rounded-lg" style={{ backgroundColor: 'var(--background)' }}>
                      <span className="font-medium" style={{ color: 'var(--foreground)' }}>Total Hours</span>
                      <span style={{ color: 'var(--muted)' }}>-- (tracking coming soon)</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Invite Modal */}
      {showInvite && (
        <>
          <div className="fixed inset-0 z-40 bg-black/40" onClick={closeInviteModal} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="w-full max-w-md rounded-xl border shadow-xl p-6"
              style={{ backgroundColor: 'var(--card)', borderColor: 'var(--border)' }}
              onClick={e => e.stopPropagation()}
            >
              {inviteSuccess ? (
                <div className="text-center py-4">
                  <svg className="w-12 h-12 mx-auto mb-3 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-bold mb-1" style={{ color: 'var(--foreground)' }}>Invite Sent!</h3>
                  <p className="text-sm mb-4" style={{ color: 'var(--muted)' }}>
                    An invitation email would be sent to <strong>{inviteEmail}</strong> via Resend.
                    They will receive a link to set up their freelancer profile.
                  </p>
                  <button
                    onClick={closeInviteModal}
                    className="px-4 py-2 text-sm font-medium text-white rounded-lg"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    Done
                  </button>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold mb-4" style={{ color: 'var(--foreground)' }}>Invite Freelancer</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Full Name</label>
                      <input
                        type="text"
                        value={inviteName}
                        onChange={e => setInviteName(e.target.value)}
                        placeholder="Jane Smith"
                        className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)',
                          color: 'var(--foreground)',
                        }}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1" style={{ color: 'var(--muted)' }}>Email Address</label>
                      <input
                        type="email"
                        value={inviteEmail}
                        onChange={e => setInviteEmail(e.target.value)}
                        placeholder="jane@example.com"
                        className="w-full px-3 py-2 text-sm rounded-lg border focus:outline-none focus:ring-2"
                        style={{
                          backgroundColor: 'var(--background)',
                          borderColor: 'var(--border)',
                          color: 'var(--foreground)',
                        }}
                        onKeyDown={e => { if (e.key === 'Enter') handleInvite(); }}
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-5">
                    <button
                      onClick={closeInviteModal}
                      className="px-4 py-2 text-sm font-medium rounded-lg border"
                      style={{ borderColor: 'var(--border)', color: 'var(--muted)' }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleInvite}
                      disabled={inviteSending || !inviteName.trim() || !inviteEmail.trim()}
                      className="px-4 py-2 text-sm font-medium text-white rounded-lg disabled:opacity-50"
                      style={{ backgroundColor: 'var(--accent)' }}
                    >
                      {inviteSending ? 'Sending...' : 'Send Invite'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
