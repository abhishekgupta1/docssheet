---
title: "Kubernetes Learning Path"
description: "Learn Kubernetes in six hands-on milestones on a local kind cluster — workloads, services, configuration, health and rollouts, storage and jobs, and operating a namespace — each with checkable results and a runnable solution."
sidebar_position: 1
level: intermediate
tags: [kubernetes, learning-path, projects]
image: /img/social/kubernetes-learning-path.png
---

# Kubernetes Learning Path

**In short:** six milestones on a free local cluster. Each lists what to
build, a command that **proves** it works, and a complete solution script.

:::tip How to use this page

Finish the [Docker learning path](/docs/learning-path/docker/docker-learning-path)
first. Create the [practice cluster](/cheatsheets/kubernetes#practice-cluster),
then for each milestone read the listed [cheat sheet](/cheatsheets/kubernetes)
sections and work in the `practice` namespace. Start each milestone clean:

```bash
kubectl delete namespace practice --ignore-not-found
kubectl create namespace practice
kubectl config set-context --current --namespace practice
```

:::

## The plan {#plan}

| Milestone | You learn | You prove it with |
|---|---|---|
| [1](#milestone-1) | Pods and Deployments | An app that heals itself and scales |
| [2](#milestone-2) | Services and labels | Traffic reaching every replica by one name |
| [3](#milestone-3) | ConfigMaps and Secrets | Settings changed without rebuilding the image |
| [4](#milestone-4) | Probes, resources, rollouts | A bad release stopped and rolled back |
| [5](#milestone-5) | Storage, Jobs, CronJobs | Data that outlives pods; a scheduled task |
| [6](#milestone-6) | Operating a namespace | Broken pods diagnosed; least-privilege access; a staging overlay |
| [Final](#final-project) | Everything | Your own app, deployed properly |

---

## Milestone 1: Workloads {#milestone-1}

**Learn:** [What Kubernetes is](/cheatsheets/kubernetes#what-is-kubernetes) ·
[kubectl basics](/cheatsheets/kubernetes#kubectl) ·
[Pods](/cheatsheets/kubernetes#pods) ·
[Deployments](/cheatsheets/kubernetes#deployments) ·
[YAML manifests](/cheatsheets/kubernetes#manifests)

**Tasks:**
1. Write a manifest `shop.yaml` for a Deployment `shop` running 3 replicas of `nginx:1.27`, and apply it.
2. Delete two of its pods at once and watch them come back.
3. Scale it to 5 by editing the file (not with `kubectl scale`) and applying again.

**Check:** `kubectl get deployment shop` shows `5/5` ready, and the pods you
deleted were replaced with new names.

<details>
<summary>Solution</summary>

```bash
cat > shop.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shop
spec:
  replicas: 3
  selector:
    matchLabels: {app: shop}
  template:
    metadata:
      labels: {app: shop}
    spec:
      containers:
        - name: web
          image: nginx:1.27
EOF
kubectl apply -f shop.yaml
kubectl rollout status deployment/shop

kubectl delete $(kubectl get pods -l app=shop -o name | head -2)   # delete two pods
kubectl rollout status deployment/shop                              # replaced automatically

sed -i.bak 's/replicas: 3/replicas: 5/' shop.yaml
kubectl apply -f shop.yaml
kubectl rollout status deployment/shop
kubectl get deployment shop -o jsonpath='{.status.readyReplicas}'; echo   # 5
```

</details>

**Check yourself:**
- [ ] Which object actually recreated the deleted pods?
- [ ] Why is editing the file and re-applying better than `kubectl scale` in a team?

---

## Milestone 2: Services & labels {#milestone-2}

**Learn:** [Services](/cheatsheets/kubernetes#services) ·
[Labels & selectors](/cheatsheets/kubernetes#labels) ·
[Namespaces & contexts](/cheatsheets/kubernetes#namespaces)

**Tasks:**
1. Deploy 3 replicas of `hashicorp/http-echo`, each answering with its own pod name.
2. Put a Service `echo` in front of them.
3. From a client pod, call the Service 20 times and count how many *different* pods answered.

**Check:** the count is more than 1 — one name, many pods behind it.

<details>
<summary>Solution</summary>

```bash
kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: echo
spec:
  replicas: 3
  selector:
    matchLabels: {app: echo}
  template:
    metadata:
      labels: {app: echo}
    spec:
      containers:
        - name: echo
          image: hashicorp/http-echo:1.0
          args: ["-listen=:5678", "-text=$(POD_NAME)"]
          env:
            - name: POD_NAME
              valueFrom:
                fieldRef: {fieldPath: metadata.name}
---
apiVersion: v1
kind: Service
metadata:
  name: echo
spec:
  selector: {app: echo}
  ports:
    - port: 80
      targetPort: 5678
EOF
kubectl rollout status deployment/echo
kubectl run client --image=busybox:1.36 --restart=Never -- \
  sh -c 'for i in $(seq 20); do wget -qO- http://echo; done'
kubectl wait --for=jsonpath='{.status.phase}'=Succeeded pod/client --timeout=60s
kubectl logs client | sort -u | wc -l                     # 2 or 3 different pods answered
```

</details>

`kubectl apply -f -` reads the manifest from the command itself (the part
between `<<'EOF'` and `EOF`), which keeps the solution in one script.

**Check yourself:**
- [ ] What does the Service use to decide which pods get traffic?
- [ ] What happens to traffic if you change one pod's `app` label?

---

## Milestone 3: Configuration {#milestone-3}

**Learn:** [ConfigMaps & Secrets](/cheatsheets/kubernetes#config)

**Tasks:**
1. Create a ConfigMap `shop-config` with `THEME=light`, and a Secret `shop-secret` with `API_KEY=abc123`.
2. Run a Deployment whose container prints both values every few seconds.
3. Change the theme to `dark` and make the running app pick it up.

**Check:** the latest log line says `theme=dark`, and the API key never
appears in the Deployment's YAML (`kubectl get deploy -o yaml`).

<details>
<summary>Solution</summary>

```bash
kubectl create configmap shop-config --from-literal=THEME=light
kubectl create secret generic shop-secret --from-literal=API_KEY=abc123
kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: printer
spec:
  replicas: 1
  selector:
    matchLabels: {app: printer}
  template:
    metadata:
      labels: {app: printer}
    spec:
      terminationGracePeriodSeconds: 2       # this shell loop ignores SIGTERM; don't wait the default 30 s
      containers:
        - name: app
          image: busybox:1.36
          command: ["sh", "-c", "while true; do echo theme=$THEME key=$API_KEY; sleep 2; done"]
          envFrom:
            - configMapRef: {name: shop-config}
            - secretRef: {name: shop-secret}
EOF
kubectl rollout status deployment/printer
sleep 3 && kubectl logs deployment/printer --tail=1         # theme=light key=abc123

kubectl create configmap shop-config --from-literal=THEME=dark --dry-run=client -o yaml | kubectl replace -f -
kubectl rollout restart deployment/printer                  # env vars are read only at start
kubectl rollout status deployment/printer
sleep 5 && kubectl logs deployment/printer --tail=1         # theme=dark key=abc123
kubectl get deployment printer -o yaml | grep abc123 || echo "not in the Deployment"   # the value lives only in the Secret
```

</details>

**Check yourself:**
- [ ] Why did the app need a restart to see the new theme?
- [ ] Who in your team should be allowed to read `shop-secret`?

---

## Milestone 4: Health, resources & rollouts {#milestone-4}

**Learn:** [Health checks](/cheatsheets/kubernetes#probes) ·
[Requests & limits](/cheatsheets/kubernetes#resources) ·
[Rolling updates & rollbacks](/cheatsheets/kubernetes#rollouts)

**Tasks:**
1. Deploy `nginx:1.27` with 3 replicas, a readiness probe, requests and limits, and a rolling-update strategy that never drops below 3 ready pods.
2. Release `nginx:1.27-alpine` and watch it roll out.
3. Release a broken image tag. Show that the 3 old pods keep running, then roll back.

**Check:** after the rollback the image is `nginx:1.27-alpine`, 3/3 pods are
ready, and the QoS class is `Burstable`.

<details>
<summary>Solution</summary>

```bash
kubectl apply -f - <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: web
spec:
  replicas: 3
  strategy:
    type: RollingUpdate
    rollingUpdate: {maxSurge: 1, maxUnavailable: 0}
  selector:
    matchLabels: {app: web}
  template:
    metadata:
      labels: {app: web}
    spec:
      containers:
        - name: nginx
          image: nginx:1.27
          readinessProbe:
            httpGet: {path: /, port: 80}
            periodSeconds: 2
          resources:
            requests: {cpu: 50m, memory: 32Mi}
            limits: {cpu: 200m, memory: 128Mi}
EOF
kubectl rollout status deployment/web

kubectl set image deployment/web nginx=nginx:1.27-alpine
kubectl rollout status deployment/web

kubectl set image deployment/web nginx=nginx:no-such-tag
sleep 15
kubectl get deployment web -o jsonpath='{.status.readyReplicas}'; echo    # 3 — old pods still serve
kubectl rollout undo deployment/web
kubectl rollout status deployment/web

kubectl get deployment web -o jsonpath='{.spec.template.spec.containers[0].image}'; echo   # nginx:1.27-alpine
kubectl get pods -l app=web -o jsonpath='{.items[0].status.qosClass}'; echo               # Burstable
```

</details>

**Check yourself:**
- [ ] Which setting guaranteed the broken release never reduced capacity?
- [ ] What would happen without a readiness probe?

---

## Milestone 5: Storage & jobs {#milestone-5}

**Learn:** [Storage](/cheatsheets/kubernetes#storage) ·
[Jobs & CronJobs](/cheatsheets/kubernetes#jobs) ·
[StatefulSets](/cheatsheets/kubernetes#statefulsets)

**Tasks:**
1. Create a 1 GiB PersistentVolumeClaim `reports`.
2. Run a Job that writes a report file into it.
3. Run a second, separate Job that reads the file — proving the data outlived the first pod.
4. Create a CronJob that would run the report every night at 02:00.

**Check:** the reader Job's log shows the report line, and
`kubectl get cronjob nightly-report` shows the schedule `0 2 * * *`.

<details>
<summary>Solution</summary>

```bash
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: PersistentVolumeClaim
metadata:
  name: reports
spec:
  accessModes: [ReadWriteOnce]
  resources:
    requests: {storage: 1Gi}
EOF

job() {   # job <name> <shell command> — a Job with the reports volume at /reports
kubectl apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: $1
spec:
  backoffLimit: 1
  template:
    spec:
      restartPolicy: Never
      containers:
        - name: task
          image: busybox:1.36
          command: ["sh", "-c"]
          args: ['$2']
          volumeMounts: [{name: data, mountPath: /reports}]
      volumes:
        - name: data
          persistentVolumeClaim: {claimName: reports}
EOF
kubectl wait --for=condition=complete "job/$1" --timeout=120s
}

job writer 'echo "sales report: 42 orders" > /reports/today.txt'
job reader 'cat /reports/today.txt'
kubectl logs job/reader                                   # sales report: 42 orders

kubectl create cronjob nightly-report --image=busybox:1.36 --schedule='0 2 * * *' -- \
  sh -c 'echo "report at $(date)"'
kubectl get cronjob nightly-report -o jsonpath='{.spec.schedule}'; echo   # 0 2 * * *
```

</details>

**Check yourself:**
- [ ] What would the reader have printed without the PVC?
- [ ] How would you run the CronJob once, right now, to test it?

---

## Milestone 6: Operate a namespace {#milestone-6}

**Learn:** [Troubleshooting](/cheatsheets/kubernetes#troubleshooting) ·
[Common mistakes](/cheatsheets/kubernetes#gotchas) ·
[Access control (RBAC)](/cheatsheets/kubernetes#rbac) ·
[Kustomize & Helm](/cheatsheets/kubernetes#kustomize-helm)

**Tasks:**
1. Create three broken pods — one crashing, one with a bad image, one asking for more CPU than exists — and diagnose each using only `get`, `describe`, and `logs`.
2. Create a ServiceAccount `viewer` that can read pods and logs but cannot delete anything.
3. Make a Kustomize overlay that deploys the Milestone 1 app as `staging-shop` with 1 replica.

**Check:** you can name each broken pod's cause; `kubectl auth can-i`
answers `yes` for reading and `no` for deleting; `kubectl get deploy` shows
`staging-shop` with 1 replica.

<details>
<summary>Solution</summary>

```bash
kubectl run crashy --image=busybox:1.36 -- sh -c 'echo "missing DATABASE_URL"; exit 1'
kubectl run typo --image=ngnix:1.27
kubectl apply -f - <<'EOF'
apiVersion: v1
kind: Pod
metadata:
  name: greedy
spec:
  containers:
    - name: app
      image: nginx:1.27
      resources:
        requests: {cpu: "64"}
EOF
sleep 20
kubectl get pods crashy typo greedy                       # Error/CrashLoopBackOff · ImagePullBackOff · Pending
kubectl logs crashy                                       # missing DATABASE_URL
kubectl describe pod typo | grep -m1 "Failed to pull"     # …ngnix… — a typo in the image name
kubectl describe pod greedy | grep -m1 "Insufficient cpu" # 0/1 nodes are available: 1 Insufficient cpu

kubectl create serviceaccount viewer
kubectl create role pod-viewer --verb=get,list,watch --resource=pods,pods/log
kubectl create rolebinding viewer-binding --role=pod-viewer --serviceaccount=practice:viewer
kubectl auth can-i get pods/log --as=system:serviceaccount:practice:viewer    # yes
kubectl auth can-i delete pods --as=system:serviceaccount:practice:viewer || true   # no

mkdir -p base staging
cat > base/shop.yaml <<'EOF'
apiVersion: apps/v1
kind: Deployment
metadata:
  name: shop
spec:
  replicas: 3
  selector:
    matchLabels: {app: shop}
  template:
    metadata:
      labels: {app: shop}
    spec:
      containers:
        - name: web
          image: nginx:1.27
EOF
printf 'resources:\n  - shop.yaml\n' > base/kustomization.yaml
cat > staging/kustomization.yaml <<'EOF'
resources:
  - ../base
namePrefix: staging-
replicas:
  - name: shop
    count: 1
EOF
kubectl apply -k staging
kubectl rollout status deployment/staging-shop
kubectl get deployment staging-shop -o jsonpath='{.spec.replicas}'; echo    # 1
```

</details>

**Check yourself:**
- [ ] Which command told you *why* each pod was broken?
- [ ] Why give the viewer `pods/log` separately from `pods`?

---

## Final project {#final-project}

**In short:** deploy an app of your own the way a production team would.

1. Take the image from your [Docker final project](/docs/learning-path/docker/docker-learning-path#final-project)
   and load it into kind (`kind load docker-image <name>:<tag> --name learn`).
2. Write manifests for: a Deployment (2+ replicas, probes, requests and
   limits, rolling-update strategy), a Service, a ConfigMap, a Secret, and a
   database as a StatefulSet with a PVC.
3. Add a Job that runs database migrations, and a CronJob for a nightly
   clean-up.
4. Give the app its own ServiceAccount with no API access
   (`automountServiceAccountToken: false`).
5. Make `base/` and `staging/` Kustomize folders; staging uses 1 replica and a
   different ConfigMap value.
6. Release a new version, then a broken one, and roll back — without the
   Service ever losing all its ready pods.

**You're done when:** `kubectl apply -k staging` on a fresh cluster brings up
a working app, and you can explain every field in your manifests.

**Next:** read [Troubleshooting](/docs/sre-skills/kubernetes/kubernetes-guide#9-troubleshooting)
and the [interview questions](/docs/sre-skills/kubernetes/kubernetes-guide#10-interview-ready-qa)
in the complete guide.
