type Props = {
  children: React.ReactNode;
};

export default function Section({
  children,
}: Props) {
  return (
    <section className="space-y-6">
      {children}
    </section>
  );
}