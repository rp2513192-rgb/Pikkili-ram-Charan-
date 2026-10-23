export type GameMode = 'endless' | 'career' | 'zen';

export type WeatherType = 'sunny' | 'golden_hour' | 'night' | 'monsoon';

export type CameraView = 'chase' | 'hood' | 'cinematic';

export interface CarStats {
  id: string;
  name: string;
  desiName: string;
  description: string;
  topSpeed: number; // km/h
  acceleration: number; // 0-100
  handling: number; // agility
  durability: number; // max hits
  price: number;
  color: string;
  unlocked: boolean;
  horns: string[];
  activeHorn: string;
  specialFeature: string;
}

export interface PlayerCarUpgrades {
  engine: number; // 1-5
  handling: number; // 1-5
  brakes: number; // 1-5
  durability: number; // 1-5
}

export type TrafficVehicleType = 
  | 'truck' // Iconic Indian Tata truck ("Horn OK Please")
  | 'auto' // Bajaj Auto-Rickshaw
  | 'bike' // Commuter motorcycle
  | 'bus' // State Roadways bus ("Lal Dabba")
  | 'tractor' // Sugarcane tractor
  | 'cow' // Stray Indian cattle crossing
  | 'car'; // Normal sedan

export interface TrafficEntity {
  id: number;
  type: TrafficVehicleType;
  x: number; // Lane lateral position (-8 to +8)
  z: number; // Longitudinal position relative to player
  speed: number; // Current speed (m/s)
  targetSpeed: number;
  lane: number; // 0: left, 1: center-left, 2: center-right, 3: right
  targetLane: number;
  length: number;
  width: number;
  height: number;
  meshIndex: number;
  isWrongWay: boolean;
  honkReactionCooldown: number;
  hazardTimer: number;
  color: string;
  customText?: string;
  passedPlayer: boolean;
}

export interface NearMissEvent {
  id: string;
  text: string;
  points: number;
  combo: number;
  time: number;
}

export interface RoadProp {
  id: number;
  type: 'milestone' | 'dhaba' | 'tree' | 'toll' | 'pothole' | 'signboard' | 'chai_stall';
  x: number;
  z: number;
  scale?: number;
  rotationY?: number;
  text?: string;
}

export interface CareerMission {
  id: string;
  title: string;
  hindiTitle: string;
  description: string;
  highwayName: string;
  targetDistance: number; // km
  weather: WeatherType;
  trafficDensity: 'low' | 'medium' | 'high' | 'crazy';
  rewardRupees: number;
  completed: boolean;
  rules: string[];
}
