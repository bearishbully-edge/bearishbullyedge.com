export interface AffiliateOffer {
  id: string;
  title: string;
  description: string;
  cta: string;
  url: string;
  commission: string;
  category: 'broker' | 'education' | 'tool' | 'signal';
  priority: number;
  image?: string;
  badge?: string;
}