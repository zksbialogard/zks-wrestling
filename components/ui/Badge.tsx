type Props = {
  children: React.ReactNode;
};

export default function Badge({
  children,
}: Props) {
  return (
    <span
      className="
      px-3
      py-1
      rounded-full
      bg-yellow-500
      text-black
      font-bold
      text-sm
      "
    >
      {children}
    </span>
  );
}