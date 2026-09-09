---
title: "CI/CD (Jenkins, GitLab CI & GitHub Actions): The Complete Guide"
description: "End-to-end reference for CI/CD — pipeline concepts, deployment strategies, side-by-side Jenkins/GitLab CI/GitHub Actions syntax, and interview-ready Q&A."
sidebar_position: 1
tags: [ci-cd, jenkins, gitlab-ci, github-actions, sre]
---

# CI/CD (Jenkins, GitLab CI & GitHub Actions) — The Complete Guide

A single-read, end-to-end reference for CI/CD: enough to design a pipeline
from scratch, read/modify one in any of the three dominant tools, or walk
into an SRE interview. Organized as a lookup you can also read top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/ci-cd-pipelines">📋 Quick reference: CI/CD →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 220" role="img" aria-labelledby="mm-cicd-title mm-cicd-desc">
<title id="mm-cicd-title">The CI/CD pipeline as one automated chain</title>
<desc id="mm-cicd-desc">A commit flows through build and test, packaging, staging deployment, an optional approval gate, and finally production deployment.</desc>
<defs>
  <marker id="mm-cicd-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<text class="mm-flow-label" x="390" y="55" text-anchor="middle">every change runs the same chain</text>

<rect class="mm-n1" x="10" y="90" width="110" height="70" rx="10"/>
<text class="mm-node-title" x="65" y="118" text-anchor="middle">Commit</text>
<text class="mm-node-sub" x="65" y="134" text-anchor="middle">push to branch</text>

<rect class="mm-n2" x="140" y="90" width="110" height="70" rx="10"/>
<text class="mm-node-title" x="195" y="118" text-anchor="middle">Build &amp; Test</text>
<text class="mm-node-sub" x="195" y="134" text-anchor="middle">CI</text>

<rect class="mm-n3" x="270" y="90" width="110" height="70" rx="10"/>
<text class="mm-node-title" x="325" y="118" text-anchor="middle">Package</text>
<text class="mm-node-sub" x="325" y="134" text-anchor="middle">build artifact</text>

<rect class="mm-n4" x="400" y="90" width="110" height="70" rx="10"/>
<text class="mm-node-title" x="455" y="118" text-anchor="middle">Deploy Stage</text>
<text class="mm-node-sub" x="455" y="134" text-anchor="middle">automatic</text>

<rect class="mm-n5" x="530" y="90" width="110" height="70" rx="10"/>
<text class="mm-node-title" x="585" y="118" text-anchor="middle">Approve</text>
<text class="mm-node-sub" x="585" y="134" text-anchor="middle">manual, optional</text>

<rect class="mm-n6" x="660" y="90" width="110" height="70" rx="10"/>
<text class="mm-node-title" x="715" y="118" text-anchor="middle">Deploy Prod</text>
<text class="mm-node-sub" x="715" y="134" text-anchor="middle">live traffic</text>

<path class="mm-arrow" d="M120,125 L138,125" marker-end="url(#mm-cicd-arrow)"/>
<path class="mm-arrow" d="M250,125 L268,125" marker-end="url(#mm-cicd-arrow)"/>
<path class="mm-arrow" d="M380,125 L398,125" marker-end="url(#mm-cicd-arrow)"/>
<path class="mm-arrow" d="M510,125 L528,125" marker-end="url(#mm-cicd-arrow)"/>
<path class="mm-arrow" d="M640,125 L658,125" marker-end="url(#mm-cicd-arrow)"/>
</svg>

<p class="mental-model__caption">CI, Continuous Delivery, and Continuous Deployment are the same chain measured to different endpoints — CI stops after build and test, Continuous Delivery stops at a release-ready artifact behind a manual gate, and Continuous Deployment removes that gate so the last step to production runs automatically too.</p>
</div>

## 1. What CI/CD Is, in Practical Terms

**Continuous Integration (CI)** — every code change is automatically built,
tested, and merged into a shared branch frequently (ideally on every push),
catching integration problems early instead of at a painful "merge day."

**Continuous Delivery** — every change that passes CI is automatically
packaged into a release-ready artifact and can be deployed to production
**with a manual approval gate**.

**Continuous Deployment** — the same as Continuous Delivery, but the final
step to production is also automatic — no human clicks "deploy." This is the
end state most mature engineering orgs aim for, but not all reach it (regulated
environments often keep a manual gate on prod by design, not by immaturity).

```
commit → build → test → package → deploy (staging) → [gate] → deploy (prod)
         └──────────── CI ────────────┘
         └──────────────── Continuous Delivery ────────────────┘
         └──────────────── Continuous Deployment (no gate) ─────────────┘
```

---

## 2. Pipeline Concepts

### 2.1 Stages and jobs

A **pipeline** is a sequence of **stages** (build, test, deploy); each stage
contains one or more **jobs** that can run in parallel. Jobs within a stage
typically run concurrently; stages run sequentially unless explicitly
parallelized (fan-out/fan-in patterns).

| Concept | Meaning |
|---|---|
| **Stage** | A logical phase of the pipeline (e.g., `test`) |
| **Job** | A unit of work within a stage, runs on one agent/runner |
| **Step/Task** | An individual command or action inside a job |
| **Workspace** | The checked-out repo + generated files a job operates on |
| **Artifact** | A file/directory produced by a job and passed to later stages (build output, test reports, container images) |
| **Trigger** | What starts a pipeline run — push, PR/MR, tag, schedule (cron), manual, upstream pipeline |

### 2.2 Artifacts and caching

- **Artifacts** are the *output* of a job that later jobs or humans consume —
  a compiled binary, a Docker image, a coverage report. They're usually
  retained for a defined period and attached to the pipeline run.
- **Caching** is different: it speeds up repeated work *within* pipelines
  (e.g., `node_modules`, `.m2` dependency caches) — not meant to be a durable
  build output, just a performance optimization that can be safely wiped.
- Rule of thumb: if downstream stages or a human need the file, it's an
  **artifact**; if it just saves redownloading dependencies, it's a **cache**.

### 2.3 Environments

Pipelines typically promote a build through environments of increasing
stability:

```
dev → staging/QA → (canary/pre-prod) → production
```

Each environment usually has its own config/secrets, and later environments
gate on the previous one passing (automated tests, manual approval, or both).
Modern CI tools model **environments as first-class objects** (GitHub Actions
`environment:`, GitLab `environment:`) so you can attach approval rules and
see deployment history per environment, not just per pipeline run.

---

## 3. Deployment Strategies

| Strategy | How it works | Rollback speed | Trade-off |
|---|---|---|---|
| **Recreate** | Stop old version entirely, then start new version | Slow (redeploy old) | Simplest; causes downtime |
| **Rolling** | Replace instances a few at a time, old and new coexist briefly | Medium | No extra infra needed; both versions serve traffic simultaneously — must be backward-compatible |
| **Blue/Green** | Two full environments (blue = live, green = new); switch traffic all at once via router/LB | Instant (flip back) | Doubles infra cost during cutover; easiest to reason about |
| **Canary** | Route a small % of traffic to the new version, watch metrics, gradually increase | Fast (route back to 0%) | Needs good metrics/automation to detect regressions; most complex to set up |
| **Feature flags** | Deploy dark code behind a flag, enable for subsets of users independent of deploy | Instant (flip flag) | Decouples deploy from release; flag debt accumulates if not cleaned up |

```
Blue/Green:      [ Blue: v1 (live) ]   [ Green: v2 (idle) ]
                          │ switch router 100% →
                  [ Blue: v1 (idle) ]  [ Green: v2 (live) ]

Canary:           v1: 95% traffic  ──┐
                   v2:  5% traffic  ─┴─► watch error rate / latency
                                       → 25% → 50% → 100%, or roll back to 0%
```

**Interview framing:** blue/green answers "how do I cut over instantly and
roll back instantly," canary answers "how do I limit blast radius while I
find out if this build is actually safe," and rolling answers "how do I
deploy without doubling infrastructure cost." They're not mutually exclusive
— canary is often implemented *as* a rolling update with traffic-weighted
routing at the mesh/LB layer.

The mental model underneath all of them: **deploy** puts new code onto
infrastructure; **release** makes that code affect user-visible behavior.
Conflating the two is why teams fear deploying — if deploying instantly means
100% of users see it, every deploy is a high-stakes event. Blue/green,
canary, and feature flags all exist to pull those two concepts apart so you
can deploy constantly (low risk, reversible, code-only) and release
deliberately (a business decision, instantly reversible, no redeploy
required).

### 3.1 Kubernetes rolling update, concretely

```yaml
# deployment.yaml
spec:
  replicas: 10
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 2          # up to 2 extra pods above desired count during rollout
      maxUnavailable: 1    # never more than 1 pod below desired count
  minReadySeconds: 15      # pod must be Ready this long before counted "available"
  template:
    spec:
      containers:
        - name: checkout-api
          image: registry.internal/checkout-api:v1.42.0
          readinessProbe:
            httpGet: { path: /healthz, port: 8080 }
            periodSeconds: 5
            failureThreshold: 3
```

```bash
kubectl apply -f deployment.yaml
kubectl rollout status deployment/checkout-api --timeout=5m   # blocks CI until healthy or times out
kubectl rollout history deployment/checkout-api
kubectl rollout undo deployment/checkout-api                     # back to previous revision
kubectl rollout undo deployment/checkout-api --to-revision=40    # or a specific one
```

`kubectl rollout status` returning non-zero on timeout is the hook CI/CD
pipelines use to fail the deploy step and trigger automated rollback — no
human judgment call required. A missing `readinessProbe` is a classic gap:
without it, Kubernetes marks a pod "ready" the instant the process starts,
before it can actually serve traffic, so a rolling update routes real
traffic into cold pods and produces an error burst that looks like a bad
deploy but is really a probing gap.

### 3.2 GitOps: pull-based deployment (ArgoCD, Flux)

Traditional CI/CD **pushes** to the cluster — the runner/agent holds cluster
credentials and runs `kubectl apply` directly. **GitOps** inverts this: an
in-cluster controller (ArgoCD, Flux) continuously **pulls** the desired
state from a Git repo and reconciles the live cluster to match it —
including undoing manual `kubectl edit` drift. Git becomes the single
source of truth and audit log for what's actually running, and rollback
becomes `git revert` on the manifest repo instead of a separate operational
procedure.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: checkout-api
  namespace: argocd
spec:
  source:
    repoURL: https://git.internal/platform/checkout-api-manifests.git
    targetRevision: main
    path: overlays/production
  destination:
    server: https://kubernetes.default.svc
    namespace: checkout
  syncPolicy:
    automated:
      prune: true      # delete resources removed from Git
      selfHeal: true   # revert manual kubectl edits back to Git state
```

```bash
argocd app sync checkout-api        # manual trigger (usually automated instead)
argocd app rollback checkout-api 41 # roll back to a prior sync revision
argocd app history checkout-api     # every Git SHA this app was synced to
```

Flux follows the same pull/reconcile model with Kubernetes-native CRDs
(`GitRepository`, `Kustomization`) instead of ArgoCD's `Application` CRD.
With `selfHeal: true`, an engineer running `kubectl scale ... --replicas=50`
directly against prod gets silently reverted back to Git's declared state
within seconds — that's correct behavior, not a bug, and the GitOps
incident-response move is "fix Git and let it reconcile," not "patch the
cluster and remember to backport it."

### 3.3 Feature flags: decoupling deploy from release

Feature flags let you ship code dark — behind a flag, off for everyone — as
a low-risk, reversible **deploy**, then flip the flag later as a deliberate,
instantly reversible **release** decision, with no redeploy needed in
either direction.

```python
if feature_flags.is_enabled("new-checkout-flow", context=user):
    return new_checkout_flow(request)
return legacy_checkout_flow(request)
```

```bash
ld-cli flags set new-checkout-flow --rollout "internal-users:100,beta-cohort:10,everyone:0"
ld-cli flags set new-checkout-flow --rollout "everyone:100"   # full release, no redeploy
ld-cli flags set new-checkout-flow --rollout "everyone:0"     # instant kill switch
```

The tradeoff is **flag debt**: without an enforced lifecycle (create → ramp
→ 100% → delete flag and the dead code path), flags rot into permanent,
untested `if flag_enabled(...)` branches that nobody remembers the purpose
of.

### 3.4 Rollback: automating the trigger, not just the mechanism

A rollback path that isn't exercised regularly isn't a rollback path —
`kubectl rollout undo` should run in staging as part of routine pipeline
testing, not be discovered for the first time during an incident. More
importantly, automate the **trigger**: a pipeline that can run `rollout
undo` but only on human command is still MTTR-bound by whoever's on call
noticing and deciding. Common automated rollback triggers:

- Error rate over threshold (e.g., 5xx > 1% over 5 minutes)
- p99 latency over SLO
- Readiness/liveness probe failures
- A synthetic health check failing post-deploy

A concrete pipeline that shifts a canary, gates promotion on real metrics,
and auto-rolls-back on failure — the shape every mature deploy pipeline
converges toward:

```yaml
# .gitlab-ci.yml
stages: [build, deploy-canary, verify, promote, rollback]

deploy-canary:
  stage: deploy-canary
  script:
    - kubectl set image deployment/checkout-api-canary checkout-api=$IMAGE
    - kubectl rollout status deployment/checkout-api-canary --timeout=3m
  environment:
    name: production-canary

verify:
  stage: verify
  script:
    # polls Prometheus for 5xx rate / p99 latency for 5 minutes;
    # a non-zero exit fails the pipeline and blocks promote
    - ./scripts/check_canary_health.sh --duration=300 --max-error-rate=0.01 --max-p99-ms=500

promote:
  stage: promote
  script:
    - kubectl set image deployment/checkout-api checkout-api=$IMAGE
    - kubectl rollout status deployment/checkout-api --timeout=5m
  environment:
    name: production
  when: on_success   # only runs if verify passed

rollback:
  stage: rollback
  script:
    - kubectl rollout undo deployment/checkout-api-canary
    - kubectl rollout undo deployment/checkout-api
    - curl -X POST $SLACK_WEBHOOK -d '{"text":"Auto-rollback: canary verify failed"}'
  when: on_failure    # only runs if verify (or promote) failed
```

No manual approval is required for this to be *safe* — approval gates are
an additional control for compliance/change-management reasons, layered on
top of automated health checks, not a substitute for them. Where a
regulated environment does need a documented human sign-off before
production, that's a separate gate on top, e.g. a Jenkins `input` step:

```groovy
stage('Approve production') {
    steps {
        timeout(time: 30, unit: 'MINUTES') {
            input message: 'Promote to production?', ok: 'Deploy',
                  submitter: 'release-managers'
        }
    }
}
```

The `input` step blocks the pipeline (with a timeout so it can't hang
forever) until someone in the named group approves — Jenkins's equivalent
of GitLab's `when: manual` or GitHub Actions' `environment` required
reviewers (see §7).

### 3.5 Canary with automated analysis (Argo Rollouts)

Argo Rollouts extends the pattern in §3.4 into a dedicated Kubernetes CRD: a
`Rollout` object drives a canary through explicit traffic-weight steps,
pausing at each to run an `AnalysisTemplate` against Prometheus (or
Datadog/CloudWatch) before proceeding — and aborts automatically, reverting
100% of traffic back to the stable ReplicaSet, on the first failed sample.

```yaml
apiVersion: argoproj.io/v1alpha1
kind: Rollout
metadata:
  name: checkout-api
spec:
  replicas: 10
  strategy:
    canary:
      canaryService: checkout-api-canary
      stableService: checkout-api-stable
      trafficRouting:
        nginx:
          stableIngress: checkout-api-ingress
      steps:
        - setWeight: 5
        - pause: { duration: 5m }
        - analysis:
            templates:
              - templateName: error-rate-check
        - setWeight: 25
        - pause: { duration: 10m }
        - setWeight: 100
---
apiVersion: argoproj.io/v1alpha1
kind: AnalysisTemplate
metadata:
  name: error-rate-check
spec:
  metrics:
    - name: error-rate
      interval: 1m
      count: 5
      successCondition: result[0] < 0.01     # < 1% 5xx rate
      failureLimit: 1                         # ONE bad sample aborts the rollout
      provider:
        prometheus:
          address: http://prometheus.monitoring:9090
          query: |
            sum(rate(http_requests_total{app="checkout-api",status=~"5.."}[1m]))
            /
            sum(rate(http_requests_total{app="checkout-api"}[1m]))
```

```bash
kubectl argo rollouts get rollout checkout-api --watch   # live traffic-weight + analysis view
kubectl argo rollouts abort checkout-api                 # manual kill switch, auto-reverts to stable
kubectl argo rollouts promote checkout-api               # skip remaining pauses, go to 100%
```

A canary step with no `analysis` attached is just a slower rolling update
with extra YAML — the value is entirely in the automated compare-and-abort
logic. Production-grade analysis should combine RED metrics (rate, errors,
duration) with a business metric where possible (e.g., checkout completion
rate), since a technically "healthy" canary can still be silently broken —
200 OK, low latency, but writing bad data underneath.

### 3.6 A few more deployment patterns worth knowing

- **Database migrations as a first-class deployment step, decoupled from
  code deploy.** The safe sequence for a breaking schema change under a
  rolling/canary strategy is: (1) deploy code that works with both old and
  new schema, (2) run the migration, (3) deploy code that only needs the
  new schema, (4) backfill/cleanup. Automating this as three separate
  pipeline stages — rather than one `kubectl apply` plus a migration hook —
  is what keeps rollback possible at every point, since rolling back step 3
  must still work against the post-migration schema from step 2.
- **SLO burn-rate rollback triggers, not just a raw error-rate threshold.**
  A fixed "5xx > 1%" trigger either fires on noise for low-traffic services
  or too late for high-traffic ones. Multi-window, multi-burn-rate alerting
  (fast burn over 5 minutes *and* slow burn over 1 hour, both must fire)
  tied directly into the rollback trigger — the same math behind SRE SLO
  alerting — reduces both false positives and false negatives.
- **Ephemeral preview environments per pull/merge request**, spun up via
  GitOps (ArgoCD ApplicationSets, Flux) on PR open and torn down on
  merge/close, let reviewers hit a live, isolated deployment before it
  reaches any shared environment — shifting a class of integration bugs
  left of the canary stage entirely.
- **Multi-region rollouts should stagger, not fan out simultaneously** —
  canary region first, full soak, then the rest — converting a potential
  global outage into a regional one. Typically orchestrated via ArgoCD
  ApplicationSets with wave-style ordering, or one pipeline stage per
  region with a health gate between each.

---

## 4. Jenkins

Jenkins is a self-hosted, plugin-driven automation server — the oldest and
most flexible of the three, at the cost of needing to run and maintain
infrastructure yourself (controller + agents).

### 4.1 Core architecture

- **Controller (master)** — schedules builds, serves the UI, stores config.
- **Agent (node)** — a machine (VM, container, bare metal) that actually
  executes job steps, connected to the controller. Labeled so pipelines can
  target specific capabilities (`agent { label 'docker && linux' }`).
- **Executor** — a slot on an agent (or the controller) that runs one build
  step at a time; an agent with 4 executors can run 4 concurrent
  builds/stages. **Executors are the actual scarce resource** — most
  "stuck in queue" incidents are executor or label starvation, not the
  platform being broken.
- **Plugins** — Jenkins's core is minimal; almost everything (Git, Docker,
  Kubernetes, Slack notifications, credential stores) is a plugin. This is
  Jenkins's superpower and its biggest maintenance burden — plugin
  compatibility breakage across upgrades is a common pain point.

### 4.2 Declarative vs. scripted pipeline

**Declarative** (recommended default) — structured, opinionated syntax,
easier to read/lint, sufficient for most pipelines.

```groovy
// Jenkinsfile — Declarative
pipeline {
    agent { label 'linux && docker' }

    environment {
        IMAGE_TAG = "myapp:${env.BUILD_NUMBER}"
    }

    options {
        timeout(time: 30, unit: 'MINUTES')
        timestamps()
    }

    stages {
        stage('Build') {
            steps {
                sh 'docker build -t $IMAGE_TAG .'
            }
        }
        stage('Test') {
            steps {
                sh 'docker run --rm $IMAGE_TAG pytest --junitxml=report.xml'
            }
            post {
                always {
                    junit 'report.xml'
                }
            }
        }
        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'kubectl set image deployment/myapp myapp=$IMAGE_TAG'
            }
        }
    }

    post {
        failure {
            slackSend channel: '#alerts', message: "Build ${env.BUILD_NUMBER} failed"
        }
    }
}
```

**Scripted** — full Groovy, imperative, more powerful/flexible but harder to
read and lint; reach for it when declarative's structure can't express the
logic you need (complex conditionals, dynamic stage generation).

```groovy
// Jenkinsfile — Scripted
node('linux && docker') {
    stage('Build') {
        sh 'docker build -t myapp:${BUILD_NUMBER} .'
    }
    stage('Test') {
        try {
            sh 'docker run --rm myapp:${BUILD_NUMBER} pytest'
        } finally {
            junit 'report.xml'
        }
    }
    if (env.BRANCH_NAME == 'main') {
        stage('Deploy') {
            sh 'kubectl set image deployment/myapp myapp=myapp:${BUILD_NUMBER}'
        }
    }
}
```

### 4.3 Key building blocks

| Construct | Purpose |
|---|---|
| `agent` | Where the pipeline/stage runs (label, docker image, `any`, `none`) |
| `environment` | Env vars scoped to pipeline or a single stage |
| `when` | Conditional stage execution (branch, expression, changelog) |
| `parallel` | Run stages/steps concurrently |
| `post` | Actions after stage/pipeline completion (`always`, `success`, `failure`) |
| `credentials()` | Pull a secret from Jenkins's credential store into env |
| Shared libraries | Reusable Groovy pipeline code across many Jenkinsfiles — Jenkins's answer to "don't repeat yourself" across dozens of repos |

Jenkins pipelines are triggered by **webhooks** (push, PR), **polling SCM**
(legacy, less efficient), or **cron-style schedules** (`triggers { cron('H
2 * * *') }`).

### 4.4 Credentials management

Never hardcode secrets in a `Jenkinsfile`. Jenkins's built-in **credential
store** (Manage Jenkins → Credentials) holds secret text, username/password
pairs, SSH keys, and certificates, scoped to a folder or globally. Pipelines
pull from it by ID via the `credentials()` helper (declarative
`environment` block) or `withCredentials` (works in either style):

```groovy
pipeline {
    agent any
    environment {
        DOCKER_CREDS = credentials('dockerhub-creds') // exposes _USR / _PSW
    }
    stages {
        stage('Deploy') {
            steps {
                withCredentials([
                    string(credentialsId: 'aws-secret-key', variable: 'AWS_SECRET_ACCESS_KEY'),
                    sshUserPrivateKey(credentialsId: 'deploy-ssh-key', keyFileVariable: 'SSH_KEY')
                ]) {
                    sh 'ssh -i "$SSH_KEY" deploy@prod-host "deploy.sh"'
                }
            }
        }
    }
}
```

Jenkins masks bound credential values in console output (`****`)
automatically — but the masking is string-based, so transforming a secret
before use (base64-encoding it, echoing a substring) defeats it and leaks
the value into logs.

### 4.5 Parameterized builds

Parameters let a job accept input at trigger time — target environment,
version, feature toggles:

```groovy
pipeline {
    agent any
    parameters {
        choice(name: 'ENVIRONMENT', choices: ['staging', 'production'], description: 'Target environment')
        string(name: 'VERSION', defaultValue: 'latest', description: 'Image tag to deploy')
        booleanParam(name: 'SKIP_TESTS', defaultValue: false, description: 'Skip test stage')
    }
    stages {
        stage('Test') {
            when { expression { !params.SKIP_TESTS } }
            steps { sh 'npm test' }
        }
        stage('Deploy') {
            steps { sh "./deploy.sh ${params.ENVIRONMENT} ${params.VERSION}" }
        }
    }
}
```

Trigger from the CLI:
`curl -X POST JENKINS_URL/job/deploy/buildWithParameters --user user:token --data ENVIRONMENT=production --data VERSION=1.4.2`

### 4.6 Shared libraries

Copy-pasting the same `Jenkinsfile` boilerplate (build, notify, deploy
logic) across dozens of repos means one security fix requires editing
dozens of files. **Shared libraries** centralize reusable pipeline Groovy in
a separate Git repo, versioned and imported like a dependency — Jenkins's
answer to "don't repeat yourself" across many pipelines.

```
(shared-library-repo)/
├── vars/
│   ├── buildAndTest.groovy      # global var — callable as a step: buildAndTest()
│   └── deployToK8s.groovy
├── src/
│   └── com/company/Utils.groovy # classes, importable via `import`
└── resources/
    └── templates/deployment.yaml
```

`vars/buildAndTest.groovy`:
```groovy
def call(Map config = [:]) {
    sh "docker build -t ${config.image}:${env.BUILD_NUMBER} ."
    sh "docker run --rm ${config.image}:${env.BUILD_NUMBER} npm test"
}
```

Consuming `Jenkinsfile`:
```groovy
@Library('my-shared-lib@main') _

pipeline {
    agent any
    stages {
        stage('Build & Test') {
            steps { buildAndTest(image: 'myorg/myapp') }
        }
    }
}
```

Register the library once under Manage Jenkins → System → Global Pipeline
Libraries, pointing at the Git repo. Pin consuming pipelines to a tag
(`@Library('my-shared-lib@v2.1.0')`) rather than `@main` in production — an
unreviewed change to the library's default branch otherwise breaks every
pipeline that consumes it simultaneously, with no staged rollout. Use
`src/` classes instead of `vars/` scripts when the shared logic needs real
object state or is complex enough to benefit from unit testing outside
Jenkins.

### 4.7 Agent labels and routing

Agents are tagged with labels (`linux`, `docker`, `gpu`, `windows`,
`arm64`) at registration; pipelines request an agent by label, and Jenkins
places the build on any matching, available executor:

```groovy
pipeline {
    agent { label 'linux && docker' }   // both labels required
    ...
}
```

Different stages can target different agents by setting `agent none` at the
top level and an `agent` per stage:

```groovy
pipeline {
    agent none
    stages {
        stage('Build') {
            agent { label 'linux' }
            steps { sh 'make build' }
        }
        stage('Windows Test') {
            agent { label 'windows' }
            steps { bat 'run-tests.bat' }
        }
    }
}
```

`agent any` picks any available executor, including the controller if
unrestricted — avoid it in production; explicit labels control exactly
where untrusted or resource-heavy code runs. A typo in a label expression
(`dockeer` vs `docker`) fails silently: Jenkins just queues the build
forever with no hard error, rather than telling you the label doesn't
match anything.

### 4.8 Essential plugins

| Plugin | Purpose |
|---|---|
| Git | SCM checkout (`checkout scm`), branch/tag polling, webhook triggers |
| Pipeline (suite) | Provides the `pipeline { }` DSL itself |
| Credentials Binding | Powers `withCredentials`/`credentials()` — the masking and scoping mechanism |
| Kubernetes | Ephemeral pod agents — a fresh pod per build, no workspace bleed between runs |
| Docker Pipeline | `docker.build()`, `docker.image().inside{}` helpers |
| Blue Ocean | Visual pipeline UI (stage graph, log viewer); largely superseded by the built-in Stage View but common in older installs |
| Slack Notification, Timestamper, Workspace Cleanup | Notifications, timestamped logs, `cleanWs()` |

### 4.9 Troubleshooting playbook

**Build stuck in queue ("Waiting for next available executor")** — check
`Manage Jenkins → Nodes` for an online agent matching the requested label;
cross-check the `agent { label '...' }` string against actual agent labels
(a typo silently produces zero matches, not an error); check whether all
matching executors are occupied by long-running or hung builds; for
Kubernetes-plugin ephemeral agents, check the pod template — a bad image
reference or an unschedulable resource request leaves Jenkins waiting
indefinitely.

**Pipeline fails at checkout** — verify the Git credential ID/scope in
`Manage Jenkins → Credentials`; confirm the repo URL protocol (SSH vs
HTTPS) matches the bound credential type; for multibranch pipelines, check
the repo's webhook delivery log for failed deliveries (a firewall/proxy
blocking the controller's public endpoint, or a webhook secret mismatch);
confirm the branch/tag still exists if it might have been force-pushed away
mid-build.

**"Works locally, fails in Jenkins"** — the agent's shell is typically
non-interactive/non-login, so it won't source `.bashrc`/`.zshrc`: tools
installed via nvm/rbenv/pyenv/asdf and relying on shell init files won't be
on `PATH` (fix: install system-wide, use Docker agents with the toolchain
baked in, or explicitly source the version manager); local `.env` files
aren't present on the agent (secrets must come from `withCredentials`/
`environment{}`); Jenkins workspaces persist between builds unless
`cleanWs()` runs, so a "works locally" bug can actually be stale artifacts
from a prior build; the agent runs as a dedicated service user with
different permissions/umask/device access than a developer's login (Docker
socket, GPU); pin exact tool/runtime versions in the pipeline rather than
trusting "whatever's installed" on the agent.

---

## 5. GitLab CI

GitLab CI is built into GitLab itself — config lives in a single
`.gitlab-ci.yml` at the repo root, no separate server to install (GitLab
manages the controller; you only manage **runners**).

### 5.1 Core architecture

- **`.gitlab-ci.yml`** — declares stages, jobs, and rules; auto-detected and
  run on every push/MR by default.
- **Runner** — the agent that executes jobs; can be shared (GitLab.com's
  pool), group-level, or project-specific self-hosted runners (Docker,
  shell, Kubernetes executors).
- **Pipeline** — one run of the whole `.gitlab-ci.yml` for a given commit/MR.

### 5.2 Example pipeline

```yaml
# .gitlab-ci.yml
stages:
  - build
  - test
  - deploy

variables:
  IMAGE_TAG: "$CI_REGISTRY_IMAGE:$CI_COMMIT_SHORT_SHA"

default:
  image: docker:24
  services:
    - docker:24-dind

build:
  stage: build
  tags: [docker]
  script:
    - docker build -t $IMAGE_TAG .
    - docker login -u $CI_REGISTRY_USER -p $CI_REGISTRY_PASSWORD $CI_REGISTRY
    - docker push $IMAGE_TAG
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == "main"'

unit-tests:
  stage: test
  needs: [build]
  image: $IMAGE_TAG
  script:
    - pytest tests/unit --junitxml=report.xml
  artifacts:
    when: always
    reports:
      junit: report.xml
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == "main"'

integration-tests:
  stage: test
  needs: [build]        # runs in parallel with unit-tests — both only need build
  image: $IMAGE_TAG
  script:
    - pytest tests/integration
  rules:
    - if: '$CI_PIPELINE_SOURCE == "merge_request_event"'
    - if: '$CI_COMMIT_BRANCH == "main"'

deploy-staging:
  stage: deploy
  needs: [unit-tests, integration-tests]
  environment:
    name: staging
    url: https://staging.example.com
  script:
    - kubectl set image deployment/app app=$IMAGE_TAG --namespace=staging
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'

deploy-production:
  stage: deploy
  needs: [deploy-staging]
  environment:
    name: production
    url: https://example.com
  when: manual                       # explicit human approval gate
  script:
    - kubectl set image deployment/app app=$IMAGE_TAG --namespace=production
  rules:
    - if: '$CI_COMMIT_BRANCH == "main"'
```

`unit-tests` and `integration-tests` both `needs: [build]` only, so they run
in parallel instead of waiting on each other — DAG behavior via `needs`
(see §5.4). `deploy-staging` auto-deploys on every `main` merge;
`deploy-production` requires `needs: [deploy-staging]` **and** a manual
click, enforcing sequential promotion through environments. The
MR-triggered rules give build/test feedback before merge without ever
touching a real deploy job, since deploy jobs only fire on `main`.

### 5.3 Key building blocks

| Construct | Purpose |
|---|---|
| `stages` | Ordered list of stage names; jobs assigned to a stage via `stage:` |
| `rules` | Modern conditional job execution (replaces older `only`/`except`) — `if`, `changes`, `when` |
| `only` / `except` | Legacy branch/tag/event filters — still seen in older configs, superseded by `rules` |
| `needs` | Express job dependencies explicitly, enabling a DAG instead of strict stage-by-stage ordering (jobs start as soon as their `needs` finish, not the whole prior stage) |
| `extends` / `include` | Reuse job templates and split config across files (`include: - local/remote/template`) |
| `services` | Sidecar containers available to a job (e.g., `docker:dind` for building images, a database for integration tests) |
| CI/CD variables | Project/group-level secrets, masked and protected-branch-scoped |

`rules:` with `when: manual` is GitLab's equivalent of a Jenkins approval
gate or a GitHub Actions `environment` protection rule — the pipeline pauses
at that job until a human clicks "run."

### 5.4 Runners and executors

A **runner** is the agent process that picks up and executes jobs.

- **Shared runners** — provided by GitLab (or a self-hosted instance's
  admin), available to all/many projects; good for generic workloads,
  pay-per-minute on GitLab.com SaaS tiers.
- **Specific/self-hosted runners** — registered to one project or group,
  under your control; needed for special hardware (GPU), private network
  access, or compliance requirements.
- **Executors** — how a runner actually runs a job: `docker` (a container
  per job from `image:` — most common, clean isolation), `shell` (runs
  directly on the runner host — fast, but no isolation, dependencies leak
  between jobs), `kubernetes` (each job as a pod in a cluster — scales
  elastically for large fleets).
- **Tags** — a runner registers with tags (`docker`, `gpu`,
  `prod-deploy`); a job with `tags: [gpu]` is only picked up by a runner
  advertising that tag. This is the job-to-runner matching mechanism — get
  it wrong, or omit tags entirely on a fleet where every runner requires
  them, and the job sits "pending" forever with no clear error.

```yaml
deploy-gpu-job:
  tags: [gpu, self-hosted]
  script:
    - ./train.sh
```

### 5.5 CI/CD variables and precedence

Variables are defined at project, group, or instance level (Settings →
CI/CD → Variables), or inline in `.gitlab-ci.yml` under `variables:`.

- **Protected** — only exposed to pipelines running on protected
  branches/tags, so a feature-branch pipeline can't read a production
  secret.
- **Masked** — redacted (`[MASKED]`) in job logs; masking has requirements
  (no whitespace, minimum length, matches a charset) — a poorly-formed
  secret silently fails to mask.
- **Precedence** (highest wins): manually-triggered pipeline/trigger-API
  variables → project-level UI variables → group-level UI variables →
  instance-level variables → the `.gitlab-ci.yml` `variables:` block →
  GitLab's own predefined variables (`CI_COMMIT_SHA`, etc.). In practice:
  **a UI-configured variable overrides the same name defined in the YAML
  file**, which is what lets ops override a default without touching code.

### 5.6 Cache vs artifacts

The two mechanisms for persisting files across job runs — confusing them
is one of the most common GitLab CI mistakes.

| | **Cache** | **Artifacts** |
|---|---|---|
| Purpose | Speed up jobs by reusing downloaded/computed dependencies | Pass build output between stages / expose for download |
| Lifetime | Best-effort, may be evicted, shared across pipeline runs on the same runner | Guaranteed available to downstream jobs in the same pipeline; retained per `expire_in` |
| Guarantee | Not guaranteed to exist — a cache miss is normal, not an error | Guaranteed to exist if the producing job succeeded |
| Typical contents | `node_modules/`, `.m2/`, pip/Go module caches | Compiled binaries, image tarballs, test reports, coverage |
| Downloaded by later jobs automatically? | No — opt in per job | Yes by default (unless restricted via `dependencies`/`needs`) |

```yaml
build:
  stage: build
  cache:
    key: ${CI_COMMIT_REF_SLUG}
    paths: [node_modules/]
  artifacts:
    paths: [dist/]
    expire_in: 1 week
  script:
    - npm ci
    - npm run build

test:
  stage: test
  needs: [build]      # pulls dist/ artifact from build automatically
  script: [npm test]
```

Rule of thumb: **cache = "might make this job faster"; artifacts = "the
next job depends on this existing."** Never use cache to pass build output
to a later stage — eventual cache eviction breaks the pipeline
non-deterministically, in a way that looks unrelated to the actual code
change.

### 5.7 Environments, review apps, and manual gates

`environment:` ties a job to a named deployment target (`staging`,
`production`, `review/$CI_COMMIT_REF_SLUG`), which gives a visible
deployment history in the GitLab UI, one-click rollback to a prior
successful deployment, and — combined with `when: manual` — a human
approval gate before the job runs.

**Review apps** are dynamic, per-merge-request environments: spin one up
for each MR, tear it down when the MR closes, so reviewers/QA can hit a
live, isolated deployment without a shared staging bottleneck.

```yaml
review:
  stage: deploy
  script: [deploy-review.sh]
  environment:
    name: review/$CI_COMMIT_REF_SLUG
    url: https://$CI_COMMIT_REF_SLUG.review.example.com
    on_stop: stop_review
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"

stop_review:
  stage: deploy
  script: [teardown-review.sh]
  environment:
    name: review/$CI_COMMIT_REF_SLUG
    action: stop
  when: manual
  rules:
    - if: $CI_PIPELINE_SOURCE == "merge_request_event"
```

`environment:` only *records* the deployment for tracking/rollback UI — it
doesn't deploy anything by itself; the actual deploy still happens in
`script:`.

### 5.8 Merge request workflow

- **MR approvals** — required approvers (by count or rule, e.g. "2
  approvals from @security-team") configured per project, enforced before
  the merge button is available.
- **"Pipeline must succeed"** — an MR setting that blocks merging until the
  associated pipeline is green, even if approvals are already in place.
- **Merge trains** — when multiple MRs target the same protected branch at
  once, GitLab queues them into a train and runs each one's pipeline as if
  prior queued MRs had already merged, merging in order only if each
  pipeline passes — avoiding the classic "two green MRs together break
  main" failure of naive parallel merging.
- **Pipelines for merge requests** (`if: $CI_PIPELINE_SOURCE ==
  "merge_request_event"`) run against the *merged result* of source +
  target branch, catching integration issues before merge — distinct from
  a branch pipeline that only tests the source branch in isolation.

---

## 6. GitHub Actions

GitHub Actions is GitHub's native CI/CD, config as YAML workflow files under
`.github/workflows/`, with a marketplace of reusable community/vendor
"actions" as its core reuse mechanism.

### 6.1 Core architecture

- **Workflow** — a YAML file defining triggers and jobs; multiple workflow
  files can coexist per repo (`ci.yml`, `release.yml`, etc.).
- **Job** — runs on a **runner** (GitHub-hosted `ubuntu-latest`/`windows-
  latest`/`macos-latest`, or self-hosted); jobs run in parallel by default
  unless `needs:` links them.
- **Step** — a single command or an **action** (a reusable packaged unit,
  either from the Marketplace like `actions/checkout@v4`, or custom/local).
- **Action** — the reusable building block GitHub Actions is named after;
  can be a Docker container action, a JavaScript action, or a composite
  action combining multiple steps.

### 6.2 Example workflow

```yaml
# .github/workflows/ci-cd.yml
name: CI/CD

on:
  push:
    branches: [main]
  pull_request:

env:
  IMAGE_TAG: ghcr.io/${{ github.repository }}:${{ github.sha }}

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Build image
        run: docker build -t $IMAGE_TAG .
      - name: Push image
        run: |
          echo "${{ secrets.GHCR_TOKEN }}" | docker login ghcr.io -u ${{ github.actor }} --password-stdin
          docker push $IMAGE_TAG

  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ["3.10", "3.11", "3.12"]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: ${{ matrix.python-version }}
      - run: pip install -r requirements.txt
      - run: pytest --junitxml=report.xml
      - uses: actions/upload-artifact@v4
        with:
          name: test-report-${{ matrix.python-version }}
          path: report.xml

  deploy:
    needs: [build, test]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment:
      name: production
      url: https://myapp.example.com
    steps:
      - name: Deploy
        run: kubectl set image deployment/myapp myapp=${{ env.IMAGE_TAG }}
```

### 6.3 Key building blocks

| Construct | Purpose |
|---|---|
| `on` | Triggers — `push`, `pull_request`, `schedule` (cron), `workflow_dispatch` (manual), `workflow_call` (reusable workflow) |
| `jobs.<id>.needs` | Job dependency graph — without it, jobs run fully in parallel |
| `strategy.matrix` | Fan out one job definition across combinations (OS × language version, etc.) — each combination is its own job run |
| `secrets` / `vars` | Repo/org/environment-scoped secrets and plain variables, injected via `${{ secrets.X }}` |
| `environment` | Attaches deployment protection rules (required reviewers, wait timers) to a job — GitHub's approval gate mechanism |
| Reusable workflows (`workflow_call`) / composite actions | DRY mechanisms — a whole workflow or a bundle of steps callable from other workflows |
| Marketplace actions | Prebuilt steps (`actions/checkout`, `docker/build-push-action`, `aws-actions/configure-aws-credentials`) — the ecosystem GitHub leans on instead of Jenkins-style plugins |

---

## 7. Side-by-Side Comparison

| Concept | Jenkins | GitLab CI | GitHub Actions |
|---|---|---|---|
| Config file | `Jenkinsfile` (Groovy) | `.gitlab-ci.yml` (YAML) | `.github/workflows/*.yml` (YAML) |
| Hosting | Self-hosted (you run the controller) | Built into GitLab (SaaS or self-managed) | Built into GitHub (SaaS or self-hosted runners) |
| Execution unit | `agent`/node | Runner | Runner |
| Reuse mechanism | Shared libraries, plugins | `extends`, `include`, templates | Composite/reusable actions, Marketplace |
| Parallel jobs | `parallel {}` block | Same `stage`, different jobs (or `needs` for DAG) | Default (unless `needs` links them) |
| Manual approval | `input` step, or plugin-based gates | `rules: when: manual` | `environment` protection rules |
| Matrix builds | Scripted loops / `matrix` (declarative, plugin-assisted) | `parallel: matrix:` | `strategy: matrix:` (native, first-class) |
| Secrets | Credentials plugin/store | CI/CD variables (masked, protected) | `secrets` context, environment secrets |
| Extensibility model | Plugins (thousands, variable quality) | Native features + templates | Marketplace actions (community-driven) |

---

## 8. Secrets Management

- Never hardcode secrets in pipeline YAML/Groovy — inject via the platform's
  secret store (Jenkins Credentials, GitLab CI/CD Variables marked
  **masked** + **protected**, GitHub Actions `secrets`).
- **Protected/masked** variables should be scoped to protected branches/tags
  only — an MR from a fork shouldn't have access to production deploy
  credentials.
- Prefer **short-lived, scoped credentials** over long-lived static keys —
  e.g., OIDC federation (GitHub Actions → AWS/GCP/Azure via
  `id-token: write` + `aws-actions/configure-aws-credentials`) issues a
  temporary token per run instead of storing a static cloud access key as a
  secret at all.
- Secrets should never be echoed to logs; all three platforms mask known
  secret values in log output automatically, but a value derived/transformed
  from a secret (base64, concatenated string) can leak past the mask — avoid
  printing secret-derived values even "for debugging."

```yaml
# GitHub Actions — OIDC to AWS, no static keys stored anywhere
permissions:
  id-token: write
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@v4
    with:
      role-to-assume: arn:aws:iam::123456789012:role/gha-deploy-role
      aws-region: us-east-1
```

---

## 9. Common Pitfalls

- **Non-idempotent deploy steps** — a deploy script that isn't safe to
  re-run (e.g., blindly `INSERT`s instead of upserting) turns a simple retry
  into a bigger incident.
- **No caching strategy** — reinstalling all dependencies from scratch every
  run inflates pipeline time from minutes to tens of minutes at scale;
  conversely, over-aggressive caching (stale cache never invalidated) causes
  "works in CI, fails in prod" drift.
- **Flaky tests treated as normal** — a team that habitually re-runs a red
  pipeline "because it's just flaky" has effectively disabled CI as a safety
  net; flaky tests should be quarantined and fixed, not tolerated.
- **Missing timeout on jobs** — a hung job (waiting on a dead external
  service) can occupy a runner/agent indefinitely and block a whole queue.
- **Secrets leaking via fork PRs** — public repos must not expose secrets to
  workflows triggered by pull requests from forks (`pull_request_target`
  misuse is a classic GitHub Actions security bug).
- **Deploying straight to prod with no staged rollout** — skipping
  canary/rolling stages means the first signal of a bad build is a full
  production incident, not a contained blast radius.
- **Blue/green rollback that isn't actually instant** — flipping via a slow
  DNS TTL update (propagation can take minutes and is cached client-side)
  instead of the load balancer/service selector defeats the entire point
  of blue/green; the flip must happen at the LB/router layer to be
  instant.
- **Pipeline as an untested black box** — pipeline definitions are code;
  changes to them deserve review just like application code, since a bad
  `Jenkinsfile`/`.yml` change can silently stop deploying entirely.

---

## 10. Interview-Ready Q&A

**Q: What's the practical difference between Continuous Delivery and
Continuous Deployment?**
A: Both guarantee that every passing change is packaged into a
release-ready artifact automatically. Continuous Delivery keeps a manual
approval gate before production; Continuous Deployment removes that gate so
every green build ships to production automatically. The distinction is
about the *last* step, not the pipeline's rigor — both require the same
level of automated test confidence to be safe.

**Q: Blue/green vs. canary — when would you pick one over the other?**
A: Blue/green gives instant, all-at-once cutover and instant rollback by
flipping a router — good when you want simplicity and can afford double
infrastructure briefly. Canary routes a small percentage of real traffic to
the new version first and watches metrics before ramping up — better when
you want to limit blast radius and catch regressions with real traffic
before 100% of users see them, at the cost of needing solid
metrics/automation to make the go/no-go call.

**Q: In GitLab CI, what's the difference between `rules` and the older
`only`/`except`?**
A: `only`/`except` are simpler branch/tag/event filters from GitLab CI's
earlier design; `rules` is the modern replacement that supports richer
conditionals (`if`, `changes`, `exists`) and can also set `when` (on_success,
manual, delayed) per condition. `rules` is more expressive and is what
GitLab recommends for new pipelines — `only`/`except` still work but are
considered legacy.

**Q: How do GitHub Actions matrix builds work, and what's a common use for
them?**
A: `strategy.matrix` defines a set of variable combinations (e.g., multiple
Python versions × multiple OSes); GitHub Actions runs the job once per
combination in parallel, each as its own independent job run. It's commonly
used to test a library against a support matrix (multiple language/runtime
versions) without duplicating job definitions.

**Q: Why prefer OIDC-based cloud authentication over static secrets in CI/CD?**
A: Static secrets (long-lived cloud access keys stored as CI secrets) are a
high-value target if the CI system is compromised, and they don't expire on
their own. OIDC federation lets the CI platform present a signed token that
the cloud provider exchanges for a short-lived, narrowly-scoped credential
per run — nothing long-lived is stored anywhere, and a leaked token from one
run is worthless shortly after.

**Q: A deploy job in your pipeline needs a human to click approve before it
touches production. How would you implement that in each of the three
tools?**
A: Jenkins uses an `input` step (declarative) or a manual-approval plugin
that pauses the pipeline; GitLab CI sets `when: manual` on the job under
`rules`, which pauses the pipeline at that job until triggered in the UI;
GitHub Actions attaches an `environment` with required reviewers to the job,
which blocks the job from starting until someone approves the deployment.

**Q: What's the risk with `pull_request_target` in GitHub Actions, and how do
teams get burned by it?**
A: Unlike `pull_request`, `pull_request_target` runs with the *base* repo's
permissions and secrets even for PRs from forks — if the workflow also
checks out and executes the fork's untrusted code (a common mistake), an
attacker can use a malicious PR to exfiltrate secrets or run arbitrary code
with write access. The fix is to never combine `pull_request_target` with
checking out and running untrusted PR code, or to gate any such step behind
manual approval.

**Q: How would you reduce a 20-minute CI pipeline down significantly without
just buying bigger runners?**
A: Parallelize independent jobs (split test suites across matrix shards
instead of running serially), cache dependencies keyed on lockfile hash
instead of reinstalling every run, use `needs`/DAG-based job graphs instead
of strict sequential stages so jobs start as soon as their actual
dependencies finish, and fail fast — run cheap/fast checks (lint, unit
tests) before expensive ones (integration, e2e) so a broken build is caught
in seconds, not after a 15-minute build step.

**Q: What does ArgoCD's `selfHeal: true` actually do, and why does it
surprise engineers the first time they hit it?**
A: With `selfHeal: true`, ArgoCD continuously reconciles the live cluster
to match the Git-declared state — if someone runs `kubectl scale ...
--replicas=50` or otherwise hand-edits a resource directly against the
cluster, ArgoCD silently reverts it back to Git's declared state within
seconds. That's correct behavior, not a bug: under GitOps the
incident-response move is "fix Git and let it reconcile," not "patch the
cluster and remember to backport it" — the surprise is usually a sign the
team hasn't internalized that Git, not the live cluster, is the source of
truth.

**Q: Why pin a Jenkins shared library to a tag (`@Library('my-lib@v2.1.0')`)
instead of tracking `@main` in production pipelines?**
A: A shared library centralizes pipeline logic reused across many repos, so
an unreviewed change pushed to its default branch takes effect in every
consuming pipeline's very next run simultaneously — there's no staged
rollout. Pinning to a version tag turns a library upgrade into a
deliberate, reviewable change per consumer, the same discipline you'd
apply to any shared dependency.

**Q: In GitLab CI, why is it a mistake to use `cache` to pass a build's
output to the next stage?**
A: Cache is a best-effort performance optimization — it's keyed (often
per-branch), can be evicted at any time, and a cache miss is treated as
normal, not an error. Artifacts are the guaranteed mechanism: if the
producing job succeeds, its declared artifacts are guaranteed available to
jobs that `need` it. Relying on cache for this makes the pipeline
non-deterministic — it works until the cache is evicted, then fails in a
way that looks unrelated to the actual change.

**Q: What problem do GitLab merge trains solve that per-MR pipelines alone
don't?**
A: Two MRs can each pass CI independently against the current `main`, but
still break `main` once both are merged, if their combined changes
conflict logically (not just textually, so Git itself sees no merge
conflict). A merge train queues MRs targeting the same protected branch and
runs each one's pipeline as if the prior queued MRs had already merged,
only merging in order if that pipeline is still green — catching the "two
green MRs together break main" case before it happens instead of after.

---

## 11. One-Line Summary

**CI/CD automates build-test-deploy into a repeatable pipeline — the concepts
(stages, artifacts, environments, deployment strategy) are universal, and
Jenkins, GitLab CI, and GitHub Actions just differ in where the pipeline
lives, how you extend it, and how the approval gate is expressed.**
