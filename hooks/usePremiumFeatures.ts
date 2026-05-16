// hooks/usePremiumFeatures.ts

'use client';

import { useCallback, useEffect, useState } from 'react';
import type {
  EntitlementFeature,
  LicenseApiResponse,
  LicenseEntitlement,
} from '@/types/license';
import { buildNoAccessEntitlement } from '@/lib/auth/licenseMatrix';

type PremiumFeatureState = {
  entitlement: LicenseEntitlement;
  loading: boolean;
  error: string | null;
  hasAccess: (feature: EntitlementFeature) => boolean;
  refresh: () => Promise<void>;
};

export function usePremiumFeatures(): PremiumFeatureState {
  const [entitlement, setEntitlement] = useState<LicenseEntitlement>(
    buildNoAccessEntitlement(),
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadEntitlement = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/user/license/get', {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
        cache: 'no-store',
      });

      const payload = (await response.json()) as LicenseApiResponse;

      if (!response.ok || !payload.ok) {
        setEntitlement(buildNoAccessEntitlement());
        setError(payload.error ?? 'Unable to verify premium access.');
        return;
      }

      setEntitlement(payload.entitlement);
    } catch {
      setEntitlement(buildNoAccessEntitlement());
      setError('Unable to verify premium access.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEntitlement();
  }, [loadEntitlement]);

  const hasAccess = useCallback(
    (feature: EntitlementFeature): boolean => {
      if (entitlement.status !== 'active') return false;
      return entitlement.features.includes(feature);
    },
    [entitlement],
  );

  return {
    entitlement,
    loading,
    error,
    hasAccess,
    refresh: loadEntitlement,
  };
}