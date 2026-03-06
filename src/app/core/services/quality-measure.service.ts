import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { QUALITY_MEASURE_ENDPOINTS, buildQualityMeasureUrl } from '../../config/api.config';

export interface PatientHealthOverview {
  patientId: string;
  healthScore?: number;
  riskLevel?: string;
  riskScore?: number;
  careGapCount?: number;
  complianceRate?: number;
  conditions?: any[];
  medications?: any[];
  recentEncounters?: any[];
}

export interface RiskStratification {
  patientId: string;
  riskLevel: string;
  riskScore: number;
  factors?: Array<{ name: string; weight: number; value: any }>;
  calculatedAt?: string;
}

export interface CareGap {
  id: string;
  patientId: string;
  gapType: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  qualityMeasure?: string;
  dueDate?: string;
  detectedAt?: string;
}

export interface CareGapMetrics {
  patientId: string;
  totalGaps: number;
  openGaps: number;
  closedGaps: number;
  overdueGaps: number;
}

@Injectable({ providedIn: 'root' })
export class QualityMeasureService {
  constructor(private http: HttpClient) {}

  getPatientHealthOverview(patientId: string): Observable<PatientHealthOverview> {
    return this.http.get<PatientHealthOverview>(
      buildQualityMeasureUrl(QUALITY_MEASURE_ENDPOINTS.PATIENT_HEALTH_OVERVIEW(patientId))
    );
  }

  getPatientHealthScore(patientId: string): Observable<any> {
    return this.http.get<any>(
      buildQualityMeasureUrl(QUALITY_MEASURE_ENDPOINTS.PATIENT_HEALTH_SCORE(patientId))
    );
  }

  getRiskStratification(patientId: string): Observable<RiskStratification> {
    return this.http.get<RiskStratification>(
      buildQualityMeasureUrl(QUALITY_MEASURE_ENDPOINTS.RISK_STRATIFICATION(patientId))
    );
  }

  calculateRiskStratification(patientId: string): Observable<RiskStratification> {
    return this.http.post<RiskStratification>(
      buildQualityMeasureUrl(QUALITY_MEASURE_ENDPOINTS.RISK_STRATIFICATION_CALCULATE(patientId)), {}
    );
  }

  getCareGaps(patientId: string): Observable<CareGap[]> {
    return this.http.get<CareGap[]>(
      buildQualityMeasureUrl(QUALITY_MEASURE_ENDPOINTS.CARE_GAPS_BY_PATIENT(patientId))
    );
  }

  getCareGapMetrics(patientId: string): Observable<CareGapMetrics> {
    return this.http.get<CareGapMetrics>(
      buildQualityMeasureUrl(QUALITY_MEASURE_ENDPOINTS.CARE_GAP_METRICS(patientId))
    );
  }
}
