import { useCallback, useRef, useState } from "react";
import type { ComplianceResult, ProgressUpdate } from "./api/client";
import { startComplianceCheck } from "./api/client";
import ProgressBar from "./components/ProgressBar";
import ResultView from "./components/ResultView";

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

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (!toolName.trim()) return;

      setState("loading");
      setError("");

      const cancel = startComplianceCheck(
        toolName.trim(),
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
    },
    [toolName]
  );

  const handleReset = useCallback(() => {
    if (cancelRef.current) cancelRef.current();
    setState("home");
    setToolName("");
    setResult(null);
    setError("");
  }, []);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="py-4 px-6">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-samhoud-blue" />
            <span className="font-semibold text-samhoud-blue text-sm">
              {"&samhoud"}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="px-6 pb-16">
        {state === "home" && (
          <div className="max-w-2xl mx-auto text-center pt-24">
            <h1 className="text-5xl font-bold text-samhoud-dark mb-4 leading-tight">
              Is jouw tool
              <br />
              <span className="text-samhoud-blue">AVG-proof?</span>
            </h1>
            <p className="text-lg text-gray-500 mb-12 max-w-lg mx-auto">
              Voer de naam van een tool in en ontvang binnen een minuut een
              initiële AVG/GDPR compliance beoordeling.
            </p>

            <form onSubmit={handleSubmit} className="flex gap-3 max-w-lg mx-auto">
              <input
                type="text"
                value={toolName}
                onChange={(e) => setToolName(e.target.value)}
                placeholder="Bijv. Notion, Slack, ChatGPT..."
                className="flex-1 px-5 py-3.5 bg-white border border-gray-200 rounded-xl
                  text-lg focus:outline-none focus:ring-2 focus:ring-samhoud-blue/30
                  focus:border-samhoud-blue transition-colors shadow-sm"
                autoFocus
              />
              <button
                type="submit"
                disabled={!toolName.trim()}
                className="px-8 py-3.5 bg-samhoud-blue text-white font-semibold rounded-xl
                  hover:bg-samhoud-blue/90 disabled:opacity-50 disabled:cursor-not-allowed
                  transition-colors shadow-sm cursor-pointer"
              >
                Check
              </button>
            </form>

            <div className="mt-16 flex justify-center gap-8 text-sm text-gray-400">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-green" />
                Veilig
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-orange" />
                Nader onderzoek
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-red" />
                Niet gebruiken
              </div>
            </div>
          </div>
        )}

        {state === "loading" && (
          <div className="max-w-2xl mx-auto text-center pt-24">
            <h2 className="text-2xl font-bold text-samhoud-dark mb-2">
              {toolName} wordt geanalyseerd
            </h2>
            <p className="text-gray-500 mb-12">
              We doorzoeken privacy policies, security pagina's en
              sub-verwerkerlijsten...
            </p>
            <ProgressBar update={progress} />

            <button
              onClick={handleReset}
              className="mt-8 text-sm text-gray-400 hover:text-gray-600 cursor-pointer"
            >
              Annuleren
            </button>
          </div>
        )}

        {state === "result" && result && (
          <ResultView result={result} onReset={handleReset} />
        )}

        {state === "error" && (
          <div className="max-w-lg mx-auto text-center pt-24">
            <div className="text-5xl mb-4">😕</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">
              Er ging iets mis
            </h2>
            <p className="text-gray-500 mb-8">{error}</p>
            <button
              onClick={handleReset}
              className="px-6 py-3 bg-samhoud-blue text-white rounded-xl hover:bg-samhoud-blue/90 transition-colors cursor-pointer"
            >
              Opnieuw proberen
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} {"&samhoud"} — ToolChecker</p>
      </footer>
    </div>
  );
}
