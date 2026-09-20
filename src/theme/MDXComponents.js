import MDXComponents from '@theme-original/MDXComponents';
import KeyTakeaways from '@site/src/components/KeyTakeaways';
import TenMinute from '@site/src/components/TenMinute';
import Exercises from '@site/src/components/Exercises';
import CaseStudy from '@site/src/components/CaseStudy';
import AISpark from '@site/src/components/AISpark';
import LevelBadge from '@site/src/components/LevelBadge';
import TechIcon from '@site/src/components/TechIcon';
import AdSlot from '@site/src/components/AdSlot';

/**
 * Components usable in any .md / .mdx file with no import. Synced from the
 * parent portfolio repo, minus the ones no imported page uses
 * (LearningPath, InteractiveExample, VisualExplanation, KnowledgeMap,
 * Commentary, InterviewQuestions) — copy those back and register them here
 * if you import content that uses them, or the build fails.
 */
export default {
  ...MDXComponents,
  KeyTakeaways,
  TenMinute,
  Exercises,
  CaseStudy,
  AISpark,
  LevelBadge,
  TechIcon,
  AdSlot,
};
