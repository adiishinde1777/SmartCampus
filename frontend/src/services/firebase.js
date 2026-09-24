import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp
} from "firebase/firestore";

// Live Firebase Project Configuration for smart-campus-erp-system
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyB3C9n1Ynrqcq7GKSKNZtAwph9vHJ5oRB0",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smart-campus-erp-system.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smart-campus-erp-system",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smart-campus-erp-system.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "533568998200",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:533568998200:web:de192fce9307a1c27a4fcd",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-7T3BL0PV86"
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Initialize Firebase Firestore Cloud Database
export const db = getFirestore(app);

// Safe Analytics Initialization for browser environments
export let analytics = null;
if (typeof window !== "undefined") {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
      console.log("[Firebase Analytics] Active and connected.");
    }
  }).catch(() => {});
}

// Check if live credentials have been added
export const isFirebaseConfigured = () => {
  return Boolean(firebaseConfig.apiKey && firebaseConfig.apiKey.startsWith("AIzaSyB"));
};

/**
 * Deep sanitization to strip `undefined` values which Firestore forbids
 */
export const sanitizeForFirestore = (obj) => {
  if (obj === null || typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(sanitizeForFirestore).filter((item) => item !== undefined);

  const clean = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      clean[key] = typeof value === "object" && value !== null ? sanitizeForFirestore(value) : value;
    }
  }
  return clean;
};

// =========================================================================
// FIRESTORE USER STORAGE & BACKEND DATA SYNCHRONIZATION
// =========================================================================

export const FIRESTORE_COLLECTIONS = {
  USERS: "users",
  ATTENDANCE_LOGS: "attendance_logs",
  NOTICES: "notices",
  STUDENT_SKILLS: "student_skills",
  COLLEGE_EVENTS: "college_events",
  COMPLAINTS: "complaints",
  LEAVES: "leaves",
  MARKS: "marks",
  ASSIGNMENTS: "assignments",
  STUDY_MATERIALS: "study_materials",
  SMS_LOGS: "sms_logs"
};

/**
 * Saves or updates a user profile in Firestore
 * @param {object} user - User document containing at minimum id and role
 */
export const saveUserToFirestore = async (user) => {
  if (!user) return null;
  const cleanPhone = (user.phone || user.parentPhone || "").replace(/\D/g, "").slice(-10);

  // Check if this user already exists in Firestore by ID or by Role + Phone
  let docId = user.id ? String(user.id) : null;

  if (!docId && cleanPhone && user.role) {
    try {
      const colRef = collection(db, FIRESTORE_COLLECTIONS.USERS);
      const q = query(
        colRef,
        where("role", "==", user.role),
        where("phone", "==", cleanPhone)
      );
      const querySnap = await getDocs(q);
      if (!querySnap.empty) {
        docId = querySnap.docs[0].id;
      }
    } catch (qErr) {
      console.warn("[Firestore Duplicate Check Warning]", qErr.message);
    }
  }

  // If still no docId, use deterministic ID based on role and phone so multiple calls update the SAME document
  if (!docId) {
    docId = cleanPhone && user.role ? `${user.role}-${cleanPhone}` : (user.id || `${user.role || 'user'}-${Date.now()}`);
  }

  // Remove empty or dummy dob for faculty/principal/hod if not provided
  const userToSave = { ...user };
  if (!userToSave.dob || (userToSave.dob === "1988-01-01" && (user.role === "teacher" || user.role === "hod" || user.role === "principal"))) {
    delete userToSave.dob;
  }

  const cleanData = sanitizeForFirestore({
    ...userToSave,
    id: docId,
    firestoreUpdatedAt: new Date().toISOString()
  });

  try {
    const userDocRef = doc(db, FIRESTORE_COLLECTIONS.USERS, docId);
    await setDoc(userDocRef, cleanData, { merge: true });
    console.log(`[Firestore] User successfully saved without duplicates: ${user.name || docId} (${user.role || 'user'})`);
    return { success: true, id: docId, user: cleanData };
  } catch (err) {
    console.warn(`[Firestore User Save Warning] (${docId}):`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Fetches a single user document from Firestore by user ID
 */
export const getUserFromFirestore = async (userId) => {
  if (!userId) return null;
  try {
    const userDocRef = doc(db, FIRESTORE_COLLECTIONS.USERS, String(userId));
    const snap = await getDoc(userDocRef);
    if (snap.exists()) {
      return snap.data();
    }
    return null;
  } catch (err) {
    console.warn(`[Firestore Get User Warning] (${userId}):`, err.message);
    return null;
  }
};

/**
 * Retrieves all registered users stored in Firestore
 */
export const getAllUsersFromFirestore = async () => {
  try {
    const colRef = collection(db, FIRESTORE_COLLECTIONS.USERS);
    const snap = await getDocs(colRef);
    const users = [];
    snap.forEach((docSnap) => {
      users.push({ id: docSnap.id, ...docSnap.data() });
    });
    console.log(`[Firestore] Loaded ${users.length} users from Firestore cloud.`);
    return users;
  } catch (err) {
    console.warn("[Firestore Get All Users Warning]:", err.message);
    return [];
  }
};

/**
 * Deletes a user document from Firestore
 */
export const deleteUserFromFirestore = async (userId) => {
  if (!userId) return false;
  try {
    const userDocRef = doc(db, FIRESTORE_COLLECTIONS.USERS, String(userId));
    await deleteDoc(userDocRef);
    console.log(`[Firestore] User removed from Firestore: ${userId}`);
    return true;
  } catch (err) {
    console.warn(`[Firestore Delete User Warning] (${userId}):`, err.message);
    return false;
  }
};

/**
 * Generic document writer for any ERP collection in Firestore
 */
export const saveDocToFirestore = async (collectionName, docId, data) => {
  if (!collectionName || !data) return null;
  const id = String(docId || data.id || `doc-${Date.now()}`);
  const cleanData = sanitizeForFirestore({
    ...data,
    id,
    firestoreUpdatedAt: new Date().toISOString()
  });

  try {
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, cleanData, { merge: true });
    return { success: true, id };
  } catch (err) {
    console.warn(`[Firestore Doc Save Warning] (${collectionName}/${id}):`, err.message);
    return { success: false, error: err.message };
  }
};

/**
 * Generic document deletion from any collection in Firestore
 */
export const deleteDocFromFirestore = async (collectionName, docId) => {
  if (!collectionName || !docId) return false;
  try {
    const docRef = doc(db, collectionName, String(docId));
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.warn(`[Firestore Doc Delete Warning] (${collectionName}/${docId}):`, err.message);
    return false;
  }
};

/**
 * Generic collection fetcher from Firestore
 */
export const getCollectionFromFirestore = async (collectionName) => {
  if (!collectionName) return [];
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    const records = [];
    snap.forEach((docSnap) => {
      records.push({ id: docSnap.id, ...docSnap.data() });
    });
    return records;
  } catch (err) {
    console.warn(`[Firestore Get Collection Warning] (${collectionName}):`, err.message);
    return [];
  }
};

/**
 * Real-time listener for any Firestore collection
 */
export const subscribeToFirestoreCollection = (collectionName, onUpdate, onError) => {
  if (!collectionName || typeof onUpdate !== "function") return () => {};
  try {
    const colRef = collection(db, collectionName);
    return onSnapshot(
      colRef,
      (snap) => {
        const docs = [];
        snap.forEach((docSnap) => {
          docs.push({ id: docSnap.id, ...docSnap.data() });
        });
        onUpdate(docs);
      },
      (err) => {
        console.warn(`[Firestore Subscription Warning] (${collectionName}):`, err.message);
        if (onError) onError(err);
      }
    );
  } catch (err) {
    console.warn(`[Firestore Setup Subscription Error] (${collectionName}):`, err.message);
    return () => {};
  }
};
