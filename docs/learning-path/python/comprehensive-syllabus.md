---
title: "Comprehensive Python Syllabus"
description: "Milestone-by-milestone Python syllabus for SRE, SDET, and SDE \u2014 core foundations first, then role-specific tracks."
sidebar_position: 2
level: intermediate
tags: [python, learning-path, sre, sdet, sde]
image: /img/mental-model-share.png
---

# Comprehensive Python Syllabus
## For SRE, SDET, and SDE Professionals

**In short:** what to learn in each milestone, with examples, a small project to
build, and a checklist to test yourself. Everyone does Milestones 1–7; then you
pick a role track.

:::tip How to use this page

Each milestone has the same parts:

- **In short** — the milestone in one sentence.
- **You will learn** — the goals.
- **Topics** — explanations and code to type and run.
- **Build this** — a small project. The full worked version is in
  [Milestones & Mini-Projects](/docs/learning-path/python/milestones-and-mini-projects).
- **Check yourself** — tick these off before moving on.

The [Learning Path overview](/docs/learning-path/python/implementation-roadmap)
shows how this page fits with the others.

:::

---

## Phase 1: Core Python {#phase-1}
*Milestones 1–7 · everyone*

---

## Milestone 1: Getting Started & Fundamentals {#milestone-1}

**In short:** set up Python properly, then learn values, types, and type hints.

### You will learn
- Understand Python philosophy and design decisions
- Setup production-grade development environment
- Learn variables, data types, and basic operations
- Understand Python's type system (dynamic typing)

### Topics

#### 1.1 Python Basics & Environment
```text
├─ Python philosophy (PEP 20 - The Zen of Python)
├─ Installation & virtual environments (venv, poetry)
├─ IDE setup (VS Code, PyCharm)
├─ Running Python: REPL, scripts, modules
├─ Package management (pip, requirements.txt)
└─ First program: Hello World to import mechanics
```

#### 1.2 Data Types & Variables
```text
├─ Basic types: int (whole number), float (decimal), str (text), bool (True/False)
├─ Type hints, e.g.  timeout: int = 30  or  name: str
├─ "Truthy" and "falsy" values (0, "", [], None count as false)
├─ None as a "no value yet" marker
├─ String operations (f-strings, .format(), joining with +)
├─ Number operations (// whole-number division, % remainder, ** power)
└─ Checking types (type(), isinstance())
```

```python
# Real example: configuration handling
class Config:
    def __init__(self, debug: bool = False, timeout: int = 30):
        self.debug: bool = debug
        self.timeout: int = timeout
    
    def is_production(self) -> bool:
        """Production uses longer timeouts."""
        return not self.debug and self.timeout > 60
```

### Build this (1.1): Setup Assessment
- [ ] Create virtual environment
- [ ] Install Python 3.11+ and required tools
- [ ] Run your first type-hinted script
- [ ] Create .gitignore for Python projects

### Check yourself
- Can create/activate venv
- Understand difference between `int` and `float`
- Know when to use type hints
- Can read Python error messages

### Key Gotchas (For SDET/SDE)
- Import errors from circular imports
- Mutable default arguments: `def func(list=[]):`  ❌
- Use `list=None; if list is None: list = []` ✅
- Old Python 2 examples online (e.g. `print "hi"` without brackets) — always use Python 3

---

## Milestone 2: Collections & Data Structures {#milestone-2}

**In short:** learn the four collection types — `list`, `tuple`, `set`, `dict` — and when each one is the right choice.

### You will learn
- Master list, dict, set, and tuple usage
- Understand performance characteristics
- Learn comprehensions (list, dict, set)
- Know when to use each collection type

### Topics

#### 2.1 Lists, Tuples, Sets
```python
# Core patterns professionals use:

# 1. LIST: Ordered, mutable
users = ["alice", "bob", "charlie"]
users.append("diana")
users[0] = "alice_updated"
# Speed: adding to the end is fast; inserting/removing near the front is slow

# 2. TUPLE: Ordered, can't be changed (so it can be a dict key)
coordinates = (10.5, 20.3)  # Can be dict key
config_tuple = (True, "production", 3600)
# Use for: dict keys, function returns, immutable sequences

# 3. SET: Unique items, unordered
active_users = {"alice", "bob", "charlie"}
inactive = active_users - {"bob"}  # Set operations
has_user = "alice" in active_users  # O(1) lookup

# Speed ("O(1)" = same speed at any size, "O(n)" = slower as it grows):
# list: append O(1), insert O(n), get by position O(1), "x in list" O(n)
# set:  add O(1), "x in set" O(1)
# dict: get/set/remove by key O(1)
# → for "is X in here?" checks, use a set or dict, not a list
```

#### 2.2 Dictionaries
```python
# Dictionaries are the bread and butter:

# 1. Basic usage
user = {
    "id": 1,
    "name": "Alice",
    "roles": ["admin", "user"]
}

# 2. Safe access patterns
name = user.get("name", "Unknown")  # "Unknown" if the key is missing (no error)
roles = user.setdefault("roles", [])  # Set if missing

# 3. Dictionary comprehensions
square_dict = {x: x**2 for x in range(5)}
# Result: {0: 0, 1: 1, 2: 4, 3: 9, 4: 16}

# 4. Merging dicts (Python 3.9+)
merged = {**user, "status": "active"}
# Or: user | {"status": "active"}

# 5. Type-safe approach (dataclasses)
from dataclasses import dataclass

@dataclass
class User:
    id: int
    name: str
    roles: list

# Professionals prefer dataclasses over raw dicts for:
# - Type safety
# - IDE autocomplete
# - Validation
```

#### 2.3 Comprehensions
```python
# List comprehension
numbers = [1, 2, 3, 4, 5]
doubled = [x * 2 for x in numbers]
# With condition:
evens = [x for x in numbers if x % 2 == 0]

# Dict comprehension
users_by_id = {user['id']: user for user in users}
# Invert a mapping:
id_by_name = {v: k for k, v in name_by_id.items()}

# Set comprehension
unique_domains = {email.split('@')[1] for email in emails}

# Generator expression (memory-efficient for large data)
sum_squares = sum(x**2 for x in range(1000000))
# Doesn't create the list, iterates lazily
```

### Build this (2.1): Collection Mastery Project
- [ ] Parse JSON config file into nested dicts/lists
- [ ] Find duplicates using sets
- [ ] Create dict lookup table for fast searches
- [ ] Use comprehensions for data transformation

```python
# Example: Parse test results
results = [
    {"test": "login", "status": "PASS"},
    {"test": "logout", "status": "FAIL"},
]

# Group test names by status
from collections import defaultdict

by_status = defaultdict(list)          # missing keys start as an empty list
for r in results:
    by_status[r['status']].append(r['test'])
# dict(by_status) → {'PASS': ['login'], 'FAIL': ['logout']}
```

### Check yourself
- [ ] Know which collection to use for what problem
- [ ] Can explain why `x in my_set` is faster than `x in my_list`
- [ ] Can use comprehensions fluently
- [ ] Know mutable vs immutable implications

### Key Gotchas
- Lists are mutable: `a = [1, 2]; b = a; b.append(3)` → a is also changed
- Dict keys must be values that can't change: a `tuple` works as a key, a `list` doesn't
- Set operations: `&` (intersection), `|` (union), `-` (difference)

---

## Milestone 3: Control Flow & Logic {#milestone-3}

**In short:** make decisions with `if`, repeat work with loops, and handle errors without crashing.

### You will learn
- Master if/elif/else patterns
- Understand loops (for, while)
- Learn comprehensions and generators
- Understand Python's truthiness

### Topics

#### 3.1 Conditionals
```python
# 1. Basic if/elif/else
status = check_service()
if status == 200:
    print("OK")
elif status == 404:
    print("Not found")
else:
    print("Error")

# 2. Ternary operator
message = "Active" if user.is_active else "Inactive"

# 3. Multiple conditions
if age >= 18 and (status == "member" or status == "admin"):
    grant_access()

# 4. Truthiness patterns (Python-specific!)
if items:  # Same as if len(items) > 0
    process(items)

if not error:  # Same as if error is None or error == ""
    continue_processing()

# 5. Guard clauses (professional style)
def process_user(user):
    if not user:
        return None  # Early exit
    
    if not user.is_active:
        return None
    
    # Now do main logic
    return user.get_profile()
```

#### 3.2 Loops
```python
# 1. For loops (most common)
for user in users:
    print(user.name)

# 2. For with enumerate (when you need index)
for i, user in enumerate(users):
    print(f"{i}: {user.name}")

# 3. For with range (when you need numbers)
for i in range(10):  # 0-9
    print(i)

# 4. Break and continue
for user in users:
    if user.status == "banned":
        continue  # Skip this iteration
    if user.quota_exceeded:
        break  # Exit loop entirely

# 5. While loops (less common in professional code)
retries = 0
while retries < 3:
    try:
        result = call_api()
        break
    except Exception:
        retries += 1

# 6. For/else (Python-specific!)
for item in items:
    if item == target:
        print(f"Found at {items.index(item)}")
        break
else:
    print("Not found in list")
```

#### 3.3 Error Handling Basics
```python
# 1. Try/except
try:
    result = int(user_input)
except ValueError:
    print("Invalid number")

# 2. Multiple exception types
try:
    data = json.loads(response)
except (json.JSONDecodeError, KeyError) as e:
    handle_error(e)

# 3. Finally (cleanup code)
connection = None
try:
    connection = open_db_connection()
    data = connection.query()
finally:
    if connection:
        connection.close()  # Always runs

# 4. Raise your own exceptions
if age < 0:
    raise ValueError(f"Age cannot be negative: {age}")
```

### Build this (3.1): Control Flow Project
- [ ] Build a simple form validator
- [ ] Implement retry logic with exponential backoff
- [ ] Create a filtering/sorting utility

### Check yourself
- [ ] Can write guard clauses
- [ ] Understand Pythonic truthiness
- [ ] Know when to use for vs while
- [ ] Understand exception handling patterns

---

## Milestone 4: Functions & Functional Programming {#milestone-4}

**In short:** write reusable functions, then learn closures and decorators — functions that build or wrap other functions.

### You will learn
- Master function definition and parameters
- Understand scope and closures
- Learn lambda and functional patterns
- Understand decorators (introduction)

### Topics

#### 4.1 Function Basics
```python
# 1. Simple function
def greet(name):
    return f"Hello, {name}"

# 2. Default parameters
def connect(host: str, port: int = 5432, timeout: int = 30):
    """
    Connect to database.
    
    Args:
        host: Database hostname
        port: Port number (default: 5432)
        timeout: Connection timeout in seconds (default: 30)
    """
    print(f"Connecting to {host}:{port} (timeout: {timeout})")

# 3. *args (variable positional arguments)
def sum_all(*numbers):
    return sum(numbers)

sum_all(1, 2, 3)  # numbers = (1, 2, 3)

# 4. **kwargs (variable keyword arguments)
def build_config(**options):
    return {k: v for k, v in options.items()}

build_config(debug=True, timeout=30)  # {'debug': True, 'timeout': 30}

# 5. Type hints with return types
def get_user(user_id: int) -> dict:
    """Fetch user by ID."""
    return {"id": user_id, "name": "Alice"}

def is_valid_email(email: str) -> bool:
    """Validate email format."""
    return "@" in email
```

#### 4.2 Scope & Closures
```python
# 1. Global scope
DEBUG = True

def log(message):
    if DEBUG:  # Reads from global scope
        print(message)

# 2. Local scope
def process():
    x = 10  # Local variable
    return x * 2

# x is not accessible outside

# 3. Nonlocal (for nested functions)
def outer():
    count = 0
    
    def inner():
        nonlocal count  # Modify outer's variable
        count += 1
        return count
    
    return inner

counter = outer()
print(counter())  # 1
print(counter())  # 2
print(counter())  # 3

# 4. Closure pattern (professional use case)
def rate_limiter(max_calls: int):
    """Factory function creating a rate limiter."""
    calls = 0
    
    def check():
        nonlocal calls
        if calls >= max_calls:
            raise Exception("Rate limit exceeded")
        calls += 1
    
    return check

# Each limiter has its own closure
api_limiter = rate_limiter(100)  # 100 calls per period
user_limiter = rate_limiter(10)  # 10 calls per period
```

#### 4.3 Lambda & Functional Programming
```python
# 1. Lambda (anonymous functions)
square = lambda x: x ** 2
print(square(5))  # 25

# 2. Lambdas with map
numbers = [1, 2, 3, 4, 5]
squared = list(map(lambda x: x ** 2, numbers))
# Better approach: use list comprehension
squared = [x ** 2 for x in numbers]

# 3. Lambdas with filter
evens = list(filter(lambda x: x % 2 == 0, numbers))
# Better approach:
evens = [x for x in numbers if x % 2 == 0]

# 4. Lambda for sorting
users = [
    {"name": "Alice", "score": 85},
    {"name": "Bob", "score": 92},
]
sorted_users = sorted(users, key=lambda u: u['score'], reverse=True)

# 5. Lambda with dict operations
user_emails = {
    1: "alice@example.com",
    2: "bob@example.com",
}
emails_list = list(map(lambda item: item[1], user_emails.items()))
# Better:
emails_list = list(user_emails.values())
```

#### 4.4 Decorators (Introduction)
```python
# 1. Basic decorator pattern
def log_calls(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Returned {result}")
        return result
    return wrapper

@log_calls
def add(a, b):
    return a + b

add(2, 3)
# Output:
# Calling add
# Returned 5

# 2. Decorator with parameters
def retry(max_attempts=3):
    def decorator(func):
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        raise
                    print(f"Attempt {attempt + 1} failed, retrying...")
        return wrapper
    return decorator

@retry(max_attempts=3)
def fetch_data():
    return api_call()

# 3. Use @functools.wraps to preserve metadata
from functools import wraps

def timing(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        print(f"Took {time.time() - start:.2f}s")
        return result
    return wrapper
```

### Build this (4.1): Functions & Decorators Project
- [ ] Write pure functions with type hints
- [ ] Implement closure-based factory
- [ ] Create a simple decorator (retry or logging)
- [ ] Use map/filter/reduce appropriately

### Check yourself
- [ ] Understand scope rules
- [ ] Can write decorators
- [ ] Know when to use lambdas vs named functions
- [ ] Understand closure use cases

---

## Milestone 5: Object-Oriented Programming {#milestone-5}

**In short:** group data and behaviour into classes, and reuse code through inheritance.

### You will learn
- Master class definition and instance creation
- Understand inheritance and polymorphism
- Learn special methods (`__init__`, `__str__`, etc.)
- Understand when to use OOP vs functional

### Topics

#### 5.1 Classes & Objects
```python
# 1. Basic class definition
class User:
    def __init__(self, id: int, name: str):
        """Constructor (initializer)."""
        self.id = id
        self.name = name
    
    def display_name(self) -> str:
        """Instance method."""
        return f"User: {self.name} (ID: {self.id})"
    
    @staticmethod
    def validate_id(user_id: int) -> bool:
        """Static method (no self parameter)."""
        return user_id > 0
    
    @classmethod
    def from_dict(cls, data: dict):
        """Class method (creates instance from dict)."""
        return cls(data['id'], data['name'])

# Usage
user = User(1, "Alice")
print(user.display_name())

# From dictionary
user2 = User.from_dict({'id': 2, 'name': 'Bob'})

# 2. Special methods (dunder methods)
class User:
    def __init__(self, name):
        self.name = name
    
    def __str__(self):
        """String representation (for humans)."""
        return f"User({self.name})"
    
    def __repr__(self):
        """Developer representation (for debugging)."""
        return f"User(name={self.name!r})"
    
    def __eq__(self, other):
        """Equality comparison."""
        if not isinstance(other, User):
            return NotImplemented
        return self.name == other.name
    
    def __lt__(self, other):
        """Less than (for sorting)."""
        return self.name < other.name
    
    def __len__(self):
        """Length of object."""
        return len(self.name)

# Usage
u1 = User("Alice")
u2 = User("Bob")
print(u1 == u2)  # False
users = sorted([u2, u1])  # Uses __lt__
print(len(u1))  # 5 (length of "Alice")
```

#### 5.2 Inheritance & Polymorphism
```python
# 1. Basic inheritance
class Animal:
    def __init__(self, name: str):
        self.name = name
    
    def speak(self) -> str:
        return f"{self.name} makes a sound"

class Dog(Animal):
    def speak(self) -> str:
        """Override parent method."""
        return f"{self.name} barks"

# Usage
dog = Dog("Rex")
print(dog.speak())  # Rex barks

# 2. Multiple inheritance (use carefully!)
class Swimmer:
    def swim(self):
        return "Swimming..."

class Flyer:
    def fly(self):
        return "Flying..."

class Duck(Swimmer, Flyer):
    pass

duck = Duck()
print(duck.swim())  # Swimming...
print(duck.fly())   # Flying...

# 3. Super() to call parent methods
class Vehicle:
    def __init__(self, brand: str):
        self.brand = brand
    
    def info(self):
        return f"Brand: {self.brand}"

class Car(Vehicle):
    def __init__(self, brand: str, num_doors: int):
        super().__init__(brand)  # Call parent __init__
        self.num_doors = num_doors
    
    def info(self):
        parent_info = super().info()  # Call parent method
        return f"{parent_info}, Doors: {self.num_doors}"

car = Car("Toyota", 4)
print(car.info())  # Brand: Toyota, Doors: 4

# 4. Abstract base classes (for interfaces)
from abc import ABC, abstractmethod

class DataStore(ABC):
    @abstractmethod
    def save(self, data: dict) -> bool:
        """Save data. Subclasses must implement."""
        pass
    
    @abstractmethod
    def load(self, key: str) -> dict:
        """Load data. Subclasses must implement."""
        pass

class FileStore(DataStore):
    def save(self, data: dict) -> bool:
        # Implementation
        return True
    
    def load(self, key: str) -> dict:
        # Implementation
        return {}

# FileStore must implement all abstract methods
```

#### 5.3 Properties & Advanced Patterns
```python
# 1. Properties (getters/setters)
class User:
    def __init__(self, email: str):
        self._email = email  # Private by convention
    
    @property
    def email(self) -> str:
        """Getter."""
        return self._email
    
    @email.setter
    def email(self, value: str) -> None:
        """Setter with validation."""
        if "@" not in value:
            raise ValueError("Invalid email")
        self._email = value
    
    @email.deleter
    def email(self) -> None:
        """Deleter."""
        del self._email

# Usage
user = User("alice@example.com")
print(user.email)  # alice@example.com
user.email = "bob@example.com"  # Calls setter
del user.email  # Calls deleter

# 2. Dataclasses (modern alternative to classes)
from dataclasses import dataclass, field

@dataclass
class User:
    id: int
    name: str
    tags: list = field(default_factory=list)

# Generates __init__, __repr__, __eq__ automatically
user = User(1, "Alice")
user2 = User(1, "Alice")
print(user == user2)  # True
print(repr(user))  # User(id=1, name='Alice', tags=[])

# 3. Named tuples (immutable, lightweight)
from collections import namedtuple

Point = namedtuple('Point', ['x', 'y'])
p = Point(10, 20)
print(p.x, p.y)  # 10, 20
print(p[0], p[1])  # Also works: 10, 20

# 4. Slots (memory optimization for many instances)
class User:
    __slots__ = ('id', 'name')  # Only these attributes allowed
    
    def __init__(self, id: int, name: str):
        self.id = id
        self.name = name

# Prevents adding random attributes later
user = User(1, "Alice")
# user.email = "alice@example.com"  # Would raise AttributeError
```

### Build this (5.1): OOP Design Project
- [ ] Create class hierarchy with inheritance
- [ ] Implement special methods (`__init__`, `__str__`, `__eq__`)
- [ ] Use abstract base classes for interfaces
- [ ] Compare dataclasses vs regular classes

### Check yourself
- [ ] Understand when to use OOP vs functions
- [ ] Can design class hierarchies
- [ ] Know special methods and their purpose
- [ ] Understand properties and descriptors

---

## Milestone 6: Modules, Exceptions & Advanced Constructs {#milestone-6}

**In short:** split code into modules, and use generators and context managers for big data and safe clean-up.

### You will learn
- Understand Python's module system
- Master exception handling patterns
- Learn generators and iterators
- Understand context managers

### Topics

#### 6.1 Modules & Packages
```python
# 1. Importing modules
import math  # Whole module
from math import sqrt  # Specific item
from math import sqrt as square_root  # Alias
from math import *  # Everything (avoid!)

# 2. Module structure (Professional style)
# mypackage/
# ├── __init__.py
# ├── core.py
# ├── utils.py
# └── data/
#     ├── __init__.py
#     └── models.py

# mypackage/__init__.py
"""Package description."""
from .core import main_function
from .utils import helper

__version__ = "1.0.0"
__all__ = ['main_function', 'helper']

# 3. Importing from package
from mypackage import main_function
from mypackage.data.models import User

# 4. Main guard (prevents execution when imported)
if __name__ == "__main__":
    main()  # Only runs when script is executed directly
```

#### 6.2 Exception Handling (Advanced)
```python
# 1. Custom exceptions
class ValidationError(Exception):
    """Raised when input validation fails."""
    pass

class DatabaseError(Exception):
    """Raised for database operation failures."""
    pass

# 2. Exception hierarchy (best practices)
try:
    result = database.query()
except DatabaseError as e:
    log.error(f"Database error: {e}")
except ValidationError as e:
    log.warning(f"Invalid input: {e}")
except Exception as e:
    log.critical(f"Unexpected error: {e}")
    raise  # Re-raise if you can't handle

# 3. Context preservation (chaining exceptions)
try:
    result = int(user_input)
except ValueError as e:
    raise ValidationError("Invalid number") from e

# 4. Try/except/else/finally
try:
    file = open("data.txt")
except FileNotFoundError:
    print("File not found")
else:
    # Runs only if no exception
    try:
        data = file.read()
    finally:
        file.close()       # runs always, once the file is open

# Simpler: "with" closes the file for you
try:
    with open("data.txt") as file:
        data = file.read()
except FileNotFoundError:
    print("File not found")
```

#### 6.3 Generators & Iterators
```python
# 1. Generator function (yields values one at a time)
def count_up_to(max):
    """Generator that yields numbers up to max."""
    current = 1
    while current <= max:
        yield current  # Pause here, return value
        current += 1

# Usage
for num in count_up_to(5):
    print(num)  # Prints 1, 2, 3, 4, 5

# 2. Generator expression (like list comprehension but lazy)
squares = (x ** 2 for x in range(1000000))
# Doesn't create all 1M items at once

for square in squares:
    print(square)  # Computes as needed

# 3. Iterator protocol
class CountUp:
    def __init__(self, max):
        self.max = max
        self.current = 1
    
    def __iter__(self):
        """Return iterator (usually self)."""
        return self
    
    def __next__(self):
        """Return next value or raise StopIteration."""
        if self.current <= self.max:
            value = self.current
            self.current += 1
            return value
        else:
            raise StopIteration

# Usage
for num in CountUp(5):
    print(num)

# 4. Generator patterns (professionals use these)
def read_large_file(filepath, chunk_size=1024):
    """Memory-efficient file reading."""
    with open(filepath, 'rb') as f:
        while True:
            chunk = f.read(chunk_size)
            if not chunk:
                break
            yield chunk

# Parse log file line by line
def parse_logs(filepath):
    """Yield parsed log entries."""
    with open(filepath) as f:
        for line in f:
            timestamp, level, message = line.split(' ', 2)
            yield {
                'timestamp': timestamp,
                'level': level,
                'message': message
            }

for log_entry in parse_logs('app.log'):
    print(log_entry)
```

#### 6.4 Context Managers
```python
# 1. With statement (automatic resource management)
with open("file.txt") as f:
    data = f.read()
# File is automatically closed

# 2. Multiple context managers
with open("input.txt") as f_in, open("output.txt", "w") as f_out:
    for line in f_in:
        f_out.write(line.upper())

# 3. Custom context manager (class-based)
class DatabaseConnection:
    def __init__(self, host: str):
        self.host = host
        self.conn = None
    
    def __enter__(self):
        """Called when entering 'with' block."""
        self.conn = create_connection(self.host)
        return self.conn
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """Called when exiting 'with' block (even on exception)."""
        if self.conn:
            self.conn.close()
        return False  # Re-raise exception if one occurred

# Usage
with DatabaseConnection("localhost") as db:
    result = db.query("SELECT * FROM users")

# 4. Context manager (function-based)
from contextlib import contextmanager

@contextmanager
def database_connection(host: str):
    """Simpler way to create context managers."""
    conn = create_connection(host)
    try:
        yield conn  # What __enter__ returns
    finally:
        conn.close()  # Cleanup code

# Usage
with database_connection("localhost") as db:
    result = db.query("SELECT * FROM users")

# 5. Useful contextlib utilities
from contextlib import suppress

# Ignore specific exceptions
with suppress(FileNotFoundError):
    os.remove("optional_file.txt")  # No error if missing

# Redirect output
import io
from contextlib import redirect_stdout

f = io.StringIO()
with redirect_stdout(f):
    print("This goes to f, not console")
    output = f.getvalue()
```

### Build this (6.1): Modules & Advanced Constructs
- [ ] Create a package with multiple modules
- [ ] Write custom exceptions for your domain
- [ ] Implement a generator for large data processing
- [ ] Create a context manager for resource management

### Check yourself
- [ ] Understand module import system
- [ ] Can write custom exceptions
- [ ] Know when to use generators (memory efficiency)
- [ ] Can create context managers

---

## Milestone 7: Real-World Skills (File I/O, Regex, Profiling) {#milestone-7}

**In short:** read and write files, find text patterns with regex, log what happens, and measure speed.

### You will learn
- Master file operations and path handling
- Understand regular expressions
- Learn performance profiling
- Understand logging best practices

### Topics

#### 7.1 File I/O & Path Handling
```python
# 1. Modern path handling (pathlib)
from pathlib import Path

# File operations
config_path = Path("config.json")
if config_path.exists():
    content = config_path.read_text()  # Read entire file

# Directory operations
data_dir = Path("data")
data_dir.mkdir(parents=True, exist_ok=True)

# List files
json_files = list(data_dir.glob("*.json"))  # Glob pattern
all_files = list(data_dir.rglob("*"))  # Recursive

# 2. Text file operations
# Read all at once
lines = Path("data.txt").read_text().split('\n')

# Read line by line (memory efficient)
for line in Path("data.txt").open():
    process(line)

# Write to file
Path("output.txt").write_text("Hello World")

# 3. CSV handling (professional)
import csv
from pathlib import Path

# Read CSV
with open("data.csv") as f:
    reader = csv.DictReader(f)  # Returns dict for each row
    for row in reader:
        print(row['name'], row['age'])

# Write CSV
with open("output.csv", "w", newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['name', 'age'])
    writer.writeheader()
    writer.writerows([
        {'name': 'Alice', 'age': 30},
        {'name': 'Bob', 'age': 25},
    ])

# 4. JSON handling
import json

# Read JSON
data = json.loads(Path("config.json").read_text())

# Write JSON
output = json.dumps(data, indent=2)
Path("output.json").write_text(output)

# Load/dump from file
with open("data.json") as f:
    data = json.load(f)  # load from file

with open("data.json", "w") as f:
    json.dump(data, f, indent=2)  # dump to file
```

#### 7.2 Regular Expressions
```python
import re

# 1. Basic patterns
pattern = r"(\d{3})-(\d{3})-(\d{4})"  # Phone number
phone = "555-123-4567"
match = re.match(pattern, phone)
if match:
    area, prefix, line = match.groups()

# 2. Find patterns
text = "Emails: alice@example.com, bob@example.com"
emails = re.findall(r"[\w\.-]+@[\w\.-]+\.\w+", text)

# 3. Substitution
text = "Hello [NAME], your ID is [ID]"
output = re.sub(r"\[NAME\]", "Alice", text)
output = re.sub(r"\[ID\]", "12345", output)

# 4. Splitting with regex
log_line = "2024-01-15 ERROR Connection timeout"
timestamp, level, message = re.split(r'\s+', log_line, maxsplit=2)

# 5. Compile regex for reuse (important for SDET)
import re

EMAIL_PATTERN = re.compile(r"[\w\.-]+@[\w\.-]+\.\w+")
PHONE_PATTERN = re.compile(r"(\d{3})-(\d{3})-(\d{4})")

# Efficient in loops
for line in large_file:
    if EMAIL_PATTERN.search(line):
        handle_email_line(line)
    elif PHONE_PATTERN.search(line):
        handle_phone_line(line)

# 6. Advanced: Named groups
pattern = r"(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})"
text = "Today is 2024-01-15"
match = re.search(pattern, text)
print(match.group('year'))  # 2024
print(match.group('month'))  # 01
```

#### 7.3 Logging & Debugging
```python
import logging
from pathlib import Path

# 1. Setup logging (best practices)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)

# 2. Logging levels
logger.debug("Detailed info for debugging")
logger.info("General info")
logger.warning("Something unexpected")
logger.error("Serious problem")
logger.critical("Critical failure")

# 3. Structured logging (one JSON object per line, easy to search)
import datetime
import json

def log_request(method, url, status, duration):
    """Log in structured JSON format."""
    log_data = {
        'timestamp': datetime.datetime.now().isoformat(),
        'method': method,
        'url': url,
        'status': status,
        'duration_ms': duration * 1000
    }
    logger.info(json.dumps(log_data))

# 4. Debugging with pdb
import pdb

def problematic_function():
    x = 10
    pdb.set_trace()  # Execution stops here
    y = x + 5  # Debugger allows inspection
    return y

# Commands: n (next), s (step), c (continue), l (list), p var (print)

# 5. Performance profiling
import cProfile
import pstats

cProfile.run('main()', 'profiling_results')
p = pstats.Stats('profiling_results')
p.sort_stats('cumulative').print_stats(10)  # Top 10 functions
```

#### 7.4 Performance Profiling
```python
import time
import timeit
from functools import wraps

# 1. Simple timing
start = time.time()
do_work()
duration = time.time() - start
print(f"Took {duration:.2f} seconds")

# 2. Timing decorator
def timing(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        duration = time.time() - start
        print(f"{func.__name__} took {duration:.4f}s")
        return result
    return wrapper

@timing
def slow_function():
    return sum(range(1000000))

# 3. Timeit for microbenchmarks
# Which is faster?
import timeit

# Method 1: List concatenation
stmt1 = "[1, 2, 3] + [4, 5, 6]"
time1 = timeit.timeit(stmt1, number=100000)

# Method 2: List extend
stmt2 = """
x = [1, 2, 3]
x.extend([4, 5, 6])
"""
time2 = timeit.timeit(stmt2, number=100000)

print(f"Concatenation: {time1:.4f}s")
print(f"Extend: {time2:.4f}s")

# 4. Memory profiling (pip install memory-profiler)
from memory_profiler import profile

@profile
def memory_intensive():
    big_list = [i for i in range(1000000)]
    return sum(big_list)

# Run with: python -m memory_profiler script.py

# 5. Line profiler (pip install line-profiler) — a different tool that
#    also uses @profile; kernprof provides it, so don't import it
@profile
def process_data(data):
    result = []
    for item in data:
        # expensive_operation is called for each item
        transformed = expensive_operation(item)
        result.append(transformed)
    return result

# Run with: kernprof -l script.py
```

### Build this (7.1): Real-World Data Processing
- [ ] Write file I/O code for CSV/JSON processing
- [ ] Use regex to parse/validate data
- [ ] Implement structured logging
- [ ] Profile and optimize a function

### Check yourself
- [ ] Can use pathlib fluently
- [ ] Understand regex patterns and groups
- [ ] Know logging levels and formats
- [ ] Can identify performance bottlenecks

---

## After Milestone 7: check your core skills {#core-checkpoint}

### Cumulative Skills Checkpoint
After Milestone 7, you should be able to:

**Programming Fundamentals:**
- Write type-hinted Python code
- Use all collection types appropriately
- Write functions with good design
- Use OOP patterns where appropriate
- Understand scope and closures
- Handle exceptions properly

**Real-World Applications:**
- Read/write files (text, JSON, CSV)
- Use regular expressions for validation/parsing
- Profile code performance
- Structure logging properly
- Organize code in modules/packages

**Professional Code Quality:**
- Write unit tests
- Use decorators effectively
- Understand generators for memory efficiency
- Use context managers for resource management
- Follow PEP 8 style guide

---

## Phase 2: Role tracks {#phase-2}
*Milestone 8 onwards · pick one track*

**In short:** after Milestone 7, choose the role you're aiming for. The SDET
track is written out in full below; the SDE and SRE tracks live in the role guides.

---

## SDET track: Advanced Testing & Test Automation {#sdet-track}
*Milestones 8–13*

---

## Milestone 8: Advanced Testing with Pytest {#milestone-8}

**In short:** use pytest's fixtures, parametrisation, and markers to write tests that are short and easy to maintain.

### You will learn
- Master pytest framework and plugins
- Understand fixtures and conftest
- Learn parametrization for data-driven testing
- Understand test markers and filtering

### Topics

#### 8.1 Pytest Fundamentals & Fixtures
```python
# conftest.py (shared fixtures across tests)
import pytest
from selenium import webdriver

@pytest.fixture(scope="function")
def api_client():
    """Create API client for each test."""
    client = APIClient(base_url="http://localhost:8000")
    yield client  # Test runs
    client.cleanup()  # Teardown

@pytest.fixture(scope="session")
def browser():
    """Create browser for entire session (faster)."""
    driver = webdriver.Chrome()
    yield driver
    driver.quit()

@pytest.fixture(scope="class")
def db_connection():
    """Create DB connection for test class."""
    conn = Database.connect("test_db")
    yield conn
    conn.close()

# test_api.py
import pytest

class TestUserAPI:
    def test_get_user(self, api_client):
        """Test uses api_client fixture."""
        response = api_client.get("/users/1")
        assert response.status_code == 200
        assert response.json()['id'] == 1
    
    def test_create_user(self, api_client):
        """Each test gets fresh api_client."""
        response = api_client.post("/users", {
            "name": "Alice",
            "email": "alice@example.com"
        })
        assert response.status_code == 201

# Fixture with cleanup
@pytest.fixture
def temp_file(tmp_path):
    """Pytest provides tmp_path fixture."""
    file_path = tmp_path / "test_file.txt"
    file_path.write_text("test data")
    yield file_path
    # Cleanup automatic

def test_file_operations(temp_file):
    """Access temp file."""
    content = temp_file.read_text()
    assert content == "test data"
```

#### 8.2 Parametrization & Data-Driven Testing
```python
import pytest

# 1. Simple parametrization (single parameter)
@pytest.mark.parametrize("input,expected", [
    ("hello", "HELLO"),
    ("world", "WORLD"),
    ("", ""),
    ("123", "123"),
])
def test_uppercase(input, expected):
    """Test multiple inputs."""
    assert input.upper() == expected

# 2. Multiple parameters
@pytest.mark.parametrize("username,password,expected", [
    ("alice", "correct_pass", True),
    ("alice", "wrong_pass", False),
    ("bob", "correct_pass", False),
    ("", "", False),
])
def test_login(username, password, expected):
    """Data-driven login tests."""
    result = authenticate(username, password)
    assert result == expected

# 3. Parametrize from fixtures
@pytest.fixture(params=[
    ("GET", "200"),
    ("POST", "201"),
    ("DELETE", "204"),
])
def http_method(request):
    return request.param

def test_all_methods(http_method):
    """Test runs 3 times with different methods."""
    method, status = http_method
    response = make_request(method)
    assert response.status_code == int(status)

# 4. Indirect parametrization (complex fixtures)
@pytest.fixture
def user(request):
    """Create user based on parameter."""
    user_type = request.param
    if user_type == "admin":
        return User(name="Admin", role="admin")
    else:
        return User(name="User", role="user")

@pytest.mark.parametrize("user", ["admin", "regular"], indirect=True)
def test_permissions(user):
    """Test permissions for different user types."""
    if user.role == "admin":
        assert user.can_delete_users
    else:
        assert not user.can_delete_users

# 5. CSV/file-based parametrization
import csv

def load_test_data(filepath):
    """Load test data from CSV."""
    with open(filepath) as f:
        reader = csv.DictReader(f)
        return list(reader)

test_data = load_test_data("test_data.csv")
@pytest.mark.parametrize("data", test_data, ids=lambda x: x['test_id'])
def test_from_csv(data):
    """Test from CSV file."""
    result = process(data['input'])
    assert result == data['expected']
```

#### 8.3 Test Markers & Filtering
```python
import pytest

# 1. Built-in markers
@pytest.mark.skip(reason="Not yet implemented")
def test_future_feature():
    pass

@pytest.mark.skipif(True, reason="Skip if condition")
def test_conditional_skip():
    pass

# 2. Custom markers — register them in pytest.ini (shown after this block)
@pytest.mark.slow
def test_large_dataset():
    pass

@pytest.mark.integration
def test_with_database():
    pass

@pytest.mark.smoke
def test_critical_path():
    pass

# Run specific markers
# pytest -m smoke
# pytest -m "not slow"
# pytest -m "integration and not slow"

# 3. Conditional skipping
import sys

@pytest.mark.skipif(sys.version_info < (3, 9), reason="Requires 3.9+")
def test_new_feature():
    pass

# 4. XFail (expected to fail)
@pytest.mark.xfail(reason="Known bug in production")
def test_known_bug():
    assert False  # Expected failure
```

Register custom markers in `pytest.ini`:

```ini
[pytest]
markers =
    slow: marks tests as slow
    integration: marks tests as integration tests
    smoke: marks tests as smoke tests
```

#### 8.4 Test Organization & Best Practices
```python
# Good test organization

# tests/
# ├── conftest.py          (shared fixtures)
# ├── unit/
# │   ├── conftest.py      (unit-specific fixtures)
# │   ├── test_models.py
# │   └── test_utils.py
# ├── integration/
# │   ├── conftest.py      (integration fixtures)
# │   └── test_api.py
# └── e2e/
#     ├── conftest.py      (e2e fixtures with browser)
#     └── test_workflows.py

# tests/conftest.py (shared for all)
@pytest.fixture
def api_base_url():
    return "http://localhost:8000"

# tests/unit/conftest.py (unit-specific)
@pytest.fixture
def mock_database(monkeypatch):
    """Unit tests don't need real database."""
    mock = MagicMock()
    monkeypatch.setattr("app.db", mock)
    return mock

# tests/integration/conftest.py
@pytest.fixture
def test_database():
    """Integration tests use real test database."""
    db = setup_test_db()
    yield db
    teardown_test_db()

# tests/unit/test_models.py
class TestUser:
    def test_user_creation(self):
        user = User(name="Alice", email="alice@example.com")
        assert user.name == "Alice"
    
    def test_user_validation(self):
        with pytest.raises(ValueError):
            User(name="", email="invalid")

# tests/integration/test_api.py
class TestAPIIntegration:
    def test_create_user_flow(self, api_client, test_database):
        response = api_client.post("/users", {"name": "Alice"})
        assert response.status_code == 201
        
        users = test_database.query(User)
        assert len(users) == 1
        assert users[0].name == "Alice"
```

### Build this (8.1): Pytest Mastery
- [ ] Create comprehensive test suite with fixtures
- [ ] Use parametrization for data-driven tests
- [ ] Organize tests into unit/integration/e2e
- [ ] Create shared conftest.py

### Check yourself
- [ ] Can design fixture hierarchy
- [ ] Understand parametrization patterns
- [ ] Know test organization best practices
- [ ] Can filter/run specific test sets

---

## Milestone 9: Mocking & Test Isolation {#milestone-9}

**In short:** replace slow or external parts with mocks so tests are fast and reliable.

### You will learn
- Master unittest.mock library
- Understand patch, MagicMock, and side_effect
- Learn when to mock vs integrate
- Develop test isolation strategies

### Topics

#### 9.1 Mock Basics & Patch
```python
from unittest.mock import Mock, MagicMock, patch

# 1. Creating mocks
mock_obj = Mock()
mock_obj.method.return_value = "result"
print(mock_obj.method())  # "result"

# MagicMock (supports special methods)
mock_magic = MagicMock()
mock_magic.__len__.return_value = 5
print(len(mock_magic))  # 5

# 2. Patching (replacing real objects)
@patch('myapp.database.query')
def test_with_patch(mock_query):
    mock_query.return_value = [{'id': 1, 'name': 'Alice'}]
    
    result = get_users()
    assert len(result) == 1

# Context manager style
def test_with_context_manager():
    with patch('myapp.api.request') as mock_request:
        mock_request.return_value.status_code = 200
        
        response = make_api_call()
        assert response.status_code == 200

# 3. Patch in module vs class
# Always patch where object is USED, not where defined

# Bad: from myapp.database import query
# @patch('myapp.database.query')  # Wrong location

# Good: patch where query is used
# @patch('myapp.user_service.query')
@patch('myapp.user_service.database.query')
def test_get_user(mock_query):
    mock_query.return_value = {'id': 1}
    # Test code...
```

#### 9.2 Advanced Mock Patterns
```python
from unittest.mock import Mock, MagicMock, patch, call

# 1. Side effects (different behavior on each call)
mock = Mock()
mock.side_effect = [1, 2, 3]  # Returns different values
assert mock() == 1
assert mock() == 2
assert mock() == 3

# 2. Side effects with exceptions
mock = Mock()
mock.side_effect = [ValueError("error"), "success"]
with pytest.raises(ValueError):
    mock()
assert mock() == "success"

# 3. Side effects as callable
def side_effect_func(x):
    return x * 2

mock = Mock(side_effect=side_effect_func)
assert mock(5) == 10

# 4. Call tracking
mock = Mock()
mock.method(1, 2, key='value')
mock.method(3, 4, key='other')

# Verify calls
mock.method.assert_called_once_with(3, 4, key='other')  # Last call
assert mock.method.call_count == 2
assert mock.method.call_args == call(3, 4, key='other')
assert mock.method.call_args_list == [
    call(1, 2, key='value'),
    call(3, 4, key='other')
]

# 5. Mocking classes
@patch('myapp.UserService')
def test_with_mocked_class(mock_user_service):
    # Configure mock instance
    mock_instance = Mock()
    mock_user_service.return_value = mock_instance
    mock_instance.get_user.return_value = {'id': 1}
    
    # Use in test
    service = UserService()
    user = service.get_user(1)
    
    # Verify
    assert user == {'id': 1}
    mock_user_service.assert_called_once()
    mock_instance.get_user.assert_called_once_with(1)

# 6. Testing retry logic
@patch('myapp.api.request')
def test_retry_logic(mock_request):
    # Fail twice, succeed on third
    mock_request.side_effect = [
        ConnectionError("timeout"),
        ConnectionError("timeout"),
        {"status": "success"}
    ]
    
    result = resilient_request()
    
    assert result["status"] == "success"
    assert mock_request.call_count == 3  # Verify retry occurred
```

#### 9.3 Testing with External Dependencies
```python
import pytest
from unittest.mock import patch, MagicMock
import responses

# 1. Mocking HTTP requests
@responses.activate
def test_api_integration():
    # Mock HTTP response
    responses.add(
        responses.GET,
        'https://api.example.com/users/1',
        json={'id': 1, 'name': 'Alice'},
        status=200
    )
    
    response = requests.get('https://api.example.com/users/1')
    assert response.json() == {'id': 1, 'name': 'Alice'}

# 2. Mocking database operations
@patch('myapp.db.session.query')
def test_database_query(mock_query):
    # Setup mock to return user
    mock_result = Mock()
    mock_result.filter.return_value.first.return_value = User(id=1, name='Alice')
    mock_query.return_value = mock_result
    
    user = get_user_from_db(1)
    
    assert user.name == 'Alice'
    mock_query.assert_called_once_with(User)

# 3. Mocking system time
from datetime import datetime
from freezegun import freeze_time

@freeze_time("2024-01-15 10:30:00")
def test_with_frozen_time():
    assert datetime.now() == datetime(2024, 1, 15, 10, 30, 0)
    # Test time-dependent code

# 4. Mocking file operations
@patch('builtins.open', create=True)
def test_file_operations(mock_open):
    mock_open.return_value.__enter__.return_value.read.return_value = "test data"
    
    with open("test.txt") as f:
        data = f.read()
    
    assert data == "test data"
    mock_open.assert_called_once_with("test.txt")

# 5. Spy (partial mock - calls real method but tracks calls)
from unittest.mock import patch

@patch('myapp.logger.info')
def test_with_spy(mock_logger):
    # mock_logger is patched, but can configure return value
    result = do_something_that_logs()
    
    # Verify logging happened
    mock_logger.assert_called()
```

#### 9.4 Test Isolation & Strategies
```python
# Strategy 1: Isolation by dependency injection
class UserService:
    def __init__(self, database, cache):
        self.db = database
        self.cache = cache
    
    def get_user(self, user_id):
        # Check cache first
        cached = self.cache.get(user_id)
        if cached:
            return cached
        
        # Fallback to database
        user = self.db.query("SELECT * FROM users WHERE id = ?", (user_id,))  # never build SQL with f-strings
        self.cache.set(user_id, user)
        return user

# Easy to test with mocks
def test_user_service():
    mock_db = Mock()
    mock_cache = Mock()
    mock_cache.get.return_value = None  # Cache miss
    mock_db.query.return_value = {'id': 1, 'name': 'Alice'}
    
    service = UserService(mock_db, mock_cache)
    user = service.get_user(1)
    
    assert user == {'id': 1, 'name': 'Alice'}
    mock_cache.get.assert_called_once_with(1)
    mock_db.query.assert_called_once()

# Strategy 2: Avoid mocking everything
# Good test (only mocks external dependency):
def test_user_validation():
    mock_db = Mock()
    service = UserService(mock_db, cache=None)
    
    # Tests actual validation logic
    with pytest.raises(ValueError):
        service.add_user({'name': '', 'email': 'invalid'})

# Bad test (mocks too much):
def test_user_validation_bad():
    mock_db = Mock()
    mock_cache = Mock()
    mock_logger = Mock()
    # ... over-mocked, hard to understand

# Strategy 3: Test levels
# Unit: test function in isolation
def test_validate_email():  # No mocks needed
    assert is_valid_email("test@example.com")
    assert not is_valid_email("invalid")

# Integration: test components together
@patch('external_api.request')  # Only mock external
def test_get_user_with_fallback(mock_api):
    mock_api.side_effect = ConnectionError()
    
    user = get_user_with_fallback(1)  # Uses both api and cache
    # api.request and cache interact naturally

# End-to-end: no mocks for internal components
def test_user_workflow_e2e():  # Use real DB, real cache
    service = UserService(RealDatabase(), RealCache())
    
    user = service.add_user({'name': 'Alice', 'email': 'alice@example.com'})
    fetched = service.get_user(user.id)
    
    assert fetched.name == 'Alice'
```

### Build this (9.1): Mock Mastery Project
- [ ] Test retry logic with mocked failures
- [ ] Mock HTTP requests and verify calls
- [ ] Test database operations with mocks
- [ ] Identify and fix over-mocked tests

### Check yourself
- [ ] Understand when to mock vs integrate
- [ ] Can configure complex mock behaviors
- [ ] Know call tracking and assertions
- [ ] Understand test isolation strategies

---

## Milestone 10: CI/CD Integration & Test Reporting {#milestone-10}

**In short:** run your tests automatically on every change and publish readable reports.

### You will learn
- Setup GitHub Actions for Python testing
- Understand CI/CD best practices
- Create test reports and dashboards
- Handle flaky tests

### Topics

Covered with a full GitHub Actions example in [Advanced Python for SDET → Running tests automatically](/docs/role-guides/sdet/advanced-python-for-sdet#ci-cd), and step by step in [Python for SDET → Run Tests in CI/CD](/docs/role-guides/sdet/python-for-sdet#14-use-case-run-tests-in-cicd).

### Build this (10.1): CI/CD Pipeline
- [ ] Create .github/workflows/test.yml
- [ ] Setup matrix testing (multiple Python versions)
- [ ] Integrate coverage reporting
- [ ] Create test artifacts collection

---

## Milestone 11: Selenium & Test Automation Frameworks {#milestone-11}

**In short:** automate a web browser and organise UI tests with page objects.

### You will learn
- Master Selenium WebDriver
- Implement Page Object Model (POM)
- Handle waits and synchronization
- Build maintainable test frameworks

### Topics

Covered in [Advanced Python for SDET → Automation frameworks](/docs/role-guides/sdet/advanced-python-for-sdet#frameworks), with a full Page Object example in [Python for SDET → Page Objects](/docs/role-guides/sdet/python-for-sdet#8-use-case-build-a-ui-framework-with-page-objects) and waits in [use case 9](/docs/role-guides/sdet/python-for-sdet#9-use-case-wait-for-slow-pages-avoid-flaky-tests).

### Build this (11.1): Web Automation Framework
- [ ] Create POM-based test suite
- [ ] Implement explicit/implicit waits
- [ ] Build cross-browser test matrix
- [ ] Create test reporting

---

## Milestone 12: Advanced Testing & Performance {#milestone-12}

**In short:** test async code, measure performance, and keep a big test suite fast.

### You will learn
- Understand async testing
- Learn performance testing
- Master test coverage analysis
- Optimize test execution

### Topics

Covered in [Advanced Python for SDET → Testing async code](/docs/role-guides/sdet/advanced-python-for-sdet#async-testing) and [Types of tests](/docs/role-guides/sdet/advanced-python-for-sdet#test-types) (coverage, slow tests, parallel runs).

### Build this (12.1): Performance & Async Testing
- [ ] Write async/await tests
- [ ] Create load test scenario
- [ ] Achieve >90% coverage
- [ ] Optimize test execution time

---

## Milestone 13: Cross-Functional Patterns & Capstone {#milestone-13}

**In short:** combine everything into a full test strategy and build your capstone project.

### You will learn
- Integrate testing with deployment
- Implement smoke tests
- Build comprehensive test strategy
- Complete SDET capstone project

### Topics

#### 13.1 Testing in Production
- [ ] Smoke tests after deployment
- [ ] Canary testing strategy
- [ ] Feature flag testing
- [ ] Production incident testing

#### 13.2 Test Strategy & Organization
- [ ] Test pyramid (unit/integration/e2e ratio)
- [ ] Test data management
- [ ] Test flakiness elimination
- [ ] Test metrics and dashboards

### Build this (13.1): SDET Capstone Project
Build a complete test automation suite for a real application:
- Unit tests (>80% coverage)
- Integration tests (key workflows)
- E2E tests (critical paths)
- CI/CD integration
- Test reporting and dashboards
- Documentation

---

## SDE track: Backend Development & Production Readiness {#sde-track}

**In short:** build and ship real services — APIs, databases, background jobs, packaging, and security.

Work through [Python for SDE](/docs/role-guides/sde/python-for-sde) (15 use cases that build one order service), then [Advanced Python for SDE](/docs/role-guides/sde/advanced-python-for-sde) (packaging, deployment, queues, security).

---

## SRE track: Infrastructure, Monitoring & Reliability {#sre-track}

**In short:** automate operations and keep systems healthy — CLIs, log analysis, metrics, SLOs, Kubernetes, and chaos testing.

Work through [Python for SRE](/docs/role-guides/sre/python-for-sre) (15 use cases), then [Advanced Python for SRE](/docs/role-guides/sre/advanced-python-for-sre) (Kubernetes, monitoring, incidents, chaos).

---

## Phase 3: Mastery & interview prep {#phase-3}

**In short:** once your track is done, practise explaining and designing systems.

- System design basics
- Interview-style problem solving
- Learning from real production incidents
- Career development

---

## Next steps after the syllabus {#next-steps}

### For SDET:
1. Contribute to open-source test automation projects
2. Build comprehensive test suite for side project
3. Study design patterns specific to testing
4. Specialize in API testing or performance testing

### For SDE:
1. Ship a production package to PyPI
2. Deploy application with all studied patterns
3. Contribute to open-source Python projects
4. Build microservice with async patterns

### For SRE:
1. Design monitoring/alerting for production system
2. Implement infrastructure as code
3. Conduct chaos engineering experiments
4. Build incident response automation

---

**Outcome:** Professional-grade Python expertise for your specific role

This syllabus is your detailed roadmap. Start Milestone 1 and progress systematically.
