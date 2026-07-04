"use client";

import { useState } from "react";

import ChildrenHeader from "@/components/children/ChildrenHeader";
import ChildrenStats from "@/components/children/ChildrenStats";
import AddChildButton from "@/components/children/AddChildButton";
import SearchChildren from "@/components/children/SearchChildren";
import ChildrenTable from "@/components/children/ChildrenTable";

export default function MojeDzieciPage() {

  const [search, setSearch] = useState("");

  const childrenCount = 1;

  return (
    <main className="min-h-screen bg-black text-white">

      <div className="max-w-7xl mx-auto px-8 py-10 space-y-10">

        <ChildrenHeader count={childrenCount} />

        <ChildrenStats active={childrenCount} />

        <div className="flex flex-col lg:flex-row gap-5 lg:items-center lg:justify-between">

          <div className="flex-1">

            <SearchChildren
              value={search}
              onChange={setSearch}
            />

          </div>

          <AddChildButton
            onClick={() => alert("Moduł dodawania dziecka będzie w następnym etapie.")}
          />

        </div>

        <ChildrenTable />

      </div>

    </main>
  );
}