import React, { useState, useMemo } from 'react';
import LifecycleSummary from './LifecycleSummary';
import LifecycleStage from './LifecycleStage';
import LifecycleDetail from './LifecycleDetail';
import {
  GitCommit,
  Search,
  Filter,
  RefreshCw,
  Clock,
  CheckCircle2,
  UserCheck,
  Wrench,
  ShieldCheck,
  CheckCheck,
  Loader2,
  AlertCircle,
  X
} from 'lucide-react';

/**
 * Stage definitions mapping backend statuses to conceptual 5-stage lifecycle.
 */
const STAGE_DEFINITIONS = [
  {
    id: 'detected',
    title: '1. Detected',
    subtitle: 'Raw physical observations flagged by AI bus sensors',
    icon: Clock,
    isBackendSupported: true,
    backendStatusMap: ['pending'],
  },
  {
    id: 'verified',
    title: '2. Verified',
    subtitle: 'Multi-pass confirmed or verified by review rules',
    icon: CheckCircle2,
    isBackendSupported: true,
    backendStatusMap: ['confirmed', 'in_review'],
  },
  {
    id: 'assigned',
    title: '3. Assigned',
    subtitle: 'Work-order & technician dispatch',
    icon: UserCheck,
    isBackendSupported: false,
    emptyNoticeTitle: 'Assignment Data Unavailable',
    emptyNotice:
      'Technician assignment and work-order dispatch are not supported by the current backend contract (Read-Only).',
  },
  {
    id: 'repaired',
    title: '4. Repaired',
    subtitle: 'Field repair execution & timestamping',
    icon: Wrench,
    isBackendSupported: false,
    emptyNoticeTitle: 'Repair Event Tracking Unavailable',
    emptyNotice:
      'Physical repair timestamping is pending future backend API endpoints. (See Resolved column for completed items).',
  },
  {
    id: 'reverified',
    title: '5. Reverified',
    subtitle: 'Post-repair bus sensor re-inspection',
    icon: ShieldCheck,
    isBackendSupported: false,
    emptyNoticeTitle: 'Re-verification Data Unavailable',
    emptyNotice:
      'Post-repair bus re-inspection validation will be activated when backend lifecycle mutation endpoints deploy.',
  },
  {
    id: 'resolved',
    title: 'Backend Resolved',
    subtitle: 'Observations marked resolved in backend DB',
    icon: CheckCheck,
    isBackendSupported: true,
    backendStatusMap: ['resolved'],
  },
];

/**
 * LifecycleBoard — Extensible 5-Stage Repair Lifecycle Visualization Component.
 *
 * Props:
 *   detections — { loading, data, error } state object from App.jsx
 */
export default function LifecycleBoard({ detections }) {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedDetection, setSelectedDetection] = useState(null);

  const rawRecords = detections?.data?.data ?? [];

  // Filtered dataset
  const filteredRecords = useMemo(() => {
    return rawRecords.filter((d) => {
      // Type filter
      if (typeFilter !== 'all' && d.type !== typeFilter) return false;

      // Severity filter
      if (severityFilter !== 'all' && d.severity !== severityFilter) return false;

      // Status filter
      if (statusFilter !== 'all' && d.status !== statusFilter) return false;

      // Search query
      if (search.trim()) {
        const q = search.trim().toLowerCase();
        const idMatch = (d.id ?? '').toLowerCase().includes(q);
        const typeMatch = (d.type ?? '').toLowerCase().includes(q);
        const subtypeMatch = (d.subtype ?? '').toLowerCase().includes(q);
        const busMatch = (d.bus_id ?? '').toLowerCase().includes(q);
        const segmentMatch = (d.segment_id ?? '').toLowerCase().includes(q);
        if (!idMatch && !typeMatch && !subtypeMatch && !busMatch && !segmentMatch) {
          return false;
        }
      }

      return true;
    });
  }, [rawRecords, typeFilter, severityFilter, statusFilter, search]);

  // Group filtered detections by stage
  const stageItemsMap = useMemo(() => {
    const map = {
      detected: [],
      verified: [],
      assigned: [],
      repaired: [],
      reverified: [],
      resolved: [],
    };

    filteredRecords.forEach((d) => {
      const status = d.status ?? 'pending';
      if (status === 'pending') {
        map.detected.push(d);
      } else if (status === 'confirmed' || status === 'in_review') {
        map.verified.push(d);
      } else if (status === 'resolved') {
        map.resolved.push(d);
      } else {
        // Fallback for unexpected or rejected
        map.detected.push(d);
      }
    });

    return map;
  }, [filteredRecords]);

  const hasActiveFilters =
    search.trim() !== '' ||
    typeFilter !== 'all' ||
    severityFilter !== 'all' ||
    statusFilter !== 'all';

  const resetFilters = () => {
    setSearch('');
    setTypeFilter('all');
    setSeverityFilter('all');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-4">
      {/* ── Top Header Toolbar ── */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <GitCommit className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-white">
              Municipal Repair & Defect Lifecycle
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Conceptual 5-Stage Workflow: Detected → Verified → Assigned → Repaired → Reverified
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Read-Only Telemetry Stream</span>
          </span>
        </div>
      </div>

      {/* ── Summary Metric Cards ── */}
      <LifecycleSummary records={rawRecords} />

      {/* ── Filter & Search Controls ── */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by ID, subtype, bus ID, segment..."
              className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Domain Types</option>
            <option value="road_defect">Road Defects</option>
            <option value="waterlogging">Waterlogging</option>
            <option value="vru_safety">VRU Risk Overlay</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Backend Statuses</option>
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_review">In Review</option>
            <option value="resolved">Resolved</option>
            <option value="rejected">Rejected</option>
          </select>

          {/* Reset button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="px-3 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-400 flex items-center justify-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Main Lifecycle Board Columns ── */}
      {detections?.loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-slate-500 space-y-3">
          <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
          <p className="text-sm font-mono">Loading telemetry lifecycle records…</p>
        </div>
      ) : detections?.error ? (
        <div className="flex flex-col items-center justify-center py-20 text-rose-400 space-y-2 bg-slate-950/70 border border-rose-900/50 rounded-xl">
          <AlertCircle className="w-8 h-8 opacity-70" />
          <p className="text-sm font-mono font-bold">Failed to load detection records</p>
          <p className="text-xs text-slate-500 font-mono">{detections.error}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 items-start overflow-x-auto pb-2">
          {STAGE_DEFINITIONS.map((stage) => (
            <LifecycleStage
              key={stage.id}
              stage={stage}
              items={stageItemsMap[stage.id] ?? []}
              onSelect={setSelectedDetection}
              selectedId={selectedDetection?.id}
            />
          ))}
        </div>
      )}

      {/* ── Slide-in Lifecycle Inspection Drawer ── */}
      <LifecycleDetail
        detection={selectedDetection}
        onClose={() => setSelectedDetection(null)}
      />
    </div>
  );
}
