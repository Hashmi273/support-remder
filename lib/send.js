// While SMS_TEST_MODE=1 (reminder DLT template not yet approved), the Test SMS button sends
// this already-approved OTP template text, and automatic SMS reminders are skipped.
export const SMS_TEST_MODE = process.env.SMS_TEST_MODE === '1';
export const OTP_TEST_TEXT =
  'Your order OTP is 1234. Please use this OTP to complete your order with shorturl.at/eP4cD. Thank you\nSELLOSHIP';

// SMS: GET-style API (cpassweb). Credentials come from env vars.
export async function sendSMS(to, msg) {
  const { SMS_API_URL, SMS_USER_ID, SMS_PASSWORD, SMS_SENDER_ID, SMS_ENTITY_ID, SMS_TEMPLATE_ID } = process.env;
  if (!SMS_API_URL) throw new Error('SMS_API_URL not configured');
  const q = new URLSearchParams({
    UserID: SMS_USER_ID,
    Password: SMS_PASSWORD,
    SenderID: SMS_SENDER_ID,
    Phno: String(to).replace(/^\+?91(?=\d{10}$)/, ''),
    Msg: msg,
    EntityID: SMS_ENTITY_ID,
    TemplateID: SMS_TEMPLATE_ID,
  });
  const res = await fetch(`${SMS_API_URL}?${q}`);
  const body = (await res.text()).slice(0, 300);
  if (!res.ok) throw new Error(`SMS HTTP ${res.status}: ${body}`);
  return body; // provider response; inspect if provider reports errors with HTTP 200
}

// WhatsApp: generic placeholder until the API details are shared.
export async function sendWhatsApp(to, msg) {
  const url = process.env.WHATSAPP_API_URL;
  if (!url) throw new Error('WHATSAPP_API_URL not configured');
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.WHATSAPP_API_KEY || ''}` },
    body: JSON.stringify({ to, message: msg }),
  });
  if (!res.ok) throw new Error(`WA HTTP ${res.status}: ${(await res.text()).slice(0, 200)}`);
}
