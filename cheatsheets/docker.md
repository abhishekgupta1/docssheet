---
title: "Docker Cheat Sheet"
description: "A beginner-to-advanced reference for Docker — running containers, writing Dockerfiles, layers and caching, volumes, networks, Compose, multi-stage builds, security, health checks, and debugging."
sidebar_position: 6
level: beginner
tags: [docker, sde, sdet, sre, cheat-sheet]
hide_table_of_contents: true
image: /img/social/docker.png
---

# Docker cheatsheet

Learn Docker step by step, from your first container to small, safe
production images. Each section has three parts:

- **In short** — the idea in one sentence.
- **Example** — commands and files with a comment saying what each does.
- **Try it** — a tiny exercise to check you understood.

Want the longer story behind a topic? The [complete guide](/docs/sde-skills/docker-basics/docker-basics-guide)
walks through it in more depth.

<a class="topic-crosslink" href="/docs/sde-skills/docker-basics/docker-basics-guide">📖 Full guide: Docker →</a>

<LevelBadge level="beginner" />

<nav class="cheat-jump-nav" aria-label="Docker learning sections">
  <a class="button button--primary" href="/docs/learning-path/docker/docker-learning-path">Learning Path</a>
  <a class="button button--primary" href="/docs/sde-skills/docker-basics/docker-basics-guide">Complete Guide</a>
</nav>

:::tip How to use this page

Install Docker Desktop (or Colima / Podman on a Mac or Linux), then create the
[practice app](#practice-app) — most examples build and run it. Go through
**Part 1** in order; move to **Part 2** once you can build and run an image,
and **Part 3** when you're preparing images for production.

:::

## Contents {#contents}

**[Practice app](#practice-app)**

**[Part 1 — Beginner](#part-1)**:
[What Docker is](#what-is-docker) ·
[Running containers](#running) ·
[Images](#images) ·
[Writing a Dockerfile](#dockerfile) ·
[Building & publishing ports](#build-run) ·
[Looking inside](#inspect) ·
[Configuration](#config) ·
[Cleaning up](#cleanup)

**[Part 2 — Core](#part-2)**:
[Layers & caching](#layers) ·
[.dockerignore](#dockerignore) ·
[Volumes & bind mounts](#volumes) ·
[Networks](#networks) ·
[Docker Compose](#compose) ·
[ENTRYPOINT vs CMD](#entrypoint-cmd) ·
[Tags & registries](#registries) ·
[Common mistakes](#gotchas)

**[Part 3 — Advanced](#part-3)**:
[Multi-stage builds](#multi-stage) ·
[Smaller, safer images](#secure-images) ·
[Health checks & restarts](#healthchecks) ·
[Resource limits](#limits) ·
[Graceful shutdown](#shutdown) ·
[Faster & multi-platform builds](#buildkit) ·
[Debugging playbook](#debugging) ·
[Words you'll meet](#glossary)

## Practice app {#practice-app}

**In short:** a tiny web app with no dependencies, so every build is quick.
Put these two files in an empty folder called `hello-docker`.

```python
# app.py — answers every request with a greeting
import os
from http.server import BaseHTTPRequestHandler, HTTPServer


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        body = f"Hello from {os.environ.get('APP_NAME', 'docker')}!\n".encode()
        self.send_response(200)
        self.send_header("Content-Type", "text/plain")
        self.end_headers()
        self.wfile.write(body)


print("listening on port 8000", flush=True)
HTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
```

```dockerfile
# Dockerfile — the recipe for the image
FROM python:3.12-slim
WORKDIR /app
COPY app.py .
EXPOSE 8000
CMD ["python", "app.py"]
```

## Part 1 — Beginner {#part-1}

<div class="cheat-sheet cheat-sheet--sde cheat-sheet--stack">

<div class="cheat-card">

#### 1. What Docker is {#what-is-docker}

**In short:** Docker packages an app **with everything it needs** — runtime,
libraries, settings — into an **image**, and runs it as an isolated
**container** that behaves the same on every machine.

| Word | Meaning |
|---|---|
| **Image** | A read-only package: files plus instructions for starting the app. Like a class. |
| **Container** | A running (or stopped) instance of an image. Like an object. |
| **Dockerfile** | The recipe used to build an image |
| **Registry** | A place that stores images — Docker Hub, GitHub Container Registry, AWS ECR |
| **Tag** | A version label on an image: `python:3.12-slim` |

**Container vs virtual machine (VM):** a VM runs a whole separate operating
system; a container shares the host's operating-system kernel and only
isolates the app's processes and files. That's why containers start in about
a second and use far less memory.

```bash
docker version          # client and server (engine) versions — both must answer
docker info             # how many containers and images you have, and more
```

**Try it:** run `docker version`. If the "Server" part errors, Docker's engine
isn't running yet — start Docker Desktop (or `colima start`).

</div>

<div class="cheat-card">

#### 2. Running containers {#running}

**In short:** `docker run` downloads the image if needed, creates a container,
and starts it.

```bash
docker run hello-world                         # prints a welcome message, then exits
docker run --rm -it python:3.12-slim python    # -it: interactive terminal; --rm: delete when it exits
docker run -d --name web nginx                 # -d: run in the background ("detached")

docker ps                                      # running containers
docker ps -a                                   # all containers, including stopped ones
docker logs web                                # what the container printed
docker stop web                                # ask it to stop (SIGTERM, then SIGKILL after 10 s)
docker start web                               # start the same container again
docker rm -f web                               # stop and delete it
```

A container stops when its main process exits. That's why `hello-world` stops
straight away, while `nginx` keeps running until you stop it.

**Try it:** run `docker run --rm -it alpine sh`, create a file, exit, and run
the same command again. Is the file still there? (It isn't — each `run` makes a
new container.)

</div>

<div class="cheat-card">

#### 3. Images {#images}

**In short:** images are downloaded ("pulled") from a registry and identified
by `name:tag`.

```bash
docker pull python:3.12-slim          # download an image
docker images                         # list local images and their sizes
docker image inspect python:3.12-slim --format '{{.Architecture}}'   # e.g. arm64
docker history python:3.12-slim       # the layers the image is made of
docker rmi python:3.12-slim           # delete a local image
```

| Image name | Means |
|---|---|
| `nginx` | `docker.io/library/nginx:latest` — Docker Hub, official image, tag `latest` |
| `python:3.12-slim` | Python 3.12 on a trimmed-down Debian |
| `ghcr.io/org/app:1.4.2` | Version 1.4.2 of `org/app` on GitHub's registry |

`latest` is just a default tag name, not "the newest version". Always pin a
specific tag in real projects.

**Try it:** pull `python:3.12` and `python:3.12-slim`, then compare their sizes
with `docker images python`.

</div>

<div class="cheat-card">

#### 4. Writing a Dockerfile {#dockerfile}

**In short:** a **Dockerfile** lists the steps to build your image, one
instruction per line, top to bottom.

```dockerfile
FROM python:3.12-slim          # start from an existing image (the "base image")
WORKDIR /app                   # cd into /app (created if missing) for the next steps
COPY app.py .                  # copy a file from your folder into the image
RUN python -m compileall .     # run a command at BUILD time
ENV APP_NAME=docker            # set an environment variable
EXPOSE 8000                    # document the port the app listens on
CMD ["python", "app.py"]       # the command to run when a container STARTS
```

| Instruction | Runs | Use for |
|---|---|---|
| `RUN` | Once, while building | Installing packages, compiling |
| `CMD` | Every time a container starts | Starting your app |
| `COPY` | While building | Your code and config files |

`EXPOSE` doesn't open anything by itself — it's documentation. You still
publish the port with `-p` when running.

**Try it:** add `RUN echo "built at $(date)" > /build-info.txt` to the
practice Dockerfile, and read the file inside a running container.

</div>

<div class="cheat-card">

#### 5. Building & publishing ports {#build-run}

**In short:** `docker build` turns the Dockerfile into an image; `-p` connects
a port on your computer to a port in the container.

```bash
cd hello-docker
docker build -t hello:1.0 .                  # -t: name:tag · "." = this folder is the build context
docker run -d --name hello -p 8080:8000 hello:1.0   # your port 8080 → container port 8000
curl localhost:8080                          # Hello from docker!
docker rm -f hello
```

`-p HOST:CONTAINER` — the left number is on your computer, the right one is
inside the container. `-p 127.0.0.1:8080:8000` makes it reachable only from
your own machine.

The **build context** (the `.`) is the folder sent to Docker for the build;
`COPY` can only copy files from inside it.

**Try it:** run two containers of the same image on ports 8081 and 8082.

</div>

<div class="cheat-card">

#### 6. Looking inside {#inspect}

**In short:** open a shell inside a running container, follow its logs, and
read its settings.

```bash
docker run -d --name hello -p 8080:8000 hello:1.0
docker exec -it hello sh                 # a shell inside the running container (type exit to leave)
docker exec hello ls /app                # run one command inside it
docker logs -f hello                     # follow the logs live (Ctrl+C to stop following)
docker inspect hello --format '{{range .NetworkSettings.Networks}}{{.IPAddress}}{{end}}'   # e.g. 172.17.0.2
docker stats --no-stream                 # CPU and memory use of each container
docker cp hello:/app/app.py ./copy.py    # copy a file out of a container
docker top hello                         # processes running inside it
```

`exec` works only on a *running* container. If it keeps crashing, read
`docker logs` first, or start it with a shell instead:
`docker run --rm -it hello:1.0 sh`.

**Try it:** slim images don't include `ps`. Find out which program is
process 1 with `docker exec hello cat /proc/1/cmdline` or `docker top hello`.

</div>

<div class="cheat-card">

#### 7. Configuration {#config}

**In short:** pass settings into a container with **environment variables**,
so one image works in every environment.

```bash
docker run --rm -p 8080:8000 -e APP_NAME=staging hello:1.0 &   # -e sets one variable
sleep 1 && curl localhost:8080                                 # Hello from staging!

cat > app.env <<'EOF'
APP_NAME=from-file
LOG_LEVEL=debug
EOF
docker run --rm --env-file app.env hello:1.0 env | grep APP_NAME   # APP_NAME=from-file
```

Never bake passwords or tokens into an image — anyone who can pull the image
can read them (`docker history` shows `ENV` values). Pass them at run time, or
use your platform's secret store.

**Try it:** change the practice app to read a `GREETING` variable with a
default, rebuild, and run it with two different greetings.

</div>

<div class="cheat-card">

#### 8. Cleaning up {#cleanup}

**In short:** stopped containers, old images, and build cache pile up — check
and prune them regularly.

```bash
docker system df                 # how much space images, containers, volumes, and cache use
docker container prune           # delete all stopped containers
docker image prune               # delete "dangling" images (untagged leftovers)
docker image prune -a            # delete every image not used by a container
docker builder prune             # delete the build cache
docker system prune              # stopped containers + unused networks + dangling images + cache
```

`prune` commands ask for confirmation; add `-f` to skip the question in
scripts. Volumes are **never** deleted unless you add `--volumes` — your data is
safe by default.

**Try it:** run `docker system df`, prune, and run it again. How much space
did you get back?

</div>

</div>

## Part 2 — Core {#part-2}

<div class="cheat-sheet cheat-sheet--sde cheat-sheet--stack">

<div class="cheat-card">

#### 9. Layers & caching {#layers}

**In short:** each `RUN`, `COPY`, and `ADD` makes a **layer**. Docker reuses
unchanged layers from its cache, but once one step changes, every step after
it runs again — so put things that change least at the top.

```dockerfile
# Slow: any code change reinstalls every dependency
FROM python:3.12-slim
WORKDIR /app
COPY . .
RUN pip install -r requirements.txt
CMD ["python", "app.py"]
```

```dockerfile
# Fast: dependencies are cached until requirements.txt itself changes
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
CMD ["python", "app.py"]
```

The same idea applies to every language: copy `package.json` and run
`npm ci` before copying the source; copy `pom.xml` and download dependencies
before copying `src/`.

**Try it:** build the fast version twice, changing only `app.py` in between.
The second build should say `CACHED` on the install step.

</div>

<div class="cheat-card">

#### 10. .dockerignore {#dockerignore}

**In short:** a `.dockerignore` file keeps files out of the build context —
faster builds, smaller images, and no secrets copied in by accident.

```text
# .dockerignore
.git
.env
*.log
__pycache__/
node_modules/
tests/
Dockerfile
.dockerignore
```

Without it, `COPY . .` copies your `.git` history, local `.env` secrets, and
`node_modules` built for your laptop instead of the container's system.

**Try it:** create a large dummy file (`mkfile 100m big.bin` on macOS,
`fallocate -l 100M big.bin` on Linux), build and watch the context size, then
ignore it and build again.

</div>

<div class="cheat-card">

#### 11. Volumes & bind mounts {#volumes}

**In short:** a container's own files disappear when it's deleted. Keep data
in a **volume** (managed by Docker) or a **bind mount** (a folder from your
computer).

```bash
docker volume create pgdata
docker run -d --name db -e POSTGRES_PASSWORD=pw \
  -v pgdata:/var/lib/postgresql/data postgres:17      # named volume: data survives the container

docker run --rm -it -v "$PWD":/app -w /app python:3.12-slim python app.py
# bind mount: the container sees your live source folder — edits apply immediately

docker volume ls
docker volume inspect pgdata                          # where Docker keeps it
docker rm -f db && docker volume rm pgdata            # the data is gone only now
```

| Kind | Written as | Use for |
|---|---|---|
| **Named volume** | `-v pgdata:/path` | Databases and anything that must survive |
| **Bind mount** | `-v "$PWD":/path` | Live-editing code during development |
| **tmpfs** | `--tmpfs /tmp` | Scratch data kept in memory only |

Add `:ro` (`-v "$PWD":/app:ro`) to make a mount read-only.

**Try it:** start PostgreSQL with a named volume, create a table, delete the
container, start a new one with the same volume, and check the table is still
there.

</div>

<div class="cheat-card">

#### 12. Networks {#networks}

**In short:** containers on the same user-defined **network** can reach each
other **by name**; Docker runs a small DNS (Domain Name System) service that
turns names into container addresses.

```bash
docker network create shop-net
docker run -d --name db --network shop-net -e POSTGRES_PASSWORD=pw postgres:17
sleep 5                                                           # give PostgreSQL a moment to start
docker run --rm --network shop-net postgres:17 pg_isready -h db   # db:5432 - accepting connections

docker network ls
docker network inspect shop-net       # which containers are attached
```

- Inside a network, containers use the **container** port (`db:5432`) — no `-p`
  needed. `-p` is only for reaching a container from *your computer*.
- Containers on the default network can't find each other by name — always
  create your own network (Compose does this for you).
- From inside a container, `localhost` is the container itself, not your
  computer. Use `host.docker.internal` to reach your computer (Docker Desktop).

**Try it:** run the practice app on `shop-net` and `curl` it by name from
another container: `docker run --rm --network shop-net curlimages/curl hello:8000`.

</div>

<div class="cheat-card">

#### 13. Docker Compose {#compose}

**In short:** **Compose** describes several containers — with their ports,
volumes, networks, and settings — in one file, and starts them all with one
command.

```yaml
# compose.yaml
services:
  web:
    build: .                          # build from the Dockerfile in this folder
    ports:
      - "8080:8000"
    environment:
      APP_NAME: compose
      DATABASE_URL: postgresql://postgres:pw@db:5432/shop   # "db" is the service name
    depends_on:
      db:
        condition: service_healthy    # wait until the database is ready, not just started
  db:
    image: postgres:17
    environment:
      POSTGRES_PASSWORD: pw
      POSTGRES_DB: shop
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U postgres"]
      interval: 5s
      retries: 10
volumes:
  pgdata:
```

```bash
docker compose up -d --build       # build if needed, start everything in the background
docker compose ps                  # status of each service
docker compose logs -f web         # follow one service's logs
docker compose exec db psql -U postgres shop   # a shell into a service
docker compose down                # stop and remove containers and the network
docker compose down -v             # …and the volumes (deletes the data!)
```

Compose creates a network for the project, so services reach each other by
service name. It's for development and testing; production usually uses
Kubernetes or a cloud container service.

**Try it:** add a third service, `adminer` (a web database browser, port
8080 inside), on host port 8081, and log into the database through it.

</div>

<div class="cheat-card">

#### 14. ENTRYPOINT vs CMD {#entrypoint-cmd}

**In short:** `ENTRYPOINT` is the program that always runs; `CMD` gives its
default arguments, which `docker run` can replace.

```dockerfile
FROM python:3.12-slim
ENTRYPOINT ["python", "-m", "http.server"]   # always runs this
CMD ["8000"]                                 # default argument
```

```bash
docker build -t fileserver .
docker run --rm -p 8000:8000 fileserver                 # python -m http.server 8000
docker run --rm -p 9000:9000 fileserver 9000            # python -m http.server 9000 — CMD replaced
docker run --rm -it --entrypoint sh fileserver          # replace the ENTRYPOINT to debug
```

Always use the **JSON array form** (`["python", "app.py"]`). The plain-text
form (`CMD python app.py`) runs your app inside `/bin/sh -c`, which stops it
receiving the stop signal — see [Graceful shutdown](#shutdown).

**Try it:** build the image above and serve on port 7000 without editing the
Dockerfile.

</div>

<div class="cheat-card">

#### 15. Tags & registries {#registries}

**In short:** to share an image, tag it with the registry's address and push
it; others pull it by that name.

```bash
docker login ghcr.io                                   # asks for a username and token
docker tag hello:1.0 ghcr.io/ada/hello:1.0             # add a second name to the same image
docker tag hello:1.0 ghcr.io/ada/hello:latest
docker push ghcr.io/ada/hello:1.0
docker push ghcr.io/ada/hello:latest

DIGEST=$(docker image inspect ghcr.io/ada/hello:1.0 \
  --format '{{range .RepoDigests}}{{println .}}{{end}}' | grep '^ghcr.io/')   # known after a push
echo "$DIGEST"                                         # ghcr.io/ada/hello@sha256:…
docker pull "$DIGEST"                                  # pull that exact, unchangeable version
```

A **tag** can be moved to a different image later; a **digest** (`sha256:…`)
names exactly one image forever. Deploy by version tag (`1.4.2`) or digest —
never `latest`, or you can't tell what's running or roll back reliably.

**Try it:** run a local registry (`docker run -d -p 5000:5000 registry:2`),
then tag, push, delete, and pull `localhost:5000/hello:1.0`.

</div>

<div class="cheat-card">

#### 16. Common mistakes {#gotchas}

**In short:** the classic Docker traps, and the fix for each.

| Mistake | Fix |
|---|---|
| App works locally but not in the container: "connection refused" | The app must listen on `0.0.0.0`, not `127.0.0.1`, inside the container |
| Changed the code, container still runs the old version | Rebuild the image (`docker build`, or `docker compose up --build`) |
| Every build reinstalls all dependencies | Copy the dependency file and install *before* copying the source ([layers](#layers)) |
| Data lost when the container was deleted | Put it in a named volume |
| Container can't reach `localhost:5432` | Use the service/container name (`db:5432`), or `host.docker.internal` for your computer |
| `docker stop` takes 10 seconds | The app ignores SIGTERM — see [Graceful shutdown](#shutdown) |
| Huge image | Slim base image, `.dockerignore`, [multi-stage build](#multi-stage) |
| Secret in the image | Pass it at run time; if it was pushed, rotate it — image layers keep it |
| "no space left on device" | `docker system df`, then prune |

**Try it:** change the practice app to listen on `127.0.0.1`, rebuild, and see
the first mistake for yourself.

</div>

</div>

## Part 3 — Advanced {#part-3}

<div class="cheat-sheet cheat-sheet--sde cheat-sheet--stack">

<div class="cheat-card">

#### 17. Multi-stage builds {#multi-stage}

**In short:** build in one stage with all the tools, then copy only the
result into a small final stage. Compilers and build caches never reach
production.

```dockerfile
# Stage 1: build a Java app with Maven
FROM maven:3.9-eclipse-temurin-21 AS build
WORKDIR /src
COPY pom.xml .
RUN mvn -q dependency:go-offline          # cached until pom.xml changes
COPY src ./src
RUN mvn -q package -DskipTests

# Stage 2: only a Java runtime and the JAR
FROM eclipse-temurin:21-jre
WORKDIR /app
COPY --from=build /src/target/*.jar app.jar
USER 1000
CMD ["java", "-jar", "app.jar"]
```

The build stage holds Maven, a full JDK (Java Development Kit), and every
downloaded library; the final image holds only a Java runtime and one JAR —
usually hundreds of megabytes smaller. Check with `docker images`.
`docker build --target build .` stops after a named stage — useful for running
tests in CI inside the build image.

**Try it:** write a two-stage Dockerfile for a Go program ending in
`FROM scratch` (an empty image), and compare its size with the build stage.

</div>

<div class="cheat-card">

#### 18. Smaller, safer images {#secure-images}

**In short:** every file in an image is something to download, patch, and
possibly exploit. Ship as little as possible, and don't run as `root`.

```dockerfile
FROM python:3.12-slim
WORKDIR /app
RUN useradd --create-home --uid 1000 appuser      # a normal user
COPY --chown=appuser:appuser app.py .
USER appuser                                      # everything after this runs as appuser
CMD ["python", "app.py"]
```

| Do | Why |
|---|---|
| Use `-slim`, `-alpine`, or **distroless** base images | Fewer packages = smaller, fewer vulnerabilities |
| Pin versions (`python:3.12.7-slim`, or by digest) | Builds are repeatable |
| Run as a non-root `USER` | A break-in gets fewer powers |
| Scan images (`docker scout cves`, Trivy, Grype) | Finds known vulnerabilities in packages |
| Clean up in the *same* `RUN` (`apt-get install … && rm -rf /var/lib/apt/lists/*`) | A later `RUN rm` doesn't shrink earlier layers |
| Use `--read-only` and `--cap-drop ALL` at run time where the app allows | Less the container can change |

**Distroless** images contain your app's runtime and nothing else — no shell,
no package manager.

**Try it:** run `docker run --rm hello:1.0 whoami` before and after adding the
`USER` line.

</div>

<div class="cheat-card">

#### 19. Health checks & restarts {#healthchecks}

**In short:** a **health check** lets Docker test whether the app really
works, not just whether the process is alive; a **restart policy** brings a
crashed container back.

```dockerfile
FROM python:3.12-slim
WORKDIR /app
COPY app.py .
HEALTHCHECK --interval=10s --timeout=2s --retries=3 \
  CMD python -c "import urllib.request; urllib.request.urlopen('http://localhost:8000')" || exit 1
CMD ["python", "app.py"]
```

```bash
docker run -d --name hello --restart unless-stopped -p 8080:8000 hello:1.0
docker ps                             # STATUS shows (healthy), (unhealthy), or (health: starting)
docker inspect hello --format '{{.State.Health.Status}}'
```

| `--restart` | Restarts the container… |
|---|---|
| `no` (default) | Never |
| `on-failure[:5]` | When it exits with an error (at most 5 times) |
| `unless-stopped` | Always, unless you stopped it yourself |
| `always` | Always, even after you stop it once Docker restarts |

Slim images don't include `curl`, which is why the check above uses Python.

</div>

<div class="cheat-card">

#### 20. Resource limits {#limits}

**In short:** without limits, one container can use all the host's memory or
CPU. Set limits, and know what happens when they're hit.

```bash
docker run -d --name hello --memory 256m --cpus 0.5 hello:1.0   # at most 256 MB and half a CPU
docker stats --no-stream hello                                  # MEM USAGE / LIMIT shows 256MiB
docker inspect hello --format '{{.State.OOMKilled}} {{.State.ExitCode}}'   # true 137 after an out-of-memory kill
```

- **Memory:** going over the limit gets the process killed by the kernel's
  **OOM killer** (Out Of Memory). The container exits with code **137**.
- **CPU:** going over the limit doesn't kill anything — the container is
  slowed down ("throttled").
- Runtimes need to be told about the limit: Java 10+ reads it automatically;
  Node.js may need `--max-old-space-size`.

**Try it:** run `python -c "x = bytearray(512 * 1024 * 1024)"` in a container
with `--memory 256m`, then check the exit code with `docker ps -a`.

</div>

<div class="cheat-card">

#### 21. Graceful shutdown {#shutdown}

**In short:** `docker stop` sends **SIGTERM** ("please stop") and waits 10
seconds before **SIGKILL** ("stop now"). Your app should catch SIGTERM, finish
current work, and exit.

```python
# app.py — handle SIGTERM so "docker stop" is instant and clean
import signal
import sys
from http.server import BaseHTTPRequestHandler, HTTPServer


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        self.send_response(200)
        self.end_headers()
        self.wfile.write(b"ok\n")


def stop(signum, frame):
    print("SIGTERM received, shutting down", flush=True)
    sys.exit(0)


signal.signal(signal.SIGTERM, stop)
HTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
```

Two things make a container ignore SIGTERM:

1. **Your app is PID 1** (process id 1). Linux doesn't apply default signal
   actions to PID 1, so an app without a handler never stops on SIGTERM. Add a
   handler (above), or run with `docker run --init`, which adds a tiny init
   process in front of your app.
2. **Shell form** `CMD python app.py` makes `/bin/sh` PID 1, and the shell
   doesn't pass the signal on. Use the JSON form.

**Try it:** time `docker stop` on the practice app with and without the
handler (`time docker stop hello`).

</div>

<div class="cheat-card">

#### 22. Faster & multi-platform builds {#buildkit}

**In short:** **BuildKit** (Docker's modern builder) can keep a download cache
between builds and build images for several CPU types at once.

```dockerfile
# syntax=docker/dockerfile:1
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r requirements.txt          # pip's cache survives between builds
COPY . .
CMD ["python", "app.py"]
```

```bash
docker buildx build --platform linux/amd64,linux/arm64 \
  -t ghcr.io/ada/hello:1.0 --push .          # one tag, two CPU types (Intel and ARM)

docker build --secret id=npmrc,src=$HOME/.npmrc .   # pass a secret to one RUN step without storing it
```

Macs with Apple chips and many cloud servers use **ARM** processors
(`arm64`); most others use **Intel/AMD** (`amd64`). An image built for one
can't run natively on the other, so publish both.

</div>

<div class="cheat-card">

#### 23. Debugging playbook {#debugging}

**In short:** work from the outside in — status, logs, settings, then inside
the container.

| Symptom | First commands |
|---|---|
| Container exits immediately | `docker ps -a` (exit code) · `docker logs <name>` · run it with `-it --entrypoint sh` |
| Exit code 137 | Killed — out of memory (`OOMKilled`) or by `docker stop` |
| Exit code 1 / 2 | The app's own error — read the logs |
| Can't reach the app | `docker ps` (is the port published?) · is the app listening on `0.0.0.0`? · `docker exec <name> wget -qO- localhost:8000` |
| Containers can't talk to each other | `docker network inspect <net>` — same network? using the service name and container port? |
| Build fails | `docker build --progress=plain --no-cache .` to see every step's full output |
| No shell in the image (distroless) | `docker debug <name>` (Docker Desktop), or attach a debug container sharing its process namespace: `docker run -it --pid container:<name> --network container:<name> busybox` |

</div>

<div class="cheat-card">

#### 24. Words you'll meet {#glossary}

**In short:** the jargon, in one line each.

| Word | Meaning |
|---|---|
| **Docker Engine / daemon** | The background service that builds and runs containers; the `docker` command talks to it |
| **OCI** | Open Container Initiative — the standard image format, so images work with Docker, Podman, and Kubernetes |
| **Base image** | The image in your `FROM` line |
| **Layer** | One saved change to the image's files, shared between images that use it |
| **Build context** | The folder sent to the builder; `COPY` can only read from it |
| **Digest** | The `sha256:…` fingerprint that names one exact image |
| **Namespace / cgroup** | Linux features that isolate what a container can see / limit what it can use |
| **Dangling image** | An image layer set with no tag, left over from rebuilding |
| **Sidecar** | A helper container running next to the main one (a log shipper, a proxy) |
| **Podman** | A Docker-compatible tool that runs containers without a background daemon |
| **Container orchestrator** | A system that runs containers across many machines — Kubernetes, ECS, Nomad |

For layering internals, networking under the hood, and interview questions,
see the [complete guide](/docs/sde-skills/docker-basics/docker-basics-guide).

</div>

</div>
