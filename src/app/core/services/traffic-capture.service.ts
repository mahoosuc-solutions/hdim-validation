import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, map, interval, startWith } from 'rxjs';
import {
  TrafficRecord,
  TrafficFilter,
  TrafficStats,
  TrafficSource,
  SemanticAnnotation,
  createDefaultFilter,
} from '../models/traffic.model';
import { WebSocketService } from './websocket.service';

const MAX_BUFFER_SIZE = 2000;

interface AnnotationRule {
  pattern: RegExp;
  phase: string;
  service: string;
  action: string;
  importance: 'high' | 'medium' | 'low';
}

const URL_ANNOTATION_RULES: AnnotationRule[] = [
  { pattern: /\/demo\/api\/v1\/demo\/scenarios|\/demo\//, phase: 'seeding', service: 'Demo Seeder', action: 'Demo scenario operation', importance: 'high' },
  { pattern: /\/fhir\//, phase: 'pipeline', service: 'FHIR Service', action: 'FHIR resource operation', importance: 'high' },
  { pattern: /\/cql-engine\//, phase: 'pipeline', service: 'CQL Engine', action: 'CQL evaluation', importance: 'high' },
  { pattern: /\/quality-measure\//, phase: 'analytics', service: 'Quality Measure', action: 'Quality measure computation', importance: 'high' },
  { pattern: /\/care-gap\//, phase: 'analytics', service: 'Care Gap', action: 'Care gap analysis', importance: 'medium' },
  { pattern: /\/api\/v1\/audit/, phase: 'security', service: 'Audit', action: 'Audit log operation', importance: 'medium' },
  { pattern: /\/api\/v1\/compliance/, phase: 'security', service: 'Compliance', action: 'Compliance check', importance: 'medium' },
  { pattern: /\/monitoring\/prometheus/, phase: 'performance', service: 'Prometheus', action: 'Metrics query', importance: 'low' },
  { pattern: /\/actuator\/health/, phase: 'operations', service: 'Health Check', action: 'Health check', importance: 'low' },
  { pattern: /\/patient\//, phase: 'pipeline', service: 'Patient Service', action: 'Patient data operation', importance: 'medium' },
];

const WS_EVENT_ANNOTATIONS: Record<string, SemanticAnnotation> = {
  batch_progress: { phase: 'pipeline', service: 'Batch Engine', action: 'Batch progress update', importance: 'high' },
  evaluation_progress: { phase: 'pipeline', service: 'CQL Engine', action: 'Evaluation progress', importance: 'medium' },
  CARE_GAP_IDENTIFIED: { phase: 'analytics', service: 'Care Gap', action: 'Care gap identified', importance: 'high' },
  CARE_GAP_ADDRESSED: { phase: 'analytics', service: 'Care Gap', action: 'Care gap addressed', importance: 'high' },
  subscribe: { phase: 'operations', service: 'WebSocket', action: 'Channel subscription', importance: 'low' },
};

let wsFrameIdCounter = 0;

@Injectable({ providedIn: 'root' })
export class TrafficCaptureService {
  private ws = inject(WebSocketService);

  private buffer: TrafficRecord[] = [];
  private recordsSubject = new BehaviorSubject<TrafficRecord[]>([]);
  private filterSubject = new BehaviorSubject<TrafficFilter>(createDefaultFilter());
  private captureCountLastWindow = 0;
  private windowStart = Date.now();

  constructor() {
    this.ws.rawFrame$.subscribe(frame => {
      let payload = frame.data;
      let eventType: string | undefined;
      if (typeof payload === 'string') {
        try {
          payload = JSON.parse(payload);
        } catch { /* keep raw */ }
      }
      if (typeof payload === 'object' && payload !== null && 'type' in payload) {
        eventType = (payload as Record<string, unknown>)['type'] as string;
      }
      const record: TrafficRecord = {
        id: `ws-main-${++wsFrameIdCounter}`,
        timestamp: frame.timestamp,
        source: 'websocket-main',
        direction: frame.direction,
        eventType,
        payload,
        annotation: { phase: '', action: '', service: '', importance: 'low' },
      };
      this.capture(record);
    });
  }

  trafficRecords$ = this.recordsSubject.asObservable();

  filteredRecords$: Observable<TrafficRecord[]> = combineLatest([
    this.recordsSubject,
    this.filterSubject,
  ]).pipe(
    map(([records, filter]) => this.applyFilter(records, filter)),
  );

  stats$: Observable<TrafficStats> = combineLatest([
    this.recordsSubject,
    interval(1000).pipe(startWith(0)),
  ]).pipe(
    map(([records]) => this.computeStats(records)),
  );

  capture(record: TrafficRecord): void {
    if (!record.annotation || !record.annotation.phase) {
      record.annotation = this.annotate(record);
    }
    this.buffer.push(record);
    if (this.buffer.length > MAX_BUFFER_SIZE) {
      this.buffer = this.buffer.slice(this.buffer.length - MAX_BUFFER_SIZE);
    }
    this.captureCountLastWindow++;
    this.recordsSubject.next([...this.buffer]);
  }

  setFilter(filter: TrafficFilter): void {
    this.filterSubject.next(filter);
  }

  getFilter(): TrafficFilter {
    return this.filterSubject.value;
  }

  clear(): void {
    this.buffer = [];
    this.recordsSubject.next([]);
  }

  private annotate(record: TrafficRecord): SemanticAnnotation {
    // URL-based annotation for HTTP records
    if (record.url) {
      for (const rule of URL_ANNOTATION_RULES) {
        if (rule.pattern.test(record.url)) {
          return {
            phase: rule.phase,
            service: rule.service,
            action: this.buildHttpAction(record, rule),
            importance: rule.importance,
          };
        }
      }
    }

    // WebSocket event-based annotation
    if (record.eventType && WS_EVENT_ANNOTATIONS[record.eventType]) {
      return WS_EVENT_ANNOTATIONS[record.eventType];
    }

    // SSE source annotation
    if (record.source === 'sse-seed') {
      return { phase: 'seeding', service: 'SSE Stream', action: 'Seed progress event', importance: 'medium' };
    }
    if (record.source === 'ws-devops') {
      return { phase: 'operations', service: 'DevOps Logs', action: 'DevOps log entry', importance: 'low' };
    }
    if (record.source === 'ws-health-scores') {
      return { phase: 'analytics', service: 'Health Scores', action: 'Health score update', importance: 'medium' };
    }
    if (record.source === 'ws-subscriptions') {
      return { phase: 'pipeline', service: 'FHIR Subscriptions', action: 'Subscription notification', importance: 'medium' };
    }

    return { phase: 'unknown', service: 'Unknown', action: 'Unknown operation', importance: 'low' };
  }

  private buildHttpAction(record: TrafficRecord, rule: AnnotationRule): string {
    if (record.method) {
      return `${record.method} ${rule.service}`;
    }
    return rule.action;
  }

  private applyFilter(records: TrafficRecord[], filter: TrafficFilter): TrafficRecord[] {
    return records.filter(r => {
      if (!filter.sources.has(r.source)) return false;
      if (filter.direction !== 'all' && r.direction !== filter.direction) return false;
      if (filter.phase !== 'all' && r.annotation.phase !== filter.phase) return false;
      if (filter.statusFilter === 'success' && r.statusCode && r.statusCode >= 400) return false;
      if (filter.statusFilter === 'error' && r.statusCode !== undefined && r.statusCode < 400) return false;
      if (filter.searchText) {
        const text = filter.searchText.toLowerCase();
        const searchable = [
          r.url,
          r.annotation.action,
          r.annotation.service,
          r.eventType,
          r.method,
        ].filter(Boolean).join(' ').toLowerCase();
        if (!searchable.includes(text)) return false;
      }
      return true;
    });
  }

  private computeStats(records: TrafficRecord[]): TrafficStats {
    const bySource = {} as Record<TrafficSource, number>;
    const byStatus: Record<string, number> = {};
    let totalLatency = 0;
    let latencyCount = 0;
    let errorCount = 0;

    for (const r of records) {
      bySource[r.source] = (bySource[r.source] || 0) + 1;
      if (r.statusCode !== undefined) {
        const bucket = `${Math.floor(r.statusCode / 100)}xx`;
        byStatus[bucket] = (byStatus[bucket] || 0) + 1;
        if (r.statusCode >= 400) errorCount++;
      }
      if (r.durationMs !== undefined) {
        totalLatency += r.durationMs;
        latencyCount++;
      }
    }

    const now = Date.now();
    const elapsed = (now - this.windowStart) / 1000;
    const rps = elapsed > 0 ? this.captureCountLastWindow / elapsed : 0;
    if (elapsed > 5) {
      this.captureCountLastWindow = 0;
      this.windowStart = now;
    }

    return {
      totalCount: records.length,
      bySource,
      byStatus,
      avgLatencyMs: latencyCount > 0 ? Math.round(totalLatency / latencyCount) : 0,
      errorCount,
      recordsPerSec: Math.round(rps * 10) / 10,
    };
  }
}
