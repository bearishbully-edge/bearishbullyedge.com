export type LifecyclePhase =
  | 'fresh'
  | 'active'
  | 'late'
  | 'expired';

export interface LifecycleAnalysis {
  phase: LifecyclePhase;

  barsElapsed: number;

  barsRemaining: number;

  completionPercent: number;
}

export function analyzeLifecycle(
  barsElapsed: number,
  expectedLifeBars: number,
): LifecycleAnalysis {
  const completionPercent =
    Math.min(
      100,
      Math.round(
        (barsElapsed /
          expectedLifeBars) *
          100,
      ),
    );

  let phase: LifecyclePhase =
    'fresh';

  if (
    completionPercent >= 25 &&
    completionPercent < 60
  ) {
    phase = 'active';
  }

  if (
    completionPercent >= 60 &&
    completionPercent < 90
  ) {
    phase = 'late';
  }

  if (
    completionPercent >= 90
  ) {
    phase = 'expired';
  }

  return {
    phase,

    barsElapsed,

    barsRemaining:
      Math.max(
        0,
        expectedLifeBars -
          barsElapsed,
      ),

    completionPercent,
  };
}