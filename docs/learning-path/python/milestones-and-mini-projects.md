---
title: "Milestones & Mini-Projects"
description: "A working mini-project for each core Python milestone, plus role-specific project tracks and a progress template."
sidebar_position: 4
level: intermediate
tags: [python, learning-path, projects]
image: /img/mental-model-share.png
---

# Milestones & Mini-Projects
## Bringing the Syllabus to Life with Practical Work

**In short:** one small, working project for each of the seven core
milestones. Each project uses exactly the skills from that milestone of the
[Syllabus](/docs/learning-path/python/comprehensive-syllabus).

:::tip How to use this page

1. Read the milestone in the [Syllabus](/docs/learning-path/python/comprehensive-syllabus) first.
2. Create the project folder shown, and **type** the code — don't paste it.
3. Run it, then do the **Try it** tasks at the end of the milestone. They
   add tests and a new feature, which is where most of the learning happens.
4. Tick the checklist and commit to git before moving on.

:::

---

## Milestone 1: Getting Started & Fundamentals {#milestone-1}

**In short:** set up a clean project and build a small, type-hinted settings class that can load JSON.

### Mini-Project: Configuration Management System
**Goal:** Setup professional Python environment and write type-hinted config handler

#### Project Structure
```text
week1_project/
├── .venv/                    # Virtual environment
├── .gitignore               # Python-specific
├── pyproject.toml           # Modern Python config
├── README.md
└── src/
    └── config.py           # Main application
```

#### Implementation (config.py)
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

### Watch out for
- Mutable default arguments: never write `def f(items=[])`; use `items=None` and create the list inside
- Type hints don't enforce types at runtime (tools like mypy needed)
- `__slots__` (a memory-saving option for classes) isn't needed here — only optimise once you've measured a problem


### Try it
Write `test_config.py` with three pytest tests: `get` returns the default for a missing key, `load_from_json` returns `False` for a missing file, and `is_production()` is `True` for `Config(debug=False, timeout=120)`.

---

## Milestone 2: Collections & Data Structures {#milestone-2}

**In short:** turn a JSON API response (a `dict` containing a `list` of `dict`s) into useful answers with comprehensions.

### Mini-Project: JSON API Response Parser
**Goal:** Master dictionaries, lists, and comprehensions with real data

#### Project Structure
```text
week2_project/
├── data/
│   └── sample_response.json  # Real API response
├── src/
│   └── parser.py            # Your solution
└── test_parser.py           # Unit tests
```

#### Sample Data (data/sample_response.json)
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

#### Implementation (src/parser.py)
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
        # Using list comprehension
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
        # More Pythonic
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
        # Using set comprehension
        return {role for user in self.data['users'] 
                for role in user['roles']}
    
    def get_login_stats(self) -> Dict[str, int]:
        """Create dict of name -> login_count."""
        # Using dict comprehension
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

#### Test File (test_parser.py)
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

### Deliverables Checklist
- [ ] Load and parse JSON file
- [ ] Extract data using list comprehensions
- [ ] Create lookup dicts using dict comprehensions
- [ ] Create sets of unique values using set comprehensions
- [ ] Sort complex data structures
- [ ] Write unit tests for all methods
- [ ] Run tests and verify all pass

### Performance Exercise
```python
# Which is faster? Create benchmark

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

# Benchmark
t1 = timeit.timeit(users_by_role_loop, number=10000)
t2 = timeit.timeit(users_by_role_comp, number=10000)
print(f"Loop: {t1:.4f}s, Comprehension: {t2:.4f}s")
# Result: Comprehension is typically 2-3x faster
```


### Try it
Add a `get_users_by_domain()` method that returns a `dict` of email domain → `list` of names, and write a test for it.

---

## Milestone 3: Control Flow & Logic {#milestone-3}

**In short:** check and sort email addresses using `if` rules, guard clauses, and regex.

### Mini-Project: Text-Based Email Validator & Classifier
**Goal:** Master conditionals, guard clauses, and error handling

#### Implementation (email_validator.py)
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
    
    # Pattern constants
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
        
        email = email.strip()  # Remove whitespace
        
        if len(email) > 255:
            return False, "Email too long (max 255 chars)"
        
        if EmailValidator.PATTERN.match(email):
            return True, None
        
        return False, "Invalid email format"
    
    @staticmethod
    def classify(email: str) -> EmailType:
        """Classify email by domain."""
        # Validation first
        is_valid, _ = EmailValidator.validate(email)
        if not is_valid:
            return EmailType.UNKNOWN
        
        # Extract domain
        domain = email.split('@')[1].lower()
        
        # Classify with early returns
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
            
            # Classify valid emails
            email_type = EmailValidator.classify(email)
            
            # Nested conditional with elif (avoid deeply nested code)
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
    test_cases = [
        "test@example.com",
        "invalid@",
        "@example.com"
    ]
    
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

### Key Concepts Practiced
- ✓ Guard clauses (early returns)
- ✓ if/elif/else chains (avoiding deep nesting)
- ✓ Truthiness checks
- ✓ Error messages in returns
- ✓ Loop control (continue)
- ✓ List comprehensions in conditionals


### Try it
Add a rule that rejects emails longer than 254 characters, with a test for it. Then add one test case of your own for an edge case the page doesn't cover.

---

## Milestone 4: Functions & Functional Programming {#milestone-4}

**In short:** build a rate limiter and a retry decorator — functions that wrap other functions.

### Mini-Project: Rate Limiter & Retry Handler
**Goal:** Master decorators, closures, and functional patterns

#### Implementation (rate_limiter.py)
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
            
            # Check if rate limit exceeded
            if len(calls) >= max_calls:
                raise Exception(f"Rate limit exceeded: {max_calls} calls per {period_seconds}s")
            
            # Record this call
            calls.append(now)
            
            # Call the function
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
                        # Last attempt failed
                        print(f"Failed after {max_attempts} attempts: {e}")
                        raise
                    
                    # Wait and retry
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
        
        # Cleanup old calls
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
    
    # This works (first 3 calls)
    for i in range(3):
        result = api_call(f"/api/endpoint{i}")
        print(f"Result: {result}")
    
    # This fails (4th call exceeds limit)
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
    
    # First 2 calls allowed
    print(f"Call 1: {limiter()}")  # True
    print(f"Call 2: {limiter()}")  # True
    print(f"Call 3: {limiter()}")  # False
    
    # Separate limiter instance
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


### Try it
Write tests for the retry decorator: one where the function fails twice then succeeds, and one where it always fails. Use `unittest.mock.Mock(side_effect=[...])` and patch `time.sleep` so the tests don't wait.

---

## Milestone 5: Object-Oriented Programming {#milestone-5}

**In short:** model users and admins as classes that share code through inheritance.

### Mini-Project: User Management System with Inheritance
**Goal:** Master OOP patterns and special methods

#### Implementation (user_system.py)
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
    
    # Add users
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


### Try it
Add a `Guest` class that can't change anything, and write tests that check each role's permissions.

---

## Milestone 6: Modules, Exceptions & Advanced Constructs {#milestone-6}

**In short:** read a large log file line by line with generators, and handle bad lines safely.

### Mini-Project: Log Parser with Generators
**Goal:** Practice generators, context managers, and exceptions

#### Project Structure
```text
week6_project/
├── logs/
│   └── app.log           # Sample log file
├── src/
│   ├── log_parser.py    # Your solution
│   └── exceptions.py    # Custom exceptions
└── test_parser.py       # Tests
```

#### Implementation (src/exceptions.py)
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

#### Implementation (src/log_parser.py)
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
    # Using context manager
    print("=== Using Context Manager ===")
    with LogManager("logs/app.log") as manager:
        summary = manager.get_summary()
        print("Log summary:", summary)
        
        errors = manager.find_errors()
        print(f"Found {len(errors)} errors")
    
    # Using generators directly
    print("\n=== Using Generators ===")
    error_count = 0
    for error_log in LogParser.filter_by_level(
        LogParser.read_logs("logs/app.log"), 
        "ERROR"
    ):
        print(f"Error: {error_log.message}")
        error_count += 1
    
    print(f"Total errors: {error_count}")
    
    # Memory efficient - doesn't load entire file
    print(f"\nMemory usage: Generators process line-by-line")
```


### Try it
Generate a 100,000-line sample log with a short script, run the parser on it, and add a test that malformed lines are skipped rather than crashing the parser.

---

## Milestone 7: Real-World Skills {#milestone-7}

**In short:** build a small pipeline that reads CSV/JSON files, cleans the data, and times itself.

### Mini-Project: Data Processing Pipeline
**Goal:** Practice file I/O, regex, and profiling

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
    # Create sample CSV
    csv_data = """name,email,phone
Alice,alice@example.com,+12025551234
Bob,bob@invalid,5551234567
Charlie,charlie@example.com,12025551234
Diana,diana@example.com,invalid"""
    
    Path("data.csv").write_text(csv_data)
    
    # Process
    data = DataProcessor.load_csv("data.csv")
    results = DataProcessor.process_data(data)
    DataProcessor.save_results(results, "results.txt")
    
    print(f"\nResults: {results}")
```


### Try it
Time the pipeline on a small and a 10× larger input. Does the time grow 10×? Write down what you found in your project's README.

---

## After Milestone 7: your portfolio {#summary}

By completing Milestone 7, you've built 7 mini-projects demonstrating:

| Milestone | Project | Key Skills |
|------|---------|-----------|
| 1 | Config Manager | Type hints, virtualenv setup, classes |
| 2 | API Response Parser | Collections, comprehensions, JSON |
| 3 | Email Validator | Conditionals, guard clauses, regex |
| 4 | Rate Limiter | Decorators, closures, functional patterns |
| 5 | User Management | OOP, inheritance, special methods |
| 6 | Log Parser | Generators, context managers, exceptions |
| 7 | Data Pipeline | File I/O, regex, profiling |

If you did the **Try it** tasks, you'll also have tests for every project and a few timing measurements.

### Portfolio Checkpoint
At this point, you have:
- ✅ 7 working mini-projects
- ✅ Professional code organization
- ✅ Comprehensive test coverage
- ✅ Performance profiling examples
- ✅ Git history with meaningful commits

This is a solid foundation portfolio to show employers or build upon.

---

## Milestone 8 onwards: role projects {#role-projects}

**In short:** each role track ends in one larger project. The role guides contain worked code and a list of practice projects: [SDET](/docs/role-guides/sdet/python-for-sdet#17-practice-projects), [SDE](/docs/role-guides/sde/python-for-sde#17-practice-projects), [SRE](/docs/role-guides/sre/python-for-sre#17-practice-projects).

### SDET: Test Automation Framework
- Milestone 8: Pytest framework with 50+ tests
- Milestone 9: Mocking library for test isolation
- Milestone 10: CI/CD pipeline setup
- Milestones 11–12: Selenium test suite for real application
- Milestone 13: Capstone - Full QA automation suite

### SDE: Backend Service Development
- Milestone 8: Package publishing to PyPI
- Milestone 9: Async task queue (Celery)
- Milestone 10: Database ORM integration
- Milestone 11: REST API with error handling
- Milestone 12: Security & authentication
- Milestone 13: Capstone - Microservice with all patterns

### SRE: Infrastructure & Monitoring
- Milestone 8: Infrastructure as code (Terraform + Python)
- Milestone 9: Kubernetes automation
- Milestone 10: Monitoring stack setup (Prometheus)
- Milestone 11: Incident response automation
- Milestone 12: Chaos engineering experiments
- Milestones 13–16: Capstone - Production-ready platform

---

## Ways to work through this page {#how-to-use}

### Option A: Structured Learning (Recommended)
1. Pick your role (SDET, SDE, or SRE)
2. Start with Milestone 1, complete mini-project
3. Move to Milestone 2, etc.
4. After Milestone 7, follow your role track
5. Keep GitHub repo of all projects
6. At end, review entire portfolio

### Option B: Self-Paced
- Spend more time on challenging milestones
- Extend mini-projects with additional features
- Research topics deeply
- Build larger capstone projects earlier

### Option C: Team Learning
- Share mini-project implementations
- Code review each other's projects
- Discuss design decisions
- Learn from different approaches

---

## Tracking your progress {#tracking}

Copy this template into a `PROGRESS.md` file in each project folder:

### Milestone Checklist Template
```markdown
# Milestone [N] Progress

## Learning Objectives
- [ ] Objective 1
- [ ] Objective 2
- [ ] Objective 3

## Mini-Project
- [ ] Setup complete
- [ ] Core functionality implemented
- [ ] Tests passing
- [ ] Code reviewed
- [ ] Committed to git

## Challenges Encountered
- Challenge 1: Solution
- Challenge 2: Solution

## Key Insights
- Insight 1
- Insight 2

```

---

**Next Steps:**
1. Create a new directory for Milestone 1 project
2. Follow the setup steps
3. Implement the mini-project
4. Write and run tests
5. Commit to git
6. Move to Milestone 2

Start with Milestone 1. You've got this!
