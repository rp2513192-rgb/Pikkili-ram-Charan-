import React from 'react';
import { Play, Wrench, Shield, Compass, Sparkles } from 'lucide-react';
import { GameMode, CarStats } from '../types/game';

interface TitleScreenProps {
  onStartGame: (mode: GameMode) => void;
  onOpenGarage: () => void;
  activeCar: CarStats;
  coins: number;
}

export const TitleScreen: React.FC<TitleScreenProps> = ({
  onStartGame,
  onOpenGarage,
  activeCar,
  coins,
}) => {
  return (
    <div className="absolute inset-0 z-30 flex flex-col justify-between items-center p-6 md:p-10 select-none bg-gradient-to-b from-slate-950/70 via-slate-900/40 to-slate-950/90 overflow-y-auto">
      {/* TOP HEADER */}
      <div className="w-full max-w-5xl flex items-center justify-between">
        <div className="flex items-center gap-2 bg-slate-900/90 border border-amber-500/30 px-3.5 py-1.5 rounded-full shadow-lg">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
          <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
            NHAI Approved • Indian Road Simulator
          </span>
        </div>

        <div className="flex items-center gap-2 bg-slate-900/90 border border-emerald-500/40 px-4 py-1.5 rounded-full shadow-lg">
          <span className="text-xs text-emerald-400 font-bold">FASTag Cash</span>
          <span className="text-base font-black text-emerald-300 tabular-nums">
            ₹{coins}
          </span>
        </div>
      </div>

      {/* CENTER BESPOKE TITLE LOCKUP */}
      <div className="flex flex-col items-center text-center my-auto py-6">
        {/* Inline Bespoke SVG Title Lockup */}
        <div className="relative mb-3">
          <svg
            className="w-[320px] sm:w-[480px] md:w-[620px] h-auto drop-shadow-[0_10px_25px_rgba(245,158,11,0.35)]"
            viewBox="0 0 600 130"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Background Highway Ribbon Banner */}
            <path
              d="M30 20 L570 20 L550 110 L50 110 Z"
              fill="#090d16"
              stroke="#f59e0b"
              strokeWidth="4"
            />
            {/* National Highway Emblem */}
            <circle cx="300" cy="18" r="16" fill="#f59e0b" stroke="#ffffff" strokeWidth="2" />
            <text x="300" y="23" textAnchor="middle" fill="#000000" fontSize="12" fontWeight="bold">NH</text>

            {/* Main Title typography */}
            <text
              x="300"
              y="68"
              textAnchor="middle"
              fill="#ffffff"
              fontSize="44"
              fontWeight="900"
              letterSpacing="3"
              style={{ fontFamily: 'Chakra Petch, sans-serif' }}
            >
              DESI HIGHWAY
            </text>

            {/* Hindi subtitle / Indian badge */}
            <text
              x="300"
              y="98"
              textAnchor="middle"
              fill="#fbbf24"
              fontSize="20"
              fontWeight="700"
              letterSpacing="4"
            >
              GRAND INDIAN ROAD RUSH • देशी हाईवे
            </text>

            {/* Truck mudflap tagline */}
            <text
              x="120"
              y="125"
              fill="#38bdf8"
              fontSize="10"
              fontWeight="800"
              letterSpacing="2"
            >
              • HORN OK PLEASE •
            </text>
            <text
              x="480"
              y="125"
              textAnchor="end"
              fill="#38bdf8"
              fontSize="10"
              fontWeight="800"
              letterSpacing="2"
            >
              • BURI NAZAR WALE TERA MOOH KALA •
            </text>
          </svg>
        </div>

        <p className="max-w-xl text-slate-300 text-sm md:text-base font-medium px-4 mb-6">
          Experience authentic Indian road challenges: heavy Tata trucks, darting auto-rickshaws,
          wandering cows, wrong-way drivers, and FASTag toll plazas.
        </p>

        {/* Selected Vehicle Card */}
        <div className="flex items-center gap-4 bg-slate-900/80 border border-slate-700/80 px-5 py-3 rounded-2xl mb-8 shadow-xl">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-lg shadow-inner"
            style={{ backgroundColor: activeCar.color }}
          >
            🚗
          </div>
          <div className="text-left">
            <div className="text-xs text-amber-400 font-bold uppercase tracking-wider">Current Ride</div>
            <div className="text-white font-black text-sm sm:text-base flex items-center gap-2">
              <span>{activeCar.name}</span>
              <span className="text-xs text-slate-400 font-normal">({activeCar.desiName})</span>
            </div>
          </div>
          <button
            onClick={onOpenGarage}
            className="ml-2 flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-amber-400 border border-amber-500/40 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Garage</span>
          </button>
        </div>

        {/* GAME MODE BUTTONS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-2xl mb-4">
          <button
            onClick={() => onStartGame('endless')}
            className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-gradient-to-b from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black shadow-2xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <div className="flex items-center gap-2 text-lg">
              <Play className="w-5 h-5 fill-current" />
              <span>ENDLESS RUSH</span>
            </div>
            <span className="text-[11px] font-bold text-amber-950/80">
              Infinite Traffic Weave & High Scores
            </span>
          </button>

          <button
            onClick={() => onStartGame('career')}
            className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 hover:border-amber-500/60 text-white font-black shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <div className="flex items-center gap-2 text-lg text-amber-400">
              <Compass className="w-5 h-5" />
              <span>HIGHWAY MISSIONS</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              NH-44 Tolls, Monsoon & Night Convoy
            </span>
          </button>

          <button
            onClick={() => onStartGame('zen')}
            className="group flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-slate-900 hover:bg-slate-800 border-2 border-slate-700 hover:border-emerald-500/60 text-white font-black shadow-xl transition-all transform hover:-translate-y-0.5 active:translate-y-0"
          >
            <div className="flex items-center gap-2 text-lg text-emerald-400">
              <Sparkles className="w-5 h-5" />
              <span>ZEN CRUISE</span>
            </div>
            <span className="text-[11px] font-semibold text-slate-400">
              Relaxed Drive with Desi FM Radio
            </span>
          </button>
        </div>
      </div>

      {/* FOOTER: FLAT CONTROL HINT LINE */}
      <div className="w-full text-center">
        <div className="inline-block bg-slate-950/80 border border-slate-800 px-5 py-2 rounded-xl text-slate-400 text-xs sm:text-sm font-semibold tracking-wide">
          <span className="text-white font-bold">WASD / ↑←↓→</span> Move ·{' '}
          <span className="text-amber-300 font-bold">H / Space</span> Indian Horn ·{' '}
          <span className="text-yellow-300 font-bold">F</span> Dipper Flash ·{' '}
          <span className="text-sky-300 font-bold">C</span> Camera ·{' '}
          <span className="text-rose-300 font-bold">Esc</span> Pause
        </div>
      </div>
    </div>
  );
};
