/**
 * Manifest of every cheat sheet, mirrored from cheatsheets/intro.md's
 * category tiles. Single source of truth for the progress dashboard
 * (src/pages/dashboard.js) and the role picker (src/pages/start.js) so
 * both stay in sync with what's actually listed on the cheat sheets
 * landing page.
 */

export const categories = [
  {
    key: 'sdet',
    label: 'SDET Skills',
    description: 'Test automation, quality engineering, and SDET practices.',
    docsHref: '/docs/category/sdet-skills',
  },
  {
    key: 'sre',
    label: 'SRE Skills',
    description: 'Observability, incident response, and reliability practices.',
    docsHref: '/docs/category/sre-skills',
  },
  {
    key: 'sde',
    label: 'SDE Skills',
    description: 'Software development engineering topics and patterns.',
    docsHref: '/docs/category/sde-skills',
  },
  {
    key: 'ai',
    label: 'AI Skills',
    description: 'AI/ML concepts, tools, and applications.',
    docsHref: '/docs/category/ai-skills',
  },
];

export const topics = [
  // SDET Skills
  {id: 'playwright', title: 'Playwright', emoji: '🎭', href: '/cheatsheets/playwright', category: 'sdet'},
  {id: 'selenium', title: 'Selenium', emoji: '🌐', href: '/cheatsheets/selenium', category: 'sdet'},
  {id: 'appium', title: 'Appium', emoji: '📱', href: '/cheatsheets/appium', category: 'sdet'},
  {id: 'cucumber-bdd', title: 'Cucumber & BDD', emoji: '🥒', href: '/cheatsheets/cucumber-bdd', category: 'sdet'},
  {id: 'robot-framework', title: 'Robot Framework', emoji: '🤖', href: '/cheatsheets/robot-framework', category: 'sdet'},
  {id: 'rest-assured', title: 'REST Assured', emoji: '🛠️', href: '/cheatsheets/rest-assured', category: 'sdet'},
  {id: 'postman', title: 'Postman', emoji: '📮', href: '/cheatsheets/postman', category: 'sdet'},
  {id: 'jmeter', title: 'JMeter', emoji: '⚡', href: '/cheatsheets/jmeter', category: 'sdet'},
  {id: 'java', title: 'Java', emoji: '☕', href: '/cheatsheets/java', category: 'sdet'},
  {id: 'junit', title: 'JUnit', emoji: '✅', href: '/cheatsheets/junit', category: 'sdet'},
  {id: 'testng', title: 'TestNG', emoji: '🔧', href: '/cheatsheets/testng', category: 'sdet'},
  {id: 'sql', title: 'SQL', emoji: '🗄️', href: '/cheatsheets/sql', category: 'sdet'},
  {id: 'test-automation-tooling-landscape', title: 'Tooling Landscape', emoji: '🗺️', href: '/cheatsheets/test-automation-tooling-landscape', category: 'sdet'},

  // SRE Skills
  {id: 'kubernetes', title: 'Kubernetes', emoji: '☸️', href: '/cheatsheets/kubernetes', category: 'sre'},
  {id: 'aws', title: 'AWS', emoji: '☁️', href: '/cheatsheets/aws', category: 'sre'},
  {id: 'terraform', title: 'Terraform', emoji: '🌍', href: '/cheatsheets/terraform', category: 'sre'},
  {id: 'cloud-infrastructure', title: 'Cloud Infrastructure', emoji: '🏗️', href: '/cheatsheets/cloud-infrastructure', category: 'sre'},
  {id: 'ci-cd-pipelines', title: 'CI/CD Pipelines', emoji: '🔁', href: '/cheatsheets/ci-cd-pipelines', category: 'sre'},
  {id: 'linux-administration', title: 'Linux Administration', emoji: '🐧', href: '/cheatsheets/linux-administration', category: 'sre'},
  {id: 'system-performance', title: 'System Performance', emoji: '⚙️', href: '/cheatsheets/system-performance', category: 'sre'},
  {id: 'networking-fundamentals', title: 'Networking', emoji: '🌐', href: '/cheatsheets/networking-fundamentals', category: 'sre'},
  {id: 'observability-grafana-prometheus', title: 'Prometheus & Grafana', emoji: '📊', href: '/cheatsheets/observability-grafana-prometheus', category: 'sre'},
  {id: 'opentelemetry', title: 'OpenTelemetry', emoji: '🔭', href: '/cheatsheets/opentelemetry', category: 'sre'},
  {id: 'incident-response-mastery', title: 'Incident Response', emoji: '🚨', href: '/cheatsheets/incident-response-mastery', category: 'sre'},
  {id: 'chaos-engineering', title: 'Chaos Engineering', emoji: '🌪️', href: '/cheatsheets/chaos-engineering', category: 'sre'},
  {id: 'mcp-ai-agents', title: 'MCP & AI Agents', emoji: '🔌', href: '/cheatsheets/mcp-ai-agents', category: 'sre'},
  {id: 'ai-assisted-engineering-workflows', title: 'AI-Assisted Engineering', emoji: '🤖', href: '/cheatsheets/ai-assisted-engineering-workflows', category: 'sre'},

  // SDE Skills
  {id: 'python', title: 'Python', emoji: '🐍', href: '/cheatsheets/python', category: 'sde'},
  {id: 'git', title: 'Git', emoji: '🌿', href: '/cheatsheets/git', category: 'sde'},
  {id: 'docker', title: 'Docker', emoji: '🐳', href: '/cheatsheets/docker', category: 'sde'},
  {id: 'clean-architecture', title: 'Clean Architecture', emoji: '🏛️', href: '/cheatsheets/clean-architecture', category: 'sde'},

  // AI Skills
  {id: 'using-claude', title: 'Claude', emoji: '🧠', href: '/cheatsheets/using-claude', category: 'ai'},
  {id: 'kiro', title: 'Kiro', emoji: '✨', href: '/cheatsheets/kiro', category: 'ai'},
];

export function topicsByCategory(categoryKey) {
  return topics.filter((t) => t.category === categoryKey);
}
