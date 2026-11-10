// 밤의 홀: 처음 공간(문 세 개) ↔ 프로젝트 공간(휘어진 화면)을 오가는 한 화면 포트폴리오.
// 내용은 config.js, 모양은 styles.css. WebGL이 없으면 같은 내용을 평면으로 보여 준다.
import * as THREE from 'three';

const CFG = window.PORTFOLIO_CONFIG, P = CFG.projects;
const $ = s => document.querySelector(s);
const rad = THREE.MathUtils.degToRad, deg = THREE.MathUtils.radToDeg, lerp = THREE.MathUtils.lerp, clamp = THREE.MathUtils.clamp;
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const BG = 0x05070c, EYE = 1.6;
const R = 8.5, PW = 2.1, PH = 3.3, CY = 0.45 + PH / 2, ANG = [-17, 0, 17];        // 문 배치
const SR = 6, SH = 4.6, SLEN = rad(80), SASPECT = (SR * SLEN) / SH;               // 휘어진 화면
const SX = SR * Math.sin(SLEN / 2), SZ = SR * Math.cos(SLEN / 2);
const MOOD = { sea: [0x03101f, 0x2f7fe0], store: [0x070a18, 0x3d6ff0], body: [0x140607, 0xd0524a] };

const el = { canvas: $('#gl'), intro: $('#intro'), doors: $('#doors'), text: $('#room-text'), flat: $('#flat'), cap: $('#media-cap'), tabs: $('#media-tabs'), fade: $('#fade') };
const setClass = (name, on) => [document.documentElement, document.body].forEach(n => n.classList.toggle(name, on));

/* ---------- 글 ---------- */
$('#link-github').href = CFG.github;
$('#link-mail').href = 'mailto:' + CFG.email;
el.intro.innerHTML = `<p class="hello">${CFG.intro.hello}</p><h1>${CFG.intro.headline}</h1>
  ${CFG.intro.paragraphs.map(t => `<p>${t}</p>`).join('')}
  <dl>${CFG.intro.facts.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
const doorBtns = P.map((p, i) => {
  const b = document.createElement('button'); b.type = 'button';
  b.style.setProperty('--cover', `url(${p.cover})`);
  b.innerHTML = `<span class="no">${p.number}</span><span class="t">${p.title}</span><span class="s">${p.short}</span><span class="go">들어가기 →</span>`;
  b.addEventListener('pointerenter', () => hotLabel = i); b.addEventListener('pointerleave', () => hotLabel = -1);
  b.addEventListener('focus', () => { hotLabel = i; setFocus(i); }); b.addEventListener('blur', () => hotLabel = -1);
  b.addEventListener('click', () => enter(i));
  el.doors.appendChild(b); return b;
});
function fillText(p) {
  el.text.innerHTML = `<div class="no">${p.number} / ${String(P.length).padStart(2, '0')}</div><h2>${p.title}</h2>
    <p class="sub">${p.subtitle}</p><p class="meta">${p.meta}<br>${p.stack}</p>
    <p class="desc">${p.description}</p>
    <h3>맡은 일</h3><p class="role">${p.role}</p>
    <h3>만든 것</h3><ul>${p.points.map(x => `<li>${x}</li>`).join('')}</ul>
    ${p.links.length ? `<div class="act">${p.links.map(([t, u]) => `<a href="${u}" target="_blank" rel="noopener noreferrer">${t} ↗</a>`).join('')}</div>` : ''}
    ${p.note ? `<p class="note">${p.note}</p>` : ''}`;
  $('#room').scrollTop = 0;
}

/* ---------- 상태 ---------- */
let mode = 'lobby', cur = -1, slide = 0, focus = 1, hot = -1, hotLabel = -1;
let flyT = 0, flyYaw0 = 0, flyFov0 = 55, cutT = 0, cutFn = null, fade = 1;
let yaw = 0, pitch = 0, mx = 0, my = 0, narrow = false, video = null;
const L = { lobbyYaw: 0, lobbyFov: 55, lobbyPitch: 0.02, roomYaw: 0, roomFov: 55, roomZ: 2.6, roomPitch: 0.03 };
let W = null; // 3D 세계. 못 만들면 null

function setFocus(i) { focus = (i + P.length) % P.length; doorBtns.forEach((b, k) => b.classList.toggle('focus', k === focus)); }
setFocus(1);

/* ---------- 3D ---------- */
function buildWorld() {
  const renderer = new THREE.WebGLRenderer({ canvas: el.canvas, antialias: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene(); scene.background = new THREE.Color(BG); scene.fog = new THREE.FogExp2(BG, 0.028);
  const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 400); camera.rotation.order = 'YXZ'; camera.position.set(0, EYE, 0);
  const loader = new THREE.TextureLoader(), cache = new Map();

  const fit = (tex, ia, aspect, flip) => {
    let rx = 1, ry = 1; if (ia > aspect) rx = aspect / ia; else ry = ia / aspect;
    tex.repeat.set(flip ? -rx : rx, ry); tex.offset.set(flip ? (1 - rx) / 2 + rx : (1 - rx) / 2, (1 - ry) / 2);
  };
  const prep = (t, flip) => { t.colorSpace = THREE.SRGBColorSpace; t.wrapS = THREE.RepeatWrapping; if (flip) { t.repeat.set(-1, 1); t.offset.set(1, 0); } return t; };
  function pic(url, aspect, flip) {
    const key = url + aspect.toFixed(2) + flip;
    if (!cache.has(key)) { const t = prep(loader.load(url, x => fit(x, x.image.width / x.image.height, aspect, flip)), flip); t.anisotropy = 8; cache.set(key, t); }
    return cache.get(key);
  }
  function canvasTex(w, h, draw) { const cv = document.createElement('canvas'); cv.width = w; cv.height = h; draw(cv.getContext('2d'), w, h); const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; return t; }
  const glowTex = canvasTex(256, 256, (g) => { const gr = g.createRadialGradient(128, 128, 0, 128, 128, 128); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, 256, 256); });
  const add = (color, opacity, extra) => new THREE.MeshBasicMaterial({ color, transparent: true, opacity, blending: THREE.AdditiveBlending, depthWrite: false, ...extra });
  function cloud(n, rMin, rMax, yMin, yMax, size, color, opacity) {
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) { const r = rMin + Math.random() * (rMax - rMin), t = Math.random() * Math.PI * 2; a[i * 3] = Math.cos(t) * r; a[i * 3 + 1] = yMin + Math.random() * (yMax - yMin); a[i * 3 + 2] = Math.sin(t) * r; }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.BufferAttribute(a, 3));
    return new THREE.Points(g, new THREE.PointsMaterial({ size, color, transparent: true, opacity, map: glowTex, depthWrite: false, blending: THREE.AdditiveBlending }));
  }

  /* 바닥은 늘 있고, 홀 장식은 처음 공간에서만 보인다 */
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(160, 160), new THREE.MeshBasicMaterial({ color: BG, transparent: true, opacity: 0.8 }));
  floor.rotation.x = -Math.PI / 2; floor.renderOrder = 2; scene.add(floor);
  const grid = new THREE.GridHelper(160, 160, 0x16284a, 0x0d1728); grid.position.y = 0.01; grid.renderOrder = 3; grid.material.transparent = true; scene.add(grid);
  const hall = new THREE.Group(), lobby = new THREE.Group(), room = new THREE.Group(); scene.add(hall, lobby, room); room.visible = false;
  const colMat = new THREE.MeshBasicMaterial({ color: 0x2a4f96 });
  for (let i = 0; i < 20; i++) { // 바닥 아래로도 뻗어 있어 반사처럼 보인다
    const t = i / 20 * Math.PI * 2, m = new THREE.Mesh(new THREE.BoxGeometry(0.07, 20, 0.07), colMat); m.position.set(Math.cos(t) * 15, 0, Math.sin(t) * 15); hall.add(m);
  }
  [[15, 9, 0x3a6fd0], [10, 7.2, 0x24447f], [5, 6, 0x1a3360]].forEach(([r, y, color]) => [y, -y].forEach(yy => {
    const m = new THREE.Mesh(new THREE.TorusGeometry(r, 0.03, 8, 160), new THREE.MeshBasicMaterial({ color })); m.rotation.x = Math.PI / 2; m.position.y = yy; hall.add(m);
  }));
  const dust = cloud(520, 3, 20, 0.2, 9, 0.09, 0x9cc2ff, 0.7); hall.add(dust);

  /* 문 */
  const DIM = new THREE.Color(0xa9adb6), FULL = new THREE.Color(0xffffff);
  const frame = (mat) => { const g = new THREE.Group(), th = 0.05; [[0, PH / 2, PW + th, th], [0, -PH / 2, PW + th, th], [-PW / 2, 0, th, PH], [PW / 2, 0, th, PH]].forEach(([x, y, a, b]) => { const m = new THREE.Mesh(new THREE.BoxGeometry(a, b, th), mat); m.position.set(x, y, 0); g.add(m); }); return g; };
  const portals = P.map((p, i) => {
    const th = rad(ANG[i]), g = new THREE.Group(); g.position.set(Math.sin(th) * R, 0, -Math.cos(th) * R); g.rotation.y = -th; lobby.add(g);
    const mat = new THREE.MeshBasicMaterial({ map: pic(p.cover, PW / PH, false), color: DIM.clone() });
    const face = new THREE.Mesh(new THREE.PlaneGeometry(PW, PH), mat); face.position.y = CY; g.add(face);
    const fmat = new THREE.MeshBasicMaterial({ color: 0xa9c8ff }), fr = frame(fmat); fr.position.set(0, CY, 0.01); g.add(fr);
    const glow = new THREE.Mesh(new THREE.PlaneGeometry(PW + 3.4, PH + 3.4), add(MOOD[p.mood][1], 0.35, { map: glowTex })); glow.position.set(0, CY, -0.08); g.add(glow);
    const mm = mat.clone(); mm.transparent = true; mm.opacity = 0.3; mm.side = THREE.DoubleSide; // 바닥 반사
    const mf = new THREE.Mesh(face.geometry, mm); mf.position.y = -CY; mf.scale.y = -1; g.add(mf);
    const mfr = frame(new THREE.MeshBasicMaterial({ color: 0x4c6ea8 })); mfr.position.set(0, -CY, 0.01); g.add(mfr);
    return { g, face, mat, mm, fmat, glow, th, lp: new THREE.Vector3(Math.sin(th) * R, 0.27, -Math.cos(th) * R), h: 0 };
  });
  const faces = portals.map(p => p.face);

  /* 프로젝트 공간: 휘어진 화면과 공간별 분위기 */
  const sgeo = new THREE.CylinderGeometry(SR, SR, SH, 64, 1, true, Math.PI - SLEN / 2, SLEN);
  const smat = new THREE.MeshBasicMaterial({ side: THREE.BackSide, fog: false });
  const screen = new THREE.Mesh(sgeo, smat); screen.position.y = 0.3 + SH / 2; room.add(screen);
  const smir = new THREE.MeshBasicMaterial({ side: THREE.FrontSide, fog: false, transparent: true, opacity: 0.24 });
  const mir = new THREE.Mesh(sgeo, smir); mir.scale.y = -1; mir.position.y = -(0.3 + SH / 2); room.add(mir);
  const rglow = new THREE.Mesh(new THREE.PlaneGeometry(22, 14), add(0xffffff, 0.4, { map: glowTex, fog: false })); rglow.position.set(0, 2.6, -SR - 0.6); room.add(rglow);
  const setScreen = t => { smat.map = t; smir.map = t; smat.needsUpdate = smir.needsUpdate = true; };

  const dummy = new THREE.Object3D();
  const moods = {
    sea() { // 물속: 올라가는 공기 방울, 빛줄기, 주위를 도는 물고기 떼
      const g = new THREE.Group();
      const bub = cloud(260, 1.5, 14, 0, 9, 0.11, 0xbfe0ff, 0.6); g.add(bub);
      const sp = Float32Array.from({ length: 260 }, () => 0.25 + Math.random() * 0.5);
      const shaftTex = canvasTex(8, 256, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); c.fillStyle = gr; c.fillRect(0, 0, w, h); });
      const shafts = [-9, -4.5, 1, 6, 10.5].map((x, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(2.2 + i % 2, 15), add(0x4f9be8, 0.07, { map: shaftTex, fog: false, side: THREE.DoubleSide })); m.position.set(x, 6.2, -9 - (i % 3) * 2); m.rotation.z = 0.22; g.add(m); return m; });
      const N = 70, geo = new THREE.ConeGeometry(0.04, 0.22, 5); geo.rotateX(Math.PI / 2);
      const fish = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0x5f95d0 }), N); g.add(fish);
      const f = Array.from({ length: N }, (_, i) => ({ r: 6.5 + Math.random() * 6, y: 0.8 + Math.random() * 6.5, a: Math.random() * Math.PI * 2, s: (0.1 + Math.random() * 0.12) * (i % 5 ? 1 : -1), ph: Math.random() * 6 }));
      const at = (o, a, t, v) => v.set(Math.cos(a) * o.r, o.y + Math.sin(a * 3 + o.ph + t * 0.4) * 0.35, Math.sin(a) * o.r);
      const v1 = new THREE.Vector3(), v2 = new THREE.Vector3();
      return { g, tick(dt, t) {
        const a = bub.geometry.attributes.position; for (let i = 0; i < 260; i++) { let y = a.getY(i) + sp[i] * dt; if (y > 9) y = 0; a.setY(i, y); } a.needsUpdate = true;
        shafts.forEach((m, i) => m.material.opacity = 0.05 + 0.035 * Math.sin(t * 0.5 + i * 1.7));
        f.forEach((o, i) => { o.a += o.s * dt; at(o, o.a, t, v1); at(o, o.a + Math.sign(o.s) * 0.05, t, v2); dummy.position.copy(v1); dummy.lookAt(v2); dummy.updateMatrix(); fish.setMatrixAt(i, dummy.matrix); });
        fish.instanceMatrix.needsUpdate = true;
      } };
    },
    store() { // 가게: 천장 조명 줄, 양옆 진열대 윤곽, 떠 있는 그림 카드
      const g = new THREE.Group(), bar = new THREE.MeshBasicMaterial({ color: 0xdfe9ff });
      for (let x = -6; x <= 6; x += 6) for (let z = 5; z > -24; z -= 5.2) [6.2, -6.2].forEach(y => { const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.04, 2.6), bar); m.position.set(x, y, z); g.add(m); });
      const body = new THREE.MeshBasicMaterial({ color: 0x0b111e }), edge = new THREE.MeshBasicMaterial({ color: 0x3d6ff0 });
      [-9, 9].forEach(x => { for (let z = 3; z > -22; z -= 5) { const s = new THREE.Mesh(new THREE.BoxGeometry(1.3, 2.7, 4.2), body); s.position.set(x, 1.35, z); g.add(s); [0.9, 1.8, 2.71].forEach(y => { const e = new THREE.Mesh(new THREE.BoxGeometry(1.34, 0.025, 4.24), edge); e.position.set(x, y, z); g.add(e); }); } });
      const cardTex = canvasTex(128, 128, (c) => { c.strokeStyle = '#fff'; c.lineWidth = 5; c.beginPath(); c.roundRect(8, 8, 112, 112, 20); c.stroke(); c.fillStyle = '#fff'; c.beginPath(); c.arc(64, 52, 16, 0, 7); c.fill(); c.fillRect(34, 86, 60, 8); });
      const cards = Array.from({ length: 11 }, (_, i) => { const m = new THREE.Mesh(new THREE.PlaneGeometry(0.62, 0.62), add(0x9db9ff, 0.5, { map: cardTex, side: THREE.DoubleSide })); const a = (i / 11) * Math.PI * 2 + 0.4; m.position.set(Math.cos(a) * (6.8 + (i % 3)), 1.4 + (i * 0.37) % 3.4, Math.sin(a) * (6.8 + (i % 3))); m.userData = { y: m.position.y, ph: i * 1.3 }; g.add(m); return m; });
      return { g, tick(dt, t) { cards.forEach(m => { m.position.y = m.userData.y + Math.sin(t * 0.6 + m.userData.ph) * 0.18; m.rotation.y = t * 0.25 + m.userData.ph; }); } };
    },
    body() { // 몸속: 꿈틀대는 관과 흘러가는 적혈구
      const g = new THREE.Group(), rm = new THREE.MeshBasicMaterial({ color: 0x3d0f13 });
      const rings = Array.from({ length: 11 }, (_, i) => { const m = new THREE.Mesh(new THREE.TorusGeometry(11, 0.32, 10, 64), rm); m.position.set(0, 2.6, 7 - i * 4.2); g.add(m); return m; });
      const N = 80, geo = new THREE.SphereGeometry(0.11, 12, 8); geo.scale(1, 0.42, 1);
      const cells = new THREE.InstancedMesh(geo, new THREE.MeshBasicMaterial({ color: 0x8e2a2c }), N); g.add(cells);
      const c = Array.from({ length: N }, () => ({ r: 6.6 + Math.random() * 3.6, a: Math.random() * Math.PI * 2, z: -34 + Math.random() * 42, s: 0.5 + Math.random() * 0.7, ph: Math.random() * 6 }));
      return { g, tick(dt, t) {
        rings.forEach((m, i) => m.scale.setScalar(1 + 0.07 * Math.sin(t * 1.5 - i * 0.75)));
        c.forEach((o, i) => { o.z += o.s * dt; if (o.z > 8) o.z = -34; dummy.position.set(Math.cos(o.a) * o.r, 2.6 + Math.sin(o.a) * o.r, o.z); dummy.rotation.set(t * 0.5 + o.ph, o.ph, t * 0.3); dummy.updateMatrix(); cells.setMatrixAt(i, dummy.matrix); });
        cells.instanceMatrix.needsUpdate = true;
      } };
    }
  };
  const built = {};
  function setMood(name) { for (const k in built) built[k].g.visible = false; if (!built[name]) { built[name] = moods[name](); room.add(built[name].g); } built[name].g.visible = true; return built[name]; }

  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(9, 9), v = new THREE.Vector3();
  const pickAt = (x, y) => { ndc.set(x / innerWidth * 2 - 1, -(y / innerHeight * 2 - 1)); ray.setFromCamera(ndc, camera); const hit = ray.intersectObjects(faces)[0]; return hit ? faces.indexOf(hit.object) : -1; };
  return { renderer, scene, camera, hall, lobby, room, grid, dust, portals, pic, prep, fit, setScreen, setMood, rglow, pickAt, ndc, ray, faces, v, DIM, FULL, mood: null, color: new THREE.Color(BG), colorTo: new THREE.Color(BG) };
}
try { W = buildWorld(); } catch (e) { console.warn('[OJH] 3D를 쓸 수 없어 평면으로 보여 줍니다.', e); setClass('no-gl', true); }

/* ---------- 화면(슬라이드) ---------- */
function stopVideo() { if (video) { video.pause(); video.removeAttribute('src'); video.load(); video = null; } }
function setSlide(k) {
  const p = P[cur], m = p.media[k]; slide = k; stopVideo();
  el.cap.textContent = m.caption;
  el.tabs.innerHTML = '';
  if (p.media.length > 1) p.media.forEach((x, i) => { const b = document.createElement('button'); b.type = 'button'; b.textContent = x.label; b.setAttribute('aria-pressed', i === k); b.addEventListener('click', () => setSlide(i)); el.tabs.appendChild(b); });
  if (m.type === 'video') {
    const vd = video = document.createElement('video'); vd.src = m.src; vd.muted = true; vd.loop = true; vd.playsInline = true; vd.preload = 'auto'; if (m.poster) vd.poster = m.poster;
    const snd = document.createElement('button'); snd.type = 'button'; snd.className = 'sound'; snd.textContent = '소리 켜기'; snd.setAttribute('aria-pressed', 'false');
    snd.addEventListener('click', () => { vd.muted = !vd.muted; snd.textContent = vd.muted ? '소리 켜기' : '소리 끄기'; snd.setAttribute('aria-pressed', !vd.muted); });
    el.tabs.appendChild(snd);
    if (W) {
      W.setScreen(W.pic(m.poster || p.cover, SASPECT, true));
      const t = W.prep(new THREE.VideoTexture(vd), true);
      vd.addEventListener('loadedmetadata', () => W.fit(t, vd.videoWidth / vd.videoHeight, SASPECT, true));
      vd.addEventListener('playing', () => { if (video === vd) W.setScreen(t); }, { once: true });
    } else { vd.controls = true; el.flat.replaceChildren(vd); }
    vd.play().catch(() => {});
  } else if (W) W.setScreen(W.pic(m.src, SASPECT, true));
  else { const im = new Image(); im.src = m.src; im.alt = m.caption; el.flat.replaceChildren(im); }
}

/* ---------- 공간 이동 ---------- */
function showRoom(i) {
  cur = i; mode = 'room'; setFocus(i); fillText(P[i]);
  setClass('flying', false); setClass('in-room', true);
  if (W) {
    W.lobby.visible = W.hall.visible = false; W.room.visible = true;
    W.mood = W.setMood(P[i].mood); W.colorTo.setHex(MOOD[P[i].mood][0]); W.rglow.material.color.setHex(MOOD[P[i].mood][1]);
    W.camera.position.set(0, EYE, L.roomZ); W.camera.fov = L.roomFov; W.camera.updateProjectionMatrix(); yaw = L.roomYaw; pitch = L.roomPitch;
  }
  setSlide(0);
  document.title = `${P[i].title} — ${CFG.name}`;
}
function showLobby() {
  mode = 'lobby'; cur = -1; stopVideo(); setClass('in-room', false); setClass('flying', false);
  if (W) { W.lobby.visible = W.hall.visible = true; W.room.visible = false; W.mood = null; W.colorTo.setHex(BG); W.camera.position.set(0, EYE, 0); W.camera.fov = L.lobbyFov; W.camera.updateProjectionMatrix(); yaw = lobbyYaw(); pitch = L.lobbyPitch; }
  document.title = `${CFG.name} — 직접 들어가서 겪는 가상 공간`;
}
const lobbyYaw = () => narrow ? -rad(ANG[focus]) : L.lobbyYaw;
const push = hash => { if (location.hash !== hash) history.pushState(null, '', hash || location.pathname + location.search); };
function cut(fn) { if (!W || reduce) return fn(); if (mode === 'cut' || mode === 'fly') return; mode = 'cut'; cutT = 0; cutFn = fn; }
function enter(i) {
  if (mode !== 'lobby') return;
  if (!W || reduce) { showRoom(i); push('#' + P[i].id); return; }
  setFocus(i); cur = i; mode = 'fly'; flyT = 0; flyYaw0 = yaw; flyFov0 = W.camera.fov; setClass('flying', true);
}
function back() { if (mode === 'room') cut(() => { showLobby(); push(''); }); }
function next() { if (mode === 'room') { const n = (cur + 1) % P.length; cut(() => { showRoom(n); history.replaceState(null, '', '#' + P[n].id); }); } }
function sync() { // 주소(#still 등)와 화면을 맞춘다
  const i = P.findIndex(p => '#' + p.id === location.hash);
  if (i < 0 && mode === 'room') cut(showLobby); else if (i >= 0 && cur !== i) cut(() => showRoom(i));
}
$('#back').addEventListener('click', back);
$('#next').addEventListener('click', next);
$('.brand').addEventListener('click', e => { e.preventDefault(); back(); });
$('#prev-door').addEventListener('click', () => setFocus(focus - 1));
$('#next-door').addEventListener('click', () => setFocus(focus + 1));
addEventListener('popstate', sync); addEventListener('hashchange', sync);
addEventListener('keydown', e => {
  if (e.key === 'Escape') back();
  else if (mode === 'lobby' && narrow && e.key === 'ArrowLeft') setFocus(focus - 1);
  else if (mode === 'lobby' && narrow && e.key === 'ArrowRight') setFocus(focus + 1);
});
if (W) {
  addEventListener('pointermove', e => {
    if (e.pointerType === 'touch') return;
    mx = e.clientX / innerWidth * 2 - 1; my = e.clientY / innerHeight * 2 - 1;
    if (e.target === el.canvas) W.ndc.set(mx, -my); else W.ndc.set(9, 9);
  });
  el.canvas.addEventListener('click', e => { if (mode === 'lobby') { const i = W.pickAt(e.clientX, e.clientY); if (i >= 0) enter(i); } });
  let sx = null;
  el.canvas.addEventListener('touchstart', e => sx = e.touches[0].clientX, { passive: true });
  el.canvas.addEventListener('touchend', e => { if (sx === null || mode !== 'lobby' || !narrow) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 40) setFocus(focus + (dx < 0 ? 1 : -1)); }, { passive: true });
}

/* ---------- 화면 크기에 맞춘 시점 ---------- */
function layout() {
  const w = innerWidth, h = innerHeight, a = w / h;
  narrow = a < 1.25;
  if (narrow) {
    L.lobbyFov = Math.max(55, deg(2 * Math.atan(Math.tan(rad(13.6)) / a))); L.lobbyPitch = rad(4.5);
    L.roomFov = 70; L.roomYaw = 0; L.roomPitch = rad(-10);
    L.roomZ = Math.max(2.6, SX * 0.62 / Math.tan(Math.atan(Math.tan(rad(35)) * a)) - SZ);
  } else {
    L.lobbyYaw = rad(11); L.lobbyFov = Math.max(55, deg(2 * Math.atan(Math.tan(rad(37.5)) / a))); L.lobbyPitch = 0.02;
    L.roomFov = 55; L.roomYaw = rad(16); L.roomPitch = 0.03;
    L.roomZ = Math.max(2.6, SX / Math.tan(Math.max(0.2, Math.atan(Math.tan(rad(27.5)) * a) + rad(3) - L.roomYaw)) - SZ);
  }
  if (W) { W.renderer.setSize(w, h, false); W.camera.aspect = w / h; W.camera.updateProjectionMatrix(); }
}
addEventListener('resize', layout); layout();

/* ---------- 매 프레임 ---------- */
const ease = t => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
let last = performance.now(), time = 0;
function tick(now) {
  const dt = Math.min(0.05, (now - last) / 1000); last = now; time += dt;
  const k = 1 - Math.exp(-dt * 5), cam = W.camera;

  if (mode === 'fly') {
    flyT = Math.min(1, flyT + dt / 1.15);
    const e = ease(flyT), p = W.portals[cur];
    cam.position.set(Math.sin(p.th) * (R + 0.6) * e, lerp(EYE, CY * 0.92, e), -Math.cos(p.th) * (R + 0.6) * e);
    yaw = lerp(flyYaw0, -p.th, Math.min(1, e * 1.8)); pitch = lerp(pitch, 0, k);
    cam.fov = lerp(flyFov0, 80, e); cam.updateProjectionMatrix();
    fade = clamp((flyT - 0.58) / 0.36, 0, 1);
    if (flyT >= 1) { fade = 1; showRoom(cur); push('#' + P[cur].id); }
  } else if (mode === 'cut') {
    cutT += dt / 0.32; fade = Math.min(1, cutT);
    if (cutT >= 1) { const f = cutFn; cutFn = null; f(); sync(); }
  } else {
    fade += (0 - fade) * (1 - Math.exp(-dt * 3.2));
    const inRoom = mode === 'room', px = reduce ? 0 : mx, py = reduce ? 0 : my;
    yaw = lerp(yaw, (inRoom ? L.roomYaw : lobbyYaw()) - px * 0.055, k);
    pitch = lerp(pitch, (inRoom ? L.roomPitch : L.lobbyPitch) - py * 0.03, k);
    const fov = inRoom ? L.roomFov : L.lobbyFov, z = inRoom ? L.roomZ : 0;
    if (Math.abs(cam.fov - fov) > 0.01) { cam.fov = lerp(cam.fov, fov, k); cam.updateProjectionMatrix(); }
    cam.position.z = lerp(cam.position.z, z, k);
  }
  cam.rotation.set(pitch, yaw, 0);
  el.fade.style.opacity = fade < 0.004 ? '0' : fade.toFixed(3);

  W.color.lerp(W.colorTo, k * 0.6); W.scene.background.copy(W.color); W.scene.fog.color.copy(W.color);
  if (!reduce) W.dust.rotation.y += dt * 0.015;
  if (W.mood && !reduce) W.mood.tick(dt, time);

  if (mode === 'lobby') {
    hot = hotLabel;
    if (hot < 0 && W.ndc.x < 5) { W.ray.setFromCamera(W.ndc, cam); const hit = W.ray.intersectObjects(W.faces)[0]; hot = hit ? W.faces.indexOf(hit.object) : -1; }
    if (narrow && hot < 0) hot = focus;
    el.canvas.style.cursor = hot >= 0 && !narrow ? 'pointer' : '';
    cam.updateMatrixWorld();
    W.portals.forEach((p, i) => {
      p.h = lerp(p.h, hot === i ? 1 : 0, 1 - Math.exp(-dt * 9));
      p.mat.color.lerpColors(W.DIM, W.FULL, p.h); p.mm.color.copy(p.mat.color);
      p.glow.material.opacity = 0.32 + p.h * 0.5; p.g.scale.setScalar(1 + p.h * 0.025);
      W.v.copy(p.lp).project(cam);
      doorBtns[i].style.transform = `translate(${((W.v.x * 0.5 + 0.5) * innerWidth).toFixed(1)}px,${((-W.v.y * 0.5 + 0.5) * innerHeight).toFixed(1)}px)`;
      doorBtns[i].classList.toggle('hot', hot === i);
    });
  }
  W.renderer.render(W.scene, cam);
  requestAnimationFrame(tick);
}

/* ---------- 시작 ---------- */
const start = P.findIndex(p => '#' + p.id === location.hash);
if (start >= 0) showRoom(start); else showLobby();
if (W) requestAnimationFrame(tick); else el.fade.style.opacity = '0';
window.OJH = { state: () => ({ mode, cur, slide, narrow, gl: Boolean(W) }), enter, back, next };
