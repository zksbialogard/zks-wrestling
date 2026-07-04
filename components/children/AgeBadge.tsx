type Props = {
  year: number;
};

export default function AgeBadge({ year }: Props) {

  const age = new Date().getFullYear() - year;

  return (
    <span
      className="
      bg-yellow-500
      text-black
      px-3
      py-1
      rounded-full
      text-sm
      font-bold
      "
    >
      {age} lat
    </span>
  );
}