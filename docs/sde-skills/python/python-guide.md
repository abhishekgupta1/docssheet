---
title: "Python: The Complete Guide"
description: "End-to-end reference for Python — core language, data structures, OOP, concurrency, decorators/generators, error handling, testing, ops/DevOps automation scripting (subprocess, argparse, requests, boto3, SSH fleets), and interview-ready Q&A."
sidebar_position: 1
tags: [python, sde, programming-language, automation, devops]
---

# Python — The Complete Guide

A single-read, end-to-end reference for Python: enough to onboard onto a new
codebase, write idiomatic production code, or walk into an SDE interview.
Organized as a lookup you can also read top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/python">📋 Quick reference: Python →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 220" role="img" aria-labelledby="mm-python-title mm-python-desc">
<title id="mm-python-title">Python's five pillars, one core language</title>
<desc id="mm-python-desc">One dynamically typed core language fans out into five practical areas covered in this guide: data and types, object-oriented and functional constructs, concurrency, testing and error handling, and ops and DevOps automation scripting.</desc>
<defs>
  <marker id="mm-python-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n5" x="290" y="16" width="200" height="56" rx="10"/>
<text class="mm-node-title" x="390" y="40" text-anchor="middle">Python Core</text>
<text class="mm-node-sub" x="390" y="56" text-anchor="middle">one language, many jobs</text>

<path class="mm-arrow" d="M330,72 L92,134" marker-end="url(#mm-python-arrow)"/>
<path class="mm-arrow" d="M360,72 L252,134" marker-end="url(#mm-python-arrow)"/>
<path class="mm-arrow" d="M390,72 L395,134" marker-end="url(#mm-python-arrow)"/>
<path class="mm-arrow" d="M420,72 L537,134" marker-end="url(#mm-python-arrow)"/>
<path class="mm-arrow" d="M450,72 L697,134" marker-end="url(#mm-python-arrow)"/>

<rect class="mm-n3" x="20" y="138" width="145" height="66" rx="10"/>
<text class="mm-node-title" x="92" y="166" text-anchor="middle">Data &amp; Types</text>
<text class="mm-node-sub" x="92" y="182" text-anchor="middle">mutable vs</text>
<text class="mm-node-sub" x="92" y="195" text-anchor="middle">immutable</text>

<rect class="mm-n2" x="180" y="138" width="145" height="66" rx="10"/>
<text class="mm-node-title" x="252" y="166" text-anchor="middle">OOP &amp; Functions</text>
<text class="mm-node-sub" x="252" y="182" text-anchor="middle">classes,</text>
<text class="mm-node-sub" x="252" y="195" text-anchor="middle">decorators, gens</text>

<rect class="mm-n4" x="340" y="138" width="110" height="66" rx="10"/>
<text class="mm-node-title" x="395" y="166" text-anchor="middle">Concurrency</text>
<text class="mm-node-sub" x="395" y="182" text-anchor="middle">threads /</text>
<text class="mm-node-sub" x="395" y="195" text-anchor="middle">asyncio, GIL</text>

<rect class="mm-n1" x="465" y="138" width="145" height="66" rx="10"/>
<text class="mm-node-title" x="537" y="166" text-anchor="middle">Errors &amp; Testing</text>
<text class="mm-node-sub" x="537" y="182" text-anchor="middle">exceptions,</text>
<text class="mm-node-sub" x="537" y="195" text-anchor="middle">pytest</text>

<rect class="mm-n6" x="625" y="138" width="145" height="66" rx="10"/>
<text class="mm-node-title" x="697" y="166" text-anchor="middle">Automation</text>
<text class="mm-node-sub" x="697" y="182" text-anchor="middle">subprocess,</text>
<text class="mm-node-sub" x="697" y="195" text-anchor="middle">boto3, SSH</text>
</svg>

<p class="mental-model__caption">Everything in this guide branches from one dynamically typed core language into five areas that show up together in real production code: data and types, object-oriented and functional constructs, concurrency, testing and error handling, and ops automation scripting.</p>
</div>

## 1. What Python Is, in Practical Terms

Python is a **dynamically typed, interpreted, garbage-collected,
multi-paradigm** language (procedural, object-oriented, functional). The
reference implementation is **CPython**; alternatives include PyPy (JIT,
faster for long-running pure-Python workloads), Jython (JVM), and IronPython
(.NET).

Key design philosophy — "The Zen of Python" (`import this`): readability
counts, explicit is better than implicit, there should be one obvious way to
do it. This shows up everywhere in idiomatic code style.

---

## 2. Core Data Types

| Type | Mutable? | Ordered? | Notes |
|---|---|---|---|
| `int`, `float`, `complex` | — | — | `int` has arbitrary precision (no overflow) |
| `bool` | — | — | Subclass of `int` (`True == 1`) |
| `str` | No (immutable) | Yes | Unicode by default |
| `bytes` / `bytearray` | No / Yes | Yes | Raw binary data |
| `list` | Yes | Yes | General-purpose dynamic array |
| `tuple` | No | Yes | Immutable sequence; hashable if contents are |
| `dict` | Yes | Insertion-ordered (3.7+) | Hash map |
| `set` / `frozenset` | Yes / No | No | Hash-based uniqueness, O(1) membership |
| `NoneType` | — | — | Python's null — singleton `None` |

### Mutability gotcha (classic interview trap)

```python
def append_item(item, target=[]):   # BUG: default arg evaluated ONCE at def time
    target.append(item)
    return target

append_item(1)  # [1]
append_item(2)  # [1, 2]  <-- surprise! same list reused across calls
```

**Fix:** use `None` as the sentinel default and create the mutable object
inside the function body.

```python
def append_item(item, target=None):
    if target is None:
        target = []
    target.append(item)
    return target
```

### `is` vs `==`

`==` compares value equality; `is` compares object identity (same memory
location). Always use `is` for `None`/`True`/`False` checks
(`if x is None:`), and `==` for value comparison. Small integers (-5 to 256)
and short strings are cached/interned by CPython, so `is` can *appear* to
work on them — never rely on that.

---

## 3. Data Structures & Comprehensions

```python
squares = [x**2 for x in range(10) if x % 2 == 0]         # list comprehension
squares_gen = (x**2 for x in range(10))                    # generator expression — lazy
word_lengths = {w: len(w) for w in words}                  # dict comprehension
unique_lens = {len(w) for w in words}                       # set comprehension
```

- **List comprehensions** are generally faster than equivalent `for` loops with `.append()` — the loop is implemented in C.
- **Generator expressions** don't build the whole sequence in memory — use for large/streaming data.
- Prefer a comprehension when the body is a single expression — it reads as "I am building a collection" at a glance. Reach for an explicit loop once you need multiple statements per iteration, early `break`/`continue`, or side effects; forcing side-effect-only logic into a comprehension just to save lines hurts readability, which defeats the point.

### Why tuples can be dict keys/set members and lists can't

Immutability is what makes something hashable (if its elements are also hashable): `hash((1, 2))` is stable for the tuple's lifetime because it can never change, so a dict/set can safely use it as a bucket key. A `list` is mutable — if it were hashable, mutating it after insertion would silently corrupt the hash table's internal bucketing. `frozenset` is `set`'s equivalent immutable/hashable counterpart, same relationship.

```python
cache = {}
cache[(user_id, resource_id)] = result   # tuple as compound dict key — common cache pattern
```

### Classic mistake: mutating a dict while iterating it

```python
for key in d:
    if should_remove(key):
        del d[key]   # RuntimeError: dictionary changed size during iteration
```

**Fix:** snapshot the keys (or items) first so the iteration isn't over the live structure.

```python
for key in list(d.keys()):
    if should_remove(key):
        del d[key]
```

### Collections module essentials

```python
from collections import defaultdict, Counter, deque, namedtuple, OrderedDict

counts = Counter(['a', 'b', 'a', 'c', 'a'])       # Counter({'a': 3, 'b': 1, 'c': 1})
groups = defaultdict(list)                          # auto-creates missing keys
q = deque(maxlen=100)                                # O(1) append/pop both ends — use for queues, not list
Point = namedtuple('Point', ['x', 'y'])              # lightweight immutable record
```

### `dataclasses` (modern struct-like classes)

```python
from dataclasses import dataclass, field

@dataclass
class Order:
    id: int
    items: list[str] = field(default_factory=list)
    total: float = 0.0
```

Auto-generates `__init__`, `__repr__`, `__eq__` — eliminates boilerplate for
data-holding classes.

---

## 4. Functions, Scope, and Closures

### LEGB scope resolution
Python resolves names in order: **L**ocal → **E**nclosing → **G**lobal →
**B**uilt-in.

```python
def outer():
    x = "enclosing"
    def inner():
        nonlocal x       # modify the enclosing scope's variable
        x = "modified"
    inner()
    print(x)              # "modified"
```

`global` does the same for module-level variables from inside a function.

### `*args`, `**kwargs`

```python
def f(a, b, *args, c=10, **kwargs):
    # args: extra positional args as a tuple
    # kwargs: extra keyword args as a dict
    ...

f(1, 2, 3, 4, c=5, d=6)  # a=1, b=2, args=(3,4), c=5, kwargs={'d':6}
```

### First-class functions & closures

```python
def make_multiplier(n):
    def multiplier(x):
        return x * n
    return multiplier   # closure — remembers `n` from enclosing scope

double = make_multiplier(2)
double(5)  # 10
```

### Closure gotcha: late binding in loops

A closure captures the **variable**, not the value it held at closure-creation time. This bites people constantly when creating closures/lambdas inside a loop:

```python
funcs = [lambda: i for i in range(3)]
[f() for f in funcs]              # [2, 2, 2] — NOT [0, 1, 2]!
# every lambda shares the same `i`, and by the time any of them run, the loop has finished with i == 2
```

**Fix:** bind the loop variable as a default argument, which *is* evaluated at lambda-creation time (once per iteration):

```python
funcs = [lambda i=i: i for i in range(3)]
[f() for f in funcs]              # [0, 1, 2]
```

### Lambda
`add = lambda a, b: a + b` — anonymous, single-expression functions; used
mainly as short callback arguments (`sorted(items, key=lambda x: x.date)`).
Avoid multi-line logic in lambdas — use a named `def` instead for readability.

---

## 5. Decorators

A decorator wraps a function to add behavior without modifying its body —
Python's core mechanism for cross-cutting concerns (logging, timing, caching,
auth checks, retries).

```python
import functools
import time

def timed(func):
    @functools.wraps(func)   # preserves func.__name__/docstring — don't skip this
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.perf_counter() - start:.4f}s")
        return result
    return wrapper

@timed
def slow_query():
    time.sleep(1)
```

### Decorators with arguments

```python
def retry(times=3):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            last_exc = None
            for _ in range(times):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    last_exc = e
            raise last_exc
        return wrapper
    return decorator

@retry(times=5)
def flaky_call(): ...
```

### Built-in decorators worth knowing
`@staticmethod`, `@classmethod`, `@property`, `@functools.lru_cache`,
`@functools.cached_property`, `@dataclass`, `@contextmanager` (from
`contextlib`, turns a generator into a `with`-usable context manager).

---

## 6. Iterators & Generators

An **iterable** implements `__iter__`; an **iterator** implements
`__iter__` and `__next__` and maintains state between calls. Every iterator
is an iterable, not vice versa.

```python
class CountUp:
    def __init__(self, limit):
        self.limit = limit
        self.n = 0
    def __iter__(self):
        return self
    def __next__(self):
        if self.n >= self.limit:
            raise StopIteration
        self.n += 1
        return self.n
```

**Generators** — the easy way to write an iterator: any function with
`yield` becomes one, pausing/resuming state automatically.

```python
def fibonacci(limit):
    a, b = 0, 1
    while a < limit:
        yield a
        a, b = b, a + b

for n in fibonacci(100):
    print(n)
```

**Why it matters:** generators are lazy — `fibonacci(10_000_000)` uses
constant memory regardless of how many values it could produce, unlike
building a list upfront. This is the backbone of streaming/memory-efficient
data pipelines.

`yield from` delegates to a sub-generator; `send()`/`throw()` allow two-way
communication (basis of `asyncio` coroutines pre-`async`/`await` syntax).

### Chaining generators into a pipeline

Because each generator only pulls one item at a time from the one before it,
you can chain several stages together without ever materializing an
intermediate list — useful for log/ETL-style processing of arbitrarily large
inputs:

```python
def read_large_file(path):
    with open(path) as f:
        for line in f:
            yield line.strip()

def parse(lines):
    for line in lines:
        yield line.split(",")

def filter_errors(rows):
    for row in rows:
        if row[1] == "ERROR":
            yield row

pipeline = filter_errors(parse(read_large_file("access.log")))
for row in pipeline:
    handle(row)
```

### Gotcha: a generator is exhausted after one pass

```python
gen = (x * 2 for x in range(5))
total = sum(gen)
maximum = max(gen)   # 0 or ValueError — gen is already exhausted after sum() consumed it
```

Generators can't be restarted or rewound. If you need to iterate more than
once, either re-create the generator (call the generator function again) or
materialize it into a list a single time: `values = list(gen)`.

---

## 7. OOP in Python

```python
class Animal:
    species_count = 0                      # class attribute — shared across instances

    def __init__(self, name):
        self.name = name                    # instance attribute
        Animal.species_count += 1

    def speak(self):                        # instance method
        raise NotImplementedError

    @classmethod
    def from_dict(cls, data):               # alternate constructor
        return cls(data["name"])

    @staticmethod
    def is_valid_name(name):                # no access to self/cls — pure utility
        return bool(name.strip())

    @property
    def display_name(self):                 # computed attribute, accessed like a field
        return self.name.title()


class Dog(Animal):
    def speak(self):
        return f"{self.name} says Woof"
```

### `@property` with a setter — validation without breaking callers

`@property` isn't just for read-only computed values — pairing it with a
`.setter` lets you add validation to attribute *assignment* while callers
keep using plain `obj.attr = value` syntax, no API change required:

```python
class Temperature:
    def __init__(self, celsius: float):
        self._celsius = celsius

    @property
    def celsius(self) -> float:
        return self._celsius

    @celsius.setter
    def celsius(self, value: float) -> None:
        if value < -273.15:
            raise ValueError("below absolute zero")
        self._celsius = value

    @property
    def fahrenheit(self) -> float:          # read-only derived property, no setter
        return self._celsius * 9 / 5 + 32

t = Temperature(20)
t.celsius = -300     # raises ValueError — validated on assignment, transparently
```

This is also the idiomatic way to evolve a plain public attribute into a
validated one later without breaking every call site that did `obj.x = 5`.

**Dataclass vs. full class — when to reach for which:** `@dataclass` covers
the "holds data" case (see the `Order` example above); reach for a
hand-written class once you need custom validation logic beyond simple
defaults, inheritance with real behavior, or the object is more "does
things" than "holds things" — e.g. `Temperature` above needs a setter that
validates, which a bare `@dataclass` field can't express on its own.

### Method Resolution Order (MRO) & multiple inheritance

```python
class A:
    def greet(self): return "A"
class B(A):
    def greet(self): return "B"
class C(A):
    def greet(self): return "C"
class D(B, C):
    pass

D().greet()          # "B" — resolved via C3 linearization
D.__mro__             # (D, B, C, A, object)
```

Python uses **C3 linearization** to compute a consistent MRO — resolves the
"diamond problem" deterministically. `super()` follows this MRO chain, not
just the immediate parent — critical for cooperative multiple inheritance
(e.g., mixins).

### Dunder (magic) methods

| Method | Enables |
|---|---|
| `__init__`, `__new__` | Object construction |
| `__repr__`, `__str__` | `repr(obj)` (debug) vs `str(obj)` (display) |
| `__eq__`, `__hash__`, `__lt__` | `==`, use in sets/dicts, sorting |
| `__len__`, `__getitem__`, `__iter__` | `len(obj)`, `obj[i]`, `for x in obj` |
| `__enter__`, `__exit__` | `with obj:` context manager protocol |
| `__call__` | Make instances callable like functions |
| `__add__`, `__sub__`, etc. | Operator overloading |

### Abstract base classes / interfaces

```python
from abc import ABC, abstractmethod

class Shape(ABC):
    @abstractmethod
    def area(self): ...
```

Instantiating `Shape()` directly raises `TypeError`; subclasses must
implement `area()`. Python also supports **structural typing** via
`typing.Protocol` — duck typing with static-type-checker support, no
inheritance required.

---

## 8. Memory Model & Garbage Collection

- Everything is an object; variables are **references** (names bound to
  objects), not the objects themselves — assignment copies the reference,
  not the data (`b = a` means both names point to the same list).
- **Reference counting** is the primary GC mechanism — an object is freed the
  instant its refcount hits zero (deterministic, unlike Java/Go's tracing
  GCs).
- A supplementary **generational cyclic garbage collector** (`gc` module)
  handles reference cycles (e.g., two objects referencing each other) that
  refcounting alone can't free.
- `copy.copy()` (shallow — top-level copy, nested objects still shared) vs
  `copy.deepcopy()` (recursively copies everything) — a very common bug
  source with nested lists/dicts.

```python
import copy
original = {"items": [1, 2, 3]}
shallow = copy.copy(original)
shallow["items"].append(4)
original["items"]   # [1, 2, 3, 4]  <-- mutated! nested list was shared
```

---

## 9. Concurrency: the GIL, Threading, Multiprocessing, Asyncio

### The GIL (Global Interpreter Lock)

CPython's GIL allows only **one thread to execute Python bytecode at a
time**, even on a multi-core machine. This is the single most-asked Python
systems-design interview topic.

| Workload type | Best concurrency tool | Why |
|---|---|---|
| **I/O-bound** (network calls, disk, DB queries) | `threading` or `asyncio` | Threads release the GIL during I/O waits — real concurrency for I/O even with the GIL |
| **CPU-bound** (heavy computation) | `multiprocessing` | Separate processes = separate GILs = true parallelism across cores |
| **High-concurrency I/O** (thousands of connections) | `asyncio` | Single-threaded event loop avoids thread overhead/context-switch cost entirely |

> Note: Python 3.13 introduced an experimental **free-threaded build** (PEP
> 703, no-GIL) — not yet the default in most production deployments as of
> this writing, but the direction the language is heading.

### `threading`

```python
import threading

def worker(n):
    print(f"worker {n}")

threads = [threading.Thread(target=worker, args=(i,)) for i in range(5)]
for t in threads: t.start()
for t in threads: t.join()
```

Use `threading.Lock` to protect shared mutable state — GIL prevents
bytecode-level tearing but does **not** prevent logical race conditions
(e.g., non-atomic `counter += 1` across threads).

### `multiprocessing`

```python
from multiprocessing import Pool

def square(n):
    return n * n

with Pool(processes=4) as pool:
    results = pool.map(square, range(100))
```

Each process has its own interpreter and memory space (no GIL contention),
but data passed between processes must be **pickled** — adds serialization
overhead, and shared state requires explicit tools (`multiprocessing.Value`,
`Manager`).

### `asyncio`

```python
import asyncio

async def fetch(url):
    await asyncio.sleep(1)   # simulates non-blocking I/O
    return f"data from {url}"

async def main():
    results = await asyncio.gather(*[fetch(u) for u in urls])

asyncio.run(main())
```

Single-threaded cooperative multitasking — a coroutine yields control at
every `await`. Extremely efficient for thousands of concurrent I/O-bound
tasks (web servers, API clients), but a single CPU-heavy synchronous call
inside a coroutine blocks the *entire* event loop — offload it via
`loop.run_in_executor()` or `asyncio.to_thread()`.

---

## 10. Error Handling

```python
class InsufficientFundsError(Exception):
    """Raised when an account balance can't cover a withdrawal."""

def withdraw(balance, amount):
    if amount > balance:
        raise InsufficientFundsError(f"cannot withdraw {amount} from {balance}")
    return balance - amount

try:
    withdraw(100, 150)
except InsufficientFundsError as e:
    log.warning("withdrawal rejected: %s", e)
except (TypeError, ValueError) as e:
    log.error("bad input: %s", e)
else:
    print("succeeded")          # runs only if no exception
finally:
    close_connection()          # always runs — cleanup
```

- **Custom exceptions** should subclass `Exception` (never bare `except:` —
  it also catches `KeyboardInterrupt`/`SystemExit`).
- **`raise ... from e`** preserves the original traceback context when
  re-raising as a different exception type — critical for debuggability.
- **Context managers (`with`)** guarantee cleanup even on exception — prefer
  over manual `try/finally` for resource management (files, locks, DB
  connections).

### Custom exception hierarchies

A small, purposeful hierarchy lets callers catch as narrowly or as broadly
as they need — catch the specific subclass where you can act on it
differently, or the shared base where you can't:

```python
class ConfigError(Exception):
    """Base for all configuration problems."""

class MissingKeyError(ConfigError):
    def __init__(self, key: str):
        super().__init__(f"missing required config key: {key}")
        self.key = key

class InvalidValueError(ConfigError):
    pass

try:
    load_config()
except MissingKeyError as e:
    log.error("fix config: %s", e.key)
except ConfigError:
    log.error("config is broken in some other way")
```

```python
from contextlib import contextmanager

@contextmanager
def db_transaction(conn):
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
```

### Writing your own context manager as a class

`@contextmanager` is the fast path for simple cases; writing `__enter__`/
`__exit__` directly on a class is the explicit version of the same protocol
and is worth knowing since it's what `open()`, `threading.Lock()`, and DB
connections implement under the hood:

```python
class TempFile:
    def __enter__(self):
        self.path = "/tmp/scratch.txt"
        self.f = open(self.path, "w")
        return self.f

    def __exit__(self, exc_type, exc_val, exc_tb):
        self.f.close()
        return False   # False = don't suppress the exception, if any
```

`@contextmanager`'s generator form maps onto this directly: everything
before `yield` is `__enter__`, and everything after (wrapped in `finally`)
is `__exit__` — the `try`/`finally` is what guarantees cleanup runs even if
the `with` block raises. A common real-world use: guarding a lock so it's
always released, even on exception:

```python
from contextlib import contextmanager
import threading

@contextmanager
def acquired_lock(lock):
    lock.acquire()
    try:
        yield
    finally:
        lock.release()   # always released, even if the block raises

lock = threading.Lock()
with acquired_lock(lock):
    shared_state.update()
```

---

## 11. Typing (Modern Python)

Python remains dynamically typed at runtime, but **type hints** (checked by
external tools like `mypy`/`pyright`, not enforced by the interpreter) are
now standard for production code:

```python
from typing import Optional

def get_user(user_id: int) -> Optional[dict]:
    ...

def process(items: list[str], limit: int = 10) -> dict[str, int]:
    ...
```

`Optional[X]` is shorthand for `X | None`. Since 3.10, `X | None` is
preferred directly. `typing.Protocol` enables structural typing; `TypedDict`
types dict shapes; `Generic` for user-defined generic classes.

### `Protocol` — structural typing without inheritance

`Protocol` lets a type checker verify "quacks like a duck" interfaces —
anything with the right shape satisfies the type, with no explicit
inheritance or registration needed:

```python
from typing import Protocol

class SupportsClose(Protocol):
    def close(self) -> None: ...

def cleanup(resource: SupportsClose) -> None:
    resource.close()

# any object with a .close() method type-checks here — a file handle,
# a DB connection, a custom class — none of them need to inherit from
# SupportsClose or know it exists.
```

This is the static-typing equivalent of duck typing: unlike an ABC, which
requires the concrete class to explicitly subclass and implement it,
`Protocol` matches purely on the presence of the right methods/attributes.

Because hints are erased at runtime, they're a contract you and your
tooling agree to honor — `def f(x: int): return x` will happily accept a
string and blow up downstream if `mypy`/`pyright` never actually ran in CI.

---

## 12. Standard Library Highlights

| Module | Use for |
|---|---|
| `itertools` | `chain`, `groupby`, `product`, `combinations` — composable iterator building blocks |
| `functools` | `lru_cache`, `reduce`, `partial`, `wraps` |
| `pathlib` | Modern, object-oriented filesystem paths (`Path("data") / "file.csv"`) — prefer over `os.path` |
| `datetime` | Always store/compare in UTC; use `zoneinfo` (3.9+) for timezone-aware handling |
| `json` | Serialization; `dataclasses` + `json` is a common lightweight DTO pattern |
| `logging` | Structured, leveled logging — never use bare `print()` in production code |
| `re` | Regular expressions |
| `unittest.mock` | Patching dependencies in tests |

---

## 13. Testing with `pytest`

```python
import pytest

def test_withdraw_success():
    assert withdraw(100, 50) == 50

def test_withdraw_insufficient_funds():
    with pytest.raises(InsufficientFundsError):
        withdraw(100, 150)

@pytest.fixture
def db_connection():
    conn = create_test_db()
    yield conn
    conn.close()

@pytest.mark.parametrize("balance,amount,expected", [
    (100, 50, 50),
    (200, 200, 0),
])
def test_withdraw_parametrized(balance, amount, expected):
    assert withdraw(balance, amount) == expected
```

- **Fixtures** handle setup/teardown, injected by name (like Playwright's
  fixture model — same underlying idea of declarative dependency injection).
- **`unittest.mock.patch`** replaces real dependencies (API calls, DB
  clients) with test doubles.
- **Coverage** via `pytest-cov`; **property-based testing** via `hypothesis`
  for generating edge-case inputs automatically.

---

## 14. Packaging & Environments

- **Virtual environments** (`venv`, or faster tools like `uv`/`poetry`)
  isolate project dependencies from the system Python — always use one; never
  `pip install` into system Python for project work.
- **`pyproject.toml`** is the modern standard for project metadata and build
  config (replacing `setup.py`/`requirements.txt` sprawl), per PEP 621.
- **Lockfiles** (`poetry.lock`, `uv.lock`, `Pipfile.lock`) pin exact
  transitive dependency versions for reproducible installs — distinct from
  the version *ranges* declared in `pyproject.toml`.

```bash
python -m venv .venv
source .venv/bin/activate
pip install -e .            # editable install for local development
```

---

## 15. Performance Notes

- **Profile before optimizing** — `cProfile`, `line_profiler`, or `py-spy`
  (sampling profiler, safe for production). Guessing at hot paths wastes
  effort.
- **String concatenation in a loop** (`s += x`) is O(n²) — use
  `"".join(list_of_strings)` instead.
- **`lru_cache`** memoizes pure functions trivially:
  ```python
  from functools import lru_cache

  @lru_cache(maxsize=None)
  def fib(n):
      return n if n < 2 else fib(n-1) + fib(n-2)
  ```
- For genuinely hot numeric code, drop to **NumPy** (vectorized C loops) or
  consider **Cython**/**Rust extensions** rather than hand-optimizing pure
  Python.
- `__slots__` on classes with many instances reduces per-instance memory
  overhead by skipping the per-instance `__dict__`.

---

## 16. Python for Ops & Automation Scripting

Everything above is about writing correct Python *programs*. Ops/DevOps
automation is a different discipline layered on top: Python as **glue** that
shells out to system tools, calls HTTP APIs, drives cloud SDKs, and SSHes
into fleets of machines — usually unattended, on a schedule, with nobody
watching stdout. The mental shift: **every external call can fail, hang, or
partially succeed, and the script needs an explicit opinion about what
happens next.** Senior engineers think in terms of idempotency, explicit
timeouts on every I/O call, failing loud instead of silently, and the blast
radius of a script nobody is supervising.

### `subprocess` — running shell commands safely

The two things separating safe `subprocess` usage from a shell-injection
incident: **pass a list, not a string** (sidesteps `shell=True` entirely),
and **always set a timeout**.

```python
import subprocess

# SAFE — list form, no shell interpretation of arguments
result = subprocess.run(
    ["grep", "-r", user_supplied_pattern, "/var/log/app"],
    capture_output=True,
    text=True,
    timeout=30,
    check=False,  # inspecting returncode ourselves — grep's non-zero exits are meaningful
)
if result.returncode not in (0, 1):  # grep: 0=match, 1=no match, 2+=error
    raise RuntimeError(f"grep failed: {result.stderr}")

# DANGEROUS — string + shell=True with untrusted input is command injection.
# if user_supplied_pattern == "; rm -rf / #", this is a very bad day.
# subprocess.run(f"grep -r {user_supplied_pattern} /var/log/app", shell=True)
```

If `shell=True` is genuinely unavoidable (pipelines, globbing, shell
builtins), escape untrusted input with `shlex.quote()` rather than
interpolating it raw:

```python
import shlex
safe_arg = shlex.quote(user_supplied_pattern)
subprocess.run(f"grep -r {safe_arg} /var/log/app | wc -l", shell=True, timeout=30)
```

`check=True` raises `CalledProcessError` on non-zero exit — use it when
non-zero unambiguously means failure; use `check=False` with manual
`returncode` inspection for commands with meaningful non-zero exits (like
`grep`, `diff`, `test`).

### `pathlib` for filesystem scripting

`pathlib.Path` is the modern default over `os.path` string concatenation —
paths compose with `/`, are comparable and hashable, and glob natively:

```python
from pathlib import Path
import os

log_dir = Path(os.environ.get("LOG_DIR", "/var/log/app"))
log_dir.mkdir(parents=True, exist_ok=True)   # idempotent — no error if it already exists

for path in log_dir.rglob("*.log"):
    print(path.relative_to(log_dir), path.stat().st_size)

config_path = Path.home() / ".config" / "opstool" / "config.yaml"
if not config_path.exists():
    raise FileNotFoundError(f"missing config: {config_path}")
```

### `argparse` — building real CLI tools

An ops script that lives longer than a week should be a proper CLI with
subcommands, not `sys.argv[1]` positional parsing. `argparse` subparsers
give `--help`, per-command flags, and a dispatch table for free:

```python
import argparse

def cmd_status(args): ...
def cmd_deploy(args): ...

parser = argparse.ArgumentParser(prog="opstool")
parser.add_argument("-v", "--verbose", action="store_true")
sub = parser.add_subparsers(dest="command", required=True)

p_status = sub.add_parser("status", help="check a service's status")
p_status.add_argument("service")
p_status.set_defaults(func=cmd_status)

p_deploy = sub.add_parser("deploy", help="deploy a service")
p_deploy.add_argument("service")
p_deploy.add_argument("--env", choices=["staging", "prod"], default="staging")
p_deploy.add_argument("--dry-run", action="store_true")
p_deploy.set_defaults(func=cmd_deploy)

args = parser.parse_args()
args.func(args)   # dispatch to the matching subcommand handler
```

`opstool deploy myapp --env prod` and `opstool status myapp` both get
`--help`, type validation, and per-subcommand flags for free — the shape
any ops script with more than one mode of operation should take. See the
[capstone example](#capstone-end-to-end-fleet-health-checker-cli) below for
a full working CLI.

### `requests` — timeouts and retries

The single most common production bug in ops scripts using `requests`: **no
timeout**. `requests` has no default timeout — a call to a dead or slow
endpoint hangs the calling thread *forever*, not until some sane default
kicks in.

```python
import requests
from requests.adapters import HTTPAdapter
from urllib3.util.retry import Retry

def make_session(retries: int = 3, backoff_factor: float = 0.5) -> requests.Session:
    session = requests.Session()
    retry = Retry(
        total=retries,
        backoff_factor=backoff_factor,   # sleep = backoff_factor * (2 ** (retry_count - 1))
        status_forcelist=[429, 500, 502, 503, 504],
        allowed_methods=["GET", "PUT", "DELETE", "OPTIONS", "HEAD"],  # POST excluded — not idempotent
    )
    adapter = HTTPAdapter(max_retries=retry)
    session.mount("https://", adapter)
    session.mount("http://", adapter)
    return session

session = make_session()
resp = session.get("https://api.example.com/health", timeout=(3.05, 10))  # (connect, read)
resp.raise_for_status()
```

`timeout` as a tuple splits connect vs. read timeout — 3.05s connect (just
over a multiple of 3, the TCP retransmit window) is a commonly recommended
floor; the read timeout should match how long the endpoint can legitimately
take to respond.

### `boto3` — AWS automation

Two client shapes: **client** (low-level, 1:1 with the AWS API,
snake_case→CamelCase params) and **resource** (higher-level,
object-oriented, not available for every service and being phased out). Use
**client** for new automation — it's the one AWS keeps fully current.

```python
import boto3

session = boto3.Session(profile_name="prod", region_name="us-east-1")
ec2 = session.client("ec2")

# ALWAYS paginate — describe_instances silently truncates around ~1000 items otherwise
paginator = ec2.get_paginator("describe_instances")
for page in paginator.paginate(Filters=[{"Name": "instance-state-name", "Values": ["running"]}]):
    for reservation in page["Reservations"]:
        for instance in reservation["Instances"]:
            print(instance["InstanceId"])
```

For throttling-heavy loops, configure botocore's adaptive retry mode
instead of hand-rolling backoff around every call:

```python
from botocore.config import Config

config = Config(retries={"max_attempts": 10, "mode": "adaptive"})
ec2 = boto3.client("ec2", config=config)
```

### `paramiko` / `fabric` — SSH across a fleet

`paramiko` is the low-level SSH library; `fabric` wraps it with a nicer
connection/task API (`fabric.Connection(host).run(cmd)`). Both share one
non-negotiable rule: **never use `AutoAddPolicy`** outside a throwaway lab
script — it silently accepts any host key, defeating SSH's protection
against MITM. Use `RejectPolicy` (fail closed) with a maintained
`known_hosts`.

```python
import concurrent.futures
import paramiko

def run_on_host(host, command, user="ops", key_path="~/.ssh/id_ed25519", timeout=10):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.RejectPolicy())
    client.load_system_host_keys()
    try:
        client.connect(host, username=user, key_filename=key_path, timeout=timeout)
        _, stdout, stderr = client.exec_command(command, timeout=timeout)
        exit_code = stdout.channel.recv_exit_status()
        return host, exit_code, stdout.read().decode(), stderr.read().decode()
    finally:
        client.close()

def run_on_fleet(hosts, command, max_workers=10):
    results = {}
    with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
        futures = {executor.submit(run_on_host, h, command): h for h in hosts}
        for future in concurrent.futures.as_completed(futures):
            host = futures[future]
            try:
                results[host] = future.result()
            except Exception as e:
                results[host] = (host, -1, "", str(e))
    return results
```

`max_workers` caps concurrency deliberately — an unbounded
`ThreadPoolExecutor` against hundreds of hosts can exceed the target SSH
daemons' `MaxStartups`, producing connection refusals that look like a
fleet-wide outage but are actually self-inflicted. `fabric.Connection`
gives context-managed connections, `sudo()`, file transfer, and connection
pooling with less boilerplate once a script outgrows ad-hoc `paramiko`:

```python
from fabric import Connection

with Connection(host="web01.internal", user="ops") as c:
    result = c.run("systemctl status myapp", hide=True, warn=True)
    if not result.ok:
        c.sudo("systemctl restart myapp")
```

### Scheduling: cron vs. a Python-native scheduler, and idempotency

**cron** is still the right default for simple, independent, single-machine
jobs — it's already running, needs no extra process, and every ops engineer
can read a crontab. Use `flock` to prevent overlapping runs of a job that
might occasionally run long:

```cron
*/15 * * * * /usr/bin/flock -n /tmp/health_check.lock /usr/bin/python3 /opt/scripts/health_check.py >> /var/log/health_check.log 2>&1
```

A **Python-native scheduler** (APScheduler, or a long-running daemon with
its own loop) earns its keep when jobs need to share in-process state,
coordinate with each other, register/unregister dynamically, or run more
precisely than cron's 1-minute resolution:

```python
from apscheduler.schedulers.blocking import BlockingScheduler

sched = BlockingScheduler()

@sched.scheduled_job("interval", minutes=15)
def scheduled_health_check():
    run_health_check()

sched.start()
```

Whichever mechanism runs it, **the job itself must be idempotent** — safe
to run twice, safe to run concurrently by accident, safe to re-run after a
crash mid-execution. This is not optional for unattended automation: cron
overlap, a scheduler restart, a retry after a network blip, or a human
re-triggering a job manually will all eventually cause a double-run, and
"ran twice" must never mean "double-charged," "duplicate resource created,"
or "state corrupted." Practical techniques: check-before-create (`describe`
before `create`, treat `AlreadyExists` as success), use a lock/lease
(`flock`, a DynamoDB conditional write, a Redis `SETNX`), and make writes
naturally idempotent (`PUT` with a fixed key, not a `POST` that appends).

A long-running scheduler process should also handle `SIGTERM` cleanly
(finish or checkpoint the in-flight job) rather than being hard-killed by
the process manager:

```python
import signal

shutdown_requested = False

def handle_sigterm(signum, frame):
    global shutdown_requested
    shutdown_requested = True

signal.signal(signal.SIGTERM, handle_sigterm)
```

### `logging` vs. bare `print`

`print()` is fine for a script you run interactively and watch. It's wrong
for anything that runs unattended: no timestamps or severity levels, output
buffering behaves unpredictably under cron/non-tty redirection, no easy way
to route WARNING+ to alerting and DEBUG to a rotating file, and no built-in
rotation — a `print`-based long-running script fills the disk with one
giant, ever-growing file.

```python
import logging
import logging.handlers
import sys

def setup_logging(verbose: bool = False) -> logging.Logger:
    level = logging.DEBUG if verbose else logging.INFO
    logger = logging.getLogger("opstool")
    logger.setLevel(level)

    fmt = logging.Formatter("%(asctime)s %(levelname)-8s %(name)s: %(message)s")

    console = logging.StreamHandler(sys.stdout)
    console.setFormatter(fmt)
    logger.addHandler(console)

    file_handler = logging.handlers.RotatingFileHandler(
        "/var/log/opstool/opstool.log", maxBytes=10_000_000, backupCount=5
    )
    file_handler.setFormatter(fmt)
    logger.addHandler(file_handler)
    return logger
```

For anything shipped to a log aggregator (CloudWatch Logs, ELK, Loki),
structured (JSON) logging beats plain text — queryable fields instead of
regex-scraping messages:

```python
import logging
from pythonjsonlogger import jsonlogger

handler = logging.StreamHandler()
handler.setFormatter(jsonlogger.JsonFormatter("%(asctime)s %(levelname)s %(name)s %(message)s"))
logging.getLogger().addHandler(handler)

logging.info("health check complete", extra={"hosts_checked": 42, "failures": 2})
```

### Retry with backoff, and a circuit-breaker-lite

Two patterns show up constantly in automation and are worth having as
reusable code rather than reinventing per-script.

**Retry with exponential backoff and jitter** — for transient failures
(network blips, rate limits, eventual consistency):

```python
import functools, random, time

def retry_with_backoff(max_attempts=5, base_delay=1.0, max_delay=30.0, exceptions=(Exception,)):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            attempt = 0
            while True:
                attempt += 1
                try:
                    return func(*args, **kwargs)
                except exceptions as e:
                    if attempt >= max_attempts:
                        raise
                    delay = min(max_delay, base_delay * (2 ** (attempt - 1)))
                    delay += random.uniform(0, delay * 0.1)  # jitter — avoids thundering-herd retries
                    time.sleep(delay)
        return wrapper
    return decorator

@retry_with_backoff(max_attempts=4, exceptions=(requests.RequestException,))
def fetch_status(session, url):
    resp = session.get(url, timeout=(3.05, 10))
    resp.raise_for_status()
    return resp.json()
```

Jitter matters at scale: if 200 hosts all hit the same failing endpoint at
once and retry with pure `2^n` backoff, they retry in near-perfect sync
forever — jitter spreads retries out so the endpoint gets a chance to
recover.

**Circuit-breaker-lite** — retrying is right for transient blips; it's
wrong when a dependency is *hard down*, where hammering it with retries
just adds load and delays failure detection. A minimal breaker stops
calling after N consecutive failures and only tries again after a cooldown:

```python
import threading, time

class CircuitBreaker:
    def __init__(self, failure_threshold=5, reset_timeout=60.0):
        self.failure_threshold = failure_threshold
        self.reset_timeout = reset_timeout
        self._failures = 0
        self._opened_at = None
        self._lock = threading.Lock()

    def call(self, func, *args, **kwargs):
        with self._lock:
            if self._opened_at is not None:
                if time.monotonic() - self._opened_at < self.reset_timeout:
                    raise RuntimeError("circuit open — refusing call to protect downstream")
        try:
            result = func(*args, **kwargs)
        except Exception:
            with self._lock:
                self._failures += 1
                if self._failures >= self.failure_threshold:
                    self._opened_at = time.monotonic()
            raise
        else:
            with self._lock:
                self._failures = 0
                self._opened_at = None
            return result
```

### Capstone: end-to-end fleet health-checker CLI

A realistic ops tool that ties every pattern above together: reads a host
list, checks each host's SSH-level service state and its HTTP `/healthz`
endpoint concurrently, and exits non-zero with a report if anything's down
— the shape you'd wire into a monitoring cron job or a pre-deploy gate.

```python
#!/usr/bin/env python3
"""fleet_check.py — checks a list of servers' health via SSH + HTTP and reports failures."""
import argparse, concurrent.futures, json, logging, os, sys, time
from dataclasses import asdict, dataclass
from pathlib import Path

import paramiko
import requests

logger = logging.getLogger("fleet_check")


@dataclass
class HostResult:
    host: str
    ssh_ok: bool
    http_ok: bool
    ssh_error: str = ""
    http_error: str = ""
    latency_ms: float = 0.0


def check_ssh(host, user, key_path, command, timeout):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.RejectPolicy())
    client.load_system_host_keys()
    try:
        client.connect(host, username=user, key_filename=key_path, timeout=timeout)
        _, stdout, stderr = client.exec_command(command, timeout=timeout)
        exit_code = stdout.channel.recv_exit_status()
        if exit_code != 0:
            return False, f"exit {exit_code}: {stderr.read().decode().strip()}"
        return True, ""
    except Exception as e:
        return False, str(e)
    finally:
        client.close()


def check_http(url, timeout):
    start = time.monotonic()
    try:
        resp = requests.get(url, timeout=(3.05, timeout))
        elapsed_ms = (time.monotonic() - start) * 1000
        if resp.status_code >= 400:
            return False, f"HTTP {resp.status_code}", elapsed_ms
        return True, "", elapsed_ms
    except requests.RequestException as e:
        return False, str(e), (time.monotonic() - start) * 1000


def check_host(host, args):
    ssh_ok, ssh_err = check_ssh(host, args.ssh_user, args.ssh_key, "systemctl is-active myapp", args.ssh_timeout)
    http_ok, http_err, latency = check_http(f"http://{host}:{args.http_port}/healthz", args.http_timeout)
    return HostResult(host=host, ssh_ok=ssh_ok, http_ok=http_ok,
                       ssh_error=ssh_err, http_error=http_err, latency_ms=round(latency, 1))


def run_checks(hosts, args):
    results = []
    with concurrent.futures.ThreadPoolExecutor(max_workers=args.workers) as executor:
        futures = {executor.submit(check_host, h, args): h for h in hosts}
        for future in concurrent.futures.as_completed(futures):
            host = futures[future]
            try:
                results.append(future.result())
            except Exception as e:
                results.append(HostResult(host=host, ssh_ok=False, http_ok=False, ssh_error=str(e)))
    return results


def main(argv=None):
    p = argparse.ArgumentParser(description="Check fleet health via SSH + HTTP")
    p.add_argument("hosts_file", type=Path)
    p.add_argument("--ssh-user", default="ops")
    p.add_argument("--ssh-key", default=os.path.expanduser("~/.ssh/id_ed25519"))
    p.add_argument("--ssh-timeout", type=int, default=10)
    p.add_argument("--http-port", type=int, default=8080)
    p.add_argument("--http-timeout", type=float, default=5.0)
    p.add_argument("--workers", type=int, default=20)
    p.add_argument("--json", action="store_true")
    p.add_argument("-v", "--verbose", action="store_true")
    args = p.parse_args(argv)

    logging.basicConfig(level=logging.DEBUG if args.verbose else logging.INFO,
                         format="%(asctime)s %(levelname)-8s %(message)s")

    hosts = [line.strip() for line in args.hosts_file.read_text().splitlines()
             if line.strip() and not line.startswith("#")]
    if not hosts:
        logger.error("no hosts found in %s", args.hosts_file)
        return 2

    results = run_checks(hosts, args)
    failures = [r for r in results if not (r.ssh_ok and r.http_ok)]

    if args.json:
        print(json.dumps([asdict(r) for r in results], indent=2))
    else:
        for r in sorted(results, key=lambda r: r.host):
            status = "OK" if r.ssh_ok and r.http_ok else "FAIL"
            print(f"{r.host:<25} {status:<5} ssh={r.ssh_ok} http={r.http_ok} "
                  f"({r.latency_ms}ms) {r.ssh_error or r.http_error}")

    logger.info("checked %d hosts, %d failures", len(results), len(failures))
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
```

Run it as `fleet_check.py hosts.txt --json | jq '.[] | select(.ssh_ok==false)'`
for machine-readable output, or bare for a human-readable table. The
non-zero exit on any failure is what makes this composable into cron
alerting or a CI gate — the same script serves both an interactive operator
and an unattended pipeline.

### Automation pitfalls at a glance

| Pitfall | Why it bites |
|---|---|
| `subprocess.run(f"cmd {user_input}", shell=True)` | String interpolation into a shell command with untrusted input is command injection, full stop |
| `requests.get(url)` with no `timeout` | The most common cause of an ops script that "just hangs" in production with no error and no log line |
| `paramiko.AutoAddPolicy()` outside a lab script | Silently accepts any host key — defeats SSH's MITM protection |
| `print()` in a cron-scheduled script | No timestamps/levels, unreliable output ordering under redirection, no rotation — fills the disk over time |
| Paginated `boto3` call without a paginator | Response silently truncates around ~1000 items; script quietly processes an incomplete fleet |
| Bare `except: pass` in automation | Script exits 0 and looks green in monitoring while having done nothing |
| cron job without `flock` when it can run long | Overlapping runs double-execute non-idempotent logic |
| Retrying in a tight loop with no backoff/jitter | Turns a transient blip into a self-inflicted thundering herd against a struggling dependency |

---

## 17. Interview-Ready Q&A

**Q: What is the GIL and why does it exist?**
A: The Global Interpreter Lock ensures only one thread executes Python
bytecode at a time in CPython, simplifying memory management (reference
counting doesn't need to be thread-safe with fine-grained locks). It means
`threading` doesn't give CPU parallelism for CPU-bound work — use
`multiprocessing` for that — but threads still help I/O-bound work since the
GIL is released during blocking I/O calls.

**Q: Mutable default arguments — what's the bug and the fix?**
A: A mutable default (`def f(x=[])`) is evaluated once at function
definition time and shared across all calls that don't pass their own
argument, so mutations persist and leak between calls. Fix: default to
`None` and construct the mutable object inside the function body.

**Q: Difference between a list and a generator, and when to use each?**
A: A list is eagerly evaluated and fully materialized in memory; a generator
is lazily evaluated, producing one value at a time and using constant
memory. Use generators for large or unbounded/streaming data where you don't
need random access or to iterate more than once; use lists when you need
indexing, length, or multiple passes.

**Q: `is` vs `==`?**
A: `==` checks value equality (calls `__eq__`); `is` checks object identity
(same memory address). Use `is` only for singleton checks (`None`, `True`,
`False`); use `==` everywhere else. Relying on `is` for small int/string
caching behavior is undefined/implementation-specific — don't do it.

**Q: How does Python resolve method calls in multiple inheritance?**
A: Via the Method Resolution Order (MRO), computed with C3 linearization —
a deterministic left-to-right, depth-first order that also respects each
class's local order, resolving the diamond problem consistently.
`super()` walks this MRO chain, not just the direct parent, which is what
makes cooperative multiple inheritance (mixins) work correctly.

**Q: When would you choose `asyncio` over `threading` for I/O-bound work?**
A: When you need to handle very high concurrency (thousands of simultaneous
I/O operations, e.g., an API gateway) — asyncio's single-threaded event loop
avoids the memory and context-switching overhead of thousands of OS threads.
Threading is simpler to reason about for moderate concurrency or when
integrating with blocking libraries that have no async equivalent.

**Q: What's the difference between `@staticmethod`, `@classmethod`, and a
regular instance method?**
A: An instance method receives `self` (the instance) and can access/mutate
instance state. A `@classmethod` receives `cls` (the class) instead —
commonly used for alternate constructors that need to know the actual class
(important for subclassing). A `@staticmethod` receives neither — it's just
a regular function namespaced inside the class for organizational purposes.

**Q: Shallow copy vs deep copy — where does this bite people?**
A: `copy.copy()` duplicates only the top-level container; nested mutable
objects (lists inside a dict, etc.) are still shared references. Mutating a
nested object through the copy also mutates the original. `copy.deepcopy()`
recursively duplicates everything. The bug shows up most often with
default-value dicts/lists of dicts and cache/config objects passed "by copy"
that turn out not to be fully independent.

**Q: Why is `subprocess.run(cmd, shell=True)` dangerous with untrusted input,
and what should you do instead?**
A: With `shell=True`, the string is handed to a real shell, so any shell
metacharacters in the input (`; rm -rf /`, backticks, `|`, `&&`) are
interpreted, not treated as literal argument text — classic command
injection. The fix is to pass a list of argv tokens (`["grep", "-r",
pattern, path]`) so the OS execs the program directly with no shell parsing
involved at all. If `shell=True` is unavoidable (pipelines, globbing),
escape untrusted pieces with `shlex.quote()` before interpolating.

**Q: Why must every `requests` call set an explicit `timeout`?**
A: `requests` has no default timeout — a call with none can hang the calling
thread indefinitely if the remote host never responds (dead host, black-holed
route, hung server), turning a single flaky endpoint into a script that
"just hangs" forever with no error and no log line. An explicit timeout
(ideally a `(connect, read)` tuple) turns an infinite hang into a bounded,
handleable failure the retry/backoff logic can act on.

**Q: What does "idempotent" mean for an automation script, and why does it
matter?**
A: An operation is idempotent if running it once has the same end effect as
running it multiple times — safe to retry, safe to double-run. It matters
because unattended automation *will* eventually run twice: cron overlap, a
scheduler restart mid-job, a retried network call, or a human re-triggering
manually. Without idempotency, "ran twice" can mean a duplicate resource,
a double charge, or corrupted state. Practical techniques: check-before-create
(treat `AlreadyExists` as success), a lock/lease to prevent concurrent runs
(`flock`, a conditional write), and idempotent writes (`PUT` with a fixed
key rather than an appending `POST`).

---

## 18. One-Line Summary

**Python trades raw execution speed for expressiveness and a "batteries
included" ecosystem — write CPU-bound work in C/NumPy or use
multiprocessing, lean on asyncio/threading for I/O-bound concurrency, and
let the GIL, reference counting, and dynamic typing shape every performance
and concurrency decision you make.**
