interface Props {
  title: string;
  description: string;
  icon: string;
}

export default function ParentCard({
  title,
  description,
  icon,
}: Props) {
  return (
    <div className="bg-zinc-900 border border-yellow-500 rounded-2xl p-8 hover:border-yellow-300 transition">

      <div className="text-5xl mb-5">
        {icon}
      </div>

      <h2 className="text-2xl font-bold text-yellow-400">
        {title}
      </h2>

      <p className="text-gray-400 mt-3">
        {description}
      </p>

    </div>
  );
}