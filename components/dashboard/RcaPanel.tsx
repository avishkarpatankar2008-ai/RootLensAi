'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Bot, AlertTriangle, CheckCircle, ChevronDown, ChevronUp, Cpu, Zap } from 'lucide-react';
import { useState } from 'react';
import type { IncidentDetail } from '@/lib/types';

interface RcaPanelProps {
  incident: IncidentDetail | null;
  loading?: boolean;
}

export function RcaPanel({ incident, loading }: RcaPanelProps) {
  const [expanded, setExpanded] = useState(true);

  if (loading) {
    return (
      <div className="glass-card border-purple-500/20 p-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-purple-400" />
          </div>
          <span className="text-sm font-semibold text-purple-300">AI Root Cause Analysis</span>
          <span className="ml-auto flex gap-1">
            <span className="typing-dot" />
            <span className="typing-dot" />
            <span className="typing-dot" />
          </span>
        </div>
        <div className="space-y-2">
          <div className="h-3 rounded animate-shimmer w-full" />
          <div className="h-3 rounded animate-shimmer w-4/5" />
          <div className="h-3 rounded animate-shimmer w-3/5" />
        </div>
      </div>
    );
  }

  if (!incident) return null;

  const severityColors = {
    CRITICAL: 'text-red-400 bg-red-500/10 border-red-500/20',
    HIGH: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    MEDIUM: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    LOW: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  };

  const severityStyle = severityColors[incident.severity as keyof typeof severityColors] || severityColors.MEDIUM;
  const confidence = Math.round(incident.confidence_score * 100);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card border-purple-500/15 overflow-hidden"
    >
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 p-5 hover:bg-white/[0.02] transition-colors"
      >
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
          <Bot className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex-1 text-left">
          <div className="text-sm font-semibold text-purple-300">AI Root Cause Analysis</div>
          <div className="text-[10px] text-slate-500">Powered by Groq LLaMA 3.1</div>
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-2 py-0.5 rounded border text-[10px] font-bold ${severityStyle}`}>
            {incident.severity}
          </div>
          <div className="flex items-center gap-1 text-xs text-slate-500">
            <Cpu className="w-3 h-3" />
            <span className="font-mono">{confidence}%</span>
          </div>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </button>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-5 space-y-4 border-t border-white/[0.05]">
              {/* Summary */}
              <div className="pt-4">
                <div className="section-header mb-2 flex items-center gap-2">
                  <AlertTriangle className="w-3 h-3" />
                  Summary
                </div>
                <p className="text-sm text-slate-300 leading-relaxed">{incident.summary}</p>
              </div>

              {/* Root cause */}
              <div>
                <div className="section-header mb-2 flex items-center gap-2">
                  <Zap className="w-3 h-3 text-amber-500" />
                  Root Cause
                </div>
                <p className="text-sm text-slate-300 leading-relaxed bg-amber-500/[0.04] border border-amber-500/10 rounded-lg p-3">
                  {incident.root_cause}
                </p>
              </div>

              {/* Recommendations */}
              {incident.recommendations.length > 0 && (
                <div>
                  <div className="section-header mb-2 flex items-center gap-2">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    Recommendations
                  </div>
                  <ul className="space-y-2">
                    {incident.recommendations.map((rec, i) => (
                      <li key={i} className="flex gap-2 text-sm text-slate-300">
                        <span className="flex-shrink-0 w-4 h-4 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] font-bold flex items-center justify-center mt-0.5">
                          {i + 1}
                        </span>
                        {rec}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Affected services */}
              {incident.affected_services.length > 0 && (
                <div>
                  <div className="section-header mb-2">Affected Services</div>
                  <div className="flex flex-wrap gap-2">
                    {incident.affected_services.map((svc) => (
                      <span key={svc} className="px-2.5 py-1 rounded-md bg-slate-800/80 border border-white/[0.06] text-xs text-slate-300 font-mono">
                        {svc}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Confidence bar */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-slate-500 uppercase tracking-wide">AI Confidence Score</span>
                  <span className="text-[11px] font-mono text-slate-400">{confidence}%</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${confidence}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut' }}
                    className="progress-bar-fill"
                    style={{ background: confidence > 75 ? '#10b981' : confidence > 50 ? '#f59e0b' : '#ff3b5c' }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
