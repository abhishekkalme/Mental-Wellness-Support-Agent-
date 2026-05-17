export const SUPPORTED_CURRENCIES = [
  'USD',
  'INR',
  'EUR',
  'GBP',
  'CAD',
  'AUD',
  'BRL',
  'JPY',
  'SGD',
  'AED',
  'CHF',
  'CNY',
  'NZD',
  'SEK',
  'NOK',
  'KRW',
  'ZAR',
  'MXN',
  'HKD',
  'SAR',
] as const;

export type SupportedCurrency = (typeof SUPPORTED_CURRENCIES)[number];

export const CURRENCY_MAP: Record<
  SupportedCurrency,
  { symbol: string; name: string; locale: string }
> = {
  USD: { symbol: '$', name: 'US Dollar', locale: 'en-US' },
  INR: { symbol: '₹', name: 'Indian Rupee', locale: 'en-IN' },
  EUR: { symbol: '€', name: 'Euro', locale: 'de-DE' },
  GBP: { symbol: '£', name: 'British Pound', locale: 'en-GB' },
  CAD: { symbol: 'CA$', name: 'Canadian Dollar', locale: 'en-CA' },
  AUD: { symbol: 'A$', name: 'Australian Dollar', locale: 'en-AU' },
  BRL: { symbol: 'R$', name: 'Brazilian Real', locale: 'pt-BR' },
  JPY: { symbol: '¥', name: 'Japanese Yen', locale: 'ja-JP' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar', locale: 'en-SG' },
  AED: { symbol: 'د.إ', name: 'UAE Dirham', locale: 'ar-AE' },
  CHF: { symbol: 'Fr', name: 'Swiss Franc', locale: 'de-CH' },
  CNY: { symbol: '¥', name: 'Chinese Yuan', locale: 'zh-CN' },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar', locale: 'en-NZ' },
  SEK: { symbol: 'kr', name: 'Swedish Krona', locale: 'sv-SE' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone', locale: 'nb-NO' },
  KRW: { symbol: '₩', name: 'South Korean Won', locale: 'ko-KR' },
  ZAR: { symbol: 'R', name: 'South African Rand', locale: 'en-ZA' },
  MXN: { symbol: 'MX$', name: 'Mexican Peso', locale: 'es-MX' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar', locale: 'en-HK' },
  SAR: { symbol: '﷼', name: 'Saudi Riyal', locale: 'ar-SA' },
};

export const CURRENCIES = Object.entries(CURRENCY_MAP).map(([code, info]) => ({
  code: code as SupportedCurrency,
  ...info,
}));

export function getCurrencySymbol(currency?: string): string {
  if (!currency) return '$';
  return CURRENCY_MAP[currency as SupportedCurrency]?.symbol || currency;
}

export function formatPrice(amount: number, currency: SupportedCurrency = 'USD'): string {
  const c = CURRENCY_MAP[currency];
  if (!c) return `$${amount}`;
  try {
    return new Intl.NumberFormat(c.locale, { style: 'currency', currency }).format(amount);
  } catch {
    return `${c.symbol}${amount}`;
  }
}
