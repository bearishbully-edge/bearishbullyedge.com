import { NextResponse } from 'next/server';
import Stripe from 'stripe';

type CheckoutRequestBody = {
  priceId?: unknown;
};

function getBaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_BASE_URL ||
    process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : 'http://localhost:3000'
  );
}

export async function POST(req: Request) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

    if (!stripeSecretKey) {
      return NextResponse.json(
        {
          ok: false,
          error: 'checkout_unavailable',
          message: 'Stripe checkout is not configured.',
        },
        { status: 503 },
      );
    }

    const body = (await req.json()) as CheckoutRequestBody;
    const priceId = body.priceId;

    if (typeof priceId !== 'string' || priceId.trim().length === 0) {
      return NextResponse.json(
        {
          ok: false,
          error: 'invalid_price_id',
          message: 'A valid Stripe price ID is required.',
        },
        { status: 400 },
      );
    }

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-10-29.clover',
    });

    const baseUrl = getBaseUrl();

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${baseUrl}/dashboard?success=true`,
      cancel_url: `${baseUrl}/pricing?canceled=true`,
    });

    if (!session.url) {
      return NextResponse.json(
        {
          ok: false,
          error: 'checkout_session_missing_url',
          message: 'Stripe did not return a checkout URL.',
        },
        { status: 502 },
      );
    }

    return NextResponse.json({
      ok: true,
      url: session.url,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Unknown checkout error';

    return NextResponse.json(
      {
        ok: false,
        error: 'checkout_failed',
        message,
      },
      { status: 500 },
    );
  }
}