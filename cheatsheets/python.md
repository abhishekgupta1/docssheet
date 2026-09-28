---
title: "Python Cheat Sheet"
description: "A beginner-to-advanced reference for Python fundamentals and everyday programming."
sidebar_position: 5
level: beginner
tags: [python, sde, sre, sdet, qa, fundamentals, cheat-sheet]
hide_table_of_contents: true
image: /img/social/python.png
---

# Python cheatsheet

Learn Python step by step, from your first variable to running tasks side by
side. Each section has three parts:

- **In short** — the idea in one sentence.
- **Example** — code with a comment on every line saying what it produces.
- **Try it** — a tiny exercise to check you understood.

Want the longer story behind a topic? The [complete guide](/docs/sde-skills/python/python-guide)
walks through it in more depth.

<a class="topic-crosslink" href="/docs/sde-skills/python/python-guide">📖 Full guide: Python →</a>

<LevelBadge level="beginner" />

<nav class="cheat-jump-nav" aria-label="Python learning sections">
  <a class="button button--primary" href="/docs/role-guides">Role Guides</a>
  <a class="button button--primary" href="/docs/learning-path">Learning Path</a>
  <a class="button button--primary" href="/docs/fundamentals">Fundamentals</a>
</nav>

:::tip How to use this page

Go through **Part 1** in order — each section builds on the one before. Once
you're comfortable, move to **Part 2**. **Part 3** is for when you're writing
larger programs. Type the examples yourself instead of copying them; you'll
remember them far better.

:::

## Contents {#contents}

**[Part 1 — Beginner](#part-1)**:
[Variables & values](#basics) ·
[Text & numbers](#strings-numbers) ·
[Making decisions & loops](#control-flow) ·
[Collections](#collections) ·
[Functions](#functions) ·
[Handling errors](#exceptions) ·
[Reading & writing files](#files) ·
[Everyday one-liners](#one-liners)

**[Part 2 — Core](#part-2)**:
[Comprehensions](#comprehensions) ·
[Extra collection types](#collections-module) ·
[Classes](#classes) ·
[Special methods](#special-methods) ·
[Modules & imports](#imports) ·
[Virtual environments](#environments) ·
[Testing](#testing) ·
[Logging](#logging) ·
[Text patterns (regex)](#regex) ·
[Common mistakes](#gotchas)

**[Part 3 — Advanced](#part-3)**:
[Scope & closures](#scope) ·
[Decorators](#decorators) ·
[Generators & iterators](#generators) ·
[Type hints](#type-hints) ·
[Doing several things at once](#concurrency) ·
[Async basics](#async) ·
[Memory & speed](#performance)

## Part 1 — Beginner {#part-1}

<div class="cheat-sheet cheat-sheet--sde cheat-sheet--stack">

<div class="cheat-card">

#### 1. Variables & values {#basics}

**In short:** a variable is a name that holds a value. The value's *type* says
what kind of thing it is — text, a number, true/false, and so on.

```python
name = "Ada"        # str   — text, always in quotes
age = 30            # int   — whole number
price = 9.99        # float — decimal number
active = True       # bool  — True or False
missing = None      # None  — "no value yet"

print(name)         # shows: Ada
type(age)           # <class 'int'> — asks Python what type it is
```

Python groups code by **indentation** (four spaces), not `{ }` braces:

```python
if age >= 18:
    print("adult")  # indented, so it belongs to the if
print("done")       # not indented, so it always runs
```

**Comparing:** use `==` to ask "same value?" and `is None` to check for `None`.

**Try it:** make a variable `city` holding your city's name, then print
`"I live in "` followed by it.

</div>

<div class="cheat-card">

#### 2. Text & numbers {#strings-numbers}

**In short:** text (`str`) can be sliced and filled in; numbers (`int`,
`float`) work like a calculator.

```python
text = "Python"               # str
text[0]                       # "P"   — first character (counting starts at 0)
text[1:4]                     # "yth" — characters 1, 2, 3
len(text)                     # 6     — how many characters
text.upper()                  # "PYTHON"
f"Hello, {text}"              # "Hello, Python" — an f-string fills in values

7 + 2 * 3                     # 13  — multiplication happens first
7 / 2                         # 3.5 — normal division, always a float
7 // 2                        # 3   — division that drops the decimal part
7 % 2                         # 1   — the remainder
2 ** 3                        # 8   — 2 to the power of 3
```

**Try it:** with `name = "ada lovelace"`, print it with a capital first letter
on each word. (Hint: `.title()`.)

</div>

<div class="cheat-card">

#### 3. Making decisions & loops {#control-flow}

**In short:** `if` chooses what to run; `for` repeats something for each item;
`while` repeats until a condition stops being true.

```python
score = 85                    # int

if score >= 90:
    grade = "A"
elif score >= 80:             # "elif" means "else if"
    grade = "B"               # this one runs
else:
    grade = "C"

names = ["Ada", "skip", "Linus"]   # list of str
for name in names:
    if name == "skip":
        continue              # skip to the next name
    print(name)               # prints Ada, then Linus

for number in range(3):       # range(3) gives 0, 1, 2
    print(number)

count = 3
while count > 0:
    print(count)              # 3, 2, 1
    count -= 1                # same as count = count - 1
```

- `break` — leave the loop completely.
- `continue` — skip the rest of this round.
- `pass` — a placeholder that does nothing.

**Empty means false:** `0`, `""`, `None`, `[]`, `{}` all count as false in an
`if`. So `if names:` means "if the list isn't empty".

**Try it:** print the numbers 1 to 10, but print `"Fizz"` instead of any
number divisible by 3.

</div>

<div class="cheat-card">

#### 4. Collections {#collections}

**In short:** a collection holds many values in one variable. Python has four
built-in kinds, and their brackets tell them apart.

| Type | Looks like | Keeps order? | Can change? | Allows duplicates? | Use it for |
|---|---|---|---|---|---|
| `list` | `[1, 2, 2]` | Yes | Yes | Yes | A sequence of items |
| `tuple` | `(1, 2, 2)` | Yes | No | Yes | A fixed group, like (x, y) |
| `set` | `{1, 2}` | No | Yes | No | Unique items, fast "is it in?" |
| `dict` | `{"a": 1}` | Yes | Yes | Keys: no | Looking up a value by a name |

```python
# list — an ordered, changeable sequence
items = ["a", "b"]
items.append("c")                  # ["a", "b", "c"]
items[0]                           # "a"
len(items)                         # 3

# tuple — like a list, but fixed once created
point = (10, 20)
x, y = point                       # "unpacking": x = 10, y = 20

# set — unique values only, no order
unique = {"a", "b", "a"}           # {"a", "b"} — the duplicate is dropped
"a" in unique                      # True

# dict — pairs of key → value
user = {"name": "Ada", "age": 30}
user["name"]                       # "Ada"
user["age"] = 31                   # change a value
user.get("email", "unknown")       # "unknown" — safe if the key is missing
for key, value in user.items():
    print(key, value)              # name Ada / age 31
```

**Try it:** make a `dict` of three friends and their ages, then print only the
friends older than 25.

</div>

<div class="cheat-card">

#### 5. Functions {#functions}

**In short:** a function is a named, reusable block of code. You give it
inputs (arguments) and it can give back a result with `return`.

```python
def add(a, b=0):                  # b is optional, defaults to 0
    return a + b

add(2)                            # 2
add(2, 3)                         # 5
add(a=2, b=3)                     # 5 — arguments can be passed by name
```

**Type hints** are optional labels saying what goes in and out. They help
readers and editors, but Python doesn't enforce them:

```python
def greet(name: str) -> str:      # takes text, returns text
    return f"Hello, {name}"
```

**Taking any number of arguments:**

```python
def show(*args, **kwargs):
    print(args)      # tuple of the unnamed values
    print(kwargs)    # dict of the named values

show(1, 2, colour="blue")
# args   → (1, 2)               a tuple
# kwargs → {"colour": "blue"}   a dict
```

**Watch out:** never use a list or dict as a default value — Python reuses the
same one on every call. Use `None` and create it inside:

```python
def add_item(item, items=None):
    if items is None:
        items = []                # a fresh list each call
    items.append(item)
    return items
```

**Try it:** write `average(numbers)` that takes a list of numbers and returns
their average. (Hint: `sum()` and `len()`.)

</div>

<div class="cheat-card">

#### 6. Handling errors {#exceptions}

**In short:** when something goes wrong, Python *raises* an error. `try` /
`except` lets you catch it and respond instead of crashing.

```python
user_input = "abc"

try:
    number = int(user_input)          # fails: "abc" isn't a number
except ValueError:
    print("Please type a number")     # runs because it failed
else:
    print("Got", number)              # runs only if it worked
finally:
    print("Finished")                 # always runs
```

- Catch the specific error you expect (`ValueError`), not every error.
- Never write a bare `except:` — it hides real bugs.
- Raise your own error with `raise ValueError("age can't be negative")`.

**Try it:** ask for a number with `input()`, and keep asking until the user
types a valid one.

</div>

<div class="cheat-card">

#### 7. Reading & writing files {#files}

**In short:** open a file inside a `with` block — Python closes it for you
automatically when the block ends, even if an error happens.

```python
# write text to a file
with open("notes.txt", "w", encoding="utf-8") as file:
    file.write("Hello\nWorld\n")

# read it back
with open("notes.txt", encoding="utf-8") as file:
    for line in file:                 # one line (str) at a time
        print(line.strip())           # strip() removes the newline

# JSON: turn a dict into a file and back
import json
settings = {"theme": "dark"}                              # dict
with open("settings.json", "w", encoding="utf-8") as f:
    json.dump(settings, f)                                # dict → file
with open("settings.json", encoding="utf-8") as f:
    loaded = json.load(f)                                 # file → dict
```

`"w"` means write (replaces the file), `"a"` means append, and no mode means read.
Always pass `encoding="utf-8"` so files behave the same on every computer.

For CSV (spreadsheet-like) files, use `csv.DictReader` — it gives each row as
a `dict` keyed by column name.

**Try it:** write three names to a file, one per line, then read the file and
print how many names it has.

</div>

<div class="cheat-card">

#### 8. Everyday one-liners {#one-liners}

**In short:** small built-in tools you'll use constantly.

```python
data = {"a": 1}                 # dict
names = ["Ada", "Linus"]        # list of str
items = [3, 1, 2]               # list of int

"a" in data                     # True — does the key exist?
data.get("z", 0)                # 0 — lookup with a fallback
", ".join(names)                # "Ada, Linus" — list → one string
"Ada, Linus".split(", ")        # ["Ada", "Linus"] — string → list
sorted(items)                   # [1, 2, 3] — new sorted list
sorted(items, reverse=True)     # [3, 2, 1]
min(items), max(items), sum(items)   # (1, 3, 6)
items[::-1]                     # [2, 1, 3] — reversed copy
all([True, True, False])        # False — are ALL true?
any([True, False, False])       # True  — is ANY true?
for i, name in enumerate(names):
    print(i, name)              # 0 Ada / 1 Linus — index plus item
```

</div>

</div>

## Part 2 — Core {#part-2}

<div class="cheat-sheet cheat-sheet--sde cheat-sheet--stack">

<div class="cheat-card">

#### 9. Comprehensions {#comprehensions}

**In short:** a one-line way to build a new collection from an existing one.
The brackets decide which collection type you get.

```python
numbers = [1, 2, 3, 4]                      # list

doubled = [n * 2 for n in numbers]          # list: [2, 4, 6, 8]
evens   = [n for n in numbers if n % 2 == 0]   # list: [2, 4]
squares = {n: n * n for n in numbers}       # dict: {1: 1, 2: 4, 3: 9, 4: 16}
unique  = {n % 2 for n in numbers}          # set:  {0, 1}
```

Read it left to right as: "give me `n * 2` **for** each `n` **in** numbers
**if** it passes the test".

The same thing as a normal loop:

```python
doubled = []
for n in numbers:
    doubled.append(n * 2)
```

**Try it:** from `words = ["apple", "kiwi", "banana"]`, build a list of only
the words longer than 4 letters.

</div>

<div class="cheat-card">

#### 10. Extra collection types {#collections-module}

**In short:** the `collections` module has ready-made types for common chores
that would take several lines with a plain `list` or `dict`.

```python
from collections import Counter, defaultdict, deque

# Counter — a dict that counts things for you
counts = Counter("banana")         # Counter({'a': 3, 'n': 2, 'b': 1})
counts.most_common(1)              # [('a', 3)] — list of (item, count) tuples

# defaultdict — a dict that fills in a starting value for missing keys
groups = defaultdict(list)         # missing keys start as an empty list
groups["fruit"].append("apple")    # no error, even the first time
# {'fruit': ['apple']}

# deque ("deck") — a queue that's fast to add/remove at BOTH ends
queue = deque([1, 2, 3])
queue.appendleft(0)                # deque([0, 1, 2, 3])
queue.popleft()                    # 0 — removed from the front
```

| You need to… | Use |
|---|---|
| Count how often each item appears | `Counter` |
| Group items into lists by a key | `defaultdict(list)` |
| Add at one end and remove from the other | `deque` |

**Try it:** use `Counter` to find the most common word in a sentence.
(Hint: `sentence.split()`.)

</div>

<div class="cheat-card">

#### 11. Classes {#classes}

**In short:** a class is a blueprint for making objects that bundle data and
the functions (methods) that work on it.

```python
class Dog:
    def __init__(self, name):     # runs when you create a Dog
        self.name = name          # store data on the object

    def speak(self):              # a method — self is the object itself
        return f"{self.name} says woof"

rex = Dog("Rex")                  # create an object
rex.speak()                       # "Rex says woof"
```

A **dataclass** is a shortcut for classes that mainly hold data — Python
writes `__init__` and a readable printout for you:

```python
from dataclasses import dataclass, field

@dataclass
class User:
    name: str                                       # str field
    tags: list[str] = field(default_factory=list)   # new empty list per user

user = User("Ada")        # User(name='Ada', tags=[])
```

**Inheritance** — a class can build on another:

```python
class Puppy(Dog):                 # a Puppy is a kind of Dog
    def speak(self):
        return super().speak() + " (tiny)"   # super() calls Dog's version
```

Use inheritance only for a true "is a" relationship. If one thing just *has*
another (a `Car` has an `Engine`), store it as an attribute instead.

**Try it:** make a `BankAccount` class with `deposit(amount)` and
`withdraw(amount)` methods and a `balance`.

</div>

<div class="cheat-card">

#### 12. Special methods {#special-methods}

**In short:** methods named like `__len__` (double underscore on both sides,
nicknamed "dunder") let your objects work with Python's built-in features.

```python
class Team:
    def __init__(self, members):
        self.members = members        # list of str

    def __len__(self):                # makes len(team) work
        return len(self.members)

    def __iter__(self):               # makes "for m in team" work
        return iter(self.members)

team = Team(["Ada", "Linus"])
len(team)                             # 2
for member in team:
    print(member)                     # Ada, Linus
```

| You want this to work… | Add this method |
|---|---|
| `print(obj)` shows something useful | `__str__` |
| `len(obj)` | `__len__` |
| `for x in obj` | `__iter__` |
| `obj1 == obj2` | `__eq__` |
| `with obj:` | `__enter__` and `__exit__` |

</div>

<div class="cheat-card">

#### 13. Modules & imports {#imports}

**In short:** a module is just a `.py` file. `import` lets one file use code
from another.

```python
import math                           # use as math.sqrt(16)
from math import sqrt                 # use as sqrt(16)
from datetime import datetime as dt   # rename on import

if __name__ == "__main__":
    main()        # runs only when this file is run directly,
                  # not when another file imports it
```

Import the specific names you need. Avoid `from module import *` — it makes it
hard to tell where a name came from.

</div>

<div class="cheat-card">

#### 14. Virtual environments {#environments}

**In short:** a virtual environment is a private folder of installed libraries
for one project, so projects don't clash with each other.

```bash
python -m venv .venv                     # create one in a folder called .venv
source .venv/bin/activate                # turn it on (macOS/Linux)
python -m pip install requests           # install a library into it
python -m pip freeze > requirements.txt  # save the list of installed libraries
python -m pip install -r requirements.txt   # install that list on another machine
```

`pip` is Python's package installer. Writing `python -m pip` makes sure you
install into the same Python you're running.

</div>

<div class="cheat-card">

#### 15. Testing {#testing}

**In short:** a test is a small function that checks your code gives the right
answer. `pytest` finds and runs every function whose name starts with `test_`.

```python
# file: test_maths.py
import pytest

def square(n):
    if n < 0:
        raise ValueError("negative")
    return n * n

def test_square():
    assert square(3) == 9             # passes if this is True

def test_negative_fails():
    with pytest.raises(ValueError):   # passes only if ValueError is raised
        square(-1)

# run the same test with several inputs — a list of (input, expected) tuples
@pytest.mark.parametrize("value, expected", [(2, 4), (3, 9)])
def test_many(value, expected):
    assert square(value) == expected
```

Run all tests with `pytest` in the terminal.

- **Fixtures** — reusable setup shared across tests.
- **Mocking** (`unittest.mock.patch`) — swap a slow or external thing, like a
  web request, for a fake during a test.

**Try it:** write a test for the `average` function you made in section 5.

</div>

<div class="cheat-card">

#### 16. Logging {#logging}

**In short:** logging is like `print`, but with severity levels, and it can
send messages to files or monitoring tools.

```python
import logging

logging.basicConfig(level=logging.INFO)   # show INFO and above
logger = logging.getLogger(__name__)      # a logger named after this file

logger.info("Starting job")
logger.warning("Disk almost full")
logger.error("Failed: %s", "timeout")     # %s is replaced by "timeout"
```

Levels, least to most serious: `DEBUG` → `INFO` → `WARNING` → `ERROR` → `CRITICAL`.

</div>

<div class="cheat-card">

#### 17. Text patterns (regex) {#regex}

**In short:** a regular expression ("regex") describes a text pattern, like
"three digits, a dash, four digits", so you can find or check it.

```python
import re

re.fullmatch(r"\d{3}-\d{4}", "555-1234")   # a match → the text fits the pattern

text = "Mail ada@site.com or bob@web.org"
re.findall(r"\w+@\w+\.\w+", text)
# list of str: ["ada@site.com", "bob@web.org"]

re.sub(r"\d", "#", "Room 42")              # "Room ##" — replace every digit
```

| Symbol | Means |
|---|---|
| `\d` | a digit 0–9 |
| `\w` | a letter, digit, or `_` |
| `\s` | a space, tab, or newline |
| `+` | one or more of the previous thing |
| `{3}` | exactly 3 of the previous thing |
| `^` / `$` | start / end of the text |

Put an `r` before the quotes (`r"..."`) so backslashes are kept as-is.

</div>

<div class="cheat-card">

#### 18. Common mistakes {#gotchas}

**Copying a list that contains lists:**

```python
import copy

original = [[1, 2]]                    # list containing a list
shallow = original.copy()              # new outer list, SAME inner list
deep = copy.deepcopy(original)         # new outer AND inner lists

original[0].append(3)
shallow                                # [[1, 2, 3]] — changed too!
deep                                   # [[1, 2]]    — untouched
```

**Two names, one list:**

```python
a = [1, 2]
b = a              # b is NOT a copy — both names point to the same list
b.append(3)
a                  # [1, 2, 3]
```

**What can be a dict key or set item?** Only values that can't change:
`str`, `int`, `tuple` ✅ — not `list`, `dict`, or `set` ❌.

- Use `is None` to check for `None`, and `==` to compare values.
- Strings can't be changed in place — `.upper()` returns a *new* string.
- A `set` has no order; don't rely on the order you see when printing it.

</div>

</div>

## Part 3 — Advanced {#part-3}

<div class="cheat-sheet cheat-sheet--sde cheat-sheet--stack">

<div class="cheat-card">

#### 19. Scope & closures {#scope}

**In short:** *scope* is where a variable can be seen. A *closure* is an inner
function that remembers variables from the function around it.

Python looks for a name in this order, stopping at the first match:

1. **Local** — inside the current function
2. **Enclosing** — inside an outer function wrapping it
3. **Global** — at the top level of the file
4. **Built-in** — Python's own names like `len` and `print`

```python
def make_counter():
    count = 0                   # int, lives in the outer function

    def next_value():
        nonlocal count          # "use the outer count, don't make a new one"
        count += 1
        return count

    return next_value           # hand back the inner function

counter = make_counter()
counter()                       # 1
counter()                       # 2 — it remembered count
```

</div>

<div class="cheat-card">

#### 20. Decorators {#decorators}

**In short:** a decorator wraps a function to add extra behaviour (like
logging or timing) without changing the function's own code. `@name` applies it.

```python
import functools

def announce(function):
    @functools.wraps(function)        # keeps the original function's name
    def wrapper(*args, **kwargs):
        print("starting")
        return function(*args, **kwargs)
    return wrapper

@announce                             # same as: work = announce(work)
def work():
    print("working")

work()      # prints "starting", then "working"
```

You've already seen decorators in this page: `@dataclass` and
`@pytest.mark.parametrize`.

</div>

<div class="cheat-card">

#### 21. Generators & iterators {#generators}

**In short:** a generator hands out values one at a time using `yield`,
instead of building the whole list in memory first.

```python
def count_up(limit):
    for number in range(1, limit + 1):
        yield number              # pause here and give back one number

for number in count_up(3):
    print(number)                 # 1, 2, 3

lazy = (n * 2 for n in range(1_000_000))   # ( ) → generator, not a list
```

An **iterator** gives the next item each time you ask — a `for` loop does
this for you behind the scenes:

```python
letters = iter(["a", "b"])      # iterator over a list
next(letters)                   # "a"
next(letters)                   # "b"
next(letters)                   # error: StopIteration — nothing left
```

A generator can be looped over only **once**; a list can be looped over many times.

</div>

<div class="cheat-card">

#### 22. Type hints {#type-hints}

**In short:** type hints describe what types your code expects. Tools such as
**mypy** or **pyright** read them and flag mistakes before you run anything.

```python
def total(values: list[int | float]) -> float:   # list of ints or floats
    return sum(values)

def find_email(user_id: int) -> str | None:      # text, or None if not found
    ...

ages: dict[str, int] = {"Ada": 36}               # dict of str → int
```

**"Any object with a `name`"** — describe a shape with `Protocol`:

```python
from typing import Protocol

class HasName(Protocol):
    name: str

def label(thing: HasName) -> str:
    return thing.name           # works for any object that has .name
```

</div>

<div class="cheat-card">

#### 23. Doing several things at once {#concurrency}

**In short:** pick the tool based on **what is making your program slow**.

| Your program is slow because it is… | Use | Why |
|---|---|---|
| Doing heavy calculations (maths, image processing) | `multiprocessing` | Uses several CPU cores at once |
| Waiting on files, databases, or web requests | `threading` | Other threads work while one waits |
| Waiting on many network calls, using async libraries | `asyncio` | One thread juggles many waiting tasks |

**Why not threads for heavy maths?** Standard Python lets only one thread run
Python code at any moment (a rule called the GIL, "global interpreter lock").
Threads still help while *waiting*, because waiting doesn't need the lock.
Separate processes each have their own, so they truly run in parallel.

```python
from concurrent.futures import ThreadPoolExecutor

urls = ["https://a.com", "https://b.com"]              # list of str
with ThreadPoolExecutor() as pool:
    pages = list(pool.map(download, urls))             # download both at once
```

</div>

<div class="cheat-card">

#### 24. Async basics {#async}

**In short:** `async` code lets one program wait on many slow things (like
web requests) at the same time, without extra threads.

```python
import asyncio

async def fetch():                # "async def" makes a pausable function
    await asyncio.sleep(1)        # pause here; other tasks run meanwhile
    return "done"

async def main():
    results = await asyncio.gather(fetch(), fetch())   # run both together
    print(results)                # ["done", "done"] — after ~1s, not 2s

asyncio.run(main())               # start the async program
```

Don't call ordinary slow functions (like `time.sleep` or `requests.get`)
inside async code — they freeze everything. Use async versions instead
(`asyncio.sleep`, `httpx.AsyncClient`).

</div>

<div class="cheat-card">

#### 25. Memory & speed {#performance}

**In short:** write clear code first, then measure, then speed up only the
slow part.

```python
import sys

numbers = [n for n in range(1_000_000)]   # list — all million stored now
lazy    = (n for n in range(1_000_000))   # generator — makes each on demand

sys.getsizeof(numbers)    # ~8,000,000 bytes
sys.getsizeof(lazy)       # ~200 bytes

import timeit
timeit.timeit("sum(range(100))", number=100_000)   # seconds taken
```

- Checking "is X in here?" many times → use a `set` or `dict`, not a `list`.
- Going through data once → use a generator.
- Adding/removing at the front → use `deque`.
- Finding the slow part of a whole program → run `python -m cProfile script.py`.

For role-specific examples and longer explanations, see the [complete guide](/docs/sde-skills/python/python-guide).

</div>

</div>
