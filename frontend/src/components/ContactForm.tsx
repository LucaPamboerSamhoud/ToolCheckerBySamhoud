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
      setError("Er ging iets mis bij het downloaden. Probeer het opnieuw.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="glass-card rounded-2xl p-8 text-center animate-fade-in-up">
        <div className="w-16 h-16 rounded-full bg-status-green-bg flex items-center justify-center mx-auto mb-4 animate-check-in">
          <svg className="w-8 h-8 text-status-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h3 className="font-display text-xl font-semibold text-samhoud-dark mb-2">
          Rapport gedownload!
        </h3>
        <p className="text-samhoud-blue-soft mb-4">
          Check je downloads map. We nemen binnenkort contact met je op om te bespreken
          hoe je jouw tools verantwoord kunt inzetten.
        </p>
        <p className="text-xs text-samhoud-blue-pale">
          Heb je vragen? Mail ons op data.team@samhoud.com
        </p>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden glass-card rounded-2xl">
      {/* Decorative circles */}
      <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-samhoud-orange/5" />
      <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full bg-samhoud-blue/5" />

      <div className="relative p-8">
        {/* CTA header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-samhoud-orange-wash text-samhoud-orange text-sm font-semibold mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Uitgebreid rapport beschikbaar
          </div>
          <h3 className="font-display text-2xl font-bold text-samhoud-dark mb-3">
            Download het volledige rapport
          </h3>
          <p className="text-samhoud-blue-soft max-w-md mx-auto leading-relaxed">
            Ontvang een gedetailleerd Word-rapport met alle bevindingen, bronnen en
            concrete aanbevelingen. Ideaal om te delen met je IT-afdeling of management.
          </p>
        </div>

        {/* Benefits */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", text: "Alle bevindingen met bronnen" },
            { icon: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2", text: "Klaar om te delen" },
            { icon: "M13 10V3L4 14h7v7l9-11h-7z", text: "Direct bruikbare aanbevelingen" },
          ].map((item, i) => (
            <div key={i} className="text-center">
              <div className="w-10 h-10 rounded-xl bg-samhoud-blue-wash flex items-center justify-center mx-auto mb-2">
                <svg className="w-5 h-5 text-samhoud-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path d={item.icon} />
                </svg>
              </div>
              <p className="text-xs text-samhoud-blue-soft">{item.text}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { key: "name" as const, label: "Naam", type: "text", placeholder: "Je naam" },
              { key: "email" as const, label: "Email", type: "email", placeholder: "je@bedrijf.nl" },
              { key: "company" as const, label: "Organisatie", type: "text", placeholder: "Je organisatie" },
              { key: "function" as const, label: "Functie", type: "text", placeholder: "Je functie" },
            ].map((field) => (
              <div key={field.key}>
                <label className="block text-xs font-semibold text-samhoud-dark/70 mb-1.5 ml-1">
                  {field.label}
                </label>
                <input
                  type={field.type}
                  required
                  value={form[field.key]}
                  onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-samhoud-blue-wash rounded-xl
                    text-sm focus:outline-none focus:border-samhoud-blue/40
                    focus:shadow-[0_0_0_4px_rgba(12,42,173,0.06)] transition-all
                    placeholder:text-samhoud-blue-pale"
                  placeholder={field.placeholder}
                />
              </div>
            ))}
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-status-red-bg border border-status-red-border text-sm text-status-red">
              <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!isValid || submitting}
            className="w-full py-3.5 bg-samhoud-orange text-white font-semibold rounded-xl
              hover:bg-samhoud-orange-soft disabled:opacity-40 disabled:cursor-not-allowed
              transition-all cursor-pointer flex items-center justify-center gap-2 text-base
              shadow-[0_4px_15px_rgba(255,163,20,0.3)] hover:shadow-[0_6px_20px_rgba(255,163,20,0.4)]"
          >
            {submitting ? (
              <>
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Bezig met downloaden...
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download rapport
              </>
            )}
          </button>

          <p className="text-xs text-samhoud-blue-pale text-center leading-relaxed">
            Door het rapport te downloaden ga je akkoord met het delen van je contactgegevens met {"&samhoud"}.
            We gebruiken je gegevens alleen om contact op te nemen over compliance advies.
          </p>
        </form>
      </div>
    </div>
  );
}
