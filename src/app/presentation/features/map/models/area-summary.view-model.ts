import { AreaSummary } from '@domain/entities/area-summary.entity';

export class AreaSummaryViewModel {
  constructor(
    public readonly title: string,
    public readonly subtitle: string,
    public readonly stateName: string,
    public readonly districtName: string,
    public readonly blockName: string | null,
    public readonly totalPopulationLabel: string,
    public readonly populationAvailable: boolean,
    public readonly scopeLevel: 'district' | 'block'
  ) {}

  static fromEntity(summary: AreaSummary): AreaSummaryViewModel {
    const stateName = AreaSummaryViewModel.toTitleCase(summary.stateName);
    const districtName = AreaSummaryViewModel.toTitleCase(summary.districtName);
    const blockName = summary.blockName
      ? AreaSummaryViewModel.toTitleCase(summary.blockName)
      : null;

    const title =
      summary.scope.level === 'block' && blockName ? blockName : districtName;
    const subtitle =
      summary.scope.level === 'block' && blockName
        ? `${districtName}, ${stateName}`
        : stateName;

    const totalPopulationLabel = summary.populationAvailable
      ? summary.totalPopulation!.toLocaleString()
      : 'Unavailable';

    return new AreaSummaryViewModel(
      title,
      subtitle,
      stateName,
      districtName,
      blockName,
      totalPopulationLabel,
      summary.populationAvailable,
      summary.scope.level
    );
  }

  private static toTitleCase(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .split(/\s+/)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}
