import React from 'react';
import { 
  LayoutDashboard, 
  MapPin, 
  AlertOctagon, 
  GitCommit, 
  BarChart3, 
  Layers, 
  Radio, 
  AlertTriangle, 
  ShieldAlert, 
  Droplet,
  Car,
  Check,
  X
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, layersState = {}, onToggleLayer }) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Live City Map', icon: MapPin },
    { id: 'incidents', label: 'Incidents & ANPR', icon: AlertOctagon },
    { id: 'lifecycle', label: 'Repair Lifecycle', icon: GitCommit },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const mapLayerItems = [
    { id: 'road_defect', name: 'Road Defects', icon: AlertTriangle, color: 'text-amber-400', border: 'border-amber-700/50' },
    { id: 'waterlogging', name: 'Waterlogging', icon: Droplet, color: 'text-cyan-400', border: 'border-cyan-700/50' },
    { id: 'vru_safety', name: 'VRU Risk Overlay', icon: ShieldAlert, color: 'text-rose-400', border: 'border-rose-700/50' },
    { id: 'traffic', name: 'Traffic Observations', icon: Car, color: 'text-emerald-400', border: 'border-emerald-700/50' },
  ];

  return (
    <aside className="w-64 bg-slate-950/90 border-r border-slate-800/80 flex flex-col justify-between shrink-0 hidden md:flex">
      <div className="p-4 space-y-6">
        {/* Main Operations Navigation */}
        <div>
          <h2 className="px-3 text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Operations Navigation
          </h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/50 shadow-sm font-semibold'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* GIS Map Layers Interactive Controls (Stage 4 Active) */}
        <div className="pt-4 border-t border-slate-800/60">
          <div className="flex items-center justify-between px-3 mb-2">
            <h2 className="text-[11px] font-mono font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              GIS Map Layers
            </h2>
          </div>
          <div className="space-y-1.5 px-1">
            {mapLayerItems.map((layer) => {
              const LayerIcon = layer.icon;
              const isEnabled = Boolean(layersState[layer.id]);
              return (
                <button
                  key={layer.id}
                  onClick={() => onToggleLayer && onToggleLayer(layer.id)}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg border text-xs font-medium transition-all ${
                    isEnabled
                      ? 'bg-slate-900/90 text-slate-200 border-slate-700 shadow-sm'
                      : 'bg-slate-950/40 text-slate-500 border-slate-900 opacity-60 hover:opacity-80'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <LayerIcon className={`w-3.5 h-3.5 ${isEnabled ? layer.color : 'text-slate-600'}`} />
                    <span className="truncate">{layer.name}</span>
                  </div>
                  <span
                    className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                      isEnabled
                        ? 'bg-cyan-950 text-cyan-400 border border-cyan-800/60'
                        : 'bg-slate-900 text-slate-600 border border-slate-800'
                    }`}
                  >
                    {isEnabled ? <Check className="w-2.5 h-2.5" /> : <X className="w-2.5 h-2.5" />}
                    {isEnabled ? 'ON' : 'OFF'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Edge Fleet Info Footer */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mb-1">
          <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>Edge Fleet Perception</span>
        </div>
        <p className="text-[11px] text-slate-500 leading-tight">
          Mobile bus sensors streaming canonical telemetry to central Node/Express backend.
        </p>
      </div>
    </aside>
  );
}

