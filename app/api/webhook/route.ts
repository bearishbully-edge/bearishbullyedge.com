// app/api/webhook/route.ts

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import Stripe from 'stripe';

export const dynamic = 'force-dynamic';

type StripeSubscription = Stripe.Subscription & {
  metadata: {
    user_id?: string;
  };
};

function getLicenseTierFromPrice(priceId: string): string {
  if (priceId === 'price_terminal_starter') return 'edge_starter';
  if (priceId === 'price_terminal_pro') return 'edge_pro';
  if (priceId === 'price_terminal_institutional') return 'edge_institutional';
  if (priceId === 'price_signal_trader') return 'signal_trader';
  if (priceId === 'price_ultimate') return 'ultimate';

  return 'none';
}

function getServerEnv() {
  return {
    stripeSecretKey: process.env.STRIPE_SECRET_KEY,
    stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
    supabaseServiceRoleKey:
      process.env.SUPABASE_SERVICE_ROLE_KEY ||
      process.env.SUPABASE_SERVICE_ROLE,
  };
}

export async function POST(req: Request) {
  const {
    stripeSecretKey,
    stripeWebhookSecret,
    supabaseUrl,
    supabaseServiceRoleKey,
  } = getServerEnv();

  if (
    !stripeSecretKey ||
    !stripeWebhookSecret ||
    !supabaseUrl ||
    !supabaseServiceRoleKey
  ) {
    return NextResponse.json(
      {
        ok: false,
        error: 'webhook_not_configured',
        message: 'Webhook environment variables are not configured.',
      },
      { status: 503 },
    );
  }

  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      {
        ok: false,
        error: 'missing_stripe_signature',
      },
      { status: 400 },
    );
  }

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2025-10-29.clover',
  });

  const rawBody = await req.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      stripeWebhookSecret,
    );
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Invalid webhook signature';

    return NextResponse.json(
      {
        ok: false,
        error: 'invalid_webhook_signature',
        message,
      },
      { status: 400 },
    );
  }

  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object as StripeSubscription;
      const userId = subscription.metadata.user_id;
      const priceId = subscription.items.data[0]?.price.id;

      if (!userId || !priceId) {
        return NextResponse.json(
          {
            ok: false,
            error: 'missing_subscription_metadata',
          },
          { status: 400 },
        );
      }

      const tier = getLicenseTierFromPrice(priceId);

      const { error } = await supabase
        .from('profiles')
        .update({
          license_tier: tier,
          subscription_status: subscription.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        return NextResponse.json(
          {
            ok: false,
            error: 'supabase_update_failed',
            message: error.message,
          },
          { status: 500 },
        );
      }

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object as StripeSubscription;
      const userId = subscription.metadata.user_id;

      if (!userId) {
        return NextResponse.json(
          {
            ok: false,
            error: 'missing_subscription_metadata',
          },
          { status: 400 },
        );
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          license_tier: 'none',
          subscription_status: 'cancelled',
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      if (error) {
        return NextResponse.json(
          {
            ok: false,
            error: 'supabase_update_failed',
            message: error.message,
          },
          { status: 500 },
        );
      }

      break;
    }

    default:
      break;
  }

  return NextResponse.json({
    ok: true,
    received: true,
  });
}