import { useState } from "react";
import type { CategoryResult } from "../api/client";
import StatusBadge, { StatusPill } from "./StatusBadge";

// Educatieve content per categorie — uitleg voor niet-technische gebruikers
const CATEGORY_INFO: Record<string, { icon: JSX.Element; why: string; tip: string }> = {
  "Dataopslag & Verwerking": {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
      </svg>
    ),
    why: "Waar je data staat bepaalt welke wetten van toepassing zijn. Data buiten de EU valt niet automatisch onder de bescherming van de AVG. Dat betekent dat jouw persoonsgegevens mogelijk minder goed beschermd zijn.",
    tip: "Let op: ook als een tool zegt 'EU-opslag' te bieden, kunnen sub-verwerkers data alsnog buiten de EU verwerken.",
  },
  "Datarechten (AVG)": {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2m14 4V3m0 0l-3 3m3-3l3 3" />
      </svg>
    ),
    why: "De AVG geeft iedereen rechten over hun eigen data: je mag inzien welke data er is, correcties eisen, en verwijdering aanvragen. Als een tool dit niet ondersteunt, is het juridisch risicovol om er persoonsgegevens in te verwerken.",
    tip: "Vraag altijd: 'Kan ik alle data van een persoon exporteren en verwijderen?' Als het antwoord nee is, is de tool niet AVG-geschikt.",
  },
  "Beveiliging": {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    why: "Goede beveiliging is de basis van privacy. Zonder encryptie, certificeringen en een plan voor datalekken zijn persoonsgegevens kwetsbaar. Een datalek kan leiden tot boetes tot 4% van de jaaromzet.",
    tip: "Zoek altijd naar ISO 27001 en SOC 2 certificeringen. Dit zijn internationale standaarden die aantonen dat een organisatie beveiliging serieus neemt.",
  },
};

const DEFAULT_INFO = {
  icon: (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4m0-4h.01" />
    </svg>
  ),
  why: "Deze categorie wordt beoordeeld op basis van publiek beschikbare informatie.",
  tip: "",
};

export default function CategoryCard({ category }: { category: CategoryResult }) {
  const [expanded, setExpanded] = useState(false);
  const info = CATEGORY_INFO[category.name] || DEFAULT_INFO;

  return (
    <div className="glass-card rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-lg">
      {/* Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-5 flex items-center gap-4 hover:bg-samhoud-blue-ghost/50 transition-colors cursor-pointer"
      >
        {/* Category icon */}
        <div className="w-12 h-12 rounded-xl bg-samhoud-blue-wash flex items-center justify-center flex-shrink-0 text-samhoud-blue">
          {info.icon}
        </div>

        {/* Title & summary */}
        <div className="flex-1 text-left min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-display font-semibold text-samhoud-dark">
              {category.name}
            </h3>
            <StatusPill status={category.status} />
          </div>
          <p className="text-sm text-samhoud-blue-soft line-clamp-1">
            {category.summary}
          </p>
        </div>

        {/* Expand icon */}
        <svg
          className={`w-5 h-5 text-samhoud-blue-pale transition-transform duration-300 flex-shrink-0 ${expanded ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-samhoud-blue-wash/50 animate-fade-in">
          {/* Educational section */}
          <div className="px-5 pt-5 pb-4">
            <div className="bg-samhoud-blue-ghost rounded-xl p-4 mb-4">
              <div className="flex items-start gap-2 mb-2">
                <svg className="w-4 h-4 text-samhoud-blue mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-samhoud-blue mb-1">Waarom is dit belangrijk?</p>
                  <p className="text-sm text-samhoud-dark/80 leading-relaxed">{info.why}</p>
                </div>
              </div>
              {info.tip && (
                <div className="flex items-start gap-2 mt-3 pt-3 border-t border-samhoud-blue-wash">
                  <svg className="w-4 h-4 text-samhoud-orange mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                  <p className="text-sm text-samhoud-dark/70">{info.tip}</p>
                </div>
              )}
            </div>
          </div>

          {/* Individual checks */}
          <div className="px-5 pb-5 space-y-3">
            {category.checks.map((check, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-white/60 border border-samhoud-blue-wash/30">
                <StatusBadge status={check.status} size="sm" />
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-samhoud-dark text-sm">
                    {check.name}
                  </h4>
                  <p className="text-sm text-samhoud-blue-soft mt-1 leading-relaxed">
                    {check.finding}
                  </p>
                  {check.sources.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {check.sources.map((source, j) => (
                        <div key={j} className="text-xs">
                          {source.quote && (
                            <p className="text-samhoud-blue-soft/70 italic mb-1 pl-3 border-l-2 border-samhoud-blue-wash">
                              "{source.quote}"
                            </p>
                          )}
                          <a
                            href={source.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-samhoud-light-blue hover:underline inline-flex items-center gap-1"
                          >
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
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
        </div>
      )}
    </div>
  );
}
