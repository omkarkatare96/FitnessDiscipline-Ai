import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  onAuthStateChanged,
  type User,
  type NextOrObserver,
} from "firebase/auth";
import { auth } from "./config";

/** Sign up a new user and set their display name */
export async function signUpWithEmail(
  email: string,
  password: string,
  name: string
): Promise<User> {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });
  return credential.user;
}

/** Sign in an existing user */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return credential.user;
}

/** Sign out the current user */
export async function logOut(): Promise<void> {
  await signOut(auth);
}

/** Subscribe to auth state changes (returns the unsubscribe function) */
export function onAuthChange(callback: NextOrObserver<User | null>): () => void {
  return onAuthStateChanged(auth, callback);
}
