import { cn } from "@/lib/utils";

type AuthFieldProps = React.ComponentProps<"input"> & {
  label: string;
};

export default function AuthField({
  label,
  className,
  id,
  ...props
}: AuthFieldProps) {
  const fieldId = id ?? props.name;

  return (
    <label className="block space-y-2">
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
        {label}
      </span>
      <input
        id={fieldId}
        className={cn(
          "w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3.5 text-sm text-white outline-none transition placeholder:text-zks-text-muted focus:border-zks-gold-mid focus:shadow-gold-glow-sm",
          className
        )}
        {...props}
      />
    </label>
  );
}
