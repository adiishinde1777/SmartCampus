import admin from 'firebase-admin';

let isFirebaseInitialized = false;

// Initialize Firebase Admin SDK if service account is provided in env
export function initFirebaseAdmin() {
  if (isFirebaseInitialized || admin.apps.length > 0) return true;

  try {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY
      ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
      : null;

    if (projectId && clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey
        })
      });
      isFirebaseInitialized = true;
      console.log('[Firebase Admin] Successfully initialized with Google Cloud credentials.');
      return true;
    } else if (projectId) {
      admin.initializeApp({
        projectId
      });
      isFirebaseInitialized = true;
      console.log('[Firebase Admin] Initialized with Project ID:', projectId);
      return true;
    }
  } catch (err) {
    console.warn('[Firebase Admin Initialization Notice]', err.message);
  }
  return false;
}

/**
 * Dispatches an Attendance Absence Notification via Firebase Cloud Messaging (FCM)
 * to parent and student target devices or topics
 */
export async function sendFirebaseAbsentNotification({
  recipientPhone,
  recipientRole,
  studentName,
  subjectName,
  date,
  lectureNum
}) {
  const isReady = initFirebaseAdmin();

  const title = `🚨 CSMSS Attendance Alert: ${studentName} Marked Absent`;
  const body = recipientRole === 'parent'
    ? `Dear Parent, your ward ${studentName} was marked ABSENT for ${subjectName} on ${date}.`
    : `Attendance Alert: You were marked ABSENT for ${subjectName} (#${lectureNum || 1}) on ${date}.`;

  if (!isReady) {
    console.log(`[Firebase Alert Simulator] Topic: absent_${recipientRole}_${recipientPhone}`);
    console.log(`Title: "${title}" | Body: "${body}"`);
    return {
      success: true,
      mode: 'simulated_firebase_fcm',
      title,
      body,
      recipientPhone
    };
  }

  try {
    // Send to device topic formatted by phone number: e.g. /topics/user_9876543210
    const cleanPhone = String(recipientPhone).replace(/\D/g, '').slice(-10);
    const topic = `user_${cleanPhone}`;

    const messagePayload = {
      notification: {
        title,
        body
      },
      data: {
        type: 'ATTENDANCE_ABSENT_ALERT',
        studentName: String(studentName || ''),
        subjectName: String(subjectName || ''),
        date: String(date || ''),
        lectureNum: String(lectureNum || 1)
      },
      topic
    };

    const response = await admin.messaging().send(messagePayload);
    console.log('[Firebase FCM Message Sent]', response);
    return {
      success: true,
      messageId: response,
      topic
    };
  } catch (error) {
    console.error('[Firebase FCM Error]', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}
