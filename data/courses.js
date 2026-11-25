/* =====================================================================
   KAU Logistics curriculum data  —  THE ONLY FILE YOU EDIT FOR CONTENT
   =====================================================================
   Source: "2026 항공·경영대학 물류전공 교과목 체계도" (department website).

   How to change things
   --------------------
   - Edit a course:   find its line and change the text.
   - Add a course:    copy one { ... } line, paste it, change the values.
   - Remove a course: delete its line (and its id from any "prereqs").
   - Add a tag:       add one line to "tags", then use its key in a course.

   Course fields  (only id, name, year, semester and type are required)
   -------------
   id          unique short key, used in links (e.g. "scm"); never shown
   name        the course name exactly as in the official curriculum
   year        1-4
   semester    1, 2, or 0 when the chart does not tie it to one semester
   type        "major"    전공
               "basic"    기초필수
               "general"  교양필수
               "dept"     전공 내규 필수
               "required" 전공필수   |  "elective" 전공선택
   tags        list of tag keys defined in "tags" below
   code        optional course code, e.g. "LOG201"
   credits     optional number
   language    optional language of instruction: "ko", "en" or "both"
   prereqs     optional list of course ids recommended before this one
   instructor  optional, e.g. "홍길동"
   syllabus    optional link to the syllabus
   description optional, two or three sentences for students
   note        optional, a rule or remark shown with the course
   ===================================================================== */

window.CURRICULUM = {
  meta: {
    updated: "2026-11-25",
    sample: false,
    source: "2026 항공·경영대학 물류전공 교과목 체계도"
  },

  tags: {
    foundation: "기초·교양",
    logistics:  "물류·SCM",
    aviation:   "항공",
    transport:  "교통",
    maritime:   "해운·항만",
    or:         "OR·최적화",
    data:       "데이터·AI",
    business:   "경영·정책",
    field:      "현장·프로젝트"
  },

  courses: [
    /* ---------- 1학년 ---------- */
    { id: "pre-sw", year: 1, semester: 0, type: "general", tags: ["foundation", "data"],
      name: "입학전SW교육",
      note: "꿈꾸는 인공지능, 세상을 바꾸는 SW. 정규학기 미개설. 수시 1~2월, 정시 7~8월에 이수하며 여름계절학기 학점으로 인정 (미이수자는 매년 여름학기에 이수 가능)." },
    { id: "intro-air-logis", year: 1, semester: 0, type: "basic", tags: ["foundation", "aviation", "logistics"],
      name: "항공교통·물류의 입문" },
    { id: "intro-biz", year: 1, semester: 0, type: "basic", tags: ["foundation", "business"],
      name: "경영·항공경영의 입문" },
    { id: "calculus", year: 1, semester: 0, type: "dept", tags: ["foundation"],
      name: "미분적분학",
      note: "물류전공 내규: 졸업 전까지 미분적분학과 선형대수학 두 과목을 모두 이수해야 합니다." },
    { id: "linear-algebra", year: 1, semester: 0, type: "dept", tags: ["foundation"],
      name: "선형대수학",
      note: "물류전공 내규: 졸업 전까지 미분적분학과 선형대수학 두 과목을 모두 이수해야 합니다." },

    { id: "kau-space", year: 1, semester: 1, type: "general", tags: ["foundation"],
      name: "KAU SPACE 인성과 진로" },
    { id: "writing", year: 1, semester: 1, type: "general", tags: ["foundation"],
      name: "교양글쓰기" },
    { id: "intro-ai", year: 1, semester: 1, type: "general", tags: ["foundation", "data"],
      name: "인공지능소개" },
    { id: "career-1", year: 1, semester: 1, type: "general", tags: ["foundation"],
      name: "진로탐구 I(항경대)" },
    { id: "coding-python", year: 1, semester: 1, type: "general", tags: ["foundation", "data"],
      name: "코딩입문(Python)" },

    { id: "english-comm", year: 1, semester: 2, type: "general", tags: ["foundation"],
      name: "영어커뮤니케이션" },
    { id: "career-2", year: 1, semester: 2, type: "general", tags: ["foundation"],
      name: "진로탐구 II(항경대)" },
    { id: "intro-stats", year: 1, semester: 2, type: "general", tags: ["foundation", "data"],
      name: "통계학입문" },

    /* ---------- 2학년 1학기 ---------- */
    { id: "transport-logis-intro", year: 2, semester: 1, type: "major", tags: ["transport", "logistics"],
      name: "교통 물류학개론" },
    { id: "or-1", year: 2, semester: 1, type: "major", tags: ["or"],
      name: "O·R I" },
    { id: "logis-intro", year: 2, semester: 1, type: "major", tags: ["logistics"],
      name: "물류입문" },
    { id: "logis-innovation", year: 2, semester: 1, type: "major", tags: ["logistics", "business"],
      name: "물류혁신및사례" },
    { id: "data-programming", year: 2, semester: 1, type: "major", tags: ["data"],
      name: "데이터프로그래밍" },
    { id: "database-intro", year: 2, semester: 1, type: "major", tags: ["data"],
      name: "데이터베이스입문" },
    { id: "future-mobility", year: 2, semester: 1, type: "major", tags: ["transport"],
      name: "미래교통과 자율협력주행체계" },

    /* ---------- 2학년 2학기 ---------- */
    { id: "data-analytics", year: 2, semester: 2, type: "major", tags: ["data"],
      name: "데이터애널리틱스" },
    { id: "or-2", year: 2, semester: 2, type: "major", tags: ["or"],
      name: "O·R II" },
    { id: "production-service", year: 2, semester: 2, type: "major", tags: ["logistics", "business"],
      name: "생산및서비스관리" },
    { id: "applied-stats", year: 2, semester: 2, type: "major", tags: ["data"],
      name: "통계분석응용" },
    { id: "air-logistics", year: 2, semester: 2, type: "major", tags: ["aviation", "logistics"],
      name: "항공물류" },

    /* ---------- 3학년 1학기 ---------- */
    { id: "logis-law-policy", year: 3, semester: 1, type: "major", tags: ["business"],
      name: "물류관련법및정책" },
    { id: "or-applied", year: 3, semester: 1, type: "major", tags: ["or"],
      name: "O·R 응용" },
    { id: "warehousing", year: 3, semester: 1, type: "major", tags: ["logistics"],
      name: "보관하역론" },
    { id: "transport-planning", year: 3, semester: 1, type: "major", tags: ["transport"],
      name: "교통계획론" },
    { id: "traffic-engineering", year: 3, semester: 1, type: "major", tags: ["transport"],
      name: "교통공학론" },
    { id: "logis-info-systems", year: 3, semester: 1, type: "major", tags: ["logistics", "data"],
      name: "물류정보시스템" },
    { id: "integer-programming", year: 3, semester: 1, type: "major", tags: ["or"],
      name: "정수계획법" },
    { id: "port-logistics", year: 3, semester: 1, type: "major", tags: ["maritime", "logistics"],
      name: "항만물류론" },
    { id: "short-intern-1", year: 3, semester: 1, type: "major", tags: ["field"],
      name: "물류단기현장실습 I",
      note: "단기현장실습은 방학 중 개설됩니다." },

    /* ---------- 3학년 2학기 ---------- */
    { id: "freight-transport", year: 3, semester: 2, type: "major", tags: ["logistics", "transport"],
      name: "화물운송론" },
    { id: "scm", year: 3, semester: 2, type: "major", tags: ["logistics"],
      name: "공급사슬관리(SCM)" },
    { id: "capstone-2", year: 3, semester: 2, type: "major", tags: ["aviation", "field"],
      name: "항공운송 캡스톤디자인 II",
      note: "캡스톤디자인 I/II 중 1개 이상 필수 이수." },
    { id: "ai-project-2", year: 3, semester: 2, type: "major", tags: ["data", "field"],
      name: "AI물류융합 프로젝트 II" },
    { id: "green-logistics", year: 3, semester: 2, type: "major", tags: ["logistics"],
      name: "그린로지스틱스" },
    { id: "logis-network", year: 3, semester: 2, type: "major", tags: ["logistics", "or"],
      name: "물류네트워크론" },
    { id: "logis-accounting", year: 3, semester: 2, type: "major", tags: ["business"],
      name: "물류관리회계" },
    { id: "logis-systems-analysis", year: 3, semester: 2, type: "major", tags: ["logistics", "or"],
      name: "물류시스템분석" },
    { id: "facility-capacity", year: 3, semester: 2, type: "major", tags: ["transport"],
      name: "교통시설용량분석" },
    { id: "facility-operations", year: 3, semester: 2, type: "major", tags: ["transport"],
      name: "교통시설운영론" },
    { id: "airport-planning", year: 3, semester: 2, type: "major", tags: ["aviation", "transport"],
      name: "공항계획" },
    { id: "short-intern-2", year: 3, semester: 2, type: "major", tags: ["field"],
      name: "물류단기현장실습 II",
      note: "단기현장실습은 방학 중 개설됩니다." },
    { id: "industry-intern-project", year: 3, semester: 2, type: "major", tags: ["field"],
      name: "산학인턴프로젝트1/2/3",
      note: "3학년 2학기부터 4학년 1학기까지, 양 학기 개설. 산학인턴프로젝트 1은 방학 중 개설됩니다." },

    /* ---------- 4학년 ---------- */
    { id: "long-intern-1", year: 4, semester: 0, type: "major", tags: ["field"],
      name: "물류 장기현장실습 I",
      note: "양 학기 개설." },
    { id: "long-intern-2", year: 4, semester: 0, type: "major", tags: ["field"],
      name: "물류 장기현장실습 II",
      note: "양 학기 개설." },

    { id: "consulting-method", year: 4, semester: 1, type: "major", tags: ["business", "logistics"],
      name: "물류컨설팅방법론" },
    { id: "scm-strategy", year: 4, semester: 1, type: "major", tags: ["logistics", "business"],
      name: "SCM전략및사례" },
    { id: "capstone-1", year: 4, semester: 1, type: "major", tags: ["aviation", "field"],
      name: "항공운송 캡스톤디자인 I",
      note: "캡스톤디자인 I/II 중 1개 이상 필수 이수." },
    { id: "ai-project-1", year: 4, semester: 1, type: "major", tags: ["data", "field"],
      name: "AI물류융합 프로젝트 I" },
    { id: "maritime-transport", year: 4, semester: 1, type: "major", tags: ["maritime"],
      name: "해상운송론" },
    { id: "ai-logistics", year: 4, semester: 1, type: "major", tags: ["data", "logistics"],
      name: "AI와 물류응용" },
    { id: "cold-chain", year: 4, semester: 1, type: "major", tags: ["logistics"],
      name: "Smart Cold Chain Management" },
    { id: "logistics-engineering", year: 4, semester: 1, type: "major", tags: ["logistics", "or"],
      name: "로지스틱스공학" },
    { id: "business-problem-solving", year: 4, semester: 1, type: "major", tags: ["business", "field"],
      name: "기업문제해결" },

    { id: "multimodal", year: 4, semester: 2, type: "major", tags: ["transport", "logistics"],
      name: "복합운송론" },
    { id: "e-logistics", year: 4, semester: 2, type: "major", tags: ["logistics", "data"],
      name: "E-로지스틱스" },
    { id: "logis-practice", year: 4, semester: 2, type: "major", tags: ["logistics", "field"],
      name: "물류실무및사례" },
    { id: "delivery-planning", year: 4, semester: 2, type: "major", tags: ["transport", "or"],
      name: "수배송계획론" },
    { id: "iot-logistics", year: 4, semester: 2, type: "major", tags: ["data", "logistics"],
      name: "IoT기반융합 물류기술" },
    { id: "logistics-4", year: 4, semester: 2, type: "major", tags: ["data", "business"],
      name: "물류4.0기술과 기업가정신" }
  ]
};
