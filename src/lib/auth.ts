import { createClient } from '@/lib/supabase/server';
import type { Profile, Tenant } from '@/lib/types/database';

export async function getSession() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  return { user, profile: profile as Profile | null };
}

export async function getTenant() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return null;

  // If owner, find tenant by owner_id
  // If freelancer/client, find tenant by tenant_id
  let tenant: Tenant | null = null;
  if (profile.role === 'owner') {
    const { data } = await supabase
      .from('tenants')
      .select('*')
      .eq('owner_id', user.id)
      .single();
    tenant = data as Tenant | null;
  } else if (profile.tenant_id) {
    const { data } = await supabase
      .from('tenants')
      .select('*')
      .eq('id', profile.tenant_id)
      .single();
    tenant = data as Tenant | null;
  }

  return { profile: profile as Profile, tenant };
}

export function isSuperAdmin(email: string | undefined): boolean {
  return !!email && email === process.env.SUPER_ADMIN_EMAIL;
}
