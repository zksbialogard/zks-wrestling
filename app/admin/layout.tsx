"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";

import { auth, db } from "@/lib/firebase";

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(
      auth,
      async (user) => {
        if (!user) {
          router.push("/login");
          return;
        }

        try {
          const q = query(
            collection(db, "users"),
            where("uid", "==", user.uid)
          );

          const snapshot = await getDocs(q);

          if (snapshot.empty) {
            router.push("/");
            return;
          }

          const userData =
            snapshot.docs[0].data();

          if (userData.rola !== "admin") {
            router.push("/");
            return;
          }

          setLoading(false);
        } catch (error) {
          console.error(error);
          router.push("/");
        }
      }
    );

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        Sprawdzanie uprawnień...
      </div>
    );
  }

  return <>{children}</>;
}