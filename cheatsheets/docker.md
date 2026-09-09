---
title: "Docker Cheat Sheet"
description: "Quick reference for Docker — Dockerfile essentials, multi-stage builds, volumes, networking, and compose."
sidebar_position: 6
tags: [docker, sde, cheat-sheet]
hide_table_of_contents: true
---

# Docker cheatsheet

A one-page reference for Docker. For image layering internals and the full
debugging playbook, see the [complete guide](/docs/sde-skills/docker-basics/docker-basics-guide).

<a class="topic-crosslink" href="/docs/sde-skills/docker-basics/docker-basics-guide">📖 Full guide: Docker →</a>

<div class="cheat-sheet cheat-sheet--sde">

<div class="cheat-card">

#### Dockerfile essentials

```dockerfile
FROM node:20-slim
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
EXPOSE 3000
CMD ["node", "server.js"]
```

</div>

<div class="cheat-card">

#### ENTRYPOINT vs CMD

```dockerfile
ENTRYPOINT ["node"]
CMD ["server.js"]     # default arg — overridable at `docker run`
```

`docker run img worker.js` runs `node worker.js`. `CMD` alone is fully
replaced by run args; `ENTRYPOINT` args are appended to.

</div>

<div class="cheat-card">

#### Layer-order optimization

```dockerfile
COPY package*.json ./
RUN npm ci               # cached unless package.json changes
COPY . .                 # app code changes don't invalidate deps layer
```

Order instructions from least → most frequently changing.

</div>

<div class="cheat-card">

#### Multi-stage build

```dockerfile
FROM node:20 AS build
WORKDIR /app
COPY . .
RUN npm ci && npm run build

FROM node:20-slim
COPY --from=build /app/dist /app
CMD ["node", "/app/index.js"]
```

Final image excludes build tools/devDependencies — much smaller.

</div>

<div class="cheat-card">

#### Container lifecycle

```bash
docker run -d --name web -p 8080:80 nginx
docker ps
docker logs -f web
docker exec -it web sh
docker stop web && docker rm web
```

</div>

<div class="cheat-card">

#### Resource limits

```bash
docker run --memory=512m --cpus=1.5 myapp
```

Exceeding `--memory` → OOM-killed (exit code 137), not throttled.

</div>

<div class="cheat-card">

#### Volumes vs bind mounts

```bash
docker run -v mydata:/var/lib/db postgres        # named volume (managed)
docker run -v $(pwd):/app node                   # bind mount (host path)
docker run --tmpfs /app/cache alpine             # tmpfs (RAM, ephemeral)
```

</div>

<div class="cheat-card">

#### Networking

```bash
docker network create appnet
docker run --network appnet --name db postgres
docker run --network appnet -e DB_HOST=db myapp
```

`-p 8080:80` creates an iptables DNAT rule mapping host:container ports.

</div>

<div class="cheat-card">

#### docker-compose

```yaml
services:
  web:
    build: .
    ports: ["3000:3000"]
    depends_on: [db]
  db:
    image: postgres:16
    volumes: ["dbdata:/var/lib/postgresql/data"]
volumes:
  dbdata:
```

```bash
docker compose up -d
docker compose logs -f web
```

</div>

<div class="cheat-card">

#### Tagging & registries

```bash
docker build -t myapp:1.2.0 .
docker tag myapp:1.2.0 registry.example.com/myapp:1.2.0
docker push registry.example.com/myapp:1.2.0
```

Avoid `:latest` in production — it's not pinned, breaks reproducibility.

</div>

<div class="cheat-card">

#### .dockerignore

```
node_modules
.git
*.log
.env
```

Keeps the build context small and prevents secrets/local state from leaking
into image layers.

</div>

<div class="cheat-card">

#### Common pitfalls

- Running as root inside the container (add a non-root `USER`).
- No `.dockerignore` → slow, bloated builds.
- `:latest` tags → non-reproducible deploys.
- One giant `RUN` layer → poor cache reuse; split logically instead.

<span class="cheat-see">See: Debugging Playbook</span>

</div>

</div>
