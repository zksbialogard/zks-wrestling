"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";

import { useAuth } from "@/components/auth/AuthProvider";
import { db } from "@/lib/firebase";

type Registration = {
  id: string;
  childName: string;
  childSurname: string;
  eventId: string;
  status: string;
  childBirthYear?: string;
  childWeight?: string;
};

export default function MojeZgloszeniaPage() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!user) return;

      setLoading(true);

      try {
        const userSnap = await getDocs(
          query(collection(db, "users"), where("uid", "==", user.uid))
        );

        const phone = userSnap.docs[0]?.data()?.telefon;

        const snapshot = await getDocs(collection(db, "registrations"));
        const all = snapshot.docs.map((item) => ({
          id: item.id,
          ...(item.data() as Omit<Registration, "id">),
        }));

        const mine = all.filter(
          (reg) =>
            (reg as Registration & { parentUid?: string }).parentUid === user.uid ||
            (phone && (reg as Registration & { parentPhone?: string }).parentPhone === phone)
        );

        setRegistrations(mine);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [user]);

  const statusLabel = (status: string) => {
    if (status === "approved" || status === "accepted") return "Zaakceptowane";
    if (status === "rejected") return "Odrzucone";
    return "Oczekujące";
  };

  return (
    <div>
      <h2 className="font-[family-name:var(--font-heading)] text-2xl font-bold uppercase text-white">
        Moje zgłoszenia
      </h2>
      <p className="mt-2 text-sm text-zks-text-muted">
        Status zgłoszeń Twoich dzieci na zawody klubowe.
      </p>

      {loading ? (
        <p className="mt-6 text-zks-text-muted">Ładowanie...</p>
      ) : registrations.length === 0 ? (
        <div className="zks-card mt-6 p-6 text-zks-text-muted">
          Brak zgłoszeń. Przejdź do sekcji Zawody, aby zgłosić dziecko.
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {registrations.map((reg) => (
            <div key={reg.id} className="zks-card p-5">
              <h3 className="text-lg font-bold text-white">
                {reg.childName} {reg.childSurname}
              </h3>
              <p className="mt-2 text-sm text-zks-text-muted">Zawody ID: {reg.eventId}</p>
              <p className="mt-1 text-sm text-zks-gold-bright">{statusLabel(reg.status)}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
