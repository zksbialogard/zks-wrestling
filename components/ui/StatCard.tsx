type Props = {
  title: string;
  value: string | number;
};

export default function StatCard({
  title,
  value,
}: Props) {
  return (
    <div
      className="
      bg-zinc-900
      rounded-3xl
      border
      border-zinc-700
      p-6
      "
    >
      <div className="text-gray-400">
        {title}
      </div>

      <div className="text-4xl font-black text-yellow-400 mt-3">
        {value}
      </div>
    </div>
  );
}