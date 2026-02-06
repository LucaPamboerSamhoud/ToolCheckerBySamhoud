import type { ComplianceResult } from "../api/client";
import CategoryCard from "./CategoryCard";
import ContactForm from "./ContactForm";
import StatusBadge, { StatusPill } from "./StatusBadge";

const STATUS_EXPLANATIONS = {
  green: {
    title: "Veilig te gebruiken",
    explanation:
      "Op basis van publiek beschikbare informatie voldoet deze tool aan de belangrijkste AVG-vereisten. Je kunt deze tool gebruiken voor het verwerken van persoonsgegevens, maar lees wel de verwerkersovereenkomst (DPA) goed door.",
    bgClass: "bg-status-green-bg border-status-green-border",
    textClass: "text-status-green",
  },
  orange: {
    title: "Nader onderzoek nodig",
    explanation:
      "Er zijn aandachtspunten gevonden die nader onderzocht moeten worden voordat je deze tool inzet voor persoonsgegevens. Dit kan betekenen dat informatie niet vindbaar was, of dat bepaalde aspecten niet volledig aan de AVG-normen voldoen.",
    bgClass: "bg-status-orange-bg border-status-orange-border",
    textClass: "text-status-orange",
  },
  red: {
    title: "Niet gebruiken zonder waarborgen",
    explanation:
      "Er zijn serieuze risico's gevonden. Gebruik deze tool niet voor het verwerken van persoonsgegevens zonder eerst aanvullende maatregelen te treffen en juridisch advies in te winnen.",
    bgClass: "bg-status-red-bg border-status-red-border",
    textClass: "text-status-red",
  },
};

export default function ResultView({
  result,
  onReset,
}: {
  result: ComplianceResult;
  onReset: () => void;
}) {
  const statusInfo = STATUS_EXPLANATIONS[result.overall_status];

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
      {/* Back button */}
      <button
        onClick={onReset}
        className="inline-flex items-center gap-1.5 text-sm text-samhoud-blue-soft hover:text-samhoud-blue transition-colors cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path d="M15 19l-7-7 7-7" />
        </svg>
        Nieuwe check
      </button>

      {/* Tool header */}
      <div className="glass-card rounded-2xl p-8 text-center">
        <h1 className="font-display text-4xl font-bold text-samhoud-dark mb-1">
          {result.tool_name}
        </h1>
        {result.tool_url && (
          <a
            href={result.tool_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-samhoud-light-blue hover:underline inline-flex items-center gap-1"
          >
            {result.tool_url}
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        )}

        {/* Main verdict */}
        <div className="flex justify-center my-6">
          <StatusBadge status={result.overall_status} size="xl" animated />
        </div>

        <h2 className={`font-display text-2xl font-bold ${statusInfo.textClass} mb-3`}>
          {statusInfo.title}
        </h2>

        {/* Status explanation */}
        <div className={`max-w-lg mx-auto rounded-xl p-4 border ${statusInfo.bgClass}`}>
          <p className="text-sm leading-relaxed text-samhoud-dark/80">
            {statusInfo.explanation}
          </p>
        </div>

        {/* AI summary */}
        <p className="text-samhoud-blue-soft mt-6 max-w-xl mx-auto leading-relaxed">
          {result.summary}
        </p>

        {/* Quick overview */}
        <div className="flex justify-center gap-3 mt-6 flex-wrap">
          {result.categories.map((cat, i) => (
            <div
              key={i}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/60 border border-samhoud-blue-wash/50"
            >
              <StatusBadge status={cat.status} size="sm" />
              <span className="text-sm text-samhoud-dark/80">{cat.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* What is a compliance check? — educational */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-samhoud-blue-wash flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-samhoud-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div>
            <h3 className="font-display font-semibold text-samhoud-dark mb-1">Wat is een compliance check?</h3>
            <p className="text-sm text-samhoud-blue-soft leading-relaxed">
              Wij hebben de publiek beschikbare documentatie van {result.tool_name} geanalyseerd op basis van de
              Algemene Verordening Gegevensbescherming (AVG/GDPR). We kijken naar drie pijlers: <strong>waar data wordt opgeslagen</strong>,
              <strong> welke rechten je hebt</strong> over die data, en <strong>hoe goed de beveiliging</strong> is. Hieronder vind je de resultaten per categorie.
            </p>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-3 stagger-children">
        {result.categories.map((category, i) => (
          <CategoryCard key={i} category={category} />
        ))}
      </div>

      {/* Sub-processors */}
      {result.sub_processors.length > 0 && (
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-start gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-samhoud-orange-wash flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-samhoud-orange" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
            <div>
              <h3 className="font-display font-semibold text-samhoud-dark mb-1">
                Sub-verwerkers
              </h3>
              <p className="text-sm text-samhoud-blue-soft leading-relaxed">
                {result.tool_name} maakt gebruik van andere bedrijven (sub-verwerkers) om data te verwerken.
                De veiligheid van jouw data is zo sterk als de zwakste schakel in deze keten. Hieronder
                zie je welke partijen betrokken zijn en waar zij data verwerken.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {result.sub_processors.map((sp, i) => (
              <div
                key={i}
                className="flex items-start gap-3 p-3 rounded-xl bg-white/60 border border-samhoud-blue-wash/30"
              >
                <StatusBadge status={sp.status} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="font-semibold text-samhoud-dark text-sm">{sp.name}</span>
                    <span className="text-xs text-samhoud-blue-pale">{sp.purpose}</span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    <svg className="w-3.5 h-3.5 text-samhoud-blue-pale" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-xs text-samhoud-blue-soft">{sp.data_location}</span>
                  </div>
                </div>
                <StatusPill status={sp.status} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA + Contact form */}
      <ContactForm toolName={result.tool_name} />

      {/* Sources */}
      {result.sources_consulted.length > 0 && (
        <details className="glass-card rounded-2xl p-6 group">
          <summary className="flex items-center gap-3 cursor-pointer list-none">
            <div className="w-10 h-10 rounded-xl bg-samhoud-blue-wash flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-samhoud-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <span className="font-display font-semibold text-samhoud-dark">
              Geraadpleegde bronnen ({result.sources_consulted.length})
            </span>
            <svg className="w-4 h-4 text-samhoud-blue-pale ml-auto transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M19 9l-7 7-7-7" />
            </svg>
          </summary>
          <div className="mt-4 space-y-2">
            {result.sources_consulted.map((source, i) => (
              <a
                key={i}
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 rounded-lg hover:bg-samhoud-blue-ghost transition-colors"
              >
                <div className="font-medium text-sm text-samhoud-dark">{source.title}</div>
                <div className="text-xs text-samhoud-light-blue truncate">{source.url}</div>
              </a>
            ))}
          </div>
        </details>
      )}

      {/* Disclaimer */}
      <div className="text-center px-8 py-4">
        <p className="text-xs text-samhoud-blue-pale leading-relaxed italic">
          {result.disclaimer}
        </p>
      </div>
    </div>
  );
}
