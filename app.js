/* ============================================================
   Timer landing page — vanilla JS (no framework)
   Theme · i18n (VI/EN) · drawer · scroll reveal ·
   live Dynamic Island + timers · stat animations
   ============================================================ */
(function () {
  "use strict";
  var root = document.documentElement;

  /* ---------- tiny icon set (SVG strings) ---------- */
  function ico(name, size, color) {
    color = color || "#fff";
    var s = size || 14;
    var head = '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" ';
    switch (name) {
      case "timer": return head + 'fill="none" stroke="' + color + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="13" r="8"/><path d="M12 9v4l2.5 2.5"/><path d="M9 2h6"/></svg>';
      case "pin": return head + 'fill="none" stroke="' + color + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 21s-7-6-7-12a7 7 0 0 1 14 0c0 6-7 12-7 12z"/><circle cx="12" cy="9" r="2.5"/></svg>';
      case "pause": return head + 'fill="' + color + '"><rect x="6" y="5" width="4" height="14" rx="1"/><rect x="14" y="5" width="4" height="14" rx="1"/></svg>';
      case "sun": return head + 'fill="none" stroke="' + color + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4L7 17M17 7l1.4-1.4"/></svg>';
      case "moon": return head + 'fill="none" stroke="' + color + '" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M20 14A8 8 0 0 1 10 4a8 8 0 1 0 10 10z"/></svg>';
    }
    return "";
  }

  /* ============================================================
     I18N  (VI default in markup; data-en holds English)
     ============================================================ */
  var viCache = new Map();
  var labelCache = new Map();
  var lang = root.getAttribute("lang") === "en" ? "en" : "vi";

  function T(vi, en) { return lang === "en" ? en : vi; }

  function applyLang(next) {
    lang = next === "en" ? "en" : "vi";
    root.setAttribute("lang", lang);
    try { localStorage.setItem("timer:lang", lang); } catch (e) {}

    document.querySelectorAll("[data-en]").forEach(function (el) {
      if (!viCache.has(el)) viCache.set(el, el.innerHTML);
      el.innerHTML = lang === "en" ? el.getAttribute("data-en") : viCache.get(el);
    });
    document.querySelectorAll("[data-en-label]").forEach(function (el) {
      if (!labelCache.has(el)) labelCache.set(el, el.getAttribute("aria-label") || "");
      el.setAttribute("aria-label", lang === "en" ? el.getAttribute("data-en-label") : labelCache.get(el));
    });
    document.querySelectorAll(".nav__tg-btn--lang").forEach(function (b) {
      b.classList.toggle("nav__tg-btn--active", b.getAttribute("data-lang") === lang);
    });
    // re-render JS-built Dynamic Islands (their text is language-aware)
    renderHeroDI(heroState);
    renderDemoDI(demoState);
  }

  document.querySelectorAll(".nav__tg-btn--lang").forEach(function (b) {
    b.addEventListener("click", function () { applyLang(b.getAttribute("data-lang")); });
  });

  /* ============================================================
     THEME  (light / dark)
     ============================================================ */
  function currentTheme() { return root.getAttribute("data-theme") === "dark" ? "dark" : "light"; }
  var themeBtn = document.getElementById("themeToggle");

  function paintThemeBtn() {
    var dark = currentTheme() === "dark";
    themeBtn.innerHTML = dark ? ico("sun", 15, "currentColor") : ico("moon", 15, "currentColor");
    themeBtn.setAttribute("aria-label", dark ? "Chuyển chế độ sáng" : "Chuyển chế độ tối");
    themeBtn.setAttribute("title", dark ? "Light mode" : "Dark mode");
  }
  function applyTheme(t) {
    root.setAttribute("data-theme", t);
    try { localStorage.setItem("timer:theme", t); } catch (e) {}
    paintThemeBtn();
  }
  themeBtn.addEventListener("click", function () {
    applyTheme(currentTheme() === "dark" ? "light" : "dark");
  });
  // follow system if user never chose
  var mq = window.matchMedia("(prefers-color-scheme: dark)");
  if (mq.addEventListener) {
    mq.addEventListener("change", function (e) {
      try { if (localStorage.getItem("timer:theme")) return; } catch (err) {}
      root.setAttribute("data-theme", e.matches ? "dark" : "light");
      paintThemeBtn();
    });
  }
  paintThemeBtn();

  /* ============================================================
     NAV scroll state + mobile drawer
     ============================================================ */
  var nav = document.getElementById("nav");
  function onScroll() { nav.classList.toggle("nav--scrolled", window.scrollY > 16); }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  var drawer = document.getElementById("drawer");
  function setDrawer(open) {
    drawer.classList.toggle("drawer--open", open);
    drawer.setAttribute("aria-hidden", open ? "false" : "true");
  }
  document.getElementById("burger").addEventListener("click", function () { setDrawer(true); });
  document.getElementById("drawerClose").addEventListener("click", function () { setDrawer(false); });
  drawer.querySelectorAll(".drawer__link, .drawer__cta a").forEach(function (a) {
    a.addEventListener("click", function () { setDrawer(false); });
  });

  /* ============================================================
     DYNAMIC ISLAND renderers + timers
     ============================================================ */
  var heroDI = document.getElementById("heroDI");
  var demoDI = document.getElementById("demoDI");
  var demoLabel = document.getElementById("demoStateLabel");
  var heroState = "expanded";
  var demoState = "expanded";

  function pad(n) { return String(n).padStart(2, "0"); }

  // hero countdown — 25:00 loop
  function heroTime() {
    var secs = 1500 - (Math.floor(Date.now() / 1000) % 1500);
    return { mm: pad(Math.floor(secs / 60)), ss: pad(secs % 60), p: (1 - secs / 1500) * 100 };
  }
  // demo countdown — 15:00 loop
  function demoTime() {
    var secs = 900 - (Math.floor(Date.now() / 1000) % 900);
    return { mm: pad(Math.floor(secs / 60)), ss: pad(secs % 60), p: (1 - secs / 900) * 100 };
  }

  function renderHeroDI(state) {
    heroState = state;
    heroDI.className = "di di--" + state;
    var t = heroTime();
    var html = "";
    if (state === "minimal") {
      html =
        '<div class="di__pill di__pill--left"><span class="di__icon-dot" style="background:#D55E3A">' + ico("timer", 12) + '</span></div>' +
        '<div class="di__pill di__pill--right"><span class="di__time tnum">' + t.mm + ':' + t.ss + '</span></div>';
    } else if (state === "compact") {
      html =
        '<div class="di__compact">' +
          '<span class="di__icon-dot" style="background:#D55E3A">' + ico("timer", 12) + '</span>' +
          '<span class="di__time tnum">' + t.mm + ':' + t.ss + '</span>' +
          '<span class="di__bar"><span class="di__bar-fill" style="width:' + t.p + '%"></span></span>' +
          '<span class="di__icon-dot di__icon-dot--small" style="background:#3D7A86">' + ico("pin", 9) + '</span>' +
        '</div>';
    } else {
      html =
        '<div class="di__expanded">' +
          '<div class="di__row">' +
            '<span class="di__icon-dot" style="background:#D55E3A">' + ico("timer", 14) + '</span>' +
            '<div class="di__col"><div class="di__title">' + T("Lập kế hoạch quý 3", "Plan Q3 roadmap") + '</div>' +
            '<div class="di__sub">' + T("Focus · cá nhân", "Focus · personal") + '</div></div>' +
            '<div class="di__time-big tnum">' + t.mm + ':' + t.ss + '</div>' +
          '</div>' +
          '<div class="di__progress"><div class="di__progress-fill" style="width:' + t.p + '%"></div></div>' +
          '<div class="di__actions"><button class="di__btn">' + ico("pause", 14) + '</button>' +
          '<button class="di__btn di__btn--ghost">' + T("Bỏ qua nghỉ", "Skip break") + '</button></div>' +
        '</div>';
    }
    heroDI.innerHTML = html;
  }

  function renderDemoDI(state) {
    demoState = state;
    demoDI.className = "di-demo__island di-demo__island--" + state;
    demoLabel.textContent = state;
    var t = demoTime();
    var html = "";
    if (state === "minimal") {
      html =
        '<span class="di__icon-dot" style="background:#D55E3A">' + ico("timer", 12) + '</span>' +
        '<span class="tnum" style="font-weight:700;font-size:12px;color:#FFD5C2;padding-right:6px">' + t.mm + ':' + t.ss + '</span>';
    } else if (state === "compact") {
      html =
        '<span class="di__icon-dot" style="background:#D55E3A">' + ico("timer", 12) + '</span>' +
        '<span class="tnum" style="font-weight:700;font-size:13px">' + t.mm + ':' + t.ss + '</span>' +
        '<div style="flex:1;height:4px;background:rgba(255,255,255,.18);border-radius:100px;overflow:hidden"><div style="height:100%;background:#D55E3A;width:' + t.p + '%;transition:width 1s linear"></div></div>' +
        '<span class="di__icon-dot" style="background:#3D7A86;width:18px;height:18px">' + ico("pin", 10) + '</span>';
    } else {
      html =
        '<div style="display:flex;align-items:center;gap:10px;width:100%">' +
          '<span class="di__icon-dot" style="background:#D55E3A;width:28px;height:28px">' + ico("timer", 16) + '</span>' +
          '<div style="flex:1;min-width:0"><div style="font-weight:700;font-size:14px;line-height:1.1">' + T("Lập kế hoạch quý 3", "Plan Q3 roadmap") + '</div>' +
          '<div style="font-size:11px;opacity:.55;margin-top:2px">' + T("Focus · còn 14 phút", "Focus · 14 minutes left") + '</div></div>' +
          '<div class="tnum" style="font-family:\'Bricolage Grotesque\',serif;font-weight:600;font-size:24px;letter-spacing:-.04em">' + t.mm + ':' + t.ss + '</div>' +
        '</div>' +
        '<div style="height:4px;background:rgba(255,255,255,.18);border-radius:100px;overflow:hidden"><div style="height:100%;background:#D55E3A;width:' + t.p + '%;transition:width 1s linear"></div></div>' +
        '<div style="display:flex;gap:6px"><button class="di__btn">' + ico("pause", 14) + '</button>' +
        '<button class="di__btn di__btn--ghost">' + T("Bỏ qua nghỉ", "Skip break") + '</button></div>';
    }
    demoDI.innerHTML = html;
  }

  // demo state buttons (manual control)
  var demoAuto = true;
  document.querySelectorAll("#demoStates .di-demo__state-btn").forEach(function (b) {
    b.addEventListener("click", function () {
      demoAuto = false;
      document.querySelectorAll("#demoStates .di-demo__state-btn").forEach(function (x) {
        x.classList.remove("di-demo__state-btn--active");
      });
      b.classList.add("di-demo__state-btn--active");
      renderDemoDI(b.getAttribute("data-state"));
    });
  });
  function setDemoActiveBtn(state) {
    document.querySelectorAll("#demoStates .di-demo__state-btn").forEach(function (x) {
      x.classList.toggle("di-demo__state-btn--active", x.getAttribute("data-state") === state);
    });
  }

  // initial render
  renderHeroDI("expanded");
  renderDemoDI("expanded");

  // hero DI cycle
  var heroStates = ["expanded", "compact", "minimal", "compact"];
  var heroIdx = 0;
  setInterval(function () {
    heroIdx = (heroIdx + 1) % heroStates.length;
    renderHeroDI(heroStates[heroIdx]);
  }, 2800);

  // demo DI cycle (until user clicks)
  var demoStates = ["minimal", "compact", "expanded"];
  setInterval(function () {
    if (!demoAuto) return;
    var next = demoStates[(demoStates.indexOf(demoState) + 1) % demoStates.length];
    setDemoActiveBtn(next);
    renderDemoDI(next);
  }, 3200);

  /* ---------- live clocks / countdowns every second ---------- */
  var phoneClock = document.getElementById("phoneClock");
  var laTime = document.querySelector("[data-di-time]");
  var laBar = document.querySelector("[data-di-bar]");
  function tick() {
    var d = new Date();
    if (phoneClock) phoneClock.textContent = pad(d.getHours()) + ":" + pad(d.getMinutes());
    var t = heroTime();
    // refresh only the time/progress text inside current DI states
    var hb = heroDI.querySelector(".di__time, .di__time-big");
    if (hb) hb.textContent = t.mm + ":" + t.ss;
    var hf = heroDI.querySelector(".di__bar-fill, .di__progress-fill");
    if (hf) hf.style.width = t.p + "%";
    if (laTime) laTime.textContent = t.mm + ":" + t.ss;
    if (laBar) laBar.style.width = t.p + "%";

    var dt = demoTime();
    var db = demoDI.querySelector(".tnum");
    if (db) db.textContent = dt.mm + ":" + dt.ss;
    var dbar = demoDI.querySelector('div[style*="background:#D55E3A"]');
  }
  tick();
  setInterval(tick, 1000);

  /* ============================================================
     Build decorative bits: streak bars + care grid
     ============================================================ */
  var streakFire = document.getElementById("streakFire");
  if (streakFire) {
    var sf = "";
    for (var i = 0; i < 14; i++) {
      var h = 20 + ((i * 37) % 40);
      var op = (0.25 + (i / 14) * 0.75).toFixed(2);
      sf += '<div class="streak-bar" style="height:' + h + 'px;--op:' + op + '"></div>';
    }
    streakFire.innerHTML = sf;
  }
  var careGrid = document.getElementById("careGrid");
  if (careGrid) {
    var cg = "";
    for (var j = 0; j < 30; j++) {
      var missed = (j === 15 || j === 22);
      var bg = missed ? "var(--bg-alt)" : "var(--care)";
      var o = missed ? 1 : (0.4 + (j / 30) * 0.6).toFixed(2);
      cg += '<div style="width:22px;height:22px;border-radius:6px;background:' + bg + ';opacity:' + o + '"></div>';
    }
    careGrid.innerHTML = cg;
  }

  /* ============================================================
     Scroll reveal + one-shot stat/level animations
     ============================================================ */
  function animateStats() {
    // streak counter 0 → 47
    var num = document.getElementById("streakNum");
    if (num) {
      var n = 0, target = 47;
      var id = setInterval(function () {
        n += 1; if (n >= target) { n = target; clearInterval(id); }
        num.textContent = n;
      }, 28);
    }
    // ring
    var ring = document.getElementById("statsRing");
    if (ring) { var C = 2 * Math.PI * 92; ring.setAttribute("stroke-dashoffset", C * (1 - 0.66)); }
    // weekday bars
    document.querySelectorAll("#weekdayBars .weekday-bar__col").forEach(function (col) {
      col.style.height = (parseFloat(col.getAttribute("data-v")) * 120) + "px";
    });
    // location bars
    document.querySelectorAll("#locBars .loc-fill").forEach(function (f) {
      f.style.transition = "width 1.4s cubic-bezier(.2,.7,.2,1)";
      f.style.width = f.getAttribute("data-w") + "%";
    });
  }
  function animateLevels() {
    var ring = document.getElementById("growthRing");
    if (ring) { var C = 2 * Math.PI * 52; ring.setAttribute("stroke-dashoffset", C * (1 - 0.36)); }
    var bar = document.querySelector("#levelsReveal .growth-bar");
    if (bar) bar.style.width = "36%";
  }

  var statsDone = false, levelsDone = false;
  var reveals = Array.prototype.slice.call(document.querySelectorAll(".reveal"));

  function revealEl(el) {
    if (el.classList.contains("is-in")) return;
    el.classList.add("is-in");
    // lock the final visible state after the fade so content can never get
    // stuck mid-transition (e.g. in a throttled/background tab).
    setTimeout(function () { el.classList.add("reveal-shown"); }, 850);
    if (el.id === "statsReveal" && !statsDone) { statsDone = true; animateStats(); }
    if (el.id === "levelsReveal" && !levelsDone) { levelsDone = true; animateLevels(); }
  }

  // Manual viewport check — works everywhere (no reliance on IntersectionObserver,
  // which can stay silent inside detached/preview iframes).
  function checkReveals() {
    var vh = window.innerHeight || document.documentElement.clientHeight;
    for (var k = reveals.length - 1; k >= 0; k--) {
      var el = reveals[k];
      var top = el.getBoundingClientRect().top;
      if (top < vh * 0.9) { revealEl(el); reveals.splice(k, 1); }
    }
  }
  window.addEventListener("scroll", checkReveals, { passive: true });
  window.addEventListener("resize", checkReveals);
  checkReveals();
  // safety passes in case fonts/layout settle late
  setTimeout(checkReveals, 200);
  setTimeout(checkReveals, 800);
  // absolute fallback: never leave anything hidden
  setTimeout(function () { reveals.slice().forEach(revealEl); }, 1600);

  /* apply saved language last (after DI renderers exist) */
  applyLang(lang);
})();
