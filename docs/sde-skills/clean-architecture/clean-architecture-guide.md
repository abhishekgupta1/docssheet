---
title: "Clean Architecture: The Complete Guide"
description: "End-to-end reference for Clean Architecture — the Dependency Rule, the four concentric layers, Hexagonal/Onion equivalence, worked Python and Go examples with ports and adapters, tradeoffs, DDD-lite integration, and interview-ready Q&A."
sidebar_position: 1
tags: [clean-architecture, sde, software-design, hexagonal-architecture]
---

# Clean Architecture — The Complete Guide

A single-read, end-to-end reference for Clean Architecture: enough to apply
it correctly on a real codebase, defend the tradeoffs in a design review, or
walk into an SDE interview. Organized as a lookup you can also read
top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/clean-architecture">📋 Quick reference: Clean Architecture →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 320" role="img" aria-labelledby="mm-ca-title mm-ca-desc">
<title id="mm-ca-title">The four concentric layers of Clean Architecture</title>
<desc id="mm-ca-desc">Four nested rings from innermost to outermost: Entities, Use Cases, Interface Adapters, and Frameworks and Drivers. Dependencies only point inward, from an outer ring toward the ring it wraps.</desc>

<circle class="mm-n1" cx="170" cy="160" r="130"/>
<circle class="mm-n4" cx="170" cy="160" r="98"/>
<circle class="mm-n2" cx="170" cy="160" r="66"/>
<circle class="mm-n3" cx="170" cy="160" r="34"/>

<text class="mm-ring-label" x="170" y="182" text-anchor="middle">Entities</text>
<text class="mm-ring-label" x="170" y="214" text-anchor="middle">Use Cases</text>
<text class="mm-ring-label" x="170" y="246" text-anchor="middle">Adapters</text>
<text class="mm-ring-label" x="170" y="278" text-anchor="middle">Frameworks</text>

<line class="mm-arrow" stroke-dasharray="3,3" x1="300" y1="160" x2="430" y2="37"/>
<line class="mm-arrow" stroke-dasharray="3,3" x1="268" y1="160" x2="430" y2="95"/>
<line class="mm-arrow" stroke-dasharray="3,3" x1="236" y1="160" x2="430" y2="153"/>
<line class="mm-arrow" stroke-dasharray="3,3" x1="204" y1="160" x2="430" y2="211"/>

<rect class="mm-n1" x="430" y="30" width="14" height="14" rx="3"/>
<text class="mm-node-title" x="452" y="41" text-anchor="start">Frameworks &amp; Drivers</text>
<text class="mm-node-sub" x="452" y="56" text-anchor="start">web, DB, UI — outermost, most volatile</text>

<rect class="mm-n4" x="430" y="88" width="14" height="14" rx="3"/>
<text class="mm-node-title" x="452" y="99" text-anchor="start">Interface Adapters</text>
<text class="mm-node-sub" x="452" y="114" text-anchor="start">controllers, presenters, gateways</text>

<rect class="mm-n2" x="430" y="146" width="14" height="14" rx="3"/>
<text class="mm-node-title" x="452" y="157" text-anchor="start">Use Cases</text>
<text class="mm-node-sub" x="452" y="172" text-anchor="start">application-specific business rules</text>

<rect class="mm-n3" x="430" y="204" width="14" height="14" rx="3"/>
<text class="mm-node-title" x="452" y="215" text-anchor="start">Entities</text>
<text class="mm-node-sub" x="452" y="230" text-anchor="start">core domain rules — innermost, most stable</text>
</svg>

<p class="mental-model__caption">Draw it as rings, not layers: the Dependency Rule says source code can only point inward, from an outer ring toward the ring it wraps — Frameworks may depend on Adapters, Adapters on Use Cases, Use Cases on Entities, but never the reverse. Entities never import a database driver; a database adapter always imports the port an inner layer defined.</p>
</div>

## 1. What Clean Architecture Is, in Practical Terms

Clean Architecture is not a library, a framework, or a folder-naming
convention — it is a constraint on the **direction of source-code
dependencies**. Robert C. Martin named it in 2012, but the substance
predates the name: Alistair Cockburn's Hexagonal Architecture (2005) and
Jeffrey Palermo's Onion Architecture (2008) describe the same structure with
different vocabulary.

The rule, stated precisely:

> Source code dependencies must point only inward. Nothing in an inner
> circle can know anything at all about something in an outer circle. In
> particular, the name of something declared in an outer circle must not be
> mentioned by code in an inner circle.

Get this one rule right and business logic becomes independently testable,
the database and framework become swappable implementation details, and you
can defer infrastructure decisions until you actually understand the
problem. Get it wrong — even with the "right" folder names — and you've
built a layered mess that merely looks clean.

### The problem it solves

Traditional layered apps (`Controller → Service → Repository → ORM entity`)
look organized but usually have the dependency arrow pointing the *wrong*
way in practice: the "business logic" imports ORM models, the service layer
catches `SQLAlchemyError` or checks `if err == sql.ErrNoRows`, and the domain
types are literally the database rows. The result: you cannot unit-test
business logic without a database, you cannot swap Postgres for DynamoDB
without touching domain code, and every framework upgrade risks breaking
rules that have nothing to do with the framework.

---

## 2. The Four Concentric Layers

```
┌─────────────────────────────────────────────┐
│  Frameworks & Drivers (DB, web, UI, CLI)     │  ← outermost, most volatile
│  ┌─────────────────────────────────────────┐ │
│  │  Interface Adapters (controllers,        │ │
│  │  presenters, gateways, repo impls)       │ │
│  │  ┌─────────────────────────────────────┐ │ │
│  │  │  Use Cases / Application (interactors)│ │ │
│  │  │  ┌─────────────────────────────────┐ │ │ │
│  │  │  │  Entities / Domain (pure logic) │ │ │ │  ← innermost, most stable
│  │  │  └─────────────────────────────────┘ │ │ │
│  │  └─────────────────────────────────────┘ │ │
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
        dependencies point ───────────────▶ inward only
```

1. **Entities** — enterprise-wide business objects and invariants. A `Money`
   type that refuses negative amounts, an `Order` that enforces "cannot ship
   without payment." No knowledge of HTTP, SQL, or JSON. These change least
   often — only when business rules themselves change.

2. **Use Cases (Interactors)** — application-specific orchestration: "place
   an order," "cancel a subscription." A use case coordinates entities and
   talks to the outside world *only through interfaces it defines* (ports).
   It does not know whether data comes from Postgres, Redis, or a CSV file.

3. **Interface Adapters** — the translation layer: controllers that convert
   an HTTP request into a use-case input struct, presenters that convert a
   use-case output into a JSON response, and — critically — **repository
   implementations** that satisfy the ports defined by the use-case layer.

4. **Frameworks & Drivers** — the outermost ring: the web framework (Gin,
   FastAPI, Express), the DB driver, the message queue client. This is where
   all the volatile, "shouldn't matter to the business" detail lives. This
   layer is *plugged into* the rest of the system, not the other way around.

| Concept | One-line meaning |
|---|---|
| **Dependency Rule** | Source dependencies point only toward higher-level policy (inward) |
| **Entities** | Enterprise-wide business rules and data, framework-agnostic |
| **Use Cases** | Application-specific business rules; orchestrate entities |
| **Interface Adapters** | Convert data between use cases and the outside world |
| **Frameworks & Drivers** | DB engines, web frameworks, UI, external services — the "details" |
| **Port** | An interface owned by the inner layer, defining what it needs from the outside |
| **Adapter** | An outer-layer implementation of a port |
| **Dependency Inversion** | High-level modules depend on abstractions, not concrete low-level modules |

An important, easy-to-miss detail: the rule covers **data formats**, not
just imports. A `User` entity should not be annotated with `json:"..."` tags
or `@Column` decorators from an ORM — those annotations are outer-layer
concerns leaking inward.

---

## 3. Dependency Inversion Is How the Rule Gets Enforced

Business logic still *needs* to persist data — that's a real runtime
dependency. Clean Architecture doesn't eliminate that need; it inverts who
owns the interface. Instead of the use case importing a concrete
`PostgresOrderRepository`, the use case defines an abstract `OrderRepository`
port, and the Postgres implementation — living in the outer ring — depends
on (implements) that interface. At runtime, control still flows outward (the
use case calls the adapter), but the *source dependency* (the
`import`/`interface` reference) points inward: the adapter imports the
domain's interface, never the reverse.

```
   compile-time (source) dependency:      Adapter ──depends on──▶ Port (interface)
   runtime (control) flow:                UseCase ──calls──▶ Adapter (via the port)
```

This is the "D" in SOLID — the Dependency Inversion Principle — applied at
the architectural level, not just the class level.

---

## 4. Hexagonal and Onion Architecture Are the Same Idea

Hexagonal, Onion, and Clean Architecture are the same structure described by
three different authors at three different times. If you understand the
Dependency Rule, you understand all three.

**Hexagonal Architecture (Ports & Adapters)** — Alistair Cockburn's 2005
framing:

- **Application core** = Entities + Use Cases combined into one "hexagon."
- **Ports** = interfaces the core exposes or requires (e.g.,
  `OrderRepository`, `NotificationSender`).
- **Driving adapters** (primary/left side) — things that call into the core:
  an HTTP controller, a CLI command, a test harness.
- **Driven adapters** (secondary/right side) — things the core calls out to:
  a Postgres repository, an SMTP client, an in-memory fake.

The hexagon shape is arbitrary (Cockburn picked it just to avoid implying
only two sides, "front" and "back"); the substance is identical to Clean
Architecture's inner rings vs. outer rings.

**Onion Architecture** — Jeffrey Palermo's 2008 framing draws concentric
rings — Domain Model at the center, Domain Services next, Application
Services next, then Infrastructure/UI at the edges — again with the rule
that all coupling points inward toward the domain. Onion Architecture is
generally credited as the direct ancestor of Clean Architecture's diagram.

**Bottom line**: three names, one rule. Don't get hung up on whether to call
something a "port" or an "interactor" — get hung up on whether the domain
package imports the database driver.

---

## 5. Worked Python Example

The following is a complete, coherent example showing all four elements
needed to see dependency inversion working: a domain **entity**, a **port**
(interface) the use case depends on, a **use case**, and **two adapters** —
a Postgres adapter and an in-memory adapter used for tests — both satisfying
the same port.

### 5.1 Entity (domain layer — zero external imports)

```python
# domain/entities.py
"""Pure domain layer. No framework, no ORM, no HTTP, no SQL. Ever."""

from dataclasses import dataclass, field
from decimal import Decimal
from enum import Enum
from uuid import UUID, uuid4


class OrderStatus(Enum):
    PENDING = "pending"
    PAID = "paid"
    SHIPPED = "shipped"
    CANCELLED = "cancelled"


class DomainError(Exception):
    """Base class for business-rule violations. Not an HTTP error, not a DB error."""


class InsufficientStockError(DomainError):
    pass


class InvalidOrderStateError(DomainError):
    pass


@dataclass
class OrderLine:
    sku: str
    quantity: int
    unit_price: Decimal

    def __post_init__(self) -> None:
        if self.quantity <= 0:
            raise DomainError(f"quantity must be positive, got {self.quantity}")
        if self.unit_price < 0:
            raise DomainError("unit_price cannot be negative")

    @property
    def subtotal(self) -> Decimal:
        return self.unit_price * self.quantity


@dataclass
class Order:
    """Aggregate root. Owns and enforces all invariants for its order lines."""

    id: UUID = field(default_factory=uuid4)
    customer_id: UUID = field(default_factory=uuid4)
    lines: list[OrderLine] = field(default_factory=list)
    status: OrderStatus = OrderStatus.PENDING

    @property
    def total(self) -> Decimal:
        return sum((line.subtotal for line in self.lines), Decimal("0"))

    def mark_paid(self) -> None:
        if self.status != OrderStatus.PENDING:
            raise InvalidOrderStateError(
                f"cannot pay an order in status {self.status}"
            )
        if not self.lines:
            raise DomainError("cannot pay an order with no line items")
        self.status = OrderStatus.PAID

    def cancel(self) -> None:
        if self.status == OrderStatus.SHIPPED:
            raise InvalidOrderStateError("cannot cancel a shipped order")
        self.status = OrderStatus.CANCELLED
```

Notice: no `import psycopg2`, no `import fastapi`, no ORM base class, no
JSON serialization concern. This file could be copy-pasted into any Python
project unchanged.

### 5.2 Port (interface the use case depends on — still domain-owned)

```python
# domain/ports.py
"""Interfaces (ports) that the application layer requires.
Owned by the domain/application side; implemented by outer adapters.
This is the file that makes Dependency Inversion visible."""

from abc import ABC, abstractmethod
from uuid import UUID

from domain.entities import Order


class OrderRepository(ABC):
    """Port. The use case only ever talks to THIS interface."""

    @abstractmethod
    def get(self, order_id: UUID) -> Order | None: ...

    @abstractmethod
    def save(self, order: Order) -> None: ...


class InventoryChecker(ABC):
    """Second port — demonstrates a use case can depend on multiple ports."""

    @abstractmethod
    def has_stock(self, sku: str, quantity: int) -> bool: ...
```

### 5.3 Use Case (application layer — orchestrates entities via ports only)

```python
# application/place_order.py
"""Application layer. Depends ONLY on domain/entities.py and domain/ports.py.
Never imports a concrete adapter — that would violate the Dependency Rule."""

from dataclasses import dataclass
from decimal import Decimal
from uuid import UUID

from domain.entities import InsufficientStockError, Order, OrderLine
from domain.ports import InventoryChecker, OrderRepository


@dataclass
class PlaceOrderRequest:
    customer_id: UUID
    items: list[tuple[str, int, Decimal]]  # (sku, qty, unit_price)


@dataclass
class PlaceOrderResponse:
    order_id: UUID
    total: Decimal


class PlaceOrderUseCase:
    def __init__(self, orders: OrderRepository, inventory: InventoryChecker):
        # Constructor injection of PORTS, not concrete adapters.
        self._orders = orders
        self._inventory = inventory

    def execute(self, request: PlaceOrderRequest) -> PlaceOrderResponse:
        for sku, qty, _ in request.items:
            if not self._inventory.has_stock(sku, qty):
                raise InsufficientStockError(f"insufficient stock for {sku}")

        order = Order(customer_id=request.customer_id)
        order.lines = [
            OrderLine(sku=sku, quantity=qty, unit_price=price)
            for sku, qty, price in request.items
        ]

        self._orders.save(order)
        return PlaceOrderResponse(order_id=order.id, total=order.total)
```

### 5.4 Adapter — Postgres implementation (outer layer, real infrastructure)

```python
# infrastructure/postgres_order_repository.py
"""Interface adapter / infrastructure layer. Implements the domain's port.
This file is allowed to import psycopg2 because it IS the framework detail."""

import json
from decimal import Decimal
from uuid import UUID

import psycopg2
import psycopg2.extras

from domain.entities import Order, OrderLine, OrderStatus
from domain.ports import OrderRepository


class PostgresOrderRepository(OrderRepository):
    def __init__(self, conn: psycopg2.extensions.connection):
        self._conn = conn

    def get(self, order_id: UUID) -> Order | None:
        with self._conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor) as cur:
            cur.execute(
                "SELECT id, customer_id, status, lines FROM orders WHERE id = %s",
                (str(order_id),),
            )
            row = cur.fetchone()
        if row is None:
            return None
        return Order(
            id=UUID(row["id"]),
            customer_id=UUID(row["customer_id"]),
            status=OrderStatus(row["status"]),
            lines=[
                OrderLine(sku=l["sku"], quantity=l["quantity"], unit_price=Decimal(l["unit_price"]))
                for l in json.loads(row["lines"])
            ],
        )

    def save(self, order: Order) -> None:
        lines_json = json.dumps(
            [{"sku": l.sku, "quantity": l.quantity, "unit_price": str(l.unit_price)} for l in order.lines]
        )
        with self._conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO orders (id, customer_id, status, lines)
                VALUES (%s, %s, %s, %s)
                ON CONFLICT (id) DO UPDATE
                SET status = EXCLUDED.status, lines = EXCLUDED.lines
                """,
                (str(order.id), str(order.customer_id), order.status.value, lines_json),
            )
        self._conn.commit()
```

### 5.5 Adapter — in-memory implementation (used in tests, no DB required)

```python
# tests/fakes.py
"""Second adapter satisfying the SAME port. This is the payoff:
the use case runs, fully, with zero infrastructure, in microseconds."""

from uuid import UUID

from domain.entities import Order
from domain.ports import InventoryChecker, OrderRepository


class InMemoryOrderRepository(OrderRepository):
    def __init__(self) -> None:
        self._store: dict[UUID, Order] = {}

    def get(self, order_id: UUID) -> Order | None:
        return self._store.get(order_id)

    def save(self, order: Order) -> None:
        self._store[order.id] = order


class FakeInventoryChecker(InventoryChecker):
    def __init__(self, stock: dict[str, int]):
        self._stock = stock

    def has_stock(self, sku: str, quantity: int) -> bool:
        return self._stock.get(sku, 0) >= quantity
```

### 5.6 The test — no database, no mocks-of-mocks, no network

```python
# tests/test_place_order.py
from decimal import Decimal
from uuid import uuid4

import pytest

from application.place_order import PlaceOrderRequest, PlaceOrderUseCase
from domain.entities import InsufficientStockError
from tests.fakes import FakeInventoryChecker, InMemoryOrderRepository


def test_place_order_succeeds_with_stock():
    orders = InMemoryOrderRepository()
    inventory = FakeInventoryChecker(stock={"WIDGET-1": 10})
    use_case = PlaceOrderUseCase(orders=orders, inventory=inventory)

    response = use_case.execute(
        PlaceOrderRequest(
            customer_id=uuid4(),
            items=[("WIDGET-1", 2, Decimal("9.99"))],
        )
    )

    assert response.total == Decimal("19.98")
    assert orders.get(response.order_id) is not None


def test_place_order_fails_without_stock():
    orders = InMemoryOrderRepository()
    inventory = FakeInventoryChecker(stock={"WIDGET-1": 1})
    use_case = PlaceOrderUseCase(orders=orders, inventory=inventory)

    with pytest.raises(InsufficientStockError):
        use_case.execute(
            PlaceOrderRequest(
                customer_id=uuid4(),
                items=[("WIDGET-1", 5, Decimal("9.99"))],
            )
        )
```

### 5.7 Wiring it together (composition root)

```python
# main.py
"""Composition root. This is the ONLY file allowed to import both
the domain layer and a concrete adapter, and wire them together."""

import psycopg2

from application.place_order import PlaceOrderUseCase
from infrastructure.postgres_order_repository import PostgresOrderRepository
from infrastructure.stock_service_inventory_checker import StockServiceInventoryChecker

conn = psycopg2.connect("dbname=orders user=app")
use_case = PlaceOrderUseCase(
    orders=PostgresOrderRepository(conn),
    inventory=StockServiceInventoryChecker(base_url="http://inventory.internal"),
)
# hand `use_case` to your HTTP controller / CLI entrypoint here
```

Notice the dependency graph: `application` imports only `domain`.
`infrastructure` imports `domain` (to implement its ports) and third-party
drivers. `main.py` is the single point that imports concrete adapters and
injects them — everywhere else, only the abstract port is visible. Swap
`PostgresOrderRepository` for a `DynamoOrderRepository` and not one line in
`domain/` or `application/` changes.

---

## 6. Worked Go Example: the Same Shape, Statically Typed

Go's implicit interface satisfaction (no `implements` keyword) makes this
pattern almost frictionless — a struct satisfies an interface just by having
a matching method set, with zero coupling to the interface definition
itself.

```go
// domain/order.go — entity, zero imports outside stdlib
package domain

import "errors"

type OrderStatus string

const (
	StatusPending OrderStatus = "pending"
	StatusPaid    OrderStatus = "paid"
)

var ErrInvalidState = errors.New("invalid order state transition")

type Order struct {
	ID       string
	Status   OrderStatus
	TotalCts int64 // cents, avoid float money
}

func (o *Order) MarkPaid() error {
	if o.Status != StatusPending {
		return ErrInvalidState
	}
	o.Status = StatusPaid
	return nil
}

// domain/ports.go — port, still zero infra imports
package domain

type OrderRepository interface {
	Get(id string) (*Order, error)
	Save(o *Order) error
}

// infra/postgres_repo.go — adapter, only file allowed to import database/sql
package infra

import (
	"database/sql"
	"myapp/domain"
)

type PostgresOrderRepository struct{ db *sql.DB }

func NewPostgresOrderRepository(db *sql.DB) *PostgresOrderRepository {
	return &PostgresOrderRepository{db: db}
}

func (r *PostgresOrderRepository) Get(id string) (*domain.Order, error) {
	row := r.db.QueryRow(`SELECT id, status, total_cts FROM orders WHERE id = $1`, id)
	var o domain.Order
	if err := row.Scan(&o.ID, &o.Status, &o.TotalCts); err != nil {
		return nil, err
	}
	return &o, nil
}

func (r *PostgresOrderRepository) Save(o *domain.Order) error {
	_, err := r.db.Exec(
		`INSERT INTO orders (id, status, total_cts) VALUES ($1,$2,$3)
		 ON CONFLICT (id) DO UPDATE SET status=$2, total_cts=$3`,
		o.ID, o.Status, o.TotalCts,
	)
	return err
}

// infra/inmemory_repo.go — second adapter, used only in _test.go files
package infra

import "myapp/domain"

type InMemoryOrderRepository struct{ store map[string]*domain.Order }

func NewInMemoryOrderRepository() *InMemoryOrderRepository {
	return &InMemoryOrderRepository{store: make(map[string]*domain.Order)}
}

func (r *InMemoryOrderRepository) Get(id string) (*domain.Order, error) {
	o, ok := r.store[id]
	if !ok {
		return nil, sql.ErrNoRows // acceptable here only because it's test infra, not domain code
	}
	return o, nil
}

func (r *InMemoryOrderRepository) Save(o *domain.Order) error {
	r.store[o.ID] = o
	return nil
}
```

The shape is identical to the Python version: `domain` has zero infra
imports, `infra` imports `domain` to satisfy its interfaces, and only the
composition root (typically `main.go`) knows about both a concrete adapter
and the use case that consumes it.

---

## 7. Enforcing the Boundary Structurally

Comments saying "don't import infra from domain" don't survive contact with
a deadline. Enforce the Dependency Rule structurally, not by convention:

- **Go**: separate modules or `internal/` packages per layer; a linter like
  `depguard` or `go-cleanarch` fails the build on a forbidden import.
- **Python**: `import-linter` (`lint-imports`) with contract rules like
  `domain` forbidden from importing `infrastructure`.
- **Java/Kotlin**: ArchUnit tests that assert package dependency rules as
  part of the test suite.

Treat a forbidden import as a build failure, not a code-review nitpick —
it's the only way the boundary survives past the first few sprints.

### CQRS-lite inside Clean Architecture

Split read and write use cases when read models diverge significantly from
write models — e.g., a write-side `PlaceOrderUseCase` operating on the full
`Order` aggregate, and a read-side `OrderSummaryQuery` hitting a
denormalized view or read-replica directly, bypassing the aggregate
entirely for performance. Both still respect the Dependency Rule (the query
port is still an interface owned by the application layer), but you stop
pretending every read needs to go through the aggregate's invariants —
reads don't need invariant enforcement, only writes do.

### Deciding how many layers you actually need

Not every project needs all four rings as separate packages. A pragmatic
middle ground for a mid-size service: collapse Interface Adapters and
Frameworks & Drivers into one `infrastructure/` layer, but keep `domain/`
(entities + ports) and `application/` (use cases) strictly separate from it.
That's usually the minimum split that buys the testability and swappability
benefits without the ceremony of four fully separate packages for every
feature.

---

## 8. Relationship to DDD-Lite

Clean Architecture and Domain-Driven Design solve adjacent but distinct
problems: DDD is about *how you model* the domain (aggregates, entities,
value objects, bounded contexts); Clean Architecture is about *how layers
depend on each other*. They compose naturally without requiring full DDD:

- An **Entity** in Clean Architecture terms often *is* a DDD **Aggregate
  Root** — the object that owns and enforces invariants for a cluster of
  related objects (the `Order` in the examples above, owning its
  `OrderLine`s, is exactly this).
- A **Repository** in DDD is exactly the kind of thing a **port** exists
  for: `OrderRepository` is a domain-owned interface (persistence *appears*
  to be simple collection-like access from the domain's point of view),
  with the actual SQL/ORM machinery living in an adapter.
- You do **not** need bounded contexts, domain events, CQRS, or event
  sourcing to benefit from the Dependency Rule. Pull in only the DDD
  building blocks (aggregate, repository, value object) that solve a
  problem you actually have — treat DDD as a toolbox, not a prerequisite
  checklist.

---

## 9. Common Mistakes

**"Anemic" ORM entities standing in for domain entities**

```python
# Wrong — the "domain" object IS the ORM model
class Order(db.Model):
    __tablename__ = "orders"
    id = db.Column(db.UUID, primary_key=True)
    status = db.Column(db.String)
    # business rules now live scattered across services that touch this model
```

**Correct**: keep a plain domain `Order` (as in the example above) and map
it to persistence inside the adapter. The mapping code is a cost you pay
deliberately, in exchange for a domain model that has no idea a database
exists.

**Leaking DTOs/framework types into the use case**

```python
# Wrong — use case takes a Flask request object directly
class PlaceOrderUseCase:
    def execute(self, request: flask.Request) -> flask.Response:
        ...
```

**Correct**: controllers translate `flask.Request` → `PlaceOrderRequest` (a
plain dataclass) *before* calling the use case, and translate the response
back on the way out. The use case never sees a framework type.

**Fat, all-purpose repository interfaces**

```python
# Wrong — the port grew to match whatever ORM/SQL feature was convenient
class OrderRepository(ABC):
    def execute_raw_sql(self, query: str) -> Any: ...
    def get_connection(self) -> psycopg2.extensions.connection: ...
```

**Correct**: ports should be shaped by what the *use case* needs (`get`,
`save`), never by what the underlying database happens to expose. A leaking
`get_connection()` method defeats the entire abstraction.

**Applying Clean Architecture to a small CRUD app**

A 5-endpoint internal admin tool that does `create/read/update/delete` on
two tables gets nothing from four layers, a port per repository, and a
composition root — it gets slower onboarding, more files to jump through
per change, and boilerplate mappers translating between three
near-identical `Order` representations (ORM row, domain entity, API DTO)
for a table nobody unit-tests in isolation anyway. This is the most common
real-world misuse: architecture selected to look rigorous rather than to
solve an actual testability, volatility, or team-scaling problem the
project has. Reach for full Clean Architecture when there is genuine domain
complexity, multiple or uncertain infrastructure choices, or a team large
enough that decoupling reduces merge conflicts — not by default.

**Confusing "ports live in the domain" with "domain owns persistence
logic"**

The port (`OrderRepository` interface) lives with the domain/application
layer. The *implementation* (SQL, ORM calls, connection pooling) must not.
Putting SQL inside `domain/` because "the repository interface is already
there" reintroduces the exact coupling the pattern exists to prevent.

---

## 10. Why This Matters in Practice

- **Testability without infrastructure**: unit-test `PlaceOrderUseCase`
  with an in-memory fake repository — no test database, no network, no
  Docker container, sub-millisecond test runs.
- **Framework independence**: the web framework, ORM, and message broker
  become swappable *implementation* details behind ports, not load-bearing
  structure the whole app is welded to.
- **Deferred infrastructure decisions**: build and validate business rules
  before deciding Postgres vs. DynamoDB vs. flat files — a genuinely useful
  property early in a project when infrastructure choices are expensive to
  reverse later.
- **Isolation of change**: a schema migration or ORM upgrade touches one
  adapter, not the whole call graph.
- **Composition root discipline matters**: exactly one place (or a thin DI
  container) should import concrete adapters and wire them to ports. If
  adapters get imported from multiple places, the boundary everywhere else
  was protecting has quietly broken.

---

## 11. Interview-Ready Q&A

**Q: What is the Dependency Rule, in one sentence?**
A: Source code dependencies can only point inward — an inner layer (domain,
use cases) must never import, reference, or know the name of anything
declared in an outer layer (interface adapters, frameworks/drivers),
including data formats like ORM decorators or JSON tags.

**Q: How does Dependency Inversion make the Dependency Rule enforceable
when the use case genuinely needs to talk to a database?**
A: The use case defines an abstract port (e.g., an `OrderRepository`
interface) that it depends on; the concrete adapter (e.g.,
`PostgresOrderRepository`), living in the outer ring, implements that
interface. At runtime, control still flows outward — the use case calls the
adapter — but the source dependency points inward, since the adapter is the
one importing the domain's interface, not the other way around.

**Q: Are Hexagonal, Onion, and Clean Architecture different things?**
A: No — they're the same underlying structure described by three different
authors: Cockburn's Hexagonal/Ports & Adapters (2005), Palermo's Onion
(2008), and Martin's Clean Architecture (2012). All three enforce identical
inward-pointing dependencies; the differences are purely in vocabulary
(ports/adapters vs. rings vs. use cases and entities).

**Q: What's the concrete testability payoff of this pattern?**
A: A use case like `PlaceOrderUseCase` can be constructed with an
in-memory fake repository and a fake inventory checker instead of real
adapters, so its full test suite runs in microseconds with no database, no
Docker container, and no network calls — because the use case only ever
depends on the port interface, not a concrete implementation.

**Q: Why is a `Controller → Service → Repository` stack not automatically
"Clean Architecture"?**
A: Layering alone says nothing about dependency direction. If the "service"
layer imports ORM models, catches database-specific exceptions, or takes
framework request objects as parameters, the dependency arrow points
outward-to-inward in exactly the way Clean Architecture forbids — it's a
layered architecture, not a Clean one, regardless of what the folders are
named.

**Q: When would you avoid applying Clean Architecture?**
A: On small, low-complexity CRUD apps — a handful of endpoints over a
couple of tables with no meaningful business rules gets no benefit from
four layers, a port per repository, and a composition root; it only adds
onboarding friction and boilerplate mappers between near-identical
representations of the same data. Reach for it when there's genuine domain
complexity, uncertain or multiple infrastructure choices, or a team large
enough that decoupling reduces merge conflicts.

**Q: How does this relate to DDD's aggregates and repositories?**
A: They compose naturally without requiring full DDD. A Clean Architecture
Entity is often exactly a DDD Aggregate Root (owns and enforces invariants
for a cluster of objects), and a DDD Repository is exactly what a port is
for — a domain-owned interface that makes persistence look like simple
collection access, with the real SQL/ORM machinery living in an adapter.
You don't need bounded contexts, domain events, or event sourcing to
benefit from the Dependency Rule.

**Q: How do you keep the boundary from eroding under deadline pressure?**
A: Enforce it structurally, not by convention or code-review nitpick — with
import-linter contracts in Python, `depguard`/`go-cleanarch` in Go, or
ArchUnit tests in Java/Kotlin that fail the build on a forbidden import
from `domain` into `infrastructure`. A rule that only lives in a comment or
a wiki page doesn't survive the first few sprints.

---

## 12. One-Line Summary

**Clean Architecture is one rule — source dependencies point inward, always
— enforced through dependency inversion (inner layers own ports, outer
layers implement them); apply it when domain complexity or infrastructure
volatility justifies the ceremony, skip it on small CRUD apps, and enforce
the boundary with a linter or architecture test, not a comment.**
