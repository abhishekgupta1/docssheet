---
title: "Python Quick Reference"
description: "Copy-paste reference for everyday Python 3 \u2014 data types, strings, collections, flow control, functions, files, classes, regex, and more."
sidebar_position: 2
level: beginner
tags: [python, fundamentals, cheat-sheet]
image: /img/social/python-quick-reference.png
---

# Python Quick Reference
## For SRE, SDET & SDE Professionals

A copy-paste reference for everyday Python 3. Every example shows its result
after `# =>`.

:::tip How to use this page

This page is for **looking things up**, not for learning from scratch. New to
Python? Start with the [Python cheat sheet](/cheatsheets/python) or
[Python Fundamentals](/docs/fundamentals/python/fundamentals-basic-to-advanced).
For step-by-step lessons and mini-projects, follow the
[Python learning path](/docs/learning-path/python/implementation-roadmap).

:::

## Quick Navigation

**Language:** [Getting Started](#getting-started) · [Built-in Data Types](#built-in-data-types) · [Advanced Data Types](#advanced-data-types) · [Strings](#strings) · [F-Strings](#f-strings) · [Lists](#lists) · [Flow Control](#flow-control) · [Loops](#loops) · [Functions](#functions) · [Modules & Imports](#modules--imports) · [File Handling](#file-handling) · [Classes & Inheritance](#classes--inheritance) · [Miscellaneous](#miscellaneous)

**Professional toolkit:** [Regex](#regex) · [Testing (pytest)](#testing-pytest) · [Logging](#logging) · [Performance](#performance-tips) · [Gotchas](#gotchas-watch-out) · [Common Patterns](#common-patterns) · [One-Liners](#one-liners-to-remember)

---

## GETTING STARTED

### Introduction
- [Python docs](https://docs.python.org/3/) (python.org)
- [Learn X in Y minutes: Python](https://learnxinyminutes.com/docs/python/)
- [Regex](#regex) section below

### Hello World
```python
print("Hello, World!")   # => Hello, World!
```

### Variables
```python
age = 18        # age is of type int
name = "John"   # name is now of type str
print(name)
```
In Python you create a variable by giving it a value — there is no separate "declare" step.

### Type Hints
```python
def greet(name: str, age: int) -> str:
    return f"{name} is {age}"
```

### Data Types
| Type | Category |
|------|----------|
| `str` | Text |
| `int`, `float`, `complex` | Numeric |
| `list`, `tuple`, `range` | Sequence |
| `dict` | Mapping |
| `set`, `frozenset` | Set |
| `bool` | Boolean |
| `bytes`, `bytearray`, `memoryview` | Binary (raw bytes, e.g. file or network data) |

`frozenset` is a set that can't be changed; `complex` is a number with an imaginary part (rarely needed).

See: [Built-in Data Types](#built-in-data-types)

### Arithmetic
```python
result = 10 + 30   # => 40
result = 40 - 10   # => 30
result = 50 * 5    # => 250
result = 16 / 4    # => 4.0  (true division, always float)
result = 16 // 4   # => 4    (floor division)
result = 25 % 2    # => 1    (modulo)
result = 5 ** 3    # => 125  (power)
```
`/` is the quotient of x and y; `//` is the *floored* quotient (`-7 // 2 == -4`).

### Plus-Equals
```python
counter = 0
counter += 10            # => 10  (same as counter = counter + 10)

message = "Part 1."
message += "Part 2."     # => "Part 1.Part 2."
```

### Truthiness
```python
if items:      # Same as: if len(items) > 0
    process(items)

if not error:  # Same as: if error is None or error == ""
    continue_processing()

bool(0), bool(""), bool([]), bool(None)   # => all False
```

### Guard Clauses
```python
def process(user):
    if not user:
        return None  # Early exit
    if not user.is_active:
        return None
    return user.get_profile()  # Main logic last
```

---

## BUILT-IN DATA TYPES

### Strings
```python
hello = "Hello World"
hello = 'Hello World'
multi_string = """Multiline strings
can span several lines"""
```
See: [Strings](#strings)

### Numbers
```python
x = 1      # int
y = 2.8    # float
z = 1j     # complex
type(x)    # => <class 'int'>
big = 1_000_000   # underscores for readability
```

### Booleans
```python
my_bool = True
my_bool = False
bool(0)    # => False
bool(1)    # => True
```

### Lists
```python
list1 = ["apple", "banana", "cherry"]
list2 = [True, False, False]
list3 = [1, 5, 7, 9, 3]
list4 = list((1, 5, 7, 9, 3))
```
See: [Lists](#lists)

### Tuple
```python
my_tuple = (1, 2, 3)
my_tuple = tuple((1, 2, 3))
single = (1,)          # Trailing comma needed for a 1-item tuple
```
Like a list, but *immutable* — it can't be changed after it is created.

### Set
```python
set1 = {"a", "b", "c"}
set2 = set(("a", "b", "c"))
empty = set()          # {} is an empty dict, not a set

a, b = {1, 2, 3}, {2, 3, 4}
a | b    # => {1, 2, 3, 4}  union
a & b    # => {2, 3}        intersection
a - b    # => {1}           difference
```
Unordered collection of unique items.

### Dictionary
```python
empty_dict = {}
a = {"one": 1, "two": 2, "three": 3}
a["one"]               # => 1
a.keys()               # => dict_keys(['one', 'two', 'three'])
a.values()             # => dict_values([1, 2, 3])
a.items()              # => dict_items([('one', 1), ...])
a.update({"four": 4})
a["four"]              # => 4
```
Key: value pairs, a JSON-like object.

### Safe Dict Access
```python
value = d.get('key', default)           # Won't raise KeyError
d.setdefault('key', default)            # Set if missing
merged = {**dict1, **dict2}             # Merge (or: dict1 | dict2, 3.9+)
```

### Casting
```python
# Integers
int(1)       # => 1
int(2.8)     # => 2   (truncates)
int("3")     # => 3

# Floats
float(1)     # => 1.0
float(2.8)   # => 2.8
float("3")   # => 3.0
float("4.2") # => 4.2

# Strings
str("s1")    # => 's1'
str(2)       # => '2'
str(3.0)     # => '3.0'
```

### Lists vs Tuples vs Sets vs Dicts
| Type | Looks like | Can change? | Keeps order? | Use for | Watch out |
|------|------------|-------------|--------------|---------|-----------|
| `list` | `[1, 2]` | ✓ | ✓ | Ordered data | `.copy()` doesn't copy lists inside it |
| `tuple` | `(1, 2)` | ✗ | ✓ | Fixed groups, dict keys, returning several values | One item needs a comma: `(1,)` |
| `set` | `{1, 2}` | ✓ | ✗ | Unique items, fast "is it in?" checks | No order |
| `dict` | `{"a": 1}` | ✓ | ✓ | Looking up a value by key | Keys must be unchangeable types (`str`, `int`, `tuple`) |

### Performance Characteristics

**O(1)** means "same speed however big the collection is"; **O(n)** means "slower
the more items there are" (n = number of items).

| Operation | `list` | `set` | `dict` |
|---|---|---|---|
| Add an item | Fast (end only) | Fast | Fast |
| Insert/remove at the front | Slow — shifts every item | – | – |
| Check `x in ...` | Slow — checks one by one | Fast | Fast (by key) |
| Get by key/position | Fast (by position) | – | Fast |

→ To check "is X in here?" many times, use a `set` or `dict`, not a `list`.

---

## ADVANCED DATA TYPES

### Heaps
```python
import heapq

my_list = [9, 5, 4, 1, 3, 2]
heapq.heapify(my_list)        # Turn my_list into a min-heap, in place
my_list[0]                    # => 1  (smallest is always first)
heapq.heappush(my_list, 10)   # Insert 10
heapq.heappop(my_list)        # => 1  (pop and return smallest)

heapq.nsmallest(3, data)      # 3 smallest items
heapq.nlargest(3, data)       # 3 largest items
```

#### Get the largest first (a "max-heap")
`heapq` always puts the smallest first. Store negative numbers to flip it:
```python
my_list = [-val for val in [9, 5, 4, 1, 3, 2]]
heapq.heapify(my_list)
-heapq.heappop(my_list)       # => 9
```
A heap is a list kept in a special order so the **smallest item is always at index 0**. Adding and removing items stays fast even for big lists. See: [heapq](https://docs.python.org/3/library/heapq.html)

### Stacks and Queues
```python
from collections import deque

q = deque()             # empty
q = deque([1, 2, 3])    # with values
q.append(4)             # add to right  => deque([1, 2, 3, 4])
q.appendleft(0)         # add to left   => deque([0, 1, 2, 3, 4])
q.pop()                 # => 4  (remove from right: stack)
q.popleft()             # => 0  (remove from left: queue)
q.rotate(1)             # rotate 1 step right: deque([1, 2, 3]) => deque([3, 1, 2])

recent = deque(maxlen=100)   # Bounded: oldest items drop off (handy for last-N logs)
```
`deque` (say "deck") is a double-ended queue: adding and removing at **either end** is fast. Use it for stacks and queues instead of `list.pop(0)`. See: [deque](https://docs.python.org/3/library/collections.html#collections.deque)

### Counter & defaultdict
```python
from collections import Counter, defaultdict

Counter(["a", "b", "a"])                  # => Counter({'a': 2, 'b': 1})
Counter(words).most_common(3)             # Top 3

by_status = defaultdict(list)
by_status["FAIL"].append("test_login")    # No KeyError on first access
```

---

## STRINGS

### Array-like
```python
hello = "Hello, World"
hello[1]     # => 'e'
hello[-1]    # => 'd'
```

### Looping
```python
for char in "foo":
    print(char)   # f, o, o
```

### Slicing String
```
 ┌───┬───┬───┬───┬───┬───┬───┐
 | m | y | b | a | c | o | n |
 └───┴───┴───┴───┴───┴───┴───┘
 0   1   2   3   4   5   6   7
-7  -6  -5  -4  -3  -2  -1
```
```python
s = 'mybacon'
s[2:5]          # => 'bac'
s[0:2]          # => 'my'
s[:2]           # => 'my'
s[2:]           # => 'bacon'
s[:2] + s[2:]   # => 'mybacon'
s[:]            # => 'mybacon'
s[-5:-1]        # => 'baco'
```

#### With a stride
```python
s = '12345' * 5   # => '1234512345123451234512345'
s[::5]            # => '11111'
s[4::5]           # => '55555'
s[::-5]           # => '55555'
s[::-1]           # => '5432154321543215432154321'  (reverse)
```

### String Length
```python
len("Hello, World!")   # => 13
```

### Multiple Copies
```python
'===+' * 8   # => '===+===+===+===+===+===+===+===+'
```

### Check String
```python
'spam' in 'I saw spamalot!'           # => True
'spam' not in 'I saw The Holy Grail!' # => True
```

### Concatenates
```python
s, t = 'spam', 'egg'
s + t            # => 'spamegg'
'spam' 'egg'     # => 'spamegg'  (adjacent literals are joined)
```

### Formatting
```python
name, age = "John", 23
"Hello, %s!" % name                        # %-style (legacy)
"%s is %d years old." % (name, age)

# format() method
"My name is {fname}, I'm {age}".format(fname="John", age=36)
"My name is {0}, I'm {1}".format("John", 36)
"My name is {}, I'm {}".format("John", 36)
```
Prefer [f-strings](#f-strings) in new code. In `logging` calls, keep `%s` placeholders (see [Logging](#logging)).

### Input
```python
name = input("Enter your name: ")   # Always returns a str
```

### Join & Split
```python
"#".join(["John", "Peter", "Vicky"])   # => 'John#Peter#Vicky'
"a,b,c".split(",")                     # => ['a', 'b', 'c']
```

### Common Methods
```python
"Hello, world!".endswith("!")     # => True
"Hello".startswith("He")          # => True
"  pad  ".strip()                 # => 'pad'
"Hello".upper()                   # => 'HELLO'
"Hello".lower()                   # => 'hello'
"a-b-c".replace("-", "_")         # => 'a_b_c'
"hello".find("l")                 # => 2  (-1 if missing)
"42".isdigit()                    # => True
```

---

## F-STRINGS

(Python 3.6+)

### f-Strings Usage
```python
website = 'Quickref.ME'
f"Hello, {website}"              # => 'Hello, Quickref.ME'

num = 10
f'{num} + 10 = {num + 10}'       # => '10 + 10 = 20'
f"""He said {"I'm John"}"""      # => "He said I'm John"
f'5 {"{stars}"}'                 # => '5 {stars}'
f'{{5}} {"stars"}'               # => '{5} stars'  (double braces escape)

name, age = 'Eric', 27
f"""Hello!
    I'm {name}.
    I'm {age}."""                # => "Hello!\n    I'm Eric.\n    I'm 27."

f"{num=}"                        # => 'num=10'  (debug form, 3.8+)
```

### f-Strings Fill Align
```python
f'{"text":10}'      # => 'text      '  [width]
f'{"test":*>10}'    # => '******test'  fill left
f'{"test":*<10}'    # => 'test******'  fill right
f'{"test":*^10}'    # => '***test***'  fill center
f'{12345:0>10}'     # => '0000012345'  fill with numbers
```

### f-Strings Type
```python
f'{10:b}'              # => '1010'          binary
f'{10:o}'              # => '12'            octal
f'{200:x}'             # => 'c8'            hex
f'{200:X}'             # => 'C8'
f'{345600000000:e}'    # => '3.456000e+11'  scientific
f'{65:c}'              # => 'A'             character
f'{10:#b}'             # => '0b1010'        with base prefix
f'{10:#o}'             # => '0o12'
f'{10:#x}'             # => '0xa'
```

### f-Strings Others
```python
import math

f'{-12345:0=10}'       # => '-000012345'     negative numbers
f'{12345:010}'         # => '0000012345'     [0] shortcut (no align)
f'{-12345:010}'        # => '-000012345'
f'{math.pi:.2f}'       # => '3.14'           [.precision]
f'{1000000:,.2f}'      # => '1,000,000.00'   [grouping_option]
f'{1000000:_.2f}'      # => '1_000_000.00'
f'{0.25:0%}'           # => '25.000000%'     percentage
f'{0.25:.0%}'          # => '25%'
```

### f-Strings Sign
```python
f'{12345:+}'      # => '+12345'      [sign] (+/-)
f'{-12345:+}'     # => '-12345'
f'{-12345:+10}'   # => '    -12345'
f'{-12345:+010}'  # => '-000012345'
```

---

## LISTS

### Defining
```python
li1 = []                   # => []
li2 = [4, 5, 6]            # => [4, 5, 6]
li3 = list((1, 2, 3))      # => [1, 2, 3]
li4 = list(range(1, 11))   # => [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
```

### Generate
```python
list(filter(lambda x: x % 2 == 1, range(1, 20)))   # => [1, 3, 5, ..., 19]
[x ** 2 for x in range(1, 11) if x % 2 == 1]       # => [1, 9, 25, 49, 81]
[x for x in [3, 4, 5, 6, 7] if x > 5]              # => [6, 7]
list(filter(lambda x: x > 5, [3, 4, 5, 6, 7]))     # => [6, 7]
```

### Comprehensions
```python
# List: [expr for item in iterable if condition]
squares = [x**2 for x in range(10) if x % 2 == 0]

# Dict: {key: value for item in iterable}
by_id = {user['id']: user for user in users}

# Set: {expr for item in iterable}
unique_domains = {email.split('@')[1] for email in emails}

# Generator (lazy, memory-efficient): same syntax, () instead of []
sum_squares = sum(x**2 for x in range(1_000_000))
```

### Append
```python
li = []
li.append(1)      # => [1]
li.append(2)      # => [1, 2]
li.insert(0, 0)   # => [0, 1, 2]  (O(n): shifts everything)
```

### List Slicing
```python
a_list[start:end]
a_list[start:end:step]
```

#### Slicing
```python
a = ['spam', 'egg', 'bacon', 'tomato', 'ham', 'lobster']
a[2:5]     # => ['bacon', 'tomato', 'ham']
a[-5:-2]   # => ['egg', 'bacon', 'tomato']
a[1:4]     # => ['egg', 'bacon', 'tomato']
```

#### Omitting index
```python
a[:4]        # => ['spam', 'egg', 'bacon', 'tomato']
a[0:4]       # => ['spam', 'egg', 'bacon', 'tomato']
a[2:]        # => ['bacon', 'tomato', 'ham', 'lobster']
a[2:len(a)]  # => ['bacon', 'tomato', 'ham', 'lobster']
a[:]         # => shallow copy of the whole list
```

#### With a stride
```python
a[0:6:2]   # => ['spam', 'bacon', 'ham']
a[1:6:2]   # => ['egg', 'tomato', 'lobster']
a[6:0:-2]  # => ['lobster', 'tomato', 'egg']
a[::-1]    # => ['lobster', 'ham', 'tomato', 'bacon', 'egg', 'spam']
```

### Remove
```python
li = ['bread', 'butter', 'milk']
li.pop()            # => 'milk'   li is now ['bread', 'butter']
del li[0]           # li is now ['butter']
li.remove('butter') # Remove first matching value (ValueError if missing)
li.clear()          # => []
```

### Access
```python
li = ['a', 'b', 'c', 'd']
li[0]    # => 'a'
li[-1]   # => 'd'
li[4]    # IndexError: list index out of range
```

### Concatenating
```python
odd = [1, 3, 5]
odd.extend([9, 11, 13])   # In place => [1, 3, 5, 9, 11, 13]

odd = [1, 3, 5]
odd + [9, 11, 13]         # New list => [1, 3, 5, 9, 11, 13]
```

### Sort & Reverse
```python
li = [3, 1, 3, 2, 5]
li.sort()                  # In place => [1, 2, 3, 3, 5]
li.reverse()               # In place => [5, 3, 3, 2, 1]
sorted(li)                 # Returns a new sorted list
sorted(users, key=lambda u: u['age'], reverse=True)
```

### Count
```python
[3, 1, 3, 2, 5].count(3)   # => 2
```

### Repeating
```python
["re"] * 3    # => ['re', 're', 're']
```

---

## FLOW CONTROL

### Basic
```python
num = 5
if num > 10:
    print("num is totally bigger than 10.")
elif num < 10:
    print("num is smaller than 10.")
else:
    print("num is indeed 10.")
```

### One Line
```python
a, b = 330, 200
r = "a" if a > b else "b"   # => 'a'  (conditional expression)
```

### else if
```python
value = True
if not value:
    print("Value is False")
elif value is None:          # Use `is` for None, not ==
    print("Value is None")
else:
    print("Value is True")
```

### match (3.10+)
```python
match status_code:
    case 200:
        print("OK")
    case 404 | 410:
        print("Gone")
    case _:
        print("Other")
```

---

## LOOPS

### Basic
```python
primes = [2, 3, 5, 7]
for prime in primes:
    print(prime)          # 2 3 5 7
```

### With Index
```python
animals = ["dog", "cat", "mouse"]
for i, value in enumerate(animals):   # enumerate() adds a counter
    print(i, value)                   # 0 dog / 1 cat / 2 mouse
```

### While
```python
x = 0
while x < 4:
    print(x)    # 0 1 2 3
    x += 1
```

### Break
```python
for index in range(10):
    if index == 5:
        break
    print(index * 10)   # 0 10 20 30 40
```

### Continue
```python
for index in range(3, 8):
    if index == 5:
        continue
    print(index * 10)   # 30 40 60 70
```

### Range
```python
for i in range(4):        print(i)   # 0 1 2 3
for i in range(4, 8):     print(i)   # 4 5 6 7
for i in range(4, 10, 2): print(i)   # 4 6 8
```

### With zip()
```python
words = ['Mon', 'Tue', 'Wed']
nums = [1, 2, 3]
for w, n in zip(words, nums):   # Pairs items; stops at the shortest
    print(f'{n}:{w}')           # 1:Mon 2:Tue 3:Wed
```

### for/else
```python
nums = [60, 70, 30, 110, 90]
for n in nums:
    if n > 100:
        print(f"{n} is bigger than 100")
        break
else:
    print("Not found!")   # Runs only if the loop did NOT break
```

### Dict Iteration
```python
for key, value in config.items():
    print(key, value)
```

---

## FUNCTIONS

### Basic
```python
def hello_world():
    print('Hello, World!')
```

### Return
```python
def add(x, y):
    return x + y

add(5, 6)   # => 11
```

### Positional Arguments
```python
def varargs(*args):
    return args

varargs(1, 2, 3)   # => (1, 2, 3)
```

### Keyword Arguments
```python
def keyword_args(**kwargs):
    return kwargs

keyword_args(big="foot", loch="ness")   # => {'big': 'foot', 'loch': 'ness'}
```

### *args and **kwargs Together
```python
def func(*args, **kwargs):
    print(args)      # (1, 2, 3) - tuple
    print(kwargs)    # {'a': 1} - dict

func(1, 2, 3, a=1)
```

### Returning Multiple
```python
def swap(x, y):
    return y, x   # Returns a tuple

x, y = swap(1, 2)   # => x = 2, y = 1
```

### Default Value
```python
def add(x, y=10):
    return x + y

add(5)       # => 15
add(5, 20)   # => 25
```
Never use a mutable default like `[]`. See [Gotchas](#1-mutable-default-arguments).

### Anonymous Functions (Lambda)
```python
(lambda x: x > 2)(3)                    # => True
(lambda x, y: x ** 2 + y ** 2)(2, 1)    # => 5

# Good: simple, one-off transformations
sorted_users = sorted(users, key=lambda u: u['age'])
# Bad: complex logic — use a named function instead
```

### Closures
```python
def rate_limiter(max_calls: int):
    calls = 0
    def check():
        nonlocal calls
        if calls >= max_calls:
            raise Exception("Rate limit exceeded")
        calls += 1
    return check

api_limiter = rate_limiter(100)   # Each closure has its own state
```

### Decorators
```python
import functools

def decorator(func):
    @functools.wraps(func)           # Preserves __name__, docstring
    def wrapper(*args, **kwargs):
        # before
        result = func(*args, **kwargs)
        # after
        return result
    return wrapper

@decorator
def my_func(): ...

# Decorator with parameters
def retry(max_attempts=3):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            for attempt in range(max_attempts):
                try:
                    return func(*args, **kwargs)
                except Exception:
                    if attempt == max_attempts - 1:
                        raise
        return wrapper
    return decorator

@retry(max_attempts=3)
def fetch_data(): ...
```

---

## MODULES & IMPORTS

### Import Modules
```python
import math
math.sqrt(16)   # => 4.0
```

### From a Module
```python
from math import ceil, floor
ceil(3.7)    # => 4
floor(3.7)   # => 3
```

### Import All
```python
from math import *   # Avoid — pollutes the namespace
```

### Shorten Module
```python
import math as m
math.sqrt(16) == m.sqrt(16)   # => True

from module import func as f  # Alias a single name
```

### Functions and Attributes
```python
import math
dir(math)         # List everything the module exposes
help(math.sqrt)   # Show the docstring
```

### Main Guard
```python
if __name__ == "__main__":
    main()  # Only runs when script is executed directly, not on import
```

---

## FILE HANDLING

### Read File

#### Line by line
```python
with open("myfile.txt", "r", encoding="utf8") as file:
    for line in file:           # Streams: doesn't load the whole file
        print(line.rstrip("\n"))
```

#### With line number
```python
with open("myfile.txt") as file:
    for i, line in enumerate(file, start=1):
        print(f"Number {i}: {line}", end="")
```

### String

#### Write a string
```python
contents = {"aa": 12, "bb": 21}
with open("myfile1.txt", "w+") as file:
    file.write(str(contents))
```

#### Read a string
```python
with open("myfile1.txt", "r+") as file:
    contents = file.read()
print(contents)
```

### Object (JSON)

#### Write an object
```python
import json

contents = {"aa": 12, "bb": 21}
with open("myfile2.txt", "w+") as file:
    json.dump(contents, file, indent=2)
```

#### Read an object
```python
with open("myfile2.txt", "r+") as file:
    contents = json.load(file)
print(contents)
```

### File Modes
| Mode | Meaning |
|------|---------|
| `r` | Read (default) |
| `w` | Write, truncating first |
| `a` | Append |
| `x` | Create, fail if exists |
| `+` | Read and write (`r+`, `w+`) |
| `b` | Binary (`rb`, `wb`) |

### Delete a File
```python
import os
os.remove("myfile.txt")
```

### Check and Delete
```python
import os

if os.path.exists("myfile.txt"):
    os.remove("myfile.txt")
else:
    print("The file does not exist")
```

### Delete Folder
```python
import os, shutil

os.rmdir("myfolder")          # Only works if the folder is empty
shutil.rmtree("myfolder")     # Deletes the folder and everything in it
```

### Modern (pathlib)
```python
from pathlib import Path

Path("file.txt").read_text()
Path("file.txt").write_text("content")
Path("file.txt").exists()
Path("file.txt").unlink(missing_ok=True)   # Delete (3.8+)
Path("data").mkdir(parents=True, exist_ok=True)
json_files = list(Path("data").glob("*.json"))
```

### JSON with pathlib
```python
import json

data = json.loads(Path("config.json").read_text())
Path("output.json").write_text(json.dumps(data, indent=2))
```

### CSV
```python
import csv

with open("data.csv") as f:
    reader = csv.DictReader(f)  # dict per row
    for row in reader:
        print(row['name'], row['age'])

with open("output.csv", "w", newline='') as f:
    writer = csv.DictWriter(f, fieldnames=['name', 'age'])
    writer.writeheader()
    writer.writerows([{'name': 'Alice', 'age': 30}])
```

---

## CLASSES & INHERITANCE

### Defining
```python
class MyNewClass:
    pass

my = MyNewClass()   # Class instantiation
```

### Constructors
```python
class Animal:
    def __init__(self, voice):
        self.voice = voice

cat = Animal('Meow')
cat.voice   # => 'Meow'
dog = Animal('Woof')
dog.voice   # => 'Woof'
```

### Basic Class
```python
class User:
    def __init__(self, id: int, name: str):
        self.id = id
        self.name = name

    def __str__(self) -> str:
        return f"User({self.name})"

    def __eq__(self, other) -> bool:
        return isinstance(other, User) and self.id == other.id
```

### Method
```python
class Dog:
    def bark(self):          # Method of the class
        print("Ham-Ham")

charlie = Dog()
charlie.bark()   # => Ham-Ham
```

### Class Variables
```python
class MyClass:
    class_variable = "A class variable!"   # Shared by all instances

MyClass.class_variable   # => 'A class variable!'
x = MyClass()
x.class_variable         # => 'A class variable!'
```

### Class & Static Methods
```python
class User:
    count = 0

    @classmethod
    def from_dict(cls, data: dict) -> "User":   # Alternative constructor
        return cls(**data)

    @staticmethod
    def is_valid_email(email: str) -> bool:     # No self/cls needed
        return "@" in email
```

### Super() Function
```python
class ParentClass:
    def print_test(self):
        print("Parent Method")

class ChildClass(ParentClass):
    def print_test(self):
        print("Child Method")
        super().print_test()   # Calls the parent's print_test()

ChildClass().print_test()
# => Child Method
# => Parent Method
```

### repr() Method
```python
class Employee:
    def __init__(self, name):
        self.name = name

    def __repr__(self):
        return f"Employee({self.name!r})"

john = Employee('John')
print(john)   # => Employee('John')
```

### User-defined Exceptions
```python
class CustomError(Exception):
    pass
```
See: [Handle Exceptions](#handle-exceptions)

### Polymorphism
```python
class ParentClass:
    def print_self(self):
        print('A')

class ChildClass(ParentClass):
    def print_self(self):
        print('B')

for obj in (ParentClass(), ChildClass()):
    obj.print_self()   # => A, then B
```

### Overriding
```python
class ParentClass:
    def print_self(self):
        print("Parent")

class ChildClass(ParentClass):
    def print_self(self):
        print("Child")

ChildClass().print_self()   # => Child
```

### Inheritance
```python
class Animal:
    def __init__(self, name, legs):
        self.name = name
        self.legs = legs

class Dog(Animal):
    def sound(self):
        print("Woof!")

yoki = Dog("Yoki", 4)
yoki.name     # => 'Yoki'
yoki.legs     # => 4
yoki.sound()  # => Woof!

class Admin(User):
    def __init__(self, id: int, name: str, level: int):
        super().__init__(id, name)  # Call parent constructor
        self.level = level
```

### Dataclass (Modern Alternative)
```python
from dataclasses import dataclass, field

@dataclass
class User:
    id: int
    name: str
    tags: list = field(default_factory=list)
# Generates __init__, __repr__, __eq__ automatically
```

### Properties
```python
class User:
    def __init__(self, email: str):
        self._email = email

    @property
    def email(self) -> str:
        return self._email

    @email.setter
    def email(self, value: str) -> None:
        if "@" not in value:
            raise ValueError("Invalid email")
        self._email = value
```

### Special Methods (Dunder)
| Method | Use | Example |
|--------|-----|---------|
| `__init__` | Constructor | `User(id, name)` |
| `__str__` | Human readable | `print(user)` |
| `__repr__` | Developer view | `repr(user)` |
| `__eq__` | Equality | `user1 == user2` |
| `__lt__` | Sorting | `sorted(users)` |
| `__len__` | Length | `len(user)` |
| `__hash__` | Dict/set key | `{user: value}` |
| `__enter__`/`__exit__` | Context manager | `with resource() as r:` |

---

## MISCELLANEOUS

### Comments
```python
# This is a single-line comment.

""" Multiline strings can be written
    using three "s, and are often used
    as documentation (docstrings).
"""

''' Multiline strings can also be written
    using three 's.
'''
```

### Generators
**When to use:** large data, streaming, memory efficiency. Generators make your code lazy.

```python
def double_numbers(iterable):
    for i in iterable:
        yield i + i

def count_up(max):
    current = 1
    while current <= max:
        yield current   # Pauses here, resumes on next()
        current += 1

for num in count_up(1_000_000):   # Doesn't load all values in memory
    process(num)

# Generator expression (lazy list comprehension)
squares = (x**2 for x in range(1_000_000))
```

### Generator to List
```python
values = (-x for x in [1, 2, 3, 4, 5])
list(values)   # => [-1, -2, -3, -4, -5]
```
A generator can be consumed only once.

### Handle Exceptions
```python
try:
    # Use "raise" to raise an error
    raise IndexError("This is an index error")
except IndexError as e:
    pass                   # No-op. Usually you would recover here
except (TypeError, NameError):
    pass                   # Handle several exceptions together
except Exception as e:
    print(f"Unexpected: {e}")
    raise                  # Re-raise if you can't handle it
else:                      # Optional; must follow all except blocks
    print("All good!")     # Runs only if try raised no exception
finally:                   # Runs under all circumstances
    print("We can clean up resources here")
```

### Custom Exceptions & Chaining
```python
class ValidationError(Exception):
    pass

try:
    result = int(user_input)
except ValueError as e:
    raise ValidationError("Invalid number") from e   # Preserves original traceback
```

### Context Managers

#### File handling (automatic cleanup)
```python
with open("file.txt") as f:
    data = f.read()
# File automatically closed, even on exception

with open("in.txt") as fin, open("out.txt", "w") as fout:
    fout.write(fin.read().upper())
```

#### Custom context manager
```python
class Resource:
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        cleanup()
        return False  # Re-raise any exception

# Function-based (simpler)
from contextlib import contextmanager

@contextmanager
def database_connection(host: str):
    conn = create_connection(host)
    try:
        yield conn
    finally:
        conn.close()
```

---

## REGEX

```python
import re

# Match / search
if re.match(r'^\d{3}-\d{3}-\d{4}$', "555-123-4567"):
    print("Valid phone")

# Find all
emails = re.findall(r'\w+@\w+\.\w+', text)

# Replace
text = re.sub(r'\[NAME\]', 'Alice', template)

# Named groups
m = re.search(r"(?P<year>\d{4})-(?P<month>\d{2})", "2024-01")
m.group('year')  # '2024'

# Compile for reuse — important in loops!
PATTERN = re.compile(r'pattern')
for line in lines:
    if PATTERN.search(line):
        process(line)
```

### Common Patterns
| Pattern | Matches |
|---------|---------|
| `\d` | Digit |
| `\w` | Word char (letter, digit, `_`) |
| `\s` | Whitespace |
| `[abc]` | Any of a, b, c |
| `[^abc]` | NOT a, b, c |
| `+` | 1 or more |
| `*` | 0 or more |
| `?` | 0 or 1 |
| `{3}` | Exactly 3 |
| `^` / `$` | Start / end of string |

---

## TESTING (pytest)

### Basics
```python
import pytest

def test_my_function():
    assert my_function(5) == 10

def test_error_handling():
    with pytest.raises(ValueError):
        my_function(-1)
```

### Fixtures
```python
@pytest.fixture
def user():
    return User(id=1, name="Alice")

@pytest.fixture(scope="session")   # function (default) | class | module | session
def browser():
    driver = webdriver.Chrome()
    yield driver
    driver.quit()

def test_user_creation(user):
    assert user.name == "Alice"
```

### Parametrization
```python
@pytest.mark.parametrize("input,expected", [
    (2, 4), (3, 9), (5, 25),
])
def test_square(input, expected):
    assert square(input) == expected
```

### Markers
```python
@pytest.mark.skip(reason="Not yet implemented")
def test_future(): ...

@pytest.mark.slow
def test_large_dataset(): ...

# Run subsets: pytest -m smoke | pytest -m "not slow"
```

### Mocking
```python
from unittest.mock import patch, Mock

@patch('module.function')   # Patch where it's USED, not where it's defined
def test_with_mock(mock_func):
    mock_func.return_value = "mocked"
    assert my_code() == "mocked"
    mock_func.assert_called_once()

# Side effects (different result per call, or raise)
mock = Mock(side_effect=[ValueError("boom"), "success"])
```

---

## LOGGING

```python
import logging

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

logger.info("Starting...")
logger.error("Failed: %s", error_message)
```

```
DEBUG < INFO < WARNING < ERROR < CRITICAL
```

---

## PERFORMANCE TIPS

### What's Fast?
- ✓ Looking up a key in a `dict` or an item in a `set`
- ✓ Adding to the end of a `list`
- ✗ Inserting/removing at the front of a `list` → use `collections.deque`
- ✗ `x in some_list` on a big list → use a `set` instead
- Need the smallest/largest item again and again while the data changes → use `heapq`

### Profiling
```python
import timeit
time = timeit.timeit("x = [1,2,3] + [4,5,6]", number=100_000)

import cProfile, pstats
cProfile.run('main()', 'profile_out')
pstats.Stats('profile_out').sort_stats('cumulative').print_stats(10)
```

---

## GOTCHAS (Watch Out!)

### 1. Mutable Default Arguments
```python
# BAD — same list reused across every call
def func(items=[]):
    items.append(1)
    return items

# GOOD
def func(items=None):
    if items is None:
        items = []
    return items
```

### 2. Shallow Copy
```python
a = [[1, 2], [3, 4]]
b = a.copy()      # Shallow copy — inner lists still shared
b[0][0] = 99       # Changes both a and b
import copy
b = copy.deepcopy(a)   # Fix
```

### 3. Late Binding in Closures
A function made in a loop looks up the loop variable when it *runs*, not when it was made.
```python
# BAD — all lambdas capture the same final value of i
functions = [lambda x: x + i for i in range(3)]

# GOOD — bind i at definition time via default arg
functions = [lambda x, j=i: x + j for i in range(3)]
```

### 4. Strings Can't Be Changed in Place
```python
s = "hello"
s[0] = 'H'       # TypeError!
s = "H" + s[1:]  # Correct way to "modify"
```

### 5. Dict Keys Must Be Unchangeable ("Hashable")
Only values that can't change — `str`, `int`, `tuple` — can be dict keys or set items.
```python
d = {[1, 2]: "value"}   # TypeError — a list can change, so it can't be a key
d = {(1, 2): "value"}   # OK — a tuple can't change
```

### 6. `/` Always Returns a Float
```python
16 / 4    # => 4.0, not 4
-7 // 2   # => -4  (floors toward negative infinity, not toward zero)
```

### 7. `[[]] * n` Shares One Inner List
```python
grid = [[]] * 3
grid[0].append(1)   # => [[1], [1], [1]]  (all the same list!)
grid = [[] for _ in range(3)]   # Fix
```

---

## COMMON PATTERNS

### Error Handling with Context
```python
try:
    operation()
except SpecificError as e:
    handle_specific(e)
except Exception as e:
    logger.error("Unexpected: %s", e)
    raise
else:
    logger.info("Success")
finally:
    cleanup()
```

### Type Checking
```python
from typing import Optional

def process(items: list[str]) -> dict[str, int]:   # Built-in generics, 3.9+
    return {item: len(item) for item in items}

def get_value(key: str) -> Optional[str]:           # Or: str | None (3.10+)
    return data.get(key)
```

### Factory Pattern
```python
class UserFactory:
    @staticmethod
    def create(role: str):
        if role == "admin":
            return AdminUser()
        return RegularUser()
```

---

## One-Liners to Remember

| Task | Code |
|------|------|
| Check if dict has key | `if key in d:` |
| Get dict value or default | `d.get(key, default)` |
| Convert to list | `list(iterable)` |
| Sort descending | `sorted(items, reverse=True)` |
| Remove duplicates (order lost) | `list(set(items))` |
| Remove duplicates (order kept) | `list(dict.fromkeys(items))` |
| Join strings | `", ".join(items)` |
| Split string | `text.split(", ")` |
| Count occurrences | `text.count("word")` |
| Replace text | `text.replace("old", "new")` |
| Format string | `f"Hello {name}"` |
| Reverse a string | `text[::-1]` |
| Swap two variables | `a, b = b, a` |
| Conditional value | `x = "yes" if cond else "no"` |
| All conditions true | `all([a, b, c])` |
| Any condition true | `any([a, b, c])` |
| Find minimum / maximum | `min(items)` / `max(items)` |
| Sum all items | `sum(items)` |
| Index of item | `items.index(value)` |
| Reverse list | `items[::-1]` |
| Get unique items | `set(items)` |
| Pair two lists | `dict(zip(keys, values))` |
| Top-N largest | `heapq.nlargest(n, items)` |
| Count items | `Counter(items).most_common()` |
| Flatten one level | `[x for sub in nested for x in sub]` |

---

## Need More Detail?

This page is the quick answer. For the longer explanation behind each topic —
concurrency, the memory model, ops scripting, and interview questions — see
[Python: The Complete Guide](/docs/sde-skills/python/python-guide), the same
guide the [cheat sheet](/cheatsheets/python) links to. For an ordered plan with
mini-projects, follow the [Python learning path](/docs/learning-path/python/implementation-roadmap).

*Last updated: September 2026*
