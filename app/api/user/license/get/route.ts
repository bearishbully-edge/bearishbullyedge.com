// app/api/user/license/get/route.ts

import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import type { LicenseApiResponse } from '@/types/license';
import { buildNoAccessEntitlement, isLicenseTier } from '@/lib/auth/licenseMatrix';
import { getUserLicense } from '@/lib/auth/userLicense';

export const dynamic = 'force-dynamic';

type ProfileRow = {
  id: string;
  email?: string | null;
  license_tier?: string | null;
  subscription_tier?: string | null;
  subscription_status?: 'none' | 'active' | 'inactive' | 'past_due' | 'cancelled' | null;
};

export async function GET(): Promise<NextResponse<LicenseApiResponse>> {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError || !session?.user) {
      return NextResponse.json({
        ok: true,
        entitlement: buildNoAccessEntitlement(),
      });
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id,email,license_tier,subscription_tier,subscription_status')
      .eq('id', session.user.id)
      .maybeSingle<ProfileRow>();

    if (profileError) {
      return NextResponse.json(
        {
          ok: false,
          entitlement: buildNoAccessEntitlement(),
          error: 'Failed to load user entitlement.',
        },
        { status: 500 },
      );
    }

    const tierCandidate =
      profile?.subscription_tier ??
      profile?.license_tier ??
      'none';

    const entitlement = getUserLicense({
      id: session.user.id,
      email: profile?.email ?? session.user.email ?? null,
      subscription_tier: isLicenseTier(tierCandidate) ? tierCandidate : 'none',
      subscription_status: profile?.subscription_status ?? null,
    });

    return NextResponse.json({
      ok: true,
      entitlement,
    });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        entitlement: buildNoAccessEntitlement(),
        error: 'Unexpected entitlement service failure.',
      },
      { status: 500 },
    );
  }
}