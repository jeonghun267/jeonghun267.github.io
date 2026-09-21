
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';

/* OJH hero scene — five diorama cubes, Unity-style Edit/Play toolbar, debug overlay.
   Content comes from config.js (window.PORTFOLIO_CONFIG). Clicking a cube asks app.js to open
   the project dialog via the 'ojh:open-project' event; app.js reports back with 'ojh:project-closed'.
   Rendering is capped by devicePixelRatio 1.5, bloom is skipped on narrow screens, and everything
   idles when app.js says motion is off (window.OJH_HERO.setRunning). */
/* ---------- data ---------- */
const CONFIG = window.PORTFOLIO_CONFIG || { projects: [] };
const BUILDERS = { still:'aquarium', humanbody:'body', aac:'store', block:'trading', xbit:'git' };
const TONES = { still:0x5aa9ff, humanbody:0xff7ab8, aac:0xffb35a, block:0x5ee0b0, xbit:0xb7a6ff };
const ORDER = ['still', 'humanbody', 'aac', 'block', 'xbit'];
const PROJECTS = ORDER.map(id => CONFIG.projects.find(p => p.id === id)).filter(Boolean)
  .map(p => ({ id:p.id, title:p.title, field:p.category, tone:TONES[p.id], builder:BUILDERS[p.id] }));
const LAYOUT = [ // x, y, z, scale — right-side cluster, hero copy sits on the left
  [ 0.0,  0.15,  0.0, 1.0],
  [-2.35, 1.25, -0.9, 0.82],
  [ 2.45, 1.15, -0.9, 0.82],
  [-2.05,-1.45, -0.5, 0.86],
  [ 2.25,-1.55, -0.5, 0.86],
];

/* ---------- renderer / scene ---------- */
const canvas = document.getElementById('stage');
if (!canvas) throw new Error('hero canvas missing');
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:false, powerPreference:'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.05;
renderer.outputColorSpace = THREE.SRGBColorSpace; renderer.info.autoReset = false;
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x04080d);
scene.fog = new THREE.Fog(0x04080d, 12, 24);
const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 60);
const camHome = new THREE.Vector3(0, 0, 9.2), camLook = new THREE.Vector3(0, 0, 0);
camera.position.copy(camHome);

const world = new THREE.Group(); scene.add(world);
const grid = new THREE.GridHelper(40, 40, 0x243044, 0x161d2b); grid.position.y = -3.1; scene.add(grid);
const gridMat = grid.material; gridMat.transparent = true;

const ambient = new THREE.AmbientLight(0xbcc8ff, 0.18); scene.add(ambient);
const hemi = new THREE.HemisphereLight(0x8fb0ff, 0x1a0f22, 0); scene.add(hemi);
const key = new THREE.DirectionalLight(0xffffff, 0); key.position.set(4, 6, 5); scene.add(key);
const rim = new THREE.DirectionalLight(0x9cb8ff, 0); rim.position.set(-5, 2, -4); scene.add(rim);

/* mini axis gizmo (top-right, like Unity's scene gizmo) */
const gizmoRenderer = new THREE.WebGLRenderer({ canvas:document.getElementById('gizmo'), alpha:true, antialias:true }); gizmoRenderer.setPixelRatio(Math.min(devicePixelRatio, 2)); gizmoRenderer.setSize(84, 84, false);
const gizmoScene = new THREE.Scene();
const gizmoCam = new THREE.PerspectiveCamera(40, 1, 0.1, 10); gizmoCam.position.set(0, 0, 3.2);
const axes = new THREE.AxesHelper(1); axes.material.linewidth = 2; gizmoScene.add(axes);
for (const [c, p] of [[0xff5c6c,[1.25,0,0]],[0x7bff9c,[0,1.25,0]],[0x6aa8ff,[0,0,1.25]]]) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.12, 12, 12), new THREE.MeshBasicMaterial({ color:c })); m.position.set(...p); gizmoScene.add(m);
}

/* ---------- materials & mode bookkeeping ---------- */
const WIRE = new THREE.MeshBasicMaterial({ color:0x5a6784, wireframe:true, transparent:true, opacity:0.9 });
const tracked = []; // { mesh, solid, edges }
function track(mesh, opts = {}) {
  const solid = mesh.material; solid.transparent = true; solid.userData.opacity = solid.opacity ?? 1;
  let edges = null;
  if (!opts.noEdges) {
    edges = new THREE.LineSegments(new THREE.EdgesGeometry(mesh.geometry, 28), new THREE.LineBasicMaterial({ color:0x8fe0ff, transparent:true, opacity:0.55 }));
    edges.visible = false; mesh.add(edges);
  }
  mesh.material = WIRE; mesh.userData.solid = solid;
  tracked.push({ mesh, solid, edges });
  return mesh;
}
const M = (color, extra = {}) => new THREE.MeshStandardMaterial({ color, roughness:0.55, metalness:0.05, ...extra });

/* ---------- cube builders ---------- */
const cubes = []; // { group, glass, light, project, update(t,dt), floatSeed }
const S = 1.55, H = S / 2;

function makeCube(project, layout, builder, i) {
  const g = new THREE.Group(); g.position.set(layout[0], layout[1], layout[2]); g.scale.setScalar(layout[3]);
  g.userData.base = g.position.clone(); g.userData.baseScale = layout[3];
  // glass shell
  const glass = new THREE.Mesh(new THREE.BoxGeometry(S, S, S), new THREE.MeshPhysicalMaterial({ color:project.tone, roughness:0.08, metalness:0, transparent:true, opacity:0.05, side:THREE.DoubleSide, depthWrite:false }));
  glass.userData.project = project; glass.userData.cube = i;
  g.add(track(glass, { noEdges:true }));
  const frame = new THREE.LineSegments(new THREE.EdgesGeometry(glass.geometry), new THREE.LineBasicMaterial({ color:project.tone, transparent:true, opacity:0.75 }));
  g.add(frame);
  // base plate
  const plate = new THREE.Mesh(new THREE.BoxGeometry(S * 0.96, 0.06, S * 0.96), M(0x0b1220, { emissive:project.tone, emissiveIntensity:0.12, roughness:0.4 }));
  plate.position.y = -H + 0.03; g.add(track(plate));
  // per-cube light
  const light = new THREE.PointLight(project.tone, 0, 4.5, 2); light.position.set(0, H * 0.7, 0); g.add(light);
  const inner = new THREE.Group(); g.add(inner);
  const update = builder(inner, project) || (() => {});
  world.add(g);
  cubes.push({ group:g, glass, frame, light, project, update, seed:i * 1.7, targetScale:layout[3] });
}

/* 01 STILL — aquarium with boids */
function buildAquarium(root, p) {
  const water = new THREE.Mesh(new THREE.BoxGeometry(S * 0.9, S * 0.78, S * 0.9), new THREE.MeshPhysicalMaterial({ color:0x1e6fd1, transparent:true, opacity:0.22, roughness:0.15, side:THREE.BackSide, depthWrite:false }));
  water.position.y = -0.06; root.add(track(water, { noEdges:true }));
  const sand = new THREE.Mesh(new THREE.BoxGeometry(S * 0.9, 0.08, S * 0.9), M(0xcbb88a, { roughness:0.95 })); sand.position.y = -H + 0.1; root.add(track(sand));
  const weeds = [];
  for (let k = 0; k < 6; k++) {
    const w = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.03, 0.42 + Math.random() * 0.25, 5), M(0x2fa66f, { emissive:0x0e5a3a, emissiveIntensity:0.5 }));
    w.geometry.translate(0, 0.25, 0); w.position.set((Math.random() - .5) * 1.1, -H + 0.14, (Math.random() - .5) * 1.1); w.rotation.z = (Math.random() - .5) * .3;
    root.add(track(w)); weeds.push(w);
  }
  const rock = new THREE.Mesh(new THREE.DodecahedronGeometry(0.18, 0), M(0x3a4a66)); rock.position.set(0.35, -H + 0.25, -0.3); rock.scale.set(1.3, .8, 1); root.add(track(rock));
  // boids
  const N = 64, bounds = 0.52;
  const fish = new THREE.InstancedMesh(new THREE.ConeGeometry(0.022, 0.095, 5).rotateX(Math.PI / 2), M(0xffd166, { emissive:0xff9a3c, emissiveIntensity:0.35, roughness:0.4 }), N);
  fish.instanceMatrix.setUsage(THREE.DynamicDrawUsage); root.add(track(fish, { noEdges:true }));
  const pos = [], vel = [];
  for (let k = 0; k < N; k++) { pos.push(new THREE.Vector3((Math.random() - .5) * bounds * 1.6, (Math.random() - .5) * bounds * 1.2, (Math.random() - .5) * bounds * 1.6)); vel.push(new THREE.Vector3().randomDirection().multiplyScalar(0.35)); }
  const tmp = new THREE.Object3D(), acc = new THREE.Vector3(), d = new THREE.Vector3();
  const centre = new THREE.Vector3(0, -0.05, 0);
  // bubbles
  const BN = 40, bpos = new Float32Array(BN * 3);
  for (let k = 0; k < BN; k++) { bpos[k*3] = (Math.random() - .5) * 1.1; bpos[k*3+1] = -H + Math.random() * S * .8; bpos[k*3+2] = (Math.random() - .5) * 1.1; }
  const bubbles = new THREE.Points(new THREE.BufferGeometry().setAttribute('position', new THREE.BufferAttribute(bpos, 3)), new THREE.PointsMaterial({ color:0xcfe8ff, size:0.03, transparent:true, opacity:0.8, depthWrite:false }));
  bubbles.visible = false; root.add(bubbles);
  const caustic = new THREE.PointLight(0x7ec8ff, 0, 2.2, 2); caustic.position.set(0, 0.5, 0); root.add(caustic);
  root.userData.stats = { fish:N };
  return (t, dt, playing) => {
    bubbles.visible = playing; caustic.intensity = playing ? 1.6 + Math.sin(t * 3) * 0.5 : 0;
    caustic.position.x = Math.sin(t * .8) * .4; caustic.position.z = Math.cos(t * .6) * .4;
    for (let k = 0; k < weeds.length; k++) weeds[k].rotation.z = Math.sin(t * 1.4 + k) * .12;
    for (let k = 0; k < N; k++) {
      const P = pos[k], V = vel[k]; acc.set(0, 0, 0); let cnt = 0;
      for (let j = 0; j < N; j++) { if (j === k) continue; d.subVectors(pos[j], P); const L = d.length();
        if (L < 0.32) { cnt++; acc.addScaledVector(d, 0.35); acc.addScaledVector(vel[j], 0.25); if (L < 0.11) acc.addScaledVector(d, -3.5 / (L + .01)); } }
      if (cnt) acc.multiplyScalar(1 / cnt);
      d.subVectors(centre, P); acc.addScaledVector(d, 0.9);
      const wall = bounds; ['x','y','z'].forEach(a => { const lim = a === 'y' ? wall * .72 : wall; if (P[a] > lim) acc[a] -= (P[a] - lim) * 12; if (P[a] < -lim) acc[a] += (-lim - P[a]) * 12; });
      V.addScaledVector(acc, dt); const sp = V.length(); const want = 0.45; V.multiplyScalar(THREE.MathUtils.lerp(sp, want, 0.08) / (sp || 1));
      P.addScaledVector(V, dt);
      tmp.position.copy(P); tmp.lookAt(P.x + V.x, P.y + V.y, P.z + V.z); tmp.scale.setScalar(0.9 + (k % 4) * .08); tmp.updateMatrix(); fish.setMatrixAt(k, tmp.matrix);
    }
    fish.instanceMatrix.needsUpdate = true;
    const a = bubbles.geometry.attributes.position; for (let k = 0; k < BN; k++) { a.array[k*3+1] += dt * (0.12 + (k % 5) * .03); a.array[k*3] += Math.sin(t * 2 + k) * .0006; if (a.array[k*3+1] > H * .7) a.array[k*3+1] = -H + .15; } a.needsUpdate = true;
  };
}

/* 02 인체탐험 — organ tube with travelling cells and light shafts */
function buildBody(root, p) {
  const pts = []; for (let k = 0; k < 9; k++) { const a = k / 8 * Math.PI * 2.4; pts.push(new THREE.Vector3(Math.cos(a) * .42, -.45 + k * .11 + Math.sin(a * 2) * .06, Math.sin(a) * .42)); }
  const curve = new THREE.CatmullRomCurve3(pts, false, 'catmullrom', .6);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 120, 0.12, 12, false), new THREE.MeshPhysicalMaterial({ color:0xff6f9c, emissive:0x6a1436, emissiveIntensity:.55, roughness:.35, transparent:true, opacity:.85, side:THREE.DoubleSide }));
  root.add(track(tube));
  const cells = new THREE.InstancedMesh(new THREE.SphereGeometry(0.035, 8, 8), M(0xffd9e6, { emissive:0xff4f7a, emissiveIntensity:.9 }), 22); root.add(track(cells, { noEdges:true }));
  const rays = [];
  for (let k = 0; k < 3; k++) { const r = new THREE.Mesh(new THREE.ConeGeometry(0.16, 1.4, 12, 1, true), new THREE.MeshBasicMaterial({ color:0xffb3cc, transparent:true, opacity:0.08, side:THREE.DoubleSide, blending:THREE.AdditiveBlending, depthWrite:false }));
    r.position.set(0, .05, 0); r.rotation.z = Math.PI; root.add(track(r, { noEdges:true })); rays.push(r); }
  const tmp = new THREE.Object3D();
  return (t, dt, playing) => {
    for (let k = 0; k < 22; k++) { const u = ((t * .07) + k / 22) % 1; const P = curve.getPointAt(u); tmp.position.copy(P); tmp.scale.setScalar(1 + Math.sin(t * 4 + k) * .2); tmp.updateMatrix(); cells.setMatrixAt(k, tmp.matrix); }
    cells.instanceMatrix.needsUpdate = true;
    rays.forEach((r, k) => { r.rotation.y = t * .3 + k * 2.1; r.rotation.x = Math.sin(t * .5 + k) * .35; r.userData.solid.opacity = playing ? .07 + Math.sin(t * 1.3 + k) * .03 : 0; });
    tube.userData.solid.emissiveIntensity = .45 + Math.sin(t * 2.2) * .18;
  };
}

/* 03 AAC — convenience store counter with clerk */
function buildStore(root, p) {
  const floor = new THREE.Mesh(new THREE.BoxGeometry(S * .92, .04, S * .92), M(0xd8dde8, { roughness:.9 })); floor.position.y = -H + .08; root.add(track(floor));
  const counter = new THREE.Mesh(new THREE.BoxGeometry(.9, .34, .28), M(0x1a56db, { roughness:.5 })); counter.position.set(0, -H + .27, .25); root.add(track(counter));
  const top = new THREE.Mesh(new THREE.BoxGeometry(.96, .04, .34), M(0xf5f7fb)); top.position.set(0, -H + .46, .25); root.add(track(top));
  for (const x of [-.45, .45]) { const shelf = new THREE.Mesh(new THREE.BoxGeometry(.3, .9, .18), M(0xe9ecf3, { roughness:.8 })); shelf.position.set(x, -H + .55, -.5); root.add(track(shelf));
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) { const item = new THREE.Mesh(new THREE.BoxGeometry(.07, .09, .07), M([0xff6b6b,0xffd166,0x4ecdc4,0x8ecae6,0xff9f1c][(r*3+c)%5], { emissiveIntensity:.15 })); item.position.set(x - .09 + c * .09, -H + .2 + r * .28, -.4); root.add(track(item, { noEdges:true })); } }
  const clerkBody = new THREE.Mesh(new THREE.CapsuleGeometry(.09, .22, 4, 10), M(0x2b3d63)); clerkBody.position.set(0, -H + .36, -.05); root.add(track(clerkBody));
  const clerkHead = new THREE.Mesh(new THREE.SphereGeometry(.09, 12, 12), M(0xffd8b8)); clerkHead.position.set(0, -H + .64, -.05); root.add(track(clerkHead));
  const bubble = new THREE.Group(); const bb = new THREE.Mesh(new THREE.BoxGeometry(.34, .16, .05), M(0xffffff, { emissive:0xffffff, emissiveIntensity:.35 })); bubble.add(track(bb, { noEdges:true }));
  for (let k = 0; k < 3; k++) { const dot = new THREE.Mesh(new THREE.SphereGeometry(.018, 8, 8), M(0x1a56db, { emissive:0x1a56db, emissiveIntensity:.6 })); dot.position.set(-.07 + k * .07, 0, .03); bubble.add(track(dot, { noEdges:true })); bubble.userData['d'+k] = dot; }
  bubble.position.set(.05, -H + .92, -.05); root.add(bubble);
  const customer = new THREE.Mesh(new THREE.CapsuleGeometry(.08, .2, 4, 10), M(0xf2a65a)); customer.position.set(.62, -H + .34, .55); root.add(track(customer));
  const warm = new THREE.PointLight(0xffd9a3, 0, 2.4, 2); warm.position.set(0, .55, .3); root.add(warm);
  return (t, dt, playing) => {
    warm.intensity = playing ? 1.4 : 0; bubble.visible = playing; bubble.position.y = -H + .92 + Math.sin(t * 2) * .02;
    for (let k = 0; k < 3; k++) bubble.userData['d'+k].scale.setScalar(.8 + Math.max(0, Math.sin(t * 5 - k * 1.1)) * .5);
    clerkHead.rotation.y = Math.sin(t * .9) * .35; customer.position.x = .62 - (1 - Math.cos(t * .5)) * .18 - .1;
  };
}

/* 04 BlockTrade — candles + orbiting condition blocks */
function buildTrading(root, p) {
  const n = 16, candles = []; let val = 0;
  const base = new THREE.Mesh(new THREE.BoxGeometry(S * .9, .03, .5), M(0x111a2b, { emissive:0x1a2c48, emissiveIntensity:.4 })); base.position.y = -H + .2; root.add(track(base));
  for (let k = 0; k < n; k++) { const up = Math.random() > .45, d = (Math.random() * .12 + .03) * (up ? 1 : -1); const o = val; val += d; const c = { o, c:val, up };
    const body = new THREE.Mesh(new THREE.BoxGeometry(.05, 1, .05), M(up ? 0x35d39a : 0xff5f7e, { emissive:up ? 0x0f7a55 : 0x8a1a35, emissiveIntensity:.6 }));
    const wick = new THREE.Mesh(new THREE.BoxGeometry(.012, 1, .012), M(0xcfd8ea)); root.add(track(body, { noEdges:true })); root.add(track(wick, { noEdges:true })); c.body = body; c.wick = wick; candles.push(c); }
  const blocks = [];
  for (let k = 0; k < 4; k++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.16, .1, .16), M([0x5ee0b0,0x8ecae6,0xffd166,0xb7a6ff][k], { emissiveIntensity:.5, emissive:[0x5ee0b0,0x8ecae6,0xffd166,0xb7a6ff][k], roughness:.3 })); root.add(track(b)); blocks.push(b); }
  let timer = 0;
  const layout = () => { const lo = Math.min(...candles.map(c => Math.min(c.o, c.c))), hi = Math.max(...candles.map(c => Math.max(c.o, c.c))), span = Math.max(hi - lo, .4);
    candles.forEach((c, k) => { const x = -S * .42 + k * (S * .84 / (n - 1)); const y0 = -H + .3 + (c.o - lo) / span * .6, y1 = -H + .3 + (c.c - lo) / span * .6; const h = Math.max(Math.abs(y1 - y0), .012);
      c.body.position.set(x, (y0 + y1) / 2, 0); c.body.scale.y = h; c.wick.position.set(x, (y0 + y1) / 2, 0); c.wick.scale.y = h + .08;
      c.body.userData.solid.color.set(c.c >= c.o ? 0x35d39a : 0xff5f7e); c.body.userData.solid.emissive.set(c.c >= c.o ? 0x0f7a55 : 0x8a1a35); }); };
  layout();
  return (t, dt, playing) => {
    timer += dt; const last = candles[n - 1]; last.c += Math.sin(t * 7) * dt * .08 + (Math.random() - .5) * dt * .2;
    if (timer > 1.1) { timer = 0; const first = candles.shift(); first.o = last.c; first.c = last.c + (Math.random() - .45) * .18; candles.push(first); }
    layout();
    blocks.forEach((b, k) => { const a = t * .6 + k * Math.PI / 2; b.position.set(Math.cos(a) * .48, .18 + Math.sin(t * 1.5 + k) * .08, Math.sin(a) * .48); b.rotation.y = a; b.rotation.x = Math.sin(t + k) * .3; });
  };
}

/* 05 XBIT — git graph with travelling commits */
function buildGit(root, p) {
  const lanes = [-.3, 0, .3]; const nodes = []; const lines = [];
  const commits = [[0,1],[1,1],[2,0],[3,1],[3,2],[4,0],[5,1],[6,2],[7,1]]; // [x-step, lane]
  const pos = commits.map(([s, l]) => new THREE.Vector3(-.6 + s * .17, lanes[l], 0));
  const links = [[0,1],[1,2],[1,3],[3,4],[2,5],[5,6],[3,6],[4,7],[6,8],[7,8]];
  pos.forEach((P, k) => { const m = new THREE.Mesh(new THREE.SphereGeometry(.04, 12, 12), M(0xb7a6ff, { emissive:0x6f5be0, emissiveIntensity:.5 })); m.position.copy(P); root.add(track(m)); nodes.push(m); });
  links.forEach(([a, b]) => { const g = new THREE.BufferGeometry().setFromPoints([pos[a], pos[b]]); const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color:0x8c7bff, transparent:true, opacity:.7 })); root.add(l); lines.push(l); });
  const panel = new THREE.Mesh(new THREE.BoxGeometry(1.25, .78, .03), M(0x0e1526, { emissive:0x1b2540, emissiveIntensity:.5, roughness:.3 })); panel.position.z = -.12; root.add(track(panel));
  const pulses = [new THREE.CatmullRomCurve3([pos[0], pos[1], pos[3], pos[4], pos[7], pos[8]]), new THREE.CatmullRomCurve3([pos[1], pos[2], pos[5], pos[6], pos[8]])].map(c => {
    const m = new THREE.Mesh(new THREE.SphereGeometry(.05, 10, 10), new THREE.MeshBasicMaterial({ color:0xffffff })); root.add(track(m, { noEdges:true })); return { c, m }; });
  const file = new THREE.Mesh(new THREE.BoxGeometry(.18, .22, .02), M(0xffffff, { emissive:0xffffff, emissiveIntensity:.4 })); file.position.set(-.85, .45, .1); root.add(track(file));
  return (t, dt, playing) => {
    pulses.forEach((p, k) => { const u = (t * .16 + k * .5) % 1; p.m.position.copy(p.c.getPointAt(u)); p.m.visible = playing; });
    nodes.forEach((n, k) => { const near = pulses.some(p => p.m.position.distanceTo(n.position) < .09); n.userData.solid.emissiveIntensity = THREE.MathUtils.lerp(n.userData.solid.emissiveIntensity, near ? 2.2 : .5, .2); });
    file.position.y = .45 + Math.sin(t * 1.6) * .03; file.rotation.z = Math.sin(t * .8) * .08;
  };
}

const BUILD = { aquarium:buildAquarium, body:buildBody, store:buildStore, trading:buildTrading, git:buildGit };
PROJECTS.forEach((p, i) => makeCube(p, LAYOUT[i], BUILD[p.builder], i));

/* ---------- postprocessing ---------- */
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(1, 1), 0.55, 0.65, 0.78); composer.addPass(bloom);
let useBloom = true;

/* ---------- state machine ---------- */
const state = { mode:'edit', playing:false, transition:0, debug:false, focus:-1, camT:1 };
const ui = { play:document.getElementById('btn-play'), pause:document.getElementById('btn-pause'), step:document.getElementById('btn-step'), debug:document.getElementById('btn-debug'), label:document.getElementById('mode-label'), cta:document.getElementById('cta-play'), tip:document.getElementById('tip'), dbg:document.getElementById('debug'), copy:document.querySelector('.hero-copy'), eyebrow:document.getElementById('hero-eyebrow') };
const ease = x => 1 - Math.pow(1 - x, 3);

function setMode(playing) {
  state.playing = playing;
  if (playing && state.mode === 'edit') { state.mode = 'entering'; state.enterAt = performance.now(); }
  ui.play.setAttribute('aria-pressed', String(playing)); ui.pause.setAttribute('aria-pressed', String(!playing && state.mode !== 'edit'));
  ui.label.innerHTML = playing ? 'MODE <b>PLAY</b>' : (state.mode === 'edit' ? 'MODE <b>EDIT</b>' : 'MODE <b>PAUSED</b>');
  if (ui.cta) ui.cta.querySelector('span').textContent = playing ? 'Pause scene' : 'Play scene';
  if (ui.eyebrow) ui.eyebrow.textContent = playing ? 'SCENE 01 · RUNNING' : 'SCENE 01 · PRESS PLAY';
}
ui.play.onclick = () => setMode(true);
ui.pause.onclick = () => setMode(false);
if (ui.cta) ui.cta.onclick = () => setMode(!state.playing);
let stepOnce = false; ui.step.onclick = () => { if (state.mode === 'edit') setMode(true); state.playing = false; stepOnce = true; setMode(false); };
ui.debug.onclick = () => setDebug(!state.debug);
function setDebug(on) { state.debug = on; ui.debug.setAttribute('aria-pressed', String(on)); ui.dbg.classList.toggle('on', on);
  tracked.forEach(t => { if (t.edges) t.edges.visible = on; }); cubes.forEach(c => { c.frame.material.opacity = on ? 1 : .75; }); }
addEventListener('keydown', e => { if (e.target.closest('input,textarea,button,a,dialog')) return;
  if (e.code === 'Space') { e.preventDefault(); setMode(!state.playing); } else if (e.key === 'd' || e.key === 'D') setDebug(!state.debug); else if (e.key === 'Escape') exitCube(); });

/* apply transition value 0..1 (edit -> play look) to every tracked mesh, staggered per cube */
function applyLook(globalT) {
  cubes.forEach((c, i) => {
    const local = THREE.MathUtils.clamp((globalT - i * .12) / .55, 0, 1), k = ease(local);
    c.group.traverse(o => { if (!o.userData.solid) return; const solid = o.userData.solid;
      if (k < .5) { o.material = WIRE; } else { o.material = solid; solid.opacity = solid.userData.opacity * ((k - .5) * 2); }
    });
    c.frame.material.color.set(k > .5 ? c.project.tone : 0x5a6784);
    c.light.intensity = k * 1.7;
    c.group.scale.setScalar(c.group.userData.baseScale * (0.94 + k * .06));
  });
  WIRE.opacity = 0.9 * (1 - THREE.MathUtils.clamp(globalT * 1.6, 0, 1)) + 0.9 * (globalT < 0.01 ? 1 : 0);
  if (globalT > 0.01) WIRE.opacity = Math.max(0.15, 0.9 - globalT);
  gridMat.opacity = 1 - ease(THREE.MathUtils.clamp(globalT * 1.3, 0, 1)) * .85;
  hemi.intensity = globalT * .9; key.intensity = globalT * 1.6; rim.intensity = globalT * 1.1; ambient.intensity = .18 + globalT * .1;
}
applyLook(0);

/* ---------- interaction: hover / focus ---------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(9, 9), mouse = { x:0, y:0 }; let hovered = -1;
canvas.addEventListener('pointermove', e => { const r = canvas.getBoundingClientRect(); ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1; ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1; mouse.x = ndc.x; mouse.y = ndc.y; });
canvas.addEventListener('pointerleave', () => { ndc.set(9, 9); mouse.x = mouse.y = 0; });
canvas.addEventListener('click', e => { const r = canvas.getBoundingClientRect(); ndc.x = ((e.clientX - r.left) / r.width) * 2 - 1; ndc.y = -((e.clientY - r.top) / r.height) * 2 + 1;
  ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(cubes.map(c => c.glass), false)[0];
  if (hit && state.focus < 0) enterCube(hit.object.userData.cube); else if (!hit && state.focus >= 0) exitCube(); });
const camFrom = camHome.clone(), camTo = camHome.clone(), lookFrom = new THREE.Vector3(), lookTo = new THREE.Vector3();
function enterCube(i) {
  if (state.mode === 'edit') setMode(true);
  state.focus = i; state.camT = 0; state.camAt = performance.now(); camFrom.copy(camera.position); lookFrom.copy(camLook);
  const c = cubes[i]; c.group.getWorldPosition(camTo); lookTo.copy(camTo); camTo.z += 3.9 * c.group.userData.baseScale + .3; camTo.y += .1; camTo.x += .55;
  ui.tip.classList.remove('on'); hovered = -1; if (ui.copy) ui.copy.classList.add('dim');
  window.setTimeout(() => window.dispatchEvent(new CustomEvent('ojh:open-project', { detail:{ id:c.project.id, opener:canvas } })), reduced ? 0 : 520);
}
function exitCube() {
  if (state.focus < 0) return;
  state.focus = -1; state.camT = 0; state.camAt = performance.now(); camFrom.copy(camera.position); lookFrom.copy(camLook); camTo.copy(camHome); lookTo.set(0, 0, 0);
  if (ui.copy) ui.copy.classList.remove('dim');
}
window.addEventListener('ojh:project-closed', exitCube);
/* ---------- resize ---------- */
function resize() {
  const w = canvas.clientWidth, h = canvas.clientHeight; if (!w || !h) return;
  renderer.setSize(w, h, false); composer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
  const narrow = w < 700; useBloom = !narrow; bloom.enabled = useBloom;
  world.position.x = narrow ? 0 : 1.65; camHome.z = narrow ? 11.5 : 9.2; camHome.x = narrow ? 0 : 0.35;
  if (state.focus < 0 && state.camT >= 1) camera.position.copy(camHome);
  camera.fov = narrow ? 44 : 38; camera.updateProjectionMatrix();
}
new ResizeObserver(resize).observe(canvas); resize();

/* ---------- loop ---------- */
let externalRunning = !document.body.classList.contains('motion-paused');
window.OJH_HERO = Object.freeze({ setRunning(v) { externalRunning = Boolean(v); }, play() { setMode(true); }, isPlaying() { return state.playing; } });
const clock = new THREE.Clock(); let simT = 0, fpsAcc = 0, fpsN = 0, lastStat = 0;
const tipPos = new THREE.Vector3();
function frame() {
  requestAnimationFrame(frame);
  if (document.hidden) return;
  const dt = Math.min(clock.getDelta(), .05), now = clock.elapsedTime;
  // mode transition
  if (state.mode === 'entering') { state.transition = Math.min(1, (performance.now() - state.enterAt) / (reduced ? 200 : 1400)); applyLook(state.transition); if (state.transition >= 1) state.mode = 'play'; }
  const running = (state.playing && externalRunning) || stepOnce; if (running) simT += stepOnce ? 1 / 30 : dt;
  // hover
  ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(cubes.map(c => c.glass), false)[0]; const newHover = hit && state.focus < 0 ? hit.object.userData.cube : -1;
  if (newHover !== hovered) { hovered = newHover; canvas.style.cursor = hovered >= 0 ? 'pointer' : (state.focus >= 0 ? 'zoom-out' : 'default'); ui.tip.classList.toggle('on', hovered >= 0);
    if (hovered >= 0) { ui.tip.querySelector('strong').textContent = PROJECTS[hovered].title; ui.tip.querySelector('span').textContent = PROJECTS[hovered].field; } }
  // cubes
  cubes.forEach((c, i) => {
    const f = c.group.userData.base; const active = hovered === i || state.focus === i;
    const floatY = running && !reduced ? Math.sin(simT * .7 + c.seed) * .07 : 0;
    c.group.position.set(f.x, f.y + floatY, f.z);
    const rotSpeed = running && !reduced ? (active ? .5 : .12) : 0; c.group.rotation.y += rotSpeed * dt;
    if (state.focus === i) c.group.rotation.y = THREE.MathUtils.lerp(c.group.rotation.y, Math.round(c.group.rotation.y / (Math.PI / 2)) * (Math.PI / 2), .06);
    const want = c.group.userData.baseScale * (active ? 1.07 : 1) * (state.focus >= 0 && state.focus !== i ? .92 : 1);
    if (state.mode !== 'entering') c.group.scale.setScalar(THREE.MathUtils.lerp(c.group.scale.x, want, .1));
    if (state.mode !== 'edit') c.update(simT, running ? (stepOnce ? 1 / 30 : dt) : 0, running);
    c.glass.userData.solid.opacity = active ? .1 : .05;
    if (state.mode !== 'entering') c.light.intensity = THREE.MathUtils.lerp(c.light.intensity, state.mode === 'edit' ? 0 : (active ? 2.6 : 1.7), .08);
  });
  stepOnce = false;
  // tip position
  if (hovered >= 0) { cubes[hovered].group.getWorldPosition(tipPos); tipPos.y += S * .62 * cubes[hovered].group.userData.baseScale; tipPos.project(camera);
    ui.tip.style.left = `${(tipPos.x * .5 + .5) * canvas.clientWidth}px`; ui.tip.style.top = `${(-tipPos.y * .5 + .5) * canvas.clientHeight + canvas.offsetTop}px`; }
  // camera
  if (state.camT < 1) { state.camT = Math.min(1, (performance.now() - state.camAt) / (reduced ? 200 : 950)); const k = ease(state.camT); camera.position.lerpVectors(camFrom, camTo, k); camLook.lerpVectors(lookFrom, lookTo, k); }
  else if (state.focus < 0) { camera.position.x = THREE.MathUtils.lerp(camera.position.x, camHome.x + mouse.x * .45, .05); camera.position.y = THREE.MathUtils.lerp(camera.position.y, camHome.y + mouse.y * .3, .05); camera.position.z = camHome.z; }
  camera.lookAt(camLook);
  // render
  renderer.info.reset();
  if (useBloom) composer.render(); else renderer.render(scene, camera);
  if (canvas.clientWidth >= 700) { gizmoCam.position.set(0, 0, 3.2).applyQuaternion(camera.quaternion); gizmoCam.lookAt(0, 0, 0); gizmoRenderer.render(gizmoScene, gizmoCam); }
  // stats
  fpsAcc += dt; fpsN++; if (now - lastStat > .5) { const r = renderer.info.render; document.getElementById('s-fps').textContent = (fpsN / fpsAcc).toFixed(0); document.getElementById('s-ms').textContent = (fpsAcc / fpsN * 1000).toFixed(1) + ' ms';
    document.getElementById('s-calls').textContent = r.calls; document.getElementById('s-tris').textContent = r.triangles.toLocaleString(); document.getElementById('s-fish').textContent = '64 · 1 draw'; document.getElementById('s-dpr').textContent = renderer.getPixelRatio().toFixed(2); fpsAcc = 0; fpsN = 0; lastStat = now; }
}
frame();
if (reduced) { setMode(true); }
