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
// Ring Aurora Shader — organic nebula-like ring at screen center
// ---------------------------------------------------------------------------
// Uses noise-driven aurora texture (like the original nebula) but shaped
// into a wide organic ring. The ring breathes, waves, dissolves, expands,
// and spirals — using the same noise palette as the original nebula shader.
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
  uniform float uBlend;        // 0..1 blend INTO current anim
  uniform vec3  uC1;           // gold
  uniform vec3  uC2;           // cyan
  uniform vec3  uC3;           // green

  // -----------------------------------------------------------------------
  // Noise — same style as original nebula shader
  // -----------------------------------------------------------------------
  float cheapNoise(vec2 p, float t) {
    return sin(p.x * 1.8 + sin(p.y * 2.5 + t * 0.12) * 1.4 + t * 0.06)
         * cos(p.y * 1.5 + sin(p.x * 3.2 + t * 0.09) * 1.1 + t * 0.04);
  }

  float hash21(vec2 p) {
    p = fract(p * vec2(234.34, 435.345));
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }

  float smoothNoise2D(vec2 p) {
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
      v += a * smoothNoise2D(p);
      p = rot * p * 2.0;
      a *= 0.5;
    }
    return v;
  }

  // -----------------------------------------------------------------------
  // Auroral ring — wide, organically textured ring using nebula noise
  // -----------------------------------------------------------------------
  // Returns a vec2: x = ring intensity, y = aurora texture inside ring
  // -----------------------------------------------------------------------
  vec2 auroraRing(vec2 uv, float t, float radius, float width) {
    vec2 centered = uv - 0.5;
    float d = length(centered);
    float angle = atan(centered.y, centered.x);

    // Noise modulations for organic ring shape
    float waveNoise = cheapNoise(vec2(angle * 1.5, t * 0.06), t * 0.3);
    float fbmMod = fbm(vec2(angle * 2.0 + t * 0.02, sin(t * 0.04) * 0.5));

    // Warp radius with noise (makes ring wavy)
    float radialWobble = waveNoise * 0.06 + fbmMod * 0.04;
    float ringRadius = radius + radialWobble;

    // Ring falloff — gaussian-like for soft organic edges
    float distDelta = d - ringRadius;
    float ringIntensity = exp(-distDelta * distDelta * 250.0 / (width * width));

    // Aurora texture INSIDE the ring band
    // Use the same cheapNoise pattern as the original nebula shader
    float n1 = cheapNoise(uv * 1.2 + vec2(t * 0.015, t * 0.01), t * 0.5);
    float n2 = cheapNoise(uv * 2.5 - vec2(t * 0.02, 0.0), t * 0.7);
    float n3 = cheapNoise(uv * 4.0 + vec2(t * 0.025, -t * 0.015), t * 1.0);
    float n4 = cheapNoise(uv * 7.0 - vec2(t * 0.03, t * 0.02), t * 1.3);

    // Blend noise into an aurora-band texture
    float auroraTex = n1 * 0.35 + n2 * 0.28 + n3 * 0.20 + n4 * 0.17;
    auroraTex = smoothstep(-0.2, 0.9, auroraTex);

    // Extra texture from fbm for organic richness
    float fbmTex = fbm(uv * 3.0 + t * 0.03);

    // Combine: ring shape × aurora texture
    float final = ringIntensity * (0.4 + 0.6 * auroraTex);

    return vec2(final, auroraTex);
  }

  // -----------------------------------------------------------------------
  // Phase — Calm Ring (uAnim == 0)
  // -----------------------------------------------------------------------
  float calmRing(vec2 uv, float t, out float tex) {
    float breathe = 0.30 + 0.02 * sin(t * 0.25); // bigger than before
    float width = 0.15 + 0.02 * sin(t * 0.3);    // wide organic ring
    vec2 ar = auroraRing(uv, t, breathe, width);
    tex = ar.y;

    // Soft glow at center
    float glow = exp(-length(uv - 0.5) * 3.5) * 0.12;
    // Subtle shimmer on the ring
    float shimmer = smoothNoise2D(uv * 6.0 + t * 0.05) * 0.03;
    // Additional diffuse glow under the ring
    float centerDist = length(uv - 0.5);
    float diffuseGlow = exp(-centerDist * 6.0) * (0.5 + 0.5 * sin(t * 0.15)) * 0.06;

    return max(ar.x + shimmer + diffuseGlow, glow);
  }

  // -----------------------------------------------------------------------
  // Phase — Wave Ring (uAnim == 1)
  // -----------------------------------------------------------------------
  float waveRing(vec2 uv, float t, out float tex) {
    vec2 centered = uv - 0.5;
    float angle = atan(centered.y, centered.x);
    float baseRadius = 0.30;
    float width = 0.15;

    // Standing waves on the ring
    float wave = 0.06 * sin(angle * 3.0 + t * 1.0)
               + 0.04 * sin(angle * 5.0 - t * 0.7)
               + 0.03 * sin(angle * 7.0 + t * 1.4);

    vec2 ar = auroraRing(uv, t, baseRadius + wave, width);
    tex = ar.y;

    // Trailing glow from wave peaks
    float d = length(centered);
    float peakGlow = exp(-abs(d - (baseRadius + wave)) * 15.0) * 0.05;

    return ar.x + peakGlow;
  }

  // -----------------------------------------------------------------------
  // Phase — Dissolve (uAnim == 2)
  // -----------------------------------------------------------------------
  float dissolveRing(vec2 uv, float t, out float tex) {
    vec2 centered = uv - 0.5;
    float d = length(centered);
    float baseRadius = 0.30;
    float width = 0.15;

    vec2 ar = auroraRing(uv, t, baseRadius, width);
    tex = ar.y;

    // Slow dissolve using noise
    float progress = clamp(t * 0.04, 0.0, 1.0); // ~25s full dissolve
    float noise = fbm(uv * 10.0 + t * 0.05);

    // Break ring into patches
    float threshold = mix(0.2, 0.9, progress);
    float dissolve = smoothstep(threshold - 0.15, threshold + 0.15, noise);
    float ringFrag = ar.x * (1.0 - dissolve * 0.95);

    // Floating embers/fragments with nebula-like glow
    float ember = 0.0;
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      vec2 offset = vec2(
        sin(t * 0.1 + fi * 1.7 + sin(t * 0.07 + fi) * 0.3) * 0.35,
        cos(t * 0.08 + fi * 2.3 + cos(t * 0.05 + fi) * 0.3) * 0.25
      );
      vec2 ep = uv - 0.5 - offset;
      float ed = length(ep);
      float emberSize = 0.05 + 0.03 * sin(t * 0.3 + fi);
      ember += (progress * 0.8) * exp(-ed * ed * 200.0) * 0.06;
    }

    // Center glow fades
    float glow = exp(-d * 5.0) * 0.06 * (1.0 - progress * 0.7);

    return max(ringFrag, max(ember, glow));
  }

  // -----------------------------------------------------------------------
  // Phase — Expand (uAnim == 3)
  // -----------------------------------------------------------------------
  float expandRing(vec2 uv, float t, out float tex) {
    vec2 centered = uv - 0.5;
    float d = length(centered);
    float progress = clamp(t * 0.04, 0.0, 1.0); // ~25s expansion

    float radius = mix(0.20, 0.65, progress);
    float width = mix(0.18, 0.03, progress);  // ring thins as it expands

    vec2 ar = auroraRing(uv, t, radius, width);
    tex = ar.y;

    float fade = 1.0 - smoothstep(0.3, 1.0, progress);
    float outerGlow = exp(-abs(d - radius) * 8.0) * 0.04 * fade;

    return ar.x * fade + outerGlow;
  }

  // -----------------------------------------------------------------------
  // Phase — Spiral (uAnim == 4)
  // -----------------------------------------------------------------------
  float spiralRing(vec2 uv, float t, out float tex) {
    vec2 centered = uv - 0.5;
    float angle = atan(centered.y, centered.x);
    float d = length(centered);
    float baseRadius = 0.30;

    // Two contra-rotating spiral arms
    float spiral1 = 0.05 * sin(angle * 4.0 - t * 1.2);
    float spiral2 = 0.05 * cos(angle * 4.0 + t * 1.0);
    float spiral = spiral1 + spiral2;

    vec2 ar = auroraRing(uv, t, baseRadius + spiral, 0.12);
    tex = ar.y;

    // Radiating spokes of aurora noise
    float spokes = 0.0;
    for (int i = 0; i < 6; i++) {
      float fi = float(i);
      float a = fi / 6.0 * 6.2832 + t * 0.05;
      vec2 dir = vec2(cos(a), sin(a));
      float dotVal = max(0.0, dot(normalize(centered + 0.001), dir));
      float distFactor = 1.0 - abs(d - baseRadius) / 0.15;
      spokes += max(0.0, dotVal * distFactor * 0.04);
    }

    // Fade spokes with aurora noise
    float noise = cheapNoise(uv * 2.0 + t * 0.03, t * 0.2);
    spokes *= 0.5 + 0.5 * noise;

    return max(ar.x, spokes);
  }

  // -----------------------------------------------------------------------
  // Main
  // -----------------------------------------------------------------------
  void main() {
    vec2 uv = vUv;
    float t = uTime;
    float frame = uFrame;
    int anim = uAnim;
    float blend = uBlend;

    float tex;
    float val;
    if (anim == 0) val = calmRing(uv, t, tex);
    else if (anim == 1) val = waveRing(uv, t, tex);
    else if (anim == 2) val = dissolveRing(uv, t, tex);
    else if (anim == 3) val = expandRing(uv, t, tex);
    else val = spiralRing(uv, t, tex);

    // Blend from previous (calm) into current
    float prevTex;
    float prevVal = calmRing(uv, t - 0.5, prevTex);
    float finalVal;
    if (blend < 1.0) {
      finalVal = mix(prevVal, val, smoothstep(0.0, 1.0, blend));
      tex = mix(prevTex, tex, smoothstep(0.0, 1.0, blend));
    } else {
      finalVal = val;
    }

    // Colors — same aurora palette as original nebula
    float intensity = finalVal;
    float auroraMix = tex * 0.5 + intensity * 0.5;

    // Mix gold, cyan, green like the original nebula
    vec3 color = mix(uC1, uC2, auroraMix * 0.6);
    color = mix(color, uC3, intensity * 0.3);
    color *= intensity * 0.9;

    // Soft ambient glow at center
    float ambientGlow = exp(-length(uv - 0.5) * 4.0) * 0.05;
    color += uC1 * ambientGlow;

    // Vertical fade (dark at top/bottom edges)
    float vertFade = 1.0 - abs(uv.y - 0.5) * 1.5;
    color *= smoothstep(0.0, 1.0, vertFade);

    // Subtle vignette
    float vig = 1.0 - length(uv - 0.5) * 0.6;
    color *= mix(0.7, 1.0, vig);

    gl_FragColor = vec4(color, 0.85);
  }
`;

// ---------------------------------------------------------------------------
// Particle system — orbiting dots
// ---------------------------------------------------------------------------

const ORBIT_PARTICLES = 60;

function createOrbitParticles(): {
  points: THREE.Points;
  geometry: THREE.BufferGeometry;
  data: Float32Array;
} {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(ORBIT_PARTICLES * 3);
  const colors = new Float32Array(ORBIT_PARTICLES * 3);
  const data = new Float32Array(ORBIT_PARTICLES * 3);

  const palette = [PALETTE.gold, PALETTE.aeroCyan, PALETTE.neonGreen];

  for (let i = 0; i < ORBIT_PARTICLES; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.25 + Math.random() * 0.12;
    const speed = 0.15 + Math.random() * 0.25;

    positions[i * 3] = Math.cos(angle) * radius + 0.5;
    positions[i * 3 + 1] = Math.sin(angle) * radius + 0.5;
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
    size: 0.018,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.5,
    sizeAttenuation: true,
  });

  const points = new THREE.Points(geometry, material);
  return { points, geometry, data };
}

// ---------------------------------------------------------------------------
// Phase schedule
// ---------------------------------------------------------------------------

interface PhaseSchedule {
  anim: number;
  duration: number;
  holdAfter: number;
}

const SCHEDULE: PhaseSchedule[] = [
  { anim: 1, duration: 10, holdAfter: 6 },
  { anim: 2, duration: 14, holdAfter: 6 },
  { anim: 3, duration: 14, holdAfter: 6 },
  { anim: 4, duration: 10, holdAfter: 6 },
];

const TRANSITION_DURATION = 3.0;

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

  // --- State machine ---
  let scheduleIndex = 0;
  let stateTime = 0;
  let calmTime = 0;
  let isInTransition = false;
  let isReturningToCalm = false;
  let transitionElapsed = 0;
  let currentAnim = 0;

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

    stateTime += dt;
    const phase = SCHEDULE[scheduleIndex];
    let anim = 0;
    let frame = 0;
    let blend = 1.0;

    if (isReturningToCalm) {
      transitionElapsed += dt;
      blend = 1.0 - smoothstep(0, TRANSITION_DURATION, transitionElapsed);
      anim = currentAnim;
      frame = clamp(stateTime / phase.duration, 0, 1);
      if (transitionElapsed >= TRANSITION_DURATION) {
        isReturningToCalm = false;
        isInTransition = false;
        calmTime = 0;
        currentAnim = 0;
        anim = 0;
        blend = 1.0;
        frame = 0;
      }
    } else if (currentAnim === 0) {
      calmTime += dt;
      if (calmTime >= phase.holdAfter) {
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
      if (isInTransition) {
        transitionElapsed += dt;
        blend = smoothstep(0, TRANSITION_DURATION, transitionElapsed);
        anim = currentAnim;
        frame = clamp(stateTime / phase.duration, 0, 1);
        if (transitionElapsed >= TRANSITION_DURATION) {
          isInTransition = false;
          blend = 1.0;
        }
      } else if (stateTime >= phase.duration) {
        isReturningToCalm = true;
        transitionElapsed = 0;
        stateTime = 0;
        scheduleIndex = (scheduleIndex + 1) % SCHEDULE.length;
      }
      if (!isInTransition && !isReturningToCalm) {
        blend = 1.0;
        anim = currentAnim;
        frame = clamp(stateTime / phase.duration, 0, 1);
      }
    }

    uniforms.uTime.value += dt;
    uniforms.uFrame.value = frame;
    uniforms.uAnim.value = anim;
    uniforms.uBlend.value = clamp(blend, 0, 1);

    // Update orbit particles
    const posArr = geometry.attributes.position.array as Float32Array;
    const expandFactor = (currentAnim === 3 && !isReturningToCalm)
      ? (1.0 + 0.6 * clamp(stateTime / 14.0, 0, 1) * blend)
      : 1.0;

    for (let i = 0; i < ORBIT_PARTICLES; i++) {
      const i3 = i * 3;
      const angle = data[i3] + data[i3 + 2] * uniforms.uTime.value * 0.12;
      const radius = data[i3 + 1] * expandFactor;
      posArr[i3] = Math.cos(angle) * radius + 0.5;
      posArr[i3 + 1] = Math.sin(angle) * radius + 0.5;
      posArr[i3 + 2] = Math.sin(uniforms.uTime.value * 0.5 + data[i3]) * 0.02;
    }
    geometry.attributes.position.needsUpdate = true;

    points.material.opacity = (currentAnim === 3 && !isReturningToCalm)
      ? 0.5 * (1.0 - 0.7 * clamp(stateTime / 14.0, 0, 1) * blend)
      : 0.5;

    renderer.clear();
    renderer.render(scene, camera);
  }

  function onVisibilityChange() {
    isVisible = !document.hidden;
    if (isVisible) lastTime = performance.now();
  }
  document.addEventListener("visibilitychange", onVisibilityChange);

  animate();

  function onResize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", onResize);

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

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = clamp((x - edge0) / (edge1 - edge0), 0.0, 1.0);
  return t * t * (3.0 - 2.0 * t);
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
