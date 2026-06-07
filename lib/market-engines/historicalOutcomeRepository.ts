import type {
  HistoricalOutcome,
} from './historicalProbabilityEngine';

export interface TradeContextOutcomeRecord {
  id: string;
  contextFingerprint: string;
  symbol: string;
  timeframe: string;
  tradeSide: 'long' | 'short';
  won: boolean;
  pnlR: number;
  createdAt: string;
}

const historicalOutcomeRecords: TradeContextOutcomeRecord[] = [];

export function saveTradeContextOutcome(
  record: Omit<TradeContextOutcomeRecord, 'id' | 'createdAt'>,
): TradeContextOutcomeRecord {
  const savedRecord: TradeContextOutcomeRecord = {
    ...record,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
  };

  historicalOutcomeRecords.push(savedRecord);

  return savedRecord;
}

export function getTradeContextOutcomes(
  contextFingerprint: string,
): TradeContextOutcomeRecord[] {
  return historicalOutcomeRecords.filter(
    (record) =>
      record.contextFingerprint === contextFingerprint,
  );
}

export function buildHistoricalOutcomeFromRecords(
  contextFingerprint: string,
): HistoricalOutcome | null {
  const records =
    getTradeContextOutcomes(contextFingerprint);

  if (records.length === 0) {
    return null;
  }

  const wins = records.filter(
    (record) => record.won,
  );

  const losses = records.filter(
    (record) => !record.won,
  );

  const averageWinner =
    wins.length === 0
      ? 0
      : wins.reduce(
          (sum, record) => sum + Math.abs(record.pnlR),
          0,
        ) / wins.length;

  const averageLoser =
    losses.length === 0
      ? 0
      : losses.reduce(
          (sum, record) => sum + Math.abs(record.pnlR),
          0,
        ) / losses.length;

  return {
    contextKey: contextFingerprint,
    wins: wins.length,
    losses: losses.length,
    averageWinner,
    averageLoser,
  };
}

export function getAllTradeContextOutcomes() {
  return historicalOutcomeRecords;
}