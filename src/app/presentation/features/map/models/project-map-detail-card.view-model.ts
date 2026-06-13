import { Project } from '@domain/entities/project.entity';
import { ProjectPin } from '@domain/value-objects/project-pin.vo';
import { Money } from '@domain/value-objects/money.vo';
import { FUND_TYPE_OPTIONS } from '@presentation/features/project/models/project-wizard.view-model';

export const PROJECT_IMAGE_PLACEHOLDER = 'assets/images/project-placeholder.svg';

export type ProjectDetailTabId = 'basic' | 'beneficiaries' | 'documentation' | 'media';

export interface ProjectDetailFieldRow {
  readonly label: string;
  readonly value: string;
  readonly fullWidth?: boolean;
}

export interface ProjectMapDetailTab {
  readonly id: ProjectDetailTabId;
  readonly label: string;
  readonly fields: readonly ProjectDetailFieldRow[];
}

export interface ProjectMapDetailCardViewModel {
  readonly id: string;
  readonly title: string;
  readonly address: string;
  readonly statusLabel: string;
  readonly statusColor: string;
  readonly startDateLabel: string;
  readonly contractor: string;
  readonly thumbnailUrl: string | null;
  readonly galleryUrls: readonly string[];
  readonly documentRefs: readonly string[];
  readonly tabs: readonly ProjectMapDetailTab[];
}

export const PROJECT_DETAIL_TABS: readonly { id: ProjectDetailTabId; label: string }[] = [
  { id: 'basic', label: 'Basic Info' },
  { id: 'beneficiaries', label: 'Beneficiaries' },
  { id: 'documentation', label: 'Documentation' },
  { id: 'media', label: 'Photo/Video' },
] as const;

export function formatProjectStatusLabel(status: string): string {
  const normalized = status.trim().toUpperCase();
  switch (normalized) {
    case 'ACTIVE':
    case 'IN_PROGRESS':
    case 'IN PROGRESS':
      return 'In Progress';
    case 'COMPLETED':
    case 'COMPLETE':
      return 'Completed';
    case 'PENDING':
      return 'Pending';
    case 'APPROVED':
      return 'Approved';
    case 'REJECTED':
      return 'Rejected';
    default:
      if (!normalized) {
        return 'Pending';
      }
      return normalized
        .toLowerCase()
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
  }
}

export function formatProjectStatusColor(status: string): string {
  const normalized = status.trim().toUpperCase();
  switch (normalized) {
    case 'ACTIVE':
    case 'IN_PROGRESS':
    case 'IN PROGRESS':
      return '#004ac6';
    case 'COMPLETED':
    case 'COMPLETE':
      return '#07a456';
    case 'REJECTED':
      return '#ff4b4e';
    case 'APPROVED':
      return '#5141e0';
    default:
      return '#6b7280';
  }
}

function displayValue(value: string | number | null | undefined): string {
  if (value == null) {
    return '—';
  }
  const text = String(value).trim();
  return text || '—';
}

function formatMoneyValue(money: Money | null): string {
  if (!money) {
    return '—';
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: money.currency,
    maximumFractionDigits: 2,
  }).format(money.amount);
}

function formatDateLabel(value: string | null | undefined): string {
  const raw = value?.trim() ?? '';
  if (!raw) {
    return '—';
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }
  return parsed.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

export function formatProjectStartDate(
  plannedStartDate: string,
  actualStartDate: string | null
): string {
  const raw = (actualStartDate?.trim() || plannedStartDate?.trim() || '').trim();
  if (!raw) {
    return '—';
  }
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    return raw;
  }
  return parsed.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function resolveAddress(project: Project): string {
  const location = project.locationName?.trim();
  const landmark = project.nearestLandmark?.trim();
  if (location && landmark) {
    return `${location}, ${landmark}`;
  }
  return location || landmark || 'Location unavailable';
}

function resolveContractor(project: Project): string {
  return (
    project.assignedToUserName?.trim() ||
    project.contactName?.trim() ||
    'Not assigned'
  );
}

function resolveGalleryUrls(project: Project): string[] {
  return project.mediaRefs.filter((url) => !!url?.trim());
}

function resolveFundTypeLabel(fundType: string): string {
  const normalized = fundType.trim();
  if (!normalized) {
    return '—';
  }
  return FUND_TYPE_OPTIONS.find((item) => item.value === normalized)?.label ?? normalized;
}

function fileNameFromRef(ref: string): string {
  const trimmed = ref.trim();
  if (!trimmed) {
    return '—';
  }
  const segments = trimmed.split(/[/\\]/);
  return segments[segments.length - 1] || trimmed;
}

function buildBasicTab(project: Project): ProjectMapDetailTab {
  const state = project.jurisdiction.states[0] ?? '';
  const district = project.jurisdiction.districts[0] ?? '';
  const block = project.jurisdiction.blocks[0] ?? '';

  return {
    id: 'basic',
    label: 'Basic Info',
    fields: [
      { label: 'Project Name', value: displayValue(project.projectName) },
      { label: 'Activity / Scheme', value: displayValue(project.activityName) },
      { label: 'Scheme Type', value: displayValue(project.schemeTypeName || project.schemeType) },
      { label: 'Project Code', value: displayValue(project.projectCode) },
      { label: 'State', value: displayValue(state) },
      { label: 'District', value: displayValue(district) },
      { label: 'Block', value: displayValue(block) },
      { label: 'Location', value: displayValue(project.locationName) },
      { label: 'Nearest Landmark', value: displayValue(project.nearestLandmark) },
      {
        label: 'Coordinates',
        value:
          project.hasMapCoordinates
            ? `${project.coordinates.latitude}, ${project.coordinates.longitude}`
            : '—',
      },
      { label: 'Status', value: formatProjectStatusLabel(project.status) },
      { label: 'Planned Start', value: formatDateLabel(project.plannedStartDate) },
      { label: 'Planned End', value: formatDateLabel(project.plannedEndDate) },
      { label: 'Actual Start', value: formatDateLabel(project.actualStartDate) },
      { label: 'Actual End', value: formatDateLabel(project.actualEndDate) },
      { label: 'Contact Name', value: displayValue(project.contactName) },
      { label: 'Contact Phone', value: displayValue(project.contactNumber) },
      { label: 'Contact Email', value: displayValue(project.contactEmail) },
      { label: 'Assigned Engineer', value: displayValue(project.assignedToUserName || project.assignedToUserId) },
      { label: 'Created On', value: formatDateLabel(project.createdOn) },
      { label: 'Remarks', value: displayValue(project.remarks), fullWidth: true },
    ],
  };
}

function buildBeneficiariesTab(project: Project): ProjectMapDetailTab {
  return {
    id: 'beneficiaries',
    label: 'Beneficiaries',
    fields: [
      { label: 'Beneficiary Name', value: displayValue(project.beneficiaryName) },
      { label: 'Estimated Cost', value: formatMoneyValue(project.estimatedCost) },
      { label: 'Final Cost', value: formatMoneyValue(project.finalCost) },
      {
        label: 'Beneficiary Details',
        value: displayValue(project.beneficiaryDetails),
        fullWidth: true,
      },
    ],
  };
}

function buildDocumentationTab(project: Project): ProjectMapDetailTab {
  const documentNames = project.documentRefs
    .map(fileNameFromRef)
    .filter((name) => name !== '—');
  const documentsValue =
    documentNames.length > 0 ? documentNames.join(', ') : 'No documents uploaded';

  return {
    id: 'documentation',
    label: 'Documentation',
    fields: [
      { label: 'Fund Type', value: resolveFundTypeLabel(project.fundType) },
      {
        label: 'AOI File',
        value: project.aoiFileRef ? fileNameFromRef(project.aoiFileRef) : 'No AOI file uploaded',
      },
      { label: 'Beneficiary Documents', value: documentsValue, fullWidth: true },
      {
        label: 'Plan & Estimation',
        value: documentNames.length > 0 ? `${documentNames.length} file(s)` : 'No files uploaded',
      },
      {
        label: 'Tender Details',
        value: documentNames.length > 0 ? `${documentNames.length} file(s)` : 'No files uploaded',
      },
      {
        label: 'Other Documents',
        value: documentNames.length > 0 ? `${documentNames.length} file(s)` : 'No files uploaded',
      },
    ],
  };
}

function buildMediaTab(): ProjectMapDetailTab {
  return {
    id: 'media',
    label: 'Photo/Video',
    fields: [],
  };
}

function buildPinBasicTab(pin: ProjectPin): ProjectMapDetailTab {
  return {
    id: 'basic',
    label: 'Basic Info',
    fields: [
      { label: 'Project Name', value: displayValue(pin.projectName) },
      { label: 'Activity / Scheme', value: displayValue(pin.activityName) },
      { label: 'Scheme Type', value: displayValue(pin.schemeType) },
      { label: 'District', value: displayValue(pin.districtName) },
      { label: 'Block', value: displayValue(pin.blockName) },
      { label: 'Location', value: displayValue(pin.locationName) },
      {
        label: 'Coordinates',
        value: `${pin.coordinates.latitude}, ${pin.coordinates.longitude}`,
      },
    ],
  };
}

function emptyTab(id: ProjectDetailTabId, label: string): ProjectMapDetailTab {
  return {
    id,
    label,
    fields: [{ label: 'Data', value: 'Not available', fullWidth: true }],
  };
}

export function projectMapDetailCardFromProject(project: Project): ProjectMapDetailCardViewModel {
  const galleryUrls = resolveGalleryUrls(project);

  return {
    id: project.id,
    title: project.projectName || project.activityName || 'Untitled Project',
    address: resolveAddress(project),
    statusLabel: formatProjectStatusLabel(project.status),
    statusColor: formatProjectStatusColor(project.status),
    startDateLabel: formatProjectStartDate(project.plannedStartDate, project.actualStartDate),
    contractor: resolveContractor(project),
    thumbnailUrl: galleryUrls[0] ?? null,
    galleryUrls,
    documentRefs: project.documentRefs,
    tabs: [
      buildBasicTab(project),
      buildBeneficiariesTab(project),
      buildDocumentationTab(project),
      buildMediaTab(),
    ],
  };
}

export function projectMapDetailCardFromPin(pin: ProjectPin): ProjectMapDetailCardViewModel {
  const location = pin.locationName?.trim() || 'Location unavailable';

  return {
    id: pin.id,
    title: pin.projectName || pin.activityName || 'Untitled Project',
    address: location,
    statusLabel: 'Pending',
    statusColor: '#6b7280',
    startDateLabel: '—',
    contractor: 'Not assigned',
    thumbnailUrl: null,
    galleryUrls: [],
    documentRefs: [],
    tabs: [
      buildPinBasicTab(pin),
      emptyTab('beneficiaries', 'Beneficiaries'),
      emptyTab('documentation', 'Documentation'),
      buildMediaTab(),
    ],
  };
}
