export interface ProjectTypeDefinition {
  readonly label: string;
  readonly apiCode: string;
}

export const PROJECT_TYPE_CATALOG: readonly ProjectTypeDefinition[] = [
  { label: 'MGNRGA', apiCode: 'GPT_01' },
  { label: 'FOREST & HORTICULTURE', apiCode: 'GPT_02' },
  { label: 'AGRI-IRRIGATION', apiCode: 'GPT_03' },
  { label: 'PHED', apiCode: 'GPT_04' },
  { label: 'PMGSY', apiCode: 'GPT_05' },
  { label: 'PMKSY', apiCode: 'GPT_06' },
  { label: 'MINISTRY OF MINES', apiCode: 'GPT_07' },
  { label: 'URBAN PLANNING', apiCode: 'GPT_08' },
  { label: 'RURAL PLANNING', apiCode: 'GPT_09' },
  { label: 'PMAY', apiCode: 'GPT_10' },
  { label: 'MSME', apiCode: 'GPT_11' },
  { label: 'MISC. (Create new)', apiCode: 'GPT_99' },
] as const;

const catalogByLabel = new Map<string, ProjectTypeDefinition>(
  PROJECT_TYPE_CATALOG.map((item) => [normalizeProjectTypeKey(item.label), item])
);

export const DEFAULT_PROJECT_TYPE: ProjectTypeDefinition = {
  label: 'MISC. (Create new)',
  apiCode: 'GPT_99',
};

export function normalizeProjectTypeKey(value: string): string {
  return value.trim().toUpperCase();
}

export function resolveProjectType(label: string): ProjectTypeDefinition {
  if (!label.trim()) {
    return DEFAULT_PROJECT_TYPE;
  }
  return catalogByLabel.get(normalizeProjectTypeKey(label)) ?? DEFAULT_PROJECT_TYPE;
}

export function resolveProjectTypeApiCode(label: string, customName?: string): string {
  const resolved = resolveProjectType(label);
  if (resolved.apiCode === 'GPT_99' && customName?.trim()) {
    return 'GPT_99';
  }
  return resolved.apiCode;
}
