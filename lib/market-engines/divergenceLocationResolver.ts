import type {
  DivergenceAnalysis,
} from './divergenceEngine';

import type {
  MarketStructureAnalysis,
} from './marketStructureEngine';

export type DivergenceLocation =
  | 'breakout_high'
  | 'breakdown_low'
  | 'failed_breakout'
  | 'failed_breakdown'
  | 'uptrend_pullback'
  | 'downtrend_pullback'
  | 'range_high'
  | 'range_low'
  | 'middle_of_range'
  | 'unknown';

export interface DivergenceLocationAnalysis {
  location: DivergenceLocation;
  locationMeaningful: boolean;
  reversalQuality: 'high' | 'medium' | 'low' | 'none';
  continuationQuality: 'high' | 'medium' | 'low' | 'none';
  coachNote: string;
}

export function resolveDivergenceLocation(
  divergence: DivergenceAnalysis,
  structure: MarketStructureAnalysis,
): DivergenceLocationAnalysis {
  if (!divergence.divergenceDetected) {
    return {
      location: 'unknown',
      locationMeaningful: false,
      reversalQuality: 'none',
      continuationQuality: 'none',
      coachNote:
        'No divergence detected, so no structural divergence location was assigned.',
    };
  }

  let location: DivergenceLocation = 'unknown';
  let locationMeaningful = false;
  let reversalQuality: DivergenceLocationAnalysis['reversalQuality'] = 'none';
  let continuationQuality: DivergenceLocationAnalysis['continuationQuality'] =
    'none';

  if (
    divergence.divergenceBias === 'bearish_reversal' &&
    structure.structureState === 'breakout'
  ) {
    location = 'breakout_high';
    locationMeaningful = true;
    reversalQuality = 'high';
  }

  if (
    divergence.divergenceBias === 'bullish_reversal' &&
    structure.structureState === 'breakdown'
  ) {
    location = 'breakdown_low';
    locationMeaningful = true;
    reversalQuality = 'high';
  }

  if (
    divergence.divergenceBias === 'bearish_reversal' &&
    structure.structureState === 'failed_breakout'
  ) {
    location = 'failed_breakout';
    locationMeaningful = true;
    reversalQuality = 'high';
  }

  if (
    divergence.divergenceBias === 'bullish_reversal' &&
    structure.structureState === 'failed_breakdown'
  ) {
    location = 'failed_breakdown';
    locationMeaningful = true;
    reversalQuality = 'high';
  }

  if (
    divergence.divergenceBias === 'bullish_continuation' &&
    structure.structureState === 'uptrend'
  ) {
    location = 'uptrend_pullback';
    locationMeaningful = true;
    continuationQuality = 'high';
  }

  if (
    divergence.divergenceBias === 'bearish_continuation' &&
    structure.structureState === 'downtrend'
  ) {
    location = 'downtrend_pullback';
    locationMeaningful = true;
    continuationQuality = 'high';
  }

  if (
    divergence.divergenceBias === 'bearish_reversal' &&
    structure.structureState === 'range'
  ) {
    location = 'range_high';
    locationMeaningful = true;
    reversalQuality = 'medium';
  }

  if (
    divergence.divergenceBias === 'bullish_reversal' &&
    structure.structureState === 'range'
  ) {
    location = 'range_low';
    locationMeaningful = true;
    reversalQuality = 'medium';
  }

  if (!locationMeaningful) {
    location = 'middle_of_range';
    reversalQuality = 'low';
    continuationQuality = 'low';
  }

  let coachNote =
    'Divergence detected, but structural location is not ideal. Treat signal with caution.';

  if (location === 'breakout_high') {
    coachNote =
      'Bearish reversal divergence occurred at a breakout high. This may indicate weakening continuation and possible breakout failure risk.';
  }

  if (location === 'breakdown_low') {
    coachNote =
      'Bullish reversal divergence occurred at a breakdown low. This may indicate weakening downside continuation and possible breakdown failure risk.';
  }

  if (location === 'failed_breakout') {
    coachNote =
      'Bearish reversal divergence occurred during a failed breakout. Reversal quality is elevated.';
  }

  if (location === 'failed_breakdown') {
    coachNote =
      'Bullish reversal divergence occurred during a failed breakdown. Reversal quality is elevated.';
  }

  if (location === 'uptrend_pullback') {
    coachNote =
      'Bullish continuation divergence occurred during an uptrend pullback. Continuation quality is elevated.';
  }

  if (location === 'downtrend_pullback') {
    coachNote =
      'Bearish continuation divergence occurred during a downtrend pullback. Continuation quality is elevated.';
  }

  if (location === 'range_high') {
    coachNote =
      'Bearish reversal divergence occurred near a range high. Reversal quality is moderate.';
  }

  if (location === 'range_low') {
    coachNote =
      'Bullish reversal divergence occurred near a range low. Reversal quality is moderate.';
  }

  return {
    location,
    locationMeaningful,
    reversalQuality,
    continuationQuality,
    coachNote,
  };
}