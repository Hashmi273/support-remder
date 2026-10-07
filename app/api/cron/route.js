import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { buildMessage } from '@/lib/config';
import { isWorkingDay, isDue } from '@/lib/schedule';
import { sendSMS, sendWhatsApp, SMS_TEST_MODE } from '@/lib/send';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET(req) {
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`)
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  const now = new Date();
  if (!isWorkingDay(now)) return NextResponse.json({ skipped: 'not a working day' });

  const sb = db();
  // Only active, still-pending clients — completed clients are never picked up.
  const { data: clients } = await sb.from('clients').select('*').eq('status', 'pending').eq('reminder_on', true);
  let processed = 0;
  for (const c of clients || []) {
    if (!isDue(c, now)) continue;
    const message = buildMessage(c);
    const results = {};
    for (const [channel, fn] of [['sms', SMS_TEST_MODE ? async () => { throw new Error('skipped: SMS_TEST_MODE (reminder template not approved)'); } : sendSMS], ['whatsapp', sendWhatsApp]]) {
      try { await fn(c.mobile, message); results[channel] = true; await sb.from('reminder_logs').insert({ client_id: c.id, channel, ok: true, message }); }
      catch (e) { results[channel] = false; await sb.from('reminder_logs').insert({ client_id: c.id, channel, ok: false, message, error: String(e.message) }); }
    }
    if (results.sms || results.whatsapp) {
      await sb.from('clients').update({
        last_reminder_at: now.toISOString(),
        reminder_count: c.reminder_count + 1,
        sms_sent: c.sms_sent + (results.sms ? 1 : 0),
        wa_sent: c.wa_sent + (results.whatsapp ? 1 : 0),
      }).eq('id', c.id);
    }
    processed++;
  }
  return NextResponse.json({ processed });
}
