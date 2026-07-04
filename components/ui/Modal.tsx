type Props = {
  children: React.ReactNode;
};

export default function Modal({
  children,
}: Props) {
  return (
    <div
      className="
      fixed
      inset-0
      bg-black/70
      flex
      items-center
      justify-center
      z-50
      "
    >
      <div
        className="
        bg-zinc-900
        rounded-3xl
        w-full
        max-w-xl
        p-8
        "
      >
        {children}
      </div>
    </div>
  );
}