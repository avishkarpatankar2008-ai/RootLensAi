'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Upload, FileText, Cpu, AlertTriangle, CheckCircle,
  Activity, Zap, Download, RefreshCw, Bot,
  ChevronRight, Server
} from 'lucide-react';
import { uploadLog, analyzeLog, downloadIncidentReport } from '@/lib/api';
import { RcaPanel } from '@/components/dashboard/RcaPanel';
import type { UploadResult, AnalyzeResult } from '@/lib/types';

type Step = 'idle' | 'uploading' | 'uploaded' | 'analyzing' | 'done' | 'error';

const SEVERITY_STYLES: Record<string, { border: string; bg: string; text: string; glow: string }> = {
  CRITICAL: { border: 'border-red-500/30', bg: 'bg-red-500/[0.06]', text: 'text-red-400', glow: 'shadow-[0_0_30px_rgba(255,59,92,0.1)]' },
  HIGH: { border: 'border-orange-500/30', bg: 'bg-orange-500/[0.06]', text: 'text-orange-400', glow: 'shadow-[0_0_30px_rgba(251,146,60,0.1)]' },
  MEDIUM: { border: 'border-amber-500/30', bg: 'bg-amber-500/[0.06]', text: 'text-amber-400', glow: '' },
  LOW: { border: 'border-emerald-500/30', bg: 'bg-emerald-500/[0.06]', text: 'text-emerald-400', glow: '' },
};

export default function UploadPage() {
  const [step, setStep] = useState<Step>('idle');
  const [dragOver, setDragOver] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [analysis, setAnalysis] = useState<AnalyzeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState('');

  const handleFile = useCallback(async (file: File) => {
    setError(null);
    setStep('uploading');
    setProgress(15);
    setProgressLabel('Uploading file…');

    try {
      const uploaded = await uploadLog(file);
      setUploadResult(uploaded);
      setProgress(40);
      setStep('analyzing');
      setProgressLabel('Parsing log structure…');

      await new Promise(r => setTimeout(r, 400));
      setProgress(65);
      setProgressLabel('Running AI analysis…');

      const result = await analyzeLog(uploaded.log_content, uploaded.filename);
      setAnalysis(result);
      setProgress(100);
      setProgressLabel('Analysis complete');
      setStep('done');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      setStep('error');
      setProgress(0);
    }
  }, []);

  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const reset = () => {
    setStep('idle');
    setUploadResult(null);
    setAnalysis(null);
    setError(null);
    setProgress(0);
  };

  const severityStyle = analysis ? (SEVERITY_STYLES[analysis.severity] || SEVERITY_STYLES.MEDIUM) : null;

  // Build an IncidentDetail-like object for RcaPanel
  const incidentForPanel = analysis ? {
    id: analysis.incident_id,
    filename: uploadResult?.filename || '',
    uploaded_at: new Date().toISOString(),
    severity: analysis.severity as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
    summary: analysis.summary,
    root_cause: analysis.root_cause,
    recommendations: analysis.recommendations,
    confidence_score: analysis.confidence_score,
    affected_services: analysis.affected_services,
    timeline: analysis.timeline,
    similar_incidents: analysis.similar_incidents,
  } : null;

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      {/* Topbar */}
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[rgba(8,12,20,0.85)] backdrop-blur-xl">
        <div className="px-6 py-4 flex items-center gap-3">
          <Upload className="w-4 h-4 text-cyan-400" />
          <h1 className="text-sm font-bold text-white">Log Analysis</h1>
          <ChevronRight className="w-3 h-3 text-slate-600" />
          <span className="text-xs text-slate-500">Upload & Analyze</span>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">

        {/* Upload drop zone */}
        <AnimatePresence mode="wait">
          {step === 'idle' && (
            <motion.div key="idle" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
              <label
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                className={`flex flex-col items-center justify-center w-full rounded-2xl border-2 border-dashed cursor-pointer transition-all duration-200 py-16 px-8 text-center
                  ${dragOver
                    ? 'border-cyan-400/60 bg-cyan-500/[0.05]'
                    : 'border-white/[0.1] hover:border-cyan-500/30 hover:bg-white/[0.02]'
                  }`}
              >
                <input type="file" className="hidden" accept=".log,.txt,.json,.csv" onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f); }} />
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-5 transition-all ${dragOver ? 'bg-cyan-500/20 scale-110' : 'bg-white/[0.04]'}`}>
                  <Upload className={`w-7 h-7 ${dragOver ? 'text-cyan-400' : 'text-slate-500'}`} />
                </div>
                <h3 className="text-base font-semibold text-slate-200 mb-2">
                  {dragOver ? 'Drop to analyze' : 'Drop your log file here'}
                </h3>
                <p className="text-sm text-slate-500 mb-4">or click to browse files</p>
                <div className="flex items-center gap-2 text-xs text-slate-600">
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">.log</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">.txt</span>
                  <span className="px-2 py-0.5 rounded bg-white/[0.04] border border-white/[0.06]">.json</span>
                  <span className="text-slate-600">· Max 50 MB</span>
                </div>
              </label>
            </motion.div>
          )}

          {/* Progress */}
          {(step === 'uploading' || step === 'analyzing') && (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="glass-card p-10 text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center">
                <Cpu className="w-7 h-7 text-cyan-400 animate-spin" style={{ animationDuration: '3s' }} />
              </div>
              <h3 className="text-base font-semibold text-slate-200 mb-2">{progressLabel}</h3>
              <p className="text-xs text-slate-500 mb-6">
                {step === 'analyzing' ? 'AI model analyzing patterns and root causes…' : 'Uploading to server…'}
              </p>
              <div className="max-w-sm mx-auto">
                <div className="flex justify-between text-[10px] text-slate-500 mb-2">
                  <span>{progressLabel}</span>
                  <span className="font-mono">{progress}%</span>
                </div>
                <div className="progress-bar">
                  <motion.div
                    className="progress-bar-fill bg-gradient-to-r from-cyan-500 to-blue-500"
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.4 }}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Error */}
          {step === 'error' && (
            <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="glass-card border-red-500/20 p-8 text-center">
              <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-400" />
              </div>
              <h3 className="text-base font-semibold text-red-300 mb-2">Analysis Failed</h3>
              <p className="text-sm text-slate-500 mb-6">{error}</p>
              <button onClick={reset} className="flex items-center gap-2 mx-auto px-4 py-2 rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-300 text-sm hover:bg-white/[0.08] transition-colors">
                <RefreshCw className="w-4 h-4" />
                Try again
              </button>
            </motion.div>
          )}

          {/* Results */}
          {step === 'done' && analysis && severityStyle && (
            <motion.div key="done" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">

              {/* Success header */}
              <div className={`glass-card ${severityStyle.border} ${severityStyle.bg} ${severityStyle.glow} p-5 flex items-center gap-4`}>
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                  <CheckCircle className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-slate-200">Analysis Complete</h3>
                    <span className={`px-2 py-0.5 rounded border text-[11px] font-bold ${severityStyle.border} ${severityStyle.text}`}>
                      {analysis.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 font-mono">{uploadResult?.filename} · {uploadResult?.line_count.toLocaleString()} lines · {((uploadResult?.file_size_bytes || 0) / 1024).toFixed(1)} KB</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => downloadIncidentReport(analysis.incident_id)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/[0.08] bg-white/[0.04] text-slate-300 text-xs hover:bg-white/[0.07] transition-colors"
                  >
                    <Download className="w-3.5 h-3.5" />
                    PDF Report
                  </button>
                  <button onClick={reset} className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs hover:bg-cyan-500/20 transition-colors">
                    <RefreshCw className="w-3.5 h-3.5" />
                    New Analysis
                  </button>
                </div>
              </div>

              {/* AI RCA Panel */}
              <RcaPanel incident={incidentForPanel} />

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4">
                <div className="glass-card p-4 text-center">
                  <Activity className="w-4 h-4 text-cyan-400 mx-auto mb-2" />
                  <div className="text-xl font-bold font-mono-num text-white">{analysis.timeline.length}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Timeline Events</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <Server className="w-4 h-4 text-purple-400 mx-auto mb-2" />
                  <div className="text-xl font-bold font-mono-num text-white">{analysis.affected_services.length}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">Affected Services</div>
                </div>
                <div className="glass-card p-4 text-center">
                  <Bot className="w-4 h-4 text-emerald-400 mx-auto mb-2" />
                  <div className="text-xl font-bold font-mono-num text-white">{Math.round(analysis.confidence_score * 100)}%</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">AI Confidence</div>
                </div>
              </div>

              {/* Timeline events */}
              {analysis.timeline.length > 0 && (
                <div className="glass-card overflow-hidden">
                  <div className="px-5 py-3.5 border-b border-white/[0.06] flex items-center gap-2">
                    <Activity className="w-4 h-4 text-cyan-400" />
                    <h3 className="text-sm font-semibold text-slate-200">Event Timeline</h3>
                  </div>
                  <div className="divide-y divide-white/[0.04] max-h-72 overflow-y-auto">
                    {analysis.timeline.map((ev, i) => (
                      <div key={i} className="px-5 py-3 flex items-start gap-3 font-mono text-xs hover:bg-white/[0.02] transition-colors">
                        <span className="text-slate-600 flex-shrink-0 w-20 pt-0.5">{ev.timestamp || '—'}</span>
                        <span className={`flex-shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold log-${
                          ['error','fatal','exception'].includes(ev.level?.toLowerCase()) ? 'error' :
                          ['warn','warning'].includes(ev.level?.toLowerCase()) ? 'warning' : 'info'
                        }`}>
                          {ev.level || 'INFO'}
                        </span>
                        <span className="text-slate-400 leading-snug">{ev.event}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Chat CTA */}
              <div className="glass-card border-purple-500/15 p-5 flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center flex-shrink-0">
                  <Bot className="w-5 h-5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-200">Ask the AI Assistant about this incident</p>
                  <p className="text-xs text-slate-500 mt-0.5">Deep-dive into root causes, get remediation steps, or explore similar incidents</p>
                </div>
                <a
                  href="/chat"
                  className="flex-shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm hover:bg-purple-500/20 transition-colors"
                >
                  Open Chat
                  <Zap className="w-3.5 h-3.5" />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
