type Props = {
  onAdd: () => void;
};

export default function ChildrenToolbar({
  onAdd,
}: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

      <div>

        <h1 className="text-5xl font-black text-yellow-400">
          👦 Moje dzieci
        </h1>

        <p className="text-zinc-400 mt-2">
          Zarządzaj zawodnikami przypisanymi do swojego konta.
        </p>

      </div>

      <button
        onClick={onAdd}
        className="
        bg-yellow-500
        text-black
        rounded-2xl
        px-8
        py-4
        font-bold
        hover:scale-105
        transition
        "
      >
        + Dodaj dziecko
      </button>

    </div>
  );
}