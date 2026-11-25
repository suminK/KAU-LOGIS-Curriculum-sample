/* Rendering and filtering. Content lives in data/courses.js. */
(function () {
  "use strict";

  var DATA = window.CURRICULUM;
  var COURSES = DATA.courses;
  var BY_ID = {};
  COURSES.forEach(function (c) { BY_ID[c.id] = c; });

  var TYPE = {
    major: "전공", basic: "기초필수", general: "교양필수", dept: "전공 내규 필수",
    required: "전공필수", elective: "전공선택"
  };
  var TYPE_ORDER = ["required", "elective", "major", "basic", "general", "dept"];
  var LANG = { ko: "한국어", en: "영어", both: "한국어·영어" };

  var state = { q: "", year: null, sem: null, type: null, inst: null, tags: [], open: false };

  var $ = function (id) { return document.getElementById(id); };
  var esc = function (s) {
    return String(s).replace(/[&<>"']/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch];
    });
  };
  var tagLabel = function (k) { return DATA.tags[k] || k; };
  var yearN = function (n) { return n + "학년"; };
  var semN = function (n) { return n ? n + "학기" : "1·2학기"; };
  var creditsText = function (n) { return n + "학점"; };
  var profText = function (c) { return c.instructor ? c.instructor + " 교수님" : ""; };
  /* total credits of a list, or null when any course has no credits yet */
  function sumCredits(list) {
    var s = 0;
    for (var i = 0; i < list.length; i++) {
      if (typeof list[i].credits !== "number") return null;
      s += list[i].credits;
    }
    return list.length ? s : null;
  }

  var TYPES_USED = TYPE_ORDER.filter(function (k) { return COURSES.some(function (c) { return c.type === k; }); });
  var HAS_LANG = COURSES.some(function (c) { return c.language; });
  /* 개설여부: whether a course is offered this semester (only when the data says so) */
  var HAS_OPEN = COURSES.some(function (c) { return typeof c.open === "boolean"; });
  var TERM = DATA.meta.term || "이번 학기";
  var OPEN_TEXT = TERM + " 개설", CLOSED_TEXT = TERM + " 미개설";
  /* the year beside the school name comes from the semester label ("2026-2" -> 2026) */
  var YEAR = (/(?:19|20)\d\d/.exec(DATA.meta.term || "") || [DATA.meta.year || ""])[0];

  var CALM = window.matchMedia("(prefers-reduced-motion: reduce)");
  var EASE = "cubic-bezier(.32, .72, 0, 1)";

  /* ---------- theme: light unless the viewer picks dark ---------- */
  var root = document.documentElement;
  function applyTheme(theme) {
    root.dataset.theme = theme;
    var label = theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환";
    $("theme").setAttribute("aria-label", label);
    $("theme").title = label;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.content = theme === "dark" ? "#000000" : "#f5f5f7";
  }
  function savedTheme() {
    try { var v = localStorage.getItem("kau-logis-theme"); return v === "light" || v === "dark" ? v : null; }
    catch (e) { return null; }
  }
  $("theme").addEventListener("click", function () {
    var next = root.dataset.theme === "dark" ? "light" : "dark";
    try { localStorage.setItem("kau-logis-theme", next); } catch (e) { /* ignore */ }
    /* cross-fade the whole page where the browser can; otherwise switch at once */
    if (document.startViewTransition && !CALM.matches) document.startViewTransition(function () { applyTheme(next); });
    else applyTheme(next);
  });

  /* ---------- filtering ---------- */
  function matches(c) {
    if (state.open && !c.open) return false;
    if (state.year && c.year !== state.year) return false;
    /* courses not tied to one semester (semester 0) show under either */
    if (state.sem && c.semester && c.semester !== state.sem) return false;
    if (state.type && c.type !== state.type) return false;
    if (state.inst === "en" && c.language !== "en" && c.language !== "both") return false;
    if (state.inst === "ko" && c.language !== "ko" && c.language !== "both") return false;
    for (var i = 0; i < state.tags.length; i++) {
      if (c.tags.indexOf(state.tags[i]) < 0) return false;
    }
    if (state.q) {
      var hay = [c.code || "", c.name, [].concat(c.description || []).join(" "), c.note || "", c.instructor || "", TYPE[c.type] || ""]
        .concat(c.tags.map(tagLabel)).join(" ").toLowerCase();
      var words = state.q.toLowerCase().split(/\s+/).filter(Boolean);
      for (var j = 0; j < words.length; j++) if (hay.indexOf(words[j]) < 0) return false;
    }
    return true;
  }
  function filtering() {
    return !!(state.q || state.open || state.year || state.sem || state.type || state.inst || state.tags.length);
  }

  /* ---------- pieces ---------- */
  function chip(label, pressed, attrs) {
    return '<button type="button" class="chip" aria-pressed="' + pressed + '" ' + attrs + ">" + esc(label) + "</button>";
  }
  /* unit ("학년", "학기") is dropped on narrow screens, where the row label already says it */
  function segBtn(label, pressed, attrs, unit) {
    return '<button type="button" aria-pressed="' + pressed + '" ' + attrs + ">" + esc(label) +
      (unit ? '<span class="u">' + unit + "</span>" : "") + "</button>";
  }
  function badges(c) {
    var h = '<span class="badge ' + esc(c.type) + '">' + esc(TYPE[c.type] || c.type) + "</span>";
    if (c.language === "en") h += '<span class="badge en">영어강의</span>';
    if (c.language === "both") h += '<span class="badge en">한·영</span>';
    return h;
  }
  function tagsHtml(c) {
    return c.tags.map(function (k) { return '<span class="tag">' + esc(tagLabel(k)) + "</span>"; }).join("");
  }

  /* description: one paragraph (text) or 개조식 lines (list of text) */
  function descHtml(d) {
    if (!d || !d.length) return "";
    if (Array.isArray(d)) {
      return '<ul class="d-desc d-lines">' + d.map(function (x) { return "<li>" + esc(x) + "</li>"; }).join("") + "</ul>";
    }
    return '<p class="d-desc">' + esc(d) + "</p>";
  }

  function card(c) {
    var closed = HAS_OPEN && !c.open;
    return '<button type="button" class="card' + (closed ? " closed" : "") + '" data-id="' + esc(c.id) + '" data-flip="c-' + esc(c.id) + '"' +
      (HAS_OPEN ? ' aria-label="' + esc(c.name + ", " + (closed ? CLOSED_TEXT : OPEN_TEXT)) + '"' : "") + ">" +
      '<span class="card-head"><span class="card-name">' + esc(c.name) + '</span><span class="card-side">' +
      (HAS_OPEN && c.open ? '<span class="open-mark">개설</span>' : "") +
      (typeof c.credits === "number" ? '<span class="card-credits">' + creditsText(c.credits) + "</span>" : "") + "</span></span>" +
      (c.code ? '<span class="code">' + esc(c.code) + "</span>" : "") +
      (c.instructor ? '<span class="card-prof">' + esc(profText(c)) + "</span>" : "") +
      '<span class="card-meta">' + badges(c) + tagsHtml(c) + "</span></button>";
  }

  /* ---------- render ---------- */
  function renderFilters() {
    $("f-year").innerHTML = segBtn("전체", state.year === null, 'data-f="year" data-v=""') +
      [1, 2, 3, 4].map(function (y) { return segBtn(y, state.year === y, 'data-f="year" data-v="' + y + '"', "학년"); }).join("");
    $("f-sem").innerHTML = segBtn("전체", state.sem === null, 'data-f="sem" data-v=""') +
      [1, 2].map(function (n) { return segBtn(n, state.sem === n, 'data-f="sem" data-v="' + n + '"', "학기"); }).join("");
    $("row-lang").hidden = !HAS_LANG;
    $("f-lang").innerHTML = segBtn("전체", state.inst === null, 'data-f="inst" data-v=""') +
      ["ko", "en"].map(function (v) { return segBtn(LANG[v], state.inst === v, 'data-f="inst" data-v="' + v + '"'); }).join("");
    $("f-open").hidden = !HAS_OPEN;
    $("f-open-term").textContent = TERM;
    $("f-tags").innerHTML = Object.keys(DATA.tags).map(function (k) {
      return chip(tagLabel(k), state.tags.indexOf(k) >= 0, 'data-f="tag" data-v="' + esc(k) + '"');
    }).join("");
  }

  /* after the first build only the pressed state changes, so colours can fade */
  function syncFilters() {
    var cur = { year: state.year, sem: state.sem, type: state.type, inst: state.inst };
    $("f-open").setAttribute("aria-checked", String(state.open));
    Array.prototype.forEach.call(document.querySelectorAll(".bar button[data-f]"), function (b) {
      var f = b.dataset.f, v = b.dataset.v;
      var on = f === "tag" ? state.tags.indexOf(v) >= 0 : (v === "" ? cur[f] === null : String(cur[f]) === v);
      b.setAttribute("aria-pressed", String(on));
    });
  }

  function semBlock(title, list, cls, key) {
    var cr = sumCredits(list);
    return '<div class="sem ' + cls + '"><h3 data-flip="' + key + '">' + title + (cr !== null ? "<span>" + creditsText(cr) + "</span>" : "") + "</h3>" +
      (list.length ? '<div class="cards">' + list.map(card).join("") + "</div>" : '<p class="none">해당 과목 없음</p>') +
      "</div>";
  }

  function renderList() {
    if (DATA.meta.stale) {   /* the sheet could not be read: say so instead of listing courses */
      $("count").textContent = "";
      $("list").innerHTML = '<p class="empty" data-flip="empty">준비중입니다.</p>';
      return;
    }
    var shown = COURSES.filter(matches);
    var total = sumCredits(shown);
    var nOpen = shown.filter(function (c) { return c.open; }).length;
    $("count").textContent = "과목 " + shown.length + "개" + (total !== null ? " · " + creditsText(total) : "") +
      (HAS_OPEN && !state.open ? " · " + OPEN_TEXT + " " + nOpen + "개" : "");
    $("reset").hidden = !filtering();

    if (!shown.length) {
      $("list").innerHTML = '<p class="empty" data-flip="empty">조건에 맞는 과목이 없습니다.</p>';
      return;
    }
    var html = "";
    [1, 2, 3, 4].forEach(function (y) {
      var inYear = shown.filter(function (c) { return c.year === y; });
      if (!inYear.length) return;
      var ycr = sumCredits(inYear);
      var common = inYear.filter(function (c) { return !c.semester; });
      html += '<section class="year"><h2 data-flip="y' + y + '">' + yearN(y) + (ycr !== null ? "<span>" + creditsText(ycr) + "</span>" : "") + "</h2>";
      if (common.length) html += semBlock(semN(0), common, "common", "y" + y + "s0");
      if (inYear.length > common.length) {
        /* with a semester picked, that semester takes the full width */
        html += '<div class="sems' + (state.sem ? " one" : "") + '">';
        (state.sem ? [state.sem] : [1, 2]).forEach(function (s) {
          html += semBlock(semN(s), inYear.filter(function (c) { return c.semester === s; }), "", "y" + y + "s" + s);
        });
        html += "</div>";
      }
      html += "</section>";
    });
    $("list").innerHTML = html;
  }

  var ARROW = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4"/></svg>';
  var CLOSE = '<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8"/></svg>';

  /* a section of courses that jump back to the list when pressed */
  function linkBtn(c) {
    var sub = yearN(c.year) + " " + semN(c.semester) + (c.instructor ? " · " + profText(c) : "");
    return '<button type="button" class="d-link" data-jump="' + esc(c.id) + '">' +
      '<span><span class="d-link-name">' + esc(c.name) + '</span><span class="d-link-sub">' + esc(sub) +
      (HAS_OPEN && c.open ? ' · <span class="open-mark">개설</span>' : "") + "</span></span>" +
      ARROW + "</button>";
  }
  /* alts: groups of course ids where either one will do ("A or B" in the sheet) */
  function linkSection(title, list, others, alts) {
    others = others || [];
    if (!list.length && !others.length) return "";
    var groupOf = {}, done = {};
    (alts || []).forEach(function (g) { g.forEach(function (id) { if (!groupOf[id]) groupOf[id] = g; }); });
    return '<section class="d-sec"><h3 class="d-h">' + title + '<span class="n">' + (list.length + others.length) + "</span></h3>" +
      '<div class="d-links">' + list.map(function (c) {
        var g = groupOf[c.id];
        if (!g) return linkBtn(c);
        if (done[c.id]) return "";
        var members = list.filter(function (x) { return groupOf[x.id] === g; });
        members.forEach(function (x) { done[x.id] = true; });
        if (members.length < 2) return linkBtn(c);
        return '<div class="d-alt">' + members.map(linkBtn).join('<span class="d-or">또는</span>') + "</div>";
      }).join("") +
      /* text from the sheet that is not a course name: shown as written, nothing to jump to */
      others.map(function (name) {
        return '<div class="d-link plain"><span class="d-link-name">' + esc(name) + "</span></div>";
      }).join("") + "</div></section>";
  }
  function fact(label, value) { return "<div><dt>" + label + "</dt><dd>" + esc(value) + "</dd></div>"; }

  function renderDetail(id) {
    var c = BY_ID[id];
    var dlg = $("detail");
    if (!c) { if (dlg.open) dlg.close(); return; }
    var pre = (c.prereqs || []).map(function (p) { return BY_ID[p]; }).filter(Boolean);
    /* related: listed on this course, or on another course pointing here */
    var related = COURSES.filter(function (x) {
      if (x.id === c.id || pre.indexOf(x) >= 0) return false;
      return (c.related || []).indexOf(x.id) >= 0 || (x.related || []).indexOf(c.id) >= 0;
    });
    var kicker = (c.code ? [c.code] : []).concat([yearN(c.year) + " " + semN(c.semester), TYPE[c.type] || c.type]);
    var facts =
      (typeof c.credits === "number" ? fact("학점", creditsText(c.credits)) : "") +
      (c.language ? fact("강의언어", LANG[c.language] || c.language) : "");

    dlg.innerHTML = '<div class="d-inner">' +
      '<div class="d-top"><span class="d-kicker ' + esc(c.type) + '">' + esc(kicker.join(" · ")) + "</span>" +
        '<button type="button" class="close" data-close aria-label="닫기" title="닫기">' + CLOSE + "</button></div>" +
      '<h2 id="d-title">' + esc(c.name) + "</h2>" +
      (HAS_OPEN ? '<p class="d-open ' + (c.open ? "on" : "off") + '">' + (c.open ? OPEN_TEXT : CLOSED_TEXT) + "</p>" : "") +
      (c.instructor ? '<p class="d-prof">' + esc(profText(c)) + "</p>" : "") +
      '<div class="d-tags">' + tagsHtml(c) + "</div>" +
      descHtml(c.description) +
      (c.note ? '<p class="d-note">' + esc(c.note) + "</p>" : "") +
      (facts ? '<dl class="d-facts">' + facts + "</dl>" : "") +
      linkSection("선수 권장 과목", pre, c.prereqsOther, c.prereqAlts) +
      linkSection("관련 과목", related, c.relatedOther) +
      (pre.length || related.length ? '<p class="d-hint">과목을 누르면 목록에서 위치를 보여줍니다.</p>' : "") +
      (c.syllabus ? '<a class="syllabus" target="_blank" rel="noopener" href="' + esc(c.syllabus) + '">강의계획서 보기</a>' : "") +
      "</div>";
    if (!dlg.open) dlg.showModal();
    dlg.scrollTop = 0;
  }

  /* ---------- jump: close the panel and point at a course in the list ---------- */
  var flashTimer = null;
  function cardEl(id) {
    var cards = $("list").querySelectorAll(".card");
    for (var i = 0; i < cards.length; i++) if (cards[i].dataset.id === id) return cards[i];
    return null;
  }
  function jumpTo(id) {
    var dlg = $("detail");
    if (dlg.open) dlg.close();
    if (!cardEl(id) && filtering()) resetFilters();   /* the course was filtered out */
    var el = cardEl(id);
    if (!el) return;
    var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.focus({ preventScroll: true });
    el.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: "center" });
    var old = $("list").querySelector(".card.flash");
    if (old) old.classList.remove("flash");
    void el.offsetWidth;                               /* restart the animation */
    el.classList.add("flash");
    clearTimeout(flashTimer);
    flashTimer = setTimeout(function () { el.classList.remove("flash"); }, 1500);
  }

  /* ---------- routing: #scm opens that course ---------- */
  function currentId() { return decodeURIComponent(location.hash.slice(1)); }
  /* ---------- motion: tiles slide to their new place, fade in and out ---------- */
  function near(r) { return r.bottom > -200 && r.top < window.innerHeight + 200; }
  function snapshot() {
    var map = {};
    Array.prototype.forEach.call($("list").querySelectorAll("[data-flip]"), function (el) {
      map[el.dataset.flip] = { el: el, rect: el.getBoundingClientRect() };
    });
    return map;
  }
  function animateList(before) {
    var list = $("list");
    if (!list.animate) return;
    var origin = list.getBoundingClientRect(), seen = {}, entering = 0;
    Array.prototype.forEach.call(list.querySelectorAll("[data-flip]"), function (el) {
      var key = el.dataset.flip, was = before[key], now = el.getBoundingClientRect();
      seen[key] = true;
      if (was) {                                   /* stayed: slide from the old place */
        var dx = was.rect.left - now.left, dy = was.rect.top - now.top;
        if ((!dx && !dy) || (!near(was.rect) && !near(now))) return;
        el.animate([{ transform: "translate(" + dx + "px," + dy + "px)" }, { transform: "none" }],
          { duration: 380, easing: EASE });
      } else if (near(now)) {                      /* new: fade and rise in */
        el.animate([{ opacity: 0, transform: "translateY(8px) scale(.97)" }, { opacity: 1, transform: "none" }],
          { duration: 300, easing: EASE, delay: Math.min(entering++ * 12, 120), fill: "backwards" });
      }
    });
    Object.keys(before).forEach(function (key) {   /* gone: a copy fades out in place */
      var was = before[key];
      if (seen[key] || !near(was.rect) || !was.el.classList.contains("card")) return;
      var ghost = was.el.cloneNode(true);
      ghost.removeAttribute("data-flip");
      ghost.removeAttribute("data-id");
      ghost.classList.remove("flash");
      ghost.classList.add("ghost");
      ghost.setAttribute("aria-hidden", "true");
      ghost.tabIndex = -1;
      ghost.style.left = (was.rect.left - origin.left) + "px";
      ghost.style.top = (was.rect.top - origin.top) + "px";
      ghost.style.width = was.rect.width + "px";
      ghost.style.height = was.rect.height + "px";
      list.appendChild(ghost);
      var a = ghost.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: "scale(.95)" }],
        { duration: 200, easing: "ease-out", fill: "forwards" });
      a.onfinish = a.oncancel = function () { ghost.remove(); };
    });
  }
  /* re-render the list, animating the difference unless motion is reduced */
  function update() {
    var before = CALM.matches ? null : snapshot();
    renderList();
    if (before) animateList(before);
  }

  function openCourse(id) { location.hash = encodeURIComponent(id); }
  function clearHash() {
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  }
  window.addEventListener("hashchange", function () { renderDetail(currentId()); });

  /* ---------- events ---------- */
  $("q").addEventListener("input", function (e) { state.q = e.target.value.trim(); update(); });

  document.querySelector(".bar").addEventListener("click", function (e) {
    if (e.target.closest("#f-open")) { state.open = !state.open; syncFilters(); update(); return; }
    var b = e.target.closest("button[data-f]");
    if (!b) return;
    var f = b.dataset.f, v = b.dataset.v;
    if (f === "year") state.year = v ? Number(v) : null;
    else if (f === "sem") state.sem = v ? Number(v) : null;
    else if (f === "type") state.type = v || null;
    else if (f === "inst") state.inst = v || null;
    else if (f === "tag") {
      var i = state.tags.indexOf(v);
      if (i >= 0) state.tags.splice(i, 1); else state.tags.push(v);
    }
    syncFilters();
    update();
  });

  function resetFilters() {
    state.q = ""; state.open = false; state.year = null; state.sem = null; state.type = null; state.inst = null; state.tags = [];
    $("q").value = "";
    syncFilters();
    update();
  }
  $("reset").addEventListener("click", resetFilters);

  $("list").addEventListener("click", function (e) {
    var b = e.target.closest("[data-id]");
    if (b) openCourse(b.dataset.id);
  });

  var dlg = $("detail");
  dlg.addEventListener("click", function (e) {
    if (e.target === dlg || e.target.closest("[data-close]")) { dlg.close(); return; }
    var b = e.target.closest("[data-jump]");
    if (b) jumpTo(b.dataset.jump);
  });
  dlg.addEventListener("close", clearHash);

  /* ---------- start ---------- */
  applyTheme(root.dataset.theme || "light");
  $("year").textContent = YEAR ? " · " + YEAR + " 교육과정" : "";
  $("sample").hidden = !DATA.meta.sample;
  document.documentElement.classList.toggle("is-sample", !!DATA.meta.sample);
  /* courses read from the sheet carry no date; a failed read shows the saved copy */
  $("updated").textContent = [
    DATA.meta.source ? "출처: " + DATA.meta.source : "",
    DATA.meta.live || DATA.meta.stale ? "" : "최종 수정 " + DATA.meta.updated
  ].filter(Boolean).join(" · ");
  document.querySelector(".bar").hidden = !!DATA.meta.stale;
  /* ?check in the address: list what the sheet loader could not use (for editors) */
  if (/[?&]check\b/.test(location.search)) {
    var probs = DATA.meta.problems;
    $("check").hidden = false;
    $("check").innerHTML = !DATA.meta.live
      ? "<strong>시트 점검: 구글 시트에서 불러온 내용이 아닙니다.</strong>"
      : !probs.length
        ? "<strong>시트 점검: 문제가 없습니다. (과목 " + COURSES.length + "개)</strong>"
        : "<strong>시트 점검: 확인이 필요한 항목 " + probs.length + "건</strong><ul>" + probs.map(function (p) {
            return "<li><span>" + p.row + "행 " + esc(p.name) + "</span> — " + esc(p.text) + "</li>";
          }).join("") + "</ul>";
  }
  var contact = DATA.meta.contact;
  if (contact && (contact.name || contact.email)) {
    $("contact").hidden = false;
    $("contact").innerHTML = "문의: " + esc(contact.name || "") +
      (contact.name && contact.email ? " · " : "") +
      (contact.email ? '<a href="mailto:' + esc(contact.email) + '">' + esc(contact.email) + "</a>" : "");
  }
  renderFilters();
  update();
  if (currentId()) renderDetail(currentId());
})();
