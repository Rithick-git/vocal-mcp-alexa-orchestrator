import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Cpu, Zap, ShieldAlert, CheckCircle2, Terminal, PlusCircle, Volume2, VolumeX, Activity, GitBranch, Database, Layers, Sparkles, Play } from "lucide-react";

const API_BASE = "http://localhost:4000";

const DEMO_SCENARIOS = [
  {
    title: "1. Multi-API Parallel DAG Chain",
    badge: "Parallel Execution",
    utterance: "Alexa, check AWS production cluster health and query failed PostgreSQL transactions."
  },
  {
    title: "2. Civic Welfare Auto-Concierge",
    badge: "Multi-Step Agent",
    utterance: "Alexa, check my student eligibility for the government AI grant and automatically file my application."
  },
  {
    title: "3. Production Rollback (Safety Gate)",
    badge: "Voice Guardrail",
    utterance: "Alexa, emergency rollback production API gateway deployment to stable v2.3."
  },
  {
    title: "4. Revenue & OpenAPI Logistics",
    badge: "Dynamic Tooling",
    utterance: "Alexa, check our live Stripe recurring revenue and inspect supply chain freight weather status."
  }
];

export default function App() {
  const [tools, setTools] = useState([]);
  const [utteranceInput, setUtteranceInput] = useState(DEMO_SCENARIOS[0].utterance);
  const [agentState, setAgentState] = useState("IDLE");
  const [spokenResponse, setSpokenResponse] = useState("Initializing VocalMCP Orchestrator...");
  const [cosineScores, setCosineScores] = useState([]);
  const [executedNodes, setExecutedNodes] = useState([]);
  const [telemetry, setTelemetry] = useState({
    lAsr: 185, lLlm: 310, lMcpParallel: 620, lMcpSequential: 1160, lTts: 165,
    totalParallelLatency: 1280, totalSequentialLatency: 1820, latencySavedMs: 540, tMaxThreshold: 8000, avgTokenSavingsPct: 78
  });
  const [safetyModal, setSafetyModal] = useState(null);
  const [eventLogs, setEventLogs] = useState([]);
  const [inspectMode, setInspectMode] = useState("PRUNED");
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [openApiImported, setOpenApiImported] = useState(false);
  const recognitionRef = useRef(null);

  useEffect(() => {
    fetchTools();
    // Auto-run Scenario 1 on mount so the dashboard is immediately populated with live data
    runOrchestration(DEMO_SCENARIOS[0].utterance, false, true);
    const sse = new EventSource(`${API_BASE}/api/telemetry/stream`);
    sse.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setEventLogs((prev) => [data, ...prev.slice(0, 19)]);
      } catch (err) {}
    };
    return () => sse.close();
  }, []);

  const fetchTools = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mcp/tools`);
      const data = await res.json();
      setTools(data.tools || []);
    } catch (err) {}
  };

  const speakText = (text, silentInit = false) => {
    if (silentInit || !ttsEnabled || !("speechSynthesis" in window)) {
      setAgentState("IDLE");
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(text);
    utter.rate = 1.04;
    utter.onstart = () => setAgentState("SPEAKING");
    utter.onend = () => setAgentState("IDLE");
    utter.onerror = () => setAgentState("IDLE");
    window.speechSynthesis.speak(utter);
  };

  const runOrchestration = async (customUtterance, confirmAction = false, silentInit = false) => {
    const query = customUtterance || utteranceInput;
    setUtteranceInput(query);
    setAgentState("REASONING");
    setSafetyModal(null);

    try {
      const res = await fetch(`${API_BASE}/api/alexa/webhook`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ utterance: query, confirmAction })
      });
      const data = await res.json();
      if (data.cosineScores) setCosineScores(data.cosineScores);

      if (data.status === "SAFETY_CONFIRMATION_REQUIRED") {
        setAgentState("SAFETY_HOLD");
        setSafetyModal({ ...data.safetyGate, utterance: query });
        setSpokenResponse(data.spokenResponse);
        speakText(data.spokenResponse, silentInit);
        return;
      }

      if (data.executedNodes) setExecutedNodes(data.executedNodes);
      if (data.telemetry) setTelemetry(data.telemetry);
      if (data.spokenResponse) {
        setSpokenResponse(data.spokenResponse);
        speakText(data.spokenResponse, silentInit);
      } else {
        setAgentState("IDLE");
      }
    } catch (err) {
      setSpokenResponse("Waiting for backend server on port 4000...");
      setAgentState("IDLE");
    }
  };

  const toggleMicrophone = () => {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) {
      runOrchestration(utteranceInput);
      return;
    }
    if (agentState === "LISTENING") {
      recognitionRef.current?.stop();
      setAgentState("IDLE");
      return;
    }
    const recognition = new SpeechRec();
    recognition.lang = "en-US";
    recognition.onstart = () => setAgentState("LISTENING");
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setUtteranceInput(transcript);
      runOrchestration(transcript);
    };
    recognition.onerror = () => setAgentState("IDLE");
    recognition.onend = () => setAgentState("IDLE");
    recognitionRef.current = recognition;
    recognition.start();
  };

  const handleImportOpenApi = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/mcp/openapi-import`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "weather_logistics_api", method: "GET" })
      });
      const data = await res.json();
      if (data.tools) setTools(data.tools);
      setOpenApiImported(true);
    } catch (err) {}
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <header className="border-b border-slate-800 bg-slate-900/70 backdrop-blur px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Cpu className="h-6 w-6 text-slate-950 stroke-[2.5]"/>
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h1 className="text-lg font-bold tracking-tight text-white">VocalMCP</h1>
              <span className="text-[11px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                Alexa+ Agent Skills & MCP
              </span>
            </div>
            <p className="text-xs text-slate-400">Universal Voice-to-API Orchestrator • Dynamic Model Context Protocol Middleware</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/90 border border-slate-700 text-xs">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-slate-300 font-medium">{tools.length} Active MCP Servers</span>
          </div>
          <button
            onClick={handleImportOpenApi}
            disabled={openApiImported}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition ${
              openApiImported ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-indigo-600 hover:bg-indigo-500 text-white"
            }`}
          >
            {openApiImported ? <><CheckCircle2 className="h-4 w-4"/> OpenAPI v3.1 Bridged</> : <><PlusCircle className="h-4 w-4"/> 1-Click Import OpenAPI Spec</>}
          </button>
          <button onClick={() => setTtsEnabled(!ttsEnabled)} className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300">
            {ttsEnabled ? <Volume2 className="h-4 w-4 text-cyan-400"/> : <VolumeX className="h-4 w-4 text-slate-500"/>}
          </button>
        </div>
      </header>

      <main className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 p-5 max-w-[1600px] w-full mx-auto">
        <section className="lg:col-span-4 flex flex-col gap-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col items-center text-center relative">
            <div className="w-full flex items-center justify-between text-xs text-slate-400 mb-2">
              <span className="font-semibold text-slate-300 flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 text-cyan-400"/> Alexa+ Zero-UI Voice Interface</span>
              <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 font-mono text-[11px]">STATE: {agentState}</span>
            </div>

            <div className="my-5 relative flex items-center justify-center">
              <div className={`h-28 w-28 rounded-full bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 blur-xl opacity-40 absolute ${agentState !== "IDLE" ? "alexa-orb-active" : ""}`} />
              <button
                onClick={toggleMicrophone}
                className="relative h-24 w-24 rounded-full flex flex-col items-center justify-center border-2 bg-slate-950/90 border-cyan-400/80 hover:border-cyan-300 text-cyan-300 hover:scale-105 transition-all shadow-2xl"
              >
                {agentState === "LISTENING" ? <MicOff className="h-8 w-8 animate-bounce text-rose-400"/> : <Mic className="h-8 w-8"/>}
                <span className="text-[10px] font-bold uppercase tracking-wider mt-1">{agentState === "LISTENING" ? "Listening" : "Speak / Run"}</span>
              </button>
            </div>

            <div className="w-full flex gap-2">
              <input
                type="text"
                value={utteranceInput}
                onChange={(e) => setUtteranceInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && runOrchestration(utteranceInput)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2 text-xs text-slate-100 focus:outline-none focus:border-cyan-400"
              />
              <button onClick={() => runOrchestration(utteranceInput)} className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1">
                <Play className="h-3.5 w-3.5 fill-current"/> Execute
              </button>
            </div>

            <div className="w-full mt-4 bg-slate-950/90 border border-slate-800/90 rounded-xl p-3.5 text-left">
              <div className="text-[10px] font-bold uppercase tracking-wider text-cyan-400 mb-1">Alexa+ Synthesized Voice Output</div>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">"{spokenResponse}"</p>
            </div>

            {safetyModal && (
              <div className="w-full mt-4 bg-amber-500/10 border border-amber-500/40 rounded-xl p-3.5 text-left">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-xs mb-1">
                  <ShieldAlert className="h-4 w-4 shrink-0"/> Human-in-the-Loop Voice Safety Gate
                </div>
                <p className="text-[11px] text-amber-200/90 mb-3">
                  Intercepted destructive <code className="font-mono font-bold">{safetyModal.method}</code> call on <code className="font-mono font-bold">{safetyModal.toolName}</code>.
                </p>
                <div className="flex gap-2">
                  <button onClick={() => runOrchestration(safetyModal.utterance, true)} className="flex-1 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs py-1.5 rounded-lg">
                    Say "Confirm Execution" (Approve)
                  </button>
                  <button onClick={() => { setSafetyModal(null); setAgentState("IDLE"); }} className="px-3 bg-slate-800 text-slate-300 text-xs py-1.5 rounded-lg">Abort</button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-2">
              <Zap className="h-4 w-4 text-amber-400"/> 1-Click Hackathon Demo Scenarios
            </h2>
            <div className="space-y-2.5">
              {DEMO_SCENARIOS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => runOrchestration(item.utterance)}
                  className="w-full text-left p-3 rounded-xl bg-slate-950/70 hover:bg-slate-800/80 border border-slate-800 hover:border-cyan-500/40 transition group"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">{item.title}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">{item.badge}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 italic">"{item.utterance}"</p>
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="lg:col-span-5 flex flex-col gap-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <GitBranch className="h-4 w-4 text-cyan-400"/> 1. Semantic Tool Routing — Cosine Similarity S(u, t_i)
                </h2>
                <p className="text-[11px] text-slate-400">Pre-filtering top-k candidate MCP tools in shared embedding space</p>
              </div>
              <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded-md border border-cyan-500/20">
                S(u,t) = (e_u · e_t) / (||e_u|| ||e_t||)
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {cosineScores.map((item) => (
                <div key={item.id} className={`p-2.5 rounded-xl border text-xs flex items-center justify-between ${item.selected ? "bg-cyan-500/10 border-cyan-500/40 text-slate-100" : "bg-slate-950/60 border-slate-800/80 text-slate-500"}`}>
                  <div className="truncate pr-2">
                    <div className="font-mono font-semibold text-[11px] truncate">{item.name}</div>
                    <div className="text-[10px] opacity-75">{item.transport}</div>
                  </div>
                  <span className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${item.selected ? "bg-cyan-400 text-slate-950" : "bg-slate-800 text-slate-400"}`}>
                    {item.similarity.toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <Layers className="h-4 w-4 text-indigo-400"/> 2. Parallel DAG Execution & Context Pruning
                </h2>
                <p className="text-[11px] text-slate-400">Live JSON-RPC 2.0 <code className="text-cyan-300">tools/call</code> execution & metadata stripping</p>
              </div>
              <div className="flex rounded-lg bg-slate-950 p-0.5 border border-slate-800 text-[11px]">
                <button onClick={() => setInspectMode("PRUNED")} className={`px-2.5 py-1 rounded-md font-semibold ${inspectMode === "PRUNED" ? "bg-cyan-500 text-slate-950" : "text-slate-400"}`}>Pruned Payload</button>
                <button onClick={() => setInspectMode("RAW")} className={`px-2.5 py-1 rounded-md font-semibold ${inspectMode === "RAW" ? "bg-indigo-500 text-white" : "text-slate-400"}`}>Raw REST JSON</button>
              </div>
            </div>
            <div className="space-y-3 overflow-y-auto max-h-[430px] pr-1">
              {executedNodes.map((node, i) => (
                <div key={i} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono text-[10px] font-bold">DAG Depth {node.depth}</span>
                      <span className="font-mono font-bold text-xs text-cyan-300">{node.toolName}</span>
                    </div>
                    <span className="text-emerald-400 font-mono font-semibold text-[11px]">-{node.reductionPct}% Context Tokens Saved ({node.latencyMs}ms)</span>
                  </div>
                  <pre className="bg-slate-900/90 border border-slate-800/80 rounded-lg p-2.5 text-[11px] font-mono text-slate-300 overflow-x-auto max-h-40">
                    {JSON.stringify(inspectMode === "PRUNED" ? node.prunedPayload : node.rawPayload, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="lg:col-span-3 flex flex-col gap-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-emerald-400"/> 3. Voice Timeout Telemetry
            </h2>
            <p className="text-[11px] text-slate-400 mb-3">Proving <code className="text-emerald-300">L_total &lt; T_max (8000ms)</code> via parallel DAG concurrency</p>
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 mb-3 space-y-2.5">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-cyan-300 font-semibold">VocalMCP Parallel DAG</span>
                  <span className="font-mono font-bold text-emerald-400">{telemetry.totalParallelLatency} ms</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-cyan-400 to-emerald-400 rounded-full" style={{ width: `${Math.min(100, (telemetry.totalParallelLatency / 3000) * 100)}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Naive Sequential Chain</span>
                  <span className="font-mono text-slate-400 line-through">{telemetry.totalSequentialLatency} ms</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-slate-600 rounded-full" style={{ width: `${Math.min(100, (telemetry.totalSequentialLatency / 3000) * 100)}%` }} />
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-center">
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[10px] text-slate-400 uppercase">Latency Saved</div>
                <div className="text-sm font-mono font-bold text-cyan-300">-{telemetry.latencySavedMs} ms</div>
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5">
                <div className="text-[10px] text-slate-400 uppercase">Context Pruned</div>
                <div className="text-sm font-mono font-bold text-emerald-400">{telemetry.avgTokenSavingsPct}%</div>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex-1 flex flex-col">
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2 mb-3">
              <Database className="h-4 w-4 text-cyan-400"/> Active MCP Server Registry ({tools.length})
            </h2>
            <div className="space-y-2 overflow-y-auto max-h-[250px] pr-1">
              {tools.map((tool) => (
                <div key={tool.id} className="p-2.5 rounded-xl bg-slate-950 border border-slate-800/90 text-xs">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-mono font-bold text-slate-200 text-[11px]">{tool.name}</span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">{tool.method} • {tool.transport}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 line-clamp-2">{tool.description}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800 flex-1 flex flex-col">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Terminal className="h-3.5 w-3.5 text-cyan-400"/> Live SSE Telemetry Stream
              </div>
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 font-mono text-[10px] text-slate-400 space-y-1 overflow-y-auto max-h-28">
                {eventLogs.map((ev, idx) => (
                  <div key={idx} className="truncate">
                    <span className="text-cyan-400">[{ev.eventType}]</span> <span>{ev.timestamp?.split("T")[1]?.slice(0, 8)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
