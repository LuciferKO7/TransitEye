import React, { useState, useMemo } from 'react';
import {
  ShieldAlert,
  AlertTriangle,
  Search,
  ChevronRight,
  Car,
  Clock,
  MapPin,
  Radio,
  Loader2,
  AlertCircle,
  ListFilter,
} from 'lucide-react';

// ─── Helpers ─────────────────────────────────────────────────────────────────

const TRIGGER_LABELS = {
  bus_lane_violation: 'Bus Lane Violation',
  reckless_overtake: 'Reckless Overtake',
  red_light: 'Red Light Run',
  speeding: 'Speeding',
  wrong_way: 'Wrong-Way Entry',
  pedestrian_hazard: 'Pedestrian Hazard',
  signal_jump: 'Signal Jump',
  no_helmet: 'No Helmet Detected',
};

function getTriggerLabel(trigger) {
  return TRIGGER_LABELS[trigger] ?? trigger?.replace(/_/g, ' ') ?? 'Unknown';
}

const HIGH_SEVERITY_TRIGGERS = new Set([
  'reckless_overtake', 'red_light', 'wrong_way', 'signal_jump',
]);

function getSeverity(incident) {
  if (HIGH_SEVERITY_TRIGGERS.has(incident.trigger_reason)) {
    return {
      level: 'critical',
      label: 'CRITICAL',
      badge: 'bg-rose-950 text-rose-300 border-rose-700/50',
      row: 'border-l-rose-500',
      dot: 'bg-rose-400',
    };
  }
  if (incident.plate_confidence >= 0.8) {
    return {
      level: 'confirmed',
      label: 'CONFIRMED',
      badge: 'bg-amber-950 text-amber-300 border-amber-700/50',
      row: 'border-l-amber-500',
      dot: 'bg-amber-400',
    };
  }
  return {
    level: 'unverified',
    label: 'UNVERIFIED',
    badge: 'bg-slate-800 text-slate-400 border-slate-700',
    row: 'border-l-slate-600',
    dot: 'bg-slate-500',
  };
}

function formatTimestampShort(ts) {
  if (!ts) return '—';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      timeStyle: 'short',
      dateStyle: 'short',
      timeZone: 'Asia/Kolkata',
    }).format(new Date(ts));
  } catch {
    return ts;
  }
}

// ─── Filter Pill ─────────────────────────────────────────────────────────────

function FilterPill({ label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`px-2.5 py-1 rounded text-[10px] font-mono font-semibold border transition-all ${
        active
          ? 'bg-cyan-950 text-cyan-300 border-cyan-700/60'
          : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
      }`}
    >
      {label}
    </button>
  );
}

// ─── Incident Row ─────────────────────────────────────────────────────────────

function IncidentRow({ incident, onSelect }) {
  const severity = getSeverity(incident);
  const pct = Math.round((incident.plate_confidence ?? 0) * 100);

  return (
    <button
      onClick={() => onSelect(incident)}
      className={`w-full text-left border-l-4 ${severity.row} bg-slate-900/50 hover:bg-slate-900
                  border border-l-4 border-slate-800/60 rounded-lg px-4 py-3 transition-all
                  hover:border-slate-700 hover:shadow-md group relative`}
    >
      {/* Top row: plate + severity + chevron */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`w-2 h-2 rounded-full shrink-0 ${severity.dot}`}
          />
          <span className="text-sm font-black font-mono tracking-widest text-white uppercase">
            {incident.plate_text && incident.plate_text !== 'UNKNOWN'
              ? incident.plate_text
              : <span className="text-slate-500 text-xs font-semibold tracking-normal">UNRECOGNIZED</span>
            }
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${severity.badge}`}
          >
            {severity.label}
          </span>
          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:text-slate-300 transition-colors" />
        </div>
      </div>

      {/* Trigger */}
      <div className="flex items-center gap-1.5 mb-2">
        <AlertTriangle className="w-3 h-3 text-amber-500 shrink-0" />
        <span className="text-xs text-amber-300/90 font-medium">
          {getTriggerLabel(incident.trigger_reason)}
        </span>
      </div>

      {/* Meta row: bus, time, confidence */}
      <div className="flex items-center gap-3 text-[11px] font-mono text-slate-500">
        <span className="flex items-center gap-1">
          <Car className="w-3 h-3" />
          {incident.bus_id ?? '—'}
        </span>
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {formatTimestampShort(incident.timestamp)}
        </span>
        <span className="flex items-center gap-1 ml-auto">
          <span className="text-slate-600">OCR</span>
          <span
            className={`font-bold ${
              pct >= 80
                ? 'text-emerald-400'
                : pct >= 50
                ? 'text-amber-400'
                : 'text-rose-400'
            }`}
          >
            {pct}%
          </span>
        </span>
      </div>
    </button>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ filtered }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-600">
      <ShieldAlert className="w-10 h-10 mb-3 opacity-30" />
      <p className="text-sm font-mono font-semibold">
        {filtered ? 'No matching incidents' : 'No incidents recorded'}
      </p>
      <p className="text-xs mt-1 text-slate-700">
        {filtered
          ? 'Adjust your search or filters.'
          : 'Incidents flagged by edge ANPR will appear here.'}
      </p>
    </div>
  );
}

// ─── Error / Loading States ───────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-600">
      <Loader2 className="w-8 h-8 mb-3 animate-spin text-cyan-600" />
      <p className="text-sm font-mono">Loading incident feed…</p>
    </div>
  );
}

function ErrorState({ message }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-slate-600">
      <AlertCircle className="w-8 h-8 mb-3 text-rose-500 opacity-60" />
      <p className="text-sm font-mono font-semibold text-rose-400">Feed unavailable</p>
      <p className="text-xs mt-1 text-slate-600 max-w-xs text-center">{message}</p>
    </div>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

const FILTER_OPTIONS = [
  { key: 'all', label: 'All' },
  { key: 'critical', label: 'Critical' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'unverified', label: 'Unverified' },
];

/**
 * IncidentFeed — Paginated, filterable list of ANPR/traffic incidents.
 *
 * Props:
 *   incidents  — { loading, data, error } from App.jsx
 *   onSelect   — callback(incident) to open drawer
 */
export default function IncidentFeed({ incidents, onSelect }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const records = incidents?.data?.data ?? [];

  const filtered = useMemo(() => {
    let result = records;

    // Severity filter
    if (filter !== 'all') {
      result = result.filter((inc) => getSeverity(inc).level === filter);
    }

    // Search by plate or trigger
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      result = result.filter(
        (inc) =>
          (inc.plate_text ?? '').toLowerCase().includes(q) ||
          getTriggerLabel(inc.trigger_reason).toLowerCase().includes(q) ||
          (inc.bus_id ?? '').toLowerCase().includes(q)
      );
    }

    return result;
  }, [records, filter, search]);

  const totalCount = records.length;
  const criticalCount = records.filter((i) => HIGH_SEVERITY_TRIGGERS.has(i.trigger_reason)).length;

  return (
    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">
      {/* ── Panel Header ── */}
      <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-950/80">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
              ANPR Incident Feed
            </h3>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-mono">
            <span className="flex items-center gap-1.5 text-slate-500">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              {incidents?.loading ? (
                <span className="text-slate-600">Fetching…</span>
              ) : (
                <span>
                  <span className="text-slate-300 font-bold">{totalCount}</span> records
                </span>
              )}
            </span>
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 rounded border bg-rose-950 text-rose-300 border-rose-700/50 font-bold">
                {criticalCount} CRITICAL
              </span>
            )}
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search plate, trigger, bus ID…"
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-8 pr-3 py-2
                       text-xs font-mono text-slate-200 placeholder-slate-600
                       focus:outline-none focus:border-cyan-700 focus:ring-1 focus:ring-cyan-700/40
                       transition-colors"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <ListFilter className="w-3.5 h-3.5 text-slate-600 shrink-0" />
          {FILTER_OPTIONS.map((opt) => (
            <FilterPill
              key={opt.key}
              label={opt.label}
              active={filter === opt.key}
              onClick={() => setFilter(opt.key)}
            />
          ))}
          <span className="text-[10px] font-mono text-slate-600 ml-auto hidden sm:inline" title="Severities (CRITICAL / CONFIRMED / UNVERIFIED) are frontend visual heuristics based on trigger and confidence thresholds.">
            UI classification
          </span>
        </div>
      </div>

      {/* ── Feed Body ── */}
      <div className="flex-1 overflow-y-auto max-h-[520px] px-4 py-3 space-y-2.5">
        {incidents?.loading ? (
          <LoadingState />
        ) : incidents?.error ? (
          <ErrorState message={incidents.error} />
        ) : filtered.length === 0 ? (
          <EmptyState filtered={search.trim() !== '' || filter !== 'all'} />
        ) : (
          filtered.map((incident) => (
            <IncidentRow
              key={incident.id}
              incident={incident}
              onSelect={onSelect}
            />
          ))
        )}
      </div>

      {/* ── Footer ── */}
      {!incidents?.loading && !incidents?.error && filtered.length > 0 && (
        <div className="px-5 py-2.5 border-t border-slate-800/60 bg-slate-950/60 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-600">
            Showing{' '}
            <span className="text-slate-400 font-bold">{filtered.length}</span>{' '}
            of{' '}
            <span className="text-slate-400 font-bold">{totalCount}</span>{' '}
            incidents
          </span>
          <div className="flex items-center gap-1.5 text-[11px] font-mono text-slate-600">
            <MapPin className="w-3 h-3" />
            Click any row to inspect evidence
          </div>
        </div>
      )}
    </div>
  );
}
