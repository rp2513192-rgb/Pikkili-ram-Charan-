import React, { useState } from 'react';
import { 
  Volume2, 
  VolumeX, 
  Radio, 
  Camera, 
  Pause, 
  AlertTriangle, 
  ChevronDown, 
  ChevronUp,
  Sun,
  Sunset,
  Moon,
  CloudRain
} from 'lucide-react';
import { NearMissEvent, WeatherType } from '../types/game';
import { sounds } from '../audio/SoundEffects';

interface HUDProps {
  speedKmh: number;
  rpm: number;
  gear: number;
  distanceKm: number;
  coins: number;
  health: number;
  maxHealth: number;
  nearMiss: NearMissEvent | null;
  tollNotice: string | null;
  weather: WeatherType;
  highwayName: string;
  onPause: () => void;
  onWeatherChange: (w: WeatherType) => void;
  onCameraChange: () => void;
  onHonk: () => void;
  onDipper: () => void;
  onTouchDrive: (key: string, isDown: boolean) => void;
}

export const HUD: React.FC<HUDProps> = ({
  speedKmh,
  rpm,
  gear,
  distanceKm,
  coins,
  health,
  maxHealth,
  nearMiss,
  tollNotice,
  weather,
  highwayName,
  onPause,
  onWeatherChange,
  onCameraChange,
  onHonk,
  onDipper,
  onTouchDrive,
}) => {
  const [isMuted, setIsMuted] = useState(sounds.getIsMuted());
  const [radioStation, setRadioStation] = useState<string | null>(
    sounds.getIsRadioPlaying() ? 'Desi Highway FM' : null
  );
  const [isDockExpanded, setIsDockExpanded] = useState(false);

  const toggleMute = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const toggleRadio = () => {
    const playing = sounds.toggleRadio();
    if (playing) {
      setRadioStation(sounds.nextRadioStation());
    } else {
      setRadioStation(null);
    }
  };

  const healthPercent = Math.max(0, Math.min(100, (health / maxHealth) * 100));

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-sans">
      {/* 1. TOP STATUS CLUSTERS */}
      <div className="absolute top-4 left-4 right-4 flex items-start justify-between">
        {/* Left: Indian Highway Badge & Distance */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2 bg-slate-900/90 text-white px-3 py-1.5 rounded-lg border border-amber-500/40 shadow-lg">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="font-bold tracking-wider text-xs uppercase text-amber-400">
              {highwayName}
            </span>
          </div>

          <div className="flex items-center gap-3 bg-slate-900/90 text-white px-3 py-1.5 rounded-lg border border-slate-700">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-amber-400 tabular-nums">
                {distanceKm.toFixed(2)}
              </span>
              <span className="text-xs text-slate-400 font-semibold">KM</span>
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-emerald-400 font-bold">FASTag ₹</span>
              <span className="text-base font-black text-emerald-300 tabular-nums">
                {coins}
              </span>
            </div>
          </div>
        </div>

        {/* Right: Interactive utility buttons */}
        <div className="flex items-center gap-2 pointer-events-auto">
          {/* Radio button */}
          <button
            onClick={toggleRadio}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-bold transition-colors ${
              radioStation
                ? 'bg-amber-600 text-white border-amber-400 shadow-md'
                : 'bg-slate-900/85 text-slate-300 border-slate-700 hover:bg-slate-800'
            }`}
            title="Desi FM Highway Radio"
          >
            <Radio className="w-4 h-4" />
            <span className="hidden sm:inline">
              {radioStation ? 'Desi FM' : 'Radio Off'}
            </span>
          </button>

          {/* Mute button */}
          <button
            onClick={toggleMute}
            className="p-2 rounded-lg bg-slate-900/85 text-slate-200 border border-slate-700 hover:bg-slate-800"
            title="Toggle Sound"
          >
            {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
          </button>

          {/* Camera switch */}
          <button
            onClick={onCameraChange}
            className="p-2 rounded-lg bg-slate-900/85 text-slate-200 border border-slate-700 hover:bg-slate-800"
            title="Change Camera (Chase / Hood / Cinematic)"
          >
            <Camera className="w-4 h-4" />
          </button>

          {/* Pause */}
          <button
            onClick={onPause}
            className="p-2 rounded-lg bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold border border-amber-400"
            title="Pause Game (Esc)"
          >
            <Pause className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. FLOATING NEAR-MISS & TOLL COMBOS (TOP CENTER) */}
      <div className="absolute top-20 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 pointer-events-none">
        {nearMiss && (
          <div className="animate-bounce bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-slate-950 font-black px-4 py-1.5 rounded-full shadow-2xl border-2 border-yellow-200 text-sm tracking-wide flex items-center gap-2">
            <span>🔥</span>
            <span>{nearMiss.text}</span>
          </div>
        )}

        {tollNotice && (
          <div className="bg-emerald-600/95 text-white font-bold px-4 py-1.5 rounded-lg border border-emerald-300 text-xs shadow-xl tracking-wider flex items-center gap-2 animate-fade-in">
            <span className="w-2 h-2 rounded-full bg-emerald-200" />
            <span>{tollNotice}</span>
          </div>
        )}
      </div>

      {/* 3. BOTTOM-LEFT: SPEEDOMETER & CAR METRICS */}
      <div className="absolute bottom-6 left-6 pointer-events-auto">
        <div className="bg-slate-950/90 border border-slate-800 p-4 rounded-2xl shadow-2xl flex flex-col gap-2 min-w-[210px]">
          {/* Speed Digital Readout */}
          <div className="flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-4xl font-black text-white tabular-nums tracking-tighter" style={{ fontFamily: 'Chakra Petch, sans-serif' }}>
                {speedKmh}
              </span>
              <span className="text-xs font-bold text-slate-400">KM/H</span>
            </div>
            <div className="bg-amber-500/20 border border-amber-500/40 text-amber-300 px-2.5 py-0.5 rounded text-xs font-extrabold">
              GEAR {gear}
            </div>
          </div>

          {/* Curved RPM / Speed bar */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-75 ${
                speedKmh > 120 ? 'bg-rose-500' : speedKmh > 80 ? 'bg-amber-400' : 'bg-emerald-400'
              }`}
              style={{ width: `${Math.min(100, (speedKmh / 180) * 100)}%` }}
            />
          </div>

          {/* Health / Car Condition */}
          <div className="flex flex-col gap-1 pt-1 border-t border-slate-800/80">
            <div className="flex justify-between text-[11px] font-semibold text-slate-400">
              <span className="flex items-center gap-1">
                <AlertTriangle className="w-3 h-3 text-amber-400" />
                Car Condition
              </span>
              <span className="text-slate-200 tabular-nums">{Math.round(healthPercent)}%</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-150 ${
                  healthPercent > 50 ? 'bg-emerald-500' : healthPercent > 25 ? 'bg-amber-500' : 'bg-rose-600'
                }`}
                style={{ width: `${healthPercent}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* 4. BOTTOM-RIGHT: HORN & DIPPER ACTION CONTROLS */}
      <div className="absolute bottom-6 right-6 flex items-end gap-3 pointer-events-auto">
        {/* On-screen Drive Controls for touch or fast mouse clicks */}
        <div className="flex flex-col gap-2 items-center">
          {/* Dipper / High Beam Flash */}
          <button
            onClick={onDipper}
            className="w-14 h-14 rounded-full bg-slate-900/90 active:bg-amber-500 text-amber-300 active:text-slate-950 border-2 border-amber-500/60 shadow-xl flex flex-col items-center justify-center font-bold text-[10px] transition-transform active:scale-95"
            title="Flash Dipper (F)"
          >
            <Sun className="w-4 h-4" />
            <span>DIPPER</span>
          </button>

          {/* Brake Pedal */}
          <button
            onPointerDown={() => onTouchDrive('s', true)}
            onPointerUp={() => onTouchDrive('s', false)}
            onPointerLeave={() => onTouchDrive('s', false)}
            className="w-14 h-14 rounded-2xl bg-rose-950/80 active:bg-rose-600 text-rose-200 border-2 border-rose-500 shadow-xl flex flex-col items-center justify-center font-black text-[10px] transition-transform active:scale-95"
            title="Brake / Reverse (S / Down)"
          >
            <span>BRAKE</span>
          </button>
        </div>

        {/* Big Authentic Indian Horn Button ("Horn OK Please!") */}
        <button
          onClick={onHonk}
          className="w-20 h-20 rounded-2xl bg-gradient-to-tr from-amber-600 to-yellow-400 active:from-yellow-400 active:to-amber-500 text-slate-950 font-black border-4 border-yellow-200 shadow-2xl flex flex-col items-center justify-center gap-0.5 transition-transform active:scale-90"
          title="Indian Dual-Tone Horn (H / Space)"
        >
          <span className="text-2xl leading-none">📢</span>
          <span className="text-[11px] font-black tracking-tighter uppercase leading-tight">
            HORN
          </span>
          <span className="text-[9px] font-bold text-amber-950/90 uppercase tracking-widest leading-none">
            PLEASE
          </span>
        </button>
      </div>

      {/* 5. COLLAPSIBLE BOTTOM DOCK (Clean Cinema mode as per Three.js skill) */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
        {/* Toggle bar */}
        <button
          onClick={() => setIsDockExpanded(!isDockExpanded)}
          className="flex items-center gap-1 bg-slate-900/90 text-slate-300 hover:text-white px-3 py-1 rounded-t-lg border-t border-x border-slate-700 text-[11px] font-bold"
        >
          {isDockExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
          <span>{isDockExpanded ? 'Hide Road Settings' : 'Highway Atmosphere (H)'}</span>
        </button>

        {isDockExpanded && (
          <div className="bg-slate-950/95 border border-slate-800 p-2.5 rounded-xl flex items-center gap-3 shadow-2xl">
            <span className="text-xs font-bold text-slate-400 px-1">Weather:</span>
            
            <button
              onClick={() => onWeatherChange('golden_hour')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                weather === 'golden_hour' ? 'bg-amber-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sunset className="w-3.5 h-3.5 text-amber-300" />
              Golden Hour
            </button>

            <button
              onClick={() => onWeatherChange('sunny')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                weather === 'sunny' ? 'bg-sky-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Sun className="w-3.5 h-3.5 text-yellow-300" />
              Sunny NH
            </button>

            <button
              onClick={() => onWeatherChange('monsoon')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                weather === 'monsoon' ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <CloudRain className="w-3.5 h-3.5 text-blue-300" />
              Monsoon Rain
            </button>

            <button
              onClick={() => onWeatherChange('night')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold ${
                weather === 'night' ? 'bg-indigo-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Moon className="w-3.5 h-3.5 text-indigo-300" />
              Midnight Expressway
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
