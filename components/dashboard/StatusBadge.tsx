'use client';

import { motion } from 'framer-motion';

// ─── StatusBadge ─────────────────────────────────────────────────────────────

type SeverityType = 'critical' | 'warning' | 'info' | 'success' | 'degraded';

const BADGE_STYLES: Record<SeverityType, string> = {
  critical: 'bg-red-500/10 border-red-500/25 text-red-400',
  warning: 'bg-amber-500/10 border-amber-500/25 text-amber-400',
  info: 'bg-blue-500/10 border-blue-500/25 text-blue-400',
  success: 'bg-emerald-500/10 border-emerald-500/25 text-emerald-400',
  degraded: 'bg-orange-500/10 border-orange-500/25 text-orange-400',
};

export function StatusBadge({ status, label }: { status: SeverityType; label?: string }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded border text-[11px] font-semibold uppercase tracking-wide ${BADGE_STYLES[status]}`}>
      <span className={`status-dot ${status === 'success' ? 'healthy' : status}`} />
      {label || status}
    </span>
  );
}

// ─── TimelineEvent ────────────────────────────────────────────────────────────

interface TimelineEventProps {
  title: string;
  timestamp: Date | string;
  status: 'critical' | 'warning' | 'info' | 'success';
  index?: number;
}

const TIMELINE_COLORS = {
  critical: { dot: 'bg-red-500', line: 'bg-red-500/20', text: 'text-red-400' },
  warning: { dot: 'bg-amber-500', line: 'bg-amber-500/20', text: 'text-amber-400' },
  info: { dot: 'bg-blue-500', line: 'bg-blue-500/20', text: 'text-blue-400' },
  success: { dot: 'bg-emerald-500', line: 'bg-emerald-500/20', text: 'text-emerald-400' },
};

export function TimelineEvent({ title, timestamp, status, index = 0 }: TimelineEventProps) {
  const colors = TIMELINE_COLORS[status];
  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.3 }}
      className="flex gap-3 group"
    >
      <div className="flex flex-col items-center flex-shrink-0">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 mt-1.5 ${colors.dot}`} />
        {index < 9 && <div className={`w-px flex-1 min-h-4 mt-1 ${colors.line}`} />}
      </div>
      <div className="pb-3 min-w-0 flex-1">
        <p className="text-xs text-slate-300 leading-snug line-clamp-2 group-hover:text-slate-200 transition-colors">
          {title}
        </p>
        <p className="text-[10px] text-slate-600 mt-1 font-mono">
          {isNaN(date.getTime()) ? '—' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
    </motion.div>
  );
}
