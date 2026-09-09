---
title: "Terraform: The Complete Guide"
description: "End-to-end reference for Terraform — IaC philosophy, core workflow, HCL syntax, state management, modules, and interview-ready Q&A."
sidebar_position: 1
tags: [terraform, sre, infrastructure-as-code]
---

# Terraform — The Complete Guide

A single-read, end-to-end reference for Terraform: enough to stand up real
infrastructure safely, reason about state, or walk into an SRE/infra
interview. Organized as a lookup you can also read top-to-bottom.

<a class="topic-crosslink" href="/cheatsheets/terraform">📋 Quick reference: Terraform →</a>

---

<div class="mental-model">
<span class="mental-model__label">🧭 Mental model</span>

<svg viewBox="0 0 780 220" role="img" aria-labelledby="mm-tf-title mm-tf-desc">
<title id="mm-tf-title">The Terraform core workflow</title>
<desc id="mm-tf-desc">Terraform init, plan, and apply form a repeating cycle for every change, with destroy as the separate inverse path that tears everything down.</desc>
<defs>
  <marker id="mm-tf-arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0,0 L10,5 L0,10 z" class="mm-arrowhead"/>
  </marker>
</defs>

<path class="mm-arrow" d="M505,100 C505,50 305,50 305,98" marker-end="url(#mm-tf-arrow)"/>
<text class="mm-flow-label" x="405" y="45" text-anchor="middle">iterate for the next change</text>

<rect class="mm-n1" x="20" y="100" width="170" height="70" rx="10"/>
<text class="mm-node-title" x="105" y="128" text-anchor="middle">init</text>
<text class="mm-node-sub" x="105" y="145" text-anchor="middle">terraform init</text>

<rect class="mm-n2" x="220" y="100" width="170" height="70" rx="10"/>
<text class="mm-node-title" x="305" y="128" text-anchor="middle">plan</text>
<text class="mm-node-sub" x="305" y="145" text-anchor="middle">terraform plan</text>

<rect class="mm-n3" x="420" y="100" width="170" height="70" rx="10"/>
<text class="mm-node-title" x="505" y="128" text-anchor="middle">apply</text>
<text class="mm-node-sub" x="505" y="145" text-anchor="middle">terraform apply</text>

<rect class="mm-n4" x="620" y="100" width="150" height="70" rx="10"/>
<text class="mm-node-title" x="695" y="128" text-anchor="middle">destroy</text>
<text class="mm-node-sub" x="695" y="145" text-anchor="middle">terraform destroy</text>

<path class="mm-arrow" d="M190,135 L218,135" marker-end="url(#mm-tf-arrow)"/>
<path class="mm-arrow" d="M390,135 L418,135" marker-end="url(#mm-tf-arrow)"/>
<path class="mm-arrow" d="M590,135 L618,135" marker-end="url(#mm-tf-arrow)"/>
</svg>

<p class="mental-model__caption">Init, plan, and apply are the loop you run for every single change — plan is the safety check you always read before apply executes it — while destroy is the separate, deliberate inverse path that tears the whole configuration back down.</p>
</div>

## 1. Infrastructure as Code — the Philosophy

Terraform (by HashiCorp) is a **declarative Infrastructure as Code (IaC)**
tool: you describe the *desired end state* of your infrastructure in
configuration files, and Terraform computes and executes the sequence of
API calls needed to get there — across any provider (AWS, GCP, Azure,
Kubernetes, Datadog, GitHub, and hundreds more) through the same workflow
and language.

| | Declarative (Terraform) | Imperative (shell script / Ansible-style tasks) |
|---|---|---|
| You specify | *What* the end state should look like | *How* to get there, step by step |
| Re-running | Idempotent — converges to the same state regardless of current state | Can re-run side effects unless carefully guarded |
| Drift handling | Detects and reports differences from the last known state | No built-in concept of "current state" to diff against |

Why IaC matters operationally: infrastructure changes become **versioned,
reviewable (via pull request), repeatable across environments, and
auditable** — the same discipline applied to application code, applied to
the infrastructure underneath it. It replaces manual console clicking,
which is unrepeatable, undocumented, and impossible to diff.

---

## 2. Core Workflow

```bash
terraform init      # download providers/modules, configure the backend
terraform plan       # compute the diff between current state and desired config
terraform apply       # execute the plan, create/update/destroy real resources
terraform destroy      # tear down everything Terraform manages in this config
```

- **`init`** — reads the backend block and provider requirements, downloads
  provider plugins into `.terraform/`, initializes remote state. Re-run
  whenever you add a provider/module or change backend config.
- **`plan`** — a **read-only, dry-run** diff: Terraform refreshes its view
  of real infrastructure, compares it to your `.tf` files, and prints
  exactly what would be created (`+`), changed (`~`), or destroyed (`-`).
  Always read the plan output before applying — this is the primary safety
  mechanism in the entire workflow.
- **`apply`** — re-runs the plan and executes it (prompting for
  confirmation by default, or accepting a saved plan file:
  `terraform apply tfplan`). Never apply blind in production — always
  review a plan first, ideally as a CI-generated artifact reviewed in a PR.
- **`destroy`** — the inverse of apply; deletes every resource Terraform
  tracks in state for that configuration. Extremely destructive — use
  `-target` sparingly and only when you fully understand the blast radius.

```bash
terraform fmt -recursive     # canonical formatting
terraform validate            # syntax/internal-consistency check, no API calls
terraform plan -out=tfplan     # save the plan for a later, identical apply
terraform apply tfplan          # apply exactly what was reviewed — no surprise drift between plan and apply
```

---

## 3. HCL Syntax

Terraform's configuration language is **HCL (HashiCorp Configuration
Language)** — declarative, block-structured, JSON-compatible.

### Resources

The fundamental unit — declares a piece of infrastructure to create and
manage.

```hcl
resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
  subnet_id     = aws_subnet.public_a.id

  tags = {
    Name        = "web-server"
    Environment = var.environment
  }
}
```

`resource "<TYPE>" "<LOCAL_NAME>"` — type comes from the provider, local
name is how you reference it elsewhere in the config
(`aws_instance.web.id`).

### Data sources

Read-only lookups against existing infrastructure or provider APIs —
Terraform doesn't manage or destroy these, just reads current values.

```hcl
data "aws_ami" "amazon_linux" {
  most_recent = true
  owners      = ["amazon"]
  filter {
    name   = "name"
    values = ["amzn2-ami-hvm-*-x86_64-gp2"]
  }
}
```

### Variables

Parameterize configuration so the same code works across environments.

```hcl
variable "environment" {
  type        = string
  description = "Deployment environment name"
  default     = "staging"
  validation {
    condition     = contains(["staging", "production"], var.environment)
    error_message = "environment must be staging or production."
  }
}

variable "instance_count" {
  type    = number
  default = 2
}
```

```bash
terraform apply -var="environment=production"
terraform apply -var-file="production.tfvars"
```

Terraform's type system covers **primitive** types (`string`, `number`,
`bool`), **collection** types (`list(type)`, `map(type)`, `set(type)`), and
**structural** types (`object({...})`, `tuple([...])`) for values that mix
types by key or position:

```hcl
variable "db_config" {
  type = object({
    engine         = string
    instance_class = string
    multi_az       = bool
  })
  default = {
    engine         = "postgres"
    instance_class = "db.t3.micro"
    multi_az       = false
  }
}
```

Variables can be assigned from several sources at once; Terraform resolves
conflicts with a fixed precedence order (highest wins):

| Precedence | Source |
|---|---|
| 1 (highest) | `-var` / `-var-file` flags on the command line |
| 2 | `*.auto.tfvars` / `*.auto.tfvars.json` files (alphabetical order) |
| 3 | `terraform.tfvars` / `terraform.tfvars.json` |
| 4 | `TF_VAR_<name>` environment variables |
| 5 (lowest) | `default` in the `variable` block |

This order matters in practice: a stray `dev.auto.tfvars` left in a
directory silently overrides a `-var-file` you thought was authoritative,
unless you also passed `-var` explicitly.

### Outputs

Expose values for use by other configs, CI pipelines, or humans reading
`terraform output`.

```hcl
output "web_public_ip" {
  value       = aws_instance.web.public_ip
  description = "Public IP of the web server"
}

output "db_password" {
  value     = random_password.db.result
  sensitive = true    # withheld from CLI output/logs, still stored in state
}
```

### Locals

Named expressions computed once, referenced by name — avoid repeating
complex expressions or hardcoded values across a config.

```hcl
locals {
  name_prefix = "${var.project}-${var.environment}"
  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

resource "aws_s3_bucket" "assets" {
  bucket = "${local.name_prefix}-assets"
  tags   = local.common_tags
}
```

### Expressions, count, and for_each

```hcl
resource "aws_instance" "web" {
  count         = var.instance_count
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
  tags          = { Name = "web-${count.index}" }
}

resource "aws_iam_user" "team" {
  for_each = toset(var.usernames)
  name     = each.value
}
```

`count` is index-based — inserting/removing an item mid-list shifts every
subsequent index and can force unnecessary replace/destroy churn.
`for_each` (keyed by string/map) is preferred for anything where individual
items are added/removed over time, since each resource is tracked by a
stable key, not a shifting position.

### Meta-arguments: `depends_on`, `lifecycle`, and provider aliasing

Every `resource` (and `module`) block accepts a small set of arguments that
aren't specific to any provider — they control how Terraform manages the
resource itself, not what it configures on the remote API.

```hcl
resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
  provider      = aws.us_east   # which aliased provider configuration to use

  depends_on = [aws_iam_role_policy_attachment.web]  # explicit dependency Terraform can't infer

  lifecycle {
    create_before_destroy = true                       # provision the replacement before destroying the old one
    prevent_destroy        = true                       # destroy/replace on this resource errors out instead of running
    ignore_changes          = [tags["LastDeployedBy"]]   # don't diff when this attribute drifts externally
  }
}
```

| Meta-argument | Purpose |
|---|---|
| `depends_on` | Force an explicit ordering dependency Terraform can't infer from attribute references — a last resort; prefer wiring resources together via `resource.attribute` references, which create implicit dependencies automatically. |
| `provider` | Select which aliased provider configuration (e.g. `aws.us_east`) a resource or module uses — needed for multi-region/multi-account setups. |
| `lifecycle.create_before_destroy` | For a forced replacement, provision the new resource before tearing down the old one — avoids downtime on load-bearing resources (e.g., an ASG launch template swap). |
| `lifecycle.prevent_destroy` | Hard-blocks destroy/replace of this resource, even via a full `terraform destroy` — must be removed deliberately before the resource can be torn down. Use on genuinely irreplaceable resources (production databases, state buckets). |
| `lifecycle.ignore_changes` | Stop `plan` from showing a diff for specific attributes that legitimately change outside Terraform (e.g., a `desired_count` an autoscaler manages, tags set by another automated process). |

**Interview trap:** `prevent_destroy` doesn't silently swallow a destructive
change — an attribute change that forces replacement (shown in plan output
as `# forces replacement`) still fails loudly at plan/apply time if the
resource has `prevent_destroy = true`, rather than quietly destroying it.
That's the point: it converts an accidental destroy into a guaranteed,
visible error.

### Provisioners — last resort, not first choice

Provisioners run scripts/commands on a resource at create or destroy time.
HashiCorp's own guidance: reach for these only when nothing declarative
solves the problem — a custom AMI, `user_data`, or a dedicated
configuration-management tool (Ansible, cloud-init) all participate in
`plan`/`apply` far more predictably than an imperative script bolted onto a
declarative resource.

```hcl
resource "aws_instance" "web" {
  ami           = data.aws_ami.amazon_linux.id
  instance_type = "t3.micro"
  key_name      = "deploy-key"

  connection {
    type        = "ssh"
    user        = "ec2-user"
    private_key = file("~/.ssh/deploy-key.pem")
    host        = self.public_ip
  }

  provisioner "file" {
    source      = "app.conf"
    destination = "/etc/app/app.conf"
  }

  provisioner "remote-exec" {
    inline = [
      "sudo systemctl restart app",
    ]
  }

  provisioner "local-exec" {
    when    = destroy
    command = "echo 'instance ${self.id} destroyed' >> /var/log/terraform-destroys.log"
  }
}
```

- A `connection` block is required for `file`/`remote-exec` provisioners so
  Terraform knows how to reach the resource (SSH/WinRM).
- `local-exec` runs on the machine running Terraform, not the remote
  resource — useful for notifications or local cleanup; `when = destroy`
  runs it only during teardown.
- Provisioners don't participate in `plan`'s diff the way resource
  attributes do — a failed provisioner taints the resource for recreation
  on the next apply, a much blunter failure mode than a typical
  attribute-level error.

---

## 4. State Management

Terraform's **state file** (`terraform.tfstate`) is a JSON record mapping
every resource in your config to the real-world object it manages
(including provider-internal IDs your `.tf` files never mention). It is
Terraform's memory — **without state, `plan` has nothing to diff against**
and would try to recreate everything from scratch.

### Why remote state, not local

| Local state (`terraform.tfstate` on disk) | Remote state (S3, Terraform Cloud, GCS, Azure Blob, etc.) |
|---|---|
| Fine for solo experiments only | Required for any team/production use |
| No locking — two people applying simultaneously corrupts it | Supports **locking** — prevents concurrent applies |
| Not shared — CI can't see it | Shared, versioned, accessible to CI/CD and every teammate |
| Contains secrets in plaintext on a laptop | Can be encrypted at rest, access-controlled via IAM |

```hcl
terraform {
  backend "s3" {
    bucket         = "acme-terraform-state"
    key            = "prod/network/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "terraform-locks"   # state locking (legacy pattern; S3 native locking is now also supported)
    encrypt        = true
  }
}
```

Enable versioning on the S3 bucket (or equivalent) backing state — it gives
you a rollback trail (`aws s3api list-object-versions`) if state ever
becomes corrupted or an apply goes wrong, independent of the lock that
protects against concurrent writes.

### State locking

Prevents two `apply` operations from running concurrently against the same
state — without it, simultaneous applies can race, producing a corrupted
or inconsistent state file that no longer reflects reality. S3 backends
traditionally paired with a DynamoDB table for a distributed lock; newer
Terraform versions also support native S3 conditional-write locking.

### Common state operations

```bash
terraform state list                          # every resource tracked in state
terraform state show aws_instance.web          # inspect one resource's current attributes
terraform state mv aws_instance.web aws_instance.web_server   # rename without destroy/recreate
terraform state rm aws_instance.web             # stop tracking a resource (doesn't destroy it)
terraform import aws_instance.web i-0abc123def   # bring an existing, unmanaged resource under Terraform
```

**`state rm` vs. `destroy`**: `state rm` removes Terraform's *knowledge* of
a resource — the real infrastructure keeps running, just unmanaged.
`destroy` deletes the real infrastructure. Confusing these is a common,
costly mistake.

### Refactoring state safely: `state mv` and `moved` blocks

Renaming a resource or moving it into a module changes its *address* —
without repointing state, Terraform sees the old address disappear and a
new one appear, and plans a destroy + create instead of recognizing it as
the same object.

```bash
terraform state mv aws_instance.web aws_instance.web_server
terraform state mv aws_instance.web module.compute.aws_instance.web
```

Terraform ≥ 1.1 also supports this declaratively, checked into version
control alongside the refactor that caused it:

```hcl
moved {
  from = aws_instance.web
  to   = aws_instance.web_server
}
```

A `moved` block is preferable to a one-off `state mv` command for anything
shared with a team — it's self-documenting, and it survives a fresh
`git clone` + `apply` on someone else's machine, whereas a manually-run
`state mv` only fixes the one state file you ran it against.

### Sharing state across configs: `terraform_remote_state`

Splitting infrastructure into multiple state files (e.g., a "network"
state and an "app" state) contains blast radius, but the app layer often
needs values the network layer created (VPC ID, subnet IDs):

```hcl
data "terraform_remote_state" "network" {
  backend = "s3"
  config = {
    bucket = "acme-terraform-state"
    key    = "prod/network/terraform.tfstate"
    region = "us-east-1"
  }
}

resource "aws_instance" "web" {
  subnet_id = data.terraform_remote_state.network.outputs.private_subnet_ids[0]
}
```

This is a read-only, one-way dependency — the app config doesn't lock or
own anything in the network state, it just reads its `output` values at
plan time. It's also why exposing the right values as `output`s from every
state file matters beyond convenience — it's the interface between
configs.

---

## 5. Modules

A **module** is a reusable, parameterized bundle of `.tf` files — the unit
of abstraction and reuse in Terraform, analogous to a function in general
programming.

```hcl
module "vpc" {
  source = "./modules/vpc"

  cidr_block  = "10.0.0.0/16"
  environment = var.environment
  azs         = ["us-east-1a", "us-east-1b"]
}

resource "aws_instance" "web" {
  subnet_id = module.vpc.public_subnet_ids[0]   # consume a module's output
}
```

- **Root module** — the top-level config Terraform is invoked against.
- **Child module** — anything referenced via a `module` block; can come
  from a local path, the public/private **Terraform Registry**
  (`source = "terraform-aws-modules/vpc/aws"`), or a Git URL.
- Well-designed modules expose a small, stable set of `variable` inputs and
  `output` values, hiding internal resource wiring — the same
  encapsulation discipline as a good function signature or API.

**Pin module versions the same way you pin providers** —
`version = "~> 5.0"` on a registry module blocks a breaking major bump
from landing silently on the next `init`; for local/git-sourced modules,
pin via a git ref/tag/commit SHA in the `source` URL instead.

**When to reach for a module** (vs. leaving resources inline in the root
config): the same resource group is provisioned more than once across
environments/accounts, you want to enforce a paved-road pattern so most
engineers call a five-input module instead of writing raw resources that
can drift from team conventions, or you want a change's blast radius
contained and independently testable behind a stable variables/outputs
contract. A module used exactly once with no reuse or team-boundary reason
is often just indirection — don't modularize prematurely.

---

## 6. Workspaces vs. Directory-per-Environment

Terraform **workspaces** let one configuration manage multiple, isolated
state files (e.g., `dev`, `staging`, `prod`) without duplicating `.tf`
code.

```bash
terraform workspace new staging
terraform workspace select staging
terraform workspace list
terraform.workspace   # reference the current workspace name inside config
```

```hcl
resource "aws_instance" "web" {
  instance_type = terraform.workspace == "production" ? "m5.large" : "t3.micro"
}
```

**Caveat, and a common interview trap:** workspaces share the *same*
backend configuration and `.tf` code — they're good for lightweight
variation (slightly different instance sizes/counts per environment), not
for environments that need genuinely different infrastructure topology,
different AWS accounts, or different access controls. For real
prod/staging isolation with separate blast radii, most teams prefer
**separate root configurations/directories per environment** (or separate
state files + a tool like Terragrunt) over workspaces alone.

### Directory-per-environment: the common alternative

```
environments/
├── dev/
│   ├── backend.tf     # key = "dev/terraform.tfstate"
│   ├── main.tf        # module "app" { source = "../../modules/app" ... }
│   └── terraform.tfvars
└── prod/
    ├── backend.tf     # key = "prod/terraform.tfstate", often a separate account entirely
    ├── main.tf
    └── terraform.tfvars
```

Each environment directory has its own backend block, its own `.tfvars`,
and often its own cloud account/credentials — both calling the same shared
modules so the actual resource logic isn't duplicated, only the thin
per-environment wiring is.

| | Workspaces | Directory-per-environment |
|---|---|---|
| State isolation | Separate state per workspace, same backend config | Separate state, can be a fully separate backend/bucket/account |
| Credential boundary | Shared — same provider config, same credentials for every workspace | Hard boundary — a CI job scoped to `dev/` cannot physically touch `prod/`'s state or account |
| Divergence | Environments can only differ via `terraform.workspace` conditionals — gets unreadable as it grows | Environments can genuinely diverge (different provider versions, structurally different resources) without conditional spaghetti |
| Best fit | Ephemeral, same-account, low-stakes variants — per-PR preview environments, a developer's personal sandbox | Anything touching production, especially with separate accounts per environment |

**The practical recommendation:** default to directory-per-environment (or
per-account) for anything touching production — the blast-radius isolation
from a hard credential/state boundary is worth the minor config
duplication, which shared modules mitigate anyway. Reserve workspaces for
genuinely disposable, same-account, low-stakes variants where a shared
credential boundary is an acceptable risk.

---

## 7. Providers

A **provider** is the plugin that translates HCL resource blocks into
actual API calls against a specific platform (AWS, Azure, GCP, Kubernetes,
Datadog, Cloudflare, ...). Terraform's provider ecosystem is what makes it
platform-agnostic — the workflow (`init`/`plan`/`apply`) is identical
regardless of what's being provisioned.

```hcl
terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.7.0"
}

provider "aws" {
  region = "us-east-1"
}

# multiple configurations of the same provider, e.g. multi-region
provider "aws" {
  alias  = "eu"
  region = "eu-west-1"
}

resource "aws_s3_bucket" "eu_backup" {
  provider = aws.eu
  bucket   = "acme-eu-backup"
}
```

**Pin provider versions** (`~>` allows patch/minor upgrades within a major
version) — an unpinned provider can introduce breaking changes on a routine
`terraform init` in CI, at the worst possible time.

### Version constraint operators

| Operator | Meaning | Example | Allows |
|---|---|---|---|
| `=` (or bare) | Exact version | `= 5.31.0` | Only that version |
| `!=` | Excludes a version | `!= 5.20.0` | Any version except that one |
| `>`, `>=`, `<`, `<=` | Comparison | `>= 5.0.0` | Any version satisfying the comparison |
| `~>` (patch-level) | Pessimistic, rightmost segment flexible | `~> 5.31.0` | `5.31.x`, not `5.32.0` |
| `~>` (minor-level) | Pessimistic, rightmost segment flexible | `~> 5.0` | `5.x.x`, not `6.0.0` |

`~>` is the pattern used in the vast majority of real configs — it takes
patch (bugfix) or minor (backward-compatible feature) updates automatically
on the next `init -upgrade`, while still blocking a major version bump that
might break the config.

Always commit `.terraform.lock.hcl` (generated by `init`) to version
control — it records the exact provider versions/checksums resolved, so
every teammate and CI run gets an identical provider build until someone
deliberately runs `init -upgrade`. This is what prevents "works on my
machine" provider-version drift across a team.

---

## 8. Common Pitfalls

### Configuration drift

Someone changes a resource outside Terraform (console click, another
pipeline) — the next `plan` shows Terraform "fighting" to revert it back to
the declared config, or (worse) silently missing the drift if state wasn't
refreshed. **Discipline:** all changes go through Terraform, no manual
console edits to Terraform-managed resources; use `terraform plan` in CI on
a schedule to detect drift proactively.

### State file corruption / loss

Losing or corrupting the state file severs Terraform's link to reality —
recovery means either restoring from a backend's versioned history (S3
versioning, Terraform Cloud's state history) or painstakingly
`terraform import`-ing every resource back one at a time. **Mitigation:**
always use a remote backend with versioning enabled, never hand-edit
`.tfstate`, and treat `terraform state` subcommands as the only sanctioned
way to touch it.

### Secrets in state

Terraform state stores **all resource attributes in plaintext by default**
— including things like generated database passwords, even when marked
`sensitive` in an `output` block (sensitivity only hides CLI output, it
does not encrypt state). **Mitigation:** encrypt the state backend at rest
(S3 SSE, Terraform Cloud's encryption), restrict state file access via
IAM/RBAC as tightly as you would a secrets manager, and prefer generating
truly sensitive values outside Terraform (a secrets manager) and referencing
them via data source rather than creating them as Terraform-managed
resources when possible.

### Overly broad `-target` or blind `apply`

`-target` applies/destroys only a subset of the dependency graph — useful
for a targeted emergency fix, but bypasses Terraform's normal dependency
resolution and can leave state inconsistent with reality if used
routinely. **Always read the plan diff before confirming an apply** — never
`apply -auto-approve` against production without a reviewed plan artifact
upstream (this is what CI/CD pipelines for Terraform are for).

### Provider/version drift across a team

Without pinned versions and a lockfile (`.terraform.lock.hcl`, committed to
version control), different teammates or CI runs can silently resolve
different provider versions, producing plans that differ machine to
machine for no config-level reason.

### Applying a freshly recomputed plan instead of the reviewed one

In CI, running `terraform plan` then `terraform apply` (no saved file) as
separate steps re-computes the plan at apply time — if anything changed
state in between (another job applied, a provider-side value drifted), the
apply executes a *different* plan than the one a human reviewed in the PR.
**Always** `terraform plan -out=tfplan` then `terraform apply tfplan` as
the two steps, so what gets approved is byte-for-byte what gets executed.
Locking prevents two applies from racing each other; it doesn't prevent
this recompute-drift problem, since a lock is only briefly held during
each individual command.

### Hand-editing `.tfstate` with a text editor

Directly editing the JSON state file to "fix" a problem routinely breaks
resource addressing or JSON structure in ways that don't surface until the
next `plan`/`apply`. Use the sanctioned tools instead — `terraform state
mv`, `terraform state rm`, `terraform import`, or a `moved` block — every
one of which validates the result rather than trusting a manual edit.

---

## 9. A Realistic AWS Example

```hcl
terraform {
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket = "acme-terraform-state"
    key    = "prod/checkout-vpc/terraform.tfstate"
    region = "us-east-1"
  }
}

provider "aws" {
  region = "us-east-1"
}

locals {
  name_prefix = "checkout-${var.environment}"
}

resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_support   = true
  enable_dns_hostnames = true
  tags = { Name = "${local.name_prefix}-vpc" }
}

resource "aws_subnet" "public" {
  for_each                = { a = "us-east-1a", b = "us-east-1b" }
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.${index(keys({ a = 1, b = 2 }), each.key) + 1}.0/24"
  availability_zone       = each.value
  map_public_ip_on_launch = true
  tags = { Name = "${local.name_prefix}-public-${each.key}" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${local.name_prefix}-igw" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id
  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }
  tags = { Name = "${local.name_prefix}-public-rt" }
}

resource "aws_route_table_association" "public" {
  for_each       = aws_subnet.public
  subnet_id      = each.value.id
  route_table_id = aws_route_table.public.id
}

output "vpc_id" {
  value = aws_vpc.main.id
}

output "public_subnet_ids" {
  value = [for s in aws_subnet.public : s.id]
}
```

This is the shape of a typical foundational module: one VPC, subnets
spread across AZs via `for_each`, an Internet Gateway, and a route table —
composable and reusable as `module "vpc" { source = "./modules/vpc" ... }`
in a larger root config.

---

## 10. Drift Detection & Resource Import

**Drift** is when reality no longer matches state — someone (or something)
changed a resource outside Terraform: a console click, a manual CLI call,
an out-of-band autoscaling event. `terraform plan` *is* Terraform's drift
detector: every plan refreshes state against the real provider first, so a
diff you didn't author in `.tf` is drift surfacing.

```bash
terraform plan
#   ~ aws_security_group.web
#       ~ ingress {
#           - cidr_blocks = ["203.0.113.4/32"]  # opened manually, not in config
#         }
# Plan: 0 to add, 1 to change, 0 to destroy.
```

Two ways to reconcile a drifted resource, and they have opposite effects —
pick deliberately:

- **`terraform apply`** — pushes the declared config back over the manual
  change (reverts it). Correct when the manual change was unauthorized or
  temporary.
- **Update the `.tf` config to match reality, then plan again to confirm
  zero diff** — correct when the manual change should be kept; codify it
  instead of fighting it on every future plan.

`terraform apply -refresh-only` (the modern replacement for the older
`terraform refresh`) updates *only Terraform's state* to match reality,
without changing real infrastructure or the `.tf` config — and unlike the
old `refresh` command, it shows the diff and asks for confirmation before
writing state. Use it after a manual emergency fix you intend to keep, to
sync Terraform's memory without a full apply cycle.

### Adopting existing infrastructure with `terraform import`

The common case when migrating hand-built infrastructure into IaC — a
resource exists in the cloud but has no Terraform history:

```bash
# 1. Write a resource block matching the real resource's type
resource "aws_s3_bucket" "logs" {
  bucket = "acme-prod-logs"
}

# 2. Import — binds the real bucket to this address in state; doesn't touch the resource itself
terraform import aws_s3_bucket.logs acme-prod-logs

# 3. Plan — Terraform shows every attribute your bare-bones block is missing vs. reality
terraform plan
# 4. Fill in the config until plan shows zero diff before ever applying —
#    applying against an unreviewed diff can replace or delete the resource you just imported.
```

Terraform 1.5+ also supports declarative `import` blocks plus
`terraform plan -generate-config-out=generated.tf`, which generates a
starting resource block for you from the real object's attributes —
materially less error-prone than hand-writing the block and iterating
against `plan` output.

```hcl
import {
  to = aws_s3_bucket.logs
  id = "acme-prod-logs"
}
```

---

## 11. Safe Apply in a Team — Checklist

A single-person `apply` against a personal sandbox and a production
`apply` reviewed by a team are different operations that happen to share a
CLI command. The checklist below is what separates the two in practice:

- [ ] **State is remote and locked** (S3+DynamoDB or native locking,
      Terraform Cloud, GCS, Azure Blob) — never local state for anything
      shared.
- [ ] **`terraform plan` runs in CI on every PR**, with the output posted
      as a PR comment — the plan diff *is* the real code review; reviewers
      should read it, not just the HCL.
- [ ] **`terraform apply` runs from CI only, against a saved plan
      artifact** (`terraform apply tfplan`) from the exact commit that was
      reviewed — never a fresh `plan` recomputed at apply time (see
      [Common Pitfalls](#8-common-pitfalls)).
- [ ] **No one applies to production from a laptop.** A local apply
      bypasses PR review, the audit trail, and consistent CI
      credentials/IAM role. If a human must apply manually (a breakglass
      fix), require an explicit, logged, reviewed exception path — not a
      routine habit.
- [ ] **Separate credentials per environment**, least-privilege IAM role
      for the CI runner, ideally short-lived OIDC federation instead of
      long-lived static keys sitting in CI secrets.
- [ ] **State file access is itself access-controlled** — anyone who can
      read prod state can read every secret it contains (see
      [Secrets in state](#8-common-pitfalls)); scope bucket/IAM policies
      accordingly and enable versioning + encryption at rest.
- [ ] **`terraform fmt -check` and `terraform validate` gate the PR**
      before `plan` even runs — cheap checks that catch syntax/formatting
      noise before wasting a plan cycle.
- [ ] **Destroy actions and forced replacements get extra scrutiny** — a
      plan with unexpected `-` or `+/-` lines (especially on stateful
      resources like databases) should block merge until explained; use
      `lifecycle.prevent_destroy` on genuinely irreplaceable resources.

### Policy-as-code gates

Human review doesn't scale as the only check — CI can enforce rules
programmatically on the plan itself. `terraform show -json tfplan` emits
the plan as structured JSON, which a policy engine (Sentinel in Terraform
Cloud/Enterprise, or Open Policy Agent/Rego elsewhere) can evaluate against
rules like "deny any plan that removes `prevent_destroy`," "deny any S3
bucket without `encrypt = true`," or "deny any security group opening
`0.0.0.0/0` on port 22." This turns tribal review knowledge ("someone
always catches the open security group") into a gate that runs identically
on every PR.

---

## 12. Interview-Ready Q&A

**Q: Why does Terraform need a state file at all — why can't it just query
the cloud provider directly on every `plan`?**
A: State maps each resource in your config to the exact real-world object
it created, including provider-internal metadata your `.tf` files never
declare (IDs, computed attributes). Without it, Terraform would have no way
to know "this `aws_instance.web` block corresponds to *that specific*
running instance" versus creating a duplicate, and no efficient way to
compute a diff — it would have to infer ownership and match resources
purely from a fresh API scan, which is slow, ambiguous, and unsafe at
scale.

**Q: What's the danger of not using remote state with locking on a team?**
A: Without a shared remote backend, state lives on individual laptops —
nobody else's Terraform runs (including CI) can see the true current
state, so plans are computed against stale or missing information. Without
locking, two people (or a person and a CI pipeline) running `apply`
concurrently can race and corrupt the state file or apply conflicting
changes, leaving state that no longer matches real infrastructure.

**Q: `count` vs. `for_each` — when do you prefer one over the other?**
A: `count` indexes resources by position (0, 1, 2...), so removing an item
from the middle of a list shifts every subsequent index and can force
Terraform to destroy/recreate resources that didn't actually need to
change. `for_each` keys resources by a stable string/map key, so adding or
removing one item only affects that specific resource. Prefer `for_each`
whenever the set of things being created can grow or shrink over time;
`count` is fine for a fixed, position-independent number of identical
resources.

**Q: A teammate manually deleted a resource in the AWS console that
Terraform manages. What happens on the next `plan`, and what's the right
fix?**
A: On the next `plan`/`apply`, Terraform refreshes state, notices the real
resource is gone, and will show it as needing to be created again (`+`) to
match the declared config — effectively "fixing" the drift by recreating
it. The right long-term fix is process, not a Terraform command: all
changes to Terraform-managed resources should go through Terraform, with
console access to those resources restricted or at minimum strongly
discouraged, and drift-detection plans run on a schedule in CI to catch
this before it surprises someone.

**Q: How would you structure Terraform for multiple environments —
workspaces or separate directories?**
A: Workspaces are lightweight and fine for environments that share the
same infrastructure shape and just need parameter differences (instance
size, replica count) within the same backend and account. For anything
needing genuinely separate blast radii — different AWS accounts, different
IAM boundaries, or infrastructure that legitimately differs by
environment — separate root configurations (often with shared modules)
each pointing at their own state file are safer: a mistake in one
environment's plan can't accidentally touch another's state.

**Q: Is data in a Terraform state file sensitive? How do you protect it?**
A: Yes — state stores full resource attributes in plaintext, including
values like generated passwords, even if they're marked `sensitive` in an
output (that only hides CLI display, not the state file itself). Protect
it by encrypting the backend at rest (e.g., S3 with SSE, Terraform Cloud's
built-in encryption), restricting access via IAM/RBAC as tightly as a
secrets manager, and avoiding creating genuinely sensitive values as
Terraform-managed resources when a dedicated secrets manager is a better
fit.

**Q: What does `terraform plan` actually do under the hood?**
A: It refreshes Terraform's view of real infrastructure (unless
`-refresh=false`), builds a dependency graph of all resources in the
config, and computes the difference between that refreshed state and the
desired configuration — producing a list of creates, updates, and deletes
along with the exact attribute-level changes for each, without making any
actual API calls that mutate infrastructure. It's the safety checkpoint
that should always be reviewed before `apply`.

**Q: What's the practical difference between `terraform state rm` and
`terraform destroy -target=...`?**
A: `state rm` only removes a resource from Terraform's *state file* —
Terraform forgets about it, but the real infrastructure keeps running
untouched and unmanaged. `destroy -target` actually deletes the real
resource. Mixing these up is a costly mistake: someone meaning to stop
Terraform from managing a resource (e.g., before importing it under a
different name) can accidentally delete production infrastructure instead
if they reach for `destroy` out of habit.

**Q: What's the difference between `lifecycle.prevent_destroy` and just
being careful with `terraform destroy`?**
A: `prevent_destroy = true` is enforced by Terraform itself at plan/apply
time — any operation that would destroy or force-replace that resource
(including a full `terraform destroy` or an attribute change that requires
recreation) fails with an error instead of proceeding, even if a human
already typed `yes`. "Being careful" relies on every person reading every
plan correctly forever; `prevent_destroy` converts a possible human mistake
into a guaranteed, loud failure that has to be deliberately removed before
the resource can go away.

**Q: Why does `terraform apply tfplan` (a saved plan) matter more than
just running `plan` then `apply` back to back in CI?**
A: Running them as two separate live commands means `apply` recomputes its
own plan at execution time — if anything changed state between the review
step and the apply step (another job applied, a value drifted upstream),
the apply executes a different set of changes than what a human actually
reviewed in the PR. Saving the plan to a file with `-out` and applying that
exact file guarantees what was approved is byte-for-byte what gets
executed.

**Q: Workspaces vs. directory-per-environment — which would you pick for a
production system, and why?**
A: Directory-per-environment, for anything touching production. Workspaces
share one backend configuration and one set of provider credentials across
every environment, so there's no structural barrier stopping a `dev`
workspace's plan from being applied with production credentials by mistake
— the only protection is `terraform.workspace` conditionals, which get
unreadable as environments genuinely diverge. Separate directories per
environment (often separate cloud accounts) give a hard credential and
state boundary — a CI job scoped to `dev/` physically cannot touch
`prod/`'s state — at the cost of some config duplication, which shared
modules mostly absorb.

**Q: A resource already exists in AWS but was created by hand, not
Terraform. How do you bring it under management safely?**
A: Write a `resource` block matching its type, run
`terraform import <address> <id>` to bind it to that address in state
(this touches only state, not the real resource), then run
`terraform plan` and keep filling in the config until the plan shows zero
diff — never apply against a diff you haven't fully reconciled, since an
unreviewed apply right after an import can replace or delete the resource
you just adopted. Terraform 1.5+'s declarative `import` blocks plus
`-generate-config-out` can generate the starting resource block
automatically, which is less error-prone than hand-writing it.

**Q: What does `terraform apply -refresh-only` do, and when would you use
it instead of a normal apply?**
A: It updates only Terraform's state to match real infrastructure — it
never changes real infrastructure and never applies `.tf` config changes.
It shows the detected drift as a diff and asks for confirmation before
writing state. Use it after a manual emergency change you intend to keep,
so Terraform's memory matches reality without running a full
config-changing apply, and so the next normal `plan` doesn't keep
re-surfacing the same drift as if it were unwanted.

---

## 13. One-Line Summary

**Terraform turns infrastructure changes into a reviewable diff against a
single source of truth — the state file — so treat that state with the
same care as production data: remote, locked, encrypted, and never hand-edited.**
