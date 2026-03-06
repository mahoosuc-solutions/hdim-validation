export type TrafficSource =
  | 'http-interceptor'
  | 'websocket-main'
  | 'sse-seed'
  | 'ws-devops'
  | 'ws-health-scores'
  | 'ws-subscriptions';

export type TrafficDirection = 'outbound' | 'inbound' | 'bidirectional';

export interface SemanticAnnotation {
  phase: string;
  action: string;
  service: string;
  importance: 'high' | 'medium' | 'low';
}

export interface TrafficRecord {
  id: string;
  timestamp: number;
  source: TrafficSource;
  direction: TrafficDirection;
  // HTTP fields
  method?: string;
  url?: string;
  statusCode?: number;
  requestHeaders?: Record<string, string>;
  responseHeaders?: Record<string, string>;
  requestBody?: unknown;
  responseBody?: unknown;
  durationMs?: number;
  requestSize?: number;
  responseSize?: number;
  // WebSocket/SSE fields
  eventType?: string;
  payload?: unknown;
  // Semantic
  annotation: SemanticAnnotation;
}

export interface TrafficFilter {
  sources: Set<TrafficSource>;
  direction: TrafficDirection | 'all';
  phase: string;
  statusFilter: 'all' | 'success' | 'error';
  searchText: string;
}

export interface TrafficStats {
  totalCount: number;
  bySource: Record<TrafficSource, number>;
  byStatus: Record<string, number>;
  avgLatencyMs: number;
  errorCount: number;
  recordsPerSec: number;
}

export function createDefaultFilter(): TrafficFilter {
  return {
    sources: new Set<TrafficSource>([
      'http-interceptor',
      'websocket-main',
      'sse-seed',
      'ws-devops',
      'ws-health-scores',
      'ws-subscriptions',
    ]),
    direction: 'all',
    phase: 'all',
    statusFilter: 'all',
    searchText: '',
  };
}
