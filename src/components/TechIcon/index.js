import React from 'react';
import {
  siSelenium,
  siAppium,
  siCucumber,
  siRobotframework,
  siPostman,
  siApachejmeter,
  siOpenjdk,
  siJunit5,
  siMysql,
  siPython,
  siDocker,
  siKubernetes,
  siTerraform,
  siLinux,
  siGit,
  siGithubactions,
  siGrafana,
  siPrometheus,
  siOpentelemetry,
  siAnthropic,
  siCisco,
} from 'simple-icons';

/**
 * Brand logo for a topic, from simple-icons (CC0). Named imports keep the
 * bundle small. Slugs with no simple-icons entry (Playwright, OpenAI, AWS)
 * render an emoji fallback.
 *
 *   <TechIcon slug="kubernetes" size={20} tint />
 *   <TechIcon slug="playwright" />            // emoji fallback
 */
const MAP = {
  selenium: siSelenium,
  appium: siAppium,
  'cucumber-bdd': siCucumber,
  'robot-framework': siRobotframework,
  postman: siPostman,
  jmeter: siApachejmeter,
  java: siOpenjdk,
  junit: siJunit5,
  sql: siMysql,
  python: siPython,
  docker: siDocker,
  kubernetes: siKubernetes,
  terraform: siTerraform,
  linux: siLinux,
  'linux-administration': siLinux,
  git: siGit,
  'ci-cd-pipelines': siGithubactions,
  'observability-grafana-prometheus': siGrafana,
  'sre-observability-slos': siPrometheus,
  opentelemetry: siOpentelemetry,
  'networking-fundamentals': siCisco,
  'using-claude': siAnthropic,
  'mcp-ai-agents': siAnthropic,
};

const EMOJI = {
  playwright: '🎭',
  'playwright-cross-browser-testing': '🎭',
  testng: '🧪',
  aws: '☁️',
  'cloud-infrastructure': '☁️',
  'chaos-engineering': '🌀',
  'ai-assisted-engineering-workflows': '🤖',
  'incident-response-mastery': '🚨',
  'system-performance': '⚡',
  kiro: '🌀',
};

export default function TechIcon({slug, size = 18, tint = false, fallback, className}) {
  const icon = MAP[slug];
  if (!icon) {
    return (
      <span className={className} style={{fontSize: size, lineHeight: 1}} aria-hidden="true">
        {fallback || EMOJI[slug] || '📄'}
      </span>
    );
  }
  return (
    <svg
      role="img"
      aria-label={icon.title}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      className={className}
      fill={tint ? `#${icon.hex}` : 'currentColor'}>
      <path d={icon.path} />
    </svg>
  );
}
