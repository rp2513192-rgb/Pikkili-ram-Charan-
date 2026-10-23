import * as THREE from 'three';
import { TrafficEntity, TrafficVehicleType, NearMissEvent } from '../types/game';
import { 
  getLaneCenterX, 
  NUM_LANES 
} from './roadSystem';
import { 
  createIndianTruckMesh, 
  createAutoRickshawMesh, 
  createMotorcycleMesh, 
  createIndianBusMesh, 
  createTractorMesh, 
  createIndianCowMesh 
} from './proceduralModels';
import { sounds } from '../audio/SoundEffects';

export interface TrafficMeshInstance {
  entity: TrafficEntity;
  group: THREE.Group;
}

export class TrafficManager {
  public trafficList: TrafficMeshInstance[] = [];
  private scene: THREE.Scene;
  private nextEntityId: number = 1;
  private spawnCooldown: number = 0;
  private maxVehicles: number = 14;

  constructor(scene: THREE.Scene) {
    this.scene = scene;
  }

  public setDensity(density: 'low' | 'medium' | 'high' | 'crazy') {
    switch (density) {
      case 'low': this.maxVehicles = 8; break;
      case 'medium': this.maxVehicles = 12; break;
      case 'high': this.maxVehicles = 16; break;
      case 'crazy': this.maxVehicles = 22; break;
    }
  }

  // Spawn an authentic Indian road vehicle
  private spawnVehicle(playerZ: number, playerSpeed: number): TrafficMeshInstance | null {
    // Determine vehicle type with authentic Indian traffic distributions
    const roll = Math.random();
    let type: TrafficVehicleType = 'car';
    let length = 4.0;
    let width = 1.9;
    let height = 1.4;
    let baseSpeed = 18; // m/s (~65 km/h)
    let isWrongWay = false;

    if (roll < 0.32) {
      type = 'truck'; // 32% Tata Trucks
      length = 7.8;
      width = 2.4;
      height = 3.6;
      baseSpeed = 16 + Math.random() * 5; // 58-75 km/h
    } else if (roll < 0.55) {
      type = 'auto'; // 23% Auto Rickshaws
      length = 2.6;
      width = 1.4;
      height = 1.8;
      baseSpeed = 12 + Math.random() * 4; // 45-58 km/h
    } else if (roll < 0.74) {
      type = 'bike'; // 19% Motorcycles
      length = 2.1;
      width = 0.8;
      height = 1.6;
      baseSpeed = 19 + Math.random() * 6; // 68-90 km/h
    } else if (roll < 0.86) {
      type = 'bus'; // 12% State Transport Buses
      length = 9.8;
      width = 2.5;
      height = 3.4;
      baseSpeed = 22 + Math.random() * 5; // 80-97 km/h
    } else if (roll < 0.93) {
      type = 'tractor'; // 7% Sugarcane Tractor
      length = 6.2;
      width = 2.2;
      height = 2.4;
      baseSpeed = 8 + Math.random() * 3; // 28-40 km/h
    } else {
      type = 'cow'; // 7% Holy Cow crossing
      length = 1.8;
      width = 0.85;
      height = 1.6;
      baseSpeed = 0.5 + Math.random() * 0.8; // 2-4 km/h walking
    }

    // Lane selection
    let lane = Math.floor(Math.random() * NUM_LANES);
    // Heavy trucks & tractors prefer lanes 0 or 1, or right lane
    if (type === 'tractor') lane = 0; // Shoulder lane
    if (type === 'bus') lane = Math.random() > 0.5 ? 2 : 3; // Fast lane

    // Occasional wrong-way bike or tractor (1 in 15 spawns on lane 0)
    if (lane === 0 && (type === 'bike' || type === 'tractor') && Math.random() < 0.12) {
      isWrongWay = true;
      baseSpeed = -baseSpeed;
    }

    // Spawn 80m to 160m ahead of player
    const spawnZ = playerZ + 80 + Math.random() * 80;
    const spawnX = getLaneCenterX(lane) + (Math.random() * 0.4 - 0.2);

    // Check if space is occupied
    for (const v of this.trafficList) {
      if (Math.abs(v.entity.z - spawnZ) < (length + v.entity.length + 8) &&
          Math.abs(v.entity.x - spawnX) < 2.0) {
        return null; // Don't spawn on top of another vehicle
      }
    }

    // Build mesh
    let mesh: THREE.Group;
    switch (type) {
      case 'truck': mesh = createIndianTruckMesh(); break;
      case 'auto': mesh = createAutoRickshawMesh(); break;
      case 'bike': mesh = createMotorcycleMesh(); break;
      case 'bus': mesh = createIndianBusMesh(); break;
      case 'tractor': mesh = createTractorMesh(); break;
      case 'cow': mesh = createIndianCowMesh(); break;
      default: mesh = createAutoRickshawMesh(); break;
    }

    if (isWrongWay) {
      mesh.rotation.y = Math.PI; // Face oncoming
    }

    mesh.position.set(spawnX, 0, spawnZ);
    this.scene.add(mesh);

    const entity: TrafficEntity = {
      id: this.nextEntityId++,
      type,
      x: spawnX,
      z: spawnZ,
      speed: baseSpeed,
      targetSpeed: baseSpeed,
      lane,
      targetLane: lane,
      length,
      width,
      height,
      meshIndex: 0,
      isWrongWay,
      honkReactionCooldown: 0,
      hazardTimer: 0,
      color: '#fff',
      passedPlayer: false,
    };

    return { entity, group: mesh };
  }

  // Handle player pressing the horn!
  // In India, honking makes vehicles ahead acknowledge and move aside or honk back
  public onPlayerHonk(playerX: number, playerZ: number, hornType: string = 'classic') {
    for (const item of this.trafficList) {
      const e = item.entity;
      const dz = e.z - playerZ;
      const dx = Math.abs(e.x - playerX);

      // Nearby vehicle ahead (within 35m and adjacent/same lane)
      if (dz > 0 && dz < 35 && dx < 4.0 && e.honkReactionCooldown <= 0) {
        e.honkReactionCooldown = 4.0; // 4 seconds cooldown

        if (e.type === 'cow') {
          // Cow turns head and moves slightly away
          e.x += (e.x > playerX ? 0.6 : -0.6);
          sounds.playCowAlert();
        } else if (e.type === 'truck') {
          // Truck sways to make room and sometimes responds with an airhorn tap
          if (e.lane > 0 && Math.random() > 0.3) {
            e.targetLane = e.lane - 1; // Pull left to clear overtaking lane
          }
          if (Math.random() < 0.45) {
            setTimeout(() => sounds.startHorn('airhorn'), 350);
            setTimeout(() => sounds.stopHorn(), 650);
          }
        } else if (e.type === 'auto') {
          // Auto Rickshaws quickly tuck into the nearest open lane
          if (e.x < playerX) {
            e.targetLane = Math.max(0, e.lane - 1);
          } else {
            e.targetLane = Math.min(NUM_LANES - 1, e.lane + 1);
          }
        }
      }
    }
  }

  // Update simulation loop
  public update(
    dt: number, 
    playerX: number, 
    playerZ: number, 
    playerSpeedKmh: number,
    onNearMiss: (event: NearMissEvent) => void
  ) {
    const playerSpeedMs = (playerSpeedKmh * 1000) / 3600;

    // 1. Spawning
    this.spawnCooldown -= dt;
    if (this.trafficList.length < this.maxVehicles && this.spawnCooldown <= 0) {
      const spawned = this.spawnVehicle(playerZ, playerSpeedMs);
      if (spawned) {
        this.trafficList.push(spawned);
        this.spawnCooldown = 0.8 + Math.random() * 1.2;
      }
    }

    // 2. Traffic Physics & AI
    for (let i = this.trafficList.length - 1; i >= 0; i--) {
      const item = this.trafficList[i];
      const e = item.entity;
      const mesh = item.group;

      if (e.honkReactionCooldown > 0) {
        e.honkReactionCooldown -= dt;
      }

      // Move forward along Z
      e.z += e.speed * dt;

      // Lateral lane steer
      const targetX = getLaneCenterX(e.targetLane);
      const diffX = targetX - e.x;
      if (Math.abs(diffX) > 0.05) {
        const steerDir = Math.sign(diffX);
        e.x += steerDir * 2.2 * dt;
        // Subtle banking roll for autos and bikes
        if (e.type === 'auto' || e.type === 'bike') {
          mesh.rotation.z = -steerDir * 0.12;
        }
      } else {
        mesh.rotation.z = 0;
        e.lane = e.targetLane;
      }

      // Cow wandering behavior
      if (e.type === 'cow') {
        e.x += Math.sin(Date.now() * 0.001 + e.id) * 0.4 * dt;
        mesh.position.y = Math.abs(Math.sin(Date.now() * 0.004 + e.id)) * 0.08;
      }

      // Tata Truck gentle road sway under heavy load
      if (e.type === 'truck') {
        mesh.rotation.z = Math.sin(Date.now() * 0.003 + e.id) * 0.02;
      }

      mesh.position.x = e.x;
      mesh.position.z = e.z;

      // 3. Near Miss Check (Overtake close call)
      const distZ = e.z - playerZ;
      const distX = Math.abs(e.x - playerX);

      // Just passed the player's bumper
      if (!e.passedPlayer && distZ < 1.0 && distZ > -3.5) {
        e.passedPlayer = true;
        const relativeSpeedKmh = playerSpeedKmh - (e.speed * 3.6);

        // Close shave pass: lateral distance < 1.5m and high speed differential
        if (distX < (e.width / 2 + 1.2) && distX > (e.width / 2 + 0.3) && relativeSpeedKmh > 25) {
          let points = 100;
          let label = 'Close Shave! +100';

          if (e.isWrongWay) {
            points = 500;
            label = 'Wrong Way Dodge! +500';
          } else if (e.type === 'truck') {
            points = 250;
            label = 'Truck Slipstream! +250';
          } else if (e.type === 'cow') {
            points = 300;
            label = 'Holy Cow Dodge! +300';
          }

          sounds.playNearMiss();
          onNearMiss({
            id: `nm_${Date.now()}_${e.id}`,
            text: label,
            points,
            combo: 1,
            time: Date.now(),
          });
        }
      }

      // Despawn if far behind or too far ahead
      if (e.z < playerZ - 45 || e.z > playerZ + 240) {
        this.scene.remove(mesh);
        mesh.clear();
        this.trafficList.splice(i, 1);
      }
    }
  }

  public checkCollisions(
    playerX: number, 
    playerZ: number, 
    playerWidth: number, 
    playerLength: number
  ): TrafficEntity | null {
    const halfPL = playerLength / 2;
    const halfPW = playerWidth / 2;

    for (const item of this.trafficList) {
      const e = item.entity;
      const halfTL = e.length / 2;
      const halfTW = e.width / 2;

      // AABB Box intersection
      const overlapZ = Math.abs(e.z - playerZ) < (halfPL + halfTL - 0.2);
      const overlapX = Math.abs(e.x - playerX) < (halfPW + halfTW - 0.15);

      if (overlapZ && overlapX) {
        return e;
      }
    }
    return null;
  }

  public dispose() {
    for (const item of this.trafficList) {
      this.scene.remove(item.group);
      item.group.clear();
    }
    this.trafficList = [];
  }
}
