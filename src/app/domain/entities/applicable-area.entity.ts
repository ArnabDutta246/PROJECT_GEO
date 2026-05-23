export class StateOption {
  constructor(
    public readonly id: number,
    public readonly name: string
  ) {}
}

export class DistrictOption {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly stateId: number
  ) {}
}

export class BlockOption {
  constructor(
    public readonly id: number,
    public readonly name: string,
    public readonly districtId: number,
    public readonly stateId: number
  ) {}
}
