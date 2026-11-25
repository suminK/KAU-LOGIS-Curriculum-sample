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

  var state = { q: "", year: null, type: null, inst: null, tags: [] };

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
    applyTheme(next);
  });

  /* ---------- filtering ---------- */
  function matches(c) {
    if (state.year && c.year !== state.year) return false;
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
    return !!(state.q || state.year || state.type || state.inst || state.tags.length);
  }

  /* ---------- pieces ---------- */
  function chip(label, pressed, attrs) {
    return '<button type="button" class="chip" aria-pressed="' + pressed + '" ' + attrs + ">" + esc(label) + "</button>";
  }
  function segBtn(label, pressed, attrs) {
    return '<button type="button" aria-pressed="' + pressed + '" ' + attrs + ">" + esc(label) + "</button>";
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
    return '<button type="button" class="card" data-id="' + esc(c.id) + '">' +
      '<span class="card-head"><span class="card-name">' + esc(c.name) + "</span>" +
      (typeof c.credits === "number" ? '<span class="card-credits">' + creditsText(c.credits) + "</span>" : "") + "</span>" +
      (c.code ? '<span class="code">' + esc(c.code) + "</span>" : "") +
      (c.instructor ? '<span class="card-prof">' + esc(profText(c)) + "</span>" : "") +
      '<span class="card-meta">' + badges(c) + tagsHtml(c) + "</span></button>";
  }

  /* ---------- render ---------- */
  function renderFilters() {
    $("f-year").innerHTML = segBtn("전체", state.year === null, 'data-f="year" data-v=""') +
      [1, 2, 3, 4].map(function (y) { return segBtn(yearN(y), state.year === y, 'data-f="year" data-v="' + y + '"'); }).join("");
    $("f-type").innerHTML = segBtn("전체", state.type === null, 'data-f="type" data-v=""') +
      TYPES_USED.map(function (v) { return segBtn(TYPE[v], state.type === v, 'data-f="type" data-v="' + v + '"'); }).join("");
    $("row-lang").hidden = !HAS_LANG;
    $("f-lang").innerHTML = segBtn("전체", state.inst === null, 'data-f="inst" data-v=""') +
      ["ko", "en"].map(function (v) { return segBtn(LANG[v], state.inst === v, 'data-f="inst" data-v="' + v + '"'); }).join("");
    $("f-tags").innerHTML = Object.keys(DATA.tags).map(function (k) {
      return chip(tagLabel(k), state.tags.indexOf(k) >= 0, 'data-f="tag" data-v="' + esc(k) + '"');
    }).join("");
    var n = (state.year ? 1 : 0) + (state.type ? 1 : 0) + (state.inst ? 1 : 0);
    $("f-count").hidden = !n;
    $("f-count").textContent = n;
  }

  function semBlock(title, list, cls) {
    var cr = sumCredits(list);
    return '<div class="sem ' + cls + '"><h3>' + title + (cr !== null ? "<span>" + creditsText(cr) + "</span>" : "") + "</h3>" +
      (list.length ? '<div class="cards">' + list.map(card).join("") + "</div>" : '<p class="none">해당 과목 없음</p>') +
      "</div>";
  }

  function renderList() {
    var shown = COURSES.filter(matches);
    var total = sumCredits(shown);
    $("count").textContent = "과목 " + shown.length + "개" + (total !== null ? " · " + creditsText(total) : "");
    $("reset").hidden = !filtering();

    if (!shown.length) {
      $("list").innerHTML = '<p class="empty">조건에 맞는 과목이 없습니다.</p>';
      return;
    }
    var html = "";
    [1, 2, 3, 4].forEach(function (y) {
      var inYear = shown.filter(function (c) { return c.year === y; });
      if (!inYear.length) return;
      var ycr = sumCredits(inYear);
      var common = inYear.filter(function (c) { return !c.semester; });
      html += '<section class="year"><h2>' + yearN(y) + (ycr !== null ? "<span>" + creditsText(ycr) + "</span>" : "") + "</h2>";
      if (common.length) html += semBlock(semN(0), common, "common");
      if (inYear.length > common.length) {
        html += '<div class="sems">';
        [1, 2].forEach(function (s) {
          html += semBlock(semN(s), inYear.filter(function (c) { return c.semester === s; }), "");
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
  function linkSection(title, list) {
    if (!list.length) return "";
    return '<section class="d-sec"><h3 class="d-h">' + title + '<span class="n">' + list.length + "</span></h3>" +
      '<div class="d-links">' + list.map(function (c) {
        var sub = yearN(c.year) + " " + semN(c.semester) + (c.instructor ? " · " + profText(c) : "");
        return '<button type="button" class="d-link" data-jump="' + esc(c.id) + '">' +
          '<span><span class="d-link-name">' + esc(c.name) + '</span><span class="d-link-sub">' + esc(sub) + "</span></span>" +
          ARROW + "</button>";
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
      (c.instructor ? '<p class="d-prof">' + esc(profText(c)) + "</p>" : "") +
      '<div class="d-tags">' + tagsHtml(c) + "</div>" +
      descHtml(c.description) +
      (c.note ? '<p class="d-note">' + esc(c.note) + "</p>" : "") +
      (facts ? '<dl class="d-facts">' + facts + "</dl>" : "") +
      linkSection("선수 권장 과목", pre) +
      linkSection("관련 과목", related) +
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
    flashTimer = setTimeout(function () { el.classList.remove("flash"); }, 3000);
  }

  /* ---------- routing: #scm opens that course ---------- */
  function currentId() { return decodeURIComponent(location.hash.slice(1)); }
  function openCourse(id) { location.hash = encodeURIComponent(id); }
  function clearHash() {
    if (location.hash) history.replaceState(null, "", location.pathname + location.search);
  }
  window.addEventListener("hashchange", function () { renderDetail(currentId()); });

  /* ---------- events ---------- */
  $("q").addEventListener("input", function (e) { state.q = e.target.value.trim(); renderList(); });

  $("more-btn").addEventListener("click", function () {
    var open = $("more").classList.toggle("open");
    $("more").inert = !open;
    this.setAttribute("aria-expanded", String(open));
  });

  document.querySelector(".bar").addEventListener("click", function (e) {
    var b = e.target.closest("button[data-f]");
    if (!b) return;
    var f = b.dataset.f, v = b.dataset.v;
    if (f === "year") state.year = v ? Number(v) : null;
    else if (f === "type") state.type = v || null;
    else if (f === "inst") state.inst = v || null;
    else if (f === "tag") {
      var i = state.tags.indexOf(v);
      if (i >= 0) state.tags.splice(i, 1); else state.tags.push(v);
    }
    renderFilters();
    renderList();
  });

  function resetFilters() {
    state.q = ""; state.year = null; state.type = null; state.inst = null; state.tags = [];
    $("q").value = "";
    renderFilters();
    renderList();
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
  $("sample").hidden = !DATA.meta.sample;
  document.documentElement.classList.toggle("is-sample", !!DATA.meta.sample);
  $("updated").textContent = (DATA.meta.source ? "출처: " + DATA.meta.source + " · " : "") + "최종 수정 " + DATA.meta.updated;
  var contact = DATA.meta.contact;
  if (contact && (contact.name || contact.email)) {
    $("contact").hidden = false;
    $("contact").innerHTML = "문의: " + esc(contact.name || "") +
      (contact.name && contact.email ? " · " : "") +
      (contact.email ? '<a href="mailto:' + esc(contact.email) + '">' + esc(contact.email) + "</a>" : "");
  }
  renderFilters();
  renderList();
  if (currentId()) renderDetail(currentId());
})();
