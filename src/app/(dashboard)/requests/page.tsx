'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  Profile,
  Tenant,
  ClientRequestRecord,
  ClientRequestStatus,
} from '@/lib/types/database';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const COLUMNS: {
  status: ClientRequestStatus;
  label: string;
  color: string;
}[] = [
  { status: 'pending', label: 'Pending', color: 'bg-amber-500' },
  { status: 'in_progress', label: 'In Progress', color: 'bg-blue-500' },
  { status: 'completed', label: 'Completed', color: 'bg-emerald-500' },
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

function CardSkeleton() {
  return (
    <div
      className="rounded-lg border p-3 animate-pulse space-y-2"
      style={{
        backgroundColor: 'var(--card)',
        borderColor: 'var(--border)',
      }}
    >
      <div className="h-4 rounded bg-[var(--muted)]/20 w-3/4" />
      <div className="h-3 rounded bg-[var(--muted)]/20 w-1/2" />
      <div className="h-3 rounded bg-[var(--muted)]/20 w-full" />
      <div className="h-3 rounded bg-[var(--muted)]/20 w-2/3" />
    </div>
  );
}

function BoardSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => (
        <div key={col.status} className="space-y-3">
          <div className="flex items-center gap-2 px-1">
            <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
            <div className="h-4 rounded bg-[var(--muted)]/20 w-20" />
          </div>
          {Array.from({ length: 2 }).map((_, i) => (
            <CardSkeleton key={i} />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface RequestRow extends ClientRequestRecord {
  clients: { id: string; business_name: string } | null;
}

interface ClientOption {
  id: string;
  business_name: string;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function RequestsPage() {
  const [requests, setRequests] = useState<RequestRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);

  // Filters
  const [clientFilter, setClientFilter] = useState('');

  // Detail modal
  const [selectedRequest, setSelectedRequest] = useState<RequestRow | null>(
    null,
  );

  // New request form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newAttachmentUrl, setNewAttachmentUrl] = useState('');
  const [creating, setCreating] = useState(false);

  // Drag state
  const [dragOverCol, setDragOverCol] = useState<ClientRequestStatus | null>(
    null,
  );
  const [draggedId, setDraggedId] = useState<string | null>(null);

  /* ---------- Load initial data ---------- */

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
    const { data: c } = await supabase
      .from('clients')
      .select('id, business_name')
      .eq('tenant_id', tenantData.id)
      .order('business_name');
    setClients((c as ClientOption[]) || []);

    // Fetch requests
    const { data: reqData } = await supabase
      .from('client_requests')
      .select('*, clients(id, business_name)')
      .eq('tenant_id', tenantData.id)
      .order('created_at', { ascending: false });
    setRequests((reqData as RequestRow[]) || []);

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------- Update status ---------- */

  const updateStatus = useCallback(
    async (requestId: string, newStatus: ClientRequestStatus) => {
      const supabase = createClient();
      await supabase
        .from('client_requests')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', requestId);

      setRequests((prev) =>
        prev.map((r) =>
          r.id === requestId ? { ...r, status: newStatus } : r,
        ),
      );

      if (selectedRequest?.id === requestId) {
        setSelectedRequest((prev) =>
          prev ? { ...prev, status: newStatus } : null,
        );
      }
    },
    [selectedRequest],
  );

  /* ---------- Create request ---------- */

  const createRequest = useCallback(async () => {
    if (!newTitle.trim() || !newClientId || !tenant || !profile) return;
    setCreating(true);
    const supabase = createClient();
    const { data: created } = await supabase
      .from('client_requests')
      .insert({
        tenant_id: tenant.id,
        client_id: newClientId,
        title: newTitle.trim(),
        description: newDescription.trim() || null,
        status: 'pending' as ClientRequestStatus,
        attachment_url: newAttachmentUrl.trim() || null,
      })
      .select('*, clients(id, business_name)')
      .single();

    if (created) {
      setRequests((prev) => [created as RequestRow, ...prev]);
    }

    setNewTitle('');
    setNewDescription('');
    setNewClientId('');
    setNewAttachmentUrl('');
    setShowNewForm(false);
    setCreating(false);
  }, [newTitle, newDescription, newClientId, newAttachmentUrl, tenant, profile]);

  /* ---------- Drag and drop ---------- */

  const handleDragStart = useCallback((requestId: string) => {
    setDraggedId(requestId);
  }, []);

  const handleDragOver = useCallback(
    (e: React.DragEvent, colStatus: ClientRequestStatus) => {
      e.preventDefault();
      setDragOverCol(colStatus);
    },
    [],
  );

  const handleDragLeave = useCallback(() => {
    setDragOverCol(null);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent, colStatus: ClientRequestStatus) => {
      e.preventDefault();
      setDragOverCol(null);
      if (draggedId) {
        updateStatus(draggedId, colStatus);
        setDraggedId(null);
      }
    },
    [draggedId, updateStatus],
  );

  /* ---------- Filtered list ---------- */

  const filteredRequests = requests.filter((r) => {
    if (clientFilter && r.client_id !== clientFilter) return false;
    return true;
  });

  /* ---------- Render ---------- */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{ color: 'var(--foreground)' }}
          >
            Client Requests
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {loading
              ? '...'
              : `${filteredRequests.length} request${filteredRequests.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <button
          onClick={() => setShowNewForm(true)}
          className="inline-flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shrink-0"
          style={{ backgroundColor: 'var(--accent)' }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = 'var(--accent)')
          }
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
          <span className="hidden sm:inline">New Request</span>
        </button>
      </div>

      {/* Filter by client */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          className="px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
          style={{
            border: '1px solid var(--border)',
            backgroundColor: 'var(--card)',
            color: 'var(--foreground)',
          }}
        >
          <option value="">All Clients</option>
          {clients.map((c) => (
            <option key={c.id} value={c.id}>
              {c.business_name}
            </option>
          ))}
        </select>
      </div>

      {/* New Request Form */}
      {showNewForm && (
        <div
          className="rounded-xl border p-5 space-y-4"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <h2
            className="text-base font-semibold"
            style={{ color: 'var(--foreground)' }}
          >
            New Client Request
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--muted)' }}
              >
                Title
              </label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="Request title"
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--muted)' }}
              >
                Client
              </label>
              <select
                value={newClientId}
                onChange={(e) => setNewClientId(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              >
                <option value="">Select client...</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.business_name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--muted)' }}
              >
                Attachment URL (optional)
              </label>
              <input
                type="url"
                value={newAttachmentUrl}
                onChange={(e) => setNewAttachmentUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div className="sm:col-span-2">
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--muted)' }}
              >
                Description
              </label>
              <textarea
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                rows={3}
                placeholder="Describe the request..."
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={() => setShowNewForm(false)}
              className="px-4 py-2 text-sm rounded-lg transition-colors"
              style={{ color: 'var(--muted)' }}
            >
              Cancel
            </button>
            <button
              onClick={createRequest}
              disabled={creating || !newTitle.trim() || !newClientId}
              className="px-4 py-2 text-sm text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--accent)')
              }
            >
              {creating ? 'Creating...' : 'Create Request'}
            </button>
          </div>
        </div>
      )}

      {/* Loading */}
      {loading && <BoardSkeleton />}

      {/* Kanban Board */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {COLUMNS.map((col) => {
            const colRequests = filteredRequests.filter(
              (r) => r.status === col.status,
            );
            const isDragOver = dragOverCol === col.status;

            return (
              <div
                key={col.status}
                className={`rounded-xl p-3 transition-colors min-h-[200px] ${
                  isDragOver ? 'ring-2' : ''
                }`}
                style={{
                  backgroundColor: isDragOver
                    ? 'var(--accent)'
                    : 'var(--background)',
                  ...(isDragOver
                    ? {
                        ringColor: 'var(--accent)',
                        opacity: 0.15,
                      }
                    : {}),
                  border: '1px solid var(--border)',
                }}
                onDragOver={(e) => handleDragOver(e, col.status)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, col.status)}
              >
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3 px-1">
                  <div
                    className={`w-2.5 h-2.5 rounded-full ${col.color}`}
                  />
                  <span
                    className="text-sm font-semibold"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {col.label}
                  </span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full"
                    style={{
                      backgroundColor: 'var(--card)',
                      color: 'var(--muted)',
                      border: '1px solid var(--border)',
                    }}
                  >
                    {colRequests.length}
                  </span>
                </div>

                {/* Cards */}
                <div className="space-y-2">
                  {colRequests.map((req) => (
                    <div
                      key={req.id}
                      draggable
                      onDragStart={() => handleDragStart(req.id)}
                      onClick={() => setSelectedRequest(req)}
                      className="rounded-lg border p-3 cursor-grab hover:shadow-md transition-all active:cursor-grabbing"
                      style={{
                        backgroundColor: 'var(--card)',
                        borderColor: 'var(--border)',
                      }}
                    >
                      <p
                        className="text-sm font-medium mb-1 line-clamp-2"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {req.title}
                      </p>
                      <p
                        className="text-xs mb-2"
                        style={{ color: 'var(--accent)' }}
                      >
                        {req.clients?.business_name || 'Unknown client'}
                      </p>
                      {req.description && (
                        <p
                          className="text-xs line-clamp-2 mb-2"
                          style={{ color: 'var(--muted)' }}
                        >
                          {req.description}
                        </p>
                      )}
                      <div
                        className="flex items-center justify-between text-[10px] pt-2"
                        style={{
                          borderTop: '1px solid var(--border)',
                          color: 'var(--muted)',
                        }}
                      >
                        <span>
                          {new Date(req.created_at).toLocaleDateString(
                            'en-US',
                            { month: 'short', day: 'numeric' },
                          )}
                        </span>
                        {req.attachment_url && (
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
                              d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                            />
                          </svg>
                        )}
                      </div>
                    </div>
                  ))}
                  {colRequests.length === 0 && (
                    <div
                      className="text-center py-8 text-xs"
                      style={{ color: 'var(--muted)' }}
                    >
                      No requests
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail Modal Overlay */}
      {selectedRequest && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40 bg-black/30"
            onClick={() => setSelectedRequest(null)}
          />

          {/* Panel */}
          <div
            className="fixed inset-y-0 right-0 z-50 w-full max-w-lg shadow-xl flex flex-col"
            style={{ backgroundColor: 'var(--card)' }}
          >
            {/* Header */}
            <div
              className="px-6 py-4 flex items-start justify-between gap-3 shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="min-w-0">
                <h2
                  className="text-lg font-semibold"
                  style={{ color: 'var(--foreground)' }}
                >
                  {selectedRequest.title}
                </h2>
                <p
                  className="text-xs mt-1"
                  style={{ color: 'var(--muted)' }}
                >
                  {selectedRequest.clients?.business_name || 'Unknown client'}{' '}
                  &middot;{' '}
                  {new Date(selectedRequest.created_at).toLocaleDateString(
                    'en-US',
                    { month: 'long', day: 'numeric', year: 'numeric' },
                  )}
                </p>
              </div>
              <button
                onClick={() => setSelectedRequest(null)}
                className="p-1 rounded-lg transition-colors shrink-0"
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

            {/* Body */}
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              {/* Status */}
              <div>
                <label
                  className="block text-xs font-medium mb-2"
                  style={{ color: 'var(--muted)' }}
                >
                  Status
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS.map((col) => {
                    const isActive =
                      selectedRequest.status === col.status;
                    return (
                      <button
                        key={col.status}
                        onClick={() =>
                          updateStatus(selectedRequest.id, col.status)
                        }
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                          isActive ? 'ring-2' : ''
                        }`}
                        style={{
                          borderColor: 'var(--border)',
                          backgroundColor: isActive
                            ? 'var(--accent)'
                            : 'var(--background)',
                          color: isActive ? 'white' : 'var(--foreground)',
                          ...(isActive
                            ? { ringColor: 'var(--accent)' }
                            : {}),
                        }}
                      >
                        <div
                          className={`w-2 h-2 rounded-full ${col.color}`}
                        />
                        {col.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label
                  className="block text-xs font-medium mb-2"
                  style={{ color: 'var(--muted)' }}
                >
                  Description
                </label>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: 'var(--foreground)' }}
                >
                  {selectedRequest.description || 'No description provided.'}
                </p>
              </div>

              {/* Attachment */}
              {selectedRequest.attachment_url && (
                <div>
                  <label
                    className="block text-xs font-medium mb-2"
                    style={{ color: 'var(--muted)' }}
                  >
                    Attachment
                  </label>
                  <a
                    href={selectedRequest.attachment_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm font-medium transition-colors"
                    style={{ color: 'var(--accent)' }}
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
                        d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"
                      />
                    </svg>
                    View attachment
                  </a>
                </div>
              )}

              {/* Move buttons (alternative to drag) */}
              <div>
                <label
                  className="block text-xs font-medium mb-2"
                  style={{ color: 'var(--muted)' }}
                >
                  Quick move
                </label>
                <div className="flex flex-wrap gap-2">
                  {COLUMNS.filter(
                    (col) => col.status !== selectedRequest.status,
                  ).map((col) => (
                    <button
                      key={col.status}
                      onClick={() =>
                        updateStatus(selectedRequest.id, col.status)
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors"
                      style={{
                        borderColor: 'var(--border)',
                        backgroundColor: 'var(--background)',
                        color: 'var(--foreground)',
                      }}
                      onMouseEnter={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          'var(--accent)')
                      }
                      onMouseLeave={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          'var(--background)')
                      }
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
                          d="M13 7l5 5m0 0l-5 5m5-5H6"
                        />
                      </svg>
                      Move to {col.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Empty state for entire board */}
      {!loading && requests.length === 0 && (
        <div className="text-center py-12">
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
              strokeWidth={1}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
            />
          </svg>
          <p className="text-sm" style={{ color: 'var(--muted)' }}>
            No client requests yet. Create one to get started.
          </p>
        </div>
      )}
    </div>
  );
}
