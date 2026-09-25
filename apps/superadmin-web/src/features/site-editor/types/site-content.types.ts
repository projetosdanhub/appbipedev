export interface AnnouncementConfig {
  enabled: boolean;
  badge: string;
  text: string;
  linkText: string;
  linkUrl: string;
}

export interface HeroStat {
  label: string;
  value: string;
}

export interface HeroConfig {
  badge: string;
  titleLine1: string;
  titleHighlight: string;
  titleLine2: string;
  subtitle: string;
  primaryCtaText: string;
  primaryCtaLink: string;
  secondaryCtaText: string;
  secondaryCtaLink: string;
  stats: HeroStat[];
  mockupBadge: string;
  mockupStatus: string;
}

export interface ClientLogo {
  name: string;
  category: string;
}

export interface SocialProofLogosConfig {
  badge: string;
  companiesCount: string;
  title: string;
  logos: ClientLogo[];
}

export interface ComparisonItem {
  withoutBipe: string;
  withBipe: string;
}

export interface ComparisonConfig {
  badge: string;
  title: string;
  subtitle: string;
  withoutTitle: string;
  withTitle: string;
  items: ComparisonItem[];
}

export interface FeatureItem {
  id: string;
  badge: string;
  title: string;
  description: string;
  benefits: string[];
  icon: "bot" | "mic" | "message-square" | "shield" | "zap" | "layers";
  accentColor: "blue" | "violet" | "emerald" | "amber";
}

export interface FeaturesConfig {
  badge: string;
  title: string;
  subtitle: string;
  items: FeatureItem[];
}

export interface VoiceDemoConfig {
  badge: string;
  title: string;
  subtitle: string;
  sampleText: string;
  humanVoiceTitle: string;
  humanVoiceDescription: string;
  robotVoiceTitle: string;
  robotVoiceDescription: string;
}

export interface RoiCalculatorConfig {
  badge: string;
  title: string;
  subtitle: string;
  costPerHumanAgentMonth: number;
  avgLeadValue: number;
}

export interface PricingSectionConfig {
  badge: string;
  title: string;
  subtitle: string;
  yearlyDiscountBadge: string;
  guaranteeTitle: string;
  guaranteeDescription: string;
}

export interface TestimonialItem {
  id: string;
  name: string;
  role: string;
  company: string;
  segment?: string;
  avatarUrl: string;
  metric: string;
  quote: string;
  stars: number;
}

export interface TestimonialsConfig {
  badge: string;
  title: string;
  subtitle: string;
  items: TestimonialItem[];
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
}

export interface FaqConfig {
  badge: string;
  title: string;
  subtitle: string;
  items: FaqItem[];
}

export interface FinalCtaConfig {
  badge: string;
  title: string;
  subtitle: string;
  ctaButtonText: string;
  ctaButtonLink: string;
  guaranteeBadge: string;
}

export interface SocialLink {
  platform: "instagram" | "whatsapp" | "linkedin" | "youtube" | "tiktok";
  url: string;
  label: string;
}

export interface FooterConfig {
  tagline: string;
  supportEmail: string;
  copyright: string;
  socialLinks?: SocialLink[];
}

export interface AboutPillar {
  title: string;
  description: string;
  icon?: string;
}

export interface AboutUsConfig {
  badge: string;
  title: string;
  subtitle: string;
  story: string;
  founderName: string;
  founderRole: string;
  founderPhotoUrl: string;
  founderQuote: string;
  pillars: AboutPillar[];
  stats: Array<{ label: string; value: string }>;
}

export interface BacklinkItem {
  id: string;
  title: string;
  url: string;
  rel?: string;
}

export interface DomainSeoConfig {
  domain: string;
  tabTitle: string;
  metaDescription: string;
  keywords?: string[];
}

export interface SeoConfig {
  metaTitle: string;
  metaDescription: string;
  keywords: string[];
  canonicalUrl: string;
  ogImage: string;
  domains?: {
    landing?: DomainSeoConfig;
    app?: DomainSeoConfig;
    admin?: DomainSeoConfig;
  };
  backlinks: BacklinkItem[];
}

export interface SiteContent {
  announcement: AnnouncementConfig;
  hero: HeroConfig;
  socialProof: SocialProofLogosConfig;
  comparison: ComparisonConfig;
  features: FeaturesConfig;
  voiceDemo: VoiceDemoConfig;
  roiCalculator: RoiCalculatorConfig;
  pricing: PricingSectionConfig;
  testimonials: TestimonialsConfig;
  aboutUs: AboutUsConfig;
  faq: FaqConfig;
  finalCta: FinalCtaConfig;
  footer: FooterConfig;
  seo: SeoConfig;
}

export interface LandingPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  annualFreeMonths?: number;
  isActive: boolean;
  isPopular?: boolean;
  showOnLandingPage?: boolean;
  badge?: string;
  colorScheme: "blue" | "emerald" | "violet" | "amber" | "rose" | "cyan" | "indigo";
  limits: {
    contacts: number;
    crmPipelines?: number;
    aiAgents: number;
    whatsappConnections: number;
    instagramConnections: number;
    tiktokConnections?: number;
    automations?: number;
    transparentCheckout?: boolean;
    teamMembers: number;
    monthlyAiMessages: number;
  };
  features: string[];
}
