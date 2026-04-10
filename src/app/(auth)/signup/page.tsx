'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [fullName, setFullName] = useState('');
  const [agencyName, setAgencyName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const supabase = createClient();

    // 1. Create auth user
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: 'owner',
        },
      },
    });

    if (authError) {
      setError(authError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      // 2. Create tenant
      const { data: tenant, error: tenantError } = await supabase
        .from('tenants')
        .insert({
          owner_id: data.user.id,
          agency_name: agencyName || 'My Agency',
          owner_name: fullName,
          owner_email: email,
        })
        .select()
        .single();

      if (tenantError) {
        setError('Account created but failed to set up agency. Please contact support.');
        setLoading(false);
        return;
      }

      // 3. Update profile with tenant_id
      await supabase
        .from('profiles')
        .update({ tenant_id: tenant.id })
        .eq('id', data.user.id);

      router.push('/');
      router.refresh();
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[var(--accent)] text-white text-xl font-bold mb-4">
            S
          </div>
          <h1 className="text-2xl font-bold text-[var(--foreground)]">Solo Agency OS</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Create your agency account</p>
        </div>

        <form onSubmit={handleSignup} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Your Name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Jane Smith"
              className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Agency Name</label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              required
              placeholder="Smith Digital"
              className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="you@example.com"
              className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className="w-full px-3 py-2.5 text-sm border border-[var(--border)] rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[var(--accent)]/30 focus:border-[var(--accent)]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 text-sm font-medium text-white bg-[var(--accent)] rounded-lg hover:bg-[var(--accent-hover)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating account...' : 'Create Account — $29/mo'}
          </button>

          <p className="text-xs text-center text-[var(--muted)]">
            14-day free trial. No credit card required to start.
          </p>
        </form>

        <p className="text-center text-sm text-[var(--muted)] mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-[var(--accent)] hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
