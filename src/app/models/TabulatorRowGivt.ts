export class TabulatorRowGivt {
  startDate: Date
  endDate: Date
  collectName: string
  collectNumber: number
  position: number
}

export class TabulatorRowGivtWithStatus extends TabulatorRowGivt {
  Status: TabulatorRowStatus
  Error?: TabulatorRowError
}

export enum TabulatorRowStatus {
  Error
}
export enum TabulatorRowError {
  END_IS_HIGHER_THEN_BEGIN, // "The end date cannot be before the given startdate",
  ALLOCATION_ALREADY_EXISTS // "There is already an allocation in the given timeframe"
}