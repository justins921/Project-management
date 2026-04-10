'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile, Tenant } from '@/lib/types/database';

const SERVICE_OPTIONS = [
  'Web Design',
  'SEO',
  'Social Media',
  'Branding',
  'Content Marketing',
  'PPC',
];

const PLATFORM_OPTIONS = [
  'WordPress',
  'Shopify',
  'Webflow',
  'Squarespace',
  'Wix',
  'Custom',
  'Other',
];

const DEFAULT_ONBOARDING_ITEMS = [
  'Send welcome email',
  'Collect brand assets',
  'Setup project workspace',
  'Schedule kickoff call',
  'Create initial timeline',
];

interface FormState {
  business_name: string;
  contact_name: string;
  contact_email: string;
  phone: string;
  website_url: string;
  platform: string;
  services: string[];
  retainer_amount: string;
  billing_day: string;
  contract_url: string;
  notes: string;
}

const initialForm: FormState = {
  business_name: '',
  contact_name: '',
  contact_email: '',
  phone: '',
  website_url: '',
  platform: 'WordPress',
  services: [],
  retainer_amount: '',
  billing_day: '1',
  contract_url: '',
  notes: '',
};

export default function NewClientPage() {
  const router = useRouter();
  const [form, setForm] = useState<FormState>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loadingAuth, setLoadingAuth] = useState(true);

  useEffect(() => {
    async function loadAuth() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setLoadingAuth(false);
        return;
      }

      const { data: p } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (!p) {
        setLoadingAuth(false);
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
      setLoadingAuth(false);
    }
    loadAuth();
  }, []);

  const updateField = (field: keyof FormState, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const toggleService = (service: string) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!tenant) {
      setError('No tenant found. Please try again.');
      return;
    }

    if (!form.business_name.trim()) {
      setError('Business name is required.');
      return;
    }

    if (!form.contact_email.trim()) {
      setError('Contact email is required.');
      return;
    }

    setSubmitting(true);

    try {
      const supabase = createClient();

      // Insert client
      const { data: newClient, error: insertError } = await supabase
        .from('clients')
        .insert({
          tenant_id: tenant.id,
          business_name: form.business_name.trim(),
          contact_name: form.contact_name.trim(),
          contact_email: form.contact_email.trim(),
          phone: form.phone.trim() || null,
          website_url: form.website_url.trim() || null,
          platform: form.platform,
          services: form.services,
          status: 'onboarding',
          retainer_amount: form.retainer_amount
            ? Number(form.retainer_amount)
            : 0,
          billing_day: form.billing_day ? Number(form.billing_day) : 1,
          contract_url: form.contract_url.trim() || null,
          notes: form.notes.trim() || null,
        })
        .select('id')
        .single();

      if (insertError) {
        setError(insertError.message);
        setSubmitting(false);
        return;
      }

      if (!newClient) {
        setError('Failed to create client.');
        setSubmitting(false);
        return;
      }

      // Create default onboarding items
      const onboardingItems = DEFAULT_ONBOARDING_ITEMS.map((title, index) => ({
        client_id: newClient.id,
        tenant_id: tenant.id,
        title,
        is_completed: false,
        sort_order: index + 1,
      }));

      await supabase.from('onboarding_items').insert(onboardingItems);

      // Redirect to the new client detail page
      router.push(`/clients/${newClient.id}`);
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      setSubmitting(false);
    }
  };

  if (loadingAuth) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-4 rounded w-32 bg-[var(--muted)]/20" />
        <div
          className="rounded-xl border p-6 space-y-4"
          style={{
            backgroundColor: 'var(--card)',
            borderColor: 'var(--border)',
          }}
        >
          <div className="h-6 rounded w-40 bg-[var(--muted)]/20" />
          <div className="h-3 rounded w-56 bg-[var(--muted)]/20" />
          <div className="space-y-3 pt-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 rounded bg-[var(--muted)]/20" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Breadcrumb */}
      <nav
        className="flex items-center gap-2 text-sm"
        style={{ color: 'var(--muted)' }}
      >
        <Link
          href="/clients"
          className="transition-colors hover:opacity-80"
          style={{ color: 'var(--accent)' }}
        >
          Clients
        </Link>
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
            d="M9 5l7 7-7 7"
          />
        </svg>
        <span style={{ color: 'var(--foreground)' }} className="font-medium">
          New Client
        </span>
      </nav>

      <div
        className="rounded-xl border shadow-sm"
        style={{
          backgroundColor: 'var(--card)',
          borderColor: 'var(--border)',
        }}
      >
        <div
          className="px-6 py-4"
          style={{ borderBottom: '1px solid var(--border)' }}
        >
          <h1
            className="text-xl font-bold"
            style={{ color: 'var(--foreground)' }}
          >
            Add New Client
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--muted)' }}>
            Enter the client&apos;s information to get started.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Business Name */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--foreground)' }}
            >
              Business Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.business_name}
              onChange={(e) => updateField('business_name', e.target.value)}
              placeholder="e.g., Acme Corporation"
              className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
              }}
              required
            />
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--foreground)' }}
              >
                Contact Name
              </label>
              <input
                type="text"
                value={form.contact_name}
                onChange={(e) => updateField('contact_name', e.target.value)}
                placeholder="e.g., John Smith"
                className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--foreground)' }}
              >
                Contact Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={form.contact_email}
                onChange={(e) => updateField('contact_email', e.target.value)}
                placeholder="e.g., john@acme.com"
                className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
                required
              />
            </div>
          </div>

          {/* Phone & Website */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--foreground)' }}
              >
                Phone
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                placeholder="e.g., (555) 123-4567"
                className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--foreground)' }}
              >
                Website URL
              </label>
              <input
                type="url"
                value={form.website_url}
                onChange={(e) => updateField('website_url', e.target.value)}
                placeholder="e.g., https://acme.com"
                className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
          </div>

          {/* Platform */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--foreground)' }}
            >
              Platform
            </label>
            <select
              value={form.platform}
              onChange={(e) => updateField('platform', e.target.value)}
              className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
              }}
            >
              {PLATFORM_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>

          {/* Services Multi-Select */}
          <div>
            <label
              className="block text-sm font-medium mb-2"
              style={{ color: 'var(--foreground)' }}
            >
              Services
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {SERVICE_OPTIONS.map((service) => {
                const checked = form.services.includes(service);
                return (
                  <label
                    key={service}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-sm cursor-pointer transition-all ${
                      checked
                        ? 'border-[var(--accent)] bg-[var(--accent)]/5'
                        : ''
                    }`}
                    style={{
                      borderColor: checked ? 'var(--accent)' : 'var(--border)',
                      color: 'var(--foreground)',
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleService(service)}
                      className="w-3.5 h-3.5 rounded accent-[var(--accent)]"
                    />
                    <span className="text-sm">{service}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Retainer & Billing */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--foreground)' }}
              >
                Retainer Amount ($/mo)
              </label>
              <input
                type="number"
                min="0"
                step="1"
                value={form.retainer_amount}
                onChange={(e) => updateField('retainer_amount', e.target.value)}
                placeholder="e.g., 2500"
                className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
            <div>
              <label
                className="block text-sm font-medium mb-1.5"
                style={{ color: 'var(--foreground)' }}
              >
                Billing Day of Month
              </label>
              <input
                type="number"
                min="1"
                max="28"
                value={form.billing_day}
                onChange={(e) => updateField('billing_day', e.target.value)}
                placeholder="1"
                className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
                style={{
                  border: '1px solid var(--border)',
                  backgroundColor: 'var(--background)',
                  color: 'var(--foreground)',
                }}
              />
            </div>
          </div>

          {/* Contract URL */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--foreground)' }}
            >
              Contract URL
            </label>
            <input
              type="url"
              value={form.contract_url}
              onChange={(e) => updateField('contract_url', e.target.value)}
              placeholder="e.g., https://docs.google.com/..."
              className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label
              className="block text-sm font-medium mb-1.5"
              style={{ color: 'var(--foreground)' }}
            >
              Notes
            </label>
            <textarea
              rows={3}
              value={form.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Any additional notes about this client..."
              className="w-full px-3 py-2.5 text-sm rounded-lg focus:outline-none focus:ring-2 transition-colors resize-none"
              style={{
                border: '1px solid var(--border)',
                backgroundColor: 'var(--background)',
                color: 'var(--foreground)',
              }}
            />
          </div>

          {/* Actions */}
          <div
            className="flex items-center justify-end gap-3 pt-4"
            style={{ borderTop: '1px solid var(--border)' }}
          >
            <Link
              href="/clients"
              className="px-4 py-2.5 text-sm font-medium transition-colors"
              style={{ color: 'var(--muted)' }}
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 text-white text-sm font-medium rounded-lg transition-colors shadow-sm disabled:opacity-50"
              style={{ backgroundColor: 'var(--accent)' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.backgroundColor =
                  'var(--accent-hover)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.backgroundColor = 'var(--accent)')
              }
            >
              {submitting ? 'Creating...' : 'Add Client'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
