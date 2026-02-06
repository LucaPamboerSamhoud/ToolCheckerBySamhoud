import { useCallback, useRef, useState } from "react";
import type { ComplianceResult, ProgressUpdate } from "./api/client";
import { startComplianceCheck } from "./api/client";
import ProgressView from "./components/ProgressView";
import ResultView from "./components/ResultView";
import ToolSearch from "./components/ToolSearch";

type AppState = "home" | "loading" | "result" | "error";

export default function App() {
  const [state, setState] = useState<AppState>("home");
  const [toolName, setToolName] = useState("");
  const [progress, setProgress] = useState<ProgressUpdate>({
    step: "",
    message: "",
    progress: 0,
  });
  const [result, setResult] = useState<ComplianceResult | null>(null);
  const [error, setError] = useState("");
  const cancelRef = useRef<(() => void) | null>(null);

  const handleToolSelect = useCallback((name: string, _url: string) => {
    const cleanName = name.split(" - ")[0].split(" | ")[0].split(" — ")[0].trim();
    setToolName(cleanName);
    setState("loading");
    setError("");

    const cancel = startComplianceCheck(
      cleanName,
      (update) => setProgress(update),
      (res) => {
        setResult(res);
        setState("result");
      },
      (err) => {
        setError(err);
        setState("error");
      }
    );

    cancelRef.current = cancel;
  }, []);

  const handleReset = useCallback(() => {
    if (cancelRef.current) cancelRef.current();
    setState("home");
    setToolName("");
    setResult(null);
    setError("");
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="py-5 px-6 relative z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <button onClick={handleReset} className="flex items-center gap-2.5 cursor-pointer group">
            <div className="w-9 h-9 rounded-full bg-samhoud-blue flex items-center justify-center group-hover:scale-105 transition-transform">
              <span className="text-white font-display font-bold text-sm">&amp;</span>
            </div>
            <div className="flex flex-col">
              <span className="font-display font-semibold text-samhoud-blue text-sm leading-tight">
                ToolChecker
              </span>
              <span className="text-[10px] text-samhoud-blue-soft leading-tight">
                by {"&samhoud"}
              </span>
            </div>
          </button>

          {state !== "home" && (
            <button
              onClick={handleReset}
              className="text-sm text-samhoud-blue-soft hover:text-samhoud-blue transition-colors cursor-pointer flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 4v16m8-8H4" />
              </svg>
              Nieuwe check
            </button>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 px-6 pb-16">
        {state === "home" && (
          <div className="pt-12">
            {/* Hero section */}
            <div className="max-w-3xl mx-auto text-center mb-12 relative">
              {/* Decorative circles — core &samhoud brand element */}
              <div className="absolute -top-8 left-1/4 w-64 h-64 rounded-full bg-samhoud-blue/[0.03] animate-float-slow pointer-events-none" />
              <div className="absolute top-16 right-1/6 w-40 h-40 rounded-full bg-samhoud-orange/[0.04] animate-float pointer-events-none" style={{ animationDelay: "2s" }} />
              <div className="absolute -bottom-4 left-1/3 w-24 h-24 rounded-full bg-samhoud-blue-mid/[0.05] animate-float pointer-events-none" style={{ animationDelay: "4s" }} />

              <div className="relative">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-samhoud-blue-wash text-samhoud-blue text-sm font-medium mb-6">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  AVG/GDPR Compliance Check
                </div>

                <h1 className="font-display text-5xl md:text-6xl font-bold text-samhoud-dark mb-5 leading-[1.1] tracking-tight">
                  Is jouw tool{" "}
                  <span className="gradient-text">AVG-proof</span>?
                </h1>

                <p className="text-lg text-samhoud-blue-soft max-w-xl mx-auto leading-relaxed mb-10">
                  Voer een tool in en onze AI analyseert binnen een minuut de privacy policies,
                  security documentatie en sub-verwerkers. Je ontvangt een helder stoplicht-oordeel.
                </p>
              </div>
            </div>

            {/* Search */}
            <ToolSearch onSelect={handleToolSelect} />

            {/* How it works */}
            <div className="max-w-3xl mx-auto mt-20">
              <h2 className="font-display text-2xl font-bold text-samhoud-dark text-center mb-8">
                Hoe werkt het?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  {
                    step: "1",
                    title: "Zoek je tool",
                    desc: "Typ de naam van de software die je wilt checken. We zoeken de officiële website en documentatie op.",
                    icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z",
                  },
                  {
                    step: "2",
                    title: "AI analyseert",
                    desc: "Onze AI leest de privacy policy, security pagina's en sub-verwerkerlijsten en beoordeelt elk punt op AVG-compliance.",
                    icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z",
                  },
                  {
                    step: "3",
                    title: "Ontvang je rapport",
                    desc: "Je krijgt direct een stoplicht-oordeel met uitleg. Download het volledige rapport als Word-document om te delen.",
                    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
                  },
                ].map((item) => (
                  <div key={item.step} className="glass-card rounded-2xl p-6 text-center hover:shadow-lg transition-shadow">
                    <div className="w-14 h-14 rounded-2xl bg-samhoud-blue-wash flex items-center justify-center mx-auto mb-4">
                      <svg className="w-7 h-7 text-samhoud-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path d={item.icon} />
                      </svg>
                    </div>
                    <div className="font-display text-xs font-semibold text-samhoud-orange mb-1 uppercase tracking-wider">
                      Stap {item.step}
                    </div>
                    <h3 className="font-display font-bold text-samhoud-dark mb-2">{item.title}</h3>
                    <p className="text-sm text-samhoud-blue-soft leading-relaxed">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* What we check */}
            <div className="max-w-3xl mx-auto mt-16 mb-8">
              <h2 className="font-display text-2xl font-bold text-samhoud-dark text-center mb-3">
                Wat checken we?
              </h2>
              <p className="text-samhoud-blue-soft text-center mb-8 max-w-lg mx-auto">
                Onze AI beoordeelt drie essentiële pijlers van AVG-compliance.
                Per pijler geven we een groen, oranje of rood stoplicht.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  {
                    icon: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
                    title: "Dataopslag",
                    desc: "Waar staat je data? EU of daarbuiten? Welke sub-verwerkers zijn betrokken?",
                    color: "bg-samhoud-blue",
                  },
                  {
                    icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z",
                    title: "Datarechten",
                    desc: "Kun je data inzien, exporteren en verwijderen? Wordt data gebruikt voor AI-training?",
                    color: "bg-samhoud-light-blue",
                  },
                  {
                    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z",
                    title: "Beveiliging",
                    desc: "Is er encryptie, zijn er certificeringen, en is er een plan voor datalekken?",
                    color: "bg-samhoud-blue-mid",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-3 p-4 rounded-xl bg-white/60">
                    <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center flex-shrink-0`}>
                      <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path d={item.icon} />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-display font-semibold text-samhoud-dark text-sm mb-1">{item.title}</h4>
                      <p className="text-xs text-samhoud-blue-soft leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Traffic light legend */}
            <div className="max-w-2xl mx-auto mt-12 mb-8">
              <div className="flex justify-center gap-8 text-sm">
                {[
                  { color: "bg-status-green", label: "Veilig", desc: "Voldoet aan de AVG" },
                  { color: "bg-status-orange", label: "Onderzoek nodig", desc: "Aandachtspunten gevonden" },
                  { color: "bg-status-red", label: "Risico", desc: "Niet zonder maatregelen" },
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-2 text-samhoud-blue-soft">
                    <div className={`w-3 h-3 rounded-full ${item.color}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {state === "loading" && (
          <div className="pt-12">
            <ProgressView update={progress} toolName={toolName} onCancel={handleReset} />
          </div>
        )}

        {state === "result" && result && (
          <div className="pt-4">
            <ResultView result={result} onReset={handleReset} />
          </div>
        )}

        {state === "error" && (
          <div className="max-w-lg mx-auto text-center pt-24 animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-status-red-bg flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-status-red" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h2 className="font-display text-2xl font-bold text-samhoud-dark mb-3">
              Er ging iets mis
            </h2>
            <p className="text-samhoud-blue-soft mb-8 max-w-sm mx-auto">{error}</p>
            <button
              onClick={handleReset}
              className="px-8 py-3 bg-samhoud-blue text-white font-semibold rounded-xl
                hover:bg-samhoud-blue-mid transition-colors cursor-pointer"
            >
              Opnieuw proberen
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-8 text-center border-t border-samhoud-blue-wash/50">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <div className="w-6 h-6 rounded-full bg-samhoud-blue flex items-center justify-center">
              <span className="text-white text-[10px] font-display font-bold">&amp;</span>
            </div>
            <span className="font-display text-sm font-semibold text-samhoud-blue">
              {"&samhoud"}
            </span>
          </div>
          <p className="text-xs text-samhoud-blue-pale mb-1">
            ToolChecker is een initiatief van {"&samhoud"} Data {"&"} AI.
          </p>
          <p className="text-xs text-samhoud-blue-pale">
            Wil je meer weten over verantwoorde inzet van technologie? Neem contact op via{" "}
            <a href="mailto:data.team@samhoud.com" className="text-samhoud-light-blue hover:underline">
              data.team@samhoud.com
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}
