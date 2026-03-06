import { environment } from '../../environments/environment';

const BASE = environment.apiGatewayUrl;

export const API_CONFIG = {
  API_GATEWAY_URL: BASE,
  CQL_ENGINE_URL: BASE ? `${BASE}/cql-engine` : '/cql-engine',
  QUALITY_MEASURE_URL: BASE ? `${BASE}/quality-measure` : '/quality-measure',
  FHIR_SERVER_URL: BASE ? `${BASE}/fhir` : '/fhir',
  CARE_GAP_URL: BASE ? `${BASE}/care-gap` : '/care-gap',
  PATIENT_URL: BASE ? `${BASE}/patient` : '/patient',
  DEMO_URL: BASE ? `${BASE}/demo` : '/demo',
  COMPLIANCE_URL: BASE ? `${BASE}/api/v1/compliance` : '/api/v1/compliance',
  AUDIT_URL: BASE ? `${BASE}/api/v1/audit` : '/api/v1/audit',
  PROMETHEUS_URL: BASE ? `${BASE}/monitoring/prometheus` : '/monitoring/prometheus',

  DEFAULT_TENANT_ID: environment.tenantId,
  TIMEOUT_MS: 30000,
  RETRY_ATTEMPTS: 3,
};

export const FHIR_ENDPOINTS = {
  PATIENT: '/Patient',
  PATIENT_BY_ID: (id: string) => `/Patient/${id}`,
  OBSERVATION: '/Observation',
  CONDITION: '/Condition',
  ENCOUNTER: '/Encounter',
  MEDICATION: '/MedicationRequest',
  PROCEDURE: '/Procedure',
  IMMUNIZATION: '/Immunization',
};

export const QUALITY_MEASURE_ENDPOINTS = {
  PATIENT_HEALTH_OVERVIEW: (patientId: string) => `/patient-health/overview/${patientId}`,
  PATIENT_HEALTH_SCORE: (patientId: string) => `/patient-health/health-score/${patientId}`,
  RISK_STRATIFICATION: (patientId: string) => `/patient-health/risk-stratification/${patientId}`,
  RISK_STRATIFICATION_CALCULATE: (patientId: string) => `/patient-health/risk-stratification/${patientId}/calculate`,
  CARE_GAPS_BY_PATIENT: (patientId: string) => `/patient-health/care-gaps/${patientId}`,
  CARE_GAP_METRICS: (patientId: string) => `/patient-health/care-gaps/${patientId}/metrics`,
};

export const HTTP_HEADERS = {
  TENANT_ID: 'X-Tenant-ID',
  CONTENT_TYPE: 'Content-Type',
  AUTHORIZATION: 'Authorization',
};

export function buildFhirUrl(endpoint: string, params?: Record<string, string>): string {
  let url = `${API_CONFIG.FHIR_SERVER_URL}${endpoint}`;
  if (params) {
    const qs = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    url += `?${qs}`;
  }
  return url;
}

export function buildQualityMeasureUrl(endpoint: string, params?: Record<string, string>): string {
  let url = `${API_CONFIG.QUALITY_MEASURE_URL}${endpoint}`;
  if (params && Object.keys(params).length > 0) {
    const qs = Object.entries(params)
      .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v)}`)
      .join('&');
    url += `?${qs}`;
  }
  return url;
}
