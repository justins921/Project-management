'use client';

import { useState, useEffect, Suspense } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useSearchParams, useRouter } from 'next/navigation';

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-sm text-[var(--muted)]">Loading...</div>
      </div>
    }>
      <AcceptInviteForm />
    </Suspense>
  );
}

function AcceptInviteForm() {
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [inviteData, setInviteData] = useState<{
    email: string;
    role: string;
    tenant_name: string;
  } | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const type = searchParams.get('type'); // 'freelancer' or 'client'

  useEffect(() => {
    if (!token) return;
    // Verify invite token
    async function verifyToken() {
      const supabase = createClient();
      if (type === 'client') {
        const { data } = await supabase
          .from('clients')
          .select('contact_email, contact_name, tenant_id, tenants(agency_name)')
          .eq('portal_invite_token', token)
          .single();
        if (data) {
          setInviteData({
            email: data.contact_email,
            role: 'client',
            tenant_name: (data.tenants as unknown as { agency_name: string })?.agency_name || 'Agency',
          });
          setFullName(data.contact_name);
        } else {
          setError('Invalid or expired invite link.');
        }
      }
      // Freelancer invites would work similarly via a separate invite_tokens table or similar
    }
    verifyToken();
  }, [token, type]);

  async function handleAccept(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteData || !token) return;
    setError('');
    setLoading(true);

    const supabase = createClient();

    // Create auth user
    const { data, error: authError } = await supabase.auth.signUp({
      email: inviteData.email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: inviteData.role,
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user && type === 'client') {
      // Get the client record to find tenant_id
      const { data: client } = await supabase
        .from('clients')
        .select('id, tenant_id')
        .eq('portal_invite_token', token)
        .single();

      if (client) {
        // Update profile with tenant_id
        await supabase
          .from('profiles')
          .update({ tenant_id: client.tenant_id, role: 'client' })
          .eq('id', data.user.id);

        // Link client to portal user
        await supabase
          .from('clients')
          .update({
            portal_user_id: data.user.id,
            portal_invite_token: null,
          })
          .eq('id', client.id);
      }

      router.push('/portal');
      router.refresh();
    }
  }

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
        <div className="text-center">
          <h1 className="text-xl font-bold text-[var(--foreground)] mb-2">Invalid Link</h1>
          <p className="text-sm text-[var(--muted)]">This invite link is missing or invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--accent)] text-white text-xl font-bold mb-4">
            S
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Accept Invite</h1>
          {inviteData && (
            <p className="text-sm text-[var(--muted)] mt-1">
              You&apos;ve been invited to {inviteData.tenant_name}
            </p>
          )}
        </div>

        {error && !inviteData ? (
          <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {error}
          </div>
        ) : inviteData ? (
          <form onSubmit={handleAccept} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email</label>
              <input
                type="email"
                value={inviteData.email}
                disabled
                className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-slate-50 text-[var(--muted)]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Your Name</label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Set Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                placeholder="At least 6 characters"
                className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Accept & Create Account'}
            </button>
          </form>
        ) : (
          <div className="text-center text-sm text-[var(--muted)]">Verifying invite...</div>
        )}
      </div>
    </div>
  );
}
