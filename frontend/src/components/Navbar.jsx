import React from 'react';
import { Bus, Radio, Activity, Shield, Server, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

export default function Navbar({ connectionStatus, onRefresh, isRefreshing }) {
  return (
    <header className="h-16 bg-slate-950 border-b border-slate-800/80 px-4 md:px-6 flex items-center justify-between sticky top-0 z-40 shadow-sm">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-inner">
          <Bus className="w-6 h-6" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-bold tracking-wider text-slate-100 text-lg uppercase font-mono">TransitEye</span>
            <span className="text-[10px] uppercase tracking-widest font-semibold px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-800/50">
              SIH 2026
            </span>
          </div>
          <p className="text-xs text-slate-400 hidden sm:block font-medium">
            Every Bus. A Mobile AI Sensor for the City.
          </p>
        </div>
      </div>

      {/* Operational Indicators */}
      <div className="flex items-center gap-4">
        {/* Connection Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 border border-slate-800 text-xs">
          <Server className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400 font-mono hidden md:inline">API Status:</span>
          {connectionStatus === 'connected' ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Connected
            </span>
          ) : connectionStatus === 'loading' ? (
            <span className="inline-flex items-center gap-1.5 text-amber-400 font-medium">
              <RefreshCw className="w-3 h-3 animate-spin" />
              Connecting
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 text-rose-400 font-medium">
              <AlertTriangle className="w-3 h-3" />
              Disconnected
            </span>
          )}
        </div>

        {/* Refresh Button */}
        <button
          onClick={onRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-cyan-950/60 hover:bg-cyan-900/60 border border-cyan-700/50 text-cyan-300 text-xs font-medium transition-colors disabled:opacity-50"
          title="Fetch latest telemetry"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">Refresh Telemetry</span>
        </button>
      </div>
    </header>
  );
}
