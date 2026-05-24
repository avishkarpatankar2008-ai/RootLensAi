'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, ChevronRight, RefreshCw, Search, Filter } from 'lucide-react';
import { useIncidents } from '@/lib/hooks';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { DashboardContainer, SkeletonTable, EmptyState, ErrorState } from '@/components/dashboard/LoadingStates';

export default function IncidentsPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const incidents = useIncidents(page, 15, { refetchInterval: 30_000 });

  const filtered = incidents.data?.items.filter(i =>
    !search || i.component.toLowerCase().includes(search.toLowerCase()) || i.description.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  return (
    <div className="min-h-screen" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
      <header className="sticky top-0 z-40 border-b border-white/[0.06] bg-[rgba(8,12,20,0.85)] backdrop-blur-xl">
        <div className="px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <h1 className="text-sm font-bold text-white">Incidents</h1>
            {incidents.data && (
              <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-xs text-slate-400 font-mono">
                {incidents.data.total} total
              </span>
            )}
          </div>
          <button onClick={incidents.refetch} className="p-1.5 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-white/[0.05] transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-4">
        {/* Search bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-600" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search incidents by component or description…"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-white/[0.08] bg-white/[0.03] text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500/30 transition-all"
          />
        </div>

        {incidents.error ? (
          <ErrorState message={incidents.error.message} onRetry={incidents.refetch} />
        ) : incidents.loading ? (
          <SkeletonTable rows={8} />
        ) : (
          <DashboardContainer noPadding>
            {/* Table header */}
            <div className="grid grid-cols-12 gap-4 px-5 py-3 border-b border-white/[0.06] section-header">
              <div className="col-span-2">Severity</div>
              <div className="col-span-3">Component</div>
              <div className="col-span-5">Description</div>
              <div className="col-span-2 text-right">Timestamp</div>
            </div>

            {filtered.length > 0 ? (
              <div className="divide-y divide-white/[0.04]">
                {filtered.map((inc, idx) => (
                  <motion.div
                    key={inc.id}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.03 }}
                    className="grid grid-cols-12 gap-4 px-5 py-4 hover:bg-white/[0.02] transition-colors items-center"
                  >
                    <div className="col-span-2">
                      <StatusBadge status={inc.severity} />
                    </div>
                    <div className="col-span-3 font-mono text-xs text-slate-300 truncate">{inc.component}</div>
                    <div className="col-span-5 text-xs text-slate-500 truncate">{inc.description}</div>
                    <div className="col-span-2 text-right text-[10px] text-slate-600 font-mono">
                      {new Date(inc.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <EmptyState
                title="No incidents found"
                description={search ? 'Try a different search term' : 'Upload and analyze logs to see incidents here'}
                action={!search ? { label: 'Upload Logs', onClick: () => location.href = '/upload' } : undefined}
              />
            )}

            {/* Pagination */}
            {incidents.data && incidents.data.total > 15 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
                <span className="text-xs text-slate-500">
                  Page {page} of {Math.ceil(incidents.data.total / 15)}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs text-slate-400 disabled:opacity-30 hover:bg-white/[0.05] transition-colors"
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => setPage(p => p + 1)}
                    disabled={!incidents.data?.hasMore}
                    className="px-3 py-1.5 rounded-lg border border-white/[0.08] text-xs text-slate-400 disabled:opacity-30 hover:bg-white/[0.05] transition-colors"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </DashboardContainer>
        )}
      </div>
    </div>
  );
}
