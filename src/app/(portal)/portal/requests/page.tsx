'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { ClientRequestStatus } from '@/lib/types/database';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RequestRow {
  id: string;
  title: string;
  description: string | null;
  status: ClientRequestStatus;
  created_at: string;
}

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const STATUS_OPTIONS: { value: ClientRequestStatus | ''; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const statusStyles: Record<ClientRequestStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const statusLabels: Record<ClientRequestStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function RequestSkeleton() {
  return (
    <div
      className="rounded-xl border p-4 animate-pulse space-y-2"
      style={{
        backgroundColor: 'var(--card-bg)',
        borderColor: 'var(--card-border)',
      }}
    >
      <div className="h-4 rounded w-3/4" style={{ backgroundColor: 'var(--muted)', opacity: 0.2 }} />
      <div className="h-3 rounded w-full" style={{ backgroundColor: 'var(--muted)', opacity: 0.2 }} />
      <div className="h-3 rounded w-1/3" style={{ backgroundColor: 'var(--muted)', opacity: 0.2 }} />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function PortalRequestsPage() {
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [clientId, setClientId] = useState<string | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);

  // Filter
  const [statusFilter, setStatusFilter] = useState<ClientRequestStatus | ''>('');

  // New request form
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

    // Find client record
    const { data: clientData } = await supabase
      .from('clients')
      .select('id, tenant_id')
      .eq('portal_user_id', user.id)
      .single();

    if (!clientData) {
      setLoading(false);
      return;
    }

    setClientId(clientData.id);
    setTenantId(clientData.tenant_id);

    // Fetch requests
    const { data: reqData } = await supabase
      .from('client_requests')
      .select('id, title, description, status, created_at')
      .eq('tenant_id', clientData.tenant_id)
      .eq('client_id', clientData.id)
      .order('created_at', { ascending: false });

    setRequests((reqData as RequestRow[]) || []);
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------- Submit ---------- */

  const handleSubmit = useCallback(async () => {
    if (!newTitle.trim() || !clientId || !tenantId) return;
    setSubmitting(true);

    const supabase = createClient();
    const { data: created } = await supabase
      .from('client_requests')
      .insert({
        tenant_id: tenantId,
        client_id: clientId,
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
  }, [newTitle, newDescription, clientId, tenantId]);

  /* ---------- Filtered ---------- */

  const filteredRequests = requests.filter((r) => {
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  /* ---------- Render ---------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1
          className="text-xl sm:text-2xl font-bold"
          style={{ color: 'var(--foreground)' }}
        >
          My Requests
        </h1>
        <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
          Submit new requests and track their progress.
        </p>
      </div>

      {/* New Request Form */}
      <div
        className="rounded-xl border p-5 space-y-4"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
        }}
      >
        <h2
          className="text-sm font-semibold"
          style={{ color: 'var(--foreground)' }}
        >
          New Request
        </h2>

        {submitSuccess && (
          <div className="px-4 py-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm font-medium border border-emerald-200">
            Request submitted successfully!
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
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
              placeholder="Provide additional details about your request..."
              className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none"
              style={{
                border: '1px solid var(--card-border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
              }}
            />
          </div>
        </div>
        <div className="flex justify-end">
          <button
            onClick={handleSubmit}
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

      {/* Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ClientRequestStatus | '')}
          className="px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
          style={{
            border: '1px solid var(--card-border)',
            backgroundColor: 'var(--card-bg)',
            color: 'var(--foreground)',
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <span className="text-xs" style={{ color: 'var(--muted)' }}>
          {loading ? '...' : `${filteredRequests.length} request${filteredRequests.length !== 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Request List */}
      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <RequestSkeleton key={i} />
          ))}
        </div>
      ) : filteredRequests.length === 0 ? (
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
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            {statusFilter
              ? `No ${statusLabels[statusFilter].toLowerCase()} requests found.`
              : 'No requests yet. Submit one using the form above.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredRequests.map((req) => (
            <div
              key={req.id}
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
                    {req.title}
                  </h3>
                  {req.description && (
                    <p
                      className="text-xs mt-1.5 line-clamp-3"
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
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </p>
                </div>
                <span
                  className={`text-xs px-2.5 py-1 rounded-full border font-medium shrink-0 ${statusStyles[req.status]}`}
                >
                  {statusLabels[req.status]}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
