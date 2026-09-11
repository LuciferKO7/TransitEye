import React, { useState, useEffect, useCallback } from 'react';
import LandingPage from './components/LandingPage';
import Navbar from './components/Navbar';
import TelemetryCards from './components/TelemetryCards';
import LiveMap from './components/LiveMap';
import IncidentFeed from './components/IncidentFeed';
import IncidentDrawer from './components/IncidentDrawer';
import LifecycleBoard from './components/LifecycleBoard';
import LifecycleDetail from './components/LifecycleDetail';
import AnalyticsPanel from './components/AnalyticsPanel';
import OperationalInsights from './components/OperationalInsights';
import { getDetections, getIncidents, getVehicleDensity } from './services/api';
import { Radio, ShieldAlert, MapPin } from 'lucide-react';

export default function App() {
  // Stage 13: Initial application load opens directly onto Landing Page
  const [activeTab, setActiveTab] = useState('landing');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [selectedDetection, setSelectedDetection] = useState(null);
  const [focusedLocation, setFocusedLocation] = useState(null);
  const [mapHighlightFilter, setMapHighlightFilter] = useState(null);

  // Stage 13 Accent Customization State (Default: #94A3B8)
  const [accentColor, setAccentColor] = useState('#94A3B8');

  useEffect(() => {
    document.documentElement.style.setProperty('--color-accent', accentColor);
    document.documentElement.style.setProperty('--current-accent', accentColor);
  }, [accentColor]);

  const handleFocusMap = useCallback((location) => {
    if (!location) return;
    setActiveTab((prev) => (prev === 'overview' || prev === 'map' ? prev : 'overview'));
    setFocusedLocation({
      latitude: location.latitude,
      longitude: location.longitude,
      timestamp: Date.now(),
    });
  }, []);

  const handleFocusType = useCallback((type) => {
    setMapHighlightFilter(type);
    setActiveTab((prev) => (prev === 'overview' || prev === 'map' ? prev : 'overview'));
  }, []);

  const handleClearHighlight = useCallback(() => {
    setMapHighlightFilter(null);
  }, []);

  // Map Layer Visibility State (Default: all layers ON)
  const [layersState, setLayersState] = useState({
    road_defect: true,
    waterlogging: true,
    vru_safety: true,
    traffic: true,
  });

  const handleToggleLayer = useCallback((layerId) => {
    setLayersState((prev) => ({
      ...prev,
      [layerId]: !prev[layerId],
    }));
  }, []);

  const [detectionsState, setDetectionsState] = useState({
    loading: true,
    data: null,
    error: null,
  });

  const [incidentsState, setIncidentsState] = useState({
    loading: true,
    data: null,
    error: null,
  });

  const [vehicleDensityState, setVehicleDensityState] = useState({
    loading: true,
    data: null,
    error: null,
  });

  const fetchAllTelemetry = useCallback(async () => {
    setIsRefreshing(true);

    // Fetch Detections
    setDetectionsState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await getDetections();
      setDetectionsState({ loading: false, data: res, error: null });
    } catch (err) {
      setDetectionsState({ loading: false, data: null, error: err.message });
    }

    // Fetch Incidents
    setIncidentsState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await getIncidents();
      setIncidentsState({ loading: false, data: res, error: null });
    } catch (err) {
      setIncidentsState({ loading: false, data: null, error: err.message });
    }

    // Fetch Vehicle Density
    setVehicleDensityState((prev) => ({ ...prev, loading: true }));
    try {
      const res = await getVehicleDensity();
      setVehicleDensityState({ loading: false, data: res, error: null });
    } catch (err) {
      setVehicleDensityState({ loading: false, data: null, error: err.message });
    }

    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    fetchAllTelemetry();
  }, [fetchAllTelemetry]);

  // Reconcile selectedIncident on fresh data arrival
  useEffect(() => {
    setSelectedIncident((prev) => {
      if (!prev) return null;
      const list = incidentsState.data?.data;
      if (Array.isArray(list)) {
        const match = list.find((item) => item.id === prev.id);
        return match || null;
      }
      return prev;
    });
  }, [incidentsState.data]);

  // Reconcile selectedDetection on fresh data arrival
  useEffect(() => {
    setSelectedDetection((prev) => {
      if (!prev) return null;
      const list = detectionsState.data?.data;
      if (Array.isArray(list)) {
        const match = list.find((item) => item.id === prev.id);
        return match || null;
      }
      return prev;
    });
  }, [detectionsState.data]);

  const isAnyConnected =
    detectionsState.data || incidentsState.data || vehicleDensityState.data;
  const isAnyLoading =
    detectionsState.loading && incidentsState.loading && vehicleDensityState.loading;

  const connectionStatus = isAnyLoading
    ? 'loading'
    : isAnyConnected
      ? 'connected'
      : 'error';

  // ── Stage 13 Landing Page Render Mode ──
  if (activeTab === 'landing') {
    return <LandingPage onEnterDashboard={() => setActiveTab('overview')} />;
  }

  return (
    <div className="min-h-screen bg-[#FFFFF0] text-[#1e293b] flex flex-col font-sans antialiased selection:bg-[#334155] selection:text-white">
      {/* Stage 13 Consolidated Top Operations Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        connectionStatus={connectionStatus}
        onRefresh={fetchAllTelemetry}
        isRefreshing={isRefreshing}
        accentColor={accentColor}
        onSelectAccent={setAccentColor}
        layersState={layersState}
        onToggleLayer={handleToggleLayer}
      />

      {/* Main Operational Container */}
      <div className="flex-1 flex flex-col pt-16">
        <main className="flex-1 p-4 md:p-6 space-y-6 max-w-7xl mx-auto w-full">
          {/* Active Operations Header */}
          <div className="liquid-glass rounded-2xl p-4 md:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-[#334155]/20 shadow-xs">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#1e293b] font-mono uppercase flex items-center gap-2">
                <Radio className="w-5 h-5 text-[#1e293b]" />
                Municipal Urban Perception Dashboard
              </h2>
              <p className="text-xs text-[#334155] mt-0.5 font-mono">
                Real-time GIS perception telemetry aggregated across public bus transit fleets.
              </p>
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-[#334155] bg-[#334155]/10 px-3 py-1.5 rounded-xl border border-[#334155]/20 font-bold">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Edge Node Stream: Active</span>
            </div>
          </div>

          {/* Section 1: Fleet Telemetry Perception Summary Cards */}
          <section className="space-y-2">
            <h3 className="text-xs font-mono font-bold uppercase text-[#334155] tracking-wider">
              Fleet Perception Overview
            </h3>
            <TelemetryCards
              detections={detectionsState}
              incidents={incidentsState}
              vehicleDensity={vehicleDensityState}
              onFocusType={handleFocusType}
              onSelectTab={setActiveTab}
            />
          </section>

          {/* Section 2: Operational Intelligence Insights */}
          {(activeTab === 'overview') && (
            <section className="space-y-2">
              <OperationalInsights
                detections={detectionsState}
                incidents={incidentsState}
                vehicleDensity={vehicleDensityState}
                onSelectDetection={setSelectedDetection}
                onFocusType={handleFocusType}
                onSelectTab={setActiveTab}
                onFocusMap={handleFocusMap}
              />
            </section>
          )}

          {/* Section 3: Central Live GIS Map Viewport */}
          {(activeTab === 'overview' || activeTab === 'map') && (
            <section className="space-y-2">
              <LiveMap
                detections={detectionsState}
                vehicleDensity={vehicleDensityState}
                layersState={layersState}
                selectedDetection={selectedDetection}
                onSelectDetection={setSelectedDetection}
                focusedLocation={focusedLocation}
                mapHighlightFilter={mapHighlightFilter}
                onClearHighlight={handleClearHighlight}
              />
            </section>
          )}

          {/* Section 4: ANPR Incident Telemetry Feed */}
          {(activeTab === 'overview' || activeTab === 'incidents') && (
            <section className="space-y-2">
              {activeTab === 'incidents' && (
                <h3 className="text-xs font-mono font-bold uppercase text-[#334155] tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-600" />
                  ANPR Violation Stream
                </h3>
              )}
              <IncidentFeed
                incidents={incidentsState}
                onSelect={setSelectedIncident}
              />
            </section>
          )}

          {/* Section 5: Municipal Defect Repair & Lifecycle Board */}
          {activeTab === 'lifecycle' && (
            <section className="space-y-2">
              <LifecycleBoard
                detections={detectionsState}
                selectedDetection={selectedDetection}
                onSelectDetection={setSelectedDetection}
                onFocusMap={handleFocusMap}
              />
            </section>
          )}

          {/* Section 6: Spatial Perception Analytics */}
          {activeTab === 'analytics' && (
            <section className="space-y-2">
              <AnalyticsPanel
                detections={detectionsState}
                vehicleDensity={vehicleDensityState}
                incidents={incidentsState}
                onSelectTab={setActiveTab}
              />
            </section>
          )}
        </main>
      </div>

      {/* ANPR Evidence Drawer Overlay (z-[2000] above map controls) */}
      <IncidentDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
        onFocusMap={handleFocusMap}
      />

      {/* Spatial Detection Inspection Drawer Overlay (z-[2000] above map controls) */}
      <LifecycleDetail
        detection={selectedDetection}
        onClose={() => setSelectedDetection(null)}
        onFocusMap={handleFocusMap}
      />
    </div>
  );
}
