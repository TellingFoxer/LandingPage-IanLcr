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

const PARTICLE_COUNT = 1000;
const RING_RADIUS = 12;    // radius of the ring lip
const RING_SPREAD = 3.5;   // gaussian spread outward from ring center
const RING_HEIGHT = 1.8;   // vertical spread at the lip
const DEPTH_DROP = 8.0;    // how deep particles drop toward center

function createRingNebula(): {
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

  const paletteColors = [
    new THREE.Color("#ffffff"),      // pure white chrome
    new THREE.Color("#e8e8e8"),      // light chrome
    new THREE.Color("#d0d0d0"),      // medium white
    new THREE.Color("#b0b0b0"),      // silver
    new THREE.Color("#888888"),      // mid gray
    new THREE.Color("#f5f5f5"),      // near white
    new THREE.Color("#c8c8c8"),      // soft silver
    new THREE.Color("#a0a0a0"),      // darker silver
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    // Gaussian random (Box-Muller)
    const u1 = Math.max(Math.random(), 1e-10);
    const u2 = Math.random();
    const gauss = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const gauss2 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);

    const angle = Math.random() * Math.PI * 2;

    // Most particles cluster at the ring radius (the "lip")
    // But ~40% scatter inward to create depth
    let radius: number;
    let yOffset: number;
    let distFromRing: number;

    if (Math.random() < 0.6) {
      // Particles AT the ring lip (main halo)
      radius = RING_RADIUS + gauss * RING_SPREAD * 0.3;
      distFromRing = Math.abs(radius - RING_RADIUS);
      yOffset = gauss2 * RING_HEIGHT;
    } else {
      // Particles INSIDE the ring (depth toward center)
      // Random radius inward, with gaussian spread
      const inwardGauss = Math.abs(gauss);
      const inwardFactor = Math.random();
      radius = RING_RADIUS * (0.2 + inwardFactor * 0.8); // 20%..100% of ring radius
      distFromRing = RING_RADIUS - radius;

      // Drop Y proportionally to how far inside they are
      const depthProgress = distFromRing / RING_RADIUS; // 0 (at lip) → 1 (at center)
      yOffset = -depthProgress * DEPTH_DROP + gauss2 * RING_HEIGHT * (0.5 + depthProgress);
    }

    // Cartesian from polar
    positions[i * 3]     = Math.cos(angle) * radius;
    positions[i * 3 + 1] = yOffset;
    positions[i * 3 + 2] = Math.sin(angle) * radius;

    // Color: deeper particles are dimmer, with shifted hue
    const col = paletteColors[Math.floor(Math.random() * paletteColors.length)];
    const depthDim = (yOffset < 0) ? Math.max(0.3, 1.0 + yOffset / DEPTH_DROP) : 1.0;
    colors[i * 3]     = col.r * depthDim;
    colors[i * 3 + 1] = col.g * depthDim;
    colors[i * 3 + 2] = col.b * depthDim;

    // Size: lip particles larger, deeper particles smaller
    const sizeBase = 0.15 + Math.random() * 0.25;
    const sizeDepth = (yOffset < 0) ? Math.max(0.4, 1.0 + yOffset / DEPTH_DROP * 0.6) : 1.0;
    sizes[i] = sizeBase * sizeDepth;

    // Animation
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
        gl_PointSize = size * (200.0 / -mvPosition.z);
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
  camera.position.set(0, 8, 28);
  camera.lookAt(0, -1, 0);

  // --- Ring nebula ---
  const { points, geometry, phases, baseRadii, baseY } = createRingNebula();
  scene.add(points);

  // --- Ambient glow plane (subtle) ---
  const glowGeometry = new THREE.PlaneGeometry(50, 50);
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
      void main() {
        vec2 center = vUv - 0.5;
        float d = length(center);
        float ringDist = abs(d - 0.28);
        float ringGlow = exp(-ringDist * ringDist * 200.0) * 0.12;
        float centerGlow = exp(-d * 5.0) * 0.03;
        float glow = ringGlow + centerGlow;
        vec3 color = mix(vec3(0.9, 0.9, 0.95), vec3(1.0, 1.0, 1.0), glow);
        gl_FragColor = vec4(color, glow * 0.4);
      }
    `,
    depthWrite: false,
    transparent: true,
    blending: THREE.AdditiveBlending,
    side: THREE.DoubleSide,
  });
  const glowPlane = new THREE.Mesh(glowGeometry, glowMaterial);
  glowPlane.position.set(0, -2, -8);
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
    if (frameCount % 2 !== 0) return;

    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;
    const t = now * 0.001;

    // Slow rotation
    points.rotation.y += 0.0003;
    points.rotation.x = Math.sin(t * 0.015) * 0.015;

    // Breathing — particles oscillate slightly
    const posArr = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      const baseR = baseRadii[i];
      const baseYVal = baseY[i];
      const phase = phases[i];

      // Subtle radial breathing
      const breathe = Math.sin(t * 0.25 + phase) * 0.12;
      const currentR = baseR + breathe;

      const currentAngle = Math.atan2(posArr[i3 + 2], posArr[i3]) + 0.00015;
      posArr[i3]     = Math.cos(currentAngle) * currentR;
      posArr[i3 + 2] = Math.sin(currentAngle) * currentR;

      // Subtle vertical drift
      posArr[i3 + 1] = baseYVal + Math.sin(t * 0.35 + phase * 1.5) * 0.003;
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
    glowGeometry.dispose();
    glowMaterial.dispose();
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  };
}
