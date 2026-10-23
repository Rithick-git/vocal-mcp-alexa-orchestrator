function prunePayload(rawPayload) {
  const rawString = JSON.stringify(rawPayload, null, 2);
  const rawBytes = Buffer.byteLength(rawString, "utf8");
  const prunedObject = {};
  for (const [key, value] of Object.entries(rawPayload)) {
    if (!key.startsWith("_")) prunedObject[key] = value;
  }
  const prunedString = JSON.stringify(prunedObject, null, 2);
  const prunedBytes = Buffer.byteLength(prunedString, "utf8");
  const reductionPct = Math.round(((rawBytes - prunedBytes) / rawBytes) * 100);
  return { rawPayload, prunedPayload: prunedObject, rawBytes, prunedBytes, reductionPct };
}
module.exports = { prunePayload };
