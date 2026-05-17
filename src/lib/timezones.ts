export interface TimezoneEntry {
  zone: string;
  label: string;
  aliases: string[];
}

const ABBREVIATIONS: Record<string, string> = {
  EST: 'America/New_York',
  EDT: 'America/New_York',
  ET: 'America/New_York',
  CST: 'America/Chicago',
  CDT: 'America/Chicago',
  CT: 'America/Chicago',
  MST: 'America/Denver',
  MDT: 'America/Denver',
  MT: 'America/Denver',
  PST: 'America/Los_Angeles',
  PDT: 'America/Los_Angeles',
  PT: 'America/Los_Angeles',
  AKST: 'America/Anchorage',
  AKDT: 'America/Anchorage',
  HST: 'Pacific/Honolulu',
  HT: 'Pacific/Honolulu',
  AST: 'America/Puerto_Rico',
  WET: 'Europe/London',
  GMT: 'Europe/London',
  BST: 'Europe/London',
  CET: 'Europe/Paris',
  CEST: 'Europe/Paris',
  EET: 'Europe/Helsinki',
  EEST: 'Europe/Helsinki',
  MSK: 'Europe/Moscow',
  GST: 'Asia/Dubai',
  IST: 'Asia/Kolkata',
  PKT: 'Asia/Karachi',
  BDT: 'Asia/Dhaka',
  ICT: 'Asia/Bangkok',
  CST_ASIA: 'Asia/Shanghai',
  AWST: 'Asia/Shanghai',
  JST: 'Asia/Tokyo',
  KST: 'Asia/Seoul',
  AEST: 'Australia/Sydney',
  AEDT: 'Australia/Sydney',
  AET: 'Australia/Sydney',
  ACST: 'Australia/Adelaide',
  ACDT: 'Australia/Adelaide',
  AWST_AUS: 'Australia/Perth',
  NZST: 'Pacific/Auckland',
  NZDT: 'Pacific/Auckland',
  BRST: 'America/Sao_Paulo',
  BRT: 'America/Sao_Paulo',
  ART: 'America/Argentina/Buenos_Aires',
  CLST: 'America/Santiago',
  CLT: 'America/Santiago',
};

function getGMTOffset(zone: string): string {
  try {
    const parts = new Intl.DateTimeFormat('en-GB', {
      timeZone: zone,
      timeZoneName: 'shortOffset',
    }).formatToParts(new Date());
    const off = parts.find((p) => p.type === 'timeZoneName')?.value || '';
    return off;
  } catch {
    return '';
  }
}

function buildAllEntries(): TimezoneEntry[] {
  const ianaZones = Intl.supportedValuesOf?.('timeZone') || ['UTC'];
  const seen = new Set<string>();
  const entries: TimezoneEntry[] = [];

  for (const zone of ianaZones) {
    const offset = getGMTOffset(zone);
    const label = offset ? `${zone} (${offset})` : zone;
    if (!seen.has(zone)) {
      entries.push({ zone, label, aliases: [] });
      seen.add(zone);
    }
  }

  for (const [abbr, zone] of Object.entries(ABBREVIATIONS)) {
    if (!seen.has(abbr) && ianaZones.includes(zone)) {
      const offset = getGMTOffset(zone);
      entries.push({ zone, label: `${abbr} — ${zone} (${offset})`, aliases: [abbr, zone] });
      seen.add(abbr);
    }
  }

  return entries;
}

const ALL_ENTRIES = buildAllEntries();

export function searchTimezones(query: string): TimezoneEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return ALL_ENTRIES;
  return ALL_ENTRIES.filter(
    (e) =>
      e.label.toLowerCase().includes(q) ||
      e.zone.toLowerCase().includes(q) ||
      e.aliases.some((a) => a.toLowerCase().includes(q))
  );
}

export function getTimezoneLabel(zone: string): string {
  const offset = getGMTOffset(zone);
  return offset ? `${zone} (${offset})` : zone;
}
