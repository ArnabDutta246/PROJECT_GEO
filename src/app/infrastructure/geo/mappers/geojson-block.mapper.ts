import { GeoBoundary } from '@domain/entities/geo-boundary.entity';
import { CensusAttributes } from '@domain/value-objects/census-attributes.vo';
import { GeoJsonGeometry } from '@domain/value-objects/geo-json-geometry.vo';
import { normalizeGeoName } from '@infrastructure/http/mappers/jurisdiction.mapper';

const BLOCK_GEOJSON_REF = '/geojson/ARUNACHAL_PRADESH_BLOCK.geojson';

interface RawGeoFeature {
  type: string;
  properties: Record<string, unknown>;
  geometry: GeoJsonGeometry;
}

interface RawFeatureCollection {
  type: string;
  features: RawGeoFeature[];
}

export function mapFeatureCollection(raw: RawFeatureCollection): GeoBoundary[] {
  return raw.features.map(mapFeature);
}

function mapFeature(feature: RawGeoFeature): GeoBoundary {
  const props = feature.properties;
  const id = String(props['CENSUS_COD'] ?? props['OBJECTID'] ?? props['Mouza Name']);
  const name = String(props['Mouza Name'] ?? props['NAME'] ?? '');
  const displayName = String(props['NAME'] ?? name);
  const districtName = String(props['DISTRICT_N'] ?? '');
  const stateId = String(props['SID'] ?? '12');

  return new GeoBoundary(
    id,
    name,
    displayName,
    'block',
    districtName,
    stateId,
    feature.geometry,
    CensusAttributes.fromProperties(props),
    BLOCK_GEOJSON_REF
  );
}

export function filterBlocksByDistrict(
  blocks: GeoBoundary[],
  districtName: string | null | undefined
): GeoBoundary[] {
  if (!districtName) {
    return blocks;
  }
  const target = normalizeGeoName(districtName);
  return blocks.filter((block) => normalizeGeoName(block.districtName) === target);
}

export function filterBlocksByDistrictAndBlock(
  blocks: GeoBoundary[],
  districtName: string | null | undefined,
  blockName: string | null | undefined
): GeoBoundary[] {
  let filtered = filterBlocksByDistrict(blocks, districtName);
  if (blockName) {
    const target = normalizeGeoName(blockName);
    filtered = filtered.filter((block) => normalizeGeoName(block.name) === target);
  }
  return filtered;
}
