import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";

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
