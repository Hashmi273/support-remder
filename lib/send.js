// While SMS_TEST_MODE=true (reminder DLT template not yet approved), the Test SMS button sends
// this already-approved OTP template text, and automatic SMS reminders are skipped.
export const SMS_TEST_MODE = process.env.SMS_TEST_MODE !== '0';
export const OTP_TEST_TEXT =
  'Your order OTP is 1234. Please use this OTP to complete your order with shorturl.at/eP4cD. Thank you\nSELLOSHIP';

// SMS: GET-style API (cpassweb). Credentials come from env vars or default fallbacks.
export async function sendSMS(to, msg) {
  const url = (process.env.SMS_API_URL || 'http://cpassweb.in/api/SmsApi/SendSingleApi').trim();
  const userId = (process.env.SMS_USER_ID || 'TechR').trim();
  const password = (process.env.SMS_PASSWORD || 'TechR@1111').trim();
  const senderId = (process.env.SMS_SENDER_ID || 'SELLO').trim();
  const entityId = (process.env.SMS_ENTITY_ID || '1001308524269518433').trim();
  const templateId = (process.env.SMS_TEMPLATE_ID || '1777179083917803560').trim();

  const q = new URLSearchParams({
    UserID: userId,
    Password: password,
    SenderID: senderId,
    Phno: String(to).replace(/^\+?91(?=\d{10}$)/, ''),
    Msg: msg,
    EntityID: entityId,
    TemplateID: templateId,
  });
  const res = await fetch(`${url}?${q}`);
  const body = (await res.text()).slice(0, 300);
  if (!res.ok) throw new Error(`SMS HTTP ${res.status}: ${body}`);
  return body; // provider response
}

// WhatsApp: generic placeholder until the API details are shared.
export async function sendWhatsApp(to, msg) {
  const url = process.env.WHATSAPP_API_URL;
  if (!url) return 'whatsapp not configured';
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.WHATSAPP_API_KEY || ''}` },
    body: JSON.stringify({ to, message: msg }),
  });
  if (!res.ok) throw new Error(`WA HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
