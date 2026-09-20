/**
 * Proficiency + roadmap ordering layered on top of src/data/topics.js.
 * Kept separate so topics.js stays the plain manifest the dashboard needs.
 *
 * proficiency: 1 familiar · 2 working · 3 proficient · 4 strong · 5 expert
 */
import {topics, categories, topicsByCategory} from './topics';

const PROFICIENCY = {
  playwright: {level: 5, note: 'Primary E2E stack; frameworks, CI, sharding'},
  selenium: {level: 4, note: 'Grid, legacy suites, migrations off it'},
  appium: {level: 3, note: 'Native + hybrid mobile automation'},
  'cucumber-bdd': {level: 4, note: 'Gherkin, step design, living docs'},
  'robot-framework': {level: 3, note: 'Keyword-driven suites'},
  'rest-assured': {level: 4, note: 'API contract + integration suites'},
  postman: {level: 4, note: 'Collections, Newman in CI'},
  jmeter: {level: 3, note: 'Load profiles, distributed runs'},
  java: {level: 4, note: 'Automation tooling, framework code'},
  junit: {level: 4, note: 'JUnit 5, extensions, parameterisation'},
  testng: {level: 4, note: 'Suites, groups, parallelism'},
  sql: {level: 4, note: 'Query, test data, verification'},
  'test-automation-tooling-landscape': {level: 4, note: 'Tool selection + strategy'},
  'playwright-cross-browser-testing': {level: 5, note: 'Projects, device matrix'},

  kubernetes: {level: 4, note: 'Workloads, probes, debugging'},
  aws: {level: 3, note: 'Core services, IAM, cost basics'},
  terraform: {level: 3, note: 'Modules, state, plan review'},
  'cloud-infrastructure': {level: 3, note: 'Landing zones, networking'},
  'ci-cd-pipelines': {level: 4, note: 'GH Actions, gates, artifacts'},
  'linux-administration': {level: 4, note: 'Processes, systemd, storage'},
  'system-performance': {level: 3, note: 'USE method, profiling'},
  'networking-fundamentals': {level: 3, note: 'TCP/TLS/DNS, tcpdump'},
  'observability-grafana-prometheus': {level: 4, note: 'PromQL, dashboards, alerts'},
  opentelemetry: {level: 3, note: 'Traces, spans, collectors'},
  'incident-response-mastery': {level: 4, note: 'IC role, postmortems'},
  'chaos-engineering': {level: 3, note: 'Game days, hypothesis testing'},
  'mcp-ai-agents': {level: 3, note: 'Tool servers, agent wiring'},
  'ai-assisted-engineering-workflows': {level: 4, note: 'Daily driver for tooling work'},
  'sre-observability-slos': {level: 4, note: 'SLI/SLO/error budgets'},

  python: {level: 4, note: 'Tooling, scripting, pytest'},
  git: {level: 4, note: 'Rebase, bisect, recovery'},
  docker: {level: 4, note: 'Images, compose, multi-stage'},
  'clean-architecture': {level: 3, note: 'Boundaries, dependency rule'},

  'using-claude': {level: 4, note: 'Prompting, projects, Claude Code'},
  kiro: {level: 2, note: 'Spec-driven agent IDE'},

  'leadership-for-sdet-managers': {level: 3, note: 'Scenarios, coaching'},
  'manager-response-library': {level: 3, note: 'Playbook responses'},
  'quality-engineering-leadership-playbook': {level: 3, note: 'QE org strategy'},
  'team-organizational-leadership': {level: 3, note: 'Org design, conflict'},
  'executive-communication-influence': {level: 3, note: 'Exec presence, alignment'},
  'engineering-governance-operations': {level: 3, note: 'Budget, capacity'},
  'business-analytics-strategic-consulting': {level: 2, note: 'Frameworks, modelling'},
  'technical-product-management-product-strategy': {level: 3, note: 'Discovery, north-star'},
};

/** topics enriched with proficiency (defaults to 2 / "working"). */
export const skillTopics = topics.map((t) => ({
  ...t,
  proficiency: PROFICIENCY[t.id]?.level ?? 2,
  proficiencyNote: PROFICIENCY[t.id]?.note ?? '',
}));

export function skillsByCategory(key) {
  return skillTopics
    .filter((t) => t.category === key)
    .sort((a, b) => b.proficiency - a.proficiency);
}

/**
 * Roadmap tiers per category — a suggested order to learn things in.
 * Any topic not listed falls into "intermediate".
 */
const TIERS = {
  sdet: {
    beginner: ['java', 'junit', 'testng', 'sql', 'postman'],
    intermediate: ['selenium', 'playwright', 'rest-assured', 'cucumber-bdd', 'appium', 'robot-framework'],
    advanced: ['playwright-cross-browser-testing', 'jmeter', 'test-automation-tooling-landscape'],
  },
  sre: {
    beginner: ['linux-administration', 'networking-fundamentals', 'ci-cd-pipelines'],
    intermediate: ['kubernetes', 'docker', 'observability-grafana-prometheus', 'opentelemetry', 'aws', 'terraform', 'cloud-infrastructure'],
    advanced: ['sre-observability-slos', 'incident-response-mastery', 'chaos-engineering', 'system-performance', 'mcp-ai-agents', 'ai-assisted-engineering-workflows'],
  },
  sde: {
    beginner: ['git', 'python'],
    intermediate: ['docker'],
    advanced: ['clean-architecture'],
  },
  ai: {
    beginner: ['using-claude'],
    intermediate: ['kiro'],
    advanced: [],
  },
};

const LEVELS = ['beginner', 'intermediate', 'advanced'];

export function roadmapForCategory(key) {
  const tiers = TIERS[key] || {};
  const placed = new Set(LEVELS.flatMap((l) => tiers[l] || []));
  const byId = Object.fromEntries(topicsByCategory(key).map((t) => [t.id, t]));
  return LEVELS.map((level) => {
    const ids = [...(tiers[level] || [])];
    if (level === 'intermediate') {
      for (const t of topicsByCategory(key)) if (!placed.has(t.id)) ids.push(t.id);
    }
    return {level, topics: ids.map((id) => byId[id]).filter(Boolean)};
  });
}

export {categories};
