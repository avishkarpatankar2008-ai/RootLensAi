'use client';

import { motion, useSpring, useTransform } from 'framer-motion';
import { useEffect, useRef, ReactNode } from 'react';

interface KpiCardProps {
  label: string;
  value: number | string;
  unit?: string;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
  icon?: ReactNode;
  delay?: number;
  variant?: 'default' | 'critical' | 'success' | 'warning';
  sublabel?: string;
}

const VARIANT_STYLES = {
  default: {
    border: 'border-white/[0.08]',
    glow: '',
    iconBg: 'bg-cyan-500/10',
    iconColor: 'text-cyan-400',
    valueColor: 'text-white',
  },
  critical: {
    border: 'border-red-500/20',
    glow: 'shadow-[0_0_24px_rgba(255,59,92,0.08)]',
    iconBg: 'bg-red-500/10',
    iconColor: 'text-red-400',
    valueColor: 'text-red-300',
  },
  success: {
    border: 'border-emerald-500/20',
    glow: 'shadow-[0_0_24px_rgba(16,185,129,0.08)]',
    iconBg: 'bg-emerald-500/10',
    iconColor: 'text-emerald-400',
    valueColor: 'text-emerald-300',
  },
  warning: {
    border: 'border-amber-500/20',
    glow: 'shadow-[0_0_24px_rgba(245,158,11,0.08)]',
    iconBg: 'bg-amber-500/10',
    iconColor: 'text-amber-400',
    valueColor: 'text-amber-300',
  },
};

function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 60, damping: 15 });
  const display = useTransform(spring, (v) => {
    if (v >= 1000) return (v / 1000).toFixed(1) + 'k';
    if (v % 1 !== 0) return v.toFixed(1);
    return Math.round(v).toString();
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  return <motion.span className="kpi-value">{display}</motion.span>;
}

export function KpiCard({
  label,
  value,
  unit,
  trend = 'stable',
  trendValue,
  icon,
  delay = 0,
  variant = 'default',
  sublabel,
}: KpiCardProps) {
  const styles = VARIANT_STYLES[variant];

  const trendConfig = {
    up: { color: 'text-emerald-400', symbol: '↑', label: 'Higher' },
    down: { color: 'text-red-400', symbol: '↓', label: 'Lower' },
    stable: { color: 'text-slate-500', symbol: '→', label: 'Stable' },
  };
  const td = trendConfig[trend];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      whileHover={{ y: -2, transition: { duration: 0.15 } }}
      className={`glass-card ${styles.border} ${styles.glow} p-5 relative overflow-hidden cursor-default`}
    >
      {/* Subtle top gradient */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

      <div className="flex items-start justify-between mb-4">
        <div className={`w-9 h-9 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
          <span className={`w-4 h-4 ${styles.iconColor} [&>svg]:w-full [&>svg]:h-full`}>{icon}</span>
        </div>
        <div className={`text-xs font-semibold ${td.color} flex items-center gap-1`}>
          <span>{td.symbol}</span>
          {trendValue && <span>{trendValue}</span>}
        </div>
      </div>

      <div className="space-y-1">
        <div className={`text-2xl font-bold ${styles.valueColor} font-mono-num leading-none`}>
          {typeof value === 'number'
            ? <AnimatedNumber value={value} />
            : <span>{value}</span>
          }
          {unit && <span className="text-sm font-normal text-slate-500 ml-1.5">{unit}</span>}
        </div>
        <div className="text-xs text-slate-500 font-medium tracking-wide">{label}</div>
        {sublabel && <div className="text-[10px] text-slate-600">{sublabel}</div>}
      </div>
    </motion.div>
  );
}
