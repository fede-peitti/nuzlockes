// Devuelve el primer slot libre (1–6) que no esté en uso, o null si el equipo está lleno.
export function firstFreeSlot(used: number[]) {
  for (let s = 1; s <= 6; s++) if (!used.includes(s)) return s;
  return null;
}
