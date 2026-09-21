/* OJH Orbit Portfolio — dependency-free, offline-capable interactive frontend.
   All project content is loaded from config.js. No analytics, APIs, or secrets.
   Animation is capped at 30 fps, respects reduced motion, and stops offscreen. */
(() => {
  'use strict';
  const logger = Object.freeze({
    info: (...args) => console.info('[OJH]', ...args),
    warn: (...args) => console.warn('[OJH]', ...args),
    error: (...args) => console.error('[OJH]', ...args)
  });
  const config = window.PORTFOLIO_CONFIG;
  const query = (selector, root = document) => root.querySelector(selector);
  const queries = (selector, root = document) => [...root.querySelectorAll(selector)];
  const filters = new Set(['all', 'ai', 'unity', 'quant', 'web', 'creative']);
  const filterNames = {all: 'ALL WORLDS', ai: 'AI & INTEGRATION', unity: 'UNITY / XR', quant: 'QUANT & DATA', web: 'WEB / APP', creative: 'INTERACTIVE EXPERIENCES'};
  const state = { filter: 'all', motion: true, heroVisible: true, modal: null, lastFocus: null };
  const animationControllers = [];
  let toastTimeout;
  let mediaQuery;

  function notify(message) {
    const toast = query('#toast');
    if (!toast) return;
    window.clearTimeout(toastTimeout);
    toast.textContent = String(message);
    toast.hidden = false;
    toastTimeout = window.setTimeout(() => { toast.hidden = true; }, 3600);
  }
  function failSoft(message, error) {
    logger.error(message, error);
    const errorBox = query('#app-error');
    if (errorBox) {
      errorBox.textContent = message + ' 새로고침하거나 Notion 링크에서 내용을 확인해 주세요.';
      errorBox.hidden = false;
    }
  }
  function safeInit(name, fn, critical = false) {
    try { fn(); }
    catch (error) {
      if (critical) failSoft(name + '을 불러오지 못했습니다.', error);
      else logger.warn(name + ' is unavailable. Core content remains usable.', error);
    }
  }
  function safeUrl(raw, email = false) {
    try {
      const url = new URL(raw);
      if (url.protocol === 'https:' || (email && url.protocol === 'mailto:')) return url.href;
    } catch (error) { logger.warn('Invalid configured URL', raw); }
    return null;
  }
  function assignLink(element, raw, email = false) {
    const href = safeUrl(raw, email);
    if (!href) {
      element.removeAttribute('href');
      element.setAttribute('aria-disabled', 'true');
      element.addEventListener('click', event => { event.preventDefault(); notify('아직 연결된 주소가 없습니다.'); });
      return;
    }
    element.href = href;
  }
  function makeElement(tag, className, text) {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = String(text);
    return element;
  }
  function makeIcon(name) {
    const image = document.createElement('img');
    // The exporter also uses this literal path prefix for offline bundling.
    image.src = assetPath('assets/icons/' + name + '.svg');
    image.className = 'icon'; image.alt = ''; image.width = 14; image.height = 14;
    return image;
  }
  function assetPath(path) {
    // Single-file export provides an inline asset map. Normal source uses local files.
    return window.__OJH_ASSETS && window.__OJH_ASSETS[path] ? window.__OJH_ASSETS[path] : path;
  }
  function setupLinks() {
    queries('[data-config-link]').forEach(element => {
      const key = element.dataset.configLink;
      const raw = key === 'email' ? 'mailto:' + config.email : config[key];
      assignLink(element, raw, key === 'email');
    });
    query('#email-text').textContent = config.email;
  }
  function createCard(project) {
    const card = makeElement('button', 'project-card');
    card.type = 'button'; card.dataset.projectId = project.id;
    card.setAttribute('aria-label', project.title + ' 프로젝트 상세 보기');
    card.setAttribute('aria-haspopup', 'dialog');
    const header = makeElement('div', 'project-card-head');
    const titleLine = makeElement('div', 'project-title-line');
    titleLine.append(makeElement('span', 'project-number', project.number), makeElement('h3', '', project.title));
    header.append(titleLine, makeElement('p', 'project-summary', project.subtitle));
    const art = makeElement('div', 'card-art');
    const image = makeElement('img');
    image.src = assetPath(project.art); image.alt = ''; image.width = 780; image.height = 309;
    image.loading = 'lazy'; image.decoding = 'async';
    image.addEventListener('error', () => {
      logger.warn('Artwork unavailable', project.id);
      image.hidden = true;
      art.lastElementChild.textContent = 'IMAGE UNAVAILABLE';
    }, {once: true});
    art.append(image, makeElement('span', '', 'CONCEPT ART'));
    const footer = makeElement('div', 'project-card-footer');
    const tags = makeElement('div', 'tag-list');
    project.tags.forEach(tag => tags.append(makeElement('span', '', tag)));
    const arrow = makeElement('span', 'card-open'); arrow.setAttribute('aria-hidden', 'true'); arrow.append(makeIcon('arrow-up-right'));
    footer.append(tags, arrow); card.append(header, art, footer);
    return card;
  }
  function renderProjects() {
    const grid = query('#project-grid');
    const selected = config.projects.filter(project => state.filter === 'all' || project.filters.includes(state.filter));
    const fragment = document.createDocumentFragment();
    if (!selected.length) fragment.append(makeElement('p', 'empty-state', '아직 공개된 프로젝트가 없습니다. All work에서 다른 작업을 확인하세요.'));
    selected.forEach(project => fragment.append(createCard(project)));
    grid.replaceChildren(fragment);
    query('#result-count').textContent = selected.length + (selected.length === 1 ? ' project' : ' projects');
  }
  function filterProjects(value, scroll = false) {
    if (!filters.has(value)) { logger.warn('Ignoring unknown filter', value); return; }
    state.filter = value;
    queries('[data-filter]').forEach(button => {
      const active = button.dataset.filter === value;
      button.setAttribute('aria-pressed', String(active));
      button.classList.toggle('active', active);
    });
    renderProjects();
    if (scroll) {
      query('#projects').scrollIntoView({behavior: state.motion ? 'smooth' : 'instant', block: 'start'});
    }
    animationControllers.forEach(controller => controller.redraw && controller.redraw());
  }
  function setupProjects() {
    if (!Array.isArray(config.projects)) throw new TypeError('projects must be an array');
    const ids = new Set();
    config.projects.forEach(project => {
      if (!project.id || ids.has(project.id) || !Array.isArray(project.filters) || !Array.isArray(project.tags)) throw new TypeError('Invalid or duplicate project configuration');
      ids.add(project.id);
    });
    const total = query('.filter[data-filter="all"] span');
    if (total) total.textContent = String(config.projects.length).padStart(2, '0');
    queries('[data-filter]').forEach(button => {
      button.addEventListener('click', () => {
        try { filterProjects(button.dataset.filter, false); }
        catch (error) { failSoft('프로젝트 목록', error); }
      });
    });
    query('#view-all').addEventListener('click', event => { event.preventDefault(); filterProjects('all', true); });
    query('#project-grid').addEventListener('click', event => {
      const card = event.target.closest('[data-project-id]');
      if (card) openProject(card.dataset.projectId, card);
    });
    renderProjects();
  }
  function openProject(id, opener) {
    try {
      const project = config.projects.find(item => item.id === id);
      if (!project) { logger.warn('Unknown project', id); return; }
      const dialog = query('#project-dialog');
      state.lastFocus = opener || document.activeElement;
      state.modal = id;
      query('#dialog-category').textContent = project.number + ' / ' + project.category;
      query('#dialog-title').textContent = project.title;
      query('#dialog-description').textContent = project.description;
      query('#dialog-role').textContent = project.role;
      query('#dialog-note').textContent = project.note;
      query('#dialog-art').src = assetPath(project.art);
      query('#dialog-art').style.objectPosition = project.id === 'aac' ? 'center 37%' : 'center';
      const tags = query('#dialog-tags'); tags.replaceChildren(...project.tags.map(tag => makeElement('span', '', tag)));
      const points = query('#dialog-points'); points.replaceChildren(...project.points.map(point => makeElement('li', '', point)));
      assignLink(query('#dialog-notion'), project.notion);
      document.body.classList.add('modal-open');
      if (typeof dialog.showModal === 'function') dialog.showModal();
      else { dialog.setAttribute('open', ''); dialog.setAttribute('role', 'dialog'); dialog.setAttribute('aria-modal', 'true'); }
      dialog.scrollTop = 0;
      query('#dialog-close').focus({preventScroll: true});
      syncAnimation();
    } catch (error) { failSoft('상세 창', error); document.body.classList.remove('modal-open'); state.modal = null; }
  }
  function closeProject() {
    const dialog = query('#project-dialog');
    if (!dialog.open) return;
    if (typeof dialog.close === 'function') dialog.close();
    else { dialog.removeAttribute('open'); finishClose(); }
  }
  function finishClose() {
    document.body.classList.remove('modal-open'); state.modal = null;
    if (state.lastFocus && state.lastFocus.isConnected) state.lastFocus.focus({preventScroll: true});
    window.dispatchEvent(new CustomEvent('ojh:project-closed'));
    syncAnimation();
  }
  function setupDialog() {
    const dialog = query('#project-dialog');
    query('#dialog-close').addEventListener('click', closeProject);
    dialog.addEventListener('close', finishClose);
    dialog.addEventListener('click', event => {
      if (event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeProject();
    });
    dialog.addEventListener('keydown', event => {
      if (event.key === 'Escape' && typeof dialog.close !== 'function') closeProject();
      // Explicit focus wrap also supports browsers with partial dialog implementations.
      if (event.key !== 'Tab') return;
      const focusables = queries('button:not([disabled]), a[href], [tabindex="0"]', dialog).filter(el => el.getClientRects().length);
      if (!focusables.length) return;
      const first = focusables[0], last = focusables[focusables.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    });
  }
  function setupNavigation() {
    const menu = query('#main-nav'), toggle = query('#menu-toggle');
    const closeMenu = () => { menu.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); toggle.setAttribute('aria-label', '메뉴 열기'); };
    toggle.addEventListener('click', () => {
      const open = !menu.classList.contains('open');
      menu.classList.toggle('open', open); toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? '메뉴 닫기' : '메뉴 열기');
    });
    queries('a[href^="#"]').forEach(link => link.addEventListener('click', closeMenu));
    document.addEventListener('click', event => { if (!menu.contains(event.target) && !toggle.contains(event.target)) closeMenu(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          queries('.nav-link').forEach(link => link.classList.toggle('active', link.hash === '#' + entry.target.id));
        });
      }, {rootMargin: '-10% 0px -65% 0px', threshold: 0});
      ['home', 'projects', 'about', 'skills'].forEach(id => observer.observe(document.getElementById(id)));
    }
  }
  async function copyEmail() {
    let copied = false;
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(config.email); copied = true;
      }
    } catch (error) { logger.info('Clipboard API unavailable; trying local selection fallback.'); }
    if (!copied) {
      const input = document.createElement('textarea');
      input.value = config.email; input.readOnly = true; input.tabIndex = -1;
      input.style.cssText = 'position:fixed;left:-10000px;top:0;opacity:0;';
      try {
        document.body.append(input); input.select(); input.setSelectionRange(0, input.value.length);
        copied = document.execCommand('copy');
      } catch (error) { logger.warn('Clipboard fallback was blocked', error); }
      finally { input.remove(); query('#copy-email').focus({preventScroll: true}); }
    }
    if (copied) notify('이메일 주소를 복사했어요.');
    else {
      try {
        const range = document.createRange(); range.selectNodeContents(query('#email-text'));
        const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range);
      } catch (error) { logger.warn('Unable to select email text', error); }
      notify('자동 복사가 제한되어 있어요.\n' + config.email + '\n주소를 길게 누르거나 선택해서 복사해 주세요.');
    }
  }
  function readMotionSetting() {
    try { return localStorage.getItem('ojh-motion'); }
    catch (error) { logger.info('Local storage unavailable; preferences apply to this visit only.'); return null; }
  }
  function setMotion(value, save = false) {
    state.motion = Boolean(value) && !mediaQuery.matches;
    document.body.classList.toggle('motion-paused', !state.motion);
    const toggle = query('#motion-toggle');
    toggle.setAttribute('aria-pressed', String(state.motion));
    const label = mediaQuery.matches ? '시스템 설정에 따라 모션이 꺼져 있습니다' : (state.motion ? '애니메이션 일시정지' : '애니메이션 재생');
    toggle.setAttribute('aria-label', label); toggle.title = label; toggle.disabled = mediaQuery.matches;
    query('.motion-icon').src = assetPath('assets/icons/' + (state.motion ? 'pause' : 'play') + '.svg');
    if (save) {
      try { localStorage.setItem('ojh-motion', state.motion ? 'on' : 'off'); }
      catch (error) { logger.info('Motion preference could not be persisted.'); }
    }
    syncAnimation();
  }
  function syncAnimation() {
    const running = state.motion && state.heroVisible && !document.hidden && !state.modal;
    animationControllers.forEach(controller => controller.setRunning(running));
    // The WebGL hero (hero3d.js) follows the same motion switch; it keeps rendering hover/focus but stops simulating.
    if (window.OJH_HERO) window.OJH_HERO.setRunning(state.motion && !document.hidden);
  }
  function setupMotion() {
    mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setMotion(readMotionSetting() !== 'off');
    query('#motion-toggle').addEventListener('click', () => { setMotion(!state.motion, true); notify(state.motion ? '모션을 다시 재생합니다.' : '모션을 잠시 멈췄어요.'); });
    const preferenceChange = () => setMotion(readMotionSetting() !== 'off');
    if (mediaQuery.addEventListener) mediaQuery.addEventListener('change', preferenceChange);
    else if (mediaQuery.addListener) mediaQuery.addListener(preferenceChange);
    document.addEventListener('visibilitychange', syncAnimation);
    if ('IntersectionObserver' in window) {
      const observer = new IntersectionObserver(entries => {
        state.heroVisible = entries[0].isIntersecting; syncAnimation();
      }, {threshold: 0.03});
      observer.observe(query('#home'));
    }
  }
  function randomGenerator(seed) {
    return () => { seed |= 0; seed = seed + 0x6D2B79F5 | 0; let value = Math.imul(seed ^ seed >>> 15, 1 | seed); value = value + Math.imul(value ^ value >>> 7, 61 | value) ^ value; return ((value ^ value >>> 14) >>> 0) / 4294967296; };
  }
  function setupCanvas(canvas, draw) {
    const context = canvas.getContext('2d', {alpha: true});
    if (!context) { logger.warn('Canvas 2D unavailable; using static artwork.'); return; }
    let running = false, frameId = 0, lastFrame = 0, time = 0, size = {width: 1, height: 1};
    const render = () => {
      try { context.clearRect(0, 0, size.width, size.height); draw(context, size, time); }
      catch (error) { logger.warn('Decorative animation stopped', error); running = false; window.cancelAnimationFrame(frameId); }
    };
    const tick = now => {
      if (!running) return;
      if (now - lastFrame >= 1000 / 30) {
        time += Math.min((now - lastFrame) / 1000, 0.06); lastFrame = now; render();
      }
      if (running) frameId = requestAnimationFrame(tick);
    };
    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      const ratio = Math.min(window.devicePixelRatio || 1, window.innerWidth < 700 ? 1.5 : 2);
      size = {width: Math.max(1, rect.width), height: Math.max(1, rect.height)};
      canvas.width = Math.round(size.width * ratio); canvas.height = Math.round(size.height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0); render();
    };
    const controller = {
      setRunning(value) {
        if (value === running) return;
        running = value; cancelAnimationFrame(frameId);
        if (running) { lastFrame = performance.now(); frameId = requestAnimationFrame(tick); }
        else render();
      },
      redraw: render
    };
    animationControllers.push(controller);
    if ('ResizeObserver' in window) new ResizeObserver(resize).observe(canvas);
    else window.addEventListener('resize', resize, {passive: true});
    resize();
  }
  function setupStars() {
    const random = randomGenerator(872626);
    const stars = Array.from({length: 130}, () => ({x: random(), y: random(), size: .25 + random() * .85, opacity: .16 + random() * .62, phase: random() * Math.PI * 2}));
    setupCanvas(query('#starfield'), (context, {width, height}, time) => {
      stars.slice(0, width < 700 ? 76 : 130).forEach(star => {
        context.beginPath(); context.fillStyle = `rgba(176,204,242,${star.opacity * (.75 + Math.sin(time * .55 + star.phase) * .25)})`;
        context.arc(star.x * width, star.y * height, star.size, 0, Math.PI * 2); context.fill();
      });
    });
  }
  function setupHeroBridge() {
    window.addEventListener('ojh:open-project', event => {
      const detail = event.detail || {};
      openProject(detail.id, detail.opener);
    });
  }
  if (!config) { failSoft('포트폴리오 설정', new Error('Missing config.js')); return; }
  safeInit('링크 설정', setupLinks, true);
  safeInit('프로젝트', setupProjects, true);
  safeInit('상세 창', setupDialog, true);
  safeInit('탐색 메뉴', setupNavigation);
  safeInit('모션 설정', setupMotion);
  safeInit('별 배경', setupStars);
  safeInit('3D 씬 연동', setupHeroBridge);
  safeInit('이메일 복사', () => query('#copy-email').addEventListener('click', copyEmail));
  syncAnimation();
  window.addEventListener('pagehide', () => { animationControllers.forEach(controller => controller.setRunning(false)); });
  window.addEventListener('pageshow', syncAnimation);
  logger.info('Portfolio ready. ' + config.projects.length + ' project notes loaded; no remote API requests.');
})();
