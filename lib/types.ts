// ─── Domain Models (aligned with backend) ────────────────────────────────────

export interface KpiMetric {
  requestsPerSecond: number;
  avgLatency: number;
  errorRate: number;
  uptime: number;
}

export interface SystemService {
  name: string;
  status: 'healthy' | 'degraded' | 'critical';
  cpu: number;
  memory: number;
  requests: number;
}

export interface Incident {
  id: string;
  type: string;
  component: string;
  severity: 'critical' | 'warning' | 'info';
  duration: string;
  resolved: boolean;
  timestamp: string;
  description: string;
}

export interface IncidentDetail {
  id: string;
  filename: string;
  uploaded_at: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  summary: string;
  root_cause: string;
  recommendations: string[];
  confidence_score: number;
  affected_services: string[];
  timeline: TimelineEventRaw[];
  similar_incidents: SimilarIncident[];
}

export interface TimelineEventRaw {
  timestamp: string | null;
  event: string;
  level: string;
}

export interface SimilarIncident {
  incident_id: string;
  filename: string;
  similarity_score: number;
  summary: string;
}

export interface AnalyticsDataPoint {
  time: string;
  requests: number;
  latency: number;
  errors: number;
}

export interface TimelineEvent {
  id: string;
  title: string;
  timestamp: string;
  status: 'critical' | 'warning' | 'info' | 'success';
}

export interface AlertMetrics {
  critical: number;
  warning: number;
  info: number;
  resolved: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  thinking?: string;
}

export interface Report {
  id: string;
  name: string;
  type: 'incident' | 'performance' | 'health';
  generatedAt: string;
  data: Record<string, unknown>;
}

export interface LogEntry {
  id: string;
  level: 'error' | 'warning' | 'info' | 'debug';
  message: string;
  service: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface UploadResult {
  filename: string;
  log_content: string;
  line_count: number;
  file_size_bytes: number;
  message: string;
}

export interface AnalyzeResult {
  incident_id: string;
  severity: string;
  summary: string;
  root_cause: string;
  recommendations: string[];
  confidence_score: number;
  affected_services: string[];
  timeline: TimelineEventRaw[];
  similar_incidents: SimilarIncident[];
  message: string;
}

// ─── WebSocket / Telemetry ────────────────────────────────────────────────────

export interface TelemetryEvent {
  type: 'log' | 'alert' | 'metric' | 'heartbeat';
  timestamp: string;
  level?: 'error' | 'warning' | 'info' | 'debug';
  service?: string;
  message?: string;
  metric?: string;
  value?: number;
}

// ─── API Response Envelope ───────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}
