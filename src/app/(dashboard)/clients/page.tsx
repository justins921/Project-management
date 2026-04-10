'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { Client, Profile, Tenant } from '@/lib/types/database';
import Avatar from '@/components/Avatar';

type ClientStatus = 'active' | 'onboarding' | 'paused' | 'churned';

const STATUS_OPTIONS: { value: '' | ClientStatus; label: string }[] = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'onboarding', label: 'Onboarding' },
  { value: 'paused', label: 'Paused' },
  { value: 'churned', label: 'Churned' },
];

const statusStyles: Record<string, string> = {
  active: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  onboarding: 'bg-blue-50 text-blue-700 border-blue-200',
  paused: 'bg-amber-50 text-amber-700 border-amber-200',
  churned: 'bg-slate-100 text-slate-500 border-slate-200',
};

const serviceStyles: Record<string, string> = {
  'Web Design': 'bg-violet-50 text-violet-700 ring-violet-600/20',
  SEO: 'bg-cyan-50 text-cyan-700 ring-cyan-600/20',
  'Social Media': 'bg-pink-50 text-pink-700 ring-pink-600/20',
  Branding: 'bg-orange-50 text-orange-700 ring-orange-600/20',
  'Content Marketing': 'bg-teal-50 text-teal-700 ring-teal-600/20',
  PPC: 'bg-red-50 text-red-700 ring-red-600/20',
};

function ClientCardSkeleton() {
  return (
    <div
      className="rounded-xl border border-[var(--border)] p-5 shadow-sm animate-pulse"
      style={{ backgroundColor: 'var(--card)' }}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 rounded-full bg-[var(--muted)]/20 shrink-0" />
        <div className="flex-1 min-w-0 space-y-2">
          <div className="h-4 rounded bg-[var(--muted)]/20 w-3/4" />
          <div className="h-3 rounded bg-[var(--muted)]/20 w-1/2" />
          <div className="h-3 rounded bg-[var(--muted)]/20 w-2/3" />
        </div>
      </div>
      <div className="flex gap-1.5 mb-4">
        <div className="h-5 w-16 rounded-full bg-[var(--muted)]/20" />
        <div className="h-5 w-14 rounded-full bg-[var(--muted)]/20" />
      </div>
      <div className="pt-3 border-t border-[var(--border)] flex justify-between">
        <div className="h-3 rounded bg-[var(--muted)]/20 w-20" />
        <div className="h-3 rounded bg-[var(--muted)]/20 w-16" />
      </div>
    </div>
  );
}

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'' | ClientStatus>('');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Get profile
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

      // Get tenant
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

      // Fetch clients - freelancers only see assigned clients
      if (p.role === 'freelancer') {
        const { data: assignments } = await supabase
          .from('client_freelancers')
          .select('client_id')
          .eq('freelancer_id', user.id);

        const clientIds = (assignments || []).map(
          (a: { client_id: string }) => a.client_id
        );
        if (clientIds.length > 0) {
          const { data: clientsData } = await supabase
            .from('clients')
            .select('*')
            .eq('tenant_id', tenantData.id)
            .in('id', clientIds)
            .order('created_at', { ascending: false });
          setClients((clientsData as Client[]) || []);
        }
      } else {
        const { data: clientsData } = await supabase
          .from('clients')
          .select('*')
          .eq('tenant_id', tenantData.id)
          .order('created_at', { ascending: false });
        setClients((clientsData as Client[]) || []);
      }

      setLoading(false);
    }
    load();
  }, []);

  const filteredClients = clients.filter((c) => {
    if (statusFilter && c.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.business_name.toLowerCase().includes(query) ||
      c.contact_name.toLowerCase().includes(query) ||
      c.contact_email.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <h1
            className="text-xl sm:text-2xl font-bold"
            style={{ color: 'var(--foreground)' }}
          >
            Clients
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            {loading
              ? '...'
              : `${filteredClients.length} client${filteredClients.length !== 1 ? 's' : ''}`}
          </p>
        </div>
        <Link
          href="/clients/new"
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
          <span className="hidden sm:inline">Add Client</span>
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4"
            style={{ color: 'var(--muted)' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search clients..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
            style={{
              border: '1px solid var(--border)',
              backgroundColor: 'var(--card)',
              color: 'var(--foreground)',
            }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) =>
            setStatusFilter(e.target.value as '' | ClientStatus)
          }
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
      </div>

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <ClientCardSkeleton key={i} />
          ))}
        </div>
      )}

      {/* Clients Grid */}
      {!loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClients.map((client) => {
            const services: string[] = Array.isArray(client.services)
              ? client.services
              : [];
            return (
              <Link
                key={client.id}
                href={`/clients/${client.id}`}
                className="rounded-xl border p-5 shadow-sm hover:shadow-md transition-all group"
                style={{
                  backgroundColor: 'var(--card)',
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-start gap-4 mb-3">
                  <Avatar name={client.business_name} size="lg" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3
                        className="text-base font-semibold truncate transition-colors"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {client.business_name}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border capitalize shrink-0 ${
                          statusStyles[client.status] || statusStyles.active
                        }`}
                      >
                        {client.status}
                      </span>
                    </div>
                    <p
                      className="text-sm truncate"
                      style={{ color: 'var(--muted)' }}
                    >
                      {client.contact_name}
                    </p>
                    <p
                      className="text-xs truncate"
                      style={{ color: 'var(--accent)' }}
                    >
                      {client.contact_email}
                    </p>
                  </div>
                </div>

                {/* Services */}
                {services.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    {services.map((service) => (
                      <span
                        key={service}
                        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ring-1 ring-inset ${
                          serviceStyles[service] ||
                          'bg-gray-50 text-gray-700 ring-gray-600/20'
                        }`}
                      >
                        {service}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer */}
                <div
                  className="flex items-center justify-between pt-3 text-xs"
                  style={{
                    borderTop: '1px solid var(--border)',
                    color: 'var(--muted)',
                  }}
                >
                  {client.website_url ? (
                    <span className="truncate max-w-[140px]">
                      {client.website_url.replace(/^https?:\/\//, '')}
                    </span>
                  ) : (
                    <span>No website</span>
                  )}
                  {client.retainer_amount > 0 && (
                    <span
                      className="font-semibold"
                      style={{ color: 'var(--foreground)' }}
                    >
                      ${client.retainer_amount.toLocaleString()}/mo
                    </span>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {!loading && filteredClients.length === 0 && (
        <div className="text-center py-12">
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"
            style={{ backgroundColor: 'var(--muted)', opacity: 0.1 }}
          />
          <p style={{ color: 'var(--muted)' }}>
            {clients.length === 0
              ? 'No clients yet. Add your first client to get started.'
              : 'No clients match your search.'}
          </p>
        </div>
      )}
    </div>
  );
}
