#!/usr/bin/env python3
"""Variant D ("the voyage") as a small multi-page site:
   /                      homepage: hero -> cast off -> FORK (choose your course) -> on board -> booking
   /kleftiko-tour-milos/  full voyage west: Adamas, Klima, Sykia, Kleftiko, Kalogries
   /polyaigos-tour/       full voyage east: Adamas, Kimolos, Polyaigos, Manolonisi
Each page has its own URL, title, description, H1 and structured data, linked with real <a href> links.
Usage: python3 build.py <base-voyage.html> <out-dir> [--artifact <fragment-out.html>]
"""
import json, os, re, sys, html as H

BASE, OUT = sys.argv[1], sys.argv[2]
ART = sys.argv[sys.argv.index('--artifact') + 1] if '--artifact' in sys.argv else None
DEMO = '--demo' in sys.argv   # preview only: show clearly labelled example cards
CREW = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'crew.json'), encoding='utf8')).get('crew', [])
REV = json.load(open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'reviews.json'), encoding='utf8'))
DOMAIN = 'https://milossailways.gr'
U = 'https://milossailways.gr/wp-content/uploads/'
WA = 'https://wa.me/306932977623'

src = open(BASE, encoding='utf8').read()
CSS = src[src.index('<style>') + 7: src.index('</style>')]
JS = src[src.index('<script>') + 8: src.rindex('</script>')]

# ───────────────────────── engine changes (config-driven) ─────────────────────────
def rep(s, a, b):
    assert a in s, a[:70]
    return s.replace(a, b)

old_coast = JS[JS.index('  // ── the coast: world positions match the chapters'): JS.index('  window.addEventListener(\'resize\', syncCoast);')]
JS = JS.replace(old_coast, """  // ── the coast: one landmark per chapter, positions synced to the real layout
  var CFG = window.VOYAGE;
  if (CFG.palette) PAL = CFG.palette;
  var coast = CFG.stops.map(function (s) { return { at: 0, kind: s.kind, w: s.w || 0.9, id: s.id }; });
  var SPEED = 4.4, HOME_AT = 0.86;
  function syncCoast() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    if (max <= 0) return;
    coast.forEach(function (c) {
      var el = document.getElementById(c.id);
      var at = (el.offsetTop + el.offsetHeight / 2 - window.innerHeight / 2) / max;
      c.at = Math.max(0, Math.min(1, at));
      c.ax = el.classList.contains('right') ? 0.4 : 0.64;  // keep each landmark clear of its text card
    });
    HOME_AT = coast[coast.length - 1].at;
  }
""")
JS = rep(JS, "var T_AT = [600, 660, 720, 780, 930, 1050], mins = 600;", "var T_AT = CFG.stops.map(function (s) { return s.time; }), mins = T_AT[0];")

# new landmarks
JS = rep(JS, """    ctx.save();
    if (o.kind === 'arches') {""", """    ctx.save();
    if (o.kind === 'none') { ctx.restore(); return; }
    if (o.kind === 'lighthouse') {
      // a rocky point with a lighthouse: the signpost of the sea
      ctx.fillStyle = hill;
      ctx.beginPath(); ctx.moveTo(cx - w * 0.35, hy + 2); ctx.quadraticCurveTo(cx - w * 0.1, hy - H * 0.06, cx + w * 0.05, hy - H * 0.065); ctx.quadraticCurveTo(cx + w * 0.25, hy - H * 0.05, cx + w * 0.4, hy + 2); ctx.closePath(); ctx.fill();
      var lx = cx, lb = hy - H * 0.06, lh = H * 0.075, lw = Math.max(8, w * 0.035);
      var tg = ctx.createLinearGradient(lx - lw, 0, lx + lw, 0); tg.addColorStop(0, '#ffffff'); tg.addColorStop(1, '#d9dfe5');
      ctx.fillStyle = tg; ctx.beginPath(); ctx.moveTo(lx - lw * 0.75, lb); ctx.lineTo(lx - lw * 0.5, lb - lh); ctx.lineTo(lx + lw * 0.5, lb - lh); ctx.lineTo(lx + lw * 0.75, lb); ctx.fill();
      ctx.fillStyle = '#d64545'; ctx.fillRect(lx - lw * 0.62, lb - lh * 0.55, lw * 1.24, lh * 0.12);
      ctx.fillStyle = '#2a3b4c'; ctx.fillRect(lx - lw * 0.6, lb - lh - lw * 0.9, lw * 1.2, lw * 0.9);
      ctx.fillStyle = '#ffd36b'; ctx.fillRect(lx - lw * 0.4, lb - lh - lw * 0.75, lw * 0.8, lw * 0.6);
      ctx.fillStyle = '#d64545'; ctx.beginPath(); ctx.moveTo(lx - lw * 0.75, lb - lh - lw * 0.9); ctx.lineTo(lx, lb - lh - lw * 1.7); ctx.lineTo(lx + lw * 0.75, lb - lh - lw * 0.9); ctx.fill();
      var beam = ctx.createRadialGradient(lx, lb - lh - lw * 0.45, 0, lx, lb - lh - lw * 0.45, lw * 6);
      beam.addColorStop(0, 'rgba(255,220,120,' + (0.25 + 0.25 * Math.sin(T * 2.5)) + ')'); beam.addColorStop(1, 'rgba(255,220,120,0)');
      ctx.fillStyle = beam; ctx.beginPath(); ctx.arc(lx, lb - lh - lw * 0.45, lw * 6, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); return;
    }
    if (o.kind === 'polyaigos') {
      // long, low, sun-bleached island with white beaches
      var pg = ctx.createLinearGradient(0, hy - H * 0.1, 0, hy); pg.addColorStop(0, rgb(mix(col[1], [222, 196, 150], 0.65))); pg.addColorStop(1, rgb(mix(col[1], [186, 158, 118], 0.7)));
      ctx.fillStyle = pg;
      ctx.beginPath(); ctx.moveTo(cx - w * 0.7, hy + 2);
      ctx.bezierCurveTo(cx - w * 0.55, hy - H * 0.06, cx - w * 0.3, hy - H * 0.1, cx - w * 0.1, hy - H * 0.085);
      ctx.bezierCurveTo(cx + w * 0.1, hy - H * 0.07, cx + w * 0.3, hy - H * 0.11, cx + w * 0.5, hy - H * 0.06);
      ctx.quadraticCurveTo(cx + w * 0.65, hy - H * 0.02, cx + w * 0.72, hy + 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#f7f1e3'; [-0.45, -0.05, 0.38].forEach(function (b) { ctx.beginPath(); ctx.ellipse(cx + b * w, hy, w * 0.09, H * 0.008, 0, 0, Math.PI * 2); ctx.fill(); });
      ctx.fillStyle = 'rgba(120,140,90,.55)'; [-0.3, 0.05, 0.22].forEach(function (b, n) { ctx.beginPath(); ctx.ellipse(cx + b * w, hy - H * (0.07 + n * 0.006), w * 0.04, H * 0.009, 0, 0, Math.PI * 2); ctx.fill(); });
      ctx.restore(); return;
    }
    if (o.kind === 'islet') {
      var ig = ctx.createLinearGradient(0, hy - H * 0.06, 0, hy); ig.addColorStop(0, rgb(mix(col[1], [170, 150, 125], 0.6))); ig.addColorStop(1, rgb(mix(col[1], [120, 105, 95], 0.65)));
      ctx.fillStyle = ig;
      ctx.beginPath(); ctx.moveTo(cx - w * 0.22, hy + 2); ctx.quadraticCurveTo(cx - w * 0.12, hy - H * 0.07, cx + w * 0.02, hy - H * 0.065); ctx.quadraticCurveTo(cx + w * 0.16, hy - H * 0.04, cx + w * 0.24, hy + 2); ctx.closePath(); ctx.fill();
      ctx.fillStyle = 'rgba(110,135,80,.7)'; ctx.beginPath(); ctx.ellipse(cx - w * 0.03, hy - H * 0.06, w * 0.05, H * 0.012, 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); return;
    }
    if (o.kind === 'arches') {""")
JS = rep(JS, """      if (o.kind === 'port') {""", """      if (o.kind === 'kimolos') {
        // Chorio: a white village along the ridge, a church dome and a windmill
        [-0.14, -0.08, -0.02, 0.04, 0.1, 0.16].forEach(function (b, k) {
          var px = cx + b * w, bw = w * 0.055, bh = H * (0.022 + (k % 3) * 0.006), top = hy - H * 0.15 + Math.abs(b) * H * 0.12;
          ctx.fillStyle = '#ffffff'; ctx.fillRect(px - bw / 2, top - bh, bw, bh + 6);
          if (k === 2) { ctx.fillStyle = '#1f5fbf'; ctx.beginPath(); ctx.arc(px, top - bh, bw * 0.35, Math.PI, 0); ctx.fill(); }
        });
        var mx = cx + w * 0.26, my = hy - H * 0.1;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(mx - 6, my - H * 0.04, 12, H * 0.04);
        ctx.strokeStyle = 'rgba(80,70,60,.8)'; ctx.lineWidth = 2;
        for (var bl = 0; bl < 4; bl++) { var ba = T * 0.8 + bl * Math.PI / 2; ctx.beginPath(); ctx.moveTo(mx, my - H * 0.04); ctx.lineTo(mx + Math.cos(ba) * H * 0.03, my - H * 0.04 + Math.sin(ba) * H * 0.03); ctx.stroke(); }
      }
      if (o.kind === 'port') {""")

JS = rep(JS, "var cx = W * 0.62 + (o.at - P) * unit * SPEED;", "var cx = W * (W >= 860 ? (o.ax || 0.62) : 0.62) + (o.at - P) * unit * SPEED;")
# recognisable landmarks, drawn after the real places (replace the generic shapes)
JS = rep(JS, "    if (o.kind === 'arches') {", r"""    var R = function (i) { var x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
    var mob = W < 700 ? 0.82 : 1;
    if (o.kind === 'port') {
      // Plaka with the Kastro on its peak above the bay; Adamas along the waterline
      var ph = function (t) { return mob * (H * 0.215 * Math.exp(-Math.pow((t - 0.12) / 0.33, 2)) + H * 0.04 * Math.exp(-Math.pow((t + 0.4) / 0.32, 2))); };
      ctx.fillStyle = hill;
      ctx.beginPath(); ctx.moveTo(cx - 0.78 * w, hy + 2);
      for (var i = 0; i <= 48; i++) { var t = -0.78 + i * 1.56 / 48; ctx.lineTo(cx + t * w, hy - ph(t) + (Math.abs(t - 0.12) < 0.06 ? R(i) * H * 0.006 : 0)); }
      ctx.lineTo(cx + 0.78 * w, hy + 2); ctx.closePath(); ctx.fill();
      // rocky summit of the Kastro
      ctx.fillStyle = rgb(mix(col[1], [125, 108, 96], 0.6));
      ctx.beginPath(); ctx.moveTo(cx + 0.03 * w, hy - ph(0.03));
      for (var i2 = 0; i2 <= 8; i2++) { var t2 = 0.03 + i2 * 0.18 / 8; ctx.lineTo(cx + t2 * w, hy - ph(t2) - (i2 % 2 ? H * 0.006 : 0)); }
      ctx.lineTo(cx + 0.18 * w, hy - ph(0.18) + H * 0.035); ctx.lineTo(cx + 0.06 * w, hy - ph(0.06) + H * 0.04); ctx.closePath(); ctx.fill();
      // chapel on the very top
      var chx = cx + 0.12 * w, chy = hy - ph(0.12) - H * 0.004 * mob, cw2 = w * 0.03;
      ctx.fillStyle = '#ffffff'; ctx.fillRect(chx - cw2 / 2, chy - H * 0.018 * mob, cw2, H * 0.018 * mob);
      ctx.beginPath(); ctx.moveTo(chx - cw2 * 0.25, chy - H * 0.018 * mob); ctx.lineTo(chx, chy - H * 0.03 * mob); ctx.lineTo(chx + cw2 * 0.25, chy - H * 0.018 * mob); ctx.fill();
      // Plaka: white houses cascading down below the summit, a few blue domes
      for (var hI = 0; hI < 38; hI++) {
        var ht = -0.18 + R(hI) * 0.56; if (Math.abs(ht - 0.11) < 0.06) continue;
        var depth = 0.18 + R(hI + 40) * 0.5, hb = hy - ph(ht) * (1 - depth) + H * 0.012;
        var bw2 = w * 0.026 * (0.8 + R(hI + 9) * 0.7), bh2 = H * 0.015 * mob * (0.8 + R(hI + 3) * 0.8);
        ctx.fillStyle = R(hI + 77) > 0.85 ? '#f3ead8' : '#ffffff'; ctx.fillRect(cx + ht * w - bw2 / 2, hb - bh2, bw2, bh2);
        ctx.fillStyle = 'rgba(40,60,80,.35)'; ctx.fillRect(cx + ht * w - bw2 * 0.1, hb - bh2 * 0.62, bw2 * 0.2, bh2 * 0.35);
        if (hI % 9 === 4) { ctx.fillStyle = '#1f5fbf'; ctx.beginPath(); ctx.arc(cx + ht * w, hb - bh2, bw2 * 0.38, Math.PI, 0); ctx.fill(); }
      }
      // Adamas at the waterline: low houses, a church with a blue dome, little boats
      for (var aI = 0; aI < 16; aI++) {
        var at2 = -0.66 + aI * 0.034, abw = w * 0.03, abh = H * mob * (0.016 + R(aI + 20) * 0.012);
        ctx.fillStyle = '#ffffff'; ctx.fillRect(cx + at2 * w, hy - abh, abw, abh + 2);
      }
      ctx.fillStyle = '#ffffff'; ctx.fillRect(cx - 0.36 * w, hy - H * 0.04 * mob, w * 0.04, H * 0.04 * mob);
      ctx.fillStyle = '#1f5fbf'; ctx.beginPath(); ctx.arc(cx - 0.34 * w, hy - H * 0.04 * mob, w * 0.017, Math.PI, 0); ctx.fill();
      for (var bI = 0; bI < 5; bI++) {
        var bx = cx + (-0.6 + bI * 0.09) * w;
        ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(bx, hy + 2, w * 0.018, 2.4, 0, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = 'rgba(255,255,255,.8)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(bx, hy); ctx.lineTo(bx, hy - H * 0.035 * mob); ctx.stroke();
      }
      ctx.restore(); return;
    }
    if (o.kind === 'klima') {
      // Klima: the syrmata, two-storey fishermen's houses with a boat garage below and painted doors
      ctx.fillStyle = hill;
      ctx.beginPath(); ctx.moveTo(cx - w * 0.75, hy + 2); ctx.bezierCurveTo(cx - w * 0.4, hy - H * 0.13 * mob, cx + w * 0.25, hy - H * 0.15 * mob, cx + w * 0.75, hy + 2); ctx.closePath(); ctx.fill();
      for (var tI = 0; tI < 9; tI++) { var tx2 = cx + (-0.3 + R(tI + 300) * 0.6) * w, ty2 = hy - H * mob * (0.08 + R(tI + 310) * 0.04); ctx.fillStyle = '#ffffff'; ctx.fillRect(tx2, ty2, w * 0.022, H * 0.012 * mob); }
      var doors = ['#d64545', '#2d7fd1', '#f2b51c', '#2aa66a', '#8e44ad', '#16a1a1', '#e67e22', '#3b5bdb', '#c0392b', '#27ae60', '#f39c12'];
      var n = 11, sw = w * 0.083, gap = w * 0.007, x0 = cx - n * (sw + gap) / 2;
      for (var j = 0; j < n; j++) {
        var hx = x0 + j * (sw + gap), hh = H * mob * (0.046 + R(j + 7) * 0.014), fl = hh * 0.5, dc = doors[j % doors.length];
        ctx.fillStyle = '#ffffff'; ctx.fillRect(hx, hy - hh, sw, hh + 2);
        ctx.fillStyle = 'rgba(0,0,0,.07)'; ctx.fillRect(hx + sw * 0.86, hy - hh, sw * 0.14, hh + 2);
        ctx.fillStyle = '#f6f2ea'; ctx.fillRect(hx - sw * 0.03, hy - hh - 2, sw * 1.06, 3);
        ctx.fillStyle = dc;
        ctx.beginPath(); ctx.moveTo(hx + sw * 0.16, hy + 2); ctx.lineTo(hx + sw * 0.16, hy - fl * 0.62); ctx.quadraticCurveTo(hx + sw * 0.5, hy - fl * 1.08, hx + sw * 0.84, hy - fl * 0.62); ctx.lineTo(hx + sw * 0.84, hy + 2); ctx.fill();
        ctx.fillStyle = 'rgba(0,0,0,.18)'; for (var pl = 1; pl < 4; pl++) ctx.fillRect(hx + sw * (0.16 + pl * 0.17), hy - fl * 0.7, 1, fl * 0.7);
        ctx.fillStyle = dc; ctx.fillRect(hx + sw * 0.18, hy - hh + hh * 0.14, sw * 0.22, hh * 0.3); ctx.fillRect(hx + sw * 0.58, hy - hh + hh * 0.17, sw * 0.2, hh * 0.17);
        ctx.fillStyle = '#7a4e2d'; ctx.fillRect(hx + sw * 0.06, hy - fl - hh * 0.04, sw * 0.88, Math.max(1.5, hh * 0.05));
        for (var rl = 0; rl < 6; rl++) ctx.fillRect(hx + sw * (0.08 + rl * 0.16), hy - fl - hh * 0.15, Math.max(1, sw * 0.022), hh * 0.11);
      }
      ctx.restore(); return;
    }
    if (o.kind === 'cliff') {
      // Sykia: banded volcanic cliffs and the sea cave whose roof has fallen in, so light pours down inside
      var tp = function (t) { var v = H * mob * (0.2 + 0.025 * Math.sin(t * 9) + 0.018 * Math.sin(t * 23)) * (1 - Math.pow(Math.abs(t) / 0.64, 4)); if (Math.abs(t + 0.02) < 0.08) v -= H * mob * 0.065 * (1 - Math.abs(t + 0.02) / 0.08); return Math.max(0, v); };
      ctx.save();
      ctx.beginPath(); ctx.moveTo(cx - 0.64 * w, hy + 2);
      for (var cI = 0; cI <= 64; cI++) { var ct = -0.64 + cI * 1.28 / 64; ctx.lineTo(cx + ct * w, hy - tp(ct)); }
      ctx.lineTo(cx + 0.64 * w, hy + 2); ctx.closePath();
      var sgc = ctx.createLinearGradient(0, hy - H * 0.22, 0, hy); sgc.addColorStop(0, rgb(mix(col[1], [150, 105, 85], 0.7))); sgc.addColorStop(1, rgb(mix(col[1], [72, 58, 62], 0.8)));
      ctx.fillStyle = sgc; ctx.fill(); ctx.clip();
      for (var k2 = 0; k2 < 7; k2++) {
        var by = hy - H * mob * (0.025 + k2 * 0.03);
        ctx.fillStyle = k2 % 2 ? 'rgba(190,95,60,.22)' : 'rgba(245,215,165,.16)';
        ctx.beginPath(); ctx.moveTo(cx - w, by); ctx.quadraticCurveTo(cx, by - H * 0.025, cx + w, by + H * 0.01); ctx.lineTo(cx + w, by + H * 0.022); ctx.quadraticCurveTo(cx, by - H * 0.01, cx - w, by + H * 0.012); ctx.fill();
      }
      ctx.restore();
      var mx2 = cx - w * 0.02, mw = w * 0.12, mh = H * 0.09 * mob;
      ctx.fillStyle = 'rgba(8,22,36,.88)'; ctx.beginPath(); ctx.moveTo(mx2 - mw, hy + 2); ctx.bezierCurveTo(mx2 - mw, hy - mh * 1.15, mx2 + mw, hy - mh * 1.15, mx2 + mw, hy + 2); ctx.fill();
      var lgr = ctx.createLinearGradient(0, hy - mh, 0, hy); lgr.addColorStop(0, 'rgba(255,240,190,.75)'); lgr.addColorStop(1, 'rgba(120,235,240,.45)');
      ctx.fillStyle = lgr; ctx.beginPath(); ctx.moveTo(mx2 - mw * 0.32, hy - mh * 0.84); ctx.lineTo(mx2 + mw * 0.02, hy - mh * 0.84); ctx.lineTo(mx2 + mw * 0.42, hy + 2); ctx.lineTo(mx2 - mw * 0.12, hy + 2); ctx.fill();
      ctx.fillStyle = 'rgba(90,225,235,.75)'; ctx.beginPath(); ctx.ellipse(mx2 + mw * 0.12, hy, mw * 0.5, Math.max(2, H * 0.007), 0, 0, Math.PI * 2); ctx.fill();
      ctx.restore(); return;
    }
    if (o.kind === 'arches') {
      // Kleftiko: white volcanic rock with arches you can swim through, sea stacks and caves
      var forms = [
        { a: -0.66, b: -0.2, h: 0.2, arch: [-0.5, -0.37, 0.095], cave: -0.27 },
        { a: -0.15, b: -0.03, h: 0.25, cave: -0.09 },
        { a: 0.03, b: 0.42, h: 0.17, arch: [0.14, 0.26, 0.105], cave: 0.35 },
        { a: 0.48, b: 0.58, h: 0.075 }
      ];
      forms.forEach(function (f, fi) {
        var x1 = cx + f.a * w, x2 = cx + f.b * w, hgt = H * f.h * mob, N = 22;
        var topY = function (u) { return hy - hgt * Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, u))), 0.32) * (0.93 + 0.07 * Math.sin(u * 19 + fi) + 0.04 * (R(fi * 50 + Math.round(u * N)) - 0.5)); };
        ctx.beginPath(); ctx.moveTo(x1, hy + 2);
        for (var q = 0; q <= N; q++) { var u = q / N; ctx.lineTo(x1 + (x2 - x1) * u, topY(u)); }
        ctx.lineTo(x2, hy + 2); ctx.closePath();
        var rgk = ctx.createLinearGradient(x1, 0, x2, 0); rgk.addColorStop(0, '#ffffff'); rgk.addColorStop(0.6, '#f1ece2'); rgk.addColorStop(1, '#d6cdbd');
        ctx.fillStyle = rgk; ctx.fill();
        ctx.save(); ctx.clip();
        for (var sI = 0; sI < 5; sI++) { ctx.fillStyle = 'rgba(205,150,95,' + (0.12 + R(fi * 9 + sI) * 0.18) + ')'; ctx.beginPath(); ctx.ellipse(x1 + (x2 - x1) * R(fi * 13 + sI), hy - hgt * (0.25 + R(fi * 17 + sI) * 0.5), (x2 - x1) * 0.12, hgt * 0.08, 0.3, 0, Math.PI * 2); ctx.fill(); }
        ctx.strokeStyle = 'rgba(150,140,125,.35)'; ctx.lineWidth = 1.2;
        for (var cr = 0; cr < 4; cr++) { var crx = x1 + (x2 - x1) * (0.15 + R(fi * 7 + cr) * 0.7); ctx.beginPath(); ctx.moveTo(crx, hy - hgt * 0.85); ctx.lineTo(crx + 4, hy - hgt * 0.45); ctx.lineTo(crx - 2, hy - hgt * 0.15); ctx.stroke(); }
        ctx.restore();
        if (f.arch) {
          var ax1 = cx + f.arch[0] * w, ax2 = cx + f.arch[1] * w, ah = H * f.arch[2] * mob;
          var ag = ctx.createLinearGradient(0, hy - ah, 0, hy); ag.addColorStop(0, rgb(col[1])); ag.addColorStop(0.55, rgb(col[1])); ag.addColorStop(0.56, rgb(col[2])); ag.addColorStop(1, rgb(col[2]));
          ctx.fillStyle = ag; ctx.beginPath(); ctx.moveTo(ax1, hy + 2); ctx.lineTo(ax1, hy - ah * 0.55); ctx.quadraticCurveTo((ax1 + ax2) / 2, hy - ah * 1.35, ax2, hy - ah * 0.55); ctx.lineTo(ax2, hy + 2); ctx.closePath(); ctx.fill();
          ctx.strokeStyle = 'rgba(160,150,135,.5)'; ctx.lineWidth = 1.5; ctx.stroke();
        }
        if (f.cave != null) {
          var cvx = cx + f.cave * w, cvw = w * 0.035, cvh = hgt * 0.32;
          ctx.fillStyle = 'rgba(10,40,60,.75)'; ctx.beginPath(); ctx.moveTo(cvx - cvw, hy + 2); ctx.quadraticCurveTo(cvx, hy - cvh * 1.6, cvx + cvw, hy + 2); ctx.fill();
        }
      });
      ctx.restore(); return;
    }
    if (o.kind === 'arches') {""")

# the pier with the two hosts
JS = rep(JS, "  // ───────── seagulls ─────────", open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'pier.js'), encoding='utf8').read() + "  // ───────── seagulls ─────────")
JS = rep(JS, "      if (k === 2) drawBoat(hy, col);", "      if (k === 1) drawPier(hy);\n      if (k === 2) drawBoat(hy, col);")
# links: keep clean URLs in the HTML for Google; outside the live domain append index.html so local files / previews work
JS = rep(JS, "  // gentle card entrance", """  // clean URLs for Google; locally and in previews add index.html so the links still open
  if (!/(^|\\.)milossailways\\.gr$/.test(location.hostname)) {
    document.querySelectorAll('a[href]').forEach(function (a) {
      var h = a.getAttribute('href');
      if (!/^(https?:|mailto:|tel:|#)/.test(h) && /\\/(#.*)?$/.test(h)) a.setAttribute('href', h.replace(/\\/(#.*)?$/, '/index.html$1'));
    });
  }

  // gentle card entrance""")

# ───────────────────────── extra CSS ─────────────────────────
CSS += """
/* top nav + crumbs + footer links */
.topnav { display: none; gap: 6px; margin-left: auto; margin-right: 12px; }
.topnav a { color: var(--white); text-decoration: none; font-family: var(--display); font-weight: 700; font-size: .92rem; padding: 7px 14px; border-radius: 999px; background: rgba(13,34,54,.35); backdrop-filter: blur(8px); }
.topnav a:hover, .topnav a[aria-current] { background: var(--white); color: var(--ink); }
@media (min-width: 900px) { .topnav { display: flex; } }
.crumbs { margin: 0 0 14px; font-size: .9rem; font-weight: 600; text-shadow: 0 1px 6px rgba(13,34,54,.6); }
.crumbs a { color: var(--white); }
.hero .facts { margin: 0 0 26px; }
.foot nav { display: flex; flex-wrap: wrap; justify-content: center; gap: 6px 18px; margin-bottom: 10px; }
.foot nav a { color: var(--white); font-weight: 700; }

/* polaroids sit beside the card, not on the text */
.ch:not(.right) .pola { right: -212px; }
.ch.right .pola { left: -212px; }
@media (max-width: 1100px) { .ch:not(.right) .pola { right: -150px; } .ch.right .pola { left: -150px; } }
@media (max-width: 860px) { .ch:not(.right) .pola, .ch.right .pola { left: auto; right: 8px; } }

/* the crew */
.crew { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 18px 0 4px; }
.mate { position: relative; margin: 0; background: #fff; padding: 7px 7px 10px; box-shadow: 0 10px 24px rgba(13,34,54,.2); transform: rotate(-2deg); }
.mate:nth-child(2) { transform: rotate(2deg); }
.mate .ph { aspect-ratio: 1; overflow: hidden; background: linear-gradient(160deg, #cfe8f5, #7fb7d6); display: grid; place-items: center; }
.mate .ph svg { width: 44%; height: 44%; color: rgba(255,255,255,.9); grid-area: 1 / 1; }
.mate .ph img { width: 100%; height: 100%; object-fit: cover; grid-area: 1 / 1; }
.mate figcaption { display: grid; gap: 1px; padding-top: 6px; }
.mate b { font-family: "Caveat", "Comic Sans MS", cursive; font-size: 1.45rem; line-height: 1; color: var(--ink); }
.mate .role { font-size: .8rem; font-weight: 700; color: var(--sea); }
.mate .langs { font-size: .76rem; color: var(--muted); }
.mate .quote { font-size: .78rem; color: var(--muted); font-style: italic; margin-top: 3px; }
.mate.demo::after { content: "Example"; position: absolute; top: 12px; left: -6px; background: #ff7a4d; color: #fff; font-family: var(--display); font-weight: 800; font-size: .7rem; padding: 3px 10px 3px 8px; border-radius: 3px 999px 999px 3px; }
.mate.demo .role, .mate.demo .langs, .mate.demo .quote { color: #8fa1b2; }
@media (max-width: 560px) { .mate b { font-size: 1.25rem; } .mate .quote { display: none; } }

/* guest reviews: postcards */
.score-wrap { text-align: center; margin: -10px 0 22px; }
.score { text-decoration: none; }
.reviews { padding-bottom: 90px; }
.reviews { position: relative; padding: 110px max(16px, env(safe-area-inset-right, 0px)) 40px max(16px, env(safe-area-inset-left, 0px)); }
.rev-in { max-width: 1120px; margin: 0 auto; display: grid; gap: 22px; justify-items: center; }
.rev-in > h2 { color: var(--white); font-size: clamp(2.4rem, 6vw, 4.2rem); font-weight: 800; letter-spacing: -.03em; text-align: center; text-shadow: 0 4px 30px rgba(13,34,54,.35); margin: 0; }
.rev-sub { color: var(--white); font-weight: 600; text-align: center; margin: 0; text-shadow: 0 1px 3px rgba(13,34,54,.6), 0 2px 14px rgba(13,34,54,.45); }
.score { display: inline-flex; align-items: center; gap: 10px; background: var(--white); color: var(--ink); padding: 8px 16px; border-radius: 999px; font-weight: 700; box-shadow: 0 10px 30px rgba(13,34,54,.2); }
.score b { font-family: var(--display); font-size: 1.3rem; }
.cards { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(270px, 1fr); gap: 22px; width: 100%; overflow-x: auto; scroll-snap-type: x mandatory; padding: 18px 6px 26px; }
@media (max-width: 700px) { .cards { grid-auto-columns: 82%; } }
@media (min-width: 900px) { .cards { grid-auto-flow: row; grid-template-columns: repeat(auto-fit, minmax(270px, 340px)); justify-content: center; overflow: visible; } }
.postcard { position: relative; margin: 0; scroll-snap-align: center; background: #fffdf7; color: var(--ink); padding: 22px 22px 18px; border-radius: 6px; box-shadow: 0 18px 44px rgba(13,34,54,.28); display: grid; gap: 10px; align-content: start; background-image: repeating-linear-gradient(transparent 0 27px, rgba(11,111,168,.07) 27px 28px); }
.postcard:nth-child(3n+1) { transform: rotate(-1.6deg); }
.postcard:nth-child(3n+2) { transform: rotate(1.2deg) translateY(8px); }
.postcard:nth-child(3n) { transform: rotate(-.6deg); }
.stamp { position: absolute; top: 14px; right: 14px; width: 46px; height: 54px; border: 2px dashed rgba(11,111,168,.45); border-radius: 3px; display: grid; place-items: center; background: #e9f5fb; }
.stamp svg { width: 26px; height: 26px; }
.stars { display: flex; gap: 2px; color: #f2b51c; font-size: 1.25rem; letter-spacing: 1px; }
.stars .off { color: #d9e1e8; }
.postcard blockquote { margin: 0; padding-right: 50px; font-size: 1rem; line-height: 1.55; color: #24384b; }
.postcard figcaption { font-family: "Caveat", "Comic Sans MS", cursive; font-size: 1.5rem; font-weight: 700; color: var(--ink); line-height: 1.1; }
.postcard .meta { font-size: .8rem; color: var(--muted); display: flex; gap: 8px; align-items: center; }
.postcard .meta .src { font-weight: 700; color: var(--sea); }
.postcard.demo blockquote, .postcard.demo figcaption { color: #8396a8; }
.postcard.demo::after { content: "Example"; position: absolute; top: 18px; left: -6px; background: #ff7a4d; color: #fff; font-family: var(--display); font-weight: 800; font-size: .78rem; letter-spacing: .04em; padding: 4px 12px 4px 10px; border-radius: 3px 999px 999px 3px; box-shadow: 0 4px 10px rgba(13,34,54,.2); }
.postcard.demo .stars { margin-top: 18px; }
.postcard.empty { max-width: 520px; text-align: center; justify-items: center; transform: rotate(-1deg); }
.postcard.empty { padding-top: 26px; }
.postcard.empty blockquote { padding: 0 58px; font-size: 1.15rem; }
@media (max-width: 560px) { .postcard.empty blockquote { padding: 52px 0 0; } }
.rev-cta { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; }
.btn-glass { background: rgba(255,255,255,.85); color: var(--ink); box-shadow: 0 8px 24px rgba(13,34,54,.2); }
.rev-note { color: var(--white); font-size: .82rem; opacity: .9; text-align: center; margin: 0; text-shadow: 0 1px 6px rgba(13,34,54,.5); }

/* the fork in the sea */
.fork-in { width: 100%; max-width: 1080px; margin: 0 auto; display: grid; gap: 18px; justify-items: center; }
.fork-head { text-align: center; max-width: 620px; padding: 18px 24px; background: radial-gradient(ellipse 70% 70% at 50% 50%, rgba(13,34,54,.38), rgba(13,34,54,0) 75%); }
.fork-head h2 { font-size: clamp(2.4rem, 6vw, 4.2rem); font-weight: 800; letter-spacing: -.03em; color: var(--white); text-shadow: 0 4px 30px rgba(13,34,54,.35); }
.fork-head p { color: var(--white); font-weight: 600; font-size: 1.1rem; text-shadow: 0 1px 3px rgba(13,34,54,.7), 0 2px 16px rgba(13,34,54,.5); margin: 0; }
.fork-head .when { margin-bottom: 14px; }
.signs { display: grid; grid-template-columns: 1fr; gap: 16px; width: 100%; }
@media (min-width: 760px) { .signs { grid-template-columns: 1fr 1fr; gap: 22px; } }
.sign { position: relative; display: grid; gap: 8px; text-decoration: none; color: var(--ink); background: var(--glass); backdrop-filter: blur(14px) saturate(1.3); -webkit-backdrop-filter: blur(14px) saturate(1.3); border: 1px solid rgba(255,255,255,.6); padding: 22px 24px 22px; border-radius: 26px; box-shadow: 0 20px 60px rgba(13,34,54,.2); transition: transform .25s, box-shadow .25s; }
.sign:hover { transform: translateY(-6px); box-shadow: 0 28px 70px rgba(13,34,54,.28); }
.sign-dir { display: inline-flex; align-items: center; gap: 8px; font-family: var(--display); font-weight: 800; font-size: .85rem; letter-spacing: .02em; color: var(--white); background: var(--sea); padding: 5px 12px; border-radius: 999px; justify-self: start; }
.sign.east .sign-dir { background: #13a3a3; justify-self: end; }
.sign h3 { font-size: clamp(1.8rem, 3.6vw, 2.5rem); font-weight: 800; letter-spacing: -.02em; margin: 4px 0 0; }
.sign p { margin: 0; color: var(--muted); }
.sign .stops-mini { font-size: .9rem; font-weight: 700; color: var(--ink); }
.sign .go { justify-self: start; margin-top: 6px; }
.sign.east .go { justify-self: end; }
.sign.east { text-align: right; }
.sign .go.btn { min-height: 46px; }
@media (max-width: 760px) { .sign.east { text-align: left; } .sign.east .sign-dir, .sign.east .go { justify-self: start; } }
.card .ticks { list-style: none; padding: 0; margin: 14px 0 0; display: grid; gap: 7px; }
.card .ticks li { display: flex; gap: 10px; color: var(--muted); }
.card .ticks li::before { content: ""; flex: none; width: 18px; height: 18px; margin-top: 3px; border-radius: 50%; background: var(--sun) url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24'%3E%3Cpath d='m6 12.5 4 4 8-9' fill='none' stroke='%230d2236' stroke-width='3' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E") center / 12px no-repeat; }
.card .more { display: inline-block; margin-top: 14px; font-weight: 700; color: var(--sea); }
"""

# ───────────────────────── shared pieces ─────────────────────────
CAM = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/></svg>'
def pola(img, alt, note):
    return f'\n    <figure class="pola"><div class="ph">{CAM}<img src="{U}{img}" alt="{H.escape(alt)}" loading="lazy"></div><figcaption>{note}</figcaption></figure>'

def chapter(cid, stop, when, h2, body, right=False, extra=''):
    return f'''
  <section class="ch{' right' if right else ''}" id="{cid}" data-stop="{stop}"><div class="ch-in"><div class="card">
    <span class="when">{when}</span>
    <h2>{h2}</h2>
    {body}{extra}
  </div></div></section>
'''

TRIPS = [('2026/02/1770061476092-1024x1024.jpg', 'Kalypso, the sailing yacht', 'our Kalypso'),
         ('2026/02/1770061475811.jpg', 'Guests on board', 'life on deck'),
         ('2026/01/331.jpg', 'Turquoise water at Polyaigos', 'Polyaigos'),
         ('2026/02/DSC_3043.jpg', 'A day at sea in Milos', 'swim stop'),
         ('2026/02/DSC_3065.jpg', 'A day at sea in Milos', 'see you soon!')]

PERSON = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="8" r="4.2"/><path d="M3.5 21a8.5 8.5 0 0 1 17 0z"/></svg>'
def crew_block():
    if CREW:
        items, demo = CREW, False
    elif DEMO:
        items = [{'name': 'Nikos', 'role': 'Role, e.g. Skipper', 'languages': 'Languages he speaks', 'note': 'A sentence in his own words'},
                 {'name': 'Minas', 'role': 'Role, e.g. Host', 'languages': 'Languages he speaks', 'note': 'A sentence in his own words'}]
        demo = True
    else:
        return ''
    out = ''
    for m in items:
        img = f'<img src="{H.escape(m["photo"])}" alt="{H.escape(m["name"])}, Milos Sail Ways" loading="lazy">' if (m.get('photo') and not demo) else ''
        out += (f'<figure class="mate{" demo" if demo else ""}"><div class="ph">{PERSON}{img}</div><figcaption><b>{H.escape(m["name"])}</b>'
                + (f'<span class="role">{H.escape(m["role"])}</span>' if m.get('role') else '')
                + (f'<span class="langs">{H.escape(m["languages"])}</span>' if m.get('languages') else '')
                + (f'<span class="quote">{H.escape(m["note"])}</span>' if m.get('note') else '') + '</figcaption></figure>')
    return '\n    <div class="crew">' + out + '</div>'

STAMP = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M15 5 7.5 21H15z" fill="#0b6fa8"/><path d="M17 7.5c4.3 3.4 6.3 8 6.3 13.5H17z" fill="#ffc93c"/><path d="M5 23.5h22l-2.6 3H7.6z" fill="#0d2236"/></svg>'
def stars(n):
    return '<div class="stars" aria-label="%d out of 5 stars">%s%s</div>' % (n, '★' * n, '<span class="off">' + '★' * (5 - n) + '</span>' if n < 5 else '')
def reviews_section():
    rate = REV.get('google_review_url') or REV.get('google_maps_url')
    allr = REV.get('google_maps_url') or rate
    items = REV.get('reviews', [])
    if items:
        avg = sum(x.get('stars', 5) for x in items) / len(items)
        cards = ''.join(f"""<figure class="postcard"><span class="stamp">{STAMP}</span>{stars(int(x.get('stars', 5)))}<blockquote>{H.escape(x['text'])}</blockquote><figcaption>{H.escape(x['name'])}{(', ' + H.escape(x['country'])) if x.get('country') else ''}</figcaption><span class="meta"><span class="src">{H.escape(x.get('source', 'Google'))}</span><span>{H.escape(x.get('date', ''))}</span></span></figure>""" for x in items)
        head = f'<h2 id="rev-h">What our guests say</h2><p class="rev-sub">Real reviews, copied word for word from Google.</p>'
        cta = f'<a class="btn btn-sun" href="{rate}" target="_blank" rel="noopener">Rate us on Google</a><a class="btn btn-glass" href="{allr}" target="_blank" rel="noopener">See all reviews on Google</a>'
        note = ''
    elif DEMO:
        cards = ''.join(f"""<figure class="postcard demo"><span class="stamp">{STAMP}</span>{stars(5)}<blockquote>{t}</blockquote><figcaption>Guest name, Country</figcaption><span class="meta"><span class="src">Google</span><span>Month Year</span></span></figure>""" for t in (
            'A real guest review will appear here, copied word for word from Google: what they loved about the day, the crew and the food.',
            'Second review: short or long, the card grows with the text. Only real reviews from real guests go here.',
            'Third review. On phones the cards can be swiped sideways, on a computer they sit side by side.'))
        head = '<h2 id="rev-h">What our guests say</h2><p class="rev-sub">Real reviews, copied word for word from Google.</p>'
        cta = f'<a class="btn btn-sun" href="{rate}" target="_blank" rel="noopener">Rate us on Google</a><a class="btn btn-glass" href="{allr}" target="_blank" rel="noopener">See all reviews on Google</a>'
        note = '<p class="rev-note">Preview with example cards. The live site only shows real guest reviews.</p>'
    else:
        cards = f"""<figure class="postcard empty"><span class="stamp">{STAMP}</span><blockquote>Sailed with us? We'd love to hear about your day. Your review helps other travellers find us.</blockquote><figcaption>Thank you!</figcaption></figure>"""
        head = '<h2 id="rev-h">Sailed with us?</h2>'
        cta = f'<a class="btn btn-sun" href="{rate}" target="_blank" rel="noopener">Rate us on Google</a>'
        note = ''
    return f"""
  <section class="reviews" id="reviews" data-stop="Reviews" aria-labelledby="rev-h">
    <div class="rev-in">
      {head}
      <div class="cards" tabindex="0" aria-label="Guest reviews">{cards}</div>
      <div class="rev-cta">{cta}</div>
      {note}
    </div>
  </section>"""

def score_line():
    items = REV.get('reviews', [])
    if not items: return ''
    avg = sum(x.get('stars', 5) for x in items) / len(items)
    n = REV.get('total_count') or len(items)
    return f'<p class="score-wrap"><a class="score" href="#reviews">★ {avg:.1f}'.replace('.', ',' if False else '.') + f' on Google · {n} reviews</a></p>'

def booking(route, home_href):
    k_sub = 'The day you just scrolled' if route == 'k' else 'Sea caves and white arches'
    p_sub = 'The day you just scrolled' if route == 'p' else 'Calm turquoise bays'
    trips = ''.join(f'<figure><div class="ph"><img src="{U}{p}" alt="{a}" loading="lazy"></div><figcaption>{c}</figcaption></figure>' for p, a, c in TRIPS)
    return f'''
  <section class="book" id="book" data-stop="Book" aria-labelledby="book-h">
    <div class="book-in">
      <h2 id="book-h">Your turn.</h2>
      <p class="sub">Pick a route, a date and your crew. We confirm on WhatsApp.</p>{score_line()}
      <p class="trips-label">Real photos from our trips</p>
      <div class="trips">{trips}</div>
      <form class="form" id="bk" novalidate>
        <div class="routes" role="radiogroup" aria-label="Route">
          <label><input type="radio" name="route" value="Kleftiko & West Milos"{' checked' if route != 'p' else ''}><span>Kleftiko &amp; West Milos<small>{k_sub}</small></span></label>
          <label><input type="radio" name="route" value="Polyaigos & Kimolos"{' checked' if route == 'p' else ''}><span>Polyaigos &amp; Kimolos<small>{p_sub}</small></span></label>
        </div>
        <div class="row">
          <div class="fld"><label for="bk-date">Date</label><input type="date" id="bk-date"></div>
          <div class="fld"><label id="g-l">Guests</label><div class="step" role="group" aria-labelledby="g-l"><button type="button" id="g-" aria-label="One guest less">−</button><output id="g">4</output><button type="button" id="g+" aria-label="One guest more">+</button></div></div>
        </div>
        <div class="fld"><label for="bk-name">Your name</label><input id="bk-name" autocomplete="name"></div>
        <div class="total" aria-live="polite"><div><b id="price">–</b><small id="pnote">Pick a date to see your price</small></div><a class="btn btn-ink" id="send" href="{WA}" target="_blank" rel="noopener">Send on WhatsApp</a></div>
        <p class="err" id="err" hidden></p>
        <p class="fine">Whole boat for up to 8 guests, €50 per extra guest (max. 10), VAT included. Lunch, open bar, snorkel gear and SUP included. Free cancellation up to 24 hours before departure.</p>
      </form>
      <ul class="facts"><li>From €900 per boat</li><li>Up to 10 guests</li><li>Season 1 April – 15 October</li></ul>
    </div>
  </section>'''

def flip(chs):
    # welcome card on the right, pier and boat on the left; the fork stays centred
    chs = chs.replace('<section class="ch right"', '<section class="TMP"').replace('<section class="ch" id=', '<section class="ch right" id=').replace('<section class="TMP"', '<section class="ch"')
    return chs.replace('<section class="ch right" id="fork"', '<section class="ch" id="fork"')

def page(p, fragment=False):
    r = p['root']  # relative path back to the homepage
    nav = f'<nav class="topnav" aria-label="Tours"><a href="{r}kleftiko-tour-milos/"{" aria-current=\"page\"" if p["key"]=="k" else ""}>Kleftiko tour</a><a href="{r}polyaigos-tour/"{" aria-current=\"page\"" if p["key"]=="p" else ""}>Polyaigos tour</a></nav>'
    track = ''.join(f'<li><a href="#{s["id"]}">{s["label"]}</a></li>' for s in p['stops'] if s['id'] != 'book') + '<li><a href="#book">Book</a></li><li><a href="#reviews">Reviews</a></li>'
    cfg = {'stops': [{'id': s['id'], 'kind': s['kind'], 'w': s.get('w', 0.9), 'time': s['time']} for s in p['stops']]}
    if p.get('palette'): cfg['palette'] = p['palette']
    body = f'''<canvas id="sea" aria-hidden="true"></canvas>

<header class="bar">
  <a class="logo" href="{r if r else './'}">MILOS SAIL WAYS</a>
  {nav}
  <div class="clock" aria-live="off" title="Your day on board">
    <svg class="clock-face" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" stroke-width="2"/><line id="hand-h" x1="12" y1="12" x2="12" y2="7.5" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/><line id="hand-m" x1="12" y1="12" x2="12" y2="4.5" stroke="#ffc93c" stroke-width="1.6" stroke-linecap="round"/></svg>
    <span id="time">10:00</span><small id="where">Adamas</small>
  </div>
</header>

<nav aria-label="Stops"><ol class="track" id="track">{track}</ol></nav>

<div class="cta"><a class="btn btn-wa" href="{WA}" target="_blank" rel="noopener">WhatsApp</a><a class="btn btn-sun" href="#book">Book a day</a></div>

<main>
{p['hero']}
{flip(''.join(p['chapters']))}
{booking(p['key'], r)}
{reviews_section()}
</main>
<footer class="foot">
  <nav aria-label="Footer"><a href="{r if r else './'}">Home</a><a href="{r}kleftiko-tour-milos/">Kleftiko sailing tour</a><a href="{r}polyaigos-tour/">Polyaigos sailing tour</a><a href="{WA}" target="_blank" rel="noopener">WhatsApp</a></nav>
  Milos Sail Ways · Mersinia, Milos · <span>+30 693 297 7623</span> · <span>info@milossailways.gr</span>
</footer>

<script>window.VOYAGE = {json.dumps(cfg)};</script>
<script>{JS}</script>'''
    fonts = '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Syne:wght@600;700;800&family=Noto+Sans:wght@400;500;700&family=Caveat:wght@600;700&display=swap">'
    ld = f'<script type="application/ld+json">{json.dumps(p["schema"], ensure_ascii=False)}</script>'
    if fragment:
        return f'<title>Milos Sail Ways Voyage</title>\n<meta name="claude:viewport-fit-sides" content="cover">\n{fonts}\n<style>{CSS}</style>\n{body}\n'
    url = DOMAIN + p['path']
    return f'''<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{H.escape(p['title'])}</title>
<meta name="description" content="{H.escape(p['desc'])}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{url}">
<link rel="alternate" hreflang="en" href="{url}">
<link rel="alternate" hreflang="x-default" href="{url}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Milos Sail Ways">
<meta property="og:title" content="{H.escape(p['title'])}">
<meta property="og:description" content="{H.escape(p['desc'])}">
<meta property="og:url" content="{url}">
<meta property="og:image" content="{U}{p['og']}">
<meta name="twitter:card" content="summary_large_image">
<meta name="theme-color" content="#0d2236">
<link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='7' fill='%230d2236'/%3E%3Cpath d='M15 5 7.5 21H15z' fill='%23fff'/%3E%3Cpath d='M17 7.5c4.3 3.4 6.3 8 6.3 13.5H17z' fill='%23ffc93c'/%3E%3Cpath d='M5 23.5h22l-2.6 3H7.6z' fill='%239ad4f5'/%3E%3C/svg%3E">
{fonts}
<style>{CSS}</style>
{ld}
</head>
<body>
{body}
</body>
</html>
'''

# ───────────────────────── structured data ─────────────────────────
BIZ = {'@type': ['LocalBusiness', 'TravelAgency'], '@id': DOMAIN + '/#business', 'name': 'Milos Sail Ways', 'url': DOMAIN + '/',
       'telephone': '+306932977623', 'email': 'info@milossailways.gr', 'priceRange': '€900–€1,400', 'image': U + '2026/01/1762365155181-scaled.jpg',
       'address': {'@type': 'PostalAddress', 'streetAddress': 'Mersinia', 'addressLocality': 'Milos', 'addressRegion': 'Cyclades', 'postalCode': '848 00', 'addressCountry': 'GR'},
       'sameAs': ['https://www.instagram.com/milos_sailways/', 'https://www.facebook.com/profile.php?id=61583559621736']}
def trip(path, name, desc, stops, img):
    return {'@type': ['TouristTrip', 'BoatTrip'], '@id': DOMAIN + path + '#trip', 'name': name, 'description': desc, 'url': DOMAIN + path, 'image': U + img,
            'departureBoatTerminal': {'@type': 'BoatTerminal', 'name': 'Adamas Port, Milos'}, 'departureTime': '10:00', 'provider': {'@id': DOMAIN + '/#business'},
            'itinerary': {'@type': 'ItemList', 'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'item': {'@type': 'TouristAttraction', 'name': s}} for i, s in enumerate(stops)]},
            'offers': {'@type': 'AggregateOffer', 'priceCurrency': 'EUR', 'lowPrice': 900, 'highPrice': 1400, 'availability': 'https://schema.org/InStock', 'url': DOMAIN + path + '#book'}}
def crumbs(items):
    return {'@type': 'BreadcrumbList', 'itemListElement': [{'@type': 'ListItem', 'position': i + 1, 'name': n, 'item': DOMAIN + u} for i, (n, u) in enumerate(items)]}

# ───────────────────────── page: home ─────────────────────────
home = dict(key='h', path='/', root='', og='2026/01/1762365155181-scaled.jpg',
    title='Milos Boat Tours | Private Sailing to Kleftiko & Polyaigos',
    desc='Private sailing cruises in Milos to Kleftiko and Polyaigos for up to 10 guests. Lunch, open bar, snorkel and SUP included. From €900 per boat.',
    stops=[dict(id='adamas', label='Adamas', kind='port', time=600),
           dict(id='klima', label='Klima', kind='klima', time=630, w=0.8),
           dict(id='fork', label='Choose your course', kind='lighthouse', time=660, w=1),
           dict(id='onboard', label='On board', kind='hill', time=720),
           dict(id='book', label='Book', kind='none', time=1050)],
    hero='''  <section class="hero" id="start">
    <h1>Sail<span>Milos</span></h1>
    <p>Private sailing days on Kalypso. Cast off with us, then choose your course: Kleftiko in the west or Polyaigos in the east.</p>
    <a class="scroll-hint" href="#adamas">Cast off<svg viewBox="0 0 26 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><rect x="2" y="2" width="22" height="36" rx="11"/><line x1="13" y1="10" x2="13" y2="17"/></svg></a>
    <a class="skip" href="#book">Skip the voyage, go straight to booking</a>
  </section>''',
    chapters=[
      chapter('adamas', 'Adamas', '10:00 · Adamas', 'Welcome aboard',
              '<p>We\'re Nikos and Minas, the people behind Milos Sail Ways. Step aboard Kalypso, our 14 m sailing yacht, at the main port. Coffee and breakfast on deck while we cross the bay. Only your group on board, up to 10 guests.</p>' + crew_block() + '\n    <span class="hint">Tip: tap the sea and see who comes to say hello.</span>'),
      chapter('klima', 'Klima', 'Morning · Klima', 'Colourful boathouses', "<p>On every route we pass Klima on the way out of the bay: fishermen's houses with painted doors right at the waterline. Have your camera ready.</p>", right=True),
      '''
  <section class="ch" id="fork" data-stop="Which way?"><div class="fork-in">
    <div class="fork-head"><span class="when">11:00 · Leaving the bay</span><h2>Which way?</h2><p>Past Klima, at the mouth of the bay, the course splits. Both days include lunch, the open bar, snorkel gear and the SUP.</p></div>
    <div class="signs">
      <a class="sign west" href="kleftiko-tour-milos/">
        <span class="sign-dir">← West</span>
        <h3>Kleftiko &amp; West Milos</h3>
        <p>Sea caves and white rock arches, reachable only by boat. The classic Milos day.</p>
        <span class="stops-mini">Adamas · Klima · Sykia · Kleftiko · Kalogries</span>
        <span class="go btn btn-sun">Sail west</span>
      </a>
      <a class="sign east" href="polyaigos-tour/">
        <span class="sign-dir">East →</span>
        <h3>Polyaigos &amp; Kimolos</h3>
        <p>Turquoise bays at the largest uninhabited island in the Aegean. A calm day for swimming.</p>
        <span class="stops-mini">Adamas · Klima · Kimolos · Polyaigos · Manolonisi</span>
        <span class="go btn btn-sun">Sail east</span>
      </a>
    </div>
  </div></section>
''',
      chapter('onboard', 'On board', 'All day · On board', 'All in.',
              '''<p>One price for the whole boat. No extras on board.</p>
    <ul class="ticks"><li>Breakfast and a full Greek lunch</li><li>Wine, beer, soft drinks, coffee and juices</li><li>Snorkel gear, SUP board and a GoPro</li><li>Shade, showers, four toilets, Wi-Fi</li><li>Free cancellation up to 24 hours before</li></ul>''', right=True,
              extra=pola('2026/02/1770061475811.jpg', 'Guests relaxing on deck', 'lunch is served')),
    ],
    schema={'@context': 'https://schema.org', '@graph': [
        {'@type': 'WebSite', '@id': DOMAIN + '/#website', 'url': DOMAIN + '/', 'name': 'Milos Sail Ways', 'inLanguage': 'en', 'publisher': {'@id': DOMAIN + '/#business'}},
        BIZ,
        {'@type': 'ItemList', 'name': 'Sailing tours in Milos', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'url': DOMAIN + '/kleftiko-tour-milos/', 'name': 'Kleftiko sailing tour'},
            {'@type': 'ListItem', 'position': 2, 'url': DOMAIN + '/polyaigos-tour/', 'name': 'Polyaigos sailing tour'}]}]})

# ───────────────────────── page: Kleftiko ─────────────────────────
K_STOPS = ['Adamas', 'Klima & Arkoudes', 'Sykia', 'Kleftiko', 'Kalogries', 'Cape Vani']
kleftiko = dict(key='k', path='/kleftiko-tour-milos/', root='../', og='2026/01/kleftiko-2.jpg',
    title='Kleftiko Boat Tour Milos | Private Sailing Day with Lunch',
    desc='Private sailing tour from Adamas to Kleftiko, Sykia and Kalogries. 10:00–17:30 with lunch, open bar, snorkel and SUP. Up to 10 guests, from €900.',
    stops=[dict(id='adamas', label='Adamas', kind='port', time=600),
           dict(id='klima', label='Klima', kind='klima', time=660, w=0.8),
           dict(id='sykia', label='Sykia', kind='cliff', time=720),
           dict(id='kleftiko', label='Kleftiko', kind='arches', time=780, w=1.1),
           dict(id='kalogries', label='Kalogries', kind='hill', time=930),
           dict(id='home', label='Back in port', kind='port', time=1050)],
    hero='''  <section class="hero" id="start">
    <p class="crumbs"><a href="../">Milos Sail Ways</a> › Kleftiko tour</p>
    <h1>Kleftiko<span>sailing tour</span></h1>
    <p>A full private day along the wild west coast of Milos: Klima, Sykia and the white rock arches of Kleftiko. Scroll to sail it.</p>
    <ul class="facts"><li>10:00 – 17:30</li><li>Up to 10 guests</li><li>From €900 per boat</li></ul>
    <a class="scroll-hint" href="#adamas">Cast off<svg viewBox="0 0 26 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><rect x="2" y="2" width="22" height="36" rx="11"/><line x1="13" y1="10" x2="13" y2="17"/></svg></a>
    <a class="skip" href="#book">Skip the voyage, go straight to booking</a>
  </section>''',
    chapters=[
      chapter('adamas', 'Adamas', '10:00 · Adamas', 'Welcome aboard',
              '<p>We\'re Nikos and Minas, the people behind Milos Sail Ways. Step aboard Kalypso at the main port. Coffee and breakfast on deck while we cross the bay.</p>' + crew_block() + '\n    <span class="hint">Tip: tap the sea and see who comes to say hello.</span>'),
      chapter('klima', 'Klima', 'Morning · Klima', 'Colourful boathouses', "<p>The fishermen's houses of Klima and Arkoudes, painted doors right at the waterline. Have your camera ready.</p>", right=True),
      chapter('sykia', 'Sykia', 'Late morning · Sykia', 'The wild side', '<p>A rarely visited corner of the west coast. Deep turquoise water, steep volcanic rock, and silence.</p>'),
      chapter('kleftiko', 'Kleftiko', 'Midday · Kleftiko', 'Jump in.', '<p>White rock arches and sea caves, reachable only by boat. Swim, snorkel, paddle the SUP, film it with our GoPro. Then a full Greek lunch on board, with wine and beer from the open bar.</p>', right=True,
              extra=pola('2026/01/kleftiko-2.jpg', 'The white rocks of Kleftiko', 'Kleftiko. Wow.')),
      chapter('kalogries', 'Kalogries', 'Afternoon · Kalogries', 'One more swim', '<p>A last stop in clear water on the way back. Or a nap in the shade. Your call.</p>',
              extra=pola('2026/07/GOPR1786_1785240440666.jpg', 'A photo from the GoPro on board', 'straight from the GoPro')),
      chapter('home', 'Adamas', '17:30 · Cape Vani → Adamas', 'Golden hour', '<p>We round Cape Vani and sail home in the warm afternoon light. Windy day? Then we start from Agia Kyriaki in the south: a swim at Gerakas, past Tsigrado, and you still get Kleftiko.</p>\n    <a class="more" href="../polyaigos-tour/">Prefer calm turquoise bays? See the Polyaigos tour</a>', right=True),
    ],
    schema={'@context': 'https://schema.org', '@graph': [
        trip('/kleftiko-tour-milos/', 'Kleftiko sailing tour', 'Private full-day sailing tour from Adamas to Klima, Sykia, Kleftiko and Kalogries with lunch and open bar.', K_STOPS, '2026/01/kleftiko-2.jpg'),
        BIZ, crumbs([('Home', '/'), ('Kleftiko tour', '/kleftiko-tour-milos/')])]})

# ───────────────────────── page: Polyaigos ─────────────────────────
P_STOPS = ['Adamas', 'Klima', 'Kimolos', 'Polyaigos', 'Manolonisi']
TURQ = [[0.00, ['#7cc4f2', '#e6f6ff', '#5fd0dc', '#0f86b0']],
        [0.35, ['#2f8fe0', '#c6ecff', '#3fd2d6', '#0a76a5']],
        [0.60, ['#3b82d6', '#d9f0ff', '#33c4cf', '#0a6d9c']],
        [0.80, ['#4a6fc4', '#ffe0a3', '#46a9c0', '#0c5583']],
        [0.93, ['#34337a', '#ff9a5e', '#6a7fa8', '#1d3460']],
        [1.00, ['#2a2a66', '#ff7a4d', '#5d6a96', '#1a2a52']]]
polyaigos = dict(key='p', path='/polyaigos-tour/', root='../', og='2026/01/331.jpg', palette=TURQ,
    title='Polyaigos Boat Tour from Milos | Private Sailing Day',
    desc='Private sailing cruise to Polyaigos, the largest uninhabited island in the Aegean, with stops at Kimolos and Manolonisi. Lunch and open bar, up to 10 guests.',
    stops=[dict(id='adamas', label='Adamas', kind='port', time=600),
           dict(id='klima', label='Klima', kind='klima', time=650, w=0.8),
           dict(id='kimolos', label='Kimolos', kind='kimolos', time=720),
           dict(id='polyaigos', label='Polyaigos', kind='polyaigos', time=780, w=1.1),
           dict(id='manolonisi', label='Manolonisi', kind='islet', time=930),
           dict(id='home', label='Back in port', kind='port', time=1080)],
    hero='''  <section class="hero" id="start">
    <p class="crumbs"><a href="../">Milos Sail Ways</a> › Polyaigos tour</p>
    <h1>Polyaigos<span>sailing tour</span></h1>
    <p>Turquoise bays at the largest uninhabited island in the Aegean, with Kimolos and Manolonisi on the way. Scroll to sail it.</p>
    <ul class="facts"><li>10:00 – 17:30/18:30</li><li>Up to 10 guests</li><li>From €900 per boat</li></ul>
    <a class="scroll-hint" href="#adamas">Cast off<svg viewBox="0 0 26 40" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><rect x="2" y="2" width="22" height="36" rx="11"/><line x1="13" y1="10" x2="13" y2="17"/></svg></a>
    <a class="skip" href="#book">Skip the voyage, go straight to booking</a>
  </section>''',
    chapters=[
      chapter('adamas', 'Adamas', '10:00 · Adamas', 'Welcome aboard',
              '<p>We\'re Nikos and Minas, the people behind Milos Sail Ways. Step aboard Kalypso at the main port and cross the bay. On windy days we start from Agia Kyriaki on the south coast instead, and let you know in advance.</p>' + crew_block() + '\n    <span class="hint">Tip: tap the sea and see who comes to say hello.</span>'),
      chapter('klima', 'Klima', 'Morning · Klima', 'Colourful boathouses', "<p>On the way out of the bay we pass Klima and its fishermen's houses with painted doors. Then we turn east.</p>", right=True),
      chapter('kimolos', 'Kimolos', 'Late morning · Kimolos', 'Island hopping', '<p>We sail along the coast of Kimolos, with its white village on the hill. When the sea allows, we stop for photos or a first swim.</p>'),
      chapter('polyaigos', 'Polyaigos', 'Midday · Polyaigos', 'That water.', '<p>Polyaigos is the largest uninhabited island in the Aegean. Exotic turquoise bays, white rock, no crowds. A long swim stop, then lunch on board with the open bar.</p>', right=True,
              extra=pola('2026/01/331.jpg', 'Turquoise water at Polyaigos', 'that colour!!')),
      chapter('manolonisi', 'Manolonisi', 'Afternoon · Manolonisi', 'Slow afternoon', '<p>Another peaceful stop for swimming, snorkelling or the SUP. Or just stay in the shade.</p>',
              extra=pola('2026/01/poliaigos-2-e1769434502345.jpg', 'Clear water near Polyaigos', 'pure blue')),
      chapter('home', 'Adamas', '17:30–18:30 · Back to port', 'Golden hour', '<p>We sail back to Milos in the evening light. Return time depends on wind and route. The captain always agrees any change with you first.</p>\n    <a class="more" href="../kleftiko-tour-milos/">Want caves and arches instead? See the Kleftiko tour</a>', right=True),
    ],
    schema={'@context': 'https://schema.org', '@graph': [
        trip('/polyaigos-tour/', 'Polyaigos sailing tour', 'Private full-day sailing cruise from Adamas past Klima to Kimolos, Polyaigos and Manolonisi with lunch and open bar.', P_STOPS, '2026/01/331.jpg'),
        BIZ, crumbs([('Home', '/'), ('Polyaigos tour', '/polyaigos-tour/')])]})

# ───────────────────────── write ─────────────────────────
for p in (home, kleftiko, polyaigos):
    d = os.path.join(OUT, p['path'].strip('/'))
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf8').write(page(p))
open(os.path.join(OUT, 'sitemap.xml'), 'w').write('<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n' +
    ''.join(f'  <url><loc>{DOMAIN}{p["path"]}</loc><priority>{"1.0" if p["key"]=="h" else "0.9"}</priority></url>\n' for p in (home, kleftiko, polyaigos)) + '</urlset>\n')
open(os.path.join(OUT, 'robots.txt'), 'w').write(f'User-agent: *\nAllow: /\n\nSitemap: {DOMAIN}/sitemap.xml\n')
if ART:
    open(ART, 'w', encoding='utf8').write(page(home, fragment=True))
print('built', OUT)
