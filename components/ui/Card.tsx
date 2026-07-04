type Props = {
  children: React.ReactNode;
  className?: string;
};

export default function Card({
  children,
  className = "",
}: Props) {
  return (
    <div
      className={`
      bg-zinc-900
      border
      border-zinc-700
      rounded-3xl
      p-6
      shadow-xl
      transition
      hover:border-yellow-500
      ${className}
      `}
    >
      {children}
    </div>
  );
}