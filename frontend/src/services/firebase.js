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
  const docId = String(user.id || (user.role ? `${user.role}-${Date.now()}` : `user-${Date.now()}`));
  const cleanData = sanitizeForFirestore({
    ...user,
    id: docId,
    firestoreUpdatedAt: new Date().toISOString()
  });

  try {
    const userDocRef = doc(db, FIRESTORE_COLLECTIONS.USERS, docId);
    await setDoc(userDocRef, cleanData, { merge: true });
    console.log(`[Firestore] User successfully saved: ${user.name || docId} (${user.role || 'user'})`);
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


/**
 * Sets up an invisible or container-based reCAPTCHA verifier for phone OTP
 * @param {string} containerId - Element ID where recaptcha badge mounts
 */
export const setupRecaptcha = (containerId = "recaptcha-container") => {
  try {
    if (typeof window === "undefined") return null;

    let container = document.getElementById(containerId);
    if (!container) {
      container = document.createElement("div");
      container.id = containerId;
      document.body.appendChild(container);
    }

    if (window.recaptchaVerifier) {
      try {
        window.recaptchaVerifier.clear();
      } catch (e) {}
      window.recaptchaVerifier = null;
    }

    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible",
      callback: (response) => {
        console.log("[Firebase ReCAPTCHA Verified]", response);
      },
      "expired-callback": () => {
        console.warn("[Firebase ReCAPTCHA Expired] Please retry.");
      }
    });

    return window.recaptchaVerifier;
  } catch (error) {
    console.error("[Firebase ReCAPTCHA Setup Error]", error);
    return null;
  }
};

/**
 * Sends a real SMS OTP to the phone number using Google Firebase Phone Auth
 * @param {string} rawPhone - 10-digit Indian phone number
 * @param {object} appVerifier - RecaptchaVerifier instance
 */
export const sendFirebasePhoneOtp = async (rawPhone, appVerifier) => {
  const digits = String(rawPhone || "").replace(/\D/g, "").slice(-10);
  if (!digits || digits.length !== 10) {
    throw new Error("Invalid 10-digit mobile number for Firebase Phone Auth.");
  }

  const internationalPhone = `+91${digits}`;

  try {
    if (appVerifier && typeof appVerifier.render === "function") {
      await appVerifier.render();
    }
    const confirmationResult = await signInWithPhoneNumber(auth, internationalPhone, appVerifier);
    window.confirmationResult = confirmationResult;
    return {
      success: true,
      phone: internationalPhone,
      confirmationResult
    };
  } catch (error) {
    console.error("[Firebase Phone Auth Error]", error);
    throw error;
  }
};

/**
 * Confirms the 6-digit SMS OTP received from Firebase
 * @param {object} confirmationResult - Returned from sendFirebasePhoneOtp
 * @param {string} verificationCode - 6-digit code entered by user
 */
export const confirmFirebaseOtp = async (confirmationResult, verificationCode) => {
  try {
    const code = String(verificationCode || "").trim();
    if (!confirmationResult || !confirmationResult.confirm) {
      throw new Error("No active Firebase confirmation session. Please request OTP again.");
    }
    const result = await confirmationResult.confirm(code);
    return {
      success: true,
      user: result.user
    };
  } catch (error) {
    console.error("[Firebase OTP Confirm Error]", error);
    throw error;
  }
};
