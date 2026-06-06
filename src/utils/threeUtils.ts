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
// Ring Nebula Shader
// ---------------------------------------------------------------------------
// Uses the same aurora noise as the original nebula shader, but sampled
// in polar coordinates so the aurora bands naturally flow around a ring.
// No hard cutoffs — the ring is a gaussian falloff of real nebula noise.
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
  uniform float uFrame;
  uniform int   uAnim;
  uniform float uBlend;
  uniform vec3  uC1;
  uniform vec3  uC2;
  uniform vec3  uC3;

  // -----------------------------------------------------------------------
  // Noise — same cheapNoise from the original nebula shader
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
  // Ring nebula — aurora noise sampled in polar coordinates
  // -----------------------------------------------------------------------
  // Returns aurora intensity at the ring. Noise flows naturally along the
  // ring (angle axis) and radially (radius axis) — like a real nebula ring.
  // -----------------------------------------------------------------------
  float ringNebula(vec2 uv, float t, float ringRadius, float ringWidth) {
    vec2 centered = uv - 0.5;
    float d = length(centered);
    float angle = atan(centered.y, centered.x);

    // --- Polar UV: map (angle, radius) into noise space ---
    // This wraps the nebula noise around the ring naturally.
    float angleNorm = angle / 6.2832;            // 0..1 around the ring
    float radiusNorm = d * 3.0;                  // 0..~1.5 (extends past ring)
    vec2 polarUv = vec2(angleNorm, radiusNorm);

    // --- Aurora noise in polar space (same style as original nebula) ---
    // The noise flows along the ring (angleNorm) and radially (radiusNorm)
    float n1 = cheapNoise(polarUv * 1.5 + vec2(t * 0.015, 0.0), t * 0.5);
    float n2 = cheapNoise(polarUv * 2.5 + vec2(t * 0.02, t * 0.01), t * 0.7);
    float n3 = cheapNoise(polarUv * 4.0 - vec2(t * 0.025, t * 0.015), t * 1.0);
    float n4 = cheapNoise(polarUv * 7.0 + vec2(t * 0.03, -t * 0.02), t * 1.3);

    // Mix noise into aurora bands (same blend as original nebula)
    float aurora = n1 * 0.35 + n2 * 0.28 + n3 * 0.20 + n4 * 0.17;
    aurora = smoothstep(-0.3, 0.9, aurora);

    // --- Additional radial noise for cloud texture within the ring ---
    float radialNoise = fbm(vec2(angleNorm * 3.0 + t * 0.02, radiusNorm * 0.8));
    aurora = mix(aurora, radialNoise, 0.3);

    // --- Ring falloff (gaussian, organic, no hard cut) ---
    float normalizedRadius = ringRadius;
    float gaussianFalloff = exp(-(d - normalizedRadius) * (d - normalizedRadius) * 120.0 / (ringWidth * ringWidth));

    // Nebula × ring shape = ring nebula
    float final = aurora * (0.15 + 0.85 * gaussianFalloff);

    // Add a bit of ambient nebula glow outside the ring
    float outerGlow = aurora * 0.08 * exp(-abs(d - normalizedRadius) * 5.0);

    // Inner fill — faint nebula haze inside the ring
    float innerHaze = aurora * 0.04 * exp(-d * 4.0);

    return max(final, max(outerGlow, innerHaze));
  }

  // -----------------------------------------------------------------------
  // Animations — all modulate the ring parameters
  // -----------------------------------------------------------------------

  // Calm — slow breathing ring
  float animCalm(vec2 uv, float t) {
    float radius = 0.28 + 0.02 * sin(t * 0.2);
    float width  = 0.18 + 0.02 * sin(t * 0.25 + 1.0);
    return ringNebula(uv, t, radius, width);
  }

  // Wave — standing waves deform the ring radius
  float animWave(vec2 uv, float t) {
    vec2 centered = uv - 0.5;
    float angle = atan(centered.y, centered.x);
    float wave = 0.04 * sin(angle * 3.0 + t * 0.8)
               + 0.03 * sin(angle * 5.0 - t * 0.6)
               + 0.02 * sin(angle * 7.0 + t * 1.2);
    float radius = 0.28 + wave;
    float width = 0.18;
    return ringNebula(uv, t, radius, width);
  }

  // Pulse — ring expands and contracts like breathing heavily
  float animPulse(vec2 uv, float t) {
    float pulse = 0.5 + 0.5 * sin(t * 0.4);
    float radius = mix(0.22, 0.35, pulse);
    float width = mix(0.12, 0.22, 1.0 - pulse);
    return ringNebula(uv, t, radius, width);
  }

  // Drift — the noise field slowly rotates, making the nebula texture drift
  float animDrift(vec2 uv, float t) {
    vec2 centered = uv - 0.5;
    float angle = atan(centered.y, centered.x);
    // Rotate the entire noise field slowly
    float rotatedAngle = angle + t * 0.03;
    vec2 rotated = vec2(cos(rotatedAngle), sin(rotatedAngle)) * length(centered);
    return ringNebula(rotated + 0.5, t, 0.28, 0.18);
  }

  // Dissolve — nebula slowly fades into scattered clouds then reforms
  float animDissolve(vec2 uv, float t) {
    float progress = clamp(t * 0.025, 0.0, 1.0); // ~40s cycle
    float radius = 0.28;
    float width = 0.18;

    float base = ringNebula(uv, t, radius, width);

    // Break into patches using fbm noise
    float noise = fbm(uv * 4.0 + t * 0.02);
    float threshold = mix(0.15, 0.85, progress);
    float dissolve = smoothstep(threshold - 0.15, threshold + 0.15, noise);
    float fragmented = base * (1.0 - dissolve * 0.95);

    // Embers: floating patches of aurora
    float ember = 0.0;
    for (int i = 0; i < 5; i++) {
      float fi = float(i);
      vec2 offset = vec2(
        sin(t * 0.06 + fi * 1.7) * 0.3,
        cos(t * 0.05 + fi * 2.3) * 0.2
      );
      vec2 ep = uv - 0.5 - offset;
      float ed = length(ep);
      float intensity = progress * (0.03 / (ed * ed + 0.05));
      ember += intensity;
    }

    // Re-form as progress passes 0.7
    float reform = smoothstep(0.7, 1.0, progress);
    float reformed = base * reform * 0.5;

    return max(fragmented, max(ember, reformed));
  }

  // -----------------------------------------------------------------------
  // Main
  // -----------------------------------------------------------------------
  void main() {
    vec2 uv = vUv;
    float t = uTime;
    float frame = uFrame;
    int animCode = uAnim;
    float blend = uBlend;

    float val;
    if (animCode == 0) val = animCalm(uv, t);
    else if (animCode == 1) val = animWave(uv, t);
    else if (animCode == 2) val = animPulse(uv, t);
    else if (animCode == 3) val = animDrift(uv, t);
    else val = animDissolve(uv, t);

    // Blend transition
    if (blend < 1.0) {
      float prevVal = animCalm(uv, t - 0.5);
      val = mix(prevVal, val, smoothstep(0.0, 1.0, blend));
    }

    // Colors — same aurora palette as original nebula
    float intensity = val * 0.9;

    // Mix gold, cyan, green based on intensity
    vec3 color = mix(uC1, uC2, intensity * 0.5);
    color = mix(color, uC3, intensity * 0.3);
    color *= intensity;

    // Soft ambient center glow
    float centerGlow = exp(-length(uv - 0.5) * 3.5) * 0.04;
    color += uC1 * centerGlow;

    // Vertical fade
    float vertFade = 1.0 - abs(uv.y - 0.5) * 1.3;
    color *= smoothstep(0.0, 1.0, vertFade);

    // Subtle vignette
    float vig = 1.0 - length(uv - 0.5) * 0.5;
    color *= mix(0.7, 1.0, vig);

    gl_FragColor = vec4(color, 0.85);
  }
`;

// ---------------------------------------------------------------------------
// Phase schedule
// ---------------------------------------------------------------------------

interface PhaseSchedule {
  anim: number;
  duration: number;
  holdAfter: number;
}

const SCHEDULE: PhaseSchedule[] = [
  { anim: 1, duration: 12, holdAfter: 6 },  // wave
  { anim: 2, duration: 10, holdAfter: 6 },  // pulse
  { anim: 3, duration: 12, holdAfter: 6 },  // drift
  { anim: 4, duration: 18, holdAfter: 6 },  // dissolve
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

  const ringMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), ringMaterial);
  scene.add(ringMesh);

  // --- State machine ---
  let scheduleIndex = 0;
  let stateTime = 0;
  let calmTime = 0;
  let isInTransition = false;
  let isReturningToCalm = false;
  let transitionElapsed = 0;
  let currentAnim = 0;

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
        anim = 0; blend = 1.0; frame = 0;
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
      anim = 0; blend = 1.0; frame = 0;
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
