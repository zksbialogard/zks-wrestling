type Props = {
  children: React.ReactNode;
};

export default function SubTitle({
  children,
}: Props) {
  return (
    <p className="text-zinc-400 mt-2">
      {children}
    </p>
  );
}