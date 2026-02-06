type Status = "green" | "orange" | "red";

const CONFIG = {
  green: {
    bg: "bg-status-green",
    bgLight: "bg-status-green-bg",
    border: "border-status-green-border",
    text: "text-status-green",
    glow: "glow-green",
    label: "Veilig te gebruiken",
    shortLabel: "Veilig",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  orange: {
    bg: "bg-status-orange",
    bgLight: "bg-status-orange-bg",
    border: "border-status-orange-border",
    text: "text-status-orange",
    glow: "glow-orange",
    label: "Nader onderzoek nodig",
    shortLabel: "Onderzoek nodig",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <line x1="12" y1="9" x2="12" y2="13" />
        <circle cx="12" cy="17" r="0.5" fill="currentColor" />
      </svg>
    ),
  },
  red: {
    bg: "bg-status-red",
    bgLight: "bg-status-red-bg",
    border: "border-status-red-border",
    text: "text-status-red",
    glow: "glow-red",
    label: "Niet gebruiken zonder waarborgen",
    shortLabel: "Risico",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </svg>
    ),
  },
};

export default function StatusBadge({
  status,
  size = "md",
  showLabel = false,
  animated = false,
}: {
  status: Status;
  size?: "sm" | "md" | "lg" | "xl";
  showLabel?: boolean;
  animated?: boolean;
}) {
  const c = CONFIG[status];

  const sizeClasses = {
    sm: "w-6 h-6 p-1",
    md: "w-10 h-10 p-2",
    lg: "w-16 h-16 p-3.5",
    xl: "w-24 h-24 p-5",
  };

  return (
    <div className="flex items-center gap-3">
      <div className="relative">
        {/* Glow ring */}
        {(size === "lg" || size === "xl") && (
          <div
            className={`absolute inset-0 rounded-full ${c.bg} opacity-20 ${animated ? "animate-pulse-ring" : ""}`}
            style={{ margin: "-6px" }}
          />
        )}
        {/* Main circle */}
        <div
          className={`
            ${sizeClasses[size]} ${c.bg} ${size === "xl" ? c.glow : ""}
            rounded-full flex items-center justify-center text-white
            ${animated ? "animate-check-in" : ""}
          `}
        >
          {c.icon}
        </div>
      </div>
      {showLabel && (
        <div>
          <span className={`font-semibold ${c.text} ${size === "xl" || size === "lg" ? "text-xl" : "text-sm"}`}>
            {size === "sm" ? c.shortLabel : c.label}
          </span>
        </div>
      )}
    </div>
  );
}

export function StatusPill({ status }: { status: Status }) {
  const c = CONFIG[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.bgLight} ${c.text} border ${c.border}`}>
      <span className={`w-2 h-2 rounded-full ${c.bg}`} />
      {c.shortLabel}
    </span>
  );
}
