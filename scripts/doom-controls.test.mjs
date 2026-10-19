import test from 'node:test';
import assert from 'node:assert/strict';
import { attachDoomControls, stickPosition } from '../public/play/doom/controls.js';

class Element extends EventTarget {
  constructor(dataset = {}) {
    super();
    this.dataset = dataset;
    this.style = {};
    this.attributes = new Map();
    this.classes = new Set();
    this.classList = {
      add: name => this.classes.add(name),
      remove: name => this.classes.delete(name),
      contains: name => this.classes.has(name),
    };
    this.offsetWidth = 132;
    this.value = '0.6';
  }
  setAttribute(name, value) { this.attributes.set(name, value); }
  hasAttribute(name) { return this.attributes.has(name); }
  setPointerCapture() {}
}

function fixture(t) {
  t.mock.timers.enable({ apis: ['setTimeout', 'setInterval'] });
  let now = 0;
  t.mock.method(performance, 'now', () => now);
  const oldWindow = globalThis.window, oldDocument = globalThis.document;
  const window = Object.assign(new EventTarget(), { innerWidth: 390, innerHeight: 844 });
  const document = Object.assign(new EventTarget(), { hidden: false });
  globalThis.window = window;
  globalThis.document = document;
  const stick = new Element(), knob = new Element(), speed = new Element(), output = new Element();
  const fire = new Element({ key: '341' }), use = new Element({ key: '32' }), menu = new Element({ key: '256' });
  use.setAttribute('data-tap', '');
  menu.setAttribute('data-tap', '');
  const buttons = [fire, use, menu];
  const elements = { '#joystick': stick, '.stick-knob': knob, '#turn-speed': speed, '#turn-speed-value': output };
  const root = {
    documentElement: new Element(),
    querySelector: selector => elements[selector],
    querySelectorAll: selector => selector === '[data-key]' ? buttons : [stick, ...buttons].filter(e => e.classes.has('is-held')),
  };
  const keys = new Set(), calls = [];
  const detach = attachDoomControls(root, { sendKeyEvent: (key, down) => {
    calls.push({ key, down });
    if (down) keys.add(key); else keys.delete(key);
  } });
  t.after(() => {
    detach();
    globalThis.window = oldWindow;
    globalThis.document = oldDocument;
  });
  const event = (target, type, fields = {}) => target.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), {
    pointerId: 1, pointerType: 'touch', clientX: 100, clientY: 100, ...fields,
  }));
  const tick = milliseconds => { now += milliseconds; t.mock.timers.tick(milliseconds); };
  return { root, stick, fire, use, menu, speed, output, window, document, keys, calls, event, tick, detach };
}

test('thumb travel has a dead zone, gentle response and bounded diagonals', () => {
  assert.deepEqual(stickPosition(8, 8, 44).keys, []);
  const gentle = stickPosition(22, 0, 44), full = stickPosition(44, 0, 44);
  assert.ok(gentle.turn > 0 && gentle.turn < 0.2);
  assert.equal(full.turn, 1);
  const diagonal = stickPosition(1000, -1000, 44);
  assert.ok(Math.hypot(diagonal.x, diagonal.y) <= 44.001);
  assert.deepEqual(diagonal.keys, [262, 265]);
});

test('landing off-center never starts moving; only dragging past the dead zone does', t => {
  const f = fixture(t);
  f.event(f.stick, 'pointerdown', { clientX: 145, clientY: 120 });
  f.tick(200);
  assert.equal(f.keys.size, 0);
  f.event(f.stick, 'pointermove', { clientX: 145, clientY: 115 });
  assert.equal(f.keys.size, 0);
  f.event(f.stick, 'pointermove', { clientX: 145, clientY: 77 });
  assert.ok(f.keys.has(265));
  f.event(f.stick, 'pointerup');
  assert.equal(f.keys.size, 0);
});

test('default steering releases between pulses instead of holding full-speed turn', t => {
  const f = fixture(t);
  f.event(f.stick, 'pointerdown');
  f.event(f.stick, 'pointermove', { clientX: 144 });
  assert.ok(f.keys.has(262));
  f.tick(87);
  assert.ok(!f.keys.has(262));
  f.tick(57);
  assert.ok(f.keys.has(262));
  f.event(f.stick, 'pointercancel');
  f.tick(200);
  assert.equal(f.keys.size, 0);
});

test('lifting the joystick preserves a second finger holding Fire', t => {
  const f = fixture(t);
  f.event(f.stick, 'pointerdown');
  f.event(f.stick, 'pointermove', { clientY: 56 });
  f.event(f.fire, 'pointerdown', { pointerId: 2 });
  assert.deepEqual([...f.keys].sort(), [265, 341]);
  f.event(f.stick, 'pointerup');
  assert.deepEqual([...f.keys], [341]);
  f.event(f.fire, 'pointerup', { pointerId: 2 });
  f.tick(90);
  assert.equal(f.keys.size, 0);
});

test('Menu and Use tap once even when held, while Fire stays down', t => {
  const f = fixture(t);
  f.event(f.menu, 'pointerdown');
  f.event(f.use, 'pointerdown', { pointerId: 2 });
  f.event(f.fire, 'pointerdown', { pointerId: 3 });
  f.tick(100);
  assert.deepEqual([...f.keys], [341]);
  assert.equal(f.calls.filter(c => c.key === 256 && c.down).length, 1);
  f.event(f.fire, 'lostpointercapture', { pointerId: 3 });
  f.tick(1);
  assert.equal(f.keys.size, 0);
});

test('rotation maps the portrait fallback into landscape control coordinates', t => {
  const f = fixture(t);
  f.root.documentElement.classList.add('landscape');
  f.event(f.stick, 'pointerdown');
  f.event(f.stick, 'pointermove', { clientX: 144 });
  assert.deepEqual([...f.keys], [265]);
  f.event(f.stick, 'pointermove', { clientY: 144 });
  assert.deepEqual([...f.keys], [262]);
});

test('layout changes and hidden pages release every input and cancel pending taps', t => {
  const f = fixture(t);
  for (const reason of ['resize', 'doom-layout-change', 'blur']) {
    f.event(f.stick, 'pointerdown');
    f.event(f.stick, 'pointermove', { clientY: 56 });
    f.event(f.fire, 'pointerdown', { pointerId: 2 });
    f.window.dispatchEvent(new Event(reason));
    f.tick(200);
    assert.equal(f.keys.size, 0, reason);
  }
  f.event(f.fire, 'pointerdown');
  f.document.hidden = true;
  f.document.dispatchEvent(new Event('visibilitychange'));
  assert.equal(f.keys.size, 0);
});

test('turn speed can be changed and keyboard arrows retain direct control', t => {
  const f = fixture(t);
  f.speed.value = '1';
  f.speed.dispatchEvent(new Event('input'));
  assert.equal(f.output.textContent, '100%');
  f.event(f.stick, 'pointerdown');
  f.event(f.stick, 'pointermove', { clientX: 144 });
  f.tick(100);
  assert.ok(f.keys.has(262));
  f.event(f.stick, 'pointerup');
  f.event(f.stick, 'keydown', { key: 'ArrowUp' });
  assert.ok(f.keys.has(265));
  f.event(f.stick, 'keyup', { key: 'ArrowUp' });
  assert.equal(f.keys.size, 0);
});
