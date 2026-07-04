type Props = {
  onClick: () => void;
};

export default function AddChildButton({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="
      bg-yellow-500
      hover:bg-yellow-400
      text-black
      font-bold
      px-6
      py-3
      rounded-xl
      transition
      "
    >
      ➕ Dodaj dziecko
    </button>
  );
}