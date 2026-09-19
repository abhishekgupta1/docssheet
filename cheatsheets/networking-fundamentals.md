---
title: "Networking Fundamentals Cheat Sheet"
description: "Quick reference for networking — troubleshooting tools, diagnostic order, DNS, and TCP/TLS basics."
tags: [networking, sre, cheat-sheet]
hide_table_of_contents: true
---

# Networking cheatsheet

A one-page reference for networking fundamentals. For the OSI/TCP-IP models,
subnetting, and TLS handshake detail, see the [complete guide](/docs/sre-skills/networking-fundamentals/networking-fundamentals-guide).

<a class="topic-crosslink" href="/docs/sre-skills/networking-fundamentals/networking-fundamentals-guide">📖 Full guide: Networking →</a>

<div class="cheat-sheet cheat-sheet--sre">

<div class="cheat-card">

#### Troubleshooting tools

```bash
ping -c 4 example.com
traceroute example.com
mtr example.com                          # continuous traceroute+ping
curl -v https://example.com               # full request/response + TLS
dig example.com                            # DNS resolution
tcpdump -i eth0 port 443
ss -tulpn                                   # listening/established sockets
nc -zv example.com 443                       # port reachability
```

</div>

<div class="cheat-card">

#### Diagnostic order under pressure

1. `ping` — is the path up? (ICMP is often blocked, so a failed ping ≠ down)
2. `dig`/`nslookup` — does the name resolve to the expected IP?
3. `nc -zv` / `curl` — is the port/service accepting connections?
4. `traceroute`/`mtr` — where is latency/loss happening?
5. `tcpdump` — inspect actual bytes on the wire.

</div>

<div class="cheat-card">

#### TCP vs UDP

| | TCP | UDP |
|---|---|---|
| Connection | 3-way handshake | connectionless |
| Reliability | guaranteed, ordered | best-effort |
| Use case | HTTP, DB conns | DNS queries, video, gaming |

</div>

<div class="cheat-card">

#### DNS resolution flow

```
Browser cache → OS cache → resolver (recursive) →
root → TLD → authoritative nameserver → answer
```

</div>

<div class="cheat-card">

#### L4 vs L7 load balancing

- **L4** — routes on IP/port, fast, protocol-agnostic.
- **L7** — routes on HTTP content (headers, path, host) — enables
  path-based routing, TLS termination, content-aware rules.

</div>

<div class="cheat-card">

#### CIDR quick reference

```
/32 = 1 host        /24 = 256 addrs (typical subnet)
/16 = 65,536 addrs  /8  = 16.7M addrs
```

</div>

<div class="cheat-card">

#### Firewalls & NAT

NAT translates private IPs to a public one at the network edge; firewalls
filter by IP/port/protocol (and L7 rules for app firewalls). A "connection
refused" often means firewall/security-group, not a dead service.

<span class="cheat-see">See: Common Failure Scenarios an SRE Debugs</span>

</div>

</div>
