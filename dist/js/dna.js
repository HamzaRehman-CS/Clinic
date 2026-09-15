import * as THREE from '../vendor/three.module.js';
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let paused = reduced.matches;
const FIELD_SIZE = 96;
const scenes = [];

function buildHelix(stage) {
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: false, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 1.7));
  stage.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100);
  camera.position.z = 22;

  const group = new THREE.Group();
  scene.add(group);

  let seed = 128;
  const rand = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
  const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(rand(), 0.00001))) * Math.cos(6.283 * rand());

  const pos = [], colors = [], sizes = [];
  const c = new THREE.Color();

  function point(x, y, z, halo = false) {
    pos.push(x, y, z);
    const mix = rand();
    c.set(mix > 0.94 ? '#e4a780' : mix > 0.55 ? '#517bd0' : mix > 0.16 ? '#2d51a3' : '#152f70');
    colors.push(c.r, c.g, c.b);
    sizes.push(halo ? 0.55 + rand() * 0.75 : 1.0 + rand() * 1.5);
  }

  const count = innerWidth < 700 ? 34000 : 74000;
  for (let i = 0; i < count; i++) {
    const y = (rand() - 0.5) * 29;
    const t = y * 0.76;
    const strand = rand() > 0.5 ? 0 : Math.PI;
    const halo = rand() > 0.79;
    const spread = halo ? 0.25 : 0.085;
    const r = 2.22 + gaussian() * spread;
    point(Math.sin(t + strand) * r + gaussian() * spread, y + gaussian() * spread, Math.cos(t + strand) * r + gaussian() * spread, halo);
  }

  for (let j = 0; j < 102; j++) {
    const y = -14.5 + j * 0.287;
    const t = y * 0.76;
    for (let k = 0; k < 160; k++) {
      const u = rand() * 2 - 1;
      const s = Math.sin(u * 9 + j) * 0.034;
      point(Math.sin(t) * 2.22 * u + gaussian() * 0.065, y + gaussian() * 0.055 + s, Math.cos(t) * 2.22 * u + gaussian() * 0.065, true);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('size', new THREE.Float32BufferAttribute(sizes, 1));

  const fieldData = new Float32Array(FIELD_SIZE * FIELD_SIZE * 4);
  const brushField = new THREE.DataTexture(fieldData, FIELD_SIZE, FIELD_SIZE, THREE.RGBAFormat, THREE.FloatType);
  brushField.minFilter = THREE.NearestFilter;
  brushField.magFilter = THREE.NearestFilter;
  brushField.needsUpdate = true;

  const material = new THREE.ShaderMaterial({
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    uniforms: {
      uDpr: { value: renderer.getPixelRatio() },
      uBrushField: { value: brushField }
    },
    vertexShader: `
      attribute float size;
      varying vec3 vColor;
      varying float vDepth;
      uniform float uDpr;
      uniform sampler2D uBrushField;

      vec3 sampleBrush(vec2 uv) {
        vec2 grid = clamp(uv, vec2(0.00520833), vec2(0.99479167)) * 96.0 - 0.5;
        vec2 base = floor(grid), blend = fract(grid);
        vec2 a = (base + 0.5) / 96.0, b = (base + 1.5) / 96.0;
        return mix(
          mix(texture2D(uBrushField, a).xyz, texture2D(uBrushField, vec2(b.x, a.y)).xyz, blend.x),
          mix(texture2D(uBrushField, vec2(a.x, b.y)).xyz, texture2D(uBrushField, b).xyz, blend.x),
          blend.y
        );
      }

      void main() {
        vColor = color;
        vec4 mv = modelViewMatrix * vec4(position, 1.0);
        vec4 clip = projectionMatrix * mv;
        vec3 brush = sampleBrush(clip.xy / clip.w * 0.5 + 0.5);

        float s1 = fract(sin(dot(position, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
        float s2 = fract(s1 * 37.719 + 0.123);
        float s3 = fract(s2 * 19.171 + 0.456);

        vec3 randDir = normalize(vec3(s1 - 0.5, s2 - 0.5, (s3 - 0.5) * 1.3));
        vec2 radialPush = brush.xy * (0.55 * (-mv.z / 22.0));
        float scatterDist = 0.5 + s2 * 0.75;
        vec3 chaoticScatter = randDir * (brush.z * scatterDist);

        mv.xy += radialPush + chaoticScatter.xy;
        mv.z += chaoticScatter.z * 1.0;

        vDepth = clamp((mv.z + 29.0) / 9.0, 0.2, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = size * uDpr * clamp(22.0 / max(5.0, -mv.z), 0.7, 2.0);
      }
    `,
    fragmentShader: `
      varying vec3 vColor;
      varying float vDepth;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        if (d > 0.5) discard;
        float a = smoothstep(0.5, 0.15, d) * (0.35 + vDepth * 0.60);
        gl_FragColor = vec4(mix(vec3(0.82, 0.87, 0.94), vColor, vDepth), a);
      }
    `
  });

  group.add(new THREE.Points(geometry, material));

  const lines = [];
  for (let j = 0; j < 1600; j++) {
    const y = (rand() - 0.5) * 29;
    const t = y * 0.76 + ((j % 2) * Math.PI);
    const r = 2.22 + gaussian() * 0.13;
    lines.push(
      Math.sin(t) * r, y, Math.cos(t) * r,
      Math.sin(t + 0.02 + rand() * 0.05) * r, y + 0.05 + rand() * 0.12, Math.cos(t + 0.04) * r
    );
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.Float32BufferAttribute(lines, 3));
  group.add(new THREE.LineSegments(lg, new THREE.LineBasicMaterial({ color: 0x4665a3, transparent: true, opacity: 0.13, depthWrite: false })));

  group.rotation.z = -0.37;
  group.position.x = 3.6;

  const state = {
    renderer, scene, camera, group, material, stage,
    fieldData, brushField, visible: true, phase: 0,
    halfHeight: 7.575, halfWidth: 7.575, hasDisplacement: false
  };

  const resize = () => {
    const { width, height } = stage.getBoundingClientRect();
    if (!width || !height) return;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    state.halfHeight = Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * 22;
    state.halfWidth = state.halfHeight * camera.aspect;
    group.position.x = width < 650 ? 2.6 : 3.6;
    group.scale.setScalar(width < 650 ? 0.89 : 1);
    renderer.render(scene, camera);
  };
  new ResizeObserver(resize).observe(stage);
  resize();

  new IntersectionObserver(([e]) => state.visible = e.isIntersecting, { rootMargin: '100px' }).observe(stage);
  scenes.push(state);
}

for (const stage of document.querySelectorAll('.dna-stage')) {
  try {
    buildHelix(stage);
  } catch (e) {
    document.body.classList.add('no-webgl');
    console.warn('DNA rendering unavailable', e);
  }
}

const pointer = {
  x: 0,
  y: 0,
  active: false,
  hasMoved: false
};

addEventListener('pointermove', e => {
  if (e.pointerType === 'touch') return;
  pointer.x = e.clientX;
  pointer.y = e.clientY;
  pointer.active = true;
  pointer.hasMoved = true;
}, { passive: true });

const deactivatePointer = () => {
  pointer.active = false;
  pointer.hasMoved = false;
};

document.documentElement.addEventListener('pointerleave', deactivatePointer);
window.addEventListener('mouseleave', deactivatePointer);
window.addEventListener('blur', deactivatePointer);

function updateBrush(s, dt) {
  const r = s.stage.getBoundingClientRect();
  const isInside = pointer.active && (
    pointer.x >= r.left - 40 &&
    pointer.x <= r.right + 40 &&
    pointer.y >= r.top - 40 &&
    pointer.y <= r.bottom + 40
  );

  if (!isInside && !s.hasDisplacement) {
    return;
  }

  const halfHeight = s.halfHeight || (Math.tan(THREE.MathUtils.degToRad(s.camera.fov / 2)) * 22);
  const halfWidth = s.halfWidth || (halfHeight * s.camera.aspect);

  const cx = ((pointer.x - r.left) / r.width * 2 - 1) * halfWidth;
  const cy = (1 - (pointer.y - r.top) / r.height * 2) * halfHeight;

  const px = s.prevCx !== undefined ? s.prevCx : cx;
  const py = s.prevCy !== undefined ? s.prevCy : cy;

  if (isInside) {
    s.prevCx = cx;
    s.prevCy = cy;
    s.hasDisplacement = true;
  } else {
    delete s.prevCx;
    delete s.prevCy;
  }

  const BRUSH_RADIUS = 2.1;
  const segDx = cx - px;
  const segDy = cy - py;
  const segLenSq = segDx * segDx + segDy * segDy;

  const attack = 1 - Math.exp(-dt * 26);
  const release = 1 - Math.exp(-dt * 2.4);

  const data = s.fieldData;
  let maxEnergy = 0;

  for (let y = 0; y < FIELD_SIZE; y++) {
    const gy = ((y + 0.5) / FIELD_SIZE * 2 - 1) * halfHeight;
    for (let x = 0; x < FIELD_SIZE; x++) {
      const gx = ((x + 0.5) / FIELD_SIZE * 2 - 1) * halfWidth;
      const i = (y * FIELD_SIZE + x) * 4;

      let targetPushX = 0;
      let targetPushY = 0;
      let targetStr = 0;

      if (isInside) {
        let t = 0;
        if (segLenSq > 0.0001) {
          t = ((gx - px) * segDx + (gy - py) * segDy) / segLenSq;
          t = Math.max(0, Math.min(1, t));
        }
        const closeX = px + t * segDx;
        const closeY = py + t * segDy;
        const dx = gx - closeX;
        const dy = gy - closeY;
        const dist = Math.hypot(dx, dy);

        if (dist < BRUSH_RADIUS) {
          const norm = dist / BRUSH_RADIUS;
          const falloff = 1 - norm;
          targetStr = falloff * falloff * (3 - 2 * falloff);
          const invDist = dist > 0.001 ? 1 / dist : 0;
          targetPushX = dx * invDist * targetStr;
          targetPushY = dy * invDist * targetStr;
        }
      }

      if (targetStr > data[i + 2]) {
        data[i] += (targetPushX - data[i]) * attack;
        data[i + 1] += (targetPushY - data[i + 1]) * attack;
        data[i + 2] += (targetStr - data[i + 2]) * attack;
      } else {
        data[i] += (0 - data[i]) * release;
        data[i + 1] += (0 - data[i + 1]) * release;
        data[i + 2] += (0 - data[i + 2]) * release;
      }

      if (data[i + 2] > maxEnergy) {
        maxEnergy = data[i + 2];
      }
    }
  }

  if (!isInside && maxEnergy < 0.003) {
    data.fill(0);
    s.hasDisplacement = false;
  }

  s.brushField.needsUpdate = true;
}

let last = 0;
function frame(now) {
  requestAnimationFrame(frame);
  const dt = Math.min((now - last) / 1000, 0.05);
  last = now;
  if (document.hidden || paused) return;

  for (const s of scenes) {
    if (!s.visible) continue;
    updateBrush(s, dt);
    s.phase += dt;
    s.group.rotation.y = s.phase * 0.115;
    s.renderer.render(s.scene, s.camera);
  }
}
requestAnimationFrame(frame);

reduced.addEventListener('change', e => {
  paused = e.matches;
  if (paused) {
    for (const s of scenes) {
      s.fieldData.fill(0);
      s.hasDisplacement = false;
      s.brushField.needsUpdate = true;
      s.renderer.render(s.scene, s.camera);
    }
  }
});
