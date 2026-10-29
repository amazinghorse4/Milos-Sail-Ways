  // ───────── the pier in Adamas: two hosts waving the guests aboard ─────────
  function person(x, y, s, look, phase) {
    ctx.save(); ctx.translate(x, y); ctx.scale(s, s);
    ctx.fillStyle = '#2a3b4c'; ctx.fillRect(-5, -17, 4, 17); ctx.fillRect(1, -17, 4, 17);
    ctx.fillStyle = look.shirt; ctx.beginPath(); ctx.moveTo(-7.5, -17); ctx.lineTo(-7, -33); ctx.quadraticCurveTo(0, -36, 7, -33); ctx.lineTo(7.5, -17); ctx.fill();
    if (look.stripes) { ctx.fillStyle = look.stripes; for (var st = 0; st < 4; st++) ctx.fillRect(-7.2, -31 + st * 4, 14.4, 1.4); }
    ctx.strokeStyle = look.skin; ctx.lineWidth = 3; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(-6.5, -31); ctx.lineTo(-9, -20); ctx.stroke();
    var a = -2.35 + Math.sin(T * 6 + phase) * 0.45;
    ctx.beginPath(); ctx.moveTo(6.5, -31); ctx.lineTo(6.5 - Math.cos(a) * 11, -31 + Math.sin(a) * 11); ctx.stroke();
    ctx.fillStyle = look.skin; ctx.beginPath(); ctx.arc(0, -40.5, 5.6, 0, Math.PI * 2); ctx.fill();
    if (look.cap) { ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.ellipse(0, -45, 6.2, 3, 0, Math.PI, 0); ctx.fill(); ctx.fillRect(-6.2, -45, 12.4, 2.2); ctx.fillStyle = '#0d2236'; ctx.fillRect(-6.8, -43.2, 13.6, 1.8); ctx.fillStyle = '#ffc93c'; ctx.fillRect(-1.2, -47, 2.4, 2); }
    else { ctx.fillStyle = look.hair; ctx.beginPath(); ctx.arc(0, -42.3, 5.8, Math.PI * 1.05, Math.PI * 1.95); ctx.fill(); }
    ctx.restore();
  }
  function drawPier(hy) {
    if (!coast.length) return;
    var unit = Math.min(W, 1100), s = unit / 1100 * (W < 700 ? 1.35 : 1);
    var bx = W * (W < 700 ? 0.3 : 0.32);
    var end = bx - 190 * s + (coast[0].at - P) * unit * SPEED * 0.55;
    if (end < -40) return;
    var deck = hy + (H - hy) * 0.27, len = 900 * s, x0 = end - len, th = 7 * s;
    ctx.fillStyle = 'rgba(70,45,25,.85)';
    for (var px = end - 6 * s; px > x0; px -= 46 * s) ctx.fillRect(px - 2.5 * s, deck, 5 * s, 34 * s);
    var wg = ctx.createLinearGradient(0, deck - th, 0, deck); wg.addColorStop(0, '#c99a5b'); wg.addColorStop(1, '#8a5a35');
    ctx.fillStyle = wg; ctx.fillRect(x0, deck - th, len, th);
    ctx.fillStyle = 'rgba(0,0,0,.18)'; for (var pl = end; pl > x0; pl -= 14 * s) ctx.fillRect(pl, deck - th, 1, th);
    ctx.fillStyle = '#3d4b57'; ctx.fillRect(end - 12 * s, deck - th - 7 * s, 7 * s, 7 * s);
    var fy = deck - th;
    person(end - 34 * s, fy, s * 1.05, { shirt: '#0d2236', skin: '#d39b74', cap: true }, 0);
    person(end - 62 * s, fy, s, { shirt: '#ffffff', stripes: '#1f5fbf', skin: '#c98d66', hair: '#2b211c' }, 1.3);
    if (P > coast[0].at - 0.03 && P < coast[0].at + 0.05) {
      var bxx = end - 48 * s, byy = fy - 76 * s, txt = 'Kaliméra!';
      ctx.font = '700 ' + Math.round(20 * s) + 'px Caveat, "Comic Sans MS", cursive';
      var tw = ctx.measureText(txt).width + 24 * s, tb = 30 * s, rr = 10 * s;
      ctx.fillStyle = 'rgba(255,255,255,.96)';
      ctx.beginPath();
      ctx.moveTo(bxx - tw / 2 + rr, byy); ctx.lineTo(bxx + tw / 2 - rr, byy); ctx.quadraticCurveTo(bxx + tw / 2, byy, bxx + tw / 2, byy + rr);
      ctx.lineTo(bxx + tw / 2, byy + tb - rr); ctx.quadraticCurveTo(bxx + tw / 2, byy + tb, bxx + tw / 2 - rr, byy + tb);
      ctx.lineTo(bxx + 7 * s, byy + tb); ctx.lineTo(bxx, byy + tb + 9 * s); ctx.lineTo(bxx - 4 * s, byy + tb);
      ctx.lineTo(bxx - tw / 2 + rr, byy + tb); ctx.quadraticCurveTo(bxx - tw / 2, byy + tb, bxx - tw / 2, byy + tb - rr);
      ctx.lineTo(bxx - tw / 2, byy + rr); ctx.quadraticCurveTo(bxx - tw / 2, byy, bxx - tw / 2 + rr, byy); ctx.fill();
      ctx.fillStyle = '#0d2236'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(txt, bxx, byy + tb / 2 + 1);
      ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
    }
  }

