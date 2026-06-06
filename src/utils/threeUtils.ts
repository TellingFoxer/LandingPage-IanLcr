// @ts-nocheck
import * as THREE from "three";

// ---------------------------------------------------------------------------
// Palette
// ---------------------------------------------------------------------------

const PALETTE = {
  neonGreen: new THREE.Color("#00FF41"),
  aeroCyan: new THREE.Color("#00D4FF"),
  gold: new THREE.Color("#C9A84C"),
  night: new THREE.Color("#07070A"),
};

// ---------------------------------------------------------------------------
// Ring Aurora Shader — a glowing ring at center that morphs through states
// ---------------------------------------------------------------------------
// Phase cycle:
//   0 → Calm ring (base — glowing torus, slow breathing)
//   1 → Wave ring  (ring undulates like standing waves)
//   2 → Dissolve   (ring breaks into scattered glowing dots)
//   3 → Expand     (ring expands outward and fades)
//   4 → Spiral     (double contra-rotating spiral)
// Each phase runs ~10s, transitions take ~3s, calm lingers ~6s.
// ---------------------------------------------------------------------------

const RING_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const RING_FRAGMENT = /* glsl */ `
  precision highp float;
  varying vec2 vUv;
  uniform float uTime;
  uniform float uFrame;         // 0..1 position in current animation segment
  uniform int   uAnim;          // 0=calm, 1=wave, 2=dissolve, 3=expand, 4=spiral
  uniform float uBlend;        // 0..1 blend INTO current anim (0 = previous, 1 = fully this)
  uniform vec3  uC1;           // gold-ish
  uniform vec3  uC2;           // cyan
  uniform vec3  uC3;           // green

  // -----------------------------------------------------------------------
  // Noise helpers
  // ------------------------------------------------------------------------
  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }

  float smoothNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash21(i);
    float b = hash21(i + vec2(1.0, 0.0));
    float c = hash21(i + vec2(0.0, 1.0));
    float d = hash21(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2 rot = mat2(cos(0.5), sin(0.5), -sin(0.5), cos(0.5));
    for (int i = 0; i < 4; i++) {
      v += a * smoothNoise(p);
      p = rot * p * 2.0;
      a *= 0.5;
    }
    return v;
  }

  // -----------------------------------------------------------------------
  // Ring shaping
  // ------------------------------------------------------------------------
  float ring(vec2 uv, float radius, float width, float blur) {
    float d = length(uv - 0.5);
    float inner = smoothstep(radius - width * 0.5 - blur, radius - width * 0.5, d);
    float outer = 1.0 - smoothstep(radius + width * 0.5, radius + width * 0.5 + blur, d);
    return inner * outer;
  }

  // -----------------------------------------------------------------------
  // Phase — Calm Ring (uAnim == 0)
  // ------------------------------------------------------------------------
  float calmRing(vec2 uv, float t) {
    float breathe = 0.25 + 0.02 * sin(t * 0.3);
    float blurAmt = 0.02 + 0.01 * sin(t * 0.5);
    float r = ring(uv, breathe, 0.04, blurAmt);
    // Soft glow inside
    float glow = exp(-length(uv - 0.5) * 6.0) * 0.15;
    // Subtle edge shimmer
    float shimmer = smoothNoise(uv * 10.0 + t * 0.1) * 0.02;
    return max(r, glow + shimmer);
  }

  // -----------------------------------------------------------------------
  // Phase — Wave Ring (uAnim == 1)
  // ------------------------------------------------------------------------
  float waveRing(vec2 uv, float t) {
    vec2 centered = uv - 0.5;
    float angle = atan(centered.y, centered.x);
    float dist = length(centered);
    float breath = 0.25;
    float waveOffset = 0.06 * sin(angle * 4.0 + t * 1.2)
                     + 0.03 * sin(angle * 7.0 - t * 0.8);
    float radius = breath + waveOffset;
    float r = ring(uv, radius, 0.035, 0.025);
    // Add trailing glow from waves
    float trail = exp(-abs(dist - radius) * 20.0) * 0.08;
    return max(r, trail);
  }

  // -----------------------------------------------------------------------
  // Phase — Dissolve (uAnim == 2)
  // ------------------------------------------------------------------------
  float dissolveRing(vec2 uv, float t) {
    vec2 centered = uv - 0.5;
    float dist = length(centered);
    float breath = 0.25;

    // Ring base
    float r = ring(uv, breath, 0.04, 0.02);

    // Break into dots using noise
    float noise = fbm(uv * 12.0 + t * 0.08);
    float progress = clamp(t * 0.08, 0.0, 1.0); // slow dissolve over ~12s
    float threshold = mix(0.3, 0.8, progress);
    float mask = smoothstep(threshold - 0.1, threshold + 0.1, noise);
    r *= (1.0 - mask * 0.9);

    // Floating embers
    float ember = 0.0;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      vec2 offset = vec2(
        sin(t * 0.15 + fi * 1.7) * 0.25,
        cos(t * 0.12 + fi * 2.3) * 0.15
      );
      vec2 emberPos = uv - 0.5 - offset;
      float ed = length(emberPos);
      ember += 0.015 / (ed * 3.0 + 0.2);
    }
    ember *= progress;

    // Ring glow
    float glow = exp(-dist * 8.0) * 0.08 * (1.0 - progress * 0.6);

    return max(r, max(ember, glow));
  }

  // -----------------------------------------------------------------------
  // Phase — Expand (uAnim == 3)
  // ------------------------------------------------------------------------
  float expandRing(vec2 uv, float t) {
    vec2 centered = uv - 0.5;
    float dist = length(centered);
    float progress = clamp(t * 0.06, 0.0, 1.0); // expands over ~16s

    float radius = mix(0.15, 0.6, progress);
    float width = mix(0.04, 0.01, progress);
    float blurAmt = mix(0.02, 0.08, progress);
    float r = ring(uv, radius, width, blurAmt);

    // Fade out as it expands
    float fade = 1.0 - smoothstep(0.3, 1.0, progress);
    r *= fade;

    // Outer glow trail
    float glow = exp(-abs(dist - radius) * 10.0) * 0.06 * fade;

    return max(r, glow);
  }

  // -----------------------------------------------------------------------
  // Phase — Spiral (uAnim == 4)
  // ------------------------------------------------------------------------
  float spiralRing(vec2 uv, float t) {
    vec2 centered = uv - 0.5;
    float angle = atan(centered.y, centered.x);
    float dist = length(centered);
    float breath = 0.25;

    // Two contra-rotating spirals
    float spiral1 = sin(angle * 5.0 - t * 1.5) * 0.04;
    float spiral2 = cos(angle * 5.0 + t * 1.3) * 0.04;
    float spiral = (spiral1 + spiral2) * 0.5;

    float radius = breath + spiral;
    float r = ring(uv, radius, 0.03, 0.02);

    // Glowing spokes
    float spokes = 0.0;
    for (int i = 0; i < 8; i++) {
      float fi = float(i);
      float a = fi / 8.0 * 6.2832 + t * 0.1;
      vec2 dir = vec2(cos(a), sin(a));
      float dot = max(0.0, dot(centered, dir)) / max(dist, 0.001);
      dot = 1.0 - abs(dist - breath * 0.5) / 0.15;
      spokes += max(0.0, dot * 0.05);
    }

    return max(r, spokes);
  }

  // -----------------------------------------------------------------------
  // Main
  // ------------------------------------------------------------------------
  void main() {
    vec2 uv = vUv;
    float t = uTime;
    float frame = uFrame;
    int anim = uAnim;
    float blend = uBlend;

    // Current animation value
    float val;
    if (anim == 0) val = calmRing(uv, t);
    else if (anim == 1) val = waveRing(uv, t);
    else if (anim == 2) val = dissolveRing(uv, t);
    else if (anim == 3) val = expandRing(uv, t);
    else val = spiralRing(uv, t);

    // When blending into calm (anim 0) or from calm, mix
    float prevVal = calmRing(uv, t - 0.3);
    float finalVal;
    if (blend < 1.0) {
      finalVal = mix(prevVal, val, smoothstep(0.0, 1.0, blend));
    } else {
      finalVal = val;
    }

    // Colors
    vec3 color;
    float intensity = finalVal;

    // Mix colors based on intensity and subtle time shift
    vec3 col1 = uC1;  // gold
    vec3 col2 = uC2;  // cyan
    vec3 col3 = uC3;  // green

    float hueShift = 0.5 + 0.5 * sin(t * 0.05 + uv.x * 2.0);
    vec3 mixed = mix(col1, col2, hueShift * 0.4);
    mixed = mix(mixed, col3, intensity * 0.3);

    color = mixed * intensity * 0.9;

    // Ambient glow near center
    float ambientGlow = exp(-length(uv - 0.5) * 4.0) * 0.06;
    if (anim == 0) ambientGlow *= 1.0;
    else ambientGlow *= 0.5 + 0.5 * (1.0 - blend);
    color += col1 * ambientGlow;

    // Subtle vertical gradient (dark at edges)
    float vertFade = 1.0 - abs(uv.y - 0.5) * 1.2;
    color *= smoothstep(0.0, 1.0, vertFade);

    // Output
    gl_FragColor = vec4(color, 0.85);
  }
`;

// ---------------------------------------------------------------------------
// Particle system — orbiting dots around the ring
// ---------------------------------------------------------------------------

const ORBIT_PARTICLES = 80;

function createOrbitParticles(): {
  points: THREE.Points;
  geometry: THREE.BufferGeometry;
  data: Float32Array;
} {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(ORBIT_PARTICLES * 3);
  const colors = new Float32Array(ORBIT_PARTICLES * 3);
  const data = new Float32Array(ORBIT_PARTICLES * 3); // angle, radiusOffset, speed

  const palette = [
    PALETTE.gold,
    PALETTE.aeroCyan,
    PALETTE.neonGreen,
  ];

  for (let i = 0; i < ORBIT_PARTICLES; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.2 + Math.random() * 0.08;
    const speed = 0.2 + Math.random() * 0.3;
    const spread = (Math.random() - 0.5) * 0.02;

    positions[i * 3] = Math.cos(angle) * radius + 0.5 + spread;
    positions[i * 3 + 1] = Math.sin(angle) * radius + 0.5 + spread;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 0.1;

    const col = palette[Math.floor(Math.random() * palette.length)];
    colors[i * 3] = col.r;
    colors[i * 3 + 1] = col.g;
    colors[i * 3 + 2] = col.b;

    data[i * 3] = angle;
    data[i * 3 + 1] = radius;
    data[i * 3 + 2] = speed;
  }

  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.015,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.6,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  return { points, geometry, data };
}

// ---------------------------------------------------------------------------
// Animation controller — manages phase cycle
// ---------------------------------------------------------------------------
// calm (6s) → wave (10s) → return (3s) → calm (6s) → dissolve (12s) → return (3s) → ...

interface PhaseSchedule {
  anim: number;     // 0-4
  duration: number; // seconds for the animation to play
  holdAfter: number; // seconds in calm after this phase
}

const SCHEDULE: PhaseSchedule[] = [
  { anim: 1, duration: 10, holdAfter: 6 },  // wave
  { anim: 2, duration: 12, holdAfter: 6 },  // dissolve
  { anim: 3, duration: 14, holdAfter: 6 },  // expand
  { anim: 4, duration: 10, holdAfter: 6 },  // spiral
];

const TRANSITION_DURATION = 3.0; // seconds to transition (return to calm, then to next)

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

  // --- Aurora ring scene ---
  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 1;

  const uniforms = {
    uTime: { value: 0 },
    uFrame: { value: 0 },
    uAnim: { value: 0 },
    uBlend: { value: 1.0 },
    uC1: { value: PALETTE.gold },
    uC2: { value: PALETTE.aeroCyan },
    uC3: { value: PALETTE.neonGreen },
  };

  const ringMaterial = new THREE.ShaderMaterial({
    vertexShader: RING_VERTEX,
    fragmentShader: RING_FRAGMENT,
    uniforms,
    depthWrite: false,
    transparent: true,
  });

  const ringMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(2, 2),
    ringMaterial
  );
  scene.add(ringMesh);

  // --- Orbit particles ---
  const { points, geometry, data } = createOrbitParticles();
  scene.add(points);

  // --- Animation state machine ---
  let scheduleIndex = 0;
  let stateTime = 0;          // time since start of current schedule item
  let calmTime = 0;           // time spent in calm after transition
  let isInTransition = false; // true during return to calm
  let isReturningToCalm = false; // returning after animation
  let transitionElapsed = 0;

  // Start in calm
  let currentAnim = 0;
  let blendTarget = 1.0;

  // --- Animation loop ---
  let animId: number;
  let isVisible = true;
  let lastTime = performance.now();
  let frameCount = 0;

  function animate() {
    animId = requestAnimationFrame(animate);
    if (!isVisible) return;

    frameCount++;
    if (frameCount % 2 !== 0) return; // cap at ~30fps

    const now = performance.now();
    const dt = Math.min((now - lastTime) / 1000, 0.1);
    lastTime = now;

    // ---- Phase state machine ----
    stateTime += dt;

    const phase = SCHEDULE[scheduleIndex];
    let anim = 0;
    let frame = 0;
    let blend = 1.0;

    if (isReturningToCalm) {
      // Slowly returning to calm base
      transitionElapsed += dt;
      blend = 1.0 - smoothstep(0, TRANSITION_DURATION, transitionElapsed);
      anim = currentAnim;
      frame = clamp(stateTime / phase.duration, 0, 1);

      if (transitionElapsed >= TRANSITION_DURATION) {
        // Reached calm base — hold
        isReturningToCalm = false;
        isInTransition = false;
        calmTime = 0;
        anim = 0;
        blend = 1.0;
        frame = 0;
      }
    } else if (currentAnim === 0) {
      // Currently in calm state
      calmTime += dt;

      if (calmTime >= phase.holdAfter) {
        // Start transition INTO next animation
        isInTransition = true;
        isReturningToCalm = false;
        transitionElapsed = 0;
        stateTime = 0;
        currentAnim = phase.anim;
      }

      anim = 0;
      blend = 1.0;
      frame = 0;
    } else {
      // In animation phase
      if (isInTransition) {
        // Still blending into the animation
        transitionElapsed += dt;
        blend = smoothstep(0, TRANSITION_DURATION, transitionElapsed);
        anim = currentAnim;
        frame = clamp(stateTime / phase.duration, 0, 1);

        if (transitionElapsed >= TRANSITION_DURATION) {
          isInTransition = false;
          blend = 1.0;
        }
      } else if (stateTime >= phase.duration) {
        // Animation ended — return to calm
        isReturningToCalm = true;
        transitionElapsed = 0;
        stateTime = 0;

        // Move to next phase
        scheduleIndex = (scheduleIndex + 1) % SCHEDULE.length;
      }

      if (!isInTransition && !isReturningToCalm) {
        blend = 1.0;
        anim = currentAnim;
        frame = clamp(stateTime / phase.duration, 0, 1);
      }
    }

    // Update uniforms
    uniforms.uTime.value += dt;
    uniforms.uFrame.value = frame;
    uniforms.uAnim.value = anim;
    uniforms.uBlend.value = clamp(blend, 0, 1);

    // Update orbit particles
    const posArr = geometry.attributes.position.array as Float32Array;
    const expandFactor = (currentAnim === 3 && (isInTransition || stateTime > 0))
      ? (1.0 + 0.5 * clamp(stateTime / 14.0, 0, 1) * blend)
      : 1.0;

    for (let i = 0; i < ORBIT_PARTICLES; i++) {
      const i3 = i * 3;
      const angle = data[i3] + data[i3 + 2] * uniforms.uTime.value * 0.15;
      const radius = data[i3 + 1] * expandFactor;

      posArr[i3] = Math.cos(angle) * radius + 0.5;
      posArr[i3 + 1] = Math.sin(angle) * radius + 0.5;
      // Slight z wobble
      posArr[i3 + 2] = Math.sin(uniforms.uTime.value * 0.5 + data[i3]) * 0.02;
    }
    geometry.attributes.position.needsUpdate = true;

    // Particle opacity follows calm/expand state
    points.material.opacity = (currentAnim === 3)
      ? 0.6 * (1.0 - 0.7 * clamp(stateTime / 14.0, 0, 1) * blend)
      : 0.6;

    // Render
    renderer.clear();
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
  }
  window.addEventListener("resize", onResize);

  // --- Cleanup ---
  return () => {
    cancelAnimationFrame(animId);
    document.removeEventListener("visibilitychange", onVisibilityChange);
    window.removeEventListener("resize", onResize);
    renderer.dispose();
    ringMaterial.dispose();
    ringMesh.geometry.dispose();
    points.material.dispose();
    geometry.dispose();
    if (container.contains(renderer.domElement)) {
      container.removeChild(renderer.domElement);
    }
  };
}

// Helper
function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
