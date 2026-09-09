import React from 'react';
import {
  AlertTriangle,
  Droplet,
  ShieldAlert,
  Car,
  MapPin,
  Clock,
  ChevronRight,
  Eye,
  Layers,
  CheckCircle2
} from 'lucide-react';

const CATEGORY_ICONS = {
  road_defect: AlertTriangle,
  waterlogging: Droplet,
  vru_safety: ShieldAlert,
};

const SEVERITY_CLASSES = {
  low: 'bg-blue-950 text-blue-300 border-blue-800/60',
  medium: 'bg-amber-950 text-amber-300 border-amber-800/60',
  high: 'bg-orange-950 text-orange-300 border-orange-800/60',
  critical: 'bg-rose-950 text-rose-300 border-rose-800/60',
};

const STATUS_CLASSES = {
  pending: 'bg-amber-950/80 text-amber-300 border-amber-700/50',
  in_review: 'bg-cyan-950/80 text-cyan-300 border-cyan-700/50',
  confirmed: 'bg-emerald-950/80 text-emerald-300 border-emerald-700/50',
  resolved: 'bg-indigo-950/80 text-indigo-300 border-indigo-700/50',
  rejected: 'bg-rose-950/80 text-rose-300 border-rose-700/50',
};

function formatSubtype(subtype) {
  if (!subtype) return 'Unspecified';
  return subtype.replace(/_/g, ' ');
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

/**
 * LifecycleItem — Card representing a single backend detection record in a lifecycle stage.
 */
export default function LifecycleItem({ detection, onSelect, isSelected }) {
  const IconComponent = CATEGORY_ICONS[detection.type] ?? AlertTriangle;
  const severityClass = SEVERITY_CLASSES[detection.severity] ?? 'bg-slate-800 text-slate-300 border-slate-700';
  const statusClass = STATUS_CLASSES[detection.status] ?? 'bg-slate-800 text-slate-400 border-slate-700';
  const confidencePct = Math.round((detection.confidence ?? 0) * 100);

  const lat = detection.location?.latitude;
  const lng = detection.location?.longitude;
  const coordsText =
    typeof lat === 'number' && typeof lng === 'number'
      ? `${lat.toFixed(4)}, ${lng.toFixed(4)}`
      : 'No coords';

  return (
    <button
      onClick={() => onSelect && onSelect(detection)}
      className={`w-full text-left bg-slate-900/60 hover:bg-slate-900 border rounded-xl p-3.5 transition-all
                  hover:border-slate-700 hover:shadow-lg group relative flex flex-col space-y-2.5 ${
                    isSelected
                      ? 'border-cyan-500/80 ring-1 ring-cyan-500/50 bg-slate-900'
                      : 'border-slate-800/80'
                  }`}
    >
      {/* Top row: Type Icon + Subtype Title + Severity Badge */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="p-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 shrink-0">
            <IconComponent className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="min-w-0">
            <h4 className="text-xs font-bold text-white capitalize truncate font-mono tracking-tight">
              {formatSubtype(detection.subtype)}
            </h4>
            <p className="text-[10px] text-slate-500 font-mono truncate">
              {detection.id}
            </p>
          </div>
        </div>
        <span
          className={`text-[9px] font-mono font-bold uppercase px-1.5 py-0.5 rounded border shrink-0 ${severityClass}`}
        >
          {detection.severity ?? 'N/A'}
        </span>
      </div>

      {/* Status & Confidence bar */}
      <div className="flex items-center justify-between text-[10px] font-mono pt-1 border-t border-slate-800/50">
        <span
          className={`px-1.5 py-0.5 rounded border uppercase font-semibold text-[9px] ${statusClass}`}
        >
          Backend: {detection.status ?? 'pending'}
        </span>
        <span className="text-slate-400 font-semibold flex items-center gap-1">
          <span className="text-slate-600">AI Conf</span>
          <span className={confidencePct >= 85 ? 'text-emerald-400 font-bold' : 'text-amber-400'}>
            {confidencePct}%
          </span>
        </span>
      </div>

      {/* Metadata grid: Bus ID, Passes, Location */}
      <div className="grid grid-cols-2 gap-1.5 text-[10px] font-mono text-slate-400 bg-slate-950/50 p-2 rounded-lg border border-slate-800/40">
        <div className="flex items-center gap-1 truncate">
          <Car className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{detection.bus_id ?? '—'}</span>
        </div>
        <div className="flex items-center gap-1 truncate justify-end">
          <CheckCircle2 className="w-3 h-3 text-emerald-500 shrink-0" />
          <span>{detection.confirmed_by_count ?? 1} pass(es)</span>
        </div>
        <div className="flex items-center gap-1 truncate col-span-2 text-slate-500">
          <MapPin className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{coordsText}</span>
          {detection.segment_id && (
            <span className="ml-auto text-[9px] text-cyan-400/80 truncate">
              {detection.segment_id}
            </span>
          )}
        </div>
      </div>

      {/* Footer: Timestamp + Inspect Action Link */}
      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-0.5">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3 text-slate-600" />
          {formatTimestampShort(detection.timestamp)}
        </span>
        <span className="text-cyan-400 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5 font-semibold text-[10px]">
          Inspect Details
          <ChevronRight className="w-3 h-3" />
        </span>
      </div>
    </button>
  );
}
