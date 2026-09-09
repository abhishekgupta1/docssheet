---
title: "Terraform Cheat Sheet"
description: "Quick reference for Terraform — core workflow, HCL syntax, state, modules, and drift."
tags: [terraform, sre, cheat-sheet]
hide_table_of_contents: true
---

# Terraform cheatsheet

A one-page reference for Terraform. For state internals, modules, and the
full AWS worked example, see the [complete guide](/docs/sre-skills/terraform/terraform-guide).

<a class="topic-crosslink" href="/docs/sre-skills/terraform/terraform-guide">📖 Full guide: Terraform →</a>

<div class="cheat-sheet cheat-sheet--sre">

<div class="cheat-card">

#### Core workflow

```bash
terraform init            # download providers/modules, init backend
terraform plan             # read-only diff: what would change
terraform apply             # execute the plan
terraform destroy            # tear down everything in state
```

Always read the plan before applying — it's the primary safety mechanism.

</div>

<div class="cheat-card">

#### Safer apply

```bash
terraform fmt -recursive
terraform validate
terraform plan -out=tfplan
terraform apply tfplan     # applies exactly what was reviewed
```

</div>

<div class="cheat-card">

#### HCL basics

```hcl
resource "aws_instance" "web" {
  ami           = "ami-123456"
  instance_type = "t3.micro"
  tags = { Name = "web" }
}

variable "region" { default = "us-east-1" }
output "public_ip" { value = aws_instance.web.public_ip }
```

</div>

<div class="cheat-card">

#### State

```bash
terraform state list
terraform state show aws_instance.web
terraform state mv <old> <new>
terraform import aws_instance.web i-0123456
```

Remote state (S3 + DynamoDB lock, or Terraform Cloud) is mandatory for team use.

</div>

<div class="cheat-card">

#### Modules

```hcl
module "vpc" {
  source = "./modules/vpc"
  cidr   = "10.0.0.0/16"
}
```

Modules are the unit of reuse — pin versions for remote modules to avoid
surprise drift on `init`.

</div>

<div class="cheat-card">

#### Workspaces vs. directory-per-env

```bash
terraform workspace new staging
terraform workspace select staging
```

Workspaces share the same config with different state; directory-per-env
gives full config isolation. Most teams prefer directory-per-env at scale.

</div>

<div class="cheat-card">

#### Drift & import

```bash
terraform plan -refresh-only   # detect drift without changing config
terraform import <resource> <id>
```

Drift = real infra changed outside Terraform. Detect regularly; import
existing resources rather than recreating them.

</div>

<div class="cheat-card">

#### Common pitfalls

- No remote state / no locking → concurrent applies corrupt state.
- Hardcoded values instead of variables → no reuse across envs.
- `-target` used habitually instead of for genuine emergencies.
- Secrets committed in `.tf` files instead of a secrets manager.

<span class="cheat-see">See: Common Pitfalls</span>

</div>

</div>
