export const blogGroups = [
  {
    id: "engineering",
    title: { ko: "엔지니어링", en: "Engineering" },
    description: {
      ko: "웹 프런트엔드와 제품 개발에 대한 기록",
      en: "Notes on frontend and product development",
    },
  },
  {
    id: "craft",
    title: { ko: "디자인/크래프트", en: "Design & Craft" },
    description: {
      ko: "인터페이스, 타이포그래피, 경험 설계",
      en: "Interfaces, typography, and experience design",
    },
  },
];

export const blogCategories = [
  {
    id: "react",
    groupId: "engineering",
    title: { ko: "React", en: "React" },
  },
  {
    id: "architecture",
    groupId: "engineering",
    title: { ko: "아키텍처", en: "Architecture" },
  },
  {
    id: "visual",
    groupId: "craft",
    title: { ko: "비주얼", en: "Visual" },
  },
  {
    id: "writing",
    groupId: "craft",
    title: { ko: "글쓰기", en: "Writing" },
  }
];

export const blogPosts = [
  {
    id: "post-001",
    groupId: "engineering",
    categoryId: "react",
    title: { ko: "포트폴리오 베이스 구조", en: "Portfolio Base Structure" },
    excerpt: {
      ko: "폴더 구조와 컴포넌트 책임을 간단히 정리했습니다.",
      en: "A short guide to folder structure and component responsibilities.",
    },
    date: "2026-02-09",
    tags: ["react", "architecture"],
    content: {
      ko: [
        "포트폴리오 사이트는 확장 가능한 구조를 먼저 잡아두는 게 좋습니다.",
        "라우팅, 다국어, 데이터 모델을 분리하면 이후에 콘텐츠만 추가해도 전체가 정리됩니다.",
      ],
      en: [
        "A portfolio site benefits from a structure that stays clean as it grows.",
        "Separating routing, i18n, and content models makes content expansion painless.",
      ],
    },
  },
  {
    id: "post-002",
    groupId: "engineering",
    categoryId: "architecture",
    title: { ko: "데이터 중심 블로그 설계", en: "Data-Driven Blog Design" },
    excerpt: {
      ko: "그룹/카테고리/포스트를 데이터로 관리하는 방법.",
      en: "Managing groups, categories, and posts as data.",
    },
    date: "2026-02-07",
    tags: ["content"],
    content: {
      ko: [
        "블로그를 코드에서 데이터로 분리하면 콘텐츠 확장이 쉬워집니다.",
        "D1이나 CMS로 옮길 때도 동일한 스키마를 유지할 수 있습니다.",
      ],
      en: [
        "Separating the blog into data makes scaling content much easier.",
        "The same schema can later live in D1 or a CMS without refactoring UI.",
      ],
    },
  },
  {
    id: "post-003",
    groupId: "craft",
    categoryId: "visual",
    title: { ko: "타이포그래피 기본 세팅", en: "Typography Baseline" },
    excerpt: {
      ko: "폰트 선택과 계층 구조를 어떻게 잡았는지.",
      en: "Choosing fonts and defining a typographic hierarchy.",
    },
    date: "2026-02-05",
    tags: ["design"],
    content: {
      ko: [
        "기본 템플릿은 특정 분위기를 고정하지 않으면서도 명확한 톤을 제공합니다.",
        "여기서는 Sans + Serif 조합으로 대비감을 만들었습니다.",
      ],
      en: [
        "The base template keeps the tone neutral but intentional.",
        "A Sans + Serif pairing adds contrast without overpowering content.",
      ],
    },
  }
];

export const getLatestPosts = (count = 3) =>
  [...blogPosts]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, count);
