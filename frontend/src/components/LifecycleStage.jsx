import React from 'react';
import LifecycleItem from './LifecycleItem';
import { Info, Lock, AlertCircle } from 'lucide-react';

/**
 * LifecycleStage — Represents one column/stage of the repair lifecycle workflow.
 *
 * Anti-Hallucination & Truthful Representation:
 * - If the stage is supported by backend data (e.g. Detected, Verified, Resolved), items are rendered.
 * - If the stage is UNSUPPORTED by backend contract (Assigned, Repaired, Reverified),
 *   it explicitly renders an informative state notice rather than fabricating fake items.
 */
export default function LifecycleStage({
  stage,
  items = [],
  onSelect,
  selectedId,
}) {
  const Icon = stage.icon;
  const count = items.length;

  return (
    <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col min-w-[260px]">
      {/* ── Stage Column Header ── */}
      <div className="p-3.5 border-b border-slate-800/80 bg-slate-900/80">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <div
              className={`p-1.5 rounded-lg border ${
                stage.isBackendSupported
                  ? 'bg-slate-800 border-slate-700 text-cyan-400'
                  : 'bg-slate-900 border-slate-800 text-slate-500'
              }`}
            >
              <Icon className="w-4 h-4" />
            </div>
            <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white truncate">
              {stage.title}
            </h3>
          </div>

          <span
            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
              !stage.isBackendSupported
                ? 'bg-slate-900 text-slate-600 border-slate-800'
                : count > 0
                ? 'bg-cyan-950 text-cyan-300 border-cyan-700/60'
                : 'bg-slate-900 text-slate-500 border-slate-800'
            }`}
          >
            {stage.isBackendSupported ? count : 'N/A'}
          </span>
        </div>

        <p className="text-[10px] text-slate-400 font-mono leading-tight">
          {stage.subtitle}
        </p>

        {/* Backend Status Mapping Tag */}
        <div className="mt-2 flex items-center justify-between text-[9px] font-mono">
          <span className="text-slate-500">Backend Status:</span>
          {stage.isBackendSupported ? (
            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-emerald-400 border border-slate-800 font-bold uppercase">
              {stage.backendStatusMap ? stage.backendStatusMap.join(', ') : 'Supported'}
            </span>
          ) : (
            <span className="px-1.5 py-0.5 rounded bg-slate-900 text-amber-400/80 border border-slate-800 flex items-center gap-1 font-semibold">
              <Lock className="w-2.5 h-2.5" />
              Not in backend v1.0
            </span>
          )}
        </div>
      </div>

      {/* ── Stage Content Body ── */}
      <div className="flex-1 p-3 space-y-2.5 overflow-y-auto max-h-[560px]">
        {!stage.isBackendSupported ? (
          /* Unsupported Stage Notice */
          <div className="bg-slate-900/40 border border-dashed border-slate-800/80 rounded-xl p-4 flex flex-col items-center text-center space-y-2.5 my-2">
            <div className="p-2 rounded-full bg-slate-900 border border-slate-800 text-slate-500">
              <Lock className="w-5 h-5 opacity-70" />
            </div>
            <div>
              <p className="text-xs font-mono font-bold text-slate-300">
                {stage.emptyNoticeTitle ?? 'Stage Unavailable'}
              </p>
              <p className="text-[10px] text-slate-500 font-mono mt-1 leading-relaxed">
                {stage.emptyNotice}
              </p>
            </div>
            <div className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-[9px] font-mono text-slate-400">
              Future API capability
            </div>
          </div>
        ) : count === 0 ? (
          /* Empty Supported Stage */
          <div className="bg-slate-900/30 border border-slate-800/40 rounded-xl p-6 flex flex-col items-center text-center space-y-2 my-2">
            <AlertCircle className="w-6 h-6 text-slate-600 opacity-40" />
            <p className="text-xs font-mono text-slate-500">
              No items in this stage
            </p>
          </div>
        ) : (
          /* Render Active Detection Items */
          items.map((item) => (
            <LifecycleItem
              key={item.id}
              detection={item}
              onSelect={onSelect}
              isSelected={selectedId === item.id}
            />
          ))
        )}
      </div>
    </div>
  );
}
