'use client'
import { useEffect, useState } from 'react'

const EMPTY = { employee_id: '', first_name: '', last_name: '', email: '', phone: '', department_id: null, department_name: '', position: '', employment_type: 'full-time', status: 'active', hire_date: '', salary: '', address: '' }

export default function EmployeesPage() {
  const [employees, setEmployees] = useState([])
  const [departments, setDepartments] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filterDept, setFilterDept] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  async function load() {
    setLoading(true)

    try {
      const params = new URLSearchParams()
      if (search) params.set('search', search)
      if (filterDept) params.set('department', filterDept)
      if (filterStatus) params.set('status', filterStatus)


      const res = await fetch('/api/employees?' + params)

      if (!res.ok) {
        throw new Error('Failed to fetch employees')
      }

      const text = await res.text()

      const data = text ? JSON.parse(text) : {}

      setEmployees(data.employees || [])
      setDepartments(data.departments || [])
    } catch (err) {
      console.error(err)
      setEmployees([])
      setDepartments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [search, filterDept, filterStatus])

  function openAdd() {
    setEditing(null)
    setForm({ ...EMPTY, hire_date: new Date().toISOString().split('T')[0] })
    setError(''); setShowModal(true)
  }

  function openEdit(emp) {
    setEditing(emp)
    setForm({
      ...emp,
      hire_date: emp.hire_date?.split('T')[0] || '',
      department_id: emp.department_id || null,
    })
    setError('')
    setShowModal(false)
    setTimeout(() => setShowModal(true), 10)
  }

  async function handleSave() {
    setSaving(true)
    setError('')
    if (!form.first_name.trim() || !form.last_name.trim() || !form.email.trim()) {
      setError('First name, last name, and email are required.')
      setSaving(false)
      return
    }
    if (!form.position.trim()) {
      setError('Position is required.')
      setSaving(false)
      return
    }
    if (!form.hire_date) {
      setError('Hire date is required.')
      setSaving(false)
      return
    }
    try {
      const payload = {
        ...form,
        department_id: form.department_id || null,
        salary: form.salary === '' ? 0 : Number(form.salary),
        phone: form.phone?.trim() || null,
        address: form.address?.trim() || null,
        employee_id: form.employee_id?.trim() || undefined,
      }
      if (!editing) {
        delete payload.id
        delete payload.department_name
      }
      const res = await fetch('/api/employees', {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editing ? { ...payload, id: editing.id } : payload),
      })
      const text = await res.text()
      const data = text ? JSON.parse(text) : {}
      if (!res.ok) {
        setError(data.error || `Server error ${res.status}`)
        return
      }
      setShowModal(false)
      load()
    } catch (err) {
      console.error(err)
      setError('Network error — check your connection.')
    } finally {
      setSaving(false)
    }
  }

  async function handleDelete(id) {
    if (!confirm('Delete this employee?')) return
    await fetch(`/api/employees?id=${id}`, { method: 'DELETE' })
    load()
  }

  const statusBadge = (s) => {
    const map = { active: 'badge-green', inactive: 'badge-gray', 'on-leave': 'badge-yellow', terminated: 'badge-red' }
    return <span className={`badge ${map[s] || 'badge-gray'}`}>{s}</span>
  }

  const empTypeBadge = (t) => {
    const map = { 'full-time': 'badge-blue', 'part-time': 'badge-purple', contract: 'badge-yellow', intern: 'badge-gray' }
    return <span className={`badge ${map[t] || 'badge-gray'}`}>{t}</span>
  }

  return (
    <div style={{ padding: '2rem', maxWidth: 1300 }} className="animate-fade">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>Employees</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{employees.length} records found</p>
        </div>
        <button className="btn btn-primary" onClick={openAdd}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>
          Add Employee
        </button>
      </div>
      <div className="card" style={{ padding: '1rem 1.25rem', marginBottom: '1.5rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <svg width="15" height="15" fill="none" viewBox="0 0 24 24" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="2" /><path d="m21 21-4.35-4.35" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input className="input" placeholder="Search by name, email, ID..." value={search}
            onChange={e => setSearch(e.target.value)} style={{ paddingLeft: '2rem' }} />
        </div>
        <select className="input" style={{ width: 'auto', minWidth: 160 }}
          value={filterDept}
          onChange={e => setFilterDept(e.target.value)}>
          <option value="">All Departments</option>
          <option value="1">Administration</option>
          <option value="2">Marketing</option>
          <option value="3">Shipping</option>
          <option value="4">IT</option>
          <option value="5">Sales</option>
          <option value="6">Finance</option>
          <option value="7">Accounting</option>
          <option value="8">Manufacturing</option>
          <option value="9">Recruiting</option>
          {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
        </select>
        <select className="input" style={{ width: 'auto', minWidth: 140 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="on-leave">On Leave</option>
          <option value="terminated">Terminated</option>
        </select>
        {(search || filterDept || filterStatus) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilterDept(''); setFilterStatus('') }}>Clear</button>
        )}
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        {loading ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem', color: 'var(--text-muted)', gap: '0.75rem' }}>
            <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10" /></svg>
            Loading employees...
          </div>
        ) : employees.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>👥</div>
            <div style={{ fontWeight: 500 }}>No employees found</div>
            <div style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>Add your first employee to get started</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>ID</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Salary</th>
                  <th>Hire Date</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {employees.map((emp, i) => (
                  <tr key={emp.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.625rem' }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: `linear-gradient(135deg, hsl(${i * 47 + 200},65%,50%), hsl(${i * 47 + 240},65%,40%))`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 700, flexShrink: 0 }}>
                          {emp.first_name?.[0] || ''}{emp.last_name?.[0] || ''}
                        </div>
                        <div>
                          <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>{emp.first_name} {emp.last_name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{emp.email}</div>
                        </div>
                      </div>
                    </td>
                    <td><span style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>{emp.employee_id}</span></td>
                    <td style={{ fontSize: '0.875rem' }}>{emp.department_name || '—'}</td>
                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{emp.position || '—'}</td>
                    <td>{empTypeBadge(emp.employment_type)}</td>
                    <td>{statusBadge(emp.status)}</td>
                    <td style={{ fontFamily: 'DM Mono, monospace', fontSize: '0.85rem' }}>
                      {emp.salary ? `PKR ${Number(emp.salary).toLocaleString()}` : '—'}
                    </td>
                    <td style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                      {emp.hire_date ? new Date(emp.hire_date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '—'}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.375rem', justifyContent: 'flex-end' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(emp)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(emp.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div className="card animate-fade" style={{ width: '100%', maxWidth: 620, maxHeight: '90vh', overflow: 'auto' }}>
            <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'var(--bg-card)', zIndex: 1 }}>
              <h2 style={{ fontWeight: 600, fontSize: '1.1rem' }}>{editing ? 'Edit Employee' : 'Add New Employee'}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)} style={{ padding: '0.3rem 0.6rem' }}>✕</button>
            </div>
            <div style={{ padding: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {error && <div style={{ gridColumn: 'span 2', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '0.75rem', color: '#ef4444', fontSize: '0.875rem' }}>{error}</div>}

              {[
                { label: 'First Name', key: 'first_name', type: 'text', span: 1 },
                { label: 'Last Name', key: 'last_name', type: 'text', span: 1 },
                { label: 'Email Address', key: 'email', type: 'email', span: 2 },
                { label: 'Phone', key: 'phone', type: 'tel', span: 1 },
                { label: 'Position / Job Title', key: 'position', type: 'text', span: 1 },
              ].map(f => (
                <div key={f.key} style={{ gridColumn: `span ${f.span}` }}>
                  <label className="form-label">{f.label}</label>
                  <input className="input" type={f.type} value={(form)[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                </div>
              ))}

              <div>
                <label className="form-label">Department</label>
                <select className="input" style={{ width: 'auto', minWidth: 160 }}
                  value={filterDept}
                  onChange={e => setFilterDept(e.target.value)}>
                  <option value="">All Departments</option>
                  <option value="1">Administration</option>
                  <option value="2">Marketing</option>
                  <option value="3">Shipping</option>
                  <option value="4">IT</option>
                  <option value="5">Sales</option>
                  <option value="6">Finance</option>
                  <option value="7">Accounting</option>
                  <option value="8">Manufacturing</option>
                  <option value="9">Recruiting</option>
                  {departments.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Employment Type</label>
                <select className="input" value={form.employment_type} onChange={e => setForm(p => ({ ...p, employment_type: e.target.value }))}>
                  <option value="full-time">Full-Time</option>
                  <option value="part-time">Part-Time</option>
                  <option value="contract">Contract</option>
                  <option value="intern">Intern</option>
                </select>
              </div>
              <div>
                <label className="form-label">Hire Date</label>
                <input className="input" type="date" value={form.hire_date} onChange={e => setForm(p => ({ ...p, hire_date: e.target.value }))} />
              </div>
              <div>
                <label className="form-label">Monthly Salary (PKR)</label>
                <input className="input" type="number" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} />
              </div>
              {editing && (
                <div>
                  <label className="form-label">Status</label>
                  <select className="input" value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="on-leave">On Leave</option>
                    <option value="terminated">Terminated</option>
                  </select>
                </div>
              )}
              <div style={{ gridColumn: 'span 2' }}>
                <label className="form-label">Address</label>
                <textarea className="input" rows={2} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} style={{ resize: 'vertical' }} />
              </div>
            </div>
            <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--border)', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                {saving ? 'Saving...' : editing ? 'Update Employee' : 'Add Employee'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
