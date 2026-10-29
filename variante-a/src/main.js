/* Milos Sail Ways – small, dependency-free site script */
(function () {
  'use strict';

  /* Hide broken images, keep the coloured placeholder behind them */
  document.querySelectorAll('img').forEach(function (img) {
    var miss = function () {
      if (img.classList.contains('img-missing')) return;
      img.classList.add('img-missing');
      img.removeAttribute('srcset');
      img.src = 'data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22/%3E';
    };
    if (img.complete && img.naturalWidth === 0) miss();
    img.addEventListener('error', miss);
  });

  /* Mobile menu */
  var btn = document.querySelector('.menu-btn');
  var menu = document.getElementById('mobile-menu');
  if (btn && menu) {
    btn.addEventListener('click', function () {
      var open = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!open));
      menu.hidden = open;
      btn.querySelector('.sr').textContent = open ? btn.dataset.open : btn.dataset.close;
      document.body.style.overflow = open ? '' : 'hidden';
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !menu.hidden) { btn.click(); btn.focus(); }
    });
  }

  /* Booking request form → WhatsApp or e-mail with a prefilled message */
  var form = document.getElementById('booking');
  if (form) {
    var cfg = JSON.parse(form.dataset.cfg);
    var date = form.querySelector('#bk-date');
    var guests = form.querySelector('#bk-guests');
    var out = form.querySelector('#bk-out');
    var err = form.querySelector('#bk-error');
    var money = new Intl.NumberFormat(cfg.locale, { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });

    // Allowed date range: today (or season start) → season end, this or next season
    var now = new Date();
    var y = now.getFullYear();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    var iso = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
    var seasonEnd = new Date(y, cfg.season.end[0] - 1, cfg.season.end[1]);
    if (now > seasonEnd) y += 1;
    var minD = new Date(Math.max(now.getTime(), new Date(y, cfg.season.start[0] - 1, cfg.season.start[1]).getTime()));
    date.min = iso(minD);
    date.max = (y + 1) + '-' + pad(cfg.season.end[0]) + '-' + pad(cfg.season.end[1]);

    // Preselect route from ?route=
    var qs = new URLSearchParams(location.search).get('route');
    if (qs) {
      var r = form.querySelector('input[name="route"][value="' + qs + '"]');
      if (r) r.checked = true;
    }

    function priceFor(dStr, n) {
      if (!dStr) return null;
      var p = dStr.split('-').map(Number);
      var m = p[1], day = p[2];
      var row = cfg.pricing.months.find(function (r) {
        return r.months.indexOf(m) > -1 && (!r.untilDay || day <= r.untilDay);
      });
      if (!row) return -1;
      return row.price + Math.max(0, n - cfg.pricing.baseGuests) * cfg.pricing.extraGuest;
    }

    function update() {
      var p = priceFor(date.value, Number(guests.value));
      if (p === null) out.textContent = cfg.txt.pick;
      else if (p === -1) out.textContent = cfg.txt.out;
      else out.innerHTML = '<strong>' + money.format(p) + '</strong><small>' + cfg.txt.note + '</small>';
      return p;
    }
    date.addEventListener('change', update);
    date.addEventListener('input', update);
    guests.addEventListener('change', update);
    update();

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var via = (e.submitter && e.submitter.value) || 'wa';
      var name = form.querySelector('#bk-name');
      var contact = form.querySelector('#bk-contact');
      var msg = form.querySelector('#bk-msg');
      var bad = [date, name, contact].filter(function (el) { return !el.value.trim(); });
      [date, name, contact].forEach(function (el) { el.setAttribute('aria-invalid', String(bad.indexOf(el) > -1)); });
      var price = priceFor(date.value, Number(guests.value));
      if (bad.length) { err.textContent = cfg.txt.required; err.hidden = false; bad[0].focus(); return; }
      if (price === -1) { err.textContent = cfg.txt.out; err.hidden = false; date.focus(); return; }
      err.hidden = true;

      var route = form.querySelector('input[name="route"]:checked');
      var lines = [
        cfg.msg.intro, '',
        cfg.msg.route + ': ' + (route ? route.dataset.label : ''),
        cfg.msg.date + ': ' + date.value,
        cfg.msg.guests + ': ' + guests.value,
        cfg.msg.name + ': ' + name.value.trim(),
        cfg.msg.contact + ': ' + contact.value.trim(),
      ];
      if (price > 0) lines.push(cfg.msg.estimate + ': ' + money.format(price));
      if (msg.value.trim()) lines.push('', msg.value.trim());
      var text = lines.join('\n');

      if (via === 'mail') {
        location.href = 'mailto:' + cfg.email + '?subject=' + encodeURIComponent(cfg.msg.subject + ' – ' + date.value) + '&body=' + encodeURIComponent(text);
      } else {
        window.open('https://wa.me/' + cfg.phone + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      }
    });
  }

  /* Gallery lightbox */
  var gal = document.querySelector('[data-lightbox]');
  if (gal) {
    var labels = JSON.parse(gal.dataset.labels);
    var links = Array.prototype.slice.call(gal.querySelectorAll('a'));
    var box, img, count, idx = 0, lastFocus;
    function show(i) {
      idx = (i + links.length) % links.length;
      img.src = links[idx].dataset.full;
      img.alt = links[idx].querySelector('img').alt;
      count.textContent = (idx + 1) + ' ' + labels.of + ' ' + links.length;
    }
    function close() { box.remove(); box = null; document.body.style.overflow = ''; if (lastFocus) lastFocus.focus(); }
    function open(i) {
      lastFocus = document.activeElement;
      box = document.createElement('div');
      box.className = 'lightbox';
      box.setAttribute('role', 'dialog');
      box.setAttribute('aria-modal', 'true');
      box.innerHTML = '<img alt=""><button class="lb-close" type="button" aria-label="' + labels.close + '">✕</button>' +
        '<button class="lb-prev" type="button" aria-label="' + labels.prev + '">‹</button>' +
        '<button class="lb-next" type="button" aria-label="' + labels.next + '">›</button><span class="lb-count"></span>';
      document.body.appendChild(box);
      document.body.style.overflow = 'hidden';
      img = box.querySelector('img'); count = box.querySelector('.lb-count');
      box.querySelector('.lb-close').onclick = close;
      box.querySelector('.lb-prev').onclick = function () { show(idx - 1); };
      box.querySelector('.lb-next').onclick = function () { show(idx + 1); };
      box.addEventListener('click', function (e) { if (e.target === box) close(); });
      var sx = 0;
      box.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
      box.addEventListener('touchend', function (e) { var dx = e.changedTouches[0].clientX - sx; if (Math.abs(dx) > 50) show(idx + (dx < 0 ? 1 : -1)); });
      show(i);
      box.querySelector('.lb-close').focus();
    }
    links.forEach(function (a, i) { a.addEventListener('click', function (e) { e.preventDefault(); open(i); }); });
    document.addEventListener('keydown', function (e) {
      if (!box) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowRight') show(idx + 1);
      if (e.key === 'ArrowLeft') show(idx - 1);
    });
  }
})();
