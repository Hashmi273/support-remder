'use client';
import { useEffect, useState, useCallback } from 'react';
import { SERVICES, PENDING_OPTIONS, WEBSITE_OPTIONS } from '@/lib/config';

const fmt = (d) =>
  d ? new Date(d).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const INTERVALS = [[1, 'Every day'], [2, 'Every 2 days'], [3, 'Every 3 days'], [7, 'Every week']];

export default function Home() {
  const [clients, setClients] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [err, setErr] = useState('');
  const empty = { company: '', mobile: '', service: 'DLT', pending_items: [], reminder_on: true, send_time: '12:00', interval_days: 1, status: 'pending' };
  const [form, setForm] = useState(empty);
  const [editingId, setEditingId] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Popup Modal for Service Details
  const [viewServiceModal, setViewServiceModal] = useState(null); // 'DLT' | 'RCS' | 'WhatsApp' | null

  const load = useCallback(async () => {
    const r = await fetch('/api/clients');
    if (r.status === 401) return (location.href = '/login');
    const d = await r.json();
    if (Array.isArray(d)) setClients(d);
    else setErr(d.error);
  }, []);
  useEffect(() => { load(); }, [load]);

  const pending = clients.filter((c) => c.status === 'pending');
  const todayKey = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

  // Filter clients based on search query
  const filteredClients = clients.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.company.toLowerCase().includes(q) ||
      c.mobile.includes(q) ||
      c.service.toLowerCase().includes(q) ||
      c.pending_items.some((item) => item.toLowerCase().includes(q))
    );
  });

  // Helper to compute stats for a specific service
  const getServiceStats = (serviceName) => {
    const sClients = clients.filter((c) => c.service === serviceName);
    const sPending = sClients.filter((c) => c.status === 'pending');
    const sTodays = sPending.filter(
      (c) => c.reminder_on && c.next_reminder_at &&
        new Date(c.next_reminder_at).toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' }) === todayKey
    );
    const sCompleted = sClients.filter((c) => c.status === 'completed');
    return {
      total: sClients.length,
      pending: sPending.length,
      todays: sTodays.length,
      completed: sCompleted.length,
    };
  };

  const toggleItem = (k) =>
    setForm((f) => ({ ...f, pending_items: f.pending_items.includes(k) ? f.pending_items.filter((x) => x !== k) : [...f.pending_items, k] }));

  async function save(e) {
    e.preventDefault();
    setErr('');
    const r = editingId
      ? await fetch('/api/clients/' + editingId, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, action: 'edit' }) })
      : await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
    const d = await r.json();
    if (!r.ok) return setErr(d.error || 'Failed to save client');
    closeFormModal();
    load();
  }

  function openAddModal() {
    setEditingId(null);
    setForm(empty);
    setErr('');
    setIsAddModalOpen(true);
  }

  function startEdit(c) {
    setEditingId(c.id);
    setForm({
      company: c.company, mobile: c.mobile, service: c.service, pending_items: c.pending_items,
      reminder_on: c.reminder_on, send_time: c.send_time || '12:00', interval_days: c.interval_days || 1, status: c.status,
    });
    setErr('');
    setIsAddModalOpen(true);
  }

  function closeFormModal() {
    setIsAddModalOpen(false);
    setEditingId(null);
    setForm(empty);
    setErr('');
  }

  const patch = async (id, body) => { await fetch('/api/clients/' + id, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }); load(); };
  const [testing, setTesting] = useState(null);
  async function testSms(c) {
    if (!confirm('Send a real test SMS to ' + c.mobile + ' (' + c.company + ')? SMS charges apply.')) return;
    setTesting(c.id);
    try {
      const r = await fetch('/api/clients/' + c.id + '/test', { method: 'POST' });
      const d = await r.json();
      alert(r.ok ? 'SMS sent to ' + c.mobile + '\nProvider response: ' + d.response : 'SMS FAILED: ' + d.error);
    } catch (e) { alert('SMS FAILED: ' + e.message); }
    setTesting(null);
  }

  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    location.href = '/login';
  }

  const activeServiceStats = viewServiceModal ? getServiceStats(viewServiceModal) : null;

  return (
    <div className="wrap">
      <div className="top">
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <h1 className="brand-title">
            <span className="blue">IMMENSE </span>
            <span className="orange">AIR </span>
            <span className="sub">PVT LTD</span>
          </h1>
          <span style={{ color: '#cbd5e1', fontSize: 20 }}>|</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#0b1c3d' }}>Pending Work Follow-up System</span>
        </div>
        <div className="header-right">
          <div className="header-badge">
            <span className="dot"></span> Automatic Reminders Active
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout of Admin Panel">
            🚪 Logout
          </button>
        </div>
      </div>

      {/* Main Service Cards with Eye (👁️) Popup Trigger */}
      <div className="cards">
        {/* DLT (SMS) Card */}
        <div className="card" style={{ borderLeft: '4px solid #0b1c3d' }}>
          <div className="card-top">
            <span className="card-title">DLT (SMS)</span>
            <button className="eye-btn" title="View DLT Details" onClick={() => setViewServiceModal('DLT')}>
              👁️ View
            </button>
          </div>
          <div className="card-num">{getServiceStats('DLT').pending} <small style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Pending</small></div>
        </div>

        {/* RCS Card */}
        <div className="card" style={{ borderLeft: '4px solid #f95e07' }}>
          <div className="card-top">
            <span className="card-title">RCS</span>
            <button className="eye-btn" title="View RCS Details" onClick={() => setViewServiceModal('RCS')}>
              👁️ View
            </button>
          </div>
          <div className="card-num">{getServiceStats('RCS').pending} <small style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Pending</small></div>
        </div>

        {/* WhatsApp Card */}
        <div className="card" style={{ borderLeft: '4px solid #10b981' }}>
          <div className="card-top">
            <span className="card-title">WhatsApp</span>
            <button className="eye-btn" title="View WhatsApp Details" onClick={() => setViewServiceModal('WhatsApp')}>
              👁️ View
            </button>
          </div>
          <div className="card-num">{getServiceStats('WhatsApp').pending} <small style={{ fontSize: 13, color: '#64748b', fontWeight: 500 }}>Pending</small></div>
        </div>
      </div>

      {/* SERVICE DETAILS POPUP MODAL (Triggered by Eye 👁️ Button) */}
      {viewServiceModal && (
        <>
          <div className="overlay" onClick={() => setViewServiceModal(null)} />
          <div className="modal">
            <div className="modal-header">
              <h2>{viewServiceModal} Service Analytics</h2>
              <button className="close-btn" onClick={() => setViewServiceModal(null)}>✕</button>
            </div>
            <div className="popup-stats">
              <div className="popup-card">
                <span className="popup-card-lbl">Total Clients</span>
                <span className="popup-card-val">{activeServiceStats.total}</span>
              </div>
              <div className="popup-card">
                <span className="popup-card-lbl" style={{ color: '#d97706' }}>Total Pending</span>
                <span className="popup-card-val" style={{ color: '#d97706' }}>{activeServiceStats.pending}</span>
              </div>
              <div className="popup-card">
                <span className="popup-card-lbl" style={{ color: '#2563eb' }}>Today's Reminders</span>
                <span className="popup-card-val" style={{ color: '#2563eb' }}>{activeServiceStats.todays}</span>
              </div>
              <div className="popup-card">
                <span className="popup-card-lbl" style={{ color: '#16a34a' }}>Completed</span>
                <span className="popup-card-val" style={{ color: '#16a34a' }}>{activeServiceStats.completed}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <button className="s" onClick={() => setViewServiceModal(null)}>Close</button>
            </div>
          </div>
        </>
      )}

      {/* ADD / EDIT CLIENT POPUP MODAL */}
      {isAddModalOpen && (
        <>
          <div className="overlay" onClick={closeFormModal} />
          <form className="panel modal" onSubmit={save}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <b style={{ fontSize: 18, color: '#0f172a' }}>{editingId ? 'Edit Client Details' : 'Add New Client'}</b>
              <button type="button" className="close-btn" onClick={closeFormModal}>✕</button>
            </div>
            <div className="row">
              <label>Company Name
                <input required value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} placeholder="e.g. ABC Pvt Ltd" />
              </label>
              <label>Mobile Number
                <input required value={form.mobile} onChange={(e) => setForm({ ...form, mobile: e.target.value })} placeholder="91XXXXXXXXXX" />
              </label>
              <label>Service
                <select value={form.service} onChange={(e) => setForm({ ...form, service: e.target.value, pending_items: [] })}>
                  {SERVICES.map((s) => <option key={s}>{s}</option>)}
                </select>
              </label>
              <label>Send Time (IST)
                <input type="time" required value={form.send_time} onChange={(e) => setForm({ ...form, send_time: e.target.value })} />
              </label>
              <label>Repeat Frequency
                <select value={form.interval_days} onChange={(e) => setForm({ ...form, interval_days: Number(e.target.value) })}>
                  {INTERVALS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
                </select>
              </label>
              {editingId && (
                <label>Status
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                    <option value="pending">Pending</option>
                    <option value="completed">Completed (Stops Reminders)</option>
                  </select>
                </label>
              )}
              <label className="chip" style={{ height: 38 }}><input type="checkbox" checked={form.reminder_on} onChange={(e) => setForm({ ...form, reminder_on: e.target.checked })} />Reminder ON</label>
            </div>

            <div style={{ margin: '16px 0 8px', fontSize: 13, fontWeight: 600, color: '#475569' }}>Select Pending Work Items:</div>
            <div className="chips">
              {[...Object.keys(PENDING_OPTIONS[form.service]), ...Object.keys(WEBSITE_OPTIONS)].map((k) => (
                <label className="chip" key={k}>
                  <input type="checkbox" checked={form.pending_items.includes(k)} onChange={() => toggleItem(k)} />{k}
                </label>
              ))}
            </div>

            <div style={{ marginTop: 16, display: 'flex', gap: 10, alignItems: 'center' }}>
              <button>{editingId ? 'Save Changes' : 'Add Client'}</button>
              <button type="button" className="s" onClick={closeFormModal}>Cancel</button>
              {err && <span className="err">{err}</span>}
            </div>
          </form>
        </>
      )}

      {/* CLIENTS TABLE PANEL */}
      <div className="panel scroll">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <b style={{ fontSize: 18, color: '#0f172a' }}>All Client Records</b>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search Company, Mobile, Service..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: 280, padding: '7px 12px 7px 32px', fontSize: 13, borderRadius: 8 }}
              />
              <span style={{ position: 'absolute', left: 10, top: 8, fontSize: 13, color: '#94a3b8' }}>🔍</span>
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{ position: 'absolute', right: 6, top: 5, padding: '2px 6px', background: 'none', color: '#64748b', fontSize: 12 }}
                >
                  ✕
                </button>
              )}
            </div>
          </div>
          <button onClick={openAddModal} style={{ padding: '8px 16px', fontSize: 13 }}>
            + Add New Client
          </button>
        </div>
        <table>
          <thead>
            <tr>
              <th>Client</th>
              <th>Pending Work</th>
              <th>Status</th>
              <th>Schedule</th>
              <th>Last Reminder</th>
              <th>Next Reminder</th>
              <th>Count</th>
              <th>SMS</th>
              <th>WhatsApp</th>
              <th>Completed</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredClients.map((c) => (
              <tr key={c.id}>
                <td><b>{c.company}</b><br />{c.mobile}<br /><span style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>{c.service}</span></td>
                <td>{c.pending_items.join(', ')}</td>
                <td>
                  <span className={'tag ' + c.status}>{c.status}</span>
                  <br />
                  <small style={{ color: c.reminder_on ? '#16a34a' : '#64748b' }}>Reminder {c.reminder_on ? 'ON' : 'OFF'}</small>
                </td>
                <td><small>{c.interval_days > 1 ? `Every ${c.interval_days} days` : 'Daily'}<br />at {c.send_time}</small></td>
                <td>{fmt(c.last_reminder_at)}</td>
                <td>{fmt(c.next_reminder_at)}</td>
                <td>{c.reminder_count}</td>
                <td>{c.sms_sent}</td>
                <td>{c.wa_sent}</td>
                <td>{fmtDate(c.completed_at)}</td>
                <td style={{ whiteSpace: 'nowrap' }}>
                  <button onClick={() => startEdit(c)}>Edit</button>{' '}
                  {c.status === 'pending' && (
                    <button className="s" onClick={() => patch(c.id, { reminder_on: !c.reminder_on })}>
                      {c.reminder_on ? 'Turn OFF' : 'Turn ON'}
                    </button>
                  )}{' '}
                  <button className="g" disabled={testing === c.id} onClick={() => testSms(c)}>
                    {testing === c.id ? 'Sending…' : 'Test SMS'}
                  </button>
                </td>
              </tr>
            ))}
            {!filteredClients.length && (
              <tr>
                <td colSpan="11" style={{ textAlign: 'center', padding: 24, color: '#64748b' }}>
                  {searchQuery ? `No clients matching "${searchQuery}"` : 'No client records found. Click "+ Add New Client" above to add your first client.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
