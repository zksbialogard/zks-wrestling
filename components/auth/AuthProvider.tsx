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
import { collection, getDocs, query, where } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";

export type UserProfile = {
  id: string;
  uid: string;
  imie?: string;
  nazwisko?: string;
  email?: string;
  telefon?: string;
  rola?: string;
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

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [ready, setReady] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);

  const loadProfile = useCallback(async (uid: string) => {
    setLoadingProfile(true);

    try {
      const snapshot = await getDocs(
        query(collection(db, "users"), where("uid", "==", uid))
      );

      if (snapshot.empty) {
        setProfile(null);
        return;
      }

      const docSnap = snapshot.docs[0];
      setProfile({
        id: docSnap.id,
        ...(docSnap.data() as Omit<UserProfile, "id">),
      });
    } catch (error) {
      console.error(error);
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    void setPersistence(auth, browserLocalPersistence).catch(console.error);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (!active) return;

      setUser(firebaseUser);

      if (firebaseUser) {
        await loadProfile(firebaseUser.uid);
      } else {
        setProfile(null);
      }

      setReady(true);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [loadProfile]);

  const logout = useCallback(async () => {
    await signOut(auth);
    setProfile(null);
    setUser(null);
  }, []);

  const refreshProfile = useCallback(async () => {
    if (!auth.currentUser) return;
    await loadProfile(auth.currentUser.uid);
  }, [loadProfile]);

  const panelHref =
    profile?.rola === "admin" ? "/admin" : "/panel-rodzica";

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
