import React from 'react';
import { AlertTriangle, ShieldAlert, Car, Activity, RefreshCw } from 'lucide-react';

export default function TelemetryCards({ detections, incidents, vehicleDensity }) {
  // Metric A: Active Road Defects
  const getActiveDefectsState = () => {
    if (detections.loading) {
      return { status: 'loading', text: 'Loading telemetry...' };
    }
    if (detections.error) {
      return { status: 'error', text: 'Unable to load detection telemetry' };
    }
    if (!detections.data || detections.data.data.length === 0) {
      return { status: 'empty', text: 'No defects reported', count: 0 };
    }
    const count = detections.data.data.filter((d) => d.type === 'road_defect').length;
    return { status: 'success', count, text: `${count} active road defects detected` };
  };

  // Metric B: Severe Hazards (high / critical severity across all detections)
  const getSevereHazardsState = () => {
    if (detections.loading) {
      return { status: 'loading', text: 'Loading telemetry...' };
    }
    if (detections.error) {
      return { status: 'error', text: 'Unable to load hazard telemetry' };
    }
    if (!detections.data || detections.data.data.length === 0) {
      return { status: 'empty', text: 'No severe hazards reported', count: 0 };
    }
    const count = detections.data.data.filter(
      (d) => d.severity === 'high' || d.severity === 'critical'
    ).length;
    return { status: 'success', count, text: `${count} high/critical severity hazards` };
  };

  // Metric C: ANPR & Traffic Incidents
  const getIncidentsState = () => {
    if (incidents.loading) {
      return { status: 'loading', text: 'Loading telemetry...' };
    }
    if (incidents.error) {
      return { status: 'error', text: 'Unable to load incident telemetry' };
    }
    if (!incidents.data || incidents.data.data.length === 0) {
      return { status: 'empty', text: 'No incidents reported', count: 0 };
    }
    const count = incidents.data.count || incidents.data.data.length;
    return { status: 'success', count, text: `${count} recorded traffic & ANPR incidents` };
  };

  // Metric D: Traffic Density / Congestion
  const getCongestionState = () => {
    if (vehicleDensity.loading) {
      return { status: 'loading', text: 'Loading telemetry...' };
    }
    if (vehicleDensity.error) {
      return { status: 'error', text: 'Unable to load density telemetry' };
    }
    if (!vehicleDensity.data || vehicleDensity.data.data.length === 0) {
      return { status: 'empty', text: 'No density observations', count: 0, level: 'N/A' };
    }

    const records = vehicleDensity.data.data;
    const totalVehicles = records.reduce((sum, r) => sum + (Number(r.vehicle_count) || 0), 0);
    const latestRecord = records[records.length - 1];
    const congestionLevel = latestRecord?.metadata?.congestion_level || 'Moderate';

    return {
      status: 'success',
      totalVehicles,
      level: String(congestionLevel).toUpperCase(),
      text: `${totalVehicles} total vehicles observed across ${records.length} segment(s)`,
    };
  };

  const defectsState = getActiveDefectsState();
  const hazardsState = getSevereHazardsState();
  const incidentsState = getIncidentsState();
  const congestionState = getCongestionState();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Active Road Defects */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-semibold uppercase text-amber-400/90 tracking-wider">
            Active Road Defects
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-950/60 border border-amber-800/40 flex items-center justify-center text-amber-400">
            <AlertTriangle className="w-4 h-4" />
          </div>
        </div>
        <div>
          {defectsState.status === 'loading' && (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-amber-400" />
              <span>{defectsState.text}</span>
            </div>
          )}
          {defectsState.status === 'error' && (
            <div className="text-rose-400 text-xs py-1 font-medium">{defectsState.text}</div>
          )}
          {defectsState.status === 'empty' && (
            <div>
              <div className="text-2xl font-mono font-bold text-slate-400">0</div>
              <div className="text-xs text-slate-500 mt-1">{defectsState.text}</div>
            </div>
          )}
          {defectsState.status === 'success' && (
            <div>
              <div className="text-3xl font-mono font-bold text-white tracking-tight">
                {defectsState.count}
              </div>
              <div className="text-xs text-slate-400 mt-1 truncate">{defectsState.text}</div>
            </div>
          )}
        </div>
      </div>

      {/* Card 2: Severe Hazards */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-semibold uppercase text-rose-400/90 tracking-wider">
            Severe Hazards
          </span>
          <div className="w-8 h-8 rounded-lg bg-rose-950/60 border border-rose-800/40 flex items-center justify-center text-rose-400">
            <ShieldAlert className="w-4 h-4" />
          </div>
        </div>
        <div>
          {hazardsState.status === 'loading' && (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-rose-400" />
              <span>{hazardsState.text}</span>
            </div>
          )}
          {hazardsState.status === 'error' && (
            <div className="text-rose-400 text-xs py-1 font-medium">{hazardsState.text}</div>
          )}
          {hazardsState.status === 'empty' && (
            <div>
              <div className="text-2xl font-mono font-bold text-slate-400">0</div>
              <div className="text-xs text-slate-500 mt-1">{hazardsState.text}</div>
            </div>
          )}
          {hazardsState.status === 'success' && (
            <div>
              <div className="text-3xl font-mono font-bold text-rose-300 tracking-tight">
                {hazardsState.count}
              </div>
              <div className="text-xs text-slate-400 mt-1 truncate">{hazardsState.text}</div>
            </div>
          )}
        </div>
      </div>

      {/* Card 3: ANPR Incidents */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-semibold uppercase text-cyan-400/90 tracking-wider">
            ANPR Incidents
          </span>
          <div className="w-8 h-8 rounded-lg bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400">
            <Activity className="w-4 h-4" />
          </div>
        </div>
        <div>
          {incidentsState.status === 'loading' && (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
              <span>{incidentsState.text}</span>
            </div>
          )}
          {incidentsState.status === 'error' && (
            <div className="text-rose-400 text-xs py-1 font-medium">{incidentsState.text}</div>
          )}
          {incidentsState.status === 'empty' && (
            <div>
              <div className="text-2xl font-mono font-bold text-slate-400">0</div>
              <div className="text-xs text-slate-500 mt-1">{incidentsState.text}</div>
            </div>
          )}
          {incidentsState.status === 'success' && (
            <div>
              <div className="text-3xl font-mono font-bold text-white tracking-tight">
                {incidentsState.count}
              </div>
              <div className="text-xs text-slate-400 mt-1 truncate">{incidentsState.text}</div>
            </div>
          )}
        </div>
      </div>

      {/* Card 4: Traffic Observations */}
      <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-xl shadow-sm flex flex-col justify-between">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-mono font-semibold uppercase text-emerald-400/90 tracking-wider">
            Traffic Observations
          </span>
          <div className="w-8 h-8 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
            <Car className="w-4 h-4" />
          </div>
        </div>
        <div>
          {congestionState.status === 'loading' && (
            <div className="flex items-center gap-2 text-slate-400 text-sm py-1">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              <span>{congestionState.text}</span>
            </div>
          )}
          {congestionState.status === 'error' && (
            <div className="text-rose-400 text-xs py-1 font-medium">{congestionState.text}</div>
          )}
          {congestionState.status === 'empty' && (
            <div>
              <div className="text-2xl font-mono font-bold text-slate-400">N/A</div>
              <div className="text-xs text-slate-500 mt-1">{congestionState.text}</div>
            </div>
          )}
          {congestionState.status === 'success' && (
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-mono font-bold text-white tracking-tight">
                  {congestionState.totalVehicles}
                </span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                  {congestionState.level}
                </span>
              </div>
              <div className="text-xs text-slate-400 mt-1 truncate">{congestionState.text}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
