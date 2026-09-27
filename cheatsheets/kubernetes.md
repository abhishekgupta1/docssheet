---
title: "Kubernetes Cheat Sheet"
description: "A beginner-to-advanced reference for Kubernetes — pods, deployments, services, config, probes, resources, rollouts, storage, jobs, troubleshooting, scheduling, autoscaling, RBAC, and network policies."
sidebar_position: 3
level: intermediate
tags: [kubernetes, sre, sde, cheat-sheet]
hide_table_of_contents: true
image: /img/social/kubernetes.png
---

# Kubernetes cheatsheet

Learn Kubernetes step by step, from your first pod to locking down who can do
what. Each section has three parts:

- **In short** — the idea in one sentence.
- **Example** — commands and manifests with a comment saying what each does.
- **Try it** — a tiny exercise to check you understood.

Want the longer story behind a topic? The [complete guide](/docs/sre-skills/kubernetes/kubernetes-guide)
walks through it in more depth.

<a class="topic-crosslink" href="/docs/sre-skills/kubernetes/kubernetes-guide">📖 Full guide: Kubernetes →</a>

<LevelBadge level="intermediate" />

<nav class="cheat-jump-nav" aria-label="Kubernetes learning sections">
  <a class="button button--primary" href="/docs/learning-path/kubernetes/kubernetes-learning-path">Learning Path</a>
  <a class="button button--primary" href="/docs/sre-skills/kubernetes/kubernetes-guide">Complete Guide</a>
  <a class="button button--primary" href="/cheatsheets/docker">Docker first</a>
</nav>

:::tip How to use this page

Know the basics of [Docker](/cheatsheets/docker) first — Kubernetes runs
containers. Then create the [practice cluster](#practice-cluster): it runs on
your laptop and nothing you do there can break anything real. Go through
**Part 1** in order; **Part 2** covers what every real deployment needs;
**Part 3** is for running clusters in production.

:::

## Contents {#contents}

**[Practice cluster](#practice-cluster)**

**[Part 1 — Beginner](#part-1)**:
[What Kubernetes is](#what-is-kubernetes) ·
[kubectl basics](#kubectl) ·
[Pods](#pods) ·
[Deployments](#deployments) ·
[YAML manifests](#manifests) ·
[Services](#services) ·
[Labels & selectors](#labels) ·
[Namespaces & contexts](#namespaces)

**[Part 2 — Core](#part-2)**:
[ConfigMaps & Secrets](#config) ·
[Health checks (probes)](#probes) ·
[Requests & limits](#resources) ·
[Rolling updates & rollbacks](#rollouts) ·
[Storage](#storage) ·
[Jobs & CronJobs](#jobs) ·
[Ingress](#ingress) ·
[Troubleshooting](#troubleshooting) ·
[Common mistakes](#gotchas)

**[Part 3 — Advanced](#part-3)**:
[StatefulSets](#statefulsets) ·
[DaemonSets](#daemonsets) ·
[Scheduling: taints & affinity](#scheduling) ·
[Autoscaling](#autoscaling) ·
[Access control (RBAC)](#rbac) ·
[Network policies](#network-policies) ·
[Kustomize & Helm](#kustomize-helm) ·
[How a cluster works](#architecture) ·
[Words you'll meet](#glossary)

## Practice cluster {#practice-cluster}

**In short:** **kind** ("Kubernetes in Docker") runs a real, single-machine
cluster inside Docker. Every example below runs in a namespace called
`practice`.

```bash
# Practice cluster: needs Docker running
brew install kind kubectl                 # Linux/Windows: see kind.sigs.k8s.io
kind create cluster --name learn          # about a minute
kubectl get nodes                         # learn-control-plane   Ready
kubectl create namespace practice
kubectl config set-context --current --namespace practice   # use "practice" by default
```

Docker Desktop's built-in Kubernetes, minikube, or k3d work the same way. To
start over: `kind delete cluster --name learn`.

## Part 1 — Beginner {#part-1}

<div class="cheat-sheet cheat-sheet--sre cheat-sheet--stack">

<div class="cheat-card">

#### 1. What Kubernetes is {#what-is-kubernetes}

**In short:** Kubernetes (often "K8s") runs your containers across a group of
machines and keeps them in the state you asked for — restarting, replacing,
and spreading them without you watching.

| Word | Meaning |
|---|---|
| **Cluster** | A set of machines Kubernetes manages as one |
| **Node** | One machine (real or virtual) in the cluster |
| **Control plane** | The "brain": stores what you asked for and works to make it true |
| **Pod** | The smallest thing Kubernetes runs: one or more containers sharing a network address |
| **Manifest** | A YAML file describing what you want ("3 copies of this app") |
| **kubectl** | The command-line tool you use to talk to the cluster ("cube control") |

The key idea is **desired state**: you declare *what* you want; Kubernetes
keeps comparing it with *what is* and fixes any difference — this loop is
called **reconciliation**.

**Try it:** run `kubectl get nodes -o wide` and find your node's container
runtime and Kubernetes version.

</div>

<div class="cheat-card">

#### 2. kubectl basics {#kubectl}

**In short:** almost every command is `kubectl <verb> <type> [name]`.

```bash
kubectl get nodes                        # list things of one type
kubectl get pods -A                      # pods in every namespace (-A = all)
kubectl get pods -n kube-system -o wide  # more columns (node, IP)
kubectl api-resources | head -5          # every type of object the cluster knows
kubectl explain deployment.spec.replicas # built-in documentation for any field
kubectl version --client                 # your kubectl version
```

| Verb | Does |
|---|---|
| `get` | List objects (`-o yaml` shows the full object) |
| `describe` | Human-readable details, plus recent **events** — start debugging here |
| `apply -f file.yaml` | Create or update objects from a file |
| `delete` | Remove objects |
| `logs` / `exec` | Read a container's output / run a command inside it |

Short names save typing: `po` (pods), `deploy`, `svc` (services), `ns`
(namespaces), `cm` (configmaps).

**Try it:** use `kubectl explain pod.spec.containers.image` to read what the
`image` field means.

</div>

<div class="cheat-card">

#### 3. Pods {#pods}

**In short:** a **pod** wraps one or more containers. You rarely create pods
directly, but every app runs inside them, so you'll read and debug them all
the time.

```bash
kubectl run web --image=nginx:1.27                # create one pod running nginx
kubectl wait --for=condition=Ready pod/web        # wait until it's up
kubectl get pods                                  # web   1/1   Running
kubectl describe pod web | tail -5                # Events: Scheduled, Pulled, Created, Started
kubectl logs web                                  # the container's output
kubectl exec web -- nginx -v                      # run a command inside: nginx version: nginx/1.27…
kubectl delete pod web                            # gone for good — nothing brings it back
```

For an interactive shell inside a pod: `kubectl exec -it web -- sh`.

A pod on its own is fragile: if it's deleted or its node dies, it isn't
replaced. That's what [Deployments](#deployments) are for.

**Try it:** run a `busybox:1.36` pod with the command `sleep 3600`
(`kubectl run box --image=busybox:1.36 -- sleep 3600`), then `exec` into it and
look at `/etc/hosts`.

</div>

<div class="cheat-card">

#### 4. Deployments {#deployments}

**In short:** a **Deployment** keeps a chosen number of identical pods
running, and replaces any that disappear.

```bash
kubectl create deployment web --image=nginx:1.27 --replicas=3
kubectl rollout status deployment/web             # waits: "successfully rolled out"
kubectl get deploy,rs,pods -l app=web             # deployment → replicaset → 3 pods

kubectl delete "$(kubectl get pods -l app=web -o name | head -1)"   # kill one pod…
kubectl rollout status deployment/web
kubectl get pods -l app=web                        # …and there are 3 again, one of them new

kubectl scale deployment web --replicas=5         # more copies
kubectl rollout status deployment/web
kubectl get deployment web                        # READY 5/5
```

A Deployment manages a **ReplicaSet**, which manages the pods. You work with
the Deployment; the ReplicaSet is how it does rolling updates.

**Try it:** scale to 0 replicas and back to 2. What happens to the pods in
between?

</div>

<div class="cheat-card">

#### 5. YAML manifests {#manifests}

**In short:** real projects describe objects in YAML files kept in git, and
use `kubectl apply` — running it again only applies what changed.

```yaml
# web.yaml
apiVersion: apps/v1          # which API group and version this type belongs to
kind: Deployment             # the type of object
metadata:
  name: web
spec:
  replicas: 2
  selector:
    matchLabels:
      app: web               # "the pods I manage are the ones labelled app=web"
  template:                  # the pod to create — its labels must match the selector
    metadata:
      labels:
        app: web
    spec:
      containers:
        - name: nginx
          image: nginx:1.27
          ports:
            - containerPort: 80
```

```bash
kubectl apply -f web.yaml                 # deployment.apps/web created
kubectl apply -f web.yaml                 # deployment.apps/web unchanged
kubectl get deployment web -o yaml | head -20   # what the cluster stored (with defaults filled in)
kubectl delete -f web.yaml                # delete everything the file describes
```

Every object has the same four top-level parts: `apiVersion`, `kind`,
`metadata` (name, labels), and `spec` (what you want). The cluster adds
`status` (what is). `kubectl diff -f web.yaml` previews a change before you
apply it.

**Try it:** change `replicas` to 3 in the file and `apply` again. Which pods
does Kubernetes create or keep?

</div>

<div class="cheat-card">

#### 6. Services {#services}

**In short:** pods come and go and their IP addresses change. A **Service**
gives a group of pods one stable name and address, and spreads requests
across them.

```bash
kubectl apply -f web.yaml
kubectl expose deployment web --port 80          # a Service named "web" in front of the pods
kubectl get service web                          # TYPE ClusterIP, a stable internal IP

kubectl run client --image=busybox:1.36 --rm -i --restart=Never -- \
  wget -qO- http://web | grep -o "<title>.*</title>"   # other pods reach it by name: <title>Welcome to nginx!</title>

kubectl port-forward service/web 8080:80 > /dev/null &   # reach it from your laptop
sleep 2 && curl -s localhost:8080 | grep -o "<title>.*</title>"
kill %1                                          # stop the port-forward
```

| Type | Reachable from | Use for |
|---|---|---|
| `ClusterIP` (default) | Inside the cluster only | Talking between your services |
| `NodePort` | Every node's IP, on a port 30000–32767 | Simple testing |
| `LoadBalancer` | A cloud load balancer's public address | Exposing a service on AWS/GCP/Azure |

Inside the cluster, the full name is `web.practice.svc.cluster.local`
(service · namespace · …); `web` alone works from the same namespace.

**Try it:** scale `web` to 3 and run the busybox `wget` several times — the
Service spreads the requests across pods.

</div>

<div class="cheat-card">

#### 7. Labels & selectors {#labels}

**In short:** **labels** are key-value tags on objects; **selectors** pick
objects by their labels. Deployments and Services find their pods this way.

```bash
kubectl apply -f web.yaml
kubectl get pods --show-labels                     # app=web, pod-template-hash=…
kubectl get pods -l app=web                        # only pods with app=web
kubectl get pods -l 'app in (web, api)'            # either value
kubectl label deployment web team=shop             # add a label
kubectl get deployments -l team=shop
kubectl get endpointslices -l kubernetes.io/service-name=web   # which pod IPs a Service sends to
```

A Service sends traffic to **every** pod whose labels match its selector.
If a Service shows no endpoints, its selector doesn't match any ready pod —
compare `kubectl describe service <name>` with the pods' labels.

**Try it:** start a lone pod labelled `app=web`
(`kubectl run extra --image=nginx:1.27 --labels=app=web`). Does the `web`
Service now send traffic to it too?

</div>

<div class="cheat-card">

#### 8. Namespaces & contexts {#namespaces}

**In short:** **namespaces** divide one cluster into separate spaces (per team
or environment); a **context** in your kubeconfig says which cluster, user,
and default namespace kubectl uses.

```bash
kubectl get namespaces                            # default, kube-system, practice, …
kubectl create namespace team-a
kubectl run web --image=nginx:1.27 -n team-a      # the same name can exist in each namespace
kubectl get pods -n team-a

kubectl config get-contexts                       # every cluster you can talk to; * = current
kubectl config current-context                    # kind-learn
kubectl config set-context --current --namespace practice   # change your default namespace
```

Your settings live in `~/.kube/config` (the **kubeconfig**). Always check the
current context before running a command that changes things — it's the
Kubernetes version of "am I on production?".

**Try it:** delete the `team-a` namespace. What happened to the pod inside it?

</div>

</div>

## Part 2 — Core {#part-2}

<div class="cheat-sheet cheat-sheet--sre cheat-sheet--stack">

<div class="cheat-card">

#### 9. ConfigMaps & Secrets {#config}

**In short:** keep settings out of images. **ConfigMaps** hold ordinary
settings; **Secrets** hold passwords and keys. Both reach containers as
environment variables or files.

```yaml
# config-demo.yaml
apiVersion: v1
kind: Pod
metadata:
  name: config-demo
spec:
  restartPolicy: Never
  containers:
    - name: app
      image: busybox:1.36
      command: ["sh", "-c", "echo $GREETING $MODE $DB_PASSWORD"]
      envFrom:
        - configMapRef:
            name: web-config          # every key becomes an environment variable
      env:
        - name: DB_PASSWORD
          valueFrom:
            secretKeyRef:
              name: db-secret         # one key from a Secret
              key: PASSWORD
```

```bash
kubectl create configmap web-config --from-literal=GREETING=hello --from-literal=MODE=dev
kubectl create secret generic db-secret --from-literal=PASSWORD=s3cret
kubectl get secret db-secret -o jsonpath='{.data.PASSWORD}' | base64 -d; echo   # s3cret — anyone who can read it can decode it
kubectl apply -f config-demo.yaml
kubectl wait --for=jsonpath='{.status.phase}'=Succeeded pod/config-demo
kubectl logs config-demo                          # hello dev s3cret
```

Secrets are only **base64-encoded**, not encrypted — anyone who can read them
in the cluster can decode them. Limit who can read Secrets ([RBAC](#rbac)),
turn on encryption at rest, or use an external secret store.

**Try it:** mount the ConfigMap as files instead
(`volumes: - name: cfg / configMap: {name: web-config}` and a `volumeMount`),
and `cat` one of the files.

</div>

<div class="cheat-card">

#### 10. Health checks (probes) {#probes}

**In short:** **probes** let Kubernetes ask your app "are you ready?" and "are
you alive?" — it only sends traffic to ready pods, and restarts pods that stop
being alive.

```yaml
# probed.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: probed
spec:
  replicas: 1
  selector:
    matchLabels: {app: probed}
  template:
    metadata:
      labels: {app: probed}
    spec:
      containers:
        - name: nginx
          image: nginx:1.27
          readinessProbe:              # failing → removed from the Service, not restarted
            httpGet: {path: /, port: 80}
            periodSeconds: 5
          livenessProbe:               # failing → container restarted
            httpGet: {path: /, port: 80}
            initialDelaySeconds: 5
            periodSeconds: 10
```

```bash
kubectl apply -f probed.yaml
kubectl rollout status deployment/probed
kubectl get pods -l app=probed                   # READY 1/1
```

| Probe | Question | When it fails |
|---|---|---|
| `startupProbe` | Has it finished starting? | Other probes wait; restarted if it never starts |
| `readinessProbe` | Can it take traffic right now? | Taken out of the Service until it passes again |
| `livenessProbe` | Is it stuck? | Container is restarted |

Keep liveness checks simple (the process responds) — don't check the
database in a liveness probe, or a database blip restarts every pod at once.

**Try it:** change the readiness path to `/missing` and apply. The pod stays
Running but shows `0/1` READY — and the rollout never finishes.

</div>

<div class="cheat-card">

#### 11. Requests & limits {#resources}

**In short:** **requests** are what a container is guaranteed (used to pick a
node); **limits** are the most it may use.

```yaml
# limited.yaml
apiVersion: v1
kind: Pod
metadata:
  name: limited
spec:
  restartPolicy: Never
  containers:
    - name: hog
      image: busybox:1.36
      command: ["sh", "-c", "head -c 300m /dev/zero | tail"]   # tries to hold 300 MB in memory
      resources:
        requests: {cpu: 100m, memory: 64Mi}     # 100m = 0.1 of a CPU core
        limits:   {cpu: 500m, memory: 100Mi}
```

```bash
kubectl apply -f limited.yaml
kubectl wait --for=jsonpath='{.status.phase}'=Failed pod/limited --timeout=60s
kubectl get pod limited -o jsonpath='{.status.containerStatuses[0].state.terminated.reason}'; echo   # OOMKilled
kubectl get pod limited -o jsonpath='{.status.qosClass}'; echo                                      # Burstable
```

| Over the… | Result |
|---|---|
| **Memory limit** | Container killed: `OOMKilled`, exit code 137 |
| **CPU limit** | Slowed down ("throttled"), not killed |
| **Requests** of every node | Pod stays `Pending` — nowhere to fit |

**QoS (Quality of Service) class:** requests = limits → `Guaranteed`;
requests below limits → `Burstable`; neither set → `BestEffort`, the first
to be evicted when a node runs short of memory.

**Try it:** raise the memory limit to 400Mi and apply again (delete the pod
first). Does it still get killed?

</div>

<div class="cheat-card">

#### 12. Rolling updates & rollbacks {#rollouts}

**In short:** changing a Deployment's pod template starts a **rolling
update** — new pods start before old ones stop, so the app stays up. A bad
rollout can be undone with one command.

```bash
kubectl apply -f web.yaml
kubectl rollout status deployment/web

kubectl set image deployment/web nginx=nginx:1.27-alpine   # container "nginx" gets a new image
kubectl rollout status deployment/web                      # replaces pods a few at a time
kubectl rollout history deployment/web                     # revisions 1 and 2

kubectl rollout undo deployment/web                        # back to the previous revision
kubectl rollout status deployment/web
kubectl get deployment web -o jsonpath='{.spec.template.spec.containers[0].image}'; echo   # nginx:1.27
```

```yaml
  strategy:                       # under the Deployment's spec
    type: RollingUpdate
    rollingUpdate:
      maxSurge: 1                 # at most 1 extra pod during the update
      maxUnavailable: 0           # never drop below the desired count
```

A rollout only replaces old pods when new ones pass their **readiness probe**
— that's what stops a broken version taking all the traffic.

**Try it:** set the image to `nginx:no-such-tag`. The new pod shows
`ImagePullBackOff`, the old pods keep serving, and `rollout undo` fixes it.

</div>

<div class="cheat-card">

#### 13. Storage {#storage}

**In short:** a container's files vanish when it restarts. A
**PersistentVolumeClaim** (PVC) asks the cluster for storage that outlives
pods.

```yaml
# storage.yaml
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: notes
spec:
  accessModes: [ReadWriteOnce]      # one node at a time can write
  resources:
    requests:
      storage: 1Gi
---
apiVersion: v1
kind: Pod
metadata:
  name: writer
spec:
  containers:
    - name: app
      image: busybox:1.36
      command: ["sh", "-c", "echo saved-at-$(date +%s) >> /data/notes.txt; sleep 3600"]
      volumeMounts:
        - name: data
          mountPath: /data
  volumes:
    - name: data
      persistentVolumeClaim:
        claimName: notes
```

```bash
kubectl apply -f storage.yaml
kubectl wait --for=condition=Ready pod/writer --timeout=90s
kubectl get pvc notes                             # STATUS Bound
kubectl delete pod writer
kubectl apply -f storage.yaml                     # a brand-new pod, same claim
kubectl wait --for=condition=Ready pod/writer --timeout=90s
kubectl exec writer -- cat /data/notes.txt        # two lines — the first pod's line survived
```

A **StorageClass** decides what real storage is created (a cloud disk, a
local folder); `kubectl get storageclass` shows yours. Deleting a PVC usually
deletes the data too.

</div>

<div class="cheat-card">

#### 14. Jobs & CronJobs {#jobs}

**In short:** a **Job** runs pods until a task *finishes* (migrations,
reports); a **CronJob** creates a Job on a schedule.

```bash
kubectl create job hello --image=busybox:1.36 -- sh -c 'echo job done'
kubectl wait --for=condition=complete job/hello --timeout=60s
kubectl logs job/hello                            # job done

kubectl create cronjob tick --image=busybox:1.36 --schedule='*/5 * * * *' -- date
kubectl get cronjob tick                          # SCHEDULE */5 * * * *
kubectl create job tick-now --from=cronjob/tick   # run it once, now
kubectl wait --for=condition=complete job/tick-now --timeout=60s
```

The schedule uses **cron** syntax: minute, hour, day of month, month, day of
week — `*/5 * * * *` means "every 5 minutes". Set `backoffLimit` (retries)
and `activeDeadlineSeconds` (a time limit) on real Jobs.

**Try it:** create a Job whose command fails (`exit 1`) and watch
`kubectl get pods -l job-name=<name>` — how many times does it retry?

</div>

<div class="cheat-card">

#### 15. Ingress {#ingress}

**In short:** an **Ingress** routes outside HTTP traffic to Services by host
name and path — one entry point for many services. It needs an **ingress
controller** (such as ingress-nginx or Traefik) installed in the cluster.

```yaml
# ingress.yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: shop
spec:
  ingressClassName: nginx
  rules:
    - host: shop.example.com
      http:
        paths:
          - path: /api
            pathType: Prefix
            backend:
              service: {name: api, port: {number: 80}}
          - path: /
            pathType: Prefix
            backend:
              service: {name: web, port: {number: 80}}
  tls:
    - hosts: [shop.example.com]
      secretName: shop-tls          # a TLS certificate stored as a Secret
```

The newer **Gateway API** (`Gateway` and `HTTPRoute` objects) does the same
job with more features and is replacing Ingress in many clusters.

</div>

<div class="cheat-card">

#### 16. Troubleshooting {#troubleshooting}

**In short:** `get` shows *what* is wrong, `describe` shows *why* (events at
the bottom), and `logs --previous` shows what a crashed container said.

```bash
kubectl run crash --image=busybox:1.36 -- sh -c 'echo "config missing"; exit 1'
sleep 20
kubectl get pod crash                             # STATUS CrashLoopBackOff (or Error), RESTARTS 1+
kubectl logs crash                                # config missing — output of the last run

kubectl run badimg --image=nginx:no-such-tag
sleep 10
kubectl get pod badimg                            # ErrImagePull / ImagePullBackOff
kubectl describe pod badimg | grep -m1 -i "failed to pull"

kubectl get events --sort-by=.lastTimestamp | tail -5   # the cluster's recent history
```

| Status | Usual cause | Look at |
|---|---|---|
| `Pending` | No node has enough CPU/memory, or no volume | `describe pod` → Events ("Insufficient cpu") |
| `ImagePullBackOff` | Wrong image name/tag, or no access to a private registry | `describe pod` → Events |
| `CrashLoopBackOff` | The app starts and exits — bad config, missing secret, crash | `logs` (add `--previous` once it's running again) |
| `Running` but `0/1` READY | Readiness probe failing | `describe pod` → probe messages |
| `OOMKilled` | Over the memory limit | Raise the limit, or fix the leak |
| Service unreachable | Selector doesn't match, wrong `targetPort` | `get endpointslices`, `describe service` |

</div>

<div class="cheat-card">

#### 17. Common mistakes {#gotchas}

**In short:** the classic Kubernetes traps, and the fix for each.

| Mistake | Fix |
|---|---|
| Using the `latest` image tag | Pin versions; `latest` makes rollouts and rollbacks unpredictable |
| No requests or limits | Set both — otherwise one pod can starve a whole node |
| No readiness probe | Traffic hits pods before they're ready; bad rollouts take everything down |
| Selector and pod labels don't match | The Service has no endpoints; the Deployment is rejected |
| `kubectl edit` in production | Change the YAML in git and `apply`, so the files stay the truth |
| Forgetting `-n` / wrong context | Check `kubectl config current-context` before changing anything |
| Secrets in git as plain YAML | They're only base64 — use Sealed Secrets, SOPS, or an external secret store |
| Liveness probe checks dependencies | A database outage then restarts every pod; check only the process itself |
| One replica of an important app | Run at least 2, and add a PodDisruptionBudget |

</div>

</div>

## Part 3 — Advanced {#part-3}

<div class="cheat-sheet cheat-sheet--sre cheat-sheet--stack">

<div class="cheat-card">

#### 18. StatefulSets {#statefulsets}

**In short:** a **StatefulSet** runs pods that each need a stable name and
their own storage — databases, queues — created and removed in order.

```yaml
# statefulset.yaml
apiVersion: v1
kind: Service
metadata:
  name: db
spec:
  clusterIP: None                   # "headless": a DNS name per pod instead of one shared IP
  selector: {app: db}
  ports: [{port: 80}]
---
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: db
spec:
  serviceName: db
  replicas: 2
  selector:
    matchLabels: {app: db}
  template:
    metadata:
      labels: {app: db}
    spec:
      containers:
        - name: app
          image: busybox:1.36
          command: ["sleep", "3600"]
```

```bash
kubectl apply -f statefulset.yaml
kubectl rollout status statefulset/db
kubectl get pods -l app=db -o name               # pod/db-0 pod/db-1 — fixed, ordered names
kubectl exec db-0 -- nslookup db-1.db.practice.svc.cluster.local | grep Name
# Name: db-1.db.practice.svc.cluster.local — each pod has its own DNS name
```

The name is pod · service · namespace; apps in the same namespace can use just
`db-1.db` (busybox's `nslookup` needs the full name). Add `volumeClaimTemplates` to give each pod its own PVC, which stays attached
to that pod name when it's replaced. For production databases, a managed
service or an **operator** is usually safer than your own StatefulSet.

</div>

<div class="cheat-card">

#### 19. DaemonSets {#daemonsets}

**In short:** a **DaemonSet** runs one copy of a pod on every node (or every
matching node) — for log collectors, monitoring agents, and network plugins.

```yaml
# daemonset.yaml
apiVersion: apps/v1
kind: DaemonSet
metadata:
  name: node-agent
spec:
  selector:
    matchLabels: {app: node-agent}
  template:
    metadata:
      labels: {app: node-agent}
    spec:
      containers:
        - name: agent
          image: busybox:1.36
          command: ["sh", "-c", "while true; do echo checking $(hostname); sleep 30; done"]
```

```bash
kubectl apply -f daemonset.yaml
kubectl rollout status daemonset/node-agent
kubectl get daemonset node-agent                 # DESIRED = CURRENT = number of nodes (1 on kind)
```

When a node joins the cluster, the DaemonSet adds a pod to it automatically.

</div>

<div class="cheat-card">

#### 20. Scheduling: taints & affinity {#scheduling}

**In short:** the **scheduler** picks a node for each pod. **Taints** keep
pods *off* a node unless they **tolerate** it; **affinity** and
`nodeSelector` pull pods *towards* certain nodes.

```bash
NODE=$(kubectl get nodes -o jsonpath='{.items[0].metadata.name}')
kubectl taint nodes "$NODE" dedicated=gpu:NoSchedule          # only pods that tolerate this may land here

kubectl run plain --image=nginx:1.27
sleep 5
kubectl get pod plain -o jsonpath='{.status.phase}'; echo     # Pending — nothing tolerates the taint

kubectl run tolerant --image=nginx:1.27 --overrides='{"spec":{"tolerations":[{"key":"dedicated","operator":"Equal","value":"gpu","effect":"NoSchedule"}]}}'
kubectl wait --for=condition=Ready pod/tolerant --timeout=60s
kubectl get pod tolerant -o jsonpath='{.status.phase}'; echo  # Running

kubectl taint nodes "$NODE" dedicated=gpu:NoSchedule-         # remove the taint (note the -)
kubectl wait --for=condition=Ready pod/plain --timeout=60s    # now it schedules too
```

| Tool | Use it to |
|---|---|
| `nodeSelector: {disktype: ssd}` | Run only on nodes with a label |
| Node affinity | The same, with "preferred" as well as "required" rules |
| Pod anti-affinity | Spread replicas across nodes or zones |
| Taints + tolerations | Reserve nodes (GPUs, a team) |
| `topologySpreadConstraints` | Spread pods evenly across zones |

</div>

<div class="cheat-card">

#### 21. Autoscaling {#autoscaling}

**In short:** a **HorizontalPodAutoscaler** (HPA) changes a Deployment's
replica count to keep average CPU (or another metric) near a target.

```bash
kubectl apply -f web.yaml
kubectl set resources deployment web --requests=cpu=100m   # HPA percentages are of the request
kubectl autoscale deployment web --cpu=70% --min=2 --max=5
kubectl get hpa web                               # TARGETS cpu: <unknown>/70% until metrics exist
```

The HPA needs the **metrics-server** add-on (built into most cloud
clusters; install it yourself on kind). Other autoscalers:

| Autoscaler | Changes |
|---|---|
| **HPA** | Number of pods |
| **VPA** (Vertical Pod Autoscaler) | Each pod's requests and limits |
| **Cluster Autoscaler** / Karpenter | Number of nodes |
| **KEDA** | Pods, from queue length and other event sources — even to zero |

</div>

<div class="cheat-card">

#### 22. Access control (RBAC) {#rbac}

**In short:** **RBAC** (Role-Based Access Control) decides who may do what: a
**Role** lists allowed actions, and a **RoleBinding** gives that Role to a
user or **ServiceAccount** (an identity for pods).

```bash
kubectl create serviceaccount reader
kubectl create role pod-reader --verb=get,list,watch --resource=pods
kubectl create rolebinding reader-can-read --role=pod-reader --serviceaccount=practice:reader

kubectl auth can-i list pods --as=system:serviceaccount:practice:reader     # yes
kubectl auth can-i delete pods --as=system:serviceaccount:practice:reader   # ✗ no — exit code 1, handy in scripts
```

| Object | Scope |
|---|---|
| `Role` / `RoleBinding` | One namespace |
| `ClusterRole` / `ClusterRoleBinding` | The whole cluster |

Give each app its own ServiceAccount with only the permissions it needs
("least privilege"), and set `automountServiceAccountToken: false` for pods
that never call the Kubernetes API.

</div>

<div class="cheat-card">

#### 23. Network policies {#network-policies}

**In short:** by default every pod can talk to every other pod. A
**NetworkPolicy** limits that — for example, "only the web pods may reach the
database".

```yaml
# netpol.yaml
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata:
  name: db-only-from-web
spec:
  podSelector:
    matchLabels: {app: db}          # this policy protects the db pods
  policyTypes: [Ingress]
  ingress:
    - from:
        - podSelector:
            matchLabels: {role: web}   # only pods labelled role=web may connect
      ports:
        - port: 5432
```

Policies are enforced by the cluster's network plugin (CNI — Container
Network Interface). Calico and Cilium enforce them; some simple plugins
silently ignore them, so always test that a blocked connection really fails.
A common starting point is a "deny all ingress" policy per namespace, then
explicit allows.

</div>

<div class="cheat-card">

#### 24. Kustomize & Helm {#kustomize-helm}

**In short:** real apps need the same manifests with small differences per
environment. **Kustomize** (built into kubectl) patches plain YAML;
**Helm** fills in templates and installs them as versioned "releases".

```yaml
# kustomization.yaml
resources:                          # this file sits next to web.yaml
  - web.yaml
namePrefix: staging-
labels:
  - pairs: {env: staging}
    includeSelectors: false
images:
  - name: nginx
    newTag: 1.27-alpine             # override the image tag without editing web.yaml
```

```bash
kubectl kustomize . | grep -E "name: staging-web|image:"   # preview: name: staging-web, image: nginx:1.27-alpine
kubectl apply -k .                                        # apply the customised result
```

```bash no-run
helm repo add bitnami https://charts.bitnami.com/bitnami
helm install my-db bitnami/postgresql --set auth.postgresPassword=pw   # install a "chart"
helm list                                                              # installed releases
helm upgrade my-db bitnami/postgresql --set primary.resources.limits.memory=512Mi
helm rollback my-db 1
```

Use Kustomize for your own apps with a few environment differences; use
Helm to install third-party software, or when you need real templating.

</div>

<div class="cheat-card">

#### 25. How a cluster works {#architecture}

**In short:** the control plane stores the desired state and makes decisions;
each node runs the pods it's given and reports back.

| Component | Runs on | Does |
|---|---|---|
| **kube-apiserver** | Control plane | The front door: every `kubectl` command and component talks to it |
| **etcd** | Control plane | The database holding every object |
| **kube-scheduler** | Control plane | Picks a node for each new pod |
| **kube-controller-manager** | Control plane | Runs the loops that make reality match the spec (Deployments, Jobs…) |
| **kubelet** | Every node | Starts and watches the pods assigned to its node |
| **kube-proxy** / CNI plugin | Every node | Makes Service addresses and pod networking work |
| **Container runtime** | Every node | Actually runs containers (containerd, CRI-O) |

```bash
kubectl get pods -n kube-system        # on kind you can see most of these as pods
```

When you `apply` a Deployment: the API server stores it in etcd → the
Deployment controller creates a ReplicaSet → the ReplicaSet controller creates
pods → the scheduler assigns nodes → each kubelet starts the containers.

</div>

<div class="cheat-card">

#### 26. Words you'll meet {#glossary}

**In short:** the jargon, in one line each.

| Word | Meaning |
|---|---|
| **Workload** | Anything that runs pods: Deployment, StatefulSet, DaemonSet, Job |
| **Replica** | One copy of a pod |
| **Controller** | A loop that watches objects and acts to reach their desired state |
| **Operator** | A controller that knows how to run one piece of software (a database, a queue) |
| **CRD** | Custom Resource Definition — adds a new object type to the cluster |
| **Sidecar** | A helper container in the same pod (a proxy, a log shipper) |
| **Init container** | Runs to completion before the main containers start |
| **PDB** | PodDisruptionBudget — how many pods may be down during maintenance |
| **Service mesh** | A layer (Istio, Linkerd) adding encryption, retries, and traffic control between services |
| **GitOps** | The cluster continuously syncs itself from YAML in git (Argo CD, Flux) |
| **EKS / GKE / AKS** | Managed Kubernetes on AWS / Google Cloud / Azure |

For the architecture in depth, scheduling details, and interview questions,
see the [complete guide](/docs/sre-skills/kubernetes/kubernetes-guide).

</div>

</div>
