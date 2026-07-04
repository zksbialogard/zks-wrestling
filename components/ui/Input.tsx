type Props = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function Input({
  value,
  onChange,
  placeholder,
}: Props) {
  return (
    <input
      value={value}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="
      w-full
      bg-zinc-900
      border
      border-zinc-700
      rounded-2xl
      px-5
      py-4
      text-white
      outline-none
      focus:border-yellow-500
      transition
      "
    />
  );
}