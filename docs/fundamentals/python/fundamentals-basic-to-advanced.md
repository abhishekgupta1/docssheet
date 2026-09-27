---
title: "Python Fundamentals: Basic to Advanced"
description: "Python's core ideas in plain words, level by level \u2014 from values and collections to classes, modules, advanced constructs, testing, and a glossary."
sidebar_position: 1
level: beginner
tags: [python, fundamentals]
image: /img/mental-model-share.png
---

# Python Fundamentals
## From Basic to Advanced

This page explains the main ideas of Python in simple words.
Each topic has three parts:

- **Definition** – what the idea means.
- **Why it is useful** – when you will need it.
- **Example** – a small piece of code you can run.

Each level ends with a **Try it** exercise. Do it before moving on — typing
code yourself is the fastest way to learn it.

:::tip How to use this page

The page goes step by step. Start at Level 1; each level uses ideas from the
levels before it. Want a shorter version first? Read the
[Python cheat sheet](/cheatsheets/python), then come back here for detail.

:::

After this page, read the role guides:
- [Python for SDET](/docs/role-guides/sdet/python-for-sdet)
- [Python for SDE](/docs/role-guides/sde/python-for-sde)
- [Python for SRE](/docs/role-guides/sre/python-for-sre)
- [Coding Best Practices](/docs/fundamentals/python/coding-best-practices)

---

## Contents

| Level | Topic |
|-------|-------|
| 1 | [Basic Building Blocks](#level-1-basic-building-blocks) |
| 2 | [Collections (Groups of Data)](#level-2-collections-groups-of-data) |
| 3 | [Making Decisions and Repeating Work](#level-3-making-decisions-and-repeating-work) |
| 4 | [Functions](#level-4-functions) |
| 5 | [Errors and Exceptions](#level-5-errors-and-exceptions) |
| 6 | [Classes and Objects](#level-6-classes-and-objects) |
| 7 | [Modules, Packages and Environments](#level-7-modules-packages-and-environments) |
| 8 | [Working with Files and Data](#level-8-working-with-files-and-data) |
| 9 | [Advanced Ideas](#level-9-advanced-ideas) |
| 10 | [Testing, Logging and Speed](#level-10-testing-logging-and-speed) |
| – | [Word List (Glossary)](#word-list-glossary) |

---

## Level 1: Basic Building Blocks

### Program
**Definition:** A program is a list of instructions. The computer reads the instructions from top to bottom and does them one by one.

**Why it is useful:** Every script, test, or tool you write is a program.

```python
print("Hello, World!")   # Shows: Hello, World!
```

### Variable
**Definition:** A variable is a name that stores a value. Think of it as a labelled box. The label is the name. The thing inside the box is the value.

**Why it is useful:** You can save a value once and use it many times.

```python
name = "Asha"
age = 25
print(name)   # Shows: Asha
```

You must give a value when you create a variable.

### Data Type
**Definition:** A data type tells Python what kind of value something is. For example: a number, a piece of text, or true/false.

**Why it is useful:** The type decides what you can do with the value. You can add two numbers. You can make text upper case.

| Type | What it holds | Example |
|------|---------------|---------|
| `int` | Whole number | `10` |
| `float` | Number with a decimal point | `3.14` |
| `str` | Text (called a "string") | `"hello"` |
| `bool` | True or False | `True` |
| `None` | "No value" | `None` |
| `list` | Ordered group of items | `[1, 2, 3]` |
| `tuple` | Ordered group that cannot change | `(1, 2)` |
| `set` | Group of unique items | `{1, 2}` |
| `dict` | Pairs of key and value | `{"a": 1}` |

```python
type(10)       # <class 'int'>
type("hi")     # <class 'str'>
```

### Numbers and Maths (Operators)
**Definition:** An operator is a symbol that does an action on values, such as `+` for add.

```python
10 + 3    # 13   add
10 - 3    # 7    subtract
10 * 3    # 30   multiply
10 / 3    # 3.333...  divide (answer is always a float)
10 // 3   # 3    divide and keep only the whole part
10 % 3    # 1    remainder
2 ** 3    # 8    power (2 x 2 x 2)
```

Short forms:
```python
count = 0
count += 1    # same as: count = count + 1
```

### Comparison Operators
**Definition:** These compare two values. The answer is always `True` or `False`.

```python
5 == 5    # True   equal
5 != 3    # True   not equal
5 > 3     # True   greater than
5 <= 3    # False  less than or equal
```

### Logical Operators
**Definition:** `and`, `or`, `not` join or flip True/False values.

```python
age = 20
has_id = True
age >= 18 and has_id   # True: both are true
age < 18 or has_id     # True: at least one is true
not has_id             # False: flips the value
```

### String (Text)
**Definition:** A string is text. You write it inside quotes: `"..."` or `'...'`.

**Why it is useful:** Names, messages, log lines, URLs, and file content are all strings.

```python
greeting = "Hello"
greeting.upper()          # "HELLO"
greeting.lower()          # "hello"
len(greeting)             # 5  (number of characters)
greeting[0]               # "H"  (first character; counting starts at 0)
greeting[-1]              # "o"  (last character)
greeting[1:4]             # "ell"  (a slice: from position 1 up to 4, not including 4)
"  space  ".strip()       # "space"  (removes spaces at both ends)
"a,b,c".split(",")        # ["a", "b", "c"]
"-".join(["a", "b"])      # "a-b"
"cat" in "concatenate"    # True
```

### f-string (Formatted String)
**Definition:** An f-string lets you put values inside text. Write `f` before the quote and put the value inside `{ }`.

```python
name = "Ravi"
score = 92.456
print(f"{name} scored {score:.1f}")   # Ravi scored 92.5
```

### Boolean and "Truthy" Values
**Definition:** A boolean is `True` or `False`. Python also treats some values as false: `0`, `""` (empty text), `[]` (empty list), `{}` (empty dict), and `None`. Everything else is treated as true.

```python
items = []
if not items:
    print("The list is empty")
```

### None
**Definition:** `None` means "no value" or "nothing yet".

```python
result = None
if result is None:
    print("No result yet")
```

Use `is None` to check for `None`.

### Type Conversion (Casting)
**Definition:** Changing a value from one type to another.

```python
int("42")      # 42
float("3.5")   # 3.5
str(100)       # "100"
int(7.9)       # 7  (the decimal part is removed)
```

### Input and Output
**Definition:** Output means showing something to the user. Input means reading what the user types.

```python
name = input("Your name: ")   # input always gives a string
print("Hi", name)
```

### Comment
**Definition:** A comment is a note for people. Python ignores it. It starts with `#`.

```python
# This line explains the next line
total = 5 + 5
```

### Type Hints
**Definition:** A type hint is a label that says what type a value should be. Python does not force it, but tools and editors use it to find mistakes early.

```python
def greet(name: str, age: int) -> str:
    return f"{name} is {age}"
```

**Try it:** ask for the user's name and birth year with `input()`, convert the year with `int()`, and print `"<name> is about <age> years old"` using an f-string.

---

## Level 2: Collections (Groups of Data)

A collection holds many values in one variable.

### List
**Definition:** A list is an ordered group of items. You can add, remove, and change items.

**Why it is useful:** Use a list when order matters, for example a list of test names or a list of servers.

```python
servers = ["web1", "web2"]
servers.append("web3")      # add to the end
servers.insert(0, "web0")   # add at position 0
servers.remove("web2")      # remove by value
last = servers.pop()        # remove and return the last item
servers[0]                  # first item
len(servers)                # number of items
servers.sort()              # sort in place
sorted(servers)             # return a new sorted list
```

### Tuple
**Definition:** A tuple is like a list, but you cannot change it after you create it.

**Why it is useful:** Use a tuple for fixed data, such as a (host, port) pair.

```python
address = ("localhost", 8080)
host, port = address        # "unpacking": take the parts out
single = (5,)               # a tuple with one item needs a comma
```

### Set
**Definition:** A set is a group of unique items. It has no order. It removes duplicates for you.

**Why it is useful:** Checking "is this item in the group?" is very fast in a set.

```python
tags = {"smoke", "login", "smoke"}   # {"smoke", "login"}
"login" in tags                      # True

a = {1, 2, 3}
b = {2, 3, 4}
a | b     # {1, 2, 3, 4}  union: items in either
a & b     # {2, 3}        intersection: items in both
a - b     # {1}           difference: items only in a
empty = set()             # {} makes an empty dict, not a set
```

### Dictionary (dict)
**Definition:** A dictionary stores pairs. Each pair has a **key** and a **value**. You use the key to find the value, like a word and its meaning in a real dictionary.

**Why it is useful:** Settings, JSON data, API responses, and counts are usually stored as dictionaries.

```python
user = {"id": 1, "name": "Meena"}
user["name"]                   # "Meena"
user["email"] = "m@x.com"      # add or change a value
user.get("phone", "unknown")   # safe read: gives "unknown" if the key is missing
"id" in user                   # True
user.keys()                    # all keys
user.values()                  # all values
user.items()                   # all (key, value) pairs
merged = {**user, "active": True}   # join two dicts into a new one
```

### Which Collection Should I Use?

| Need | Use |
|------|-----|
| Items in order, can change | `list` |
| Items in order, fixed | `tuple` |
| Only unique items, fast "is it there?" check | `set` |
| Look up a value by a name or ID | `dict` |

### Comprehension
**Definition:** A comprehension is a short way to build a new list, set, or dict from another group of items, in one line.

**Why it is useful:** It is shorter and often faster than a loop that adds items one by one.

```python
numbers = [1, 2, 3, 4, 5]

squares = [n * n for n in numbers]                # [1, 4, 9, 16, 25]
evens = [n for n in numbers if n % 2 == 0]        # [2, 4]
by_id = {u["id"]: u for u in [{"id": 1}, {"id": 2}]}   # dict
unique_lengths = {len(w) for w in ["a", "bb", "cc"]}   # set: {1, 2}
```

Pattern: `[what_to_keep for item in group if condition]`

### Helpful Collection Tools (from the `collections` module)

**Counter** – counts how many times each item appears.
```python
from collections import Counter
Counter(["pass", "fail", "pass"])   # Counter({'pass': 2, 'fail': 1})
```

**defaultdict** – a dict that creates a starting value for a new key.
```python
from collections import defaultdict
groups = defaultdict(list)
groups["failed"].append("test_login")   # no error, even though "failed" is new
```

**deque** – a list that is fast to add to or remove from both ends. Good for queues.
```python
from collections import deque
queue = deque([1, 2, 3])
queue.append(4)       # add to the right
queue.popleft()       # remove from the left -> 1
last_100 = deque(maxlen=100)   # keeps only the newest 100 items
```

**Try it:** given `words = ["apple", "kiwi", "apple", "fig", "kiwi", "apple"]`, find (1) the unique words as a `set`, (2) how often each appears with `Counter`, and (3) a `dict` of word → length using a comprehension.

---

## Level 3: Making Decisions and Repeating Work

### Condition (if / elif / else)
**Definition:** A condition lets the program choose what to do. Python checks each test from top to bottom and runs the first block that is true.

```python
status = 404
if status == 200:
    print("OK")
elif status == 404:
    print("Not found")
else:
    print("Other")
```

Short form (one line):
```python
label = "pass" if score >= 50 else "fail"
```

### Indentation
**Definition:** Indentation means spaces at the start of a line. Python uses indentation (usually 4 spaces) to show which lines belong to a block, such as the inside of an `if` or a loop.

### match (Pattern Matching)
**Definition:** `match` compares one value against many possible cases. It is a clean way to replace a long `if / elif` chain. (Python 3.10 and newer.)

```python
match status:
    case 200:
        print("OK")
    case 404 | 410:
        print("Gone")
    case _:
        print("Something else")   # _ means "anything else"
```

### Early Return (Guard Clause)
**Definition:** Check for bad input first and leave the function early. The main work then comes last, without deep nesting.

```python
def get_profile(user):
    if user is None:
        return None
    if not user.is_active:
        return None
    return user.profile
```

### Loop
**Definition:** A loop repeats a block of code.

**for loop** – goes through each item in a group:
```python
for server in ["web1", "web2"]:
    print("Checking", server)
```

**while loop** – repeats while a condition is true:
```python
attempts = 0
while attempts < 3:
    attempts += 1
```

### range
**Definition:** `range` gives a series of numbers.

```python
range(5)          # 0, 1, 2, 3, 4
range(2, 6)       # 2, 3, 4, 5
range(0, 10, 2)   # 0, 2, 4, 6, 8
```

### break and continue
- `break` – stop the loop now.
- `continue` – skip the rest of this round and go to the next round.

```python
for n in range(10):
    if n == 3:
        continue     # skip 3
    if n == 6:
        break        # stop at 6
    print(n)         # 0 1 2 4 5
```

### enumerate and zip
- `enumerate` gives the position number and the item.
- `zip` walks through two groups side by side.

```python
for i, name in enumerate(["a", "b"]):
    print(i, name)          # 0 a, then 1 b

for name, score in zip(["a", "b"], [90, 80]):
    print(name, score)      # a 90, then b 80
```

### Looping over a Dictionary
```python
config = {"host": "localhost", "port": 8080}
for key, value in config.items():
    print(key, "=", value)
```

**Try it:** loop over `range(1, 21)` and print `"Fizz"` for multiples of 3, `"Buzz"` for multiples of 5, `"FizzBuzz"` for both, and the number otherwise.

---

## Level 4: Functions

### Function
**Definition:** A function is a named block of code that does one job. You write it once and "call" (run) it many times.

**Why it is useful:** It stops you from repeating code. It also makes code easier to test.

```python
def add(a, b):
    return a + b

add(2, 3)   # 5
```

### Parameter and Argument
**Definition:** A **parameter** is the name in the function definition (`a`, `b`). An **argument** is the real value you pass in when you call it (`2`, `3`).

### Return Value
**Definition:** `return` sends a result back to the caller. A function without `return` gives back `None`.

A function can return many values as a tuple:
```python
def min_max(numbers):
    return min(numbers), max(numbers)

low, high = min_max([4, 1, 9])   # low = 1, high = 9
```

### Default Value
**Definition:** A parameter can have a starting value. If the caller does not pass it, the default is used.

```python
def connect(host, port=8080):
    return f"{host}:{port}"

connect("localhost")         # "localhost:8080"
connect("localhost", 9000)   # "localhost:9000"
```

For a list or dict default, use `None` and create the list inside the function:
```python
def add_item(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items
```

### Keyword Argument
**Definition:** You pass a value by its parameter name. The order then does not matter.

```python
connect(port=9000, host="localhost")
```

### *args and **kwargs
**Definition:**
- `*args` collects any number of extra position values into a tuple.
- `**kwargs` collects any number of extra named values into a dict.

```python
def log(*args, **kwargs):
    print(args)     # (1, 2)
    print(kwargs)   # {'level': 'INFO'}

log(1, 2, level="INFO")
```

### Scope
**Definition:** Scope is the area of code where a variable can be seen. A variable made inside a function is "local". Code outside the function cannot see it.

```python
def f():
    x = 10       # local to f
    return x
# print(x)  here would fail: x does not exist outside f
```

### Lambda (Small Nameless Function)
**Definition:** A lambda is a one-line function without a name. Use it for very small jobs, often for sorting.

```python
users = [{"name": "A", "age": 30}, {"name": "B", "age": 20}]
sorted(users, key=lambda u: u["age"])   # sorts by age
```

### Closure
**Definition:** A closure is a function made inside another function. The inner function remembers the variables of the outer function, even after the outer function has finished.

**Why it is useful:** It keeps small pieces of state without making a class. For example, a counter or a rate limiter.

```python
def make_counter():
    count = 0
    def increase():
        nonlocal count      # use the outer variable
        count += 1
        return count
    return increase

counter = make_counter()
counter()   # 1
counter()   # 2
```

### Decorator
**Definition:** A decorator is a function that wraps another function to add extra behaviour, without changing the original code. You apply it with `@name` above a function.

**Why it is useful:** Add timing, logging, retry, or permission checks to many functions in one place.

```python
import functools
import time

def timer(func):
    @functools.wraps(func)            # keeps the original name and docs
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"{func.__name__} took {time.time() - start:.3f}s")
        return result
    return wrapper

@timer
def slow_add(a, b):
    time.sleep(0.1)
    return a + b
```

A decorator that takes its own settings:
```python
def retry(times=3):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(1, times + 1):
                try:
                    return func(*args, **kwargs)
                except Exception:
                    if attempt == times:
                        raise
        return wrapper
    return decorator

@retry(times=3)
def call_api():
    ...
```

### Higher-Order Function
**Definition:** A function that takes another function as input, or gives back a function. `sorted(..., key=...)`, `map`, `filter`, and decorators are examples.

```python
list(map(str.upper, ["a", "b"]))              # ["A", "B"]
list(filter(lambda n: n > 2, [1, 2, 3, 4]))   # [3, 4]
```

**Try it:** write `average(*numbers)` that accepts any number of values and returns their average, returning `0` when called with none. Then wrap it with the `@timer` decorator above.

---

## Level 5: Errors and Exceptions

### Exception
**Definition:** An exception is an error that happens while the program runs. For example, dividing by zero or opening a file that does not exist. If you do not handle it, the program stops.

Common exceptions:

| Exception | When it happens |
|-----------|-----------------|
| `ValueError` | The value has the right type but a wrong value, e.g. `int("abc")` |
| `TypeError` | The value has the wrong type, e.g. `"a" + 1` |
| `KeyError` | A key is not in the dictionary |
| `IndexError` | A list position does not exist |
| `FileNotFoundError` | The file does not exist |
| `ZeroDivisionError` | Division by zero |
| `TimeoutError` | An action took too long |
| `ConnectionError` | A network connection failed |

### try / except / else / finally
**Definition:** This is how you catch and handle an exception.

- `try` – code that may fail.
- `except` – what to do if it fails.
- `else` – runs only if nothing failed.
- `finally` – always runs. Use it for clean-up.

```python
try:
    number = int(user_text)
except ValueError:
    print("Please type a number")
else:
    print("You typed", number)
finally:
    print("Done")
```

### raise
**Definition:** `raise` creates an exception on purpose. Use it when your code finds a problem it cannot fix.

```python
def set_age(age):
    if age < 0:
        raise ValueError("Age cannot be negative")
```

### Custom Exception
**Definition:** Your own exception type, made by creating a class based on `Exception`. It gives errors clear names.

```python
class ConfigError(Exception):
    """Raised when the config file is wrong."""

class MissingKeyError(ConfigError):
    """Raised when a required key is missing."""
```

### Exception Chaining
**Definition:** When you catch one error and raise a new one, use `from` to keep the original error. This helps debugging.

```python
try:
    port = int(raw_port)
except ValueError as e:
    raise ConfigError("Port must be a number") from e
```

**Try it:** write `read_port(text)` that turns text into an `int`, raises `ValueError` if it isn't between 1 and 65535, and test it with `"8080"`, `"abc"`, and `"70000"`.

---

## Level 6: Classes and Objects

This style is called **Object-Oriented Programming (OOP)**.

### Class and Object
**Definition:** A **class** is a plan or template. An **object** is a real thing made from that plan. One class can make many objects. An object is also called an **instance**.

**Why it is useful:** A class keeps data and the actions on that data together in one place.

```python
class User:
    def __init__(self, name, email):   # runs when a new object is made
        self.name = name               # attribute
        self.email = email

    def greet(self):                   # method
        return f"Hello, {self.name}"

u = User("Priya", "p@x.com")   # make an object
u.greet()                      # "Hello, Priya"
```

### Attribute and Method
- **Attribute** – a variable that belongs to an object (`u.name`).
- **Method** – a function that belongs to an object (`u.greet()`).

### `__init__` and `self`
- `__init__` is the **constructor**. It runs when you create a new object and sets up its starting data.
- `self` means "this object". Every normal method gets `self` as its first parameter.

### Class Variable and Instance Variable
- **Instance variable** – belongs to one object (`self.name`).
- **Class variable** – shared by all objects of the class.

```python
class User:
    count = 0              # class variable

    def __init__(self, name):
        self.name = name   # instance variable
        User.count += 1
```

### Inheritance
**Definition:** A new class (child) can reuse the code of an existing class (parent). The child gets all parent attributes and methods, and can add new ones.

```python
class Admin(User):
    def __init__(self, name, email, level):
        super().__init__(name, email)   # run the parent's setup
        self.level = level

    def delete_user(self, other):
        ...
```

`super()` calls a method from the parent class.

### Method Overriding
**Definition:** A child class writes its own version of a parent method. The child version is used instead.

```python
class Animal:
    def sound(self):
        return "..."

class Dog(Animal):
    def sound(self):
        return "Woof"
```

### Polymorphism
**Definition:** Different classes have methods with the same name. You can call that method without knowing which class the object is. Each object does its own version.

```python
for animal in [Animal(), Dog()]:
    print(animal.sound())   # "...", then "Woof"
```

### Encapsulation
**Definition:** Keep the inner data of an object private and let others use it only through methods. In Python, a name that starts with `_` means "internal, please do not use from outside".

### Property
**Definition:** A property looks like an attribute, but runs a method when you read or set it. Use it to check values.

```python
class Account:
    def __init__(self, balance):
        self._balance = balance

    @property
    def balance(self):
        return self._balance

    @balance.setter
    def balance(self, value):
        if value < 0:
            raise ValueError("Balance cannot be negative")
        self._balance = value
```

### Class Method and Static Method
- **Class method** (`@classmethod`) gets the class (`cls`), not the object. Often used as another way to create objects.
- **Static method** (`@staticmethod`) gets neither. It is a normal function kept inside the class because it is related.

```python
class User:
    def __init__(self, name):
        self.name = name

    @classmethod
    def from_dict(cls, data):
        return cls(data["name"])

    @staticmethod
    def is_valid_email(email):
        return "@" in email
```

### Special Methods ("Dunder" Methods)
**Definition:** Methods with two underscores on both sides, like `__str__`. Python calls them for you in special situations.

| Method | When Python calls it |
|--------|----------------------|
| `__init__` | When you create an object |
| `__str__` | When you `print()` the object |
| `__repr__` | When you look at the object while debugging |
| `__eq__` | When you compare with `==` |
| `__lt__` | When you compare with `<` (used by sorting) |
| `__len__` | When you call `len()` |
| `__enter__` / `__exit__` | When you use the object in a `with` block |

### Dataclass
**Definition:** A dataclass is a short way to write a class that mainly holds data. Python writes `__init__`, `__repr__`, and `__eq__` for you.

```python
from dataclasses import dataclass, field

@dataclass
class TestResult:
    name: str
    passed: bool
    tags: list = field(default_factory=list)

r = TestResult("test_login", True)
print(r)   # TestResult(name='test_login', passed=True, tags=[])
```

### Abstract Base Class (Interface)
**Definition:** An abstract class is a template that says "every child class must have these methods". You cannot create an object directly from it.

```python
from abc import ABC, abstractmethod

class Notifier(ABC):
    @abstractmethod
    def send(self, message: str) -> None:
        ...

class EmailNotifier(Notifier):
    def send(self, message):
        print("Email:", message)
```

**Try it:** write a `BankAccount` class with a `balance` property that refuses negative values, plus `deposit()` and `withdraw()` methods. Then make a `SavingsAccount` child class that adds interest.

---

## Level 7: Modules, Packages and Environments

### Module
**Definition:** A module is one Python file (`something.py`). You can use its code in another file with `import`.

```python
import math
math.sqrt(16)             # 4.0

from math import ceil     # import one name
import datetime as dt     # give a short name
```

### Package
**Definition:** A package is a folder of modules. It usually has a file named `__init__.py`.

```text
my_app/
├── __init__.py
├── config.py
└── utils.py
```

```python
from my_app.config import load_config
```

### Main Guard
**Definition:** The line `if __name__ == "__main__":` means "run this code only when this file is started directly, not when it is imported".

```python
def main():
    print("Running")

if __name__ == "__main__":
    main()
```

### Standard Library
**Definition:** The set of modules that come with Python. You do not need to install them. Examples: `os`, `sys`, `json`, `csv`, `re`, `logging`, `pathlib`, `datetime`, `subprocess`, `unittest`.

### pip and Third-Party Packages
**Definition:** `pip` is the tool that installs extra packages made by other people, such as `requests` or `pytest`.

```bash
pip install requests
pip install -r requirements.txt   # install everything listed in a file
```

### Virtual Environment
**Definition:** A virtual environment is a separate, private space for one project's packages. Each project can have its own versions without affecting other projects.

```bash
python -m venv .venv          # create
source .venv/bin/activate     # turn on (Mac/Linux)
.venv\Scripts\activate        # turn on (Windows)
deactivate                    # turn off
```

### Environment Variable
**Definition:** A setting stored outside your code, in the operating system. It is often used for passwords, keys, and settings that change between computers.

```python
import os
db_url = os.environ.get("DATABASE_URL", "sqlite:///local.db")
```

**Try it:** create a virtual environment, install `requests` into it, and run `python -c "import requests; print(requests.__version__)"`. Then deactivate it and run the same command again — what changes?

---

## Level 8: Working with Files and Data

### Opening a File
**Definition:** `open()` connects your program to a file so you can read from it or write to it.

| Mode | Meaning |
|------|---------|
| `"r"` | Read (default) |
| `"w"` | Write (removes old content first) |
| `"a"` | Append (add to the end) |
| `"x"` | Create a new file; fail if it already exists |
| `"b"` | Binary (add to other modes, e.g. `"rb"`) |

### The `with` Statement
**Definition:** `with` opens something and closes it for you when the block ends, even if there is an error.

```python
with open("notes.txt", "w", encoding="utf-8") as f:
    f.write("First line\n")

with open("notes.txt", encoding="utf-8") as f:
    for line in f:              # reads one line at a time
        print(line.strip())
```

### pathlib (Modern File Paths)
**Definition:** `pathlib` handles file and folder paths as objects. It works the same on Windows, Mac, and Linux.

```python
from pathlib import Path

path = Path("data") / "report.txt"      # joins folder and file name
path.parent.mkdir(parents=True, exist_ok=True)
path.write_text("hello")
path.read_text()                         # "hello"
path.exists()                            # True
list(Path("data").glob("*.txt"))         # all .txt files
```

### JSON
**Definition:** JSON is a common text format for data. It looks like Python dicts and lists. APIs and config files often use it.

```python
import json

data = {"name": "Asha", "skills": ["python", "sql"]}
text = json.dumps(data, indent=2)   # Python -> JSON text
back = json.loads(text)             # JSON text -> Python

with open("data.json", "w") as f:
    json.dump(data, f)              # write to file
with open("data.json") as f:
    loaded = json.load(f)           # read from file
```

### CSV
**Definition:** CSV (comma-separated values) is a table stored as text. Each line is a row. Commas separate the columns.

```python
import csv

with open("users.csv", newline="") as f:
    for row in csv.DictReader(f):   # each row becomes a dict
        print(row["name"])

with open("out.csv", "w", newline="") as f:
    writer = csv.DictWriter(f, fieldnames=["name", "age"])
    writer.writeheader()
    writer.writerow({"name": "Ravi", "age": 30})
```

### Dates and Times
```python
from datetime import datetime, timedelta, timezone

now = datetime.now(timezone.utc)
tomorrow = now + timedelta(days=1)
now.strftime("%Y-%m-%d %H:%M")          # date as text
datetime.strptime("2026-01-15", "%Y-%m-%d")   # text to date
```

**Try it:** write a `list` of three `dict`s (name and score) to `scores.json`, read it back, and write the same data to `scores.csv` with `csv.DictWriter`.

---

## Level 9: Advanced Ideas

### Iterable and Iterator
**Definition:**
- An **iterable** is anything you can loop over: a list, string, dict, file, and so on.
- An **iterator** is the object that gives the next item, one at a time, when you call `next()`.

```python
it = iter([1, 2, 3])
next(it)   # 1
next(it)   # 2
```

### Generator
**Definition:** A generator is a function that gives values one at a time using `yield`, instead of building the whole list in memory. It pauses after each `yield` and continues from there next time.

**Why it is useful:** You can work with very large data, such as a 10 GB log file, using very little memory.

```python
def read_errors(path):
    with open(path) as f:
        for line in f:
            if "ERROR" in line:
                yield line.strip()

for error in read_errors("app.log"):
    print(error)
```

**Generator expression** – like a list comprehension, but with `( )`. It does not build a list.
```python
total = sum(n * n for n in range(1_000_000))
```

A generator can be used only once. After it is finished, it is empty.

### Context Manager
**Definition:** A context manager is an object that sets something up at the start of a `with` block and cleans it up at the end. `open()` is the most common example.

**Why it is useful:** Clean-up always happens: closing files, closing database connections, releasing locks, or undoing a test change.

```python
from contextlib import contextmanager

@contextmanager
def db_connection(url):
    conn = connect(url)      # set up
    try:
        yield conn           # the with-block runs here
    finally:
        conn.close()         # clean up, always

with db_connection("sqlite:///test.db") as conn:
    conn.execute("SELECT 1")
```

Class version:
```python
import time

class Timer:
    def __enter__(self):
        self.start = time.time()
        return self
    def __exit__(self, exc_type, exc, tb):
        self.seconds = time.time() - self.start
        return False    # do not hide errors
```

### Regular Expression (Regex)
**Definition:** A regex is a pattern used to find or check text. For example: "three digits, a dash, then four digits".

```python
import re

re.search(r"\d{3}-\d{4}", "Call 555-1234")    # finds "555-1234"
re.findall(r"\w+@\w+\.\w+", text)            # all emails in text
re.sub(r"\s+", " ", "a    b")                # "a b"

LOG_LINE = re.compile(r"(?P<level>INFO|ERROR) (?P<msg>.*)")
m = LOG_LINE.search("ERROR disk full")
m.group("level")    # "ERROR"
```

| Pattern | Meaning |
|---------|---------|
| `\d` | a digit (0–9) |
| `\w` | a letter, digit, or `_` |
| `\s` | a space, tab, or new line |
| `.` | any character |
| `+` | one or more |
| `*` | zero or more |
| `?` | zero or one |
| `{3}` | exactly 3 times |
| `^` / `$` | start / end of the text |
| `[abc]` | one of a, b, c |
| `(...)` | a group you can read later |

Use `re.compile` once if you use the same pattern many times.

### Shallow Copy and Deep Copy
**Definition:**
- A **shallow copy** makes a new outer list, but the items inside are still shared.
- A **deep copy** copies everything, including items inside items.

```python
import copy
original = [[1, 2], [3, 4]]
shallow = original.copy()
deep = copy.deepcopy(original)

original[0].append(99)
shallow    # [[1, 2, 99], [3, 4]] — the inner list is shared
deep       # [[1, 2], [3, 4]]     — fully separate
```

### Mutable and Immutable
**Definition:**
- **Mutable** means it can change after it is made: `list`, `dict`, `set`.
- **Immutable** means it cannot change: `int`, `float`, `str`, `tuple`, `bool`.

Dictionary keys and set items must be immutable (the correct word is "hashable").

### Big-O (Speed of an Operation)
**Definition:** Big-O is a simple way to say how the time of an action grows when the data grows. Here **n** means "how many items there are".
- **O(1)** – the same time, no matter how much data. Very fast.
- **O(log n)** – grows very slowly.
- **O(n)** – grows in line with the data size.

| Action | Speed |
|--------|-------|
| Get list item by position `items[5]` | O(1) |
| Add to end of list `append` | O(1) |
| Insert or remove at the start of a list | O(n) |
| Check `x in list` | O(n) |
| Check `x in set` or `key in dict` | O(1) |
| Get or set a dict value | O(1) |
| `heapq` push / pop | O(log n) |

### Heap (Priority Queue)
**Definition:** A heap keeps the smallest item always at the front. It is useful for "top N" problems and job scheduling.

```python
import heapq
jobs = [5, 1, 8, 3]
heapq.heapify(jobs)
heapq.heappop(jobs)             # 1 (the smallest)
heapq.nlargest(2, [5, 1, 8])    # [8, 5]
```

### Concurrency: Threads, Processes and Async
**Definition:** Concurrency means doing more than one task in the same period of time.

| Tool | What it is | Best for |
|------|-----------|----------|
| **Thread** (`threading`, `ThreadPoolExecutor`) | Many workers inside one program that share memory | Waiting work: network calls, files, APIs |
| **Process** (`multiprocessing`, `ProcessPoolExecutor`) | Separate programs, each with its own memory | Heavy CPU work: large calculations |
| **Async** (`asyncio`, `async`/`await`) | One worker that switches tasks while it waits | Many network calls at the same time |

```python
from concurrent.futures import ThreadPoolExecutor

def check(url):
    return requests.get(url, timeout=5).status_code

with ThreadPoolExecutor(max_workers=10) as pool:
    results = list(pool.map(check, urls))
```

### async / await
**Definition:**
- `async def` makes a **coroutine**: a function that can pause while it waits.
- `await` means "pause here until this is ready, and let other tasks run meanwhile".
- `asyncio.gather` runs many coroutines together.

```python
import asyncio

async def fetch(n):
    await asyncio.sleep(1)     # pretend to wait for the network
    return n * 2

async def main():
    results = await asyncio.gather(fetch(1), fetch(2), fetch(3))
    print(results)   # [2, 4, 6] after about 1 second, not 3

asyncio.run(main())
```

### Dependency Injection
**Definition:** Instead of a class creating the things it needs (a database, an API client), you give those things to it from outside. This makes the class easy to test, because you can pass a fake version.

```python
class UserService:
    def __init__(self, database):   # database is "injected"
        self.db = database

    def get_user(self, user_id):
        return self.db.find(user_id)

service = UserService(RealDatabase())    # in the app
service = UserService(FakeDatabase())    # in a test
```

### Protocol (Duck Typing)
**Definition:** "If it walks like a duck and quacks like a duck, it is a duck." Python cares about what methods an object has, not its exact class. A `Protocol` writes this rule down for type checkers.

```python
from typing import Protocol

class Sender(Protocol):
    def send(self, msg: str) -> None: ...

def alert(sender: Sender):
    sender.send("Server down")   # works with any object that has send()
```

### Command-Line Arguments
**Definition:** Values you give to a script when you start it from the terminal. `argparse` reads them.

```python
import argparse

parser = argparse.ArgumentParser(description="Check a server")
parser.add_argument("host")
parser.add_argument("--port", type=int, default=80)
args = parser.parse_args()
print(args.host, args.port)
```

```bash
python check.py example.com --port 443
```

### Running Other Programs (subprocess)
**Definition:** `subprocess` runs another program or command from Python.

```python
import subprocess

result = subprocess.run(
    ["git", "status"],        # give the command as a list
    capture_output=True,
    text=True,
    check=True,               # raise an error if the command fails
)
print(result.stdout)
```

**Try it:** write a generator `read_lines(path, word)` that yields only lines containing `word`, and use it with `sum(1 for _ in ...)` to count matching lines in any text file.

---

## Level 10: Testing, Logging and Speed

### Test
**Definition:** A test is code that checks that other code works. It runs your code and compares the result with the answer you expect.

### assert
**Definition:** `assert` checks that something is true. If it is false, the test fails.

```python
assert add(2, 3) == 5
```

### pytest
**Definition:** `pytest` is the most popular tool for writing and running tests in Python. Test files start with `test_`. Test functions start with `test_`.

```python
# test_math.py
import pytest

def test_add():
    assert add(2, 3) == 5

def test_bad_input():
    with pytest.raises(ValueError):
        set_age(-1)
```

```bash
pytest            # run all tests
pytest -v         # show each test name
pytest -k login   # run tests with "login" in the name
```

### Fixture
**Definition:** A fixture is a function that prepares something a test needs, such as a user object or a database, and cleans it up after the test.

```python
@pytest.fixture
def user():
    return User("Asha", "a@x.com")

def test_greet(user):          # pytest passes the fixture in by name
    assert user.greet() == "Hello, Asha"
```

### Parametrize
**Definition:** Run the same test many times with different input values.

```python
@pytest.mark.parametrize("a, b, expected", [(1, 2, 3), (0, 0, 0), (-1, 1, 0)])
def test_add(a, b, expected):
    assert add(a, b) == expected
```

### Mock
**Definition:** A mock is a fake object that stands in for a real one, such as a real API or database. You control what it returns, and you can check how it was used.

```python
from unittest.mock import patch

@patch("my_app.service.requests.get")
def test_get_user(mock_get):
    mock_get.return_value.json.return_value = {"id": 1}
    assert get_user(1) == {"id": 1}
    mock_get.assert_called_once()
```

### Test Types

| Type | What it checks | Speed |
|------|----------------|-------|
| **Unit test** | One small function or class, alone | Very fast |
| **Integration test** | Several parts working together (e.g. code + database) | Medium |
| **End-to-end (E2E) test** | A full user journey (e.g. in a browser) | Slow |
| **Smoke test** | The most important paths still work after a release | Fast |

### Logging
**Definition:** Logging means writing messages about what the program is doing, with a level of importance. Logs help you find problems later, especially on servers.

Levels, from least to most serious: `DEBUG` &lt; `INFO` &lt; `WARNING` &lt; `ERROR` &lt; `CRITICAL`

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s %(name)s: %(message)s",
)
logger = logging.getLogger(__name__)

logger.info("Service started on port %s", 8080)
logger.error("Could not connect to %s", "db1")
```

### Debugging
**Definition:** Debugging is finding and fixing the cause of a problem.

```python
breakpoint()    # stops the program here so you can look at variables
```

Useful commands inside the debugger: `n` (next line), `s` (step into), `c` (continue), `p name` (print a value), `q` (quit).

### Profiling
**Definition:** Profiling measures which parts of your code use the most time. Measure first, then make the slow part faster.

```python
import timeit
timeit.timeit("sum(range(1000))", number=10_000)

import cProfile
cProfile.run("main()")
```

### Caching
**Definition:** Caching means saving a result so you do not have to calculate it again.

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def get_config(name):
    return load_from_disk(name)   # runs only once per name
```

**Try it:** write `is_even(n)` and a `test_is_even` using `@pytest.mark.parametrize` with four cases. Add `logger.info` calls to `is_even` and run `pytest -v`.

---

## Word List (Glossary)

| Word | Simple meaning |
|------|----------------|
| Argument | The real value you pass into a function |
| Attribute | A variable that belongs to an object |
| Block | Lines of code grouped by the same indentation |
| Boolean | A value that is `True` or `False` |
| Class | A plan for making objects |
| Closure | An inner function that remembers outer variables |
| Collection | A value that holds many values (list, tuple, set, dict) |
| Comprehension | A one-line way to build a list, set, or dict |
| Context manager | Something used with `with` that sets up and cleans up |
| Coroutine | A function made with `async def` that can pause |
| Decorator | A wrapper that adds behaviour to a function |
| Dependency injection | Giving an object the things it needs from outside |
| Dictionary | A group of key and value pairs |
| Exception | An error that happens while the program runs |
| Fixture | Test set-up (and clean-up) code in pytest |
| Function | A named block of code that does one job |
| Generator | A function that gives values one at a time with `yield` |
| Hashable | Can be used as a dict key or set item |
| Immutable | Cannot be changed after it is made |
| Import | Bring code from another module into this file |
| Indentation | Spaces at the start of a line that show a block |
| Inheritance | A child class reusing the code of a parent class |
| Instance | One object made from a class |
| Iterable | Anything you can loop over |
| Lambda | A small one-line function without a name |
| List | An ordered group of items that can change |
| Method | A function that belongs to an object |
| Mock | A fake object used in tests |
| Module | One Python file |
| Mutable | Can be changed after it is made |
| Object | A real thing made from a class |
| Package | A folder of modules |
| Parameter | The name of an input in a function definition |
| Polymorphism | Same method name, different behaviour per class |
| Regex | A text pattern for searching or checking text |
| Return value | The result a function sends back |
| Scope | Where in the code a variable can be seen |
| Set | A group of unique items with no order |
| String | Text |
| Tuple | An ordered group of items that cannot change |
| Type hint | A label that says what type a value should be |
| Variable | A name that stores a value |
| Virtual environment | A private space for one project's packages |
