'use client'
import { useEffect, useState } from 'react'
import { Alert, Flex, Spin, message } from 'antd';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

export default function AttendancePage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [records, setRecords] = useState([])
  const [stats, setStats] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ employee_id: '', date: now.toISOString().split('T')[0], check_in: '09:00', check_out: '18:00', status: 'present', notes: '' })
  const [saving, setSaving] = useState(false)
  const [messageApi, contextHolder] = message.useMessage();

  async function load() {
    setLoading(true)

    try {
      const res = await fetch(`/api/attendance?month=${month}&year=${year}`)

      const text = await res.text()
      const data = text ? JSON.parse(text) : {}

      setRecords(data.records || [])
      setStats(data.stats || null)

    } catch (err) {
      console.error("LOAD ERROR:", err)
      setRecords([])
      setStats(null)
    } finally {
      setLoading(false)
    }
  }

  async function loadEmployees() {
    try {
      const res = await fetch('/api/employees')
      const text = await res.text()
      const data = text ? JSON.parse(text) : {}

      setEmployees(data.employees || [])
    } catch (err) {
      console.error("EMPLOYEE LOAD ERROR:", err)
      setEmployees([])
    }
  }

  useEffect(() => { load() }, [month, year])
  useEffect(() => { loadEmployees() }, [])

  async function handleSave() {
    setSaving(true)
    try {
      const res = await fetch('/api/attendance', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const text = await res.text()
      const data = text ? JSON.parse(text) : {}

      if (!res.ok) {
        messageApi.error(data.error || 'Failed to save attendance')
        return
      }
      messageApi.success('Attendance marked successfully')
      setShowModal(false)
      setSaving(false)
      load()

    } catch (err) {
      console.error(err)
      messageApi.error('Network error')
    } finally {
      setSaving(false)
    }
  }


  async function handleDelete(id) {
    if (!confirm('Delete this record?')) return
    await fetch(`/api/attendance?id=${id}`, { method: 'DELETE' })
    load()
  }

  const statusBadge = (s) => {
    const map = { present: 'badge-green', absent: 'badge-red', late: 'badge-yellow', 'half-day': 'badge-purple', remote: 'badge-blue', holiday: 'badge-gray' }
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1300 }} className="animate-fade">
      {contextHolder}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Attendance</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Track and manage employee attendance</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ employee_id: '', date: now.toISOString().split('T')[0], check_in: '09:00', check_out: '18:00', status: 'present', notes: '' }); setShowModal(true) }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
          Mark Attendance
        </button>
      </div>

      {/* Month/Year Selector */}
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <select className="input" style={{ width: 'auto', minWidth: 140 }} value={month} onChange={e => setMonth(Number(e.target.value))}>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select className="input" style={{ width: 'auto', minWidth: 100 }} value={year} onChange={e => setYear(Number(e.target.value))}>
          {[2023, 2024, 2025, 2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Showing {records.length} records</span>
      </div>

      {/* Stats */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(140px,1fr))', gap: '0.75rem', marginBottom: '1.5rem' }}>
          {[
            { label: 'Present', val: stats.present, cls: 'badge-green', color: '#10b981' },
            { label: 'Absent', val: stats.absent, cls: 'badge-red', color: '#ef4444' },
            { label: 'Late', val: stats.late, cls: 'badge-yellow', color: '#f59e0b' },
            { label: 'Half Day', val: stats.half_day, cls: 'badge-purple', color: '#8b5cf6' },
            { label: 'Remote', val: stats.remote, cls: 'badge-blue', color: '#3b82f6' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: 700, color: s.color }}>{s.val}</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '0.2rem' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)', gap: '0.75rem' }}>
            <Spin description="Loading Attendance..." size="large" />
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>📅</div>
            <div style={{ fontWeight: 500 }}>No attendance records</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Mark attendance for {MONTHS[month - 1]} {year}</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Date</th>
                  <th>Check In</th>
                  <th>Check Out</th>
                  <th>Hours</th>
                  <th>Status</th>
                  <th>Notes</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: 30, height: 30, borderRadius: '50%', background: `linear-gradient(135deg, hsl(${i * 60 + 200},65%,50%), hsl(${i * 60 + 240},65%,40%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 700, flexShrink: 0 }}>
                          {r.first_name[0]}{r.last_name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{r.first_name} {r.last_name}</div>
                          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{r.emp_code}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.83rem' }}>
                      {new Date(r.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                    </td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', color: 'var(--success)' }}>{r.check_in || '—'}</td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{r.check_out || '—'}</td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.85rem' }}>
                      {r.hours_worked ? `${Number(r.hours_worked).toFixed(1)}h` : '—'}
                    </td>
                    <td>{statusBadge(r.status)}</td>
                    <td style={{ fontSize: '0.82rem', color: 'var(--text-muted)', maxWidth: 150, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.notes || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(r.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="card animate-fade" style={{ width: '100%', maxWidth: 480 }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }}>Mark Attendance</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)} style={{ padding: '0.3rem 0.6rem' }}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Employee</label>
                <select className="input" value={form.employee_id} onChange={e => setForm(p => ({ ...p, employee_id: e.target.value }))}>
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_id})</option>)}
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Date</label>
                <input className="input" type="date" value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Check In</label>
                <input className="input" type="time" value={form.check_in} onChange={e => setForm(p => ({ ...p, check_in: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Check Out</label>
                <input className="input" type="time" value={form.check_out} onChange={e => setForm(p => ({ ...p, check_out: e.target.value }))} />
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Status</label>
                <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="late">Late</option>
                  <option value="half-day">Half Day</option>
                  <option value="remote">Remote</option>
                  <option value="holiday">Holiday</option>
                </select>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Notes (optional)</label>
                <input className="input" placeholder="Any remarks..." value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.employee_id}>
                {saving ? 'Saving...' : 'Save Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
