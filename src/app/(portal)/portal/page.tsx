'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  ClientRequestStatus,
} from '@/lib/types/database';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ClientRecord {
  id: string;
  business_name: string;
  contact_name: string;
}

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  start_date: string;
  end_date: string;
}

interface SiteHealthRow {
  id: string;
  url: string;
  performance_score: number | null;
  seo_score: number | null;
  accessibility_score: number | null;
  best_practices_score: number | null;
  last_checked_at: string | null;
}

interface ReportRow {
  id: string;
  month: number;
  year: number;
  share_token: string;
  sent_at: string | null;
}

interface RequestRow {
  id: string;
  title: string;
  description: string | null;
  status: ClientRequestStatus;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  completed: 'bg-blue-50 text-blue-700 border-blue-200',
  on_hold: 'bg-amber-50 text-amber-700 border-amber-200',
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
};

const statusLabels: Record<string, string> = {
  active: 'Active',
  completed: 'Completed',
  on_hold: 'On Hold',
  pending: 'Pending',
  in_progress: 'In Progress',
};

function scoreColor(score: number | null): string {
  if (score === null) return 'text-muted';
  if (score >= 90) return 'text-emerald-600';
  if (score >= 50) return 'text-amber-600';
  return 'text-red-600';
}

function scoreBg(score: number | null): string {
  if (score === null) return 'bg-slate-300';
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

const monthNames = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/* ------------------------------------------------------------------ */
/*  Skeletons                                                          */
/* ------------------------------------------------------------------ */

function CardSkeleton() {
  return (
    <div
      className="rounded-xl border p-5 animate-pulse space-y-3"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
      }}
    >
      <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--muted)', opacity: 0.2 }} />
      <div className="h-3 rounded w-1/2" style={{ backgroundColor: 'var(--muted)', opacity: 0.2 }} />
      <div className="h-3 rounded w-full" style={{ backgroundColor: 'var(--muted)', opacity: 0.2 }} />
    </div>
  );
}

function SectionSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      <div className="h-5 rounded w-40 animate-pulse" style={{ backgroundColor: 'var(--muted)', opacity: 0.2 }} />
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: count }).map((_, i) => (
          <CardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Score Bar                                                          */
/* ------------------------------------------------------------------ */

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs" style={{ color: 'var(--muted)' }}>{label}</span>
        <span className={`text-xs font-semibold ${scoreColor(score)}`}>
          {score !== null ? score : '--'}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${scoreBg(score)}`}
          style={{ width: score !== null ? `${score}%` : '0%' }}
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PortalDashboard() {
  const [loading, setLoading] = useState(true);
  const [clientRecord, setClientRecord] = useState<ClientRecord | null>(null);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [siteHealth, setSiteHealth] = useState<SiteHealthRow[]>([]);
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [requests, setRequests] = useState<RequestRow[]>([]);

  // Submit request form
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Find the client record linked to this user
    const { data: clientData } = await supabase
      .from('clients')
      .select('id, business_name, contact_name, tenant_id')
      .eq('portal_user_id', user.id)
      .single();

    if (!clientData) {
      setLoading(false);
      return;
    }

    setClientRecord({
      id: clientData.id,
      business_name: clientData.business_name,
      contact_name: clientData.contact_name,
    });

    const clientId = clientData.id;
    const tenantId = clientData.tenant_id;

    // Fetch projects
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, name, status, start_date, end_date')
      .eq('tenant_id', tenantId)
      .eq('client_id', clientId)
      .order('start_date', { ascending: false });

    setProjects((projectsData as ProjectRow[]) || []);

    // Fetch site health
    const { data: healthData } = await supabase
      .from('site_health')
      .select('id, url, performance_score, seo_score, accessibility_score, best_practices_score, last_checked_at')
      .eq('tenant_id', tenantId)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    setSiteHealth((healthData as SiteHealthRow[]) || []);

    // Fetch monthly reports (only sent)
    const { data: reportsData } = await supabase
      .from('monthly_reports')
      .select('id, month, year, share_token, sent_at')
      .eq('tenant_id', tenantId)
      .eq('client_id', clientId)
      .not('sent_at', 'is', null)
      .order('year', { ascending: false })
      .order('month', { ascending: false });

    setReports((reportsData as ReportRow[]) || []);

    // Fetch client requests
    const { data: requestsData } = await supabase
      .from('client_requests')
      .select('id, title, description, status, created_at')
      .eq('tenant_id', tenantId)
      .eq('client_id', clientId)
      .order('created_at', { ascending: false });

    setRequests((requestsData as RequestRow[]) || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------- Submit request ---------- */

  const handleSubmitRequest = useCallback(async () => {
    if (!newTitle.trim() || !clientRecord) return;
    setSubmitting(true);

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setSubmitting(false);
      return;
    }

    // Get tenant_id from the client record
    const { data: clientData } = await supabase
      .from('clients')
      .select('tenant_id')
      .eq('id', clientRecord.id)
      .single();

    if (!clientData) {
      setSubmitting(false);
      return;
    }

    const { data: created } = await supabase
      .from('client_requests')
      .insert({
        tenant_id: clientData.tenant_id,
        client_id: clientRecord.id,
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        status: 'pending' as ClientRequestStatus,
      })
      .select('id, title, description, status, created_at')
      .single();

    if (created) {
      setRequests((prev) => [created as RequestRow, ...prev]);
      setNewTitle('');
      setNewDescription('');
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    }

    setSubmitting(false);
  }, [newTitle, newDescription, clientRecord]);

  /* ---------- Render ---------- */

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-7 rounded w-48 mb-2" style={{ backgroundColor: 'var(--muted)', opacity: 0.2 }} />
          <div className="h-4 rounded w-64" style={{ backgroundColor: 'var(--muted)', opacity: 0.2 }} />
        </div>
        <SectionSkeleton count={3} />
        <SectionSkeleton count={2} />
        <SectionSkeleton count={3} />
      </div>
    );
  }

  if (!clientRecord) {
    return (
      <div className="text-center py-16">
        <svg
          className="w-16 h-16 mx-auto mb-4"
          style={{ color: 'var(--muted)', opacity: 0.3 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h2
          className="text-lg font-semibold mb-2"
          style={{ color: 'var(--foreground)' }}
        >
          No Client Account Found
        </h2>
        <p className="text-sm" style={{ color: 'var(--muted)' }}>
          Your account is not linked to a client record. Please contact your agency.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1
          className="text-xl sm:text-2xl font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          Welcome, {clientRecord.contact_name || clientRecord.business_name}
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Here is an overview of your projects and activity with us.
        </p>
      </div>

      {/* ====== My Projects ====== */}
      <section>
        <h2
          className="text-base font-semibold mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          My Projects
        </h2>
        {projects.length === 0 ? (
          <div
            className="rounded-xl border p-8 text-center"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No projects yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map((project) => (
              <div
                key={project.id}
                className="rounded-xl border p-5 transition-shadow hover:shadow-md"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <div className="flex items-start justify-between gap-2 mb-3">
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {project.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${
                      statusStyles[project.status] || 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {statusLabels[project.status] || project.status}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs" style={{ color: 'var(--muted)' }}>
                  <span>
                    {new Date(project.start_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                  <span>-</span>
                  <span>
                    {new Date(project.end_date).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ====== Site Health ====== */}
      <section>
        <h2
          className="text-base font-semibold mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          Site Health
        </h2>
        {siteHealth.length === 0 ? (
          <div
            className="rounded-xl border p-8 text-center"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No site health data available.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {siteHealth.map((site) => (
              <div
                key={site.id}
                className="rounded-xl border p-5 transition-shadow hover:shadow-md"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-semibold hover:underline block mb-4 truncate"
                  style={{ color: 'var(--accent)' }}
                >
                  {site.url}
                </a>
                <div className="space-y-2.5">
                  <ScoreBar label="Performance" score={site.performance_score} />
                  <ScoreBar label="SEO" score={site.seo_score} />
                  <ScoreBar label="Accessibility" score={site.accessibility_score} />
                  <ScoreBar label="Best Practices" score={site.best_practices_score} />
                </div>
                {site.last_checked_at && (
                  <p
                    className="text-xs mt-3 pt-3"
                    style={{
                      color: 'var(--muted)',
                      borderTop: '1px solid var(--card-border)',
                    }}
                  >
                    Last checked:{' '}
                    {new Date(site.last_checked_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ====== Reports ====== */}
      <section>
        <h2
          className="text-base font-semibold mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          Reports
        </h2>
        {reports.length === 0 ? (
          <div
            className="rounded-xl border p-8 text-center"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No reports available yet.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {reports.map((report) => (
              <div
                key={report.id}
                className="rounded-xl border p-5 transition-shadow hover:shadow-md"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3
                    className="text-sm font-semibold"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {monthNames[report.month - 1]} {report.year}
                  </h3>
                  <span
                    className="text-xs px-2 py-0.5 rounded-full border font-medium bg-emerald-50 text-emerald-700 border-emerald-200"
                  >
                    Sent
                  </span>
                </div>
                {report.sent_at && (
                  <p className="text-xs" style={{ color: 'var(--muted)' }}>
                    Sent on{' '}
                    {new Date(report.sent_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ====== Submit Request ====== */}
      <section>
        <h2
          className="text-base font-semibold mb-4"
          style={{ color: 'var(--foreground)' }}
        >
          Submit a Request
        </h2>
        <div
          className="rounded-xl border p-5 space-y-4"
          style={{
            backgroundColor: 'var(--card-bg)',
            borderColor: 'var(--card-border)',
          }}
        >
          {submitSuccess && (
            <div className="px-4 py-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">
              Request submitted successfully!
            </div>
          )}
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--muted)' }}
            >
              Title
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What do you need help with?"
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium mb-1.5"
              style={{ color: 'var(--muted)' }}
            >
              Description (optional)
            </label>
            <textarea
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              rows={3}
              placeholder="Provide additional details..."
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none"
              style={{
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
              }}
            />
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleSubmitRequest}
              disabled={submitting || !newTitle.trim()}
              className="px-4 py-2 text-sm text-white font-medium rounded-lg transition-colors disabled:opacity-50 shadow-sm"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--accent)')
              }
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </div>
      </section>

      {/* ====== My Requests ====== */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            My Requests
          </h2>
          <span className="text-xs" style={{ color: 'var(--muted)' }}>
            {requests.length} total
          </span>
        </div>
        {requests.length === 0 ? (
          <div
            className="rounded-xl border p-8 text-center"
            style={{
              backgroundColor: 'var(--card-bg)',
              borderColor: 'var(--card-border)',
            }}
          >
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No requests submitted yet. Use the form above to submit one.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {requests.map((req) => (
              <div
                key={req.id}
                className="rounded-xl border p-4 flex items-start justify-between gap-3 transition-shadow hover:shadow-md"
                style={{
                  backgroundColor: 'var(--card-bg)',
                  borderColor: 'var(--card-border)',
                }}
              >
                <div className="min-w-0 flex-1">
                  <h4
                    className="text-sm font-medium"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {req.title}
                  </h4>
                  {req.description && (
                    <p
                      className="text-xs mt-1 line-clamp-2"
                      style={{ color: 'var(--muted)' }}
                    >
                      {req.description}
                    </p>
                  )}
                  <p
                    className="text-xs mt-2"
                    style={{ color: 'var(--muted)' }}
                  >
                    {new Date(req.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-0.5 rounded-full border font-medium shrink-0 ${
                    statusStyles[req.status] || 'bg-slate-50 text-slate-600 border-slate-200'
                  }`}
                >
                  {statusLabels[req.status] || req.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
