type Props = {
  icon: string;
  title: string;
  subtitle: string;
  onClick?: () => void;
};

export default function DashboardCard({
  icon,
  title,
  subtitle,
  onClick,
}: Props) {
  return (
    <button
      onClick={onClick}
      className="
      w-full
      text-left
      bg-zinc-900
      rounded-3xl
      border
      border-zinc-700
      hover:border-yellow-500
      hover:-translate-y-1
      transition-all
      p-7
      "
    >
      <div className="text-5xl">{icon}</div>

      <h2 className="text-2xl font-bold text-yellow-400 mt-5">
        {title}
      </h2>

      <p className="text-gray-400 mt-2">
        {subtitle}
      </p>

    </button>
  );
}