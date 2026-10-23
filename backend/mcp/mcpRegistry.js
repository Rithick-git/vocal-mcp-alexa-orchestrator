const { initialTools } = require("./builtInTools");

class McpRegistry {
  constructor() {
    this.tools = [...initialTools];
  }
  listTools() {
    return this.tools.map(({ execute, ...rest }) => rest);
  }
  getAllExecutableTools() {
    return this.tools;
  }
  registerOpenApiSpec(spec) {
    const toolName = spec.name || "weather_logistics_api";
    const exists = this.tools.find((t) => t.name === toolName);
    if (exists) return exists;
    const newTool = {
      id: `mcp_dynamic_${Date.now()}`,
      name: toolName,
      transport: "SSE (OpenAPI Auto-Bridge)",
      method: spec.method || "GET",
      destructive: false,
      description: spec.description || "Dynamic OpenAPI tool: Fetch live supply-chain weather alerts, air-freight routing status, and port congestion index.",
      keywords: ["weather", "supply", "chain", "logistics", "openapi", "custom", "port", "freight", "route", "inspect"],
      latencyMs: 460,
      execute: () => ({
        rawPayload: {
          source: "OpenAPI v3.1 Live Bridge",
          endpoint: spec.endpoint || "[https://api.enterprise-logistics.io/v1/freight-pulse](https://api.enterprise-logistics.io/v1/freight-pulse)",
          corridorStatus: "CLEAR_OPTIMAL",
          chennaiPortCongestionIndex: "Low (14%)",
          airFreightWeatherAlert: "None",
          estimatedDeliveryWindow: "On-Schedule (-22 mins early)",
          _internalDebugMetadata: {
            openApiOperationId: "getFreightWeatherPulse",
            rawHeaders: { "x-envoy-upstream-service-time": "44", "x-ratelimit-remaining": "998" },
            telemetryTrace: Array.from({ length: 24 }, (_, i) => `hop_trace_node_${i}`)
          }
        },
        summary: "OpenAPI Logistics Bridge reports Chennai Corridor is clear with 14% port congestion and deliveries running 22 minutes ahead of schedule."
      })
    };
    this.tools.push(newTool);
    return newTool;
  }
}
module.exports = new McpRegistry();
