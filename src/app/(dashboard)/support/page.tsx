'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type {
  Profile,
  Tenant,
  SupportTicket,
  SupportMessage,
  TicketPriority,
  TicketStatus,
} from '@/lib/types/database';

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const PRIORITY_OPTIONS: { value: '' | TicketPriority; label: string }[] = [
  { value: '', label: 'All Priorities' },
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'urgent', label: 'Urgent' },
];

const STATUS_OPTIONS: { value: '' | TicketStatus; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'waiting', label: 'Waiting' },
  { value: 'resolved', label: 'Resolved' },
  { value: 'closed', label: 'Closed' },
];

const priorityStyles: Record<TicketPriority, string> = {
  low: 'bg-slate-100 text-slate-600 border-slate-200',
  medium: 'bg-blue-50 text-blue-700 border-blue-200',
  high: 'bg-amber-50 text-amber-700 border-amber-200',
  urgent: 'bg-red-50 text-red-700 border-red-200',
};

const statusStyles: Record<TicketStatus, string> = {
  open: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  waiting: 'bg-amber-50 text-amber-700 border-amber-200',
  resolved: 'bg-violet-50 text-violet-700 border-violet-200',
  closed: 'bg-slate-100 text-slate-500 border-slate-200',
};

const statusLabels: Record<TicketStatus, string> = {
  open: 'Open',
  in_progress: 'In Progress',
  waiting: 'Waiting',
  resolved: 'Resolved',
  closed: 'Closed',
};

/* ------------------------------------------------------------------ */
/*  Skeleton                                                           */
/* ------------------------------------------------------------------ */

function TicketRowSkeleton() {
  return (
    <div
      className="flex items-center gap-4 px-4 py-3 animate-pulse border-b"
      style={{ borderColor: 'var(--border)' }}
    >
      <div className="flex-1 min-w-0 space-y-2">
        <div className="h-4 rounded bg-[var(--muted)]/20 w-2/3" />
        <div className="h-3 rounded bg-[var(--muted)]/20 w-1/3" />
      </div>
      <div className="h-5 w-16 rounded-full bg-[var(--muted)]/20 shrink-0" />
      <div className="h-5 w-20 rounded-full bg-[var(--muted)]/20 shrink-0" />
      <div className="h-3 w-20 rounded bg-[var(--muted)]/20 shrink-0 hidden sm:block" />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Types for joined rows                                              */
/* ------------------------------------------------------------------ */

interface TicketRow extends SupportTicket {
  clients: { id: string; business_name: string } | null;
}

interface MessageRow extends SupportMessage {
  profiles: { id: string; full_name: string } | null;
}

interface ClientOption {
  id: string;
  business_name: string;
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

export default function SupportPage() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [clients, setClients] = useState<ClientOption[]>([]);

  // Filters
  const [statusFilter, setStatusFilter] = useState<'' | TicketStatus>('');
  const [priorityFilter, setPriorityFilter] = useState<'' | TicketPriority>('');

  // Detail panel
  const [selectedTicket, setSelectedTicket] = useState<TicketRow | null>(null);
  const [messages, setMessages] = useState<MessageRow[]>([]);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);

  // New ticket form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newClientId, setNewClientId] = useState('');
  const [newPriority, setNewPriority] = useState<TicketPriority>('medium');
  const [creating, setCreating] = useState(false);

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

    // Fetch clients for the dropdown and name resolution
    if (p.role === 'freelancer') {
      const { data: assignments } = await supabase
        .from('client_freelancers')
        .select('client_id')
        .eq('freelancer_id', user.id);

      const clientIds = (assignments || []).map(
        (a: { client_id: string }) => a.client_id,
      );

      if (clientIds.length > 0) {
        const { data: c } = await supabase
          .from('clients')
          .select('id, business_name')
          .eq('tenant_id', tenantData.id)
          .in('id', clientIds)
          .order('business_name');
        setClients((c as ClientOption[]) || []);

        // Tickets for assigned clients only
        const { data: ticketData } = await supabase
          .from('support_tickets')
          .select('*, clients(id, business_name)')
          .eq('tenant_id', tenantData.id)
          .in('client_id', clientIds)
          .order('created_at', { ascending: false });
        setTickets((ticketData as TicketRow[]) || []);
      }
    } else {
      const { data: c } = await supabase
        .from('clients')
        .select('id, business_name')
        .eq('tenant_id', tenantData.id)
        .order('business_name');
      setClients((c as ClientOption[]) || []);

      const { data: ticketData } = await supabase
        .from('support_tickets')
        .select('*, clients(id, business_name)')
        .eq('tenant_id', tenantData.id)
        .order('created_at', { ascending: false });
      setTickets((ticketData as TicketRow[]) || []);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  /* ---------- Load messages for a ticket ---------- */

  const loadMessages = useCallback(async (ticketId: string) => {
    setMessagesLoading(true);
    const supabase = createClient();
    const { data } = await supabase
      .from('support_messages')
      .select('*, profiles:sender_id(id, full_name)')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });
    setMessages((data as MessageRow[]) || []);
    setMessagesLoading(false);
  }, []);

  /* ---------- Open ticket detail ---------- */

  const openTicket = useCallback(
    (ticket: TicketRow) => {
      setSelectedTicket(ticket);
      setReplyText('');
      loadMessages(ticket.id);
    },
    [loadMessages],
  );

  /* ---------- Send reply ---------- */

  const sendReply = useCallback(async () => {
    if (!replyText.trim() || !selectedTicket || !profile) return;
    setReplySending(true);
    const supabase = createClient();
    await supabase.from('support_messages').insert({
      ticket_id: selectedTicket.id,
      sender_id: profile.id,
      message: replyText.trim(),
      is_internal: false,
    });
    setReplyText('');
    setReplySending(false);
    loadMessages(selectedTicket.id);
  }, [replyText, selectedTicket, profile, loadMessages]);

  /* ---------- Create ticket ---------- */

  const createTicket = useCallback(async () => {
    if (!newSubject.trim() || !newClientId || !tenant || !profile) return;
    setCreating(true);
    const supabase = createClient();
    const { data: created } = await supabase
      .from('support_tickets')
      .insert({
        tenant_id: tenant.id,
        client_id: newClientId,
        created_by: profile.id,
        subject: newSubject.trim(),
        description: newDescription.trim(),
        priority: newPriority,
        status: 'open' as TicketStatus,
      })
      .select('*, clients(id, business_name)')
      .single();

    if (created) {
      setTickets((prev) => [created as TicketRow, ...prev]);
    }

    setNewSubject('');
    setNewDescription('');
    setNewClientId('');
    setNewPriority('medium');
    setShowNewForm(false);
    setCreating(false);
  }, [newSubject, newDescription, newClientId, newPriority, tenant, profile]);

  /* ---------- Filtered list ---------- */

  const filteredTickets = tickets.filter((t) => {
    if (statusFilter && t.status !== statusFilter) return false;
    if (priorityFilter && t.priority !== priorityFilter) return false;
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
            Support Tickets
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {loading
              ? '...'
              : `${filteredTickets.length} ticket${filteredTickets.length !== 1 ? 's' : ''}`}
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
          <span className="hidden sm:inline">New Ticket</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as '' | TicketStatus)}
          className="px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
          style={{
            border: '1px solid var(--border)',
            backgroundColor: 'var(--card)',
            color: 'var(--foreground)',
          }}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
        <select
          value={priorityFilter}
          onChange={(e) =>
            setPriorityFilter(e.target.value as '' | TicketPriority)
          }
          className="px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
          style={{
            border: '1px solid var(--border)',
            backgroundColor: 'var(--card)',
            color: 'var(--foreground)',
          }}
        >
          {PRIORITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* New Ticket Form */}
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
            New Support Ticket
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label
                className="block text-xs font-medium mb-1"
                style={{ color: 'var(--muted)' }}
              >
                Subject
              </label>
              <input
                type="text"
                value={newSubject}
                onChange={(e) => setNewSubject(e.target.value)}
                placeholder="Brief description of the issue"
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
                Priority
              </label>
              <select
                value={newPriority}
                onChange={(e) =>
                  setNewPriority(e.target.value as TicketPriority)
                }
                className="w-full px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
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
                placeholder="Describe the issue in detail..."
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
              onClick={createTicket}
              disabled={creating || !newSubject.trim() || !newClientId}
              className="px-4 py-2 text-sm text-white font-medium rounded-lg transition-colors disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--accent-hover)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--accent)')
              }
            >
              {creating ? 'Creating...' : 'Create Ticket'}
            </button>
          </div>
        </div>
      )}

      {/* Content area: ticket list + detail panel */}
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Ticket List */}
        <div
          className={`rounded-xl border overflow-hidden ${selectedTicket ? 'lg:w-1/2' : 'w-full'}`}
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          {/* Table header */}
          <div
            className="hidden sm:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-4 py-2.5 text-xs font-semibold uppercase tracking-wider"
            style={{
              color: 'var(--muted)',
              borderBottom: '1px solid var(--border)',
            }}
          >
            <span>Subject</span>
            <span className="w-20 text-center">Priority</span>
            <span className="w-24 text-center">Status</span>
            <span className="w-24 text-right">Created</span>
          </div>

          {/* Loading */}
          {loading && (
            <div>
              {Array.from({ length: 6 }).map((_, i) => (
                <TicketRowSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Rows */}
          {!loading &&
            filteredTickets.map((ticket) => {
              const isSelected = selectedTicket?.id === ticket.id;
              return (
                <button
                  key={ticket.id}
                  onClick={() => openTicket(ticket)}
                  className="w-full text-left grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 sm:gap-4 px-4 py-3 transition-colors"
                  style={{
                    borderBottom: '1px solid var(--border)',
                    backgroundColor: isSelected
                      ? 'var(--accent)'
                      : 'transparent',
                    color: isSelected ? 'white' : undefined,
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.backgroundColor =
                        'var(--background)';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected)
                      e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <div className="min-w-0">
                    <p
                      className="text-sm font-medium truncate"
                      style={{
                        color: isSelected ? 'white' : 'var(--foreground)',
                      }}
                    >
                      {ticket.subject}
                    </p>
                    <p
                      className="text-xs truncate mt-0.5"
                      style={{
                        color: isSelected
                          ? 'rgba(255,255,255,0.75)'
                          : 'var(--muted)',
                      }}
                    >
                      {ticket.clients?.business_name || 'Unknown client'}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize w-20 shrink-0 ${
                      isSelected ? '' : priorityStyles[ticket.priority]
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.3)',
                          }
                        : undefined
                    }
                  >
                    {ticket.priority}
                  </span>
                  <span
                    className={`inline-flex items-center justify-center px-2 py-0.5 rounded-full text-[10px] font-medium border w-24 shrink-0 ${
                      isSelected ? '' : statusStyles[ticket.status]
                    }`}
                    style={
                      isSelected
                        ? {
                            backgroundColor: 'rgba(255,255,255,0.2)',
                            color: 'white',
                            borderColor: 'rgba(255,255,255,0.3)',
                          }
                        : undefined
                    }
                  >
                    {statusLabels[ticket.status]}
                  </span>
                  <span
                    className="text-xs w-24 text-right hidden sm:block shrink-0 self-center"
                    style={{
                      color: isSelected
                        ? 'rgba(255,255,255,0.75)'
                        : 'var(--muted)',
                    }}
                  >
                    {new Date(ticket.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </span>
                </button>
              );
            })}

          {/* Empty state */}
          {!loading && filteredTickets.length === 0 && (
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
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                />
              </svg>
              <p className="text-sm" style={{ color: 'var(--muted)' }}>
                {tickets.length === 0
                  ? 'No support tickets yet.'
                  : 'No tickets match your filters.'}
              </p>
            </div>
          )}
        </div>

        {/* Detail Panel (slide-over on mobile, side panel on desktop) */}
        {selectedTicket && (
          <div
            className="lg:w-1/2 rounded-xl border flex flex-col max-h-[70vh] lg:max-h-[calc(100vh-16rem)]"
            style={{
              backgroundColor: 'var(--card)',
              borderColor: 'var(--border)',
            }}
          >
            {/* Detail header */}
            <div
              className="px-5 py-4 flex items-start justify-between gap-3 shrink-0"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="min-w-0">
                <h2
                  className="text-base font-semibold truncate"
                  style={{ color: 'var(--foreground)' }}
                >
                  {selectedTicket.subject}
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--muted)' }}>
                  {selectedTicket.clients?.business_name || 'Unknown client'}{' '}
                  &middot;{' '}
                  {new Date(selectedTicket.created_at).toLocaleDateString(
                    'en-US',
                    { month: 'long', day: 'numeric', year: 'numeric' },
                  )}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize ${priorityStyles[selectedTicket.priority]}`}
                  >
                    {selectedTicket.priority}
                  </span>
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${statusStyles[selectedTicket.status]}`}
                  >
                    {statusLabels[selectedTicket.status]}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
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

            {/* Ticket description */}
            {selectedTicket.description && (
              <div
                className="px-5 py-3 text-sm shrink-0"
                style={{
                  color: 'var(--foreground)',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                {selectedTicket.description}
              </div>
            )}

            {/* Messages thread */}
            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              {messagesLoading && (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="animate-pulse space-y-2">
                      <div className="h-3 rounded bg-[var(--muted)]/20 w-24" />
                      <div className="h-4 rounded bg-[var(--muted)]/20 w-full" />
                      <div className="h-4 rounded bg-[var(--muted)]/20 w-2/3" />
                    </div>
                  ))}
                </div>
              )}
              {!messagesLoading && messages.length === 0 && (
                <p className="text-sm text-center" style={{ color: 'var(--muted)' }}>
                  No messages yet. Start the conversation below.
                </p>
              )}
              {!messagesLoading &&
                messages.map((msg) => {
                  const isOwn = msg.sender_id === profile?.id;
                  return (
                    <div
                      key={msg.id}
                      className={`max-w-[85%] ${isOwn ? 'ml-auto' : ''}`}
                    >
                      <div
                        className="rounded-xl px-4 py-2.5 text-sm"
                        style={{
                          backgroundColor: isOwn
                            ? 'var(--accent)'
                            : 'var(--background)',
                          color: isOwn ? 'white' : 'var(--foreground)',
                        }}
                      >
                        {msg.message}
                      </div>
                      <div
                        className={`flex items-center gap-1.5 mt-1 text-[10px] ${isOwn ? 'justify-end' : ''}`}
                        style={{ color: 'var(--muted)' }}
                      >
                        <span>{msg.profiles?.full_name || 'Unknown'}</span>
                        <span>&middot;</span>
                        <span>
                          {new Date(msg.created_at).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                        {msg.is_internal && (
                          <>
                            <span>&middot;</span>
                            <span className="italic">Internal</span>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>

            {/* Reply input */}
            <div
              className="px-5 py-3 shrink-0"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div className="flex items-end gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type your reply..."
                  rows={2}
                  className="flex-1 px-3 py-2 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none"
                  style={{
                    border: '1px solid var(--border)',
                    backgroundColor: 'var(--background)',
                    color: 'var(--foreground)',
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      sendReply();
                    }
                  }}
                />
                <button
                  onClick={sendReply}
                  disabled={replySending || !replyText.trim()}
                  className="px-4 py-2 text-sm text-white font-medium rounded-lg transition-colors disabled:opacity-50 shrink-0"
                  style={{ backgroundColor: 'var(--accent)' }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.backgroundColor =
                      'var(--accent-hover)')
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.backgroundColor = 'var(--accent)')
                  }
                >
                  {replySending ? 'Sending...' : 'Send'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
