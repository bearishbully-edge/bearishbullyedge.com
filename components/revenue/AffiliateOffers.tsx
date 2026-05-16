'use client';

import type { EntitlementFeature } from '@/types/license';

type AffiliateOffer = {
  id: string;
  title: string;
  description: string;
  category: 'broker' | 'education' | 'data' | 'tooling';
  requiredFeature: EntitlementFeature;
  href?: string;
  cta: string;
  enabled: boolean;
};

const AFFILIATE_OFFERS: AffiliateOffer[] = [
  {
    id: 'broker-placeholder',
    title: 'Broker Partner',
    description:
      'Broker recommendations are currently being verified before public release.',
    category: 'broker',
    requiredFeature: 'affiliate_offers',
    cta: 'Coming Soon',
    enabled: false,
  },
  {
    id: 'education-placeholder',
    title: 'Advanced Trading Education',
    description:
      'Education offers will only appear after compliance and partner review.',
    category: 'education',
    requiredFeature: 'affiliate_offers',
    cta: 'Coming Soon',
    enabled: false,
  },
];

type AffiliateOffersProps = {
  hasAccess: (feature: EntitlementFeature) => boolean;
};

export default function AffiliateOffers({ hasAccess }: AffiliateOffersProps) {
  const visibleOffers = AFFILIATE_OFFERS.filter(
    (offer) => offer.enabled && hasAccess(offer.requiredFeature),
  );

  if (visibleOffers.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {visibleOffers.map((offer) => (
        <div
          key={offer.id}
          className="bg-gray-800/60 border border-gray-700 rounded-lg p-4"
        >
          <div className="text-white font-semibold mb-2">{offer.title}</div>
          <div className="text-sm text-gray-300 mb-3">{offer.description}</div>

          {offer.href ? (
            <a
              href={offer.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full justify-center bg-yellow-500 text-black py-2 rounded-lg font-semibold hover:bg-yellow-400 transition-colors"
            >
              {offer.cta}
            </a>
          ) : (
            <button
              disabled
              className="w-full bg-gray-700 text-gray-400 py-2 rounded-lg font-semibold cursor-not-allowed"
            >
              {offer.cta}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}