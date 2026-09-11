import React, { useState, useEffect, useRef } from 'react';
import {
  UilBus,
  UilSync,
  UilServer,
  UilBars,
  UilMultiply,
  UilLayers,
  UilMoon,
  UilSun,
  UilCheck,
  UilTimes,
  UilApps,
  UilMapPin,
  UilShieldExclamation,
  UilChartLine
} from '@iconscout/react-unicons';

export default function Navbar({
  activeTab,
  setActiveTab,
  connectionStatus,
  onRefresh,
  isRefreshing,
  layersState = {},
  onToggleLayer
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLayerMenuOpen, setIsLayerMenuOpen] = useState(false);
  const lastScrollY = useRef(0);

  // Auto-hide navbar on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (currentScrollY > lastScrollY.current && currentScrollY > 60) {
        setIsVisible(false); // Scroll down -> hide
      } else {
        setIsVisible(true); // Scroll up -> show
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { id: 'overview', label: 'Main Dashboard', icon: UilApps },
    { id: 'incidents', label: 'Incidents', icon: UilShieldExclamation },
    { id: 'lifecycle', label: 'Lifecycle', icon: UilSync },
    { id: 'analytics', label: 'Analytics', icon: UilChartLine },
  ];

  const layerItems = [
    { id: 'road_defect', name: 'Road Defects', color: 'bg-amber-500' },
    { id: 'waterlogging', name: 'Waterlogging', color: 'bg-cyan-500' },
    { id: 'vru_safety', name: 'VRU Safety', color: 'bg-rose-500' },
    { id: 'traffic', name: 'Traffic Segments', color: 'bg-emerald-500' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-transform duration-300 ${isVisible ? 'translate-y-0' : '-translate-y-full'
        } liquid-glass border-b border-[#334155]/20 shadow-xs`}
    >
      <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
        {/* ── Brand Title & Landing Link ── */}
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('landing')}>
          <div className="w-9 h-9 rounded-xl bg-[#1e293b] text-[#FFFFF0] flex items-center justify-center shadow-md">
            <UilBus className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base font-mono uppercase tracking-wider text-[#1e293b]">
                TransitEye
              </span>
              <span className="text-[9px] font-mono font-bold px-1.5 py-0.5 rounded bg-[#334155] text-[#FFFFF0]">
                SIH 2026
              </span>
            </div>
            <p className="text-[10px] text-[#334155] hidden sm:block font-medium">
              Every Bus. A Mobile AI Sensor for the City.
            </p>
          </div>
        </div>

        {/* ── Navigation Links (Desktop & Toggled Mobile) ── */}
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id || (item.id === 'overview' && activeTab === 'map');
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-1.5 transition-all ${isActive
                    ? 'bg-[#1e293b] text-[#FFFFF0] shadow-sm'
                    : 'text-[#334155] hover:bg-[#334155]/10 hover:text-[#1e293b]'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* ── Controls & Actions ── */}
        <div className="flex items-center gap-2">
          {/* Layer Popover Control */}
          <div className="relative">
            <button
              onClick={() => setIsLayerMenuOpen(!isLayerMenuOpen)}
              className="p-2 rounded-xl border border-[#334155]/20 text-[#334155] hover:bg-[#334155]/10 transition-colors text-xs font-mono flex items-center gap-1"
              title="Toggle Map Layers"
            >
              <UilLayers className="w-4 h-4 text-[#1e293b]" />
              <span className="hidden lg:inline text-[11px]">Layers</span>
            </button>

            {isLayerMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-[#FFFFF0] border border-[#334155]/20 rounded-2xl shadow-xl p-3 z-50 animate-fadeIn space-y-2">
                <p className="text-[10px] font-mono font-bold uppercase text-[#334155] border-b border-[#334155]/15 pb-1">
                  GIS Map Layers
                </p>
                {layerItems.map((layer) => {
                  const isEnabled = Boolean(layersState[layer.id]);
                  return (
                    <button
                      key={layer.id}
                      onClick={() => onToggleLayer && onToggleLayer(layer.id)}
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-xs font-mono text-[#1e293b] hover:bg-[#334155]/10 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${layer.color}`} />
                        <span>{layer.name}</span>
                      </div>
                      <span className={`text-[10px] font-bold ${isEnabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                        {isEnabled ? 'ON' : 'OFF'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Sleek Dark Mode Placeholder Toggle (Visual Only) */}
          <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-[#334155]/10 border border-[#334155]/20" title="Dark Mode (Palette Pending)">
            <UilSun className="w-3.5 h-3.5 text-[#1e293b]" />
            <div className="w-7 h-4 bg-[#334155]/20 rounded-full p-0.5 relative cursor-not-allowed opacity-70">
              <div className="w-3 h-3 bg-[#1e293b] rounded-full shadow-xs" />
            </div>
            <UilMoon className="w-3.5 h-3.5 text-[#334155]/50" />
          </div>

          {/* Refresh Telemetry Action */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-xl bg-[#1e293b] text-[#FFFFF0] hover:bg-[#334155] transition-colors disabled:opacity-50"
            title="Refresh Telemetry"
          >
            <UilSync className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {/* Manual Hamburger Button (IconScout Unicons) */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-xl border border-[#334155]/20 text-[#334155] hover:bg-[#334155]/10"
            aria-label="Toggle Menu"
          >
            {isMenuOpen ? <UilMultiply className="w-5 h-5" /> : <UilBars className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-[#334155]/15 bg-[#FFFFF0] p-4 space-y-2 animate-fadeIn">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setActiveTab(item.id);
                  setIsMenuOpen(false);
                }}
                className={`w-full px-4 py-2.5 rounded-xl text-xs font-mono font-bold flex items-center gap-2 ${isActive
                    ? 'bg-[#1e293b] text-[#FFFFF0]'
                    : 'text-[#334155] hover:bg-[#334155]/10'
                  }`}
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
}
