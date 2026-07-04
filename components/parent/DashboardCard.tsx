import Link from "next/link";

interface Props {
  href: string;
  icon: string;
  title: string;
  description: string;
}

export default function DashboardCard({
  href,
  icon,
  title,
  description,
}: Props) {
  return (
    <Link
      href={href}
      className="
      bg-zinc-900
      border
      border-yellow-500
      rounded-3xl
      p-8
      hover:border-yellow-300
      hover:scale-[1.02]
      transition
      block
      "
    >
      <div className="text-6xl mb-6">
        {icon}
      </div>

      <h2 className="text-3xl font-bold text-yellow-400">
        {title}
      </h2>

      <p className="text-gray-400 mt-3">
        {description}
      </p>
    </Link>
  );
}