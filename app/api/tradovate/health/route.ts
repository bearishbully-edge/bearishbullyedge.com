import {
  NextResponse,
} from 'next/server';

import {
  runTradovateHealthCheck,
} from '@/lib/tradovate/healthCheckService';

export async function GET() {
  try {
    const report =
      await runTradovateHealthCheck();

    return NextResponse.json({
      ok: true,
      report,
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error:
          error instanceof Error
            ? error.message
            : 'Unknown error',
      },
      {
        status: 500,
      },
    );
  }
}