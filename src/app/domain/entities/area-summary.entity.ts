import { GeoScope } from '../value-objects/geo-scope.vo';

export class AreaSummary {
  constructor(
    public readonly scope: GeoScope,
    public readonly stateName: string,
    public readonly districtName: string,
    public readonly blockName: string | null,
    public readonly totalPopulation: number | null,
    public readonly populationAvailable: boolean
  ) {}
}
