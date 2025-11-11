// utils/validateVolumeBar.ts
// Strict validation schema for volume bar data

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  data?: VolumeBarInput;
}

export interface VolumeBarInput {
  symbol: string;
  related_symbol?: string;
  bar_time: string;
  open_volume: number;
  close_volume: number;
  delta_volume: number;
  timeframe: string;
  source: string;
}

const VALID_TIMEFRAMES = ['1m', '5m', '15m', '30m', '1h', '4h', '1d'];
const VALID_SYMBOLS = ['MNQ', 'NQ', 'ES', 'MES', 'YM', 'MYM', 'RTY', 'M2K'];
const VALID_SOURCES = ['NinjaTrader', 'Rithmic', 'CQG', 'Manual'];

/**
 * Validates volume bar data before database insertion
 * @param data - The volume bar data to validate
 * @returns ValidationResult with errors if invalid
 */
export function validateVolumeBar(data: any): ValidationResult {
  const errors: string[] = [];

  // Required fields check
  if (!data || typeof data !== 'object') {
    return { valid: false, errors: ['Request body must be a valid object'] };
  }

  // Symbol validation
  if (!data.symbol || typeof data.symbol !== 'string') {
    errors.push('symbol is required and must be a string');
  } else if (!VALID_SYMBOLS.includes(data.symbol.toUpperCase())) {
    errors.push(`symbol must be one of: ${VALID_SYMBOLS.join(', ')}`);
  }

  // Bar time validation (must be valid ISO 8601 timestamp)
  if (!data.bar_time || typeof data.bar_time !== 'string') {
    errors.push('bar_time is required and must be an ISO 8601 timestamp string');
  } else {
    const timestamp = new Date(data.bar_time);
    if (isNaN(timestamp.getTime())) {
      errors.push('bar_time must be a valid ISO 8601 timestamp (e.g., 2025-01-15T14:30:00Z)');
    }
    // Check if timestamp is not in the future (with 5min tolerance)
    const fiveMinutesFromNow = new Date(Date.now() + 5 * 60 * 1000);
    if (timestamp > fiveMinutesFromNow) {
      errors.push('bar_time cannot be more than 5 minutes in the future');
    }
  }

  // Volume validations
  if (typeof data.open_volume !== 'number') {
    errors.push('open_volume is required and must be a number');
  } else if (data.open_volume < 0) {
    errors.push('open_volume must be >= 0');
  }

  if (typeof data.close_volume !== 'number') {
    errors.push('close_volume is required and must be a number');
  } else if (data.close_volume < 0) {
    errors.push('close_volume must be >= 0');
  }

  if (typeof data.delta_volume !== 'number') {
    errors.push('delta_volume is required and must be a number');
  } else {
    // Verify delta calculation
    if (typeof data.open_volume === 'number' && typeof data.close_volume === 'number') {
      const expectedDelta = data.open_volume - data.close_volume;
      const tolerance = 0.01; // Allow small floating point differences
      if (Math.abs(data.delta_volume - expectedDelta) > tolerance) {
        errors.push(
          `delta_volume (${data.delta_volume}) does not match open_volume - close_volume (${expectedDelta})`
        );
      }
    }
  }

  // Timeframe validation
  if (!data.timeframe || typeof data.timeframe !== 'string') {
    errors.push('timeframe is required and must be a string');
  } else if (!VALID_TIMEFRAMES.includes(data.timeframe.toLowerCase())) {
    errors.push(`timeframe must be one of: ${VALID_TIMEFRAMES.join(', ')}`);
  }

  // Source validation
  if (!data.source || typeof data.source !== 'string') {
    errors.push('source is required and must be a string');
  } else if (!VALID_SOURCES.includes(data.source)) {
    errors.push(`source must be one of: ${VALID_SOURCES.join(', ')}`);
  }

  // Optional fields validation
  if (data.related_symbol !== undefined && typeof data.related_symbol !== 'string') {
    errors.push('related_symbol must be a string if provided');
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  // Return normalized data
  return {
    valid: true,
    errors: [],
    data: {
      symbol: data.symbol.toUpperCase(),
      related_symbol: data.related_symbol?.toUpperCase() || 'QQQ',
      bar_time: data.bar_time,
      open_volume: Number(data.open_volume),
      close_volume: Number(data.close_volume),
      delta_volume: Number(data.delta_volume),
      timeframe: data.timeframe.toLowerCase(),
      source: data.source
    }
  };
}

/**
 * Validates an array of volume bars (batch insert)
 */
export function validateVolumeBarBatch(dataArray: any[]): ValidationResult {
  if (!Array.isArray(dataArray)) {
    return { valid: false, errors: ['Request body must be an array of volume bars'] };
  }

  if (dataArray.length === 0) {
    return { valid: false, errors: ['Array cannot be empty'] };
  }

  if (dataArray.length > 100) {
    return { valid: false, errors: ['Batch size cannot exceed 100 bars'] };
  }

  const allErrors: string[] = [];
  const validBars: VolumeBarInput[] = [];

  dataArray.forEach((item, index) => {
    const result = validateVolumeBar(item);
    if (!result.valid) {
      allErrors.push(`Bar ${index}: ${result.errors.join(', ')}`);
    } else if (result.data) {
      validBars.push(result.data);
    }
  });

  if (allErrors.length > 0) {
    return { valid: false, errors: allErrors };
  }

  return { valid: true, errors: [], data: validBars as any };
}
