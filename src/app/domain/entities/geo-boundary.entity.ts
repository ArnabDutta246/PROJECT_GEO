import { CensusAttributes } from '../value-objects/census-attributes.vo';
import { GeoJsonGeometry } from '../value-objects/geo-json-geometry.vo';

export class GeoBoundary {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly displayName: string,
    public readonly level: 'state' | 'district' | 'block',
    public readonly districtName: string,
    public readonly stateId: string,
    public readonly geometry: GeoJsonGeometry,
    public readonly censusAttributes: CensusAttributes | null,
    public readonly geoJsonRef: string
  ) {}
}
