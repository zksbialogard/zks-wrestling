type Props = {
  active: number;
};

export default function ChildrenStats({ active }: Props) {
  return (
    <div className="grid md:grid-cols-3 gap-5">

      <div className="bg-zinc-900 rounded-xl p-6 border border-yellow-500">

        <div className="text-gray-400">
          Aktywni zawodnicy
        </div>

        <div className="text-4xl font-black text-yellow-400 mt-2">
          {active}
        </div>

      </div>

      <div className="bg-zinc-900 rounded-xl p-6 border border-yellow-500">

        <div className="text-gray-400">
          Klub
        </div>

        <div className="text-3xl font-bold">
          ZKS
        </div>

      </div>

      <div className="bg-zinc-900 rounded-xl p-6 border border-yellow-500">

        <div className="text-gray-400">
          Status
        </div>

        <div className="text-green-400 font-bold text-2xl">
          Aktywny
        </div>

      </div>

    </div>
  );
}