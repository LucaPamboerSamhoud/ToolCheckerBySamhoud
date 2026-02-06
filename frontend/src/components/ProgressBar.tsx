import type { ProgressUpdate } from "../api/client";

export default function ProgressBar({ update }: { update: ProgressUpdate }) {
  const percentage = Math.round(update.progress * 100);

  return (
    <div className="w-full max-w-lg mx-auto">
      {/* Animatie */}
      <div className="flex justify-center mb-8">
        <div className="relative">
          <div className="w-24 h-24 rounded-full border-4 border-samhoud-blue/20 animate-pulse" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-samhoud-blue/10 animate-ping" />
          </div>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-samhoud-blue font-bold text-lg">
              {percentage}%
            </span>
          </div>
        </div>
      </div>

      {/* Voortgangsbalk */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-samhoud-blue h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Status bericht */}
      <p className="text-center text-gray-600 animate-pulse">
        {update.message}
      </p>
    </div>
  );
}
