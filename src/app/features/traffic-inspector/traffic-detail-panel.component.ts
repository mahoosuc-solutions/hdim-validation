import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { TrafficRecord } from '../../core/models/traffic.model';

@Component({
  selector: 'app-traffic-detail-panel',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatTooltipModule],
  template: `
    <div class="detail-panel">
      <div class="detail-header">
        <div class="detail-title">
          @if (record.method) {
            <span class="method-badge" [class]="record.method.toLowerCase()">{{ record.method }}</span>
          }
          <span class="detail-url">{{ record.url || record.eventType || record.source }}</span>
        </div>
        <div class="detail-actions">
          <button mat-icon-button matTooltip="Copy body" (click)="copyBody()">
            <mat-icon>content_copy</mat-icon>
          </button>
          <button mat-icon-button matTooltip="Close" (click)="closed.emit()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      </div>

      <!-- Annotation -->
      <div class="section">
        <div class="section-title">Semantic Context</div>
        <div class="annotation-grid">
          <div class="anno-item">
            <span class="anno-label">Phase</span>
            <span class="anno-value">{{ record.annotation.phase | titlecase }}</span>
          </div>
          <div class="anno-item">
            <span class="anno-label">Service</span>
            <span class="anno-value">{{ record.annotation.service }}</span>
          </div>
          <div class="anno-item">
            <span class="anno-label">Action</span>
            <span class="anno-value">{{ record.annotation.action }}</span>
          </div>
          <div class="anno-item">
            <span class="anno-label">Importance</span>
            <span class="anno-value importance" [class]="record.annotation.importance">
              {{ record.annotation.importance | titlecase }}
            </span>
          </div>
        </div>
      </div>

      <!-- Timing -->
      @if (record.durationMs !== undefined || record.statusCode !== undefined) {
        <div class="section">
          <div class="section-title">Timing & Status</div>
          <div class="timing-grid">
            @if (record.statusCode !== undefined) {
              <div class="timing-item">
                <span class="timing-label">Status</span>
                <span class="timing-value" [class]="getStatusClass(record.statusCode)">{{ record.statusCode }}</span>
              </div>
            }
            @if (record.durationMs !== undefined) {
              <div class="timing-item">
                <span class="timing-label">Duration</span>
                <span class="timing-value">{{ record.durationMs }}ms</span>
              </div>
            }
            @if (record.requestSize) {
              <div class="timing-item">
                <span class="timing-label">Request Size</span>
                <span class="timing-value">{{ formatBytes(record.requestSize) }}</span>
              </div>
            }
            @if (record.responseSize) {
              <div class="timing-item">
                <span class="timing-label">Response Size</span>
                <span class="timing-value">{{ formatBytes(record.responseSize) }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Request Headers -->
      @if (record.requestHeaders && hasKeys(record.requestHeaders)) {
        <div class="section">
          <div class="section-title">Request Headers</div>
          <div class="headers-table">
            @for (entry of objectEntries(record.requestHeaders); track entry[0]) {
              <div class="header-row">
                <span class="header-name">{{ entry[0] }}</span>
                <span class="header-value">{{ entry[1] }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Response Headers -->
      @if (record.responseHeaders && hasKeys(record.responseHeaders)) {
        <div class="section">
          <div class="section-title">Response Headers</div>
          <div class="headers-table">
            @for (entry of objectEntries(record.responseHeaders); track entry[0]) {
              <div class="header-row">
                <span class="header-name">{{ entry[0] }}</span>
                <span class="header-value">{{ entry[1] }}</span>
              </div>
            }
          </div>
        </div>
      }

      <!-- Request Body -->
      @if (record.requestBody != null) {
        <div class="section">
          <div class="section-title">Request Body</div>
          <pre class="json-body">{{ formatJson(record.requestBody) }}</pre>
        </div>
      }

      <!-- Response Body / Payload -->
      @if (record.responseBody != null || record.payload != null) {
        <div class="section">
          <div class="section-title">{{ record.responseBody != null ? 'Response Body' : 'Payload' }}</div>
          <pre class="json-body">{{ formatJson(record.responseBody ?? record.payload) }}</pre>
        </div>
      }
    </div>
  `,
  styles: [`
    .detail-panel {
      width: 420px;
      flex-shrink: 0;
      background: var(--bg-secondary);
      border-left: 1px solid var(--border-color);
      overflow-y: auto;
      animation: slideIn 0.2s ease-out;
    }
    @keyframes slideIn {
      from { transform: translateX(20px); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }
    .detail-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-elevated);
      position: sticky;
      top: 0;
      z-index: 1;
    }
    .detail-title {
      display: flex;
      align-items: center;
      gap: 8px;
      flex: 1;
      overflow: hidden;
    }
    .detail-url {
      font-family: 'Roboto Mono', monospace;
      font-size: 12px;
      color: var(--text-primary);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .detail-actions { display: flex; gap: 4px; flex-shrink: 0; }
    .method-badge {
      font-size: 11px;
      font-weight: 700;
      padding: 2px 8px;
      border-radius: 4px;
      flex-shrink: 0;
      &.get { background: rgba(76, 175, 80, 0.2); color: var(--accent-green); }
      &.post { background: rgba(0, 188, 212, 0.2); color: var(--accent-cyan); }
      &.put { background: rgba(255, 152, 0, 0.2); color: var(--accent-orange); }
      &.delete { background: rgba(244, 67, 54, 0.2); color: var(--accent-red); }
    }

    .section {
      padding: 12px 16px;
      border-bottom: 1px solid var(--border-color);
    }
    .section-title {
      font-size: 10px;
      font-weight: 600;
      text-transform: uppercase;
      color: var(--text-secondary);
      margin-bottom: 8px;
    }

    .annotation-grid, .timing-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 8px;
    }
    .anno-item, .timing-item {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .anno-label, .timing-label { font-size: 10px; color: var(--text-secondary); }
    .anno-value, .timing-value { font-size: 13px; color: var(--text-primary); }
    .importance {
      &.high { color: var(--accent-red); }
      &.medium { color: var(--accent-orange); }
      &.low { color: var(--text-secondary); }
    }

    .headers-table {
      font-family: 'Roboto Mono', monospace;
      font-size: 11px;
    }
    .header-row {
      display: flex;
      gap: 8px;
      padding: 3px 0;
      border-bottom: 1px solid rgba(48, 54, 61, 0.3);
    }
    .header-name { color: var(--accent-cyan); flex-shrink: 0; min-width: 120px; }
    .header-value { color: var(--text-primary); word-break: break-all; }

    .json-body {
      background: var(--bg-primary);
      border: 1px solid var(--border-color);
      border-radius: 6px;
      padding: 12px;
      font-family: 'Roboto Mono', monospace;
      font-size: 11px;
      color: var(--text-primary);
      overflow-x: auto;
      white-space: pre-wrap;
      word-break: break-all;
      max-height: 400px;
      overflow-y: auto;
    }

    .status-2xx { color: var(--accent-green); }
    .status-3xx { color: var(--accent-orange); }
    .status-4xx { color: var(--accent-orange); }
    .status-5xx { color: var(--accent-red); }
  `],
})
export class TrafficDetailPanelComponent {
  @Input({ required: true }) record!: TrafficRecord;
  @Output() closed = new EventEmitter<void>();

  formatJson(value: unknown): string {
    if (value == null) return 'null';
    if (typeof value === 'string') {
      try {
        return JSON.stringify(JSON.parse(value), null, 2);
      } catch {
        return value;
      }
    }
    try {
      return JSON.stringify(value, null, 2);
    } catch {
      return String(value);
    }
  }

  formatBytes(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1048576).toFixed(1)} MB`;
  }

  getStatusClass(status?: number): string {
    if (status == null) return '';
    if (status < 300) return 'status-2xx';
    if (status < 400) return 'status-3xx';
    if (status < 500) return 'status-4xx';
    return 'status-5xx';
  }

  hasKeys(obj: Record<string, string>): boolean {
    return Object.keys(obj).length > 0;
  }

  objectEntries(obj: Record<string, string>): [string, string][] {
    return Object.entries(obj);
  }

  copyBody(): void {
    const body = this.record.responseBody ?? this.record.payload ?? this.record.requestBody;
    const text = typeof body === 'string' ? body : JSON.stringify(body, null, 2);
    navigator.clipboard.writeText(text || '');
  }
}
