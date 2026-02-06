import type { ComplianceResult } from "../api/client";
import CategoryCard from "./CategoryCard";
import ContactForm from "./ContactForm";
import TrafficLight from "./TrafficLight";

export default function ResultView({
  result,
  onReset,
}: {
  result: ComplianceResult;
  onReset: () => void;
}) {
  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header met stoplicht */}
      <div className="text-center space-y-4">
        <button
          onClick={onReset}
          className="text-sm text-samhoud-light-blue hover:underline cursor-pointer"
        >
          &larr; Nieuwe check
        </button>

        <h2 className="text-3xl font-bold text-gray-800">
          {result.tool_name}
        </h2>

        {result.tool_url && (
          <a
            href={result.tool_url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-samhoud-light-blue hover:underline"
          >
            {result.tool_url}
          </a>
        )}

        <div className="flex justify-center mt-6">
          <TrafficLight status={result.overall_status} size="large" />
        </div>

        <p className="text-lg text-gray-600 max-w-xl mx-auto mt-4">
          {result.summary}
        </p>
      </div>

      {/* Categorieën */}
      <div className="space-y-3">
        {result.categories.map((category, i) => (
          <CategoryCard key={i} category={category} />
        ))}
      </div>

      {/* Sub-verwerkers */}
      {result.sub_processors.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Sub-verwerkers</h3>
          <div className="space-y-3">
            {result.sub_processors.map((sp, i) => (
              <div key={i} className="flex items-start gap-3 py-2">
                <TrafficLight status={sp.status} size="small" />
                <div>
                  <span className="font-medium text-gray-700">{sp.name}</span>
                  <span className="text-gray-400 mx-2">—</span>
                  <span className="text-sm text-gray-500">{sp.purpose}</span>
                  <p className="text-xs text-gray-400 mt-1">
                    Datalocatie: {sp.data_location}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* CTA + Contactformulier */}
      <ContactForm toolName={result.tool_name} />

      {/* Disclaimer */}
      <p className="text-xs text-gray-400 text-center italic px-8">
        {result.disclaimer}
      </p>
    </div>
  );
}
