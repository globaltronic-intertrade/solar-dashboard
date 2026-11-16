// Mock data engine for the template dashboards — sample numbers only, no customer data.
//
// Everything is derived from the clock: a sun curve for the time of day, slow "cloud" waves and a
// per-day weather factor. The same moment always gives the same value, so a chart does not reshuffle
// when the page refreshes, and totals (today, month, lifetime) stay consistent with the live values.
//
// Add ?time=HH:MM to a page URL to start the demo clock at that time (e.g. ?time=12:30 to show a
// sunny midday when presenting in the evening). The clock keeps running from there.
(function () {
  var SUNRISE_MIN = 360; // 06:00
  var SUNSET_MIN = 1110; // 18:30
  var DAY_MS = 86400000;
  var STEP_MIN = 5;
  var SYSTEM_EFFICIENCY = 0.8;

  var offsetMs = 0;
  var override = /[?&]time=(\d{1,2}):(\d{2})\b/.exec(location.search);
  if (override) {
    var real = new Date();
    var wanted = new Date(real);
    wanted.setHours(+override[1], +override[2], 0, 0);
    offsetMs = wanted - real;
  }

  function now() {
    return new Date(Date.now() + offsetMs);
  }
  function minuteOfDay(date) {
    return date.getHours() * 60 + date.getMinutes() + date.getSeconds() / 60;
  }
  // Whole days since 1970-01-01 in local time — the key for "which day" everywhere below.
  function dayIndex(date) {
    return Math.floor((date.getTime() - date.getTimezoneOffset() * 60000) / DAY_MS);
  }
  function dateOfDay(day) {
    var utc = new Date(day * DAY_MS);
    return new Date(utc.getUTCFullYear(), utc.getUTCMonth(), utc.getUTCDate());
  }
  // Deterministic 0..1 pseudo-random number for an integer.
  function rand(n) {
    var x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }
  // Weather of a whole day: 0.72 (overcast) .. 1 (clear).
  function dayFactor(day, seed) {
    return 0.72 + 0.28 * rand(day + seed * 101);
  }
  // Sun height 0..1 for a minute of the day.
  function sun(min) {
    if (min <= SUNRISE_MIN || min >= SUNSET_MIN) return 0;
    return Math.pow(Math.sin((Math.PI * (min - SUNRISE_MIN)) / (SUNSET_MIN - SUNRISE_MIN)), 1.3);
  }
  // Passing clouds: 0.82..1, smooth in time.
  function clouds(day, min, seed) {
    return (
      1 -
      0.05 * (1 + Math.sin(min / 23 + day + seed)) -
      0.04 * (1 + Math.sin(min / 7.3 + day * 1.7 + seed * 2.1))
    );
  }
  function sky(day, min, seed) {
    return sun(min) * clouds(day, min, seed) * dayFactor(day, seed);
  }
  // PV output (kW) of a system of `kwp` at a minute of a day. `seed` makes systems differ.
  function pvKw(kwp, day, min, seed) {
    return kwp * SYSTEM_EFFICIENCY * sky(day, min, seed);
  }
  // Irradiance on the panels (W/m²).
  function irradiance(day, min, seed) {
    return 1000 * sky(day, min, seed);
  }
  // Small live flicker for instant readings: 1 ± pct.
  function jitter(pct) {
    return 1 + (Math.random() * 2 - 1) * pct;
  }
  // Energy (kWh) of a power function fn(min) → kW from 00:00 up to `uptoMin`.
  function energy(fn, uptoMin) {
    var sum = 0;
    for (var m = 0; m < uptoMin; m += STEP_MIN) {
      var width = Math.min(STEP_MIN, uptoMin - m);
      sum += (fn(m + width / 2) * width) / 60;
    }
    return sum;
  }

  window.MockSolar = {
    STEP_MIN: STEP_MIN,
    SUNRISE_MIN: SUNRISE_MIN,
    SUNSET_MIN: SUNSET_MIN,
    now: now,
    minuteOfDay: minuteOfDay,
    dayIndex: dayIndex,
    dateOfDay: dateOfDay,
    rand: rand,
    sun: sun,
    pvKw: pvKw,
    irradiance: irradiance,
    jitter: jitter,
    energy: energy,
  };
})();
