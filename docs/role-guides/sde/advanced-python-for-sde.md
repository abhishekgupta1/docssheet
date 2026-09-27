---
title: "Advanced Python for SDE"
description: "SDE-focused advanced Python topics: package publishing, deployment strategies, message queues and Celery, and security best practices."
sidebar_position: 2
level: advanced
tags: [python, sde]
image: /img/mental-model-share.png
---

# Advanced Python for SDE

The bigger topics an SDE (Software Development Engineer) meets when shipping
real software. Part of the [Role Guides](/docs/role-guides/role-guides-overview).

:::tip How to use this page

Read [Python for SDE](/docs/role-guides/sde/python-for-sde) first. Each section
has **In short** (the idea), an **Example**, and **Try it** (a small exercise).
The sections are independent — jump to what your project needs.

:::

## 1. Packaging your code {#packaging}

**In short:** a *package* is your code bundled so anyone can install it with
`pip install`. One config file, `pyproject.toml`, describes it.

A common layout — your code lives inside `src/`, tests live beside it:

```text
my_package/
├── pyproject.toml          # name, version, dependencies
├── README.md
├── src/
│   └── my_package/
│       ├── __init__.py     # marks the folder as a package
│       └── core.py
└── tests/
    └── test_core.py
```

`pyproject.toml`:

```toml
[build-system]
requires = ["setuptools>=69"]
build-backend = "setuptools.build_meta"

[project]
name = "my-package"
version = "1.0.0"
description = "A useful package"
requires-python = ">=3.10"
dependencies = [                       # installed automatically with your package
    "requests>=2.31",
]

[project.optional-dependencies]
dev = ["pytest", "pytest-cov"]         # installed with: pip install -e ".[dev]"

[project.scripts]
my-tool = "my_package.core:main"       # creates a "my-tool" command
```

**Build and publish:**

```bash
python -m pip install build twine
python -m build                        # creates files in dist/
python -m twine upload --repository testpypi dist/*   # practice on Test PyPI first
python -m twine upload dist/*          # the real PyPI
```

**Version numbers** usually follow *semantic versioning*: `MAJOR.MINOR.PATCH`.

| Change | Bump | Example |
|---|---|---|
| Breaking change | MAJOR | `1.4.2` → `2.0.0` |
| New feature, nothing broken | MINOR | `1.4.2` → `1.5.0` |
| Bug fix only | PATCH | `1.4.2` → `1.4.3` |

Companies often publish to a *private* package index (AWS CodeArtifact,
Artifactory, Nexus) instead of the public PyPI.

**Try it:** turn any small script into a package with the layout above,
install it with `pip install -e .` (the `-e` means "editable", so your changes
apply without reinstalling), and run its command.

## 2. Deploying safely {#deployment}

**In short:** deploying is where things break, so release in small, reversible
steps and check health before sending real users over.

| Strategy | How it works | Why use it |
|---|---|---|
| **Rolling** | Replace servers a few at a time | Simple, no extra servers needed |
| **Blue-green** | Run the new version (green) beside the old (blue), then switch all traffic | Instant switch back if it breaks |
| **Canary** | Send a small share of users (say 5%) to the new version first | Problems only hit a few users |
| **Feature flags** | Ship code switched off, turn it on with a setting | Release features without deploying |

Most Python services are shipped as **containers** (Docker images) and run on
a platform such as Kubernetes, which restarts them if a *health check* fails.

A blue-green deploy, step by step:

```python
import time
import requests

def all_healthy(hosts: list[str]) -> bool:            # hosts: list of server names
    for host in hosts:
        response = requests.get(f"http://{host}/health", timeout=5)
        if response.status_code != 200:
            return False
    return True

def blue_green_deploy(version: str, platform, load_balancer) -> bool:
    green_hosts = platform.deploy_green(version)     # 1. start the new version

    if not all_healthy(green_hosts):                 # 2. check it before users arrive
        platform.destroy_green()
        return False

    load_balancer.send_traffic_to("green")           # 3. switch users over

    time.sleep(60)                                   # 4. watch it for a minute
    if platform.error_rate("green") > 0.01:          #    more than 1% errors?
        load_balancer.send_traffic_to("blue")        #    switch back instantly
        return False

    platform.destroy_blue()                          # 5. retire the old version
    return True
```

Always plan the **rollback** before you deploy — including database changes,
which are the hardest part to undo.

## 3. Background jobs & message queues {#queues}

**In short:** slow work (sending emails, resizing images) shouldn't make a
user wait. Put it on a *queue*, and separate *worker* processes do it in the
background.

- **Producer** — the code that adds a job to the queue (your web app).
- **Broker** — the queue itself (Redis, RabbitMQ, Amazon SQS).
- **Worker** — a process that takes jobs off the queue and runs them.

**Celery** is the most common Python tool for this:

```python
# tasks.py
import smtplib
from celery import Celery

app = Celery("myapp", broker="redis://localhost:6379/0")

@app.task(bind=True, max_retries=3)
def send_email(self, to: str, subject: str, body: str):
    try:
        deliver_email(to, subject, body)
    except smtplib.SMTPException as error:
        # wait longer each time: 5s, 25s, 125s
        raise self.retry(exc=error, countdown=5 ** self.request.retries)
```

```python
# in your web app — returns immediately, a worker sends the email later
send_email.delay("ada@example.com", "Welcome", "Thanks for signing up")
```

Start a worker with `celery -A tasks worker`.

**Testing it:** call the task's code directly and mock the slow part:

```python
from unittest.mock import patch
from tasks import send_email

def test_send_email():
    with patch("tasks.deliver_email") as mock_deliver:
        send_email.apply(args=["ada@example.com", "Hi", "Body"])   # runs right here
        mock_deliver.assert_called_once_with("ada@example.com", "Hi", "Body")
```

A **dead letter queue** holds jobs that failed every retry, so you can
inspect them instead of losing them.

**Try it:** without Celery, use `queue.Queue` and one `threading.Thread`
worker to process a list of 5 "jobs" (just print them) in the background.

## 4. Security basics {#security}

**In short:** never trust input, never store secrets in code, and never store
passwords as plain text.

| Risk | What goes wrong | What to do |
|---|---|---|
| **SQL injection** | User input changes your database query | Use query parameters, never f-strings in SQL |
| **Command injection** | User input runs shell commands | `subprocess.run([...])` with a list, no `shell=True` |
| **Leaked secrets** | Passwords or API keys end up in git | Read them from environment variables or a secrets manager |
| **Unsafe loading** | `pickle.load` on untrusted data runs code | Use JSON for data from outside |
| **Vulnerable libraries** | A dependency has a known security hole | Run `pip-audit` regularly |

**Safe database query:**

```python
# BAD — a name like  x' OR '1'='1  changes the query
cursor.execute(f"SELECT * FROM users WHERE name = '{name}'")

# GOOD — the database treats name purely as a value
cursor.execute("SELECT * FROM users WHERE name = ?", (name,))   # tuple of values
```

**Storing passwords** — store a slow, salted *hash* (a one-way scramble), never
the password itself. The standard library can do this:

```python
import hashlib
import secrets

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)           # random bytes, different per user
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 600_000)
    return (salt + key).hex()                # store salt and hash together

def check_password(password: str, stored: str) -> bool:
    data = bytes.fromhex(stored)
    salt, expected = data[:16], data[16:]
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, 600_000)
    return secrets.compare_digest(key, expected)   # comparison that doesn't leak timing

stored = hash_password("correct horse")
check_password("correct horse", stored)      # True
check_password("wrong", stored)              # False
```

In real projects, a maintained library such as `argon2-cffi` or `bcrypt` is
even better.

**Reading a secret:**

```python
import os
api_key = os.environ["PAYMENT_API_KEY"]      # set outside the code, never committed
```

**Try it:** run `python -m pip install pip-audit`, then `pip-audit` in one of
your projects and read what it reports.
