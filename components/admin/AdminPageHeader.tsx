type AdminPageHeaderProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
};

export default function AdminPageHeader({
  title,
  description,
  action,
}: AdminPageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
      <div>
        <h1 className="font-[family-name:var(--font-heading)] text-3xl font-bold uppercase text-white sm:text-4xl">
          {title}
        </h1>
        {description && (
          <p className="mt-2 text-sm text-zks-text-muted sm:text-base">
            {description}
          </p>
        )}
      </div>
      {action}
    </div>
  );
}
