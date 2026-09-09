---
title: "Networking Fundamentals: The Complete Guide"
description: "End-to-end reference for Networking Fundamentals — OSI/TCP-IP model, addressing, DNS/TLS, load balancing, troubleshooting tools, and interview-ready Q&A."
sidebar_position: 1
tags: [networking, sre, tcp-ip, dns]
---

# Networking Fundamentals — The Complete Guide

A single-read, end-to-end reference for networking: enough to reason about
how a request actually travels from client to server, debug connectivity
issues under pressure, or walk into an SRE interview. Organized as a lookup
you can also read top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/networking-fundamentals">📋 Quick reference: Networking →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 280" role="img" aria-labelledby="mm-netosi-title mm-netosi-desc">
<title id="mm-netosi-title">The networking stack as ordered layers</title>
<desc id="mm-netosi-desc">A request passes down through application, transport, network, and link/physical layers to send, and back up through the same layers on the receiving end.</desc>
<defs>
  <marker id="mm-netosi-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n1" x="190" y="20" width="400" height="50" rx="10"/>
<text class="mm-node-title" x="390" y="41" text-anchor="middle">Application (7)</text>
<text class="mm-node-sub" x="390" y="57" text-anchor="middle">HTTP, DNS, SSH, TLS</text>

<rect class="mm-n2" x="190" y="80" width="400" height="50" rx="10"/>
<text class="mm-node-title" x="390" y="101" text-anchor="middle">Transport (4)</text>
<text class="mm-node-sub" x="390" y="117" text-anchor="middle">TCP, UDP</text>

<rect class="mm-n3" x="190" y="140" width="400" height="50" rx="10"/>
<text class="mm-node-title" x="390" y="161" text-anchor="middle">Network (3)</text>
<text class="mm-node-sub" x="390" y="177" text-anchor="middle">IP, ICMP, routing</text>

<rect class="mm-n4" x="190" y="200" width="400" height="50" rx="10"/>
<text class="mm-node-title" x="390" y="221" text-anchor="middle">Link / Physical (1-2)</text>
<text class="mm-node-sub" x="390" y="237" text-anchor="middle">Ethernet, MAC, cables</text>

<path class="mm-arrow" d="M650,30 L650,245" marker-end="url(#mm-netosi-arrow)"/>
<text class="mm-flow-label" x="650" y="265" text-anchor="middle">each layer wraps the one above it</text>
</svg>

<p class="mental-model__caption">A layer never needs to know how the layer below it works, only that it works — which is exactly why "DNS resolves but the connection times out" points below layer 4 while "connects fine but returns a 500" is purely a layer 7 problem, and the model tells you where to stop looking once a layer is confirmed healthy.</p>
</div>

## 1. The OSI and TCP/IP Models

The **OSI model** is the conceptual 7-layer teaching framework; the
**TCP/IP model** (4-5 layers) is what real-world networking actually
implements. SREs mostly think in TCP/IP terms but use OSI layer numbers as
shorthand in conversation ("that's a layer 7 problem").

| OSI Layer | Name | TCP/IP equivalent | Examples |
|---|---|---|---|
| 7 | Application | Application | HTTP, DNS, SSH, SMTP |
| 6 | Presentation | Application | TLS/SSL, data encoding |
| 5 | Session | Application | Session establishment (often folded into app layer in practice) |
| 4 | Transport | Transport | TCP, UDP |
| 3 | Network | Internet | IP, ICMP, routing |
| 2 | Data Link | Link | Ethernet, MAC addresses, switches |
| 1 | Physical | Link | Cables, radio, electrical signaling |

**Why the layering matters operationally:** it isolates the blast radius of
a problem. "DNS resolves but connection times out" points at layer 3/4
(routing, firewall, host down); "connects fine but returns HTTP 500" is
purely layer 7 (application bug) — the model tells you where to *stop*
looking once you've confirmed a layer works.

---

## 2. IP Addressing, CIDR, and Subnetting

An **IPv4 address** is 32 bits, written as four dotted decimal octets
(`10.0.1.5`). **CIDR notation** (`10.0.1.0/24`) specifies how many leading
bits are the fixed **network** portion — the rest is available for **host**
addresses.

| CIDR | Subnet mask | Usable hosts | Common use |
|---|---|---|---|
| `/32` | `255.255.255.255` | 1 (single host) | A specific route/host rule |
| `/30` | `255.255.255.252` | 2 | Point-to-point links |
| `/24` | `255.255.255.0` | 254 | Typical small subnet (e.g., one AZ) |
| `/16` | `255.255.0.0` | 65,534 | A whole VPC |
| `/8` | `255.0.0.0` | ~16.7M | Historically a "Class A" network |

Usable hosts = `2^(32 - prefix) - 2` (subtract the network address and the
broadcast address).

### Private (RFC 1918) ranges — never routable on the public internet

```
10.0.0.0/8         10.0.0.0    – 10.255.255.255
172.16.0.0/12       172.16.0.0  – 172.31.255.255
192.168.0.0/16      192.168.0.0 – 192.168.255.255
```

### Quick subnetting example

`10.0.1.0/24` split into four `/26` subnets (64 addresses each, 62 usable):

```
10.0.1.0/26    → 10.0.1.0   – 10.0.1.63    (.1–.62 usable)
10.0.1.64/26   → 10.0.1.64  – 10.0.1.127
10.0.1.128/26  → 10.0.1.128 – 10.0.1.191
10.0.1.192/26  → 10.0.1.192 – 10.0.1.255
```

**IPv6** addresses are 128 bits, written as eight hextets
(`2001:0db8:85a3:0000:0000:8a2e:0370:7334`, commonly shortened with `::` for
runs of zeros). Vastly larger address space removes the need for NAT that
IPv4 exhaustion forced — most IPv6 hosts can be globally routable directly.

---

## 3. TCP vs. UDP, and the Three-Way Handshake

| | TCP | UDP |
|---|---|---|
| Connection | Connection-oriented (handshake required) | Connectionless |
| Reliability | Guaranteed delivery, ordered, retransmits lost packets | Best-effort, no delivery guarantee |
| Overhead | Higher (headers, ACKs, congestion control) | Minimal |
| Use cases | HTTP, databases, SSH — anything needing correctness | DNS queries, video/voice streaming, gaming — anything favoring speed/low latency over perfect delivery |

### The TCP three-way handshake

```
Client                        Server
  │   ── SYN (seq=x) ──────────►  │
  │   ◄── SYN-ACK (seq=y,ack=x+1)─│
  │   ── ACK (ack=y+1) ─────────► │
  │        connection established │
```

1. **SYN** — client proposes an initial sequence number.
2. **SYN-ACK** — server acknowledges and proposes its own sequence number.
3. **ACK** — client acknowledges the server's number; connection is now
   established (`ESTABLISHED` state on both sides).

Teardown is a **four-way** exchange (`FIN`/`ACK` from each side
independently, since TCP is full-duplex) — this is why a closed connection
lingers briefly in `TIME_WAIT` on the side that initiated the close, to
guarantee any delayed final ACK is handled correctly.

**Why UDP is faster:** it skips the handshake and any retransmission/
ordering logic entirely — a packet is just sent. That's exactly why
protocols like DNS use it for simple request/response (bounded retry logic
at the application layer is cheap) and why real-time media uses it (a late
retransmitted video frame is worse than a dropped one).

---

## 4. DNS Resolution Flow

DNS translates human-readable names to IP addresses through a hierarchical,
cached lookup chain.

```
Client → Stub resolver (OS) → Recursive resolver (ISP / 8.8.8.8 / 1.1.1.1)
   → Root nameserver ("." )
   → TLD nameserver (".com")
   → Authoritative nameserver (example.com's own DNS)
   → answer flows back up, cached at each layer per its TTL
```

| Record type | Purpose |
|---|---|
| `A` | Hostname → IPv4 address |
| `AAAA` | Hostname → IPv6 address |
| `CNAME` | Alias — hostname → another hostname |
| `MX` | Mail server for a domain |
| `TXT` | Arbitrary text — SPF/DKIM, domain verification |
| `NS` | Which nameservers are authoritative for a zone |
| `SOA` | Zone metadata — primary nameserver, refresh/retry/TTL defaults |
| `PTR` | Reverse lookup — IP → hostname |

```bash
dig example.com                 # full query + answer section
dig +short example.com           # just the resolved IP(s)
dig example.com MX                # specific record type
dig @8.8.8.8 example.com          # query a specific resolver directly, bypassing local cache
nslookup example.com              # older, still common tool
dig +trace example.com             # walk the full resolution chain root → TLD → authoritative
```

**TTL (time to live)** on a record controls how long resolvers may cache
it. This is the direct cause of **DNS propagation delay**: after changing a
record, clients/resolvers holding a cached copy keep using the old value
until their cached TTL expires — there's no way to force-push a DNS change
globally, only to have set a low TTL *in advance* of a planned change.

---

## 5. HTTP/HTTPS and the TLS Handshake

HTTP is a stateless, text-based (HTTP/1.1) or binary-framed (HTTP/2, HTTP/3)
request/response protocol over TCP (HTTP/3 runs over QUIC/UDP instead).
HTTPS is HTTP tunneled through a **TLS**-encrypted connection.

### TLS handshake (TLS 1.2, simplified — 1.3 shortens this to one round trip)

```
Client                                    Server
  │  ── ClientHello (supported ciphers) ───► │
  │  ◄── ServerHello + certificate ──────────│
  │  (client verifies cert against trusted CA chain)
  │  ── key exchange material ──────────────►│
  │  ◄── Finished ──────── Finished ────────►│
  │        encrypted application data flows   │
```

1. Client sends supported TLS versions/cipher suites.
2. Server responds with its choice + its **certificate** (public key,
   signed by a Certificate Authority).
3. Client validates the certificate chain (issuer trusted, not expired,
   hostname matches), then both sides derive a shared symmetric session key
   via the key exchange (modern default: ephemeral Diffie-Hellman, giving
   **forward secrecy** — a compromised key later can't decrypt past traffic).
4. All subsequent HTTP traffic is encrypted with that symmetric key
   (asymmetric crypto is only used to *establish* the session — too slow for
   bulk data).

```bash
curl -v https://example.com 2>&1 | head -30    # -v shows the TLS handshake steps
openssl s_client -connect example.com:443 -servername example.com   # inspect cert chain directly
echo | openssl s_client -connect example.com:443 2>/dev/null | openssl x509 -noout -dates   # cert expiry dates
```

---

## 6. Load Balancing: L4 vs. L7

| | Layer 4 (transport) | Layer 7 (application) |
|---|---|---|
| Decides routing based on | IP + port, TCP connection info | HTTP headers, URL path, cookies, host header |
| Speed | Faster — no payload inspection | Slower — terminates/inspects the request |
| TLS | Can pass through encrypted (TCP passthrough) | Usually terminates TLS itself to read the request |
| Use case | Raw TCP/UDP services, extreme throughput needs | HTTP-aware routing — path-based routing, A/B testing, cookie-based session affinity |
| Examples | AWS NLB, `ipvs`, raw HAProxy TCP mode | AWS ALB, Nginx, Envoy, HAProxy HTTP mode |

L7 load balancers enable routing decisions a pure L4 device can't make:
`/api/*` → service A, `/static/*` → service B, based on `Host:` header for
multi-tenant routing, or weighted routing for canary deployments. L4 is
chosen when you need maximum throughput/lowest latency and don't need
content-aware routing, or when the traffic isn't HTTP at all (raw TCP
databases, custom protocols).

**Health checks** are what make a load balancer safe — instances failing
their configured health check (TCP connect, HTTP `200` on `/healthz`, etc.)
are automatically removed from rotation, which is the actual mechanism
behind zero-downtime rolling/canary deploys.

---

## 7. Common Troubleshooting Tools

```bash
ping -c 4 example.com                 # is the host reachable at all (ICMP)? round-trip latency
traceroute example.com                 # hop-by-hop path, reveals where latency/loss is introduced
mtr example.com                         # traceroute + ping combined, continuously — better for intermittent loss
curl -v https://example.com              # full request/response including headers and TLS handshake detail
curl -o /dev/null -s -w "%{time_total}\n" https://example.com   # just the timing
dig example.com / nslookup example.com    # DNS resolution
tcpdump -i eth0 port 443                   # capture raw packets on an interface, filtered
tcpdump -i eth0 host 10.0.1.5 -w capture.pcap   # write to a file for later analysis (e.g., in Wireshark)
ss -tulpn                                    # local listening sockets and established connections
nc -zv example.com 443                        # quick TCP port reachability check ("netcat")
```

**Diagnostic order that actually works under pressure:**
1. `ping` — is the network path up at all? (note: many hosts block ICMP —
   a failed ping doesn't always mean the host is down)
2. `dig`/`nslookup` — does the name resolve, and to the IP you expect?
3. `nc -zv` or `curl` — is the specific port/service actually accepting
   connections?
4. `traceroute`/`mtr` — if reachable but slow/lossy, where in the path is
   it happening?
5. `tcpdump` — if you need to see the actual bytes on the wire (retransmits,
   TLS alerts, malformed packets).

---

## 8. Firewalls and NAT

- **Firewall** — filters traffic by rule (source/destination IP, port,
  protocol). Stateful firewalls (most modern ones, `iptables`/`nftables`,
  security groups) track connection state so return traffic for an allowed
  outbound connection is automatically permitted without a separate inbound
  rule.
- **NAT (Network Address Translation)** — rewrites IP addresses in packet
  headers, most commonly to let many private (RFC 1918) addresses share one
  public IP for outbound internet access (**SNAT**/masquerading), or to
  expose an internal service on a public IP (**DNAT**/port forwarding).

```bash
iptables -L -n -v                       # list current rules (legacy but still everywhere)
nft list ruleset                         # modern nftables equivalent
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
iptables -t nat -A POSTROUTING -o eth0 -j MASQUERADE   # classic outbound NAT rule
```

In cloud environments this usually maps to **security groups** (stateful,
attached to instances/ENIs) and **NACLs** (stateless, attached to subnets,
evaluated before security groups) — a very common AWS interview distinction:
NACLs need explicit inbound *and* outbound rules since they don't track
connection state; security groups don't.

---

## 9. Common Failure Scenarios an SRE Debugs

### DNS propagation delay
A record was changed but some clients still resolve the old IP. Cause: TTL
hadn't expired on caching resolvers holding the old value. Mitigation:
**lower the TTL well in advance** of a planned cutover (hours ahead, not at
the moment of change), then raise it back afterward.

### Connection timeout vs. connection refused
| Symptom | Meaning | Likely cause |
|---|---|---|
| **Connection timeout** | No response at all — packets go unanswered | Firewall silently dropping traffic, host unreachable/down, wrong security group, asymmetric routing |
| **Connection refused** | An immediate, explicit rejection (TCP RST) | Nothing is listening on that port — service down, wrong port, or a firewall actively rejecting (vs. silently dropping) |

This distinction is one of the fastest triage signals available: a timeout
means "investigate the network path," a refusal means "the host is
reachable — investigate whether the service is even running."

### TLS certificate expiry
Requests start failing with certificate validation errors at a predictable
moment (the `notAfter` date) — the single most preventable class of
outage, caught by automated cert-expiry monitoring/alerting well before the
expiry date, and normally automated away entirely with ACME-based renewal
(Let's Encrypt/cert-manager) rather than manual tracking.

```bash
echo | openssl s_client -connect example.com:443 2>/dev/null \
  | openssl x509 -noout -enddate
```

### Asymmetric routing / half-open connections
A connection appears established on one side but the return path takes a
different route (or is blocked) — common after a load balancer/NAT gateway
change, presents as intermittent hangs rather than clean failures, and is
diagnosed by comparing `tcpdump` captures on both ends of the connection.

### Port exhaustion
A host or NAT gateway runs out of ephemeral source ports under very high
connection churn (common with short-lived outbound connections at scale),
presenting as sudden connection failures under load with no obvious
resource (CPU/memory) pressure — diagnosed via `ss -s` connection counts and
fixed with connection pooling/reuse or a wider ephemeral port range.

---

## 10. Interview-Ready Q&A

**Q: Walk me through what happens between typing a URL and the page
loading.**
A: The browser first resolves the hostname via DNS (checking local cache,
then recursive resolver, walking root → TLD → authoritative if
uncached) to get an IP. It opens a TCP connection to that IP on port 443 via
the three-way handshake, then performs a TLS handshake to negotiate
encryption and validate the server's certificate. Once the encrypted tunnel
is up, the browser sends an HTTP request and the server responds; the
browser then parses the HTML and repeats this process (often with cached
DNS/reused connections) for every additional resource the page references.

**Q: Why does DNS use UDP instead of TCP?**
A: A DNS query/response is small and fits in a single packet in the common
case, so UDP's lack of handshake and acknowledgment overhead makes lookups
much faster — critical since DNS resolution sits on the front of nearly
every network operation. DNS does fall back to TCP when the response is too
large for a single UDP packet (historically 512 bytes, larger with EDNS0)
or for zone transfers between nameservers, since those need TCP's
reliability guarantees.

**Q: What's the practical difference between a connection timeout and a
connection refused error, and how does that change your first debugging
step?**
A: A refused connection means a TCP RST came back immediately — the host is
reachable and something (or nothing) is listening on that port, so you
investigate whether the service is actually running and bound to the right
port. A timeout means no response arrived at all within the wait period —
you investigate the network path itself: firewall rules, routing, security
groups, or whether the host is up, since the packet may never have arrived
or the response never made it back.

**Q: Explain layer 4 vs. layer 7 load balancing and when you'd choose each.**
A: An L4 load balancer routes based on IP/port and TCP-level information
without inspecting the payload — fast, protocol-agnostic, good for raw
throughput or non-HTTP protocols. An L7 load balancer terminates the
connection and inspects the actual HTTP request — host header, path,
cookies — enabling content-aware routing like path-based rules or
cookie-based session affinity, at the cost of needing to terminate (and
usually re-establish) TLS and doing more per-request work. Choose L7 when
routing logic needs to know what the request *is*; choose L4 for maximum
throughput or non-HTTP traffic.

**Q: A service's TLS certificate is about to expire. What's the actual
failure mode for clients, and how should this be prevented rather than just
fixed?**
A: Once the cert passes its `notAfter` date, TLS clients that validate
certificates properly will reject the handshake outright with a
certificate-expired error — this isn't a degraded/slow failure, it's a hard
cutoff that typically causes a full outage for that service the instant the
clock passes the expiry timestamp. Prevention is automated
issuance/renewal (ACME/Let's Encrypt, cert-manager in Kubernetes) plus
independent expiry monitoring/alerting well ahead of the date — manual
tracking of cert expiry dates across many services doesn't scale and is
exactly the kind of thing that gets missed during a busy quarter.

**Q: What's CIDR notation and why does `/24` matter as a default in cloud
networking?**
A: CIDR notation (`a.b.c.d/n`) specifies an IP range by fixing the first
`n` bits as the network prefix, leaving `32-n` bits for host addresses —
`/24` fixes the first 24 bits, leaving 8 bits (256 addresses, 254 usable)
for hosts. It's a common default subnet size in cloud VPCs because it's
large enough for a typical single-AZ workload tier without being so large
that IP space is wasted across many subnets — a balance between address
space efficiency and having enough room to grow.

**Q: How would you distinguish "the network is slow" from "the application
is slow" when a user reports high latency?**
A: Start with `ping`/`mtr` to check raw network latency and packet loss to
the host independent of the application; if that's clean, use `curl -w`
with timing breakdowns (DNS lookup time, TCP connect time, TLS handshake
time, time to first byte, total time) to see exactly which phase of the
request is slow. A slow DNS/connect/TLS phase points at network-layer
issues; a fast connect but slow time-to-first-byte points squarely at the
application/backend doing the actual work slowly.

**Q: Security groups vs. NACLs in a cloud VPC — what's the practical
difference?**
A: Security groups are stateful and attached at the instance/interface
level — allowing inbound traffic automatically permits the corresponding
outbound return traffic without a separate rule. NACLs are stateless and
attached at the subnet level, evaluated before traffic reaches security
groups — they require explicit rules for both directions since they don't
track connection state, and they're evaluated in rule-number order with
explicit deny support (security groups are allow-only). NACLs are typically
used for coarse subnet-wide blocking; security groups do the fine-grained,
per-instance access control.

---

## 11. One-Line Summary

**Every networking problem an SRE debugs collapses into the same layered
question — can the packet get there (L1-4: routing, firewall, TCP), does the
name resolve to the right place (DNS), and is the encrypted application
conversation actually correct (TLS/HTTP) — and the right tool at each layer
(ping/traceroute, dig, curl/tcpdump) tells you exactly where in that chain
it's breaking.**
