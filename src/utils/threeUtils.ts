// @ts-nocheck
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

const PALETTE = {
  neonGreen: new THREE.Color("#00FF41"),
  aeroCyan: new THREE.Color("#00D4FF"),
  gold: new THREE.Color("#C9A84C"),
};

// ---------------------------------------------------------------------------
// Ring Nebula — particle-based halo with depth
// ---------------------------------------------------------------------------
// 1000 particles in a gaussian ring. Particles closer to center descend
// lower (negative Y), creating depth — like looking into a torus from above.
// The ring edge is the "lip", the center dips down.
// ---------------------------------------------------------------------------

const BACKGROUND_STAR_COUNT = 8000;
const RING_PARTICLE_COUNT = 6000;
const PARTICLE_COUNT = BACKGROUND_STAR_COUNT + RING_PARTICLE_COUNT;
const SHADOW_PARTICLE_COUNT = 2500;
const RING_RADIUS = 44;
const RING_SPREAD = 6.0;
const RING_HEIGHT = 10;
const DEPTH_DROP = 45;

function createRingNebula(mobile = false): {
  points: THREE.Points;
  geometry: THREE.BufferGeometry;
  phases: Float32Array;
  baseRadii: Float32Array;
  baseY: Float32Array;
} {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const phases = new Float32Array(PARTICLE_COUNT);
  const baseRadii = new Float32Array(PARTICLE_COUNT);
  const baseY = new Float32Array(PARTICLE_COUNT);

  const starPalette = [
    new THREE.Color("#ffffff"),
    new THREE.Color("#f5f5ff"),
    new THREE.Color("#fafafa"),
    new THREE.Color("#e8e8f0"),
    new THREE.Color("#f0f0f8"),
    new THREE.Color("#dddde8"),
    new THREE.Color("#eeeeff"),
    new THREE.Color("#c8c8d8"),
  ];

  const ringPalette = [
    new THREE.Color("#ffffff"),
    new THREE.Color("#e8e8e8"),
    new THREE.Color("#d0d0d0"),
    new THREE.Color("#b0b0b0"),
    new THREE.Color("#888888"),
    new THREE.Color("#f5f5f5"),
    new THREE.Color("#c8c8c8"),
    new THREE.Color("#a0a0a0"),
  ];

  // ---- Background stars: fill the entire screen, Z≈0 (not in tunnel) ----
  for (let i = 0; i < BACKGROUND_STAR_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    // Spread uniformly across the full viewport and beyond
    const r = Math.pow(Math.random(), 0.55) * RING_RADIUS * 1.8;
    // Stay at the surface or slightly in front — never enter the tunnel
    const z = Math.random() * 4; // 0 to +4 (slightly in front of camera plane)

    const i3 = i * 3;
    positions[i3]     = Math.cos(angle) * r;
    positions[i3 + 1] = Math.sin(angle) * r;
    positions[i3 + 2] = z;

    // Varied brightness: 50%–100%
    const brightness = 0.50 + Math.random() * 0.50;
    const col = starPalette[Math.floor(Math.random() * starPalette.length)];
    colors[i3]     = col.r * brightness;
    colors[i3 + 1] = col.g * brightness;
    colors[i3 + 2] = col.b * brightness;

    // Small, crisp points
    sizes[i] = 0.15 + Math.random() * 0.20;

    phases[i] = Math.random() * Math.PI * 2;
    baseRadii[i] = r;
    baseY[i] = z;
  }

  // ---- Ring particles: lip of the tunnel, depth into Z ----
  for (let i = BACKGROUND_STAR_COUNT; i < PARTICLE_COUNT; i++) {
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
  return { points, geometry, phases, baseRadii, baseY };
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
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
  // Slightly elevated, looking slightly down into the ring
  const isMobile = width / height < 1;

  // Camera faces the ring portal straight-on
  if (isMobile) {
    camera.position.set(0, 0, 45);
    camera.lookAt(0, 0, 0);
  } else {
    camera.position.set(0, 0, 65);
    camera.lookAt(0, 0, 0);
  }

  // --- Ring nebula ---
  const { points, geometry, phases, baseRadii, baseY } = createRingNebula(isMobile);
  scene.add(points);

  // --- Shadow particles (below the halo) ---
  const shadowGeo = new THREE.BufferGeometry();
  const shadowPos = new Float32Array(SHADOW_PARTICLE_COUNT * 3);
  const shadowCol = new Float32Array(SHADOW_PARTICLE_COUNT * 3);
  const shadowSizes = new Float32Array(SHADOW_PARTICLE_COUNT);

  const shadowPalette = [
    new THREE.Color("#ffffff"),
    new THREE.Color("#e0e0e0"),
    new THREE.Color("#c0c0c0"),
    new THREE.Color("#a0a0a0"),
    new THREE.Color("#808080"),
    new THREE.Color("#d8d8d8"),
  ];

  for (let i = 0; i < SHADOW_PARTICLE_COUNT; i++) {
    const angle = Math.random() * Math.PI * 2;
    const r = Math.random() * RING_RADIUS * 1.3;
    // Shadow particles in XY ring, pushed back in Z
    shadowPos[i * 3]     = Math.cos(angle) * r;
    shadowPos[i * 3 + 1] = Math.sin(angle) * r;
    shadowPos[i * 3 + 2] = -30 - Math.random() * 12;

    const col = shadowPalette[Math.floor(Math.random() * shadowPalette.length)];
    const dim = 0.2 + Math.random() * 0.8;
    shadowCol[i * 3]     = col.r * dim;
    shadowCol[i * 3 + 1] = col.g * dim;
    shadowCol[i * 3 + 2] = col.b * dim;

    // Smaller particles toward center, larger at edges
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
  scene.add(shadowPoints);

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

    // Slow spin — all particles rotate together in XY (no transform rotation)
    points.rotation.x = Math.sin(t * 0.015) * 0.01;
    const ROTATE_SPEED = 0.0006; // unified rotation per frame

    const posArr = geometry.attributes.position.array as Float32Array;

    // Background stars: smooth rotation, no breathing, Z fixed
    for (let i = 0; i < BACKGROUND_STAR_COUNT; i++) {
      const i3 = i * 3;
      const baseR = baseRadii[i];
      const currentAngle = Math.atan2(posArr[i3 + 1], posArr[i3]) + ROTATE_SPEED;
      posArr[i3]     = Math.cos(currentAngle) * baseR;
      posArr[i3 + 1] = Math.sin(currentAngle) * baseR;
    }

    // Ring particles: breathing + rotation + depth drift
    for (let i = BACKGROUND_STAR_COUNT; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const baseR = baseRadii[i];
      const baseYVal = baseY[i];
      const phase = phases[i];

      const breathe = Math.sin(t * 0.25 + phase) * 0.15;
      const currentR = baseR + breathe;

      const currentAngle = Math.atan2(posArr[i3 + 1], posArr[i3]) + ROTATE_SPEED;
      posArr[i3]     = Math.cos(currentAngle) * currentR;
      posArr[i3 + 1] = Math.sin(currentAngle) * currentR;

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
