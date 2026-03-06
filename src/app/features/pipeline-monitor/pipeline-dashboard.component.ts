import { Component, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subject, takeUntil } from 'rxjs';
import { SystemEventsService } from '../../core/services/system-events.service';
import {
  SystemEvent, LiveMetrics, PipelineState, getEventIcon, getSeverityColor, getNodeStatusColor,
} from '../../core/models/system-event.model';
import { MetricCardComponent } from '../../shared/components/metric-card.component';
import { StatusIndicatorComponent } from '../../shared/components/status-indicator.component';
import { RelativeTimePipe } from '../../shared/pipes/relative-time.pipe';
import { DurationPipe } from '../../shared/pipes/duration.pipe';

@Component({
  selector: 'app-pipeline-dashboard',
  standalone: true,
  imports: [
    CommonModule, MatCardModule, MatIconModule, MatButtonModule,
    MetricCardComponent, StatusIndicatorComponent, RelativeTimePipe, DurationPipe,
  ],
  template: `
    <div class="pipeline-dashboard">
      <div class="header">
        <h2><mat-icon>sync</mat-icon> Pipeline Monitor</h2>
        <div class="header-actions">
          <app-status-indicator [status]="(connectionStatus$ | async) || 'disconnected'" />
          <button mat-icon-button (click)="toggleConnection()">
            <mat-icon>{{ (connectionStatus$ | async) === 'connected' ? 'stop' : 'play_arrow' }}</mat-icon>
          </button>
        </div>
      </div>

      <!-- Metrics Row -->
      <div class="metrics-row">
        <app-metric-card label="Patients Processed" [value]="metrics.patientsProcessed"
          icon="people" color="var(--accent-cyan)" />
        <app-metric-card label="Throughput" [value]="metrics.throughputPerSecond.toFixed(1) + '/s'"
          icon="speed" color="var(--accent-green)" />
        <app-metric-card label="Compliance" [value]="metrics.complianceRate.toFixed(1) + '%'"
          icon="verified" color="var(--accent-blue)" />
        <app-metric-card label="Avg Latency" [value]="(metrics.avgProcessingTimeMs | duration)"
          icon="timer" color="var(--accent-orange)" />
        <app-metric-card label="Success Rate" [value]="metrics.successRate.toFixed(1) + '%'"
          icon="check_circle" color="var(--accent-green)" />
      </div>

      <!-- Pipeline Visualization -->
      <mat-card class="pipeline-viz">
        <h3>Data Flow Pipeline</h3>
        <div class="pipeline-nodes">
          @for (node of pipeline.nodes; track node.id; let i = $index) {
            <div class="pipeline-node" [class]="node.status">
              <div class="node-icon" [style.border-color]="getNodeColor(node.status)">
                <mat-icon [style.color]="getNodeColor(node.status)">
                  {{ getNodeIcon(node.id) }}
                </mat-icon>
              </div>
              <div class="node-info">
                <strong>{{ node.name }}</strong>
                <span class="node-desc">{{ node.description }}</span>
                <span class="node-throughput" [style.color]="getNodeColor(node.status)">
                  {{ node.throughput.toFixed(1) }}/s
                </span>
              </div>
            </div>
            @if (i < pipeline.nodes.length - 1) {
              <div class="pipeline-arrow" [class.active]="pipeline.connections[i]?.isActive">
                <mat-icon>arrow_forward</mat-icon>
              </div>
            }
          }
        </div>
      </mat-card>

      <!-- Event Feed -->
      <mat-card class="event-feed">
        <div class="feed-header">
          <h3>Live Event Feed</h3>
          <span class="event-count">{{ events.length }} events</span>
        </div>
        <div class="event-list">
          @for (event of events; track event.id) {
            <div class="event-item fade-in" [class]="event.severity">
              <mat-icon class="event-icon">{{ getIcon(event.type) }}</mat-icon>
              <div class="event-body">
                <span class="event-title">{{ event.title }}</span>
                <span class="event-desc">{{ event.description }}</span>
              </div>
              <span class="event-time">{{ event.timestamp | relativeTime }}</span>
            </div>
          } @empty {
            <div class="empty-state">
              <mat-icon>hourglass_empty</mat-icon>
              <p>Waiting for pipeline events...</p>
              <p class="hint">Seed data to begin processing</p>
            </div>
          }
        </div>
      </mat-card>
    </div>
  `,
  styles: [`
    .pipeline-dashboard { padding: 24px; max-width: 1400px; margin: 0 auto; }
    .header {
      display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
      h2 { display: flex; align-items: center; gap: 8px; margin: 0; }
      .header-actions { display: flex; align-items: center; gap: 12px; }
    }
    .metrics-row { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
    .pipeline-viz {
      padding: 24px; margin-bottom: 24px;
      h3 { margin: 0 0 20px; }
    }
    .pipeline-nodes { display: flex; align-items: center; justify-content: center; gap: 8px; flex-wrap: wrap; }
    .pipeline-node {
      display: flex; flex-direction: column; align-items: center; gap: 8px; padding: 16px;
      border-radius: 12px; background: var(--bg-elevated); min-width: 140px;
      &.processing { animation: pulse 1.5s infinite; }
    }
    .node-icon {
      width: 56px; height: 56px; border-radius: 50%; border: 2px solid;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 28px; width: 28px; height: 28px; }
    }
    .node-info { text-align: center; display: flex; flex-direction: column; gap: 2px; }
    .node-desc { font-size: 11px; color: var(--text-secondary); }
    .node-throughput { font-size: 14px; font-weight: 600; }
    .pipeline-arrow {
      color: var(--border-color); transition: color 0.3s;
      &.active { color: var(--accent-cyan); animation: pulse 1s infinite; }
    }
    .event-feed {
      padding: 24px;
      .feed-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;
        h3 { margin: 0; }
        .event-count { font-size: 12px; color: var(--text-secondary); }
      }
    }
    .event-list { max-height: 400px; overflow-y: auto; }
    .event-item {
      display: flex; align-items: center; gap: 12px; padding: 10px; border-radius: 8px;
      border-bottom: 1px solid var(--border-color);
      &.success .event-icon { color: var(--accent-green); }
      &.warning .event-icon { color: var(--accent-orange); }
      &.error .event-icon { color: var(--accent-red); }
      &.info .event-icon { color: var(--accent-blue); }
    }
    .event-body { flex: 1; display: flex; flex-direction: column; gap: 2px; }
    .event-title { font-size: 13px; font-weight: 500; }
    .event-desc { font-size: 11px; color: var(--text-secondary); }
    .event-time { font-size: 11px; color: var(--text-secondary); white-space: nowrap; }
    .empty-state {
      text-align: center; padding: 40px; color: var(--text-secondary);
      mat-icon { font-size: 48px; width: 48px; height: 48px; opacity: 0.4; }
      .hint { font-size: 12px; }
    }
  `],
})
export class PipelineDashboardComponent implements OnInit, OnDestroy {
  private systemEvents = inject(SystemEventsService);
  private destroy$ = new Subject<void>();

  connectionStatus$ = this.systemEvents.connectionStatus$;
  events: SystemEvent[] = [];
  metrics: LiveMetrics = { patientsProcessed: 0, patientsProcessedChange: 0, throughputPerSecond: 0, maxThroughput: 0, complianceRate: 0, complianceRateChange: 0, openCareGaps: 0, careGapsChange: 0, successRate: 100, avgProcessingTimeMs: 0, lastUpdated: '' };
  pipeline: PipelineState = { nodes: [], connections: [], lastUpdated: '' };

  ngOnInit(): void {
    this.systemEvents.connect();
    this.connected = true;
    this.systemEvents.events$.pipe(takeUntil(this.destroy$)).subscribe(e => this.events = e);
    this.systemEvents.metrics$.pipe(takeUntil(this.destroy$)).subscribe(m => this.metrics = m);
    this.systemEvents.pipeline$.pipe(takeUntil(this.destroy$)).subscribe(p => this.pipeline = p);
    this.systemEvents.connectionStatus$.pipe(takeUntil(this.destroy$)).subscribe(s => this.connected = s === 'connected');
  }

  private connected = false;

  toggleConnection(): void {
    if (this.connected) {
      this.systemEvents.disconnect();
      this.connected = false;
    } else {
      this.systemEvents.connect();
      this.connected = true;
    }
  }

  getIcon(type: string): string { return getEventIcon(type as any); }
  getNodeColor(status: string): string { return getNodeStatusColor(status as any); }
  getNodeIcon(id: string): string {
    const map: Record<string, string> = { fhir: 'storage', cql: 'code', quality: 'assessment', caregap: 'warning' };
    return map[id] || 'circle';
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
