---
title: "Docker Basics: The Complete Guide"
description: "End-to-end reference for Docker — images and layers, Dockerfile essentials, the container lifecycle, networking and volumes, docker-compose, a debugging playbook, and interview-ready Q&A."
sidebar_position: 1
tags: [docker, sde, containers]
---

# Docker Basics — The Complete Guide

A single-read, end-to-end reference for Docker: enough to containerize a
service correctly, run and debug it locally, or walk into an SDE interview.
Organized as a lookup you can also read top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/docker">📋 Quick reference: Docker →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 320" role="img" aria-labelledby="mm-docker-title mm-docker-desc">
<title id="mm-docker-title">How a Docker image becomes a running container</title>
<desc id="mm-docker-desc">A Dockerfile builds a stack of cached, read-only image layers; running that image adds a writable layer on top to create a container; and images move to and from a registry through push and pull, reusing shared layers.</desc>
<defs>
  <marker id="mm-docker-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n3" x="20" y="105" width="150" height="70" rx="10"/>
<text class="mm-node-title" x="95" y="135" text-anchor="middle">Dockerfile</text>
<text class="mm-node-sub" x="95" y="152" text-anchor="middle">build instructions</text>

<path class="mm-arrow" d="M170,140 L206,140" marker-end="url(#mm-docker-arrow)"/>
<text class="mm-flow-label" x="188" y="128" text-anchor="middle">docker build</text>

<rect class="mm-n5" x="210" y="50" width="190" height="180" rx="10"/>
<text class="mm-node-title" x="305" y="75" text-anchor="middle">Image</text>
<rect class="mm-n1" x="230" y="88" width="150" height="26" rx="6"/>
<text class="mm-node-sub" x="305" y="105" text-anchor="middle">CMD</text>
<rect class="mm-n2" x="230" y="118" width="150" height="26" rx="6"/>
<text class="mm-node-sub" x="305" y="135" text-anchor="middle">COPY . .</text>
<rect class="mm-n3" x="230" y="148" width="150" height="26" rx="6"/>
<text class="mm-node-sub" x="305" y="165" text-anchor="middle">RUN npm install</text>
<rect class="mm-n4" x="230" y="178" width="150" height="26" rx="6"/>
<text class="mm-node-sub" x="305" y="195" text-anchor="middle">FROM node:20 (base)</text>

<path class="mm-arrow" d="M400,140 L436,140" marker-end="url(#mm-docker-arrow)"/>
<text class="mm-flow-label" x="418" y="128" text-anchor="middle">docker run</text>

<rect class="mm-n2" x="430" y="105" width="160" height="70" rx="10"/>
<text class="mm-node-title" x="510" y="135" text-anchor="middle">Container</text>
<text class="mm-node-sub" x="510" y="152" text-anchor="middle">writable layer, running</text>

<path class="mm-arrow" d="M515,175 L528,246" marker-end="url(#mm-docker-arrow)"/>
<text class="mm-flow-label" x="565" y="210" text-anchor="middle">docker push</text>

<rect class="mm-n6" x="450" y="250" width="170" height="55" rx="10"/>
<text class="mm-node-title" x="535" y="273" text-anchor="middle">Registry</text>
<text class="mm-node-sub" x="535" y="290" text-anchor="middle">push / pull</text>

<path class="mm-arrow" d="M450,270 C320,300 260,290 300,234" marker-end="url(#mm-docker-arrow)"/>
<text class="mm-flow-label" x="345" y="305" text-anchor="middle">docker pull — reuses cached layers</text>
</svg>

<p class="mental-model__caption">A Dockerfile builds cached, read-only layers into an image; running that image adds one writable layer on top as a container; and pushing or pulling through a registry moves that same image around while reusing its shared layers instead of re-copying everything.</p>
</div>

## 1. Containers vs. Virtual Machines

Both isolate workloads, but at fundamentally different layers.

| | Container | Virtual Machine |
|---|---|---|
| Isolation unit | A process (or process group) on the **host kernel** | A full guest OS with its own kernel |
| Boot time | Milliseconds — it's just a process starting | Seconds to minutes — booting an entire OS |
| Size | MBs (shares the host kernel; only app + deps) | GBs (full OS image) |
| Isolation mechanism | Linux kernel primitives: **namespaces** (isolate what a process can see: PIDs, network, mounts, hostname) + **cgroups** (limit what it can use: CPU, memory, I/O) | Hardware-level virtualization (hypervisor: VMware, KVM, Hyper-V) |
| Density | Dozens–hundreds per host | Single digits–low tens per host |
| Kernel | Shared with host — **a container is not a full OS** | Independent per VM |

**The one-sentence version an interviewer wants:** a container is an isolated
*process*, sharing the host's kernel via namespaces and cgroups; a VM is an
isolated *machine*, running its own kernel on top of virtualized hardware.
This is exactly why containers start fast and pack densely, and also why
container isolation is weaker than VM isolation (a kernel vulnerability
potentially affects every container sharing that kernel).

---

## 2. Images and Layers

A Docker **image** is a read-only template built from a stack of **layers**,
each corresponding to an instruction in a Dockerfile. A **container** is a
running (or stopped) instance of an image, with one thin writable layer on
top.

```
┌─────────────────────────────┐
│  Container writable layer    │  ← changes at runtime live here, discarded on rm
├─────────────────────────────┤
│  Layer: CMD                   │
│  Layer: COPY . .               │
│  Layer: RUN npm install         │
│  Layer: COPY package.json       │
│  Layer: FROM node:20-slim (base) │
└─────────────────────────────┘
```

- Layers are **content-addressed and cached** — Docker reuses a cached layer
  if the instruction and its build context haven't changed, skipping
  re-execution entirely. This is the single biggest lever for fast builds.
- Layers are **shared across images** — two images both built `FROM
  node:20-slim` share that base layer on disk once, not duplicated per image.
- The build **cache invalidates from the first changed layer onward** — every
  layer after a cache miss re-runs, even if its own instruction didn't
  change. This is why instruction *order* in a Dockerfile matters enormously
  (see §3).

```bash
docker image history myapp:latest    # see each layer, its size, and the command that created it
docker image inspect myapp:latest     # full metadata: layers, env, entrypoint, config
```

---

## 3. Dockerfile Essentials

```dockerfile
FROM node:20-slim AS base
WORKDIR /app

# Copy only dependency manifests first — cache layer survives unless deps change
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Now copy the rest of the source — changes here don't invalidate the npm-install layer above
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

USER node
ENTRYPOINT ["node"]
CMD ["server.js"]
```

| Instruction | Purpose |
|---|---|
| `FROM` | Base image to build on top of — every Dockerfile starts here |
| `WORKDIR` | Sets the working directory for subsequent instructions (also creates it) |
| `COPY` | Copies files from build context into the image |
| `ADD` | Like `COPY`, plus can fetch URLs and auto-extract tar archives — prefer `COPY` unless you specifically need those extras (`ADD`'s "magic" behavior is a common source of surprises) |
| `RUN` | Executes a command **at build time**, result baked into a new layer (installing packages, compiling) |
| `ENV` | Sets environment variables available at build time and in the running container |
| `ARG` | Build-time-only variable (e.g. `--build-arg VERSION=1.2`) — unlike `ENV`, it is **not** present in the final image or `docker inspect` output unless explicitly re-assigned to an `ENV` |
| `EXPOSE` | Documents which port the container listens on — **does not actually publish it**; that's `docker run -p` |
| `USER` | Switches the user subsequent instructions/the container run as — don't leave this as root |
| `ENTRYPOINT` | The fixed executable a container always runs |
| `CMD` | Default arguments to `ENTRYPOINT` (or the full command if no `ENTRYPOINT`) — **overridable** at `docker run` |
| `HEALTHCHECK` | A command Docker runs periodically inside the container to mark it `healthy`/`unhealthy`/`starting` — this is what `docker-compose`'s `depends_on: condition: service_healthy` (§8) actually polls |
| `VOLUME` | Declares a mount point; if no volume/bind mount is supplied at runtime, Docker creates an anonymous volume there automatically |

### `ENTRYPOINT` vs `CMD` — the distinction that trips people up

- `CMD` alone: the whole thing is the default command, and is fully replaced
  if you pass a command to `docker run`.
- `ENTRYPOINT` + `CMD` together: `ENTRYPOINT` is the fixed command,
  `CMD` supplies default *arguments* to it — `docker run myimage --verbose`
  overrides just the `CMD` portion, appending/replacing the arguments while
  `ENTRYPOINT` stays fixed. This pattern is how CLI-style images (e.g. a
  `git` or `kubectl` image) work: the binary is fixed, only the flags change.

### PID 1, `exec` form vs. shell form, and graceful shutdown

The process launched by `ENTRYPOINT`/`CMD` runs as **PID 1** inside the
container's PID namespace, and `docker stop` sends `SIGTERM` to PID 1 (then
`SIGKILL` after the grace period, default 10s). This only works cleanly if
your app is actually PID 1:

```dockerfile
# Shell form — runs as `/bin/sh -c "node server.js"`, so the SHELL is PID 1,
# not node. SIGTERM goes to the shell, which often doesn't forward it —
# node keeps running until SIGKILL, i.e. an unclean shutdown every time.
CMD node server.js

# Exec form — node itself becomes PID 1 and receives SIGTERM directly,
# so it can close DB connections, finish in-flight requests, etc.
CMD ["node", "server.js"]
```

The same trap applies to entrypoint *scripts*: `CMD myscript.sh` running
`node server.js` as its last line needs `exec node server.js` inside the
script (not just `node server.js`) so `exec` replaces the shell process
with `node` instead of spawning it as a child — otherwise the script (PID 1)
absorbs the signal and never relays it.

### `.dockerignore`

```
.git
.gitignore
node_modules
dist
npm-debug.log
.env
.env.*
*.md
.dockerignore
Dockerfile
.vscode
coverage
**/__pycache__
```

Excludes files from the **build context** sent to the Docker daemon —
without it, `COPY . .` can send gigabytes of `node_modules`/`.git` to the
daemon on every build, slowing builds and bloating unrelated layers.
Functionally the Docker equivalent of `.gitignore`. It's also a security
control, not just a performance one: the entire build context is tar'd and
sent to the daemon *before* the build starts, and anything not excluded can
end up `COPY`'d into a layer — a stray `.env` with real credentials in the
build directory is a common way secrets leak into an image (and from there,
into a registry) if `.dockerignore` doesn't exclude it.

### Layer-order optimization: why "copy deps first" matters

```dockerfile
# BAD — any source change invalidates the npm install cache layer
COPY . .
RUN npm install

# GOOD — dependency layer only re-runs when package.json/lock actually changes
COPY package.json package-lock.json ./
RUN npm install
COPY . .
```

Putting `COPY . .` before `RUN npm install` means Docker sees the layer's
input (all your source files) change on *every* code edit — even a comment
change — forcing a full dependency reinstall on every single build. Copying
only the manifest files first, installing, then copying the rest keeps the
expensive install step cached across ordinary code changes.

---

## 4. Multi-Stage Builds & Minimizing Image Size

A **multi-stage build** uses multiple `FROM` statements in one Dockerfile;
each is a separate build stage, and later stages can selectively copy
artifacts from earlier ones — the final image contains only what the last
stage explicitly copies in, not the build toolchain.

```dockerfile
# Stage 1: build — has the full compiler/SDK/toolchain
FROM golang:1.22 AS builder
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /out/app .

# Stage 2: runtime — tiny, no compiler, no source, no build cache
FROM gcr.io/distroless/static-debian12
COPY --from=builder /out/app /app
USER nonroot:nonroot
ENTRYPOINT ["/app"]
```

Why this matters: `golang:1.22` is ~800MB with the full compiler toolchain;
the final image here contains only the compiled binary — often under 20MB.
The build stage's layers (source, compiler, build cache, intermediate
artifacts) never ship to production, which shrinks attack surface as well as
size.

### Other size/security levers

| Technique | Effect |
|---|---|
| Use `-slim`/`-alpine`/`distroless` base images | Drop unnecessary OS packages, shells, package managers from the final image |
| Multi-stage builds | Exclude compilers/build tools/source from the runtime image entirely |
| `.dockerignore` | Keeps unrelated files out of the build context and accidental `COPY . .` sweep-ups |
| Combine `RUN` steps with `&&` | Fewer layers, and lets you clean up (`apt-get clean`, remove cache) **within the same layer** it was created in — cleaning in a later `RUN` doesn't shrink the earlier layer, since layers are append-only |
| `USER` non-root | Not a size lever, but the standard adjacent hardening step — see §9 |

```dockerfile
# Cleanup must happen in the SAME RUN as the install, or the image doesn't shrink
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*
```

### A fuller example: three-stage Node.js build

The Go example above splits build vs. runtime into two stages. A real
Node.js service often benefits from a **third** stage that isolates
*production-only* dependency installation from the *build* toolchain, since
the two need different `npm` invocations:

```dockerfile
# ---- Stage 1: deps — production dependencies only ----
FROM node:20.11-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# ---- Stage 2: build — full devDependencies + compiler/bundler ----
FROM node:20.11-slim AS builder
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

# ---- Stage 3: runtime — only what actually runs in production ----
FROM node:20.11-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production
RUN groupadd -r appuser && useradd -r -g appuser appuser
COPY --from=deps /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package.json ./
USER appuser
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=3s \
  CMD node -e "require('http').get('http://localhost:3000/health',r=>process.exit(r.statusCode===200?0:1))"
CMD ["node", "dist/server.js"]
```

Why a separate `deps` stage instead of just reusing `builder`'s
`node_modules`: `builder` installs **all** dependencies (including
dev-only ones like the TypeScript compiler and test runner) because it
needs them to build. `deps` installs only `--omit=dev` packages, and it's
that slimmer `node_modules` — not `builder`'s — that gets copied into
`runtime`. The result: the final image has the Node runtime, production
`node_modules`, and compiled `dist/` — no source `.ts` files, no bundler, no
dev dependencies, no `.git`. Using `npm ci` rather than `npm install`
matters too: it installs exactly what's in the lockfile, is faster in CI,
and fails loudly instead of silently drifting if the lockfile and
`package.json` disagree. `HEALTHCHECK` here is also what a Compose
`depends_on: condition: service_healthy` (§8) actually polls.

The same three-stage shape generalizes: for Python, a `builder` stage
creates a virtualenv (`python -m venv /venv && pip install -r
requirements.txt`) and the final stage just `COPY --from=builder /venv
/venv`, so `pip` and any compiler-only packages (`gcc`, dev headers) never
ship in the runtime image.

### BuildKit cache mounts (faster CI builds)

```dockerfile
# syntax=docker/dockerfile:1
RUN --mount=type=cache,target=/root/.npm \
    npm ci
```

A `--mount=type=cache` persists the package manager's download cache
*across builds on the same builder*, without baking that cache into any
image layer — distinct from the layer cache (§2), which is invalidated
wholesale on a changed input. This is why CI builds using BuildKit cache
mounts can stay fast even when the dependency-install layer itself has to
re-run (e.g. after a `package-lock.json` bump): only the actually-changed
packages get downloaded, the rest come from the persistent cache mount.
BuildKit is the default builder in modern Docker; enable explicitly with
`DOCKER_BUILDKIT=1` on older installs.

### Debugging into a distroless/scratch final stage

A distroless or `scratch` final stage (like the Go example above) has no
shell — `docker exec ... sh` simply fails. Build and shell into an
*earlier* named stage instead:

```bash
docker build --target builder -t myapp:debug .
docker run -it myapp:debug sh
```

---

## 5. The Container Lifecycle

```bash
docker build -t myapp:1.0 .              # build an image from a Dockerfile in the current dir
docker run -d --name web -p 8080:80 myapp:1.0   # create + start a container, detached, port-mapped
docker ps                                  # list running containers
docker ps -a                                # list all containers, including stopped
docker logs -f web                          # stream logs
docker exec -it web sh                       # open a shell inside a running container
docker stop web                             # graceful stop (SIGTERM, then SIGKILL after a timeout)
docker start web                             # restart a stopped container (keeps its filesystem/writable layer)
docker rm web                                # remove a stopped container permanently
docker rmi myapp:1.0                          # remove an image
docker system prune -a                         # reclaim disk: remove unused containers, images, networks, build cache
```

`docker run` = `docker create` + `docker start` in one step. A **stopped**
container still exists on disk (its writable layer is retained) until
`docker rm` — `docker start` on the same container resumes it with whatever
state was in that writable layer, which is different from running a fresh
container from the image again.

### Useful `docker run` flags

| Flag | Effect |
|---|---|
| `-d` | Detached — run in the background |
| `-it` | Interactive + allocate a TTY — for shell sessions |
| `--rm` | Auto-remove the container (and its writable layer) on exit — good for one-off/throwaway runs |
| `-p host:container` | Publish a port to the host (§7) |
| `-e KEY=value` | Set an environment variable |
| `--env-file .env` | Load environment variables from a file |
| `-v ...` | Volume or bind mount (§6) |
| `--network mynet` | Attach to a specific network (§7) |
| `--name web` | Give the container a stable, human-readable name |
| `--restart unless-stopped` | Restart policy — auto-restart on crash or daemon restart, but not if you explicitly stopped it |
| `--memory 512m --cpus 1` | Resource limits, enforced via cgroups — see below |

### Resource limits and the OOM killer

```bash
docker run -d --memory=512m --memory-swap=512m --cpus=1.5 myapp
```

`--memory` sets a hard cgroup memory limit; exceed it and the container's
process gets **OOM-killed** by the kernel — not gracefully stopped. This is
a common silent-crash cause that looks identical to a plain application
crash from the logs alone: `docker logs` just stops mid-stream with no
error, because nothing in the app got a chance to log anything. The
tell is `docker inspect <container>` → `State.OOMKilled: true`, which a
plain crash won't show. `--cpus` similarly caps CPU via cgroups (throttles
rather than kills). Setting `--memory-swap` equal to `--memory` disables
swap for the container entirely, so memory pressure surfaces as an
OOM-kill immediately instead of degrading into swap-thrashing first.

---

## 6. Volumes vs. Bind Mounts vs. tmpfs

Containers are ephemeral by design — the writable layer is destroyed on `rm`.
Persisting data or sharing files with the host requires explicit storage.

| | Volume | Bind mount |
|---|---|---|
| Managed by | Docker (lives under `/var/lib/docker/volumes/`) | You — any host path |
| Portable across hosts | Yes (referenced by name) | No — tied to a specific host path |
| Typical use | Databases, persistent app data, sharing data between containers | Local dev — mount source code into a container for live-reload |
| Survives `docker rm`? | Yes (until `docker volume rm`) | N/A — it's just a host directory, unaffected by container lifecycle |

```bash
docker volume create pgdata
docker run -d -v pgdata:/var/lib/postgresql/data postgres:16    # named volume

docker run -d -v $(pwd)/src:/app/src myapp:dev                    # bind mount — live local dev
docker run -d -v $(pwd)/config.json:/app/config.json:ro myapp     # read-only bind mount
```

**Rule of thumb:** volumes for anything the *application* needs to persist
(database files, uploaded content); bind mounts for local development
workflows where you want host edits reflected instantly inside the
container.

### A third option: `tmpfs`

| | Volume | Bind mount | `tmpfs` |
|---|---|---|---|
| Storage | Disk, Docker-managed | Disk, host path | **In-memory only** — never touches disk |
| Use case | Databases, persistent app state | Local dev source mounting | Secrets, ephemeral scratch data that must not persist or be swapped to disk |
| Survives container stop? | Yes | N/A | No — gone the moment the container stops |

```bash
docker run -d --tmpfs /app/tmp:rw,size=64m myapp
```

`tmpfs` is the right call for anything sensitive-and-short-lived — a
decrypted secret, a session token cache — where you specifically want the
guarantee that it's never written to the host disk and disappears on
container stop, rather than merely being *inconvenient* to persist.

### The anonymous-volume trick (bind-mounting source without losing `node_modules`)

A common local-dev problem: bind-mounting your source directory over
`/app` (for live-reload) also shadows whatever the image already installed
at `/app/node_modules`, since the bind mount is a full directory
substitution. The fix used in the Compose example (§8):

```yaml
volumes:
  - .:/app                 # bind mount — host source overlays /app
  - /app/node_modules       # anonymous volume — "pins" node_modules so
                             # the bind mount above doesn't hide it
```

The second line creates an anonymous volume scoped to `/app/node_modules`
specifically; because it's more specific than the `.://app` bind mount,
Docker preserves the container's own `node_modules` (installed at image
build time) underneath it instead of exposing whatever — or nothing — is
in the host's `node_modules`.

---

## 7. Networking Basics

```bash
docker network ls                        # bridge, host, none by default
docker network create app-net              # create a user-defined bridge network
docker run -d --network app-net --name db postgres:16
docker run -d --network app-net --name api -p 8080:8080 myapi
```

- **Default bridge network**: containers get an internal IP and can reach the
  outside world, but can't resolve each other **by name** — only by IP,
  which isn't stable. Rarely what you want for multi-container apps.
- **User-defined bridge network**: containers on the same user-defined
  network resolve each other by **container/service name** via Docker's
  built-in DNS (`api` can reach `db` at hostname `db`, no IP needed) — this
  is the standard way containers talk to each other.
- **Port mapping (`-p host:container`)**: `-p 8080:80` maps host port 8080 to
  the container's port 80 — required for anything *outside* Docker (your
  browser, an external client) to reach the container. Container-to-container
  traffic on the same network doesn't need port mapping at all — they reach
  each other directly on the container's internal port.
- **`host` network**: container shares the host's network namespace directly
  — no port mapping/isolation, higher performance, Linux-only, used
  sparingly (e.g. network tooling).
- **`none` network**: no networking at all — fully isolated, for
  security-sensitive batch jobs that don't need connectivity.

```bash
docker exec api curl http://db:5432        # `db` resolves via Docker's embedded DNS on app-net
```

### How `-p` actually works: an iptables DNAT rule

`-p hostPort:containerPort` isn't just bookkeeping in the Docker daemon — on
Linux it programs an actual **iptables DNAT (Destination NAT) rule** in the
`nat` table, rewriting the destination of packets arriving on the host's
`hostPort` to the container's internal IP:`containerPort` before routing them
onto the bridge network. `dockerd` inserts/removes these rules automatically
as containers start and stop (visible via `iptables -t nat -L
DOCKER -n` on the host). Two practical consequences:

- **No `-p` means no path in from outside** — the DNAT rule is the *only*
  thing that makes a container's port reachable from the host or beyond; a
  container without a published port is still fully reachable by other
  containers on the same user-defined network (direct bridge routing, no NAT
  needed for that hop), just not from outside Docker's network namespace.
- **Binding to `127.0.0.1` inside the container defeats it** — DNAT rewrites
  the destination IP to the container's internal address, so the process
  inside must be listening on `0.0.0.0` (all interfaces) to receive the
  redirected traffic; a process bound only to `127.0.0.1` inside the
  container never sees it, even though `docker ps` shows the port as
  published (this is the single most common "I published the port but can't
  connect" cause — see the debugging playbook, §11).

---

## 8. docker-compose for Local Multi-Service Setups

`docker-compose` (now the `docker compose` CLI plugin) defines and runs
multi-container applications from a single YAML file — the standard way to
spin up "the app + its dependencies" for local development.

```yaml
# docker-compose.yml — app + Postgres + Redis
services:
  api:
    build:
      context: .
      dockerfile: Dockerfile
      target: builder            # use the dev/builder stage locally for hot reload
    ports:
      - "8080:8080"
    environment:
      DATABASE_URL: postgres://user:pass@db:5432/appdb
      REDIS_URL: redis://cache:6379
      NODE_ENV: development
    depends_on:
      db:
        condition: service_healthy
      cache:
        condition: service_started
    volumes:
      - ./src:/app/src            # bind mount for live-reload in dev
      - /app/node_modules          # anonymous volume — see §6

  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: pass
      POSTGRES_DB: appdb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U user -d appdb"]
      interval: 5s
      timeout: 3s
      retries: 5

  cache:
    image: redis:7-alpine
    command: ["redis-server", "--appendonly", "yes"]
    volumes:
      - redis_data:/data

volumes:
  pgdata:
  redis_data:
```

```bash
docker compose up -d           # build (if needed) + start every service, detached
docker compose ps                # status of all services in this project
docker compose logs -f api        # stream logs for one service
docker compose exec api sh        # shell into a running service
docker compose down               # stop and remove containers + the default network
docker compose down -v             # also remove named volumes — wipes persisted data
```

Compose automatically creates a shared network for the project — `api` can
reach Postgres at hostname `db` and Redis at hostname `cache` with zero
manual network setup, same DNS mechanism as §7. `depends_on` with a
`healthcheck` condition ensures `api` doesn't start until `db` is actually
ready to accept connections, not just "the container process started" (a
common source of flaky first-boot failures without it) — note `cache` only
needs `condition: service_started` here since Redis has no `healthcheck`
defined and is typically ready almost immediately, whereas Postgres's init
sequence (initdb, WAL setup) can meaningfully lag "container started." The
anonymous-volume line (`- /app/node_modules`) is the trick from §6: it keeps
the bind-mounted host source from shadowing the dependencies installed at
image-build time.

---

## 9. Image Tagging & Registries

```bash
docker build -t myorg/myapp:1.4.2 .          # semantic version tag
docker tag myorg/myapp:1.4.2 myorg/myapp:latest
docker push myorg/myapp:1.4.2
docker pull myorg/myapp:1.4.2
```

- **`latest` is just a convention, not a special pointer** — it's an
  ordinary tag that happens to be the default when none is specified. Never
  rely on `latest` in production deploys — it's not reproducible (it can
  point to a different image tomorrow); always pin an explicit version or
  digest.
- **Digest pinning** (`myapp@sha256:abc123...`) is the strongest guarantee —
  content-addressed, immutable, can't be silently repointed the way a tag
  can (a tag can be re-pushed to point at a different image).
- **Registries**: Docker Hub (public default), and private options — AWS
  ECR, GCP Artifact Registry, GitHub Container Registry (`ghcr.io`), self-
  hosted Harbor. `docker login <registry>` authenticates before push/pull
  against anything non-default.

---

## 10. Common Pitfalls

- **Running as root inside the container** — the Dockerfile default user is
  root unless you explicitly `USER` to something else. If an attacker
  compromises the app process, root-in-container plus certain
  misconfigurations (privileged mode, mounted host paths) can escalate to
  host-level impact. Always add a non-root `USER` in production images.

  ```dockerfile
  RUN adduser --disabled-password --gecos "" appuser
  USER appuser
  ```

- **Huge images from skipping multi-stage builds / `.dockerignore`** —
  shipping the full build toolchain (compilers, package managers, source,
  `node_modules` dev dependencies) into the runtime image inflates size,
  slows pulls/deploys, and expands attack surface for no functional benefit.
  Multi-stage builds and a proper `.dockerignore` are the fix, not an
  optional nicety.

- **Layer cache invalidation from copying everything before installing
  deps** — `COPY . .` followed by `RUN npm install`/`pip install` means
  *any* source change reruns the dependency install from scratch on every
  build. Always copy dependency manifests first, install, then copy the
  rest (§3).

- **`EXPOSE` mistaken for actually publishing a port** — `EXPOSE` is
  documentation/metadata only; it doesn't map anything to the host. You
  still need `-p host:container` (or Compose's `ports:`) to actually reach
  the container from outside.

- **Not cleaning up in the same `RUN` layer** — `apt-get install` in one
  `RUN` and `apt-get clean`/`rm -rf` in a later one doesn't shrink the
  image; the earlier layer already committed those bytes. Combine
  install-and-cleanup into a single `RUN` with `&&`.

- **Mutable `latest` tags in production deploy configs** — deploying
  `myapp:latest` means "whatever was pushed most recently," which breaks
  reproducibility and makes rollbacks ambiguous (rollback to *what*, exactly,
  if the tag has since moved?). Pin explicit versions or digests in any
  deploy manifest.

- **Treating container filesystem writes as persistent** — writing files
  into a container without a volume/bind mount means that data vanishes the
  moment the container is removed (not just stopped-and-restarted — `rm`
  specifically). Any state that needs to outlive the container's lifecycle
  needs an explicit volume.

- **Ignoring `docker system prune`** — build cache, dangling images, and
  stopped containers accumulate silently and can fill a dev machine's or
  CI runner's disk over weeks; worth running periodically, especially in
  CI where disk pressure causes confusing unrelated failures.

---

## 11. Debugging Playbook

A quick lookup table for the failures that show up over and over in day-to-day
container work — what to check first, in order.

| Symptom | First checks |
|---|---|
| Container exits immediately after `docker run` | `docker logs <container>` for the actual error; `docker inspect <container>` → `State.ExitCode` (`0` = clean exit — your foreground process just finished, and containers stop the instant PID 1 exits); confirm `ENTRYPOINT`/`CMD` is a long-running foreground process, not something that daemonizes or finishes instantly |
| Can't connect to a service running inside a container | Confirm the process is actually listening *inside* the container (`docker exec <c> ss -tlnp`) — it must bind `0.0.0.0`, not `127.0.0.1` (see the DNAT note in §7 — a `127.0.0.1`-bound process never receives redirected traffic even with `-p` published); confirm `-p hostPort:containerPort` was actually passed (`docker ps` shows the mapping); confirm both containers share a network if connecting container-to-container (`docker network inspect <net>`); confirm host firewall isn't blocking the published port |
| Container A can't resolve container B by name | Both must be on the same **user-defined** network — the default bridge network has no embedded DNS (§7); check with `docker network inspect <net>` that both appear under `Containers` |
| Image is larger than expected | `docker image history <image>` to see per-layer size (§2); look for an early layer with a huge `RUN` (uncached package downloads, no same-layer cleanup — §4); check you're not `COPY . .`-ing an unfiltered build context (missing/incomplete `.dockerignore`, §3); verify multi-stage builds are actually in use so build tools don't leak into the final stage |
| `docker build` is slow / cache never hits | Check instruction order — anything above a changed layer gets invalidated (§2–§3); check `.dockerignore` isn't excessively narrow (a large unfiltered context re-hashes slowly on every build); confirm BuildKit is enabled (`DOCKER_BUILDKIT=1`) so cache mounts (§4) actually apply |
| Container works locally but fails after `docker push`/`pull` elsewhere | Check for a CPU-architecture mismatch — built on Apple Silicon (`arm64`), running on an `amd64` host, or vice versa; rebuild multi-arch with `docker buildx build --platform linux/amd64,linux/arm64 ...`; also check for baked-in absolute host paths left over from a bind mount used during the build |
| Out-of-memory-looking crash with no clear error in logs | `docker inspect <container>` → look for `"OOMKilled": true` under `State` (§5) — the cgroup `--memory` limit was hit and the kernel killed the process; a plain application crash won't set this field, which is the fastest way to tell the two apart |

---

## 12. Interview-Ready Q&A

**Q: What's the fundamental difference between a container and a VM?**
A: A container isolates a process using the host kernel's namespaces (what
it can see — PIDs, network, filesystem) and cgroups (what resources it can
use), so it shares the host kernel and starts in milliseconds. A VM
virtualizes hardware and runs its own full guest kernel via a hypervisor, so
it's isolated more strongly but is far heavier and slower to boot. Containers
trade some isolation strength for density and speed.

**Q: Why does instruction order in a Dockerfile affect build speed?**
A: Docker caches each layer and invalidates everything from the first
changed layer onward. If you `COPY . .` before installing dependencies, any
source file change — even a comment — invalidates the dependency-install
layer, forcing a full reinstall every build. Copying only the dependency
manifest first, installing, then copying the rest of the source keeps the
expensive install step cached across ordinary code changes.

**Q: Explain multi-stage builds and why they matter for image size.**
A: A multi-stage Dockerfile has multiple `FROM` statements, each a separate
build stage; later stages can `COPY --from=<earlier-stage>` specific
artifacts without inheriting everything else from that stage. This lets you
compile/build with a full toolchain in one stage and ship only the compiled
output in a minimal final stage — the compiler, source, and build cache
never end up in the production image, cutting size dramatically and reducing
attack surface.

**Q: `ENTRYPOINT` vs `CMD` — what's the actual difference?**
A: `CMD` alone defines the default command, fully replaced if you pass
arguments to `docker run`. `ENTRYPOINT` defines a fixed executable that
always runs; `CMD` then supplies default arguments to it, and `docker run image <args>`
only overrides those arguments while `ENTRYPOINT` stays fixed.
This combination is how CLI-style images present a stable binary with
overridable default flags.

**Q: How do two containers talk to each other, and what has to be true for
it to work?**
A: They need to be on the same Docker network — a user-defined bridge
network (not the default bridge) provides built-in DNS so containers can
resolve each other by container/service name instead of IP. Port mapping
(`-p`) is irrelevant for container-to-container traffic on the same network;
it's only needed for traffic originating from outside Docker (your host
machine or the internet) reaching into a container.

**Q: Volumes vs. bind mounts — when would you use each?**
A: A volume is managed by Docker itself, portable by name, and the right
choice for data the application needs to persist across container restarts
— databases, uploaded files. A bind mount maps a specific host directory
into the container and is tied to that host path — the standard choice for
local development, mounting source code so edits on the host are reflected
live inside the running container without a rebuild.

**Q: Why is running a container as root a problem, and what's the fix?**
A: If the containerized process is compromised, running as root inside the
container gives an attacker root privileges within that container's
namespace — and combined with misconfigurations like privileged mode or a
mounted Docker socket/host path, that can escalate toward host-level
compromise. The fix is adding a dedicated non-root user in the Dockerfile
(`RUN adduser ...` then `USER appuser`) so the process runs unprivileged by
default, following least-privilege even inside the container boundary.

**Q: Why shouldn't you deploy `myapp:latest` to production?**
A: `latest` is an ordinary, mutable tag — it points to whichever image was
most recently pushed with that tag, not a fixed version. Deploying it means
your deploy isn't reproducible: the same deploy command can pull a different
image tomorrow, and rollback becomes ambiguous since there's no stable
"previous" reference. Pinning an explicit version tag or, stronger, a
content digest (`@sha256:...`) makes deploys reproducible and rollbacks
unambiguous.

**Q: Mechanically, what does `-p 8080:80` actually do?**
A: On Linux it programs an iptables DNAT rule in the `nat` table that
rewrites the destination of packets arriving on the host's port 8080 to the
container's internal IP on port 80, then routes them onto the bridge
network. Docker adds/removes this rule automatically as the container
starts/stops. It's the only thing that makes a container reachable from
outside Docker's network — and it only works if the process inside is
listening on `0.0.0.0`, since a process bound to `127.0.0.1` never sees
traffic redirected in by DNAT even though the port shows as published.

**Q: You published a container's port with `-p`, but you still can't
connect. What do you check, in order?**
A: First, whether the process inside the container is actually listening on
`0.0.0.0` rather than `127.0.0.1` — a loopback-bound process is invisible to
the DNAT-redirected traffic even with the port published. Then confirm the
mapping exists at all (`docker ps`), confirm you're hitting the right host
port, and if it's container-to-container traffic instead of host-to-
container, confirm both containers are actually on the same user-defined
network — port publishing is irrelevant for that hop entirely.

**Q: A container works fine when you build and run it locally, but fails
after you push it and pull it on another machine. What's a likely cause
that has nothing to do with your application code?**
A: A CPU-architecture mismatch — the image was built for one platform (e.g.
`arm64` on Apple Silicon) and is being run on another (`amd64`). The fix is
building a multi-architecture image with `docker buildx build --platform
linux/amd64,linux/arm64 ...` rather than a single-arch `docker build`. A
second, less common cause is a baked-in absolute host path left over from a
bind mount used during the build, which won't exist on the new host.

---

## 13. One-Line Summary

**A container is an isolated process sharing the host kernel, not a tiny
VM — build small images by ordering Dockerfile instructions for cache
efficiency and using multi-stage builds, keep state in volumes not the
writable layer, and never run as root or deploy a mutable `latest` tag.**
