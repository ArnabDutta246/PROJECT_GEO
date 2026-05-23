export class GeoScope {
  constructor(
    public readonly stateId: number,
    public readonly districtId: number,
    public readonly blockId: number
  ) {}

  static all(): GeoScope {
    return new GeoScope(0, 0, 0);
  }
}
