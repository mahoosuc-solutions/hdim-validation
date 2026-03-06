import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { API_CONFIG } from '../../config/api.config';

export interface PrometheusResult {
  metric: Record<string, string>;
  value: [number, string];
}

export interface PerformanceMetrics {
  p50LatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  requestsPerSecond: number;
  errorRate: number;
  activeConnections: number;
}

@Injectable({ providedIn: 'root' })
export class PerformanceService {
  private readonly baseUrl = API_CONFIG.PROMETHEUS_URL;

  constructor(private http: HttpClient) {}

  query(promql: string): Observable<PrometheusResult[]> {
    return this.http.get<any>(`${this.baseUrl}/api/v1/query`, {
      params: { query: promql },
    }).pipe(map(res => res?.data?.result || []));
  }

  getLatencyPercentiles(): Observable<PerformanceMetrics> {
    const queries = {
      p50: 'histogram_quantile(0.50, rate(http_server_requests_seconds_bucket[5m]))',
      p95: 'histogram_quantile(0.95, rate(http_server_requests_seconds_bucket[5m]))',
      p99: 'histogram_quantile(0.99, rate(http_server_requests_seconds_bucket[5m]))',
      rps: 'sum(rate(http_server_requests_seconds_count[5m]))',
      errors: 'sum(rate(http_server_requests_seconds_count{status=~"5.."}[5m]))',
    };

    return new Observable<PerformanceMetrics>(subscriber => {
      const results: Record<string, number> = {};
      let completed = 0;
      const total = Object.keys(queries).length;

      Object.entries(queries).forEach(([key, promql]) => {
        this.query(promql).subscribe({
          next: res => {
            results[key] = res.length > 0 ? parseFloat(res[0].value[1]) : 0;
            completed++;
            if (completed === total) {
              subscriber.next({
                p50LatencyMs: Math.round((results['p50'] || 0) * 1000),
                p95LatencyMs: Math.round((results['p95'] || 0) * 1000),
                p99LatencyMs: Math.round((results['p99'] || 0) * 1000),
                requestsPerSecond: Math.round((results['rps'] || 0) * 100) / 100,
                errorRate: Math.round((results['errors'] || 0) * 10000) / 100,
                activeConnections: 0,
              });
              subscriber.complete();
            }
          },
          error: () => {
            results[key] = 0;
            completed++;
            if (completed === total) {
              subscriber.next({
                p50LatencyMs: 0, p95LatencyMs: 0, p99LatencyMs: 0,
                requestsPerSecond: 0, errorRate: 0, activeConnections: 0,
              });
              subscriber.complete();
            }
          },
        });
      });
    });
  }
}
