import * as THREE from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { 
  CarStats, 
  PlayerCarUpgrades, 
  GameMode, 
  WeatherType, 
  CameraView, 
  NearMissEvent,
  TrafficEntity 
} from '../types/game';
import { RoadSystem, ROAD_WIDTH, getLaneCenterX } from './roadSystem';
import { TrafficManager } from './trafficAi';
import { createPlayerCarMesh } from './proceduralModels';
import { sounds } from '../audio/SoundEffects';

export interface GameEngineCallbacks {
  onSpeedUpdate: (speedKmh: number, rpm: number, gear: number) => void;
  onDistanceUpdate: (distanceKm: number, coins: number) => void;
  onHealthUpdate: (health: number) => void;
  onNearMiss: (event: NearMissEvent) => void;
  onTollPassed: (amount: number) => void;
  onGameOver: (reason: string, stats: { distance: number; nearMisses: number; topSpeed: number; coins: number }) => void;
}

export class GameEngine {
  private container: HTMLElement;
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private isSoftwareGl: boolean = false;
  private frameId: number = 0;
  private isRunning: boolean = false;
  private isPaused: boolean = false;

  // Subsystems
  private roadSystem: RoadSystem;
  private trafficManager: TrafficManager;
  private playerCarMesh: THREE.Group | null = null;
  private headlights: THREE.SpotLight[] = [];
  private vipBeacon: THREE.Object3D | null = null;

  // Car Physics State
  private playerX: number = 0;
  private playerZ: number = 0;
  private playerY: number = 0;
  private playerSpeedMs: number = 0; // m/s
  private playerAngle: number = 0; // Heading yaw
  private maxSpeedMs: number = 42; // ~150 km/h default
  private accelerationRate: number = 18;
  private brakingRate: number = 28;
  private steeringRate: number = 2.4;
  private currentHealth: number = 100;
  private currentCoins: number = 500;
  private totalNearMisses: number = 0;
  private topSpeedRecorded: number = 0;
  private distanceCoveredMeters: number = 0;

  // Suspension & Camera Shake
  private suspensionY: number = 0;
  private cameraShake: number = 0;
  private lastTime: number = 0;

  // Weather & Atmosphere
  private currentWeather: WeatherType = 'golden_hour';
  private dirLight: THREE.DirectionalLight;
  private hemiLight: THREE.HemisphereLight;
  private rainParticles: THREE.Points | null = null;

  // Camera Settings
  private cameraView: CameraView = 'chase';
  private cameraOffset = new THREE.Vector3(0, 3.6, -7.5);
  private cameraLookOffset = new THREE.Vector3(0, 1.2, 8.0);

  // Input states
  private keys: Record<string, boolean> = {};
  private callbacks: GameEngineCallbacks;
  private activeCar: CarStats;
  private activeUpgrades: PlayerCarUpgrades;
  private gameMode: GameMode = 'endless';

  // Toll interaction
  private passedTollPlazas = new Set<number>();

  constructor(
    container: HTMLElement, 
    car: CarStats, 
    upgrades: PlayerCarUpgrades, 
    mode: GameMode, 
    callbacks: GameEngineCallbacks
  ) {
    this.container = container;
    this.activeCar = car;
    this.activeUpgrades = upgrades;
    this.gameMode = mode;
    this.callbacks = callbacks;

    // 1. Detect Software WebGL
    this.isSoftwareGl = (() => {
      const gl = document.createElement('canvas').getContext('webgl2');
      if (!gl) return true;
      const ext = gl.getExtension('WEBGL_debug_renderer_info');
      const param = ext ? ext.UNMASKED_RENDERER_WEBGL : gl.RENDERER;
      const gpu = String(gl.getParameter(param));
      gl.getExtension('WEBGL_lose_context')?.loseContext();
      return /SwiftShader|llvmpipe|softpipe|Software|Basic Render/i.test(gpu);
    })();

    // 2. Scene & Camera
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / Math.max(container.clientHeight, 1),
      0.2,
      600
    );

    // 3. Renderer Setup
    this.renderer = new THREE.WebGLRenderer({
      antialias: !this.isSoftwareGl,
      powerPreference: 'high-performance',
    });
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.setPixelRatio(this.isSoftwareGl ? 1 : Math.min(window.devicePixelRatio, 2));
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = !this.isSoftwareGl;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    container.appendChild(this.renderer.domElement);

    // 4. Studio Environment Reflection Map
    const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
    this.scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
    pmremGenerator.dispose();

    // 5. Lighting Rig (3-Point Studio + Outdoor Indian Sun)
    this.hemiLight = new THREE.HemisphereLight(0xffedd5, 0x785638, 0.85);
    this.scene.add(this.hemiLight);

    this.dirLight = new THREE.DirectionalLight(0xfffaed, 2.0);
    this.dirLight.position.set(40, 60, -30);
    if (!this.isSoftwareGl) {
      this.dirLight.castShadow = true;
      this.dirLight.shadow.mapSize.width = 1024;
      this.dirLight.shadow.mapSize.height = 1024;
      this.dirLight.shadow.camera.near = 10;
      this.dirLight.shadow.camera.far = 150;
      this.dirLight.shadow.camera.left = -25;
      this.dirLight.shadow.camera.right = 25;
      this.dirLight.shadow.camera.top = 25;
      this.dirLight.shadow.camera.bottom = -25;
      this.dirLight.shadow.bias = -0.0005;
      this.dirLight.shadow.normalBias = 0.02;
    }
    this.scene.add(this.dirLight);

    // 6. Subsystems
    this.roadSystem = new RoadSystem(this.scene);
    this.trafficManager = new TrafficManager(this.scene);

    // Set weather
    this.setWeather('golden_hour');

    // 7. Spawn Player Car
    this.setupPlayerCar();

    // 8. Event Listeners
    this.setupInputs();
    window.addEventListener('resize', this.onResize);
  }

  public setWeather(weather: WeatherType) {
    this.currentWeather = weather;

    if (weather === 'golden_hour') {
      // Warm Indian sunset over the highway
      this.scene.background = new THREE.Color(0xfdba74);
      this.scene.fog = new THREE.FogExp2(0xfdba74, 0.006);
      this.hemiLight.color.setHex(0xfef08a);
      this.hemiLight.groundColor.setHex(0x9a3412);
      this.hemiLight.intensity = 0.95;
      this.dirLight.color.setHex(0xffedd5);
      this.dirLight.intensity = 2.2;
      this.dirLight.position.set(60, 30, -50);
      this.removeRain();
    } else if (weather === 'night') {
      // Midnight Indian Expressway
      this.scene.background = new THREE.Color(0x090d16);
      this.scene.fog = new THREE.FogExp2(0x090d16, 0.009);
      this.hemiLight.color.setHex(0x38bdf8);
      this.hemiLight.groundColor.setHex(0x020617);
      this.hemiLight.intensity = 0.25;
      this.dirLight.color.setHex(0x93c5fd);
      this.dirLight.intensity = 0.5;
      this.removeRain();
      this.toggleHeadlights(true);
    } else if (weather === 'monsoon') {
      // Indian Monsoon Rains (reflective wet roads, rain particles)
      this.scene.background = new THREE.Color(0x475569);
      this.scene.fog = new THREE.FogExp2(0x475569, 0.012);
      this.hemiLight.color.setHex(0x94a3b8);
      this.hemiLight.groundColor.setHex(0x334155);
      this.hemiLight.intensity = 0.55;
      this.dirLight.color.setHex(0xcbd5e1);
      this.dirLight.intensity = 1.0;
      this.setupRain();
    } else {
      // Sunny Day
      this.scene.background = new THREE.Color(0x7dd3fc);
      this.scene.fog = new THREE.FogExp2(0x7dd3fc, 0.005);
      this.hemiLight.color.setHex(0xffffff);
      this.hemiLight.groundColor.setHex(0x785638);
      this.hemiLight.intensity = 1.0;
      this.dirLight.color.setHex(0xfffbeb);
      this.dirLight.intensity = 2.4;
      this.removeRain();
    }
  }

  private setupRain() {
    this.removeRain();
    const count = 1200;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = Math.random() * 25;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 70;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x93c5fd,
      size: 0.15,
      transparent: true,
      opacity: 0.7,
    });

    this.rainParticles = new THREE.Points(geometry, material);
    this.scene.add(this.rainParticles);
  }

  private removeRain() {
    if (this.rainParticles) {
      this.scene.remove(this.rainParticles);
      this.rainParticles.geometry.dispose();
      (this.rainParticles.material as THREE.Material).dispose();
      this.rainParticles = null;
    }
  }

  private setupPlayerCar() {
    if (this.playerCarMesh) {
      this.scene.remove(this.playerCarMesh);
      this.playerCarMesh.clear();
    }

    // Calculate upgraded parameters
    const speedBonus = (this.activeUpgrades.engine - 1) * 3.5;
    const accelBonus = (this.activeUpgrades.engine - 1) * 2.0;
    const handlingBonus = (this.activeUpgrades.handling - 1) * 0.3;
    const brakesBonus = (this.activeUpgrades.brakes - 1) * 3.5;

    this.maxSpeedMs = (this.activeCar.topSpeed + speedBonus) / 3.6;
    this.accelerationRate = 16 + accelBonus;
    this.brakingRate = 28 + brakesBonus;
    this.steeringRate = 2.2 + handlingBonus;
    this.currentHealth = 100 + (this.activeUpgrades.durability - 1) * 25;

    this.playerCarMesh = createPlayerCarMesh(this.activeCar.id, this.activeCar.color);
    this.playerCarMesh.position.set(getLaneCenterX(1), 0, 0);
    this.playerX = getLaneCenterX(1);
    this.playerZ = 0;
    this.scene.add(this.playerCarMesh);

    // Look for VIP Lal Batti beacon
    this.vipBeacon = this.playerCarMesh.getObjectByName('vip_beacon') || null;

    // Add functional Headlights
    this.setupHeadlights();
  }

  private setupHeadlights() {
    this.headlights.forEach(hl => {
      this.scene.remove(hl);
      this.scene.remove(hl.target);
    });
    this.headlights = [];

    const leftLight = new THREE.SpotLight(0xffffff, 2.5, 60, Math.PI / 6, 0.4, 1.2);
    const rightLight = new THREE.SpotLight(0xffffff, 2.5, 60, Math.PI / 6, 0.4, 1.2);

    this.scene.add(leftLight);
    this.scene.add(rightLight);
    this.scene.add(leftLight.target);
    this.scene.add(rightLight.target);

    this.headlights.push(leftLight, rightLight);
  }

  public toggleHeadlights(force?: boolean) {
    const isVisible = force !== undefined ? force : (this.headlights[0]?.intensity > 0 ? false : true);
    this.headlights.forEach(hl => {
      hl.intensity = isVisible ? 3.0 : 0;
    });
  }

  public flashDipper() {
    // Quick double flash (classic Indian highway communication)
    this.headlights.forEach(hl => hl.intensity = 5.0);
    setTimeout(() => {
      this.headlights.forEach(hl => hl.intensity = 0.5);
      setTimeout(() => {
        this.headlights.forEach(hl => hl.intensity = 5.0);
        setTimeout(() => {
          this.headlights.forEach(hl => hl.intensity = this.currentWeather === 'night' ? 3.0 : 0);
        }, 150);
      }, 120);
    }, 150);
  }

  public soundPlayerHorn() {
    sounds.tapHorn(this.activeCar.activeHorn || 'classic');
    this.trafficManager.onPlayerHonk(this.playerX, this.playerZ, this.activeCar.activeHorn);
  }

  public switchCameraView() {
    if (this.cameraView === 'chase') {
      this.cameraView = 'hood';
      this.cameraOffset.set(0, 1.35, 1.5);
      this.cameraLookOffset.set(0, 1.2, 18.0);
    } else if (this.cameraView === 'hood') {
      this.cameraView = 'cinematic';
      this.cameraOffset.set(-4.5, 4.5, -9.0);
      this.cameraLookOffset.set(0, 1.0, 5.0);
    } else {
      this.cameraView = 'chase';
      this.cameraOffset.set(0, 3.4, -7.5);
      this.cameraLookOffset.set(0, 1.2, 8.0);
    }
  }

  private setupInputs() {
    const onKeyDown = (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = true;

      if (e.key === ' ' || e.key === 'h' || e.key === 'H') {
        if (e.key === 'h' || e.key === 'H') {
          this.soundPlayerHorn();
        }
      }
      if (e.key === 'f' || e.key === 'F') {
        this.flashDipper();
      }
      if (e.key === 'c' || e.key === 'C') {
        this.switchCameraView();
      }
      if (e.key === 'm' || e.key === 'M') {
        sounds.toggleMute();
      }
    };

    const onKeyUp = (e: KeyboardEvent) => {
      this.keys[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
  }

  public setTouchInput(key: string, isDown: boolean) {
    this.keys[key.toLowerCase()] = isDown;
  }

  public start() {
    this.isRunning = true;
    this.isPaused = false;
    this.lastTime = performance.now();
    sounds.startEngine();
    this.tick();
  }

  public pause() {
    this.isPaused = !this.isPaused;
  }

  public stop() {
    this.isRunning = false;
    cancelAnimationFrame(this.frameId);
    sounds.stopEngine();
  }

  private onResize = () => {
    if (!this.container) return;
    const width = this.container.clientWidth;
    const height = Math.max(this.container.clientHeight, 1);
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  };

  private tick = () => {
    if (!this.isRunning) return;

    const now = performance.now();
    const rawDt = (now - this.lastTime) / 1000;
    this.lastTime = now;
    const dt = Math.min(rawDt, 0.05); // Frame clamp

    if (!this.isPaused) {
      this.updateSimulation(dt);
    }

    this.renderer.render(this.scene, this.camera);

    // Frame scheduling: standard rAF on GPUs; afterDraw on software WebGL
    if (this.isSoftwareGl) {
      this.afterDraw(this.tick);
    } else {
      this.frameId = requestAnimationFrame(this.tick);
    }
  };

  private afterDraw(cb: () => void) {
    const gl = this.renderer.getContext() as WebGL2RenderingContext;
    const sync = gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    gl.flush();
    const poll = () => {
      const state = sync && gl.getSyncParameter(sync, gl.SYNC_STATUS);
      if (state === gl.UNSIGNALED) {
        this.frameId = window.setTimeout(poll, 5);
      } else {
        gl.deleteSync(sync);
        this.frameId = window.setTimeout(cb, 60);
      }
    };
    this.frameId = window.setTimeout(poll, 5);
  }

  private updateSimulation(dt: number) {
    // 1. Throttle & Braking
    const isAccelerating = this.keys['w'] || this.keys['arrowup'];
    const isBraking = this.keys['s'] || this.keys['arrowdown'] || this.keys[' '];
    const isSteeringLeft = this.keys['a'] || this.keys['arrowleft'];
    const isSteeringRight = this.keys['d'] || this.keys['arrowright'];

    // Throttle physics
    if (isAccelerating) {
      this.playerSpeedMs = Math.min(this.maxSpeedMs, this.playerSpeedMs + this.accelerationRate * dt);
    } else if (isBraking) {
      this.playerSpeedMs = Math.max(0, this.playerSpeedMs - this.brakingRate * dt);
      if (this.playerSpeedMs > 15) {
        sounds.playTireSkid();
      }
    } else {
      // Natural rolling road friction
      this.playerSpeedMs = Math.max(0, this.playerSpeedMs - 4.5 * dt);
    }

    const speedKmh = this.playerSpeedMs * 3.6;
    if (speedKmh > this.topSpeedRecorded) {
      this.topSpeedRecorded = Math.round(speedKmh);
    }

    // Steering physics (more responsive at medium speeds, stable at ultra high)
    const speedRatio = Math.min(1.0, this.playerSpeedMs / 12);
    let targetAngle = 0;
    if (isSteeringLeft) {
      this.playerX -= this.steeringRate * speedRatio * 3.2 * dt;
      targetAngle = 0.12;
    } else if (isSteeringRight) {
      this.playerX += this.steeringRate * speedRatio * 3.2 * dt;
      targetAngle = -0.12;
    }

    // Road lateral bounds clamp
    const halfRoad = ROAD_WIDTH / 2 + 1.2;
    this.playerX = THREE.MathUtils.clamp(this.playerX, -halfRoad, halfRoad);

    // Smooth car yaw angle
    this.playerAngle = THREE.MathUtils.damp(this.playerAngle, targetAngle, 8.0, dt);

    // Update position forward
    this.playerZ += this.playerSpeedMs * dt;
    this.distanceCoveredMeters += this.playerSpeedMs * dt;
    const distanceKm = this.distanceCoveredMeters / 1000;

    // Check potholes bounce
    const potholes = this.roadSystem.getPotholes();
    for (const p of potholes) {
      const dZ = Math.abs(p.z - this.playerZ);
      const dX = Math.abs(p.x - this.playerX);
      if (dZ < 1.2 && dX < p.radius) {
        sounds.playPotholeBump();
        this.cameraShake = 0.35;
        this.suspensionY = 0.25;
        this.playerSpeedMs = Math.max(5, this.playerSpeedMs - 5);
      }
    }

    // Suspension recovery
    this.suspensionY = THREE.MathUtils.damp(this.suspensionY, 0, 10, dt);
    this.cameraShake = THREE.MathUtils.damp(this.cameraShake, 0, 8, dt);

    // VIP Lal Batti beacon flash
    if (this.vipBeacon) {
      const flash = Math.sin(Date.now() * 0.015) > 0 ? 1.5 : 0.2;
      (this.vipBeacon as THREE.Mesh).scale.setScalar(flash > 1 ? 1.15 : 1.0);
    }

    // Position player car mesh
    if (this.playerCarMesh) {
      this.playerCarMesh.position.set(this.playerX, this.suspensionY, this.playerZ);
      this.playerCarMesh.rotation.y = this.playerAngle;
      // Body roll tilt
      this.playerCarMesh.rotation.z = -this.playerAngle * 0.45;
    }

    // Update Headlights
    if (this.headlights.length >= 2) {
      this.headlights[0].position.set(this.playerX - 0.7, 0.8, this.playerZ + 2.0);
      this.headlights[0].target.position.set(this.playerX - 0.7, 0, this.playerZ + 30.0);
      this.headlights[1].position.set(this.playerX + 0.7, 0.8, this.playerZ + 2.0);
      this.headlights[1].target.position.set(this.playerX + 0.7, 0, this.playerZ + 30.0);
    }

    // Update Directional sun to track player Z
    this.dirLight.position.z = this.playerZ - 30;
    this.dirLight.target.position.z = this.playerZ + 20;
    this.dirLight.target.updateMatrixWorld();

    // Update Road System
    this.roadSystem.update(this.playerZ);

    // Check FASTag Toll Plazas
    const currentToll = this.roadSystem.getActiveToll(this.playerZ);
    if (currentToll && !this.passedTollPlazas.has(currentToll.baseZ)) {
      this.passedTollPlazas.add(currentToll.baseZ);
      sounds.playFastagChime();
      this.currentCoins += 150;
      this.callbacks.onTollPassed(65);

      // Animate toll boom barrier lifting
      if (currentToll.tollBarrier) {
        currentToll.tollBarrier.rotation.z = Math.PI / 2.5;
      }
    }

    // Update Traffic AI
    this.trafficManager.update(
      dt, 
      this.playerX, 
      this.playerZ, 
      speedKmh, 
      (event: NearMissEvent) => {
        this.totalNearMisses++;
        this.currentCoins += event.points;
        this.callbacks.onNearMiss(event);
      }
    );

    // Collision Detection
    const collision = this.trafficManager.checkCollisions(
      this.playerX, 
      this.playerZ, 
      1.9, 
      4.2
    );

    if (collision) {
      this.handleCrash(collision);
    }

    // Update Monsoon Rain particles
    if (this.rainParticles) {
      this.rainParticles.position.set(this.playerX, 0, this.playerZ);
      const pos = this.rainParticles.geometry.attributes.position.array as Float32Array;
      for (let i = 1; i < pos.length; i += 3) {
        pos[i] -= 35 * dt;
        if (pos[i] < 0) pos[i] = 25;
      }
      this.rainParticles.geometry.attributes.position.needsUpdate = true;
    }

    // Camera follow with smooth damping & shake
    const shakeX = (Math.random() - 0.5) * this.cameraShake * 0.3;
    const shakeY = (Math.random() - 0.5) * this.cameraShake * 0.3;

    const targetCamX = this.playerX + this.cameraOffset.x + shakeX;
    const targetCamY = this.cameraOffset.y + this.suspensionY + shakeY;
    const targetCamZ = this.playerZ + this.cameraOffset.z;

    this.camera.position.x = THREE.MathUtils.damp(this.camera.position.x, targetCamX, 10, dt);
    this.camera.position.y = THREE.MathUtils.damp(this.camera.position.y, targetCamY, 10, dt);
    this.camera.position.z = THREE.MathUtils.damp(this.camera.position.z, targetCamZ, 14, dt);

    const lookTarget = new THREE.Vector3(
      this.playerX + this.cameraLookOffset.x,
      this.cameraLookOffset.y,
      this.playerZ + this.cameraLookOffset.z
    );
    this.camera.lookAt(lookTarget);

    // Audio & HUD callbacks
    sounds.updateEngine(speedKmh, isAccelerating ? 1.0 : 0.0);

    const rpm = Math.floor(1000 + (speedKmh % 40) * 120);
    const gear = Math.min(5, Math.floor(speedKmh / 35) + 1);
    this.callbacks.onSpeedUpdate(Math.round(speedKmh), rpm, gear);
    this.callbacks.onDistanceUpdate(distanceKm, this.currentCoins);
    this.callbacks.onHealthUpdate(Math.max(0, this.currentHealth));
  }

  private handleCrash(traffic: TrafficEntity) {
    sounds.playCrash();
    this.cameraShake = 0.8;
    this.playerSpeedMs = Math.max(0, this.playerSpeedMs * 0.2);

    const damage = traffic.type === 'truck' || traffic.type === 'bus' ? 45 : 25;
    this.currentHealth -= damage;

    if (this.currentHealth <= 0) {
      this.currentHealth = 0;
      this.stop();
      this.callbacks.onGameOver(`Crashed into ${traffic.type.toUpperCase()} on Highway!`, {
        distance: parseFloat((this.distanceCoveredMeters / 1000).toFixed(2)),
        nearMisses: this.totalNearMisses,
        topSpeed: this.topSpeedRecorded,
        coins: this.currentCoins,
      });
    }
  }

  public dispose() {
    this.stop();
    window.removeEventListener('resize', this.onResize);
    this.roadSystem.dispose();
    this.trafficManager.dispose();
    this.removeRain();
    this.renderer.dispose();
    if (this.renderer.domElement.parentElement) {
      this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
    }
  }
}
