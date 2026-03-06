import { Injectable, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subject, Observable } from 'rxjs';
import { distinctUntilChanged, share, takeUntil, map } from 'rxjs/operators';
import {
  SystemEvent, SystemEventType, LiveMetrics, PipelineState,
  EventFilterOptions, DEFAULT_PIPELINE_NODES, DEFAULT_PIPELINE_CONNECTIONS,
  DEFAULT_LIVE_METRICS, createSystemEvent,
} from '../models/system-event.model';
import { WebSocketService, WebSocketStatus, BatchProgressEvent, CareGapNotificationEvent } from './websocket.service';

@Injectable({ providedIn: 'root' })
export class SystemEventsService implements OnDestroy {
  private readonly MAX_EVENTS = 100;
  private destroy$ = new Subject<void>();

  private eventsBuffer: SystemEvent[] = [];
  private eventsSubject = new BehaviorSubject<SystemEvent[]>([]);
  private latestEventSubject = new Subject<SystemEvent>();

  private pipelineSubject = new BehaviorSubject<PipelineState>({
    nodes: [...DEFAULT_PIPELINE_NODES],
    connections: [...DEFAULT_PIPELINE_CONNECTIONS],
    lastUpdated: new Date().toISOString(),
  });

  private metricsSubject = new BehaviorSubject<LiveMetrics>({ ...DEFAULT_LIVE_METRICS });
  private connectionStatusSubject = new BehaviorSubject<'connected' | 'disconnected'>('disconnected');
  private isPausedSubject = new BehaviorSubject<boolean>(false);

  public events$ = this.eventsSubject.asObservable().pipe(share());
  public latestEvent$ = this.latestEventSubject.asObservable().pipe(share());
  public pipeline$ = this.pipelineSubject.asObservable().pipe(distinctUntilChanged(), share());
  public metrics$ = this.metricsSubject.asObservable().pipe(distinctUntilChanged(), share());
  public connectionStatus$ = this.connectionStatusSubject.asObservable();
  public isPaused$ = this.isPausedSubject.asObservable();

  private operationResults: boolean[] = [];
  private processingTimes: number[] = [];

  constructor(private wsService: WebSocketService) {
    this.initializeWebSocketSubscription();
  }

  private initializeWebSocketSubscription(): void {
    this.wsService.status$.pipe(takeUntil(this.destroy$)).subscribe(status => {
      if (status === WebSocketStatus.CONNECTED) {
        this.connectionStatusSubject.next('connected');
      } else if (status === WebSocketStatus.DISCONNECTED || status === WebSocketStatus.ERROR) {
        this.connectionStatusSubject.next('disconnected');
      }
    });

    this.wsService.batchProgress$.pipe(takeUntil(this.destroy$))
      .subscribe(event => this.handleBatchProgressEvent(event));

    this.wsService.evaluationProgress$.pipe(takeUntil(this.destroy$))
      .subscribe(event => this.handleEvaluationProgressEvent(event));

    this.wsService.careGapNotification$.pipe(takeUntil(this.destroy$))
      .subscribe(event => this.handleCareGapNotification(event));
  }

  connect(): void {
    this.wsService.connect();
  }

  disconnect(): void {
    this.wsService.disconnect();
    this.connectionStatusSubject.next('disconnected');
  }

  private handleBatchProgressEvent(event: BatchProgressEvent): void {
    if (this.isPausedSubject.value) return;

    let eventType: SystemEventType;
    let severity: 'info' | 'success' | 'error' = 'info';

    if (event.status === 'COMPLETED') { eventType = 'BATCH_COMPLETED'; severity = 'success'; }
    else if (event.status === 'FAILED') { eventType = 'EVALUATION_FAILED'; severity = 'error'; }
    else { eventType = 'BATCH_PROGRESS'; }

    const systemEvent = createSystemEvent(
      eventType,
      `Batch ${event.batchId.substring(0, 8)}`,
      `${event.completedCount}/${event.totalPatients} patients processed`,
      {
        severity,
        source: 'cql-engine',
        measure: event.measureName ? { id: event.measureId || '', name: event.measureName } : undefined,
        metadata: {
          batchId: event.batchId,
          completedCount: event.completedCount,
          totalPatients: event.totalPatients,
          complianceRate: event.cumulativeComplianceRate,
        },
        durationMs: event.avgDurationMs,
      }
    );

    this.addEvent(systemEvent);
    this.updatePipelineFromBatch(event);
    this.updateMetricsFromBatch(event);
  }

  private handleEvaluationProgressEvent(event: any): void {
    if (this.isPausedSubject.value) return;

    const eventType: SystemEventType = event.status === 'COMPLETED' ? 'EVALUATION_COMPLETED' :
      event.status === 'FAILED' ? 'EVALUATION_FAILED' : 'EVALUATION_STARTED';

    const systemEvent = createSystemEvent(
      eventType,
      `Evaluation ${event.status}`,
      event.message || `Patient ${event.patientId}`,
      {
        severity: event.status === 'COMPLETED' ? 'success' : event.status === 'FAILED' ? 'error' : 'info',
        source: 'cql-engine',
        patient: { id: event.patientId },
        metadata: { progress: event.progress },
      }
    );
    this.addEvent(systemEvent);
  }

  private handleCareGapNotification(event: CareGapNotificationEvent): void {
    if (this.isPausedSubject.value) return;

    const eventType: SystemEventType = event.type === 'CARE_GAP_ADDRESSED' ? 'CARE_GAP_CLOSED' : 'CARE_GAP_DETECTED';
    const severity = event.type === 'CARE_GAP_ADDRESSED' ? 'success' as const :
      (event.priority === 'CRITICAL' || event.priority === 'HIGH') ? 'warning' as const : 'info' as const;

    const systemEvent = createSystemEvent(eventType, event.title, event.message, {
      severity,
      source: 'quality-measure-service',
      patient: { id: event.patientId, name: event.patientName },
      metadata: { gapId: event.gapId, gapType: event.gapType, priority: event.priority },
    });
    this.addEvent(systemEvent);
  }

  addEvent(event: SystemEvent): void {
    if (this.isPausedSubject.value) return;
    this.eventsBuffer.unshift(event);
    if (this.eventsBuffer.length > this.MAX_EVENTS) {
      this.eventsBuffer = this.eventsBuffer.slice(0, this.MAX_EVENTS);
    }
    this.eventsSubject.next([...this.eventsBuffer]);
    this.latestEventSubject.next(event);

    this.operationResults.unshift(event.severity !== 'error');
    if (this.operationResults.length > 100) this.operationResults.pop();

    if (event.durationMs) {
      this.processingTimes.unshift(event.durationMs);
      if (this.processingTimes.length > 100) this.processingTimes.pop();
    }
  }

  getFilteredEvents(filter: EventFilterOptions): Observable<SystemEvent[]> {
    return this.events$.pipe(
      map(events => events.filter(e => {
        if (filter.categories && !filter.categories.includes(e.category)) return false;
        if (filter.severities && !filter.severities.includes(e.severity)) return false;
        if (filter.types && !filter.types.includes(e.type)) return false;
        if (filter.patientId && e.patient?.id !== filter.patientId) return false;
        return true;
      }))
    );
  }

  clearEvents(): void {
    this.eventsBuffer = [];
    this.eventsSubject.next([]);
  }

  togglePause(): void {
    this.isPausedSubject.next(!this.isPausedSubject.value);
  }

  private updatePipelineFromBatch(event: BatchProgressEvent): void {
    const current = this.pipelineSubject.value;
    const nodes = current.nodes.map(node => {
      if (node.id === 'cql') {
        return { ...node, status: event.status === 'IN_PROGRESS' ? 'processing' as const : 'active' as const, throughput: event.currentThroughput || 0, lastActivity: new Date().toISOString() };
      }
      if (node.id === 'fhir' && event.status === 'IN_PROGRESS') {
        return { ...node, status: 'active' as const, throughput: event.currentThroughput || 0, lastActivity: new Date().toISOString() };
      }
      if (node.id === 'quality' && event.cumulativeComplianceRate !== undefined) {
        return { ...node, status: 'active' as const, lastActivity: new Date().toISOString() };
      }
      return node;
    });
    const connections = current.connections.map(conn => ({
      ...conn,
      isActive: event.status === 'IN_PROGRESS',
      throughput: event.status === 'IN_PROGRESS' ? event.currentThroughput || 0 : 0,
    }));
    this.pipelineSubject.next({ nodes, connections, lastUpdated: new Date().toISOString() });
  }

  private updateMetricsFromBatch(event: BatchProgressEvent): void {
    const current = this.metricsSubject.value;
    const successRate = this.operationResults.length > 0
      ? (this.operationResults.filter(r => r).length / this.operationResults.length) * 100 : 100;
    const avgTime = this.processingTimes.length > 0
      ? this.processingTimes.reduce((a, b) => a + b, 0) / this.processingTimes.length : 0;

    this.metricsSubject.next({
      ...current,
      patientsProcessed: event.completedCount,
      throughputPerSecond: event.currentThroughput || 0,
      complianceRate: event.cumulativeComplianceRate || current.complianceRate,
      successRate: Math.round(successRate * 10) / 10,
      avgProcessingTimeMs: Math.round(avgTime),
      lastUpdated: new Date().toISOString(),
    });
  }

  getCurrentEvents(): SystemEvent[] { return [...this.eventsBuffer]; }
  getCurrentMetrics(): LiveMetrics { return this.metricsSubject.value; }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.wsService.disconnect();
  }
}
