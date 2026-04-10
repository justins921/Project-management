import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function getSupabaseAdmin() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function POST(request: NextRequest) {
  const supabase = getSupabaseAdmin();
  const body = await request.text();
  const sig = request.headers.get('stripe-signature');

  if (!sig || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  // In production, verify the webhook signature using Stripe SDK:
  // const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
  // const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET);

  // For now, parse the event directly
  let event;
  try {
    event = JSON.parse(body);
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const customerId = session.customer;
      const subscriptionId = session.subscription;

      // Find tenant by stripe_customer_id and update subscription
      if (customerId) {
        await supabase
          .from('tenants')
          .update({
            stripe_subscription_id: subscriptionId,
            subscription_status: 'active',
          })
          .eq('stripe_customer_id', customerId);
      }
      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const status = subscription.status; // active, past_due, canceled, etc.

      await supabase
        .from('tenants')
        .update({ subscription_status: status })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      await supabase
        .from('tenants')
        .update({ subscription_status: 'canceled' })
        .eq('stripe_subscription_id', subscription.id);
      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      if (invoice.subscription) {
        await supabase
          .from('tenants')
          .update({ subscription_status: 'past_due' })
          .eq('stripe_subscription_id', invoice.subscription);
      }
      break;
    }
  }

  return NextResponse.json({ received: true });
}
