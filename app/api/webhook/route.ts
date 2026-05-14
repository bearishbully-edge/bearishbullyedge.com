// app/api/webhook/route.ts
import Stripe from 'stripe';
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const config = {
  api: {
    bodyParser: false,
  },
};

// IMPORTANT
// app/api/webhook/route.ts (top of file)

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string);

async function buffer(readable: any) {
  const chunks = [];
  for await (const chunk of readable) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export async function POST(req: Request) {
  const rawBody = await buffer(req.body);
  const sig = req.headers.get('stripe-signature') as string;

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch (err: any) {
    return new NextResponse(`Webhook Error: ${err.message}`, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE!
  );

  // 🔥 Handle subscription lifecycle
  switch (event.type) {
    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object;

      const userId = subscription.metadata.user_id;
      const priceId = subscription.items.data[0].price.id;

      let tier = 'NONE';

      if (priceId === 'price_terminal_starter') tier = 'EDGE_STARTER';
      if (priceId === 'price_terminal_pro') tier = 'EDGE_PRO';
      if (priceId === 'price_terminal_institutional') tier = 'EDGE_INSTITUTIONAL';
      if (priceId === 'price_signal_trader') tier = 'SIGNAL_TRADER';
      if (priceId === 'price_ultimate') tier = 'ULTIMATE';

      await supabase
        .from('profiles')
        .update({
          license_tier: tier,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId);

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const userId = subscription.metadata.user_id;

      await supabase
        .from('profiles')
        .update({ license_tier: 'NONE' })
        .eq('id', userId);

      break;
    }
  }

  return NextResponse.json({ received: true });
}
