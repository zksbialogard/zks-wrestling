type Props = {
  title: string;
  subtitle?: string;
};

export default function PageTitle({
  title,
  subtitle,
}: Props) {
  return (
    <div>

      <h1 className="text-5xl font-black text-yellow-400">
        {title}
      </h1>

      {subtitle && (
        <p className="text-gray-400 mt-2">
          {subtitle}
        </p>
      )}

    </div>
  );
}