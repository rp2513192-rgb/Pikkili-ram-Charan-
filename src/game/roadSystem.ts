import * as THREE from 'three';
import { RoadProp } from '../types/game';
import { 
  createTollPlazaGateMesh, 
  createDhabaMesh, 
  createGulmoharTreeMesh, 
  createBanyanTreeMesh, 
  createMilestoneMesh, 
  createOverheadGantryMesh 
} from './proceduralModels';

export const LANE_WIDTH = 3.6; // standard Indian highway lane width in meters
export const NUM_LANES = 4; // 4 lanes (-5.4, -1.8, +1.8, +5.4)
export const ROAD_WIDTH = NUM_LANES * LANE_WIDTH; // 14.4m
export const SHOULDER_WIDTH = 3.5;
export const TOTAL_WIDTH = ROAD_WIDTH + SHOULDER_WIDTH * 2; // 21.4m
export const CHUNK_LENGTH = 120; // 120 meters per chunk
export const NUM_CHUNKS = 6; // Active chunks pool = 720m horizon

export function getLaneCenterX(laneIndex: number): number {
  // Lane 0: -5.4 (Far left)
  // Lane 1: -1.8 (Center left)
  // Lane 2: +1.8 (Center right)
  // Lane 3: +5.4 (Far right)
  return (laneIndex - 1.5) * LANE_WIDTH;
}

// Procedural Asphalt Road Texture with Indian Highway markings
export function createAsphaltTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Dark asphalt base with subtle aggregate noise
  ctx.fillStyle = '#262626';
  ctx.fillRect(0, 0, 512, 1024);

  // Subtle grain
  for (let i = 0; i < 20000; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 1024;
    const val = Math.random() > 0.5 ? 45 : 30;
    ctx.fillStyle = `rgb(${val}, ${val}, ${val})`;
    ctx.fillRect(x, y, 2, 2);
  }

  // Yellow shoulder edge lines
  ctx.fillStyle = '#eab308';
  ctx.fillRect(35, 0, 8, 1024); // Left edge line
  ctx.fillRect(469, 0, 8, 1024); // Right edge line

  // Median white solid line
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(254, 0, 5, 1024);

  // Dashed lane dividers
  const dashH = 50;
  const gapH = 45;
  const l1_X = 35 + (254 - 35) / 2;
  const l2_X = 254 + (469 - 254) / 2;

  ctx.fillStyle = '#f1f5f9';
  for (let y = 0; y < 1024; y += dashH + gapH) {
    ctx.fillRect(l1_X - 2, y, 4, dashH);
    ctx.fillRect(l2_X - 2, y, 4, dashH);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(1, 4);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Pothole decal texture
export function createPotholeTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 128;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.clearRect(0, 0, 128, 128);
  // Outer uneven cracked edge
  ctx.fillStyle = '#171717';
  ctx.beginPath();
  ctx.ellipse(64, 64, 52, 38, 0.2, 0, Math.PI * 2);
  ctx.fill();

  // Deep dark center
  ctx.fillStyle = '#0a0a0a';
  ctx.beginPath();
  ctx.ellipse(64, 64, 38, 26, 0.2, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export interface RoadChunk {
  group: THREE.Group;
  baseZ: number;
  props: RoadProp[];
  hasToll: boolean;
  tollBarrier?: THREE.Object3D;
  potholes: { x: number; z: number; radius: number }[];
}

export class RoadSystem {
  public chunks: RoadChunk[] = [];
  private scene: THREE.Scene;
  private roadMaterial: THREE.MeshStandardMaterial;
  private terrainMaterial: THREE.MeshStandardMaterial;
  private medianMaterial: THREE.MeshStandardMaterial;
  private potholeMaterial: THREE.MeshStandardMaterial;
  private currentDistanceKm: number = 0;
  private nextTollKm: number = 4.0; // Toll plaza every 4km

  constructor(scene: THREE.Scene) {
    this.scene = scene;

    const asphaltTex = createAsphaltTexture();
    this.roadMaterial = new THREE.MeshStandardMaterial({
      map: asphaltTex,
      roughness: 0.85,
      metalness: 0.1,
    });

    // Indian terrain: Dusty roadside soil / grassy verge
    this.terrainMaterial = new THREE.MeshStandardMaterial({
      color: 0x785638, // Warm reddish-brown Indian soil
      roughness: 0.95,
      metalness: 0.05,
    });

    // Concrete median divider with green bushes
    this.medianMaterial = new THREE.MeshStandardMaterial({
      color: 0x94a3b8,
      roughness: 0.7,
      metalness: 0.2,
    });

    const potTex = createPotholeTexture();
    this.potholeMaterial = new THREE.MeshStandardMaterial({
      map: potTex,
      transparent: true,
      roughness: 0.9,
    });

    this.initChunks();
  }

  private initChunks() {
    for (let i = 0; i < NUM_CHUNKS; i++) {
      const chunkZ = i * CHUNK_LENGTH;
      const chunk = this.buildChunk(chunkZ, i);
      this.chunks.push(chunk);
      this.scene.add(chunk.group);
    }
  }

  private buildChunk(zPos: number, chunkIndex: number): RoadChunk {
    const group = new THREE.Group();
    group.position.set(0, 0, zPos);

    const potholes: { x: number; z: number; radius: number }[] = [];
    const props: RoadProp[] = [];

    // 1. Road Surface Plane
    const roadGeo = new THREE.PlaneGeometry(ROAD_WIDTH, CHUNK_LENGTH);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMesh = new THREE.Mesh(roadGeo, this.roadMaterial);
    roadMesh.position.set(0, 0.02, CHUNK_LENGTH / 2);
    roadMesh.receiveShadow = true;
    group.add(roadMesh);

    // 2. Road Shoulders (Gravel / Dirt verge)
    const shoulderGeo = new THREE.PlaneGeometry(SHOULDER_WIDTH, CHUNK_LENGTH);
    shoulderGeo.rotateX(-Math.PI / 2);

    const leftShoulder = new THREE.Mesh(shoulderGeo, this.terrainMaterial);
    leftShoulder.position.set(-ROAD_WIDTH / 2 - SHOULDER_WIDTH / 2, 0.01, CHUNK_LENGTH / 2);
    leftShoulder.receiveShadow = true;

    const rightShoulder = new THREE.Mesh(shoulderGeo, this.terrainMaterial);
    rightShoulder.position.set(ROAD_WIDTH / 2 + SHOULDER_WIDTH / 2, 0.01, CHUNK_LENGTH / 2);
    rightShoulder.receiveShadow = true;
    group.add(leftShoulder, rightShoulder);

    // 3. Vast Landscape Terrain (extends far out on both sides, anti-void)
    const fieldGeo = new THREE.PlaneGeometry(120, CHUNK_LENGTH);
    fieldGeo.rotateX(-Math.PI / 2);

    const leftField = new THREE.Mesh(fieldGeo, this.terrainMaterial);
    leftField.position.set(-TOTAL_WIDTH / 2 - 60, 0, CHUNK_LENGTH / 2);
    const rightField = new THREE.Mesh(fieldGeo, this.terrainMaterial);
    rightField.position.set(TOTAL_WIDTH / 2 + 60, 0, CHUNK_LENGTH / 2);
    group.add(leftField, rightField);

    // 4. Central Concrete Median Barrier
    const medGeo = new THREE.BoxGeometry(0.5, 0.6, CHUNK_LENGTH);
    const median = new THREE.Mesh(medGeo, this.medianMaterial);
    median.position.set(0, 0.3, CHUNK_LENGTH / 2);
    group.add(median);

    // Flowering Nerium / Oleander bushes along median (signature Indian expressway feature)
    const bushGeo = new THREE.SphereGeometry(0.4, 6, 6);
    bushGeo.scale(1.0, 0.8, 1.2);
    const bushMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.9 });
    for (let bz = 10; bz < CHUNK_LENGTH; bz += 15) {
      const bush = new THREE.Mesh(bushGeo, bushMat);
      bush.position.set(0, 0.65, bz);
      group.add(bush);
    }

    // 5. Check if Toll Plaza should spawn on this chunk
    let hasToll = false;
    let tollBarrier: THREE.Object3D | undefined;

    // Check distance for toll
    const chunkDistKm = (zPos + CHUNK_LENGTH / 2) / 1000;
    if (chunkDistKm > 0 && Math.abs(chunkDistKm - this.nextTollKm) < (CHUNK_LENGTH / 2000)) {
      hasToll = true;
      this.nextTollKm += 5.0; // Next toll in 5km

      const tollMesh = createTollPlazaGateMesh();
      tollMesh.position.set(0, 0, CHUNK_LENGTH / 2);
      group.add(tollMesh);
      tollBarrier = tollMesh.getObjectByName('toll_barrier_arm') || undefined;
    }

    // 6. Milestone every ~1 km
    if (chunkIndex % 8 === 0 && !hasToll) {
      const currentKm = Math.max(1, Math.floor(zPos / 1000));
      const targetKm = Math.max(10, 150 - currentKm);
      const stone = createMilestoneMesh('NH 44', 'DELHI', targetKm);
      stone.position.set(ROAD_WIDTH / 2 + 1.2, 0, 20);
      group.add(stone);
    }

    // 7. Roadside Dhaba or Chai Tapri
    if (chunkIndex % 6 === 2 && !hasToll) {
      const dhaba = createDhabaMesh();
      dhaba.position.set(-ROAD_WIDTH / 2 - 8, 0, CHUNK_LENGTH / 2);
      group.add(dhaba);
    }

    // 8. Overhead Highway Gantry Sign
    if (chunkIndex % 12 === 5 && !hasToll) {
      const gantry = createOverheadGantryMesh('NH-44 EXPRESSWAY • TOLL AHEAD', 'WELCOME TO RAJASTHAN');
      gantry.position.set(0, 0, 40);
      group.add(gantry);
    }

    // 9. Roadside Banyan & Gulmohar Trees
    for (let tz = 12; tz < CHUNK_LENGTH; tz += 28) {
      const isGulmohar = Math.random() > 0.5;
      const tree = isGulmohar ? createGulmoharTreeMesh() : createBanyanTreeMesh();
      const side = Math.random() > 0.5 ? 1 : -1;
      const xPos = side * (ROAD_WIDTH / 2 + 5 + Math.random() * 8);
      tree.position.set(xPos, 0, tz);
      group.add(tree);
    }

    // 10. Random Potholes (Occasional realistic Indian highway bump)
    if (Math.random() < 0.4 && !hasToll) {
      const potLane = Math.floor(Math.random() * 4);
      const potX = getLaneCenterX(potLane) + (Math.random() * 0.8 - 0.4);
      const potZ = 20 + Math.random() * (CHUNK_LENGTH - 40);

      const potGeo = new THREE.PlaneGeometry(1.6, 1.6);
      potGeo.rotateX(-Math.PI / 2);
      const potMesh = new THREE.Mesh(potGeo, this.potholeMaterial);
      potMesh.position.set(potX, 0.03, potZ);
      group.add(potMesh);

      potholes.push({ x: potX, z: zPos + potZ, radius: 0.9 });
    }

    return {
      group,
      baseZ: zPos,
      props,
      hasToll,
      tollBarrier,
      potholes,
    };
  }

  // Update chunks relative to player's Z position
  public update(playerZ: number) {
    this.currentDistanceKm = playerZ / 1000;

    // Check if the oldest chunk is far behind player
    for (let i = 0; i < this.chunks.length; i++) {
      const chunk = this.chunks[i];
      if (chunk.baseZ + CHUNK_LENGTH < playerZ - 30) {
        // Find maximum baseZ currently
        let maxZ = -Infinity;
        for (const c of this.chunks) {
          if (c.baseZ > maxZ) maxZ = c.baseZ;
        }

        // Recycle chunk to front
        const newZ = maxZ + CHUNK_LENGTH;
        this.scene.remove(chunk.group);
        // Clean up group
        chunk.group.clear();

        const newChunkIndex = Math.round(newZ / CHUNK_LENGTH);
        const recycled = this.buildChunk(newZ, newChunkIndex);
        this.chunks[i] = recycled;
        this.scene.add(recycled.group);
      }
    }
  }

  public getPotholes(): { x: number; z: number; radius: number }[] {
    const all: { x: number; z: number; radius: number }[] = [];
    for (const c of this.chunks) {
      all.push(...c.potholes);
    }
    return all;
  }

  public getActiveToll(playerZ: number): RoadChunk | null {
    for (const c of this.chunks) {
      if (c.hasToll && Math.abs((c.baseZ + CHUNK_LENGTH / 2) - playerZ) < 50) {
        return c;
      }
    }
    return null;
  }

  public dispose() {
    for (const c of this.chunks) {
      this.scene.remove(c.group);
      c.group.clear();
    }
    this.chunks = [];
  }
}
