type Props = {
  title: string;
  subtitle: string;
};

export default function EmptyState({
  title,
  subtitle,
}: Props) {
  return (
    <div className="text-center py-20">

      <div className="text-7xl mb-6">
        📂
      </div>

      <h2 className="text-3xl font-bold text-yellow-400">
        {title}
      </h2>

      <p className="text-gray-400 mt-3">
        {subtitle}
      </p>

    </div>
  );
}