import * as THREE from 'three';
import { TrafficVehicleType } from '../types/game';

// Helper to create sharp procedural canvas texture
export function createTruckRearTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  // Background - painted wooden truck panel
  ctx.fillStyle = '#b91c1c'; // Deep truck red
  ctx.fillRect(0, 0, 512, 256);

  // Decorative border
  ctx.strokeStyle = '#facc15'; // Bright yellow
  ctx.lineWidth = 8;
  ctx.strokeRect(10, 10, 492, 236);

  // Inner border
  ctx.strokeStyle = '#22c55e'; // Green
  ctx.lineWidth = 4;
  ctx.strokeRect(20, 20, 472, 216);

  // Top banner: "BURI NAZAR WALE TERA MOOH KALA"
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('• BURI NAZAR WALE TERA MOOH KALA •', 256, 48);

  // Central iconic: "HORN  OK  PLEASE"
  ctx.fillStyle = '#ffffff';
  ctx.font = '900 52px sans-serif';
  ctx.fillText('HORN', 110, 125);

  // "OK" in a yellow badge
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.ellipse(256, 110, 45, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#000000';
  ctx.lineWidth = 3;
  ctx.stroke();

  ctx.fillStyle = '#000000';
  ctx.font = '900 36px sans-serif';
  ctx.fillText('OK', 256, 122);

  ctx.fillStyle = '#ffffff';
  ctx.font = '900 52px sans-serif';
  ctx.fillText('PLEASE', 400, 125);

  // Bottom tagline: "USE DIPPER AT NIGHT"
  ctx.fillStyle = '#38bdf8'; // Sky blue
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText('USE DIPPER AT NIGHT', 256, 185);

  // Mudflap text: "STOP" & floral motifs
  ctx.fillStyle = '#e2e8f0';
  ctx.font = 'bold 18px monospace';
  ctx.fillText('ALL INDIA PERMIT • TATA 1618', 256, 222);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createMilestoneTexture(highway: string, city: string, km: number): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  // Top yellow dome (indicates National Highway in India)
  ctx.fillStyle = '#eab308';
  ctx.beginPath();
  ctx.arc(128, 128, 120, Math.PI, 0, false);
  ctx.fill();

  // Highway code
  ctx.fillStyle = '#000000';
  ctx.font = 'bold 42px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(highway, 128, 115);

  // Lower white body
  ctx.fillStyle = '#f8fafc';
  ctx.fillRect(8, 128, 240, 370);

  // City and distance
  ctx.fillStyle = '#0f172a';
  ctx.font = 'bold 36px sans-serif';
  ctx.fillText(city.toUpperCase(), 128, 240);

  ctx.font = '900 72px sans-serif';
  ctx.fillText(`${km}`, 128, 340);

  ctx.font = 'bold 28px sans-serif';
  ctx.fillText('KM', 128, 390);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createBusDestinationTexture(text: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 128;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, 512, 128);

  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 6;
  ctx.strokeRect(4, 4, 504, 120);

  ctx.fillStyle = '#facc15';
  ctx.font = 'bold 38px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text, 256, 75);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

export function createOverheadSignTexture(text1: string, text2: string): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 320;
  const ctx = canvas.getContext('2d')!;

  // Indian Highway Green Signboard
  ctx.fillStyle = '#15803d'; // Highway green
  ctx.fillRect(0, 0, 1024, 320);

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 14;
  ctx.strokeRect(15, 15, 994, 290);

  // Line 1
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 54px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(text1, 512, 110);

  // Line 2
  ctx.fillStyle = '#fef08a';
  ctx.font = 'bold 48px sans-serif';
  ctx.fillText(text2, 512, 195);

  // Fastag badge / lane arrows
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 36px monospace';
  ctx.fillText('⬇ FASTag LANE ⬇   ⬇ SPEED LIMIT 80 ⬇', 512, 265);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Common wheel generator
function createWheel(radius: number, width: number, isAlloy: boolean = false): THREE.Group {
  const wheelGroup = new THREE.Group();

  // Tire rubber
  const tireGeo = new THREE.CylinderGeometry(radius, radius, width, 18);
  tireGeo.rotateZ(Math.PI / 2);
  const tireMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a,
    roughness: 0.9,
    metalness: 0.1,
  });
  const tire = new THREE.Mesh(tireGeo, tireMat);
  wheelGroup.add(tire);

  // Rim
  const rimGeo = new THREE.CylinderGeometry(radius * 0.65, radius * 0.65, width + 0.02, 14);
  rimGeo.rotateZ(Math.PI / 2);
  const rimMat = new THREE.MeshStandardMaterial({
    color: isAlloy ? 0xd1d5db : 0x475569,
    roughness: isAlloy ? 0.2 : 0.6,
    metalness: isAlloy ? 0.85 : 0.4,
  });
  const rim = new THREE.Mesh(rimGeo, rimMat);
  wheelGroup.add(rim);

  // Hub cap center
  const hubGeo = new THREE.CylinderGeometry(radius * 0.25, radius * 0.25, width + 0.04, 10);
  hubGeo.rotateZ(Math.PI / 2);
  const hubMat = new THREE.MeshStandardMaterial({
    color: 0x94a3b8,
    roughness: 0.3,
    metalness: 0.9,
  });
  const hub = new THREE.Mesh(hubGeo, hubMat);
  wheelGroup.add(hub);

  return wheelGroup;
}

// ----------------------------------------------------
// 1. TATA 1618 INDIAN TRUCK ("Horn OK Please")
// Composite 12+ part procedural model
// ----------------------------------------------------
export function createIndianTruckMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'indian_truck';

  // 1. Heavy Chassis frame
  const chassisGeo = new THREE.BoxGeometry(2.3, 0.4, 7.8);
  const chassisMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8, metalness: 0.5 });
  const chassis = new THREE.Mesh(chassisGeo, chassisMat);
  chassis.position.y = 0.8;
  group.add(chassis);

  // 2. Cabin (Iconic painted metal & wood with yellow/orange/green)
  const cabinGeo = new THREE.BoxGeometry(2.35, 2.0, 2.2);
  const cabinMat = new THREE.MeshStandardMaterial({ color: 0xca8a04, roughness: 0.4, metalness: 0.3 }); // Ochre yellow
  const cabin = new THREE.Mesh(cabinGeo, cabinMat);
  cabin.position.set(0, 1.9, 2.7);
  group.add(cabin);

  // 3. Cabin Crown / Sun Visor with ornate peak
  const crownGeo = new THREE.BoxGeometry(2.4, 0.5, 0.8);
  const crownMat = new THREE.MeshStandardMaterial({ color: 0x16a34a, roughness: 0.4, metalness: 0.2 }); // Green top crown
  const crown = new THREE.Mesh(crownGeo, crownMat);
  crown.position.set(0, 2.95, 3.1);
  group.add(crown);

  // 4. Windshield glass
  const glassGeo = new THREE.BoxGeometry(2.1, 0.8, 0.05);
  const glassMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.8 });
  const glass = new THREE.Mesh(glassGeo, glassMat);
  glass.position.set(0, 2.1, 3.82);
  group.add(glass);

  // 5. Front Ornate Chrome Grille
  const grilleGeo = new THREE.BoxGeometry(1.6, 0.7, 0.1);
  const grilleMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 });
  const grille = new THREE.Mesh(grilleGeo, grilleMat);
  grille.position.set(0, 1.25, 3.82);
  group.add(grille);

  // 6. Round Headlights
  const hlGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.1, 12);
  hlGeo.rotateX(Math.PI / 2);
  const hlMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, roughness: 0.1, metalness: 0.9, emissive: 0xfef08a, emissiveIntensity: 0.5 });
  const leftHl = new THREE.Mesh(hlGeo, hlMat);
  leftHl.position.set(-0.85, 1.2, 3.85);
  const rightHl = new THREE.Mesh(hlGeo, hlMat);
  rightHl.position.set(0.85, 1.2, 3.85);
  group.add(leftHl, rightHl);

  // 7. Roof Air Horns (Twin Trumpets)
  const hornGeo = new THREE.CylinderGeometry(0.08, 0.03, 0.7, 8);
  hornGeo.rotateX(Math.PI / 2);
  const hornMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2, metalness: 0.9 });
  const leftHorn = new THREE.Mesh(hornGeo, hornMat);
  leftHorn.position.set(-0.5, 3.1, 2.7);
  const rightHorn = new THREE.Mesh(hornGeo, hornMat);
  rightHorn.position.set(0.5, 3.1, 2.7);
  group.add(leftHorn, rightHorn);

  // 8. Heavy Wooden Cargo Box Body (slatted wooden sides)
  const cargoGeo = new THREE.BoxGeometry(2.4, 1.8, 5.2);
  const cargoMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.6, metalness: 0.2 }); // Sky blue body
  const cargo = new THREE.Mesh(cargoGeo, cargoMat);
  cargo.position.set(0, 1.9, -1.1);
  group.add(cargo);

  // 9. Cargo Load (Tarpaulin covered sacks/timber)
  const loadGeo = new THREE.BoxGeometry(2.3, 0.9, 4.9);
  const loadMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.9, metalness: 0.1 });
  const load = new THREE.Mesh(loadGeo, loadMat);
  load.position.set(0, 2.85, -1.1);
  group.add(load);

  // 10. Iconic Rear Mudflap / Tailgate ("HORN OK PLEASE")
  const rearTex = createTruckRearTexture();
  const rearMat = new THREE.MeshStandardMaterial({ map: rearTex, roughness: 0.5, metalness: 0.2 });
  const rearPlateGeo = new THREE.PlaneGeometry(2.36, 1.4);
  rearPlateGeo.rotateY(Math.PI);
  const rearPlate = new THREE.Mesh(rearPlateGeo, rearMat);
  rearPlate.position.set(0, 1.6, -3.72);
  group.add(rearPlate);

  // 11. Heavy Wheels (Front 2, Rear 4 double axles)
  const wheelR = 0.55;
  const wheelW = 0.35;
  const frontLeftW = createWheel(wheelR, wheelW);
  frontLeftW.position.set(-1.18, wheelR, 2.6);
  const frontRightW = createWheel(wheelR, wheelW);
  frontRightW.position.set(1.18, wheelR, 2.6);

  const midLeftW = createWheel(wheelR, wheelW);
  midLeftW.position.set(-1.18, wheelR, -1.8);
  const midRightW = createWheel(wheelR, wheelW);
  midRightW.position.set(1.18, wheelR, -1.8);

  const rearLeftW = createWheel(wheelR, wheelW);
  rearLeftW.position.set(-1.18, wheelR, -3.0);
  const rearRightW = createWheel(wheelR, wheelW);
  rearRightW.position.set(1.18, wheelR, -3.0);

  group.add(frontLeftW, frontRightW, midLeftW, midRightW, rearLeftW, rearRightW);

  // 12. Exhaust Pipe (vertical stack with soot)
  const exhaustGeo = new THREE.CylinderGeometry(0.06, 0.06, 2.2, 8);
  const exhaustMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.7, metalness: 0.7 });
  const exhaust = new THREE.Mesh(exhaustGeo, exhaustMat);
  exhaust.position.set(1.22, 2.1, 1.4);
  group.add(exhaust);

  return group;
}

// ----------------------------------------------------
// 2. BAJAJ AUTO-RICKSHAW (Tuk-Tuk)
// Iconic Indian 3-wheeler with yellow roof and green body
// ----------------------------------------------------
export function createAutoRickshawMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'auto_rickshaw';

  // 1. Lower Body Chassis (Classic CNG Green)
  const lowerGeo = new THREE.BoxGeometry(1.4, 0.75, 2.5);
  const lowerMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4, metalness: 0.3 });
  const lower = new THREE.Mesh(lowerGeo, lowerMat);
  lower.position.set(0, 0.65, 0);
  group.add(lower);

  // 2. Yellow Canvas Canopy / Roof
  const roofGeo = new THREE.BoxGeometry(1.42, 0.8, 2.2);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xfacc15, roughness: 0.8, metalness: 0.1 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 1.4, -0.1);
  group.add(roof);

  // 3. Tapered Front Nose
  const noseGeo = new THREE.ConeGeometry(0.7, 0.9, 4);
  noseGeo.rotateX(-Math.PI / 2);
  const noseMat = new THREE.MeshStandardMaterial({ color: 0x15803d, roughness: 0.4, metalness: 0.3 });
  const nose = new THREE.Mesh(noseGeo, noseMat);
  nose.position.set(0, 0.7, 1.35);
  group.add(nose);

  // 4. Windshield Glass
  const wsGeo = new THREE.PlaneGeometry(1.1, 0.65);
  const wsMat = new THREE.MeshStandardMaterial({ color: 0x93c5fd, roughness: 0.1, metalness: 0.9, transparent: true, opacity: 0.8 });
  const ws = new THREE.Mesh(wsGeo, wsMat);
  ws.position.set(0, 1.35, 0.96);
  ws.rotateX(-0.2);
  group.add(ws);

  // 5. Driver Handlebar & Meter
  const barGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.8, 8);
  barGeo.rotateZ(Math.PI / 2);
  const barMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.4, metalness: 0.8 });
  const bar = new THREE.Mesh(barGeo, barMat);
  bar.position.set(0, 0.95, 0.75);
  group.add(bar);

  // Fare meter box
  const meterGeo = new THREE.BoxGeometry(0.18, 0.14, 0.12);
  const meterMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.3, metalness: 0.6 });
  const meter = new THREE.Mesh(meterGeo, meterMat);
  meter.position.set(0.35, 1.05, 0.8);
  group.add(meter);

  // 6. Passenger Back Seat
  const seatGeo = new THREE.BoxGeometry(1.25, 0.45, 0.8);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9, metalness: 0.05 });
  const seat = new THREE.Mesh(seatGeo, seatMat);
  seat.position.set(0, 0.7, -0.6);
  group.add(seat);

  // 7. Single Front Wheel with fork
  const fWheel = createWheel(0.28, 0.16);
  fWheel.position.set(0, 0.28, 1.15);
  group.add(fWheel);

  // 8. Double Rear Wheels
  const rWheelL = createWheel(0.3, 0.18);
  rWheelL.position.set(-0.68, 0.3, -0.8);
  const rWheelR = createWheel(0.3, 0.18);
  rWheelR.position.set(0.68, 0.3, -0.8);
  group.add(rWheelL, rWheelR);

  // 9. Single Round Headlight
  const hlGeo = new THREE.CylinderGeometry(0.12, 0.12, 0.08, 12);
  hlGeo.rotateX(Math.PI / 2);
  const hlMat = new THREE.MeshStandardMaterial({ color: 0xffedd5, emissive: 0xfef08a, emissiveIntensity: 0.7 });
  const hl = new THREE.Mesh(hlGeo, hlMat);
  hl.position.set(0, 0.65, 1.6);
  group.add(hl);

  // 10. Spare Wheel on rear
  const spare = createWheel(0.26, 0.14);
  spare.rotation.y = Math.PI / 2;
  spare.position.set(0, 0.7, -1.3);
  group.add(spare);

  return group;
}

// ----------------------------------------------------
// 3. DESI COMMUTER MOTORCYCLE (150cc Hero/Bajaj style)
// ----------------------------------------------------
export function createMotorcycleMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'motorcycle';

  // Frame & Engine Block
  const engGeo = new THREE.BoxGeometry(0.35, 0.4, 0.7);
  const engMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4, metalness: 0.8 });
  const eng = new THREE.Mesh(engGeo, engMat);
  eng.position.set(0, 0.55, 0);
  group.add(eng);

  // Fuel Tank (Glossy Indian Red/Blue)
  const tankGeo = new THREE.SphereGeometry(0.32, 12, 8);
  tankGeo.scale(1.0, 0.8, 1.8);
  const tankMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, roughness: 0.2, metalness: 0.6 });
  const tank = new THREE.Mesh(tankGeo, tankMat);
  tank.position.set(0, 0.85, 0.25);
  group.add(tank);

  // Long Commuter Seat
  const seatGeo = new THREE.BoxGeometry(0.32, 0.15, 0.95);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.9, metalness: 0.1 });
  const seat = new THREE.Mesh(seatGeo, seatMat);
  seat.position.set(0, 0.88, -0.4);
  group.add(seat);

  // Handlebars
  const hbGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.75, 8);
  hbGeo.rotateZ(Math.PI / 2);
  const hbMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, roughness: 0.2, metalness: 0.9 });
  const hb = new THREE.Mesh(hbGeo, hbMat);
  hb.position.set(0, 1.05, 0.6);
  group.add(hb);

  // Round Headlight
  const hlGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.06, 12);
  hlGeo.rotateX(Math.PI / 2);
  const hlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffedd5, emissiveIntensity: 0.8 });
  const hl = new THREE.Mesh(hlGeo, hlMat);
  hl.position.set(0, 0.95, 0.85);
  group.add(hl);

  // Wheels (Front & Rear Spoke Wheels)
  const fW = createWheel(0.35, 0.1, true);
  fW.position.set(0, 0.35, 0.85);
  const rW = createWheel(0.35, 0.12, true);
  rW.position.set(0, 0.35, -0.85);
  group.add(fW, rW);

  // Rider Figure (Desi Commuter with Helmet)
  const riderGroup = new THREE.Group();
  // Torso
  const torsoGeo = new THREE.BoxGeometry(0.38, 0.55, 0.3);
  const torsoMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, roughness: 0.8 }); // Blue shirt
  const torso = new THREE.Mesh(torsoGeo, torsoMat);
  torso.position.set(0, 1.25, -0.15);
  riderGroup.add(torso);

  // Helmet Head
  const headGeo = new THREE.SphereGeometry(0.18, 12, 10);
  const headMat = new THREE.MeshStandardMaterial({ color: 0xf97316, roughness: 0.3, metalness: 0.4 }); // Orange helmet
  const head = new THREE.Mesh(headGeo, headMat);
  head.position.set(0, 1.65, -0.12);
  riderGroup.add(head);

  group.add(riderGroup);

  return group;
}

// ----------------------------------------------------
// 4. STATE ROADWAYS BUS ("Lal Dabba" Express Bus)
// ----------------------------------------------------
export function createIndianBusMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'indian_bus';

  // Chassis
  const chGeo = new THREE.BoxGeometry(2.5, 0.4, 9.8);
  const chMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8 });
  const ch = new THREE.Mesh(chGeo, chMat);
  ch.position.y = 0.7;
  group.add(ch);

  // Bus Lower Body (Deep Red / Maroon)
  const bodyGeo = new THREE.BoxGeometry(2.5, 1.8, 9.6);
  const bodyMat = new THREE.MeshStandardMaterial({ color: 0x991b1b, roughness: 0.4, metalness: 0.3 });
  const body = new THREE.Mesh(bodyGeo, bodyMat);
  body.position.set(0, 1.8, 0);
  group.add(body);

  // Cream Upper Roof
  const roofGeo = new THREE.BoxGeometry(2.52, 0.6, 9.62);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0xfef08a, roughness: 0.5, metalness: 0.2 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 2.9, 0);
  group.add(roof);

  // Destination Board (Front)
  const destTex = createBusDestinationTexture('DELHI ➜ JAIPUR EXP');
  const destMat = new THREE.MeshStandardMaterial({ map: destTex, roughness: 0.2 });
  const destGeo = new THREE.PlaneGeometry(1.8, 0.45);
  const dest = new THREE.Mesh(destGeo, destMat);
  dest.position.set(0, 2.95, 4.83);
  group.add(dest);

  // Roof Luggage Rack with Tarpaulin wrapped bags
  const rackGeo = new THREE.BoxGeometry(2.2, 0.2, 5.0);
  const rackMat = new THREE.MeshStandardMaterial({ color: 0x475569, metalness: 0.8 });
  const rack = new THREE.Mesh(rackGeo, rackMat);
  rack.position.set(0, 3.25, -1.0);
  group.add(rack);

  // Luggage parcels
  const lugGeo = new THREE.BoxGeometry(1.9, 0.5, 4.4);
  const lugMat = new THREE.MeshStandardMaterial({ color: 0x065f46, roughness: 0.9 }); // Green tarpaulin
  const lug = new THREE.Mesh(lugGeo, lugMat);
  lug.position.set(0, 3.55, -1.0);
  group.add(lug);

  // Windshield
  const wsGeo = new THREE.BoxGeometry(2.3, 0.9, 0.05);
  const wsMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8, roughness: 0.1, metalness: 0.8, transparent: true, opacity: 0.75 });
  const ws = new THREE.Mesh(wsGeo, wsMat);
  ws.position.set(0, 2.1, 4.83);
  group.add(ws);

  // Wheels (Front 2, Rear 4)
  const wR = 0.52;
  const wW = 0.35;
  const fL = createWheel(wR, wW);
  fL.position.set(-1.26, wR, 3.2);
  const fR = createWheel(wR, wW);
  fR.position.set(1.26, wR, 3.2);

  const rL1 = createWheel(wR, wW);
  rL1.position.set(-1.26, wR, -2.8);
  const rR1 = createWheel(wR, wW);
  rR1.position.set(1.26, wR, -2.8);

  group.add(fL, fR, rL1, rR1);

  return group;
}

// ----------------------------------------------------
// 5. SWARAJ TRACTOR WITH SUGARCANE TROLLEY
// ----------------------------------------------------
export function createTractorMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'indian_tractor';

  // Tractor Body (Desi Tractor Blue/Green)
  const hoodGeo = new THREE.BoxGeometry(1.3, 0.9, 2.2);
  const hoodMat = new THREE.MeshStandardMaterial({ color: 0x1d4ed8, roughness: 0.4, metalness: 0.4 });
  const hood = new THREE.Mesh(hoodGeo, hoodMat);
  hood.position.set(0, 1.0, 0.8);
  group.add(hood);

  // Tall Exhaust Pipe
  const exGeo = new THREE.CylinderGeometry(0.05, 0.05, 1.6, 8);
  const exMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.6, metalness: 0.7 });
  const ex = new THREE.Mesh(exGeo, exMat);
  ex.position.set(0.55, 1.9, 1.1);
  group.add(ex);

  // Driver Seat & Steering
  const seatGeo = new THREE.BoxGeometry(0.7, 0.3, 0.5);
  const seatMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.9 });
  const seat = new THREE.Mesh(seatGeo, seatMat);
  seat.position.set(0, 1.25, -0.4);
  group.add(seat);

  // Giant Rear Tires
  const rTireL = createWheel(0.75, 0.45);
  rTireL.position.set(-0.85, 0.75, -0.4);
  const rTireR = createWheel(0.75, 0.45);
  rTireR.position.set(0.85, 0.75, -0.4);

  // Small Front Tires
  const fTireL = createWheel(0.4, 0.25);
  fTireL.position.set(-0.72, 0.4, 1.5);
  const fTireR = createWheel(0.4, 0.25);
  fTireR.position.set(0.72, 0.4, 1.5);

  group.add(rTireL, rTireR, fTireL, fTireR);

  // Attached Sugarcane Trolley
  const trolleyGroup = new THREE.Group();
  trolleyGroup.position.set(0, 0, -3.8);

  const trailerBoxGeo = new THREE.BoxGeometry(2.1, 1.2, 4.0);
  const trailerBoxMat = new THREE.MeshStandardMaterial({ color: 0xb45309, roughness: 0.8 }); // Wooden trailer
  const trailerBox = new THREE.Mesh(trailerBoxGeo, trailerBoxMat);
  trailerBox.position.set(0, 1.2, 0);
  trolleyGroup.add(trailerBox);

  // Sugarcane stalks pile sticking out
  const caneGeo = new THREE.CylinderGeometry(0.9, 1.0, 4.2, 12);
  caneGeo.rotateX(Math.PI / 2);
  const caneMat = new THREE.MeshStandardMaterial({ color: 0x65a30d, roughness: 0.9 }); // Sugarcane green/yellow
  const cane = new THREE.Mesh(caneGeo, caneMat);
  cane.position.set(0, 2.0, 0);
  trolleyGroup.add(cane);

  // Trailer wheels
  const tWheelL = createWheel(0.55, 0.3);
  tWheelL.position.set(-1.1, 0.55, -0.4);
  const tWheelR = createWheel(0.55, 0.3);
  tWheelR.position.set(1.1, 0.55, -0.4);
  trolleyGroup.add(tWheelL, tWheelR);

  group.add(trolleyGroup);

  return group;
}

// ----------------------------------------------------
// 6. INDIAN ZEBU COW (Gau Mata)
// Distinctive hump, horns, calm posture
// ----------------------------------------------------
export function createIndianCowMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'holy_cow';

  const bodyMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.9 }); // White Indian Cow

  // Main Torso
  const torsoGeo = new THREE.BoxGeometry(0.8, 0.85, 1.7);
  const torso = new THREE.Mesh(torsoGeo, bodyMat);
  torso.position.set(0, 0.95, 0);
  group.add(torso);

  // Distinctive Indian Zebu Hump
  const humpGeo = new THREE.SphereGeometry(0.3, 10, 8);
  humpGeo.scale(0.8, 1.2, 0.9);
  const hump = new THREE.Mesh(humpGeo, bodyMat);
  hump.position.set(0, 1.5, 0.45);
  group.add(hump);

  // Cow Head & Snout
  const headGeo = new THREE.BoxGeometry(0.42, 0.48, 0.65);
  const head = new THREE.Mesh(headGeo, bodyMat);
  head.position.set(0, 1.35, 0.95);
  group.add(head);

  // Curved Horns
  const hornMat = new THREE.MeshStandardMaterial({ color: 0x334155, roughness: 0.4 });
  const hornGeo = new THREE.ConeGeometry(0.06, 0.45, 6);
  const leftHorn = new THREE.Mesh(hornGeo, hornMat);
  leftHorn.position.set(-0.25, 1.7, 0.85);
  leftHorn.rotateZ(0.4);
  const rightHorn = new THREE.Mesh(hornGeo, hornMat);
  rightHorn.position.set(0.25, 1.7, 0.85);
  rightHorn.rotateZ(-0.4);
  group.add(leftHorn, rightHorn);

  // 4 Legs
  const legGeo = new THREE.CylinderGeometry(0.08, 0.08, 0.8, 8);
  const flLeg = new THREE.Mesh(legGeo, bodyMat);
  flLeg.position.set(-0.3, 0.4, 0.6);
  const frLeg = new THREE.Mesh(legGeo, bodyMat);
  frLeg.position.set(0.3, 0.4, 0.6);
  const blLeg = new THREE.Mesh(legGeo, bodyMat);
  blLeg.position.set(-0.3, 0.4, -0.6);
  const brLeg = new THREE.Mesh(legGeo, bodyMat);
  brLeg.position.set(0.3, 0.4, -0.6);
  group.add(flLeg, frLeg, blLeg, brLeg);

  // Bell collar around neck
  const collarGeo = new THREE.TorusGeometry(0.25, 0.04, 6, 12);
  const collarMat = new THREE.MeshStandardMaterial({ color: 0xf59e0b, metalness: 0.8 });
  const collar = new THREE.Mesh(collarGeo, collarMat);
  collar.position.set(0, 1.15, 0.75);
  collar.rotateX(Math.PI / 4);
  group.add(collar);

  return group;
}

// ----------------------------------------------------
// 7. PLAYER CARS (Hatchback, Ambassador, Thar 4x4, GT)
// ----------------------------------------------------
export function createPlayerCarMesh(carId: string, customColor: string): THREE.Group {
  const group = new THREE.Group();
  group.name = `player_car_${carId}`;

  const hexColor = parseInt(customColor.replace('#', '0x'), 16);

  if (carId === 'ambassador') {
    // Classic Ambassador - Curvaceous iconic Indian VIP Sedan
    const bodyGeo = new THREE.BoxGeometry(2.0, 0.7, 4.4);
    const bodyMat = new THREE.MeshStandardMaterial({ color: hexColor, roughness: 0.25, metalness: 0.5 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0.65, 0);
    group.add(body);

    // Domed Cabin
    const cabinGeo = new THREE.BoxGeometry(1.8, 0.68, 2.2);
    const cabin = new THREE.Mesh(cabinGeo, bodyMat);
    cabin.position.set(0, 1.25, -0.2);
    group.add(cabin);

    // Chrome rounded grille
    const grGeo = new THREE.BoxGeometry(1.5, 0.45, 0.1);
    const grMat = new THREE.MeshStandardMaterial({ color: 0xf8fafc, roughness: 0.1, metalness: 0.95 });
    const gr = new THREE.Mesh(grGeo, grMat);
    gr.position.set(0, 0.65, 2.21);
    group.add(gr);

    // Round Vintage Headlights
    const hlGeo = new THREE.CylinderGeometry(0.18, 0.18, 0.08, 12);
    hlGeo.rotateX(Math.PI / 2);
    const hlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xfef08a, emissiveIntensity: 0.8 });
    const lHl = new THREE.Mesh(hlGeo, hlMat);
    lHl.position.set(-0.7, 0.7, 2.22);
    const rHl = new THREE.Mesh(hlGeo, hlMat);
    rHl.position.set(0.7, 0.7, 2.22);
    group.add(lHl, rHl);

    // VIP Lal Batti (Red flashing roof beacon)
    const beaconGeo = new THREE.CylinderGeometry(0.12, 0.14, 0.18, 10);
    const beaconMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xdc2626, emissiveIntensity: 1.2 });
    const beacon = new THREE.Mesh(beaconGeo, beaconMat);
    beacon.position.set(0, 1.68, 0.1);
    beacon.name = 'vip_beacon';
    group.add(beacon);

    // Wheels
    const wR = 0.38;
    const wW = 0.24;
    const fL = createWheel(wR, wW, true);
    fL.position.set(-1.0, wR, 1.35);
    const fR = createWheel(wR, wW, true);
    fR.position.set(1.0, wR, 1.35);
    const rL = createWheel(wR, wW, true);
    rL.position.set(-1.0, wR, -1.35);
    const rR = createWheel(wR, wW, true);
    rR.position.set(1.0, wR, -1.35);
    group.add(fL, fR, rL, rR);

  } else if (carId === 'thar') {
    // Rugged Indian 4x4 Offroader
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.85, 4.2);
    const bodyMat = new THREE.MeshStandardMaterial({ color: hexColor, roughness: 0.35, metalness: 0.4 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0.9, 0);
    group.add(body);

    // Cabin Box
    const cabinGeo = new THREE.BoxGeometry(1.95, 0.85, 2.4);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x1f2937, roughness: 0.8, metalness: 0.2 }); // Black hard top
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.7, -0.4);
    group.add(cabin);

    // Roof Carrier Rack
    const rackGeo = new THREE.BoxGeometry(1.8, 0.15, 2.2);
    const rackMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.3, metalness: 0.9 });
    const rack = new THREE.Mesh(rackGeo, rackMat);
    rack.position.set(0, 2.2, -0.4);
    group.add(rack);

    // Front Bullbar
    const barGeo = new THREE.BoxGeometry(1.8, 0.45, 0.2);
    const barMat = new THREE.MeshStandardMaterial({ color: 0x111827, roughness: 0.5, metalness: 0.8 });
    const bar = new THREE.Mesh(barGeo, barMat);
    bar.position.set(0, 0.85, 2.2);
    group.add(bar);

    // Spare wheel mounted on rear door
    const spare = createWheel(0.48, 0.28);
    spare.position.set(0, 1.1, -2.25);
    group.add(spare);

    // Big Knobby All-Terrain Wheels
    const wR = 0.48;
    const wW = 0.32;
    const fL = createWheel(wR, wW);
    fL.position.set(-1.12, wR, 1.35);
    const fR = createWheel(wR, wW);
    fR.position.set(1.12, wR, 1.35);
    const rL = createWheel(wR, wW);
    rL.position.set(-1.12, wR, -1.35);
    const rR = createWheel(wR, wW);
    rR.position.set(1.12, wR, -1.35);
    group.add(fL, fR, rL, rR);

  } else if (carId === 'gt') {
    // Grand GT Highway Beast
    const bodyGeo = new THREE.BoxGeometry(2.1, 0.5, 4.6);
    const bodyMat = new THREE.MeshStandardMaterial({ color: hexColor, roughness: 0.15, metalness: 0.85 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0.45, 0);
    group.add(body);

    // Aerodynamic Low Cabin
    const cabinGeo = new THREE.BoxGeometry(1.7, 0.5, 2.2);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x0f172a, roughness: 0.1, metalness: 0.9 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 0.9, -0.2);
    group.add(cabin);

    // Rear Racing Spoiler
    const wingGeo = new THREE.BoxGeometry(1.9, 0.08, 0.4);
    const wingMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.3, metalness: 0.7 });
    const wing = new THREE.Mesh(wingGeo, wingMat);
    wing.position.set(0, 1.05, -2.1);
    group.add(wing);

    // Low-profile Alloy Wheels
    const wR = 0.36;
    const wW = 0.28;
    const fL = createWheel(wR, wW, true);
    fL.position.set(-1.08, wR, 1.4);
    const fR = createWheel(wR, wW, true);
    fR.position.set(1.08, wR, 1.4);
    const rL = createWheel(wR, wW, true);
    rL.position.set(-1.08, wR, -1.4);
    const rR = createWheel(wR, wW, true);
    rR.position.set(1.08, wR, -1.4);
    group.add(fL, fR, rL, rR);

  } else {
    // Default: Swift Sport Hatchback
    const bodyGeo = new THREE.BoxGeometry(1.9, 0.65, 3.8);
    const bodyMat = new THREE.MeshStandardMaterial({ color: hexColor, roughness: 0.2, metalness: 0.6 });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.set(0, 0.6, 0);
    group.add(body);

    // Compact Cabin
    const cabinGeo = new THREE.BoxGeometry(1.65, 0.65, 2.0);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.1, metalness: 0.9 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 1.15, -0.25);
    group.add(cabin);

    // Front modern headlights
    const hlGeo = new THREE.BoxGeometry(0.35, 0.15, 0.05);
    const hlMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xffffff, emissiveIntensity: 0.9 });
    const lHl = new THREE.Mesh(hlGeo, hlMat);
    lHl.position.set(-0.65, 0.65, 1.91);
    const rHl = new THREE.Mesh(hlGeo, hlMat);
    rHl.position.set(0.65, 0.65, 1.91);
    group.add(lHl, rHl);

    // Rear Taillights
    const tlMat = new THREE.MeshStandardMaterial({ color: 0xef4444, emissive: 0xb91c1c, emissiveIntensity: 0.7 });
    const lTl = new THREE.Mesh(hlGeo, tlMat);
    lTl.position.set(-0.65, 0.65, -1.91);
    const rTl = new THREE.Mesh(hlGeo, tlMat);
    rTl.position.set(0.65, 0.65, -1.91);
    group.add(lTl, rTl);

    // Wheels
    const wR = 0.35;
    const wW = 0.22;
    const fL = createWheel(wR, wW, true);
    fL.position.set(-0.95, wR, 1.15);
    const fR = createWheel(wR, wW, true);
    fR.position.set(0.95, wR, 1.15);
    const rL = createWheel(wR, wW, true);
    rL.position.set(-0.95, wR, -1.15);
    const rR = createWheel(wR, wW, true);
    rR.position.set(0.95, wR, -1.15);
    group.add(fL, fR, rL, rR);
  }

  return group;
}

// ----------------------------------------------------
// 8. SCENIC PROPS: TOLL PLAZA, DHABA, MILESTONE, TREES
// ----------------------------------------------------

export function createTollPlazaGateMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'toll_plaza';

  // Overhead Canopy Structure
  const canopyGeo = new THREE.BoxGeometry(24, 1.2, 5);
  const canopyMat = new THREE.MeshStandardMaterial({ color: 0x0284c7, roughness: 0.3, metalness: 0.6 });
  const canopy = new THREE.Mesh(canopyGeo, canopyMat);
  canopy.position.set(0, 5.5, 0);
  group.add(canopy);

  // Gantry Pillars (4 Pillars between lanes)
  const pillarGeo = new THREE.BoxGeometry(0.8, 5.0, 1.2);
  const pillarMat = new THREE.MeshStandardMaterial({ color: 0x94a3b8, roughness: 0.4, metalness: 0.8 });

  [-9, -3, 3, 9].forEach(x => {
    const p = new THREE.Mesh(pillarGeo, pillarMat);
    p.position.set(x, 2.5, 0);
    group.add(p);

    // Toll Cabin Booth
    const boothGeo = new THREE.BoxGeometry(1.6, 2.2, 2.4);
    const boothMat = new THREE.MeshStandardMaterial({ color: 0xf1f5f9, roughness: 0.3 });
    const booth = new THREE.Mesh(boothGeo, boothMat);
    booth.position.set(x, 1.1, 0);
    group.add(booth);
  });

  // Green FASTag LED Signs over each lane
  const signGeo = new THREE.BoxGeometry(4.2, 0.8, 0.2);
  const signMat = new THREE.MeshStandardMaterial({ color: 0x15803d, emissive: 0x22c55e, emissiveIntensity: 0.8 });
  [-6, 0, 6].forEach(x => {
    const s = new THREE.Mesh(signGeo, signMat);
    s.position.set(x, 5.5, 2.55);
    group.add(s);
  });

  // Animated Boom Barrier
  const barrierArmGeo = new THREE.BoxGeometry(3.5, 0.12, 0.12);
  const barrierArmMat = new THREE.MeshStandardMaterial({ color: 0xdc2626, roughness: 0.2 });
  const barrierArm = new THREE.Mesh(barrierArmGeo, barrierArmMat);
  barrierArm.name = 'toll_barrier_arm';
  barrierArm.position.set(-1.75, 1.2, 1.5);
  group.add(barrierArm);

  return group;
}

export function createDhabaMesh(): THREE.Group {
  const group = new THREE.Group();
  group.name = 'desi_dhaba';

  // Dhaba Shed
  const shedGeo = new THREE.BoxGeometry(7, 3, 5);
  const shedMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.9 });
  const shed = new THREE.Mesh(shedGeo, shedMat);
  shed.position.set(0, 1.5, 0);
  group.add(shed);

  // Thatched sloped roof
  const roofGeo = new THREE.ConeGeometry(5.5, 1.8, 4);
  roofGeo.rotateY(Math.PI / 4);
  const roofMat = new THREE.MeshStandardMaterial({ color: 0x78350f, roughness: 0.95 });
  const roof = new THREE.Mesh(roofGeo, roofMat);
  roof.position.set(0, 3.8, 0);
  group.add(roof);

  // "SHER-E-PUNJAB DHABA" Sign
  const signGeo = new THREE.BoxGeometry(5.5, 0.8, 0.15);
  const signMat = new THREE.MeshStandardMaterial({ color: 0xb91c1c, emissive: 0xf59e0b, emissiveIntensity: 0.4 });
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(0, 3.2, 2.6);
  group.add(sign);

  // Roadside Charpai (Woven Cot)
  const cotGeo = new THREE.BoxGeometry(1.6, 0.4, 0.9);
  const cotMat = new THREE.MeshStandardMaterial({ color: 0x92400e, roughness: 0.8 });
  const cot1 = new THREE.Mesh(cotGeo, cotMat);
  cot1.position.set(-2, 0.2, 3.8);
  const cot2 = new THREE.Mesh(cotGeo, cotMat);
  cot2.position.set(2, 0.2, 3.8);
  group.add(cot1, cot2);

  return group;
}

export function createGulmoharTreeMesh(): THREE.Group {
  const group = new THREE.Group();

  // Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.3, 0.5, 4.5, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x451a03, roughness: 0.9 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 2.25;
  group.add(trunk);

  // Vibrant Orange/Red Floral Canopy
  const foliageGeo = new THREE.SphereGeometry(2.4, 8, 8);
  foliageGeo.scale(1.3, 0.8, 1.3);
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.8 }); // Red Gulmohar
  const foliage = new THREE.Mesh(foliageGeo, foliageMat);
  foliage.position.y = 4.8;
  group.add(foliage);

  return group;
}

export function createBanyanTreeMesh(): THREE.Group {
  const group = new THREE.Group();

  // Wide Girth Trunk
  const trunkGeo = new THREE.CylinderGeometry(0.6, 0.9, 5.0, 8);
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x3f2d1d, roughness: 0.95 });
  const trunk = new THREE.Mesh(trunkGeo, trunkMat);
  trunk.position.y = 2.5;
  group.add(trunk);

  // Broad Deep Green Canopy
  const foliageGeo = new THREE.SphereGeometry(3.5, 8, 8);
  foliageGeo.scale(1.5, 0.7, 1.5);
  const foliageMat = new THREE.MeshStandardMaterial({ color: 0x14532d, roughness: 0.9 });
  const foliage = new THREE.Mesh(foliageGeo, foliageMat);
  foliage.position.y = 5.2;
  group.add(foliage);

  return group;
}

export function createMilestoneMesh(highway: string, city: string, km: number): THREE.Group {
  const group = new THREE.Group();
  group.name = 'milestone';

  const stoneTex = createMilestoneTexture(highway, city, km);
  const stoneMat = new THREE.MeshStandardMaterial({ map: stoneTex, roughness: 0.7 });

  const stoneGeo = new THREE.CylinderGeometry(0.3, 0.3, 1.1, 16);
  const stone = new THREE.Mesh(stoneGeo, stoneMat);
  stone.position.y = 0.55;
  group.add(stone);

  return group;
}

export function createOverheadGantryMesh(line1: string, line2: string): THREE.Group {
  const group = new THREE.Group();
  group.name = 'overhead_gantry';

  // Cross Beam
  const beamGeo = new THREE.BoxGeometry(22, 0.6, 0.6);
  const beamMat = new THREE.MeshStandardMaterial({ color: 0x64748b, roughness: 0.4, metalness: 0.8 });
  const beam = new THREE.Mesh(beamGeo, beamMat);
  beam.position.set(0, 6.2, 0);
  group.add(beam);

  // Left & Right Support Truss
  const trussGeo = new THREE.BoxGeometry(0.6, 6.2, 0.6);
  const trussL = new THREE.Mesh(trussGeo, beamMat);
  trussL.position.set(-10.5, 3.1, 0);
  const trussR = new THREE.Mesh(trussGeo, beamMat);
  trussR.position.set(10.5, 3.1, 0);
  group.add(trussL, trussR);

  // Big Green Signboard
  const signTex = createOverheadSignTexture(line1, line2);
  const signMat = new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.3 });
  const signGeo = new THREE.PlaneGeometry(10, 3.2);
  const sign = new THREE.Mesh(signGeo, signMat);
  sign.position.set(0, 6.2, 0.35);
  group.add(sign);

  return group;
}
