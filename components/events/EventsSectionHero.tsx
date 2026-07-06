type Props = {
  label?: string;
  title: string;
  titleAccent?: string;
  description: string;
};

export default function EventsSectionHero({
  label = "Kalendarz startów",
  title,
  titleAccent,
  description,
}: Props) {
  return (
    <header className="mb-12 text-center sm:mb-16">
      <p className="zks-label">{label}</p>
      <h1 className="mt-4 font-[family-name:var(--font-heading)] text-4xl font-bold uppercase text-white sm:text-5xl lg:text-6xl">
        {title}
        {titleAccent ? (
          <span className="text-gradient-gold"> {titleAccent}</span>
        ) : null}
      </h1>
      <p className="mx-auto mt-5 max-w-2xl text-base text-zks-text-muted sm:text-lg">
        {description}
      </p>
    </header>
  );
}
