import type { ProgressUpdate } from "../api/client";

const STEPS = [
  { key: "start", label: "Check starten", icon: "rocket" },
  { key: "tool_0", label: "Website zoeken", icon: "search" },
  { key: "tool_1", label: "Privacy policy lezen", icon: "doc" },
  { key: "tool_2", label: "Security analyseren", icon: "shield" },
  { key: "tool_3", label: "Sub-verwerkers zoeken", icon: "chain" },
  { key: "tool_4", label: "Sub-verwerkers checken", icon: "verify" },
  { key: "tool_5", label: "Datarechten beoordelen", icon: "rights" },
  { key: "tool_6", label: "Certificaten checken", icon: "cert" },
  { key: "tool_7", label: "Eindoordeel bepalen", icon: "result" },
  { key: "parsing", label: "Verwerken", icon: "done" },
];

function StepIcon({ icon, active, done }: { icon: string; active: boolean; done: boolean }) {
  const color = done ? "text-status-green" : active ? "text-samhoud-blue" : "text-samhoud-blue-pale";
  const icons: Record<string, JSX.Element> = {
    rocket: <path d="M12 15V3m0 12l-4-4m4 4l4-4M2 17l.621 2.485A2 2 0 004.561 21h14.878a2 2 0 001.94-1.515L22 17" />,
    search: <><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></>,
    doc: <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8" />,
    shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />,
    chain: <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71 M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />,
    verify: <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />,
    rights: <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2 M9 7a4 4 0 100-8 4 4 0 000 8z M22 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75" />,
    cert: <path d="M12 15l-2 5 2-1 2 1-2-5z M9 12l2 2 4-4 M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />,
    result: <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2 M9 5a2 2 0 002 2h2a2 2 0 002-2 M9 5a2 2 0 012-2h2a2 2 0 012 2 M9 14l2 2 4-4" />,
    done: <path d="M22 11.08V12a10 10 0 11-5.93-9.14 M22 4L12 14.01l-3-3" />,
  };

  return (
    <svg className={`w-5 h-5 ${color} transition-colors duration-300`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      {icons[icon]}
    </svg>
  );
}

export default function ProgressView({
  update,
  toolName,
  onCancel,
}: {
  update: ProgressUpdate;
  toolName: string;
  onCancel: () => void;
}) {
  const percentage = Math.round(update.progress * 100);

  // Determine which step is active
  const currentStepIndex = STEPS.findIndex((s) => s.key === update.step);

  return (
    <div className="max-w-2xl mx-auto animate-fade-in-up">
      {/* Header */}
      <div className="text-center mb-10">
        <h2 className="font-display text-3xl font-bold text-samhoud-dark mb-2">
          {toolName} wordt geanalyseerd
        </h2>
        <p className="text-samhoud-blue-soft">
          Onze AI doorzoekt privacy policies, security documentatie en sub-verwerkerlijsten
        </p>
      </div>

      {/* Central progress circle */}
      <div className="flex justify-center mb-10">
        <div className="relative w-32 h-32">
          {/* Background circle */}
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7fb" strokeWidth="8" />
            <circle
              cx="60" cy="60" r="52" fill="none"
              stroke="#0c2aad" strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={`${2 * Math.PI * 52}`}
              strokeDashoffset={`${2 * Math.PI * 52 * (1 - update.progress)}`}
              className="transition-all duration-700 ease-out"
            />
          </svg>
          {/* Percentage text */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="font-display text-3xl font-bold text-samhoud-blue">
              {percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Steps */}
      <div className="glass-card rounded-2xl p-6 mb-6">
        <div className="space-y-1">
          {STEPS.map((step, i) => {
            const isDone = i < currentStepIndex;
            const isActive = i === currentStepIndex;
            const isFuture = i > currentStepIndex;

            return (
              <div
                key={step.key}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-300
                  ${isActive ? "bg-samhoud-blue-ghost" : ""}
                  ${isFuture ? "opacity-40" : ""}
                `}
              >
                {/* Step indicator */}
                <div className={`
                  w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300
                  ${isDone ? "bg-status-green-bg" : isActive ? "bg-samhoud-blue-wash" : "bg-gray-50"}
                `}>
                  {isDone ? (
                    <svg className="w-4 h-4 text-status-green" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <StepIcon icon={step.icon} active={isActive} done={isDone} />
                  )}
                </div>

                {/* Step label */}
                <span className={`text-sm transition-colors duration-300 ${
                  isDone ? "text-status-green font-medium" :
                  isActive ? "text-samhoud-blue font-semibold" :
                  "text-samhoud-blue-pale"
                }`}>
                  {step.label}
                </span>

                {/* Active indicator */}
                {isActive && (
                  <div className="ml-auto flex items-center gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-samhoud-blue animate-pulse" />
                    <div className="w-1.5 h-1.5 rounded-full bg-samhoud-blue animate-pulse" style={{ animationDelay: "150ms" }} />
                    <div className="w-1.5 h-1.5 rounded-full bg-samhoud-blue animate-pulse" style={{ animationDelay: "300ms" }} />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Current message */}
      <p className="text-center text-samhoud-blue-soft text-sm mb-6">
        {update.message}
      </p>

      {/* Cancel */}
      <div className="text-center">
        <button
          onClick={onCancel}
          className="text-sm text-samhoud-blue-pale hover:text-samhoud-blue-soft transition-colors cursor-pointer"
        >
          Annuleren
        </button>
      </div>
    </div>
  );
}
