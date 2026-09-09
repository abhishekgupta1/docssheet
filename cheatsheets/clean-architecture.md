---
title: "Clean Architecture Cheat Sheet"
description: "Quick reference for Clean Architecture — the Dependency Rule, the four layers, ports/adapters, and common mistakes."
tags: [clean-architecture, sde, cheat-sheet]
hide_table_of_contents: true
---

# Clean Architecture cheatsheet

A one-page reference for Clean Architecture. For the worked Python and Go
examples and the full DDD-lite discussion, see the [complete guide](/docs/sde-skills/clean-architecture/clean-architecture-guide).

<a class="topic-crosslink" href="/docs/sde-skills/clean-architecture/clean-architecture-guide">📖 Full guide: Clean Architecture →</a>

<div class="cheat-sheet cheat-sheet--sde">

<div class="cheat-card">

#### The Dependency Rule

> Source code dependencies must point only inward. Nothing in an inner
> circle can know anything about something in an outer circle.

Entities never import a DB driver; a DB adapter always imports the port an
inner layer defined.

</div>

<div class="cheat-card">

#### The four layers

| Layer | Contains |
|---|---|
| Entities | core domain rules, framework-agnostic |
| Use Cases | app-specific orchestration via ports |
| Interface Adapters | controllers, presenters, repo impls |
| Frameworks & Drivers | DB, web framework, UI — the details |

</div>

<div class="cheat-card">

#### Ports & adapters

```
compile-time: Adapter ──depends on──▶ Port (interface)
runtime flow: UseCase ──calls──▶ Adapter (via the port)
```

The use case defines the port; the outer layer implements it. Source
dependency points inward even though control flows outward.

</div>

<div class="cheat-card">

#### Port (domain-owned interface)

```python
class OrderRepository(ABC):
    @abstractmethod
    def get(self, order_id: UUID) -> Order | None: ...
    @abstractmethod
    def save(self, order: Order) -> None: ...
```

</div>

<div class="cheat-card">

#### Use case (depends only on ports)

```python
class PlaceOrderUseCase:
    def __init__(self, orders: OrderRepository, inventory: InventoryChecker):
        self._orders = orders       # port, not concrete adapter
        self._inventory = inventory

    def execute(self, request: PlaceOrderRequest) -> PlaceOrderResponse:
        ...
```

</div>

<div class="cheat-card">

#### Two adapters, one port

```python
class PostgresOrderRepository(OrderRepository):
    ...   # real infrastructure

class InMemoryOrderRepository(OrderRepository):
    ...   # test fake, same interface
```

Payoff: the use case runs fully, with zero infrastructure, in microseconds
under test.

</div>

<div class="cheat-card">

#### Composition root

```python
# main.py — the ONLY file that imports both domain and a concrete adapter
use_case = PlaceOrderUseCase(
    orders=PostgresOrderRepository(conn),
    inventory=StockServiceInventoryChecker(base_url="..."),
)
```

Swap `PostgresOrderRepository` for `DynamoOrderRepository` and nothing in
`domain/` or `application/` changes.

</div>

<div class="cheat-card">

#### Hexagonal & Onion = same idea

- **Hexagonal** (Cockburn): core = Entities+Use Cases; driving adapters call
  in, driven adapters get called out to.
- **Onion** (Palermo): concentric rings, Domain Model at center.
- Same Dependency Rule, different vocabulary — don't get hung up on "port"
  vs "interactor," get hung up on whether domain imports the DB driver.

</div>

<div class="cheat-card">

#### Enforce it structurally, not by convention

- Python: `import-linter` contract rules (domain can't import infrastructure)
- Go: `internal/` packages, `go-cleanarch` lint
- Java/Kotlin: ArchUnit package-dependency tests

Treat a forbidden import as a build failure, not a review nitpick.

</div>

<div class="cheat-card">

#### Common mistakes

- Anemic ORM model standing in for the domain entity
- Use case taking a framework request object directly (leaking DTOs)
- Fat repository ports shaped by the DB, not by what the use case needs
- Applying full 4-layer Clean Architecture to a 5-endpoint CRUD app

<span class="cheat-see">See: Common Mistakes</span>

</div>

<div class="cheat-card">

#### When to actually reach for it

Genuine domain complexity, multiple/uncertain infra choices, or a team large
enough that decoupling reduces merge conflicts — not by default on every
project.

</div>

</div>
