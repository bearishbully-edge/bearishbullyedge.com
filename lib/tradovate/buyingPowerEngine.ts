export interface BuyingPowerAnalysis {
  buyingPower: number;

  sufficientBuyingPower:
    boolean;

  coachNote: string;
}

export function analyzeBuyingPower(
  buyingPower: number,
  required: number,
): BuyingPowerAnalysis {
  return {
    buyingPower,

    sufficientBuyingPower:
      buyingPower >= required,

    coachNote:
      buyingPower >= required
        ? 'Buying power sufficient.'
        : 'Insufficient buying power.',
  };
}