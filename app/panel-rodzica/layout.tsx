import ParentHeader from "@/components/parent/ParentHeader";

export default function ParentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <main className="min-h-screen bg-black text-white">

      <ParentHeader />

      <section className="max-w-7xl mx-auto px-6 py-8">
        {children}
      </section>

    </main>
  );
}