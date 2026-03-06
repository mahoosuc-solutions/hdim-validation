import { Component, inject, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ScrollingModule, CdkVirtualScrollViewport } from '@angular/cdk/scrolling';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatBadgeModule } from '@angular/material/badge';
import { TrafficCaptureService } from '../../core/services/traffic-capture.service';
import { BackendEventsService } from '../../core/services/backend-events.service';
import { TrafficRecord, TrafficStats } from '../../core/models/traffic.model';
import { TrafficFilterBarComponent } from './traffic-filter-bar.component';
import { TrafficDetailPanelComponent } from './traffic-detail-panel.component';
import { Subscription } from 'rxjs';

interface PhaseGroup {
  phase: string;
  icon: string;
  count: number;
  records: TrafficRecord[];
  expanded: boolean;
}

const PHASE_ICONS: Record<string, string> = {
  seeding: 'cloud_upload',
  pipeline: 'account_tree',
  analytics: 'analytics',
  security: 'security',
  performance: 'speed',
  operations: 'settings',
  unknown: 'help_outline',
};

const PHASE_COLORS: Record<string, string> = {
  seeding: 'var(--accent-cyan)',
  pipeline: 'var(--accent-blue)',
  analytics: 'var(--accent-green)',
  security: 'var(--accent-orange)',
  performance: 'var(--accent-purple)',
  operations: 'var(--text-secondary)',
  unknown: 'var(--text-secondary)',
};

@Component({
  selector: 'app-traffic-inspector',
  standalone: true,
  imports: [
    CommonModule,
    ScrollingModule,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatBadgeModule,
    TrafficFilterBarComponent,
    TrafficDetailPanelComponent,
  ],
  template: `
    <div class="inspector-container">
      <!-- Stats Bar -->
      <div class="stats-bar">
        <div class="stat">
          <span class="stat-value">{{ stats.totalCount }}</span>
          <span class="stat-label">Total</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ stats.recordsPerSec }}/s</span>
          <span class="stat-label">Rate</span>
        </div>
        <div class="stat">
          <span class="stat-value">{{ stats.avgLatencyMs }}ms</span>
          <span class="stat-label">Avg Latency</span>
        </div>
        <div class="stat" [class.error-stat]="stats.errorCount > 0">
          <span class="stat-value">{{ stats.errorCount }}</span>
          <span class="stat-label">Errors</span>
        </div>
        <div class="stats-spacer"></div>
        <button mat-icon-button matTooltip="Clear all" (click)="clearAll()">
          <mat-icon>delete_sweep</mat-icon>
        </button>
        <button mat-icon-button [matTooltip]="autoScroll ? 'Pause auto-scroll' : 'Resume auto-scroll'"
          (click)="autoScroll = !autoScroll">
          <mat-icon>{{ autoScroll ? 'pause' : 'play_arrow' }}</mat-icon>
        </button>
      </div>

      <!-- Filter Bar -->
      <app-traffic-filter-bar />

      <div class="dual-pane" [class.detail-open]="!!selectedRecord">
        <div class="panes-container">
          <!-- Top Pane: Semantic Flow -->
          <div class="top-pane">
            <div class="pane-header">
              <mat-icon>timeline</mat-icon>
              <span>Semantic Flow</span>
            </div>
            <div class="semantic-groups">
              @for (group of phaseGroups; track group.phase) {
                <div class="phase-group" (click)="group.expanded = !group.expanded">
                  <div class="phase-header">
                    <mat-icon [style.color]="getPhaseColor(group.phase)">{{ group.icon }}</mat-icon>
                    <span class="phase-name">{{ group.phase | titlecase }}</span>
                    <span class="phase-count">{{ group.count }}</span>
                    <mat-icon class="expand-icon">{{ group.expanded ? 'expand_less' : 'expand_more' }}</mat-icon>
                  </div>
                  @if (group.expanded) {
                    <div class="phase-records">
                      @for (record of group.records | slice:0:50; track record.id) {
                        <div class="semantic-record" (click)="selectRecord(record); $event.stopPropagation()">
                          <span class="sr-time">{{ formatTime(record.timestamp) }}</span>
                          <span class="sr-action" [style.color]="getPhaseColor(record.annotation.phase)">
                            {{ record.annotation.action }}
                          </span>
                          <span class="sr-service">{{ record.annotation.service }}</span>
                          @if (record.statusCode) {
                            <span class="sr-status" [class]="getStatusClass(record.statusCode)">
                              {{ record.statusCode }}
                            </span>
                          }
                          @if (record.durationMs !== undefined) {
                            <span class="sr-duration">{{ record.durationMs }}ms</span>
                          }
                        </div>
                      }
                    </div>
                  }
                </div>
              }
              @if (phaseGroups.length === 0) {
                <div class="empty-state">
                  <mat-icon>wifi_tethering</mat-icon>
                  <p>Waiting for traffic...</p>
                  <p class="hint">Navigate to other tabs to generate HTTP requests</p>
                </div>
              }
            </div>
          </div>

          <!-- Bottom Pane: Raw Transaction Stream -->
          <div class="bottom-pane">
            <div class="pane-header">
              <mat-icon>list_alt</mat-icon>
              <span>Raw Transaction Stream</span>
              <span class="record-count">{{ filteredRecords.length }} records</span>
            </div>
            <div class="raw-header-row">
              <span class="col-time">Time</span>
              <span class="col-source">Source</span>
              <span class="col-dir">Dir</span>
              <span class="col-method">Method</span>
              <span class="col-url">URL / Event</span>
              <span class="col-status">Status</span>
              <span class="col-duration">Duration</span>
              <span class="col-size">Size</span>
            </div>
            <cdk-virtual-scroll-viewport itemSize="36" class="raw-viewport"
              #scrollViewport>
              <div *cdkVirtualFor="let record of filteredRecords; trackBy: trackById"
                class="raw-row" [class.selected]="selectedRecord?.id === record.id"
                (click)="selectRecord(record)">
                <span class="col-time">{{ formatTime(record.timestamp) }}</span>
                <span class="col-source">
                  <mat-icon class="source-icon" [style.color]="getSourceColor(record.source)">
                    {{ getSourceIcon(record.source) }}
                  </mat-icon>
                </span>
                <span class="col-dir">
                  <mat-icon class="dir-icon">{{ record.direction === 'outbound' ? 'arrow_upward' : 'arrow_downward' }}</mat-icon>
                </span>
                <span class="col-method" [class]="record.method?.toLowerCase()">{{ record.method || '' }}</span>
                <span class="col-url" [matTooltip]="record.url || record.eventType || ''">
                  {{ truncateUrl(record.url || record.eventType || '') }}
                </span>
                <span class="col-status" [class]="getStatusClass(record.statusCode)">
                  {{ record.statusCode || (record.eventType ? 'evt' : '') }}
                </span>
                <span class="col-duration">{{ record.durationMs !== undefined ? record.durationMs + 'ms' : '' }}</span>
                <span class="col-size">{{ formatSize(record.responseSize) }}</span>
              </div>
            </cdk-virtual-scroll-viewport>
          </div>
        </div>

        <!-- Detail Panel -->
        @if (selectedRecord) {
          <app-traffic-detail-panel
            [record]="selectedRecord"
            (closed)="selectedRecord = null" />
        }
      </div>
    </div>
  `,
  styles: [`
    .inspector-container {
      display: flex;
      flex-direction: column;
      height: 100%;
      background: var(--bg-primary);
    }

    /* Stats Bar */
    .stats-bar {
      display: flex;
      align-items: center;
      gap: 24px;
      padding: 8px 16px;
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border-color);
    }
    .stat {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
    .stat-value { font-size: 18px; font-weight: 700; color: var(--accent-cyan); }
    .stat-label { font-size: 10px; color: var(--text-secondary); text-transform: uppercase; }
    .error-stat .stat-value { color: var(--accent-red); }
    .stats-spacer { flex: 1; }

    /* Dual Pane */
    .dual-pane {
      flex: 1;
      display: flex;
      overflow: hidden;
    }
    .panes-container {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .dual-pane.detail-open .panes-container { flex: 1; }

    .pane-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 16px;
      background: var(--bg-elevated);
      border-bottom: 1px solid var(--border-color);
      font-size: 13px;
      font-weight: 600;
      color: var(--text-secondary);
      mat-icon { font-size: 16px; width: 16px; height: 16px; }
    }
    .record-count { margin-left: auto; font-weight: 400; font-size: 11px; }

    /* Top Pane: Semantic */
    .top-pane {
      flex: 0 0 40%;
      display: flex;
      flex-direction: column;
      border-bottom: 2px solid var(--border-color);
      overflow: hidden;
    }
    .semantic-groups {
      flex: 1;
      overflow-y: auto;
      padding: 8px;
    }
    .phase-group {
      margin-bottom: 4px;
      border-radius: 8px;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      cursor: pointer;
    }
    .phase-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 12px;
      mat-icon { font-size: 18px; width: 18px; height: 18px; }
    }
    .phase-name { font-size: 13px; font-weight: 600; color: var(--text-primary); }
    .phase-count {
      font-size: 11px;
      background: var(--bg-elevated);
      padding: 1px 8px;
      border-radius: 10px;
      color: var(--text-secondary);
    }
    .expand-icon { margin-left: auto !important; font-size: 18px; width: 18px; height: 18px; color: var(--text-secondary); }
    .phase-records { padding: 0 12px 8px 36px; }
    .semantic-record {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 4px 8px;
      font-size: 12px;
      border-radius: 4px;
      cursor: pointer;
      &:hover { background: var(--bg-elevated); }
    }
    .sr-time { color: var(--text-secondary); font-family: monospace; flex-shrink: 0; width: 80px; }
    .sr-action { flex: 1; font-weight: 500; }
    .sr-service { color: var(--text-secondary); flex-shrink: 0; }
    .sr-status {
      font-family: monospace;
      font-size: 11px;
      padding: 1px 6px;
      border-radius: 3px;
      flex-shrink: 0;
    }
    .sr-duration { color: var(--text-secondary); font-family: monospace; flex-shrink: 0; }

    /* Bottom Pane: Raw Stream */
    .bottom-pane {
      flex: 1;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    .raw-header-row {
      display: flex;
      align-items: center;
      padding: 4px 16px;
      background: var(--bg-elevated);
      border-bottom: 1px solid var(--border-color);
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--text-secondary);
    }
    .raw-viewport {
      flex: 1;
    }
    .raw-row {
      display: flex;
      align-items: center;
      padding: 0 16px;
      height: 36px;
      font-size: 12px;
      font-family: 'Roboto Mono', monospace;
      border-bottom: 1px solid rgba(48, 54, 61, 0.4);
      cursor: pointer;
      transition: background 0.1s;
      &:hover { background: var(--bg-elevated); }
      &.selected { background: rgba(0, 188, 212, 0.1); border-left: 3px solid var(--accent-cyan); }
    }

    /* Column widths */
    .col-time { width: 80px; flex-shrink: 0; color: var(--text-secondary); }
    .col-source { width: 36px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .col-dir { width: 30px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; }
    .col-method { width: 60px; flex-shrink: 0; font-weight: 600; }
    .col-url { flex: 1; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; color: var(--text-primary); }
    .col-status { width: 50px; flex-shrink: 0; text-align: center; font-weight: 600; }
    .col-duration { width: 70px; flex-shrink: 0; text-align: right; color: var(--text-secondary); }
    .col-size { width: 60px; flex-shrink: 0; text-align: right; color: var(--text-secondary); }

    .source-icon, .dir-icon { font-size: 16px; width: 16px; height: 16px; }
    .dir-icon { color: var(--text-secondary); }

    /* Method colors */
    .get { color: var(--accent-green); }
    .post { color: var(--accent-cyan); }
    .put { color: var(--accent-orange); }
    .delete { color: var(--accent-red); }

    /* Status colors */
    .status-2xx { color: var(--accent-green); }
    .status-3xx { color: var(--accent-orange); }
    .status-4xx { color: var(--accent-orange); background: rgba(255, 152, 0, 0.1); border-radius: 3px; }
    .status-5xx { color: var(--accent-red); background: rgba(244, 67, 54, 0.1); border-radius: 3px; }
    .status-ws { color: var(--accent-blue); }
    .status-sse { color: var(--accent-purple); }

    /* Empty state */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 48px;
      color: var(--text-secondary);
      mat-icon { font-size: 48px; width: 48px; height: 48px; margin-bottom: 16px; opacity: 0.4; }
      p { font-size: 14px; margin-bottom: 4px; }
      .hint { font-size: 12px; opacity: 0.6; }
    }
  `],
})
export class TrafficInspectorComponent implements OnInit, OnDestroy {
  private trafficCapture = inject(TrafficCaptureService);
  private backendEvents = inject(BackendEventsService);
  private subscription = new Subscription();

  @ViewChild('scrollViewport') scrollViewport?: CdkVirtualScrollViewport;

  filteredRecords: TrafficRecord[] = [];
  phaseGroups: PhaseGroup[] = [];
  selectedRecord: TrafficRecord | null = null;
  autoScroll = true;
  stats: TrafficStats = { totalCount: 0, bySource: {} as any, byStatus: {}, avgLatencyMs: 0, errorCount: 0, recordsPerSec: 0 };

  ngOnInit(): void {
    this.backendEvents.connect();

    this.subscription.add(
      this.trafficCapture.filteredRecords$.subscribe(records => {
        this.filteredRecords = records;
        this.buildPhaseGroups(records);
        if (this.autoScroll && this.scrollViewport) {
          setTimeout(() => this.scrollViewport!.scrollTo({ bottom: 0 }));
        }
      }),
    );

    this.subscription.add(
      this.trafficCapture.stats$.subscribe(stats => {
        this.stats = stats;
      }),
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
    this.backendEvents.disconnect();
  }

  selectRecord(record: TrafficRecord): void {
    this.selectedRecord = this.selectedRecord?.id === record.id ? null : record;
  }

  clearAll(): void {
    this.trafficCapture.clear();
    this.selectedRecord = null;
  }

  trackById(_index: number, record: TrafficRecord): string {
    return record.id;
  }

  formatTime(timestamp: number): string {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
      + '.' + String(d.getMilliseconds()).padStart(3, '0');
  }

  truncateUrl(url: string): string {
    if (url.length <= 60) return url;
    return url.slice(0, 57) + '...';
  }

  formatSize(bytes?: number): string {
    if (bytes == null || bytes === 0) return '';
    if (bytes < 1024) return `${bytes}B`;
    return `${(bytes / 1024).toFixed(1)}KB`;
  }

  getStatusClass(status?: number): string {
    if (status == null) return '';
    if (status < 300) return 'status-2xx';
    if (status < 400) return 'status-3xx';
    if (status < 500) return 'status-4xx';
    return 'status-5xx';
  }

  getSourceIcon(source: string): string {
    const icons: Record<string, string> = {
      'http-interceptor': 'http',
      'websocket-main': 'cable',
      'sse-seed': 'stream',
      'ws-devops': 'terminal',
      'ws-health-scores': 'monitor_heart',
      'ws-subscriptions': 'notifications',
    };
    return icons[source] || 'device_hub';
  }

  getSourceColor(source: string): string {
    const colors: Record<string, string> = {
      'http-interceptor': 'var(--accent-green)',
      'websocket-main': 'var(--accent-blue)',
      'sse-seed': 'var(--accent-purple)',
      'ws-devops': 'var(--accent-orange)',
      'ws-health-scores': 'var(--accent-cyan)',
      'ws-subscriptions': 'var(--text-secondary)',
    };
    return colors[source] || 'var(--text-secondary)';
  }

  getPhaseColor(phase: string): string {
    return PHASE_COLORS[phase] || PHASE_COLORS['unknown'];
  }

  private buildPhaseGroups(records: TrafficRecord[]): void {
    const groupMap = new Map<string, TrafficRecord[]>();
    for (const r of records) {
      const phase = r.annotation.phase || 'unknown';
      if (!groupMap.has(phase)) groupMap.set(phase, []);
      groupMap.get(phase)!.push(r);
    }

    // Preserve expanded state
    const prevExpanded = new Set(this.phaseGroups.filter(g => g.expanded).map(g => g.phase));

    this.phaseGroups = Array.from(groupMap.entries()).map(([phase, recs]) => ({
      phase,
      icon: PHASE_ICONS[phase] || PHASE_ICONS['unknown'],
      count: recs.length,
      records: recs.slice(-50),
      expanded: prevExpanded.has(phase),
    }));
  }
}
