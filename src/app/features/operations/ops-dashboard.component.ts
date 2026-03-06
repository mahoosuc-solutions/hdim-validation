import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject, takeUntil } from 'rxjs';
import { HealthCheckService, ServiceHealth } from '../../core/services/health-check.service';
import { MetricCardComponent } from '../../shared/components/metric-card.component';
import { StatusIndicatorComponent } from '../../shared/components/status-indicator.component';
import { DurationPipe } from '../../shared/pipes/duration.pipe';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';

@Component({
  selector: 'app-ops-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule,
    MatProgressSpinnerModule, MetricCardComponent, StatusIndicatorComponent,
    DurationPipe, RelativeTimePipe,
  ],
  template: `
    <div class="ops-dashboard">
      <div class="header">
        <h2><mat-icon>monitor_heart</mat-icon> Operational Health</h2>
        <button mat-stroked-button (click)="refresh()">
          <mat-icon>refresh</mat-icon> Refresh
        </button>
      </div>

      <div class="summary-row">
        <app-metric-card label="Services UP" [value]="upCount"
          icon="check_circle" color="var(--accent-green)" />
        <app-metric-card label="Services DOWN" [value]="downCount"
          icon="cancel" [color]="downCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)'" />
        <app-metric-card label="Avg Response" [value]="(avgResponseTime | duration)"
          icon="timer" color="var(--accent-cyan)" />
        <app-metric-card label="Last Check" [value]="lastChecked ? (lastChecked | relativeTime) : '—'"
          icon="schedule" color="var(--text-secondary)" />
      </div>

      @if (loading && services.length === 0) {
        <div class="loading"><mat-spinner diameter="48" /></div>
      }

      <div class="service-grid">
        @for (service of services; track service.name) {
          <mat-card class="service-card" [class]="service.status.toLowerCase()">
            <div class="service-header">
              <mat-icon [class]="service.status.toLowerCase()">
                {{ service.status === 'UP' ? 'check_circle' : service.status === 'DOWN' ? 'cancel' : 'help' }}
              </mat-icon>
              <strong>{{ service.name }}</strong>
              <app-status-indicator [status]="service.status" [label]="service.status" />
            </div>
            <div class="service-details">
              @if (service.responseTimeMs !== undefined) {
                <div class="detail">
                  <span class="detail-label">Response Time</span>
                  <span class="detail-value">{{ service.responseTimeMs | duration }}</span>
                </div>
              }
              <div class="detail">
                <span class="detail-label">Last Checked</span>
                <span class="detail-value">{{ service.lastChecked | relativeTime }}</span>
              </div>
            </div>
          </mat-card>
        }
      </div>
    </div>
  `,
  styles: [`
    .ops-dashboard { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
      h2 { display: flex; align-items: center; gap: 8px; margin: 0; }
    }
    .summary-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .loading { text-align: center; padding: 60px; }
    .service-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
    .service-card {
      padding: 20px !important;
      &.up { border-left: 3px solid var(--accent-green) !important; }
      &.down { border-left: 3px solid var(--accent-red) !important; }
      &.unknown { border-left: 3px solid var(--accent-orange) !important; }
    }
    .service-header {
      display: flex; align-items: center; gap: 8px; margin-bottom: 12px;
      strong { flex: 1; }
      mat-icon {
        &.up { color: var(--accent-green); }
        &.down { color: var(--accent-red); }
        &.unknown { color: var(--accent-orange); }
      }
    }
    .service-details { display: flex; flex-direction: column; gap: 4px; }
    .detail { display: flex; justify-content: space-between; font-size: 12px; }
    .detail-label { color: var(--text-secondary); }
    .detail-value { font-weight: 600; }
  `],
})
export class OpsDashboardComponent implements OnInit, OnDestroy {
  private healthService = inject(HealthCheckService);
  private destroy$ = new Subject<void>();

  services: ServiceHealth[] = [];
  loading = false;
  lastChecked?: string;

  get upCount(): number { return this.services.filter(s => s.status === 'UP').length; }
  get downCount(): number { return this.services.filter(s => s.status === 'DOWN').length; }
  get avgResponseTime(): number {
    const times = this.services.filter(s => s.responseTimeMs).map(s => s.responseTimeMs!);
    return times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;
  }

  ngOnInit(): void {
    this.refresh();
    this.healthService.pollAllServices(5000).pipe(takeUntil(this.destroy$))
      .subscribe(services => {
        this.services = services;
        this.lastChecked = new Date().toISOString();
        this.loading = false;
      });
  }

  refresh(): void {
    this.loading = true;
    this.healthService.checkAllServices().pipe(takeUntil(this.destroy$))
      .subscribe(services => {
        this.services = services;
        this.lastChecked = new Date().toISOString();
        this.loading = false;
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
