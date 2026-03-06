import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, interval, takeUntil, switchMap, catchError, of } from 'rxjs';
import { PerformanceService, PerformanceMetrics } from '../../core/services/performance.service';
import { MetricCardComponent } from '../../shared/components/metric-card.component';
import { DurationPipe } from '../../shared/pipes/duration.pipe';

@Component({
  selector: 'app-performance-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MetricCardComponent, DurationPipe,
  ],
  template: `
    <div class="performance-dashboard">
      <div class="header">
        <h2><mat-icon>speed</mat-icon> Performance Metrics</h2>
        <button mat-stroked-button (click)="refresh()">
          <mat-icon>refresh</mat-icon> Refresh
        </button>
      </div>

      @if (loading && !metrics) {
        <div class="loading"><mat-spinner diameter="48" /></div>
      }

      @if (metrics) {
        <!-- Latency Cards -->
        <div class="metrics-row">
          <app-metric-card label="P50 Latency" [value]="(metrics.p50LatencyMs | duration)"
            icon="timer" color="var(--accent-green)" subtitle="Median response time" />
          <app-metric-card label="P95 Latency" [value]="(metrics.p95LatencyMs | duration)"
            icon="timer" color="var(--accent-orange)" subtitle="95th percentile" />
          <app-metric-card label="P99 Latency" [value]="(metrics.p99LatencyMs | duration)"
            icon="timer" color="var(--accent-red)" subtitle="99th percentile" />
          <app-metric-card label="Requests/sec" [value]="metrics.requestsPerSecond.toFixed(1)"
            icon="speed" color="var(--accent-cyan)" subtitle="Current throughput" />
          <app-metric-card label="Error Rate" [value]="metrics.errorRate.toFixed(2) + '%'"
            icon="error" [color]="metrics.errorRate > 1 ? 'var(--accent-red)' : 'var(--accent-green)'"
            subtitle="5xx responses" />
        </div>

        <!-- Latency Bars -->
        <mat-card class="latency-viz">
          <h3>Latency Distribution</h3>
          <div class="latency-bars">
            <div class="bar-group">
              <span class="bar-label">P50</span>
              <div class="bar-track">
                <div class="bar-fill p50" [style.width.%]="getBarWidth(metrics.p50LatencyMs)"></div>
              </div>
              <span class="bar-value">{{ metrics.p50LatencyMs }}ms</span>
            </div>
            <div class="bar-group">
              <span class="bar-label">P95</span>
              <div class="bar-track">
                <div class="bar-fill p95" [style.width.%]="getBarWidth(metrics.p95LatencyMs)"></div>
              </div>
              <span class="bar-value">{{ metrics.p95LatencyMs }}ms</span>
            </div>
            <div class="bar-group">
              <span class="bar-label">P99</span>
              <div class="bar-track">
                <div class="bar-fill p99" [style.width.%]="getBarWidth(metrics.p99LatencyMs)"></div>
              </div>
              <span class="bar-value">{{ metrics.p99LatencyMs }}ms</span>
            </div>
          </div>
        </mat-card>

        <!-- Throughput -->
        <mat-card class="throughput-card">
          <h3>Throughput</h3>
          <div class="throughput-gauge">
            <div class="gauge-value">{{ metrics.requestsPerSecond.toFixed(1) }}</div>
            <div class="gauge-label">requests/second</div>
            <div class="gauge-bar">
              <div class="gauge-fill" [style.width.%]="Math.min(metrics.requestsPerSecond * 10, 100)"></div>
            </div>
          </div>
        </mat-card>
      }

      @if (!loading && !metrics) {
        <mat-card class="error-card">
          <mat-icon>cloud_off</mat-icon>
          <h3>Prometheus Unavailable</h3>
          <p>Cannot connect to Prometheus metrics endpoint.</p>
          <button mat-stroked-button (click)="refresh()"><mat-icon>refresh</mat-icon> Retry</button>
        </mat-card>
      }
    </div>
  `,
  styles: [`
    .performance-dashboard { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
      h2 { display: flex; align-items: center; gap: 8px; margin: 0; }
    }
    .loading { text-align: center; padding: 60px; }
    .metrics-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .latency-viz, .throughput-card { padding: 24px; margin-bottom: 16px; h3 { margin: 0 0 20px; } }
    .latency-bars { display: flex; flex-direction: column; gap: 16px; }
    .bar-group { display: grid; grid-template-columns: 40px 1fr 80px; gap: 12px; align-items: center; }
    .bar-label { font-size: 13px; font-weight: 600; color: var(--text-secondary); }
    .bar-track { height: 24px; background: var(--bg-elevated); border-radius: 12px; overflow: hidden; }
    .bar-fill {
      height: 100%; border-radius: 12px; transition: width 0.5s ease;
      &.p50 { background: var(--accent-green); }
      &.p95 { background: var(--accent-orange); }
      &.p99 { background: var(--accent-red); }
    }
    .bar-value { font-size: 14px; font-weight: 600; text-align: right; }
    .throughput-gauge { text-align: center; }
    .gauge-value { font-size: 64px; font-weight: 700; color: var(--accent-cyan); }
    .gauge-label { font-size: 14px; color: var(--text-secondary); margin-bottom: 20px; }
    .gauge-bar { height: 12px; background: var(--bg-elevated); border-radius: 6px; overflow: hidden; }
    .gauge-fill { height: 100%; background: var(--accent-cyan); border-radius: 6px; transition: width 0.5s ease; }
    .error-card {
      padding: 40px; text-align: center;
      mat-icon { font-size: 48px; width: 48px; height: 48px; color: var(--accent-red); margin-bottom: 12px; }
      p { color: var(--text-secondary); margin-bottom: 16px; }
    }
  `],
})
export class PerformanceDashboardComponent implements OnInit, OnDestroy {
  private perfService = inject(PerformanceService);
  private destroy$ = new Subject<void>();

  metrics: PerformanceMetrics | null = null;
  loading = false;
  Math = Math;

  ngOnInit(): void {
    this.refresh();
    interval(5000).pipe(
      takeUntil(this.destroy$),
      switchMap(() => this.perfService.getLatencyPercentiles().pipe(catchError(() => of(null)))),
    ).subscribe(m => { if (m) this.metrics = m; });
  }

  refresh(): void {
    this.loading = true;
    this.perfService.getLatencyPercentiles().pipe(
      catchError(() => of(null)),
      takeUntil(this.destroy$),
    ).subscribe(m => {
      this.loading = false;
      this.metrics = m;
    });
  }

  getBarWidth(ms: number): number {
    if (!ms || !this.metrics) return 0;
    const max = Math.max(this.metrics.p99LatencyMs, 1);
    return Math.min((ms / max) * 100, 100);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
