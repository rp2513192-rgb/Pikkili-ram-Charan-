import React, { useState } from 'react';
import { X, Check, Lock, Zap, Gauge, Shield, Wrench, Volume2 } from 'lucide-react';
import { CarStats, PlayerCarUpgrades } from '../types/game';
import { sounds } from '../audio/SoundEffects';

interface GarageModalProps {
  cars: CarStats[];
  activeCarId: string;
  upgrades: PlayerCarUpgrades;
  coins: number;
  onSelectCar: (carId: string) => void;
  onUnlockCar: (carId: string, cost: number) => void;
  onUpgradePart: (part: keyof PlayerCarUpgrades, cost: number) => void;
  onSelectHorn: (horn: string) => void;
  onChangeColor: (color: string) => void;
  onClose: () => void;
}

const COLOR_SWATCHES = [
  { name: 'Racing Red', hex: '#ef4444' },
  { name: 'Saffron Gold', hex: '#f59e0b' },
  { name: 'Royal Navy', hex: '#1d4ed8' },
  { name: 'Pearl White', hex: '#f8fafc' },
  { name: 'Midnight Black', hex: '#18181b' },
  { name: 'Emerald Forest', hex: '#15803d' },
];

export const GarageModal: React.FC<GarageModalProps> = ({
  cars,
  activeCarId,
  upgrades,
  coins,
  onSelectCar,
  onUnlockCar,
  onUpgradePart,
  onSelectHorn,
  onChangeColor,
  onClose,
}) => {
  const [selectedCarId, setSelectedCarId] = useState(activeCarId);
  const currentCar = cars.find(c => c.id === selectedCarId) || cars[0];

  const UPGRADE_COSTS = [0, 400, 800, 1400, 2200];

  const handleTestHorn = (hornType: string) => {
    sounds.tapHorn(hornType);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-slate-700 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* HEADER */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white tracking-wide">DESI HIGHWAY GARAGE & TUNING</h2>
              <p className="text-xs text-slate-400">Select, upgrade, and customize your vehicle</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1.5 bg-emerald-950/60 border border-emerald-500/40 px-3.5 py-1.5 rounded-full text-emerald-400 font-black text-sm">
              <span>FASTag Balance:</span>
              <span className="text-emerald-300">₹{coins}</span>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* CONTENT BODY */}
        <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* LEFT: VEHICLE SELECTION (5 cols) */}
          <div className="md:col-span-5 flex flex-col gap-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Choose Vehicle
            </span>
            <div className="flex flex-col gap-2.5">
              {cars.map(c => {
                const isSelected = c.id === selectedCarId;
                const isEquipped = c.id === activeCarId;

                return (
                  <div
                    key={c.id}
                    onClick={() => setSelectedCarId(c.id)}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-slate-800 border-amber-500 shadow-lg'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-white shadow-md"
                        style={{ backgroundColor: c.color }}
                      >
                        🚗
                      </div>
                      <div>
                        <div className="text-sm font-black text-white flex items-center gap-2">
                          <span>{c.name}</span>
                          {isEquipped && (
                            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-1.5 py-0.5 rounded font-bold">
                              EQUIPPED
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-amber-400 font-semibold">{c.desiName}</div>
                      </div>
                    </div>

                    {!c.unlocked ? (
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-400 bg-slate-900 px-2 py-1 rounded-lg border border-slate-800">
                        <Lock className="w-3.5 h-3.5 text-amber-400" />
                        <span>₹{c.price}</span>
                      </div>
                    ) : (
                      isSelected && <Check className="w-4 h-4 text-amber-400" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Equip / Unlock Button */}
            <div className="mt-2">
              {!currentCar.unlocked ? (
                <button
                  onClick={() => onUnlockCar(currentCar.id, currentCar.price)}
                  disabled={coins < currentCar.price}
                  className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all ${
                    coins >= currentCar.price
                      ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  <Lock className="w-4 h-4" />
                  <span>Unlock for ₹{currentCar.price}</span>
                </button>
              ) : (
                <button
                  onClick={() => onSelectCar(currentCar.id)}
                  disabled={currentCar.id === activeCarId}
                  className={`w-full py-3 rounded-xl font-black text-sm transition-all ${
                    currentCar.id === activeCarId
                      ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 cursor-default'
                      : 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg'
                  }`}
                >
                  {currentCar.id === activeCarId ? 'Equipped & Ready' : 'Equip This Car'}
                </button>
              )}
            </div>
          </div>

          {/* RIGHT: TUNING, HORNS & COLORS (7 cols) */}
          <div className="md:col-span-7 flex flex-col gap-5">
            {/* Vehicle Description & Special Feature */}
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-base font-black text-white">{currentCar.name}</h3>
                  <p className="text-xs text-slate-400">{currentCar.description}</p>
                </div>
              </div>
              <div className="mt-2 inline-flex items-center gap-1.5 bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs px-2.5 py-1 rounded-lg font-bold">
                <span>⭐ Special:</span>
                <span>{currentCar.specialFeature}</span>
              </div>
            </div>

            {/* Performance Parts Upgrades */}
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Performance Tuning
              </span>

              {/* Engine */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-amber-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Engine Power (Stage {upgrades.engine}/5)</div>
                    <div className="text-[11px] text-slate-400">+Top speed & faster highway pickup</div>
                  </div>
                </div>
                {upgrades.engine < 5 ? (
                  <button
                    onClick={() => onUpgradePart('engine', UPGRADE_COSTS[upgrades.engine])}
                    disabled={coins < UPGRADE_COSTS[upgrades.engine]}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      coins >= UPGRADE_COSTS[upgrades.engine]
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Upgrade ₹{UPGRADE_COSTS[upgrades.engine]}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-400">MAX</span>
                )}
              </div>

              {/* Handling */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Gauge className="w-4 h-4 text-sky-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Handling & Grip (Stage {upgrades.handling}/5)</div>
                    <div className="text-[11px] text-slate-400">Faster lane changing & weaving agility</div>
                  </div>
                </div>
                {upgrades.handling < 5 ? (
                  <button
                    onClick={() => onUpgradePart('handling', UPGRADE_COSTS[upgrades.handling])}
                    disabled={coins < UPGRADE_COSTS[upgrades.handling]}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      coins >= UPGRADE_COSTS[upgrades.handling]
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Upgrade ₹{UPGRADE_COSTS[upgrades.handling]}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-400">MAX</span>
                )}
              </div>

              {/* Durability */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <div>
                    <div className="text-xs font-bold text-white">Armor & Suspension (Stage {upgrades.durability}/5)</div>
                    <div className="text-[11px] text-slate-400">Absorbs crash impacts and road potholes</div>
                  </div>
                </div>
                {upgrades.durability < 5 ? (
                  <button
                    onClick={() => onUpgradePart('durability', UPGRADE_COSTS[upgrades.durability])}
                    disabled={coins < UPGRADE_COSTS[upgrades.durability]}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                      coins >= UPGRADE_COSTS[upgrades.durability]
                        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    Upgrade ₹{UPGRADE_COSTS[upgrades.durability]}
                  </button>
                ) : (
                  <span className="text-xs font-bold text-emerald-400">MAX</span>
                )}
              </div>
            </div>

            {/* Custom Indian Horn Sound Selection */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Desi Horn Melody ("Horn OK Please")
              </span>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'classic', label: 'Classic Desi Twin' },
                  { id: 'nagad', label: 'Nagad Melody' },
                  { id: 'airhorn', label: 'Express Air Horn' },
                ].map(h => {
                  const isActive = currentCar.activeHorn === h.id;
                  return (
                    <div
                      key={h.id}
                      className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 ${
                        isActive ? 'bg-amber-950/40 border-amber-500' : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-white">{h.label}</span>
                        <button
                          onClick={() => handleTestHorn(h.id)}
                          className="p-1 rounded text-amber-400 hover:bg-slate-800"
                          title="Test Horn Audio"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <button
                        onClick={() => onSelectHorn(h.id)}
                        className={`text-[10px] py-1 rounded font-bold transition-colors ${
                          isActive
                            ? 'bg-amber-500 text-slate-950'
                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                        }`}
                      >
                        {isActive ? 'Active' : 'Equip'}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Body Paint Swatches */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Vehicle Paint
              </span>
              <div className="flex items-center gap-3">
                {COLOR_SWATCHES.map(s => (
                  <button
                    key={s.hex}
                    onClick={() => onChangeColor(s.hex)}
                    className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 flex items-center justify-center ${
                      currentCar.color.toLowerCase() === s.hex.toLowerCase()
                        ? 'border-amber-400 scale-110 shadow-lg'
                        : 'border-slate-700'
                    }`}
                    style={{ backgroundColor: s.hex }}
                    title={s.name}
                  >
                    {currentCar.color.toLowerCase() === s.hex.toLowerCase() && (
                      <Check className={`w-4 h-4 ${s.hex === '#f8fafc' ? 'text-black' : 'text-white'}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
