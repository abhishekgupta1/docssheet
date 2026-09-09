---
title: "AWS Cheat Sheet"
description: "Quick reference for AWS — EC2, S3, VPC, IAM, RDS/DynamoDB, ELB/ASG, and CLI essentials."
tags: [aws, sre, cheat-sheet]
hide_table_of_contents: true
---

# AWS cheatsheet

A one-page reference for AWS. For the shared responsibility model, architecture
patterns, and exam-style gotchas, see the [complete guide](/docs/sre-skills/aws/aws-guide).

<a class="topic-crosslink" href="/docs/sre-skills/aws/aws-guide">📖 Full guide: AWS →</a>

<div class="cheat-sheet cheat-sheet--sre">

<div class="cheat-card">

#### Core compute

| Service | Use for |
|---|---|
| EC2 | full-control VMs |
| Lambda | event-driven, short-lived functions |
| ECS | containers, AWS-native orchestration |
| EKS | containers, managed Kubernetes |

</div>

<div class="cheat-card">

#### S3 storage classes

```
Standard          → frequent access
Standard-IA        → infrequent, ms retrieval
Glacier Instant     → archive, ms retrieval
Glacier Flexible     → archive, minutes-hours
Glacier Deep Archive  → archive, ~12h, cheapest
```

</div>

<div class="cheat-card">

#### VPC basics

```
VPC → Subnets (per AZ) → Route Tables
Public subnet:  route 0.0.0.0/0 → Internet Gateway
Private subnet: route 0.0.0.0/0 → NAT Gateway
```

Security Groups: stateful, allow-only, instance-level.
NACLs: stateless, allow+deny, subnet-level.

</div>

<div class="cheat-card">

#### IAM essentials

```json
{
  "Effect": "Allow",
  "Action": ["s3:GetObject"],
  "Resource": "arn:aws:s3:::my-bucket/*"
}
```

Least privilege: start from zero, add only what's used. Trust policy = who
can assume the role; permission policy = what the role can do.

</div>

<div class="cheat-card">

#### RDS vs DynamoDB

| | RDS | DynamoDB |
|---|---|---|
| Model | relational | key-value/document |
| Scaling | vertical (+ read replicas) | horizontal, near-infinite |
| Best for | joins, transactions | high-throughput, simple access patterns |

</div>

<div class="cheat-card">

#### High availability

```
ALB/NLB → Auto Scaling Group → EC2 (Multi-AZ)
```

Multi-AZ: automatic failover within a region. Multi-Region: DR, higher RTO,
needs active data replication.

</div>

<div class="cheat-card">

#### AWS CLI essentials

```bash
aws configure                      # access key + secret + region
aws sts get-caller-identity        # who am I
aws s3 ls s3://my-bucket
aws ec2 describe-instances \
  --query 'Reservations[].Instances[].InstanceId'
aws sso login --profile my-sso
```

</div>

<div class="cheat-card">

#### Assuming roles

```bash
aws sts assume-role \
  --role-arn arn:aws:iam::123456789012:role/Deploy \
  --role-session-name deploy-session
```

`~/.aws/config` (profiles, region) vs `~/.aws/credentials` (keys) — two
files, two purposes.

</div>

<div class="cheat-card">

#### Cost optimization

- Right-size EC2/RDS instances against actual utilization.
- Reserved/Savings Plans for steady-state workloads; Spot for interruptible.
- S3 lifecycle rules to auto-tier cold data to Glacier.
- Delete unattached EBS volumes and idle load balancers.

</div>

<div class="cheat-card">

#### Common gotchas

- Security Group changes are instant; NACL rule order matters (evaluated in order).
- S3 bucket names are globally unique across all AWS accounts.
- Lambda cold starts — mitigate with provisioned concurrency for latency-sensitive paths.
- IAM policy evaluation: explicit Deny always wins over Allow.

<span class="cheat-see">See: Common Exam & Interview Gotchas</span>

</div>

</div>
