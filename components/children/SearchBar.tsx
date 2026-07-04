type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function SearchBar({
  value,
  onChange,
}: Props) {
  return (
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="🔍 Szukaj zawodnika..."
      className="
      w-full
      bg-zinc-900
      border
      border-zinc-700
      rounded-2xl
      px-5
      py-4
      text-white
      focus:outline-none
      focus:border-yellow-500
      transition
      "
    />
  );
}