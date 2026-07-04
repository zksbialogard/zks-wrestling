type Props = {
  child: any;
  onEdit: () => void;
  onDelete: () => void;
};

export default function ChildCard({
  child,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div
      className="
      bg-zinc-900
      rounded-3xl
      border
      border-zinc-700
      hover:border-yellow-500
      transition
      p-6
      "
    >
      <div className="flex justify-between items-start">

        <div>

          <h2 className="text-2xl font-bold text-yellow-400">
            👦 {child.imie} {child.nazwisko}
          </h2>

          <div className="mt-5 space-y-2 text-gray-300">

            <p>📅 {child.rokUrodzenia}</p>

            <p>⚖️ {child.kategoriaWagowa} kg</p>

            <p>🚹 {child.plec}</p>

          </div>

        </div>

        <div className="flex flex-col gap-2">

          <button
            onClick={onEdit}
            className="bg-yellow-500 text-black rounded-xl px-4 py-2"
          >
            Edytuj
          </button>

          <button
            onClick={onDelete}
            className="bg-red-600 rounded-xl px-4 py-2"
          >
            Usuń
          </button>

        </div>

      </div>

    </div>
  );
}