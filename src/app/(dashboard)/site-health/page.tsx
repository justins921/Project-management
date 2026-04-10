'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { SiteHealth, Client, Tenant, Profile } from '@/lib/types/database';

type SiteHealthWithClient = SiteHealth & {
  client?: { id: string; business_name: string };
};

/* ---------- helpers ---------- */

function scoreColor(score: number | null): string {
  if (score === null) return 'bg-slate-200 text-slate-500';
  if (score >= 90) return 'bg-emerald-100 text-emerald-700';
  if (score >= 50) return 'bg-amber-100 text-amber-700';
  return 'bg-red-100 text-red-700';
}

function scoreBgBar(score: number | null): string {
  if (score === null) return 'bg-slate-300';
  if (score >= 90) return 'bg-emerald-500';
  if (score >= 50) return 'bg-amber-500';
  return 'bg-red-500';
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return 'Never';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

/* ---------- skeletons ---------- */

function SummaryCardSkeleton() {
  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-5 shadow-sm animate-pulse">
      <div className="h-3 w-24 rounded bg-muted/20 mb-3" />
      <div className="h-7 w-16 rounded bg-muted/20" />
    </div>
  );
}

function SiteCardSkeleton() {
  return (
    <div className="rounded-xl border border-card-border bg-card-bg p-5 shadow-sm animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="space-y-2 flex-1">
          <div className="h-4 w-3/4 rounded bg-muted/20" />
          <div className="h-3 w-1/2 rounded bg-muted/20" />
        </div>
      </div>
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-20 rounded bg-muted/20" />
            <div className="h-2 w-full rounded-full bg-muted/10" />
          </div>
        ))}
      </div>
      <div className="mt-4 pt-3 border-t border-card-border">
        <div className="h-3 w-32 rounded bg-muted/20" />
      </div>
    </div>
  );
}

/* ---------- score bar component ---------- */

function ScoreBar({ label, score }: { label: string; score: number | null }) {
  const display = score !== null ? score : '--';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs font-medium text-muted">{label}</span>
        <span
          className={`text-xs font-semibold px-1.5 py-0.5 rounded ${scoreColor(score)}`}
        >
          {display}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${scoreBgBar(score)}`}
          style={{ width: score !== null ? `${score}%` : '0%' }}
        />
      </div>
    </div>
  );
}

/* ---------- main page component ---------- */

export default function SiteHealthPage() {
  const [sites, setSites] = useState<SiteHealthWithClient[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  // Add site form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [newSiteClientId, setNewSiteClientId] = useState('');
  const [newSiteUrl, setNewSiteUrl] = useState('');
  const [addingSite, setAddingSite] = useState(false);

  // Track which sites are currently running a check
  const [runningChecks, setRunningChecks] = useState<Set<string>>(new Set());

  const loadData = useCallback(async () => {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    // Get profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    if (!profile) {
      setLoading(false);
      return;
    }

    // Resolve tenant
    let tenantData: Tenant | null = null;
    if ((profile as Profile).role === 'owner') {
      const { data: t } = await supabase
        .from('tenants')
        .select('*')
        .eq('owner_id', user.id)
        .single();
      tenantData = t as Tenant | null;
    } else if ((profile as Profile).tenant_id) {
      const { data: t } = await supabase
        .from('tenants')
        .select('*')
        .eq('id', (profile as Profile).tenant_id)
        .single();
      tenantData = t as Tenant | null;
    }
    setTenant(tenantData);
    if (!tenantData) {
      setLoading(false);
      return;
    }

    // Fetch site_health joined with clients
    const { data: sitesData } = await supabase
      .from('site_health')
      .select('*, client:clients(id, business_name)')
      .eq('tenant_id', tenantData.id)
      .order('created_at', { ascending: false });

    setSites((sitesData as SiteHealthWithClient[]) || []);

    // Fetch clients for dropdown
    const { data: clientsData } = await supabase
      .from('clients')
      .select('*')
      .eq('tenant_id', tenantData.id)
      .order('business_name', { ascending: true });

    setClients((clientsData as Client[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------- actions ---------- */

  async function handleAddSite(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant || !newSiteClientId || !newSiteUrl) return;

    setAddingSite(true);
    const supabase = createClient();
    const { error } = await supabase.from('site_health').insert({
      tenant_id: tenant.id,
      client_id: newSiteClientId,
      url: newSiteUrl,
      performance_score: null,
      seo_score: null,
      accessibility_score: null,
      best_practices_score: null,
      is_up: true,
      last_checked_at: null,
    });

    if (!error) {
      setNewSiteClientId('');
      setNewSiteUrl('');
      setShowAddForm(false);
      await loadData();
    }
    setAddingSite(false);
  }

  async function handleRunCheck(siteId: string, clientId: string, url: string) {
    setRunningChecks((prev) => new Set(prev).add(siteId));

    try {
      const res = await fetch('/api/site-health/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, url }),
      });

      if (res.ok) {
        // Refresh data to show updated scores
        await loadData();
      }
    } catch {
      // Silently handle -- the user will see scores didn't update
    } finally {
      setRunningChecks((prev) => {
        const next = new Set(prev);
        next.delete(siteId);
        return next;
      });
    }
  }

  /* ---------- derived stats ---------- */

  const totalSites = sites.length;
  const sitesWithPerf = sites.filter((s) => s.performance_score !== null);
  const avgPerformance =
    sitesWithPerf.length > 0
      ? Math.round(
          sitesWithPerf.reduce((sum, s) => sum + (s.performance_score ?? 0), 0) /
            sitesWithPerf.length
        )
      : 0;
  const needingAttention = sites.filter(
    (s) =>
      (s.performance_score !== null && s.performance_score < 50) ||
      (s.seo_score !== null && s.seo_score < 50) ||
      (s.accessibility_score !== null && s.accessibility_score < 50) ||
      (s.best_practices_score !== null && s.best_practices_score < 50)
  ).length;

  /* ---------- render ---------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <h1 className="text-xl sm:text-2xl font-bold text-foreground">
            Site Health
          </h1>
          <p className="text-sm text-muted mt-1 hidden sm:block">
            Monitor performance, SEO, accessibility, and best practices for client
            websites.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors shadow-sm shrink-0"
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
          <span className="hidden sm:inline">Add Site</span>
        </button>
      </div>

      {/* Add Site Form */}
      {showAddForm && (
        <div className="rounded-xl border border-card-border bg-card-bg p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-foreground mb-4">
            Add a site to monitor
          </h2>
          <form onSubmit={handleAddSite} className="flex flex-col sm:flex-row gap-3">
            <select
              value={newSiteClientId}
              onChange={(e) => setNewSiteClientId(e.target.value)}
              required
              className="flex-1 sm:max-w-xs px-3 py-2 text-sm rounded-lg border border-card-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-accent/40"
            >
              <option value="">Select client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.business_name}
                </option>
              ))}
            </select>
            <input
              type="url"
              placeholder="https://example.com"
              value={newSiteUrl}
              onChange={(e) => setNewSiteUrl(e.target.value)}
              required
              className="flex-1 px-3 py-2 text-sm rounded-lg border border-card-border bg-background text-foreground placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={addingSite}
                className="px-4 py-2 text-sm font-medium rounded-lg bg-accent text-white hover:bg-accent-hover transition-colors disabled:opacity-50"
              >
                {addingSite ? 'Adding...' : 'Add'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-card-border text-muted hover:text-foreground transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Summary Cards */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
          <SummaryCardSkeleton />
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="rounded-xl border border-card-border bg-card-bg p-5 shadow-sm">
            <p className="text-sm text-muted">Sites Monitored</p>
            <p className="text-2xl font-bold text-foreground mt-1">{totalSites}</p>
          </div>
          <div className="rounded-xl border border-card-border bg-card-bg p-5 shadow-sm">
            <p className="text-sm text-muted">Avg. Performance</p>
            <p className="text-2xl font-bold text-foreground mt-1">
              {sitesWithPerf.length > 0 ? (
                <span className={avgPerformance >= 90 ? 'text-emerald-600' : avgPerformance >= 50 ? 'text-amber-600' : 'text-red-600'}>
                  {avgPerformance}
                </span>
              ) : (
                <span className="text-muted">--</span>
              )}
            </p>
          </div>
          <div className="rounded-xl border border-card-border bg-card-bg p-5 shadow-sm">
            <p className="text-sm text-muted">Needs Attention</p>
            <p className={`text-2xl font-bold mt-1 ${needingAttention > 0 ? 'text-red-600' : 'text-emerald-600'}`}>
              {needingAttention}
            </p>
          </div>
        </div>
      )}

      {/* Site Health Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <SiteCardSkeleton key={i} />
          ))}
        </div>
      ) : sites.length === 0 ? (
        <div className="rounded-xl border border-card-border bg-card-bg p-12 shadow-sm text-center">
          <svg
            className="w-12 h-12 mx-auto text-muted/40 mb-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 10h.01M15 10h.01M9.5 15a3.5 3.5 0 005 0"
            />
          </svg>
          <p className="text-sm text-muted">
            No sites being monitored yet. Click &quot;Add Site&quot; to get started.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {sites.map((site) => {
            const isRunning = runningChecks.has(site.id);
            return (
              <div
                key={site.id}
                className="rounded-xl border border-card-border bg-card-bg p-5 shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between gap-2 mb-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-foreground truncate">
                      {site.client?.business_name ?? 'Unknown Client'}
                    </h3>
                    <a
                      href={site.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-accent hover:text-accent-hover truncate block mt-0.5"
                    >
                      {site.url}
                    </a>
                  </div>
                  <button
                    onClick={() =>
                      handleRunCheck(site.id, site.client_id, site.url)
                    }
                    disabled={isRunning}
                    className="shrink-0 inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border border-card-border text-muted hover:text-foreground hover:border-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isRunning ? (
                      <>
                        <svg
                          className="w-3.5 h-3.5 animate-spin"
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
                        Checking...
                      </>
                    ) : (
                      <>
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
                            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                          />
                        </svg>
                        Run Check
                      </>
                    )}
                  </button>
                </div>

                {/* Score Bars */}
                <div className="space-y-3">
                  <ScoreBar label="Performance" score={site.performance_score} />
                  <ScoreBar label="SEO" score={site.seo_score} />
                  <ScoreBar label="Accessibility" score={site.accessibility_score} />
                  <ScoreBar
                    label="Best Practices"
                    score={site.best_practices_score}
                  />
                </div>

                {/* Last Checked */}
                <div className="mt-4 pt-3 border-t border-card-border flex items-center gap-1.5">
                  <svg
                    className="w-3.5 h-3.5 text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-xs text-muted">
                    {formatDate(site.last_checked_at)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
