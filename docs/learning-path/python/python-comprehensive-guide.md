---
title: "Python Comprehensive Guide"
description: "The full Python learning path in one document \u2014 objectives, topics with code, mini-projects, role tracks, and troubleshooting."
sidebar_position: 3
level: intermediate
tags: [python, learning-path, sre, sdet, sde]
image: /img/mental-model-share.png
---

# Python Comprehensive Guide
## For SRE, SDET, and SDE Professionals

**In short:** the whole Python learning path on one page — lessons, code, a
project for every milestone, and role tracks for SDET, SDE, and SRE.

:::tip How to use this page

This page is long on purpose, so you never need to switch pages. Use the
table of contents below, and do one milestone at a time. Prefer smaller
pages? The same material is split across the
[Syllabus](/docs/learning-path/python/comprehensive-syllabus) and
[Milestones & Mini-Projects](/docs/learning-path/python/milestones-and-mini-projects).
For quick syntax, keep the [Python cheat sheet](/cheatsheets/python) or the
[Quick Reference](/docs/fundamentals/python/python-quick-reference) open.

:::

---

## Table of Contents

1. [How to Use This Guide](#how-to-use-this-guide)
2. [Learning Journey](#learning-journey)
3. [Phase 1: Core Python Foundations (Milestones 1–7)](#phase-1-core-python-foundations)
4. [End of Phase 1 Checkpoint](#end-of-phase-1-checkpoint)
5. [Phase 2: Choose Your Professional Path (Milestones 8–16)](#phase-2-choose-your-professional-path)
   - [SDET Track](#sdet-track-advanced-testing--test-automation)
   - [SDE Track](#sde-track-backend-development--production-readiness)
   - [SRE Track](#sre-track-infrastructure-monitoring--reliability)
6. [Phase 3: Cross-Functional Patterns, Mastery & Interview Prep](#phase-3-cross-functional-patterns-mastery--interview-prep)
7. [Why These Topics Matter, by Role](#why-these-topics-matter-roi-by-role)
8. [Scope: What This Guide Deliberately Doesn't Cover](#scope-what-this-guide-deliberately-doesnt-cover)
9. [Portfolio You'll Build](#portfolio-youll-build)
10. [Resources, Tools & Recommended Reading](#resources-tools--recommended-reading)
11. [Troubleshooting Guide](#troubleshooting-guide)
12. [Next Steps](#next-steps)

---

## How to Use This Guide

Each milestone in Phase 1 below is self-contained: **learning objectives → topics with code → a full working mini-project → deliverables checklist → assessment criteria → key gotchas.** You don't need to jump between separate documents — read a milestone's section, build its project, test it, commit it, move on.

```text
1. Read the milestone's Learning Objectives + Topics
2. Build the milestone's Mini-Project (code is provided in full)
3. Write/run the tests shown for that project
4. Check yourself against Assessment Criteria
5. Commit to git
6. Repeat for the next milestone
```

**If you get stuck:** re-read the Topics section for that milestone — it has the concept explanation and a runnable example for every pattern you need.

**If you're demotivated:** jump to [Why These Topics Matter, by Role](#why-these-topics-matter-roi-by-role) — these aren't busy-work exercises, they're the day-to-day requirements of the SDET/SDE/SRE job you're targeting.

**After Milestone 7 (picking your role):**
```text
SDET (Test Automation Engineer):
├─ Read: SDET Track (Milestones 8–13)
├─ Mini-projects evolve from "write tests" → "build test framework"
└─ Capstone: end-to-end test automation suite

SDE (Software Development Engineer):
├─ Read: SDE Track (Milestones 8–13)
├─ Mini-projects evolve from "write code" → "ship a service"
└─ Capstone: production microservice

SRE (Site Reliability Engineer):
├─ Read: SRE Track (Milestones 8–16)
├─ Mini-projects evolve from "automate" → "run production systems"
└─ Capstone: production-ready platform
```

---

## Learning Journey

```text
START (Milestone 1)
1. Skim this whole guide
2. Skim the cheatsheet
3. Open Phase 1 → Milestone 1
4. Build the Milestone 1 mini-project
5. Run tests, commit to git

MIDDLE (Milestones 2–7)
Repeat each milestone:
1. Read that milestone's section
2. Build the mini-project
3. Write/run tests
4. Commit progress

CHOICE POINT (End of Milestone 7)
1. Choose SDET, SDE, or SRE
2. Read your role's track
3. Build role-specific projects

END (Milestone 13+)
1. Complete the capstone project
2. Review your portfolio
3. Interview-ready
```

### Key Success Factors

1. **Code everything.** Don't just read — type, run, modify, break, fix. This is how you learn programming.
2. **Write tests, not just code.** Understanding tests is crucial for SDET/SDE/SRE roles.
3. **Commit to git after each milestone:**
   ```bash
   git add .
   git commit -m "Milestone N: [topic] - completed mini-project with X tests passing"
   git push origin main
   ```
4. **Review previous code.** Each milestone, review the previous milestone's code — you'll notice your own improvement.
5. **Ask "why?" constantly.** Why this pattern instead of that one? Why does the test work this way? Why do professionals write code like this?

---

## PHASE 1: CORE PYTHON FOUNDATIONS
### Milestones 1–7 — Everyone

| Milestone | Topic | Mini-Project | Code Lines | Tests |
|------|-------|---------------|-----------|-------|
| 1 | Basics & Environment | Config Manager | ~100 | 5 |
| 2 | Collections & Comprehensions | JSON API Response Parser | ~150 | 8 |
| 3 | Control Flow & Logic | Email Validator | ~120 | 7 |
| 4 | Functions & Decorators | Rate Limiter & Retry Handler | ~180 | 10 |
| 5 | OOP | User Management System | ~200 | 12 |
| 6 | Modules, Exceptions, Generators | Log Parser | ~150 | 8 |
| 7 | File I/O, Regex, Profiling | Data Processing Pipeline | ~120 | 6 |
| **Totals** | **Core Python** | **7 projects** | **~1,000** | **~56** |

---

## Milestone 1: Getting Started & Fundamentals

**In short:** set up Python properly, then learn values, types, and type hints.

### Learning Objectives
- Understand Python philosophy and design decisions
- Set up a production-grade development environment
- Learn variables, data types, and basic operations
- Understand Python's type system (dynamic typing)

### Topics

#### 1.1 Python Basics & Environment
```
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

### Key Gotchas (For SDET/SDE)
- Import errors from circular imports
- Mutable default arguments: `def func(list=[]):` ❌ → use `list=None; if list is None: list = []` ✅
- Old Python 2 examples online (e.g. `print "hi"` without brackets) — always use Python 3

### Mini-Project: Configuration Management System
**Goal:** Set up a professional Python environment and write a type-hinted config handler.

#### Project Structure
```
week1_project/
├── .venv/                    # Virtual environment
├── .gitignore                # Python-specific
├── pyproject.toml            # Modern Python config
├── README.md
└── src/
    └── config.py              # Main application
```

#### Implementation (`src/config.py`)
```python
"""Configuration management system with type hints."""
from typing import Optional, Dict, Any
from pathlib import Path
import json


class Config:
    """Application configuration handler."""

    def __init__(self, debug: bool = False, timeout: int = 30,
                 api_url: str = "http://localhost:8000"):
        self.debug: bool = debug
        self.timeout: int = timeout
        self.api_url: str = api_url
        self._cache: Dict[str, Any] = {}

    def get(self, key: str, default: Optional[Any] = None) -> Any:
        """Get configuration value."""
        return self._cache.get(key, default)

    def set(self, key: str, value: Any) -> None:
        """Set configuration value."""
        self._cache[key] = value

    def load_from_json(self, filepath: str) -> bool:
        """Load configuration from JSON file."""
        try:
            data = json.loads(Path(filepath).read_text())
            for key, value in data.items():
                self.set(key, value)
            return True
        except (FileNotFoundError, json.JSONDecodeError) as e:
            if self.debug:
                print(f"Error loading config: {e}")
            return False

    def is_production(self) -> bool:
        """Check if running in production."""
        return not self.debug and self.timeout > 60


# Test it
if __name__ == "__main__":
    config = Config(debug=True, timeout=30)
    config.set("app_name", "MyApp")
    print(f"App: {config.get('app_name')}")
    print(f"Debug: {config.debug}")
```

### Deliverables Checklist
- [ ] Virtual environment created and activated
- [ ] Project structure setup (.venv, .gitignore, pyproject.toml)
- [ ] Type-hinted Python class with methods
- [ ] JSON loading functionality
- [ ] README with setup instructions
- [ ] Git initialized with first commit

### Verification Steps
```bash
# Setup
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate

# Run
python src/config.py

# Verify types
pip install mypy
mypy src/config.py  # Should pass type checking
```

### Assessment Criteria
- [ ] Can create/activate a venv
- [ ] Understands the difference between `int` and `float`
- [ ] Knows when to use type hints
- [ ] Can read Python error messages

---

## Milestone 2: Collections & Data Structures

**In short:** learn the four collection types — `list`, `tuple`, `set`, `dict` — and when each is the right choice.

### Learning Objectives
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
coordinates = (10.5, 20.3)  # Can be a dict key
config_tuple = (True, "production", 3600)
# Use for: dict keys, function returns, immutable sequences

# 3. SET: Unique items, unordered
active_users = {"alice", "bob", "charlie"}
inactive = active_users - {"bob"}  # Set operations
has_user = "alice" in active_users  # instant, however big the set is

# Performance characteristics (critical for SDET/SRE):
# ("O(1)" = same speed at any size, "O(n)" = slower as it grows)
# list: append O(1), insert O(n), get by position O(1), "x in list" O(n)
# set:  add O(1), "x in set" O(1)
# dict: get/set/remove by key O(1)
# Use dict/set for membership testing, not lists!
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
name = user.get("name", "Unknown")     # Returns default if missing
roles = user.setdefault("roles", [])   # Set if missing

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
evens = [x for x in numbers if x % 2 == 0]

# Dict comprehension
users_by_id = {user['id']: user for user in users}
id_by_name = {v: k for k, v in name_by_id.items()}   # Invert a mapping

# Set comprehension
unique_domains = {email.split('@')[1] for email in emails}

# Generator expression (memory-efficient for large data)
sum_squares = sum(x**2 for x in range(1000000))
# Doesn't create the list, iterates lazily
```

### Key Gotchas
- Lists are mutable: `a = [1, 2]; b = a; b.append(3)` → `a` is also changed
- Dict keys must be values that can't change: a `tuple` works as a key, a `list` doesn't
- Set operations: `&` (intersection), `|` (union), `-` (difference)

### Mini-Project: JSON API Response Parser
**Goal:** Master dictionaries, lists, and comprehensions with real data.

#### Project Structure
```
week2_project/
├── data/
│   └── sample_response.json  # Real API response
├── src/
│   └── parser.py              # Your solution
└── test_parser.py             # Unit tests
```

#### Sample Data (`data/sample_response.json`)
```json
{
  "users": [
    {
      "id": 1,
      "name": "Alice",
      "email": "alice@example.com",
      "roles": ["admin", "user"],
      "metadata": {
        "created_at": "2024-01-01",
        "login_count": 45
      }
    },
    {
      "id": 2,
      "name": "Bob",
      "email": "bob@example.com",
      "roles": ["user"],
      "metadata": {
        "created_at": "2024-01-02",
        "login_count": 12
      }
    }
  ]
}
```

#### Implementation (`src/parser.py`)
```python
"""Parse and transform API responses."""
import json
from pathlib import Path
from typing import List, Dict, Set


class APIResponseParser:
    """Parse JSON API responses."""

    def __init__(self, filepath: str):
        self.data = json.loads(Path(filepath).read_text())

    def get_user_names(self) -> List[str]:
        """Extract list of user names."""
        return [user['name'] for user in self.data['users']]

    def get_users_by_role(self) -> Dict[str, List[str]]:
        """Organize users by role."""
        result = {}
        for user in self.data['users']:
            for role in user['roles']:
                if role not in result:
                    result[role] = []
                result[role].append(user['name'])
        return result

    def get_users_by_role_dict_comp(self) -> Dict[str, List[str]]:
        """Same as above, using dict comprehension."""
        all_roles = {role for user in self.data['users']
                     for role in user['roles']}

        return {
            role: [u['name'] for u in self.data['users']
                   if role in u['roles']]
            for role in all_roles
        }

    def get_admin_emails(self) -> List[str]:
        """Get emails of users with admin role."""
        return [
            user['email'] for user in self.data['users']
            if 'admin' in user['roles']
        ]

    def get_unique_roles(self) -> Set[str]:
        """Get all unique roles."""
        return {role for user in self.data['users']
                for role in user['roles']}

    def get_login_stats(self) -> Dict[str, int]:
        """Create dict of name -> login_count."""
        return {
            user['name']: user['metadata']['login_count']
            for user in self.data['users']
        }

    def get_top_users(self, n: int = 1) -> List[Dict]:
        """Get n users with most logins."""
        sorted_users = sorted(
            self.data['users'],
            key=lambda u: u['metadata']['login_count'],
            reverse=True
        )
        return sorted_users[:n]


if __name__ == "__main__":
    parser = APIResponseParser("data/sample_response.json")

    print("User names:", parser.get_user_names())
    print("Users by role:", parser.get_users_by_role())
    print("Admin emails:", parser.get_admin_emails())
    print("Unique roles:", parser.get_unique_roles())
    print("Login stats:", parser.get_login_stats())
    print("Top user:", parser.get_top_users(1))
```

#### Test File (`test_parser.py`)
```python
"""Test the parser."""
import pytest
from src.parser import APIResponseParser


@pytest.fixture
def parser():
    return APIResponseParser("data/sample_response.json")


def test_get_user_names(parser):
    names = parser.get_user_names()
    assert len(names) == 2
    assert "Alice" in names
    assert "Bob" in names


def test_get_users_by_role(parser):
    by_role = parser.get_users_by_role()
    assert "admin" in by_role
    assert "Alice" in by_role["admin"]
    assert "Bob" not in by_role["admin"]


def test_get_admin_emails(parser):
    emails = parser.get_admin_emails()
    assert "alice@example.com" in emails
    assert "bob@example.com" not in emails


def test_get_unique_roles(parser):
    roles = parser.get_unique_roles()
    assert roles == {"admin", "user"}


def test_get_login_stats(parser):
    stats = parser.get_login_stats()
    assert stats["Alice"] == 45
    assert stats["Bob"] == 12


def test_get_top_users(parser):
    top = parser.get_top_users(1)
    assert top[0]['name'] == "Alice"  # Alice has most logins
```

### Performance Exercise
```python
# Which is faster? Create a benchmark
import timeit

# Method 1: List + loop
def users_by_role_loop():
    result = {}
    for user in parser.data['users']:
        for role in user['roles']:
            if role not in result:
                result[role] = []
            result[role].append(user['name'])
    return result

# Method 2: Dict comprehension
def users_by_role_comp():
    return parser.get_users_by_role_dict_comp()

t1 = timeit.timeit(users_by_role_loop, number=10000)
t2 = timeit.timeit(users_by_role_comp, number=10000)
print(f"Loop: {t1:.4f}s, Comprehension: {t2:.4f}s")
# Result: Comprehension is typically 2-3x faster
```

### Deliverables Checklist
- [ ] Load and parse a JSON file
- [ ] Extract data using list comprehensions
- [ ] Create lookup dicts using dict comprehensions
- [ ] Create sets of unique values using set comprehensions
- [ ] Sort complex data structures
- [ ] Write unit tests for all methods
- [ ] Run tests and verify all pass

### Assessment Criteria
- [ ] Know which collection to use for what problem
- [ ] Can explain why `x in my_set` is faster than `x in my_list`
- [ ] Can use comprehensions fluently
- [ ] Know mutable vs immutable implications

---

## Milestone 3: Control Flow & Logic

**In short:** make decisions with `if`, repeat work with loops, and handle errors without crashing.

### Learning Objectives
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

### Assessment Criteria
- [ ] Can write guard clauses
- [ ] Understand Pythonic truthiness
- [ ] Know when to use for vs while
- [ ] Understand exception handling patterns

### Mini-Project: Text-Based Email Validator & Classifier
**Goal:** Master conditionals, guard clauses, and error handling.

#### Implementation (`email_validator.py`)
```python
"""Email validation and classification system."""
import re
from typing import Tuple, Optional
from enum import Enum


class EmailType(Enum):
    """Email domain classifications."""
    CORPORATE = "corporate"
    PERSONAL = "personal"
    UNKNOWN = "unknown"


class EmailValidator:
    """Validate and classify emails."""

    PATTERN = re.compile(r'^[\w\.-]+@[\w\.-]+\.\w+$')
    CORPORATE_DOMAINS = {"example.com", "company.org", "acme.co"}
    PERSONAL_DOMAINS = {"gmail.com", "yahoo.com", "outlook.com"}

    @staticmethod
    def validate(email: str) -> Tuple[bool, Optional[str]]:
        """
        Validate email format.

        Returns:
            (is_valid, error_message)
        """
        # Guard clauses (return early for invalid cases)
        if not email:
            return False, "Email cannot be empty"

        if not isinstance(email, str):
            return False, "Email must be a string"

        email = email.strip()

        if len(email) > 255:
            return False, "Email too long (max 255 chars)"

        if EmailValidator.PATTERN.match(email):
            return True, None

        return False, "Invalid email format"

    @staticmethod
    def classify(email: str) -> EmailType:
        """Classify email by domain."""
        is_valid, _ = EmailValidator.validate(email)
        if not is_valid:
            return EmailType.UNKNOWN

        domain = email.split('@')[1].lower()

        if domain in EmailValidator.CORPORATE_DOMAINS:
            return EmailType.CORPORATE

        if domain in EmailValidator.PERSONAL_DOMAINS:
            return EmailType.PERSONAL

        return EmailType.UNKNOWN

    @staticmethod
    def batch_validate(emails: list) -> dict:
        """Validate multiple emails and categorize results."""
        results = {
            'valid': [],
            'invalid': [],
            'corporate': [],
            'personal': [],
            'other': []
        }

        for email in emails:
            is_valid, _ = EmailValidator.validate(email)

            if not is_valid:
                results['invalid'].append(email)
                continue

            results['valid'].append(email)
            email_type = EmailValidator.classify(email)

            if email_type == EmailType.CORPORATE:
                results['corporate'].append(email)
            elif email_type == EmailType.PERSONAL:
                results['personal'].append(email)
            else:
                results['other'].append(email)

        return results


# Test cases
if __name__ == "__main__":
    test_emails = [
        "alice@example.com",
        "bob@gmail.com",
        "invalid-email",
        "",
        "charlie@company.org",
        "diana@unknown.io"
    ]

    print("=== Batch Validation ===")
    results = EmailValidator.batch_validate(test_emails)
    for category, emails in results.items():
        print(f"{category}: {emails}")

    print("\n=== Individual Tests ===")
    test_cases = ["test@example.com", "invalid@", "@example.com"]

    for email in test_cases:
        is_valid, error = EmailValidator.validate(email)
        if is_valid:
            classification = EmailValidator.classify(email)
            print(f"✓ {email} -> {classification.value}")
        else:
            print(f"✗ {email} -> {error}")
```

#### Test Cases
```python
def test_valid_emails():
    assert EmailValidator.validate("alice@example.com")[0] == True
    assert EmailValidator.validate("test+tag@gmail.com")[0] == True

def test_invalid_emails():
    assert EmailValidator.validate("")[0] == False
    assert EmailValidator.validate("invalid-email")[0] == False
    assert EmailValidator.validate("test@")[0] == False

def test_classification():
    assert EmailValidator.classify("alice@example.com") == EmailType.CORPORATE
    assert EmailValidator.classify("bob@gmail.com") == EmailType.PERSONAL
    assert EmailValidator.classify("charlie@unknown.io") == EmailType.UNKNOWN

def test_guard_clauses():
    """Verify guard clauses prevent invalid processing."""
    is_valid, error = EmailValidator.validate("")
    assert error == "Email cannot be empty"
    assert not is_valid
```

### Deliverables Checklist
- [ ] Build a simple form validator
- [ ] Implement retry logic with exponential backoff
- [ ] Create a filtering/sorting utility

### Key Concepts Practiced
- Guard clauses (early returns)
- if/elif/else chains (avoiding deep nesting)
- Truthiness checks
- Error messages in returns
- Loop control (`continue`)
- List comprehensions in conditionals

---

## Milestone 4: Functions & Functional Programming

**In short:** write reusable functions, then closures and decorators — functions that build or wrap other functions.

### Learning Objectives
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
squared = [x ** 2 for x in numbers]  # Preferred: comprehension

# 3. Lambdas with filter
evens = list(filter(lambda x: x % 2 == 0, numbers))
evens = [x for x in numbers if x % 2 == 0]  # Preferred

# 4. Lambda for sorting
users = [
    {"name": "Alice", "score": 85},
    {"name": "Bob", "score": 92},
]
sorted_users = sorted(users, key=lambda u: u['score'], reverse=True)

# 5. Lambda with dict operations
user_emails = {1: "alice@example.com", 2: "bob@example.com"}
emails_list = list(map(lambda item: item[1], user_emails.items()))
emails_list = list(user_emails.values())  # Preferred
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

### Assessment Criteria
- [ ] Understand scope rules
- [ ] Can write decorators
- [ ] Know when to use lambdas vs named functions
- [ ] Understand closure use cases

### Mini-Project: Rate Limiter & Retry Handler
**Goal:** Master decorators, closures, and functional patterns.

#### Implementation (`rate_limiter.py`)
```python
"""Rate limiting and retry mechanisms."""
import time
from functools import wraps
from typing import Callable, Any, TypeVar
from datetime import datetime, timedelta


T = TypeVar('T')


def rate_limit(max_calls: int, period_seconds: int) -> Callable:
    """
    Decorator that rate limits function calls.

    Args:
        max_calls: Maximum calls allowed
        period_seconds: Time period for rate limiting

    Usage:
        @rate_limit(max_calls=5, period_seconds=60)
        def api_call():
            pass
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        calls = []

        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> T:
            now = datetime.now()

            # Remove old calls outside the period
            calls[:] = [call_time for call_time in calls
                        if now - call_time < timedelta(seconds=period_seconds)]

            if len(calls) >= max_calls:
                raise Exception(f"Rate limit exceeded: {max_calls} calls per {period_seconds}s")

            calls.append(now)
            return func(*args, **kwargs)

        return wrapper

    return decorator


def retry(max_attempts: int = 3, backoff_factor: float = 2) -> Callable:
    """
    Decorator that retries function on failure.

    Args:
        max_attempts: Maximum retry attempts
        backoff_factor: Exponential backoff multiplier

    Usage:
        @retry(max_attempts=3, backoff_factor=2)
        def flaky_function():
            pass
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args: Any, **kwargs: Any) -> T:
            wait_time = 1  # Start with 1 second

            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception as e:
                    if attempt == max_attempts - 1:
                        print(f"Failed after {max_attempts} attempts: {e}")
                        raise

                    print(f"Attempt {attempt + 1} failed, retrying in {wait_time}s...")
                    time.sleep(wait_time)
                    wait_time *= backoff_factor

        return wrapper

    return decorator


# Closure-based rate limiter (alternative pattern)
def create_rate_limiter(max_calls: int, period_seconds: int):
    """
    Factory function creating a reusable rate limiter.

    Returns:
        Function that checks if call is allowed
    """
    calls = []

    def is_allowed() -> bool:
        """Check if next call is allowed."""
        now = datetime.now()
        calls[:] = [t for t in calls
                    if now - t < timedelta(seconds=period_seconds)]

        if len(calls) >= max_calls:
            return False

        calls.append(now)
        return True

    return is_allowed


# Test usage
if __name__ == "__main__":
    print("=== Rate Limit Decorator ===")

    @rate_limit(max_calls=3, period_seconds=5)
    def api_call(endpoint: str):
        print(f"Called {endpoint}")
        return f"Response from {endpoint}"

    for i in range(3):
        result = api_call(f"/api/endpoint{i}")
        print(f"Result: {result}")

    try:
        api_call("/api/endpoint3")
    except Exception as e:
        print(f"Error: {e}")

    print("\n=== Retry Decorator ===")

    attempt_count = 0

    @retry(max_attempts=3, backoff_factor=1)
    def flaky_function():
        global attempt_count
        attempt_count += 1
        print(f"Attempt {attempt_count}")

        if attempt_count < 2:
            raise ConnectionError("Network unavailable")

        return "Success"

    result = flaky_function()
    print(f"Final result: {result}")

    print("\n=== Closure-based Rate Limiter ===")

    limiter = create_rate_limiter(max_calls=2, period_seconds=10)

    print(f"Call 1: {limiter()}")  # True
    print(f"Call 2: {limiter()}")  # True
    print(f"Call 3: {limiter()}")  # False

    limiter2 = create_rate_limiter(max_calls=2, period_seconds=10)
    print(f"Limiter2 Call 1: {limiter2()}")  # True
```

#### Advanced: Decorator Stacking
```python
@retry(max_attempts=3)
@rate_limit(max_calls=5, period_seconds=60)
def robust_api_call(endpoint: str):
    """Combines both rate limiting and retry logic."""
    return fetch_from_api(endpoint)

# Execution order: rate_limit -> retry -> actual function
```

### Deliverables Checklist
- [ ] Write pure functions with type hints
- [ ] Implement closure-based factory
- [ ] Create a simple decorator (retry or logging)
- [ ] Use map/filter/reduce appropriately

---

## Milestone 5: Object-Oriented Programming

**In short:** group data and behaviour into classes, and reuse code through inheritance.

### Learning Objectives
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
        return True

    def load(self, key: str) -> dict:
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

user = User("alice@example.com")
print(user.email)
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
```

### Assessment Criteria
- [ ] Understand when to use OOP vs functions
- [ ] Can design class hierarchies
- [ ] Know special methods and their purpose
- [ ] Understand properties and descriptors

### Mini-Project: User Management System with Inheritance
**Goal:** Master OOP patterns and special methods.

#### Implementation (`user_system.py`)
```python
"""User management system with OOP."""
from dataclasses import dataclass, field
from typing import List, Optional
from datetime import datetime
from enum import Enum


class UserRole(Enum):
    """User roles in the system."""
    ADMIN = "admin"
    MODERATOR = "moderator"
    USER = "user"
    GUEST = "guest"


class User:
    """Base user class."""

    def __init__(self, id: int, username: str, email: str):
        self.id = id
        self.username = username
        self.email = email
        self.created_at = datetime.now()

    def __str__(self) -> str:
        return f"User({self.username})"

    def __repr__(self) -> str:
        return f"User(id={self.id}, username={self.username!r}, email={self.email!r})"

    def __eq__(self, other) -> bool:
        if not isinstance(other, User):
            return NotImplemented
        return self.id == other.id

    def __lt__(self, other) -> bool:
        """Allow sorting users by username."""
        if not isinstance(other, User):
            return NotImplemented
        return self.username < other.username

    def __hash__(self) -> int:
        """Allow user objects in sets/dicts."""
        return hash(self.id)

    def get_info(self) -> str:
        """Get user information."""
        return f"{self.username} <{self.email}>"


class AdminUser(User):
    """Admin user with special permissions."""

    def __init__(self, id: int, username: str, email: str, admin_level: int = 1):
        super().__init__(id, username, email)
        self.admin_level = admin_level
        self.deleted_users: List[int] = []

    def delete_user(self, user_id: int) -> bool:
        """Admin can delete users."""
        self.deleted_users.append(user_id)
        return True

    def ban_user(self, user_id: int, reason: str) -> bool:
        """Ban a user with reason."""
        print(f"Admin {self.username} banned user {user_id}: {reason}")
        return True

    def get_info(self) -> str:
        """Override to include admin info."""
        parent_info = super().get_info()
        return f"{parent_info} [ADMIN Level {self.admin_level}]"


@dataclass
class ModeratorUser(User):
    """Moderator user (using dataclass)."""

    moderated_users: List[int] = field(default_factory=list)
    report_count: int = 0

    def report_user(self, user_id: int) -> bool:
        """File a report on user."""
        self.moderated_users.append(user_id)
        self.report_count += 1
        return True

    def get_info(self) -> str:
        return f"{self.username} (Moderator, {self.report_count} reports)"


class UserManager:
    """Manage user collection."""

    def __init__(self):
        self.users: dict[int, User] = {}
        self._next_id = 1

    def add_user(self, username: str, email: str, role: UserRole = UserRole.USER) -> User:
        """Create and add new user."""
        user_id = self._next_id
        self._next_id += 1

        if role == UserRole.ADMIN:
            user = AdminUser(user_id, username, email)
        elif role == UserRole.MODERATOR:
            user = ModeratorUser(user_id, username, email)
        else:
            user = User(user_id, username, email)

        self.users[user_id] = user
        return user

    def get_user(self, user_id: int) -> Optional[User]:
        """Get user by ID."""
        return self.users.get(user_id)

    def get_all_users(self) -> List[User]:
        """Get all users, sorted by username."""
        return sorted(self.users.values())

    def get_admins(self) -> List[AdminUser]:
        """Get all admin users."""
        return [u for u in self.users.values() if isinstance(u, AdminUser)]

    def remove_user(self, user_id: int) -> bool:
        """Remove user."""
        if user_id in self.users:
            del self.users[user_id]
            return True
        return False


# Test it
if __name__ == "__main__":
    manager = UserManager()

    alice = manager.add_user("alice", "alice@example.com", UserRole.ADMIN)
    bob = manager.add_user("bob", "bob@example.com", UserRole.USER)
    charlie = manager.add_user("charlie", "charlie@example.com", UserRole.MODERATOR)

    print("=== All Users (sorted) ===")
    for user in manager.get_all_users():
        print(f"  {user.get_info()}")

    print("\n=== Admins ===")
    for admin in manager.get_admins():
        admin.ban_user(bob.id, "Spam")

    print("\n=== String Representations ===")
    print(f"str: {alice}")
    print(f"repr: {alice!r}")

    print("\n=== Equality & Hashing ===")
    alice2 = User(alice.id, "alice", "alice@example.com")
    print(f"alice == alice2: {alice == alice2}")

    user_set = {alice, bob, charlie, alice2}
    print(f"Set size (should be 3): {len(user_set)}")  # alice and alice2 are same
```

### Deliverables Checklist
- [ ] Create class hierarchy with inheritance
- [ ] Implement special methods (`__init__`, `__str__`, `__eq__`)
- [ ] Use abstract base classes for interfaces
- [ ] Compare dataclasses vs regular classes

---

## Milestone 6: Modules, Exceptions & Advanced Constructs

**In short:** split code into modules, and use generators and context managers for big data and safe clean-up.

### Learning Objectives
- Understand Python's module system
- Master exception handling patterns
- Learn generators and iterators
- Understand context managers

### Topics

#### 6.1 Modules & Packages
```python
# 1. Importing modules
import math
from math import sqrt
from math import sqrt as square_root
from math import *  # Avoid!

# 2. Module structure (professional style)
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
# Simplest and safest: "with" closes the file for you, even on errors
try:
    with open("data.txt") as file:
        data = file.read()
except FileNotFoundError:
    print("File not found")
else:
    print("Read", len(data), "characters")   # runs only if nothing failed
finally:
    print("Done")                           # always runs  # Runs always
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

for num in count_up_to(5):
    print(num)  # Prints 1, 2, 3, 4, 5

# 2. Generator expression (like list comprehension but lazy)
squares = (x ** 2 for x in range(1000000))
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

def parse_logs(filepath):
    """Yield parsed log entries."""
    with open(filepath) as f:
        for line in f:
            timestamp, level, message = line.split(' ', 2)
            yield {'timestamp': timestamp, 'level': level, 'message': message}

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

with database_connection("localhost") as db:
    result = db.query("SELECT * FROM users")

# 5. Useful contextlib utilities
from contextlib import suppress

with suppress(FileNotFoundError):
    os.remove("optional_file.txt")  # No error if missing

import io
from contextlib import redirect_stdout

f = io.StringIO()
with redirect_stdout(f):
    print("This goes to f, not console")
    output = f.getvalue()
```

### Assessment Criteria
- [ ] Understand module import system
- [ ] Can write custom exceptions
- [ ] Know when to use generators (memory efficiency)
- [ ] Can create context managers

### Mini-Project: Log Parser with Generators
**Goal:** Practice generators, context managers, and exceptions.

#### Project Structure
```
week6_project/
├── logs/
│   └── app.log            # Sample log file
├── src/
│   ├── log_parser.py       # Your solution
│   └── exceptions.py       # Custom exceptions
└── test_parser.py          # Tests
```

#### Implementation (`src/exceptions.py`)
```python
"""Custom exceptions for log parsing."""


class LogError(Exception):
    """Base exception for log parsing errors."""
    pass


class InvalidLogFormat(LogError):
    """Raised when log line has invalid format."""
    pass


class LogFileError(LogError):
    """Raised when log file cannot be read."""
    pass
```

#### Implementation (`src/log_parser.py`)
```python
"""Parse log files efficiently with generators."""
import re
from pathlib import Path
from datetime import datetime
from typing import Generator, Dict, Optional
from dataclasses import dataclass
from .exceptions import InvalidLogFormat, LogFileError


@dataclass
class LogEntry:
    """Parsed log entry."""
    timestamp: datetime
    level: str
    message: str

    def __str__(self) -> str:
        return f"[{self.level}] {self.timestamp}: {self.message}"


class LogParser:
    """Parse and process log files."""

    # Log line pattern: [2024-01-15 10:30:45] ERROR Some message
    PATTERN = re.compile(
        r'\[(\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2})\] (\w+) (.*)'
    )

    @staticmethod
    def parse_line(line: str) -> LogEntry:
        """Parse single log line."""
        match = LogParser.PATTERN.match(line.strip())

        if not match:
            raise InvalidLogFormat(f"Invalid log format: {line}")

        timestamp_str, level, message = match.groups()
        timestamp = datetime.strptime(timestamp_str, "%Y-%m-%d %H:%M:%S")

        return LogEntry(timestamp, level, message)

    @staticmethod
    def read_logs(filepath: str) -> Generator[LogEntry, None, None]:
        """
        Generator that yields parsed log entries.
        Memory efficient for large files.
        """
        try:
            with open(filepath) as f:
                for line_num, line in enumerate(f, 1):
                    if not line.strip():  # Skip empty lines
                        continue

                    try:
                        yield LogParser.parse_line(line)
                    except InvalidLogFormat as e:
                        print(f"Line {line_num}: {e}")
                        continue

        except FileNotFoundError as e:
            raise LogFileError(f"Log file not found: {filepath}") from e

    @staticmethod
    def filter_by_level(logs: Generator[LogEntry, None, None],
                       level: str) -> Generator[LogEntry, None, None]:
        """Generator that filters logs by level."""
        for log in logs:
            if log.level == level:
                yield log

    @staticmethod
    def count_by_level(filepath: str) -> Dict[str, int]:
        """Count logs by level (uses generator internally)."""
        counts: Dict[str, int] = {}

        for log in LogParser.read_logs(filepath):
            counts[log.level] = counts.get(log.level, 0) + 1

        return counts

    @staticmethod
    def get_errors_after(filepath: str, timestamp: datetime) -> Generator[LogEntry, None, None]:
        """Get error logs after specific timestamp."""
        for log in LogParser.read_logs(filepath):
            if log.level == "ERROR" and log.timestamp >= timestamp:
                yield log


class LogManager:
    """Context manager for log file operations."""

    def __init__(self, filepath: str):
        self.filepath = filepath
        self.logs: list[LogEntry] = []

    def __enter__(self) -> 'LogManager':
        """Load logs on entering context."""
        try:
            for log in LogParser.read_logs(self.filepath):
                self.logs.append(log)
        except LogFileError as e:
            print(f"Error loading logs: {e}")

        return self

    def __exit__(self, exc_type, exc_val, exc_tb) -> None:
        """Cleanup on exiting context."""
        self.logs.clear()

    def get_summary(self) -> Dict[str, int]:
        """Get log summary."""
        return LogParser.count_by_level(self.filepath)

    def find_errors(self) -> list[LogEntry]:
        """Find all error logs."""
        return [log for log in self.logs if log.level == "ERROR"]


# Usage
if __name__ == "__main__":
    print("=== Using Context Manager ===")
    with LogManager("logs/app.log") as manager:
        summary = manager.get_summary()
        print("Log summary:", summary)

        errors = manager.find_errors()
        print(f"Found {len(errors)} errors")

    print("\n=== Using Generators ===")
    error_count = 0
    for error_log in LogParser.filter_by_level(
        LogParser.read_logs("logs/app.log"),
        "ERROR"
    ):
        print(f"Error: {error_log.message}")
        error_count += 1

    print(f"Total errors: {error_count}")
    print(f"\nMemory usage: Generators process line-by-line")
```

### Deliverables Checklist
- [ ] Create a package with multiple modules
- [ ] Write custom exceptions for your domain
- [ ] Implement a generator for large data processing
- [ ] Create a context manager for resource management

---

## Milestone 7: Real-World Skills (File I/O, Regex, Profiling)

**In short:** read and write files, find text patterns with regex, log what happens, and measure speed.

### Learning Objectives
- Master file operations and path handling
- Understand regular expressions
- Learn performance profiling
- Understand logging best practices

### Topics

#### 7.1 File I/O & Path Handling
```python
# 1. Modern path handling (pathlib)
from pathlib import Path

config_path = Path("config.json")
if config_path.exists():
    content = config_path.read_text()

data_dir = Path("data")
data_dir.mkdir(parents=True, exist_ok=True)

json_files = list(data_dir.glob("*.json"))   # Glob pattern
all_files = list(data_dir.rglob("*"))         # Recursive

# 2. Text file operations
lines = Path("data.txt").read_text().split('\n')

for line in Path("data.txt").open():          # Memory efficient
    process(line)

Path("output.txt").write_text("Hello World")

# 3. CSV handling (professional)
import csv
from pathlib import Path

with open("data.csv") as f:
    reader = csv.DictReader(f)  # Returns dict for each row
    for row in reader:
        print(row['name'], row['age'])

with open("output.csv", "w", newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['name', 'age'])
    writer.writeheader()
    writer.writerows([
        {'name': 'Alice', 'age': 30},
        {'name': 'Bob', 'age': 25},
    ])

# 4. JSON handling
import json

data = json.loads(Path("config.json").read_text())
output = json.dumps(data, indent=2)
Path("output.json").write_text(output)

with open("data.json") as f:
    data = json.load(f)

with open("data.json", "w") as f:
    json.dump(data, f, indent=2)
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
EMAIL_PATTERN = re.compile(r"[\w\.-]+@[\w\.-]+\.\w+")
PHONE_PATTERN = re.compile(r"(\d{3})-(\d{3})-(\d{4})")

for line in large_file:
    if EMAIL_PATTERN.search(line):
        handle_email_line(line)
    elif PHONE_PATTERN.search(line):
        handle_phone_line(line)

# 6. Advanced: Named groups
pattern = r"(?P<year>\d{4})-(?P<month>\d{2})-(?P<day>\d{2})"
text = "Today is 2024-01-15"
match = re.search(pattern, text)
print(match.group('year'))   # 2024
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
import json
from datetime import datetime

def log_request(method, url, status, duration):
    """Log in structured JSON format."""
    log_data = {
        'timestamp': datetime.now().isoformat(),
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
import timeit

stmt1 = "[1, 2, 3] + [4, 5, 6]"
time1 = timeit.timeit(stmt1, number=100000)

stmt2 = """
x = [1, 2, 3]
x.extend([4, 5, 6])
"""
time2 = timeit.timeit(stmt2, number=100000)

print(f"Concatenation: {time1:.4f}s")
print(f"Extend: {time2:.4f}s")

# 4. Memory profiling
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
        transformed = expensive_operation(item)
        result.append(transformed)
    return result
# Run with: kernprof -l script.py
```

### Assessment Criteria
- [ ] Can use pathlib fluently
- [ ] Understand regex patterns and groups
- [ ] Know logging levels and formats
- [ ] Can identify performance bottlenecks

### Mini-Project: Data Processing Pipeline
**Goal:** Practice file I/O, regex, and profiling.

#### Implementation
```python
"""Data processing pipeline for CSV analysis."""
import csv
import re
from pathlib import Path
from typing import List, Dict
import time
from functools import wraps


def timing_decorator(func):
    """Measure function execution time."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.time()
        result = func(*args, **kwargs)
        duration = time.time() - start
        print(f"{func.__name__} took {duration:.4f}s")
        return result
    return wrapper


class DataProcessor:
    """Process CSV data with validation."""

    EMAIL_PATTERN = re.compile(r'^[\w\.-]+@[\w\.-]+\.\w+$')
    PHONE_PATTERN = re.compile(r'^\+?\d{10,14}$')

    @staticmethod
    @timing_decorator
    def load_csv(filepath: str) -> List[Dict]:
        """Load CSV file."""
        data = []
        with open(filepath) as f:
            reader = csv.DictReader(f)
            for row in reader:
                data.append(row)
        return data

    @staticmethod
    def validate_email(email: str) -> bool:
        """Validate email format."""
        return bool(DataProcessor.EMAIL_PATTERN.match(email))

    @staticmethod
    def validate_phone(phone: str) -> bool:
        """Validate phone format."""
        return bool(DataProcessor.PHONE_PATTERN.match(phone))

    @staticmethod
    @timing_decorator
    def process_data(data: List[Dict]) -> Dict:
        """Process and validate data."""
        results = {
            'total': len(data),
            'valid_emails': 0,
            'valid_phones': 0,
            'invalid_records': []
        }

        for i, record in enumerate(data):
            email_valid = DataProcessor.validate_email(record.get('email', ''))
            phone_valid = DataProcessor.validate_phone(record.get('phone', ''))

            if email_valid:
                results['valid_emails'] += 1
            if phone_valid:
                results['valid_phones'] += 1

            if not (email_valid and phone_valid):
                results['invalid_records'].append(i)

        return results

    @staticmethod
    @timing_decorator
    def save_results(results: Dict, filepath: str) -> None:
        """Save results to file."""
        Path(filepath).write_text(str(results))


# Usage
if __name__ == "__main__":
    csv_data = """name,email,phone
Alice,alice@example.com,+12025551234
Bob,bob@invalid,5551234567
Charlie,charlie@example.com,12025551234
Diana,diana@example.com,invalid"""

    Path("data.csv").write_text(csv_data)

    data = DataProcessor.load_csv("data.csv")
    results = DataProcessor.process_data(data)
    DataProcessor.save_results(results, "results.txt")

    print(f"\nResults: {results}")
```

### Deliverables Checklist
- [ ] Write file I/O code for CSV/JSON processing
- [ ] Use regex to parse/validate data
- [ ] Implement structured logging
- [ ] Profile and optimize a function

---

## END OF PHASE 1 CHECKPOINT

### Cumulative Skills Checkpoint
By the end of Milestone 7, you should be able to:

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

### Portfolio Checkpoint

By completing Milestones 1–7 you will have built 7 mini-projects on GitHub:

```
github.com/[username]/python-mastery/
├── milestone1-config-manager/          Milestone 1 mini-project
├── milestone2-json-parser/             Milestone 2 mini-project
├── milestone3-email-validator/         Milestone 3 mini-project
├── milestone4-rate-limiter/            Milestone 4 mini-project
├── milestone5-user-management/         Milestone 5 mini-project
├── milestone6-log-parser/              Milestone 6 mini-project
├── milestone7-data-pipeline/           Milestone 7 mini-project
└── README.md                      Master README
```

| Milestone | Project | Key Skills |
|------|---------|-----------|
| 1 | Config Manager | Type hints, virtualenv setup, classes |
| 2 | API Response Parser | Collections, comprehensions, JSON |
| 3 | Email Validator | Conditionals, guard clauses, regex |
| 4 | Rate Limiter | Decorators, closures, functional patterns |
| 5 | User Management | OOP, inheritance, special methods |
| 6 | Log Parser | Generators, context managers, exceptions |
| 7 | Data Pipeline | File I/O, regex, profiling |

**Portfolio value:** 7 complete working projects · ~2,000 lines of clean code · 40+ passing tests · performance benchmarks · professional git history · real-world patterns demonstrated.

### Milestone 7 Checkpoint (Everyone)
- [ ] 7 mini-projects completed and tested
- [ ] 40+ test cases passing
- [ ] Understanding of Pythonic code patterns
- [ ] Comfort with real-world scenarios (file I/O, regex, profiling, logging)
- [ ] Professional code organization and git workflow

---

## PHASE 2: Choose Your Professional Path
### Milestones 8–16

*(Pick your track: SDET, SDE, or SRE. Each track builds directly on the Phase 1 foundation above.)*

---

## SDET TRACK: Advanced Testing & Test Automation
### Milestones 8–13

**Your focus:** Building reliable test frameworks and automation suites.

| Milestone | Topic | Real-World Application |
|------|-------|------------------------|
| 8 | Advanced Testing (pytest) | Test fixtures, parametrization |
| 9 | Mocking & Isolation | Isolate code for testing |
| 10 | CI/CD Integration | GitHub Actions, test reporting |
| 11 | Selenium & Frameworks | Web automation at scale |
| 12 | Performance & Async Testing | Load testing, test optimization |
| 13 | Capstone | Full QA automation suite |

**Job context:** SDETs spend 50–80% of their time on advanced testing, mocking, and CI/CD. This track teaches the professional patterns used in production test suites at companies like Google, Meta, Amazon, and Microsoft.

**Mini-projects (Milestones 8–13):**
- Milestone 8: Pytest framework with 50+ tests
- Milestone 9: Mocking library for test isolation
- Milestone 10: CI/CD pipeline setup
- Milestones 11–12: Selenium test suite for a real application
- Milestone 13: Capstone — full QA automation suite

---

### MILESTONE 8: Advanced Testing with Pytest

**Why it matters:** SDETs spend 80% of their time building tests. SDEs must write testable code. SREs need chaos/failure tests.

### Learning Objectives
- Master the pytest framework and plugins
- Understand fixtures and conftest
- Learn parametrization for data-driven testing
- Understand test markers and filtering

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
    assert input.upper() == expected

# 2. Multiple parameters
@pytest.mark.parametrize("username,password,expected", [
    ("alice", "correct_pass", True),
    ("alice", "wrong_pass", False),
    ("bob", "correct_pass", False),
    ("", "", False),
])
def test_login(username, password, expected):
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

# 2. Custom markers
# pytest.ini
# [pytest]
# markers =
#     slow: marks tests as slow
#     integration: marks tests as integration tests
#     smoke: marks tests as smoke tests

@pytest.mark.slow
def test_large_dataset():
    pass

@pytest.mark.integration
def test_with_database():
    pass

@pytest.mark.smoke
def test_critical_path():
    pass

# Run specific markers:
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

### Test Categories by Role
```
├─ UNIT TESTS (SDET/SDE focus)
│  ├─ Single function/method
│  ├─ All dependencies mocked
│  ├─ Fast (< 100ms)
│  └─ Run in CI on every commit
│
├─ INTEGRATION TESTS (SDET focus)
│  ├─ Multiple components together
│  ├─ Real database/API
│  ├─ Medium speed (seconds)
│  └─ Run in CI nightly
│
├─ END-TO-END TESTS (SDET primary)
│  ├─ Full user workflows
│  ├─ Real browser/client
│  ├─ Slow (minutes)
│  └─ Run periodically
│
├─ SMOKE TESTS (SRE focus)
│  ├─ Critical path verification
│  ├─ Post-deployment check
│  └─ Fast, core functionality
│
└─ CHAOS TESTS (SRE primary)
   ├─ Failure injection
   ├─ Resilience verification
   └─ Pre-incident testing
```

### Deliverables Checklist
- [ ] Create comprehensive test suite with fixtures
- [ ] Use parametrization for data-driven tests
- [ ] Organize tests into unit/integration/e2e
- [ ] Create shared conftest.py

### Assessment Criteria
- [ ] Can design fixture hierarchy
- [ ] Understand parametrization patterns
- [ ] Know test organization best practices
- [ ] Can filter/run specific test sets

**Why it matters:** SDET/SDE spend ~50% of time here — essential.

---

## MILESTONE 9: Mocking & Test Isolation

### Learning Objectives
- Master the `unittest.mock` library
- Understand `patch`, `MagicMock`, and `side_effect`
- Learn when to mock vs integrate
- Develop test isolation strategies

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
# Always patch where the object is USED, not where it's defined

# Bad: from myapp.database import query
# @patch('myapp.database.query')  # Wrong location

# Good: patch where query is used
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

mock.method.assert_called_once_with(3, 4, key='other')  # This asserts LAST call only if call_count==1
assert mock.method.call_count == 2
assert mock.method.call_args == call(3, 4, key='other')
assert mock.method.call_args_list == [
    call(1, 2, key='value'),
    call(3, 4, key='other')
]

# 5. Mocking classes
@patch('myapp.UserService')
def test_with_mocked_class(mock_user_service):
    mock_instance = Mock()
    mock_user_service.return_value = mock_instance
    mock_instance.get_user.return_value = {'id': 1}

    service = UserService()
    user = service.get_user(1)

    assert user == {'id': 1}
    mock_user_service.assert_called_once()
    mock_instance.get_user.assert_called_once_with(1)

# 6. Testing retry logic
@patch('myapp.api.request')
def test_retry_logic(mock_request):
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

# 4. Mocking file operations
@patch('builtins.open', create=True)
def test_file_operations(mock_open):
    mock_open.return_value.__enter__.return_value.read.return_value = "test data"
    with open("test.txt") as f:
        data = f.read()
    assert data == "test data"
    mock_open.assert_called_once_with("test.txt")

# 5. Spy (partial mock — calls real method but tracks calls)
@patch('myapp.logger.info')
def test_with_spy(mock_logger):
    result = do_something_that_logs()
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
        cached = self.cache.get(user_id)
        if cached:
            return cached
        user = self.db.query("SELECT * FROM users WHERE id = ?", (user_id,))  # never build SQL with f-strings
        self.cache.set(user_id, user)
        return user

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
def test_user_validation():
    """Good test — only mocks the external dependency."""
    mock_db = Mock()
    service = UserService(mock_db, cache=None)
    with pytest.raises(ValueError):
        service.add_user({'name': '', 'email': 'invalid'})

# Strategy 3: Test levels
def test_validate_email():  # Unit: no mocks needed
    assert is_valid_email("test@example.com")
    assert not is_valid_email("invalid")

@patch('external_api.request')  # Integration: only mock external
def test_get_user_with_fallback(mock_api):
    mock_api.side_effect = ConnectionError()
    user = get_user_with_fallback(1)  # Uses both api and cache

def test_user_workflow_e2e():  # E2E: use real DB, real cache
    service = UserService(RealDatabase(), RealCache())
    user = service.add_user({'name': 'Alice', 'email': 'alice@example.com'})
    fetched = service.get_user(user.id)
    assert fetched.name == 'Alice'
```

### Real-World Mocking Scenarios
```python
# SCENARIO 1: Testing without hitting a real external API
@patch('requests.get')
def test_user_service_calls_api(mock_get):
    mock_get.return_value.json.return_value = {'id': 1, 'name': 'Alice'}
    mock_get.return_value.status_code = 200

    user = UserService().get_user(1)

    assert user.name == 'Alice'
    mock_get.assert_called_once_with('https://api.example.com/users/1')

# SCENARIO 2: Testing error scenarios without breaking real systems
@patch('database.connection')
def test_handles_database_down(mock_db):
    mock_db.side_effect = ConnectionError("DB down")
    with pytest.raises(ServiceUnavailable):
        UserService().get_user(1)

# SCENARIO 3: Testing retry logic
@patch('http.request')
def test_retry_on_timeout(mock_request):
    mock_request.side_effect = [TimeoutError(), {'status': 'success'}]
    result = resilient_http_request('GET', '/api/data')
    assert result == {'status': 'success'}
    assert mock_request.call_count == 2

# SCENARIO 4: Testing async code
@pytest.mark.asyncio
async def test_async_operation():
    with patch('aiohttp.ClientSession.get') as mock_get:
        mock_get.return_value = AsyncMock(
            status=200,
            json=AsyncMock(return_value={'data': 'value'})
        )
        result = await fetch_data()
        assert result['data'] == 'value'
```

### Deliverables Checklist
- [ ] Test retry logic with mocked failures
- [ ] Mock HTTP requests and verify calls
- [ ] Test database operations with mocks
- [ ] Identify and fix over-mocked tests

### Assessment Criteria
- [ ] Understand when to mock vs integrate
- [ ] Can configure complex mock behaviors
- [ ] Know call tracking and assertions
- [ ] Understand test isolation strategies

**Why it matters:** Foundational skill for both SDET and SDE roles.

---

## MILESTONE 10: CI/CD Integration & Test Reporting

**Why it matters:** Tests are useless if they don't run automatically.

### Learning Objectives
- Set up GitHub Actions for Python testing
- Understand CI/CD best practices
- Create test reports and dashboards
- Handle flaky tests

### Coverage

```
├─ GITHUB ACTIONS WITH PYTHON
│  ├─ Setting up Python in GitHub Actions
│  ├─ Running pytest in CI
│  ├─ Caching dependencies
│  ├─ Matrix testing (multiple Python versions)
│  ├─ Artifact collection (screenshots, videos, reports)
│  ├─ Secrets management
│  └─ Conditional steps based on failure
│
├─ GITLAB CI
│  ├─ .gitlab-ci.yml configuration
│  ├─ Pipeline stages
│  ├─ Parallel job execution
│  └─ Container-based testing
│
├─ JENKINS
│  ├─ Declarative pipelines
│  ├─ Groovy scripting
│  ├─ Plugin integration
│  └─ Email notifications on failure
│
├─ TEST REPORTING IN CI
│  ├─ JUnit XML format
│  ├─ Allure reports integration
│  ├─ Slack notifications
│  ├─ HTML reports
│  └─ Trend dashboards
│
└─ FLAKY TEST HANDLING
   ├─ Detecting flaky tests
   ├─ Retry strategies
   ├─ Test isolation
   └─ Root cause analysis
```

### Real Example: SDET's GitHub Actions Workflow
```yaml
name: Test Suite
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        python-version: ['3.11', '3.12', '3.13']

    steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-python@v5
      with:
        python-version: ${{ matrix.python-version }}
        cache: pip
    - run: pip install -r requirements-test.txt

    - name: Run Unit Tests
      run: pytest tests/unit -v --cov=src

    - name: Run Integration Tests
      run: pytest tests/integration -v

    - name: Run E2E Tests (Chrome)
      run: pytest tests/e2e -v --browser=chrome

    - name: Upload Screenshots on Failure
      if: failure()
      uses: actions/upload-artifact@v4
      with:
        name: screenshots
        path: screenshots/

    - name: Publish Results
      run: allure generate --clean -o allure-report

    - name: Notify Slack
      if: failure()
      run: |
        curl -X POST $SLACK_WEBHOOK \
          -d 'text=Tests failed!'
```

### Deliverables Checklist
- [ ] Create `.github/workflows/test.yml`
- [ ] Set up matrix testing (multiple Python versions)
- [ ] Integrate coverage reporting
- [ ] Create test artifacts collection

**Why it matters:** Makes tests actually run and get discovered.

---

## MILESTONE 11: Selenium & Test Automation Frameworks

**Why it matters:** SDETs build frameworks, not just tests.

### Learning Objectives
- Master Selenium WebDriver
- Implement Page Object Model (POM)
- Handle waits and synchronization
- Build maintainable test frameworks

### Coverage

```
├─ SELENIUM (Web Testing)
│  ├─ WebDriver basics
│  ├─ Page Object Model (POM)
│  ├─ Waits & synchronization
│  ├─ Browser management
│  └─ Cross-browser testing
│
├─ API TESTING FRAMEWORKS
│  ├─ requests library (HTTP client)
│  ├─ API contract testing
│  ├─ GraphQL testing
│  └─ API versioning
│
├─ TEST REPORTING & ALLURE
│  ├─ Detailed test reports
│  ├─ Failure analysis
│  ├─ Screenshots/videos in reports
│  └─ Trend analysis
│
├─ MOBILE TESTING
│  ├─ Appium basics
│  ├─ Android/iOS differences
│  ├─ Device management
│  └─ Mobile-specific waits
│
└─ PERFORMANCE TESTING
   ├─ Locust for load testing
   ├─ JMeter integration
   ├─ Response time analysis
   └─ Bottleneck identification
```

### Example: Page Object Model with Fixtures
```python
@pytest.fixture(scope="session")
def browser():
    driver = webdriver.Chrome()
    yield driver
    driver.quit()

@pytest.fixture
def login_page(browser):
    return LoginPage(browser)

# a list of (username, password, should_succeed) tuples — one test run each
@pytest.mark.parametrize("username, password, should_succeed", [
    ("valid_user", "valid_pass", True),
    ("invalid_user", "wrong_pass", False),
    ("", "", False),
])
def test_login(login_page, username, password, should_succeed):
    login_page.login(username, password)
    assert login_page.error_message_visible == (not should_succeed)
```

### Deliverables Checklist
- [ ] Create POM-based test suite
- [ ] Implement explicit/implicit waits
- [ ] Build cross-browser test matrix
- [ ] Create test reporting

**Why it matters:** SDET differentiator skill.

---

## MILESTONE 12: Advanced Testing & Performance (Async Testing)

**Why it matters:** Modern APIs are async.

### Learning Objectives
- Understand async testing
- Learn performance testing
- Master test coverage analysis
- Optimize test execution

```python
# ASYNC/AWAIT TESTING PATTERNS

# 1. Basic async test
import pytest

@pytest.mark.asyncio
async def test_async_operation():
    result = await some_async_function()
    assert result == expected_value

# 2. Testing with mock async calls
from unittest.mock import AsyncMock, patch

@pytest.mark.asyncio
async def test_api_call_async():
    with patch('aiohttp.ClientSession.get') as mock_get:
        mock_get.return_value = AsyncMock(
            status=200,
            json=AsyncMock(return_value={'data': 'value'})
        )
        result = await api_client.get_data()
        assert result['data'] == 'value'

# 3. Testing concurrent operations
@pytest.mark.asyncio
async def test_multiple_requests():
    tasks = [
        api_client.get_user(1),
        api_client.get_user(2),
        api_client.get_user(3),
    ]
    users = await asyncio.gather(*tasks)
    assert len(users) == 3
    assert users[0].id == 1

# 4. Testing timeout/cancellation
@pytest.mark.asyncio
async def test_request_timeout():
    with pytest.raises(asyncio.TimeoutError):
        await asyncio.wait_for(slow_operation(), timeout=1.0)

# 5. Testing exception handling in async
@pytest.mark.asyncio
async def test_async_exception_handling():
    with patch('database.query', new_callable=AsyncMock) as mock_query:
        mock_query.side_effect = asyncio.TimeoutError()
        with pytest.raises(ServiceUnavailable):
            await UserService().get_user(1)
```

### Deliverables Checklist
- [ ] Write async/await tests
- [ ] Create a load test scenario (Locust)
- [ ] Achieve >90% coverage
- [ ] Optimize test execution time

**Why it matters:** Essential as async becomes standard.

---

## MILESTONE 13: Cross-Functional Patterns & SDET Capstone

### Learning Objectives
- Integrate testing with deployment
- Implement smoke tests
- Build comprehensive test strategy
- Complete SDET capstone project

### 13.1 Testing in Production
- Smoke tests after deployment
- Canary testing strategy
- Feature flag testing
- Production incident testing

### 13.2 Test Strategy & Organization
- Test pyramid (unit/integration/e2e ratio)
- Test data management
- Test flakiness elimination
- Test metrics and dashboards

### Deliverable: SDET Capstone Project
Build a complete test automation suite for a real application:
- Unit tests (>80% coverage)
- Integration tests (key workflows)
- E2E tests (critical paths)
- CI/CD integration
- Test reporting and dashboards
- Documentation

### Milestone 13 Checkpoint (SDET)
- [ ] Test suite with 100+ tests
- [ ] CI/CD pipeline running tests automatically
- [ ] Automation framework (Selenium, pytest, POM)
- [ ] Can test complex applications
- [ ] Ready for SDET job interviews

---

## SDE TRACK: Backend Development & Production Readiness
### Milestones 8–13

**Your focus:** Building production services and systems.

| Milestone | Topic | Real-World Application |
|------|-------|------------------------|
| 8 | Package Publishing | Ship code as PyPI packages |
| 9 | Async & Message Queues | Build task queues with Celery |
| 10 | Databases | ORM integration, data models |
| 11 | REST APIs | FastAPI/Flask best practices |
| 12 | Security | Authentication, encryption, secrets |
| 13 | Capstone | Production microservice |

**Job context:** SDEs need deployment, packaging, and security knowledge daily.

**Mini-projects (Milestones 8–13):**
- Milestone 8: Package publishing to PyPI
- Milestone 9: Async task queue (Celery)
- Milestone 10: Database ORM integration
- Milestone 11: REST API with error handling
- Milestone 12: Security & authentication
- Milestone 13: Capstone — microservice with all patterns

---

### MILESTONE 8: Package Publishing

**Why it matters:** SDEs ship code as packages.

### Coverage
```
├─ PACKAGE STRUCTURE
│  ├─ src/ layout best practices
│  ├─ __init__.py usage
│  ├─ Package namespaces
│  └─ Subpackage organization
│
├─ MODERN PACKAGING (pyproject.toml)
│  ├─ PEP 517/518 standards
│  ├─ Dependencies specification
│  ├─ Version management (single source of truth)
│  ├─ Metadata (author, license, urls)
│  └─ Build system configuration
│
├─ SETUPTOOLS & BUILD
│  ├─ setup.py (legacy) vs pyproject.toml (modern)
│  ├─ Entry points (command-line tools)
│  ├─ Package data & manifests
│  ├─ C extensions (when needed)
│  └─ Building wheels vs source distributions
│
├─ VERSION MANAGEMENT
│  ├─ Semantic versioning (MAJOR.MINOR.PATCH)
│  ├─ Pre-releases (alpha, beta, rc)
│  ├─ Single source of truth
│  ├─ Automatic versioning (setuptools-scm)
│  └─ Changelog management
│
├─ PUBLISHING TO PyPI
│  ├─ PyPI account & API token setup
│  ├─ Test PyPI for practice
│  ├─ Publishing with twine
│  ├─ Post-release updates
│  └─ Yanking bad releases
│
├─ PRIVATE PACKAGE REPOSITORIES
│  ├─ AWS CodeArtifact
│  ├─ Azure Artifacts
│  ├─ Artifactory / Nexus
│  └─ Self-hosted PyPI
│
└─ DEPENDENCY MANAGEMENT
   ├─ requirements.txt (old school)
   ├─ Pinning versions (reproducibility)
   ├─ Semantic versioning in dependencies
   ├─ Transitive dependencies
   ├─ requirements-dev.txt (optional deps)
   └─ Testing in multiple environments
```

### Real Example: Modern Package Structure
```
my_package/
├─ pyproject.toml          # Modern packaging config
├─ README.md
├─ LICENSE
├─ src/
│  └─ my_package/
│     ├─ __init__.py
│     ├─ core.py
│     └─ utils.py
├─ tests/
│  ├─ conftest.py
│  ├─ test_core.py
│  └─ test_utils.py
└─ .github/
   └─ workflows/
      └─ publish.yml       # Automated publishing
```

### `pyproject.toml` Example
```toml
[build-system]
requires = ["setuptools>=61.0", "wheel"]
build-backend = "setuptools.build_meta"

[project]
name = "my-package"
version = "1.0.0"
description = "A useful package"
authors = [{name = "Your Name", email = "you@example.com"}]
requires-python = ">=3.9"
dependencies = [
    "requests>=2.25.0",
    "pydantic>=1.8.0",
]

[project.optional-dependencies]
dev = [
    "pytest>=6.0",
    "pytest-cov>=2.0",
    "black>=21.0",
]

[project.urls]
Homepage = "https://github.com/you/my-package"
```

**Why it matters:** Essential for SDEs shipping code.

---

## MILESTONE 9: Async & Message Queues (Celery)

**Why it matters:** SDEs build async systems; SREs monitor them.

### Coverage
```
├─ MESSAGE QUEUE CONCEPTS
│  ├─ Async task processing
│  ├─ Producer-consumer pattern
│  ├─ Message routing
│  ├─ Queue durability
│  └─ Retry & dead letter queues
│
├─ CELERY (Distributed Task Queue)
│  ├─ Task definition
│  ├─ Task scheduling (Celery Beat)
│  ├─ Result backends
│  ├─ Worker configuration
│  ├─ Monitoring tasks
│  └─ Error handling & retries
│
├─ RABBITMQ BASICS
│  ├─ Exchanges & bindings
│  ├─ Queue configuration
│  ├─ Message properties
│  └─ Acknowledgment patterns
│
├─ KAFKA INTEGRATION
│  ├─ Topic-based messaging
│  ├─ Consumer groups
│  ├─ Partition strategy
│  └─ Stream processing
│
├─ AWS SQS & SNS
│  ├─ Simple Queue Service patterns
│  ├─ Simple Notification Service
│  ├─ Pub-sub vs queue patterns
│  └─ Integration with Lambda
│
└─ TESTING MESSAGE QUEUES
   ├─ Mocking Celery tasks
   ├─ Testing retry logic
   ├─ Testing dead letter handling
   └─ Integration testing with real broker
```

### Real Example: Celery Task for Email
```python
import smtplib
from unittest.mock import patch

from celery import Celery

app = Celery('myapp', broker='redis://localhost:6379/0')

@app.task(bind=True, max_retries=3)
def send_email(self, email: str, subject: str, body: str):
    """Send email with exponential backoff retry."""
    try:
        send_via_smtp(email, subject, body)
        print(f"Email sent to {email}")
    except smtplib.SMTPException as exc:
        # 1st retry: 5s, 2nd: 25s, 3rd: 125s
        raise self.retry(exc=exc, countdown=5 ** self.request.retries)

# Test it (this file is tasks.py, so patch "tasks.send_via_smtp"):
def test_send_email_success():
    with patch('tasks.send_via_smtp') as mock_smtp:
        send_email.apply(args=['user@example.com', 'Hello', 'Message'])   # runs right here
        mock_smtp.assert_called_once_with('user@example.com', 'Hello', 'Message')

def test_send_email_retries_on_smtp_error():
    with patch('tasks.send_via_smtp') as mock_smtp, \
         patch.object(send_email, 'retry', side_effect=RuntimeError('retry requested')) as mock_retry:
        mock_smtp.side_effect = smtplib.SMTPException("Connection failed")
        send_email.apply(args=['user@example.com', 'Hello', 'Message'])
        mock_retry.assert_called_once()                              # a retry was scheduled

# Monitor tasks:
def monitor_tasks():
    inspector = app.control.inspect()
    active_tasks = inspector.active()
    for worker, tasks in active_tasks.items():
        print(f"{worker}: {len(tasks)} tasks")
        for task in tasks:
            print(f"  - {task['name']} (ETA: {task['eta']})")
```

**Why it matters:** Essential for async SDE systems.

---

## MILESTONE 10: Databases

**Coverage (foundational — deliberately not a DBA-level deep dive; see [Scope](#scope-what-this-guide-deliberately-doesnt-cover)):**
- SQL basics and SQLite for local/simple use cases
- SQLAlchemy ORM: models, sessions, basic relationships, connection handling
- Query optimization basics (indexing, `EXPLAIN`)
- When to reach for PostgreSQL-specific features (JSON/JSONB, full-text search) vs. when that's DBA territory

**Mini-project:** Add an ORM-backed persistence layer to your Milestone 9 async service — store task results in SQLite via SQLAlchemy, write tests using an in-memory database.

**Deliverables Checklist**
- [ ] Model your domain with SQLAlchemy
- [ ] Read/write through a repository layer (not raw SQL scattered through the app)
- [ ] Write tests against an in-memory/test database, not production

---

## MILESTONE 11: REST APIs

**Coverage (foundational — Flask/FastAPI basics cover the majority of SDE use cases; deep framework internals are out of scope, see [Scope](#scope-what-this-guide-deliberately-doesnt-cover)):**
- Building endpoints with FastAPI or Flask
- Request/response validation with Pydantic
- Error handling and status codes
- Basic middleware and dependency injection

**Mini-project:** Wrap your Milestone 10 persistence layer in a REST API with FastAPI: CRUD endpoints, input validation, structured error responses, and endpoint tests with `TestClient`.

**Deliverables Checklist**
- [ ] CRUD endpoints with proper status codes
- [ ] Request validation (reject bad input before it hits business logic)
- [ ] Endpoint tests using FastAPI's `TestClient` / Flask's test client

---

## MILESTONE 12: Security Best Practices

**Why it matters:** Security vulnerabilities are career-ending.

### Coverage
```
├─ INPUT VALIDATION & SANITIZATION
│  ├─ SQL injection prevention
│  ├─ Command injection prevention
│  ├─ XSS prevention (if building web UI)
│  ├─ CSRF protection
│  └─ Validation libraries (pydantic)
│
├─ CRYPTOGRAPHY
│  ├─ Hashing (bcrypt for passwords, hashlib)
│  ├─ Encryption (cryptography library)
│  ├─ Key management
│  ├─ Symmetric vs asymmetric
│  └─ JWT tokens & signing
│
├─ SECRETS MANAGEMENT
│  ├─ Environment variables (python-dotenv)
│  ├─ AWS Secrets Manager integration
│  ├─ HashiCorp Vault
│  ├─ Never commit secrets to git
│  └─ Secret rotation
│
├─ AUTHENTICATION
│  ├─ Password hashing (bcrypt, argon2)
│  ├─ OAuth 2.0 basics
│  ├─ JWT vs session tokens
│  └─ Multi-factor authentication
│
├─ AUTHORIZATION
│  ├─ Role-based access control (RBAC)
│  ├─ Attribute-based access control (ABAC)
│  └─ Permission checking middleware
│
├─ DEPENDENCY SECURITY
│  ├─ Scanning for vulnerabilities (pip-audit, safety)
│  ├─ Dependency pinning
│  ├─ Regular updates
│  └─ Transitive dependency issues
│
├─ SECURE CODING PRACTICES
│  ├─ Avoiding insecure deserialization (pickle)
│  ├─ Secure file operations
│  ├─ Safe subprocess calls
│  └─ Error message handling (don't leak info)
│
└─ COMPLIANCE & LOGGING
   ├─ Audit logging
   ├─ PII handling
   ├─ GDPR compliance
   └─ SOC 2 considerations
```

### Real Example: Secure Authentication
Store a slow, salted *hash* of each password — never the password itself. The standard library can do it:

```python
import hashlib
import secrets

ITERATIONS = 600_000

def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)                 # random bytes, different per user
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS)
    return (salt + key).hex()                      # store salt and hash together

def verify_password(password: str, stored: str) -> bool:
    data = bytes.fromhex(stored)
    salt, expected = data[:16], data[16:]
    key = hashlib.pbkdf2_hmac("sha256", password.encode(), salt, ITERATIONS)
    return secrets.compare_digest(key, expected)   # comparison that doesn't leak timing

stored = hash_password("SecurePassword123!")
verify_password("SecurePassword123!", stored)     # True
verify_password("wrong", stored)                  # False
```

In real projects a maintained library such as `argon2-cffi` or `bcrypt` is even better.

**Why it matters:** Prevents security breaches.

---

## MILESTONE 13: SDE Capstone — Production Microservice

Combine Milestones 8–12 into a single deployable service:
- Published as an installable package (Milestone 8 patterns)
- Background work handled via Celery (Milestone 9 patterns)
- Persisted through SQLAlchemy (Milestone 10 patterns)
- Exposed via a FastAPI REST layer (Milestone 11 patterns)
- Hardened with authentication, input validation, and secrets management (Milestone 12 patterns)
- See [Deployment Strategies](#deployment-strategies-sdesre-shared) below for how to ship it safely

### Milestone 13 Checkpoint (SDE)
- [ ] Package published to PyPI (or a private index)
- [ ] REST API with proper error handling
- [ ] Async tasks with Celery
- [ ] Database integration
- [ ] Ready for backend engineering interviews

---

## Deployment Strategies (SDE/SRE Shared)

**Why it matters:** Deployment is where things break. This section applies to both the SDE capstone above and the SRE track below.

### Coverage
```
├─ DEPLOYMENT PATTERNS
│  ├─ Blue-Green Deployment — zero-downtime switching between versions
│  ├─ Canary Deployment — route a small % of traffic to the new version
│  ├─ Rolling Updates — gradually replace old instances
│  ├─ Feature Flags — control features without deployments
│  └─ A/B Testing — test variations with real users
│
├─ CONTAINERIZATION
│  ├─ Docker basics
│  ├─ Dockerfile for Python apps
│  ├─ Multi-stage builds (small images)
│  ├─ Container registry (Docker Hub, ECR, GCR)
│  └─ Image scanning for vulnerabilities
│
├─ ORCHESTRATION
│  ├─ Kubernetes basics (for SRE)
│  ├─ Python in Kubernetes
│  ├─ Stateless Python services
│  ├─ Health checks & probes
│  └─ Resource limits & requests
│
├─ INFRASTRUCTURE AS CODE
│  ├─ Terraform basics
│  ├─ CloudFormation
│  ├─ Ansible configuration
│  └─ Infrastructure testing (TestInfra)
│
├─ ROLLBACK STRATEGIES
│  ├─ Automated rollback on failures
│  ├─ Database migration reversibility
│  ├─ Feature flag-based rollback
│  └─ Incident response procedures
│
└─ DEPLOYMENT SAFETY
   ├─ Health checks before traffic
   ├─ Smoke tests post-deployment
   ├─ Monitoring for anomalies
   └─ Circuit breakers & fallbacks
```

### Real Example: Blue-Green Deployment in Python
```python
import time
from typing import List

import requests

class DeploymentManager:
    def __init__(self, load_balancer, deployment_api):
        self.lb = load_balancer
        self.api = deployment_api

    def blue_green_deploy(self, new_version: str) -> bool:
        """
        Deploy to green environment while blue is live,
        then switch traffic.
        """
        print(f"Deploying version {new_version} to GREEN...")

        # 1. Deploy to green environment
        green_hosts = self.api.deploy_to_green(new_version)

        # 2. Health checks
        if not self._health_checks(green_hosts):
            print("Green health checks failed, rolling back...")
            self.api.destroy_green()
            return False

        # 3. Smoke tests
        if not self._smoke_tests(green_hosts):
            print("Smoke tests failed, rolling back...")
            self.api.destroy_green()
            return False

        # 4. Switch traffic
        print("Health checks passed, switching traffic...")
        self.lb.switch_traffic_to_green()

        # 5. Keep blue as fallback for a period
        time.sleep(60)  # Monitor for 1 minute

        if self._has_errors(green_hosts):
            print("Errors detected, switching back to blue...")
            self.lb.switch_traffic_to_blue()
            return False

        print("Deployment successful!")
        self.api.destroy_blue()  # Clean up old environment
        return True

    def _health_checks(self, hosts: List[str]) -> bool:
        """Verify application is healthy."""
        for host in hosts:
            response = requests.get(f"http://{host}/health", timeout=5)   # always set a timeout
            if response.status_code != 200:
                return False
        return True

    def _smoke_tests(self, hosts: List[str]) -> bool:
        """Run critical path tests."""
        for host in hosts:
            if not self._test_critical_workflow(host):
                return False
        return True

    def _has_errors(self, hosts: List[str]) -> bool:
        """Check for error spikes in monitoring."""
        for host in hosts:
            error_rate = self._get_error_rate(host)
            if error_rate > 0.01:  # 1% error threshold
                return True
        return False
```

**Why it matters:** Critical for safe deployments.

---

## SRE TRACK: Infrastructure, Monitoring & Reliability
### Milestones 8–16

**Your focus:** Infrastructure automation and production reliability.

| Milestone | Topic | Real-World Application |
|------|-------|------------------------|
| 8 | Infrastructure as Code | Terraform + Python |
| 9 | Kubernetes Automation | K8s client, custom operators |
| 10 | Monitoring & Observability | Prometheus, structured logging |
| 11 | Incident Response | Automation for incident handling |
| 12–13 | Chaos & Resilience | Failure injection, testing |
| 14–16 | Capstone | Production platform |

**Job context:** SREs automate infrastructure, monitor systems, and ensure reliability.

**Mini-projects (Milestones 8–16):**
- Milestone 8: Infrastructure as code (Terraform + Python)
- Milestone 9: Kubernetes automation
- Milestone 10: Monitoring stack setup (Prometheus)
- Milestone 11: Incident response automation
- Milestone 12: Chaos engineering experiments
- Milestones 13–16: Capstone — production-ready platform

---

### MILESTONES 8–9: Infrastructure Automation & Kubernetes

**Why it matters:** SREs automate everything.

### Coverage
```
├─ INFRASTRUCTURE AS CODE
│  ├─ Terraform + Python (provisioning)
│  ├─ AWS CDK with Python
│  ├─ CloudFormation templates
│  └─ Ansible playbooks
│
├─ KUBERNETES AUTOMATION
│  ├─ Kubernetes Python client
│  ├─ Custom operators
│  ├─ Automated rollouts
│  ├─ Pod lifecycle management
│  └─ NetworkPolicy automation
│
├─ CONFIGURATION MANAGEMENT
│  ├─ Collecting configs
│  ├─ Validation & versioning
│  ├─ Rollout strategies
│  └─ Audit trails
│
├─ SERVICE MESH INTEGRATION
│  ├─ Istio automation
│  ├─ Traffic management
│  └─ Security policies
│
└─ AUTOMATION TESTING
   ├─ Infrastructure testing (TestInfra)
   ├─ Configuration validation
   └─ Policy enforcement
```

### Real Example: Kubernetes Automation
```python
from kubernetes import client, config

config.load_kube_config()          # your laptop; inside a cluster use load_incluster_config()
apps = client.AppsV1Api()          # for Deployments
core = client.CoreV1Api()          # for Pods and Nodes

def scale(name: str, namespace: str, replicas: int) -> None:
    apps.patch_namespaced_deployment_scale(name, namespace, {"spec": {"replicas": replicas}})

def cordon(node: str) -> None:
    """Stop new pods from being placed on this node."""
    core.patch_node(node, {"spec": {"unschedulable": True}})

def evict_pods(node: str) -> list[str]:
    """Move pods off a node using the Eviction API, which respects Pod Disruption Budgets."""
    failed = []
    pods = core.list_pod_for_all_namespaces(field_selector=f"spec.nodeName={node}").items
    for pod in pods:
        eviction = client.V1Eviction(
            metadata=client.V1ObjectMeta(name=pod.metadata.name, namespace=pod.metadata.namespace)
        )
        try:
            core.create_namespaced_pod_eviction(pod.metadata.name, pod.metadata.namespace, eviction)
        except client.ApiException as error:
            failed.append(f"{pod.metadata.name}: {error.reason}")
    return failed
```

**Autoscaling** is simplest to declare in YAML and apply with `kubectl apply -f hpa.yaml`:

```yaml
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: web
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: web
  minReplicas: 2
  maxReplicas: 10
  metrics:
    - type: Resource
      resource:
        name: cpu
        target:
          type: Utilization
          averageUtilization: 70      # add pods when average CPU passes 70%
```

**Why it matters:** Core SRE responsibility.

---

## MILESTONE 10: Monitoring & Observability

**Why it matters:** "You can't manage what you can't measure."

### Coverage
```
├─ METRICS COLLECTION
│  ├─ Prometheus client library
│  ├─ Custom metrics
│  ├─ Histogram vs gauge vs counter
│  ├─ Metric naming conventions
│  └─ Sampling strategies
│
├─ LOGGING
│  ├─ Structured logging (JSON)
│  ├─ Log levels (DEBUG, INFO, WARNING, ERROR, CRITICAL)
│  ├─ Correlation IDs for tracing
│  ├─ Log aggregation (ELK, Loki)
│  └─ Retention policies
│
├─ TRACING
│  ├─ OpenTelemetry integration
│  ├─ Distributed tracing (Jaeger)
│  ├─ Span instrumentation
│  ├─ Sampling strategies
│  └─ Trace correlation
│
├─ ALERTING
│  ├─ Alert conditions
│  ├─ Threshold selection
│  ├─ Alert fatigue prevention
│  ├─ Runbook attachment
│  └─ Alert routing
│
├─ DASHBOARDING
│  ├─ Grafana integration
│  ├─ Dashboard design principles
│  ├─ Alert visualization
│  └─ SLO tracking
│
└─ SLO/SLI
   ├─ Service Level Objectives
   ├─ Service Level Indicators
   ├─ Error budgets
   └─ SLI measurement
```

### Real Example: Metrics & Monitoring
```python
from prometheus_client import Counter, Histogram, Gauge, start_http_server
import time
import logging
import json

logger = logging.getLogger(__name__)

class APIMetrics:
    def __init__(self):
        self.request_count = Counter(
            'api_requests_total',
            'Total API requests',
            ['method', 'endpoint', 'status']
        )
        self.request_duration = Histogram(
            'api_request_duration_seconds',
            'API request duration',
            ['method', 'endpoint']
        )
        self.active_connections = Gauge(
            'api_active_connections',
            'Active connections'
        )
        self.error_count = Counter(
            'api_errors_total',
            'Total errors',
            ['error_type']
        )

metrics = APIMetrics()

def api_endpoint(request):
    """Instrumented API endpoint."""
    start_time = time.time()
    correlation_id = request.headers.get('X-Correlation-ID')
    metrics.active_connections.inc()

    try:
        response = process_request(request)

        duration = time.time() - start_time
        metrics.request_count.labels(
            method=request.method,
            endpoint=request.path,
            status=response.status_code
        ).inc()
        metrics.request_duration.labels(
            method=request.method,
            endpoint=request.path
        ).observe(duration)

        logger.info(json.dumps({
            'correlation_id': correlation_id,
            'endpoint': request.path,
            'duration_ms': duration * 1000,
            'status': response.status_code
        }))

        return response

    except Exception as e:
        metrics.error_count.labels(error_type=type(e).__name__).inc()
        logger.error(json.dumps({
            'correlation_id': correlation_id,
            'error': str(e),
            'error_type': type(e).__name__
        }))
        raise

    finally:
        metrics.active_connections.dec()

# Start metrics server (port 8000)
if __name__ == '__main__':
    start_http_server(8000)
```

**Why it matters:** Essential SRE skill.

---

## MILESTONES 11–12: Incident Response, Chaos & Resilience Testing, Security & Compliance

These are specialized SRE topics — each is deep enough to be its own mini-curriculum, so the coverage below is intentionally a map, not a full walkthrough:

```
INCIDENT RESPONSE AUTOMATION
├─ On-call alert handling
├─ Automated remediation
├─ Escalation policies
└─ Incident tracking integration

CHAOS & RESILIENCE TESTING
├─ Failure injection
├─ Service degradation testing
├─ Network partition simulation
└─ Capacity testing

SECURITY & COMPLIANCE
├─ Vulnerability scanning
├─ Compliance automation
├─ Access control
└─ Audit logging

PERFORMANCE & OPTIMIZATION
├─ Bottleneck identification
├─ Optimization strategies
└─ Cost optimization
```

**Deliverable:** run a controlled failure-injection experiment against a staging service (e.g., kill a pod, introduce network latency) and document the blast radius, detection time, and automated/manual remediation.

---

## MILESTONES 13–16: SRE Capstone — Production-Ready Platform

Combine Milestones 8–12 into an end-to-end reliability system:
- Infrastructure provisioned as code (Terraform/CDK)
- Services running on Kubernetes with autoscaling and health checks
- Full metrics/logging/tracing stack (Prometheus + structured logs + OpenTelemetry)
- Alerting wired to runbooks, not just noise
- At least one chaos experiment documented with findings
- Deployment via the [blue-green pattern](#deployment-strategies-sdesre-shared) above, with automated rollback

### Milestone 13+ Checkpoint (SRE)
- [ ] Infrastructure as code
- [ ] Kubernetes automation
- [ ] Monitoring stack
- [ ] Incident response automation
- [ ] Ready for SRE job interviews

---

## PHASE 3: Cross-Functional Patterns, Mastery & Interview Prep
### Milestones 17+ — Everyone

### Cross-Functional Patterns (All Roles)
```
├─ Testing in Production — smoke tests, canary testing, feature-flag testing
├─ Deployment Safety — blue-green, canary rollouts (see Deployment Strategies above)
├─ Rollback Strategies — automated triggers, database migration reversibility
├─ Monitoring Test Suites — treating test infrastructure itself as production
└─ Performance Testing — load testing, regression detection
```

### Interview & System Design
- Canonical questions by role (SDET: test strategy design; SDE: API/service design; SRE: incident postmortems)
- System design case studies
- Production incident walk-throughs
- Architecture decision records

### Next Steps After Completing This Guide

**For SDET:**
1. Contribute to open-source test automation projects
2. Build a comprehensive test suite for a side project
3. Study design patterns specific to testing
4. Specialize in API testing or performance testing

**For SDE:**
1. Ship a production package to PyPI
2. Deploy an application with all studied patterns
3. Contribute to open-source Python projects
4. Build a microservice with async patterns

**For SRE:**
1. Design monitoring/alerting for a production system
2. Implement infrastructure as code
3. Conduct chaos engineering experiments
4. Build incident response automation

---

## Why These Topics Matter, by Role {#why-these-topics-matter-roi-by-role}

Traditionally, "advanced testing," "mocking," "CI/CD," "deployment," and "infrastructure automation" get treated as optional extras layered on top of "real" Python. For SDET/SDE/SRE roles, that's backwards — they're core job requirements:

**SDET (Software Development Engineer in Test):**
- Advanced testing: core of the job
- CI/CD integration: every day
- Mocking: essential for test isolation
- Message queues: testing async services

**SDE (Software Development Engineer):**
- Package publishing: shipping code to production
- Deployment: how code reaches users
- Message queues: building microservices
- Security: protecting user data

**SRE (Site Reliability Engineer):**
- Advanced testing: chaos testing, failure injection
- Security: infrastructure hardening
- Deployment: infrastructure as code
- Message queues: monitoring event pipelines
- Kubernetes: container orchestration

### How important each topic is, by role

| Topic | SDET | SDE | SRE |
|-------|------|-----|-----|
| Advanced Testing | 🔴 Most of the job | 🟡 Regular | 🟢 Occasional |
| Mocking | 🔴 Critical | 🔴 Critical | 🟡 Important |
| CI/CD | 🔴 Daily | 🟡 Weekly | 🔴 Daily |
| Package Publishing | 🟢 Nice to have | 🔴 Critical | 🟡 Helpful |
| Deployment | 🟡 Contextual | 🔴 Critical | 🔴 Critical |
| Message Queues | 🟡 Important | 🔴 Critical | 🟡 Important |
| Security | 🟡 Important | 🔴 Critical | 🔴 Critical |
| Infrastructure Automation | 🟡 Contextual | 🟡 Contextual | 🔴 Critical |
| Monitoring | 🟡 Important | 🟡 Important | 🔴 Critical |

### The Business Case

```text
Traditional Approach:
├─ SDET learns testing → slow to become productive
├─ SDE learns Python basics → never gets to deployment
├─ SRE writes Python → lacks professional patterns
└─ Result: Slow onboarding, repeated mistakes, low proficiency

This Guide's Approach:
├─ Everyone learns core Python (Milestones 1–7) first
├─ Role-specific deep dives (Milestones 8–16) next
└─ Result: Professional mastery, shared foundation, faster ramp
```

**Why this works:**
1. **Efficiency** — foundational content isn't repeated three times
2. **Relevance** — each role gets the deep dives it actually needs
3. **Scalability** — the path grows with you (advanced topics can be layered on)
4. **Professionalism** — enterprise-grade patterns from the start
5. **Payoff** — every topic is something you'll use on the job

---

## Scope: What This Guide Deliberately Doesn't Cover

No single guide can cover all of Python. Rather than being 2,000 pages of mediocre coverage, this guide aims for **~95% completeness for SRE/SDET/SDE work** and is explicit about the remaining 5%.

### Intentionally Out of Scope (wrong audience, not this guide's job)
- **Data Science & ML** (NumPy, Pandas, scikit-learn, TensorFlow/PyTorch, Jupyter) — different mental model, different curriculum. See Kaggle Learn / fast.ai.
- **Desktop GUI development** (Tkinter, PyQt, Kivy) — not part of backend/ops work.
- **Mobile development** (Kivy, BeeWare) — Python isn't the primary mobile language.
- **Game development** (Pygame, Arcade) — Python isn't competitive for games.
- **C/C++ integration** (ctypes, cffi, pybind11) — extremely specialized, rare need.
- **CPython internals** (bytecode, GC implementation, descriptor protocol depth) — academic interest, not a production decision-driver.
- **Alternative Python implementations** (PyPy, Jython, MicroPython) — 99% of this audience uses CPython exclusively.
- **Advanced concurrency primitives beyond the basics** (shared-memory multiprocessing, custom process signaling) — diminishing returns; consult official docs when the rare need arises.
- **GraphQL, dedicated message-queue deep dives (Kafka/RabbitMQ internals)** — domain-specific and library-specific rather than core Python.

### Covered at Foundational Depth, Not Expert Depth
These get enough coverage to be productive, with a pointer to go deeper only if your role demands it:
- **Web frameworks** — Flask/FastAPI basics are covered (Milestone 11); Django's full ecosystem, FastAPI's advanced dependency injection, and deep web-security topics are not.
- **Databases** — SQLite + SQLAlchemy basics are covered (Milestone 10); complex SQL (joins, window functions, query tuning), PostgreSQL-specific features, and NoSQL (MongoDB, Elasticsearch) are not.
- **Async patterns** — `async`/`await`, `asyncio.gather`, `wait_for` are covered; event-loop internals, custom synchronization primitives, and mixing sync/async via executors are not.
- **Performance optimization** — profiling (cProfile, timeit) is covered; Cython, NumPy vectorization, and GIL workarounds are not (if you need them, you're likely rewriting the hot path in Go/Rust, not optimizing Python further).
- **Package publishing** — the essentials (Milestone 8: pyproject.toml, PyPI, twine) are covered; monorepo strategies and complex dependency-resolution edge cases are not.
- **DevOps specifics** — Docker, basic Kubernetes, and Terraform-with-Python are covered where they touch the SRE track; deep Kubernetes-operator authorship and cloud-specific IaC nuances belong to a dedicated DevOps curriculum.

### The Honest Assessment

**What this guide gives you:** ~95% of what SREs/SDETs/SDEs need to build and ship production systems, a complete beginner-to-advanced learning path, production-ready patterns from the start, and a program that scales from core basics to full mastery.

**What it still lacks:** framework-internals depth (Django ORM, FastAPI DI internals), database specialization (complex PostgreSQL, Elasticsearch), advanced async internals, cryptography-library depth, and cloud-specific deployment nuances.

**Why the gaps are intentional:** scope creep prevention (this could otherwise become far too large), audience relevance (most of this audience doesn't need DBA-level SQL), diminishing returns (the last 5% requires roughly 50% more effort), and because some of these topics are genuinely different specializations (DevOps, data science) with their own dedicated resources that do a better job than a generalist guide could.

---

## Portfolio You'll Build

### After Milestone 7
```
github.com/[username]/python-mastery/
├── milestone1-config-manager/
├── milestone2-json-parser/
├── milestone3-email-validator/
├── milestone4-rate-limiter/
├── milestone5-user-management/
├── milestone6-log-parser/
├── milestone7-data-pipeline/
└── README.md
```
7 complete, working projects · ~2,000 lines of clean code · 40+ passing tests · performance benchmarks · professional git history.

### After Milestone 13 (Your Role Track)

**SDET Portfolio Addition:**
```
├── test-automation-suite/     Full Selenium/pytest framework
├── ci-cd-pipeline/            GitHub Actions workflow
└── capstone-qa-framework/     Production-ready test suite
```

**SDE Portfolio Addition:**
```
├── published-package/         On PyPI
├── async-service/             Celery + FastAPI service
└── capstone-microservice/     Deployable service
```

**SRE Portfolio Addition:**
```
├── infrastructure-as-code/    Terraform + Python
├── kubernetes-automation/     Production K8s setup
└── capstone-platform/         End-to-end reliability system
```

---

## Resources, Tools & Recommended Reading

### External Tools You'll Want
```bash
# Code quality
pip install black        # Code formatter
pip install mypy         # Type checker
pip install pylint       # Linter

# Testing
pip install pytest       # Test framework
pip install pytest-cov   # Coverage reporting
pip install pytest-xdist # Parallel testing

# Performance
pip install memory-profiler
pip install line-profiler
```

### Recommended Reading (Alongside)
- **"Fluent Python" by Luciano Ramalho** — deep dives into Pythonic patterns
- **"Clean Code" by Robert C. Martin** — code organization and naming
- **"Pragmatic Programmer" by Hunt & Thomas** — professional development mindset

### Video Supplements (Optional)
- Real Python videos (for visual learners)
- Talk Python Podcast (for inspiration)
- Raymond Hettinger talks on YouTube (advanced patterns)

---

## Troubleshooting Guide

### Problem: This milestone's content seems too hard
1. Re-read that milestone's Topics section from the beginning
2. Slow down — don't rush the mini-project
3. Write more tests; understand each one

### Problem: I'm skipping topics because I "already know Python"
1. Re-read [Why These Topics Matter, by Role](#why-these-topics-matter-roi-by-role)
2. Extend mini-projects with additional features
3. Write more tests (edge cases, error scenarios)
4. Don't skip Milestones 1–7 even if you know the basics — the mini-projects encode professional patterns, not just syntax

### Problem: I'm losing motivation
1. Re-read the "why these topics matter" section for your role
2. Look at your portfolio — you've built real projects
3. Talk about what you're learning
4. Skip forward and look at the Milestone 13+ capstone description
5. Remember: this is a marathon, not a sprint

### Problem: I don't have enough time
1. Do less, but stay consistent
2. Combine milestones if topics are similar (Milestones 2–3 can combine)
3. Focus on Milestones 1–7 core, postpone the role track
4. Quality > speed — better to complete one milestone well than four poorly

---

## Next Steps

**Today, right now:**
1. Skim this guide (done!)
2. Create a project directory: `mkdir -p python-mastery/week1 && cd python-mastery/week1`
3. Initialize git: `git init && git config user.name "Your Name"`
4. Set up a virtual environment: `python -m venv .venv && source .venv/bin/activate`

**First step (Milestone 1):**
1. Read the [Milestone 1](#milestone-1-getting-started--fundamentals) section above
2. Build the Config Manager mini-project
3. Write and run the tests: `python -m pytest test_*.py -v`
4. Commit: `git commit -m "Milestone 1: Config manager with 5 passing tests"`
5. Move to Milestone 2

**After Milestone 7:**
- [ ] 7 mini-projects built and tested
- [ ] 50+ tests passing
- [ ] GitHub repo with clean git history
- [ ] README.md in root explaining the project portfolio

**After Milestone 13 (your role):**
- [ ] Role-specific deep dive completed
- [ ] Capstone project built
- [ ] Interview-ready portfolio
- [ ] Confident to apply to SDET/SDE/SRE positions

---

**Outcome:** Professional-grade Python expertise for your specific role

*Companion page: [Python Quick Reference](/docs/fundamentals/python/python-quick-reference) — quick syntax lookups once you're underway.*
*Last updated: September 2026*
