---
title: "Python Cheat Sheet"
description: "Quick reference for Python — data structures, decorators, generators, OOP, concurrency, and typing."
sidebar_position: 5
tags: [python, sde, cheat-sheet]
hide_table_of_contents: true
---

# Python cheatsheet

A one-page reference for Python. For the deep-dives on the GIL, MRO, and
memory model, see the [complete guide](/docs/sde-skills/python/python-guide).

<a class="topic-crosslink" href="/docs/sde-skills/python/python-guide">📖 Full guide: Python →</a>

<div class="cheat-sheet cheat-sheet--sde">

<div class="cheat-card">

#### `is` vs `==`

```python
a == b   # value equality
a is b   # identity — same object in memory
x is None   # correct way to check for None
```

</div>

<div class="cheat-card">

#### Mutability gotcha

```python
def add(item, bucket=[]):   # DON'T — default arg evaluated once
    bucket.append(item)
    return bucket

def add(item, bucket=None):  # DO
    bucket = bucket or []
    bucket.append(item)
    return bucket
```

</div>

<div class="cheat-card">

#### Comprehensions

```python
squares = [x*x for x in range(10) if x % 2 == 0]
lookup = {k: v for k, v in pairs}
uniques = {x for x in items}
gen = (x*x for x in range(10))   # lazy — generator expression
```

</div>

<div class="cheat-card">

#### Collections module

```python
from collections import defaultdict, Counter, deque, namedtuple

d = defaultdict(list)
c = Counter(['a', 'b', 'a'])       # Counter({'a': 2, 'b': 1})
q = deque(maxlen=3)                # O(1) append/pop both ends
Point = namedtuple('Point', 'x y')
```

</div>

<div class="cheat-card">

#### Dataclasses

```python
from dataclasses import dataclass

@dataclass
class User:
    name: str
    age: int = 0

u = User("Abhishek")   # auto __init__, __repr__, __eq__
```

</div>

<div class="cheat-card">

#### `*args`, `**kwargs`

```python
def f(*args, **kwargs):
    print(args, kwargs)

f(1, 2, x=3)   # (1, 2) {'x': 3}
f(*[1, 2], **{'x': 3})   # unpacking at call site
```

</div>

<div class="cheat-card">

#### Decorators

```python
def timed(fn):
    @functools.wraps(fn)
    def wrapper(*a, **kw):
        start = time.time()
        result = fn(*a, **kw)
        print(time.time() - start)
        return result
    return wrapper

@timed
def slow(): ...
```

</div>

<div class="cheat-card">

#### Generators

```python
def counter(n):
    i = 0
    while i < n:
        yield i
        i += 1

g = counter(3)
next(g)   # 0
```

Lazy, evaluated one item at a time; exhausted after one full pass.

</div>

<div class="cheat-card">

#### OOP: `@property` & dunder

```python
class Circle:
    def __init__(self, r):
        self._r = r

    @property
    def area(self):
        return 3.14 * self._r ** 2

    def __repr__(self):
        return f"Circle(r={self._r})"
```

</div>

<div class="cheat-card">

#### Context managers

```python
with open('f.txt') as f:
    data = f.read()

class Timer:
    def __enter__(self): self.t0 = time.time(); return self
    def __exit__(self, *exc): print(time.time() - self.t0)
```

</div>

<div class="cheat-card">

#### Error handling

```python
try:
    risky()
except (ValueError, KeyError) as e:
    log.warning(e)
except Exception:
    raise
else:
    print("no exception")
finally:
    cleanup()
```

</div>

<div class="cheat-card">

#### Concurrency: which tool

| Workload | Use |
|---|---|
| CPU-bound | `multiprocessing` (GIL blocks threads) |
| I/O-bound, blocking libs | `threading` |
| I/O-bound, async-native | `asyncio` |

```python
async def main():
    async with aiohttp.ClientSession() as s:
        async with s.get(url) as r:
            return await r.json()
```

</div>

<div class="cheat-card">

#### Typing (modern)

```python
def greet(name: str) -> str: ...
x: list[int] = []
y: dict[str, int] = {}
def f(x: int | None = None): ...
```

</div>

</div>
