"use client";

import { RunProgress } from "@/types/RunProgress";

type Props = {
  playerId: string;
  progress: RunProgress;
};

export function PlayerProgress({ playerId, progress }: Props) {
  const completed = progress.playerProgress[playerId] ?? new Set();

  return (
    <div className="flex items-center gap-1 flex-wrap mt-1">
      {progress.milestones.map((rm) => {
        const milestone = rm.milestone;

        if (!milestone) return null;

        const isCompleted = completed.has(milestone.id);

        const icon =
          milestone.icon_type === "emoji" ? milestone.icon_value : "⬜";

        return (
          <span
            key={milestone.id}
            title={milestone.label}
            className={`
              text-sm
              transition-all duration-200
              ${isCompleted ? "opacity-100" : "opacity-30 grayscale saturate-0"}
            `}
          >
            {icon}
          </span>
        );
      })}
    </div>
  );
}
