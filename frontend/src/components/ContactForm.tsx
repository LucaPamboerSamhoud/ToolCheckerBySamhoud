import { useState } from "react";
import type { LeadData } from "../api/client";
import { downloadReport, submitLead } from "../api/client";

export default function ContactForm({ toolName }: { toolName: string }) {
  const [form, setForm] = useState<LeadData>({
    name: "",
    email: "",
    company: "",
    function: "",
    tool_name: toolName,
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const isValid =
    form.name.trim() !== "" &&
    form.email.trim() !== "" &&
    form.company.trim() !== "" &&
    form.function.trim() !== "";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isValid) return;

    setSubmitting(true);
    setError("");

    try {
      await submitLead(form);
      await downloadReport(toolName);
      setSubmitted(true);
    } catch {
      setError("Er ging iets mis. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="bg-samhoud-blue/5 rounded-xl p-8 text-center">
        <div className="text-4xl mb-4">📄</div>
        <h3 className="text-xl font-semibold text-samhoud-blue mb-2">
          Rapport gedownload!
        </h3>
        <p className="text-gray-600">
          Bedankt voor je interesse. We nemen binnenkort contact met je op.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
      {/* CTA tekst */}
      <div className="text-center mb-6">
        <h3 className="text-xl font-semibold text-samhoud-blue mb-2">
          Download het volledige rapport
        </h3>
        <p className="text-gray-600">
          Wil je weten hoe je de nieuwste technologie verantwoord inzet binnen
          je organisatie? Download het uitgebreide rapport en neem contact met
          ons op.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Naam *
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-samhoud-blue/30 focus:border-samhoud-blue transition-colors"
              placeholder="Je naam"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-samhoud-blue/30 focus:border-samhoud-blue transition-colors"
              placeholder="je@bedrijf.nl"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bedrijf *
            </label>
            <input
              type="text"
              required
              value={form.company}
              onChange={(e) => setForm({ ...form, company: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-samhoud-blue/30 focus:border-samhoud-blue transition-colors"
              placeholder="Je organisatie"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Functie *
            </label>
            <input
              type="text"
              required
              value={form.function}
              onChange={(e) => setForm({ ...form, function: e.target.value })}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-samhoud-blue/30 focus:border-samhoud-blue transition-colors"
              placeholder="Je functie"
            />
          </div>
        </div>

        {error && (
          <p className="text-red-600 text-sm text-center">{error}</p>
        )}

        <button
          type="submit"
          disabled={!isValid || submitting}
          className="w-full py-3 bg-samhoud-orange text-white font-semibold rounded-lg
            hover:bg-samhoud-orange/90 disabled:opacity-50 disabled:cursor-not-allowed
            transition-colors cursor-pointer"
        >
          {submitting ? "Bezig met downloaden..." : "Download rapport (Word)"}
        </button>

        <p className="text-xs text-gray-400 text-center">
          Door het rapport te downloaden ga je akkoord met het delen van je
          contactgegevens met &samhoud.
        </p>
      </form>
    </div>
  );
}
