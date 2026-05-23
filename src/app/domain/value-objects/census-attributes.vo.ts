export class CensusAttributes {
  constructor(
    public readonly totalPopulation: number,
    public readonly malePopulation: number,
    public readonly femalePopulation: number,
    public readonly scPopulation: number,
    public readonly stPopulation: number,
    public readonly households: number
  ) {}

  static fromProperties(props: Record<string, unknown>): CensusAttributes | null {
    const total = Number(props['TOT_P']);
    if (!Number.isFinite(total)) {
      return null;
    }
    return new CensusAttributes(
      total,
      Number(props['TOT_M']) || 0,
      Number(props['TOT_F']) || 0,
      Number(props['P_SC']) || 0,
      Number(props['P_ST']) || 0,
      Number(props['No_HH']) || 0
    );
  }
}
