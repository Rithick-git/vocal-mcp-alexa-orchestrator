const { prunePayload } = require("./pruner");

async function executeDag(selectedTools, emitTelemetry) {
  const lAsr = 185, lLlm = 310, lTts = 165;
  const depth1 = selectedTools.filter((t) => t.method === "GET");
  const depth2 = selectedTools.filter((t) => t.method !== "GET");
  const dagDepths = [depth1, depth2].filter((d) => d.length > 0);

  emitTelemetry("DAG_PLANNED", {
    totalTools: selectedTools.length,
    depthCount: dagDepths.length
  });

  const executedNodes = [];
  let sequentialMcpSum = 0;
  let parallelMcpMaxSum = 0;

  for (let dIdx = 0; dIdx < dagDepths.length; dIdx++) {
    const levelTools = dagDepths[dIdx];
    const levelMaxLatency = Math.max(...levelTools.map((t) => t.latencyMs));
    parallelMcpMaxSum += levelMaxLatency;

    const levelResults = await Promise.all(
      levelTools.map(async (tool) => {
        sequentialMcpSum += tool.latencyMs;
        await new Promise((r) => setTimeout(r, Math.min(tool.latencyMs, 300)));
        const result = tool.execute();
        const pruned = prunePayload(result.rawPayload);
        const nodeData = {
          depth: dIdx + 1,
          toolId: tool.id,
          toolName: tool.name,
          transport: tool.transport,
          method: tool.method,
          similarity: tool.similarity,
          latencyMs: tool.latencyMs,
          rawPayload: pruned.rawPayload,
          prunedPayload: pruned.prunedPayload,
          rawBytes: pruned.rawBytes,
          prunedBytes: pruned.prunedBytes,
          reductionPct: pruned.reductionPct,
          summary: result.summary
        };
        emitTelemetry("MCP_TOOL_EXECUTED", nodeData);
        return nodeData;
      })
    );
    executedNodes.push(...levelResults);
  }

  const totalParallelLatency = lAsr + lLlm + parallelMcpMaxSum + lTts;
  const totalSequentialLatency = lAsr + lLlm + sequentialMcpSum + lTts;
  const latencySavedMs = Math.max(0, totalSequentialLatency - totalParallelLatency);
  const avgTokenSavingsPct = executedNodes.length > 0
    ? Math.round(executedNodes.reduce((acc, n) => acc + n.reductionPct, 0) / executedNodes.length)
    : 0;

  return {
    executedNodes,
    telemetry: {
      lAsr, lLlm, lMcpParallel: parallelMcpMaxSum, lMcpSequential: sequentialMcpSum, lTts,
      totalParallelLatency, totalSequentialLatency, latencySavedMs, tMaxThreshold: 8000, avgTokenSavingsPct
    }
  };
}
module.exports = { executeDag };
