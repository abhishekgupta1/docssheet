---
title: "Linux Kernel Fundamentals"
description: "Conceptual foundation of how the Linux kernel manages processes, memory, I/O, and hardware — scheduling, user/kernel space, syscalls, interrupts, context switching, and modules."
sidebar_position: 10
tags: [linux, sre, kernel, syscalls, interrupts, context-switching, kernel-modules]
---

Understand how Linux actually works before debugging it.

## Table of Contents

1. [What the Linux Kernel Does](#1-what-the-linux-kernel-does)
2. [User Space vs Kernel Space](#2-user-space-vs-kernel-space)
3. [System Calls](#3-system-calls)
4. [Interrupts & Context Switching](#4-interrupts--context-switching)
5. [Kernel Modules](#5-kernel-modules)
6. [Summary Table](#-summary-table)
7. [Interview Q&A](#-interview-qa)

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 300" role="img" aria-labelledby="mm-kernelfund-title mm-kernelfund-desc">
<title id="mm-kernelfund-title">User space, the syscall bridge, and kernel space</title>
<desc id="mm-kernelfund-desc">Applications run in user space and can only reach kernel space through the narrow, controlled system call interface. Interrupts force the kernel to react to hardware, and kernel modules extend kernel space at runtime without a reboot.</desc>
<defs>
  <marker id="mm-kernelfund-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<rect class="mm-n3" x="40" y="20" width="560" height="70" rx="10"/>
<text class="mm-node-title" x="320" y="50" text-anchor="middle">User Space</text>
<text class="mm-node-sub" x="320" y="67" text-anchor="middle">applications, processes — no direct hardware access</text>

<path class="mm-arrow" d="M320,90 L320,110" marker-end="url(#mm-kernelfund-arrow)"/>

<rect class="mm-n4" x="240" y="110" width="160" height="50" rx="10"/>
<text class="mm-node-title" x="320" y="132" text-anchor="middle">System Call</text>
<text class="mm-node-sub" x="320" y="147" text-anchor="middle">the only controlled gate</text>

<path class="mm-arrow" d="M320,160 L320,180" marker-end="url(#mm-kernelfund-arrow)"/>

<rect class="mm-n2" x="40" y="180" width="560" height="90" rx="10"/>
<text class="mm-node-title" x="320" y="212" text-anchor="middle">Kernel Space</text>
<text class="mm-node-sub" x="320" y="230" text-anchor="middle">scheduler, memory management, device drivers</text>
<text class="mm-node-sub" x="320" y="245" text-anchor="middle">full hardware access</text>

<rect class="mm-n1" x="605" y="110" width="155" height="50" rx="10"/>
<text class="mm-node-title" x="682" y="132" text-anchor="middle">Interrupts</text>
<text class="mm-node-sub" x="682" y="147" text-anchor="middle">hardware signals in</text>
<path class="mm-arrow" d="M660,160 L605,190" marker-end="url(#mm-kernelfund-arrow)"/>

<rect class="mm-n5" x="605" y="205" width="155" height="50" rx="10"/>
<text class="mm-node-title" x="682" y="227" text-anchor="middle">Kernel Modules</text>
<text class="mm-node-sub" x="682" y="242" text-anchor="middle">loaded at runtime</text>
<path class="mm-arrow" d="M605,225 L600,225" marker-end="url(#mm-kernelfund-arrow)"/>
</svg>

<p class="mental-model__caption">Every application lives in user space and can only touch hardware by crossing the narrow system-call interface into kernel space, where the scheduler, memory manager, and drivers actually run; interrupts push into the kernel from the hardware side, and kernel modules extend that same kernel space at runtime without a reboot.</p>
</div>

## 1. What the Linux Kernel Does

The Linux kernel is the core of the operating system. It acts as a bridge between hardware and user applications. It manages hardware resources and provides essential services like process scheduling, memory management, device I/O, and networking. Linux uses a **monolithic kernel** architecture, meaning most core services (drivers, filesystem, networking) run in kernel space.

### 🔹 Process Scheduling
- Decides which process runs and for how long.
- Enables multitasking by rapidly switching between processes.
- Uses scheduling policies (e.g. the Completely Fair Scheduler).
- Ensures fairness, responsiveness, and CPU efficiency.

👉 Without scheduling, only one program could run at a time.

### 🔹 Memory Management
- Allocates and deallocates RAM to processes.
- Implements virtual memory (each process gets its own address space).
- Handles paging, swapping, memory protection.
- Prevents processes from accessing each other's memory.

👉 This is what stops one crashing app from corrupting everything else.

### 🔹 I/O (Input/Output) Management
- Manages communication with hardware devices: disks, keyboards, USB devices, GPUs.
- Uses device drivers to talk to hardware.
- Provides a uniform interface — everything appears like a file in Linux.
```
/dev/sda
/dev/tty
```

### 🔹 Networking
- Implements the full TCP/IP stack.
- Manages sockets, routing, firewalls (e.g. Netfilter), network interfaces.
- Enables internet communication.

---

## 2. User Space vs Kernel Space

Linux separates memory into two main regions.

### 🔹 Kernel Space
- Where the kernel runs.
- Full access to hardware and memory.
- Highly privileged.
- Bugs here can crash the entire system.

### 🔹 User Space
- Where normal applications run.
- Limited access.
- Cannot directly access hardware.
- Must request services from the kernel.

👉 This separation improves security and stability. Think of it like: kernel space = supervisor mode, user space = restricted mode.

| User Space | Kernel Space |
|---|---|
| Applications run here | Kernel runs here |
| Limited hardware access | Full hardware access |
| Cannot directly access memory of other processes | Can access all memory |
| More secure and isolated | Privileged mode |

If a program in user space crashes, it usually doesn't crash the system. If code in kernel space crashes, the entire system can crash.

---

## 3. System Calls

A **system call** is how a user-space program requests a service from the kernel.

Examples: `open()`, `read()`, `write()`, `fork()`, `exec()`

```c
write(1, "Hello\n", 6);
```

What happens:
1. Program runs in user space.
2. Triggers a system call (a trap instruction).
3. CPU switches to kernel mode.
4. Kernel validates arguments and performs the requested operation.
5. Result is returned to user space; CPU switches back to user mode.

👉 System calls are the gateway between user space and kernel space.

---

## 4. Interrupts & Context Switching

### 🔹 Interrupts
An **interrupt** is a signal that tells the CPU to stop what it's doing and handle something urgent.

Types:
- **Hardware interrupts** (keyboard press, disk ready)
- **Software interrupts** (system calls)

Flow: device sends interrupt → CPU pauses current task → kernel runs interrupt handler → returns to previous task.

### 🔹 Context Switching
A **context switch** happens when the CPU switches from one process (or thread) to another. The kernel saves CPU registers, program counter, and stack pointer, then loads the next process's state.

Context switching enables multitasking. ⚠️ It has overhead, so too many switches reduce performance.

---

## 5. Kernel Modules

Kernel modules are pieces of code that can be dynamically loaded or unloaded into the running kernel **without rebooting the system**. Used for device drivers, filesystems, networking components. This keeps the kernel modular and flexible.

### `lsmod`
Lists currently loaded kernel modules.
```bash
lsmod
```

### `modprobe`
Loads or removes a module and handles dependencies automatically.
```bash
sudo modprobe module_name
sudo modprobe -r module_name
```

### `insmod` (lower-level)
Loads a module manually (does not resolve dependencies).
```bash
sudo insmod module.ko
```

---

## 🔎 Summary Table

| Component | Role |
|---|---|
| Process Scheduler | Chooses which process runs |
| Memory Manager | Allocates & protects memory |
| I/O Subsystem | Communicates with hardware |
| Networking Stack | Handles TCP/IP |
| System Calls | Interface between user & kernel |
| Interrupts | Handle urgent hardware/software events |
| Context Switching | Enables multitasking |
| Kernel Modules | Extend the kernel dynamically |

---

## 🎯 Interview Q&A

**Q1. What is the Linux kernel?**
The core component of the Linux operating system. It manages hardware resources and provides essential services like process scheduling, memory management, device I/O, and networking — acting as a bridge between user applications and hardware. Linux uses a monolithic kernel architecture.

**Q2. What does the Linux kernel do?**
Process scheduling (deciding which process runs on the CPU), memory management (allocating RAM, virtual memory), device management/I/O (interacting with hardware via drivers), networking (implementing the TCP/IP stack), and system security & isolation (separating user space from kernel space).

**Q3. What is the difference between user space and kernel space?**
See the [table above](#2-user-space-vs-kernel-space). Kernel space is privileged and full-access; user space is isolated and limited.

**Q4. What is a system call?**
A mechanism allowing a user-space application to request a kernel service. Examples: `read()`, `write()`, `fork()`, `exec()`, `open()`. It is the controlled entry point into the kernel.

**Q5. What is context switching?**
Saving the state of one process/thread and loading the state of another so the CPU can switch execution. The kernel saves CPU registers, program counter, and stack pointer. Enables multitasking but introduces overhead.

**Q6. What is an interrupt?**
A signal sent to the CPU requiring immediate attention — hardware (keyboard, disk I/O completion) or software (system calls). The CPU pauses the current task, executes an interrupt handler in kernel space, then resumes.

**Q7. What is a kernel module?**
Code that can be dynamically loaded/unloaded into the running kernel without rebooting. Commonly used for device drivers, filesystems, networking components.

**Q8. What are `lsmod` and `modprobe`?**
`lsmod` lists currently loaded kernel modules. `modprobe` loads or removes modules and handles dependencies automatically. `insmod` loads a module manually without resolving dependencies.

**Q9. How does Linux handle memory management?**
Linux uses virtual memory — each process has its own virtual address space. The kernel allocates memory pages, uses paging and swapping, ensures memory isolation, and prevents unauthorized access. This improves stability and security.

**Q10. What is process scheduling in Linux?**
Determines which process runs on the CPU at a given time. Linux uses the **Completely Fair Scheduler (CFS)**, which tries to fairly distribute CPU time using virtual runtime and prioritizes interactive tasks.

**Q11. What happens during a system call?** (Detailed)
1. User application calls a library wrapper (e.g. `write()`).
2. A trap instruction triggers a switch to kernel mode.
3. Kernel validates arguments.
4. Kernel executes the requested operation.
5. Result is returned to user space.
6. CPU switches back to user mode.

**Q12. Why is kernel space separated from user space?**
For security, stability, memory protection, and fault isolation — preventing applications from directly manipulating hardware or corrupting the system.

### 🔥 Advanced Questions

**Q13. What is the difference between a process and a thread?**

| Process | Thread |
|---|---|
| Own memory space | Shares memory with process |
| Heavyweight | Lightweight |
| Slower context switch | Faster context switch |

Threads are smaller execution units inside a process.

**Q14. What is a zombie process?**
A process that has completed execution but still has an entry in the process table because its parent has not yet read its exit status using `wait()`. (See also [Process Management & /proc](./process-management-proc).)

**Q15. What is the difference between `fork()` and `exec()`?**
`fork()` creates a new process by duplicating the current process. `exec()` replaces the current process's memory with a new program. Typically used together: `fork()` then `exec()`.

### 🎯 Interview Tip
When answering: start with a definition, add 1–2 technical details, then mention why it matters (performance, security, stability). That shows both knowledge and understanding.

---

## Summary

- 💡 The kernel/user-space split is the single most important Linux architectural fact — it explains why a crashing app doesn't take down the system, but a kernel bug does.
- 🔥 System calls are the *only* sanctioned path from user space into kernel space — every I/O, process, or memory operation eventually goes through one.
- ⚠️ Context switching is necessary for multitasking but has real overhead — excessive switching (e.g. thread explosion) is itself a performance problem.
- ✅ Kernel modules let drivers and subsystems load without a reboot — `lsmod`/`modprobe` are the operational commands to know.

## See Also

- [Process Management & /proc](./process-management-proc) — zombie processes, `fork()`/`exec()` in practice
- [Linux Debugging Reference](./linux-debugging-reference) — where kernel-level tools (`strace`, `dmesg`, `perf`) fit in
- [90-Day Linux/SRE Roadmap](./linux-sre-90-day-roadmap) — Phase 2 builds directly on this kernel model
