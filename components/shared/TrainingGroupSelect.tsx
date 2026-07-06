import {
  TRAINING_GROUP_OPTIONS,
  type TrainingGroupId,
} from "@/lib/training-groups";

type Props = {
  value: TrainingGroupId | "";
  onChange: (value: TrainingGroupId) => void;
  required?: boolean;
  className?: string;
};

export default function TrainingGroupSelect({
  value,
  onChange,
  required = true,
  className = "",
}: Props) {
  return (
    <label className={`block space-y-2 ${className}`}>
      <span className="text-xs font-medium uppercase tracking-[0.15em] text-zks-gold-mid">
        Grupa treningowa{required ? " *" : ""}
      </span>
      <select
        value={value}
        required={required}
        onChange={(e) => onChange(e.target.value as TrainingGroupId)}
        className="w-full rounded-lg border border-zks-gold-mid/30 bg-zks-black px-4 py-3.5 text-sm text-white outline-none focus:border-zks-gold-mid"
      >
        <option value="" disabled>
          Wybierz grupę
        </option>
        {TRAINING_GROUP_OPTIONS.map((group) => (
          <option key={group.id} value={group.id}>
            {group.label} ({group.start}–{group.end})
          </option>
        ))}
      </select>
    </label>
  );
}
