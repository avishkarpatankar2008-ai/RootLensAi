'use client';

import { motion } from 'framer-motion';

interface HealthIndicatorProps {
  name: string;
  status: 'healthy' | 'degraded' | 'critical';
  cpu: number;
  memory: number;
  requests: number;
  delay?: number;
}

const STATUS_CONFIG = {
  healthy: { label: 'Healthy', dotClass: 'healthy', barColor: '#10b981', textColor: 'text-emerald-400', bgColor: 'bg-emerald-500/10 border-emerald-500/20' },
  degraded: { label: 'Degraded', dotClass: 'warning', barColor: '#f59e0b', textColor: 'text-amber-400', bgColor: 'bg-amber-500/10 border-amber-500/20' },
  critical: { label: 'Critical', dotClass: 'critical', barColor: '#ff3b5c', textColor: 'text-red-400', bgColor: 'bg-red-500/10 border-red-500/20' },
};

export function HealthIndicator({ name, status, cpu, memory, requests, delay = 0 }: HealthIndicatorProps) {
  const config = STATUS_CONFIG[status];

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
    >
      {/* Status indicator */}
      <div className="flex-shrink-0 flex items-center gap-2 w-32">
        <span className={`status-dot ${config.dotClass} pulse flex-shrink-0`} />
        <span className="text-sm font-medium text-slate-200 truncate">{name}</span>
      </div>

      {/* Badge */}
      <div className={`flex-shrink-0 px-2 py-0.5 rounded border text-xs font-semibold ${config.bgColor} ${config.textColor}`}>
        {config.label}
      </div>

      {/* CPU bar */}
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500">CPU</span>
          <span className="text-[10px] font-mono text-slate-400">{cpu}%</span>
        </div>
        <div className="progress-bar">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${cpu}%` }}
            transition={{ delay: delay + 0.2, duration: 0.8, ease: 'easeOut' }}
            className="progress-bar-fill"
            style={{ background: cpu > 80 ? '#ff3b5c' : cpu > 60 ? '#f59e0b' : config.barColor }}
          />
        </div>
      </div>

      {/* Memory bar */}
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center justify-between">
          <span className="text-[10px] text-slate-500">MEM</span>
          <span className="text-[10px] font-mono text-slate-400">{memory}%</span>
        </div>
        <div className="progress-bar">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${memory}%` }}
            transition={{ delay: delay + 0.3, duration: 0.8, ease: 'easeOut' }}
            className="progress-bar-fill"
            style={{ background: memory > 80 ? '#ff3b5c' : memory > 60 ? '#f59e0b' : config.barColor }}
          />
        </div>
      </div>

      {/* Requests */}
      <div className="flex-shrink-0 text-right">
        <div className="text-xs font-mono text-slate-300">{requests.toLocaleString()}</div>
        <div className="text-[10px] text-slate-600">req</div>
      </div>
    </motion.div>
  );
}
