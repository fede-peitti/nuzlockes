export function PlayerBoxHeader({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex items-center justify-between">
      <h3 className="text-sm font-semibold">Caja del jugador</h3>
      <button className="text-sm" onClick={onClose}>
        ✕
      </button>
    </div>
  );
}
