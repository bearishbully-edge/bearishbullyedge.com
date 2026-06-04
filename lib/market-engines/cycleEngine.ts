export type CyclePhase =
  | 'accumulation'
  | 'early_markup'
  | 'mid_markup'
  | 'late_markup'
  | 'distribution'
  | 'early_markdown'
  | 'mid_markdown'
  | 'late_markdown'
  | 'transition';

export interface CycleInput {
  trendBullish: boolean;
  trendBearish: boolean;

  momentumStrong: boolean;
  momentumWeak: boolean;

  liquidityBullish: boolean;
  liquidityBearish: boolean;

  breakoutDetected: boolean;
  breakdownDetected: boolean;

  reversalWarning: boolean;
}

export interface CycleAnalysis {
  cyclePhase: CyclePhase;

  bullishCycle: boolean;
  bearishCycle: boolean;

  continuationProbability: number;
  reversalProbability: number;

  coachNote: string;
}

export function analyzeCycle(
  input: CycleInput,
): CycleAnalysis {
  let cyclePhase: CyclePhase = 'transition';

  let continuationProbability = 50;
  let reversalProbability = 50;

  let bullishCycle = false;
  let bearishCycle = false;

  if (
    input.trendBullish &&
    !input.breakoutDetected
  ) {
    cyclePhase = 'accumulation';
    bullishCycle = true;
    continuationProbability = 60;
    reversalProbability = 40;
  }

  if (
    input.trendBullish &&
    input.breakoutDetected &&
    input.momentumStrong
  ) {
    cyclePhase = 'early_markup';
    bullishCycle = true;
    continuationProbability = 75;
    reversalProbability = 25;
  }

  if (
    input.trendBullish &&
    input.breakoutDetected &&
    input.momentumStrong &&
    !input.reversalWarning
  ) {
    cyclePhase = 'mid_markup';
    bullishCycle = true;
    continuationProbability = 85;
    reversalProbability = 15;
  }

  if (
    input.trendBullish &&
    input.reversalWarning
  ) {
    cyclePhase = 'late_markup';
    bullishCycle = true;
    continuationProbability = 45;
    reversalProbability = 55;
  }

  if (
    input.trendBearish &&
    !input.breakdownDetected
  ) {
    cyclePhase = 'distribution';
    bearishCycle = true;
    continuationProbability = 60;
    reversalProbability = 40;
  }

  if (
    input.trendBearish &&
    input.breakdownDetected &&
    input.momentumStrong
  ) {
    cyclePhase = 'early_markdown';
    bearishCycle = true;
    continuationProbability = 75;
    reversalProbability = 25;
  }

  if (
    input.trendBearish &&
    input.breakdownDetected &&
    input.momentumStrong &&
    !input.reversalWarning
  ) {
    cyclePhase = 'mid_markdown';
    bearishCycle = true;
    continuationProbability = 85;
    reversalProbability = 15;
  }

  if (
    input.trendBearish &&
    input.reversalWarning
  ) {
    cyclePhase = 'late_markdown';
    bearishCycle = true;
    continuationProbability = 45;
    reversalProbability = 55;
  }

  return {
    cyclePhase,
    bullishCycle,
    bearishCycle,
    continuationProbability,
    reversalProbability,
    coachNote: `Current market cycle: ${cyclePhase}`,
  };
}