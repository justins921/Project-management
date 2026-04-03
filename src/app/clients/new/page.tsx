'use client';

import Link from 'next/link';

export default function NewClientPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted">
        <Link href="/clients" className="hover:text-accent transition-colors">Clients</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-foreground font-medium">New Client</span>
      </nav>

      <div className="bg-card-bg rounded-xl border border-card-border shadow-sm">
        <div className="px-6 py-4 border-b border-card-border">
          <h1 className="text-xl font-bold text-foreground">Add New Client</h1>
          <p className="text-sm text-muted mt-1">Enter the client&apos;s information.</p>
        </div>

        <form className="p-6 space-y-6">
          {/* Client Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Client / Business Name</label>
            <input
              type="text"
              placeholder="e.g., Acme Corporation"
              className="w-full px-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>

          {/* Company */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Company / Organization</label>
            <input
              type="text"
              placeholder="e.g., Acme Corporation LLC"
              className="w-full px-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Contact Name</label>
              <input
                type="text"
                placeholder="e.g., John Smith"
                className="w-full px-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Contact Email</label>
              <input
                type="email"
                placeholder="e.g., john@acme.com"
                className="w-full px-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Phone Number</label>
            <input
              type="tel"
              placeholder="e.g., (555) 123-4567"
              className="w-full px-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Notes</label>
            <textarea
              rows={3}
              placeholder="Any additional notes about this client..."
              className="w-full px-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
            <Link
              href="/clients"
              className="px-4 py-2.5 text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors shadow-sm"
            >
              Add Client
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
