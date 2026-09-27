---
title: "Python for SRE"
description: "How Python fundamentals map to reliability work \u2014 safe CLIs, log parsing, health checks, metrics, SLOs, Kubernetes automation, runbooks, and chaos."
sidebar_position: 1
level: intermediate
tags: [python, sre, automation]
image: /img/mental-model-share.png
---

# Python for SRE
## How the Fundamentals Help You Keep Systems Reliable

**SRE** means **Site Reliability Engineer**.
An SRE keeps production systems running, fast, and safe. An SRE automates manual work, watches systems, responds to incidents, and makes releases safer.

This guide shows how each Python fundamental helps in real SRE work.
Learn the basics first with the [Python cheat sheet](/cheatsheets/python) or [Python Fundamentals](/docs/fundamentals/python/fundamentals-basic-to-advanced).

Each use case in this guide has the same parts:

- **The task** – what you need to do.
- **Fundamentals used** – which basic ideas solve it.
- **How it works** – the steps in plain words.
- **Code** – an example you can copy and change.
- **Try it** – a small exercise, on some use cases.

:::tip How to use this page

Use cases 2–7 need nothing but Python and a laptop — start there. Use cases
8–15 need a service, a monitoring system, or a Kubernetes cluster; practise
those on a local cluster (such as `kind` or `minikube`), never production.

:::

---

## Contents

1. [Fundamentals Map for SRE](#1-fundamentals-map-for-sre)
2. [Use Case: Write a Safe Command-Line Tool](#2-use-case-write-a-safe-command-line-tool)
3. [Use Case: Parse Large Log Files](#3-use-case-parse-large-log-files)
4. [Use Case: Check the Health of Many Servers at Once](#4-use-case-check-the-health-of-many-servers-at-once)
5. [Use Case: Run Shell Commands from Python](#5-use-case-run-shell-commands-from-python)
6. [Use Case: Check Disk Space and Send Alerts](#6-use-case-check-disk-space-and-send-alerts)
7. [Use Case: Validate Configuration Files](#7-use-case-validate-configuration-files)
8. [Use Case: Publish Metrics for Prometheus](#8-use-case-publish-metrics-for-prometheus)
9. [Use Case: Write Structured Logs](#9-use-case-write-structured-logs)
10. [Use Case: Calculate SLOs and Error Budgets](#10-use-case-calculate-slos-and-error-budgets)
11. [Use Case: Automate Kubernetes Tasks](#11-use-case-automate-kubernetes-tasks)
12. [Use Case: Safe Deployments with Automatic Rollback](#12-use-case-safe-deployments-with-automatic-rollback)
13. [Use Case: Protect Services with a Circuit Breaker](#13-use-case-protect-services-with-a-circuit-breaker)
14. [Use Case: Automate Incident First Steps (Runbooks)](#14-use-case-automate-incident-first-steps-runbooks)
15. [Use Case: Run a Chaos Experiment](#15-use-case-run-a-chaos-experiment)
16. [Use Case: Clean Up Old Files and Resources](#16-use-case-clean-up-old-files-and-resources)
17. [Practice Projects](#17-practice-projects)
18. [Skills Checklist](#18-skills-checklist)

---

## 1. Fundamentals Map for SRE

| Fundamental | Where an SRE uses it |
|-------------|-----------------------|
| Variables, numbers, maths | Thresholds, percentages, error budgets |
| Strings and f-strings | Log lines, commands, alert messages |
| Lists, sets, dicts | Hosts, config keys, results per server |
| `Counter`, `defaultdict`, `deque` | Counting errors, grouping by host, "last N" events |
| Conditions | Alert rules, go / no-go decisions |
| Loops | Checking every host, polling until healthy |
| Functions | Small, reusable checks |
| Decorators | Timing, retry, metrics on functions |
| Exceptions | Safe failure; one bad host must not stop the whole script |
| Classes | Clients for tools (Kubernetes, cloud, alerting), state machines |
| Context managers | Locks, temporary changes that must be undone, timers |
| Generators | Reading huge log files line by line |
| Regex | Pulling fields from log lines |
| File I/O, JSON, YAML | Config files, reports, state files |
| `subprocess` | Running system tools safely |
| `argparse` and exit codes | Command-line tools that work in cron jobs and pipelines |
| Threads and async | Checking hundreds of hosts at the same time |
| Logging | Clear, searchable output from automation |
| Speed of lookups ("Big-O") | Fast scripts on large data: a `set` or `dict` finds items instantly, a `list` searches one by one |

---

## 2. Use Case: Write a Safe Command-Line Tool

**The task:** Build a script that others can run by hand, from cron (the Linux scheduler that runs commands at set times), or from a pipeline. It must be clear, safe, and report success or failure correctly.

**Fundamentals used:** `argparse`, functions, the main guard, exit codes, logging, exceptions.

**How it works:**
1. Read options with `argparse`. The tool gets a `--help` page for free.
2. Add a `--dry-run` option. It shows what the tool **would** do without changing anything.
3. Put the logic in functions. Keep `main()` short.
4. Use `logging`, not `print`, so output has time and level.
5. Return exit code `0` for success and a non-zero code for failure. Cron and CI tools read this code.
6. Catch expected errors and show a short message. Do not show a long error trace to the user for known problems.

**Code:**
```python
#!/usr/bin/env python3
"""Restart a service on a list of hosts."""
import argparse
import logging
import sys

logger = logging.getLogger("restart")

def parse_args(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("service", help="name of the service to restart")
    parser.add_argument("--hosts", nargs="+", required=True, help="one or more host names")
    parser.add_argument("--dry-run", action="store_true", help="show actions, change nothing")
    parser.add_argument("-v", "--verbose", action="store_true")
    return parser.parse_args(argv)

def restart(host: str, service: str, dry_run: bool) -> bool:
    if dry_run:
        logger.info("[dry-run] would restart %s on %s", service, host)
        return True
    logger.info("restarting %s on %s", service, host)
    # ... real work here ...
    return True

def main(argv=None) -> int:
    args = parse_args(argv)
    logging.basicConfig(
        level=logging.DEBUG if args.verbose else logging.INFO,
        format="%(asctime)s %(levelname)s %(message)s",
    )
    failed = [h for h in args.hosts if not restart(h, args.service, args.dry_run)]
    if failed:
        logger.error("failed on: %s", ", ".join(failed))
        return 1
    return 0

if __name__ == "__main__":
    sys.exit(main())
```

```bash
python restart.py nginx --hosts web1 web2 --dry-run
echo $?     # shows the exit code: 0 means success
```

**Try it:** add a `--timeout` option (a number of seconds, default 30) and print it in the dry-run message.

---

## 3. Use Case: Parse Large Log Files

**The task:** A log file is many gigabytes. You need to know: how many errors, which endpoints fail most, and which requests are slowest.

**Fundamentals used:** generators, file I/O, regex with named groups, `Counter`, `heapq`, dataclasses.

**How it works:**
1. Read the file **one line at a time** with a generator. Memory use stays small, even for huge files.
2. Use a compiled **regex** with named groups to pull out fields.
3. Skip lines that do not match.
4. Count results with `Counter`.
5. Keep a small **heap** of the 10 slowest requests, so you never sort millions of lines. (A *heap* is a list kept in a special order where the smallest item is always first, so dropping it is quick.)
6. Support `.gz` files, because old logs are often compressed.

**Code:**
```python
import gzip
import heapq
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Iterator

# Example line:
# 2026-09-24T10:15:02Z 10.0.0.5 GET /api/orders 500 842ms
LINE = re.compile(
    r"(?P<time>\S+) (?P<ip>\S+) (?P<method>[A-Z]+) (?P<path>\S+) "
    r"(?P<status>\d{3}) (?P<ms>\d+)ms"
)

@dataclass
class Request:
    time: str
    ip: str
    method: str
    path: str
    status: int
    ms: int

def open_log(path: Path):
    if path.suffix == ".gz":
        return gzip.open(path, "rt", encoding="utf-8", errors="replace")
    return path.open(encoding="utf-8", errors="replace")

def parse(path: Path) -> Iterator[Request]:
    with open_log(path) as f:
        for line in f:
            match = LINE.match(line)
            if not match:
                continue
            d = match.groupdict()
            yield Request(d["time"], d["ip"], d["method"], d["path"], int(d["status"]), int(d["ms"]))

def summarise(path: Path) -> dict:
    status_counts = Counter()
    errors_by_path = Counter()
    slowest = []

    for req in parse(path):
        status_counts[req.status // 100 * 100] += 1          # 200, 300, 400, 500 groups
        if req.status >= 500:
            errors_by_path[req.path] += 1
        heapq.heappush(slowest, (req.ms, req.path))
        if len(slowest) > 10:
            heapq.heappop(slowest)                           # keep only the 10 slowest

    total = sum(status_counts.values())
    return {
        "total": total,
        "error_rate": status_counts[500] / total if total else 0.0,
        "by_status": dict(status_counts),
        "top_error_paths": errors_by_path.most_common(5),
        "slowest": sorted(slowest, reverse=True),
    }
```

**Why the fundamental matters:** A **generator** lets this script read a 20 GB file with very little memory. A **heap** of size 10 keeps the top 10 without sorting millions of items.

**Try it:** write five sample log lines into `sample.log` (make two of them status 500) and print `summarise(Path("sample.log"))`.

---

## 4. Use Case: Check the Health of Many Servers at Once

**The task:** Check the `/health` URL of 200 servers. One by one is too slow. Some servers will be down, and that must not stop the script.

**Fundamentals used:** functions, exceptions, dataclasses, `ThreadPoolExecutor`, `as_completed`, sorting.

**How it works:**
1. Write one function that checks **one** host. It never raises; it returns a result object with `ok` True or False.
2. Use a **thread pool** to run many checks at the same time. Health checks spend most of their time waiting for the network, so threads are a good fit.
3. Always set a **timeout** on network calls. Without one, a stuck server can block the script forever.
4. Collect results as they finish.
5. Print a summary and return a non-zero exit code if any host failed.

**Code:**
```python
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from dataclasses import dataclass

import requests

@dataclass
class HealthResult:
    host: str
    ok: bool
    status: int | None
    ms: float
    error: str = ""

def check(host: str, timeout: float = 3.0) -> HealthResult:
    start = time.monotonic()
    try:
        response = requests.get(f"https://{host}/health", timeout=timeout)
        ms = (time.monotonic() - start) * 1000
        return HealthResult(host, response.status_code == 200, response.status_code, ms)
    except requests.RequestException as error:
        ms = (time.monotonic() - start) * 1000
        return HealthResult(host, False, None, ms, type(error).__name__)

def check_all(hosts: list[str], workers: int = 32) -> list[HealthResult]:
    results = []
    with ThreadPoolExecutor(max_workers=workers) as pool:
        futures = [pool.submit(check, host) for host in hosts]
        for future in as_completed(futures):
            results.append(future.result())
    return sorted(results, key=lambda r: (r.ok, r.host))    # failures first

if __name__ == "__main__":
    hosts = [line.strip() for line in open("hosts.txt") if line.strip()]
    results = check_all(hosts)
    bad = [r for r in results if not r.ok]
    for r in bad:
        print(f"DOWN  {r.host:30} status={r.status} error={r.error}")
    print(f"{len(results) - len(bad)}/{len(results)} healthy")
    sys.exit(1 if bad else 0)
```

**Try it:** put `example.com`, `python.org`, and `does-not-exist.invalid` in `hosts.txt` and run the script. Only the last one should be reported as down.

---

## 5. Use Case: Run Shell Commands from Python

**The task:** Use system tools (`df`, `systemctl`, `kubectl`, `git`) from a Python script, and handle errors and timeouts.

**Fundamentals used:** `subprocess`, lists, exceptions, dataclasses, `shlex`.

**How it works:**
1. Use `subprocess.run` and pass the command as a **list** of words, not one string.
2. Do not use `shell=True` with any text that comes from users or files. It can let someone run any command (command injection).
3. Use `capture_output=True, text=True` to get the output as text.
4. Use `timeout=` so a stuck command cannot hang the script.
5. Use `check=True` to raise an error if the command fails, or check `returncode` yourself.

**Code:**
```python
import shlex
import subprocess
from dataclasses import dataclass

@dataclass
class CommandResult:
    code: int
    out: str
    err: str

def run(cmd: list[str], timeout: int = 30) -> CommandResult:
    try:
        p = subprocess.run(cmd, capture_output=True, text=True, timeout=timeout)
    except subprocess.TimeoutExpired:
        return CommandResult(124, "", f"timed out after {timeout}s: {shlex.join(cmd)}")
    except FileNotFoundError:
        return CommandResult(127, "", f"command not found: {cmd[0]}")
    return CommandResult(p.returncode, p.stdout, p.stderr)

result = run(["systemctl", "is-active", "nginx"])
if result.code != 0:
    print("nginx is not running:", result.err or result.out)
```

**Unsafe vs safe:**
```python
service = user_input
subprocess.run(f"systemctl restart {service}", shell=True)      # unsafe
subprocess.run(["systemctl", "restart", service], check=True)   # safe
```

---

## 6. Use Case: Check Disk Space and Send Alerts

**The task:** Check disk usage on important folders. If usage is above a limit, send an alert to a chat channel. Do not send the same alert again and again.

**Fundamentals used:** `shutil`, maths (percent), dicts, conditions, JSON, file I/O (state file), environment variables.

**How it works:**
1. Get disk usage with `shutil.disk_usage`.
2. Compare the percent with **warning** and **critical** limits.
3. Save which alerts were already sent in a small JSON **state file**.
4. Send an alert only when the level changes. This stops **alert fatigue** (too many repeated alerts, so people stop reading them).
5. Read the webhook URL from an environment variable.

**Code:**
```python
import json
import os
import shutil
from pathlib import Path

import requests

LIMITS = {"warning": 80.0, "critical": 90.0}
PATHS = ["/", "/var/log", "/data"]
STATE_FILE = Path("/var/tmp/disk_alert_state.json")
WEBHOOK = os.environ.get("ALERT_WEBHOOK_URL", "")

def level_for(percent: float) -> str:
    if percent >= LIMITS["critical"]:
        return "critical"
    if percent >= LIMITS["warning"]:
        return "warning"
    return "ok"

def load_state() -> dict:
    try:
        return json.loads(STATE_FILE.read_text())
    except (FileNotFoundError, json.JSONDecodeError):
        return {}

def send_alert(text: str):
    if WEBHOOK:
        requests.post(WEBHOOK, json={"text": text}, timeout=5)
    else:
        print("ALERT:", text)

def main():
    state = load_state()
    for path in PATHS:
        usage = shutil.disk_usage(path)
        percent = usage.used / usage.total * 100
        level = level_for(percent)
        if level != state.get(path, "ok"):                  # only when the level changes
            send_alert(f"[{level.upper()}] {path} is {percent:.1f}% full")
            state[path] = level
    STATE_FILE.write_text(json.dumps(state))

if __name__ == "__main__":
    main()
```

---

## 7. Use Case: Validate Configuration Files

**The task:** A bad config file can take down production. Check every config file in CI **before** it is deployed.

**Fundamentals used:** YAML/JSON parsing, dicts, sets, type checks, lists of error messages, `pathlib`, exit codes.

**How it works:**
1. Load the file into a dict.
2. Use **set difference** to find missing and unknown keys.
3. Check the type and range of each value.
4. Collect **all** problems in a list, instead of stopping at the first one. The user can fix everything in one go.
5. Exit with code `1` if there are any problems, so the CI pipeline stops.

**Code:**
```python
import sys
from pathlib import Path

import yaml   # pip install pyyaml

REQUIRED = {"name", "replicas", "port", "image"}
OPTIONAL = {"env", "cpu_limit", "memory_limit"}

def validate(config: dict) -> list[str]:
    problems = []
    keys = set(config)

    for key in sorted(REQUIRED - keys):
        problems.append(f"missing key: {key}")
    for key in sorted(keys - REQUIRED - OPTIONAL):
        problems.append(f"unknown key: {key}")

    replicas = config.get("replicas")
    if replicas is not None and (not isinstance(replicas, int) or not 1 <= replicas <= 50):
        problems.append("replicas must be a whole number from 1 to 50")

    port = config.get("port")
    if port is not None and (not isinstance(port, int) or not 1 <= port <= 65535):
        problems.append("port must be a number from 1 to 65535")

    image = str(config.get("image", ""))
    if image.endswith(":latest"):
        problems.append("image must use a fixed version tag, not ':latest'")

    return problems

def main(folder: str) -> int:
    failed = False
    for path in sorted(Path(folder).glob("*.yaml")):
        try:
            config = yaml.safe_load(path.read_text()) or {}
        except yaml.YAMLError as error:
            print(f"{path}: cannot read YAML: {error}")
            failed = True
            continue
        for problem in validate(config):
            print(f"{path}: {problem}")
            failed = True
    return 1 if failed else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "configs"))
```

Always use `yaml.safe_load`, not `yaml.load`. The safe version cannot run code hidden in the file.

---

## 8. Use Case: Publish Metrics for Prometheus

**The task:** Measure how many requests a service handles, how many fail, and how long they take. A monitoring system (Prometheus) collects the numbers, and dashboards show them.

**Fundamentals used:** classes, decorators, `try`/`finally`, `time`, labels as keyword arguments.

**The three main metric types:**

| Type | What it is | Example |
|------|-----------|---------|
| **Counter** | A number that only goes up | Total requests, total errors |
| **Gauge** | A number that goes up and down | Active connections, queue size |
| **Histogram** | Counts values in ranges ("buckets") | Request time, to work out percentiles like p95 |

**p95** (the 95th percentile) means "95% of requests were faster than this". It shows what slow users experience, which an average hides.

**How it works:**
1. Create the metrics once, when the program starts.
2. Wrap the work in a **decorator** that measures time and counts success or failure.
3. Use `finally` so the numbers are updated even when there is an error.
4. Start a small HTTP server that Prometheus reads from.
5. Keep **labels** to a small set of values (method, endpoint, status). Do not use user IDs as labels. Too many label values slow down the monitoring system.

**Code:**
```python
import functools
import time

from prometheus_client import Counter, Gauge, Histogram, start_http_server

REQUESTS = Counter("app_requests_total", "Requests handled", ["endpoint", "outcome"])
LATENCY = Histogram("app_request_seconds", "Request time in seconds", ["endpoint"],
                    buckets=(0.05, 0.1, 0.25, 0.5, 1, 2.5, 5))
IN_PROGRESS = Gauge("app_requests_in_progress", "Requests being handled now")

def instrument(endpoint: str):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            IN_PROGRESS.inc()
            start = time.perf_counter()
            outcome = "error"
            try:
                result = func(*args, **kwargs)
                outcome = "success"
                return result
            finally:
                LATENCY.labels(endpoint=endpoint).observe(time.perf_counter() - start)
                REQUESTS.labels(endpoint=endpoint, outcome=outcome).inc()
                IN_PROGRESS.dec()
        return wrapper
    return decorator

@instrument("checkout")
def checkout(order_id: str):
    ...

if __name__ == "__main__":
    start_http_server(9100)       # Prometheus reads http://host:9100/metrics
```

---

## 9. Use Case: Write Structured Logs

**The task:** Logs from many servers go to one search system. You want to search and filter them by field, for example "all errors for request ID abc123".

**Fundamentals used:** logging, classes (custom formatter), dicts, JSON, `extra` fields.

**How it works:**
1. Write each log line as **JSON** instead of free text. Each value has a name.
2. Add a **correlation ID** (request ID) so you can follow one request across many services.
3. Use levels correctly: `INFO` for normal events, `WARNING` for unusual but handled events, `ERROR` for failures.
4. Never log passwords, tokens, or personal data.

**Code:**
```python
import json
import logging
import sys

class JsonFormatter(logging.Formatter):
    FIELDS = ("request_id", "host", "user_action", "duration_ms")

    def format(self, record: logging.LogRecord) -> str:
        entry = {
            "ts": self.formatTime(record, "%Y-%m-%dT%H:%M:%S"),
            "level": record.levelname,
            "logger": record.name,
            "msg": record.getMessage(),
        }
        for field in self.FIELDS:
            if hasattr(record, field):
                entry[field] = getattr(record, field)
        if record.exc_info:
            entry["error"] = self.formatException(record.exc_info)
        return json.dumps(entry)

def setup_logging(level=logging.INFO):
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    logging.basicConfig(level=level, handlers=[handler], force=True)

setup_logging()
log = logging.getLogger("deployer")
log.info("deployment started", extra={"request_id": "abc123", "host": "web1"})
```

Output:
```json
{"ts": "2026-09-24T10:15:02", "level": "INFO", "logger": "deployer", "msg": "deployment started", "request_id": "abc123", "host": "web1"}
```

---

## 10. Use Case: Calculate SLOs and Error Budgets

**Words to know:**
- **SLI (Service Level Indicator)** – a measurement. Example: the percent of requests that succeed.
- **SLO (Service Level Objective)** – the target for an SLI. Example: 99.9% of requests succeed over 30 days.
- **Error budget** – how much failure is allowed. With a 99.9% SLO, 0.1% of requests may fail.
- **Burn rate** – how fast you are using the error budget. A burn rate of 1 uses the whole budget in exactly the SLO period. A burn rate of 10 uses it ten times faster.

**The task:** Work out how much error budget is left, and decide if releases should slow down.

**Fundamentals used:** arithmetic, functions, dataclasses, properties, conditions, f-strings.

**Code:**
```python
from dataclasses import dataclass

@dataclass
class SLOReport:
    target: float          # e.g. 0.999
    total: int             # all requests in the period
    failed: int            # failed requests in the period

    @property
    def sli(self) -> float:
        return 1 - self.failed / self.total if self.total else 1.0

    @property
    def allowed_failures(self) -> float:
        return self.total * (1 - self.target)

    @property
    def budget_left(self) -> float:
        """1.0 = all budget left, 0 = none left, negative = SLO broken."""
        if self.allowed_failures == 0:
            return 1.0
        return 1 - self.failed / self.allowed_failures

    def decision(self) -> str:
        if self.budget_left <= 0:
            return "STOP: SLO broken. Only reliability fixes may be released."
        if self.budget_left < 0.25:
            return "SLOW DOWN: less than 25% of the error budget is left."
        return "OK: normal releases allowed."

def burn_rate(failed: int, total: int, target: float) -> float:
    if total == 0:
        return 0.0
    return (failed / total) / (1 - target)

report = SLOReport(target=0.999, total=2_000_000, failed=1_600)
print(f"SLI: {report.sli:.4%}")                   # SLI: 99.9200%
print(f"Budget left: {report.budget_left:.0%}")   # Budget left: 20%
print(report.decision())                          # SLOW DOWN: less than 25% ...
print(f"Burn rate (last hour): {burn_rate(40, 10_000, 0.999):.1f}")   # 4.0
```

**Try it:** change `failed` to `2_500` and predict the decision before you run it.

**Allowed downtime for common SLOs (30 days):**

| SLO | Allowed downtime per 30 days |
|-----|------------------------------|
| 99% | about 7 hours 12 minutes |
| 99.5% | about 3 hours 36 minutes |
| 99.9% | about 43 minutes |
| 99.95% | about 22 minutes |
| 99.99% | about 4 minutes |

---

## 11. Use Case: Automate Kubernetes Tasks

**The task:** Scale deployments, find pods that keep restarting, and safely drain a node for maintenance.

**Fundamentals used:** classes, methods, loops, conditions, exceptions, list comprehensions, the official client library.

**How it works:**
1. Load the cluster login with `config.load_kube_config()` (on your laptop) or `config.load_incluster_config()` (inside the cluster).
2. Wrap the API calls in a small **class**, so scripts stay short and tests can use a fake class.
3. Use comprehensions to filter pods.
4. Handle `ApiException` so one failure does not stop the whole job.

**Code:**
```python
from kubernetes import client, config
from kubernetes.client.rest import ApiException

class K8s:
    def __init__(self, in_cluster: bool = False):
        if in_cluster:
            config.load_incluster_config()
        else:
            config.load_kube_config()
        self.core = client.CoreV1Api()
        self.apps = client.AppsV1Api()

    def scale(self, namespace: str, name: str, replicas: int):
        body = {"spec": {"replicas": replicas}}
        self.apps.patch_namespaced_deployment_scale(name, namespace, body)

    def restarting_pods(self, namespace: str, min_restarts: int = 5) -> list[tuple[str, int]]:
        pods = self.core.list_namespaced_pod(namespace).items
        result = []
        for pod in pods:
            restarts = sum(cs.restart_count for cs in (pod.status.container_statuses or []))
            if restarts >= min_restarts:
                result.append((pod.metadata.name, restarts))
        return sorted(result, key=lambda item: item[1], reverse=True)

    def cordon(self, node: str):
        """Stop new pods from being placed on this node."""
        self.core.patch_node(node, {"spec": {"unschedulable": True}})

    def evict_pods(self, node: str) -> list[str]:
        failed = []
        pods = self.core.list_pod_for_all_namespaces(field_selector=f"spec.nodeName={node}").items
        for pod in pods:
            eviction = client.V1Eviction(
                metadata=client.V1ObjectMeta(name=pod.metadata.name, namespace=pod.metadata.namespace)
            )
            try:
                self.core.create_namespaced_pod_eviction(
                    pod.metadata.name, pod.metadata.namespace, eviction
                )
            except ApiException as error:
                failed.append(f"{pod.metadata.name}: {error.reason}")
        return failed
```

```python
k8s = K8s()
for name, restarts in k8s.restarting_pods("payments"):
    print(f"{name} restarted {restarts} times")
```

Using the **Eviction** API (not delete) respects Pod Disruption Budgets — rules that say how many copies of a service may be down at once — so the service stays available while the node drains.

---

## 12. Use Case: Safe Deployments with Automatic Rollback

**The task:** Release a new version with little risk. Send traffic to it step by step. If errors go up, go back to the old version automatically.

**Fundamentals used:** classes, loops, conditions, functions passed as parameters, exceptions, logging.

**Words to know:**
- **Blue-green** – two full environments. "Blue" is live; "green" gets the new version. When green is healthy, switch all traffic to it. Keep blue ready for a quick switch back.
- **Canary** – send a small share of traffic (for example 5%) to the new version first. Increase step by step while it stays healthy.
- **Rollback** – go back to the last good version.

**How it works (canary):**
1. Deploy the new version next to the old one.
2. For each traffic step (5%, 25%, 50%, 100%): set the traffic, wait, then check the error rate and speed.
3. If a check fails, move all traffic back and stop.
4. The functions that set traffic and read metrics are passed in as **parameters**. This lets the same logic work with any load balancer, and makes it easy to test.

**Code:**
```python
import logging
import time
from dataclasses import dataclass
from typing import Callable

log = logging.getLogger("canary")

@dataclass
class Health:
    error_rate: float     # 0.01 means 1%
    p95_ms: float

class CanaryRollout:
    STEPS = (5, 25, 50, 100)

    def __init__(self, set_traffic: Callable[[int], None], read_health: Callable[[], Health],
                 max_error_rate: float = 0.01, max_p95_ms: float = 500, wait_seconds: int = 300):
        self.set_traffic = set_traffic
        self.read_health = read_health
        self.max_error_rate = max_error_rate
        self.max_p95_ms = max_p95_ms
        self.wait_seconds = wait_seconds

    def is_healthy(self, health: Health) -> bool:
        return health.error_rate <= self.max_error_rate and health.p95_ms <= self.max_p95_ms

    def run(self) -> bool:
        for percent in self.STEPS:
            log.info("sending %d%% of traffic to the new version", percent)
            self.set_traffic(percent)
            time.sleep(self.wait_seconds)
            health = self.read_health()
            if not self.is_healthy(health):
                log.error("unhealthy at %d%%: errors=%.2f%% p95=%.0fms; rolling back",
                          percent, health.error_rate * 100, health.p95_ms)
                self.set_traffic(0)
                return False
        log.info("rollout finished")
        return True
```

Test with fakes (no real traffic, no waiting):
```python
def test_rolls_back_when_errors_rise():
    traffic = []
    readings = iter([Health(0.001, 200), Health(0.05, 200)])     # bad at the 2nd step
    rollout = CanaryRollout(traffic.append, lambda: next(readings), wait_seconds=0)

    assert rollout.run() is False
    assert traffic == [5, 25, 0]
```

**Try it:** write a second test where every reading is healthy, and check that `traffic == [5, 25, 50, 100]`.

---

## 13. Use Case: Protect Services with a Circuit Breaker

**The task:** A service you depend on is down. If your service keeps calling it, requests pile up and your service goes down too. This is a **cascading failure**.

**Fundamentals used:** classes, state (attributes), time, exceptions, conditions.

**How it works (a circuit breaker has three states):**
1. **Closed** – normal. Calls go through. Count failures in a row.
2. **Open** – too many failures. Calls fail at once without trying. This gives the other service time to recover.
3. **Half-open** – after a wait, allow one test call. If it works, go back to Closed. If it fails, go back to Open.

**Code:**
```python
import time

class CircuitOpenError(Exception):
    pass

class CircuitBreaker:
    def __init__(self, max_failures: int = 5, reset_after: float = 30.0):
        self.max_failures = max_failures
        self.reset_after = reset_after
        self.failures = 0
        self.opened_at: float | None = None

    @property
    def state(self) -> str:
        if self.opened_at is None:
            return "closed"
        if time.monotonic() - self.opened_at >= self.reset_after:
            return "half-open"
        return "open"

    def call(self, func, *args, **kwargs):
        if self.state == "open":
            raise CircuitOpenError("dependency is down; failing fast")
        try:
            result = func(*args, **kwargs)
        except Exception:
            self.failures += 1
            if self.failures >= self.max_failures or self.state == "half-open":
                self.opened_at = time.monotonic()
            raise
        self.failures = 0
        self.opened_at = None
        return result

payments_breaker = CircuitBreaker(max_failures=5, reset_after=30)

def charge(order):
    try:
        return payments_breaker.call(payments_api.charge, order)
    except CircuitOpenError:
        return queue_for_later(order)       # fallback plan
```

**Try it:** make a breaker with `max_failures=2, reset_after=1`, call a function that always raises three times, and print `breaker.state` after each call. Then wait one second and print it again.

---

## 14. Use Case: Automate Incident First Steps (Runbooks)

**The task:** When an alert fires, an engineer runs the same first checks every time. Automate these checks, so the on-call person gets the facts in seconds.

**Fundamentals used:** dicts mapping names to functions, functions, exceptions, f-strings, `datetime`, Markdown text output.

**How it works:**
1. Write each check as a small **function** that returns a short text result.
2. Keep a **dict** that maps each alert name to its list of checks. This is a runbook as code.
3. Run every check. If a check fails, record the error and continue.
4. Build a short report and post it to the incident channel.

**Code:**
```python
from datetime import datetime, timezone
from typing import Callable

def check_recent_deploys(service: str) -> str:
    deploys = deploy_api.recent(service, hours=2)
    return f"{len(deploys)} deploy(s) in last 2h: " + ", ".join(d["version"] for d in deploys)

def check_error_rate(service: str) -> str:
    rate = metrics_api.error_rate(service, minutes=15)
    return f"error rate (15m): {rate:.2%}"

def check_pod_restarts(service: str) -> str:
    pods = K8s().restarting_pods(service, min_restarts=3)
    return "no restarting pods" if not pods else f"restarting: {pods[:5]}"

def check_dependencies(service: str) -> str:
    results = check_all(dependency_hosts(service))
    down = [r.host for r in results if not r.ok]
    return "all dependencies healthy" if not down else f"DOWN: {', '.join(down)}"

RUNBOOKS: dict[str, list[Callable[[str], str]]] = {
    "HighErrorRate": [check_recent_deploys, check_error_rate, check_dependencies, check_pod_restarts],
    "HighLatency": [check_recent_deploys, check_dependencies],
}

def triage(alert: str, service: str) -> str:
    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    lines = [f"## Triage: {alert} on {service} ({now})"]
    for check in RUNBOOKS.get(alert, []):
        try:
            lines.append(f"- **{check.__name__}**: {check(service)}")
        except Exception as error:
            lines.append(f"- **{check.__name__}**: could not run ({error})")
    return "\n".join(lines)

print(triage("HighErrorRate", "checkout"))
```

Start with checks that only **read** data. Add automatic fixes (restart, scale up) only after the team trusts the checks, and always log every action taken.

---

## 15. Use Case: Run a Chaos Experiment

**The task:** Prove that the system survives a failure (for example, one pod dies) **before** it happens for real.

**Fundamentals used:** context managers (to always undo the change), `random`, functions, loops, time, exceptions.

**How it works:**
1. Write a **hypothesis**: "If one checkout pod is killed, the error rate stays below 1%."
2. Check the system is healthy before you start (the "steady state").
3. Inject the failure inside a **context manager**, so the system is always put back, even if the script crashes.
4. Watch the key numbers during the experiment.
5. Stop at once if the numbers go past a safe limit. This limits the **blast radius** (how much is affected).
6. Write down what you learned.

**Code:**
```python
import logging
import random
import time
from contextlib import contextmanager

log = logging.getLogger("chaos")

@contextmanager
def scaled_down(k8s, namespace: str, deployment: str, replicas: int):
    """Scale down for the experiment, then always scale back."""
    original = k8s.apps.read_namespaced_deployment_scale(deployment, namespace).spec.replicas
    k8s.scale(namespace, deployment, replicas)
    try:
        yield
    finally:
        k8s.scale(namespace, deployment, original)
        log.info("restored %s to %d replicas", deployment, original)

def kill_random_pod(k8s, namespace: str, label: str) -> str:
    pods = k8s.core.list_namespaced_pod(namespace, label_selector=label).items
    victim = random.choice(pods).metadata.name
    k8s.core.delete_namespaced_pod(victim, namespace)
    return victim

def experiment(k8s, read_error_rate, namespace="shop", label="app=checkout",
               abort_above=0.05, watch_seconds=300) -> dict:
    baseline = read_error_rate()
    if baseline > 0.01:
        return {"result": "skipped", "reason": f"not healthy before start ({baseline:.2%})"}

    victim = kill_random_pod(k8s, namespace, label)
    worst = baseline
    end = time.monotonic() + watch_seconds
    while time.monotonic() < end:
        rate = read_error_rate()
        worst = max(worst, rate)
        if rate > abort_above:
            return {"result": "aborted", "victim": victim, "worst_error_rate": worst}
        time.sleep(10)
    return {"result": "passed" if worst <= 0.01 else "failed",
            "victim": victim, "worst_error_rate": worst}
```

Run chaos experiments in a test environment first. Tell the team before you run one in production.

---

## 16. Use Case: Clean Up Old Files and Resources

**The task:** Old log files, backups, and temporary files fill the disk. Delete files older than N days, but never delete by mistake.

**Fundamentals used:** `pathlib`, `datetime`, generators, conditions, `--dry-run`, logging.

**How it works:**
1. Find files with `Path.rglob`.
2. Compare each file's modified time with a cut-off date.
3. Use a **generator** to list candidates, so huge folders do not fill memory.
4. Make **dry-run the default**. Deleting needs an extra `--delete` flag.
5. Log every file you delete and the total space freed.

**Code:**
```python
import argparse
import logging
import time
from pathlib import Path
from typing import Iterator

log = logging.getLogger("cleanup")

def old_files(root: Path, pattern: str, days: int) -> Iterator[Path]:
    cutoff = time.time() - days * 86400
    for path in root.rglob(pattern):
        if path.is_file() and path.stat().st_mtime < cutoff:
            yield path

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    parser.add_argument("--pattern", default="*.log.gz")
    parser.add_argument("--days", type=int, default=14)
    parser.add_argument("--delete", action="store_true", help="really delete (default is dry-run)")
    args = parser.parse_args()
    logging.basicConfig(level=logging.INFO, format="%(levelname)s %(message)s")

    count, freed = 0, 0
    for path in old_files(args.root, args.pattern, args.days):
        size = path.stat().st_size
        if args.delete:
            path.unlink()
            log.info("deleted %s", path)
        else:
            log.info("[dry-run] would delete %s", path)
        count += 1
        freed += size

    action = "deleted" if args.delete else "would delete"
    log.info("%s %d files, %.1f MB", action, count, freed / 1_000_000)

if __name__ == "__main__":
    main()
```

---

## 17. Practice Projects

| # | Project | Fundamentals practised |
|---|---------|------------------------|
| 1 | CLI tool template with `--dry-run`, logging, and exit codes | `argparse`, functions, logging |
| 2 | Log analyser for large and compressed logs | generators, regex, `Counter`, `heapq` |
| 3 | Parallel health checker for a host list | threads, exceptions, dataclasses |
| 4 | Disk alert script with a state file | `shutil`, JSON, conditions |
| 5 | Config validator that runs in CI | YAML, sets, exit codes |
| 6 | Metrics decorator for any Python function | decorators, `try`/`finally`, Prometheus |
| 7 | SLO and error budget report | maths, dataclasses, properties |
| 8 | Kubernetes helper: find restarting pods, scale, drain | classes, client library, exceptions |
| 9 | Canary rollout tool with tests using fakes | classes, functions as parameters |
| 10 | **Final project:** reliability toolkit: health checks + metrics + alerts + runbook triage + one chaos experiment + a written report | everything above |

---

## 18. Skills Checklist

- [ ] I can write a CLI tool with `--help`, `--dry-run`, and correct exit codes.
- [ ] I can read huge log files with generators and regex.
- [ ] I can check hundreds of hosts at once with a thread pool.
- [ ] I always set timeouts on network calls and commands.
- [ ] I run shell commands with a list and without `shell=True`.
- [ ] I can send alerts only when the state changes.
- [ ] I can validate config files and report all problems at once.
- [ ] I can publish counters, gauges, and histograms.
- [ ] I can write JSON logs with a request ID.
- [ ] I can explain and calculate SLI, SLO, error budget, and burn rate.
- [ ] I can automate common Kubernetes tasks with the Python client.
- [ ] I can build a canary rollout with automatic rollback.
- [ ] I can explain and build a circuit breaker.
- [ ] I can turn a runbook into a triage script.
- [ ] I can run a safe chaos experiment that always restores the system.

**Next:** read [Coding Best Practices](/docs/fundamentals/python/coding-best-practices).
