# VocalMCP: Universal Voice-to-API Orchestrator for Alexa+

## Short Tagline
> **"Turn any API, database, or local tool into an autonomous Alexa+ skill—zero custom voice code required."**

## Track
🤖 **Alexa+ — Agent Skills & MCP**

## Built With (All 25 Tags — Copy & Paste into Devpost)
`alexa`, `alexa-plus`, `model-context-protocol`, `amazon-bedrock`, `aws-strands`, `generative-ai`, `llm`, `typescript`, `javascript`, `python`, `node.js`, `express.js`, `fastapi`, `openapi`, `rest-api`, `server-sent-events`, `websockets`, `json-rpc`, `react`, `tailwindcss`, `postgresql`, `mongodb`, `aws`, `aws-lambda`, `docker`

---

## 💡 Inspiration
For years, building voice applications meant wrestling with rigid intent schemas, static utterance lists, and brittle webhook glue code. Every time a developer wanted to connect a new REST API, database, or internal workflow to a voice assistant, they had to build, deploy, and maintain a bespoke skill from scratch.

With the arrival of **Alexa+** and the **Model Context Protocol (MCP)**, we saw an opportunity to completely eliminate that bottleneck. We asked ourselves: *What if Alexa+ didn't need hardcoded integrations? What if it could dynamically discover, reason over, and chain together any API or local tool in real time?*

That question inspired **VocalMCP**—a universal voice-to-API orchestration middleware that bridges natural conversational intent with live enterprise backends, databases, and developer tools over MCP.

---

## ⚙️ How We Built It
We architected **VocalMCP** as a modular, low-latency agentic pipeline that sits between the Alexa+ voice interface and an extensible registry of MCP servers:

1. **Voice & Intent Ingestion Layer (Alexa+ Skill Interface):**
   Captures open-ended, multi-turn natural language requests from the user and streams the conversational context to our orchestration backend.
2. **Agentic Reasoning & Routing Engine (Amazon Bedrock & Strands Agents SDK):**
   Instead of matching static intents, an autonomous LLM agent decomposes complex voice commands into a Directed Acyclic Graph (DAG) of executable sub-tasks.
3. **Dynamic MCP Client & Tool Registry (Node.js / TypeScript & FastAPI):**
   Our core orchestrator connects to multiple MCP servers via `stdio` and `SSE` (Server-Sent Events) transports. It dynamically ingests OpenAPI specifications, database schemas, and custom tool definitions, exposing them as standardized MCP tools (`tools/list` and `tools/call`).
4. **State Management & Real-Time Observability (PostgreSQL & React PWA Dashboard):**
   To give developers full visibility into what the voice agent is doing under the hood, we built a companion React dashboard that visualizes live MCP tool discovery, payload execution, and token/latency metrics in real time.

### 📐 Mathematical Formulation of Tool Routing & Latency
To ensure a snappy, natural voice experience, VocalMCP optimizes both **semantic tool selection** and **end-to-end execution latency**.

When a user speaks an utterance $u$, the orchestrator maps $u$ and the available MCP tool descriptions $\{t_1, t_2, \dots, t_n\} \in \mathcal{T}$ into a shared embedding space to pre-filter the top-$k$ candidate tools before passing them to the LLM context window, maximizing cosine similarity:

$$S(u, t_i) = \frac{\mathbf{e}_u \cdot \mathbf{e}_{t_i}}{\Vert{}\mathbf{e}_u\Vert{} \Vert{}\mathbf{e}_{t_i}\Vert{}}$$

The probability of selecting an optimal multi-step tool chain $\tau = (t_1, t_2, \dots, m)$ given utterance $u$ and conversation history $H$ is modeled autoregressively as:

$$P(\tau \mid u, H) = \prod_{j=1}^{m} P(t_j \mid u, H, t_{<j}, o_{<j})$$

where $o_{<j}$ represents the JSON payloads returned by prior MCP tool executions in the chain.

Furthermore, because voice interfaces have strict timeout thresholds ($T_{\text{max}}$), we parallelized independent API calls within our DAG. Rather than suffering sequential latency $\sum_{j=1}^{m} L(t_j)$, our total orchestration latency $L_{\text{total}}$ across $D$ dependency depth levels is bounded by:

$$L_{\text{total}} = L_{\text{ASR}} + L_{\text{LLM}} + \sum_{d=1}^{D} \max_{t_k \in \mathcal{P}_d} \left( L_{\text{MCP}}(t_k) + L_{\text{API}}(t_k) \right) + L_{\text{TTS}} < T_{\text{max}}$$

where $\mathcal{P}_d$ is the set of MCP tools executed concurrently at depth $d$.

---

## 🚧 Challenges We Faced
* **Beating the Voice Timeout Clock:** Multi-step agentic reasoning and external API chaining can easily exceed standard voice assistant response windows. We had to implement asynchronous streaming, parallel MCP tool execution, and intermediate progressive voice responses (*"Checking your database and triggering the webhook now..."*) to keep the session alive and responsive.
* **Automatic Schema-to-MCP Translation:** External REST APIs often return deeply nested, verbose JSON payloads that bloat the LLM context window and degrade reasoning speed. We built a dynamic response-pruning middleware that strips unnecessary metadata and extracts only the schema fields relevant to the user's spoken query.
* **Safe Execution & Voice Confirmation:** Giving a voice agent write-access to live APIs and databases introduces risk. Designing a deterministic "human-in-the-loop" voice confirmation gate for destructive actions (`DELETE`, `POST`, financial transactions) without making the conversation feel robotic took several iterations.

---

## 🧠 What We Learned
* **MCP as the Universal USB-C for AI:** Building with the Model Context Protocol completely changed how we think about AI integrations. Once an MCP server wrapper is written, any agent—voice or text—can immediately leverage it without custom glue code.
* **Designing for Zero-UI Constraints:** Summarizing complex API responses into concise, natural-sounding spoken answers requires a completely different prompt engineering and post-processing strategy compared to rendering Markdown tables in a chat UI.
* **Latency vs. Autonomy Trade-offs:** We learned how to balance model size and reasoning depth using lightweight decider models for fast tool routing while reserving heavier foundation models for complex multi-API synthesis.

---

## 🚀 What's Next for VocalMCP
* **One-Click OpenAPI-to-MCP Generator:** Allow developers to paste any Swagger/OpenAPI URL into our dashboard and instantly spin up a hosted, voice-ready MCP server in seconds.
* **Bi-Directional Webhook Alerts:** Enable Alexa+ to proactively notify users when an MCP resource state changes (e.g., a failed CI/CD pipeline or a critical database alert) and ask how to remediate it via voice.
* **Fine-Tuned Voice Security Guardrails:** Introduce speaker-verification tokens and role-based access control (RBAC) at the MCP transport layer.
