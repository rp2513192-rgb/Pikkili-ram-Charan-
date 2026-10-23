import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GameEngine } from './game/gameEngine';
import { GameCanvas } from './components/GameCanvas';
import { HUD } from './components/HUD';
import { TitleScreen } from './components/TitleScreen';
import { GarageModal } from './components/GarageModal';
import { MissionsModal } from './components/MissionsModal';
import { PauseGameOverModal } from './components/PauseGameOverModal';
import { INITIAL_CARS, CAREER_MISSIONS } from './data/gameData';
import { 
  CarStats, 
  PlayerCarUpgrades, 
  GameMode, 
  WeatherType, 
  NearMissEvent, 
  CareerMission 
} from './types/game';
import { sounds } from './audio/SoundEffects';

export default function App() {
  // Navigation & Modal States
  const [gameState, setGameState] = useState<'title' | 'playing' | 'paused' | 'game_over'>('title');
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [isMissionsOpen, setIsMissionsOpen] = useState(false);
  const [gameOverReason, setGameOverReason] = useState<string>('');

  // Game Configuration
  const [cars, setCars] = useState<CarStats[]>(INITIAL_CARS);
  const [activeCarId, setActiveCarId] = useState<string>('swift');
  const [gameMode, setGameMode] = useState<GameMode>('endless');
  const [weather, setWeather] = useState<WeatherType>('golden_hour');
  const [missions, setMissions] = useState<CareerMission[]>(CAREER_MISSIONS);
  const [activeMission, setActiveMission] = useState<CareerMission | null>(null);

  // Upgrades & Economy
  const [coins, setCoins] = useState<number>(650); // FASTag balance
  const [upgrades, setUpgrades] = useState<PlayerCarUpgrades>({
    engine: 1,
    handling: 1,
    brakes: 1,
    durability: 1,
  });

  // Real-time HUD states
  const [speedKmh, setSpeedKmh] = useState(0);
  const [rpm, setRpm] = useState(1000);
  const [gear, setGear] = useState(1);
  const [distanceKm, setDistanceKm] = useState(0);
  const [health, setHealth] = useState(100);
  const [nearMissToast, setNearMissToast] = useState<NearMissEvent | null>(null);
  const [tollNotice, setTollNotice] = useState<string | null>(null);

  // End trip stats
  const [tripStats, setTripStats] = useState({
    distance: 0,
    nearMisses: 0,
    topSpeed: 0,
    coins: 650,
  });

  const engineRef = useRef<GameEngine | null>(null);

  const activeCar = cars.find(c => c.id === activeCarId) || cars[0];
  const maxHealth = 100 + (upgrades.durability - 1) * 25;

  // Handle Near-Miss Toast timer
  const handleNearMiss = useCallback((event: NearMissEvent) => {
    setNearMissToast(event);
    setTimeout(() => {
      setNearMissToast(null);
    }, 1800);
  }, []);

  // Handle FASTag Toll Passing
  const handleTollPassed = useCallback((amount: number) => {
    setTollNotice(`FASTag Toll Paid: ₹${amount} • Have a Safe Journey!`);
    setTimeout(() => {
      setTollNotice(null);
    }, 3200);
  }, []);

  // Handle Game Over
  const handleGameOver = useCallback((reason: string, stats: { distance: number; nearMisses: number; topSpeed: number; coins: number }) => {
    setGameOverReason(reason);
    setTripStats(stats);
    setCoins(stats.coins);
    setGameState('game_over');
  }, []);

  // Start Playing
  const handleStartGame = (mode: GameMode) => {
    setGameMode(mode);
    if (mode === 'career') {
      setIsMissionsOpen(true);
      return;
    }
    if (mode === 'zen') {
      setWeather('golden_hour');
      sounds.toggleRadio();
    }
    setGameState('playing');
    setHealth(maxHealth);
    setDistanceKm(0);
  };

  const handleSelectMission = (mission: CareerMission) => {
    setActiveMission(mission);
    setWeather(mission.weather);
    setIsMissionsOpen(false);
    setGameState('playing');
    setHealth(maxHealth);
    setDistanceKm(0);
  };

  const handleResume = () => {
    setGameState('playing');
  };

  const handleRestart = () => {
    setGameState('playing');
    setHealth(maxHealth);
    setDistanceKm(0);
    setSpeedKmh(0);
  };

  const handleHome = () => {
    setGameState('title');
    setActiveMission(null);
  };

  // Keyboard shortcut listener for Start / Pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (gameState === 'playing') {
          setGameState('paused');
        } else if (gameState === 'paused') {
          setGameState('playing');
        }
      }
      if (gameState === 'title' && (e.key === 'Enter' || e.key === ' ')) {
        if (!isGarageOpen && !isMissionsOpen) {
          handleStartGame('endless');
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, isGarageOpen, isMissionsOpen]);

  // Car Garage handlers
  const handleSelectCar = (carId: string) => {
    setActiveCarId(carId);
  };

  const handleUnlockCar = (carId: string, cost: number) => {
    if (coins >= cost) {
      setCoins(prev => prev - cost);
      setCars(prev =>
        prev.map(c => (c.id === carId ? { ...c, unlocked: true } : c))
      );
      setActiveCarId(carId);
    }
  };

  const handleUpgradePart = (part: keyof PlayerCarUpgrades, cost: number) => {
    if (coins >= cost && upgrades[part] < 5) {
      setCoins(prev => prev - cost);
      setUpgrades(prev => ({
        ...prev,
        [part]: prev[part] + 1,
      }));
    }
  };

  const handleSelectHorn = (horn: string) => {
    setCars(prev =>
      prev.map(c => (c.id === activeCarId ? { ...c, activeHorn: horn } : c))
    );
  };

  const handleChangeColor = (color: string) => {
    setCars(prev =>
      prev.map(c => (c.id === activeCarId ? { ...c, color } : c))
    );
  };

  const handleHonk = () => {
    if (engineRef.current) {
      engineRef.current.soundPlayerHorn();
    }
  };

  const handleDipper = () => {
    if (engineRef.current) {
      engineRef.current.flashDipper();
    }
  };

  const handleCameraChange = () => {
    if (engineRef.current) {
      engineRef.current.switchCameraView();
    }
  };

  const handleTouchDrive = (key: string, isDown: boolean) => {
    if (engineRef.current) {
      engineRef.current.setTouchInput(key, isDown);
    }
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 font-sans select-none">
      {/* 1. 3D WEBGL SIMULATION VIEWPORT */}
      <GameCanvas
        activeCar={activeCar}
        upgrades={upgrades}
        gameMode={gameMode}
        weather={weather}
        isPaused={gameState !== 'playing'}
        onSpeedUpdate={(s, r, g) => {
          setSpeedKmh(s);
          setRpm(r);
          setGear(g);
        }}
        onDistanceUpdate={(d, c) => {
          setDistanceKm(d);
          setCoins(c);
        }}
        onHealthUpdate={h => setHealth(h)}
        onNearMiss={handleNearMiss}
        onTollPassed={handleTollPassed}
        onGameOver={handleGameOver}
        engineRef={engineRef}
      />

      {/* 2. IN-GAME HUD (Visible when actively driving) */}
      {gameState === 'playing' && (
        <HUD
          speedKmh={speedKmh}
          rpm={rpm}
          gear={gear}
          distanceKm={distanceKm}
          coins={coins}
          health={health}
          maxHealth={maxHealth}
          nearMiss={nearMissToast}
          tollNotice={tollNotice}
          weather={weather}
          highwayName={activeMission ? activeMission.highwayName : 'NH-44 Golden Quadrilateral'}
          onPause={() => setGameState('paused')}
          onWeatherChange={w => setWeather(w)}
          onCameraChange={handleCameraChange}
          onHonk={handleHonk}
          onDipper={handleDipper}
          onTouchDrive={handleTouchDrive}
        />
      )}

      {/* 3. TITLE SCREEN */}
      {gameState === 'title' && (
        <TitleScreen
          onStartGame={handleStartGame}
          onOpenGarage={() => setIsGarageOpen(true)}
          activeCar={activeCar}
          coins={coins}
        />
      )}

      {/* 4. PAUSE / GAME OVER MODAL */}
      {(gameState === 'paused' || gameState === 'game_over') && (
        <PauseGameOverModal
          isGameOver={gameState === 'game_over'}
          reason={gameOverReason}
          stats={{
            distance: distanceKm,
            nearMisses: tripStats.nearMisses,
            topSpeed: tripStats.topSpeed,
            coins: coins,
          }}
          onResume={handleResume}
          onRestart={handleRestart}
          onOpenGarage={() => setIsGarageOpen(true)}
          onHome={handleHome}
        />
      )}

      {/* 5. GARAGE MODAL */}
      {isGarageOpen && (
        <GarageModal
          cars={cars}
          activeCarId={activeCarId}
          upgrades={upgrades}
          coins={coins}
          onSelectCar={handleSelectCar}
          onUnlockCar={handleUnlockCar}
          onUpgradePart={handleUpgradePart}
          onSelectHorn={handleSelectHorn}
          onChangeColor={handleChangeColor}
          onClose={() => setIsGarageOpen(false)}
        />
      )}

      {/* 6. CAREER MISSIONS MODAL */}
      {isMissionsOpen && (
        <MissionsModal
          missions={missions}
          onSelectMission={handleSelectMission}
          onClose={() => setIsMissionsOpen(false)}
        />
      )}
    </div>
  );
}
