type Props = {
  count: number;
};

export default function ChildrenHeader({ count }: Props) {
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">

      <div>
        <h1 className="text-5xl font-black text-yellow-400">
          👦 Moje dzieci
        </h1>

        <p className="text-gray-400 mt-2">
          Zarządzaj zawodnikami przypisanymi do swojego konta.
        </p>
      </div>

      <div className="bg-zinc-900 border border-yellow-500 rounded-2xl px-8 py-5">

        <div className="text-sm text-gray-400">
          Liczba zawodników
        </div>

        <div className="text-4xl font-bold text-yellow-400">
          {count}
        </div>

      </div>

    </div>
  );
}