export class AreaAnalytics {
  constructor(
    public readonly scopeLabel: string,
    public readonly populationMalePct: number,
    public readonly populationFemalePct: number,
    public readonly casteBreakdown: ReadonlyArray<{ label: string; value: number }>
  ) {}
}
