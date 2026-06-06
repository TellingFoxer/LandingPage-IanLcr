// @ts-nocheck
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Palette — matches card border gradient
// ---------------------------------------------------------------------------

const GOLD = new THREE.Color("#C9A84C");
const CYAN = new THREE.Color("#00D4FF");
const GREEN = new THREE.Color("#00FF41");

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
    // Top-right: triangle with a tail — like a kite
    center: [22, 18],
    color: GOLD,
    nodes: [[0, 0], [3, 5], [7, 1], [5, -4], [2, -8], [9, -3]],
    edges: [[0,1],[1,2],[2,3],[3,0],[3,4],[4,5],[2,5]],
  },
  {
    // Bottom-left: zigzag chain — like a serpent
    center: [-26, -20],
    color: CYAN,
    nodes: [[0, 0], [4, 3], [8, -1], [6, -6], [10, -8], [3, -5], [-1, -7]],
    edges: [[0,1],[1,2],[2,3],[3,4],[1,5],[5,6],[6,0]],
  },
  {
    // Top-left: diamond with cross
    center: [-18, 22],
    color: GREEN,
    nodes: [[0, 0], [4, 4], [8, 0], [4, -4], [-4, 0]],
    edges: [[0,1],[1,2],[2,3],[3,0],[0,2],[1,3],[0,4]],
  },
  {
    // Bottom-right: small hexagon cluster
    center: [28, -16],
    color: GOLD,
    nodes: [[0, 0], [3, 5], [6, 3], [6, -2], [3, -5], [-1, -3]],
    edges: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[0,3]],
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

  // ---- Constellation lines: animated drawing + gradient color cycling ----
  const lineGroup = new THREE.Group();

  // Shared time uniform for all line materials (cycling gradient + draw sweep)
  const lineUniforms = { uTime: { value: 0 } };
  const lineMaterials: THREE.ShaderMaterial[] = [];

  for (let c = 0; c < CONSTELLATION_DEFS.length; c++) {
    const def = CONSTELLATION_DEFS[c];
    const nodeIndices = constNodeMap[c];

    const lineVerts: number[] = [];
    const lineProgress: number[] = []; // 0→1 along each segment

    for (const [a, b] of def.edges) {
      const ia3 = nodeIndices[a] * 3;
      const ib3 = nodeIndices[b] * 3;
      // segment start
      lineVerts.push(positions[ia3], positions[ia3 + 1], positions[ia3 + 2]);
      lineProgress.push(0.0);
      // segment end
      lineVerts.push(positions[ib3], positions[ib3 + 1], positions[ib3 + 2]);
      lineProgress.push(1.0);
    }

    const lineGeo = new THREE.BufferGeometry();
    lineGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lineVerts), 3));
    lineGeo.setAttribute("progress", new THREE.BufferAttribute(new Float32Array(lineProgress), 1));

    const lineMat = new THREE.ShaderMaterial({
      uniforms: lineUniforms,
      vertexShader: `
        varying float vProgress;
        void main() {
          vProgress = progress;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying float vProgress;
        uniform float uTime;
        // Card border gradient colors
        const vec3 gold  = vec3(0.788, 0.659, 0.298);
        const vec3 cyan  = vec3(0.000, 0.831, 1.000);
        const vec3 green = vec3(0.000, 1.000, 0.255);

        void main() {
          // Sweeping draw: reveal line from 0→1, wrap around
          float sweep = fract(uTime * 0.18);
          float tail = sweep - 0.30; // 30% tail behind the sweep head
          float visible = smoothstep(tail, sweep, vProgress);
          if (visible < 0.01) discard;

          // Cycling gradient: gold → cyan → green → gold
          float phase = fract(uTime * 0.06 + vProgress * 1.2);
          vec3 col;
          if (phase < 0.33) {
            col = mix(gold, cyan, phase / 0.33);
          } else if (phase < 0.66) {
            col = mix(cyan, green, (phase - 0.33) / 0.33);
          } else {
            col = mix(green, gold, (phase - 0.66) / 0.34);
          }

          float alpha = visible * 0.45;
          gl_FragColor = vec4(col, alpha);
        }
      `,
      depthWrite: false,
      depthTest: false,
      transparent: true,
      blending: THREE.AdditiveBlending,
    });

    lineMaterials.push(lineMat);
    const lines = new THREE.LineSegments(lineGeo, lineMat);
    lineGroup.add(lines);
  }

  return { points, geometry, ringStart, ringBaseAngle: baseAngle, ringBaseRadii: baseRadii, ringBaseY: baseY, ringPhases: phases, lineGroup, lineMaterials };
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

  const { points, geometry, ringStart, ringBaseAngle, ringBaseRadii, ringBaseY, ringPhases, lineGroup, lineMaterials } = createParticleSystem();
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

    // Update constellation line animation (sweeping draw + color cycle)
    for (const mat of lineMaterials) {
      mat.uniforms.uTime.value = t;
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
