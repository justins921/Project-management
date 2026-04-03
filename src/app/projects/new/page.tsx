'use client';

import Link from 'next/link';
import { clients, teamMembers } from '@/lib/data';
import { Platform, ServiceType, ProjectStatus } from '@/lib/types';

const services: ServiceType[] = ['Web Design', 'SEO', 'Social Media Marketing', 'Branding', 'Content Marketing', 'PPC Advertising'];
const platforms: Platform[] = ['WordPress', 'Shopify', 'Webflow', 'Squarespace', 'Wix', 'Custom', 'Other'];
const statuses: ProjectStatus[] = ['Pending', 'Active', 'On Hold', 'Completed'];

export default function NewProjectPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-muted">
        <Link href="/projects" className="hover:text-accent transition-colors">Projects</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-foreground font-medium">New Project</span>
      </nav>

      <div className="bg-card-bg rounded-xl border border-card-border shadow-sm">
        <div className="px-6 py-4 border-b border-card-border">
          <h1 className="text-xl font-bold text-foreground">Create New Project</h1>
          <p className="text-sm text-muted mt-1">Fill in the details to create a new project.</p>
        </div>

        <form className="p-6 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Project Name</label>
            <input
              type="text"
              placeholder="e.g., Acme Corp Website Redesign"
              className="w-full px-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
            />
          </div>

          {/* Client & Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Client</label>
              <select className="w-full px-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Service</label>
              <select className="w-full px-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
                <option value="">Select a service</option>
                {services.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Status & Budget */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Status</label>
              <select className="w-full px-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
                {statuses.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Budget</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">$</span>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
                />
              </div>
            </div>
          </div>

          {/* Platform & Hosting */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Platform</label>
              <select className="w-full px-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent">
                <option value="">Select platform</option>
                {platforms.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Hosting Location</label>
              <input
                type="text"
                placeholder="e.g., SiteGround, AWS, Vercel"
                className="w-full px-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Start Date</label>
              <input
                type="date"
                className="w-full px-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">End Date</label>
              <input
                type="date"
                className="w-full px-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors"
              />
            </div>
          </div>

          {/* Team Members */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Team Members</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {teamMembers.map((member) => (
                <label
                  key={member.id}
                  className="flex items-center gap-2 p-2.5 border border-card-border rounded-lg hover:bg-slate-50 cursor-pointer transition-colors"
                >
                  <input type="checkbox" className="rounded border-slate-300 text-accent focus:ring-accent" />
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-foreground truncate">{member.name}</p>
                    <p className="text-[10px] text-muted truncate">{member.role}</p>
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Description</label>
            <textarea
              rows={3}
              placeholder="Brief description of the project scope..."
              className="w-full px-3 py-2.5 text-sm border border-card-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-accent/20 focus:border-accent transition-colors resize-none"
            />
          </div>

          {/* Contract Upload */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Contract</label>
            <div className="border-2 border-dashed border-card-border rounded-lg p-6 text-center hover:border-accent/50 transition-colors">
              <svg className="w-8 h-8 text-muted mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              <p className="text-sm text-muted">Drag and drop or click to upload</p>
              <p className="text-xs text-muted mt-1">PDF, DOC up to 10MB</p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-card-border">
            <Link
              href="/projects"
              className="px-4 py-2.5 text-sm font-medium text-muted hover:text-foreground transition-colors"
            >
              Cancel
            </Link>
            <button
              type="submit"
              className="px-6 py-2.5 bg-accent text-white text-sm font-medium rounded-lg hover:bg-accent-hover transition-colors shadow-sm"
            >
              Create Project
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
