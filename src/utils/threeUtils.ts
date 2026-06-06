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
// Ring Nebula — particle-based halo
// ---------------------------------------------------------------------------
// 800 particles distributed in a gaussian ring around center.
// Each particle is a tiny glowing dot; together they form a nebula halo.
// Soft breathing animation + slow rotation.
// ---------------------------------------------------------------------------

const PARTICLE_COUNT = 800;
const RING_RADIUS = 12;    // in 3D units (camera at z=30)
const RING_SPREAD = 3.0;   // gaussian spread of particles from ring center
const RING_HEIGHT = 1.5;   // vertical spread

function createRingNebula(): {
  points: THREE.Points;
  geometry: THREE.BufferGeometry;
  phases: Float32Array;   // per-particle animation phase offset
  baseRadii: Float32Array; // base radius for each particle
} {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const sizes = new Float32Array(PARTICLE_COUNT);
  const phases = new Float32Array(PARTICLE_COUNT);
  const baseRadii = new Float32Array(PARTICLE_COUNT);

  const paletteColors = [
    PALETTE.gold,
    PALETTE.aeroCyan,
    PALETTE.neonGreen,
    PALETTE.gold.clone().multiplyScalar(0.4),   // dim gold
    PALETTE.aeroCyan.clone().multiplyScalar(0.3), // dim cyan
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Gaussian distribution around the ring
    // Box-Muller transform for gaussian random
    const u1 = Math.random();
    const u2 = Math.random();
    const gauss = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.cos(2 * Math.PI * u2);
    const gauss2 = Math.sqrt(-2 * Math.log(Math.max(u1, 1e-10))) * Math.sin(2 * Math.PI * u2);

    const angle = Math.random() * Math.PI * 2;
    const radiusOffset = gauss * RING_SPREAD;
    const radius = RING_RADIUS + radiusOffset;
    const heightOffset = gauss2 * RING_HEIGHT;

    // Cartesian from polar
    positions[i * 3]     = Math.cos(angle) * radius;
    positions[i * 3 + 1] = heightOffset;
    positions[i * 3 + 2] = Math.sin(angle) * radius;

    // Color
    const col = paletteColors[Math.floor(Math.random() * paletteColors.length)];
    colors[i * 3]     = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    // Size — closer to ring center = slightly larger (denser core)
    const distFromRing = Math.abs(radiusOffset);
    sizes[i] = 0.15 + Math.random() * 0.2 + Math.max(0, 0.2 - distFromRing * 0.15);

    // Per-particle animation phase
    phases[i] = Math.random() * Math.PI * 2;
    baseRadii[i] = radius;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));
  geometry.setAttribute("size", new THREE.BufferAttribute(sizes, 1));

  // Custom shader material for per-particle size and glow
  const material = new THREE.ShaderMaterial({
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = size * (200.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      void main() {
        // Soft circle with glow
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float alpha = 1.0 - smoothstep(0.0, 0.5, d);
        alpha = pow(alpha, 1.5); // softer falloff
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
  return { points, geometry, phases, baseRadii };
}

// ---------------------------------------------------------------------------
// Create background scene
// ---------------------------------------------------------------------------

export function createBackgroundScene(container: HTMLElement): () => void {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  container.appendChild(renderer.domElement);

  // --- Scene & Camera ---
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
  camera.position.set(0, 5, 28);
  camera.lookAt(0, 0, 0);

  // --- Ring nebula ---
  const { points, geometry, phases, baseRadii } = createRingNebula();
  scene.add(points);

  // --- Ambient center glow (subtle fog) ---
  const glowGeometry = new THREE.PlaneGeometry(40, 40);
  const glowMaterial = new THREE.ShaderMaterial({
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec2 vUv;
      uniform float uTime;
      void main() {
        vec2 center = vUv - 0.5;
        float d = length(center);
        // Ring-shaped glow
        float ringDist = abs(d - 0.3);
        float ringGlow = exp(-ringDist * ringDist * 150.0) * 0.15;
        // Soft center
        float centerGlow = exp(-d * 4.0) * 0.04;
        float glow = ringGlow + centerGlow;
        vec3 color = mix(
          vec3(0.79, 0.66, 0.30),  // gold
          vec3(0.0, 0.83, 1.0),    // cyan
          glow
        );
        gl_FragColor = vec4(color, glow * 0.5);
      }
    `,
    uniforms: { uTime: { value: 0 } },
    depthWrite: false,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const glowPlane = new THREE.Mesh(glowGeometry, glowMaterial);
  glowPlane.position.z = -5;
  scene.add(glowPlane);

  // --- Animation loop ---
  let animId: number;
  let isVisible = true;
  let lastTime = performance.now();
  let frameCount = 0;

  function animate() {
    animId = requestAnimationFrame(animate);
    if (!isVisible) return;
    frameCount++;
    if (frameCount % 2 !== 0) return; // ~30fps

    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    const t = now * 0.001; // seconds since start

    // Slow rotation
    points.rotation.y += 0.0004;
    points.rotation.x = Math.sin(t * 0.02) * 0.02; // subtle tilt

    // Breathing: subtle radius oscillation
    const posArr = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const baseR = baseRadii[i];
      const phase = phases[i];

      // Subtle breathing per particle
      const breathe = Math.sin(t * 0.3 + phase) * 0.15;
      const currentR = baseR + breathe;

      const currentAngle = Math.atan2(posArr[i3 + 2], posArr[i3]) + 0.0002;
      posArr[i3]     = Math.cos(currentAngle) * currentR;
      posArr[i3 + 2] = Math.sin(currentAngle) * currentR;

      // Subtle vertical drift
      posArr[i3 + 1] += Math.sin(t * 0.4 + phase * 2.0) * 0.002;
    }
    geometry.attributes.position.needsUpdate = true;

    // Render
    renderer.render(scene, camera);
  }

  // --- Visibility ---
  function onVisibilityChange() {
    isVisible = !document.hidden;
    if (isVisible) lastTime = performance.now();
  }
  document.addEventListener("visibilitychange", onVisibilityChange);

  animate();

  // --- Resize ---
  function onResize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    renderer.setSize(w, h);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener("resize", onResize);

  // --- Cleanup ---
  return () => {
    cancelAnimationFrame(animId);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("resize", onResize);
    renderer.dispose();
    geometry.dispose();
    points.material.dispose();
    glowGeometry.dispose();
    glowMaterial.dispose();
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  };
}
