import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { User } from "firebase/auth";
import {
  signUpWithEmail,
  signInWithEmail,
  logOut,
  onAuthChange,
} from "../firebase/authService";
import {
  createUserProfile,
  getUserProfile,
  type UserProfile,
} from "../firebase/firestoreService";

// ─── Context Shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthChange(async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const profile = await getUserProfile(firebaseUser.uid);
        setUserProfile(profile);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const signUp = async (email: string, password: string, name: string) => {
    const newUser = await signUpWithEmail(email, password, name);
    const profile: UserProfile = {
      uid: newUser.uid,
      name,
      email,
    };
    await createUserProfile(profile);
    setUserProfile(profile);
  };

  const signIn = async (email: string, password: string) => {
    await signInWithEmail(email, password);
  };

  const handleSignOut = async () => {
    await logOut();
  };

  return (
    <AuthContext.Provider
      value={{ user, userProfile, loading, signUp, signIn, signOut: handleSignOut }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
