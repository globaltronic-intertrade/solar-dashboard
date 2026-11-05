// Fit a dashboard page to the screen with no scrolling (for TVs, laptops and demo screens).
//
// The dashboards have a fixed-height layout (about 770–880 px tall at any width). On a landscape
// screen this script lays the page out on a canvas with the screen's aspect ratio and exactly the
// content's height, then scales the canvas to the viewport — so the page fills the screen on a
// 1366×768 laptop and on a 1920×1080 TV alike. Narrow or portrait screens (phones, tablets) keep
// the page's own responsive layout and scroll as usual. Add ?fit=0 to the URL to turn it off.
//
// Load it as the FIRST element inside <body> (a plain, non-deferred script).
(function () {
  // Fitting only runs on viewports wider than every max-width breakpoint the pages use, and the
  // canvas never gets narrower than that either, so the narrow layouts never kick in.
  var MIN_FIT_WIDTH = 1201;
  var MAX_CANVAS_WIDTH = 3200;

  var root = document.documentElement;
  if (/[?&]fit=0\b/.test(location.search)) return;

  var style = document.createElement("style");
  style.textContent =
    "html.fit-screen{height:100%;overflow:hidden}" +
    "html.fit-screen body{width:var(--fit-w);min-height:var(--fit-h);margin:0;" +
    "overflow:hidden;transform-origin:0 0;" +
    "transform:translate(var(--fit-x),0) scale(var(--fit-s))}" +
    "html.fit-screen.fit-measure body{min-height:0}";
  document.head.appendChild(style);

  var lastWidth = 0;

  function contentHeightAt(width) {
    root.style.setProperty("--fit-w", width + "px");
    root.classList.add("fit-measure");
    var h = document.body.scrollHeight;
    root.classList.remove("fit-measure");
    return h;
  }

  function apply() {
    var vw = window.innerWidth;
    var vh = window.innerHeight;
    if (!document.body || vw < MIN_FIT_WIDTH || vw <= vh) {
      root.classList.remove("fit-screen");
      return;
    }
    root.classList.add("fit-screen");
    root.style.setProperty("--fit-s", "1");
    root.style.setProperty("--fit-x", "0px");

    // Canvas width that gives the content the screen's aspect ratio (two passes, in case the
    // content height depends on the width).
    var width = vw;
    for (var i = 0; i < 2; i++) {
      var h = contentHeightAt(width);
      width = Math.round(Math.min(MAX_CANVAS_WIDTH, Math.max(MIN_FIT_WIDTH, (h * vw) / vh)));
    }
    var contentH = contentHeightAt(width);
    var scale = Math.min(vw / width, vh / contentH);

    root.style.setProperty("--fit-s", String(scale));
    root.style.setProperty("--fit-h", vh / scale + "px");
    root.style.setProperty("--fit-x", Math.max(0, (vw - width * scale) / 2) + "px");

    // Charts that only listen for window resizes need a nudge when their container width changes.
    if (width !== lastWidth) {
      lastWidth = width;
      window.dispatchEvent(new Event("resize"));
    }
  }

  var timer;
  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(apply, 100);
  }

  document.addEventListener("DOMContentLoaded", apply);
  window.addEventListener("load", schedule);
  window.addEventListener("resize", schedule);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(schedule);
})();
