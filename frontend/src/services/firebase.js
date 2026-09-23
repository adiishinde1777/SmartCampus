import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber
} from "firebase/auth";

// Firebase Project Configuration
// Values can be set in frontend/.env or customized here
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDemoKeyForSmartCampusTesting12345",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "smartcampus-csmss.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "smartcampus-csmss",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "smartcampus-csmss.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475610",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:102938475610:web:abcdef1234567890"
};

// Initialize Firebase App
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Check if live credentials have been added by the developer/admin
export const isFirebaseConfigured = () => {
  const key = import.meta.env.VITE_FIREBASE_API_KEY;
  return Boolean(key && !key.includes("DemoKey"));
};

/**
 * Sets up an invisible or container-based reCAPTCHA verifier for phone OTP
 * @param {string} containerId - Element ID where recaptcha badge mounts
 */
export const setupRecaptcha = (containerId = "recaptcha-container") => {
  try {
    if (window.recaptchaVerifier) {
      window.recaptchaVerifier.clear();
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
