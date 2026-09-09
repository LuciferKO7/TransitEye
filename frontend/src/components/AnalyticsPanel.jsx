import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from 'recharts';
import {
  BarChart3,
  Activity,
  AlertTriangle,
  Car,
  ShieldAlert,
  Clock,
  Filter,
  RefreshCw,
  Info,
  CheckCircle2,
  PieChart as PieIcon,
  Layers,
  Database
} from 'lucide-react';

/**
 * Color Tokens for Recharts
 */
const TYPE_COLORS = {
  road_defect: '#f59e0b', // Amber
  waterlogging: '#06b6d4', // Cyan
  vru_safety: '#f43f5e',   // Rose
  other: '#94a3b8',
};

const SEVERITY_COLORS = {
  low: '#3b82f6',      // Blue
  medium: '#f59e0b',   // Amber
  high: '#f97316',     // Orange
  critical: '#f43f5e', // Rose
};

const STATUS_COLORS = {
  pending: '#f59e0b',   // Amber
  in_review: '#06b6d4', // Cyan
  confirmed: '#10b981', // Emerald
  resolved: '#6366f1',  // Indigo
  rejected: '#f43f5e',  // Rose
};

const VEHICLE_CLASS_COLORS = {
  car: '#3b82f6',
  bus: '#10b981',
  truck: '#f59e0b',
  motorcycle: '#a855f7',
  auto_rickshaw: '#06b6d4',
  other: '#64748b',
};

const CONGESTION_COLORS = {
  low: '#10b981',      // Emerald
  moderate: '#f59e0b', // Amber
  heavy: '#f97316',    // Orange
  severe: '#f43f5e',   // Rose
};

/**
 * Custom Dark Glassmorphism Tooltip for Recharts
 */
function CustomTooltip({ active, payload, label }) {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 border border-slate-700/80 rounded-lg p-2.5 shadow-xl font-mono text-xs text-slate-200">
        <p className="font-bold uppercase text-white mb-1">{data.name || label || data.payload?.name}</p>
        <div className="flex items-center justify-between gap-4">
          <span className="text-slate-400">Observations:</span>
          <span className="font-bold text-cyan-400">{data.value}</span>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * AnalyticsPanel — Stage 7 Telemetry Analytics Dashboard
 *
 * Truthful Observation Data Principles:
 * - Visualizes ONLY real telemetry returned by backend API.
 * - Labels all charts as "Observed" telemetry (not city-wide traffic/defect statistics).
 * - Handles sparse seed datasets gracefully with explicit observation notices.
 */
export default function AnalyticsPanel({ detections, vehicleDensity, incidents }) {
  const [typeFilter, setTypeFilter] = useState('all');
  const [severityFilter, setSeverityFilter] = useState('all');

  const rawDetections = detections?.data?.data ?? [];
  const rawDensity = vehicleDensity?.data?.data ?? [];
  const rawIncidents = incidents?.data?.data ?? [];

  // Filtered detections dataset
  const filteredDetections = useMemo(() => {
    return rawDetections.filter((d) => {
      if (typeFilter !== 'all' && d.type !== typeFilter) return false;
      if (severityFilter !== 'all' && d.severity !== severityFilter) return false;
      return true;
    });
  }, [rawDetections, typeFilter, severityFilter]);

  // 1. Detection Type Breakdown
  const typeChartData = useMemo(() => {
    const counts = {};
    filteredDetections.forEach((d) => {
      const typeKey = d.type ?? 'other';
      counts[typeKey] = (counts[typeKey] || 0) + 1;
    });

    const labelMap = {
      road_defect: 'Road Defect',
      waterlogging: 'Waterlogging',
      vru_safety: 'VRU Safety',
    };

    return Object.entries(counts).map(([key, value]) => ({
      name: labelMap[key] || key.replace(/_/g, ' '),
      rawKey: key,
      value,
      color: TYPE_COLORS[key] || TYPE_COLORS.other,
    }));
  }, [filteredDetections]);

  // 2. Severity Distribution
  const severityChartData = useMemo(() => {
    const order = ['low', 'medium', 'high', 'critical'];
    const counts = { low: 0, medium: 0, high: 0, critical: 0 };

    filteredDetections.forEach((d) => {
      const sev = (d.severity ?? 'medium').toLowerCase();
      if (counts[sev] !== undefined) {
        counts[sev] += 1;
      }
    });

    return order.map((key) => ({
      name: key.toUpperCase(),
      rawKey: key,
      count: counts[key],
      color: SEVERITY_COLORS[key],
    }));
  }, [filteredDetections]);

  // 3. Backend Status Distribution
  const statusChartData = useMemo(() => {
    const order = ['pending', 'confirmed', 'in_review', 'resolved', 'rejected'];
    const counts = { pending: 0, confirmed: 0, in_review: 0, resolved: 0, rejected: 0 };

    filteredDetections.forEach((d) => {
      const st = (d.status ?? 'pending').toLowerCase();
      if (counts[st] !== undefined) {
        counts[st] += 1;
      }
    });

    return order.map((key) => ({
      name: key.replace(/_/g, ' ').toUpperCase(),
      rawKey: key,
      count: counts[key],
      color: STATUS_COLORS[key],
    }));
  }, [filteredDetections]);

  // 4. Vehicle Class Composition (Aggregated from Vehicle Density Records)
  const vehicleClassData = useMemo(() => {
    const classCounts = {};
    rawDensity.forEach((record) => {
      if (record.class_breakdown && typeof record.class_breakdown === 'object') {
        Object.entries(record.class_breakdown).forEach(([cls, count]) => {
          classCounts[cls] = (classCounts[cls] || 0) + Number(count || 0);
        });
      }
    });

    const labelMap = {
      car: 'Cars',
      bus: 'Buses',
      truck: 'Trucks',
      motorcycle: 'Motorcycles',
      auto_rickshaw: 'Auto Rickshaws',
    };

    return Object.entries(classCounts).map(([cls, count]) => ({
      name: labelMap[cls] || cls.replace(/_/g, ' '),
      rawKey: cls,
      count,
      color: VEHICLE_CLASS_COLORS[cls] || VEHICLE_CLASS_COLORS.other,
    }));
  }, [rawDensity]);

  // 5. Congestion Level Breakdown (from Metadata)
  const congestionData = useMemo(() => {
    const counts = {};
    rawDensity.forEach((record) => {
      const lvl = (record.metadata?.congestion_level ?? 'unspecified').toLowerCase();
      counts[lvl] = (counts[lvl] || 0) + 1;
    });

    return Object.entries(counts).map(([lvl, count]) => ({
      name: lvl.toUpperCase(),
      count,
      color: CONGESTION_COLORS[lvl] || '#94a3b8',
    }));
  }, [rawDensity]);

  // Summary Metrics Derived from Real Backend Telemetry
  const totalObservedDetections = rawDetections.length;
  const highRiskCount = rawDetections.filter(
    (d) => d.severity === 'high' || d.severity === 'critical'
  ).length;
  const totalObservedVehicles = rawDensity.reduce(
    (acc, cur) => acc + (cur.vehicle_count ?? 0),
    0
  );
  const confirmedDetectionsCount = rawDetections.filter(
    (d) => d.status === 'confirmed' || (d.confirmed_by_count && d.confirmed_by_count > 1)
  ).length;

  const resetFilters = () => {
    setTypeFilter('all');
    setSeverityFilter('all');
  };

  return (
    <div className="space-y-5">
      {/* ── Top Header Bar ── */}
      <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-800/60 text-cyan-400">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold font-mono uppercase tracking-wider text-white">
              Telemetry Analytics & Perception Insights
            </h2>
          </div>
          <p className="text-xs text-slate-400 font-mono">
            Derived analytics computed strictly from real mobile bus edge sensor observations.
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-cyan-400" />
            <span>Telemetry Stream Active</span>
          </span>
        </div>
      </div>

      {/* ── Summary Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium uppercase text-slate-400">
              Observed Detections
            </span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-white">
              {totalObservedDetections}
            </span>
            <span className="text-[10px] font-mono text-slate-500">records</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1">Backend stream objects</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium uppercase text-slate-400">
              High / Critical Risk
            </span>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-rose-400">
              {highRiskCount}
            </span>
            <span className="text-[10px] font-mono text-slate-500">flagged</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1">Elevated risk telemetry</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium uppercase text-slate-400">
              Observed Vehicles
            </span>
            <Car className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-emerald-400">
              {totalObservedVehicles}
            </span>
            <span className="text-[10px] font-mono text-slate-500">units</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1">In density frames</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium uppercase text-slate-400">
              Multi-Pass Confirmed
            </span>
            <CheckCircle2 className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-amber-400">
              {confirmedDetectionsCount}
            </span>
            <span className="text-[10px] font-mono text-slate-500">validated</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1">Bus sensor consensus</p>
        </div>

        <div className="bg-slate-900/70 border border-slate-800/80 rounded-xl p-3.5 flex flex-col justify-between col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-mono font-medium uppercase text-slate-400">
              ANPR Incidents
            </span>
            <AlertTriangle className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black font-mono text-purple-400">
              {rawIncidents.length}
            </span>
            <span className="text-[10px] font-mono text-slate-500">events</span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-1">Traffic violation feeds</p>
        </div>
      </div>

      {/* ── Interactive Analytics Filter Bar ── */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
          <Filter className="w-4 h-4 text-cyan-400" />
          <span className="font-bold uppercase tracking-wide">Filter Telemetry Charts:</span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Domain Types</option>
            <option value="road_defect">Road Defects</option>
            <option value="waterlogging">Waterlogging</option>
            <option value="vru_safety">VRU Risk Overlay</option>
          </select>

          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {(typeFilter !== 'all' || severityFilter !== 'all') && (
            <button
              onClick={resetFilters}
              className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-cyan-400 flex items-center gap-1.5 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Section A: Detection Perception Analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Chart 1: Observed Detection Types */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                Observed Detection Types
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Distribution</span>
          </div>

          <div className="h-56 w-full flex items-center justify-center">
            {typeChartData.length === 0 ? (
              <p className="text-xs font-mono text-slate-500">No matching detections</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {typeChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    formatter={(value) => (
                      <span className="text-[11px] font-mono text-slate-300">{value}</span>
                    )}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2 text-center">
            Derived from returned telemetry objects
          </p>
        </div>

        {/* Chart 2: Observed Severity Distribution */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                Observed Severity Distribution
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Levels</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={severityChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {severityChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2 text-center">
            Normalized severity rating breakdown
          </p>
        </div>

        {/* Chart 3: Detection Backend Statuses */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-400" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                Detection Backend Statuses
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Contract</span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 9, fontFamily: 'monospace' }} />
                <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                  {statusChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2 text-center">
            Backend schema lifecycle status flags
          </p>
        </div>
      </div>

      {/* ── Section B: Vehicle & Traffic Perception Analytics ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 4: Observed Vehicle Class Composition */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Car className="w-4 h-4 text-emerald-400" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                Observed Vehicle Class Composition
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Density Frames</span>
          </div>

          <div className="h-60 w-full">
            {vehicleClassData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
                No vehicle class breakdown data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vehicleClassData} layout="vertical" margin={{ top: 5, right: 20, left: 30, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis type="number" allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis dataKey="name" type="category" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                    {vehicleClassData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2 text-center">
            Aggregated vehicle counts across bus camera frames
          </p>
        </div>

        {/* Chart 5: Observed Congestion Level Breakdown */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4.5 flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-cyan-400" />
              <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-white">
                Observed Congestion Levels
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-500">Segment Metadata</span>
          </div>

          <div className="h-60 w-full">
            {congestionData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs font-mono text-slate-500">
                No congestion metadata available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={congestionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis allowDecimals={false} tick={{ fill: '#94a3b8', fontSize: 10, fontFamily: 'monospace' }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {congestionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
          <p className="text-[10px] text-slate-500 font-mono mt-2 text-center">
            Traffic density level metadata from sensing passes
          </p>
        </div>
      </div>

      {/* ── Section C: Sampling Window & Small-Dataset Notice ── */}
      <div className="bg-slate-950/70 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3 text-xs font-mono text-slate-400">
        <Info className="w-5 h-5 text-cyan-400 shrink-0" />
        <div>
          <span className="font-bold text-slate-200 uppercase tracking-wide">
            Observation Telemetry Notice:
          </span>{' '}
          All charts visualize exact returned backend records (`{totalObservedDetections}` detections, `{rawDensity.length}` density observations, `{rawIncidents.length}` incidents). No synthetic trend data or city-wide extrapolations are generated.
        </div>
      </div>
    </div>
  );
}
