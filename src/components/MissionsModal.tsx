import React from 'react';
import { X, Compass, CheckCircle2, Award, ArrowRight } from 'lucide-react';
import { CareerMission } from '../types/game';

interface MissionsModalProps {
  missions: CareerMission[];
  onSelectMission: (mission: CareerMission) => void;
  onClose: () => void;
}

export const MissionsModal: React.FC<MissionsModalProps> = ({
  missions,
  onSelectMission,
  onClose,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85">
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">
                INDIAN HIGHWAY CAREER MISSIONS
              </h2>
              <p className="text-xs text-slate-400">
                Complete regional transport challenges & earn FASTag cash
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* MISSION CARDS */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {missions.map((m, idx) => (
            <div
              key={m.id}
              className="bg-slate-950 p-5 rounded-2xl border border-slate-800 hover:border-amber-500/50 transition-all flex flex-col gap-3 group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
                      Stage {idx + 1} • {m.highwayName}
                    </span>
                    {m.completed && (
                      <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full">
                        <CheckCircle2 className="w-3 h-3" /> Completed
                      </span>
                    )}
                  </div>
                  <h3 className="text-base font-black text-white mt-0.5">
                    {m.title}{' '}
                    <span className="text-xs text-slate-400 font-normal">
                      ({m.hindiTitle})
                    </span>
                  </h3>
                  <p className="text-xs text-slate-300 mt-1">{m.description}</p>
                </div>

                <div className="flex flex-col items-end">
                  <span className="text-xs text-slate-400 font-semibold">Reward</span>
                  <span className="text-base font-black text-emerald-400 tabular-nums">
                    ₹{m.rewardRupees}
                  </span>
                </div>
              </div>

              {/* Rules / conditions */}
              <div className="flex flex-wrap gap-2 pt-2 border-t border-slate-900">
                <span className="text-[11px] bg-slate-900 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800">
                  Target: {m.targetDistance} KM
                </span>
                <span className="text-[11px] bg-slate-900 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 uppercase">
                  Weather: {m.weather.replace('_', ' ')}
                </span>
                <span className="text-[11px] bg-slate-900 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 uppercase">
                  Traffic: {m.trafficDensity}
                </span>
              </div>

              <button
                onClick={() => onSelectMission(m)}
                className="mt-1 w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs flex items-center justify-center gap-2 transition-transform active:scale-95"
              >
                <span>Start Mission</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
