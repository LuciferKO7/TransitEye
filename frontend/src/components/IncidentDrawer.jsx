import React from 'react';
import {
  X,
  ShieldAlert,
  Car,
  MapPin,
  Clock,
  Radio,
  AlertTriangle,
  Film,
  Eye,
  Gauge,
  Hash,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Validate that a coordinate is a real, in-range finite number.
 */
function isValidCoord(value, min, max) {
  return typeof value === 'number' && isFinite(value) && value >= min && value <= max;
}

function isValidLocation(loc) {
  if (!loc || typeof loc !== 'object') return false;
  const lat = loc.latitude ?? loc.lat;
  const lng = loc.longitude ?? loc.lng;
  return (
    isValidCoord(lat, -90, 90) &&
    isValidCoord(lng, -180, 180)
  );
}

/**
 * Map trigger_reason values to a human-readable label.
 */
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
  return TRIGGER_LABELS[trigger] ?? trigger?.replace(/_/g, ' ') ?? 'Unknown Trigger';
}

/**
 * Severity badge colour based on plate confidence and trigger type.
 * Low confidence = uncertain; certain triggers = severe.
 */
function getSeverityClass(incident) {
  const highSeverityTriggers = new Set([
    'reckless_overtake', 'red_light', 'wrong_way', 'signal_jump',
  ]);
  if (highSeverityTriggers.has(incident.trigger_reason)) {
    return { label: 'CRITICAL', classes: 'bg-rose-950 text-rose-300 border-rose-700/50' };
  }
  if (incident.plate_confidence >= 0.8) {
    return { label: 'CONFIRMED', classes: 'bg-amber-950 text-amber-300 border-amber-700/50' };
  }
  return { label: 'UNVERIFIED', classes: 'bg-slate-800 text-slate-400 border-slate-700' };
}

function formatTimestamp(ts) {
  if (!ts) return 'N/A';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'medium',
      timeZone: 'Asia/Kolkata',
    }).format(new Date(ts));
  } catch {
    return ts;
  }
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function DataRow({ icon: Icon, label, value, mono = false, className = '' }) {
  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-800/60 last:border-0">
      <div className="mt-0.5 shrink-0">
        <Icon className="w-4 h-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-0.5">
          {label}
        </p>
        <p
          className={`text-sm break-all ${mono ? 'font-mono' : ''} text-slate-200 ${className}`}
        >
          {value ?? <span className="text-slate-500 italic">—</span>}
        </p>
      </div>
    </div>
  );
}

function ConfidenceBar({ confidence }) {
  const pct = Math.round((confidence ?? 0) * 100);
  const barColor =
    pct >= 80
      ? 'bg-emerald-500'
      : pct >= 50
      ? 'bg-amber-500'
      : 'bg-rose-500';

  return (
    <div className="flex items-start gap-3 py-2.5 border-b border-slate-800/60">
      <div className="mt-0.5 shrink-0">
        <Gauge className="w-4 h-4 text-slate-500" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
          OCR Confidence
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${barColor}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className={`text-sm font-mono font-bold ${barColor.replace('bg-', 'text-')}`}>
            {pct}%
          </span>
        </div>
      </div>
    </div>
  );
}

function EvidenceClip({ clipUrl }) {
  if (!clipUrl) {
    return (
      <div className="mt-4 flex flex-col items-center justify-center gap-2 h-28 rounded-lg border border-dashed border-slate-800 bg-slate-900/40 text-slate-500">
        <Film className="w-6 h-6 opacity-40" />
        <p className="text-xs font-mono">No evidence clip available</p>
      </div>
    );
  }

  return (
    <div className="mt-4">
      <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center gap-1.5">
        <Film className="w-3.5 h-3.5" />
        Evidence Clip
      </p>
      <a
        href={clipUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-cyan-800/60 bg-cyan-950/40
                   text-cyan-300 text-xs font-mono hover:bg-cyan-950/70 hover:border-cyan-600 transition-all"
      >
        <Eye className="w-4 h-4 shrink-0" />
        <span className="truncate">{clipUrl}</span>
      </a>
    </div>
  );
}

// ─── Main Drawer ─────────────────────────────────────────────────────────────

/**
 * IncidentDrawer — Read-only slide-in panel for ANPR / incident evidence.
 *
 * Props:
 *   incident  — the selected incident object (null = closed)
 *   onClose   — callback to close the drawer
 */
export default function IncidentDrawer({ incident, onClose }) {
  // Overlay click-away handler
  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  if (!incident) return null;

  const severity = getSeverityClass(incident);
  const locationValid = isValidLocation(incident.location);

  return (
    /* Overlay */
    <div
      className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fadeIn"
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Incident Evidence Drawer"
    >
      {/* Drawer panel */}
      <div
        className="relative w-full max-w-md bg-slate-950 border-l border-slate-800/80
                   flex flex-col overflow-hidden shadow-2xl animate-slideIn"
      >
        {/* ── Header ── */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800/80 bg-slate-950">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldAlert className="w-5 h-5 text-rose-400" />
              <h2 className="text-sm font-bold font-mono uppercase tracking-wider text-white">
                Incident Evidence
              </h2>
            </div>
            <p className="text-[11px] text-slate-500 font-mono">
              ID: {incident.id ?? 'N/A'}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span
              className={`text-[10px] font-mono font-bold px-2 py-1 rounded border ${severity.classes}`}
            >
              {severity.label}
            </span>
            <button
              onClick={onClose}
              className="text-slate-500 hover:text-white hover:bg-slate-800 rounded p-1 transition-colors"
              aria-label="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Plate Banner ── */}
        <div className="px-5 py-4 bg-slate-900/60 border-b border-slate-800/60">
          <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-1">
            Recognized Plate
          </p>
          <div className="flex items-center gap-3">
            <div
              className="flex-1 flex items-center justify-center bg-slate-950 border-2 border-slate-700
                          rounded-lg py-3 px-4"
            >
              <span className="text-2xl font-black font-mono tracking-[0.25em] text-white uppercase">
                {incident.plate_text && incident.plate_text !== 'UNKNOWN'
                  ? incident.plate_text
                  : <span className="text-slate-500 text-base tracking-normal">UNRECOGNIZED</span>
                }
              </span>
            </div>
          </div>
        </div>

        {/* ── Scrollable Body ── */}
        <div className="flex-1 overflow-y-auto">
          <div className="px-5 py-3">

            {/* Trigger Section */}
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 pt-1">
              Violation Details
            </p>
            <div className="bg-slate-900/60 rounded-lg border border-slate-800/60 px-4 divide-y divide-slate-800/40">
              <DataRow
                icon={AlertTriangle}
                label="Trigger Reason"
                value={getTriggerLabel(incident.trigger_reason)}
                className="text-amber-300 font-semibold"
              />
              <ConfidenceBar confidence={incident.plate_confidence} />
              <DataRow
                icon={Hash}
                label="Bus ID"
                value={incident.bus_id}
                mono
              />
              <DataRow
                icon={Clock}
                label="Timestamp"
                value={formatTimestamp(incident.timestamp)}
                mono
              />
            </div>

            {/* Location Section */}
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 mt-4">
              Location
            </p>
            <div className="bg-slate-900/60 rounded-lg border border-slate-800/60 px-4 divide-y divide-slate-800/40">
              {locationValid ? (
                <>
                  <DataRow
                    icon={MapPin}
                    label="Coordinates"
                    value={`${(incident.location.latitude ?? incident.location.lat).toFixed(6)}, ${(incident.location.longitude ?? incident.location.lng).toFixed(6)}`}
                    mono
                  />
                  {incident.location.address && (
                    <DataRow
                      icon={MapPin}
                      label="Address"
                      value={incident.location.address}
                    />
                  )}
                </>
              ) : (
                <div className="py-3 text-xs text-slate-500 font-mono flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location data unavailable or invalid
                </div>
              )}
            </div>

            {/* Metadata Section */}
            {incident.metadata && Object.keys(incident.metadata).length > 0 && (
              <>
                <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 mt-4">
                  Additional Context
                </p>
                <div className="bg-slate-900/60 rounded-lg border border-slate-800/60 px-4 divide-y divide-slate-800/40">
                  {Object.entries(incident.metadata).map(([key, val]) => (
                    <DataRow
                      key={key}
                      icon={Radio}
                      label={key.replace(/_/g, ' ')}
                      value={String(val)}
                      mono
                    />
                  ))}
                </div>
              </>
            )}

            {/* Evidence Clip */}
            <EvidenceClip clipUrl={incident.clip_url} />

            {/* Read-only notice */}
            <div className="mt-4 mb-2 flex items-center gap-2 text-[11px] text-slate-600 font-mono">
              <Car className="w-3.5 h-3.5" />
              <span>Read-only view · Lifecycle management via Repair Lifecycle module</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
