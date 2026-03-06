import { Injectable, NgZone } from '@angular/core';
import { environment } from '../../../environments/environment';
import { TrafficCaptureService } from './traffic-capture.service';
import { TrafficRecord, TrafficSource } from '../models/traffic.model';

interface BackendConnection {
  source: TrafficSource;
  close: () => void;
}

let eventIdCounter = 0;

@Injectable({ providedIn: 'root' })
export class BackendEventsService {
  private connections: BackendConnection[] = [];
  private reconnectTimers: ReturnType<typeof setTimeout>[] = [];
  private active = false;

  private readonly baseUrl = environment.apiGatewayUrl || '';
  private readonly wsBase = environment.wsEndpoint
    ? environment.wsEndpoint.replace(/\/ws\/evaluation-progress$/, '')
    : 'ws://localhost:18080';

  constructor(
    private capture: TrafficCaptureService,
    private ngZone: NgZone,
  ) {}

  connect(): void {
    if (this.active) return;
    this.active = true;
    console.info('[TrafficInspector] Connecting backend event streams...');
    this.connectSSESeed();
    this.connectWS('ws-devops', '/ws/devops/logs');
    this.connectWS('ws-health-scores', '/quality-measure/ws/health-scores');
    this.connectWS('ws-subscriptions', '/ws/subscriptions');
  }

  disconnect(): void {
    this.active = false;
    for (const timer of this.reconnectTimers) clearTimeout(timer);
    this.reconnectTimers = [];
    for (const conn of this.connections) {
      conn.close();
    }
    this.connections = [];
    console.info('[TrafficInspector] Disconnected backend event streams');
  }

  private connectSSESeed(): void {
    const url = `${this.baseUrl}/api/v1/demo/seed/stream`;
    try {
      const es = new EventSource(url);
      es.onmessage = (event) => {
        this.ngZone.run(() => {
          this.emitRecord('sse-seed', 'inbound', event.data, event.type || 'message');
        });
      };
      es.onerror = () => {
        console.warn('[TrafficInspector] SSE connection error:', url);
      };
      this.connections.push({ source: 'sse-seed', close: () => es.close() });
    } catch {
      // EventSource not supported or URL invalid — skip
    }
  }

  private connectWS(source: TrafficSource, path: string): void {
    const url = `${this.wsBase}${path}`;
    this.ngZone.runOutsideAngular(() => {
      try {
        const ws = new WebSocket(url);
        ws.onmessage = (event) => {
          this.ngZone.run(() => {
            this.emitRecord(source, 'inbound', event.data);
          });
        };
        ws.onerror = () => {
          console.warn('[TrafficInspector] WS connection failed:', source, url);
        };
        ws.onclose = () => {
          if (this.active) {
            const timer = setTimeout(() => this.connectWS(source, path), 5000);
            this.reconnectTimers.push(timer);
          }
        };
        this.connections.push({ source, close: () => ws.close() });
      } catch {
        // Connection failed — skip
      }
    });
  }

  private emitRecord(source: TrafficSource, direction: 'inbound' | 'outbound', rawData: unknown, eventType?: string): void {
    let payload: unknown = rawData;
    let parsedType = eventType;

    if (typeof rawData === 'string') {
      try {
        payload = JSON.parse(rawData);
        if (typeof payload === 'object' && payload !== null && 'type' in payload) {
          parsedType = (payload as Record<string, unknown>)['type'] as string;
        }
      } catch {
        // keep raw string
      }
    }

    const record: TrafficRecord = {
      id: `${source}-${++eventIdCounter}`,
      timestamp: Date.now(),
      source,
      direction,
      eventType: parsedType,
      payload,
      annotation: { phase: '', action: '', service: '', importance: 'low' },
    };
    this.capture.capture(record);
  }
}
