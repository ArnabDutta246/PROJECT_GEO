export type GeoScopeLevel = 'district' | 'block';

export class GeoScope {
  constructor(
    public readonly level: GeoScopeLevel,
    public readonly stateName: string,
    public readonly districtName: string,
    public readonly blockName: string | null
  ) {
    if (level === 'block' && !blockName?.trim()) {
      throw new Error('Block scope requires a block name.');
    }
    if (level === 'district' && blockName != null) {
      throw new Error('District scope must not include a block name.');
    }
  }

  static district(stateName: string, districtName: string): GeoScope {
    return new GeoScope('district', stateName, districtName, null);
  }

  static block(stateName: string, districtName: string, blockName: string): GeoScope {
    return new GeoScope('block', stateName, districtName, blockName);
  }
}
