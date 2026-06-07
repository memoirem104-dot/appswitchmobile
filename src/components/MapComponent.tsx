import React, { useState } from 'react';
import { Garde, ProfessionType } from '../types';
import { MapPin, Search, Hospital, ShieldAlert, HeartPulse, Pill, Info } from 'lucide-react';

interface MapComponentProps {
  gardes: Garde[];
  onSelectGarde?: (garde: Garde) => void;
  selectedGardeId?: string;
  activeProfessionFilter: string;
}

export default function MapComponent({ 
  gardes, 
  onSelectGarde, 
  selectedGardeId,
  activeProfessionFilter
}: MapComponentProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Map coordinates projection helpers for Tunis region bounding box:
  // Lat: 36.7950 to 36.8150 (Span: ~0.0200)
  // Lng: 10.1400 to 10.1900 (Span: ~0.0500)
  const getXY = (lat: number, lng: number) => {
    // Project geographic coordinates into SVG viewport percents [5% - 95%]
    const minLat = 36.7950;
    const maxLat = 36.8150;
    const minLng = 10.1400;
    const maxLng = 10.1900;

    const x = ((lng - minLng) / (maxLng - minLng)) * 100;
    // Note: Y is flipped down in standard screen coordinates
    const y = 100 - (((lat - minLat) / (maxLat - minLat)) * 100);

    // Keep safe margins
    return {
      x: Math.min(Math.max(x, 8), 92),
      y: Math.min(Math.max(y, 10), 90)
    };
  };

  // Filter guards based on selection, profession, and search
  const filteredGardes = gardes.filter(g => {
    const matchesProfession = activeProfessionFilter === 'all' || g.type === activeProfessionFilter;
    const matchesSearch = g.lieu.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (g.notes && g.notes.toLowerCase().includes(searchTerm.toLowerCase())) ||
                          g.creatorName.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProfession && matchesSearch;
  });

  const getProfessionColor = (type: ProfessionType) => {
    switch (type) {
      case 'doctor': return 'emerald';
      case 'pharmacist': return 'sky';
      case 'firefighter': return 'rose';
      case 'emergency': return 'amber';
      default: return 'gray';
    }
  };

  const getIcon = (type: ProfessionType) => {
    switch (type) {
      case 'doctor': return <HeartPulse className="w-4 h-4 text-emerald-500" />;
      case 'pharmacist': return <Pill className="w-4 h-4 text-sky-400" />;
      case 'firefighter': return <ShieldAlert className="w-4 h-4 text-rose-500" />;
      case 'emergency': return <Hospital className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div id="map-container-component" className="flex flex-col h-full bg-[#0A0A0B] rounded-2xl overflow-hidden shadow-2xl border border-white/5">
      {/* Header and Filter Input */}
      <div className="p-4 bg-[#121214] border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-1.5">
            <MapPin className="w-4 h-4 text-blue-400 animate-pulse" />
            SwitchGard Live Map — Tunis Cardio-Santé
          </h3>
          <p className="text-xs text-gray-450 font-medium">Position géographique des gardes en temps réel</p>
        </div>
        
        {/* Search */}
        <div className="relative">
          <input
            type="text"
            placeholder="Rechercher un lieu, hôpital..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 py-1.5 pl-8 pr-3 text-xs bg-[#0A0A0B] border border-white/5 text-white rounded-xl focus:outline-none placeholder-gray-500"
          />
          <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Map Area */}
      <div className="relative flex-1 bg-[#050507] overflow-hidden min-h-[300px]">
        {/* Grid-based background vector landscape representing simulated Tunis area map details */}
        <svg className="absolute inset-0 w-full h-full text-white/[0.02] pointer-events-none" xmlns="http://www.w3.org/2000/svg">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Simulated Primary Boulevards */}
          <path d="M10,20 Q40,40 90,80" fill="none" stroke="#121214" strokeWidth="6" strokeLinecap="round" />
          <path d="M0,80 Q50,60 100,20" fill="none" stroke="#121214" strokeWidth="4" strokeLinecap="round" />
          <path d="M50,0 Q55,40 50,100" fill="none" stroke="#0f172a" strokeWidth="8" />

          {/* Lake region (Lac de Tunis representation on the east) */}
          <path d="M85,5 Q105,30 95,85 L100,100 L100,0 Z" fill="#0A0A0B" stroke="#121214" strokeWidth="3" />
          <text x="91%" y="50%" fill="#334155" className="text-[9px] font-bold font-mono select-none" transform="rotate(90 92 50)">Lac de Tunis</text>

          {/* Area labels */}
          <text x="15%" y="85%" fill="#334155" className="text-[10px] font-bold tracking-wider font-mono">El Omrane</text>
          <text x="12%" y="24%" fill="#334155" className="text-[10px] font-bold tracking-wider font-mono">Bab Saadoun</text>
          <text x="45%" y="62%" fill="#334155" className="text-[10px] font-bold tracking-wider font-mono">Centre-Ville</text>
          <text x="38%" y="42%" fill="#334155" className="text-[10px] font-bold tracking-wider font-mono">Bab El Bhar</text>
          <text x="22%" y="54%" fill="#334155" className="text-[10px] font-bold tracking-wider font-mono">La Rabta</text>
        </svg>

        {/* Legend Overlay */}
        <div className="absolute top-3 left-3 bg-[#0A0A0B]/90 text-white p-3 rounded-xl border border-white/5 text-[10px] z-10 space-y-1.5 backdrop-blur-sm shadow-xl">
          <div className="font-bold text-gray-400 border-b border-white/5 pb-1 mb-1 shadow-sm text-center tracking-wider">LÉGENDE</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Médecins</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-sky-500"></span> Pharmacie</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Pompiers</div>
          <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500"></span> Urgences N1</div>
        </div>

        {/* Interactive Guard Venues Markers */}
        {filteredGardes.map((g) => {
          const { x, y } = getXY(g.latitude, g.longitude);
          const colorClass = getProfessionColor(g.type);
          const isSelected = selectedGardeId === g.id;

          // Guard Status styling
          let borderStyle = "border-white/50";
          let animationStyle = "animate-bounce";
          if (g.status === 'proposed_exchange' || g.status === 'proposed_sale') {
            borderStyle = "border-yellow-405/80";
            animationStyle = "animate-pulse";
          } else if (g.status === 'completed_exchange' || g.status === 'completed_sale') {
            borderStyle = "border-gray-600/30 opacity-60";
            animationStyle = "";
          }

          return (
            <button
              onClick={() => onSelectGarde && onSelectGarde(g)}
              key={g.id}
              className={`absolute transition-all duration-300 z-20 cursor-pointer -translate-x-1/2 -translate-y-1/2 focus:outline-none ${animationStyle}`}
              style={{ left: `${x}%`, top: `${y}%` }}
              title={`${g.creatorName} - ${g.lieu}`}
            >
              {/* Custom Marker Pin Visuals */}
              <div className="relative group">
                {/* Ping wave */}
                <span className={`absolute -inset-1 rounded-full bg-blue-500/20 blur pointer-events-none transition-transform duration-300 ${isSelected ? 'scale-150 animate-ping' : 'scale-0'}`}></span>
                
                {/* Actual Pin circle */}
                <span className="sr-only">{g.lieu}</span>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${borderStyle} shadow-xl transition-all ${
                  isSelected ? 'bg-blue-600/20 border-blue-400 scale-125' : `bg-[#0A0A0B] hover:scale-115`
                }`}>
                  {getIcon(g.type)}
                </div>

                {/* Corner Mini status badge */}
                {g.status !== 'available' && (
                  <span className={`absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full border border-gray-900 flex items-center justify-center text-[7px] font-bold ${
                    g.status.includes('completed') ? 'bg-gray-600 text-white' : 'bg-yellow-500 text-black'
                  }`}>
                    {g.status.includes('exchange') ? '⇄' : '€'}
                  </span>
                )}

                {/* Marker Quick Tooltip Label on hover */}
                <div className="absolute top-10 left-1/2 -translate-x-1/2 scale-0 group-hover:scale-100 transition-all bg-[#121214] text-white border border-white/5 p-2.5 rounded-xl shadow-2xl z-50 pointer-events-none min-w-[160px] font-sans text-left">
                  <div className="font-bold text-xs text-white truncate">{g.lieu}</div>
                  <div className="text-[10px] text-gray-300 flex items-center gap-1 mt-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                    {g.type.toUpperCase()} • {g.date}
                  </div>
                  <div className="text-[10px] text-gray-400 truncate mt-1">Par: {g.creatorName}</div>
                  <div className={`text-[9px] font-bold mt-1.5 px-2 py-0.5 rounded-lg border ${
                    g.status === 'available' ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20'
                  }`}>
                    {g.status === 'available' ? 'Disponible' : g.status.replace('_', ' ').toUpperCase()}
                  </div>
                </div>
              </div>
            </button>
          );
        })}

        {filteredGardes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-[#121214]/80 backdrop-blur-sm text-center p-4">
            <div>
              <Info className="w-8 h-8 text-gray-600 mx-auto mb-2 animate-pulse" />
              <p className="text-white text-xs font-bold">Aucune garde trouvée</p>
              <p className="text-gray-450 text-[10px] mt-0.5">Modifier les filtres ou la recherche.</p>
            </div>
          </div>
        )}
      </div>

      {/* Selected guard detail drawer in standard bottom bar */}
      {selectedGardeId && (
        <div className="p-4 bg-[#121214] border-t border-white/5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-white">
          {(() => {
            const currentSelected = gardes.find(g => g.id === selectedGardeId);
            if (!currentSelected) return null;
            const colorClass = getProfessionColor(currentSelected.type);
            return (
              <>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 text-[8.5px] font-bold rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 uppercase">
                      {currentSelected.type}
                    </span>
                    <span className="text-xs text-gray-400 font-bold font-mono">{currentSelected.timeStart} - {currentSelected.timeEnd}</span>
                  </div>
                  <h4 className="text-sm font-bold truncate text-white">{currentSelected.lieu}</h4>
                  <p className="text-xs text-gray-400">Publié par: <span className="text-gray-300 font-bold">{currentSelected.creatorName}</span> le {currentSelected.date}</p>
                </div>
                
                {currentSelected.notes && (
                  <div className="text-[11px] text-gray-300 max-w-xs italic leading-normal line-clamp-2 bg-[#0A0A0B] p-2 px-3 rounded-lg border border-white/5">
                    "{currentSelected.notes}"
                  </div>
                )}
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
}
