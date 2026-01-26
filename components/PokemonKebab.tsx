"use client";

import React from "react";

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onDelete: () => void;
};

export function PokemonKebab({ open, onOpen, onClose, onDelete }: Props) {
  return (
    <div className="absolute top-1 right-1 z-50">
      {/* botón */}
      <button
        type="button"
        className="bg-white border rounded px-1 shadow"
        onClick={(e) => {
          e.stopPropagation();
          open ? onClose() : onOpen();
        }}
      >
        ⋮
      </button>

      {/* menú */}
      {open && (
        <div
          className="
            absolute top-6 right-0
            w-32
            bg-white
            border
            rounded
            shadow
            text-xs
          "
          onClick={(e) => e.stopPropagation()}
        >
          <button
            className="block w-full px-3 py-2 text-left text-red-600 hover:bg-red-50"
            onClick={() => {
              onDelete();
              onClose();
            }}
          >
            🗑 Eliminar
          </button>
        </div>
      )}
    </div>
  );
}
