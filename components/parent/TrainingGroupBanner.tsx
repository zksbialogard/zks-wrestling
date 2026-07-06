"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, ArrowRight, X } from "lucide-react";
import { collection, getDocs, query, where } from "firebase/firestore";

import { useAuth } from "@/components/auth/AuthProvider";
import { db } from "@/lib/firebase";
import {
  getChildrenMissingGroup,
  type ParentChild,
} from "@/lib/parent-training-summary";

export default function TrainingGroupBanner() {
  const { user, ready, loadingProfile } = useAuth();
  const [missingNames, setMissingNames] = useState<string[]>([]);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!ready || loadingProfile || !user) {
      return;
    }

    const parentUid = user.uid;

    async function load() {
      try {
        const snapshot = await getDocs(
          query(collection(db, "children"), where("parentUid", "==", parentUid))
        );

        const children: ParentChild[] = snapshot.docs.map((item) => ({
          id: item.id,
          imie: item.data().imie as string,
          nazwisko: item.data().nazwisko as string,
          grupaTreningowa: item.data().grupaTreningowa as string | undefined,
        }));

        if (!children.length) {
          setMissingNames([]);
          return;
        }

        setMissingNames(
          getChildrenMissingGroup(children).map(
            (child) => `${child.imie} ${child.nazwisko}`
          )
        );
      } catch {
        setMissingNames([]);
      }
    }

    load();
  }, [ready, loadingProfile, user]);

  if (dismissed || !missingNames.length) {
    return null;
  }

  const namesLabel =
    missingNames.length === 1
      ? missingNames[0]
      : `${missingNames.slice(0, 2).join(", ")}${missingNames.length > 2 ? ` i ${missingNames.length - 2} więcej` : ""}`;

  return (
    <div className="mb-6 rounded-xl border border-amber-500/35 bg-amber-500/10 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" />
          <div>
            <p className="font-semibold text-white">Uzupełnij grupę treningową</p>
            <p className="mt-1 text-sm text-zks-text-muted">
              {missingNames.length === 1 ? "Dziecko" : "Dzieci"} ({namesLabel}) nie{" "}
              {missingNames.length === 1 ? "ma" : "mają"} przypisanej grupy treningowej.
              Bez tego nie otrzymacie powiadomień o treningach ani planu zajęć.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setDismissed(true)}
          className="text-zks-text-muted"
          aria-label="Zamknij"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <Link
        href="/panel-rodzica/moje-dzieci"
        className="zks-btn-primary mt-4 inline-flex min-h-[44px] items-center gap-2 px-4 py-2 text-xs sm:text-sm"
      >
        Przypisz grupę w Moje dzieci
        <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
