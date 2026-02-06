// === Types ===

export interface Source {
  url: string;
  title: string;
  quote?: string;
}

export interface CheckResult {
  name: string;
  description: string;
  status: "green" | "orange" | "red";
  finding: string;
  sources: Source[];
}

export interface SubProcessor {
  name: string;
  purpose: string;
  data_location: string;
  status: "green" | "orange" | "red";
  source?: Source;
}

export interface CategoryResult {
  name: string;
  status: "green" | "orange" | "red";
  summary: string;
  checks: CheckResult[];
}

export interface ComplianceResult {
  tool_name: string;
  tool_url?: string;
  overall_status: "green" | "orange" | "red";
  summary: string;
  categories: CategoryResult[];
  sub_processors: SubProcessor[];
  sources_consulted: Source[];
  disclaimer: string;
}

export interface ProgressUpdate {
  step: string;
  message: string;
  progress: number;
}

export interface LeadData {
  name: string;
  email: string;
  company: string;
  function: string;
  tool_name: string;
}

export interface ToolSearchResult {
  name: string;
  url: string;
  description: string;
}

// === API Functions ===

export async function searchTool(query: string): Promise<ToolSearchResult[]> {
  const response = await fetch(
    `/api/search-tool?q=${encodeURIComponent(query)}`
  );
  if (!response.ok) return [];
  return response.json();
}

export function startComplianceCheck(
  toolName: string,
  onProgress: (update: ProgressUpdate) => void,
  onResult: (result: ComplianceResult) => void,
  onError: (error: string) => void
): () => void {
  const controller = new AbortController();

  fetch("/api/check", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool_name: toolName }),
    signal: controller.signal,
  })
    .then(async (response) => {
      if (!response.ok) {
        onError(`Server error: ${response.status}`);
        return;
      }

      const reader = response.body?.getReader();
      if (!reader) {
        onError("Geen response stream beschikbaar");
        return;
      }

      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6).trim();
            if (!data) continue;

            try {
              const parsed = JSON.parse(data);
              if ("step" in parsed) {
                onProgress(parsed as ProgressUpdate);
              } else if ("overall_status" in parsed) {
                onResult(parsed as ComplianceResult);
              }
            } catch {
              // Negeer parse fouten bij incomplete SSE berichten
            }
          }
          if (line.startsWith("event: error")) {
            onError("Er is een fout opgetreden bij de analyse");
          }
        }
      }
    })
    .catch((err) => {
      if (err.name !== "AbortError") {
        onError(`Verbindingsfout: ${err.message}`);
      }
    });

  return () => controller.abort();
}

export async function submitLead(lead: LeadData): Promise<boolean> {
  try {
    const response = await fetch("/api/lead", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(lead),
    });
    return response.ok;
  } catch {
    return false;
  }
}

export async function downloadReport(toolName: string): Promise<void> {
  const response = await fetch("/api/report", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ tool_name: toolName }),
  });

  if (!response.ok) {
    throw new Error("Rapport kon niet worden gegenereerd");
  }

  const blob = await response.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `compliance-rapport-${toolName.toLowerCase().replace(/\s+/g, "-")}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
