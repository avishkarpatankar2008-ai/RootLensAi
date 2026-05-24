/**
 * RootLensAI API Client
 * All requests go directly to the FastAPI backend.
 * The Next.js API routes are no longer used — frontend calls backend directly.
 */
import type {
  KpiMetric,
  SystemService,
  Incident,
  IncidentDetail,
  AnalyticsDataPoint,
  TimelineEvent,
  AlertMetrics,
  ChatMessage,
  Report,
  LogEntry,
  UploadResult,
  AnalyzeResult,
  ApiResponse,
  PaginatedResponse,
} from './types';

// ─── Config ──────────────────────────────────────────────────────────────────

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'http://localhost:8000';

const API_BASE = `${BACKEND_URL}/api`;
const RETRY_COUNT = 2;
const RETRY_DELAY_MS = 1000;

// ─── Core fetch ──────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public status: number,
    public statusText: string,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  retries = RETRY_COUNT
): Promise<T> {
  const url = `${API_BASE}${path}`;
  try {
    const res = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      let detail = res.statusText;
      try {
        const body = await res.json();
        detail = body?.detail || body?.error || detail;
      } catch {}
      throw new ApiError(res.status, res.statusText, `${res.status}: ${detail}`);
    }

    return (await res.json()) as T;
  } catch (err) {
    if (
      retries > 0 &&
      err instanceof ApiError &&
      err.status >= 500
    ) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
      return apiFetch<T>(path, options, retries - 1);
    }
    throw err;
  }
}

/** Unwrap the { success, data } envelope or throw. */
function unwrap<T>(res: ApiResponse<T>): T {
  if (!res.success || res.data === undefined) {
    throw new Error(res.error || 'Empty response from server');
  }
  return res.data;
}

// ─── KPI Metrics ─────────────────────────────────────────────────────────────

export async function fetchKpiMetrics(): Promise<KpiMetric> {
  const res = await apiFetch<ApiResponse<KpiMetric>>('/kpi-metrics');
  return unwrap(res);
}

// ─── System Health ────────────────────────────────────────────────────────────

export async function fetchSystemHealth(): Promise<SystemService[]> {
  const res = await apiFetch<ApiResponse<SystemService[]>>('/system-health');
  return unwrap(res);
}

// ─── Analytics ───────────────────────────────────────────────────────────────

export async function fetchAnalytics(hours = 24): Promise<AnalyticsDataPoint[]> {
  const res = await apiFetch<ApiResponse<AnalyticsDataPoint[]>>(`/analytics?hours=${hours}`);
  return unwrap(res);
}

// ─── Timeline Events ─────────────────────────────────────────────────────────

export async function fetchTimelineEvents(limit = 10): Promise<TimelineEvent[]> {
  const res = await apiFetch<ApiResponse<TimelineEvent[]>>(`/timeline-events?limit=${limit}`);
  return unwrap(res);
}

// ─── Alert Metrics ───────────────────────────────────────────────────────────

export async function fetchAlertMetrics(): Promise<AlertMetrics> {
  const res = await apiFetch<ApiResponse<AlertMetrics>>('/alerts-metrics');
  return unwrap(res);
}

// ─── Incidents ───────────────────────────────────────────────────────────────

export async function fetchIncidents(
  page = 1,
  pageSize = 10
): Promise<PaginatedResponse<Incident>> {
  const res = await apiFetch<ApiResponse<PaginatedResponse<Incident>>>(
    `/incidents?page=${page}&pageSize=${pageSize}`
  );
  return unwrap(res);
}

export async function fetchIncidentDetail(id: string): Promise<IncidentDetail> {
  const res = await apiFetch<ApiResponse<IncidentDetail>>(`/incidents/${id}`);
  return unwrap(res);
}

// ─── Logs ────────────────────────────────────────────────────────────────────

export async function fetchLogs(
  page = 1,
  pageSize = 20,
  level?: string
): Promise<PaginatedResponse<LogEntry>> {
  const q = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
  if (level) q.set('level', level);
  const res = await apiFetch<ApiResponse<PaginatedResponse<LogEntry>>>(`/logs?${q}`);
  return unwrap(res);
}

// ─── Chat ────────────────────────────────────────────────────────────────────

export async function fetchChatHistory(): Promise<ChatMessage[]> {
  const res = await apiFetch<ApiResponse<ChatMessage[]>>('/chat/history');
  return unwrap(res);
}

export interface SendChatOptions {
  incidentId?: string;
}

export async function sendChatMessage(
  userMessage: string,
  history: ChatMessage[],
  opts: SendChatOptions = {}
): Promise<ChatMessage> {
  const messages = [
    ...history.map((m) => ({ role: m.role, content: m.content })),
    { role: 'user', content: userMessage },
  ];
  const body: Record<string, unknown> = { messages };
  if (opts.incidentId) body.incident_id = opts.incidentId;

  const res = await apiFetch<ApiResponse<ChatMessage>>('/chat', {
    method: 'POST',
    body: JSON.stringify(body),
  });
  return unwrap(res);
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export async function fetchReports(): Promise<Report[]> {
  const res = await apiFetch<ApiResponse<Report[]>>('/reports');
  return unwrap(res);
}

export async function generateReport(
  type: 'incident' | 'performance' | 'health'
): Promise<Report> {
  const res = await apiFetch<ApiResponse<Report>>('/reports/generate', {
    method: 'POST',
    body: JSON.stringify({ type }),
  });
  return unwrap(res);
}

// ─── Upload + Analyze ────────────────────────────────────────────────────────

export async function uploadLog(file: File): Promise<UploadResult> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await fetch(`${API_BASE}/upload-log`, {
    method: 'POST',
    body: formData,
    // No Content-Type header — browser sets multipart/form-data boundary automatically
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new ApiError(res.status, res.statusText, body?.detail || res.statusText);
  }

  const json: ApiResponse<UploadResult> = await res.json();
  return unwrap(json);
}

export async function analyzeLog(
  logContent: string,
  filename: string
): Promise<AnalyzeResult> {
  const res = await apiFetch<ApiResponse<AnalyzeResult>>('/analyze', {
    method: 'POST',
    body: JSON.stringify({ log_content: logContent, filename }),
  });
  return unwrap(res);
}

export async function downloadIncidentReport(incidentId: string): Promise<void> {
  const url = `${API_BASE}/incidents/${incidentId}/report`;
  const res = await fetch(url);
  if (!res.ok) throw new ApiError(res.status, res.statusText, 'Failed to download report');
  const blob = await res.blob();
  const objUrl = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = objUrl;
  a.download = `incident_report_${incidentId.slice(0, 8)}.pdf`;
  a.click();
  URL.revokeObjectURL(objUrl);
}
