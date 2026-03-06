import { Injectable, NgZone } from '@angular/core';
import { Subject, BehaviorSubject } from 'rxjs';
import { distinctUntilChanged, share } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export enum WebSocketStatus {
  CONNECTING = 'CONNECTING',
  CONNECTED = 'CONNECTED',
  DISCONNECTED = 'DISCONNECTED',
  ERROR = 'ERROR',
  RECONNECTING = 'RECONNECTING',
}

export interface BatchProgressEvent {
  batchId: string;
  tenantId?: string;
  measureId?: string;
  measureName?: string;
  totalPatients: number;
  completedCount: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  avgDurationMs: number;
  currentThroughput: number;
  elapsedTimeMs: number;
  estimatedTimeRemainingMs?: number;
  denominatorCount?: number;
  numeratorCount?: number;
  cumulativeComplianceRate?: number;
  timestamp: string;
  status: 'IN_PROGRESS' | 'COMPLETED' | 'FAILED';
  completionPercentage?: number;
}

export interface EvaluationProgressEvent {
  batchId?: string;
  patientId: string;
  status: string;
  progress: number;
  message?: string;
  timestamp: string;
}

export interface CareGapNotificationEvent {
  type: 'CARE_GAP_IDENTIFIED' | 'CARE_GAP_ADDRESSED';
  gapId: string;
  patientId: string;
  patientName?: string;
  title: string;
  message: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  category: string;
  gapType: string;
  qualityMeasure?: string;
  dueDate?: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  timestamp: string;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

@Injectable({ providedIn: 'root' })
export class WebSocketService {
  private socket?: WebSocket;
  private reconnectAttempts = 0;
  private readonly maxReconnectAttempts = 5;
  private readonly reconnectDelay = 2000;
  private reconnectTimer?: ReturnType<typeof setTimeout>;

  private statusSubject = new BehaviorSubject<WebSocketStatus>(WebSocketStatus.DISCONNECTED);
  private batchProgressSubject = new Subject<BatchProgressEvent>();
  private evaluationProgressSubject = new Subject<EvaluationProgressEvent>();
  private careGapNotificationSubject = new Subject<CareGapNotificationEvent>();
  private errorSubject = new Subject<Error>();
  private rawFrameSubject = new Subject<{ direction: 'inbound' | 'outbound'; data: unknown; timestamp: number }>();

  public rawFrame$ = this.rawFrameSubject.asObservable().pipe(share());

  public status$ = this.statusSubject.asObservable().pipe(distinctUntilChanged(), share());
  public batchProgress$ = this.batchProgressSubject.asObservable().pipe(share());
  public evaluationProgress$ = this.evaluationProgressSubject.asObservable().pipe(share());
  public careGapNotification$ = this.careGapNotificationSubject.asObservable().pipe(share());
  public error$ = this.errorSubject.asObservable().pipe(share());

  private readonly wsUrl = environment.wsEndpoint;

  constructor(private ngZone: NgZone) {}

  connect(): void {
    if (this.socket && (this.socket.readyState === WebSocket.OPEN || this.socket.readyState === WebSocket.CONNECTING)) {
      return;
    }

    this.statusSubject.next(WebSocketStatus.CONNECTING);

    try {
      this.ngZone.runOutsideAngular(() => {
        this.socket = new WebSocket(this.wsUrl);
        this.socket.onopen = (e) => this.ngZone.run(() => this.onOpen(e));
        this.socket.onmessage = (e) => this.ngZone.run(() => this.onMessage(e));
        this.socket.onerror = (e) => this.ngZone.run(() => this.onError(e));
        this.socket.onclose = (e) => this.ngZone.run(() => this.onClose(e));
      });
    } catch (error) {
      this.statusSubject.next(WebSocketStatus.ERROR);
      this.errorSubject.next(error as Error);
      this.scheduleReconnect();
    }
  }

  disconnect(): void {
    clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = undefined;
    }
    this.reconnectAttempts = 0;
    this.statusSubject.next(WebSocketStatus.DISCONNECTED);
  }

  getStatus(): WebSocketStatus {
    return this.statusSubject.value;
  }

  isConnected(): boolean {
    return this.statusSubject.value === WebSocketStatus.CONNECTED;
  }

  private onOpen(_event: Event): void {
    this.statusSubject.next(WebSocketStatus.CONNECTED);
    this.reconnectAttempts = 0;
    this.sendMessage({
      type: 'subscribe',
      events: ['batch_progress', 'evaluation_progress', 'care_gap_notification'],
    });
  }

  private onMessage(event: MessageEvent): void {
    try {
      this.rawFrameSubject.next({ direction: 'inbound', data: event.data, timestamp: Date.now() });
      const data = JSON.parse(event.data);
      if (data.type === 'CARE_GAP_IDENTIFIED' || data.type === 'CARE_GAP_ADDRESSED') {
        this.handleCareGapNotification(data);
      } else if (data.type === 'batch_progress' || data.batchId) {
        this.handleBatchProgress(data);
      } else if (data.type === 'evaluation_progress' || data.patientId) {
        this.handleEvaluationProgress(data);
      }
    } catch {
      this.errorSubject.next(new Error('Failed to parse WebSocket message'));
    }
  }

  private onError(_event: Event): void {
    this.statusSubject.next(WebSocketStatus.ERROR);
    this.errorSubject.next(new Error('WebSocket connection error'));
  }

  private onClose(event: CloseEvent): void {
    this.statusSubject.next(WebSocketStatus.DISCONNECTED);
    this.socket = undefined;
    if (event.code !== 1000) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    let delay: number;
    if (this.reconnectAttempts <= this.maxReconnectAttempts) {
      delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    } else {
      delay = 30000;
    }
    this.statusSubject.next(WebSocketStatus.RECONNECTING);
    this.reconnectTimer = setTimeout(() => this.connect(), delay);
  }

  private handleBatchProgress(data: any): void {
    const totalPatients = data.totalPatients ?? 0;
    const completedCount = data.completedCount ?? data.completedPatients ?? 0;
    const successCount = data.successCount ?? data.successfulEvaluations ?? 0;
    const failedCount = data.failedCount ?? data.failedEvaluations ?? 0;

    this.batchProgressSubject.next({
      batchId: data.batchId || data.id,
      tenantId: data.tenantId,
      measureId: data.measureId,
      measureName: data.measureName || data.currentMeasure,
      totalPatients,
      completedCount,
      successCount,
      failedCount,
      pendingCount: data.pendingCount ?? 0,
      avgDurationMs: data.avgDurationMs ?? data.averageDurationMs ?? 0,
      currentThroughput: data.currentThroughput ?? data.throughputPerSecond ?? 0,
      elapsedTimeMs: data.elapsedTimeMs ?? 0,
      estimatedTimeRemainingMs: data.estimatedTimeRemainingMs,
      denominatorCount: data.denominatorCount,
      numeratorCount: data.numeratorCount,
      cumulativeComplianceRate: data.cumulativeComplianceRate,
      timestamp: data.timestamp || new Date().toISOString(),
      status: data.status || 'IN_PROGRESS',
      completionPercentage: data.completionPercentage ?? (totalPatients > 0 ? (completedCount / totalPatients) * 100 : 0),
    });
  }

  private handleEvaluationProgress(data: any): void {
    this.evaluationProgressSubject.next({
      batchId: data.batchId,
      patientId: data.patientId,
      status: data.status || 'PENDING',
      progress: data.progress || 0,
      message: data.message,
      timestamp: data.timestamp || new Date().toISOString(),
    });
  }

  private handleCareGapNotification(data: any): void {
    this.careGapNotificationSubject.next({
      type: data.notificationType || data.type,
      gapId: data.metadata?.careGapId || data.gapId || '',
      patientId: data.patientId || '',
      patientName: data.templateVariables?.patientName || data.patientName,
      title: data.title || '',
      message: data.message || '',
      priority: data.metadata?.priority || data.priority || 'MEDIUM',
      category: data.metadata?.category || data.category || 'UNKNOWN',
      gapType: data.metadata?.gapType || data.gapType || 'UNKNOWN',
      qualityMeasure: data.metadata?.qualityMeasure || data.qualityMeasure,
      dueDate: data.templateVariables?.dueDate || data.dueDate,
      severity: data.severity || 'MEDIUM',
      timestamp: data.timestamp || new Date().toISOString(),
      actionUrl: data.templateVariables?.actionUrl || data.actionUrl,
      metadata: data.metadata,
    });
  }

  private sendMessage(message: unknown): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      this.rawFrameSubject.next({ direction: 'outbound', data: message, timestamp: Date.now() });
      this.socket.send(JSON.stringify(message));
    }
  }

  dispose(): void {
    this.disconnect();
    this.statusSubject.complete();
    this.batchProgressSubject.complete();
    this.evaluationProgressSubject.complete();
    this.careGapNotificationSubject.complete();
    this.errorSubject.complete();
    this.rawFrameSubject.complete();
  }
}
