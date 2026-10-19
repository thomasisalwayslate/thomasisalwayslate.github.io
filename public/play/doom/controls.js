// Doom's arrow keys are digital. Shape thumb travel, then meter key-down time
// at the game's 35 Hz tick rate instead of turning every small drag into full speed.
export function stickPosition(x, y, radius) {
  const distance = Math.hypot(x, y);
  const scale = distance > radius ? radius / distance : 1;
  const dx = x * scale, dy = y * scale;
  const axis = (value, deadZone) => {
    const amount = Math.max(0, (Math.abs(value) / radius - deadZone) / (1 - deadZone));
    return Math.sign(value) * Math.pow(amount, 1.5);
  };
  const turn = axis(dx, 0.34), move = axis(dy, 0.24);
  return { x: dx, y: dy, keys: [
    ...(turn < 0 ? [263] : turn > 0 ? [262] : []),
    ...(move < 0 ? [265] : move > 0 ? [264] : []),
  ], turn, move };
}

export function attachDoomControls(root, ci) {
  const stick = root.querySelector('#joystick');
  const knob = root.querySelector('.stick-knob');
  const inputs = new Map();
  const sent = new Set();
  const timers = new Set();
  const resetButtons = [];
  const events = new AbortController();
  const listen = (target, type, callback) => target.addEventListener(type, callback, { signal: events.signal });
  const setKeys = (source, keys) => {
    if (keys.length) inputs.set(source, new Set(keys)); else inputs.delete(source);
    const next = new Set([...inputs.values()].flatMap(keys => [...keys]));
    for (const key of sent) if (!next.has(key)) ci.sendKeyEvent(key, false);
    for (const key of next) if (!sent.has(key)) ci.sendKeyEvent(key, true);
    sent.clear(); next.forEach(key => sent.add(key));
  };
  const later = (fn, delay) => {
    const timer = setTimeout(() => { timers.delete(timer); fn(); }, delay);
    timers.add(timer);
    return timer;
  };
  const cancelTimer = timer => { clearTimeout(timer); timers.delete(timer); };
  const speed = root.querySelector('#turn-speed');
  const speedValue = root.querySelector('#turn-speed-value');
  let sensitivity = Number(speed.value);
  listen(speed, 'input', () => {
    sensitivity = Number(speed.value);
    speedValue.textContent = `${Math.round(sensitivity * 100)}%`;
  });
  let pointer = null, origin = null, state = null, tick = 0, pulse = null;
  const stopPulse = () => { clearInterval(pulse); pulse = null; };
  const centerStick = () => {
    pointer = null;
    origin = null;
    state = null;
    stopPulse();
    setKeys('stick', []);
    stick.classList.remove('is-held');
    knob.style.transform = 'translate(0px, 0px)';
  };
  const release = () => {
    timers.forEach(clearTimeout); timers.clear();
    resetButtons.forEach(reset => reset());
    inputs.clear();
    sent.forEach(key => ci.sendKeyEvent(key, false)); sent.clear();
    root.querySelectorAll('.is-held').forEach(element => element.classList.remove('is-held'));
    centerStick();
  };
  const pulseStick = () => {
    if (!state) return;
    // Five game ticks per cycle. Forward travel can reach walking speed;
    // turning defaults to 60%, with a slower first part of the thumb's travel.
    const phase = tick++ % 5;
    const active = (value, gain = 1) => Math.abs(value) > 0 && phase < Math.max(1, Math.round(Math.abs(value) * gain * 5));
    setKeys('stick', [
      ...(active(state.turn, sensitivity) ? [state.turn < 0 ? 263 : 262] : []),
      ...(active(state.move) ? [state.move < 0 ? 265 : 264] : []),
    ]);
  };
  const move = event => {
    const previous = state;
    let x = event.clientX - origin.x, y = event.clientY - origin.y;
    // The portrait fallback rotates the entire player, including its controls.
    if (root.documentElement.classList.contains('landscape') && window.innerHeight > window.innerWidth) [x, y] = [y, -x];
    state = stickPosition(x, y, stick.offsetWidth * 0.33);
    knob.style.transform = `translate(${state.x}px, ${state.y}px)`;
    if (!state.keys.length) {
      setKeys('stick', []);
    } else if (!previous?.keys.length || Math.sign(previous.turn) !== Math.sign(state.turn) || Math.sign(previous.move) !== Math.sign(state.move)) {
      tick = 0;
      pulseStick();
    }
  };
  stick.setAttribute('aria-disabled', 'false');
  listen(stick, 'pointerdown', event => {
    if (pointer !== null || (event.pointerType === 'mouse' && event.button !== 0)) return;
    event.preventDefault();
    pointer = event.pointerId;
    // A thumb can land anywhere on the pad without starting a turn.
    origin = { x: event.clientX, y: event.clientY };
    tick = 0;
    stick.setPointerCapture(pointer);
    stick.classList.add('is-held');
    move(event);
    pulse = setInterval(pulseStick, 1000 / 35);
  });
  listen(stick, 'pointermove', event => {
    if (event.pointerId !== pointer) return;
    event.preventDefault();
    move(event);
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    listen(stick, type, event => { if (event.pointerId === pointer) centerStick(); });
  }
  const arrows = { ArrowLeft: 263, ArrowRight: 262, ArrowUp: 265, ArrowDown: 264 };
  listen(stick, 'keydown', event => {
    if (!(event.key in arrows)) return;
    event.preventDefault(); event.stopPropagation();
    setKeys(`keyboard-${event.key}`, [arrows[event.key]]);
  });
  listen(stick, 'keyup', event => {
    if (!(event.key in arrows)) return;
    event.preventDefault(); event.stopPropagation();
    setKeys(`keyboard-${event.key}`, []);
  });
  listen(stick, 'blur', release);
  root.querySelectorAll('[data-key]').forEach(button => {
    button.disabled = false;
    const key = Number(button.dataset.key);
    let activePointer = null, pressedAt = 0, timer;
    resetButtons.push(() => { activePointer = null; timer = undefined; });
    const source = `button-${key}`;
    const down = () => {
      cancelTimer(timer);
      pressedAt = performance.now();
      button.classList.add('is-held');
      setKeys(source, [key]);
      // Menu, weapon selection and Use are one deliberate press, even if held.
      if (button.hasAttribute('data-tap')) timer = later(() => setKeys(source, []), 85);
    };
    const up = (immediate = false) => {
      cancelTimer(timer);
      activePointer = null;
      button.classList.remove('is-held');
      // A quick Fire tap must survive at least one DOS game tick.
      timer = later(() => setKeys(source, []), immediate ? 0 : Math.max(0, 85 - (performance.now() - pressedAt)));
    };
    listen(button, 'pointerdown', event => {
      if (activePointer !== null || (event.pointerType === 'mouse' && event.button !== 0)) return;
      event.preventDefault();
      activePointer = event.pointerId;
      button.setPointerCapture(activePointer);
      down();
    });
    listen(button, 'pointerup', event => { if (event.pointerId === activePointer) up(); });
    for (const type of ['pointercancel', 'lostpointercapture']) {
      listen(button, type, event => { if (event.pointerId === activePointer) up(true); });
    }
    listen(button, 'click', event => { if (event.detail === 0) { down(); up(); } });
    listen(button, 'keydown', event => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation(); if (!event.repeat) down();
    });
    listen(button, 'keyup', event => {
      if (!['Enter', ' '].includes(event.key)) return;
      event.preventDefault(); event.stopPropagation(); up();
    });
  });
  listen(window, 'blur', release);
  listen(window, 'resize', release);
  listen(window, 'doom-layout-change', release);
  listen(window, 'pagehide', release);
  listen(document, 'visibilitychange', () => { if (document.hidden) release(); });
  return () => { release(); events.abort(); };
}
