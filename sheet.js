/* Loads the course list from a Google Sheet, then starts the page.

   The sheet address is "sheet" in data/courses.js (meta). When it is empty,
   the courses saved in data/courses.js are shown. When a sheet is set but
   cannot be read in time, the page shows "준비중입니다." instead of a list.

   Sheet layout: first row = column names, one course per row.
   Columns (order does not matter, unknown columns are ignored):
     학년 · 학기 · 구분 · 과목명 · 담당교수 · 태그 · 설명 · 선수 과목 · 관련 과목
     비고 · 학점 · 영어강의여부 · 개설여부 · 학수번호
   - 학기: 1 or 2; leave empty (or write 공통) for courses not tied to a semester
   - 태그, 선수 과목, 관련 과목: several values separated by commas
   - 영어강의여부: a checkbox (checked = taught in English)
   - 개설여부: a checkbox (checked = offered this semester). Name the column
     "2026-2 개설여부" and the page says "2026-2 개설"; without a semester in
     the name it uses "term" from data/courses.js.
   - 설명: one paragraph, or several lines in one cell (Alt+Enter) for 개조식

   Tag names that match nothing are left out of the page. Course names in
   선수 과목 / 관련 과목 that are not in the list are shown as plain names (no link).
   Open the page with ?check at the end of the address to see a list of them. */
(function () {
  "use strict";

  var DATA = window.CURRICULUM;
  /* app.js is loaded with the same ?v= as this file, so both update together */
  var VER = ((document.currentScript || {}).src || "").split("?")[1];
  var URL_ = DATA.meta.sheet;
  var WAIT = 6000;   /* ms before giving up on the sheet */

  var COLS = {
    "학년": "year", "학기": "semester", "구분": "type", "과목명": "name", "담당교수": "instructor",
    "태그": "tags", "설명": "description", "선수과목": "prereqs", "선수권장과목": "prereqs", "관련과목": "related",
    "비고": "note", "학점": "credits", "강의언어": "language", "영어강의여부": "english", "영어강의": "english",
    "학수번호": "code", "개설여부": "open", "개설": "open"
  };
  var TYPES = {
    "전공": "major", "기초필수": "basic", "교양필수": "general", "전공내규필수": "dept",
    "전공필수": "required", "전공선택": "elective"
  };
  var LANGS = {
    "한국어": "ko", "국문": "ko", "korean": "ko", "ko": "ko",
    "영어": "en", "영어강의": "en", "영문": "en", "english": "en", "en": "en",
    "한국어영어": "both", "한영": "both", "both": "both"
  };

  /* compare text ignoring spaces, dots and letter case */
  function norm(s) { return String(s || "").replace(/[\s·・.\-_/]/g, "").toLowerCase(); }
  /* a ticked checkbox arrives as TRUE */
  function yes(s) { return /^(true|y|yes|o|예|1|✓|✔)$/i.test(String(s || "").trim()); }
  function parts(s) {
    /* stray quote marks around a value (left over from pasting) are ignored */
    return String(s || "").split(/[,，;\n]/)
      .map(function (x) { return x.replace(/["“”'‘’]/g, "").trim(); }).filter(Boolean);
  }

  /* CSV text -> rows of cells (handles quotes, commas and line breaks inside cells) */
  function parseCsv(text) {
    var rows = [], row = [], cell = "", quoted = false;
    text = text.replace(/^﻿/, "");
    for (var i = 0; i < text.length; i++) {
      var ch = text[i];
      if (quoted) {
        if (ch === '"') {
          if (text[i + 1] === '"') { cell += '"'; i++; } else quoted = false;
        } else cell += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ",") { row.push(cell); cell = ""; }
      else if (ch === "\n" || ch === "\r") {
        if (ch === "\r" && text[i + 1] === "\n") i++;
        row.push(cell); rows.push(row); row = []; cell = "";
      } else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
  }

  function toCourses(rows) {
    if (!rows.length) throw new Error("empty sheet");
    var head = rows[0].map(function (h) {
      /* "2026-2 개설여부" or "개설여부 (2026-2)": the rest of the name is the semester label */
      var m = /개설\s*여부/.exec(h);
      if (m) {
        var term = h.replace(m[0], "").replace(/[()\[\]:]/g, " ").replace(/\s+/g, " ").trim();
        if (term) DATA.meta.term = term;
        return "open";
      }
      return COLS[norm(h)] || null;
    });
    if (head.indexOf("name") < 0 || head.indexOf("year") < 0) throw new Error("no 과목명 / 학년 column");

    var tagKey = {};
    Object.keys(DATA.tags).forEach(function (k) { tagKey[norm(k)] = k; tagKey[norm(DATA.tags[k])] = k; });
    var oldId = {};   /* keep the ids of known courses so existing links still work */
    DATA.courses.forEach(function (c) { oldId[norm(c.name)] = c.id; });

    var problems = DATA.meta.problems = [];   /* shown on the page with ?check */
    function problem(c, text) { problems.push({ row: c._row, name: c.name, text: text }); }
    /* a column named after a tag works as a checkbox for that tag */
    var tagCols = rows[0].map(function (h, i) { return head[i] ? null : tagKey[norm(h)] || null; });

    var courses = [], idByName = {}, used = {};
    rows.slice(1).forEach(function (cells, n) {
      var r = {};
      head.forEach(function (key, i) { if (key) r[key] = String(cells[i] || "").trim(); });
      var year = parseInt(r.year, 10);
      if (!r.name && !r.year) return;                     /* empty row */
      if (!r.name || !(year >= 1 && year <= 4)) {         /* unfinished row: left out */
        problem({ _row: n + 2, name: r.name || "(과목명 없음)" }, "과목명 또는 학년(1~4)이 없어 페이지에 나오지 않습니다");
        return;
      }

      var id = oldId[norm(r.name)] || r.name.replace(/\s+/g, "-");
      for (var base = id, dup = 2; used[id]; dup++) id = base + "-" + dup;
      used[id] = true;
      if (idByName[norm(r.name)]) problem({ _row: n + 2, name: r.name }, "같은 이름의 과목이 이미 있습니다");
      else idByName[norm(r.name)] = id;

      var sem = (String(r.semester || "").match(/[12]/) || [0])[0];
      var lines = String(r.description || "").split(/\n/)
        .map(function (x) { return x.replace(/^\s*[-•·*]\s*/, "").trim(); }).filter(Boolean);
      var c = {
        id: id, name: r.name, year: year, semester: Number(sem),
        type: TYPES[norm(r.type)] || "major", tags: [],
        _pre: parts(r.prereqs), _rel: parts(r.related), _row: n + 2
      };
      if (r.type && !TYPES[norm(r.type)]) problem(c, "구분을 알 수 없어 '전공'으로 표시합니다: " + r.type);
      parts(r.tags).forEach(function (t) {
        var k = tagKey[norm(t)];
        if (!k) problem(c, "태그를 알 수 없습니다: " + t);
        else if (c.tags.indexOf(k) < 0) c.tags.push(k);
      });
      tagCols.forEach(function (k, i) {
        if (k && yes(cells[i]) && c.tags.indexOf(k) < 0) c.tags.push(k);
      });
      if (lines.length) c.description = lines.length > 1 ? lines : lines[0];
      if (r.instructor) c.instructor = r.instructor.replace(/\s*교수(님)?$/, "");
      if (r.note) c.note = r.note;
      if (r.code) c.code = r.code;
      if (r.credits && !isNaN(parseFloat(r.credits))) c.credits = parseFloat(r.credits);
      if (r.language) c.language = LANGS[norm(r.language)] || undefined;
      if (r.english) c.language = yes(r.english) ? "en" : "ko";   /* checkbox */
      if (head.indexOf("open") >= 0) c.open = yes(r.open);          /* checkbox: offered this semester */
      courses.push(c);
    });
    if (!courses.length) throw new Error("no course rows");

    /* course names in 선수 과목 / 관련 과목 -> ids; names that match nothing are left out */
    courses.forEach(function (c) {
      ["_pre", "_rel"].forEach(function (k) {
        var others = [];   /* names outside the list: shown as plain text, not as links */
        var ids = c[k].map(function (name) {
          var id = idByName[norm(name)];
          var col = k === "_pre" ? "선수 권장 과목" : "관련 과목";
          if (!id) {
            if (others.indexOf(name) < 0) others.push(name);
            problem(c, col + "의 과목이 목록에 없어 링크 없이 이름만 표시합니다: " + name);
          }
          else if (id === c.id) problem(c, col + "에 자기 자신이 적혀 있습니다");
          return id;
        }).filter(function (id, i, all) { return id && id !== c.id && all.indexOf(id) === i; });
        c[k === "_pre" ? "prereqs" : "related"] = ids;
        if (others.length) c[k === "_pre" ? "prereqsOther" : "relatedOther"] = others;
        delete c[k];
      });
    });
    courses.forEach(function (c) { delete c._row; });
    if (problems.length && window.console) console.warn("[sheet] 확인이 필요한 항목 " + problems.length + "건 (?check 로 보기)");
    return courses;
  }

  function start() {
    var s = document.createElement("script");
    s.src = "app.js" + (VER ? "?" + VER : "");
    document.body.appendChild(s);
  }

  if (!URL_) { start(); return; }

  var list = document.getElementById("list");
  if (list) list.innerHTML = '<p class="empty">교과목을 불러오는 중입니다…</p>';

  var ctrl = window.AbortController ? new AbortController() : null;
  var timer = setTimeout(function () { if (ctrl) ctrl.abort(); }, WAIT);
  fetch(URL_, ctrl ? { signal: ctrl.signal } : {})
    .then(function (res) {
      if (!res.ok) throw new Error("HTTP " + res.status);
      return res.text();
    })
    .then(function (text) {
      if (/^\s*</.test(text)) throw new Error("not CSV (is the sheet published as CSV?)");
      DATA.courses = toCourses(parseCsv(text));
      DATA.meta.live = true;
    })
    .catch(function (err) {
      DATA.meta.stale = true;   /* the page shows 준비중입니다 instead of the list */
      DATA.courses = [];
      if (window.console) console.warn("[sheet] 불러오기 실패:", err);
    })
    .then(function () { clearTimeout(timer); start(); });
})();
