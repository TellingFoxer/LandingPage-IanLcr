// @ts-nocheck
import * as THREE from "three";
import { LineSegments2 } from "three/examples/jsm/lines/LineSegments2.js";
import { LineMaterial } from "three/examples/jsm/lines/LineMaterial.js";
import { LineGeometry } from "three/examples/jsm/lines/LineGeometry.js";

// ---------------------------------------------------------------------------
// Palette — matches card border gradient
// ---------------------------------------------------------------------------

const WHITE = new THREE.Color("#ffffff");

// ---------------------------------------------------------------------------
// Constellation patterns: 4 shapes with node-to-node connections
// Each: center (x,y), nodes (offsets from center), connections (pairs of indices)
// ---------------------------------------------------------------------------

interface ConstellationDef {
  center: [number, number];
  color: THREE.Color;
  nodes: [number, number][];   // offsets from center
  edges: [number, number][];   // pairs of node indices
}

const CONSTELLATION_DEFS: ConstellationDef[] = [
  {
    // Top-right: Wireframe cube — isometric projection (3D structure)
    center: [44, 36],
    color: WHITE,
    // front face: 0-1-2-3, back face: 4-5-6-7
    nodes: [[-5, -3], [3, -3], [3, 5], [-5, 5], [-2, 0], [6, 0], [6, 8], [-2, 8]],
    edges: [[0,1],[1,2],[2,3],[3,0], [4,5],[5,6],[6,7],[7,4], [0,4],[1,5],[2,6],[3,7]],
  },
  {
    // Top-left: Resistor zigzag symbol
    center: [-38, 42],
    color: WHITE,
    nodes: [[-10, 1], [-7, 0], [-4, 5], [0, 0], [4, 5], [7, 0], [10, 1]],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6]],
  },
  {
    // Bottom-right: Signal antenna with radiating waves
    center: [46, -38],
    color: WHITE,
    nodes: [[0, 8], [-3, 5], [3, 5], [-6, 1], [6, 1], [0, -4]],
    edges: [[0,1],[1,2],[2,0], [0,3],[3,4],[4,0], [0,5]],
  },
];

// ---------------------------------------------------------------------------
// Particle counts
// ---------------------------------------------------------------------------

const BACKGROUND_STAR_COUNT = 8000;
const RING_PARTICLE_COUNT = 6000;
const CONSTELLATION_NODE_COUNT = CONSTELLATION_DEFS.reduce((s, d) => s + d.nodes.length, 0);
const PARTICLE_COUNT = BACKGROUND_STAR_COUNT + RING_PARTICLE_COUNT + CONSTELLATION_NODE_COUNT;
const SHADOW_PARTICLE_COUNT = 2500;
const RING_RADIUS = 44;
const RING_HEIGHT = 10;
const DEPTH_DROP = 70;

// ---------------------------------------------------------------------------
// Create ring + background stars + constellation nodes (single Points object)
// ---------------------------------------------------------------------------

function createParticleSystem(): {
  points: THREE.Points;
  geometry: THREE.BufferGeometry;
  ringStart: number;
  ringBaseAngle: Float32Array;
  ringBaseRadii: Float32Array;
  ringBaseY: Float32Array;
  ringPhases: Float32Array;
  lineGroup: THREE.Group;
} {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const phases = new Float32Array(PARTICLE_COUNT);
  const baseRadii = new Float32Array(PARTICLE_COUNT);
  const baseY = new Float32Array(PARTICLE_COUNT);
  const baseAngle = new Float32Array(PARTICLE_COUNT);

  const starPalette = [
    new THREE.Color("#ffffff"), new THREE.Color("#f5f5ff"),
    new THREE.Color("#fafafa"), new THREE.Color("#e8e8f0"),
    new THREE.Color("#f0f0f8"), new THREE.Color("#dddde8"),
    new THREE.Color("#eeeeff"), new THREE.Color("#c8c8d8"),
  ];

  const ringPalette = [
    new THREE.Color("#ffffff"), new THREE.Color("#e8e8e8"),
    new THREE.Color("#d0d0d0"), new THREE.Color("#b0b0b0"),
    new THREE.Color("#888888"), new THREE.Color("#f5f5f5"),
    new THREE.Color("#c8c8c8"), new THREE.Color("#a0a0a0"),
  ];

  let idx = 0;

  // ---- Background stars: fill entire screen, Z≈0 ----
  for (let i = 0; i < BACKGROUND_STAR_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.pow(Math.random(), 0.55) * RING_RADIUS * 1.8;
    const z = Math.random() * 4;

    const i3 = idx * 3;
    positions[i3]     = Math.cos(angle) * r;
    positions[i3 + 1] = Math.sin(angle) * r;
    positions[i3 + 2] = z;

    const brightness = 0.50 + Math.random() * 0.50;
    const col = starPalette[Math.floor(Math.random() * starPalette.length)];
    colors[i3]     = col.r * brightness;
    colors[i3 + 1] = col.g * brightness;
    colors[i3 + 2] = col.b * brightness;

    sizes[idx] = 0.15 + Math.random() * 0.20;
    phases[idx] = Math.random() * Math.PI * 2;
    baseRadii[idx] = r;
    baseY[idx] = z;
    idx++;
  }

  // ---- Constellation nodes: bright colored stars at pattern positions ----
  const constNodeStart = idx;
  const constNodeMap: number[][] = []; // per-constellation: global indices of its nodes

  for (const def of CONSTELLATION_DEFS) {
    const nodeIndices: number[] = [];
    for (const [ox, oy] of def.nodes) {
      const x = def.center[0] + ox;
      const y = def.center[1] + oy;
      const r = Math.sqrt(x * x + y * y);
      const z = Math.random() * 1.5; // slightly in front

      const i3 = idx * 3;
      positions[i3]     = x;
      positions[i3 + 1] = y;
      positions[i3 + 2] = z;

      colors[i3]     = def.color.r;
      colors[i3 + 1] = def.color.g;
      colors[i3 + 2] = def.color.b;

      sizes[idx] = 0.30 + Math.random() * 0.15; // larger, prominent
      phases[idx] = Math.random() * Math.PI * 2;
      baseRadii[idx] = r;
      baseY[idx] = z;
      nodeIndices.push(idx);
      idx++;
    }
    constNodeMap.push(nodeIndices);
  }

  // ---- Ring particles: lip of the tunnel ----
  const ringStart = idx;
  for (let i = idx; i < PARTICLE_COUNT; i++) {
    const u1 = Math.max(Math.random(), 1e-10);
    const u2 = Math.random();
    const gauss2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

    const angle = Math.random() * Math.PI * 2;
    const radialFactor = Math.random();
    const radius = RING_RADIUS * 0.15 + radialFactor * RING_RADIUS * 1.3;
    const depthProgress = Math.max(0, (RING_RADIUS - radius)) / RING_RADIUS;
    const yOffset = -depthProgress * DEPTH_DROP + gauss2 * RING_HEIGHT * (0.3 + depthProgress * 0.7);

    const i3 = i * 3;
    positions[i3]     = Math.cos(angle) * radius;
    positions[i3 + 1] = Math.sin(angle) * radius;
    positions[i3 + 2] = yOffset;

    const col = ringPalette[Math.floor(Math.random() * ringPalette.length)];
    const depthDim = (yOffset < 0) ? Math.max(0.35, 1.0 + yOffset / DEPTH_DROP) : 1.0;
    colors[i3]     = col.r * depthDim;
    colors[i3 + 1] = col.g * depthDim;
    colors[i3 + 2] = col.b * depthDim;

    const sizeBase = 0.28 + Math.random() * 0.40;
    const sizeDepth = (yOffset < 0) ? Math.max(0.4, 1.0 + yOffset / DEPTH_DROP * 0.6) : 1.0;
    sizes[i] = sizeBase * sizeDepth;

    phases[i] = Math.random() * Math.PI * 2;
    baseRadii[i] = radius;
    baseY[i] = yOffset;
    baseAngle[i] = angle;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (540.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.0, 0.5, d);
        alpha = pow(alpha, 1.5);
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    vertexColors: true,
    depthWrite: false,
    depthTest: false,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);

  // ---- Constellation lines: sequential edge-by-edge drawing ----
  const lineGroup = new THREE.Group();
  const allEdgeLines: { line: LineSegments2; constIdx: number; edgeIdx: number }[] = [];
  const allLineMaterials: LineMaterial[] = [];

  for (let c = 0; c < CONSTELLATION_DEFS.length; c++) {
    const def = CONSTELLATION_DEFS[c];
    const nodeIndices = constNodeMap[c];

    for (let e = 0; e < def.edges.length; e++) {
      const [a, b] = def.edges[e];
      const ia3 = nodeIndices[a] * 3;
      const ib3 = nodeIndices[b] * 3;

      const edgeGeo = new LineGeometry();
      edgeGeo.setPositions([
        positions[ia3], positions[ia3 + 1], positions[ia3 + 2],
        positions[ib3], positions[ib3 + 1], positions[ib3 + 2],
      ]);

      const edgeMat = new LineMaterial({
        color: 0xffffff,
        linewidth: 3,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        depthTest: false,
        resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
      });
      edgeMat.blending = THREE.AdditiveBlending;

      const edgeLine = new LineSegments2(edgeGeo, edgeMat);
      lineGroup.add(edgeLine);
      allEdgeLines.push({ line: edgeLine, constIdx: c, edgeIdx: e });
      allLineMaterials.push(edgeMat);
    }
  }

  // ---- Constellation glow: wide subtle lines behind the main edges ----
  const allGlowMaterials: LineMaterial[] = [];

  for (let c = 0; c < CONSTELLATION_DEFS.length; c++) {
    const def = CONSTELLATION_DEFS[c];
    const nodeIndices = constNodeMap[c];
    const edgeCount = def.edges.length;

    const glowPositions: number[] = [];
    for (let e = 0; e < edgeCount; e++) {
      const [a, b] = def.edges[e];
      const ia3 = nodeIndices[a] * 3;
      const ib3 = nodeIndices[b] * 3;
      glowPositions.push(
        positions[ia3], positions[ia3 + 1], positions[ia3 + 2],
        positions[ib3], positions[ib3 + 1], positions[ib3 + 2],
      );
    }

    const glowGeo = new LineGeometry();
    glowGeo.setPositions(glowPositions);

    const glowMat = new LineMaterial({
      color: 0xffffff,
      linewidth: 10,
      transparent: true,
      opacity: 0.12,
      depthWrite: false,
      depthTest: false,
      resolution: new THREE.Vector2(window.innerWidth, window.innerHeight),
    });
    glowMat.blending = THREE.AdditiveBlending;

    const glowLine = new LineSegments2(glowGeo, glowMat);
    lineGroup.add(glowLine);
    allGlowMaterials.push(glowMat);
  }

  return {
    points,
    geometry,
    ringStart,
    ringBaseAngle: baseAngle,
    ringBaseRadii: baseRadii,
    ringBaseY: baseY,
    ringPhases: phases,
    lineGroup,
    edgeLines: allEdgeLines,
    lineMaterials: allLineMaterials,
    glowMaterials: allGlowMaterials,
  };
}

// ---------------------------------------------------------------------------
// Create background scene
// ---------------------------------------------------------------------------

export function createBackgroundScene(container: HTMLElement): () => void {
  const width = window.innerWidth;
  const height = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 200);
  const isMobile = width / height < 1;

  if (isMobile) {
    camera.position.set(0, 0, 45);
    camera.lookAt(0, 0, 0);
  } else {
    camera.position.set(0, 0, 65);
    camera.lookAt(0, 0, 0);
  }

  // --- Main portal group: rotates everything together ---
  const portalGroup = new THREE.Group();
  scene.add(portalGroup);

  const { points, geometry, ringStart, ringBaseAngle, ringBaseRadii, ringBaseY, ringPhases, lineGroup, edgeLines, lineMaterials, glowMaterials } = createParticleSystem();
  portalGroup.add(points);
  portalGroup.add(lineGroup);

  // --- Shadow particles (separate, behind the portal) ---
  const shadowGeo = new THREE.BufferGeometry();
  const shadowPos = new Float32Array(SHADOW_PARTICLE_COUNT * 3);
  const shadowCol = new Float32Array(SHADOW_PARTICLE_COUNT * 3);
  const shadowSizes = new Float32Array(SHADOW_PARTICLE_COUNT);

  const shadowPalette = [
    new THREE.Color("#ffffff"), new THREE.Color("#e0e0e0"),
    new THREE.Color("#c0c0c0"), new THREE.Color("#a0a0a0"),
    new THREE.Color("#808080"), new THREE.Color("#d8d8d8"),
  ];

  for (let i = 0; i < SHADOW_PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * RING_RADIUS * 1.3;
    shadowPos[i * 3]     = Math.cos(angle) * r;
    shadowPos[i * 3 + 1] = Math.sin(angle) * r;
    shadowPos[i * 3 + 2] = -50 - Math.random() * 18;

    const col = shadowPalette[Math.floor(Math.random() * shadowPalette.length)];
    const dim = 0.2 + Math.random() * 0.8;
    shadowCol[i * 3]     = col.r * dim;
    shadowCol[i * 3 + 1] = col.g * dim;
    shadowCol[i * 3 + 2] = col.b * dim;

    const normalizedR = r / (RING_RADIUS * 1.3);
    shadowSizes[i] = 0.08 + normalizedR * 0.32 + Math.random() * 0.22;
  }

  shadowGeo.setAttribute("position", new THREE.BufferAttribute(shadowPos, 3));
  shadowGeo.setAttribute("color", new THREE.BufferAttribute(shadowCol, 3));
  shadowGeo.setAttribute("size", new THREE.BufferAttribute(shadowSizes, 1));

  const shadowMat = new THREE.ShaderMaterial({
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (470.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.0, 0.5, d);
        alpha = pow(alpha, 2.0);
        gl_FragColor = vec4(vColor, alpha);
      }
    `,
    vertexColors: true,
    depthWrite: false,
    depthTest: false,
    transparent: true,
    blending: THREE.AdditiveBlending,
  });

  const shadowPoints = new THREE.Points(shadowGeo, shadowMat);
  portalGroup.add(shadowPoints);

  // --- Animation loop ---
  let animId: number;
  let isVisible = true;
  let lastTime = performance.now();
  let frameCount = 0;

  function animate() {
    animId = requestAnimationFrame(animate);
    if (!isVisible) return;
    frameCount++;
    if (frameCount % 2 !== 0) return;

    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const t = now * 0.001;

    // Smooth group rotation — everything spins together
    portalGroup.rotation.z += 0.0006;
    portalGroup.rotation.x = Math.sin(t * 0.015) * 0.01;

    // Update constellation lines: 3-phase cycle (draw → hold → fade)
    const maxEdges = Math.max(...CONSTELLATION_DEFS.map(d => d.edges.length));
    const cycleTime = 24.0;       // full cycle in seconds
    const drawEnd = 0.60;         // draw phase ends at 60% of cycle
    const fadeStart = 0.75;       // fade phase starts at 75% of cycle
    const cycleFrac = (t % cycleTime) / cycleTime;

    if (cycleFrac < drawEnd) {
      // Phase 1: sequential edge-by-edge draw
      const drawFrac = cycleFrac / drawEnd; // 0→1 over draw phase
      const rawSweep = drawFrac * maxEdges;
      const globalEdge = Math.floor(rawSweep);
      const edgeFrac = rawSweep - globalEdge;

      for (const el of edgeLines) {
        const targetOp = el.edgeIdx < globalEdge ? 1.0
          : el.edgeIdx === globalEdge ? edgeFrac
          : 0;
        el.line.material.opacity = targetOp * 0.75;
      }
    } else if (cycleFrac < fadeStart) {
      // Phase 2: hold — all edges fully visible
      for (const el of edgeLines) {
        el.line.material.opacity = 0.75;
      }
    } else {
      // Phase 3: fade — all edges dissolve together
      const fadeFrac = (cycleFrac - fadeStart) / (1.0 - fadeStart); // 0→1
      const fadeOpacity = (1.0 - fadeFrac) * 0.75;
      for (const el of edgeLines) {
        el.line.material.opacity = fadeOpacity;
      }
    }

    // Ring particles: breathing (radius + Z drift) — rotation handled by portalGroup
    const posArr = geometry.attributes.position.array as Float32Array;
    for (let i = ringStart; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const baseR = ringBaseRadii[i];
      const baseYVal = ringBaseY[i];
      const phase = ringPhases[i];
      const angle = ringBaseAngle[i];

      const breathe = Math.sin(t * 0.25 + phase) * 0.15;
      const currentR = baseR + breathe;

      posArr[i3]     = Math.cos(angle) * currentR;
      posArr[i3 + 1] = Math.sin(angle) * currentR;
      posArr[i3 + 2] = baseYVal + Math.sin(t * 0.35 + phase * 1.5) * 0.06;
    }
    geometry.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
  }

  function onVisibilityChange() {
    isVisible = !document.hidden;
    if (isVisible) lastTime = performance.now();
  }
  document.addEventListener("visibilitychange", onVisibilityChange);

  animate();

  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const res = new THREE.Vector2(w, h);
    for (const mat of lineMaterials) {
      mat.resolution = res;
    }
    for (const mat of glowMaterials) {
      mat.resolution = res;
    }
  }
  window.addEventListener("resize", onResize);

  return () => {
    cancelAnimationFrame(animId);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("resize", onResize);
    renderer.dispose();
    geometry.dispose();
    points.material.dispose();
    shadowGeo.dispose();
    shadowMat.dispose();
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  };
}
