"use client";

import ChildCard from "./ChildCard";

export default function ChildrenTable() {
  return (
    <div className="space-y-5">
      <ChildCard
        child={{
          imie: "Oliwier",
          nazwisko: "Świerski",
          rokUrodzenia: "2021",
          plec: "M",
          kategoriaWagowa: "25",
        }}
        onEdit={() => {}}
        onDelete={() => {}}
      />
    </div>
  );
}
