import ChildCard from "./ChildCard";

type Child = {
  id: string;
  imie: string;
  nazwisko: string;
  rokUrodzenia: string;
  plec: string;
  kategoriaWagowa: string;
};

type Props = {
  childrenList: Child[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
};

export default function ChildrenGrid({
  childrenList,
  onEdit,
  onDelete,
}: Props) {
  return (
    <div className="grid lg:grid-cols-2 gap-6">
      {childrenList.map((child) => (
        <ChildCard
          key={child.id}
          child={child}
          onEdit={() => onEdit(child.id)}
          onDelete={() => onDelete(child.id)}
        />
      ))}
    </div>
  );
}