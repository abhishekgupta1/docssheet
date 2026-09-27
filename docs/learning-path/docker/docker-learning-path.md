---
title: "Docker Learning Path"
description: "Learn Docker in six hands-on milestones — running containers, containerising an app, fast builds, data and networks, Compose, and production-ready images — each with checkable results and a runnable solution."
sidebar_position: 1
level: beginner
tags: [docker, learning-path, projects]
image: /img/social/docker-learning-path.png
---

# Docker Learning Path

**In short:** six milestones, each a short hands-on session. Every milestone
lists what to build, a command that **proves** it works, and a complete
solution script that cleans up after itself.

:::tip How to use this page

For each milestone: read the listed [cheat sheet](/cheatsheets/docker)
sections, work in a new empty folder, and run the **Check** commands. Open the
solution only after you've tried. The deeper "why" is in the
[complete guide](/docs/sde-skills/docker-basics/docker-basics-guide). You need
Docker running: `docker version` must show a "Server" section.

:::

## The plan {#plan}

| Milestone | You learn | You prove it with |
|---|---|---|
| [1](#milestone-1) | Running and inspecting containers | A web server you started, read, and removed |
| [2](#milestone-2) | Writing a Dockerfile | Your own app answering on a port you chose |
| [3](#milestone-3) | Fast, clean builds | A rebuild that reuses the cached dependency layer |
| [4](#milestone-4) | Data and networks | A database whose data survives, reached by name |
| [5](#milestone-5) | Docker Compose | A two-service stack started with one command |
| [6](#milestone-6) | Production-ready images | A small, non-root, health-checked image that stops instantly |
| [Final](#final-project) | Everything | A containerised app of your own |

---

## Milestone 1: Run & explore {#milestone-1}

**Learn:** [What Docker is](/cheatsheets/docker#what-is-docker) ·
[Running containers](/cheatsheets/docker#running) ·
[Images](/cheatsheets/docker#images) ·
[Looking inside](/cheatsheets/docker#inspect)

**Tasks:**
1. Run `nginx` in the background as `m1-web`, publishing it on port 8181.
2. Fetch the page and find "Welcome to nginx" in it.
3. Read the container's logs, and list the files in `/usr/share/nginx/html` inside it.
4. Replace `index.html` inside the container with your own text and fetch the page again.
5. Remove the container.

**Check:** step 4 prints your text; afterwards `docker ps -a --filter name=m1-web -q` prints nothing.

<details>
<summary>Solution</summary>

```bash
docker run -d --name m1-web -p 8181:80 nginx:1.27 > /dev/null
sleep 1
curl -s localhost:8181 | grep -o "Welcome to nginx"        # Welcome to nginx
docker logs m1-web 2>&1 | tail -1                          # the request you just made
docker exec m1-web ls /usr/share/nginx/html                # 50x.html index.html
docker exec m1-web sh -c 'echo "Hello from milestone 1" > /usr/share/nginx/html/index.html'
curl -s localhost:8181                                     # Hello from milestone 1
docker rm -f m1-web > /dev/null
docker ps -a --filter name=m1-web -q                       # (nothing)
```

</details>

**Check yourself:**
- [ ] If you ran `nginx:1.27` again, would your changed page still be there? Why?
- [ ] What's the difference between `docker stop` and `docker rm`?

---

## Milestone 2: Containerise an app {#milestone-2}

**Learn:** [Writing a Dockerfile](/cheatsheets/docker#dockerfile) ·
[Building & publishing ports](/cheatsheets/docker#build-run) ·
[Configuration](/cheatsheets/docker#config)

**Tasks:**
1. Create the [practice app](/cheatsheets/docker#practice-app) (`app.py` and `Dockerfile`).
2. Build it as `m2-hello:1.0`.
3. Run it on port 8182 with `APP_NAME=milestone2`.
4. Change the app so it also returns the hostname (`socket.gethostname()`), rebuild as `1.1`, and run both versions side by side on 8182 and 8183.

**Check:** `curl localhost:8182` says `Hello from milestone2!`, and version 1.1
on 8183 also shows a hostname — which is the container's id.

<details>
<summary>Solution</summary>

```bash
mkdir m2 && cd m2
cat > app.py <<'EOF'
import os
from http.server import BaseHTTPRequestHandler, HTTPServer


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        body = f"Hello from {os.environ.get('APP_NAME', 'docker')}!\n".encode()
        self.send_response(200)
        self.end_headers()
        self.wfile.write(body)


HTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
EOF
cat > Dockerfile <<'EOF'
FROM python:3.12-slim
WORKDIR /app
COPY app.py .
EXPOSE 8000
CMD ["python", "app.py"]
EOF
docker build -q -t m2-hello:1.0 . > /dev/null
docker run -d --name m2-v1 -p 8182:8000 -e APP_NAME=milestone2 m2-hello:1.0 > /dev/null

sed -i.bak 's/body = f"Hello from {os.environ.get(.APP_NAME., .docker.)}!\\n".encode()/body = f"Hello from {os.environ.get(\x27APP_NAME\x27, \x27docker\x27)} on {socket.gethostname()}!\\n".encode()/' app.py
sed -i.bak 's/^import os$/import os\nimport socket/' app.py
docker build -q -t m2-hello:1.1 . > /dev/null
docker run -d --name m2-v2 -p 8183:8000 -e APP_NAME=milestone2 m2-hello:1.1 > /dev/null
sleep 1

curl -s localhost:8182                                   # Hello from milestone2!
curl -s localhost:8183                                   # Hello from milestone2 on <container id>!
docker rm -f m2-v1 m2-v2 > /dev/null
```

</details>

`sed` edits the file from the command line so the solution runs in one go —
when you do it yourself, just edit `app.py` in your editor.

**Check yourself:**
- [ ] Why must the app listen on `0.0.0.0` inside the container?
- [ ] Which number in `-p 8182:8000` is on your computer?

---

## Milestone 3: Fast, clean builds {#milestone-3}

**Learn:** [Layers & caching](/cheatsheets/docker#layers) ·
[.dockerignore](/cheatsheets/docker#dockerignore) ·
[Cleaning up](/cheatsheets/docker#cleanup)

**Tasks:**
1. Give the app a `requirements.txt` (for example `requests==2.32.3`) and a Dockerfile that installs it.
2. Order the Dockerfile so that changing `app.py` does **not** reinstall dependencies.
3. Add a `.dockerignore` so a local `.env` file and a `logs/` folder never reach the image.

**Check:** after changing `app.py`, the rebuild's `pip install` step says
`CACHED`, and `docker run --rm <image> ls -a /app` shows no `.env` and no `logs`.

<details>
<summary>Solution</summary>

```bash
mkdir m3 && cd m3
echo 'print("v1")' > app.py
echo "requests==2.32.3" > requirements.txt
echo "SECRET=1" > .env
mkdir logs && echo "old" > logs/app.log
cat > Dockerfile <<'EOF'
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]
EOF
printf '.env\nlogs/\n.dockerignore\nDockerfile\n' > .dockerignore

docker build -q -t m3-app . > /dev/null
echo 'print("v2")' > app.py
docker build --progress=plain -t m3-app . 2>&1 | grep -A1 "RUN pip install" | tail -1   # #8 CACHED
docker run --rm m3-app                                   # v2
docker run --rm m3-app ls -a /app                        # .  ..  app.py  requirements.txt
docker rmi -f m3-app > /dev/null
```

</details>

**Check yourself:**
- [ ] Why does a change to `app.py` not invalidate the `pip install` layer here?
- [ ] What else would you add to `.dockerignore` in a real project?

---

## Milestone 4: Data & networks {#milestone-4}

**Learn:** [Volumes & bind mounts](/cheatsheets/docker#volumes) ·
[Networks](/cheatsheets/docker#networks)

**Tasks:**
1. Create a network `m4-net` and a volume `m4-data`.
2. Start PostgreSQL 17 on that network with that volume, named `m4-db`.
3. From a *second* container on the network, connect to it **by name** and create a table with one row.
4. Delete the database container, start a new one with the same volume, and read the row back.

**Check:** the final query prints your row, although the first database
container no longer exists.

<details>
<summary>Solution</summary>

```bash
docker network create m4-net > /dev/null
docker volume create m4-data > /dev/null
docker run -d --name m4-db --network m4-net -e POSTGRES_PASSWORD=pw \
  -v m4-data:/var/lib/postgresql/data postgres:17 > /dev/null
until docker run --rm --network m4-net postgres:17 pg_isready -q -h m4-db; do sleep 1; done

psql_in_net() { docker run --rm --network m4-net -e PGPASSWORD=pw postgres:17 psql -h m4-db -U postgres -tAc "$1"; }
psql_in_net "CREATE TABLE notes (body TEXT); INSERT INTO notes VALUES ('kept by a volume');"

docker rm -f m4-db > /dev/null                           # the container is gone…
docker run -d --name m4-db --network m4-net -e POSTGRES_PASSWORD=pw \
  -v m4-data:/var/lib/postgresql/data postgres:17 > /dev/null
until docker run --rm --network m4-net postgres:17 pg_isready -q -h m4-db; do sleep 1; done
psql_in_net "SELECT body FROM notes;"                    # kept by a volume

docker rm -f m4-db > /dev/null && docker volume rm m4-data > /dev/null && docker network rm m4-net > /dev/null
```

</details>

**Check yourself:**
- [ ] Why didn't the second container need `-p`?
- [ ] What happens to the data if you remove the volume?

---

## Milestone 5: Compose a stack {#milestone-5}

**Learn:** [Docker Compose](/cheatsheets/docker#compose) ·
[Health checks & restarts](/cheatsheets/docker#healthchecks)

**Tasks:**
1. Write a `compose.yaml` with two services: `web` (built from a Dockerfile) and `db` (PostgreSQL 17 with a named volume).
2. `web` should connect to `db` and report how many tables exist. It must wait until the database is **healthy**, not just started.
3. Start everything with one command, check the answer, and remove everything (including the volume) with one command.

**Check:** `curl localhost:8185` answers with a table count, and after
`docker compose down -v` nothing from the project is left.

<details>
<summary>Solution</summary>

```bash
mkdir m5 && cd m5
cat > app.py <<'EOF'
import subprocess
from http.server import BaseHTTPRequestHandler, HTTPServer


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        count = subprocess.run(
            ["psql", "-h", "db", "-U", "postgres", "-tAc", "SELECT count(*) FROM pg_tables"],
            capture_output=True, text=True, env={"PGPASSWORD": "pw"},
        ).stdout.strip()
        self.send_response(200)
        self.end_headers()
        self.wfile.write(f"tables: {count}\n".encode())


HTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
EOF
cat > Dockerfile <<'EOF'
FROM python:3.12-slim
RUN apt-get update && apt-get install -y --no-install-recommends postgresql-client \
    && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY app.py .
CMD ["python", "app.py"]
EOF
cat > compose.yaml <<'EOF'
services:
  web:
    build: .
    ports:
      - "8185:8000"
    depends_on:
      db:
        condition: service_healthy
  db:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: pw
    volumes:
      - m5-data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 2s
      retries: 20
volumes:
  m5-data:
EOF
docker compose -p m5 up -d --build --wait > /dev/null 2>&1
curl -s localhost:8185                                   # tables: 68 (PostgreSQL's own tables)
docker compose -p m5 down -v > /dev/null 2>&1
docker ps -a --filter label=com.docker.compose.project=m5 -q   # (nothing)
```

</details>

The solution's app shells out to `psql` to stay dependency-free; a real app
would use a database driver such as `psycopg`.

**Check yourself:**
- [ ] Why is `condition: service_healthy` better than a plain `depends_on: [db]`?
- [ ] How does `web` find `db` without an IP address?

---

## Milestone 6: Production-ready image {#milestone-6}

**Learn:** [Multi-stage builds](/cheatsheets/docker#multi-stage) ·
[Smaller, safer images](/cheatsheets/docker#secure-images) ·
[Resource limits](/cheatsheets/docker#limits) ·
[Graceful shutdown](/cheatsheets/docker#shutdown) ·
[Debugging playbook](/cheatsheets/docker#debugging)

**Tasks:**
1. Build the app with a **two-stage** Dockerfile: install dependencies into a virtual environment in the first stage, copy only that environment and the code into the second.
2. Run as a non-root user, with a `HEALTHCHECK`.
3. Make the app handle SIGTERM so `docker stop` finishes in under a second.
4. Run it with a 128 MB memory limit.

**Check:** `whoami` in the container prints `appuser`; `docker ps` shows
`(healthy)`; `docker stop` takes under a second; `docker stats` shows a
128 MiB limit.

<details>
<summary>Solution</summary>

```bash
mkdir m6 && cd m6
echo "requests==2.32.3" > requirements.txt
cat > app.py <<'EOF'
import signal
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"ok\n")


signal.signal(signal.SIGTERM, lambda *_: sys.exit(0))
HTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
EOF
cat > Dockerfile <<'EOF'
FROM python:3.12-slim AS build
RUN python -m venv /venv
COPY requirements.txt .
RUN /venv/bin/pip install --no-cache-dir -r requirements.txt

FROM python:3.12-slim
RUN useradd --create-home --uid 1000 appuser
COPY --from=build /venv /venv
WORKDIR /app
COPY --chown=appuser:appuser app.py .
USER appuser
ENV PATH="/venv/bin:$PATH"
HEALTHCHECK --interval=2s --timeout=2s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000')" || exit 1
CMD ["python", "app.py"]
EOF
docker build -q -t m6-app . > /dev/null
docker run -d --name m6 --memory 128m -p 8186:8000 m6-app > /dev/null
sleep 5

docker exec m6 whoami                                    # appuser
docker ps --filter name=m6 --format '{{.Status}}'        # Up 5 seconds (healthy)
docker stats --no-stream --format '{{.MemUsage}}' m6     # … / 128MiB
start=$(date +%s)
docker stop m6 > /dev/null
echo "stopped in $(( $(date +%s) - start )) s"           # stopped in 0 s
docker rm m6 > /dev/null && docker rmi m6-app > /dev/null
```

</details>

**Check yourself:**
- [ ] Why does the final stage not contain `pip`'s download cache or build tools?
- [ ] What exit code would you see if the app went over 128 MB?

---

## Final project {#final-project}

**In short:** containerise something of your own, the way a team would ship it.

1. Pick a small app you've written (any language) that uses a database.
2. Write a multi-stage Dockerfile: cached dependencies, non-root user, health
   check, SIGTERM handling, pinned base image.
3. Write a `compose.yaml` with the app, its database (named volume, health
   check), and one extra tool (for example Adminer).
4. Add a `.dockerignore` and check that no secrets or local build output end
   up in the image.
5. Scan the image (`docker scout cves` or Trivy) and fix what you can.
6. Tag it with a version and push it to a registry (a local `registry:2`
   container is fine).

**You're done when:** a teammate can run `docker compose up` on a fresh
machine and get a working app, and you can explain every line of your
Dockerfile.

**Next:** read [Common Pitfalls](/docs/sde-skills/docker-basics/docker-basics-guide#10-common-pitfalls)
and the [interview questions](/docs/sde-skills/docker-basics/docker-basics-guide#12-interview-ready-qa)
in the complete guide.
