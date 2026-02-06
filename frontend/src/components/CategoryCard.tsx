import { useState } from "react";
import type { CategoryResult } from "../api/client";
import TrafficLight from "./TrafficLight";

export default function CategoryCard({
  category,
}: {
  category: CategoryResult;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center justify-between hover:bg-gray-50 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-4">
          <TrafficLight status={category.status} size="small" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-800">{category.name}</h3>
            <p className="text-sm text-gray-500">{category.summary}</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>

      {/* Expanded checks */}
      {expanded && (
        <div className="border-t border-gray-100 p-5 space-y-4">
          {category.checks.map((check, i) => (
            <div key={i} className="flex gap-3">
              <TrafficLight status={check.status} size="small" />
              <div className="flex-1">
                <h4 className="font-medium text-gray-700 text-sm">
                  {check.name}
                </h4>
                <p className="text-sm text-gray-600 mt-1">{check.finding}</p>
                {check.sources.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {check.sources.map((source, j) => (
                      <div key={j}>
                        {source.quote && (
                          <p className="text-xs text-gray-400 italic">
                            "{source.quote}"
                          </p>
                        )}
                        <a
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-samhoud-light-blue hover:underline"
                        >
                          {source.title}
                        </a>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
