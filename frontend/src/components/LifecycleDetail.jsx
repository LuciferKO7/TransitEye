import React from 'react';
import {
  X,
  AlertTriangle,
  Droplet,
  ShieldAlert,
  Car,
  MapPin,
  Clock,
  Gauge,
  Layers,
  CheckCircle2,
  Lock,
  Wrench,
  UserCheck,
  ShieldCheck,
  Info,
  Hash,
  Activity
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

function formatTimestamp(ts) {
  if (!ts) return '—';
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

function DataRow({ icon: Icon, label, value, mono = false, color = 'text-white' }) {
  return (
    <div className="flex items-center justify-between py-2 border-b border-slate-800/40 text-xs">
      <div className="flex items-center gap-2 text-slate-400">
        {Icon && <Icon className="w-3.5 h-3.5 text-slate-500" />}
        <span>{label}</span>
      </div>
      <span className={`font-medium ${mono ? 'font-mono' : ''} ${color}`}>
        {value ?? '—'}
      </span>
    </div>
  );
}

/**
 * LifecycleDetail — Slide-in drawer inspecting a detection observation's lifecycle status.
 *
 * Extensible Component Architecture:
 * - Designed with a dedicated "Workflow & Future Actions" section.
 * - When backend teammate deploys PATCH/PUT mutation endpoints, action handlers can be wired directly.
 */
export default function LifecycleDetail({ detection, onClose }) {
  if (!detection) return null;

  const IconComponent = CATEGORY_ICONS[detection.type] ?? AlertTriangle;
  const severityClass = SEVERITY_CLASSES[detection.severity] ?? 'bg-slate-800 text-slate-300 border-slate-700';
  const statusClass = STATUS_CLASSES[detection.status] ?? 'bg-slate-800 text-slate-400 border-slate-700';
  const confidencePct = Math.round((detection.confidence ?? 0) * 100);

  const loc = detection.location;
  const lat = loc?.latitude;
  const lng = loc?.longitude;
  const isValidLoc = typeof lat === 'number' && typeof lng === 'number';

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm animate-fadeIn">
      {/* Backdrop click to close */}
      <div className="flex-1" onClick={onClose} />

      {/* Drawer Container */}
      <div className="relative w-full max-w-lg bg-slate-950 border-l border-slate-800/80 flex flex-col overflow-hidden shadow-2xl animate-slideIn">
        {/* Header */}
        <div className="flex items-start justify-between p-5 border-b border-slate-800/80 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-cyan-400">
              <IconComponent className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold font-mono text-white capitalize">
                {detection.subtype ? detection.subtype.replace(/_/g, ' ') : 'Detection Record'}
              </h2>
              <p className="text-[11px] text-slate-500 font-mono">
                ID: {detection.id}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`text-[10px] font-mono font-bold uppercase px-2 py-1 rounded border ${severityClass}`}>
              {detection.severity ?? 'N/A'}
            </span>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5">
          {/* Section 1: Perception Overview */}
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
              Observation Telemetry
            </p>
            <div className="bg-slate-900/60 rounded-xl border border-slate-800/60 px-4 divide-y divide-slate-800/40">
              <DataRow label="Domain Category" value={detection.type} mono />
              <DataRow label="Subtype Label" value={detection.subtype} mono />
              <DataRow
                label="Backend Lifecycle Status"
                value={detection.status ?? 'pending'}
                mono
                color="text-amber-400 font-bold"
              />
              <DataRow
                label="AI Perception Confidence"
                value={`${confidencePct}%`}
                mono
                color={confidencePct >= 85 ? 'text-emerald-400 font-bold' : 'text-amber-400'}
              />
              <DataRow
                label="Confirmed Bus Passes"
                value={`${detection.confirmed_by_count ?? 1} validation pass(es)`}
                mono
              />
              <DataRow icon={Car} label="Sensing Bus Fleet ID" value={detection.bus_id} mono />
              <DataRow icon={Layers} label="GIS Segment ID" value={detection.segment_id} mono />
              <DataRow icon={Clock} label="Observation Timestamp" value={formatTimestamp(detection.timestamp)} mono />
            </div>
          </div>

          {/* Section 2: GIS Location */}
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
              Geographic Coordinates
            </p>
            <div className="bg-slate-900/60 rounded-xl border border-slate-800/60 px-4 divide-y divide-slate-800/40">
              {isValidLoc ? (
                <>
                  <DataRow
                    icon={MapPin}
                    label="WGS84 Coordinates"
                    value={`${lat.toFixed(6)}, ${lng.toFixed(6)}`}
                    mono
                  />
                  {loc.speed !== undefined && loc.speed !== null && (
                    <DataRow icon={Gauge} label="Bus Speed at Observation" value={`${loc.speed} km/h`} mono />
                  )}
                  {loc.heading !== undefined && loc.heading !== null && (
                    <DataRow label="Heading" value={`${loc.heading}°`} mono />
                  )}
                  {loc.accuracy !== undefined && loc.accuracy !== null && (
                    <DataRow label="GPS Accuracy" value={`±${loc.accuracy} m`} mono />
                  )}
                </>
              ) : (
                <div className="py-3 text-xs text-slate-500 font-mono flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Location data unavailable
                </div>
              )}
            </div>
          </div>

          {/* Section 3: Metadata Attributes */}
          {detection.metadata && Object.keys(detection.metadata).length > 0 && (
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2">
                Metadata & Bounding Details
              </p>
              <div className="bg-slate-900/60 rounded-xl border border-slate-800/60 px-4 py-2 font-mono text-xs text-slate-300 space-y-1.5">
                {Object.entries(detection.metadata).map(([key, val]) => (
                  <div key={key} className="flex items-center justify-between py-1 border-b border-slate-800/30 last:border-0">
                    <span className="text-slate-400 capitalize">{key.replace(/_/g, ' ')}:</span>
                    <span className="text-cyan-300">
                      {Array.isArray(val) ? `[${val.join(', ')}]` : String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Section 4: Workflow & Extensible Future Mutation Actions */}
          <div>
            <p className="text-[11px] font-mono uppercase tracking-wider text-slate-500 mb-2 flex items-center justify-between">
              <span>Lifecycle Workflow State</span>
              <span className="text-[9px] text-cyan-400 font-normal">Extensible v1.0</span>
            </p>

            <div className="bg-slate-900/90 rounded-xl border border-slate-800 p-4 space-y-4">
              {/* Step indicator */}
              <div className="flex items-center justify-between text-[10px] font-mono">
                <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>1. Detected</span>
                </div>
                <span className="text-slate-600">→</span>
                <div className={`flex items-center gap-1.5 ${
                  detection.status === 'confirmed' || detection.status === 'in_review'
                    ? 'text-emerald-400 font-bold'
                    : 'text-slate-500'
                }`}>
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>2. Verified</span>
                </div>
                <span className="text-slate-600">→</span>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>3. Assigned</span>
                </div>
                <span className="text-slate-600">→</span>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <Wrench className="w-3.5 h-3.5" />
                  <span>4. Repaired</span>
                </div>
              </div>

              {/* Future Action Controls (Disabled / Read-Only Notice) */}
              <div className="pt-3 border-t border-slate-800/80 space-y-2.5">
                <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                  <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                  <span className="font-semibold text-slate-300">Lifecycle Actions (Read-Only Mode)</span>
                </div>
                <p className="text-[11px] text-slate-500 font-mono leading-relaxed">
                  Backend mutation API endpoints (`PATCH /api/detections/:id`) for technician assignment, repair logging, and status transitions are pending backend deployment.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    disabled
                    title="Lifecycle actions pending backend PATCH/PUT endpoint availability"
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 text-slate-600 border border-slate-800 text-[10px] font-mono cursor-not-allowed opacity-70"
                  >
                    <UserCheck className="w-3 h-3" />
                    <span>Assign Tech</span>
                    <Lock className="w-2.5 h-2.5 ml-auto" />
                  </button>

                  <button
                    disabled
                    title="Lifecycle actions pending backend PATCH/PUT endpoint availability"
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 text-slate-600 border border-slate-800 text-[10px] font-mono cursor-not-allowed opacity-70"
                  >
                    <Wrench className="w-3 h-3" />
                    <span>Mark Repaired</span>
                    <Lock className="w-2.5 h-2.5 ml-auto" />
                  </button>

                  <button
                    disabled
                    title="Lifecycle actions pending backend PATCH/PUT endpoint availability"
                    className="w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-slate-950 text-slate-600 border border-slate-800 text-[10px] font-mono cursor-not-allowed opacity-70"
                  >
                    <ShieldCheck className="w-3 h-3" />
                    <span>Re-verify</span>
                    <Lock className="w-2.5 h-2.5 ml-auto" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
