---
title: "Linux Administration Cheat Sheet"
description: "Quick reference for Linux administration — permissions, processes, text processing, and networking basics."
tags: [linux, sre, cheat-sheet]
hide_table_of_contents: true
---

# Linux administration cheatsheet

A one-page reference for Linux administration. For the full filesystem
hierarchy, package management, and shell-scripting deep-dive, see the [complete guide](/docs/sre-skills/linux-administration/linux-administration-guide).

<a class="topic-crosslink" href="/docs/sre-skills/linux-administration/linux-administration-guide">📖 Full guide: Linux Administration →</a>

<div class="cheat-sheet cheat-sheet--sre">

<div class="cheat-card">

#### grep

```bash
grep -rn "TODO" src/
grep -riE "error|fail|panic" app.log
grep -v "^#" config.conf         # invert — strip comments
grep -c "ERROR" app.log
grep -A3 -B1 "Exception" app.log
grep -oP '(?<=user=)\w+' access.log
```

</div>

<div class="cheat-card">

#### sed

```bash
sed 's/foo/bar/g' file
sed -i.bak 's/foo/bar/g' file    # in-place with backup
sed -n '10,20p' file
sed '/^$/d' file                 # delete blank lines
sed -n '/START/,/END/p' file
```

</div>

<div class="cheat-card">

#### Permissions

```bash
chmod 755 script.sh
chmod u+x script.sh
chown user:group file
```

`r=4 w=2 x=1` per owner/group/other. `755` = rwxr-xr-x.

</div>

<div class="cheat-card">

#### Process management

```bash
ps aux --sort=-%cpu | head
kill -15 PID    # graceful
kill -9 PID     # force
systemctl status nginx
systemctl restart nginx
journalctl -u nginx -f
```

</div>

<div class="cheat-card">

#### Disk & storage

```bash
df -h
du -sh */ | sort -h
lsof +D /path
```

</div>

<div class="cheat-card">

#### SSH & cron

```bash
ssh -i key.pem user@host
scp file.txt user@host:/path/
crontab -e
# m h dom mon dow  command
0 2 * * * /opt/backup.sh
```

</div>

<div class="cheat-card">

#### Networking from the OS side

```bash
ss -tulpn
ip addr
curl -o /dev/null -s -w "%{time_total}\n" https://example.com
```

</div>

<div class="cheat-card">

#### Environment variables

```bash
export PATH="$PATH:/opt/tool/bin"
echo $HOME
env | grep MY_VAR
```

`.bashrc`/`.zshrc` for interactive shells, `/etc/environment` for system-wide.

<span class="cheat-see">See: Interview-Ready Q&A</span>

</div>

</div>
