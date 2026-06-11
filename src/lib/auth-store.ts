import { create } from "zustand";
import { persist } from "zustand/middleware";
import { firebaseEnabled, getFirebase } from "./firebase";
import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
  onAuthStateChanged,
  type User as FbUser,
} from "firebase/auth";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "google" | "github" | "email" | "demo";
  plan: "free" | "pro" | "enterprise";
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  hydrated: boolean;
  signInDemo: (name?: string) => void;
  signInEmail: (email: string, password: string) => Promise<void>;
  signUpEmail: (name: string, email: string, password: string) => Promise<void>;
  signInGoogle: () => Promise<void>;
  signInGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  setHydrated: () => void;
};

function fromFb(u: FbUser, provider: AuthUser["provider"]): AuthUser {
  return {
    id: u.uid,
    name: u.displayName ?? u.email?.split("@")[0] ?? "User",
    email: u.email ?? "",
    avatar: u.photoURL ?? undefined,
    provider,
    plan: "free",
  };
}

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      loading: false,
      hydrated: false,
      setHydrated: () => set({ hydrated: true }),
      signInDemo: (name = "Demo User") =>
        set({
          user: {
            id: "demo-" + Math.random().toString(36).slice(2, 9),
            name,
            email: "demo@threeminds.ai",
            provider: "demo",
            plan: "pro",
          },
        }),
      signInEmail: async (email, password) => {
        set({ loading: true });
        try {
          if (firebaseEnabled) {
            const { auth } = getFirebase();
            const cred = await signInWithEmailAndPassword(auth!, email, password);
            set({ user: fromFb(cred.user, "email") });
          } else {
            set({
              user: {
                id: "local-" + email,
                name: email.split("@")[0],
                email,
                provider: "email",
                plan: "free",
              },
            });
          }
        } finally {
          set({ loading: false });
        }
      },
      signUpEmail: async (name, email, password) => {
        set({ loading: true });
        try {
          if (firebaseEnabled) {
            const { auth } = getFirebase();
            const cred = await createUserWithEmailAndPassword(auth!, email, password);
            set({ user: { ...fromFb(cred.user, "email"), name } });
          } else {
            set({
              user: {
                id: "local-" + email,
                name,
                email,
                provider: "email",
                plan: "free",
              },
            });
          }
        } finally {
          set({ loading: false });
        }
      },
      signInGoogle: async () => {
        if (!firebaseEnabled) {
          set({
            user: {
              id: "google-demo",
              name: "Google User",
              email: "user@gmail.com",
              provider: "google",
              plan: "pro",
            },
          });
          return;
        }
        const { auth } = getFirebase();
        const cred = await signInWithPopup(auth!, new GoogleAuthProvider());
        set({ user: fromFb(cred.user, "google") });
      },
      signInGithub: async () => {
        if (!firebaseEnabled) {
          set({
            user: {
              id: "github-demo",
              name: "GitHub User",
              email: "user@github.com",
              provider: "github",
              plan: "pro",
            },
          });
          return;
        }
        const { auth } = getFirebase();
        const cred = await signInWithPopup(auth!, new GithubAuthProvider());
        set({ user: fromFb(cred.user, "github") });
      },
      signOut: async () => {
        if (firebaseEnabled) {
          const { auth } = getFirebase();
          if (auth) await fbSignOut(auth);
        }
        set({ user: null });
      },
    }),
    {
      name: "threeminds-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHydrated();
      },
    },
  ),
);

// Listen to firebase auth state if enabled
if (typeof window !== "undefined" && firebaseEnabled) {
  const { auth } = getFirebase();
  if (auth) {
    onAuthStateChanged(auth, (u) => {
      if (u) useAuth.setState({ user: fromFb(u, "email") });
    });
  }
}
