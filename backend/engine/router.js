function tokenize(text) {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").split(/\s+/).filter(Boolean);
}
function buildVector(tokens, vocabulary) {
  return vocabulary.map((word) => {
    let score = 0;
    for (const t of tokens) {
      if (t === word) score += 1.0;
      else if (t.length > 3 && word.length > 3 && (t.includes(word) || word.includes(t))) score += 0.65;
    }
    return score;
  });
}
function cosineSimilarity(vecA, vecB) {
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < vecA.length; i++) {
    dot += vecA[i] * vecB[i];
    normA += vecA[i] * vecA[i];
    normB += vecB[i] * vecB[i];
  }
  if (normA === 0 || normB === 0) return 0.08;
  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}
function routeTools(utterance, tools, topK = 3) {
  const uTokens = tokenize(utterance);
  const scored = tools.map((tool) => {
    const toolCorpus = `${tool.name} ${tool.description} ${(tool.keywords || []).join(" ")}`;
    const tTokens = tokenize(toolCorpus);
    const vocab = Array.from(new Set([...uTokens, ...tTokens]));
    const rawSim = cosineSimilarity(buildVector(uTokens, vocab), buildVector(tTokens, vocab));
    const scaledSim = Math.min(0.99, Number((rawSim * 1.45 + 0.12).toFixed(3)));
    return {
      tool,
      similarity: rawSim > 0.09 ? scaledSim : Number((0.11 + Math.random() * 0.08).toFixed(3))
    };
  });
  scored.sort((a, b) => b.similarity - a.similarity);
  const selected = scored.filter((item, idx) => idx === 0 || item.similarity >= 0.38).slice(0, topK);
  return {
    allScores: scored.map((s) => ({
      id: s.tool.id,
      name: s.tool.name,
      transport: s.tool.transport,
      method: s.tool.method,
      similarity: s.similarity,
      selected: selected.some((sel) => sel.tool.id === s.tool.id)
    })),
    selectedTools: selected.map((s) => ({ ...s.tool, similarity: s.similarity }))
  };
}
module.exports = { routeTools };
