import axios from 'axios';
import { query } from '../db.js';

// Normalizes 10-digit Indian phone numbers
function formatPhoneNumber(phone) {
  if (!phone) return null;
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length === 10) return digits;
  if (digits.length > 10 && digits.startsWith('91')) return digits.slice(-10);
  return digits;
}

export async function sendSmsNotification({
  recipientRole,
  recipientPhone,
  studentId,
  studentName,
  message
}) {
  const normalizedPhone = formatPhoneNumber(recipientPhone);
  const logId = 'sms-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7);

  if (!normalizedPhone) {
    console.warn(`[SMS Service] Skipping SMS dispatch: Invalid phone number (${recipientPhone}) for ${studentName || 'user'}`);
    return { success: false, reason: 'Invalid phone number' };
  }

  const provider = process.env.SMS_GATEWAY_PROVIDER || 'simulator';
  let deliveryStatus = 'Simulated_Sent';
  let responsePayload = 'Simulated dispatch successful. Message queued for delivery.';

  try {
    // 1. Fast2SMS Provider Option
    if (provider.toLowerCase() === 'fast2sms' && process.env.FAST2SMS_API_KEY) {
      const response = await axios.post(
        'https://www.fast2sms.com/dev/bulkV2',
        {
          route: 'q',
          message: message,
          language: 'english',
          flash: 0,
          numbers: normalizedPhone
        },
        {
          headers: {
            authorization: process.env.FAST2SMS_API_KEY
          }
        }
      );
      deliveryStatus = response.data?.return ? 'Delivered' : 'Failed';
      responsePayload = JSON.stringify(response.data);
    }
    // 2. Twilio Provider Option
    else if (provider.toLowerCase() === 'twilio' && process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
      const auth = Buffer.from(`${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`).toString('base64');
      const params = new URLSearchParams();
      params.append('To', `+91${normalizedPhone}`);
      params.append('From', process.env.TWILIO_PHONE_NUMBER);
      params.append('Body', message);

      const response = await axios.post(
        `https://api.twilio.com/2010-04-01/Accounts/${process.env.TWILIO_ACCOUNT_SID}/Messages.json`,
        params.toString(),
        {
          headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );
      deliveryStatus = response.data?.status === 'sent' || response.data?.status === 'queued' ? 'Delivered' : 'Failed';
      responsePayload = JSON.stringify(response.data);
    }
    // 3. Robust Realistic Simulator
    else {
      console.log(`[SMS SIMULATOR DISPATCH] Role: ${recipientRole} | Phone: ${normalizedPhone} | Student: ${studentName}`);
      console.log(`Message: "${message}"`);
      deliveryStatus = 'Delivered';
      responsePayload = JSON.stringify({
        status: 'success',
        provider: 'SmartCampus Cloud SMS Gateway (Simulator / Real Ready)',
        dispatchedAt: new Date().toISOString()
      });
    }

    // Persist to MySQL sms_logs
    try {
      await query(
        `INSERT INTO sms_logs (id, recipient_role, recipient_phone, student_id, student_name, message, gateway_provider, gateway_status, response_payload)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [logId, recipientRole, normalizedPhone, studentId, studentName, message, provider, deliveryStatus, responsePayload]
      );
    } catch (dbErr) {
      console.error('[SMS DB Log Error] Could not write to sms_logs table:', dbErr.message);
    }

    return {
      success: true,
      logId,
      phone: normalizedPhone,
      status: deliveryStatus,
      message
    };
  } catch (error) {
    console.error(`[SMS Error] Failed to send SMS to ${normalizedPhone}:`, error.response?.data || error.message);
    try {
      await query(
        `INSERT INTO sms_logs (id, recipient_role, recipient_phone, student_id, student_name, message, gateway_provider, gateway_status, response_payload)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [logId, recipientRole, normalizedPhone, studentId, studentName, message, provider, 'Failed', error.message]
      );
    } catch (e) {}

    return {
      success: false,
      logId,
      error: error.message
    };
  }
}

// Dispatches absent alerts to both Parent and Student
export async function dispatchAbsenceAlerts({ student, subjectName, date, lectureNum, sessionType }) {
  const results = [];
  const typeStr = sessionType === 'Practical' ? 'Practical Lab' : 'Theory Lecture';

  // 1. Alert to Student
  if (student.phone) {
    const studentMsg = `CSMSS COE Attendance Alert: Dear ${student.name}, you were marked ABSENT for ${subjectName} (${typeStr} #${lectureNum || 1}) on ${date}. Please verify with your subject faculty.`;
    const sRes = await sendSmsNotification({
      recipientRole: 'student',
      recipientPhone: student.phone,
      studentId: student.id,
      studentName: student.name,
      message: studentMsg
    });
    results.push({ target: 'student', ...sRes });
  }

  // 2. Alert to Parent
  if (student.parentPhone || student.parent_phone) {
    const parentPhone = student.parentPhone || student.parent_phone;
    const parentMsg = `CSMSS COE Attendance Alert: Dear Parent, your ward ${student.name} (PRN: ${student.prn || 'N/A'}) was marked ABSENT for ${subjectName} on ${date}. For academic inquiries, contact the department.`;
    const pRes = await sendSmsNotification({
      recipientRole: 'parent',
      recipientPhone: parentPhone,
      studentId: student.id,
      studentName: student.name,
      message: parentMsg
    });
    results.push({ target: 'parent', ...pRes });
  }

  return results;
}
