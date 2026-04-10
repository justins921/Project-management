'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TenantRow {
  id: string;
  agency_name: string;
  owner_email: string;
  stripe_subscription_status: string;
  created_at: string;
}

interface ProfileRow {
  id: string;
  full_name: string;
  email: string;
  role: string;
  tenant_id: string | null;
  tenant?: { agency_name: string } | null;
}

interface TicketRow {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created_at: string;
  tenant?: { agency_name: string } | null;
  client?: { business_name: string } | null;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const priorityStyles: Record<string, string> = {
  low: 'bg-slate-50 text-slate-600 border-slate-200',
  medium: 'bg-blue-50 text-blue-700 border-blue-200',
  high: 'bg-amber-50 text-amber-700 border-amber-200',
  urgent: 'bg-red-50 text-red-700 border-red-200',
};

const ticketStatusStyles: Record<string, string> = {
  open: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  waiting: 'bg-purple-50 text-purple-700 border-purple-200',
  resolved: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  closed: 'bg-slate-50 text-slate-600 border-slate-200',
};

const subscriptionStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  trialing: 'bg-blue-50 text-blue-700 border-blue-200',
  past_due: 'bg-amber-50 text-amber-700 border-amber-200',
  canceled: 'bg-red-50 text-red-700 border-red-200',
  incomplete: 'bg-slate-50 text-slate-600 border-slate-200',
};

const roleStyles: Record<string, string> = {
  owner: 'bg-purple-50 text-purple-700 border-purple-200',
  freelancer: 'bg-blue-50 text-blue-700 border-blue-200',
  client: 'bg-amber-50 text-amber-700 border-amber-200',
};

/* ------------------------------------------------------------------ */
/*  Skeletons                                                          */
/* ------------------------------------------------------------------ */

function StatCardSkeleton() {
  return (
    <div
      className="rounded-xl border p-5 animate-pulse"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
      }}
    >
      <div className="h-3 rounded w-24 mb-3" style={{ backgroundColor: 'var(--muted)', opacity: 0.2 }} />
      <div className="h-8 rounded w-16" style={{ backgroundColor: 'var(--muted)', opacity: 0.2 }} />
    </div>
  );
}

function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="rounded-lg border p-4 animate-pulse flex gap-4"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
          }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <div
              key={c}
              className="h-4 rounded flex-1"
              style={{ backgroundColor: 'var(--muted)', opacity: 0.15 }}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [tenants, setTenants] = useState<TenantRow[]>([]);
  const [profiles, setProfiles] = useState<ProfileRow[]>([]);
  const [tickets, setTickets] = useState<TicketRow[]>([]);

  // Tab state
  const [activeTab, setActiveTab] = useState<'tenants' | 'tickets' | 'users'>('tenants');

  const loadData = useCallback(async () => {
    const supabase = createClient();

    // Fetch all tenants
    const { data: tenantsData } = await supabase
      .from('tenants')
      .select('id, agency_name, owner_email, stripe_subscription_status, created_at')
      .order('created_at', { ascending: false });

    setTenants((tenantsData as TenantRow[]) || []);

    // Fetch all profiles with tenant name
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, full_name, email, role, tenant_id, tenant:tenants(agency_name)')
      .order('created_at', { ascending: false });

    setProfiles((profilesData as unknown as ProfileRow[]) || []);

    // Fetch open support tickets
    const { data: ticketsData } = await supabase
      .from('support_tickets')
      .select('id, subject, status, priority, created_at, tenant:tenants(agency_name), client:clients(business_name)')
      .in('status', ['open', 'in_progress', 'waiting'])
      .order('created_at', { ascending: false });

    setTickets((ticketsData as unknown as TicketRow[]) || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------- Derived stats ---------- */

  const totalTenants = tenants.length;
  const totalUsers = profiles.length;
  const activeSubscriptions = tenants.filter(
    (t) => t.stripe_subscription_status === 'active' || t.stripe_subscription_status === 'trialing'
  ).length;
  const openTickets = tickets.length;

  /* ---------- Render ---------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-xl sm:text-2xl font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          Super Admin Dashboard
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Platform-wide overview across all tenants.
        </p>
      </div>

      {/* Stats Cards */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div
            className="rounded-xl border p-5"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Total Tenants</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--foreground)' }}>
              {totalTenants}
            </p>
          </div>
          <div
            className="rounded-xl border p-5"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Total Users</p>
            <p className="text-2xl font-bold mt-1" style={{ color: 'var(--foreground)' }}>
              {totalUsers}
            </p>
          </div>
          <div
            className="rounded-xl border p-5"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Active Subscriptions</p>
            <p className="text-2xl font-bold mt-1 text-emerald-600">
              {activeSubscriptions}
            </p>
          </div>
          <div
            className="rounded-xl border p-5"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--muted)' }}>Open Tickets</p>
            <p
              className={`text-2xl font-bold mt-1 ${openTickets > 0 ? 'text-amber-600' : 'text-emerald-600'}`}
            >
              {openTickets}
            </p>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div
        className="flex gap-1 p-1 rounded-lg"
        style={{ backgroundColor: 'var(--card-bg)', border: '1px solid var(--card-border)' }}
      >
        {[
          { key: 'tenants' as const, label: 'All Tenants' },
          { key: 'tickets' as const, label: 'Support Tickets' },
          { key: 'users' as const, label: 'User Management' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="flex-1 px-4 py-2 text-sm font-medium rounded-md transition-colors"
            style={{
              backgroundColor: activeTab === tab.key ? 'var(--accent)' : 'transparent',
              color: activeTab === tab.key ? 'white' : 'var(--muted)',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {loading ? (
        <TableSkeleton />
      ) : (
        <>
          {/* ====== Tenants Tab ====== */}
          {activeTab === 'tenants' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2
                  className="text-base font-semibold"
                  style={{ color: 'var(--foreground)' }}
                >
                  All Tenants
                </h2>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {tenants.length} total
                </span>
              </div>

              {tenants.length === 0 ? (
                <div
                  className="rounded-xl border p-12 text-center"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>No tenants found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        style={{
                          borderBottom: '1px solid var(--card-border)',
                        }}
                      >
                        <th
                          className="text-left py-3 px-4 text-xs font-medium"
                          style={{ color: 'var(--muted)' }}
                        >
                          Agency Name
                        </th>
                        <th
                          className="text-left py-3 px-4 text-xs font-medium"
                          style={{ color: 'var(--muted)' }}
                        >
                          Owner Email
                        </th>
                        <th
                          className="text-left py-3 px-4 text-xs font-medium"
                          style={{ color: 'var(--muted)' }}
                        >
                          Subscription
                        </th>
                        <th
                          className="text-left py-3 px-4 text-xs font-medium"
                          style={{ color: 'var(--muted)' }}
                        >
                          Created
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {tenants.map((tenant) => (
                        <tr
                          key={tenant.id}
                          className="transition-colors"
                          style={{
                            borderBottom: '1px solid var(--card-border)',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = 'var(--card-bg)')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = 'transparent')
                          }
                        >
                          <td
                            className="py-3 px-4 font-medium"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {tenant.agency_name}
                          </td>
                          <td className="py-3 px-4" style={{ color: 'var(--muted)' }}>
                            {tenant.owner_email}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                                subscriptionStyles[tenant.stripe_subscription_status] ||
                                'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {tenant.stripe_subscription_status}
                            </span>
                          </td>
                          <td className="py-3 px-4" style={{ color: 'var(--muted)' }}>
                            {new Date(tenant.created_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ====== Support Tickets Tab ====== */}
          {activeTab === 'tickets' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2
                  className="text-base font-semibold"
                  style={{ color: 'var(--foreground)' }}
                >
                  Open Support Tickets
                </h2>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {tickets.length} open
                </span>
              </div>

              {tickets.length === 0 ? (
                <div
                  className="rounded-xl border p-12 text-center"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <svg
                    className="w-12 h-12 mx-auto mb-3"
                    style={{ color: 'var(--muted)', opacity: 0.3 }}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>
                    No open support tickets. All clear!
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="rounded-xl border p-4 transition-shadow hover:shadow-md"
                      style={{
                        backgroundColor: 'var(--card-bg)',
                        borderColor: 'var(--card-border)',
                      }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <h3
                            className="text-sm font-semibold"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {ticket.subject}
                          </h3>
                          <div className="flex flex-wrap items-center gap-2 mt-1.5">
                            <span className="text-xs" style={{ color: 'var(--muted)' }}>
                              {ticket.tenant?.agency_name || 'Unknown tenant'}
                            </span>
                            {ticket.client?.business_name && (
                              <>
                                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                                  &middot;
                                </span>
                                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                                  {ticket.client.business_name}
                                </span>
                              </>
                            )}
                            <span className="text-xs" style={{ color: 'var(--muted)' }}>
                              &middot;
                            </span>
                            <span className="text-xs" style={{ color: 'var(--muted)' }}>
                              {new Date(ticket.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                              })}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                              priorityStyles[ticket.priority] || 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {ticket.priority}
                          </span>
                          <span
                            className={`text-xs px-2 py-0.5 rounded-full border font-medium ${
                              ticketStatusStyles[ticket.status] || 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {ticket.status.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ====== User Management Tab ====== */}
          {activeTab === 'users' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2
                  className="text-base font-semibold"
                  style={{ color: 'var(--foreground)' }}
                >
                  All Users
                </h2>
                <span className="text-xs" style={{ color: 'var(--muted)' }}>
                  {profiles.length} total
                </span>
              </div>

              {profiles.length === 0 ? (
                <div
                  className="rounded-xl border p-12 text-center"
                  style={{
                    backgroundColor: 'var(--card-bg)',
                    borderColor: 'var(--card-border)',
                  }}
                >
                  <p className="text-sm" style={{ color: 'var(--muted)' }}>No users found.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr
                        style={{
                          borderBottom: '1px solid var(--card-border)',
                        }}
                      >
                        <th
                          className="text-left py-3 px-4 text-xs font-medium"
                          style={{ color: 'var(--muted)' }}
                        >
                          Name
                        </th>
                        <th
                          className="text-left py-3 px-4 text-xs font-medium"
                          style={{ color: 'var(--muted)' }}
                        >
                          Email
                        </th>
                        <th
                          className="text-left py-3 px-4 text-xs font-medium"
                          style={{ color: 'var(--muted)' }}
                        >
                          Role
                        </th>
                        <th
                          className="text-left py-3 px-4 text-xs font-medium"
                          style={{ color: 'var(--muted)' }}
                        >
                          Tenant
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {profiles.map((profile) => (
                        <tr
                          key={profile.id}
                          className="transition-colors"
                          style={{
                            borderBottom: '1px solid var(--card-border)',
                          }}
                          onMouseEnter={(e) =>
                            (e.currentTarget.style.backgroundColor = 'var(--card-bg)')
                          }
                          onMouseLeave={(e) =>
                            (e.currentTarget.style.backgroundColor = 'transparent')
                          }
                        >
                          <td
                            className="py-3 px-4 font-medium"
                            style={{ color: 'var(--foreground)' }}
                          >
                            {profile.full_name || 'Unnamed'}
                          </td>
                          <td className="py-3 px-4" style={{ color: 'var(--muted)' }}>
                            {profile.email}
                          </td>
                          <td className="py-3 px-4">
                            <span
                              className={`text-xs px-2 py-0.5 rounded-full border font-medium capitalize ${
                                roleStyles[profile.role] || 'bg-slate-50 text-slate-600 border-slate-200'
                              }`}
                            >
                              {profile.role}
                            </span>
                          </td>
                          <td className="py-3 px-4" style={{ color: 'var(--muted)' }}>
                            {profile.tenant?.agency_name || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
