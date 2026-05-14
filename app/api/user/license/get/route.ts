// app/api/user/license/get/route.ts
import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies });

  // Get session
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) {
    return NextResponse.json({ license: 'NONE', status: 'no-user' });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('license_tier')
    .eq('id', session.user.id)
    .single();

  return NextResponse.json({
    license: profile?.license_tier || 'NONE',
  });
}
