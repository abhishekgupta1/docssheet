---
title: "Advanced Python for SRE"
description: "SRE-focused advanced Python topics: infrastructure automation, monitoring and observability, incident response, chaos testing, and security."
sidebar_position: 2
level: advanced
tags: [python, sre, automation]
image: /img/mental-model-share.png
---

# Advanced Python for SRE

The bigger topics an SRE (Site Reliability Engineer) meets when automating and
running production systems. Part of the [Role Guides](/docs/role-guides/role-guides-overview).

:::tip How to use this page

Read [Python for SRE](/docs/role-guides/sre/python-for-sre) first. Each section
has **In short** (the idea), an **Example**, and **Try it** (a small exercise).
Practise against a local cluster (such as `kind` or `minikube`), never production.

:::

## 1. Automating Kubernetes {#kubernetes}

**In short:** Kubernetes runs your containers and restarts them when they fail.
Its official Python client lets scripts do what you'd otherwise type as
`kubectl` commands.

A few words you'll see:

| Term | Meaning |
|---|---|
| **Pod** | One running copy of your app (one or more containers) |
| **Deployment** | Keeps a chosen number of identical pods running |
| **Replicas** | How many copies of the pod to run |
| **Namespace** | A folder-like group that separates teams or apps |
| **Node** | A machine (server) that pods run on |

```python
from kubernetes import client, config

config.load_kube_config()          # use your local ~/.kube/config
apps = client.AppsV1Api()          # for Deployments
core = client.CoreV1Api()          # for Pods and Nodes

def scale(name: str, namespace: str, replicas: int) -> None:
    apps.patch_namespaced_deployment_scale(
        name, namespace, {"spec": {"replicas": replicas}}   # dict: only what changes
    )

def unhealthy_pods(namespace: str) -> list[str]:
    pods = core.list_namespaced_pod(namespace)
    return [
        pod.metadata.name
        for pod in pods.items                       # list of Pod objects
        if pod.status.phase not in ("Running", "Succeeded")
    ]

scale("web", "default", 3)
print(unhealthy_pods("default"))                    # e.g. ["web-7f9c-abcde"]
```

Inside a cluster, use `config.load_incluster_config()` instead.

**Taking a node out of service ("draining"):** first mark it so no new pods
start there (*cordon*), then move its pods off. `kubectl drain <node>` does both
safely and respects rules about how many pods may be down at once — prefer it
over deleting pods yourself.

```python
core.patch_node("worker-2", {"spec": {"unschedulable": True}})   # cordon
```

**Autoscaling** — let Kubernetes add pods when CPU is busy. It is simplest to
declare this in YAML and apply it:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70      # add pods when average CPU passes 70%
```

Other infrastructure tools you'll meet: **Terraform** and **AWS CDK**
(*infrastructure as code* — servers and networks described in files and
version-controlled like code) and **Ansible** (configuring machines).

**Try it:** write a script that lists every Deployment in a namespace with its
desired and ready replica counts, and flags any where they differ.

## 2. Monitoring {#monitoring}

**In short:** you can't fix what you can't see. Services report **metrics**
(numbers over time), write **logs** (what happened), and send **traces**
(the path one request took).

**Metric types** in Prometheus, the most common metrics system:

| Type | Goes… | Example |
|---|---|---|
| `Counter` | Only up | Total requests served |
| `Gauge` | Up and down | Requests in progress right now |
| `Histogram` | Records sizes in buckets | How long requests took |

```python
import time
from prometheus_client import Counter, Gauge, Histogram, start_http_server

REQUESTS = Counter("api_requests_total", "Requests served", ["endpoint", "status"])
IN_PROGRESS = Gauge("api_requests_in_progress", "Requests being handled now")
LATENCY = Histogram("api_request_seconds", "Time to handle a request", ["endpoint"])

def handle(request):
    IN_PROGRESS.inc()
    start = time.perf_counter()
    status = 500
    try:
        response = process(request)
        status = response.status_code
        return response
    finally:                                         # runs on success and failure
        LATENCY.labels(request.path).observe(time.perf_counter() - start)
        REQUESTS.labels(request.path, str(status)).inc()
        IN_PROGRESS.dec()

start_http_server(8000)   # Prometheus reads metrics from http://localhost:8000
```

**Structured logs** are logs written as JSON, so tools can search by field.
Include a **correlation ID** — one ID passed along with a request through
every service, so you can find all its logs:

```python
import json
import logging

logger = logging.getLogger(__name__)
logger.info(json.dumps({                             # dict → one JSON line
    "event": "request_done",
    "correlation_id": request_id,
    "endpoint": "/orders",
    "duration_ms": 42,
}))
```

**SLIs, SLOs and error budgets:**

- **SLI** (service level *indicator*) — a measurement, e.g. "% of requests that succeeded".
- **SLO** (service level *objective*) — the target for it, e.g. "99.9% over 30 days".
- **Error budget** — the failures the SLO allows (0.1% here). While budget
  remains, ship features; when it runs out, focus on reliability.

```python
good, total = 999_412, 1_000_000
sli = good / total                        # 0.999412
slo = 0.999
budget_used = (1 - sli) / (1 - slo)       # 0.588 → 58.8% of the budget spent
```

**Try it:** add a `Counter` and a `Histogram` to a small Flask or FastAPI app,
open `http://localhost:8000` and watch the numbers change as you send requests.

## 3. Automating incident response {#incidents}

**In short:** turn the steps in a runbook into a script, so the first response
to a common alert is fast, consistent, and logged.

```python
import logging
import subprocess

logger = logging.getLogger("runbook")

def restart_if_unhealthy(deployment: str, namespace: str, dry_run: bool = True) -> None:
    pods = unhealthy_pods(namespace)                 # list of str, from section 1
    if not pods:
        logger.info("All pods healthy, nothing to do")
        return

    command = ["kubectl", "rollout", "restart", f"deployment/{deployment}", "-n", namespace]
    logger.warning("Unhealthy pods %s — will run: %s", pods, " ".join(command))
    if not dry_run:
        subprocess.run(command, check=True)          # list form: no shell injection
```

Good automation habits:

- **Dry run by default** — show what would happen; require a flag to act.
- **Log every action** with who or what triggered it.
- **Know when to stop** — escalate to a human after a limit (e.g. two restarts).

## 4. Chaos testing {#chaos}

**In short:** break things on purpose, in a controlled way, to prove the system
recovers before a real failure does it for you.

| Experiment | Question it answers |
|---|---|
| Kill a pod | Does traffic move to the other copies? |
| Add network delay | Do timeouts and retries behave? |
| Make a dependency fail | Does the service degrade gracefully instead of crashing? |
| Fill the disk | Do alerts fire before users notice? |

Start with a **hypothesis** ("if one pod dies, error rate stays under 1%"),
limit the **blast radius** (one pod, in staging), and have a **stop button**.

```python
import random

def kill_one_pod(namespace: str, label: str) -> str:
    pods = core.list_namespaced_pod(namespace, label_selector=label).items
    victim = random.choice(pods)
    core.delete_namespaced_pod(victim.metadata.name, namespace)
    return victim.metadata.name
```

Tools such as Chaos Mesh and LitmusChaos run these experiments for you.

## 5. Security & compliance {#security}

**In short:** automate the boring security checks so they happen every time,
not only when someone remembers.

- Scan Python dependencies for known holes: `pip-audit`.
- Scan container images: tools such as Trivy.
- Keep secrets in a secrets manager, never in scripts or git.
- Give automation accounts only the permissions they need (*least privilege*).
- Write an **audit log** of what your automation changed, when, and why.

**Try it:** run `pip-audit` against one of your projects and upgrade anything
it flags.
