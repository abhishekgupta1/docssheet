---
title: "Kubernetes Cheat Sheet"
description: "Quick reference for Kubernetes — core objects, kubectl, networking, scheduling, probes, and troubleshooting."
sidebar_position: 3
tags: [kubernetes, sre, cheat-sheet]
hide_table_of_contents: true
---

# Kubernetes cheatsheet

A one-page reference for Kubernetes. For architecture, YAML deep-dives, and
the full troubleshooting playbook, see the [complete guide](/docs/sre-skills/kubernetes/kubernetes-guide).

<a class="topic-crosslink" href="/docs/sre-skills/kubernetes/kubernetes-guide">📖 Full guide: Kubernetes →</a>

<div class="cheat-sheet cheat-sheet--sre">

<div class="cheat-card">

#### Core objects

| Object | Purpose |
|---|---|
| Pod | smallest deployable unit |
| Deployment | manages ReplicaSets, rolling updates |
| Service | stable network endpoint over pods |
| Ingress | HTTP routing into the cluster |
| ConfigMap/Secret | config & credentials |
| StatefulSet | stable identity/storage per pod |
| DaemonSet | one pod per node |
| Job/CronJob | run-to-completion / scheduled |

</div>

<div class="cheat-card">

#### kubectl essentials

```bash
kubectl get pods -o wide
kubectl describe pod <name>
kubectl logs -f <pod> -c <container>
kubectl exec -it <pod> -- sh
kubectl apply -f deploy.yaml
kubectl delete -f deploy.yaml
kubectl rollout status deploy/<name>
```

</div>

<div class="cheat-card">

#### Context & namespace

```bash
kubectl config get-contexts
kubectl config use-context <ctx>
kubectl config set-context --current --namespace=<ns>
kubectl get pods -n <ns>
kubectl get pods -A   # all namespaces
```

</div>

<div class="cheat-card">

#### Deployment (minimal)

```yaml
apiVersion: apps/v1
kind: Deployment
metadata: { name: web }
spec:
  replicas: 3
  selector: { matchLabels: { app: web } }
  template:
    metadata: { labels: { app: web } }
    spec:
      containers:
        - name: web
          image: web:1.2.3
          ports: [{ containerPort: 8080 }]
```

</div>

<div class="cheat-card">

#### Probes (health checks)

```yaml
livenessProbe:
  httpGet: { path: /healthz, port: 8080 }
  initialDelaySeconds: 5
readinessProbe:
  httpGet: { path: /ready, port: 8080 }
  periodSeconds: 5
```

Liveness fails → pod restarted. Readiness fails → pod pulled from Service, not restarted.

</div>

<div class="cheat-card">

#### Requests & limits

```yaml
resources:
  requests: { cpu: 250m, memory: 256Mi }
  limits:   { cpu: 500m, memory: 512Mi }
```

Requests drive scheduling; exceeding a memory limit → OOMKilled. QoS class
(Guaranteed/Burstable/BestEffort) derives from these.

</div>

<div class="cheat-card">

#### Rolling updates & rollback

```bash
kubectl set image deploy/web web=web:1.3.0
kubectl rollout status deploy/web
kubectl rollout undo deploy/web
kubectl rollout history deploy/web
```

</div>

<div class="cheat-card">

#### Label selectors

```bash
kubectl get pods -l app=web,env=prod
kubectl get pods -l 'env in (prod,staging)'
kubectl label pod <name> tier=frontend
```

</div>

<div class="cheat-card">

#### Networking model

- Every pod gets its own cluster-wide IP.
- Pod-to-pod traffic doesn't NAT (flat network).
- `Service` = stable virtual IP + DNS name in front of a pod set (selector-based).
- `Ingress` handles HTTP(S) routing/TLS termination into Services.

</div>

<div class="cheat-card">

#### Troubleshooting: CrashLoopBackOff

```bash
kubectl logs <pod> --previous
kubectl describe pod <pod>   # check exit code, events
```

Common causes: app crashes on startup, failing liveness probe, missing config/secret.

<span class="cheat-see">See: kubectl Debugging Playbook</span>

</div>

<div class="cheat-card">

#### Troubleshooting: Pending / ImagePullBackOff

```bash
kubectl describe pod <pod>   # Events section has the reason
```

Pending → often insufficient CPU/memory on nodes, or unsatisfiable
affinity/taint rules. ImagePullBackOff → bad image tag, private registry
auth missing.

</div>

<div class="cheat-card">

#### Affinity, taints & tolerations

```yaml
tolerations:
  - key: "dedicated"
    operator: "Equal"
    value: "gpu"
    effect: "NoSchedule"
```

Taints repel pods from a node; a matching toleration lets a pod land there
anyway. Affinity/anti-affinity attracts or repels pods relative to other pods.

</div>

</div>
