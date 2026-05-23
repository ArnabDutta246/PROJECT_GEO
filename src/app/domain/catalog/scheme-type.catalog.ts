/**
 * Canonical scheme-type catalog for ProjectGeo.
 * Single source of truth for labels, Material Icons, and colors used on
 * dashboard sidebar, map pin markers, map quick-filter bar, and project forms.
 */
export interface SchemeTypeDefinition {
  readonly label: string;
  readonly materialIcon: string;
  readonly color: string;
}

export const SCHEME_TYPE_CATALOG: readonly SchemeTypeDefinition[] = [
  {
    label: 'Construction / Civil Work',
    materialIcon: 'construction',
    color: '#004ac6',
  },
  {
    label: 'Plantation',
    materialIcon: 'park',
    color: '#2e7d32',
  },
  {
    label: 'Production System',
    materialIcon: 'precision_manufacturing',
    color: '#6a1b9a',
  },
  {
    label: 'Water Supply',
    materialIcon: 'water_drop',
    color: '#515f74',
  },
  {
    label: 'Sewage / Drainage System',
    materialIcon: 'plumbing',
    color: '#00838f',
  },
  {
    label: 'Waste Management',
    materialIcon: 'recycling',
    color: '#558b2f',
  },
  {
    label: 'Financial Assistance / Loan',
    materialIcon: 'account_balance',
    color: '#1565c0',
  },
  {
    label: 'Transport & Infrastructure',
    materialIcon: 'directions_car',
    color: '#455a64',
  },
  {
    label: 'Skills & Workforce Development',
    materialIcon: 'school',
    color: '#f57c00',
  },
  {
    label: 'Surface Mining',
    materialIcon: 'landscape',
    color: '#795548',
  },
  {
    label: 'Misc. (Create new)',
    materialIcon: 'category',
    color: '#757575',
  },
] as const;

export const SCHEME_TYPE_LABELS: readonly string[] = SCHEME_TYPE_CATALOG.map((item) => item.label);

const catalogByNormalizedLabel = new Map<string, SchemeTypeDefinition>(
  SCHEME_TYPE_CATALOG.map((item) => [normalizeSchemeTypeKey(item.label), item])
);

/** Default definition for unknown or custom scheme types entered in project forms. */
export const DEFAULT_SCHEME_TYPE: SchemeTypeDefinition = {
  label: 'Misc. (Create new)',
  materialIcon: 'category',
  color: '#757575',
};

export function normalizeSchemeTypeKey(value: string): string {
  return value.trim().toLowerCase();
}

export function resolveSchemeType(schemeType: string): SchemeTypeDefinition {
  if (!schemeType.trim()) {
    return DEFAULT_SCHEME_TYPE;
  }

  const exact = catalogByNormalizedLabel.get(normalizeSchemeTypeKey(schemeType));
  if (exact) {
    return exact;
  }

  const normalized = normalizeSchemeTypeKey(schemeType);
  const partial = SCHEME_TYPE_CATALOG.find((item) => {
    const key = normalizeSchemeTypeKey(item.label);
    return normalized.includes(key) || key.includes(normalized);
  });

  return partial ?? DEFAULT_SCHEME_TYPE;
}

export function getSchemeTypeMaterialIcon(schemeType: string): string {
  return resolveSchemeType(schemeType).materialIcon;
}

export function getSchemeTypeColor(schemeType: string): string {
  return resolveSchemeType(schemeType).color;
}

export function getSchemeTypeLabel(schemeType: string): string {
  return resolveSchemeType(schemeType).label;
}

export function isKnownSchemeType(schemeType: string): boolean {
  return catalogByNormalizedLabel.has(normalizeSchemeTypeKey(schemeType));
}

export function matchesSchemeTypeFilter(
  schemeType: string,
  filterLabel: string | null
): boolean {
  if (!filterLabel) {
    return true;
  }
  return resolveSchemeType(schemeType).label === filterLabel;
}
