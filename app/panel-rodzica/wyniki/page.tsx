"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { Trophy } from "lucide-react";

import { useAuth } from "@/components/auth/AuthProvider";
import { db } from "@/lib/firebase";

type Registration = {
  id: string;
  childName: string;
  childSurname: string;
  eventId: string;
  status: string;
};

export default function WynikiPage() {
  const { user } = useAuth();
  const [results, setResults] = useState<Registration[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      const snapshot = await getDocs(collection(db, "registrations"));
      const all = snapshot.docs.map((item) => ({
        id: item.id,
        ...(item.data() as Omit<Registration, "id">),
      }));

      const approved = all.filter(
        (reg) =>
          (reg.status === "approved" || reg.status === "accepted") &&
          ((reg as Registration & { parentUid?: string }).parentUid === user.uid)
      );

      setResults(approved);
    };

    load();
  }, [user]);

  return (
    <div>
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white">
        Wyniki i starty
      </h2>
      <p className="mt-2 text-sm text-zks-text-muted">
        Zaakceptowane starty Twoich dzieci w zawodach klubowych.
      </p>

      {results.length === 0 ? (
        <div className="zks-card mt-6 p-6 text-zks-text-muted">
          Brak zatwierdzonych startów. Po akceptacji zgłoszenia przez klub pojawi się tutaj.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {results.map((item) => (
            <div key={item.id} className="zks-card flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-zks-gold-mid/30 bg-zks-gold/10">
                <Trophy className="h-6 w-6 text-zks-gold-bright" />
              </div>
              <div>
                <h3 className="font-bold text-white">
                  {item.childName} {item.childSurname}
                </h3>
                <p className="text-sm text-zks-text-muted">Start zatwierdzony • {item.eventId}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
