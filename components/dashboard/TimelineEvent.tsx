import { motion } from 'framer-motion';

type TimelineStatus = 'success' | 'warning' | 'error' | 'critical' | 'info';

interface TimelineEventProps {
  title: string;
  timestamp: Date | string;
  status: TimelineStatus;
  index: number;
}

export function TimelineEvent({ title, timestamp, status, index }: TimelineEventProps) {
  const statusColor: Record<TimelineStatus, string> = {
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    error: 'bg-red-500',
    critical: 'bg-red-500',
    info: 'bg-blue-500',
  };

  const statusBorder: Record<TimelineStatus, string> = {
    success: 'border-emerald-500/30',
    warning: 'border-amber-500/30',
    error: 'border-red-500/30',
    critical: 'border-red-500/30',
    info: 'border-blue-500/30',
  };

  const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: index * 0.1 }}
      className="relative flex gap-4"
    >
      <div className="flex flex-col items-center">
        <motion.div
          whileHover={{ scale: 1.2 }}
          className={`h-3 w-3 rounded-full ${statusColor[status]} ring-4 ring-white/10`}
        />
        {index < 4 && <div className="my-4 w-0.5 h-8 bg-gradient-to-b from-white/20 to-transparent" />}
      </div>

      <motion.div
        whileHover={{ x: 4 }}
        className={`rounded-lg border ${statusBorder[status]} bg-white/5 p-3 flex-1 backdrop-blur-md`}
      >
        <p className="text-sm font-medium text-white">{title}</p>
        <p className="text-xs text-slate-400 mt-1">
          {date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </p>
      </motion.div>
    </motion.div>
  );
}
