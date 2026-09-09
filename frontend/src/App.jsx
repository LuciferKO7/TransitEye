import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TelemetryCards from './components/TelemetryCards';
import LiveMap from './components/LiveMap';
import IncidentFeed from './components/IncidentFeed';
import IncidentDrawer from './components/IncidentDrawer';
import LifecycleBoard from './components/LifecycleBoard';
import AnalyticsPanel from './components/AnalyticsPanel';
import { getDetections, getIncidents, getVehicleDensity } from './services/api';
import { Radio, ShieldAlert, MapPin } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('overview');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedIncident, setSelectedIncident] = useState(null);

  // Stage 4 Map Layer Visibility State (Default: all layers ON)
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

  // Reconcile selectedIncident when fresh incident telemetry arrives (e.g. on manual refresh)
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

  // Derived connection status
  const isAnyConnected =
    detectionsState.data || incidentsState.data || vehicleDensityState.data;
  const isAnyError =
    detectionsState.error || incidentsState.error || vehicleDensityState.error;
  const isAnyLoading =
    detectionsState.loading && incidentsState.loading && vehicleDensityState.loading;

  const connectionStatus = isAnyLoading
    ? 'loading'
    : isAnyConnected
    ? 'connected'
    : 'error';

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased">
      {/* Top Operations Navbar */}
      <Navbar
        connectionStatus={connectionStatus}
        onRefresh={fetchAllTelemetry}
        isRefreshing={isRefreshing}
      />

      {/* Main Operations Shell */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar Navigation with Layer Controls */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          layersState={layersState}
          onToggleLayer={handleToggleLayer}
        />

        {/* Central Operations Dashboard Content */}
        <main className="flex-1 p-4 md:p-6 overflow-y-auto space-y-6 bg-slate-900/40">
          {/* Active View Header */}
          <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-white font-mono uppercase flex items-center gap-2">
                <Radio className="w-5 h-5 text-cyan-400" />
                Municipal Urban Intelligence Operations
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Central GIS Dashboard aggregating edge perception across public bus fleet.
              </p>
            </div>
            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Edge Orchestrator Node: Active</span>
            </div>
          </div>

          {/* Section 1: Telemetry Summary Cards */}
          <section className="space-y-2">
            <h3 className="text-xs font-mono font-semibold uppercase text-slate-400 tracking-wider">
              Fleet Perception Summary
            </h3>
            <TelemetryCards
              detections={detectionsState}
              incidents={incidentsState}
              vehicleDensity={vehicleDensityState}
            />
          </section>

          {/* Section 2: Central Live GIS Map Area with Layers */}
          {(activeTab === 'overview' || activeTab === 'map') && (
            <section className="space-y-2">
              <LiveMap
                detections={detectionsState}
                vehicleDensity={vehicleDensityState}
                layersState={layersState}
              />
            </section>
          )}

          {/* Section 3: ANPR Incident Feed (Stage 5) */}
          {(activeTab === 'overview' || activeTab === 'incidents') && (
            <section className="space-y-2">
              {activeTab === 'incidents' && (
                <h3 className="text-xs font-mono font-semibold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
                  ANPR Incident Feed
                </h3>
              )}
              <IncidentFeed
                incidents={incidentsState}
                onSelect={setSelectedIncident}
              />
            </section>
          )}

          {/* Section 4: Municipal Repair & Defect Lifecycle (Stage 6) */}
          {activeTab === 'lifecycle' && (
            <section className="space-y-2">
              <LifecycleBoard detections={detectionsState} />
            </section>
          )}
          {/* Section 5: Telemetry Perception Analytics (Stage 7) */}
          {activeTab === 'analytics' && (
            <section className="space-y-2">
              <AnalyticsPanel
                detections={detectionsState}
                vehicleDensity={vehicleDensityState}
                incidents={incidentsState}
              />
            </section>
          )}
        </main>
      </div>

      {/* Stage 5: ANPR Evidence Drawer overlay */}
      <IncidentDrawer
        incident={selectedIncident}
        onClose={() => setSelectedIncident(null)}
      />
    </div>
  );
}
