// Types for Studio Pricing Benchmark
export type SupportedLanguage = 'en' | 'de' | 'fr' | 'es' | 'it' | 'pt' | 'nl';
export type Language = SupportedLanguage;

export type RegionId = 'uk' | 'london' | 'us' | 'eu' | 'au' | 'cee' | 'ca' | 'sa' | 'sea';

export type ConfidenceLevel = 'INDICATIVE' | 'GAP';

export type StudioTier = 'apprentice' | 'resident' | 'established' | 'specialist';

export interface StudioRates {
  hourlyRate: string;
  minimumCharge: string;
  shopMinimum: string;
  depositPercent: string;
  tier: StudioTier;
}

export type ServiceCategory = 'tattoo' | 'piercing';

export type ComparisonPosition = 'below' | 'market' | 'premium' | 'none';

export interface BenchmarkRow {
  id: string;
  nameKey: string;
  subKey: string;
  category: ServiceCategory;
  currency: string;
  min: number | null;
  max: number | null;
  confidence: ConfidenceLevel;
  basisKey: string;
  jewelleryNoteKey?: string;
}

export interface RegionMetadata {
  id: RegionId;
  nameKey: string;
  currency: string;
  currencyCode: string;
  symbol: string;
  coverageNoteKey: string;
  jewelleryPolicyKey: string;
}

export interface ComparisonResult {
  serviceId: string;
  userPrice: number | null;
  min: number | null;
  max: number | null;
  position: ComparisonPosition;
  diffPercent: number | null;
}
