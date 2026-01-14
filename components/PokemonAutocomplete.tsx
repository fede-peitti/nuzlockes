"use client";

import { useState, useRef, useEffect } from "react";
import { usePokemonAutocomplete } from "@/hooks/usePokemonAutocomplete";
import { PokemonSpecies } from "@/types/PokemonSpecies";

export function PokemonAutocomplete({
  onSelect,
}: {
  onSelect: (p: PokemonSpecies) => void;
}) {
  const [query, setQuery] = useState("");
  const { results } = usePokemonAutocomplete(query);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const showResults = query.length > 0 && results.length > 0;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setQuery("");
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <input
          className="w-full border px-3 py-2 rounded"
          placeholder="Buscar Pokémon..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => {
            if (!showResults) return;

            if (e.key === "ArrowDown") {
              e.preventDefault();
              setActiveIndex((i) => Math.min(i + 1, results.length - 1));
            }

            if (e.key === "ArrowUp") {
              e.preventDefault();
              setActiveIndex((i) => Math.max(i - 1, 0));
            }

            if (e.key === "Enter") {
              e.preventDefault();
              const selected = results[activeIndex];
              if (selected) {
                onSelect(selected);
                setQuery("");
              }
            }

            if (e.key === "Escape") {
              setQuery("");
            }
          }}
        />

        {showResults && (
          <div
            style={{
              position: "absolute",
              top: "100%",
              left: 0,
              right: 0,
              backgroundColor: "white",
              zIndex: 9999,
              border: "1px solid #e5e7eb",
              borderRadius: 6,
              marginTop: 4,
              maxHeight: 160,
              overflowY: "auto",
            }}
          >
            {results.map((p, i) => (
              <div
                key={p.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  height: 40,
                  cursor: "pointer",
                  backgroundColor: i === activeIndex ? "#e5e7eb" : "white",
                }}
                onMouseEnter={() => setActiveIndex(i)}
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "white")
                }
                onClick={() => {
                  onSelect(p);
                  setQuery("");
                }}
              >
                <img
                  src={p.sprite_url}
                  style={{ width: 32, height: 32, imageRendering: "pixelated" }}
                />
                <span style={{ textTransform: "capitalize", fontSize: 14 }}>
                  {p.name}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
