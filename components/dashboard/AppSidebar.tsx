'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Activity, AlertTriangle, BarChart3, Bot,
  FileText, LayoutDashboard, Radio, Settings, Upload, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/', icon: LayoutDashboard },
  { label: 'Incidents', href: '/incidents', icon: AlertTriangle },
  { label: 'Live Logs', href: '/logs', icon: Radio },
  { label: 'Analytics', href: '/analytics', icon: BarChart3 },
  { label: 'AI Assistant', href: '/chat', icon: Bot },
  { label: 'Upload Logs', href: '/upload', icon: Upload },
  { label: 'Reports', href: '/reports', icon: FileText },
];

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.06]">
        <div className="relative flex-shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" />
          </div>
          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#080c14]" />
        </div>
        <div>
          <div className="text-sm font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            RootLens<span className="text-cyan-400">AI</span>
          </div>
          <div className="text-[10px] text-slate-500 font-medium tracking-wider uppercase">Observability</div>
        </div>
      </div>

      {/* Status banner */}
      <div className="mx-3 mt-3 px-3 py-2 rounded-lg bg-emerald-500/[0.08] border border-emerald-500/[0.15] flex items-center gap-2">
        <span className="status-dot healthy pulse" />
        <span className="text-[11px] text-emerald-400 font-medium">All Systems Operational</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 mt-4 space-y-0.5 overflow-y-auto">
        <div className="section-header px-2 mb-2">Navigation</div>
        {NAV_ITEMS.map((item) => {
          const active = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 cursor-pointer group ${
                  active
                    ? 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                }`}
              >
                {active && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-cyan-400 rounded-r"
                  />
                )}
                <Icon className={`w-4 h-4 flex-shrink-0 ${active ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{item.label}</span>
                {item.label === 'Live Logs' && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
                {item.label === 'AI Assistant' && (
                  <span className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/20">AI</span>
                )}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-white/[0.06] space-y-2">
        <Link href="/settings">
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-slate-500 hover:text-slate-300 hover:bg-white/[0.04] transition-all cursor-pointer">
            <Settings className="w-4 h-4" />
            <span>Settings</span>
          </div>
        </Link>
        <div className="px-3 py-2 text-[10px] text-slate-600 flex items-center gap-2">
          <Activity className="w-3 h-3" />
          <span>v2.1.0 — Groq LLaMA 3.1</span>
        </div>
      </div>
    </aside>
  );
}
