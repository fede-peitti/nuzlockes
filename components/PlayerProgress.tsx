"use client";

import { RunProgress } from "@/types/RunProgress";

type Props = {
  playerId: string;
  progress: RunProgress;
  size?: number;
};

export function PlayerProgress({ playerId, progress, size = 26 }: Props) {
  const completed = progress.playerProgress[playerId] ?? new Set();

  return (
    <div className="flex items-center gap-1 flex-wrap mt-1">
      {progress.milestones.map((rm) => {
        const milestone = rm.milestone;

        if (!milestone) return null;

        const isCompleted = completed.has(milestone.id);

        return (
          <div
            key={milestone.id}
            title={milestone.label}
            className={`
              flex items-center justify-center
              transition-all duration-200
              ${isCompleted ? "opacity-100" : "opacity-30 grayscale"}
            `}
            style={{ width: size, height: size }}
          >
            {milestone.icon_type === "image" ? (
              <img
                src={`/milestones/${milestone.icon_value}`}
                alt={milestone.label}
                className="w-full h-full object-contain"
              />
            ) : (
              <span className="text-sm">{milestone.icon_value}</span>
            )}
          </div>
        );
      })}
    </div>
  );
}
