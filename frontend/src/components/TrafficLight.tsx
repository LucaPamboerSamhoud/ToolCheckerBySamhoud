type Status = "green" | "orange" | "red";

const STATUS_CONFIG = {
  green: {
    color: "bg-status-green",
    glow: "shadow-[0_0_30px_rgba(46,125,50,0.4)]",
    label: "Veilig te gebruiken",
    icon: "✓",
  },
  orange: {
    color: "bg-status-orange",
    glow: "shadow-[0_0_30px_rgba(245,124,0,0.4)]",
    label: "Nader onderzoek nodig",
    icon: "!",
  },
  red: {
    color: "bg-status-red",
    glow: "shadow-[0_0_30px_rgba(198,40,40,0.4)]",
    label: "Niet gebruiken zonder waarborgen",
    icon: "✕",
  },
};

export default function TrafficLight({
  status,
  size = "large",
}: {
  status: Status;
  size?: "small" | "large";
}) {
  const config = STATUS_CONFIG[status];
  const isLarge = size === "large";

  return (
    <div className="flex items-center gap-3">
      <div
        className={`
          ${config.color} ${config.glow}
          ${isLarge ? "w-16 h-16 text-2xl" : "w-8 h-8 text-sm"}
          rounded-full flex items-center justify-center text-white font-bold
          transition-all duration-500
        `}
      >
        {config.icon}
      </div>
      {isLarge && (
        <span className="text-lg font-semibold text-gray-700">
          {config.label}
        </span>
      )}
    </div>
  );
}
