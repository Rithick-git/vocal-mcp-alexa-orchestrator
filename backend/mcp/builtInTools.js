const initialTools = [
  {
    id: "mcp_aws_cluster_health",
    name: "devops_cluster_status",
    transport: "SSE",
    method: "GET",
    destructive: false,
    description: "Check AWS EKS production cluster health, Kubernetes pod status, CPU load, memory pressure, and active microservices.",
    keywords: ["aws", "cluster", "health", "server", "kubernetes", "devops", "status", "cpu", "pods", "production"],
    latencyMs: 620,
    execute: () => ({
      rawPayload: {
        status: "DEGRADED",
        cluster: "eks-prod-ap-south-1",
        activeNodes: 12,
        cpuUtilization: "84.2%",
        failingPod: "payment-gateway-v2.4-7f9b",
        restartCount: 5,
        _internalDebugMetadata: {
          awsAccountId: "992381029381",
          vpcId: "vpc-0a8b7c6d5e4f",
          subnetIds: ["subnet-111", "subnet-222", "subnet-333"],
          iamRoleArn: "arn:aws:iam::992381029381:role/EKSClusterRole",
          rawPrometheusScrape: Array.from({ length: 25 }, (_, i) => `metric_bucket_${i}: 0.99238192`)
        }
      },
      summary: "Cluster eks-prod-ap-south-1 is at 84% CPU with 1 degraded pod (payment-gateway-v2.4)."
    })
  },
  {
    id: "mcp_postgres_metrics",
    name: "postgres_query_metrics",
    transport: "stdio",
    method: "GET",
    destructive: false,
    description: "Query PostgreSQL production database for failed transactions, deadlocks, active connections, and query latency metrics.",
    keywords: ["postgres", "postgresql", "database", "db", "sql", "transactions", "failed", "query", "records", "errors"],
    latencyMs: 540,
    execute: () => ({
      rawPayload: {
        database: "prod_ledger_db",
        failedTransactionsLastHour: 14,
        errorCode: "PG_DEADLOCK_40P01",
        avgQueryTimeMs: 42.8,
        activeConnections: 89,
        _internalDebugMetadata: {
          pgStatActivityDump: Array.from({ length: 30 }, (_, i) => ({ pid: 4000 + i, state: "idle", wait_event: "ClientRead" })),
          walWriteLocation: "0/16B3748",
          bufferCacheHitRatio: 0.9942182
        }
      },
      summary: "PostgreSQL logged 14 failed transactions in the last hour due to timeout code 40P01."
    })
  },
  {
    id: "mcp_civic_eligibility",
    name: "civic_scheme_eligibility",
    transport: "SSE",
    method: "GET",
    destructive: false,
    description: "Check citizen or student eligibility for government welfare schemes, innovation grants, scholarships, and public benefits.",
    keywords: ["civic", "scheme", "eligibility", "grant", "student", "welfare", "government", "scholarship", "check", "ai"],
    latencyMs: 480,
    execute: () => ({
      rawPayload: {
        applicantCategory: "B.Tech Engineering Innovator",
        matchedScheme: "National AI & DeepTech Student Grant 2026",
        eligibilityScore: "98.5%",
        grantAmountINR: "₹2,50,000",
        documentsVerified: ["Aadhaar_Token_OK", "AICTE_Institution_Verified"],
        _internalDebugMetadata: {
          ministryCode: "MEITY-2026-09",
          ruleEngineTrace: Array.from({ length: 20 }, (_, i) => `RULE_CHECK_PASS_${100 + i}`),
          cryptographicHash: "sha256:8f9d8a7b6c5e4f3a2b1c"
        }
      },
      summary: "You are 98.5% eligible for the National AI & DeepTech Student Grant worth 2,50,000 INR."
    })
  },
  {
    id: "mcp_civic_application_submit",
    name: "civic_auto_application",
    transport: "SSE",
    method: "POST",
    destructive: false,
    description: "Automatically file and log an official application into the civic portal database and schedule a verification slot.",
    keywords: ["log", "apply", "application", "file", "submit", "register", "schedule", "appointment", "civic", "grant"],
    latencyMs: 510,
    execute: () => ({
      rawPayload: {
        applicationId: "APP-2026-88412",
        status: "SUBMITTED_AND_QUEUED",
        verificationSlot: "Tomorrow at 11:00 AM IST",
        notificationSent: true,
        _internalDebugMetadata: {
          kafkaTopicOffset: 9928172,
          dbReplicaAck: ["node-1-ok", "node-2-ok", "node-3-ok"],
          auditTrail: Array.from({ length: 18 }, (_, i) => `audit_step_${i}_verified`)
        }
      },
      summary: "Application APP-2026-88412 has been automatically filed and scheduled for tomorrow at 11 AM."
    })
  },
  {
    id: "mcp_devops_rollback",
    name: "devops_rollback_deploy",
    transport: "stdio",
    method: "DELETE",
    destructive: true,
    description: "DESTRUCTIVE ACTION: Rollback production API gateway and Kubernetes deployment to previous stable snapshot v2.3.",
    keywords: ["rollback", "revert", "delete", "production", "gateway", "deploy", "deployment", "v2.3", "emergency", "restore"],
    latencyMs: 750,
    execute: () => ({
      rawPayload: {
        action: "DEPLOYMENT_ROLLBACK_EXECUTED",
        fromVersion: "v2.4.0-canary",
        toVersion: "v2.3.9-stable",
        healthyPods: "12/12",
        errorRateAfterRollback: "0.01%",
        _internalDebugMetadata: {
          helmReleaseRevision: 44,
          kubeApiAuditLog: Array.from({ length: 22 }, (_, i) => `replica_set_terminate_${i}`)
        }
      },
      summary: "Production API Gateway has been safely rolled back to v2.3.9-stable. All 12 pods report healthy."
    })
  },
  {
    id: "mcp_stripe_revenue",
    name: "stripe_revenue_pulse",
    transport: "SSE",
    method: "GET",
    destructive: false,
    description: "Fetch real-time Stripe MRR, daily revenue velocity, subscription churn anomalies, and webhook delivery health.",
    keywords: ["stripe", "revenue", "mrr", "finance", "sales", "billing", "churn", "payments", "recurring"],
    latencyMs: 490,
    execute: () => ({
      rawPayload: {
        currentMRR: "$48,920",
        netGrowthMoM: "+18.4%",
        activeSubscribers: 1420,
        churnAnomalyDetected: false,
        _internalDebugMetadata: {
          stripeRequestId: "req_99a8b7c6d5",
          ledgerShards: Array.from({ length: 20 }, (_, i) => `shard_0${i}_synced`)
        }
      },
      summary: "Current monthly recurring revenue is $48,920, up 18.4% month-over-month with zero churn anomalies."
    })
  }
];
module.exports = { initialTools };
