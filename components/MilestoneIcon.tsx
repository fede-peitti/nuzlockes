"use client";

import { Milestone } from "@/types/RunProgress";

export function MilestoneIcon({
  milestone,
  obtained,
  size = 28,
}: {
  milestone: Milestone;
  obtained: boolean;
  size?: number;
}) {
  const src =
    milestone.icon_type === "image"
      ? `/milestones/${milestone.icon_value}`
      : null;

  return (
    <div
      title={milestone.label}
      className={`
        flex items-center justify-center
        transition
        ${obtained ? "" : "opacity-30 grayscale"}
      `}
      style={{ width: size, height: size }}
    >
      {src ? (
        <img
          src={src}
          alt={milestone.label}
          className="w-full h-full object-contain"
        />
      ) : (
        <span className="text-lg">{milestone.icon_value}</span>
      )}
    </div>
  );
}
