'use client';

import { useState } from 'react';
import Link from 'next/link';
import { clients, getProjectsByClient } from '@/lib/data';
import Avatar from '@/components/Avatar';
import StatusBadge from '@/components/StatusBadge';
import ServiceBadge from '@/components/ServiceBadge';

export default function ClientsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredClients = clients.filter((c) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(query) ||
      c.contactName.toLowerCase().includes(query) ||
      c.contactEmail.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Clients</h1>
          <p className="text-sm text-muted mt-1">
            {filteredClients.length} client{filteredClients.length !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/clients/new"
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors shadow-sm"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Client
        </Link>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted"
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
          className="w-full pl-10 pr-4 py-2.5 text-sm border border-card-border rounded-lg bg-card-bg focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
        />
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredClients.map((client) => {
          const clientProjects = getProjectsByClient(client.id);
          const activeCount = clientProjects.filter((p) => p.status === 'Active').length;
          const services = [...new Set(clientProjects.map((p) => p.service))];

          return (
            <Link
              key={client.id}
              href={`/clients/${client.id}`}
              className="bg-card-bg rounded-xl border border-card-border p-5 shadow-sm hover:shadow-md hover:border-accent/30 transition-all group"
            >
              <div className="flex items-start gap-4 mb-4">
                <Avatar name={client.name} size="lg" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-semibold text-foreground group-hover:text-accent transition-colors truncate">
                    {client.name}
                  </h3>
                  <p className="text-sm text-muted truncate">{client.contactName}</p>
                  <p className="text-xs text-accent truncate">{client.contactEmail}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {services.map((service) => (
                  <ServiceBadge key={service} service={service} />
                ))}
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-card-border/50 text-xs text-muted">
                <span>{clientProjects.length} project{clientProjects.length !== 1 ? 's' : ''}</span>
                <span className="text-emerald-600 font-medium">
                  {activeCount} active
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted">No clients found.</p>
        </div>
      )}
    </div>
  );
}
