// lib/auth/userLicense.ts

import type { LicenseEntitlement, LicenseTier } from '@/types/license';
import {
  buildEntitlement,
  buildNoAccessEntitlement,
  isLicenseTier,
} from './licenseMatrix';

export type AppUser = {
  id?: string;
  email?: string | null;
  subscription_tier?: string | null;
  license_tier?: string | null;
  subscription_status?: LicenseEntitlement['status'] | null;
};

export function getUserLicense(user?: AppUser | null): LicenseEntitlement {
  if (!user) {
    return buildNoAccessEntitlement();
  }

  const rawTier = user.subscription_tier ?? user.license_tier ?? 'none';
  const tier: LicenseTier = isLicenseTier(rawTier) ? rawTier : 'none';

  const status =
  user.subscription_status ??
  (tier === 'none' ? 'none' : 'inactive');

  return buildEntitlement({
    tier,
    status,
    userId: user.id,
    email: user.email,
  });
}