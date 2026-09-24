/**
 * Headless check of the card ring interaction (jsdom, no browser needed).
 *
 * Verifies:
 *  1. Short tap on a wedge calls toggle_slot for that wedge only
 *  2. Long press calls toggle_hour once and does not also toggle the wedge
 *  3. A swipe paints the crossed wedges with one set_slots call
 *  4. A swipe that starts on an active wedge clears the wedges it crosses
 *  5. The ring has 96 wedges at 15 minutes and 48 at 30 minutes
 *
 * Requires jsdom (dev only): npm install --no-save --legacy-peer-deps jsdom
 * Run: node scripts/verify-card-gestures.mjs
 */
import { JSDOM } from 'jsdom';

const dom = new JSDOM('<!doctype html><html><body></body></html>', {
  pretendToBeVisual: true,
  url: 'http://localhost/',
});

// Expose the jsdom window as the global environment the bundle expects
globalThis.window = dom.window;
for (const key of Object.getOwnPropertyNames(dom.window)) {
  if (key in globalThis || key.startsWith('_')) continue;
  const value = dom.window[key];
  try {
    globalThis[key] = typeof value === 'function' && !value.prototype
      ? value.bind(dom.window)
      : value;
  } catch {
    // read-only globals (e.g. navigator) are fine to skip
  }
}
globalThis.document = dom.window.document;
globalThis.Document = dom.window.Document;
globalThis.customElements = dom.window.customElements;
// Node ships its own Event/CustomEvent, which jsdom's dispatchEvent rejects
globalThis.Event = dom.window.Event;
globalThis.CustomEvent = dom.window.CustomEvent;
globalThis.EventTarget = dom.window.EventTarget;

await import('../shabbat-clock-card.js');

const ENTITY = 'sensor.shabbat_clock_test';
const CENTER = 200;
const RING_MID = 115;
const calls = [];

function makeSlots(isActive = () => false) {
  const slots = [];
  for (let hour = 0; hour < 24; hour++) {
    for (const minute of [0, 15, 30, 45]) {
      slots.push({ hour, minute, isActive: isActive(hour, minute) });
    }
  }
  return slots;
}

function makeHass(slots, resolution = 15) {
  return {
    language: 'en',
    states: {
      [ENTITY]: {
        entity_id: ENTITY,
        state: 'on',
        attributes: {
          friendly_name: 'Test timer',
          home_status: true,
          enabled: true,
          slot_resolution: resolution,
          controlled_entities: [],
          time_slots: slots.map((s) => ({ ...s })),
        },
      },
    },
    callService: async (domain, service, data) => {
      calls.push({ domain, service, data });
    },
  };
}

async function mountCard(resolution = 15, slots = makeSlots()) {
  const card = document.createElement('shabbat-clock-card');
  card.setConfig({ entity: ENTITY, show_title: true });
  card.hass = makeHass(slots, resolution);
  document.body.appendChild(card);
  await card.updateComplete;

  // jsdom has no SVG layout, so make the screen matrix an identity transform:
  // pointer coordinates are then read directly as viewBox coordinates
  const svg = card.shadowRoot.querySelector('svg.timer-svg');
  svg.createSVGPoint = () => ({
    x: 0,
    y: 0,
    matrixTransform() {
      return { x: this.x, y: this.y };
    },
  });
  svg.getScreenCTM = () => ({ inverse: () => ({}) });
  svg.setPointerCapture = () => {};
  svg.releasePointerCapture = () => {};
  card.ringSvg = svg;
  return card;
}

function wedgePaths(card) {
  return [...card.shadowRoot.querySelectorAll('path')].filter((p) => {
    const title = p.querySelector('title')?.textContent?.trim() ?? '';
    return /^\d{2}:\d{2}$/.test(title);
  });
}

/** Point at the middle of the wedge that holds hour:minute */
function pointFor(hour, minute, resolution) {
  const count = resolution === 15 ? 96 : 48;
  const index =
    resolution === 15 ? hour * 4 + minute / 15 : hour * 2 + (minute >= 30 ? 1 : 0);
  const angle = (((index + 0.5) * 360) / count - 90) * (Math.PI / 180);
  return {
    x: CENTER + RING_MID * Math.cos(angle),
    y: CENTER + RING_MID * Math.sin(angle),
  };
}

function fire(card, type, point) {
  const event = new dom.window.Event(type, { bubbles: true, cancelable: true });
  Object.assign(event, { pointerId: 1, clientX: point?.x ?? 0, clientY: point?.y ?? 0 });
  card.ringSvg.dispatchEvent(event);
}

function labels(card, fontSize) {
  return [...card.shadowRoot.querySelectorAll('text')].filter(
    (t) => t.getAttribute('font-size') === fontSize
  );
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const results = [];
function check(name, condition, detail = '') {
  results.push({ name, ok: Boolean(condition), detail });
}

// --- 1. short tap toggles only the tapped wedge ----------------------------
{
  const card = await mountCard(15);
  calls.length = 0;
  fire(card, 'pointerdown', pointFor(9, 30, 15));
  fire(card, 'pointerup', pointFor(9, 30, 15));
  await sleep(50);

  check('short tap fires exactly one service call', calls.length === 1, JSON.stringify(calls));
  check(
    'short tap calls toggle_slot for 09:30 only',
    calls[0]?.service === 'toggle_slot' &&
      calls[0]?.data?.hour === 9 &&
      calls[0]?.data?.minute === 30,
    JSON.stringify(calls[0])
  );
  card.remove();
}

// --- 2. long press toggles the whole hour, and only that -------------------
{
  const card = await mountCard(15);
  calls.length = 0;
  fire(card, 'pointerdown', pointFor(21, 15, 15));
  await sleep(700);
  fire(card, 'pointerup', pointFor(21, 15, 15));
  await sleep(50);

  check('long press fires exactly one service call', calls.length === 1, JSON.stringify(calls));
  check(
    'long press calls toggle_hour for hour 21',
    calls[0]?.service === 'toggle_hour' && calls[0]?.data?.hour === 21,
    JSON.stringify(calls[0])
  );
  check(
    'long press does not also toggle the held wedge',
    !calls.some((c) => c.service === 'toggle_slot'),
    JSON.stringify(calls)
  );
  card.remove();
}

// --- 3. swipe paints the crossed wedges in one call ------------------------
{
  const card = await mountCard(15);
  calls.length = 0;
  fire(card, 'pointerdown', pointFor(6, 0, 15));
  fire(card, 'pointermove', pointFor(6, 45, 15));
  fire(card, 'pointermove', pointFor(7, 30, 15));
  fire(card, 'pointerup', pointFor(7, 30, 15));
  await sleep(50);

  const painted = calls[0]?.data?.slots ?? [];
  check('swipe fires exactly one service call', calls.length === 1, JSON.stringify(calls));
  check(
    'swipe calls set_slots for 06:00 through 07:30',
    calls[0]?.service === 'set_slots' &&
      painted.length === 7 &&
      painted.every((s) => s.isActive === true) &&
      painted[0].hour === 6 &&
      painted[0].minute === 0 &&
      painted[6].hour === 7 &&
      painted[6].minute === 30,
    JSON.stringify(calls[0]?.data)
  );
  card.remove();
}

// --- 4. a swipe that starts on an active wedge erases ----------------------
{
  const active = makeSlots((hour) => hour === 12 || hour === 13);
  const card = await mountCard(15, active);
  calls.length = 0;
  fire(card, 'pointerdown', pointFor(12, 0, 15));
  fire(card, 'pointermove', pointFor(12, 45, 15));
  fire(card, 'pointerup', pointFor(12, 45, 15));
  await sleep(50);

  const painted = calls[0]?.data?.slots ?? [];
  check(
    'swipe from an active wedge turns the crossed wedges off',
    calls[0]?.service === 'set_slots' &&
      painted.length === 4 &&
      painted.every((s) => s.isActive === false && s.hour === 12),
    JSON.stringify(calls[0]?.data)
  );
  card.remove();
}

// --- 5. ring shape per resolution -----------------------------------------
{
  const card = await mountCard(15);
  check('15-minute ring draws 96 wedges', wedgePaths(card).length === 96, `${wedgePaths(card).length}`);
  check('24 hour numbers render', labels(card, '13').length === 24, `${labels(card, '13').length}`);
  card.remove();
}

{
  const card = await mountCard(30);
  check('30-minute ring draws 48 wedges', wedgePaths(card).length === 48, `${wedgePaths(card).length}`);

  calls.length = 0;
  fire(card, 'pointerdown', pointFor(10, 30, 30));
  fire(card, 'pointerup', pointFor(10, 30, 30));
  await sleep(50);
  check(
    '30-minute view toggles the half-hour wedge',
    calls.length === 1 &&
      calls[0].service === 'toggle_slot' &&
      calls[0].data.hour === 10 &&
      calls[0].data.minute === 30,
    JSON.stringify(calls)
  );
  card.remove();
}

let failed = 0;
for (const r of results) {
  if (!r.ok) failed++;
  console.log(`${r.ok ? 'PASS' : 'FAIL'}  ${r.name}${r.ok ? '' : ` — ${r.detail}`}`);
}
console.log(`\n${results.length - failed}/${results.length} checks passed`);
process.exit(failed === 0 ? 0 : 1);
