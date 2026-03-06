export interface Patient {
  id: string;
  name: string;
  mrn?: string;
  birthDate?: string;
  gender?: string;
  conditions?: string[];
}

export interface Phenotype {
  id: string;
  mrn?: string;
  name: string;
  bundle: string;
  expected: PhenotypeExpected;
}

export interface PhenotypeExpected {
  careGaps?: number;
  careGapTypes?: string[];
  hba1c?: { value: number; unit: string };
  riskScore?: string;
  healthScore?: string;
  activeConditions?: string[];
  cqlCompliant?: string[];
  cqlNonCompliant?: string[];
  medicationCount?: number;
  conditionCount?: number;
  recentEncounters?: boolean;
  immunizationsCurrent?: boolean;
}

export interface ValidationResult {
  field: string;
  expected: string;
  actual: string;
  passed: boolean;
}

export interface PhenotypeValidation {
  phenotype: Phenotype;
  results: ValidationResult[];
  overallPassed: boolean;
  timestamp: string;
}
