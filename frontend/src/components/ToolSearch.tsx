import { useState } from "react";
import type { ToolSearchResult } from "../api/client";
import { searchTool } from "../api/client";

export default function ToolSearch({
  onSelect,
}: {
  onSelect: (name: string, url: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ToolSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    setSearching(true);
    setSearched(false);
    try {
      const data = await searchTool(query.trim());
      setResults(data);
      setSearched(true);
    } finally {
      setSearching(false);
    }
  }

  function extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search form */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <svg
            className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-samhoud-blue-soft"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek een tool, bijv. Slack, Notion, ChatGPT..."
            className="w-full pl-14 pr-32 py-5 bg-white border-2 border-samhoud-blue-wash
              rounded-2xl text-lg focus:outline-none focus:border-samhoud-blue/40
              focus:shadow-[0_0_0_4px_rgba(12,42,173,0.08)] transition-all
              placeholder:text-samhoud-blue-soft/60"
            autoFocus
          />
          <button
            type="submit"
            disabled={!query.trim() || searching}
            className="absolute right-3 top-1/2 -translate-y-1/2 px-6 py-2.5
              bg-samhoud-blue text-white font-semibold rounded-xl
              hover:bg-samhoud-blue-mid disabled:opacity-40 disabled:cursor-not-allowed
              transition-all cursor-pointer text-sm"
          >
            {searching ? (
              <span className="flex items-center gap-2">
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Zoeken
              </span>
            ) : "Zoeken"}
          </button>
        </div>
      </form>

      {/* Search results */}
      {searched && results.length > 0 && (
        <div className="mt-6 animate-fade-in-up">
          <p className="text-sm font-medium text-samhoud-blue-soft mb-3 ml-1">
            Welke tool bedoel je?
          </p>
          <div className="space-y-2 stagger-children">
            {results.map((result, i) => (
              <button
                key={i}
                onClick={() => onSelect(result.name, result.url)}
                className="w-full text-left p-4 glass-card rounded-xl
                  hover:border-samhoud-blue/30 hover:shadow-md
                  transition-all duration-200 group cursor-pointer"
              >
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-samhoud-blue-wash flex items-center justify-center flex-shrink-0 group-hover:bg-samhoud-blue group-hover:text-white transition-colors">
                    <svg className="w-5 h-5 text-samhoud-blue group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-samhoud-dark group-hover:text-samhoud-blue transition-colors truncate">
                      {result.name}
                    </div>
                    <div className="text-xs text-samhoud-blue-soft mt-0.5">
                      {extractDomain(result.url)}
                    </div>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {result.description}
                    </p>
                  </div>
                  <svg className="w-5 h-5 text-gray-300 group-hover:text-samhoud-blue flex-shrink-0 mt-1 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </button>
            ))}

            {/* Handmatige invoer optie */}
            <button
              onClick={() => onSelect(query.trim(), "")}
              className="w-full text-left p-4 rounded-xl border-2 border-dashed border-samhoud-blue-wash
                hover:border-samhoud-blue/30 hover:bg-samhoud-blue-ghost
                transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-samhoud-blue-ghost flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-samhoud-blue-soft" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div>
                  <div className="font-medium text-samhoud-blue-soft">
                    Geen van bovenstaande? Check "{query.trim()}" direct
                  </div>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* No results */}
      {searched && results.length === 0 && (
        <div className="mt-6 text-center animate-fade-in-up">
          <p className="text-samhoud-blue-soft mb-4">
            Geen resultaten gevonden. We checken "{query.trim()}" direct voor je.
          </p>
          <button
            onClick={() => onSelect(query.trim(), "")}
            className="px-6 py-3 bg-samhoud-blue text-white font-semibold rounded-xl
              hover:bg-samhoud-blue-mid transition-colors cursor-pointer"
          >
            Start check voor "{query.trim()}"
          </button>
        </div>
      )}
    </div>
  );
}
