import React, { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, 
  Compass, 
  AlertTriangle, 
  RefreshCw, 
  CheckCircle2, 
  Navigation, 
  Info,
  Radio,
  Layers,
  Droplet,
  ShieldAlert,
  Car,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Fallback operational map center (Delhi NCR operational corridor established in schema examples)
const DEFAULT_CENTER = [28.6139, 77.2090];
const DEFAULT_ZOOM = 12;

/**
 * Coordinate Validation Helper
 * Ensures latitude and longitude are valid finite numbers within geographic bounds.
 */
function isValidCoordinate(lat, lng) {
  const isLatValid =
    typeof lat === 'number' && !isNaN(lat) && isFinite(lat) && lat >= -90 && lat <= 90;
  const isLngValid =
    typeof lng === 'number' && !isNaN(lng) && isFinite(lng) && lng >= -180 && lng <= 180;
  return isLatValid && isLngValid;
}

/**
 * Leaflet Custom DIV Icon Generator for Detection Categories & Severity
 */
function createDetectionIcon(type, severity) {
  let bgColor = 'bg-amber-500';
  let borderColor = 'border-amber-300';
  let glyph = '⚠️';

  if (type === 'waterlogging') {
    bgColor = 'bg-cyan-500';
    borderColor = 'border-cyan-300';
    glyph = '💧';
  } else if (type === 'vru_safety') {
    bgColor = 'bg-rose-500';
    borderColor = 'border-rose-300';
    glyph = '🛡️';
  }

  const isCritical = severity === 'critical';
  const isHigh = severity === 'high';
  const ringSize = isCritical ? 'w-9 h-9' : isHigh ? 'w-8 h-8' : 'w-7 h-7';

  return L.divIcon({
    className: 'custom-gis-marker',
    html: `
      <div class="relative flex items-center justify-center">
        ${isCritical ? `<div class="absolute ${ringSize} rounded-full ${bgColor} animate-ping opacity-75"></div>` : ''}
        <div class="relative ${ringSize} rounded-full ${bgColor} text-white font-bold text-xs flex items-center justify-center border-2 ${borderColor} shadow-lg transition-transform hover:scale-110">
          <span style="font-size: 13px; line-height: 1;">${glyph}</span>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

/**
 * Leaflet Custom DIV Icon Generator for Traffic Observations
 */
function createTrafficIcon(congestionLevel, vehicleCount) {
  let bgColor = 'bg-emerald-500';
  let borderColor = 'border-emerald-300';

  const level = String(congestionLevel || '').toLowerCase();
  if (level === 'high' || level === 'heavy') {
    bgColor = 'bg-rose-500';
    borderColor = 'border-rose-300';
  } else if (level === 'moderate' || level === 'medium') {
    bgColor = 'bg-amber-500';
    borderColor = 'border-amber-300';
  }

  return L.divIcon({
    className: 'custom-gis-traffic-marker',
    html: `
      <div class="flex items-center gap-1.5 px-2.5 py-1 rounded-full ${bgColor} text-slate-950 font-mono font-bold text-[11px] border-2 ${borderColor} shadow-lg transition-transform hover:scale-105">
        <span style="font-size: 12px; line-height: 1;">🚗</span>
        <span>${vehicleCount}</span>
      </div>
    `,
    iconSize: [48, 26],
    iconAnchor: [24, 13],
    popupAnchor: [0, -13],
  });
}

/**
 * Helper component to fit map bounds to valid coordinates once when datasets update.
 */
function MapBoundsController({ allCoordinates }) {
  const map = useMap();

  useEffect(() => {
    if (allCoordinates && allCoordinates.length > 0) {
      map.fitBounds(allCoordinates, { padding: [50, 50], maxZoom: 14 });
    }
  }, [allCoordinates, map]);

  return null;
}

export default function LiveMap({ detections, vehicleDensity, layersState = {} }) {
  const [showLegend, setShowLegend] = useState(true);

  const isDetectionsLoading = detections?.loading;
  const isDetectionsError = Boolean(detections?.error);
  const rawDetections = useMemo(
    () => (Array.isArray(detections?.data?.data) ? detections.data.data : []),
    [detections]
  );

  const isDensityLoading = vehicleDensity?.loading;
  const isDensityError = Boolean(vehicleDensity?.error);
  const rawDensity = useMemo(
    () => (Array.isArray(vehicleDensity?.data?.data) ? vehicleDensity.data.data : []),
    [vehicleDensity]
  );

  // Filter valid Detections
  const { validDetections, skippedDetectionsCount } = useMemo(() => {
    const valid = [];
    let skipped = 0;

    rawDetections.forEach((item) => {
      const lat = item?.location?.latitude;
      const lng = item?.location?.longitude;

      if (isValidCoordinate(lat, lng)) {
        valid.push(item);
      } else {
        skipped++;
      }
    });

    return { validDetections: valid, skippedDetectionsCount: skipped };
  }, [rawDetections]);

  // Filter valid Traffic Observations
  const { validTraffic, skippedTrafficCount } = useMemo(() => {
    const valid = [];
    let skipped = 0;

    rawDensity.forEach((item) => {
      const lat = item?.location?.latitude;
      const lng = item?.location?.longitude;

      if (isValidCoordinate(lat, lng)) {
        valid.push(item);
      } else {
        skipped++;
      }
    });

    return { validTraffic: valid, skippedTrafficCount: skipped };
  }, [rawDensity]);

  // Active Map Markers filtered by layer toggles
  const activeDetections = useMemo(() => {
    return validDetections.filter((d) => {
      const typeKey = d.type || 'road_defect';
      return layersState[typeKey] !== false;
    });
  }, [validDetections, layersState]);

  const activeTraffic = useMemo(() => {
    if (layersState.traffic === false) return [];
    return validTraffic;
  }, [validTraffic, layersState]);

  // All valid coordinates for initial bounds fitting
  const allCoordinates = useMemo(() => {
    const coords = [];
    activeDetections.forEach((d) => coords.push([d.location.latitude, d.location.longitude]));
    activeTraffic.forEach((t) => coords.push([t.location.latitude, t.location.longitude]));
    return coords;
  }, [activeDetections, activeTraffic]);

  return (
    <div className="relative w-full h-[540px] bg-slate-950/90 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col">
      {/* Top Map HUD Bar */}
      <div className="relative z-[1000] flex flex-wrap items-center justify-between bg-slate-950/95 border-b border-slate-800/80 px-4 py-2.5 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-100 flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-cyan-400" />
            LIVE CITY MAP — GIS PERCEPTION LAYERS
          </span>
        </div>

        {/* Telemetry Layer Count Summary */}
        <div className="flex items-center gap-2 text-xs font-mono">
          <span className="bg-slate-900 text-amber-300 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            Defects: <strong>{activeDetections.filter(d => d.type === 'road_defect').length}</strong>
          </span>
          <span className="bg-slate-900 text-cyan-300 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
            <Droplet className="w-3 h-3 text-cyan-400" />
            Waterlog: <strong>{activeDetections.filter(d => d.type === 'waterlogging').length}</strong>
          </span>
          <span className="bg-slate-900 text-rose-300 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
            <ShieldAlert className="w-3 h-3 text-rose-400" />
            VRU: <strong>{activeDetections.filter(d => d.type === 'vru_safety').length}</strong>
          </span>
          <span className="bg-slate-900 text-emerald-300 px-2 py-0.5 rounded border border-slate-800 flex items-center gap-1">
            <Car className="w-3 h-3 text-emerald-400" />
            Traffic: <strong>{activeTraffic.length}</strong>
          </span>
        </div>
      </div>

      {/* Main Leaflet Map Engine Viewport */}
      <div className="relative flex-1 w-full h-full z-0">
        <MapContainer
          center={DEFAULT_CENTER}
          zoom={DEFAULT_ZOOM}
          scrollWheelZoom={true}
          className="w-full h-full z-0"
        >
          {/* OpenStreetMap Standard Tile Layer */}
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | TransitEye SIH 2026'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Automatic Viewport Controller */}
          <MapBoundsController allCoordinates={allCoordinates} />

          {/* Render Active Detection Markers */}
          {activeDetections.map((detection) => {
            const { latitude, longitude } = detection.location;
            const type = detection.type || 'road_defect';
            const severity = detection.severity || 'low';
            const icon = createDetectionIcon(type, severity);

            return (
              <Marker
                key={`det-${detection.id || `${latitude}-${longitude}`}`}
                position={[latitude, longitude]}
                icon={icon}
              >
                <Popup className="transiteye-popup">
                  <div className="p-1 space-y-2 min-w-[220px] text-slate-100">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                      <span className="font-mono font-bold text-xs uppercase tracking-wider text-cyan-300 flex items-center gap-1">
                        {type === 'waterlogging' ? '💧 Waterlogging' : type === 'vru_safety' ? '🛡️ VRU Risk' : '⚠️ Road Defect'}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase ${
                        severity === 'critical' ? 'bg-rose-950 text-rose-300 border border-rose-800' :
                        severity === 'high' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {severity}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-300">
                      {detection.subtype && (
                        <div>
                          <strong className="text-slate-400">Subtype:</strong> {detection.subtype}
                        </div>
                      )}
                      {detection.confidence !== undefined && (
                        <div>
                          <strong className="text-slate-400">Confidence:</strong> {(Number(detection.confidence) * 100).toFixed(1)}%
                        </div>
                      )}
                      {detection.bus_id && (
                        <div>
                          <strong className="text-slate-400">Bus Unit:</strong> {detection.bus_id}
                        </div>
                      )}
                      {detection.segment_id && (
                        <div>
                          <strong className="text-slate-400">GIS Segment:</strong> {detection.segment_id}
                        </div>
                      )}
                      {detection.status && (
                        <div>
                          <strong className="text-slate-400">Status:</strong> <span className="font-mono text-cyan-400">{detection.status}</span>
                        </div>
                      )}
                      {detection.timestamp && (
                        <div className="text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-800">
                          Observed: {new Date(detection.timestamp).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}

          {/* Render Active Traffic Observation Markers */}
          {activeTraffic.map((traffic) => {
            const { latitude, longitude } = traffic.location;
            const vehicleCount = Number(traffic.vehicle_count) || 0;
            const congestionLevel = traffic.metadata?.congestion_level || 'Moderate';
            const icon = createTrafficIcon(congestionLevel, vehicleCount);

            return (
              <Marker
                key={`traffic-${traffic.id || `${latitude}-${longitude}`}`}
                position={[latitude, longitude]}
                icon={icon}
              >
                <Popup className="transiteye-popup">
                  <div className="p-1 space-y-2 min-w-[220px] text-slate-100">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1.5">
                      <span className="font-mono font-bold text-xs uppercase tracking-wider text-emerald-300 flex items-center gap-1">
                        🚗 Traffic Observation
                      </span>
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded uppercase bg-emerald-950 text-emerald-300 border border-emerald-800">
                        {congestionLevel}
                      </span>
                    </div>

                    <div className="text-xs space-y-1 text-slate-300">
                      <div>
                        <strong className="text-slate-400">Observed Vehicles:</strong> <span className="font-mono font-bold text-white text-sm">{vehicleCount}</span>
                      </div>
                      {traffic.segment_id && (
                        <div>
                          <strong className="text-slate-400">Road Segment:</strong> {traffic.segment_id}
                        </div>
                      )}
                      {traffic.class_breakdown && (
                        <div className="pt-1">
                          <strong className="text-slate-400">Class Breakdown:</strong>
                          <div className="grid grid-cols-2 gap-1 text-[11px] font-mono mt-0.5 bg-slate-900 p-1.5 rounded border border-slate-800">
                            {Object.entries(traffic.class_breakdown).map(([cls, count]) => (
                              <span key={cls} className="capitalize">{cls}: <strong className="text-cyan-300">{count}</strong></span>
                            ))}
                          </div>
                        </div>
                      )}
                      {traffic.metadata?.sampling_window_sec && (
                        <div>
                          <strong className="text-slate-400">Sample Window:</strong> {traffic.metadata.sampling_window_sec}s
                        </div>
                      )}
                      {traffic.bus_id && (
                        <div>
                          <strong className="text-slate-400">Sensing Bus:</strong> {traffic.bus_id}
                        </div>
                      )}
                      {traffic.recorded_at && (
                        <div className="text-[10px] text-slate-400 font-mono pt-1.5 border-t border-slate-800">
                          Recorded: {new Date(traffic.recorded_at).toLocaleString()}
                        </div>
                      )}
                    </div>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MapContainer>

        {/* GIS Interactive Map Legend (Bottom Right Overlay) */}
        <div className="absolute bottom-4 right-4 z-[1000] bg-slate-950/95 border border-slate-800 rounded-lg shadow-xl p-3 max-w-xs text-xs font-sans">
          <div className="flex items-center justify-between mb-2 pb-1 border-b border-slate-800">
            <span className="font-mono font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5 text-[11px]">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              GIS Visual Legend
            </span>
            <button
              onClick={() => setShowLegend(!showLegend)}
              className="text-slate-400 hover:text-slate-200"
            >
              {showLegend ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
            </button>
          </div>

          {showLegend && (
            <div className="space-y-2.5 text-[11px]">
              {/* Category Encoding */}
              <div>
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block mb-1">
                  Observation Categories
                </span>
                <div className="grid grid-cols-2 gap-1.5 font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 border border-amber-300" />
                    <span className="text-slate-300">Road Defect</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-500 border border-cyan-300" />
                    <span className="text-slate-300">Waterlogging</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500 border border-rose-300" />
                    <span className="text-slate-300">VRU Safety</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 border border-emerald-300" />
                    <span className="text-slate-300">Traffic Seg.</span>
                  </div>
                </div>
              </div>

              {/* Severity Hierarchy */}
              <div className="pt-2 border-t border-slate-800/80">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold block mb-1">
                  Severity Hierarchy
                </span>
                <div className="flex items-center justify-between font-mono text-[10px]">
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">Low</span>
                  <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-200">Medium</span>
                  <span className="px-1.5 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">High</span>
                  <span className="px-1.5 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 animate-pulse">Critical</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
