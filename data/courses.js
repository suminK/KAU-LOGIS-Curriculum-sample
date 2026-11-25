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
   related     optional list of course ids worth looking at together
   instructor  optional, name only, e.g. "홍길동" (shown as "홍길동 교수님")
   syllabus    optional link to the syllabus
   description optional. Either one short paragraph in "quotes", or
               개조식 lines as a list: ["첫째 줄", "둘째 줄"]
   note        optional, a rule or remark shown with the course
   ===================================================================== */

window.CURRICULUM = {
  meta: {
    updated: "2026-11-25",
    sample: true,   // true shows the "샘플" banner and label; set false when official
    source: "2026 항공·경영대학 물류전공 교과목 체계도",
    contact: { name: "Sumin Kang", email: "suminkang@kau.ac.kr" }   // shown at the bottom of the page
  },

  tags: {
    scm:      "물류관리·SCM",
    mobility: "항공·항만·교통",
    or:       "OR·최적화",
    data:     "데이터·AI",
    field:    "실습·프로젝트"
  },

  courses: [
    /* ---------- 1학년 ---------- */
    { id: "intro-air-logis", year: 1, semester: 0, type: "basic", tags: ["scm", "mobility"],
      name: "항공교통·물류의 입문",
      instructor: "홍길동",
      description: "항공교통과 물류 산업의 전체 그림을 처음 만나는 과목입니다. 공항, 항공사, 물류기업이 어떻게 연결되어 움직이는지 사례 중심으로 살펴봅니다.",
      related: ["intro-biz"] },
    { id: "intro-biz", year: 1, semester: 0, type: "basic", tags: ["scm"],
      name: "경영·항공경영의 입문",
      instructor: "홍길동",
      description: [
        "경영학의 기본 개념과 기업 활동 이해",
        "항공사·공항 등 항공산업의 경영 사례",
        "전공 선택을 위한 분야별 소개"
      ],
      related: ["intro-air-logis"] },
    { id: "calculus", year: 1, semester: 0, type: "dept", tags: ["or"],
      name: "미분적분학",
      instructor: "홍길동",
      description: "함수의 극한, 미분, 적분을 다루며 이후 OR과 통계 과목에서 쓰는 수학적 기초를 다집니다.",
      note: "물류전공 내규: 졸업 전까지 미분적분학과 선형대수학 두 과목을 모두 이수해야 합니다.",
      related: ["linear-algebra"] },
    { id: "linear-algebra", year: 1, semester: 0, type: "dept", tags: ["or"],
      name: "선형대수학",
      instructor: "홍길동",
      description: [
        "벡터와 행렬, 연립방정식의 풀이",
        "선형계획법과 데이터 분석의 수학적 바탕",
        "간단한 계산 실습 포함"
      ],
      note: "물류전공 내규: 졸업 전까지 미분적분학과 선형대수학 두 과목을 모두 이수해야 합니다.",
      related: ["calculus"] },

    /* ---------- 2학년 1학기 ---------- */
    { id: "transport-logis-intro", year: 2, semester: 1, type: "major", tags: ["scm", "mobility"],
      name: "교통 물류학개론",
      instructor: "홍길동",
      description: "교통과 물류를 하나의 시스템으로 바라보는 입문 과목입니다. 사람과 화물의 이동이 어떻게 계획되고 운영되는지 기본 개념을 배웁니다.",
      prereqs: ["intro-air-logis"],
      related: ["logis-intro"] },
    { id: "or-1", year: 2, semester: 1, type: "major", tags: ["or"],
      name: "O·R I",
      instructor: "홍길동",
      description: [
        "선형계획법 모형 세우기와 해법",
        "심플렉스법, 쌍대이론, 민감도 분석",
        "수송·할당 문제 등 물류 응용 예제"
      ],
      prereqs: ["linear-algebra"],
      related: ["data-programming"] },
    { id: "logis-intro", year: 2, semester: 1, type: "major", tags: ["scm"],
      name: "물류입문",
      instructor: "홍길동",
      description: "조달부터 보관, 운송, 배송까지 물류의 주요 기능을 한 번씩 훑어보는 과목입니다. 이후 전공 과목을 고르는 데 길잡이가 됩니다.",
      prereqs: ["intro-air-logis"],
      related: ["transport-logis-intro"] },
    { id: "logis-innovation", year: 2, semester: 1, type: "major", tags: ["scm"],
      name: "물류혁신및사례",
      instructor: "홍길동",
      description: [
        "국내외 물류기업의 혁신 사례 분석",
        "자동화, 플랫폼, 풀필먼트 등 최근 흐름",
        "팀별 사례 발표"
      ],
      related: ["logistics-4", "logis-practice"] },
    { id: "data-programming", year: 2, semester: 1, type: "major", tags: ["data"],
      name: "데이터프로그래밍",
      instructor: "홍길동",
      description: "Python으로 데이터를 불러오고 정리하고 시각화하는 방법을 실습 위주로 익힙니다.",
      related: ["database-intro", "or-1"] },
    { id: "database-intro", year: 2, semester: 1, type: "major", tags: ["data"],
      name: "데이터베이스입문",
      instructor: "홍길동",
      description: [
        "관계형 데이터베이스의 구조와 설계",
        "SQL로 데이터 조회·가공하기",
        "물류 데이터를 이용한 실습"
      ],
      related: ["data-programming"] },
    { id: "future-mobility", year: 2, semester: 1, type: "major", tags: ["mobility"],
      name: "미래교통과 자율협력주행체계",
      instructor: "홍길동",
      description: "자율주행, 협력주행, 도심항공교통 등 미래 교통 기술과 이를 뒷받침하는 체계를 소개합니다.",
      related: ["traffic-engineering"] },

    /* ---------- 2학년 2학기 ---------- */
    { id: "data-analytics", year: 2, semester: 2, type: "major", tags: ["data"],
      name: "데이터애널리틱스",
      instructor: "홍길동",
      description: [
        "데이터 탐색과 전처리",
        "회귀·분류 등 기본 분석 기법",
        "물류 데이터 분석 미니 프로젝트"
      ],
      prereqs: ["data-programming"],
      related: ["applied-stats"] },
    { id: "or-2", year: 2, semester: 2, type: "major", tags: ["or"],
      name: "O·R II",
      instructor: "홍길동",
      description: "O·R I에 이어 네트워크 모형, 동적계획법, 대기행렬 등 확률적·조합적 의사결정 기법을 다룹니다.",
      prereqs: ["or-1"],
      related: ["integer-programming"] },
    { id: "production-service", year: 2, semester: 2, type: "major", tags: ["scm"],
      name: "생산및서비스관리",
      instructor: "홍길동",
      description: [
        "수요예측과 생산계획",
        "재고관리, 품질관리의 기본",
        "서비스 운영과 프로세스 설계"
      ],
      prereqs: ["logis-intro"],
      related: ["logis-accounting"] },
    { id: "applied-stats", year: 2, semester: 2, type: "major", tags: ["data"],
      name: "통계분석응용",
      instructor: "홍길동",
      description: "추정과 검정, 분산분석, 회귀분석을 실제 데이터에 적용해 보며 결과를 해석하는 연습을 합니다.",
      prereqs: ["calculus"],
      related: ["data-analytics"] },
    { id: "air-logistics", year: 2, semester: 2, type: "major", tags: ["scm", "mobility"],
      name: "항공물류",
      instructor: "홍길동",
      description: [
        "항공화물의 흐름과 주요 참여자",
        "항공사·포워더·공항 화물터미널의 역할",
        "항공화물 운임과 최근 시장 동향"
      ],
      prereqs: ["logis-intro"],
      related: ["airport-planning", "port-logistics"] },

    /* ---------- 3학년 1학기 ---------- */
    { id: "logis-law-policy", year: 3, semester: 1, type: "major", tags: ["scm"],
      name: "물류관련법및정책",
      instructor: "홍길동",
      description: "물류 관련 주요 법령과 국가 물류정책의 방향을 살펴보고, 현업에서 자주 만나는 제도와 규제를 이해합니다.",
      prereqs: ["logis-intro"],
      related: ["green-logistics"] },
    { id: "or-applied", year: 3, semester: 1, type: "major", tags: ["or"],
      name: "O·R 응용",
      instructor: "홍길동",
      description: [
        "실제 물류·교통 문제의 최적화 모형화",
        "최적화 소프트웨어를 이용한 풀이",
        "사례 기반 과제"
      ],
      prereqs: ["or-2"],
      related: ["integer-programming"] },
    { id: "warehousing", year: 3, semester: 1, type: "major", tags: ["scm"],
      name: "보관하역론",
      instructor: "홍길동",
      description: "물류센터에서 이루어지는 입고, 보관, 피킹, 출고 과정과 설비, 레이아웃 설계의 원리를 배웁니다.",
      prereqs: ["logis-intro"],
      related: ["logis-info-systems"] },
    { id: "transport-planning", year: 3, semester: 1, type: "major", tags: ["mobility"],
      name: "교통계획론",
      instructor: "홍길동",
      description: [
        "교통수요 예측 4단계 모형",
        "교통조사와 자료 분석",
        "교통정책과 계획 평가"
      ],
      prereqs: ["transport-logis-intro"],
      related: ["traffic-engineering"] },
    { id: "traffic-engineering", year: 3, semester: 1, type: "major", tags: ["mobility"],
      name: "교통공학론",
      instructor: "홍길동",
      description: "교통류의 특성과 도로 용량, 신호 운영 등 교통 흐름을 분석하고 개선하는 공학적 방법을 다룹니다.",
      prereqs: ["transport-logis-intro"],
      related: ["future-mobility", "transport-planning"] },
    { id: "logis-info-systems", year: 3, semester: 1, type: "major", tags: ["scm", "data"],
      name: "물류정보시스템",
      instructor: "홍길동",
      description: [
        "WMS, TMS, ERP 등 물류 정보시스템의 구조",
        "바코드·RFID 등 데이터 수집 기술",
        "시스템 도입 사례 분석"
      ],
      prereqs: ["database-intro"],
      related: ["warehousing"] },
    { id: "integer-programming", year: 3, semester: 1, type: "major", tags: ["or"],
      name: "정수계획법",
      instructor: "홍길동",
      description: "정수 변수가 들어가는 최적화 문제의 모형화와 분지한계법, 절단평면법 등 해법을 배웁니다.",
      prereqs: ["or-1"],
      related: ["or-applied", "or-2"] },
    { id: "port-logistics", year: 3, semester: 1, type: "major", tags: ["scm", "mobility"],
      name: "항만물류론",
      instructor: "홍길동",
      description: [
        "항만의 기능과 컨테이너 터미널 운영",
        "항만 배후단지와 연계 운송",
        "국내외 주요 항만 사례"
      ],
      prereqs: ["logis-intro"],
      related: ["air-logistics"] },
    { id: "short-intern-1", year: 3, semester: 1, type: "major", tags: ["field"],
      name: "물류단기현장실습 I",
      instructor: "홍길동",
      description: "방학 중 물류 기업이나 기관에서 짧은 기간 현장 업무를 경험하고, 배운 내용을 실무와 연결해 봅니다.",
      note: "단기현장실습은 방학 중 개설됩니다.",
      related: ["short-intern-2"] },

    /* ---------- 3학년 2학기 ---------- */
    { id: "freight-transport", year: 3, semester: 2, type: "major", tags: ["scm", "mobility"],
      name: "화물운송론",
      instructor: "홍길동",
      description: [
        "도로·철도·해상·항공 화물운송의 특성",
        "운송수단 선택과 운임 구조",
        "화물운송 시장과 정책"
      ],
      prereqs: ["transport-logis-intro"],
      related: ["delivery-planning"] },
    { id: "scm", year: 3, semester: 2, type: "major", tags: ["scm"],
      name: "공급사슬관리(SCM)",
      instructor: "홍길동",
      description: "원자재 조달에서 최종 고객까지 이어지는 공급사슬을 설계하고 운영하는 원리를 배웁니다. 재고, 정보 공유, 협력 전략이 핵심 주제입니다.",
      prereqs: ["production-service"],
      related: ["logis-network"] },
    { id: "capstone-2", year: 3, semester: 2, type: "major", tags: ["mobility", "field"],
      name: "항공운송 캡스톤디자인 II",
      instructor: "홍길동",
      description: [
        "팀을 이뤄 항공운송 분야의 실제 문제 정의",
        "자료 수집, 분석, 해결안 설계",
        "최종 발표와 보고서"
      ],
      note: "캡스톤디자인 I/II 중 1개 이상 필수 이수.",
      prereqs: ["air-logistics"],
      related: ["capstone-1"] },
    { id: "ai-project-2", year: 3, semester: 2, type: "major", tags: ["data", "field"],
      name: "AI물류융합 프로젝트 II",
      instructor: "홍길동",
      description: "AI 기법을 물류 문제에 적용하는 팀 프로젝트입니다. 문제 정의부터 모델 구현, 결과 발표까지 한 학기 동안 진행합니다.",
      prereqs: ["data-analytics"],
      related: ["ai-project-1"] },
    { id: "green-logistics", year: 3, semester: 2, type: "major", tags: ["scm"],
      name: "그린로지스틱스",
      instructor: "홍길동",
      description: [
        "물류 활동의 탄소배출과 환경 영향",
        "친환경 운송·포장·역물류",
        "ESG와 기업의 대응 사례"
      ],
      prereqs: ["logis-intro"],
      related: ["logis-law-policy", "cold-chain"] },
    { id: "logis-network", year: 3, semester: 2, type: "major", tags: ["scm", "or"],
      name: "물류네트워크론",
      instructor: "홍길동",
      description: "물류 거점의 위치와 수, 거점 간 흐름을 결정하는 네트워크 설계 문제를 모형과 사례로 배웁니다.",
      prereqs: ["or-2"],
      related: ["scm", "delivery-planning"] },
    { id: "logis-accounting", year: 3, semester: 2, type: "major", tags: ["scm"],
      name: "물류관리회계",
      instructor: "홍길동",
      description: [
        "물류비의 구성과 산정 방법",
        "활동기준원가(ABC)와 성과 측정",
        "원가 정보를 이용한 의사결정"
      ],
      related: ["consulting-method", "production-service"] },
    { id: "logis-systems-analysis", year: 3, semester: 2, type: "major", tags: ["scm", "or"],
      name: "물류시스템분석",
      instructor: "홍길동",
      description: "시뮬레이션과 대기행렬 등 분석 도구로 물류 시스템의 성능을 평가하고 개선안을 비교합니다.",
      prereqs: ["or-2", "applied-stats"],
      related: ["logistics-engineering"] },
    { id: "facility-capacity", year: 3, semester: 2, type: "major", tags: ["mobility"],
      name: "교통시설용량분석",
      instructor: "홍길동",
      description: [
        "도로·교차로·터미널의 용량 개념",
        "서비스수준(LOS) 분석 방법",
        "분석 소프트웨어 실습"
      ],
      prereqs: ["traffic-engineering"],
      related: ["facility-operations"] },
    { id: "facility-operations", year: 3, semester: 2, type: "major", tags: ["mobility"],
      name: "교통시설운영론",
      instructor: "홍길동",
      description: "도로, 터미널, 환승시설 등 교통시설을 효율적이고 안전하게 운영하기 위한 기법과 사례를 다룹니다.",
      prereqs: ["traffic-engineering"],
      related: ["facility-capacity"] },
    { id: "airport-planning", year: 3, semester: 2, type: "major", tags: ["mobility"],
      name: "공항계획",
      instructor: "홍길동",
      description: [
        "공항 수요 예측과 시설 규모 산정",
        "활주로·터미널·화물지역 배치",
        "공항 마스터플랜 사례"
      ],
      prereqs: ["transport-planning"],
      related: ["air-logistics"] },
    { id: "short-intern-2", year: 3, semester: 2, type: "major", tags: ["field"],
      name: "물류단기현장실습 II",
      instructor: "홍길동",
      description: "방학 중 물류 현장에서 실무를 경험하는 두 번째 단기 실습입니다. 관심 분야를 좁혀 가는 기회로 활용할 수 있습니다.",
      note: "단기현장실습은 방학 중 개설됩니다.",
      related: ["short-intern-1", "industry-intern-project"] },
    { id: "industry-intern-project", year: 3, semester: 2, type: "major", tags: ["field"],
      name: "산학인턴프로젝트1/2/3",
      instructor: "홍길동",
      description: [
        "기업이 제시한 과제를 인턴으로 참여해 수행",
        "현업 담당자와 지도교수의 공동 지도",
        "결과 보고와 발표"
      ],
      note: "3학년 2학기부터 4학년 1학기까지, 양 학기 개설. 산학인턴프로젝트 1은 방학 중 개설됩니다.",
      related: ["short-intern-2", "long-intern-1"] },

    /* ---------- 4학년 ---------- */
    { id: "long-intern-1", year: 4, semester: 0, type: "major", tags: ["field"],
      name: "물류 장기현장실습 I",
      instructor: "홍길동",
      description: "한 학기 동안 기업에서 근무하며 학점을 인정받는 장기 현장실습입니다. 졸업 전 실무 경험을 쌓고 진로를 확인할 수 있습니다.",
      note: "양 학기 개설.",
      related: ["long-intern-2", "industry-intern-project"] },
    { id: "long-intern-2", year: 4, semester: 0, type: "major", tags: ["field"],
      name: "물류 장기현장실습 II",
      instructor: "홍길동",
      description: [
        "한 학기 단위의 기업 현장 근무",
        "실습 일지와 최종 보고서 제출",
        "장기현장실습 I에 이어 수행 가능"
      ],
      note: "양 학기 개설.",
      related: ["long-intern-1"] },

    { id: "consulting-method", year: 4, semester: 1, type: "major", tags: ["scm"],
      name: "물류컨설팅방법론",
      instructor: "홍길동",
      description: "문제 구조화, 가설 수립, 자료 분석, 보고서 작성 등 물류 컨설팅 프로젝트의 진행 방법을 연습합니다.",
      prereqs: ["scm"],
      related: ["logis-accounting", "business-problem-solving"] },
    { id: "scm-strategy", year: 4, semester: 1, type: "major", tags: ["scm"],
      name: "SCM전략및사례",
      instructor: "홍길동",
      description: [
        "글로벌 기업의 공급사슬 전략 사례",
        "리스크 관리와 회복탄력성",
        "케이스 토론 중심 수업"
      ],
      prereqs: ["scm"],
      related: ["cold-chain"] },
    { id: "capstone-1", year: 4, semester: 1, type: "major", tags: ["mobility", "field"],
      name: "항공운송 캡스톤디자인 I",
      instructor: "홍길동",
      description: "항공운송 분야의 주제를 팀이 직접 정하고 한 학기 동안 해결안을 만들어 발표하는 설계 과목입니다.",
      note: "캡스톤디자인 I/II 중 1개 이상 필수 이수.",
      prereqs: ["air-logistics"],
      related: ["capstone-2"] },
    { id: "ai-project-1", year: 4, semester: 1, type: "major", tags: ["data", "field"],
      name: "AI물류융합 프로젝트 I",
      instructor: "홍길동",
      description: [
        "물류 데이터 기반 AI 모델 기획",
        "수요예측, 경로 추천 등 주제 선정",
        "프로토타입 구현과 시연"
      ],
      prereqs: ["data-analytics"],
      related: ["ai-project-2", "ai-logistics"] },
    { id: "maritime-transport", year: 4, semester: 1, type: "major", tags: ["mobility"],
      name: "해상운송론",
      instructor: "홍길동",
      description: "해운 시장의 구조와 정기선·부정기선 운영, 용선과 운임 등 해상운송의 기본을 다룹니다.",
      prereqs: ["port-logistics"],
      related: ["multimodal"] },
    { id: "ai-logistics", year: 4, semester: 1, type: "major", tags: ["scm", "data"],
      name: "AI와 물류응용",
      instructor: "홍길동",
      description: [
        "머신러닝·딥러닝의 핵심 개념",
        "수요예측, 재고, 배차 등 물류 적용 사례",
        "간단한 모델 구현 실습"
      ],
      prereqs: ["data-analytics"],
      related: ["ai-project-1"] },
    { id: "cold-chain", year: 4, semester: 1, type: "major", tags: ["scm"],
      name: "Smart Cold Chain Management",
      instructor: "홍길동",
      description: "신선식품과 의약품처럼 온도 관리가 필요한 화물의 공급사슬을 다룹니다. 센서와 데이터로 품질을 지키는 방법을 살펴봅니다.",
      prereqs: ["scm"],
      related: ["scm-strategy", "green-logistics"] },
    { id: "logistics-engineering", year: 4, semester: 1, type: "major", tags: ["scm", "or"],
      name: "로지스틱스공학",
      instructor: "홍길동",
      description: [
        "물류 시스템 설계를 위한 공학적 접근",
        "설비 계획, 재고 모형, 운영 최적화",
        "설계 과제 수행"
      ],
      prereqs: ["or-applied", "warehousing"],
      related: ["logis-systems-analysis"] },
    { id: "business-problem-solving", year: 4, semester: 1, type: "major", tags: ["scm", "field"],
      name: "기업문제해결",
      instructor: "홍길동",
      description: "기업이 실제로 겪는 문제를 받아 팀으로 원인을 분석하고 해결안을 제안하는 프로젝트형 과목입니다.",
      related: ["consulting-method"] },

    { id: "multimodal", year: 4, semester: 2, type: "major", tags: ["scm", "mobility"],
      name: "복합운송론",
      instructor: "홍길동",
      description: [
        "두 가지 이상 운송수단을 잇는 복합운송의 구조",
        "국제물류주선업과 운송 서류",
        "주요 복합운송 경로 사례"
      ],
      prereqs: ["freight-transport"],
      related: ["maritime-transport"] },
    { id: "e-logistics", year: 4, semester: 2, type: "major", tags: ["scm", "data"],
      name: "E-로지스틱스",
      instructor: "홍길동",
      description: "전자상거래 물류의 특징과 풀필먼트, 라스트마일 배송, 반품 처리 등 온라인 유통을 뒷받침하는 물류를 배웁니다.",
      prereqs: ["logis-info-systems"],
      related: ["iot-logistics"] },
    { id: "logis-practice", year: 4, semester: 2, type: "major", tags: ["scm", "field"],
      name: "물류실무및사례",
      instructor: "홍길동",
      description: [
        "현업 실무자 특강과 사례 연구",
        "물류 직무별 업무 이해",
        "취업 준비와 연결되는 실무 지식"
      ],
      related: ["logis-innovation"] },
    { id: "delivery-planning", year: 4, semester: 2, type: "major", tags: ["mobility", "or"],
      name: "수배송계획론",
      instructor: "홍길동",
      description: "차량경로문제(VRP)를 중심으로 배차와 배송 경로를 계획하는 모형과 해법을 다룹니다.",
      prereqs: ["integer-programming"],
      related: ["freight-transport", "logis-network"] },
    { id: "iot-logistics", year: 4, semester: 2, type: "major", tags: ["scm", "data"],
      name: "IoT기반융합 물류기술",
      instructor: "홍길동",
      description: [
        "센서, RFID, 위치 추적 기술의 원리",
        "창고·운송 현장의 IoT 적용 사례",
        "간단한 데이터 수집 실습"
      ],
      prereqs: ["logis-info-systems"],
      related: ["e-logistics", "logistics-4"] },
    { id: "logistics-4", year: 4, semester: 2, type: "major", tags: ["scm", "data"],
      name: "물류4.0기술과 기업가정신",
      instructor: "홍길동",
      description: "자동화, 로봇, 디지털 트윈 등 물류 4.0 기술을 살펴보고 이를 바탕으로 한 창업 아이디어를 기획해 봅니다.",
      related: ["logis-innovation", "iot-logistics"] }
  ]
};
