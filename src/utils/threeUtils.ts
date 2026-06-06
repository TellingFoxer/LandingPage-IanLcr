// @ts-nocheck
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Shared constants
// ---------------------------------------------------------------------------

const PALETTE = {
  neonGreen: new THREE.Color("#00FF41"),
  aeroCyan: new THREE.Color("#00D4FF"),
  gold: new THREE.Color("#C9A84C"),
  night: new THREE.Color("#07070A"),
};

// ---------------------------------------------------------------------------
// Nebula Shader (Aurora Background)
// ---------------------------------------------------------------------------

const NEBULA_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const NEBULA_FRAGMENT = /* glsl */ `
  varying vec2 vUv;
  uniform float uTime;
  uniform vec3 uColor1;
  uniform vec3 uColor2;
  uniform vec3 uColor3;

  float cheapNoise(vec2 p, float time) {
    return sin(p.x * 1.8 + sin(p.y * 2.5 + time * 0.12) * 1.4 + time * 0.06)
         * cos(p.y * 1.5 + sin(p.x * 3.2 + time * 0.09) * 1.1 + time * 0.04);
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime;

    float n1 = cheapNoise(uv * 1.0 + vec2(t * 0.02, 0.0), t * 0.6);
    n1 = smoothstep(-0.3, 0.9, n1);

    float n2 = cheapNoise(uv * 2.0 - vec2(t * 0.015, t * 0.01), t * 0.8);
    n2 = smoothstep(-0.2, 1.0, n2);

    float n3 = cheapNoise(uv * 3.5 + vec2(t * 0.025, -t * 0.018), t * 1.1);
    n3 = smoothstep(-0.1, 0.85, n3);

    float n4 = cheapNoise(uv * 6.0 - vec2(t * 0.03, t * 0.02), t * 1.4);
    n4 = smoothstep(0.0, 0.7, n4);

    float aurora = n1 * 0.40 + n2 * 0.28 + n3 * 0.20 + n4 * 0.12;

    float vertFade = smoothstep(0.0, 0.45, uv.y) * (1.0 - smoothstep(0.65, 1.0, uv.y));
    aurora *= vertFade;

    vec3 color = mix(uColor3, uColor1, aurora * 0.55);
    color = mix(color, uColor2, n2 * aurora * 0.35);

    float glow = n1 * 0.08 * vertFade;
    color += uColor1 * glow;

    float dist = length(uv - vec2(0.5, 0.55));
    float vignette = smoothstep(0.0, 0.35, 1.0 - dist * 0.9);
    color *= mix(0.6, 1.0, vignette);

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// Particles
// ---------------------------------------------------------------------------

const PARTICLE_COUNT = 60;

function createParticleSystem(): {
  points: THREE.Points;
  geometry: THREE.BufferGeometry;
  velocities: { x: number; y: number; z: number }[];
} {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(PARTICLE_COUNT * 3);
  const colors = new Float32Array(PARTICLE_COUNT * 3);
  const velocities: { x: number; y: number; z: number }[] = [];

  const paletteColors = [
    PALETTE.aeroCyan,
    new THREE.Color("#C9A84C").multiplyScalar(0.4),
    new THREE.Color("#00FF41").multiplyScalar(0.5),
  ];

  for (let i = 0; i < PARTICLE_COUNT; i++) {
    const i3 = i * 3;
    positions[i3] = (Math.random() - 0.5) * 50;
    positions[i3 + 1] = (Math.random() - 0.5) * 40;
    positions[i3 + 2] = (Math.random() - 0.5) * 20;

    const col = paletteColors[Math.floor(Math.random() * paletteColors.length)];
    colors[i3] = col.r;
    colors[i3 + 1] = col.g;
    colors[i3 + 2] = col.b;

    velocities.push({
      x: (Math.random() - 0.5) * 0.015,
      y: (Math.random() - 0.5) * 0.015,
      z: (Math.random() - 0.5) * 0.005,
    });
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.12,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    transparent: true,
    opacity: 0.4,
  });

  const points = new THREE.Points(geometry, material);
  return { points, geometry, velocities };
}

// ---------------------------------------------------------------------------
// Unified Background Scene
// ---------------------------------------------------------------------------
// Single WebGLRenderer, two scenes rendered sequentially:
//   1. Aurora (orthographic, fullscreen) — with clear
//   2. Particles (perspective, overlay) — with clearDepth only
// ---------------------------------------------------------------------------

export function createBackgroundScene(container: HTMLElement): () => void {
  const width = window.innerWidth;
  const height = window.innerHeight;

  // --- Shared renderer ---
  const renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: false,
    powerPreference: "low-power",
  });
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.autoClear = false; // we control clears manually
  container.appendChild(renderer.domElement);

  // --- Aurora scene (renders first, full clear) ---
  const auroraScene = new THREE.Scene();
  const auroraCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  auroraCamera.position.z = 1;

  const auroraUniforms = {
    uTime: { value: 0 },
    uColor1: { value: PALETTE.neonGreen },
    uColor2: { value: PALETTE.aeroCyan },
    uColor3: { value: PALETTE.night },
  };

  const auroraMaterial = new THREE.ShaderMaterial({
    vertexShader: NEBULA_VERTEX,
    fragmentShader: NEBULA_FRAGMENT,
    uniforms: auroraUniforms,
    depthWrite: false,
    depthTest: false,
  });

  const auroraMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    auroraMaterial
  );
  auroraScene.add(auroraMesh);

  // --- Particles scene (renders second, no clear) ---
  const particlesScene = new THREE.Scene();
  const particlesCamera = new THREE.PerspectiveCamera(
    60,
    width / height,
    0.1,
    100
  );
  particlesCamera.position.z = 30;

  const { points, geometry, velocities } = createParticleSystem();
  particlesScene.add(points);

  // --- Animation loop ---
  let animId: number;
  let isVisible = true;
  let lastTime = performance.now();
  let frameCount = 0;

  function animate() {
    animId = requestAnimationFrame(animate);
    if (!isVisible) return;

    // Frame skipping: render every 2nd frame (30fps cap)
    frameCount++;
    if (frameCount % 2 !== 0) return;

    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // Update aurora time uniform
    auroraUniforms.uTime.value += dt;

    // Update particle positions
    const posArr = geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      posArr[i3] += velocities[i].x;
      posArr[i3 + 1] += velocities[i].y;
      posArr[i3 + 2] += velocities[i].z;

      if (Math.abs(posArr[i3]) > 25) posArr[i3] *= -1;
      if (Math.abs(posArr[i3 + 1]) > 20) posArr[i3 + 1] *= -1;
      if (Math.abs(posArr[i3 + 2]) > 10) posArr[i3 + 2] *= -1;
    }
    geometry.attributes.position.needsUpdate = true;
    points.rotation.y += 0.0003;

    // --- Render: aurora first (clears), then particles (no clear) ---
    renderer.clear();
    renderer.render(auroraScene, auroraCamera);
    renderer.clearDepth();
    renderer.render(particlesScene, particlesCamera);
  }

  // --- Visibility API ---
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
    particlesCamera.aspect = w / h;
    particlesCamera.updateProjectionMatrix();
  }
  window.addEventListener("resize", onResize);

  // --- Cleanup ---
  return () => {
    cancelAnimationFrame(animId);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("resize", onResize);
    renderer.dispose();
    auroraMaterial.dispose();
    auroraMesh.geometry.dispose();
    points.material.dispose();
    geometry.dispose();
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  };
}
