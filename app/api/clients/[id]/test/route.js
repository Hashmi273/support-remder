import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildMessage } from '@/lib/config';
import { sendSMS, SMS_TEST_MODE, OTP_TEST_TEXT } from '@/lib/send';

// Sends a real reminder SMS to this client to verify delivery. Does not change counters/schedule.
export async function POST(_req, { params }) {
  const sb = db();
  const { data: c } = await sb.from('clients').select('*').eq('id', params.id).single();
  if (!c) return NextResponse.json({ error: 'client not found' }, { status: 404 });
  const message = SMS_TEST_MODE ? OTP_TEST_TEXT : buildMessage(c);
  try {
    const response = await sendSMS(c.mobile, message);
    await sb.from('reminder_logs').insert({ client_id: c.id, channel: 'sms-test', ok: true, message });
    return NextResponse.json({ ok: true, response, message });
  } catch (e) {
    await sb.from('reminder_logs').insert({ client_id: c.id, channel: 'sms-test', ok: false, message, error: String(e.message) });
    return NextResponse.json({ error: String(e.message) }, { status: 502 });
  }
}
