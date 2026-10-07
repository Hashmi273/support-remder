// All schedule math in IST (UTC+5:30)
const IST = 5.5 * 3600 * 1000;
const DAY = 86400000;
const workDays = () =>
  (process.env.WORKING_DAYS || '1,2,3,4,5').split(',').map((n) => parseInt(n, 10));

const istParts = (d) => new Date(d.getTime() + IST);
export const istDateKey = (d) => istParts(d).toISOString().slice(0, 10);
export const isWorkingDay = (d = new Date()) => workDays().includes(istParts(d).getUTCDay());

// Given IST date key (YYYY-MM-DD) and "HH:MM", return the real instant.
const at = (dateKey, hhmm) => new Date(new Date(`${dateKey}T${hhmm || '12:00'}:00Z`).getTime() - IST);

// Minutes before the scheduled time at which a run may already send (covers cron jitter).
export const EARLY_MS = (parseInt(process.env.EARLY_MINUTES || '30', 10)) * 60000;

// Deterministic: depends only on the client's own data (not on "now").
export function nextReminderAt(c) {
  if (!c.reminder_on || c.status === 'completed') return null;
  const interval = c.interval_days || 1;
  let t;
  if (c.last_reminder_at) {
    const last = new Date(c.last_reminder_at);
    t = at(istDateKey(new Date(last.getTime() + interval * DAY)), c.send_time);
  } else {
    const created = new Date(c.created_at);
    t = at(istDateKey(created), c.send_time);
    if (t <= created) t = new Date(t.getTime() + DAY); // added after today's send time
  }
  for (let i = 0; i < 8 && !isWorkingDay(t); i++) t = new Date(t.getTime() + DAY);
  return t;
}

export function isDue(c, now = new Date()) {
  const t = nextReminderAt(c);
  if (!t) return false;
  if (c.last_reminder_at && istDateKey(new Date(c.last_reminder_at)) === istDateKey(now)) return false;
  return t.getTime() <= now.getTime() + EARLY_MS;
}
