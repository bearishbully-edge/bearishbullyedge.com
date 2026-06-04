export interface TimeDecayAnalysis {
  ageBars: number;

  freshnessScore: number;

  setupFresh: boolean;

  setupStale: boolean;

  setupExpired: boolean;
}

export function analyzeTimeDecay(
  ageBars: number,
  expectedLifeBars: number,
): TimeDecayAnalysis {
  const ratio =
    ageBars / expectedLifeBars;

  let freshnessScore =
    Math.round((1 - ratio) * 100);

  freshnessScore = Math.max(
    0,
    Math.min(100, freshnessScore),
  );

  return {
    ageBars,

    freshnessScore,

    setupFresh: ratio < 0.33,

    setupStale:
      ratio >= 0.33 &&
      ratio < 0.80,

    setupExpired:
      ratio >= 0.80,
  };
}