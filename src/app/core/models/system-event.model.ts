export type SystemEventType =
  | 'FHIR_RESOURCE_CREATED'
  | 'FHIR_RESOURCE_UPDATED'
  | 'FHIR_RESOURCE_DELETED'
  | 'FHIR_BUNDLE_IMPORTED'
  | 'EVALUATION_STARTED'
  | 'EVALUATION_COMPLETED'
  | 'EVALUATION_FAILED'
  | 'BATCH_STARTED'
  | 'BATCH_PROGRESS'
  | 'BATCH_COMPLETED'
  | 'MEASURE_CALCULATED'
  | 'COMPLIANCE_UPDATED'
  | 'HEALTH_SCORE_UPDATED'
  | 'CARE_GAP_DETECTED'
  | 'CARE_GAP_CLOSED'
  | 'CARE_GAP_ESCALATED'
  | 'CONSENT_GRANTED'
  | 'CONSENT_REVOKED'
  | 'CONSENT_EXPIRED'
  | 'SERVICE_STARTED'
  | 'SERVICE_STOPPED'
  | 'ERROR_OCCURRED';

export type EventCategory = 'fhir' | 'evaluation' | 'quality' | 'care-gap' | 'consent' | 'system';
export type EventSeverity = 'info' | 'success' | 'warning' | 'error';
export type PipelineNodeStatus = 'active' | 'idle' | 'processing' | 'error';

export interface SystemEvent {
  id: string;
  type: SystemEventType;
  category: EventCategory;
  severity: EventSeverity;
  title: string;
  description: string;
  timestamp: string;
  source: string;
  patient?: { id: string; name?: string; mrn?: string };
  measure?: { id: string; name: string };
  metadata?: Record<string, any>;
  durationMs?: number;
}

export interface LiveMetrics {
  patientsProcessed: number;
  patientsProcessedChange: number;
  throughputPerSecond: number;
  maxThroughput: number;
  complianceRate: number;
  complianceRateChange: number;
  openCareGaps: number;
  careGapsChange: number;
  successRate: number;
  avgProcessingTimeMs: number;
  lastUpdated: string;
}

export interface PipelineNode {
  id: string;
  name: string;
  description: string;
  status: PipelineNodeStatus;
  throughput: number;
  errorCount: number;
  lastActivity: string;
}

export interface PipelineConnection {
  id?: string;
  from: string;
  to: string;
  throughput: number;
  isActive: boolean;
}

export interface PipelineState {
  nodes: PipelineNode[];
  connections: PipelineConnection[];
  lastUpdated: string;
}

export interface EventFilterOptions {
  categories?: EventCategory[];
  severities?: EventSeverity[];
  types?: SystemEventType[];
  patientId?: string;
  startTime?: string;
  endTime?: string;
}

export function getEventIcon(type: SystemEventType): string {
  const iconMap: Record<SystemEventType, string> = {
    FHIR_RESOURCE_CREATED: 'add_circle',
    FHIR_RESOURCE_UPDATED: 'edit',
    FHIR_RESOURCE_DELETED: 'delete',
    FHIR_BUNDLE_IMPORTED: 'cloud_upload',
    EVALUATION_STARTED: 'play_arrow',
    EVALUATION_COMPLETED: 'check_circle',
    EVALUATION_FAILED: 'error',
    BATCH_STARTED: 'batch_prediction',
    BATCH_PROGRESS: 'pending',
    BATCH_COMPLETED: 'task_alt',
    MEASURE_CALCULATED: 'calculate',
    COMPLIANCE_UPDATED: 'verified',
    HEALTH_SCORE_UPDATED: 'health_and_safety',
    CARE_GAP_DETECTED: 'warning',
    CARE_GAP_CLOSED: 'check',
    CARE_GAP_ESCALATED: 'priority_high',
    CONSENT_GRANTED: 'thumb_up',
    CONSENT_REVOKED: 'thumb_down',
    CONSENT_EXPIRED: 'schedule',
    SERVICE_STARTED: 'power_settings_new',
    SERVICE_STOPPED: 'power_off',
    ERROR_OCCURRED: 'report_problem',
  };
  return iconMap[type] || 'info';
}

export function getCategoryFromType(type: SystemEventType): EventCategory {
  if (type.startsWith('FHIR_')) return 'fhir';
  if (type.startsWith('EVALUATION_') || type.startsWith('BATCH_')) return 'evaluation';
  if (type.startsWith('MEASURE_') || type.startsWith('COMPLIANCE_') || type.startsWith('HEALTH_SCORE_')) return 'quality';
  if (type.startsWith('CARE_GAP_')) return 'care-gap';
  if (type.startsWith('CONSENT_')) return 'consent';
  return 'system';
}

export function getSeverityColor(severity: EventSeverity): string {
  const map: Record<EventSeverity, string> = { info: 'primary', success: 'success', warning: 'warn', error: 'error' };
  return map[severity] || 'primary';
}

export function getNodeStatusColor(status: PipelineNodeStatus): string {
  const map: Record<PipelineNodeStatus, string> = { active: '#4caf50', idle: '#9e9e9e', processing: '#2196f3', error: '#f44336' };
  return map[status] || '#9e9e9e';
}

export function formatRelativeTime(timestamp: string): string {
  const diffSec = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
  if (diffSec < 5) return 'just now';
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  return `${Math.floor(diffHour / 24)}d ago`;
}

export function generateEventId(): string {
  return `evt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createSystemEvent(
  type: SystemEventType,
  title: string,
  description: string,
  options?: Partial<SystemEvent>
): SystemEvent {
  return {
    id: generateEventId(),
    type,
    category: getCategoryFromType(type),
    severity: 'info',
    title,
    description,
    timestamp: new Date().toISOString(),
    source: 'unknown',
    ...options,
  };
}

export const DEFAULT_PIPELINE_NODES: PipelineNode[] = [
  { id: 'fhir', name: 'FHIR Server', description: 'Patient data ingestion', status: 'idle', throughput: 0, errorCount: 0, lastActivity: new Date().toISOString() },
  { id: 'cql', name: 'CQL Engine', description: 'Quality measure evaluation', status: 'idle', throughput: 0, errorCount: 0, lastActivity: new Date().toISOString() },
  { id: 'quality', name: 'Quality Measures', description: 'Compliance calculation', status: 'idle', throughput: 0, errorCount: 0, lastActivity: new Date().toISOString() },
  { id: 'caregap', name: 'Care Gap Detector', description: 'Gap identification', status: 'idle', throughput: 0, errorCount: 0, lastActivity: new Date().toISOString() },
];

export const DEFAULT_PIPELINE_CONNECTIONS: PipelineConnection[] = [
  { from: 'fhir', to: 'cql', throughput: 0, isActive: false },
  { from: 'cql', to: 'quality', throughput: 0, isActive: false },
  { from: 'quality', to: 'caregap', throughput: 0, isActive: false },
];

export const DEFAULT_LIVE_METRICS: LiveMetrics = {
  patientsProcessed: 0,
  patientsProcessedChange: 0,
  throughputPerSecond: 0,
  maxThroughput: 10,
  complianceRate: 0,
  complianceRateChange: 0,
  openCareGaps: 0,
  careGapsChange: 0,
  successRate: 100,
  avgProcessingTimeMs: 0,
  lastUpdated: new Date().toISOString(),
};
