import React, { useEffect, useRef } from 'react';
import { GameEngine, GameEngineCallbacks } from '../game/gameEngine';
import { CarStats, PlayerCarUpgrades, GameMode, WeatherType, NearMissEvent } from '../types/game';

interface GameCanvasProps {
  activeCar: CarStats;
  upgrades: PlayerCarUpgrades;
  gameMode: GameMode;
  weather: WeatherType;
  isPaused: boolean;
  onSpeedUpdate: (speed: number, rpm: number, gear: number) => void;
  onDistanceUpdate: (dist: number, coins: number) => void;
  onHealthUpdate: (health: number) => void;
  onNearMiss: (event: NearMissEvent) => void;
  onTollPassed: (amount: number) => void;
  onGameOver: (reason: string, stats: { distance: number; nearMisses: number; topSpeed: number; coins: number }) => void;
  engineRef: React.MutableRefObject<GameEngine | null>;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  activeCar,
  upgrades,
  gameMode,
  weather,
  isPaused,
  onSpeedUpdate,
  onDistanceUpdate,
  onHealthUpdate,
  onNearMiss,
  onTollPassed,
  onGameOver,
  engineRef,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const callbacksRef = useRef<GameEngineCallbacks>({
    onSpeedUpdate,
    onDistanceUpdate,
    onHealthUpdate,
    onNearMiss,
    onTollPassed,
    onGameOver,
  });

  // Keep latest callbacks in ref to avoid re-mounting engine
  useEffect(() => {
    callbacksRef.current = {
      onSpeedUpdate,
      onDistanceUpdate,
      onHealthUpdate,
      onNearMiss,
      onTollPassed,
      onGameOver,
    };
  }, [onSpeedUpdate, onDistanceUpdate, onHealthUpdate, onNearMiss, onTollPassed, onGameOver]);

  // Mount Three.js engine once
  useEffect(() => {
    if (!mountRef.current) return;

    const engine = new GameEngine(
      mountRef.current,
      activeCar,
      upgrades,
      gameMode,
      {
        onSpeedUpdate: (s, r, g) => callbacksRef.current.onSpeedUpdate(s, r, g),
        onDistanceUpdate: (d, c) => callbacksRef.current.onDistanceUpdate(d, c),
        onHealthUpdate: (h) => callbacksRef.current.onHealthUpdate(h),
        onNearMiss: (e) => callbacksRef.current.onNearMiss(e),
        onTollPassed: (a) => callbacksRef.current.onTollPassed(a),
        onGameOver: (r, s) => callbacksRef.current.onGameOver(r, s),
      }
    );

    engine.setWeather(weather);
    engine.start();
    engineRef.current = engine;

    return () => {
      engine.dispose();
      engineRef.current = null;
    };
  }, [activeCar.id, activeCar.color, gameMode]);

  // Handle pause / unpause
  useEffect(() => {
    if (engineRef.current) {
      if (isPaused) {
        engineRef.current.pause();
      } else {
        engineRef.current.pause();
      }
    }
  }, [isPaused]);

  // Handle weather changes
  useEffect(() => {
    if (engineRef.current) {
      engineRef.current.setWeather(weather);
    }
  }, [weather]);

  return (
    <div
      ref={mountRef}
      className="absolute inset-0 w-full h-full overflow-hidden bg-slate-950"
    />
  );
};
