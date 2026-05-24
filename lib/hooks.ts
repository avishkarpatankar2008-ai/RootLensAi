'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  fetchKpiMetrics,
  fetchSystemHealth,
  fetchAnalytics,
  fetchTimelineEvents,
  fetchAlertMetrics,
  fetchIncidents,
  fetchChatHistory,
  sendChatMessage,
  fetchLogs,
} from './api';
import type {
  KpiMetric,
  SystemService,
  AnalyticsDataPoint,
  TimelineEvent,
  AlertMetrics,
  Incident,
  ChatMessage,
  LogEntry,
  PaginatedResponse,
  TelemetryEvent,
} from './types';

// ─── Generic data-fetch hook ─────────────────────────────────────────────────

interface FetchState<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}

interface UseFetchOptions {
  refetchInterval?: number;
  enabled?: boolean;
}

function useFetch<T>(
  fn: () => Promise<T>,
  deps: unknown[] = [],
  opts: UseFetchOptions = {}
): FetchState<T> {
  const { refetchInterval, enabled = true } = opts;
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const mountedRef = useRef(true);

  const run = useCallback(async () => {
    if (!enabled) return;
    setLoading(true);
    setError(null);
    try {
      const result = await fn();
      if (mountedRef.current) setData(result);
    } catch (e) {
      if (mountedRef.current) setError(e instanceof Error ? e : new Error(String(e)));
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, [enabled, ...deps]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    mountedRef.current = true;
    run();
    if (refetchInterval) {
      const id = setInterval(run, refetchInterval);
      return () => { mountedRef.current = false; clearInterval(id); };
    }
    return () => { mountedRef.current = false; };
  }, [run, refetchInterval]);

  return { data, loading, error, refetch: run };
}

// ─── Exported hooks ───────────────────────────────────────────────────────────

export function useKpiMetrics(opts?: UseFetchOptions) {
  return useFetch<KpiMetric>(fetchKpiMetrics, [], opts);
}

export function useSystemHealth(opts?: UseFetchOptions) {
  return useFetch<SystemService[]>(fetchSystemHealth, [], opts);
}

export function useAnalytics(hours = 24, opts?: UseFetchOptions) {
  return useFetch<AnalyticsDataPoint[]>(() => fetchAnalytics(hours), [hours], opts);
}

export function useTimelineEvents(limit = 10, opts?: UseFetchOptions) {
  return useFetch<TimelineEvent[]>(() => fetchTimelineEvents(limit), [limit], opts);
}

export function useAlertMetrics(opts?: UseFetchOptions) {
  return useFetch<AlertMetrics>(fetchAlertMetrics, [], opts);
}

export function useIncidents(page = 1, pageSize = 10, opts?: UseFetchOptions) {
  return useFetch<PaginatedResponse<Incident>>(
    () => fetchIncidents(page, pageSize),
    [page, pageSize],
    opts
  );
}

export function useLogs(page = 1, pageSize = 20, level?: string, opts?: UseFetchOptions) {
  return useFetch<PaginatedResponse<LogEntry>>(
    () => fetchLogs(page, pageSize, level),
    [page, pageSize, level],
    opts
  );
}

// ─── Chat hook ───────────────────────────────────────────────────────────────

export function useChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  useEffect(() => {
    fetchChatHistory()
      .then((hist) => setMessages(hist))
      .catch(() => {})
      .finally(() => setHistoryLoaded(true));
  }, []);

  const send = useCallback(async (text: string, incidentId?: string) => {
    const userMsg: ChatMessage = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);
    setError(null);
    try {
      const reply = await sendChatMessage(text, messages, { incidentId });
      setMessages((prev) => [...prev, reply]);
      return reply;
    } catch (e) {
      const err = e instanceof Error ? e : new Error(String(e));
      setError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [messages]);

  return { messages, loading, error, send, historyLoaded };
}

// ─── Live telemetry streaming hook (WebSocket) ───────────────────────────────

interface UseLiveTelemetryOptions {
  maxEvents?: number;
}

export function useLiveTelemetry(opts: UseLiveTelemetryOptions = {}) {
  const { maxEvents = 100 } = opts;
  const [events, setEvents] = useState<TelemetryEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    const BACKEND_URL =
      (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_BACKEND_URL) ||
      'http://localhost:8000';
    const wsUrl = BACKEND_URL.replace(/^http/, 'ws') + '/api/ws/telemetry';

    try {
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => setConnected(true);
      ws.onclose = () => {
        setConnected(false);
        // Reconnect after 5s
        reconnectRef.current = setTimeout(connect, 5000);
      };
      ws.onerror = () => ws.close();
      ws.onmessage = (evt) => {
        try {
          const event: TelemetryEvent = JSON.parse(evt.data);
          setEvents((prev) => [event, ...prev].slice(0, maxEvents));
        } catch {}
      };
    } catch {}
  }, [maxEvents]);

  useEffect(() => {
    connect();
    return () => {
      wsRef.current?.close();
      if (reconnectRef.current) clearTimeout(reconnectRef.current);
    };
  }, [connect]);

  return { events, connected };
}
