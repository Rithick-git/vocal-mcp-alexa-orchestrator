function inspectSafety(selectedTools, confirmAction) {
  const destructiveTool = selectedTools.find((t) => t.destructive === true);
  if (destructiveTool && !confirmAction) {
    return {
      blocked: true,
      toolName: destructiveTool.name,
      method: destructiveTool.method,
      voicePrompt: `Security Guardrail Triggered: You requested a destructive ${destructiveTool.method} operation on ${destructiveTool.name.replace(/_/g, " ")}. Please say "Confirm execution" or click Approve to proceed.`
    };
  }
  return { blocked: false };
}
module.exports = { inspectSafety };
