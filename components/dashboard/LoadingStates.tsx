'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { AlertCircle, RefreshCw, PackageOpen } from 'lucide-react';

// ─── Glass containers ─────────────────────────────────────────────────────────

interface GlassCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  accent?: boolean;
}

export function GlassCard({ children, delay = 0, className = '', accent = false }: GlassCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.35 }}
      className={`glass-card ${accent ? 'glass-card-accent' : ''} p-5 ${className}`}
    >
      {children}
    </motion.div>
  );
}

interface DashboardContainerProps {
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function DashboardContainer({ children, className = '', noPadding = false }: DashboardContainerProps) {
  return (
    <div className={`glass-card ${noPadding ? '' : 'p-6'} ${className}`}>
      {children}
    </div>
  );
}

// ─── Skeleton loaders ─────────────────────────────────────────────────────────

export function SkeletonLine({ width = 'w-full', height = 'h-3' }: { width?: string; height?: string }) {
  return <div className={`${width} ${height} rounded animate-shimmer`} />;
}

export function SkeletonCard() {
  return (
    <div className="glass-card p-5 space-y-3">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-lg animate-shimmer" />
        <SkeletonLine width="w-12" height="h-3" />
      </div>
      <SkeletonLine width="w-20" height="h-7" />
      <SkeletonLine width="w-24" height="h-3" />
    </div>
  );
}

export function SkeletonGrid({ columns = 4 }: { columns?: number }) {
  return (
    <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-${columns} gap-4`}>
      {Array.from({ length: columns }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}

export function SkeletonChart() {
  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <SkeletonLine width="w-32" height="h-4" />
        <SkeletonLine width="w-16" height="h-4" />
      </div>
      <div className="h-64 animate-shimmer rounded-lg" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="glass-card overflow-hidden">
      <div className="p-4 border-b border-white/[0.06] flex gap-4">
        {[30, 20, 25, 15].map((w, i) => (
          <SkeletonLine key={i} width={`w-${w}`} height="h-3" />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="p-4 border-b border-white/[0.04] flex gap-4 items-center">
          <SkeletonLine width="w-28" height="h-3" />
          <SkeletonLine width="w-16" height="h-3" />
          <SkeletonLine width="w-40" height="h-3" />
          <SkeletonLine width="w-12" height="h-5" />
        </div>
      ))}
    </div>
  );
}

// ─── Empty & error states ────────────────────────────────────────────────────

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void };
  icon?: ReactNode;
}

export function EmptyState({ title, description, action, icon }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-12 h-12 rounded-xl bg-white/[0.04] border border-white/[0.08] flex items-center justify-center mb-4">
        {icon || <PackageOpen className="w-5 h-5 text-slate-600" />}
      </div>
      <p className="text-sm font-medium text-slate-400 mb-1">{title}</p>
      {description && <p className="text-xs text-slate-600 mb-4 max-w-xs">{description}</p>}
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium hover:bg-cyan-500/20 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

interface ErrorStateProps {
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-3">
        <AlertCircle className="w-5 h-5 text-red-400" />
      </div>
      <p className="text-sm text-red-400 mb-1">Failed to load data</p>
      {message && <p className="text-xs text-slate-600 mb-4 max-w-xs">{message}</p>}
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 text-slate-400 text-xs hover:text-slate-200 hover:border-white/20 transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          Retry
        </button>
      )}
    </div>
  );
}
