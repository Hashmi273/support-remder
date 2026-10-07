import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { nextReminderAt } from '@/lib/schedule';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const { data, error } = await db().from('clients').select('*').order('created_at', { ascending: false });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data.map((c) => ({ ...c, next_reminder_at: nextReminderAt(c) })));
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(req) {
  try {
    const b = await req.json();
    if (!b.company || !b.mobile || !b.service || !b.pending_items?.length)
      return NextResponse.json({ error: 'Company Name, Mobile Number, Service, and Pending Work items required' }, { status: 400 });

    const { error } = await db().from('clients').insert({
      company: String(b.company).trim(),
      mobile: String(b.mobile).trim(),
      service: b.service,
      pending_items: b.pending_items,
      reminder_on: b.reminder_on !== false,
      send_time: /^\d{2}:\d{2}$/.test(b.send_time) ? b.send_time : '12:00',
      interval_days: Math.min(30, Math.max(1, parseInt(b.interval_days, 10) || 1)),
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: err.message || 'Server error' }, { status: 500 });
  }
}
