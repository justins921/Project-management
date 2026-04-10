'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

interface TenantData {
  id: string;
  agency_name: string;
  logo_url: string;
  subscription_status: string;
  stripe_customer_id: string | null;
  pagespeed_api_key: string;
}

interface ProfileData {
  id: string;
  full_name: string;
  email: string;
}

interface Toast {
  message: string;
  type: 'success' | 'error';
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingApiKey, setSavingApiKey] = useState(false);
  const [toast, setToast] = useState<Toast | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);

  // Form state
  const [agencyName, setAgencyName] = useState('');
  const [ownerName, setOwnerName] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [subscriptionStatus, setSubscriptionStatus] = useState('');
  const [pagespeedApiKey, setPagespeedApiKey] = useState('');
  const [email, setEmail] = useState('');
  const [tenantId, setTenantId] = useState('');
  const [profileId, setProfileId] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  async function fetchData() {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .eq('id', user.id)
        .single();

      // Fetch tenant via profile's tenant_id or owner_id
      const { data: tenant } = await supabase
        .from('tenants')
        .select('id, agency_name, logo_url, subscription_status, stripe_customer_id, pagespeed_api_key')
        .eq('owner_id', user.id)
        .single();

      if (profile) {
        setProfileId(profile.id);
        setOwnerName(profile.full_name || '');
        setEmail(profile.email || user.email || '');
      } else {
        setEmail(user.email || '');
      }

      if (tenant) {
        setTenantId(tenant.id);
        setAgencyName(tenant.agency_name || '');
        setLogoUrl(tenant.logo_url || '');
        setSubscriptionStatus(tenant.subscription_status || 'active');
        setPagespeedApiKey(tenant.pagespeed_api_key || '');
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      showToast('Failed to load settings', 'error');
    } finally {
      setLoading(false);
    }
  }

  function showToast(message: string, type: 'success' | 'error') {
    setToast({ message, type });
  }

  function maskApiKey(key: string): string {
    if (!key) return '';
    if (key.length <= 8) return '****';
    return key.slice(0, 4) + '****' + key.slice(-4);
  }

  async function handleUpdateProfile() {
    setSaving(true);
    try {
      const supabase = createClient();

      // Update profiles table
      if (profileId) {
        const { error: profileError } = await supabase
          .from('profiles')
          .update({ full_name: ownerName, updated_at: new Date().toISOString() })
          .eq('id', profileId);

        if (profileError) throw profileError;
      }

      // Update tenants table
      if (tenantId) {
        const { error: tenantError } = await supabase
          .from('tenants')
          .update({
            agency_name: agencyName,
            logo_url: logoUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tenantId);

        if (tenantError) throw tenantError;
      }

      showToast('Agency profile updated successfully', 'success');
    } catch (err) {
      console.error('Error updating profile:', err);
      showToast('Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleSaveApiKey() {
    setSavingApiKey(true);
    try {
      const supabase = createClient();

      if (tenantId) {
        const { error } = await supabase
          .from('tenants')
          .update({
            pagespeed_api_key: pagespeedApiKey,
            updated_at: new Date().toISOString(),
          })
          .eq('id', tenantId);

        if (error) throw error;
      }

      showToast('API key saved successfully', 'success');
    } catch (err) {
      console.error('Error saving API key:', err);
      showToast('Failed to save API key', 'error');
    } finally {
      setSavingApiKey(false);
    }
  }

  async function handleDeleteAccount() {
    if (deleteText !== 'DELETE') return;

    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Delete tenant data first
      if (tenantId) {
        await supabase.from('tenants').delete().eq('id', tenantId);
      }

      // Delete profile
      if (profileId) {
        await supabase.from('profiles').delete().eq('id', profileId);
      }

      // Sign out
      await supabase.auth.signOut();
      window.location.href = '/';
    } catch (err) {
      console.error('Error deleting account:', err);
      showToast('Failed to delete account. Please contact support.', 'error');
      setShowDeleteConfirm(false);
      setDeleteText('');
    }
  }

  const inputClassName =
    'w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 text-[var(--foreground)] placeholder:text-[var(--muted)]';

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <div className="h-7 w-40 bg-slate-200 rounded animate-pulse" />
          <div className="h-4 w-60 bg-slate-100 rounded animate-pulse mt-2" />
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6"
          >
            <div className="h-5 w-36 bg-slate-200 rounded animate-pulse mb-4" />
            <div className="space-y-3">
              <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
              <div className="h-4 w-24 bg-slate-100 rounded animate-pulse" />
              <div className="h-10 w-full bg-slate-100 rounded-lg animate-pulse" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Toast */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium transition-all animate-in slide-in-from-top-2 ${
            toast.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
        >
          <div className="flex items-center gap-2">
            {toast.type === 'success' ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            {toast.message}
          </div>
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-[var(--foreground)]">Settings</h1>
        <p className="text-sm text-[var(--muted)] mt-1">Manage your agency profile, billing, and integrations</p>
      </div>

      {/* Agency Profile */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          Agency Profile
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Agency Name</label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              placeholder="Your agency name"
              className={inputClassName}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Owner Name</label>
            <input
              type="text"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              placeholder="Your full name"
              className={inputClassName}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">Agency Logo URL</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className={inputClassName}
            />
            {logoUrl && (
              <div className="mt-3 flex items-center gap-3">
                <div className="w-12 h-12 rounded-lg border border-[var(--border)] overflow-hidden bg-slate-50 flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoUrl}
                    alt="Agency logo preview"
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = 'none';
                    }}
                  />
                </div>
                <span className="text-xs text-[var(--muted)]">Logo preview</span>
              </div>
            )}
          </div>

          <div className="pt-2">
            <button
              onClick={handleUpdateProfile}
              disabled={saving}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-hover)] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Update Profile'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Subscription & Billing */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          Subscription &amp; Billing
        </h2>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-4 bg-slate-50 rounded-lg border border-[var(--border)]/50">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-sm font-semibold text-[var(--foreground)]">Solo Agency OS</span>
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-[var(--accent)]/10 text-[var(--accent)]">
                  Pro
                </span>
              </div>
              <p className="text-2xl font-bold text-[var(--foreground)]">
                $29<span className="text-sm font-normal text-[var(--muted)]">/mo</span>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  subscriptionStatus === 'active'
                    ? 'bg-emerald-50 text-emerald-700'
                    : subscriptionStatus === 'trialing'
                    ? 'bg-blue-50 text-blue-700'
                    : subscriptionStatus === 'past_due'
                    ? 'bg-amber-50 text-amber-700'
                    : subscriptionStatus === 'canceled'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    subscriptionStatus === 'active'
                      ? 'bg-emerald-500'
                      : subscriptionStatus === 'trialing'
                      ? 'bg-blue-500'
                      : subscriptionStatus === 'past_due'
                      ? 'bg-amber-500'
                      : subscriptionStatus === 'canceled'
                      ? 'bg-red-500'
                      : 'bg-slate-400'
                  }`}
                />
                {subscriptionStatus
                  ? subscriptionStatus.charAt(0).toUpperCase() + subscriptionStatus.slice(1).replace('_', ' ')
                  : 'Unknown'}
              </span>
            </div>
          </div>

          <button
            onClick={() => showToast('Stripe billing portal integration coming soon', 'success')}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-[var(--foreground)] bg-white border border-[var(--border)] rounded-lg hover:bg-slate-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            Manage Billing
          </button>
        </div>
      </div>

      {/* API Keys */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          API Keys
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">
              Google PageSpeed API Key
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <input
                  type={showApiKey ? 'text' : 'password'}
                  value={showApiKey ? pagespeedApiKey : (pagespeedApiKey ? maskApiKey(pagespeedApiKey) : '')}
                  onChange={(e) => {
                    if (showApiKey) {
                      setPagespeedApiKey(e.target.value);
                    }
                  }}
                  onFocus={() => {
                    if (!showApiKey) setShowApiKey(true);
                  }}
                  placeholder="Enter your PageSpeed API key"
                  className={inputClassName}
                />
              </div>
              <button
                onClick={() => setShowApiKey(!showApiKey)}
                className="px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white hover:bg-slate-50 transition-colors text-[var(--muted)] shrink-0"
                title={showApiKey ? 'Hide API key' : 'Show API key'}
              >
                {showApiKey ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L6.59 6.59m7.532 7.532l3.29 3.29M3 3l18 18" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            <p className="text-xs text-[var(--muted)] mt-1.5">
              Used for website performance audits. Get a key from the{' '}
              <a
                href="https://developers.google.com/speed/docs/insights/v5/get-started"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--accent)] hover:text-[var(--accent-hover)] underline"
              >
                Google Cloud Console
              </a>
              .
            </p>
          </div>

          <div className="pt-1">
            <button
              onClick={handleSaveApiKey}
              disabled={savingApiKey}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-[var(--accent)] text-white text-sm font-medium rounded-lg hover:bg-[var(--accent-hover)] transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {savingApiKey ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Saving...
                </>
              ) : (
                'Save API Key'
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Email Settings */}
      <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-6 shadow-sm">
        <h2 className="text-base font-semibold text-[var(--foreground)] mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-[var(--muted)]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          Email Settings
        </h2>

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-[var(--muted)] mb-1.5">From Email</label>
            <input
              type="email"
              value={email}
              readOnly
              className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-slate-50 text-[var(--foreground)] cursor-not-allowed"
            />
            <p className="text-xs text-[var(--muted)] mt-1.5">
              This is your account email used for outgoing messages. Contact support to change it.
            </p>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-[var(--card)] rounded-xl border border-red-200 p-6 shadow-sm">
        <h2 className="text-base font-semibold text-red-600 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          Danger Zone
        </h2>
        <p className="text-sm text-[var(--muted)] mb-4">
          Once you delete your account, there is no going back. All your data, including clients, projects, and files will be permanently removed.
        </p>

        {!showDeleteConfirm ? (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-lg hover:bg-red-50 hover:border-red-300 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Account
          </button>
        ) : (
          <div className="p-4 bg-red-50 rounded-lg border border-red-200 space-y-3">
            <p className="text-sm font-medium text-red-700">
              Are you absolutely sure? Type <span className="font-bold">DELETE</span> to confirm.
            </p>
            <input
              type="text"
              value={deleteText}
              onChange={(e) => setDeleteText(e.target.value)}
              placeholder="Type DELETE to confirm"
              className="w-full px-3 py-2.5 text-sm border border-red-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-red-500/30 text-[var(--foreground)] placeholder:text-[var(--muted)]"
              autoFocus
            />
            <div className="flex items-center gap-2">
              <button
                onClick={handleDeleteAccount}
                disabled={deleteText !== 'DELETE'}
                className="px-4 py-2.5 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Permanently Delete Account
              </button>
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeleteText('');
                }}
                className="px-4 py-2.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
