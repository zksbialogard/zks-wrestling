"use client";

import ChildCard from "./ChildCard";

export default function ChildrenTable() {
  return (
    <div className="space-y-5">

      <ChildCard
        imie="Oliwier"
        nazwisko="Świerski"
        rok="2021"
        plec="M"
        kategoria="25"

        onEdit={() => {}}
        onDelete={() => {}}
      />

    </div>
  );
}