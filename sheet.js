/* Loads the course list from a Google Sheet, then starts the page.

   The sheet address is "sheet" in data/courses.js (meta). When it is empty,
   or the sheet cannot be read in time, the courses saved in data/courses.js
   are shown instead, so the page never comes up empty.

   Sheet layout: first row = column names, one course per row.
   Columns (order does not matter, unknown columns are ignored):
     학년 · 학기 · 구분 · 과목명 · 담당교수 · 태그 · 설명 · 선수 과목 · 관련 과목
     비고 · 학점 · 강의언어 · 학수번호 · 강의계획서
   - 학기: 1 or 2; leave empty (or write 공통) for courses not tied to a semester
   - 태그, 선수 과목, 관련 과목: several values separated by commas
   - 설명: one paragraph, or several lines in one cell (Alt+Enter) for 개조식 */
(function () {
  "use strict";

  var DATA = window.CURRICULUM;
  var URL_ = DATA.meta.sheet;
  var WAIT = 6000;   /* ms before giving up on the sheet */

  var COLS = {
    "학년": "year", "학기": "semester", "구분": "type", "과목명": "name", "담당교수": "instructor",
    "태그": "tags", "설명": "description", "선수과목": "prereqs", "선수권장과목": "prereqs", "관련과목": "related",
    "비고": "note", "학점": "credits", "강의언어": "language", "학수번호": "code", "강의계획서": "syllabus"
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
  function parts(s) {
    return String(s || "").split(/[,，;\n]/).map(function (x) { return x.trim(); }).filter(Boolean);
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
    var head = rows[0].map(function (h) { return COLS[norm(h)] || null; });
    if (head.indexOf("name") < 0 || head.indexOf("year") < 0) throw new Error("no 과목명 / 학년 column");

    var tagKey = {};
    Object.keys(DATA.tags).forEach(function (k) { tagKey[norm(k)] = k; tagKey[norm(DATA.tags[k])] = k; });
    var oldId = {};   /* keep the ids of known courses so existing links still work */
    DATA.courses.forEach(function (c) { oldId[norm(c.name)] = c.id; });

    var courses = [], idByName = {}, used = {};
    rows.slice(1).forEach(function (cells) {
      var r = {};
      head.forEach(function (key, i) { if (key) r[key] = String(cells[i] || "").trim(); });
      var year = parseInt(r.year, 10);
      if (!r.name || !(year >= 1 && year <= 4)) return;   /* skip empty or unfinished rows */

      var id = oldId[norm(r.name)] || r.name.replace(/\s+/g, "-");
      for (var base = id, n = 2; used[id]; n++) id = base + "-" + n;
      used[id] = true;
      if (!idByName[norm(r.name)]) idByName[norm(r.name)] = id;

      var sem = (String(r.semester || "").match(/[12]/) || [0])[0];
      var lines = String(r.description || "").split(/\n/)
        .map(function (x) { return x.replace(/^\s*[-•·*]\s*/, "").trim(); }).filter(Boolean);
      var c = {
        id: id, name: r.name, year: year, semester: Number(sem),
        type: TYPES[norm(r.type)] || "major",
        tags: parts(r.tags).map(function (t) { return tagKey[norm(t)]; }).filter(Boolean),
        _pre: parts(r.prereqs), _rel: parts(r.related)
      };
      if (lines.length) c.description = lines.length > 1 ? lines : lines[0];
      if (r.instructor) c.instructor = r.instructor.replace(/\s*교수(님)?$/, "");
      if (r.note) c.note = r.note;
      if (r.code) c.code = r.code;
      if (r.credits && !isNaN(parseFloat(r.credits))) c.credits = parseFloat(r.credits);
      if (r.language) c.language = LANGS[norm(r.language)] || undefined;
      if (/^https?:\/\//i.test(r.syllabus || "")) c.syllabus = r.syllabus;
      courses.push(c);
    });
    if (!courses.length) throw new Error("no course rows");

    /* course names in 선수 과목 / 관련 과목 -> ids; names that match nothing are left out */
    courses.forEach(function (c) {
      ["_pre", "_rel"].forEach(function (k) {
        var ids = c[k].map(function (name) {
          var id = idByName[norm(name)];
          if (!id && window.console) console.warn("[sheet] " + c.name + ": 과목을 찾을 수 없음 - " + name);
          return id;
        }).filter(function (id) { return id && id !== c.id; });
        c[k === "_pre" ? "prereqs" : "related"] = ids;
        delete c[k];
      });
    });
    return courses;
  }

  function start() {
    var s = document.createElement("script");
    s.src = "app.js";
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
      DATA.meta.stale = true;   /* fall back to the saved copy */
      if (window.console) console.warn("[sheet] 불러오기 실패, 저장된 사본을 표시합니다:", err);
    })
    .then(function () { clearTimeout(timer); start(); });
})();
