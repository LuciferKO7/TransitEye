import React from 'react';
import {
  Activity,
  Clock,
  CheckCircle2,
  CheckCheck,
  ShieldAlert,
  Info,
  Lock
} from 'lucide-react';

/**
 * LifecycleSummary — Displays summary metric cards based strictly on backend detection data.
 *
 * Anti-Hallucination:
 * - All counts are MEASURED from actual backend detection objects.
 * - No fake technician counts, repair times, or SLA metrics are fabricated.
 */
export default function LifecycleSummary({ records = [] }) {
  const totalCount = records.length;
  const pendingCount = records.filter((r) => r.status === 'pending').length;
  const inReviewCount = records.filter((r) => r.status === 'in_review').length;
  const confirmedCount = records.filter((r) => r.status === 'confirmed').length;
  const resolvedCount = records.filter((r) => r.status === 'resolved').length;
  const rejectedCount = records.filter((r) => r.status === 'rejected').length;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {/* Total Observations */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-medium uppercase text-slate-400">
            Total Telemetry
          </span>
          <Activity className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-white">
            {totalCount}
          </span>
          <span className="text-[10px] font-mono text-slate-500">records</span>
        </div>
        <p className="text-[10px] text-slate-500 font-mono mt-1">
          Backend observations
        </p>
      </div>

      {/* Pending / Detected */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-medium uppercase text-slate-400">
            1. Detected
          </span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-amber-400">
            {pendingCount}
          </span>
          <span className="text-[10px] font-mono text-slate-500">pending</span>
        </div>
        <p className="text-[10px] text-slate-500 font-mono mt-1">
          Awaiting verification
        </p>
      </div>

      {/* Verified (Confirmed + In Review) */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-medium uppercase text-slate-400">
            2. Verified
          </span>
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-emerald-400">
            {confirmedCount + inReviewCount}
          </span>
          <span className="text-[10px] font-mono text-slate-500">
            {inReviewCount > 0 ? `${confirmedCount} conf / ${inReviewCount} rev` : 'confirmed'}
          </span>
        </div>
        <p className="text-[10px] text-slate-500 font-mono mt-1">
          Multi-pass confirmed
        </p>
      </div>

      {/* Resolved */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-medium uppercase text-slate-400">
            Backend Resolved
          </span>
          <CheckCheck className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-2xl font-black font-mono text-indigo-400">
            {resolvedCount}
          </span>
          <span className="text-[10px] font-mono text-slate-500">resolved</span>
        </div>
        <p className="text-[10px] text-slate-500 font-mono mt-1">
          {rejectedCount > 0 ? `${rejectedCount} rejected` : 'Closed state'}
        </p>
      </div>

      {/* Contract Capability Badge */}
      <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between col-span-2 sm:col-span-1">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-mono font-medium uppercase text-slate-400">
            Backend Contract
          </span>
          <Lock className="w-4 h-4 text-slate-500" />
        </div>
        <div className="mt-2 flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-800/60">
            READ-ONLY
          </span>
          <span className="text-[10px] font-mono text-slate-400">v1.0 GET</span>
        </div>
        <p className="text-[10px] text-slate-500 font-mono mt-1 flex items-center gap-1">
          <Info className="w-3 h-3 text-slate-500 shrink-0" />
          Mutations deferred
        </p>
      </div>
    </div>
  );
}
