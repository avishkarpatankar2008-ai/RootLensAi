'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Activity, AlertTriangle, Bell, Clock,
  Zap, AlertCircle, CheckCircle, RefreshCw,
  TrendingUp, Server, Radio
} from 'lucide-react';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { DashboardContainer, SkeletonGrid, SkeletonChart, EmptyState, ErrorState } from '@/components/dashboard/LoadingStates';
import { HealthIndicator } from '@/components/dashboard/HealthIndicator';
import { TimelineEvent, StatusBadge } from '@/components/dashboard/StatusBadge';
import {
  useKpiMetrics, useSystemHealth, useIncidents, useAnalytics,
  useTimelineEvents, useAlertMetrics, useLiveTelemetry,
} from '@/lib/hooks';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Legend,
} from 'recharts';

const INTERVAL = 30_000;

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.07, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } }),
};

function SectionTitle({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">{children}</h2>
      {action && <div>{action}</div>}
    </div>
  );
}

function RefreshButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-colors">
      <RefreshCw className="w-3.5 h-3.5" />
    </button>
  );
}

export default function Dashboard() {
  const kpi = useKpiMetrics({ refetchInterval: INTERVAL });
  const health = useSystemHealth({ refetchInterval: INTERVAL });
  const incidents = useIncidents(1, 8, { refetchInterval: INTERVAL });
  const analytics = useAnalytics(24, { refetchInterval: 60_000 });
  const timeline = useTimelineEvents(8, { refetchInterval: INTERVAL });
  const alerts = useAlertMetrics({ refetchInterval: INTERVAL });
  const { events: liveEvents, connected } = useLiveTelemetry({ maxEvents: 20 });

  const tooltipStyle = {
    backgroundColor: '#111827',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '8px',
    fontSize: '11px',
    color: '#94a3b8',
  };

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[rgba(8,12,20,0.85)] backdrop-blur-xl">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-base font-bold text-white">Observability Dashboard</h1>
            <p className="text-xs text-slate-500">Real-time AI-powered monitoring</p>
          </div>
          <div className="flex items-center gap-3">
            {connected ? (
              <div className="live-badge">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </div>
            ) : (
              <div className="live-badge" style={{ color: '#94a3b8', borderColor: 'rgba(148,163,184,0.2)', background: 'rgba(148,163,184,0.05)' }}>
                <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
                Offline
              </div>
            )}
            <div className="text-xs text-slate-600 font-mono">
              {new Date().toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            </div>
          </div>
        </div>
      </header>

      <div className="px-6 py-6 space-y-6 max-w-[1600px] mx-auto">

        {/* ── KPI Row ── */}
        <motion.section custom={0} variants={fadeUp} initial="hidden" animate="visible">
          <SectionTitle action={<RefreshButton onClick={kpi.refetch} />}>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            System Metrics
          </SectionTitle>
          {kpi.error ? (
            <ErrorState message={kpi.error.message} onRetry={kpi.refetch} />
          ) : kpi.loading ? (
            <SkeletonGrid columns={4} />
          ) : kpi.data ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KpiCard label="Requests / sec" value={kpi.data.requestsPerSecond} unit="req/s" trend="up" icon={<Zap />} delay={0} />
              <KpiCard label="Avg Latency" value={kpi.data.avgLatency} unit="ms" trend={kpi.data.avgLatency > 300 ? 'down' : 'stable'} icon={<Clock />} delay={0.08} variant={kpi.data.avgLatency > 300 ? 'warning' : 'default'} />
              <KpiCard label="Error Rate" value={kpi.data.errorRate} unit="%" trend={kpi.data.errorRate > 5 ? 'down' : 'stable'} icon={<AlertCircle />} delay={0.16} variant={kpi.data.errorRate > 5 ? 'critical' : 'default'} />
              <KpiCard label="Uptime" value={kpi.data.uptime} unit="%" trend="up" icon={<CheckCircle />} delay={0.24} variant={kpi.data.uptime > 99 ? 'success' : kpi.data.uptime > 95 ? 'warning' : 'critical'} />
            </div>
          ) : (
            <EmptyState title="No metrics yet" description="Upload logs to start generating metrics" action={{ label: 'Upload Logs', onClick: () => location.href = '/upload' }} />
          )}
        </motion.section>

        {/* ── Alert Summary ── */}
        {alerts.data && (
          <motion.section custom={1} variants={fadeUp} initial="hidden" animate="visible">
            <SectionTitle>
              <Bell className="w-4 h-4 text-amber-400" />
              Alert Summary
            </SectionTitle>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Critical', value: alerts.data.critical, color: 'text-red-400', border: 'border-red-500/15', bg: 'bg-red-500/[0.06]' },
                { label: 'Warning', value: alerts.data.warning, color: 'text-amber-400', border: 'border-amber-500/15', bg: 'bg-amber-500/[0.06]' },
                { label: 'Info', value: alerts.data.info, color: 'text-blue-400', border: 'border-blue-500/15', bg: 'bg-blue-500/[0.06]' },
                { label: 'Resolved', value: alerts.data.resolved, color: 'text-emerald-400', border: 'border-emerald-500/15', bg: 'bg-emerald-500/[0.06]' },
              ].map((item, i) => (
                <motion.div
                  key={item.label}
                  custom={i * 0.06}
                  variants={fadeUp}
                  initial="hidden" animate="visible"
                  className={`glass-card ${item.border} ${item.bg} px-5 py-4 flex items-center justify-between`}
                >
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className={`text-2xl font-bold font-mono-num ${item.color}`}>{item.value}</p>
                  </div>
                  <AlertTriangle className={`w-6 h-6 opacity-20 ${item.color}`} />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* ── Health + Timeline Grid ── */}
        <motion.section custom={2} variants={fadeUp} initial="hidden" animate="visible">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* System Health */}
            <DashboardContainer className="lg:col-span-2">
              <SectionTitle action={<RefreshButton onClick={health.refetch} />}>
                <Server className="w-4 h-4 text-cyan-400" />
                Service Health
              </SectionTitle>
              {health.error ? (
                <ErrorState message={health.error.message} onRetry={health.refetch} />
              ) : health.loading ? (
                <div className="space-y-3">{[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-xl animate-shimmer" />)}</div>
              ) : health.data && health.data.length > 0 ? (
                <div className="space-y-2">
                  {health.data.slice(0, 6).map((svc, idx) => (
                    <HealthIndicator key={svc.name} name={svc.name} status={svc.status} cpu={svc.cpu} memory={svc.memory} requests={svc.requests} delay={idx * 0.07} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No services tracked" description="Analyze logs to monitor service health" action={{ label: 'Analyze Logs', onClick: () => location.href = '/upload' }} icon={<Server className="w-5 h-5 text-slate-600" />} />
              )}
            </DashboardContainer>

            {/* Recent Events */}
            <DashboardContainer>
              <SectionTitle>
                <Activity className="w-4 h-4 text-purple-400" />
                Recent Events
              </SectionTitle>
              {timeline.loading ? (
                <div className="space-y-3">{[...Array(6)].map((_, i) => <div key={i} className="h-8 rounded animate-shimmer" />)}</div>
              ) : timeline.data && timeline.data.length > 0 ? (
                <div>
                  {timeline.data.map((ev, idx) => (
                    <TimelineEvent key={ev.id} title={ev.title} timestamp={new Date(ev.timestamp)} status={ev.status} index={idx} />
                  ))}
                </div>
              ) : (
                <EmptyState title="No events" description="No timeline events yet" />
              )}
            </DashboardContainer>
          </div>
        </motion.section>

        {/* ── Analytics Chart ── */}
        <motion.section custom={3} variants={fadeUp} initial="hidden" animate="visible">
          <DashboardContainer>
            <SectionTitle action={<RefreshButton onClick={analytics.refetch} />}>
              <TrendingUp className="w-4 h-4 text-cyan-400" />
              24-Hour Analytics
            </SectionTitle>
            {analytics.error ? (
              <ErrorState message={analytics.error.message} onRetry={analytics.refetch} />
            ) : analytics.loading ? (
              <div className="h-64 rounded-lg animate-shimmer" />
            ) : analytics.data && analytics.data.some(d => d.requests > 0) ? (
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.data} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                    <defs>
                      <linearGradient id="gradReq" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#00d4ff" stopOpacity={0.2} />
                        <stop offset="95%" stopColor="#00d4ff" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="gradErr" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ff3b5c" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#ff3b5c" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 10 }} />
                    <YAxis stroke="rgba(255,255,255,0.25)" tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: 11, color: '#64748b' }} />
                    <Area type="monotone" dataKey="requests" stroke="#00d4ff" strokeWidth={1.5} fill="url(#gradReq)" name="Requests" dot={false} />
                    <Area type="monotone" dataKey="errors" stroke="#ff3b5c" strokeWidth={1.5} fill="url(#gradErr)" name="Errors" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <EmptyState title="No analytics data" description="Upload and analyze logs to see 24-hour trends" action={{ label: 'Upload Logs', onClick: () => location.href = '/upload' }} />
            )}
          </DashboardContainer>
        </motion.section>

        {/* ── Recent Incidents Table ── */}
        <motion.section custom={4} variants={fadeUp} initial="hidden" animate="visible">
          <DashboardContainer noPadding>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06]">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-red-400" />
                Recent Incidents
              </h2>
              <a href="/incidents" className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                View all →
              </a>
            </div>
            {incidents.error ? (
              <div className="p-6"><ErrorState message={incidents.error.message} onRetry={incidents.refetch} /></div>
            ) : incidents.loading ? (
              <div className="divide-y divide-white/[0.04]">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="px-6 py-4 flex gap-4 items-center">
                    <div className="w-20 h-3 animate-shimmer rounded" />
                    <div className="flex-1 h-3 animate-shimmer rounded" />
                    <div className="w-14 h-5 animate-shimmer rounded" />
                  </div>
                ))}
              </div>
            ) : incidents.data?.items && incidents.data.items.length > 0 ? (
              <div className="divide-y divide-white/[0.04]">
                {incidents.data.items.map((inc, idx) => (
                  <motion.div
                    key={inc.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="px-6 py-3.5 flex items-center gap-4 hover:bg-white/[0.02] transition-colors group"
                  >
                    <div className="w-32 flex-shrink-0">
                      <StatusBadge status={inc.severity} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-300 truncate font-mono text-xs">{inc.component}</p>
                      <p className="text-xs text-slate-600 truncate mt-0.5">{inc.description}</p>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[10px] text-slate-500 font-mono">
                        {new Date(inc.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="p-6">
                <EmptyState title="No incidents" description="No incidents recorded yet" action={{ label: 'Upload Logs', onClick: () => location.href = '/upload' }} />
              </div>
            )}
          </DashboardContainer>
        </motion.section>

        {/* ── Live Telemetry Feed ── */}
        {liveEvents.length > 0 && (
          <motion.section custom={5} variants={fadeUp} initial="hidden" animate="visible">
            <DashboardContainer noPadding>
              <div className="flex items-center gap-3 px-6 py-4 border-b border-white/[0.06]">
                <Radio className="w-4 h-4 text-emerald-400" />
                <h2 className="text-sm font-semibold text-slate-200">Live Telemetry Feed</h2>
                <div className="live-badge ml-auto">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  {liveEvents.length} events
                </div>
              </div>
              <div className="divide-y divide-white/[0.03] max-h-52 overflow-y-auto scan-line">
                {liveEvents.slice(0, 15).map((ev, i) => (
                  <div key={i} className="px-6 py-2.5 flex items-center gap-3 font-mono text-xs">
                    <span className="text-slate-600 flex-shrink-0">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                    <span className={`flex-shrink-0 w-14 text-center log-${ev.level || 'info'}`}>{(ev.level || 'info').toUpperCase()}</span>
                    <span className="text-slate-500 flex-shrink-0 w-24 truncate">{ev.service || 'system'}</span>
                    <span className="text-slate-400 truncate">{ev.message || ev.metric}</span>
                  </div>
                ))}
              </div>
            </DashboardContainer>
          </motion.section>
        )}

      </div>
    </div>
  );
}
