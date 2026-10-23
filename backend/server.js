const express = require("express");
const cors = require("cors");
const mcpRegistry = require("./mcp/mcpRegistry");
const { routeTools } = require("./engine/router");
const { inspectSafety } = require("./engine/safetyGate");
const { executeDag } = require("./engine/dagOrchestrator");

const app = express();
app.use(cors());
app.use(express.json());

const sseClients = new Set();
function broadcastTelemetry(eventType, payload) {
  const packet = JSON.stringify({ timestamp: new Date().toISOString(), eventType, payload });
  for (const res of sseClients) res.write(`data: ${packet}\n\n`);
}

app.get("/api/health", (req, res) => res.json({ status: "OK", activeTools: mcpRegistry.listTools().length }));
app.get("/api/mcp/tools", (req, res) => res.json({ tools: mcpRegistry.listTools() }));

app.post("/api/mcp/openapi-import", (req, res) => {
  const newTool = mcpRegistry.registerOpenApiSpec(req.body || {});
  broadcastTelemetry("OPENAPI_TOOL_REGISTERED", { toolName: newTool.name });
  res.json({ success: true, tool: newTool, tools: mcpRegistry.listTools() });
});

app.get("/api/telemetry/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  sseClients.add(res);
  res.write(`data: ${JSON.stringify({ eventType: "SSE_CONNECTED", timestamp: new Date().toISOString() })}\n\n`);
  req.on("close", () => sseClients.delete(res));
});

app.post("/api/alexa/webhook", async (req, res) => {
  try {
    const utterance = req.body.utterance || "Check AWS cluster health and query failed database transactions";
    const confirmAction = Boolean(req.body.confirmAction);
    broadcastTelemetry("VOICE_UTTERANCE_RECEIVED", { utterance });

    const allTools = mcpRegistry.getAllExecutableTools();
    const { allScores, selectedTools } = routeTools(utterance, allTools, 3);
    broadcastTelemetry("EMBEDDING_COSINE_ROUTED", { selectedCount: selectedTools.length });

    const safetyCheck = inspectSafety(selectedTools, confirmAction);
    if (safetyCheck.blocked) {
      broadcastTelemetry("SAFETY_GATE_TRIGGERED", safetyCheck);
      return res.json({
        status: "SAFETY_CONFIRMATION_REQUIRED",
        utterance,
        spokenResponse: safetyCheck.voicePrompt,
        safetyGate: safetyCheck,
        cosineScores: allScores
      });
    }

    const { executedNodes, telemetry } = await executeDag(selectedTools, broadcastTelemetry);
    const spokenResponse = executedNodes.map((n) => n.summary).join(" Additionally, ");
    broadcastTelemetry("ORCHESTRATION_COMPLETE", { totalParallelLatency: telemetry.totalParallelLatency });

    return res.json({ status: "SUCCESS", utterance, spokenResponse, cosineScores: allScores, executedNodes, telemetry });
  } catch (err) {
    return res.status(500).json({ status: "ERROR", message: err.message });
  }
});

app.listen(4000, () => console.log("VocalMCP Backend live at http://localhost:4000"));
