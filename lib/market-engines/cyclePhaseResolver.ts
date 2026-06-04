import type {
  CycleAnalysis,
} from './cycleEngine';

export interface CyclePhaseResolution {
  phaseAge: 'early' | 'middle' | 'late';

  phaseHealthy: boolean;

  exhaustionRisk: boolean;

  transitionRisk: boolean;

  coachNote: string;
}

export function resolveCyclePhase(
  cycle: CycleAnalysis,
): CyclePhaseResolution {
  if (
    cycle.cyclePhase === 'early_markup' ||
    cycle.cyclePhase === 'early_markdown'
  ) {
    return {
      phaseAge: 'early',
      phaseHealthy: true,
      exhaustionRisk: false,
      transitionRisk: false,
      coachNote:
        'Cycle phase is early. Continuation potential remains elevated.',
    };
  }

  if (
    cycle.cyclePhase === 'mid_markup' ||
    cycle.cyclePhase === 'mid_markdown'
  ) {
    return {
      phaseAge: 'middle',
      phaseHealthy: true,
      exhaustionRisk: false,
      transitionRisk: false,
      coachNote:
        'Cycle phase is mature but healthy.',
    };
  }

  if (
    cycle.cyclePhase === 'late_markup' ||
    cycle.cyclePhase === 'late_markdown'
  ) {
    return {
      phaseAge: 'late',
      phaseHealthy: false,
      exhaustionRisk: true,
      transitionRisk: true,
      coachNote:
        'Cycle exhaustion risk increasing.',
    };
  }

  return {
    phaseAge: 'middle',
    phaseHealthy: true,
    exhaustionRisk: false,
    transitionRisk: false,
    coachNote:
      'Cycle phase stable.',
  };
}