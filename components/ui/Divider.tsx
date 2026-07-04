type Props = {
  children: React.ReactNode;
};

export default function Title({
  children,
}: Props) {
  return (
    <h2 className="text-3xl font-bold text-white">
      {children}
    </h2>
  );
}