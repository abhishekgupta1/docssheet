---
title: "Kubernetes: The Complete Guide"
description: "End-to-end reference for Kubernetes — architecture, core objects, networking, scheduling, health checks, rollouts, and interview-ready Q&A."
sidebar_position: 1
tags: [kubernetes, sre, containers, orchestration]
---

# Kubernetes — The Complete Guide

A single-read, end-to-end reference for Kubernetes: enough to operate a
cluster in production, debug a broken deployment at 2am, or walk into an
SRE interview. Organized as a lookup you can also read top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/kubernetes">📋 Quick reference: Kubernetes →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 260" role="img" aria-labelledby="mm-k8s-title mm-k8s-desc">
<title id="mm-k8s-title">The Kubernetes reconciliation loop</title>
<desc id="mm-k8s-desc">A controller continuously compares the desired state you declare against the actual state of the cluster, and takes action to reconcile any difference.</desc>
<defs>
  <marker id="mm-k8s-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n1" x="40" y="90" width="200" height="70" rx="10"/>
<text class="mm-node-title" x="140" y="118" text-anchor="middle">Desired State</text>
<text class="mm-node-sub" x="140" y="135" text-anchor="middle">e.g. 3 replicas of v2</text>

<rect class="mm-n5" x="310" y="90" width="200" height="70" rx="10"/>
<text class="mm-node-title" x="410" y="118" text-anchor="middle">Controller</text>
<text class="mm-node-sub" x="410" y="135" text-anchor="middle">compare &amp; reconcile</text>

<rect class="mm-n3" x="580" y="90" width="200" height="70" rx="10"/>
<text class="mm-node-title" x="680" y="118" text-anchor="middle">Actual State</text>
<text class="mm-node-sub" x="680" y="135" text-anchor="middle">what's running now</text>

<path class="mm-arrow" d="M240,125 L308,125" marker-end="url(#mm-k8s-arrow)"/>
<path class="mm-arrow" d="M510,125 L578,125" marker-end="url(#mm-k8s-arrow)"/>
<path class="mm-arrow" d="M680,160 C680,220 410,220 410,162" marker-end="url(#mm-k8s-arrow)"/>

<text class="mm-flow-label" x="545" y="205" text-anchor="middle">continuously observes &amp; reconciles</text>
</svg>

<p class="mental-model__caption">Kubernetes is one loop running forever: a controller reads what you declared, checks it against what's actually running, and pushes the cluster toward the declared state whenever they drift apart — no single command ever "does the deployment," the loop just keeps closing the gap.</p>
</div>

## 1. What Kubernetes Is and Why It Exists

Kubernetes (K8s) is a **container orchestration platform** — it schedules
containers onto machines, keeps the declared number running, restarts what
fails, load-balances traffic to them, and rolls out changes with zero
downtime, all driven by a **declarative desired state** you describe in
YAML rather than a sequence of imperative commands.

The core loop, everywhere in Kubernetes: you declare *what you want*
(a Deployment with 3 replicas of image `v2`), a **controller** continuously
compares that to *what exists*, and reconciles the difference. This
**reconciliation loop** pattern is the single most important mental model —
almost every K8s object works this way.

---

## 2. Architecture

```
┌───────────────────────── Control Plane ─────────────────────────┐
│  API Server  ←→  etcd (cluster state, key-value store)           │
│      ↑                                                            │
│  Scheduler (assigns Pods to Nodes)                                │
│  Controller Manager (runs reconciliation loops: Deployment,       │
│                       Node, ReplicaSet, Job controllers, etc.)    │
│  Cloud Controller Manager (cloud-provider-specific integrations)  │
└─────────────────────────────┬──────────────────────────────────┘
                               │
              ┌────────────────┼────────────────┐
              ▼                ▼                ▼
        ┌───────────┐   ┌───────────┐    ┌───────────┐
        │  Node 1    │   │  Node 2    │    │  Node 3    │
        │  kubelet   │   │  kubelet   │    │  kubelet   │
        │  kube-proxy│   │  kube-proxy│    │  kube-proxy│
        │  container │   │  container │    │  container │
        │  runtime   │   │  runtime   │    │  runtime   │
        │  (pods)    │   │  (pods)    │    │  (pods)    │
        └───────────┘   └───────────┘    └───────────┘
```

### Control plane components

| Component | Responsibility |
|---|---|
| **API Server** | The only component everything talks to — validates and persists requests, exposes the REST/kubectl API |
| **etcd** | Distributed, consistent key-value store holding all cluster state — the single source of truth. Losing etcd means losing the cluster's brain |
| **Scheduler** | Watches for unscheduled Pods, picks a Node for each based on resource requests, affinity rules, taints/tolerations |
| **Controller Manager** | Runs the built-in reconciliation loops (Deployment → ReplicaSet → Pod, Node health, etc.) |
| **Cloud Controller Manager** | Talks to the cloud provider API for things like provisioning LoadBalancer-type Services or attaching cloud disks |

### Node components

| Component | Responsibility |
|---|---|
| **kubelet** | The agent on every node; ensures containers described in assigned PodSpecs are running and healthy, reports node/pod status back to the API server |
| **kube-proxy** | Maintains network rules (iptables/IPVS) on each node implementing the Service abstraction — routes traffic to the right Pod backends |
| **Container runtime** | Actually runs containers (containerd, CRI-O — Docker Engine itself was deprecated as a runtime; the **CRI**, Container Runtime Interface, is the standard) |

---

## 3. Core Objects

### Pod

The smallest deployable unit — one or more containers that share network
namespace (same IP, `localhost` between them) and storage volumes. Pods are
**ephemeral and disposable** — you almost never create bare Pods directly in
production; a higher-level controller manages them.

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: checkout-debug
spec:
  containers:
    - name: app
      image: checkout-service:1.4.2
      ports:
        - containerPort: 8080
```

### ReplicaSet

Ensures a specified number of identical Pod replicas are running at all
times, replacing any that die. You rarely write ReplicaSets by hand — a
Deployment manages one for you.

### Deployment

The standard way to run stateless workloads. Manages a ReplicaSet, and
manages *transitions between* ReplicaSets — this is what powers rolling
updates and rollbacks.

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: checkout-service
spec:
  replicas: 3
  selector:
    matchLabels:
      app: checkout-service
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  template:
    metadata:
      labels:
        app: checkout-service
    spec:
      containers:
        - name: app
          image: checkout-service:1.4.2
          resources:
            requests: { cpu: "250m", memory: "256Mi" }
            limits:   { cpu: "500m", memory: "512Mi" }
```

### Service

A stable network identity (virtual IP + DNS name) in front of a dynamic set
of Pods, selected by label. Solves the problem that Pods are ephemeral and
get new IPs on every restart.

| Service type | Behavior |
|---|---|
| **ClusterIP** (default) | Internal-only virtual IP, reachable within the cluster |
| **NodePort** | Exposes a static port on every Node's IP, routes into the ClusterIP |
| **LoadBalancer** | Provisions a cloud load balancer (via Cloud Controller Manager) pointing at the Service |
| **ExternalName** | DNS CNAME alias to an external service — no proxying, pure DNS |

### Ingress

L7 HTTP(S) routing into the cluster — host/path-based routing, TLS
termination — implemented by an **Ingress Controller** (nginx-ingress,
AWS Load Balancer Controller, Traefik, etc.); the Ingress *resource* is just
the routing spec, the controller does the actual proxying.

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: checkout-ingress
  annotations:
    nginx.ingress.kubernetes.io/rewrite-target: /
spec:
  rules:
    - host: shop.example.com
      http:
        paths:
          - path: /checkout
            pathType: Prefix
            backend:
              service:
                name: checkout-service
                port: { number: 80 }
```

### ConfigMap and Secret

Externalize configuration from container images — same image, different
config per environment.

```yaml
apiVersion: v1
kind: ConfigMap
metadata: { name: app-config }
data:
  LOG_LEVEL: "info"
  FEATURE_FLAG_NEW_CHECKOUT: "true"
---
apiVersion: v1
kind: Secret
metadata: { name: db-credentials }
type: Opaque
data:
  password: cGFzc3dvcmQxMjM=   # base64-encoded, NOT encrypted at rest by default
```

**Gotcha:** Secrets are base64-**encoded**, not encrypted — anyone with API
access can decode them trivially. Enable **encryption at rest** for etcd
and consider an external secrets manager (Vault, AWS Secrets Manager +
External Secrets Operator) for real secret hygiene.

### StatefulSet vs. Deployment

| | Deployment | StatefulSet |
|---|---|---|
| Pod identity | Interchangeable, random names/IPs | Stable, ordered identity (`db-0`, `db-1`, `db-2`) |
| Storage | Shared or none; PVCs not guaranteed sticky | Each replica gets its own persistent, sticky PVC |
| Scaling/updates | Parallel, any order | Ordered — sequential creation, deletion, and rolling updates |
| Use case | Stateless web/API services | Databases, queues, anything needing stable network identity or per-replica storage (Kafka, Elasticsearch, PostgreSQL clusters) |

### DaemonSet

Ensures exactly one copy of a Pod runs on every (or a selected subset of)
Node — the pattern for node-level agents: log shippers (Fluent Bit), metrics
collectors (node_exporter, the OpenTelemetry Collector agent), CNI plugins.

### Job and CronJob

`Job` runs a Pod to completion (retries on failure, up to a backoff limit) —
for one-off or batch tasks. `CronJob` runs a `Job` on a schedule using
standard cron syntax — for periodic tasks (nightly reports, cleanup jobs).

---

## 4. The Networking Model

Kubernetes networking rests on a small set of hard requirements every CNI
plugin (Calico, Cilium, Flannel, AWS VPC CNI) must satisfy:

1. Every Pod gets its own **unique IP** — no NAT needed between Pods, even
   across Nodes.
2. Pods can communicate with all other Pods across Nodes **without NAT**.
3. Agents on a Node (kubelet) can communicate with all Pods on that Node.

This "flat network" model is deliberately simple at the Pod level; Services
and Ingress layer stable identity and routing on top of it. **Network
Policies** (implemented by the CNI plugin, not all support them — e.g.,
Flannel alone doesn't) provide the equivalent of security groups at the Pod
level:

```yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: deny-from-other-namespaces }
spec:
  podSelector: {}
  policyTypes: [Ingress]
  ingress:
    - from:
        - podSelector: {}   # only allow traffic from pods in the same namespace
```

By default, **all Pod-to-Pod traffic is allowed** — Network Policies are
allow-list/deny-by-selection, and once any policy selects a Pod, only
explicitly allowed traffic gets through to it.

---

## 5. Scheduling

### Resource requests and limits

```yaml
resources:
  requests: { cpu: "250m", memory: "256Mi" }   # scheduler guarantee — used to place the Pod
  limits:   { cpu: "500m", memory: "512Mi" }   # hard ceiling — enforced at runtime
```

- **Requests** determine scheduling — the scheduler only places a Pod on a
  Node with enough *unreserved* capacity to satisfy the request.
- **Limits** are enforced by the kubelet/runtime at runtime. Exceeding a
  **memory** limit gets the container **OOMKilled**. Exceeding a **CPU**
  limit just throttles the container (CPU is compressible, memory is not) —
  this asymmetry is a common point of confusion.
- Pods with no limits set can consume unbounded resources and starve
  neighbors — always set both in production manifests.

### Affinity, anti-affinity, taints, and tolerations

```yaml
affinity:
  podAntiAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      - labelSelector:
          matchExpressions:
            - { key: app, operator: In, values: [checkout-service] }
        topologyKey: kubernetes.io/hostname   # spread replicas across nodes
  nodeAffinity:
    requiredDuringSchedulingIgnoredDuringExecution:
      nodeSelectorTerms:
        - matchExpressions:
            - { key: node-type, operator: In, values: [compute-optimized] }
tolerations:
  - key: "dedicated"
    operator: "Equal"
    value: "gpu"
    effect: "NoSchedule"
```

- **Node affinity** — prefer/require Pods to land on Nodes matching a label
  (`nodeSelector` is the older, simpler equivalent for the "required" case).
- **Pod affinity/anti-affinity** — schedule Pods relative to *other Pods*
  (e.g., spread replicas across Nodes/AZs for HA, or co-locate a cache next
  to the service that uses it).
- **Taints** (on a Node) repel Pods unless they carry a matching
  **Toleration** — the mechanism behind dedicated node pools (GPU nodes,
  spot-instance nodes) where you don't want arbitrary workloads scheduled.
  Taints keep Pods *out*; tolerations let specific Pods back *in* — they
  don't force placement (use node affinity for that).

---

## 6. Health Checks: Probes

| Probe | Purpose | Failure action |
|---|---|---|
| **Liveness** | "Is this container still working?" | kubelet **restarts** the container |
| **Readiness** | "Is this container ready to serve traffic?" | Pod removed from **Service endpoints** (not restarted) |
| **Startup** | "Has this slow-starting container finished initializing?" | Blocks liveness/readiness checks until it succeeds, then hands off |

```yaml
livenessProbe:
  httpGet: { path: /healthz, port: 8080 }
  initialDelaySeconds: 10
  periodSeconds: 10
  failureThreshold: 3
readinessProbe:
  httpGet: { path: /ready, port: 8080 }
  periodSeconds: 5
  failureThreshold: 2
startupProbe:
  httpGet: { path: /healthz, port: 8080 }
  failureThreshold: 30
  periodSeconds: 5   # allows up to 150s to start before liveness kicks in
```

**Common misconfiguration:** using the same endpoint/logic for liveness and
readiness. A liveness probe that fails during a temporary downstream
dependency outage causes an unnecessary **restart storm** — that's a
readiness concern (stop routing traffic), not a liveness one (the process
itself is fine). Liveness should only check "is my own process alive/not
deadlocked," not "are my dependencies healthy."

---

## 7. Rolling Updates and Rollbacks

Deployments default to `RollingUpdate` strategy — replace old Pods with new
ones incrementally, controlled by `maxSurge` (extra Pods allowed above
desired count during rollout) and `maxUnavailable` (how many can be down at
once).

```bash
kubectl set image deployment/checkout-service app=checkout-service:1.5.0
kubectl rollout status deployment/checkout-service
kubectl rollout history deployment/checkout-service
kubectl rollout undo deployment/checkout-service              # roll back one revision
kubectl rollout undo deployment/checkout-service --to-revision=3
kubectl rollout history deployment/checkout-service --revision=3   # diff a specific revision
kubectl rollout restart deployment/checkout-service            # force new Pods without a spec change
kubectl rollout pause deployment/checkout-service               # freeze mid-rollout to inspect canary Pods
kubectl rollout resume deployment/checkout-service
```

- `kubectl apply` returns as soon as the API server accepts the new spec —
  it does **not** wait for the rollout to finish. Chain a `rollout status`
  if you need to block on success/failure:
  `kubectl apply -f deployment.yaml && kubectl rollout status deployment/checkout-service`.
- `rollout restart` is the standard way to force Pods to re-read a
  mounted ConfigMap or Secret after it changes — Pods don't auto-reload
  those on their own, since only the *mount* is watched at pod-creation
  time, not its contents.
- `maxUnavailable: 0, maxSurge: 1` gives a zero-downtime rollout at the cost
  of briefly running one extra Pod.
- A rollout only proceeds past each batch once new Pods pass their
  **readiness probe** — this is the actual safety mechanism, not a timer.
- `Recreate` strategy (kill all old Pods, then start new ones) is used when
  the app can't tolerate old and new versions running simultaneously (rare;
  causes a downtime window).

---

## 8. kubectl Essentials

```bash
# Inspect
kubectl get pods -n checkout -o wide
kubectl describe pod checkout-service-6d9f8c7b9-xk2lp -n checkout
kubectl get events -n checkout --sort-by=.lastTimestamp
kubectl logs checkout-service-6d9f8c7b9-xk2lp -c app --previous   # logs from the crashed container

# Debug
kubectl exec -it checkout-service-6d9f8c7b9-xk2lp -- /bin/sh
kubectl port-forward svc/checkout-service 8080:80
kubectl top pods -n checkout                                       # requires metrics-server

# Apply / manage
kubectl apply -f deployment.yaml
kubectl diff -f deployment.yaml            # preview change before applying
kubectl scale deployment/checkout-service --replicas=5
kubectl delete pod checkout-service-6d9f8c7b9-xk2lp   # controller recreates it

# Context
kubectl config get-contexts
kubectl config use-context prod-cluster
kubectl config set-context --current --namespace=checkout
```

`kubectl describe` is almost always the first move when debugging — its
**Events** section at the bottom shows scheduling failures, image pull
errors, probe failures, and OOM kills in plain English before you need logs.

### Context and Namespace Management

A **kubeconfig** (`~/.kube/config` by default, or `$KUBECONFIG`) holds
clusters, users (credentials), and **contexts** — a cluster+user+namespace
tuple. Switching context switches which cluster and identity *every*
subsequent command targets; running a command against the wrong context is
one of the most common causes of "I fixed prod" turning out to mean
staging (or vice versa).

```bash
kubectl config view --minify          # show only the active context
kubectl config get-contexts           # list all contexts, * marks current
kubectl config current-context
kubectl config use-context staging-cluster
kubectl config set-context --current --namespace=checkout
```

Namespaces are a soft multi-tenancy boundary — RBAC, ResourceQuotas, and
NetworkPolicies commonly scope to them. `kubectl get pods` without `-n`
or `--all-namespaces` only shows whatever namespace is baked into your
current context (`default` if it was never set).

### Label Selectors

Labels are arbitrary key/value pairs on objects; selectors are how
Services, Deployments, and `kubectl` itself find the right set of Pods. A
Deployment's `spec.selector.matchLabels` **must** match
`spec.template.metadata.labels` or the object is rejected outright — one
of the most common manifest-authoring mistakes for newcomers — and that
selector is **immutable** after creation, so a mismatch can't be patched
away later, only fixed by recreating the Deployment.

```bash
kubectl get pods -l app=checkout-service,tier=backend
kubectl get pods -l 'environment in (prod,staging)'
kubectl label pod checkout-service-6d9f8c7b9-xk2lp debug=true
kubectl delete pods -l app=checkout-service,version=v1   # bulk delete by selector
```

### QoS Classes

The requests/limits from §5 also determine a Pod's **Quality of Service**
class, which decides eviction order under node memory pressure — this is
*derived* automatically from the manifest, never declared directly:

| QoS class | How it's assigned | Eviction priority |
|---|---|---|
| **Guaranteed** | `requests == limits` for CPU *and* memory, on every container | Evicted last |
| **Burstable** | At least one request/limit is set, but not equal across the board | Evicted after BestEffort |
| **BestEffort** | No requests or limits set at all | Evicted first |

A Pod with no requests/limits isn't just a scheduling risk — it's the
first thing killed when a Node runs low on memory, regardless of how
important that workload actually is.

### More Workflow Commands

```bash
# Sort by restart count to find the pod that's actually flapping
kubectl get pods -n checkout -l app=checkout-service \
  --sort-by='.status.containerStatuses[0].restartCount'

# Generate a manifest skeleton without hitting the API server
kubectl create deployment checkout-service --image=checkout-service:1.4.2 \
  --dry-run=client -o yaml > deployment.yaml

# Extract fields for scripting
kubectl get pods -n checkout -o jsonpath='{range .items[*]}{.metadata.name}{"\t"}{.spec.containers[0].image}{"\n"}{end}'
kubectl get pods -n checkout -o custom-columns=NAME:.metadata.name,STATUS:.status.phase,NODE:.spec.nodeName

# Shell into a distroless/no-shell image via an ephemeral debug container
kubectl debug -it checkout-service-6d9f8c7b9-xk2lp -n checkout \
  --image=busybox:1.36 --target=app

# Node-level triage when many pods are Pending/Evicted at once
kubectl describe node <node>            # check Conditions: MemoryPressure, DiskPressure
kubectl top nodes                       # requires metrics-server
kubectl top pods -n checkout --sort-by=memory
```

`kubectl debug --target` shares the target container's process
namespace, so `ps`, network tools, and `/proc/<pid>` from the throwaway
debug container can inspect the real, shell-less workload.

### A Complete Deployment + Service Example

Putting requests/limits (§5), probes (§6), and rollout strategy (§7)
together into one realistic manifest:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: checkout-service
  namespace: checkout
  labels:
    app: checkout-service
spec:
  replicas: 3
  revisionHistoryLimit: 5
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1
      maxUnavailable: 0
  selector:
    matchLabels:
      app: checkout-service
  template:
    metadata:
      labels:
        app: checkout-service
    spec:
      containers:
        - name: app
          image: checkout-service:1.4.2
          ports:
            - containerPort: 8080
          env:
            - name: DB_HOST
              valueFrom:
                configMapKeyRef: { name: checkout-config, key: db_host }
            - name: DB_PASSWORD
              valueFrom:
                secretKeyRef: { name: checkout-secrets, key: db_password }
          resources:
            requests: { cpu: "250m", memory: "256Mi" }
            limits:   { cpu: "500m", memory: "512Mi" }
          readinessProbe:
            httpGet: { path: /healthz/ready, port: 8080 }
            initialDelaySeconds: 5
            periodSeconds: 10
          livenessProbe:
            httpGet: { path: /healthz/live, port: 8080 }
            initialDelaySeconds: 15
            periodSeconds: 20
            failureThreshold: 3
---
apiVersion: v1
kind: Service
metadata:
  name: checkout-service
  namespace: checkout
spec:
  type: ClusterIP
  selector:
    app: checkout-service
  ports:
    - port: 80
      targetPort: 8080
      protocol: TCP
```

With `maxUnavailable: 0` and `maxSurge: 1`, the rollout never drops below
the current replica count — it adds one new Pod, waits for it to pass
`readinessProbe`, retires one old Pod, and repeats. That's zero-downtime
*if and only if* the readiness probe is accurate.

---

## 9. Troubleshooting

### CrashLoopBackOff

The container starts, exits (crashes or the process itself exits), and
Kubernetes restarts it with exponential backoff, repeating.

```bash
kubectl describe pod <pod>          # check Last State: Terminated, Reason/Exit Code
kubectl logs <pod> --previous       # logs from the crashed instance, not the new restart attempt
```

| Exit code / symptom | Likely cause |
|---|---|
| Exit 1 / app-specific error | Application bug, bad config, missing env var |
| Exit 137 | OOMKilled — container hit its memory limit |
| Exit 143 | SIGTERM — often a graceful shutdown not handling the signal in time |
| No logs at all | Container never started — bad command/entrypoint, missing binary |
| `Terminating` stuck | A finalizer is blocking, or a `preStop` hook is hanging |

The order of operations: `describe` for the *reason* (Terminated:
OOMKilled, or ContainerCannotRun), `logs --previous` for the *why* from the
application's own output.

**Full walkthrough, in order, the moment you see `CrashLoopBackOff`:**

1. `kubectl get pod <pod>` — confirm the failure mode and restart count.
2. `kubectl describe pod <pod>` — read **Events** at the bottom first;
   scheduling failures, image pull errors, OOMKilled, and failed probes
   all show up here before you touch a single log line.
3. `kubectl logs <pod> -c <container>` — the *current* container's
   stdout/stderr. If it already restarted, this is the new process, which
   can look perfectly healthy so far and tell you nothing about the crash.
4. `kubectl logs <pod> -c <container> --previous` — **the step people
   skip.** Once a restart has happened, this is the only place the actual
   crash reason lives; the current container's logs won't show it.
5. `kubectl exec -it <pod> -- /bin/sh` — only works if the container
   stays up long enough to attach. If it's crash-looping too fast to
   exec into, run a disposable Pod with the same image and an overridden
   entrypoint instead:
   `kubectl run debug-shell --rm -it --image=<same-image> --restart=Never --command -- /bin/sh`
6. `kubectl get events -n <namespace> --sort-by='.lastTimestamp'` —
   namespace-wide and sorted; catches things `describe` truncates, or
   that happened to a *different* object (a quota change, a node drain)
   around the same time.

### Pod stuck in Pending

Means the scheduler cannot place the Pod. `kubectl describe pod` Events
will say why:

- **Insufficient cpu/memory** — no Node has enough unreserved capacity to
  satisfy requests; scale the node pool or lower requests.
- **Unbound PersistentVolumeClaim** — no matching PV/StorageClass available.
- **Taints the Pod doesn't tolerate** — check Node taints vs. Pod
  tolerations.
- **Node affinity/selector doesn't match any Node** — typo'd label is a
  very common cause.

### ImagePullBackOff

Wrong image tag/registry, missing `imagePullSecrets` for a private
registry, or registry auth token expired — `kubectl describe pod` shows the
exact pull error under Events.

### kubectl Debugging Playbook

When something is broken and the cause isn't obvious yet, work this list
top to bottom before going deeper on any single branch:

1. **Confirm context and namespace.** `kubectl config current-context` —
   wrong cluster wastes everything downstream.
2. **Is the object even scheduled?** `kubectl get pods -o wide` — check
   STATUS and NODE columns.
3. **Read the Events, not just the status.** `kubectl describe pod <name>`
   — scheduling, image pull, and probe failures show up here first.
4. **Check current logs, then previous.** `kubectl logs <name>` then
   `kubectl logs <name> --previous` if it has restarted.
5. **Check resource pressure.** `kubectl top pod <name>` and
   `kubectl describe node <node>` — is it OOMKilled or evicted, not
   application-crashed?
6. **Check the controller layer.** `kubectl rollout status` /
   `kubectl get replicaset` — is the Deployment stuck mid-rollout,
   blocking new Pods from becoming ready?
7. **Check connectivity, not just the Pod.** `kubectl get endpoints <service>`
   — if empty, the Service's selector doesn't match any Ready
   Pod, regardless of Pod health.
8. **Check config/secret mounts.** `kubectl exec` in (or `kubectl debug`
   if there's no shell) and verify env vars and mounted files actually
   match what you expect — stale ConfigMap references are common after
   `apply` without `rollout restart`.
9. **Check namespace-wide events for the bigger picture.**
   `kubectl get events -n <ns> --sort-by='.lastTimestamp'` — correlate
   timing with a deploy, node drain, or quota change.
10. **Ask what changed.** `kubectl rollout history`, git log on the
    manifest repo, recent `kubectl apply` — most incidents trace to a
    recent, identifiable change.

---

## 10. Interview-Ready Q&A

**Q: Walk me through what happens when you run `kubectl apply` on a
Deployment manifest.**
A: The API server validates and persists the desired state to etcd. The
Deployment controller notices the new/changed Deployment and creates or
updates a ReplicaSet to match the new Pod template; the ReplicaSet
controller then creates Pod objects to reach the desired replica count. The
scheduler assigns each unscheduled Pod to a Node based on resource requests
and affinity rules, and the kubelet on that Node pulls the image and starts
the containers, reporting status back through the API server the whole way.

**Q: What's the difference between a liveness probe and a readiness probe,
and what goes wrong if you conflate them?**
A: A failed liveness probe restarts the container; a failed readiness probe
just removes the Pod from Service endpoints without restarting it. If you
use the same "deep" health check (one that also pings downstream
dependencies) for both, a temporary downstream outage can trigger
unnecessary restarts of a perfectly healthy process — you want readiness to
pull it out of rotation, not liveness to kill and restart it repeatedly.

**Q: A Pod is stuck in `Pending`. How do you debug it?**
A: `kubectl describe pod` and read the Events section — it directly states
why the scheduler can't place it: insufficient CPU/memory across all
Nodes, an unbound PersistentVolumeClaim with no matching StorageClass/PV, a
node affinity/selector that doesn't match any Node's labels, or a taint on
every eligible Node with no matching toleration on the Pod. It's almost
always one of those four.

**Q: Explain requests vs. limits, and why exceeding a CPU limit behaves
differently from exceeding a memory limit.**
A: Requests are what the scheduler uses to place a Pod — a guarantee of
available capacity on the chosen Node. Limits are enforced at runtime as a
hard ceiling. CPU is a compressible resource, so exceeding the CPU limit
just throttles the container's CPU time; memory is incompressible, so
exceeding the memory limit gets the container OOMKilled — there's no
"slow down" option, the kernel has to reclaim the memory immediately.

**Q: When would you use a StatefulSet instead of a Deployment?**
A: When Pods need stable, unique network identity and/or their own
persistent, sticky storage that follows them across rescheduling — think
databases, message queue brokers, or anything doing peer discovery by
predictable hostname (`kafka-0`, `kafka-1`). A Deployment's Pods are
interchangeable and don't guarantee stable identity or storage-to-Pod
binding, which is fine for stateless services but breaks stateful
clustering logic.

**Q: How does a rolling update actually achieve zero downtime?**
A: `maxUnavailable` and `maxSurge` control the batch size and how many old
Pods can be down at once during the rollout; but the real safety mechanism
is the **readiness probe** — the rollout only proceeds to terminate more
old Pods once new Pods report ready, and the Service only routes traffic to
ready Pods. If a new version's readiness probe never passes, the rollout
stalls with old Pods still serving traffic instead of taking the whole
service down.

**Q: What's the difference between a Service and an Ingress?**
A: A Service is a stable virtual IP/DNS name in front of a set of Pods,
selected by label, and operates mostly at L4 within (or via NodePort/
LoadBalancer, at the edge of) the cluster. An Ingress is an L7 HTTP(S)
routing layer sitting in front of one or more Services — host/path-based
routing and TLS termination — implemented by a separate Ingress Controller
that actually does the proxying; the Ingress resource itself is just the
routing rules.

**Q: Why is a container getting OOMKilled even though the Node has plenty
of free memory?**
A: The kernel enforces the container's own memory **limit**, independent of
what's free on the Node — cgroups cap the container regardless of Node
headroom. If usage crosses the configured `limits.memory`, it gets killed
with exit code 137 even if the Node itself has gigabytes free; the fix is
raising the limit (if the workload legitimately needs more) or fixing a
memory leak, not adding Node capacity.

**Q: `kubectl logs` on a crash-looping Pod shows nothing useful — the app
looks fine. What are you missing?**
A: The `--previous` flag. Once the kubelet has already restarted the
container, `kubectl logs` without it shows the *new* process's output,
which can look perfectly healthy if it hasn't crashed again yet. The
actual crash reason only lives in the previous container instance's log
buffer — `kubectl logs <pod> --previous` — which is why it's the
single most-skipped step in pod debugging.

**Q: What are Kubernetes' three QoS classes, and why do they matter?**
A: `Guaranteed` (requests equal limits, on every container), `Burstable`
(some requests/limits set, but not equal across the board), and
`BestEffort` (neither set). The class is derived automatically from the
manifest, not declared, and it determines eviction order under Node
memory pressure: BestEffort Pods are evicted first, Burstable next, and
Guaranteed last. A Pod with no requests/limits isn't just a scheduling
risk — it's first in line to be killed when a Node runs low on memory.

**Q: Why should you always check `kubectl config current-context` before
running a destructive command?**
A: A kubeconfig can hold many clusters, and `kubectl` silently targets
whichever context is currently active — there's no built-in confirmation
prompt naming the cluster before a `delete` or `apply` runs. Running a
command meant for staging against the context that happens to be set to
prod (or vice versa) is one of the most common self-inflicted incidents
in Kubernetes operations, and it's fully preventable by checking context
(and namespace) first, especially in scripts and CI.

**Q: A Deployment's `spec.selector.matchLabels` doesn't match its
`spec.template.metadata.labels`. What happens, and can you fix it live?**
A: The API server rejects the object outright — a Deployment's selector
must match its own Pod template's labels, or `kubectl apply` fails
validation before anything is created. Worse, `spec.selector` is
**immutable** once the Deployment exists, so you can't relabel your way
out of a mismatch after the fact on an existing object; the only fix is
recreating the Deployment with a consistent selector.

---

## 11. One-Line Summary

**Kubernetes is a declarative reconciliation engine — describe desired
state, let controllers continuously converge reality to match it, and lean
on requests/limits, probes, and rollout strategy to make that convergence
safe under real production failure conditions.**
