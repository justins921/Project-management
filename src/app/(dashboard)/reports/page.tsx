'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Client, Tenant, Profile } from '@/lib/types/database';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ReportRow {
  id: string;
  tenant_id: string;
  client_id: string;
  report_month: string;
  report_data: ReportData | null;
  status: 'draft' | 'sent';
  share_token: string | null;
  sent_at: string | null;
  created_at: string;
  updated_at: string;
  client?: { id: string; business_name: string };
}

interface ReportData {
  client_info: {
    business_name: string;
    contact_name: string;
    contact_email: string;
  };
  projects_summary: { id: string; name: string; status: string }[];
  tasks_completed_count: number;
  site_health_snapshot: {
    url?: string;
    performance_score: number | null;
    seo_score: number | null;
  }[];
  custom_notes: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function formatMonth(dateStr: string): string {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function scoreColor(score: number | null): string {
  if (score === null) return 'bg-slate-200 text-slate-500';
  if (score >= 90) return 'bg-emerald-100 text-emerald-700';
  if (score >= 50) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

/* ------------------------------------------------------------------ */
/*  Skeletons                                                          */
/* ------------------------------------------------------------------ */

function ReportCardSkeleton() {
  return (
    <div
      className="rounded-xl border border-[var(--border)] p-5 shadow-sm animate-pulse"
      style={{ backgroundColor: 'var(--card)' }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2 flex-1">
          <div className="h-4 rounded bg-[var(--muted)]/20 w-3/4" />
          <div className="h-3 rounded bg-[var(--muted)]/20 w-1/2" />
        </div>
        <div className="h-5 w-14 rounded-full bg-[var(--muted)]/20" />
      </div>
      <div className="h-3 rounded bg-[var(--muted)]/20 w-1/3 mt-3" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportRow[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [formClientId, setFormClientId] = useState('');
  const [formMonth, setFormMonth] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [generating, setGenerating] = useState(false);

  // View report state
  const [viewingReport, setViewingReport] = useState<ReportRow | null>(null);

  // Confirm delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ---------- Load data ---------- */
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

    // Fetch clients
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .eq('tenant_id', tenantData.id)
      .order('business_name');
    setClients((clientsData as Client[]) || []);

    // Fetch reports with client join
    const { data: reportsData } = await supabase
      .from('monthly_reports')
      .select('*, client:clients(id, business_name)')
      .eq('tenant_id', tenantData.id)
      .order('created_at', { ascending: false });
    setReports((reportsData as ReportRow[]) || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------- Generate report ---------- */
  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant || !formClientId || !formMonth) return;

    setGenerating(true);
    const supabase = createClient();

    // Fetch client info
    const { data: clientData } = await supabase
      .from('clients')
      .select('*')
      .eq('id', formClientId)
      .single();

    if (!clientData) {
      setGenerating(false);
      return;
    }

    // Fetch active projects for the client
    const { data: projectsData } = await supabase
      .from('projects')
      .select('id, name, status')
      .eq('tenant_id', tenant.id)
      .eq('client_id', formClientId)
      .eq('status', 'active');

    // Calculate the month range for tasks
    const monthDate = new Date(formMonth + '-01T00:00:00');
    const startOfMonth = `${formMonth}-01`;
    const endOfMonth = new Date(
      monthDate.getFullYear(),
      monthDate.getMonth() + 1,
      0
    )
      .toISOString()
      .split('T')[0];

    // Fetch completed tasks count for that month
    const { count: tasksCount } = await supabase
      .from('tasks')
      .select('id', { count: 'exact', head: true })
      .eq('tenant_id', tenant.id)
      .eq('client_id', formClientId)
      .eq('status', 'done')
      .gte('updated_at', startOfMonth)
      .lte('updated_at', endOfMonth);

    // Fetch site health scores
    const { data: healthData } = await supabase
      .from('site_health')
      .select('url, performance_score, seo_score')
      .eq('tenant_id', tenant.id)
      .eq('client_id', formClientId);

    const reportData: ReportData = {
      client_info: {
        business_name: clientData.business_name,
        contact_name: clientData.contact_name,
        contact_email: clientData.contact_email,
      },
      projects_summary: (projectsData || []).map(
        (p: { id: string; name: string; status: string }) => ({
          id: p.id,
          name: p.name,
          status: p.status,
        })
      ),
      tasks_completed_count: tasksCount || 0,
      site_health_snapshot: (healthData || []).map(
        (h: {
          url?: string;
          performance_score: number | null;
          seo_score: number | null;
        }) => ({
          url: h.url,
          performance_score: h.performance_score,
          seo_score: h.seo_score,
        })
      ),
      custom_notes: formNotes,
    };

    const { error } = await supabase.from('monthly_reports').insert({
      tenant_id: tenant.id,
      client_id: formClientId,
      report_month: startOfMonth,
      report_data: reportData,
      status: 'draft',
    });

    if (!error) {
      setShowForm(false);
      setFormClientId('');
      setFormMonth('');
      setFormNotes('');
      await loadData();
    }

    setGenerating(false);
  }

  /* ---------- Send report ---------- */
  async function handleSend(report: ReportRow) {
    const supabase = createClient();
    const { error } = await supabase
      .from('monthly_reports')
      .update({ status: 'sent', sent_at: new Date().toISOString() })
      .eq('id', report.id);

    if (!error) {
      setReports((prev) =>
        prev.map((r) =>
          r.id === report.id
            ? { ...r, status: 'sent' as const, sent_at: new Date().toISOString() }
            : r
        )
      );
      if (viewingReport?.id === report.id) {
        setViewingReport({
          ...viewingReport,
          status: 'sent',
          sent_at: new Date().toISOString(),
        });
      }
    }
  }

  /* ---------- Share link ---------- */
  async function handleShareLink(report: ReportRow) {
    const supabase = createClient();
    let token = report.share_token;

    if (!token) {
      token = crypto.randomUUID();
      const { error } = await supabase
        .from('monthly_reports')
        .update({ share_token: token })
        .eq('id', report.id);

      if (error) return;

      setReports((prev) =>
        prev.map((r) => (r.id === report.id ? { ...r, share_token: token } : r))
      );
      if (viewingReport?.id === report.id) {
        setViewingReport({ ...viewingReport, share_token: token });
      }
    }

    const url = `${window.location.origin}/reports/${token}`;
    await navigator.clipboard.writeText(url);
    alert('Share link copied to clipboard!');
  }

  /* ---------- Delete report ---------- */
  async function handleDelete(reportId: string) {
    const supabase = createClient();
    const { error } = await supabase
      .from('monthly_reports')
      .delete()
      .eq('id', reportId);

    if (!error) {
      setReports((prev) => prev.filter((r) => r.id !== reportId));
      if (viewingReport?.id === reportId) {
        setViewingReport(null);
      }
      setDeletingId(null);
    }
  }

  /* ================================================================ */
  /*  Report Preview                                                   */
  /* ================================================================ */

  function ReportPreview({ report }: { report: ReportRow }) {
    const data = report.report_data;
    if (!data) return <p style={{ color: 'var(--muted)' }}>No report data available.</p>;

    return (
      <div className="space-y-6">
        {/* Header */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="flex items-center gap-4 mb-4">
            {tenant?.agency_logo_url ? (
              <img
                src={tenant.agency_logo_url}
                alt={tenant.agency_name}
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div
                className="h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ backgroundColor: 'var(--accent)' }}
              >
                {tenant?.agency_name?.charAt(0) || 'A'}
              </div>
            )}
            <div>
              <h2
                className="text-lg font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                {tenant?.agency_name || 'Agency'}
              </h2>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                Monthly Report
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
            <div>
              <span style={{ color: 'var(--muted)' }}>Client: </span>
              <span
                className="font-medium"
                style={{ color: 'var(--foreground)' }}
              >
                {data.client_info.business_name}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--muted)' }}>Period: </span>
              <span
                className="font-medium"
                style={{ color: 'var(--foreground)' }}
              >
                {formatMonth(report.report_month)}
              </span>
            </div>
            <div>
              <span style={{ color: 'var(--muted)' }}>Status: </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                  report.status === 'sent'
                    ? 'bg-emerald-100 text-emerald-700'
                    : 'bg-amber-100 text-amber-700'
                }`}
              >
                {report.status === 'sent' ? 'Sent' : 'Draft'}
              </span>
            </div>
          </div>
        </div>

        {/* Projects Summary */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <h3
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            Active Projects
          </h3>
          {data.projects_summary.length > 0 ? (
            <div className="space-y-2">
              {data.projects_summary.map((project) => (
                <div
                  key={project.id}
                  className="flex items-center justify-between p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--background)' }}
                >
                  <span
                    className="text-sm font-medium"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {project.name}
                  </span>
                  <span
                    className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize bg-blue-100 text-blue-700"
                  >
                    {project.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No active projects this period.
            </p>
          )}
        </div>

        {/* Tasks Completed */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <h3
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            Tasks Completed
          </h3>
          <div className="flex items-baseline gap-2">
            <span
              className="text-3xl font-bold"
              style={{ color: 'var(--accent)' }}
            >
              {data.tasks_completed_count}
            </span>
            <span className="text-sm" style={{ color: 'var(--muted)' }}>
              tasks completed this month
            </span>
          </div>
        </div>

        {/* Site Health */}
        <div
          className="rounded-xl border p-6"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <h3
            className="text-base font-semibold mb-3"
            style={{ color: 'var(--foreground)' }}
          >
            Site Health
          </h3>
          {data.site_health_snapshot.length > 0 ? (
            <div className="space-y-3">
              {data.site_health_snapshot.map((site, idx) => (
                <div
                  key={idx}
                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 p-3 rounded-lg"
                  style={{ backgroundColor: 'var(--background)' }}
                >
                  {site.url && (
                    <span
                      className="text-sm truncate max-w-[200px]"
                      style={{ color: 'var(--foreground)' }}
                    >
                      {site.url}
                    </span>
                  )}
                  <div className="flex gap-4">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>
                        Performance
                      </span>
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${scoreColor(
                          site.performance_score
                        )}`}
                      >
                        {site.performance_score ?? '?'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs" style={{ color: 'var(--muted)' }}>
                        SEO
                      </span>
                      <span
                        className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${scoreColor(
                          site.seo_score
                        )}`}
                      >
                        {site.seo_score ?? '?'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm" style={{ color: 'var(--muted)' }}>
              No site health data available.
            </p>
          )}
        </div>

        {/* Custom Notes */}
        {data.custom_notes && (
          <div
            className="rounded-xl border p-6"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h3
              className="text-base font-semibold mb-3"
              style={{ color: 'var(--foreground)' }}
            >
              Notes
            </h3>
            <p
              className="text-sm whitespace-pre-wrap leading-relaxed"
              style={{ color: 'var(--foreground)' }}
            >
              {data.custom_notes}
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-wrap gap-3">
          {report.status === 'draft' && (
            <button
              onClick={() => handleSend(report)}
              className="inline-flex items-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
              style={{ backgroundColor: 'var(--accent)' }}
            >
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
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              Send Report
            </button>
          )}
          <button
            onClick={() => handleShareLink(report)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
            style={{
              border: '1px solid var(--border)',
              backgroundColor: 'var(--card)',
              color: 'var(--foreground)',
            }}
          >
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
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            Share Link
          </button>
          <button
            onClick={() => setViewingReport(null)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
            style={{
              border: '1px solid var(--border)',
              backgroundColor: 'var(--card)',
              color: 'var(--muted)',
            }}
          >
            Back to List
          </button>
        </div>
      </div>
    );
  }

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  // Viewing a single report
  if (viewingReport) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewingReport(null)}
            className="p-2 rounded-lg transition-colors"
            style={{
              border: '1px solid var(--border)',
              backgroundColor: 'var(--card)',
              color: 'var(--muted)',
            }}
          >
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>
          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{ color: 'var(--foreground)' }}
          >
            Report Preview
          </h1>
        </div>
        <ReportPreview report={viewingReport} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{ color: 'var(--foreground)' }}
          >
            Monthly Reports
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {loading
              ? '...'
              : `${reports.length} report${reports.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shrink-0"
          style={{ backgroundColor: 'var(--accent)' }}
        >
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          <span className="hidden sm:inline">Generate Report</span>
        </button>
      </div>

      {/* Generate Report Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowForm(false)}
          />
          <div
            className="relative w-full max-w-lg rounded-xl border shadow-xl p-6"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <div className="flex items-center justify-between mb-6">
              <h2
                className="text-lg font-bold"
                style={{ color: 'var(--foreground)' }}
              >
                Generate Monthly Report
              </h2>
              <button
                onClick={() => setShowForm(false)}
                className="p-1.5 rounded-lg transition-colors"
                style={{ color: 'var(--muted)' }}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              {/* Client select */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: 'var(--foreground)' }}
                >
                  Client
                </label>
                <select
                  value={formClientId}
                  onChange={(e) => setFormClientId(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                >
                  <option value="">Select a client...</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.business_name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Month picker */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: 'var(--foreground)' }}
                >
                  Report Month
                </label>
                <input
                  type="month"
                  value={formMonth}
                  onChange={(e) => setFormMonth(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              {/* Custom notes */}
              <div>
                <label
                  className="block text-sm font-medium mb-1.5"
                  style={{ color: 'var(--foreground)' }}
                >
                  Custom Notes
                </label>
                <textarea
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={4}
                  placeholder="Add any custom notes for this report..."
                  className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={generating}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
                  style={{ backgroundColor: 'var(--accent)' }}
                >
                  {generating ? (
                    <>
                      <svg
                        className="w-4 h-4 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      Generating...
                    </>
                  ) : (
                    'Generate Report'
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--muted)',
                  }}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setDeletingId(null)}
          />
          <div
            className="relative w-full max-w-sm rounded-xl border shadow-xl p-6"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            <h3
              className="text-base font-semibold mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              Delete Report
            </h3>
            <p className="text-sm mb-5" style={{ color: 'var(--muted)' }}>
              Are you sure you want to delete this report? This action cannot be
              undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleDelete(deletingId)}
                className="flex-1 px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-colors"
                style={{ backgroundColor: 'var(--danger, #ef4444)' }}
              >
                Delete
              </button>
              <button
                onClick={() => setDeletingId(null)}
                className="flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--card)',
                  color: 'var(--muted)',
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ReportCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Reports Grid */}
      {!loading && reports.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {reports.map((report) => (
            <div
              key={report.id}
              className="rounded-xl border p-5 shadow-sm hover:shadow-md transition-all group"
              style={{
                backgroundColor: 'var(--card)',
                borderColor: 'var(--border)',
              }}
            >
              {/* Card header */}
              <div className="flex items-start justify-between mb-3">
                <div className="min-w-0 flex-1">
                  <h3
                    className="text-base font-semibold truncate"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {report.client?.business_name || 'Unknown Client'}
                  </h3>
                  <p className="text-sm mt-0.5" style={{ color: 'var(--muted)' }}>
                    {formatMonth(report.report_month)}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium shrink-0 ${
                    report.status === 'sent'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-amber-100 text-amber-700'
                  }`}
                >
                  {report.status === 'sent' ? 'Sent' : 'Draft'}
                </span>
              </div>

              {/* Meta */}
              <div className="text-xs space-y-1 mb-4" style={{ color: 'var(--muted)' }}>
                <p>
                  Created {formatDate(report.created_at)}
                </p>
                {report.sent_at && (
                  <p>
                    Sent {formatDate(report.sent_at)}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div
                className="flex items-center gap-2 pt-3 flex-wrap"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <button
                  onClick={() => setViewingReport(report)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                  style={{
                    backgroundColor: 'var(--accent)',
                    color: '#fff',
                  }}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                  View
                </button>
                <button
                  onClick={() => handleShareLink(report)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--card)',
                    color: 'var(--foreground)',
                  }}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                    />
                  </svg>
                  Share
                </button>
                {report.status === 'draft' && (
                  <button
                    onClick={() => handleSend(report)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors bg-emerald-100 text-emerald-700"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                    Send
                  </button>
                )}
                <button
                  onClick={() => setDeletingId(report.id)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ml-auto"
                  style={{ color: 'var(--danger, #ef4444)' }}
                >
                  <svg
                    className="w-3.5 h-3.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                    />
                  </svg>
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && reports.length === 0 && (
        <div className="text-center py-16">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--accent)', opacity: 0.1 }}
          >
            <svg
              className="w-8 h-8"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              style={{ color: 'var(--accent)' }}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <p className="text-base font-medium" style={{ color: 'var(--foreground)' }}>
            No reports yet
          </p>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Generate your first monthly report to get started.
          </p>
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 mt-4 px-4 py-2.5 text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
            style={{ backgroundColor: 'var(--accent)' }}
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            Generate Report
          </button>
        </div>
      )}
    </div>
  );
}
