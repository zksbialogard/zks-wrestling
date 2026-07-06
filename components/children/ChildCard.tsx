import { getTrainingGroupLabel } from "@/lib/training-groups";

type Props = {
  child: {
    imie: string;
    nazwisko: string;
    rokUrodzenia: string;
    plec: string;
    kategoriaWagowa: string;
    grupaTreningowa?: string;
  };
  onEdit: () => void;
  onDelete: () => void;
};

export default function ChildCard({ child, onEdit, onDelete }: Props) {
  return (
    <div className="zks-card zks-card-pad">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
        <div>
          <h2 className="text-xl font-bold text-zks-gold-bright">
            {child.imie} {child.nazwisko}
          </h2>

          <div className="mt-4 space-y-1 text-sm text-zks-text">
            <p>Rocznik: {child.rokUrodzenia}</p>
            <p>Kategoria wagowa: {child.kategoriaWagowa} kg</p>
            <p>Płeć: {child.plec}</p>
            {child.grupaTreningowa && (
              <p>Grupa: {getTrainingGroupLabel(child.grupaTreningowa)}</p>
            )}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={onEdit}
            className="zks-btn-outline px-4 py-2 text-xs"
          >
            Edytuj
          </button>

          <button
            type="button"
            onClick={onDelete}
            className="rounded-lg border border-red-500/40 px-4 py-2 text-xs text-red-400 transition hover:bg-red-500/10"
          >
            Usuń
          </button>
        </div>
      </div>
    </div>
  );
}
