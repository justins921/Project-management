'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

type ClientOption = { id: string; business_name: string };
type TeamMember = { id: string; full_name: string; role: string };

const services = ['Web Design', 'SEO', 'Social Media', 'Branding', 'Content Marketing', 'PPC'];
const platforms = ['WordPress', 'Shopify', 'Webflow', 'Squarespace', 'Wix', 'Custom', 'Other'];
const statuses = [
  { value: 'pending', label: 'Pending' },
  { value: 'active', label: 'Active' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'completed', label: 'Completed' },
];

export default function NewProjectPage() {
  const router = useRouter();
  const [clients, setClients] = useState<ClientOption[]>([]);
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [tenantId, setTenantId] = useState('');

  const [form, setForm] = useState({
    name: '',
    client_id: '',
    service: '',
    status: 'pending',
    platform: '',
    start_date: '',
    end_date: '',
    budget: '',
    description: '',
    selectedMembers: [] as string[],
  });

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profile } = await supabase
        .from('profiles')
        .select('role, tenant_id')
        .eq('id', user.id)
        .single();

      let tid = profile?.tenant_id;
      if (!tid) {
        const { data: tenant } = await supabase
          .from('tenants')
          .select('id')
          .eq('owner_id', user.id)
          .single();
        tid = tenant?.id;
      }
      if (!tid) return;
      setTenantId(tid);

      const [clientsRes, membersRes] = await Promise.all([
        supabase.from('clients').select('id, business_name').eq('tenant_id', tid).order('business_name'),
        supabase.from('profiles').select('id, full_name, role').eq('tenant_id', tid).in('role', ['owner', 'freelancer']),
      ]);

      setClients(clientsRes.data || []);
      setTeamMembers(membersRes.data || []);
      setLoading(false);
    }
    fetchData();
  }, []);

  function toggleMember(id: string) {
    setForm(prev => ({
      ...prev,
      selectedMembers: prev.selectedMembers.includes(id)
        ? prev.selectedMembers.filter(m => m !== id)
        : [...prev.selectedMembers, id],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name || !form.client_id) {
      setError('Project name and client are required.');
      return;
    }
    setError('');
    setSaving(true);

    const supabase = createClient();

    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert({
        tenant_id: tenantId,
        name: form.name,
        client_id: form.client_id,
        service: form.service || null,
        status: form.status,
        platform: form.platform || null,
        start_date: form.start_date || null,
        end_date: form.end_date || null,
        budget: form.budget ? parseFloat(form.budget) : null,
        description: form.description || null,
      })
      .select('id')
      .single();

    if (insertError) {
      setError(insertError.message);
      setSaving(false);
      return;
    }

    // Add team members
    if (project && form.selectedMembers.length > 0) {
      await supabase.from('project_members').insert(
        form.selectedMembers.map(profileId => ({
          project_id: project.id,
          profile_id: profileId,
          role: 'member',
        }))
      );
    }

    router.push(`/projects/${project?.id}`);
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="h-6 w-32 bg-slate-200 rounded animate-pulse" />
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] h-96 animate-pulse" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-[var(--muted)]">
        <Link href="/projects" className="hover:text-[var(--accent)] transition-colors">Projects</Link>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
        <span className="text-[var(--foreground)] font-medium">New Project</span>
      </nav>

      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] shadow-sm">
        <div className="px-6 py-4 border-b border-[var(--border)]">
          <h1 className="text-xl font-bold text-[var(--foreground)]">Create New Project</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Fill in the details to create a new project.</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">{error}</div>
          )}

          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Project Name *</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="e.g., Acme Corp Website Redesign"
              className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
            />
          </div>

          {/* Client & Service */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Client *</label>
              <select
                required
                value={form.client_id}
                onChange={(e) => setForm(f => ({ ...f, client_id: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              >
                <option value="">Select a client</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>{c.business_name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Service</label>
              <select
                value={form.service}
                onChange={(e) => setForm(f => ({ ...f, service: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              >
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
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm(f => ({ ...f, status: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              >
                {statuses.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Budget</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">$</span>
                <input
                  type="number"
                  value={form.budget}
                  onChange={(e) => setForm(f => ({ ...f, budget: e.target.value }))}
                  placeholder="0"
                  className="w-full pl-7 pr-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
                />
              </div>
            </div>
          </div>

          {/* Platform */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Platform</label>
              <select
                value={form.platform}
                onChange={(e) => setForm(f => ({ ...f, platform: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              >
                <option value="">Select platform</option>
                {platforms.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Start Date</label>
              <input
                type="date"
                value={form.start_date}
                onChange={(e) => setForm(f => ({ ...f, start_date: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">End Date</label>
              <input
                type="date"
                value={form.end_date}
                onChange={(e) => setForm(f => ({ ...f, end_date: e.target.value }))}
                className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20"
              />
            </div>
          </div>

          {/* Team Members */}
          {teamMembers.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Team Members</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                {teamMembers.map((member) => (
                  <label
                    key={member.id}
                    className={`flex items-center gap-2 p-2.5 border rounded-lg cursor-pointer transition-colors ${
                      form.selectedMembers.includes(member.id)
                        ? 'border-[var(--accent)] bg-blue-50'
                        : 'border-[var(--border)] hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={form.selectedMembers.includes(member.id)}
                      onChange={() => toggleMember(member.id)}
                      className="rounded border-slate-300 text-[var(--accent)] focus:ring-[var(--accent)]"
                    />
                    <div className="min-w-0">
                      <p className="text-xs font-medium text-[var(--foreground)] truncate">{member.full_name}</p>
                      <p className="text-[10px] text-[var(--muted)] truncate capitalize">{member.role}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Description</label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
              placeholder="Brief description of the project scope..."
              className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-[var(--background)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/20 resize-none"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[var(--border)]">
            <Link href="/projects" className="px-4 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors">
              Cancel
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="px-6 py-2.5 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-hover)] transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? 'Creating...' : 'Create Project'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
