import { prisma } from "@/server/db/prisma";
import {
  UserRole,
  UserStatus,
  JobStatus,
  BudgetType,
  ProposalStatus,
  ContractStatus,
  MilestoneStatus,
  LedgerType,
  DisputeStatus,
} from "@prisma/client";
import argon2 from "argon2";
import crypto from "node:crypto";

const DEMO_PASSWORD = process.env.SEED_PASSWORD ?? "WorkNestDemo!2026";

interface CategorySeedDef {
  name: string;
  slug: string;
  children?: Array<{ name: string; slug: string }>;
}

const CATEGORY_TAXONOMY: CategorySeedDef[] = [
  {
    name: "Engineering & Architecture",
    slug: "engineering-architecture",
    children: [
      { name: "Full-Stack Web Development", slug: "full-stack-web-development" },
      { name: "Frontend Development", slug: "frontend-development" },
      { name: "Backend Development & APIs", slug: "backend-development-apis" },
      { name: "Mobile Development (iOS & Android)", slug: "mobile-development" },
      { name: "Cloud Infrastructure & DevOps", slug: "cloud-devops" },
      { name: "AI, Machine Learning & LLMs", slug: "ai-ml-llms" },
      { name: "Database Engineering & Architecture", slug: "database-engineering" },
      { name: "Cybersecurity & SecOps", slug: "cybersecurity-secops" },
      { name: "Blockchain & Smart Contracts", slug: "blockchain-smart-contracts" },
      { name: "QA Automation & Testing", slug: "qa-automation-testing" },
      { name: "Embedded Systems & IoT", slug: "embedded-systems-iot" },
    ],
  },
  {
    name: "Design & Creative Direction",
    slug: "design-creative",
    children: [
      { name: "UI/UX & Product Design", slug: "ui-ux-product-design" },
      { name: "Design Systems & Component Libraries", slug: "design-systems" },
      { name: "Brand Identity & Visual Design", slug: "brand-identity" },
      { name: "3D Modeling & Motion Graphics", slug: "3d-motion-graphics" },
      { name: "User Research & Usability Testing", slug: "user-research" },
      { name: "Mobile App UI/UX", slug: "mobile-app-design" },
      { name: "Web & Landing Page Design", slug: "web-landing-page-design" },
      { name: "Illustration & Graphic Arts", slug: "illustration-graphic-arts" },
    ],
  },
  {
    name: "Product & Project Management",
    slug: "product-management",
    children: [
      { name: "Technical Product Management (TPM)", slug: "technical-product-management" },
      { name: "Agile Scrum & Delivery Coaching", slug: "agile-scrum-coaching" },
      { name: "Fractional CTO & Tech Advisory", slug: "fractional-cto" },
      { name: "Product Discovery & Strategy", slug: "product-strategy" },
      { name: "Product Operations & Metrics", slug: "product-operations" },
    ],
  },
  {
    name: "Data Science & AI Analytics",
    slug: "data-science-ai",
    children: [
      { name: "Machine Learning Engineering", slug: "machine-learning-engineering" },
      { name: "Data Engineering & ETL Pipelines", slug: "data-engineering-etl" },
      { name: "Business Intelligence & Dashboards", slug: "business-intelligence" },
      { name: "NLP & Conversational AI", slug: "nlp-conversational-ai" },
      { name: "Computer Vision & Image Processing", slug: "computer-vision" },
      { name: "Predictive Analytics & Statistics", slug: "predictive-analytics" },
    ],
  },
  {
    name: "Growth, Marketing & SEO",
    slug: "growth-marketing-seo",
    children: [
      { name: "Technical SEO & Web Performance", slug: "technical-seo" },
      { name: "Performance Marketing & Paid Media", slug: "performance-marketing" },
      { name: "Content Strategy & Technical Copywriting", slug: "content-strategy" },
      { name: "Developer Relations (DevRel)", slug: "devrel" },
      { name: "Conversion Rate Optimization (CRO)", slug: "conversion-rate-optimization" },
      { name: "Email Automation & Lifecycle", slug: "email-lifecycle-automation" },
    ],
  },
  {
    name: "Writing & Technical Documentation",
    slug: "writing-translation",
    children: [
      { name: "API Documentation & Developer Guides", slug: "api-documentation" },
      { name: "Technical Whitepapers & Reports", slug: "technical-whitepapers" },
      { name: "UX Writing & Microcopy", slug: "ux-writing" },
      { name: "Localization & Technical Translation", slug: "localization-translation" },
    ],
  },
  {
    name: "Finance, Legal & Operations",
    slug: "finance-operations",
    children: [
      { name: "FinTech Compliance & Regulatory", slug: "fintech-compliance" },
      { name: "Financial Modeling & Valuation", slug: "financial-modeling" },
      { name: "Contract Engineering & IP Protection", slug: "contract-engineering" },
      { name: "Workflow Automation & No-Code Ops", slug: "workflow-automation" },
    ],
  },
  {
    name: "Support & Customer Experience",
    slug: "support-customer-experience",
    children: [
      { name: "Technical Customer Support (L2/L3)", slug: "technical-customer-support" },
      { name: "Customer Success & Onboarding", slug: "customer-success-onboarding" },
    ],
  },
];

// Flat fallback/legacy categories for backwards compatibility
const LEGACY_CATEGORIES = [
  { name: "Web Development", slug: "web-development" },
  { name: "Design", slug: "design" },
  { name: "Writing", slug: "writing" },
  { name: "Marketing", slug: "marketing" },
  { name: "Data Science", slug: "data-science" },
  { name: "Admin Support", slug: "admin-support" },
];

const SKILLS = [
  // Languages & Core Runtimes
  { name: "TypeScript", slug: "typescript" },
  { name: "JavaScript", slug: "javascript" },
  { name: "Python", slug: "python" },
  { name: "Go (Golang)", slug: "golang" },
  { name: "Rust", slug: "rust" },
  { name: "Java", slug: "java" },
  { name: "Kotlin", slug: "kotlin" },
  { name: "Swift", slug: "swift" },
  { name: "C++", slug: "cpp" },
  { name: "C#", slug: "csharp" },
  { name: "PHP", slug: "php" },
  { name: "Ruby", slug: "ruby" },
  { name: "SQL", slug: "sql" },
  { name: "Solidity", slug: "solidity" },
  { name: "HTML5", slug: "html5" },
  { name: "CSS3", slug: "css3" },

  // Frontend Frameworks & Libraries
  { name: "React", slug: "react" },
  { name: "Next.js", slug: "nextjs" },
  { name: "Vue.js", slug: "vuejs" },
  { name: "Nuxt.js", slug: "nuxtjs" },
  { name: "Svelte", slug: "svelte" },
  { name: "SvelteKit", slug: "sveltekit" },
  { name: "Angular", slug: "angular" },
  { name: "Remix", slug: "remix" },
  { name: "Astro", slug: "astro" },
  { name: "Tailwind CSS", slug: "tailwindcss" },
  { name: "Radix UI", slug: "radix-ui" },
  { name: "Shadcn UI", slug: "shadcn-ui" },
  { name: "Framer Motion", slug: "framer-motion" },
  { name: "Three.js", slug: "threejs" },
  { name: "Redux Toolkit", slug: "redux-toolkit" },
  { name: "Zustand", slug: "zustand" },
  { name: "TanStack Query", slug: "tanstack-query" },
  { name: "TanStack Table", slug: "tanstack-table" },
  { name: "WebSockets", slug: "websockets" },
  { name: "WebRTC", slug: "webrtc" },
  { name: "PWA (Progressive Web Apps)", slug: "pwa" },

  // Backend, Frameworks & APIs
  { name: "Node.js", slug: "nodejs" },
  { name: "Express", slug: "express" },
  { name: "NestJS", slug: "nestjs" },
  { name: "FastAPI", slug: "fastapi" },
  { name: "Django", slug: "django" },
  { name: "Flask", slug: "flask" },
  { name: "Ruby on Rails", slug: "rails" },
  { name: "Spring Boot", slug: "spring-boot" },
  { name: "ASP.NET Core", slug: "aspnet-core" },
  { name: "Laravel", slug: "laravel" },
  { name: "GraphQL", slug: "graphql" },
  { name: "REST APIs", slug: "rest-apis" },
  { name: "gRPC", slug: "grpc" },
  { name: "Microservices", slug: "microservices" },
  { name: "Apache Kafka", slug: "apache-kafka" },
  { name: "RabbitMQ", slug: "rabbitmq" },
  { name: "Redis", slug: "redis" },
  { name: "Celery", slug: "celery" },
  { name: "BullMQ", slug: "bullmq" },
  { name: "Stripe API", slug: "stripe-api" },
  { name: "Stripe Connect", slug: "stripe-connect" },
  { name: "Payment Gateways", slug: "payment-gateways" },

  // Databases & ORMs
  { name: "PostgreSQL", slug: "postgresql" },
  { name: "MySQL", slug: "mysql" },
  { name: "MongoDB", slug: "mongodb" },
  { name: "SQLite", slug: "sqlite" },
  { name: "Supabase", slug: "supabase" },
  { name: "Prisma", slug: "prisma" },
  { name: "Drizzle ORM", slug: "drizzle-orm" },
  { name: "TypeORM", slug: "typeorm" },
  { name: "Elasticsearch", slug: "elasticsearch" },
  { name: "DynamoDB", slug: "dynamodb" },
  { name: "ClickHouse", slug: "clickhouse" },
  { name: "Neo4j", slug: "neo4j" },
  { name: "CockroachDB", slug: "cockroachdb" },

  // Cloud, DevOps & Infrastructure
  { name: "AWS (Amazon Web Services)", slug: "aws" },
  { name: "Google Cloud Platform (GCP)", slug: "gcp" },
  { name: "Microsoft Azure", slug: "azure" },
  { name: "Docker", slug: "docker" },
  { name: "Kubernetes", slug: "kubernetes" },
  { name: "Terraform", slug: "terraform" },
  { name: "GitHub Actions", slug: "github-actions" },
  { name: "GitLab CI", slug: "gitlab-ci" },
  { name: "Vercel", slug: "vercel" },
  { name: "Cloudflare Workers", slug: "cloudflare-workers" },
  { name: "Linux Server Admin", slug: "linux-admin" },
  { name: "Nginx", slug: "nginx" },
  { name: "Prometheus", slug: "prometheus" },
  { name: "Grafana", slug: "grafana" },
  { name: "Datadog", slug: "datadog" },
  { name: "CI/CD Pipelines", slug: "ci-cd-pipelines" },

  // Mobile Engineering
  { name: "React Native", slug: "react-native" },
  { name: "Flutter", slug: "flutter" },
  { name: "iOS Development", slug: "ios-development" },
  { name: "Android Development", slug: "android-development" },
  { name: "SwiftUI", slug: "swiftui" },
  { name: "Jetpack Compose", slug: "jetpack-compose" },
  { name: "Expo", slug: "expo" },

  // AI, ML & LLMs
  { name: "PyTorch", slug: "pytorch" },
  { name: "TensorFlow", slug: "tensorflow" },
  { name: "OpenAI API", slug: "openai-api" },
  { name: "Anthropic Claude API", slug: "claude-api" },
  { name: "Google Gemini API", slug: "gemini-api" },
  { name: "LangChain", slug: "langchain" },
  { name: "LlamaIndex", slug: "llamaindex" },
  { name: "Hugging Face", slug: "hugging-face" },
  { name: "RAG Architecture", slug: "rag-architecture" },
  { name: "Vector Databases", slug: "vector-databases" },
  { name: "Pinecone", slug: "pinecone" },
  { name: "Prompt Engineering", slug: "prompt-engineering" },
  { name: "Pandas", slug: "pandas" },
  { name: "Scikit-Learn", slug: "scikit-learn" },
  { name: "Snowflake", slug: "snowflake" },
  { name: "Databricks", slug: "databricks" },
  { name: "BigQuery", slug: "bigquery" },

  // UI/UX & Design
  { name: "Figma", slug: "figma" },
  { name: "UI Design", slug: "ui-design" },
  { name: "UX Research", slug: "ux-research" },
  { name: "Design Systems", slug: "design-systems-skill" },
  { name: "Interactive Prototyping", slug: "interactive-prototyping" },
  { name: "Adobe Illustrator", slug: "adobe-illustrator" },
  { name: "Adobe Photoshop", slug: "adobe-photoshop" },
  { name: "Blender 3D", slug: "blender-3d" },
  { name: "Motion Graphics", slug: "motion-graphics" },
  { name: "Accessibility (WCAG 2.1)", slug: "accessibility-wcag" },
  { name: "Responsive Web Design", slug: "responsive-web-design" },

  // QA, Testing & Security
  { name: "Vitest", slug: "vitest" },
  { name: "Jest", slug: "jest" },
  { name: "Playwright", slug: "playwright" },
  { name: "Cypress", slug: "cypress" },
  { name: "Unit Testing", slug: "unit-testing" },
  { name: "Integration Testing", slug: "integration-testing" },
  { name: "End-to-End (E2E) Testing", slug: "e2e-testing" },
  { name: "Penetration Testing", slug: "penetration-testing" },
  { name: "SOC 2 Compliance", slug: "soc-2" },
  { name: "OAuth 2.0 & OIDC", slug: "oauth2" },

  // Product, Growth & Marketing
  { name: "Agile Scrum", slug: "agile-scrum" },
  { name: "Kanban", slug: "kanban" },
  { name: "Jira", slug: "jira" },
  { name: "Linear", slug: "linear" },
  { name: "Technical Writing", slug: "technical-writing" },
  { name: "Copywriting", slug: "copywriting" },
  { name: "SEO (Search Engine Optimization)", slug: "seo" },
  { name: "Core Web Vitals", slug: "core-web-vitals" },
  { name: "Conversion Rate Optimization (CRO)", slug: "cro" },
  { name: "PostHog", slug: "posthog" },
  { name: "Mixpanel", slug: "mixpanel" },
  { name: "Google Analytics 4", slug: "ga4" },
];

async function hashPassword(pwd: string) {
  return argon2.hash(pwd, {
    type: argon2.argon2id,
    memoryCost: 19456,
    timeCost: 2,
    parallelism: 1,
  });
}

export async function seedDatabase() {
  let categoriesCount = 0;

  // 1. Seed Parent Categories & Child Subcategories
  for (const parentDef of CATEGORY_TAXONOMY) {
    const parent = await prisma.category.upsert({
      where: { slug: parentDef.slug },
      update: { name: parentDef.name, parentId: null },
      create: { name: parentDef.name, slug: parentDef.slug, parentId: null },
    });
    categoriesCount++;

    if (parentDef.children && parentDef.children.length > 0) {
      for (const childDef of parentDef.children) {
        await prisma.category.upsert({
          where: { slug: childDef.slug },
          update: { name: childDef.name, parentId: parent.id },
          create: { name: childDef.name, slug: childDef.slug, parentId: parent.id },
        });
        categoriesCount++;
      }
    }
  }

  // 1b. Upsert legacy categories
  for (const legacy of LEGACY_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: legacy.slug },
      update: { name: legacy.name },
      create: { name: legacy.name, slug: legacy.slug },
    });
    categoriesCount++;
  }

  // 2. Seed Skills
  for (const skill of SKILLS) {
    await prisma.skill.upsert({
      where: { slug: skill.slug },
      update: { name: skill.name },
      create: skill,
    });
  }

  const passwordHash = await hashPassword(DEMO_PASSWORD);

  // Helper to upsert user
  async function upsertDemoUser(input: { email: string; name: string; roles: UserRole[] }) {
    return prisma.user.upsert({
      where: { email: input.email },
      update: {
        name: input.name,
        roles: input.roles,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        passwordHash,
        deletedAt: null,
      },
      create: {
        email: input.email,
        name: input.name,
        roles: input.roles,
        status: UserStatus.ACTIVE,
        emailVerifiedAt: new Date(),
        passwordHash,
        timezone: "UTC",
        country: "US",
      },
    });
  }

  // 3. Demo Personas
  const admin = await upsertDemoUser({
    email: "admin@worknest.dev",
    name: "WorkWasl Admin",
    roles: [UserRole.ADMIN],
  });

  const client1 = await upsertDemoUser({
    email: "client@worknest.dev",
    name: "Ava Client",
    roles: [UserRole.CLIENT],
  });

  const client2 = await upsertDemoUser({
    email: "client.acme@worknest.dev",
    name: "Acme Technologies",
    roles: [UserRole.CLIENT],
  });

  const freelancer1 = await upsertDemoUser({
    email: "freelancer@worknest.dev",
    name: "Noah Freelancer",
    roles: [UserRole.FREELANCER],
  });

  const freelancer2 = await upsertDemoUser({
    email: "freelancer.alex@worknest.dev",
    name: "Alex Rivera",
    roles: [UserRole.FREELANCER],
  });

  // Also support @workwasl.com aliases
  await upsertDemoUser({
    email: "admin@workwasl.com",
    name: "WorkWasl Admin",
    roles: [UserRole.ADMIN],
  });

  await upsertDemoUser({
    email: "client@workwasl.com",
    name: "Ava Client",
    roles: [UserRole.CLIENT],
  });

  await upsertDemoUser({
    email: "freelancer@workwasl.com",
    name: "Noah Freelancer",
    roles: [UserRole.FREELANCER],
  });

  // Client Profiles with Enhanced Fields
  await prisma.clientProfile.upsert({
    where: { userId: client1.id },
    update: {
      companyName: "Vanguard Digital Lab",
      website: "https://vanguarddigital.io",
      companySize: "11-50 (Series A)",
      industry: "Fintech & Payments",
      about: "Engineering verifiable escrow contracts and dual-persona talent marketplaces.",
      linkedinUrl: "https://linkedin.com/company/vanguarddigital",
    },
    create: {
      userId: client1.id,
      companyName: "Vanguard Digital Lab",
      website: "https://vanguarddigital.io",
      companySize: "11-50 (Series A)",
      industry: "Fintech & Payments",
      about: "Engineering verifiable escrow contracts and dual-persona talent marketplaces.",
      linkedinUrl: "https://linkedin.com/company/vanguarddigital",
      paymentVerified: true,
    },
  });

  await prisma.clientProfile.upsert({
    where: { userId: client2.id },
    update: {
      companyName: "Acme Cloud Technologies",
      website: "https://acmecloud.dev",
      companySize: "51-200 (Series B)",
      industry: "SaaS & Developer Tools",
      about: "Next-generation developer productivity platforms and real-time infrastructure.",
      linkedinUrl: "https://linkedin.com/company/acmecloud",
    },
    create: {
      userId: client2.id,
      companyName: "Acme Cloud Technologies",
      website: "https://acmecloud.dev",
      companySize: "51-200 (Series B)",
      industry: "SaaS & Developer Tools",
      about: "Next-generation developer productivity platforms and real-time infrastructure.",
      linkedinUrl: "https://linkedin.com/company/acmecloud",
      paymentVerified: true,
    },
  });

  // Freelancer Profiles with Enhanced Fields and Custom Tags
  await prisma.freelancerProfile.upsert({
    where: { userId: freelancer1.id },
    update: {
      headline: "Senior Full-Stack & Escrow Architect",
      bio: "10+ years architecting high-throughput distributed applications with Next.js 15, TypeScript, PostgreSQL, and Stripe Connect.",
      hourlyRateCents: 9500,
      currency: "USD",
      availability: "AVAILABLE",
      experienceLevel: "EXPERT",
      yearsOfExperience: 8,
      englishProficiency: "NATIVE",
      tags: [
        "microservices",
        "fintech",
        "stripe-connect",
        "nextjs15",
        "escrow-protocol",
        "high-throughput",
      ],
      githubUrl: "https://github.com/noah-freelancer",
      linkedinUrl: "https://linkedin.com/in/noah-freelancer",
      websiteUrl: "https://noah-engineer.dev",
    },
    create: {
      userId: freelancer1.id,
      headline: "Senior Full-Stack & Escrow Architect",
      bio: "10+ years architecting high-throughput distributed applications with Next.js 15, TypeScript, PostgreSQL, and Stripe Connect.",
      hourlyRateCents: 9500,
      currency: "USD",
      availability: "AVAILABLE",
      experienceLevel: "EXPERT",
      yearsOfExperience: 8,
      englishProficiency: "NATIVE",
      tags: [
        "microservices",
        "fintech",
        "stripe-connect",
        "nextjs15",
        "escrow-protocol",
        "high-throughput",
      ],
      githubUrl: "https://github.com/noah-freelancer",
      linkedinUrl: "https://linkedin.com/in/noah-freelancer",
      websiteUrl: "https://noah-engineer.dev",
    },
  });

  await prisma.freelancerProfile.upsert({
    where: { userId: freelancer2.id },
    update: {
      headline: "Staff UI/UX & Design Systems Engineer",
      bio: "Specializing in design systems, accessible Figma tokens, Tailwind CSS v4, and web animation with Framer Motion.",
      hourlyRateCents: 11000,
      currency: "USD",
      availability: "AVAILABLE",
      experienceLevel: "EXPERT",
      yearsOfExperience: 7,
      englishProficiency: "FLUENT",
      tags: [
        "design-systems",
        "figma-tokens",
        "tailwind-v4",
        "framer-motion",
        "wcag-accessibility",
      ],
      githubUrl: "https://github.com/alex-rivera-design",
      linkedinUrl: "https://linkedin.com/in/alexrivera-ux",
      websiteUrl: "https://alexrivera.design",
    },
    create: {
      userId: freelancer2.id,
      headline: "Staff UI/UX & Design Systems Engineer",
      bio: "Specializing in design systems, accessible Figma tokens, Tailwind CSS v4, and web animation with Framer Motion.",
      hourlyRateCents: 11000,
      currency: "USD",
      availability: "AVAILABLE",
      experienceLevel: "EXPERT",
      yearsOfExperience: 7,
      englishProficiency: "FLUENT",
      tags: [
        "design-systems",
        "figma-tokens",
        "tailwind-v4",
        "framer-motion",
        "wcag-accessibility",
      ],
      githubUrl: "https://github.com/alex-rivera-design",
      linkedinUrl: "https://linkedin.com/in/alexrivera-ux",
      websiteUrl: "https://alexrivera.design",
    },
  });

  // Attach key skills to freelancers
  const seededSkills = await prisma.skill.findMany();
  const skillMap = new Map(seededSkills.map((s) => [s.slug, s.id]));

  const freelancer1Skills = [
    "typescript",
    "nextjs",
    "react",
    "postgresql",
    "nodejs",
    "microservices",
  ];
  for (const sSlug of freelancer1Skills) {
    const sId = skillMap.get(sSlug);
    if (sId) {
      await prisma.freelancerSkill.upsert({
        where: { freelancerId_skillId: { freelancerId: freelancer1.id, skillId: sId } },
        update: {},
        create: { freelancerId: freelancer1.id, skillId: sId },
      });
    }
  }

  const freelancer2Skills = ["figma", "ui-design", "ux-research", "tailwindcss", "react"];
  for (const sSlug of freelancer2Skills) {
    const sId = skillMap.get(sSlug);
    if (sId) {
      await prisma.freelancerSkill.upsert({
        where: { freelancerId_skillId: { freelancerId: freelancer2.id, skillId: sId } },
        update: {},
        create: { freelancerId: freelancer2.id, skillId: sId },
      });
    }
  }

  // Portfolio items for Noah (freelancer1)
  await prisma.portfolioItem.deleteMany({ where: { freelancerId: freelancer1.id } });
  await prisma.portfolioItem.createMany({
    data: [
      {
        freelancerId: freelancer1.id,
        title: "Enterprise Multi-Tenant Escrow Ledger Engine",
        description:
          "Architected a double-entry ledger platform with row-level locks, zero-knowledge audit trails, and Stripe Connect webhook idempotency processing over $12M annually.",
        url: "https://github.com/noah-freelancer/escrow-vault",
        imageUrl:
          "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80",
      },
      {
        freelancerId: freelancer1.id,
        title: "Real-Time Distributed Collaboration Suite",
        description:
          "Engineered a high-concurrency CRDT collaboration engine with Next.js 15, WebSockets, and Redis pub/sub supporting 25,000+ simultaneous connected clients.",
        url: "https://noah-engineer.dev/projects/crdt-canvas",
        imageUrl:
          "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=800&q=80",
      },
    ],
  });

  // Portfolio items for Alex (freelancer2)
  await prisma.portfolioItem.deleteMany({ where: { freelancerId: freelancer2.id } });
  await prisma.portfolioItem.createMany({
    data: [
      {
        freelancerId: freelancer2.id,
        title: "Fintech Design System 2.0 with Token Studio",
        description:
          "Comprehensive multi-brand design system in Figma with WCAG AAA contrast tokens, automated Tailwind export, and 60+ accessible component specifications.",
        url: "https://alexrivera.design/work/fintech-tokens",
        imageUrl:
          "https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?auto=format&fit=crop&w=800&q=80",
      },
    ],
  });

  // Platform Settings
  await prisma.platformSetting.upsert({
    where: { key: "platform_fee_bps" },
    update: { value: 1000 },
    create: { key: "platform_fee_bps", value: 1000 },
  });

  await prisma.platformSetting.upsert({
    where: { key: "auto_approve_days" },
    update: { value: 14 },
    create: { key: "auto_approve_days", value: 14 },
  });

  await prisma.platformSetting.upsert({
    where: { key: "unfunded_contract_cancel_days" },
    update: { value: 7 },
    create: { key: "unfunded_contract_cancel_days", value: 7 },
  });

  await prisma.platformSetting.upsert({
    where: { key: "settlement_currency" },
    update: { value: "USD" },
    create: { key: "settlement_currency", value: "USD" },
  });

  await prisma.platformSetting.upsert({
    where: { key: "settlement_currency_symbol" },
    update: { value: "$" },
    create: { key: "settlement_currency_symbol", value: "$" },
  });

  await prisma.platformSetting.upsert({
    where: { key: "accepted_currencies" },
    update: { value: "USD" },
    create: { key: "accepted_currencies", value: "USD" },
  });

  // -------------------------------------------------------------
  // 4. End-to-End Marketplace Flow Dummy Data
  // -------------------------------------------------------------
  const allCategories = await prisma.category.findMany();
  const engCat =
    allCategories.find((c) => c.slug === "engineering-architecture") ?? allCategories[0];
  const designCat = allCategories.find((c) => c.slug === "design-creative") ?? allCategories[0];
  const dataCat = allCategories.find((c) => c.slug === "data-science-ai") ?? allCategories[0];

  const skillTs = skillMap.get("typescript");
  const skillNext = skillMap.get("nextjs");
  const skillPg = skillMap.get("postgresql");
  const skillReact = skillMap.get("react");
  const skillFigma = skillMap.get("figma");
  const skillTailwind = skillMap.get("tailwindcss");
  const skillPython = skillMap.get("python");
  const skillDocker = skillMap.get("docker");
  const skillK8s = skillMap.get("kubernetes");
  const skillAws = skillMap.get("aws");
  const skillTerraform = skillMap.get("terraform");
  const skillSolidity = skillMap.get("solidity");
  const skillFlutter = skillMap.get("flutter");
  const skillReactNative = skillMap.get("react-native");
  const skillFastApi = skillMap.get("fastapi");

  // JOB 1: Active In-Progress Architecture Job (Client 1: Ava)
  const job1Id = "00000000-0000-0000-0000-000000000001";
  const job1 = await prisma.job.upsert({
    where: { id: job1Id },
    update: {
      status: JobStatus.IN_PROGRESS,
      proposalsCount: 2,
    },
    create: {
      id: job1Id,
      clientId: client1.id,
      categoryId: engCat?.id,
      title: "Next.js 15 & PostgreSQL Escrow Marketplace Architecture",
      description:
        "Architect and implement an escrow-backed freelance marketplace with flat $1 platform fees, real-time SSE messaging, and double-entry accounting ledger.",
      budgetType: BudgetType.FIXED,
      budgetMinCents: 150000,
      budgetMaxCents: 150000,
      currency: "USD",
      experienceLevel: "EXPERT",
      duration: "1 to 3 months",
      scope: "LARGE",
      timeCommitment: "FULL_TIME",
      deliverables:
        "PostgreSQL schema with row locks, milestone escrow release flow, SSE chat, and automated audit ledger.",
      screeningQuestions: [
        "Have you built double-entry accounting ledgers or Stripe Connect marketplaces?",
        "Can you provide links to production Next.js App Router repositories?",
      ],
      status: JobStatus.IN_PROGRESS,
      proposalsCount: 2,
      dedupeHash: crypto.createHash("sha256").update(`job1-${client1.id}`).digest("hex"),
      publishedAt: new Date(Date.now() - 14 * 86400000),
    },
  });

  if (skillTs) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job1.id, skillId: skillTs } },
      update: {},
      create: { jobId: job1.id, skillId: skillTs },
    });
  }
  if (skillNext) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job1.id, skillId: skillNext } },
      update: {},
      create: { jobId: job1.id, skillId: skillNext },
    });
  }
  if (skillPg) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job1.id, skillId: skillPg } },
      update: {},
      create: { jobId: job1.id, skillId: skillPg },
    });
  }

  // JOB 2: Completed Design System Job (Client 2: Acme Tech)
  const job2Id = "00000000-0000-0000-0000-000000000002";
  const job2 = await prisma.job.upsert({
    where: { id: job2Id },
    update: {
      status: JobStatus.COMPLETED,
      proposalsCount: 1,
    },
    create: {
      id: job2Id,
      clientId: client2.id,
      categoryId: designCat?.id,
      title: "Design System, Figma Component Tokens & WCAG UI Kit",
      description:
        "Develop an enterprise-grade accessible design system in Figma with Tailwind CSS v4 component tokens and dark mode support.",
      budgetType: BudgetType.FIXED,
      budgetMinCents: 200000,
      budgetMaxCents: 200000,
      currency: "USD",
      experienceLevel: "EXPERT",
      duration: "Less than 1 month",
      scope: "MEDIUM",
      status: JobStatus.COMPLETED,
      proposalsCount: 1,
      dedupeHash: crypto.createHash("sha256").update(`job2-${client2.id}`).digest("hex"),
      publishedAt: new Date(Date.now() - 30 * 86400000),
    },
  });

  if (skillFigma) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job2.id, skillId: skillFigma } },
      update: {},
      create: { jobId: job2.id, skillId: skillFigma },
    });
  }
  if (skillTailwind) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job2.id, skillId: skillTailwind } },
      update: {},
      create: { jobId: job2.id, skillId: skillTailwind },
    });
  }

  // JOB 3: Open Job with Competing Proposals for Comparison Matrix (Client 2: Acme Tech)
  const job3Id = "00000000-0000-0000-0000-000000000003";
  const job3 = await prisma.job.upsert({
    where: { id: job3Id },
    update: {
      status: JobStatus.OPEN,
      proposalsCount: 2,
    },
    create: {
      id: job3Id,
      clientId: client2.id,
      categoryId: dataCat?.id,
      title: "Full-Stack AI Copilot & Real-Time Prompt Engineering",
      description:
        "We need a senior full-stack AI engineer to build our real-time copilot assisting clients and freelancers in scoping milestone deliverables.",
      budgetType: BudgetType.FIXED,
      budgetMinCents: 350000,
      budgetMaxCents: 350000,
      currency: "USD",
      experienceLevel: "EXPERT",
      duration: "1 to 3 months",
      scope: "LARGE",
      status: JobStatus.OPEN,
      proposalsCount: 2,
      dedupeHash: crypto.createHash("sha256").update(`job3-${client2.id}`).digest("hex"),
      publishedAt: new Date(Date.now() - 3 * 86400000),
    },
  });

  if (skillReact) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job3.id, skillId: skillReact } },
      update: {},
      create: { jobId: job3.id, skillId: skillReact },
    });
  }

  // JOB 4: Disputed Job for Admin Arbitration (Client 1: Ava)
  const job4Id = "00000000-0000-0000-0000-000000000004";
  const job4 = await prisma.job.upsert({
    where: { id: job4Id },
    update: {
      status: JobStatus.IN_PROGRESS,
      proposalsCount: 1,
    },
    create: {
      id: job4Id,
      clientId: client1.id,
      categoryId: engCat?.id,
      title: "High-Frequency Crypto Payment Settlement Webhooks",
      description:
        "Build an idempotent webhook dispatcher and settlement verifier for external crypto payment rails.",
      budgetType: BudgetType.FIXED,
      budgetMinCents: 80000,
      budgetMaxCents: 80000,
      currency: "USD",
      experienceLevel: "INTERMEDIATE",
      status: JobStatus.IN_PROGRESS,
      proposalsCount: 1,
      dedupeHash: crypto.createHash("sha256").update(`job4-${client1.id}`).digest("hex"),
      publishedAt: new Date(Date.now() - 20 * 86400000),
    },
  });

  // JOB 5: Real-Time Collaborative Canvas (Client 1: Ava)
  const job5Id = "00000000-0000-0000-0000-000000000005";
  const job5 = await prisma.job.upsert({
    where: { id: job5Id },
    update: { status: JobStatus.OPEN },
    create: {
      id: job5Id,
      clientId: client1.id,
      categoryId: engCat?.id,
      title: "Real-Time Collaborative Whiteboard Canvas with WebSockets",
      description:
        "Looking for an expert Next.js and WebSockets engineer to build a multi-cursor interactive whiteboard canvas with live state synchronisation and conflict-free replicated data types (CRDTs).",
      budgetType: BudgetType.FIXED,
      budgetMinCents: 420000,
      budgetMaxCents: 420000,
      currency: "USD",
      experienceLevel: "EXPERT",
      duration: "1 to 3 months",
      scope: "MEDIUM",
      status: JobStatus.OPEN,
      proposalsCount: 0,
      dedupeHash: crypto.createHash("sha256").update(`job5-${client1.id}`).digest("hex"),
      publishedAt: new Date(Date.now() - 5 * 3600000),
    },
  });
  if (skillTs) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job5.id, skillId: skillTs } },
      update: {},
      create: { jobId: job5.id, skillId: skillTs },
    });
  }
  if (skillNext) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job5.id, skillId: skillNext } },
      update: {},
      create: { jobId: job5.id, skillId: skillNext },
    });
  }
  if (skillReact) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job5.id, skillId: skillReact } },
      update: {},
      create: { jobId: job5.id, skillId: skillReact },
    });
  }

  // JOB 6: LangChain RAG Pipeline (Client 2: Acme Cloud)
  const job6Id = "00000000-0000-0000-0000-000000000006";
  const job6 = await prisma.job.upsert({
    where: { id: job6Id },
    update: { status: JobStatus.OPEN },
    create: {
      id: job6Id,
      clientId: client2.id,
      categoryId: dataCat?.id,
      title: "LangChain RAG Pipeline with FastAPI & Pinecone Vector Store",
      description:
        "Develop an enterprise retrieval-augmented generation (RAG) backend utilizing LangChain, FastAPI, and Pinecone. Must support hybrid semantic search and strict streaming response limits.",
      budgetType: BudgetType.HOURLY,
      budgetMinCents: 8500,
      budgetMaxCents: 12000,
      currency: "USD",
      experienceLevel: "EXPERT",
      duration: "3 to 6 months",
      scope: "LARGE",
      status: JobStatus.OPEN,
      proposalsCount: 0,
      dedupeHash: crypto.createHash("sha256").update(`job6-${client2.id}`).digest("hex"),
      publishedAt: new Date(Date.now() - 12 * 3600000),
    },
  });
  if (skillPython) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job6.id, skillId: skillPython } },
      update: {},
      create: { jobId: job6.id, skillId: skillPython },
    });
  }
  if (skillFastApi) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job6.id, skillId: skillFastApi } },
      update: {},
      create: { jobId: job6.id, skillId: skillFastApi },
    });
  }
  if (skillDocker) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job6.id, skillId: skillDocker } },
      update: {},
      create: { jobId: job6.id, skillId: skillDocker },
    });
  }

  // JOB 7: Flutter Mobile Crypto Wallet (Client 1: Ava)
  const job7Id = "00000000-0000-0000-0000-000000000007";
  const job7 = await prisma.job.upsert({
    where: { id: job7Id },
    update: { status: JobStatus.OPEN },
    create: {
      id: job7Id,
      clientId: client1.id,
      categoryId: engCat?.id,
      title: "Cross-Platform Flutter Mobile Crypto Wallet with Biometrics",
      description:
        "Build a sleek iOS and Android wallet app using Flutter. Features include biometric key storage (Secure Enclave / KeyStore), offline QR code signing, and native push notifications.",
      budgetType: BudgetType.FIXED,
      budgetMinCents: 650000,
      budgetMaxCents: 650000,
      currency: "USD",
      experienceLevel: "EXPERT",
      duration: "1 to 3 months",
      scope: "LARGE",
      status: JobStatus.OPEN,
      proposalsCount: 0,
      dedupeHash: crypto.createHash("sha256").update(`job7-${client1.id}`).digest("hex"),
      publishedAt: new Date(Date.now() - 24 * 3600000),
    },
  });
  if (skillFlutter) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job7.id, skillId: skillFlutter } },
      update: {},
      create: { jobId: job7.id, skillId: skillFlutter },
    });
  }
  if (skillTs) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job7.id, skillId: skillTs } },
      update: {},
      create: { jobId: job7.id, skillId: skillTs },
    });
  }

  // JOB 8: Fintech Design System in Figma (Client 2: Acme Cloud)
  const job8Id = "00000000-0000-0000-0000-000000000008";
  const job8 = await prisma.job.upsert({
    where: { id: job8Id },
    update: { status: JobStatus.OPEN },
    create: {
      id: job8Id,
      clientId: client2.id,
      categoryId: designCat?.id,
      title: "Fintech SaaS Design System & Interactive Prototypes in Figma",
      description:
        "Create an accessible, comprehensive Figma design system with variables, auto-layout 5.0, dark/light token sets, and micro-interaction prototypes for modern escrow dashboards.",
      budgetType: BudgetType.FIXED,
      budgetMinCents: 380000,
      budgetMaxCents: 380000,
      currency: "USD",
      experienceLevel: "INTERMEDIATE",
      duration: "Less than 1 month",
      scope: "MEDIUM",
      status: JobStatus.OPEN,
      proposalsCount: 0,
      dedupeHash: crypto.createHash("sha256").update(`job8-${client2.id}`).digest("hex"),
      publishedAt: new Date(Date.now() - 36 * 3600000),
    },
  });
  if (skillFigma) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job8.id, skillId: skillFigma } },
      update: {},
      create: { jobId: job8.id, skillId: skillFigma },
    });
  }
  if (skillTailwind) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job8.id, skillId: skillTailwind } },
      update: {},
      create: { jobId: job8.id, skillId: skillTailwind },
    });
  }

  // JOB 9: Kubernetes GitOps CI/CD (Client 2: Acme Cloud)
  const job9Id = "00000000-0000-0000-0000-000000000009";
  const job9 = await prisma.job.upsert({
    where: { id: job9Id },
    update: { status: JobStatus.OPEN },
    create: {
      id: job9Id,
      clientId: client2.id,
      categoryId: engCat?.id,
      title: "Kubernetes Cluster GitOps CI/CD with Terraform & AWS EKS",
      description:
        "Provision a production-grade multi-region AWS EKS cluster with Terraform, ArgoCD GitOps pipelines, Helm charts, Datadog observability, and zero-downtime blue/green rollouts.",
      budgetType: BudgetType.HOURLY,
      budgetMinCents: 9000,
      budgetMaxCents: 13000,
      currency: "USD",
      experienceLevel: "EXPERT",
      duration: "3 to 6 months",
      scope: "LARGE",
      status: JobStatus.OPEN,
      proposalsCount: 0,
      dedupeHash: crypto.createHash("sha256").update(`job9-${client2.id}`).digest("hex"),
      publishedAt: new Date(Date.now() - 48 * 3600000),
    },
  });
  if (skillK8s) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job9.id, skillId: skillK8s } },
      update: {},
      create: { jobId: job9.id, skillId: skillK8s },
    });
  }
  if (skillTerraform) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job9.id, skillId: skillTerraform } },
      update: {},
      create: { jobId: job9.id, skillId: skillTerraform },
    });
  }
  if (skillAws) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job9.id, skillId: skillAws } },
      update: {},
      create: { jobId: job9.id, skillId: skillAws },
    });
  }
  if (skillDocker) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job9.id, skillId: skillDocker } },
      update: {},
      create: { jobId: job9.id, skillId: skillDocker },
    });
  }

  // JOB 10: Stripe Connect Custom Marketplace Onboarding (Client 1: Ava)
  const job10Id = "00000000-0000-0000-0000-000000000010";
  const job10 = await prisma.job.upsert({
    where: { id: job10Id },
    update: { status: JobStatus.OPEN },
    create: {
      id: job10Id,
      clientId: client1.id,
      categoryId: engCat?.id,
      title: "Stripe Connect Custom Marketplace Onboarding & Split Payouts",
      description:
        "Implement custom account onboarding, verification webhooks, 1099 compliance checks, and split payout transfers with escrow milestone holds via Stripe Connect API.",
      budgetType: BudgetType.FIXED,
      budgetMinCents: 500000,
      budgetMaxCents: 500000,
      currency: "USD",
      experienceLevel: "EXPERT",
      duration: "1 to 3 months",
      scope: "MEDIUM",
      status: JobStatus.OPEN,
      proposalsCount: 0,
      dedupeHash: crypto.createHash("sha256").update(`job10-${client1.id}`).digest("hex"),
      publishedAt: new Date(Date.now() - 60 * 3600000),
    },
  });
  if (skillTs) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job10.id, skillId: skillTs } },
      update: {},
      create: { jobId: job10.id, skillId: skillTs },
    });
  }
  if (skillPg) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job10.id, skillId: skillPg } },
      update: {},
      create: { jobId: job10.id, skillId: skillPg },
    });
  }
  if (skillNext) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job10.id, skillId: skillNext } },
      update: {},
      create: { jobId: job10.id, skillId: skillNext },
    });
  }

  // JOB 11: Solidity Escrow Smart Contract (Client 1: Ava)
  const job11Id = "00000000-0000-0000-0000-000000000011";
  const job11 = await prisma.job.upsert({
    where: { id: job11Id },
    update: { status: JobStatus.OPEN },
    create: {
      id: job11Id,
      clientId: client1.id,
      categoryId: engCat?.id,
      title: "Smart Contract Solidity Escrow Vault with Formal Verification",
      description:
        "Audit and optimize our multi-sig EVM escrow smart contract with timelocks, dispute arbitrator callbacks, reentrancy guards, and formal verification tests with Foundry.",
      budgetType: BudgetType.FIXED,
      budgetMinCents: 750000,
      budgetMaxCents: 750000,
      currency: "USD",
      experienceLevel: "EXPERT",
      duration: "1 to 3 months",
      scope: "LARGE",
      status: JobStatus.OPEN,
      proposalsCount: 0,
      dedupeHash: crypto.createHash("sha256").update(`job11-${client1.id}`).digest("hex"),
      publishedAt: new Date(Date.now() - 72 * 3600000),
    },
  });
  if (skillSolidity) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job11.id, skillId: skillSolidity } },
      update: {},
      create: { jobId: job11.id, skillId: skillSolidity },
    });
  }
  if (skillTs) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job11.id, skillId: skillTs } },
      update: {},
      create: { jobId: job11.id, skillId: skillTs },
    });
  }

  // JOB 12: Offline-First React Native App (Client 2: Acme Cloud)
  const job12Id = "00000000-0000-0000-0000-000000000012";
  const job12 = await prisma.job.upsert({
    where: { id: job12Id },
    update: { status: JobStatus.OPEN },
    create: {
      id: job12Id,
      clientId: client2.id,
      categoryId: engCat?.id,
      title: "React Native Offline-First Field Service Technician App",
      description:
        "Engineer an offline-first mobile app using React Native, WatermelonDB (SQLite), and background delta sync for field technicians operating in low-connectivity areas.",
      budgetType: BudgetType.FIXED,
      budgetMinCents: 580000,
      budgetMaxCents: 580000,
      currency: "USD",
      experienceLevel: "EXPERT",
      duration: "1 to 3 months",
      scope: "LARGE",
      status: JobStatus.OPEN,
      proposalsCount: 0,
      dedupeHash: crypto.createHash("sha256").update(`job12-${client2.id}`).digest("hex"),
      publishedAt: new Date(Date.now() - 84 * 3600000),
    },
  });
  if (skillReactNative) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job12.id, skillId: skillReactNative } },
      update: {},
      create: { jobId: job12.id, skillId: skillReactNative },
    });
  }
  if (skillTs) {
    await prisma.jobSkill.upsert({
      where: { jobId_skillId: { jobId: job12.id, skillId: skillTs } },
      update: {},
      create: { jobId: job12.id, skillId: skillTs },
    });
  }

  // PROPOSALS
  // Proposal 1 on Job 1 (Noah) -> Accepted into Contract 1
  const prop1Id = "10000000-0000-0000-0000-000000000001";
  const prop1 = await prisma.proposal.upsert({
    where: { jobId_freelancerId: { jobId: job1.id, freelancerId: freelancer1.id } },
    update: { status: ProposalStatus.ACCEPTED },
    create: {
      id: prop1Id,
      jobId: job1.id,
      freelancerId: freelancer1.id,
      coverLetter:
        "Hi Ava,\n\nI have over 8 years of experience building secure transactional marketplaces with Next.js 15, PostgreSQL row-level locks, and Stripe Connect. My proposal includes a 3-milestone breakdown with double-entry ledger audits and real-time SSE chat rooms.",
      bidCents: 150000,
      currency: "USD",
      estimatedDays: 14,
      status: ProposalStatus.ACCEPTED,
    },
  });

  // Proposal 2 on Job 1 (Alex) -> Submitted
  await prisma.proposal.upsert({
    where: { jobId_freelancerId: { jobId: job1.id, freelancerId: freelancer2.id } },
    update: { status: ProposalStatus.SUBMITTED },
    create: {
      id: "10000000-0000-0000-0000-000000000002",
      jobId: job1.id,
      freelancerId: freelancer2.id,
      coverLetter:
        "Hi Ava,\n\nI can deliver the front-end architecture and UI workflow components adhering to WCAG 2.1 AA standards and Tailwind CSS v4.",
      bidCents: 160000,
      currency: "USD",
      estimatedDays: 18,
      status: ProposalStatus.SUBMITTED,
    },
  });

  // Proposal 3 on Job 2 (Alex) -> Accepted into Contract 2
  const prop3Id = "10000000-0000-0000-0000-000000000003";
  const prop3 = await prisma.proposal.upsert({
    where: { jobId_freelancerId: { jobId: job2.id, freelancerId: freelancer2.id } },
    update: { status: ProposalStatus.ACCEPTED },
    create: {
      id: prop3Id,
      jobId: job2.id,
      freelancerId: freelancer2.id,
      coverLetter:
        "Hi Acme team,\n\nI specialize in scalable design systems with multi-brand Figma tokens, accessible color contrasts, and production React component libraries.",
      bidCents: 200000,
      currency: "USD",
      estimatedDays: 10,
      status: ProposalStatus.ACCEPTED,
    },
  });

  // Proposal 4 on Job 3 (Noah) -> Shortlisted (for Comparison Matrix)
  await prisma.proposal.upsert({
    where: { jobId_freelancerId: { jobId: job3.id, freelancerId: freelancer1.id } },
    update: { status: ProposalStatus.SHORTLISTED },
    create: {
      id: "10000000-0000-0000-0000-000000000004",
      jobId: job3.id,
      freelancerId: freelancer1.id,
      coverLetter:
        "Experienced full-stack engineer ready to implement conversational LLM pipelines with Gemini 2.5 and streaming edge runtimes.",
      bidCents: 340000,
      currency: "USD",
      estimatedDays: 21,
      status: ProposalStatus.SHORTLISTED,
    },
  });

  // Proposal 5 on Job 3 (Alex) -> Submitted (for Comparison Matrix)
  await prisma.proposal.upsert({
    where: { jobId_freelancerId: { jobId: job3.id, freelancerId: freelancer2.id } },
    update: { status: ProposalStatus.SUBMITTED },
    create: {
      id: "10000000-0000-0000-0000-000000000005",
      jobId: job3.id,
      freelancerId: freelancer2.id,
      coverLetter:
        "Product-focused UI engineer with experience designing interactive AI prompts and workflow assistants.",
      bidCents: 360000,
      currency: "USD",
      estimatedDays: 25,
      status: ProposalStatus.SUBMITTED,
    },
  });

  // Proposal 6 on Job 4 (Alex) -> Accepted into Disputed Contract
  const prop6Id = "10000000-0000-0000-0000-000000000006";
  const prop6 = await prisma.proposal.upsert({
    where: { jobId_freelancerId: { jobId: job4.id, freelancerId: freelancer2.id } },
    update: { status: ProposalStatus.ACCEPTED },
    create: {
      id: prop6Id,
      jobId: job4.id,
      freelancerId: freelancer2.id,
      coverLetter: "I can build the webhook dispatch handler and testing harness.",
      bidCents: 80000,
      currency: "USD",
      estimatedDays: 7,
      status: ProposalStatus.ACCEPTED,
    },
  });

  // CONTRACTS
  // Contract 1: Active In-Progress (Ava Client & Noah Freelancer)
  const contract1Id = "20000000-0000-0000-0000-000000000001";
  const m1Id = "30000000-0000-0000-0000-000000000001";
  const m2Id = "30000000-0000-0000-0000-000000000002";
  const m3Id = "30000000-0000-0000-0000-000000000003";

  const [contract1, m1] = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("SET CONSTRAINTS ALL DEFERRED;").catch(() => {});

    const c1 = await tx.contract.upsert({
      where: { proposalId: prop1.id },
      update: {
        totalCents: 150000n,
        currency: "USD",
        status: ContractStatus.ACTIVE,
      },
      create: {
        id: contract1Id,
        jobId: job1.id,
        proposalId: prop1.id,
        clientId: client1.id,
        freelancerId: freelancer1.id,
        totalCents: 150000n,
        currency: "USD",
        platformFeeBps: 1000,
        clientFeeCents: 100n,
        freelancerFeeCents: 100n,
        feePolicyVersion: "v1_flat_1_dollar",
        clientFeeCharged: true,
        freelancerFeeCharged: false,
        status: ContractStatus.ACTIVE,
        startedAt: new Date(Date.now() - 10 * 86400000),
      },
    });

    // Ensure clean milestone set matching contract total
    await tx.milestone.deleteMany({
      where: {
        contractId: c1.id,
        id: { notIn: [m1Id, m2Id, m3Id] },
      },
    });

    const milestone1 = await tx.milestone.upsert({
      where: { id: m1Id },
      update: {
        status: MilestoneStatus.RELEASED,
        amountCents: 50000n,
      },
      create: {
        id: m1Id,
        contractId: c1.id,
        position: 1,
        title: "Architecture & Database Schema Design",
        description:
          "PostgreSQL schema with row-level locks, audit log triggers, and double-entry ledger constraints.",
        amountCents: 50000n,
        status: MilestoneStatus.RELEASED,
        dueDate: new Date(Date.now() - 5 * 86400000),
        submittedAt: new Date(Date.now() - 4 * 86400000),
        approvedAt: new Date(Date.now() - 3 * 86400000),
        releasedAt: new Date(Date.now() - 3 * 86400000),
      },
    });

    await tx.milestone.upsert({
      where: { id: m2Id },
      update: {
        status: MilestoneStatus.FUNDED,
        amountCents: 50000n,
      },
      create: {
        id: m2Id,
        contractId: c1.id,
        position: 2,
        title: "Real-Time Messaging & Workroom Channels",
        description:
          "Server-Sent Events (SSE) stream, optimistic chat composer, and unread counter badges.",
        amountCents: 50000n,
        status: MilestoneStatus.FUNDED,
        dueDate: new Date(Date.now() + 7 * 86400000),
      },
    });

    await tx.milestone.upsert({
      where: { id: m3Id },
      update: {
        status: MilestoneStatus.PENDING,
        amountCents: 50000n,
      },
      create: {
        id: m3Id,
        contractId: c1.id,
        position: 3,
        title: "Double-Entry Ledger & Stripe Settlement",
        description:
          "Immutable transaction logs, automated settlement payouts, and financial reconciliation audit.",
        amountCents: 50000n,
        status: MilestoneStatus.PENDING,
        dueDate: new Date(Date.now() + 18 * 86400000),
      },
    });

    return [c1, milestone1] as const;
  });

  // Ledger Entries for Contract 1
  await prisma.ledgerEntry.upsert({
    where: { idempotencyKey: `seed-fund-${contract1.id}` },
    update: {},
    create: {
      type: LedgerType.ESCROW_FUND,
      contractId: contract1.id,
      userId: client1.id,
      amountCents: 100000n,
      currency: "USD",
      idempotencyKey: `seed-fund-${contract1.id}`,
      providerRef: "pi_demo_escrow_100000",
      createdAt: new Date(Date.now() - 10 * 86400000),
    },
  });

  await prisma.ledgerEntry.upsert({
    where: { idempotencyKey: `seed-client-fee-${contract1.id}` },
    update: {},
    create: {
      type: LedgerType.PLATFORM_FEE,
      contractId: contract1.id,
      userId: client1.id,
      amountCents: 100n,
      currency: "USD",
      idempotencyKey: `seed-client-fee-${contract1.id}`,
      providerRef: "ch_demo_fee_client_100",
      createdAt: new Date(Date.now() - 10 * 86400000),
    },
  });

  await prisma.ledgerEntry.upsert({
    where: { idempotencyKey: `seed-release-${m1.id}` },
    update: {},
    create: {
      type: LedgerType.ESCROW_RELEASE,
      contractId: contract1.id,
      milestoneId: m1.id,
      userId: freelancer1.id,
      amountCents: 49900n,
      currency: "USD",
      idempotencyKey: `seed-release-${m1.id}`,
      providerRef: "tr_demo_release_m1_49900",
      createdAt: new Date(Date.now() - 3 * 86400000),
    },
  });

  await prisma.ledgerEntry.upsert({
    where: { idempotencyKey: `seed-freelancer-fee-${contract1.id}` },
    update: {},
    create: {
      type: LedgerType.PLATFORM_FEE,
      contractId: contract1.id,
      milestoneId: m1.id,
      userId: freelancer1.id,
      amountCents: 100n,
      currency: "USD",
      idempotencyKey: `seed-freelancer-fee-${contract1.id}`,
      providerRef: "ch_demo_fee_freelancer_100",
      createdAt: new Date(Date.now() - 3 * 86400000),
    },
  });

  // Conversation 1 & Messages (Contract 1: Ava & Noah)
  const conv1 = await prisma.conversation.upsert({
    where: {
      jobId_clientId_freelancerId: {
        jobId: job1.id,
        clientId: client1.id,
        freelancerId: freelancer1.id,
      },
    },
    update: { contractId: contract1.id },
    create: {
      jobId: job1.id,
      contractId: contract1.id,
      clientId: client1.id,
      freelancerId: freelancer1.id,
      lastMessageAt: new Date(Date.now() - 15 * 60000),
    },
  });

  const chatMessages1 = [
    {
      senderId: client1.id,
      body: "Hi Noah, excited to kick off the escrow architecture! Milestone 1 has been funded in full.",
      offsetMs: 4 * 86400000,
      read: true,
    },
    {
      senderId: freelancer1.id,
      body: "Thanks Ava! I have reviewed the PRD and set up the PostgreSQL schema with row-level locks and double-entry ledger constraints.",
      offsetMs: 3.5 * 86400000,
      read: true,
    },
    {
      senderId: freelancer1.id,
      body: "Milestone 1 is ready and code has been pushed. Please review the deliverable files on the staging branch.",
      offsetMs: 3.1 * 86400000,
      read: true,
    },
    {
      senderId: client1.id,
      body: "Approved and released! The flat $1 fee model works cleanly on the official invoice. Moving on to Milestone 2.",
      offsetMs: 3 * 86400000,
      read: true,
    },
    {
      senderId: freelancer1.id,
      body: "Received! Milestone 2 (Real-Time SSE Messaging & Workroom Channels) is currently in active development.",
      offsetMs: 1 * 86400000,
      read: true,
    },
    {
      senderId: client1.id,
      body: "Sounds great. Let me know once the preview branch is ready for an interactive test.",
      offsetMs: 15 * 60000,
      read: false, // Unread so badge shows in nav
    },
  ];

  for (let i = 0; i < chatMessages1.length; i++) {
    const item = chatMessages1[i];
    const clientMsgId = `40000000-0000-0000-0001-${String(i + 1).padStart(12, "0")}`;
    await prisma.message.upsert({
      where: {
        conversationId_senderId_clientMsgId: {
          conversationId: conv1.id,
          senderId: item.senderId,
          clientMsgId,
        },
      },
      update: {},
      create: {
        conversationId: conv1.id,
        senderId: item.senderId,
        body: item.body,
        clientMsgId,
        readAt: item.read ? new Date(Date.now() - item.offsetMs + 60000) : null,
        createdAt: new Date(Date.now() - item.offsetMs),
      },
    });
  }

  // Contract 2: Completed Contract (Acme Tech & Alex Rivera)
  const contract2Id = "20000000-0000-0000-0000-000000000002";
  const c2m1Id = "30000000-0000-0000-0000-000000000004";
  const c2m2Id = "30000000-0000-0000-0000-000000000005";

  const contract2 = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("SET CONSTRAINTS ALL DEFERRED;").catch(() => {});

    const c2 = await tx.contract.upsert({
      where: { proposalId: prop3.id },
      update: {
        totalCents: 200000n,
        currency: "USD",
        status: ContractStatus.COMPLETED,
      },
      create: {
        id: contract2Id,
        jobId: job2.id,
        proposalId: prop3.id,
        clientId: client2.id,
        freelancerId: freelancer2.id,
        totalCents: 200000n,
        currency: "USD",
        platformFeeBps: 1000,
        clientFeeCents: 100n,
        freelancerFeeCents: 100n,
        feePolicyVersion: "v1_flat_1_dollar",
        clientFeeCharged: true,
        freelancerFeeCharged: true,
        status: ContractStatus.COMPLETED,
        startedAt: new Date(Date.now() - 25 * 86400000),
        completedAt: new Date(Date.now() - 2 * 86400000),
      },
    });

    await tx.milestone.deleteMany({
      where: {
        contractId: c2.id,
        id: { notIn: [c2m1Id, c2m2Id] },
      },
    });

    await tx.milestone.upsert({
      where: { id: c2m1Id },
      update: {
        status: MilestoneStatus.RELEASED,
        amountCents: 100000n,
      },
      create: {
        id: c2m1Id,
        contractId: c2.id,
        position: 1,
        title: "Figma Component Tokens & Color Scales",
        amountCents: 100000n,
        status: MilestoneStatus.RELEASED,
        dueDate: new Date(Date.now() - 15 * 86400000),
        submittedAt: new Date(Date.now() - 14 * 86400000),
        approvedAt: new Date(Date.now() - 13 * 86400000),
        releasedAt: new Date(Date.now() - 13 * 86400000),
      },
    });

    await tx.milestone.upsert({
      where: { id: c2m2Id },
      update: {
        status: MilestoneStatus.RELEASED,
        amountCents: 100000n,
      },
      create: {
        id: c2m2Id,
        contractId: c2.id,
        position: 2,
        title: "Tailwind CSS Components & Accessibility Testing",
        amountCents: 100000n,
        status: MilestoneStatus.RELEASED,
        dueDate: new Date(Date.now() - 5 * 86400000),
        submittedAt: new Date(Date.now() - 3 * 86400000),
        approvedAt: new Date(Date.now() - 2 * 86400000),
        releasedAt: new Date(Date.now() - 2 * 86400000),
      },
    });

    return c2;
  });

  // Review on Milestone Release for Contract 1 (Noah)
  await prisma.review.upsert({
    where: { contractId_reviewerId: { contractId: contract1.id, reviewerId: client1.id } },
    update: {},
    create: {
      contractId: contract1.id,
      reviewerId: client1.id,
      revieweeId: freelancer1.id,
      rating: 5,
      comment:
        "Noah is a world-class architect. Milestone 1 was delivered ahead of schedule with bulletproof double-entry ledger constraints and impeccable documentation.",
    },
  });
  await prisma.review.upsert({
    where: { contractId_reviewerId: { contractId: contract2.id, reviewerId: client2.id } },
    update: {},
    create: {
      contractId: contract2.id,
      reviewerId: client2.id,
      revieweeId: freelancer2.id,
      rating: 5,
      comment:
        "Alex provided world-class design systems work. Highly responsive, prompt delivery, and immaculate tokens.",
    },
  });

  await prisma.review.upsert({
    where: { contractId_reviewerId: { contractId: contract2.id, reviewerId: freelancer2.id } },
    update: {},
    create: {
      contractId: contract2.id,
      reviewerId: freelancer2.id,
      revieweeId: client2.id,
      rating: 5,
      comment:
        "Great working with Acme Tech. Clear vision, prompt milestone funding, and clear feedback throughout the project.",
    },
  });

  // Conversation 2 (Contract 2: Acme & Alex)
  const conv2 = await prisma.conversation.upsert({
    where: {
      jobId_clientId_freelancerId: {
        jobId: job2.id,
        clientId: client2.id,
        freelancerId: freelancer2.id,
      },
    },
    update: { contractId: contract2.id },
    create: {
      jobId: job2.id,
      contractId: contract2.id,
      clientId: client2.id,
      freelancerId: freelancer2.id,
      lastMessageAt: new Date(Date.now() - 2 * 86400000),
    },
  });

  const conv2ClientMsgId = "40000000-0000-0000-0002-000000000001";
  await prisma.message.upsert({
    where: {
      conversationId_senderId_clientMsgId: {
        conversationId: conv2.id,
        senderId: client2.id,
        clientMsgId: conv2ClientMsgId,
      },
    },
    update: {},
    create: {
      conversationId: conv2.id,
      senderId: client2.id,
      body: "Thanks Alex! All components look gorgeous and passed our accessibility audits.",
      clientMsgId: conv2ClientMsgId,
      readAt: new Date(Date.now() - 2 * 86400000),
      createdAt: new Date(Date.now() - 2 * 86400000),
    },
  });

  // Contract 3: Disputed Contract for Admin Arbitration (Client 1: Ava & Alex Rivera)
  const contract3Id = "20000000-0000-0000-0000-000000000003";
  const c3m1Id = "30000000-0000-0000-0000-000000000006";

  const [contract3, c3m1] = await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe("SET CONSTRAINTS ALL DEFERRED;").catch(() => {});

    const c3 = await tx.contract.upsert({
      where: { proposalId: prop6.id },
      update: {
        totalCents: 80000n,
        currency: "USD",
        status: ContractStatus.DISPUTED,
      },
      create: {
        id: contract3Id,
        jobId: job4.id,
        proposalId: prop6.id,
        clientId: client1.id,
        freelancerId: freelancer2.id,
        totalCents: 80000n,
        currency: "USD",
        platformFeeBps: 1000,
        clientFeeCents: 100n,
        freelancerFeeCents: 100n,
        feePolicyVersion: "v1_flat_1_dollar",
        clientFeeCharged: true,
        freelancerFeeCharged: false,
        status: ContractStatus.DISPUTED,
        startedAt: new Date(Date.now() - 15 * 86400000),
      },
    });

    await tx.milestone.deleteMany({
      where: {
        contractId: c3.id,
        id: { notIn: [c3m1Id] },
      },
    });

    const m = await tx.milestone.upsert({
      where: { id: c3m1Id },
      update: {
        status: MilestoneStatus.DISPUTED,
        amountCents: 80000n,
      },
      create: {
        id: c3m1Id,
        contractId: c3.id,
        position: 1,
        title: "Webhook Handler Implementation",
        amountCents: 80000n,
        status: MilestoneStatus.DISPUTED,
        dueDate: new Date(Date.now() - 2 * 86400000),
        submittedAt: new Date(Date.now() - 1 * 86400000),
      },
    });

    return [c3, m] as const;
  });

  // Dispute for Contract 3
  const existingDispute = await prisma.dispute.findFirst({
    where: { contractId: contract3.id },
  });
  if (!existingDispute) {
    await prisma.dispute.create({
      data: {
        contractId: contract3.id,
        milestoneId: c3m1.id,
        openedById: client1.id,
        reason:
          "Webhook signature verification failed to reject malformed replay attacks during stress testing.",
        status: DisputeStatus.OPEN,
      },
    });
  }

  // IN-APP NOTIFICATIONS
  await prisma.notification.createMany({
    data: [
      {
        userId: freelancer1.id,
        type: "ESCROW_FUNDED",
        payload: {
          contractId: contract1.id,
          amount: "$500.00",
          title: "Milestone 2 Funded into Escrow",
        },
      },
      {
        userId: client1.id,
        type: "NEW_PROPOSAL",
        payload: {
          jobId: job3.id,
          freelancerName: "Noah Freelancer",
          title: "New Proposal Received",
        },
      },
      {
        userId: admin.id,
        type: "DISPUTE_OPENED",
        payload: {
          contractId: contract3.id,
          title: "New Dispute Awaiting Arbitration",
        },
      },
    ],
    skipDuplicates: true,
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      action: "SEED_COMPLETED",
      entityType: "platform",
      metadata: {
        users: [admin.email, client1.email, client2.email, freelancer1.email, freelancer2.email],
        categoriesCount,
        skillsCount: SKILLS.length,
      },
    },
  });

  return {
    categoriesSeeded: categoriesCount,
    skillsSeeded: SKILLS.length,
    seededUsers: [
      admin.email,
      client1.email,
      client2.email,
      freelancer1.email,
      freelancer2.email,
      "admin@workwasl.com",
      "client@workwasl.com",
      "freelancer@workwasl.com",
    ],
    jobsSeeded: 4,
    proposalsSeeded: 6,
    contractsSeeded: 3,
    milestonesSeeded: 6,
    conversationsSeeded: 2,
    demoPassword: DEMO_PASSWORD,
  };
}
