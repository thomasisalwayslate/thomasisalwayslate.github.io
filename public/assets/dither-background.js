/* Site-wide identity layer: the approved organic dither wallpaper behind the page. */
(function () {
  'use strict';

  var canvas = document.createElement('canvas');
  var context = canvas.getContext('2d', { alpha: false });
  canvas.id = 'dither-background';
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'position:fixed;inset:0;width:100%;height:100%;display:block;z-index:0;pointer-events:none;image-rendering:pixelated';
  document.body.insertBefore(canvas, document.body.firstChild);

  var width = 0;
  var height = 0;
  var cell = 8;
  var columns = 0;
  var rows = 0;
  var dpr = 1;
  var start = performance.now();
  var motion = window.matchMedia('(prefers-reduced-motion: reduce)');
  var frame = 0;

  function hash(x, y) {
    var value = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return value - Math.floor(value);
  }

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    width = Math.max(1, Math.floor(window.innerWidth * dpr));
    height = Math.max(1, Math.floor(window.innerHeight * dpr));
    cell = Math.max(5, Math.round(8 * dpr));
    columns = Math.ceil(width / cell);
    rows = Math.ceil(height / cell);
    canvas.width = width;
    canvas.height = height;
  }

  function draw(now) {
    var time = (now - start) / 1000;
    context.fillStyle = '#121212';
    context.fillRect(0, 0, width, height);
    for (var y = 0; y < rows; y += 1) {
      for (var x = 0; x < columns; x += 1) {
        var fold = Math.sin(x * .075 + Math.sin(y * .035 + time * .18) * 2.8 + time * .32);
        var current = Math.cos(y * .11 - Math.sin(x * .028 - time * .14) * 3.6 - time * .25);
        var eddy = Math.sin((x * .13 - y * .09) + Math.sin((x + y) * .025 + time * .22) * 2.2);
        var texture = hash(x, y) - .5;
        var value = (fold * .31 + current * .28 + eddy * .19) + hash(x * .7 + 11, y * .7 + 7) * .5 + texture * .17;
        if (value > .67) {
          context.fillStyle = '#e7e9ee';
          context.globalAlpha = .12 + Math.min(.28, (value - .67) * .64);
          context.fillRect(x * cell, y * cell, cell - 1, cell - 1);
        } else if (value > .45) {
          context.fillStyle = '#25272b';
          context.globalAlpha = .5;
          context.fillRect(x * cell, y * cell, cell - 1, cell - 1);
        }
      }
    }
    context.globalAlpha = 1;
    if (!motion.matches && !document.hidden) frame = window.requestAnimationFrame(draw);
  }

  function restart() {
    window.cancelAnimationFrame(frame);
    frame = 0;
    if (!document.hidden) draw(motion.matches ? start : performance.now());
  }
  resize();
  window.addEventListener('resize', function () { resize(); restart(); }, { passive: true });
  document.addEventListener('visibilitychange', restart);
  motion.addEventListener('change', restart);
  restart();
}());
