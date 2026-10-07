import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(req, { params }) {
  const b = await req.json();
  let patch = {};
  if (typeof b.reminder_on === 'boolean') patch.reminder_on = b.reminder_on;
  if (b.action === 'complete') patch = { status: 'completed', reminder_on: false, completed_at: new Date().toISOString() };
  if (b.action === 'reopen') patch = { status: 'pending', reminder_on: true, completed_at: null };
  if (b.action === 'edit') {
    if (!b.company || !b.mobile || !b.service || !b.pending_items?.length)
      return NextResponse.json({ error: 'company, mobile, service, pending work required' }, { status: 400 });
    patch = {
      company: b.company.trim(),
      mobile: b.mobile.trim(),
      service: b.service,
      pending_items: b.pending_items,
      reminder_on: b.reminder_on !== false,
      send_time: /^\d{2}:\d{2}$/.test(b.send_time) ? b.send_time : '12:00',
      interval_days: Math.min(30, Math.max(1, parseInt(b.interval_days, 10) || 1)),
    };
    if (b.status === 'completed') Object.assign(patch, { status: 'completed', reminder_on: false, completed_at: new Date().toISOString() });
    if (b.status === 'pending') Object.assign(patch, { status: 'pending', completed_at: null });
  }
  const { error } = await db().from('clients').update(patch).eq('id', params.id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
