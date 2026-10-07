create table if not exists clients (
  id uuid primary key default gen_random_uuid(),
  company text not null,
  mobile text not null,
  service text not null check (service in ('DLT','RCS','WhatsApp')),
  pending_items text[] not null default '{}',
  reminder_on boolean not null default true,
  status text not null default 'pending' check (status in ('pending','completed')),
  completed_at timestamptz,
  last_reminder_at timestamptz,
  reminder_count int not null default 0,
  sms_sent int not null default 0,
  wa_sent int not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists reminder_logs (
  id bigserial primary key,
  client_id uuid references clients(id) on delete cascade,
  channel text not null,
  ok boolean not null,
  message text,
  error text,
  sent_at timestamptz not null default now()
);

alter table clients enable row level security;
alter table reminder_logs enable row level security;
-- No policies: only the server (service role key) accesses data.
