'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type {
  Client,
  OnboardingItem,
  Project,
  ClientRequest,
  Profile,
  Tenant,
} from '@/lib/types/database';
import Avatar from '@/components/Avatar';

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  onboarding: 'bg-blue-50 text-blue-700 border-blue-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  churned: 'bg-slate-100 text-slate-500 border-slate-200',
};

const projectStatusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-violet-50 text-violet-700 border-violet-200',
  on_hold: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-blue-50 text-blue-700 border-blue-200',
};

const requestStatusStyles: Record<string, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  incoming: 'bg-amber-50 text-amber-700 border-amber-200',
  done: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

function DetailSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-4 rounded w-32 bg-[var(--muted)]/20" />
      <div
        className="rounded-xl border p-6"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-start gap-5">
          <div className="w-14 h-14 rounded-full bg-[var(--muted)]/20 shrink-0" />
          <div className="flex-1 space-y-3">
            <div className="h-6 rounded w-48 bg-[var(--muted)]/20" />
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-1">
                <div className="h-3 rounded w-12 bg-[var(--muted)]/20" />
                <div className="h-4 rounded w-24 bg-[var(--muted)]/20" />
              </div>
              <div className="space-y-1">
                <div className="h-3 rounded w-12 bg-[var(--muted)]/20" />
                <div className="h-4 rounded w-32 bg-[var(--muted)]/20" />
              </div>
              <div className="space-y-1">
                <div className="h-3 rounded w-12 bg-[var(--muted)]/20" />
                <div className="h-4 rounded w-20 bg-[var(--muted)]/20" />
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-xl border p-4"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="h-3 rounded w-20 bg-[var(--muted)]/20 mb-2" />
            <div className="h-8 rounded w-12 bg-[var(--muted)]/20" />
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ClientDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const clientId = params.id;

  const [client, setClient] = useState<Client | null>(null);
  const [onboardingItems, setOnboardingItems] = useState<OnboardingItem[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Client>>({});
  const [saving, setSaving] = useState(false);
  const [siteHealthScore, setSiteHealthScore] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: p } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    setProfile(p as Profile | null);

    if (!p) {
      setLoading(false);
      return;
    }

    let tenantData: Tenant | null = null;
    if (p.role === 'owner') {
      const { data: t } = await supabase
        .from('tenants')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      tenantData = t as Tenant | null;
    } else if (p.tenant_id) {
      const { data: t } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', p.tenant_id)
        .single();
      tenantData = t as Tenant | null;
    }
    setTenant(tenantData);

    if (!tenantData) {
      setLoading(false);
      return;
    }

    // Fetch client
    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .eq('tenant_id', tenantData.id)
      .single();

    if (!clientData) {
      setLoading(false);
      return;
    }

    setClient(clientData as Client);

    // Fetch related data in parallel
    const [onboardingRes, projectsRes, requestsRes, healthRes] =
      await Promise.all([
        supabase
          .from('onboarding_items')
          .select('*')
          .eq('client_id', clientId)
          .eq('tenant_id', tenantData.id)
          .order('sort_order', { ascending: true }),
        supabase
          .from('projects')
          .select('*')
          .eq('client_id', clientId)
          .eq('tenant_id', tenantData.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('client_requests')
          .select('*')
          .eq('client_id', clientId)
          .eq('tenant_id', tenantData.id)
          .order('created_at', { ascending: false })
          .limit(5),
        supabase
          .from('site_health')
          .select('performance_score')
          .eq('client_id', clientId)
          .eq('tenant_id', tenantData.id)
          .order('last_checked_at', { ascending: false })
          .limit(1),
      ]);

    setOnboardingItems((onboardingRes.data as OnboardingItem[]) || []);
    setProjects((projectsRes.data as Project[]) || []);
    setRequests((requestsRes.data as ClientRequest[]) || []);

    if (healthRes.data && healthRes.data.length > 0) {
      setSiteHealthScore(
        (healthRes.data[0] as { performance_score: number | null })
          .performance_score
      );
    }

    setLoading(false);
  }, [clientId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const toggleOnboardingItem = async (item: OnboardingItem) => {
    const supabase = createClient();
    const newCompleted = !item.is_completed;

    // Optimistic update
    setOnboardingItems((prev) =>
      prev.map((i) =>
        i.id === item.id
          ? {
              ...i,
              is_completed: newCompleted,
              completed_at: newCompleted ? new Date().toISOString() : null,
            }
          : i
      )
    );

    await supabase
      .from('onboarding_items')
      .update({
        is_completed: newCompleted,
        completed_at: newCompleted ? new Date().toISOString() : null,
      })
      .eq('id', item.id);
  };

  const handleInviteToPortal = async () => {
    if (!client) return;
    setInviteLoading(true);

    const supabase = createClient();
    const token = crypto.randomUUID();

    const { error } = await supabase
      .from('clients')
      .update({ portal_invite_token: token })
      .eq('id', client.id);

    if (!error) {
      const link = `${window.location.origin}/auth/accept-invite?token=${token}`;
      setInviteLink(link);
      setClient({ ...client, portal_invite_token: token });
    }

    setInviteLoading(false);
  };

  const startEditing = () => {
    if (!client) return;
    setEditForm({
      business_name: client.business_name,
      contact_name: client.contact_name,
      contact_email: client.contact_email,
      phone: client.phone,
      website_url: client.website_url,
      platform: client.platform,
      retainer_amount: client.retainer_amount,
      notes: client.notes,
      status: client.status,
    });
    setEditing(true);
  };

  const saveEdit = async () => {
    if (!client) return;
    setSaving(true);

    const supabase = createClient();
    const { error } = await supabase
      .from('clients')
      .update({
        business_name: editForm.business_name,
        contact_name: editForm.contact_name,
        contact_email: editForm.contact_email,
        phone: editForm.phone || null,
        website_url: editForm.website_url || null,
        platform: editForm.platform,
        retainer_amount: editForm.retainer_amount,
        notes: editForm.notes || null,
        status: editForm.status,
        updated_at: new Date().toISOString(),
      })
      .eq('id', client.id);

    if (!error) {
      setClient({ ...client, ...editForm } as Client);
      setEditing(false);
    }

    setSaving(false);
  };

  if (loading) return <DetailSkeleton />;
  if (!client) {
    return (
      <div className="text-center py-16">
        <p style={{ color: 'var(--muted)' }}>Client not found.</p>
        <Link
          href="/clients"
          className="text-sm mt-2 inline-block"
          style={{ color: 'var(--accent)' }}
        >
          Back to Clients
        </Link>
      </div>
    );
  }

  const activeProjectsCount = projects.filter(
    (p) => p.status === 'active'
  ).length;
  const pendingRequestsCount = requests.filter(
    (r) => r.status === 'incoming'
  ).length;

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm" style={{ color: 'var(--muted)' }}>
        <Link
          href="/clients"
          className="transition-colors hover:opacity-80"
          style={{ color: 'var(--accent)' }}
        >
          Clients
        </Link>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span style={{ color: 'var(--foreground)' }} className="font-medium">
          {client.business_name}
        </span>
      </nav>

      {/* Client Header */}
      <div
        className="rounded-xl border p-4 sm:p-6 shadow-sm"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div className="flex items-start gap-4 sm:gap-5">
          <Avatar name={client.business_name} size="lg" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="flex items-center gap-3">
                <h1
                  className="text-xl sm:text-2xl font-bold truncate"
                  style={{ color: 'var(--foreground)' }}
                >
                  {client.business_name}
                </h1>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize shrink-0 ${
                    statusStyles[client.status] || statusStyles.active
                  }`}
                >
                  {client.status}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={startEditing}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--foreground)',
                    backgroundColor: 'var(--card)',
                  }}
                >
                  Edit
                </button>
                <button
                  onClick={handleInviteToPortal}
                  disabled={inviteLoading || !!client.portal_user_id}
                  className="px-3 py-1.5 text-xs font-medium rounded-lg text-white transition-colors disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {client.portal_user_id
                    ? 'Portal Active'
                    : inviteLoading
                      ? 'Generating...'
                      : 'Invite to Portal'}
                </button>
              </div>
            </div>

            {inviteLink && (
              <div
                className="mt-3 p-3 rounded-lg text-xs break-all"
                style={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                }}
              >
                <span className="font-medium">Invite link: </span>
                <span style={{ color: 'var(--accent)' }}>{inviteLink}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
              <div>
                <p
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--muted)' }}
                >
                  Contact
                </p>
                <p
                  className="text-sm font-medium mt-0.5"
                  style={{ color: 'var(--foreground)' }}
                >
                  {client.contact_name}
                </p>
              </div>
              <div>
                <p
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--muted)' }}
                >
                  Email
                </p>
                <a
                  href={`mailto:${client.contact_email}`}
                  className="text-sm font-medium mt-0.5 block transition-colors"
                  style={{ color: 'var(--accent)' }}
                >
                  {client.contact_email}
                </a>
              </div>
              <div>
                <p
                  className="text-xs font-medium uppercase tracking-wider"
                  style={{ color: 'var(--muted)' }}
                >
                  Phone
                </p>
                <p
                  className="text-sm font-medium mt-0.5"
                  style={{ color: 'var(--foreground)' }}
                >
                  {client.phone || 'Not set'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40">
          <div
            className="rounded-xl border shadow-lg w-full max-w-lg max-h-[85vh] overflow-y-auto p-6 space-y-4"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h2
              className="text-lg font-bold"
              style={{ color: 'var(--foreground)' }}
            >
              Edit Client
            </h2>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--foreground)' }}
              >
                Business Name
              </label>
              <input
                type="text"
                value={editForm.business_name || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, business_name: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--foreground)' }}
                >
                  Contact Name
                </label>
                <input
                  type="text"
                  value={editForm.contact_name || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, contact_name: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--foreground)' }}
                >
                  Contact Email
                </label>
                <input
                  type="email"
                  value={editForm.contact_email || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, contact_email: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--foreground)' }}
                >
                  Phone
                </label>
                <input
                  type="tel"
                  value={editForm.phone || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--foreground)' }}
                >
                  Status
                </label>
                <select
                  value={editForm.status || 'active'}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      status: e.target.value as Client['status'],
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                >
                  <option value="active">Active</option>
                  <option value="onboarding">Onboarding</option>
                  <option value="paused">Paused</option>
                  <option value="churned">Churned</option>
                </select>
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--foreground)' }}
              >
                Website URL
              </label>
              <input
                type="url"
                value={editForm.website_url || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, website_url: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--foreground)' }}
                >
                  Platform
                </label>
                <input
                  type="text"
                  value={editForm.platform || ''}
                  onChange={(e) =>
                    setEditForm({ ...editForm, platform: e.target.value })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
              <div>
                <label
                  className="block text-sm font-medium mb-1"
                  style={{ color: 'var(--foreground)' }}
                >
                  Retainer Amount
                </label>
                <input
                  type="number"
                  value={editForm.retainer_amount ?? 0}
                  onChange={(e) =>
                    setEditForm({
                      ...editForm,
                      retainer_amount: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>
            </div>

            <div>
              <label
                className="block text-sm font-medium mb-1"
                style={{ color: 'var(--foreground)' }}
              >
                Notes
              </label>
              <textarea
                rows={3}
                value={editForm.notes || ''}
                onChange={(e) =>
                  setEditForm({ ...editForm, notes: e.target.value })
                }
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 resize-none"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setEditing(false)}
                className="px-4 py-2 text-sm font-medium transition-colors"
                style={{ color: 'var(--muted)' }}
              >
                Cancel
              </button>
              <button
                onClick={saveEdit}
                disabled={saving}
                className="px-5 py-2 text-sm font-medium text-white rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="rounded-xl border p-4 shadow-sm"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Active Projects
          </p>
          <p
            className="text-2xl font-bold mt-1"
            style={{ color: 'var(--foreground)' }}
          >
            {activeProjectsCount}
          </p>
        </div>
        <div
          className="rounded-xl border p-4 shadow-sm"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Pending Requests
          </p>
          <p className="text-2xl font-bold text-amber-600 mt-1">
            {pendingRequestsCount}
          </p>
        </div>
        <div
          className="rounded-xl border p-4 shadow-sm"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <p className="text-xs" style={{ color: 'var(--muted)' }}>
            Site Health
          </p>
          <p
            className={`text-2xl font-bold mt-1 ${
              siteHealthScore !== null && siteHealthScore >= 80
                ? 'text-emerald-600'
                : siteHealthScore !== null && siteHealthScore >= 50
                  ? 'text-amber-600'
                  : 'text-red-600'
            }`}
          >
            {siteHealthScore !== null ? `${siteHealthScore}%` : '--'}
          </p>
        </div>
      </div>

      {/* Onboarding Checklist */}
      {onboardingItems.length > 0 && (
        <div
          className="rounded-xl border shadow-sm"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between">
              <h2
                className="text-lg font-semibold"
                style={{ color: 'var(--foreground)' }}
              >
                Onboarding Checklist
              </h2>
              <span className="text-xs" style={{ color: 'var(--muted)' }}>
                {onboardingItems.filter((i) => i.is_completed).length}/
                {onboardingItems.length} completed
              </span>
            </div>
            {/* Progress bar */}
            <div
              className="mt-2 h-1.5 rounded-full overflow-hidden"
              style={{ backgroundColor: 'var(--border)' }}
            >
              <div
                className="h-full rounded-full transition-all bg-emerald-500"
                style={{
                  width: `${(onboardingItems.filter((i) => i.is_completed).length / onboardingItems.length) * 100}%`,
                }}
              />
            </div>
          </div>
          <div className="p-4 space-y-1">
            {onboardingItems.map((item) => (
              <label
                key={item.id}
                className="flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors hover:opacity-80"
                style={{ backgroundColor: 'var(--card)' }}
              >
                <input
                  type="checkbox"
                  checked={item.is_completed}
                  onChange={() => toggleOnboardingItem(item)}
                  className="w-4 h-4 rounded border-2 accent-emerald-500"
                  style={{ borderColor: 'var(--border)' }}
                />
                <span
                  className={`text-sm ${item.is_completed ? 'line-through opacity-50' : ''}`}
                  style={{ color: 'var(--foreground)' }}
                >
                  {item.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* Projects */}
      <div
        className="rounded-xl border shadow-sm"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div
          className="px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            Projects
          </h2>
        </div>
        {projects.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No projects yet.
            </p>
          </div>
        ) : (
          <div>
            {projects.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="block p-4 sm:p-5 transition-colors hover:opacity-80"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3
                        className="text-sm font-semibold"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {project.name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${
                          projectStatusStyles[project.status] ||
                          'bg-gray-50 text-gray-700 border-gray-200'
                        }`}
                      >
                        {project.status.replace('_', ' ')}
                      </span>
                    </div>
                    {project.service && (
                      <p className="text-xs" style={{ color: 'var(--muted)' }}>
                        {project.service}
                      </p>
                    )}
                  </div>
                  {project.budget !== null && project.budget !== undefined && (
                    <span
                      className="text-sm font-semibold shrink-0"
                      style={{ color: 'var(--foreground)' }}
                    >
                      ${project.budget.toLocaleString()}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Requests */}
      <div
        className="rounded-xl border shadow-sm"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div
          className="px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h2
            className="text-lg font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            Recent Requests
          </h2>
        </div>
        {requests.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No requests yet.
            </p>
          </div>
        ) : (
          <div>
            {requests.map((request) => (
              <div
                key={request.id}
                className="p-4 sm:p-5"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3
                      className="text-sm font-medium truncate"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {request.title}
                    </h3>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--muted)' }}>
                      {new Date(request.created_at).toLocaleDateString(
                        'en-US',
                        {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        }
                      )}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize shrink-0 ${
                      requestStatusStyles[request.status] ||
                      'bg-gray-50 text-gray-700 border-gray-200'
                    }`}
                  >
                    {request.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      {client.notes && (
        <div
          className="rounded-xl border shadow-sm"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div
            className="px-6 py-4"
            style={{ borderBottom: '1px solid var(--border)' }}
          >
            <h2
              className="text-lg font-semibold"
              style={{ color: 'var(--foreground)' }}
            >
              Notes
            </h2>
          </div>
          <div className="p-6">
            <p
              className="text-sm whitespace-pre-wrap"
              style={{ color: 'var(--foreground)' }}
            >
              {client.notes}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
