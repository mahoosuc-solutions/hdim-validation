import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG, FHIR_ENDPOINTS, buildFhirUrl } from '../../config/api.config';

export interface FhirBundle {
  resourceType: 'Bundle';
  type: string;
  total?: number;
  entry?: Array<{ resource: any; fullUrl?: string }>;
}

@Injectable({ providedIn: 'root' })
export class FhirService {
  constructor(private http: HttpClient) {}

  getPatients(count = 50): Observable<FhirBundle> {
    return this.http.get<FhirBundle>(buildFhirUrl(FHIR_ENDPOINTS.PATIENT, { _count: String(count) }));
  }

  getPatientById(id: string): Observable<any> {
    return this.http.get<any>(buildFhirUrl(FHIR_ENDPOINTS.PATIENT_BY_ID(id)));
  }

  searchPatientByMrn(mrn: string): Observable<FhirBundle> {
    return this.http.get<FhirBundle>(buildFhirUrl(FHIR_ENDPOINTS.PATIENT, { identifier: mrn }));
  }

  getConditions(patientId: string): Observable<FhirBundle> {
    return this.http.get<FhirBundle>(buildFhirUrl(FHIR_ENDPOINTS.CONDITION, { patient: patientId }));
  }

  getObservations(patientId: string, code?: string): Observable<FhirBundle> {
    const params: Record<string, string> = { patient: patientId, _sort: '-date', _count: '20' };
    if (code) params['code'] = code;
    return this.http.get<FhirBundle>(buildFhirUrl(FHIR_ENDPOINTS.OBSERVATION, params));
  }

  getEncounters(patientId: string): Observable<FhirBundle> {
    return this.http.get<FhirBundle>(buildFhirUrl(FHIR_ENDPOINTS.ENCOUNTER, { patient: patientId, _sort: '-date' }));
  }

  getMedications(patientId: string): Observable<FhirBundle> {
    return this.http.get<FhirBundle>(buildFhirUrl(FHIR_ENDPOINTS.MEDICATION, { patient: patientId }));
  }

  getImmunizations(patientId: string): Observable<FhirBundle> {
    return this.http.get<FhirBundle>(buildFhirUrl(FHIR_ENDPOINTS.IMMUNIZATION, { patient: patientId }));
  }

  getPatientEverything(patientId: string): Observable<FhirBundle> {
    return this.http.get<FhirBundle>(`${API_CONFIG.FHIR_SERVER_URL}/Patient/${patientId}/$everything`);
  }

  getResourceCount(resourceType: string): Observable<number> {
    return this.http.get<FhirBundle>(`${API_CONFIG.FHIR_SERVER_URL}/${resourceType}?_summary=count`).pipe(
      map(bundle => bundle.total || 0)
    );
  }
}
