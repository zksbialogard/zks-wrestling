interface Props {
  value: string;
  onChange: (value: string) => void;
}

export default function SearchChildren({
  value,
  onChange,
}: Props) {
  return (
    <input
      type="text"
      placeholder="Szukaj dziecka..."
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full bg-zinc-900 border border-yellow-500 rounded-xl p-4 mb-6"
    />
  );
}