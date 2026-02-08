import { useMemo, useRef, useState } from "react";
import type { ToolSearchResult } from "../api/client";
import { searchTool } from "../api/client";
import { TOOL_CATALOG } from "../data/tool-catalog";

interface Props {
  onSelect: (name: string, url: string) => void;
}

export default function ToolSearch({ onSelect }: Props) {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [apiResults, setApiResults] = useState<ToolSearchResult[] | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Client-side fuzzy match op de catalogus
  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) return [];

    return TOOL_CATALOG.filter((tool) => tool.name.toLowerCase().includes(q))
      .slice(0, 5)
      .map((tool) => ({ name: tool.name, url: tool.url }));
  }, [query]);

  function extractDomain(url: string): string {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return url;
    }
  }

  function handleSelect(name: string, url: string) {
    setShowSuggestions(false);
    setApiResults(null);
    onSelect(name, url);
  }

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;

    // Als er een exacte match in de catalogus is, direct selecteren
    const exact = TOOL_CATALOG.find(
      (t) => t.name.toLowerCase() === query.trim().toLowerCase()
    );
    if (exact) {
      handleSelect(exact.name, exact.url);
      return;
    }

    // Anders: DuckDuckGo + LLM fallback
    setSearching(true);
    setShowSuggestions(false);
    setApiResults(null);
    try {
      const data = await searchTool(query.trim());
      setApiResults(data);
    } finally {
      setSearching(false);
    }
  }

  function handleInputChange(value: string) {
    setQuery(value);
    setApiResults(null);
    setShowSuggestions(value.trim().length >= 2);
  }

  const hasSuggestions = showSuggestions && suggestions.length > 0;
  const hasApiResults = apiResults !== null && apiResults.length > 0;
  const noResults = apiResults !== null && apiResults.length === 0;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Search form */}
      <form onSubmit={handleSearch} className="relative">
        <div className="relative">
          <svg
            className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-samhoud-blue-soft"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => setShowSuggestions(query.trim().length >= 2)}
            placeholder="Typ een toolnaam, bijv. Slack, Notion, ChatGPT..."
            className="w-full pl-14 pr-32 py-5 bg-white border-2 border-samhoud-blue-wash
              rounded-2xl text-lg focus:outline-none focus:border-samhoud-blue/40
              focus:shadow-[0_0_0_4px_rgba(12,42,173,0.08)] transition-all
              placeholder:text-samhoud-blue-soft/60"
            autoFocus
            autoComplete="off"
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
                <svg
                  className="w-4 h-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Zoeken
              </span>
            ) : (
              "Zoeken"
            )}
          </button>
        </div>

        {/* Autocomplete dropdown */}
        {hasSuggestions && !searching && !hasApiResults && (
          <div className="absolute z-20 w-full mt-2 bg-white border border-samhoud-blue-wash rounded-xl shadow-lg overflow-hidden animate-fade-in-up">
            {suggestions.map((tool, i) => (
              <button
                key={i}
                type="button"
                onClick={() => handleSelect(tool.name, tool.url)}
                className="w-full text-left px-5 py-3.5 hover:bg-samhoud-blue-ghost
                  transition-colors cursor-pointer flex items-center gap-3
                  border-b border-samhoud-blue-ghost last:border-b-0"
              >
                <div className="w-8 h-8 rounded-full bg-samhoud-blue-wash flex items-center justify-center flex-shrink-0">
                  <span className="font-display font-bold text-samhoud-blue text-xs">
                    {tool.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-samhoud-dark text-sm">
                    {tool.name}
                  </span>
                  <span className="text-xs text-samhoud-blue-pale ml-2">
                    {extractDomain(tool.url)}
                  </span>
                </div>
              </button>
            ))}
            <div className="px-5 py-2.5 bg-samhoud-blue-ghost/50 text-xs text-samhoud-blue-soft">
              Staat je tool er niet bij? Druk op Zoeken om online te zoeken.
            </div>
          </div>
        )}
      </form>

      {/* Loading state */}
      {searching && (
        <div className="mt-6 text-center animate-fade-in-up">
          <div className="inline-flex items-center gap-3 px-6 py-4 glass-card rounded-xl">
            <svg
              className="w-5 h-5 animate-spin text-samhoud-blue"
              viewBox="0 0 24 24"
              fill="none"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
              />
            </svg>
            <span className="text-samhoud-blue-soft">
              Tool zoeken met AI...
            </span>
          </div>
        </div>
      )}

      {/* API search results — "Bedoel je...?" */}
      {hasApiResults && (
        <div className="mt-6 animate-fade-in-up">
          <p className="text-sm font-semibold text-samhoud-dark mb-3 ml-1">
            Bedoel je...?
          </p>
          <div className="space-y-2">
            {apiResults!.map((result, i) => (
              <button
                key={i}
                onClick={() => handleSelect(result.name, result.url)}
                className="w-full text-left px-5 py-4 glass-card rounded-xl
                  hover:border-samhoud-blue/30 hover:shadow-md
                  transition-all duration-200 group cursor-pointer
                  flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-full bg-samhoud-blue-wash flex items-center justify-center flex-shrink-0 group-hover:bg-samhoud-blue transition-colors">
                  <span className="font-display font-bold text-samhoud-blue group-hover:text-white transition-colors text-sm">
                    {result.name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-samhoud-dark group-hover:text-samhoud-blue transition-colors">
                    {result.name}
                  </span>
                  {result.url && (
                    <span className="text-xs text-samhoud-blue-pale ml-2">
                      {extractDomain(result.url)}
                    </span>
                  )}
                </div>
                <svg
                  className="w-5 h-5 text-samhoud-blue-pale group-hover:text-samhoud-blue flex-shrink-0 transition-colors"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path d="M9 5l7 7-7 7" />
                </svg>
              </button>
            ))}
          </div>
          {/* Optie om toch handmatig de query te checken */}
          <button
            onClick={() => handleSelect(query.trim(), "")}
            className="mt-3 w-full text-center py-3 text-sm text-samhoud-blue-soft
              hover:text-samhoud-blue transition-colors cursor-pointer"
          >
            Geen van bovenstaande? Check &quot;{query.trim()}&quot; toch
          </button>
        </div>
      )}

      {/* No results */}
      {noResults && (
        <div className="mt-6 text-center animate-fade-in-up">
          <p className="text-samhoud-blue-soft mb-4">
            Geen resultaten gevonden voor &quot;{query.trim()}&quot;.
          </p>
          <button
            onClick={() => handleSelect(query.trim(), "")}
            className="px-6 py-3 bg-samhoud-blue text-white font-semibold rounded-xl
              hover:bg-samhoud-blue-mid transition-colors cursor-pointer"
          >
            Check &quot;{query.trim()}&quot; toch
          </button>
        </div>
      )}
    </div>
  );
}
