"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  browserLocalPersistence,
  onAuthStateChanged,
  setPersistence,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  onSnapshot,
  query,
  where,
  type QuerySnapshot,
  type DocumentData,
} from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import { getPanelHref } from "@/lib/panel-routes";
import type { TrainingGroupId } from "@/lib/training-groups";

export type UserProfile = {
  id: string;
  uid: string;
  imie?: string;
  nazwisko?: string;
  email?: string;
  telefon?: string;
  rola?: string;
  grupaTreningowa?: TrainingGroupId;
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  ready: boolean;
  loadingProfile: boolean;
  panelHref: string;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function mapProfileSnapshot(snapshot: QuerySnapshot<DocumentData>): UserProfile | null {
  if (snapshot.empty) {
    return null;
  }

  const docSnap = snapshot.docs[0];

  return {
    id: docSnap.id,
    ...(docSnap.data() as Omit<UserProfile, "id">),
  };
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  useEffect(() => {
    let active = true;

    void setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (!active) return;

      setUser(firebaseUser);

      if (!firebaseUser) {
        setProfile(null);
        setLoadingProfile(false);
        setReady(true);
      } else {
        setLoadingProfile(true);
      }
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      return;
    }

    setLoadingProfile(true);

    const profileQuery = query(collection(db, "users"), where("uid", "==", user.uid));

    const unsubscribe = onSnapshot(
      profileQuery,
      (snapshot) => {
        setProfile(mapProfileSnapshot(snapshot));
        setLoadingProfile(false);
        setReady(true);
      },
      (error) => {
        console.error(error);
        setProfile(null);
        setLoadingProfile(false);
        setReady(true);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    // Profil odświeża się na żywo przez onSnapshot — zostawione dla kompatybilności.
  }, []);

  const panelHref = getPanelHref(profile?.rola);

  const value = useMemo(
    () => ({
      user,
      profile,
      ready,
      loadingProfile,
      panelHref,
      logout,
      refreshProfile,
    }),
    [user, profile, ready, loadingProfile, panelHref, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }

  return context;
}
