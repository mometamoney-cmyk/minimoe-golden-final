
export enum ToolType {
  PING = 'ping',
  UUID = 'uuid',
  TIMESTAMP = 'timestamp',
  EMAIL_NORMALIZE = 'emailNormalize',
  PHONE_NORMALIZE = 'phoneNormalize',
  HASH = 'hash',
  URL_SAFETY = 'urlSafety',
  MARKET_SENTIMENT = 'marketSentiment',
  GIFT_ANALYSIS = 'giftAnalysis',
  TREND_SCANNER = 'trendScanner',
  COMPOUND_CALCULATOR = 'compoundCalculator',
  PRICE_CHECK = 'priceCheck',
  STARTUP_GEN = 'startupGen',
  HIRE_TALENT = 'hireTalent',
  LEARN_SKILL = 'learnSkill',
  ARBITRAGE_SCAN = 'arbitrageScan',
  DOMAIN_SNIPER = 'domainSniper',
  CREDIT_HACK = 'creditHack',
  CORP_ARCHITECT = 'corpArchitect',
  IDENTITY_SHIELD = 'identityShield',
  DATA_PURGE = 'dataPurge',
  DUST_ANALYSIS = 'dustAnalysis',
  BILL_NEGOTIATOR = 'billNegotiator',
  CLAIM_RECOVERY = 'claimRecovery',
  DEBT_DESTROYER = 'debtDestroyer',
  LEGACY_TIME_CAPSULE = 'legacyTimeCapsule',
  KEY_SPLIT = 'keySplit',
  SUPPORT_HELPDESK = 'supportHelpdesk',
  TRAVEL_AGENT = 'travelAgent',
  NUTRITION_SCAN = 'nutritionScan',
  TRANSPORT_COMMAND = 'transportCommand',
  BIO_HACK_PRO = 'bioHackPro',
  EVENT_SCOUT = 'eventScout',
  CASINO_ROYALE = 'casinoRoyale',
  COMPANION_MATCH = 'companionMatch',
  AESTHETIC_ARCHITECT = 'aestheticArchitect',
  VIRAL_CONTENT_GEN = 'viralContentGen',
}

// Define which tools require a paid subscription
export const PREMIUM_TOOLS = [
  ToolType.HASH, 
  ToolType.URL_SAFETY, 
  ToolType.PHONE_NORMALIZE, 
  ToolType.TREND_SCANNER, 
  ToolType.COMPOUND_CALCULATOR, 
  ToolType.PRICE_CHECK, 
  ToolType.STARTUP_GEN, 
  ToolType.HIRE_TALENT, 
  ToolType.LEARN_SKILL,
  ToolType.ARBITRAGE_SCAN,
  ToolType.DOMAIN_SNIPER,
  ToolType.CREDIT_HACK,
  ToolType.CORP_ARCHITECT,
  ToolType.IDENTITY_SHIELD,
  ToolType.DATA_PURGE,
  ToolType.DUST_ANALYSIS,
  ToolType.BILL_NEGOTIATOR,
  ToolType.CLAIM_RECOVERY,
  ToolType.DEBT_DESTROYER,
  ToolType.LEGACY_TIME_CAPSULE,
  ToolType.KEY_SPLIT,
  ToolType.TRAVEL_AGENT,
  ToolType.NUTRITION_SCAN,
  ToolType.TRANSPORT_COMMAND,
  ToolType.BIO_HACK_PRO,
  ToolType.EVENT_SCOUT,
  ToolType.CASINO_ROYALE,
  ToolType.COMPANION_MATCH,
  ToolType.AESTHETIC_ARCHITECT,
  ToolType.VIRAL_CONTENT_GEN,
  // Support is free
];

export interface ToolResult {
  tool: ToolType;
  result: unknown;
  originalValue?: string;
  error?: string;
  timestamp: number;
  isPremium?: boolean;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text?: string;
  toolResults?: ToolResult[];
  isThinking?: boolean;
}

export interface SystemStatus {
  subscriptionActive: boolean;
  latency: number;
  uptime: number;
  referralId?: string;
}
