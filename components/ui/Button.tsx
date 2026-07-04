type Props = {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "danger";
  className?: string;
  type?: "button" | "submit";
};

export default function Button({
  children,
  onClick,
  variant = "primary",
  className = "",
  type = "button",
}: Props) {
  const styles = {
    primary:
      "bg-yellow-500 hover:bg-yellow-400 text-black",

    secondary:
      "bg-zinc-900 hover:bg-zinc-800 border border-yellow-500 text-yellow-400",

    danger:
      "bg-red-600 hover:bg-red-500 text-white",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      className={`
      px-6
      py-3
      rounded-2xl
      font-bold
      transition-all
      duration-300
      shadow-lg
      ${styles[variant]}
      ${className}
      `}
    >
      {children}
    </button>
  );
}