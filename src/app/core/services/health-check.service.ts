import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, timer, switchMap, catchError, map, timeout } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';

export interface ServiceHealth {
  name: string;
  url: string;
  status: 'UP' | 'DOWN' | 'UNKNOWN';
  responseTimeMs?: number;
  details?: Record<string, any>;
  lastChecked: string;
}

@Injectable({ providedIn: 'root' })
export class HealthCheckService {
  private readonly services = [
    { name: 'API Gateway', url: '' },
    { name: 'FHIR Server', url: API_CONFIG.FHIR_SERVER_URL },
    { name: 'CQL Engine', url: API_CONFIG.CQL_ENGINE_URL },
    { name: 'Quality Measure', url: API_CONFIG.QUALITY_MEASURE_URL },
    { name: 'Care Gap', url: API_CONFIG.CARE_GAP_URL },
    { name: 'Patient Service', url: API_CONFIG.PATIENT_URL },
    { name: 'Demo Seeder', url: API_CONFIG.DEMO_URL },
  ];

  constructor(private http: HttpClient) {}

  checkService(name: string, baseUrl: string): Observable<ServiceHealth> {
    const healthUrl = baseUrl ? `${baseUrl}/actuator/health` : '/actuator/health';
    const start = performance.now();

    return this.http.get<any>(healthUrl, { observe: 'response' }).pipe(
      timeout(10000),
      map(response => ({
        name,
        url: healthUrl,
        status: (response.body?.status === 'UP' ? 'UP' : 'DOWN') as 'UP' | 'DOWN',
        responseTimeMs: Math.round(performance.now() - start),
        details: response.body,
        lastChecked: new Date().toISOString(),
      })),
      catchError(() => of({
        name,
        url: healthUrl,
        status: 'DOWN' as const,
        responseTimeMs: Math.round(performance.now() - start),
        lastChecked: new Date().toISOString(),
      }))
    );
  }

  checkAllServices(): Observable<ServiceHealth[]> {
    const checks = this.services.map(s => this.checkService(s.name, s.url));
    return new Observable<ServiceHealth[]>(subscriber => {
      const results: ServiceHealth[] = [];
      let completed = 0;
      checks.forEach(check$ => {
        check$.subscribe(result => {
          results.push(result);
          completed++;
          if (completed === checks.length) {
            subscriber.next(results);
            subscriber.complete();
          }
        });
      });
    });
  }

  pollAllServices(intervalMs = 5000): Observable<ServiceHealth[]> {
    return timer(0, intervalMs).pipe(switchMap(() => this.checkAllServices()));
  }
}
