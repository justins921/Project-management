'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

interface TenantInfo {
  agency_name: string;
  agency_logo_url: string | null;
}

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [tenant, setTenant] = useState<TenantInfo | null>(null);
  const [userName, setUserName] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPortalInfo() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setLoading(false);
        return;
      }

      // Get profile to find the user's name and tenant
      const { data: profile } = await supabase
        .from('profiles')
        .select('full_name, tenant_id')
        .eq('id', user.id)
        .single();

      if (profile) {
        setUserName(profile.full_name || user.email || '');

        // Try to get tenant via profile.tenant_id first
        if (profile.tenant_id) {
          const { data: tenantData } = await supabase
            .from('tenants')
            .select('agency_name, agency_logo_url')
            .eq('id', profile.tenant_id)
            .single();
          if (tenantData) setTenant(tenantData);
        }

        // If no tenant yet, try via client record's portal_user_id
        if (!profile.tenant_id) {
          const { data: clientData } = await supabase
            .from('clients')
            .select('tenant_id')
            .eq('portal_user_id', user.id)
            .single();

          if (clientData) {
            const { data: tenantData } = await supabase
              .from('tenants')
              .select('agency_name, agency_logo_url')
              .eq('id', clientData.tenant_id)
              .single();
            if (tenantData) setTenant(tenantData);
          }
        }
      }

      setLoading(false);
    }

    loadPortalInfo();
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/sign-in');
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--background)' }}>
      {/* Portal Header */}
      <header
        className="sticky top-0 z-30 border-b"
        style={{
          backgroundColor: 'var(--card-bg)',
          borderColor: 'var(--card-border)',
        }}
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Left: Logo + label */}
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="flex items-center gap-3 animate-pulse">
                <div
                  className="w-8 h-8 rounded-lg"
                  style={{ backgroundColor: 'var(--muted)', opacity: 0.2 }}
                />
                <div
                  className="h-4 w-32 rounded"
                  style={{ backgroundColor: 'var(--muted)', opacity: 0.2 }}
                />
              </div>
            ) : (
              <>
                {tenant?.agency_logo_url ? (
                  <img
                    src={tenant.agency_logo_url}
                    alt={tenant.agency_name}
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold"
                    style={{ backgroundColor: 'var(--accent)' }}
                  >
                    {(tenant?.agency_name || 'A').charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="flex flex-col">
                  <span
                    className="text-sm font-semibold leading-tight"
                    style={{ color: 'var(--foreground)' }}
                  >
                    {tenant?.agency_name || 'Agency'}
                  </span>
                  <span
                    className="text-xs leading-tight"
                    style={{ color: 'var(--muted)' }}
                  >
                    Client Portal
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Right: User name + sign out */}
          <div className="flex items-center gap-4">
            {!loading && userName && (
              <span
                className="text-sm hidden sm:inline"
                style={{ color: 'var(--muted)' }}
              >
                {userName}
              </span>
            )}
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-lg border transition-colors"
              style={{
                borderColor: 'var(--card-border)',
                color: 'var(--muted)',
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = 'var(--foreground)';
                e.currentTarget.style.borderColor = 'var(--foreground)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = 'var(--muted)';
                e.currentTarget.style.borderColor = 'var(--card-border)';
              }}
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
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                />
              </svg>
              <span className="hidden sm:inline">Sign Out</span>
            </button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {children}
      </main>
    </div>
  );
}
