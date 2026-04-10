import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { Resend } from 'resend';

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { type, email, clientId } = await request.json();

  if (!type || !email) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  // Get the user's tenant
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, tenant_id')
    .eq('id', user.id)
    .single();

  let tenantId = profile?.tenant_id;
  if (!tenantId && profile?.role === 'owner') {
    const { data: tenant } = await supabase
      .from('tenants')
      .select('id, agency_name')
      .eq('owner_id', user.id)
      .single();
    tenantId = tenant?.id;
  }

  if (!tenantId) {
    return NextResponse.json({ error: 'No tenant found' }, { status: 400 });
  }

  const { data: tenant } = await supabase
    .from('tenants')
    .select('agency_name')
    .eq('id', tenantId)
    .single();

  const token = crypto.randomUUID();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  if (type === 'client' && clientId) {
    // Update client with invite token
    await supabase
      .from('clients')
      .update({ portal_invite_token: token })
      .eq('id', clientId);

    const inviteUrl = `${appUrl}/auth/accept-invite?token=${token}&type=client`;

    // Send email via Resend
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
        to: email,
        subject: `You're invited to ${tenant?.agency_name || 'our'} client portal`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>You've been invited!</h2>
            <p>${tenant?.agency_name || 'Your agency'} has invited you to their client portal where you can view projects, submit requests, and access reports.</p>
            <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">Accept Invite</a>
            <p style="color: #666; font-size: 14px; margin-top: 24px;">If you didn't expect this invite, you can safely ignore this email.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, inviteUrl: `${appUrl}/auth/accept-invite?token=${token}&type=client` });
  }

  if (type === 'freelancer') {
    const inviteUrl = `${appUrl}/auth/accept-invite?token=${token}&type=freelancer`;

    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: process.env.RESEND_FROM_EMAIL || 'noreply@example.com',
        to: email,
        subject: `You're invited to join ${tenant?.agency_name || 'a team'} on Solo Agency OS`,
        html: `
          <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
            <h2>You've been invited!</h2>
            <p>${tenant?.agency_name || 'An agency'} has invited you to join their team as a freelancer.</p>
            <a href="${inviteUrl}" style="display: inline-block; padding: 12px 24px; background: #4F46E5; color: white; text-decoration: none; border-radius: 8px; font-weight: 500;">Accept Invite</a>
            <p style="color: #666; font-size: 14px; margin-top: 24px;">If you didn't expect this invite, you can safely ignore this email.</p>
          </div>
        `,
      });
    }

    return NextResponse.json({ success: true, inviteUrl });
  }

  return NextResponse.json({ error: 'Invalid invite type' }, { status: 400 });
}
