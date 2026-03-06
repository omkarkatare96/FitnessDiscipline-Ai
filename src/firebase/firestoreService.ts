import {
  collection,
  doc,
  setDoc,
  getDoc,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  type Timestamp,
} from "firebase/firestore";
import { db } from "./config";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  age?: number;
  weight?: number;
  height?: number;
  goal?: string;
  createdAt?: Timestamp;
}

export interface WorkoutEntry {
  id?: string;
  userId: string;
  exercise: string;
  sets: string;
  muscleGroup: string;
  level: string;
  calories: number;
  completed: boolean;
  createdAt?: Timestamp;
}

export interface MealEntry {
  id?: string;
  userId: string;
  mealId: number;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  goal: string;
  savedAt?: Timestamp;
}

export interface ReadinessEntry {
  id?: string;
  userId: string;
  sleep: number;
  fatigue: number;
  mood: number;
  score: number;
  intensity: string;
  createdAt?: Timestamp;
}

export interface MoodWorkoutEntry {
  id?: string;
  userId: string;
  mood: string;
  suggestedWorkout: string;
  createdAt?: Timestamp;
}

export interface AIChatEntry {
  id?: string;
  userId: string;
  userMessage: string;
  aiResponse: string;
  createdAt?: Timestamp;
}

// ─── User Profile ─────────────────────────────────────────────────────────────

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const ref = doc(db, "users", profile.uid);
  await setDoc(ref, {
    ...profile,
    createdAt: serverTimestamp(),
  });
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
  const ref = doc(db, "users", uid);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return snap.data() as UserProfile;
}

// ─── Workouts ─────────────────────────────────────────────────────────────────

export async function addWorkout(
  entry: Omit<WorkoutEntry, "id" | "createdAt">
): Promise<string> {
  const ref = collection(db, "workouts");
  const docRef = await addDoc(ref, {
    ...entry,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserWorkouts(userId: string): Promise<WorkoutEntry[]> {
  const ref = collection(db, "workouts");
  const q = query(
    ref,
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as WorkoutEntry));
}

export async function updateWorkoutStatus(
  docId: string,
  completed: boolean
): Promise<void> {
  const ref = doc(db, "workouts", docId);
  await updateDoc(ref, { completed });
}

// ─── Meals ────────────────────────────────────────────────────────────────────

export async function saveMealRecommendation(
  entry: Omit<MealEntry, "id" | "savedAt">
): Promise<string> {
  const ref = collection(db, "meals");
  const docRef = await addDoc(ref, {
    ...entry,
    savedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserMeals(userId: string): Promise<MealEntry[]> {
  const ref = collection(db, "meals");
  const q = query(ref, where("userId", "==", userId), orderBy("savedAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as MealEntry));
}

// ─── Readiness Checks ─────────────────────────────────────────────────────────

export async function saveReadinessCheck(
  entry: Omit<ReadinessEntry, "id" | "createdAt">
): Promise<string> {
  const ref = collection(db, "readiness_checks");
  const docRef = await addDoc(ref, {
    ...entry,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ─── Mood Workouts ────────────────────────────────────────────────────────────

export async function saveMoodWorkout(
  entry: Omit<MoodWorkoutEntry, "id" | "createdAt">
): Promise<string> {
  const ref = collection(db, "mood_workouts");
  const docRef = await addDoc(ref, {
    ...entry,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

// ─── AI Coach Chat ────────────────────────────────────────────────────────────

export async function saveAIChat(
  entry: Omit<AIChatEntry, "id" | "createdAt">
): Promise<string> {
  const ref = collection(db, "ai_coach_chat");
  const docRef = await addDoc(ref, {
    ...entry,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserAIChats(userId: string): Promise<AIChatEntry[]> {
  const ref = collection(db, "ai_coach_chat");
  const q = query(
    ref,
    where("userId", "==", userId),
    orderBy("createdAt", "asc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as AIChatEntry));
}

// ─── Rescheduled Workouts ─────────────────────────────────────────────────────

export interface RescheduledWorkoutEntry {
  id?: string;
  userId: string;
  missedDay: string;
  missedWorkout: string;
  mergedIntoDay: string;
  mergedExercises: string[];
  removedExercises: string[];
  estimatedDuration: number; // minutes
  notes: string;
  createdAt?: Timestamp;
}

export async function saveRescheduledWorkout(
  entry: Omit<RescheduledWorkoutEntry, "id" | "createdAt">
): Promise<string> {
  const ref = collection(db, "rescheduled_workouts");
  const docRef = await addDoc(ref, {
    ...entry,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getUserRescheduledWorkouts(userId: string): Promise<RescheduledWorkoutEntry[]> {
  const ref = collection(db, "rescheduled_workouts");
  const q = query(ref, where("userId", "==", userId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as RescheduledWorkoutEntry));
}

