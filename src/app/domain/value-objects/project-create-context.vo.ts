export type ProjectCreateMode = 'create' | 'edit';

export interface ProjectCreateContext {
  mode: ProjectCreateMode;
  stateId: number | null;
  districtId: number | null;
  blockId: number | null;
  projectId: number | null;
}

export const PROJECT_CREATE_CONTEXT_KEY = 'projectCreateContext';

export function parseProjectCreateContext(raw: string | null): ProjectCreateContext | null {
  if (!raw) {
    return null;
  }
  try {
    const parsed = JSON.parse(raw) as Partial<ProjectCreateContext>;
    return {
      mode: parsed.mode === 'edit' ? 'edit' : 'create',
      stateId: parsed.stateId ?? null,
      districtId: parsed.districtId ?? null,
      blockId: parsed.blockId ?? null,
      projectId: parsed.projectId ?? null,
    };
  } catch {
    return null;
  }
}

export function serializeProjectCreateContext(context: ProjectCreateContext): string {
  return JSON.stringify(context);
}
