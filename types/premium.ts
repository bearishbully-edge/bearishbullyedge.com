import { UserTier } from './volume';

export interface PremiumFeature {
  id: string;
  name: string;
  description: string;
  price: '$9.99/month' | '$29.99/month' | '$99.99/month';
  requiredTier: UserTier;
  category: 'analytics' | 'data' | 'tools' | 'support';
  icon: string;
}

export interface SubscriptionTier {
  id: UserTier;
  name: string;
  price: string;
  description: string;
  features: string[];
  popular?: boolean;
}