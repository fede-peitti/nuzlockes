"use client";

import { useState, useEffect } from "react";
import { TeamRow } from "@/types/TeamRow";
import { ActiveSlotEmpty } from "@/components/active-slot/ActiveSlotEmpty";
import { ActiveSlotSprite } from "@/components/active-slot/ActiveSlotSprite";
import { ActiveSlotKillButton } from "@/components/active-slot/ActiveSlotKillButton";

type Props = {
  poke: TeamRow | null;
  onKill?: (pokemonId: string) => Promise<void> | void;
};

export function ActiveSlot({ poke, onKill }: Props) {
  const [showActions, setShowActions] = useState(false);
  const [isFainting, setIsFainting] = useState(false);

  useEffect(() => {
    setShowActions(false);
    setIsFainting(false);
  }, [poke?.id]);

  function handleSlotClick() {
    if (!poke || isFainting) return;
    setShowActions((v) => !v);
  }

  async function handleKill(e: React.MouseEvent) {
    e.stopPropagation();

    if (!poke) return;

    setIsFainting(true);
    setShowActions(false);

    setTimeout(async () => {
      await onKill?.(poke.id);
    }, 450);
  }

  return (
    <div
      onClick={handleSlotClick}
      className="
        relative
        w-16 h-16
        flex items-center justify-center
        rounded-lg
        border
        bg-gradient-to-b from-zinc-50 to-zinc-100
        shadow-sm
        cursor-pointer
      "
    >
      {!poke && <ActiveSlotEmpty />}

      {poke && (
        <>
          <ActiveSlotKillButton
            visible={showActions && !isFainting}
            onClick={handleKill}
          />

          <ActiveSlotSprite poke={poke} fainting={isFainting} />
        </>
      )}
    </div>
  );
}
