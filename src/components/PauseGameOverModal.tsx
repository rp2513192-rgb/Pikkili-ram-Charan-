import React from 'react';
import { RotateCcw, Home, Play, Wrench, Trophy, AlertOctagon } from 'lucide-react';

interface PauseGameOverModalProps {
  isGameOver: boolean;
  reason?: string;
  stats: {
    distance: number;
    nearMisses: number;
    topSpeed: number;
    coins: number;
  };
  onResume: () => void;
  onRestart: () => void;
  onOpenGarage: () => void;
  onHome: () => void;
}

export const PauseGameOverModal: React.FC<PauseGameOverModalProps> = ({
  isGameOver,
  reason,
  stats,
  onResume,
  onRestart,
  onOpenGarage,
  onHome,
}) => {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-slate-950/80">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl p-6 flex flex-col items-center text-center">
        {/* ICON & TITLE */}
        {isGameOver ? (
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-rose-500/20 border border-rose-500/40 text-rose-500 flex items-center justify-center">
              <AlertOctagon className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-wider">
              HIGHWAY CRASH!
            </h2>
            <p className="text-xs text-rose-300 font-medium">
              {reason || 'Accident on National Highway! Call Crane & Towing.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 flex items-center justify-center">
              <Trophy className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-black text-white tracking-wider">
              HIGHWAY PAUSED
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Take a tea break at the nearest Dhaba!
            </p>
          </div>
        )}

        {/* TRIP STATS */}
        <div className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-6 grid grid-cols-2 gap-3 text-left">
          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-400">Distance Driven</span>
            <span className="text-xl font-black text-white tabular-nums">
              {stats.distance.toFixed(2)} <span className="text-xs font-normal text-slate-400">KM</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-400">Peak Top Speed</span>
            <span className="text-xl font-black text-amber-400 tabular-nums">
              {stats.topSpeed} <span className="text-xs font-normal text-slate-400">KM/H</span>
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-400">Close Shave Near Misses</span>
            <span className="text-xl font-black text-sky-400 tabular-nums">
              {stats.nearMisses}
            </span>
          </div>

          <div className="flex flex-col">
            <span className="text-[11px] font-bold text-slate-400">Total FASTag Rupees</span>
            <span className="text-xl font-black text-emerald-400 tabular-nums">
              ₹{stats.coins}
            </span>
          </div>
        </div>

        {/* ACTION BUTTONS */}
        <div className="w-full flex flex-col gap-2.5">
          {!isGameOver && (
            <button
              onClick={onResume}
              className="w-full py-3.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Resume Highway Drive</span>
            </button>
          )}

          <button
            onClick={onRestart}
            className="w-full py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm flex items-center justify-center gap-2 border border-slate-700 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{isGameOver ? 'Play Again' : 'Restart Highway'}</span>
          </button>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={onOpenGarage}
              className="py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-amber-400 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-800"
            >
              <Wrench className="w-4 h-4" />
              <span>Garage</span>
            </button>

            <button
              onClick={onHome}
              className="py-3 rounded-xl bg-slate-950 hover:bg-slate-800 text-slate-300 hover:text-white font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-800"
            >
              <Home className="w-4 h-4" />
              <span>Main Menu</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
