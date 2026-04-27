'use client'
import { useEffect, useState } from 'react'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

export default function PayrollPage() {
  const now = new Date()
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [year, setYear] = useState(now.getFullYear())
  const [records, setRecords] = useState([])
  const [summary, setSummary] = useState(null)
  const [employees, setEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm] = useState({ employee_id:'', basic_salary:'', allowances:'0', overtime_pay:'0', deductions:'0', tax:'0', payment_method:'bank_transfer', notes:'' })
  const [saving, setSaving] = useState(false)
  const [updatingId, setUpdatingId] = useState(null)

  async function load() {
    setLoading(true)
    const res = await fetch(`/api/payroll?month=${month}&year=${year}`)
    const data = await res.json()
    setRecords(data.records || [])
    setSummary(data.summary)
    setLoading(false)
  }

  async function loadEmployees() {
    const res = await fetch('/api/employees')
    const data = await res.json()
    setEmployees(data.employees || [])
  }

  useEffect(() => { load() }, [month, year])
  useEffect(() => { loadEmployees() }, [])

  async function handleSave() {
    setSaving(true)
   await fetch('/api/payroll', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ ...form, month, year })
})
    setShowModal(false); setSaving(false); load()
  }

  async function updateStatus(id, status) {
    setUpdatingId(id)
   await fetch('/api/payroll', {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ id, payment_status: status })
})
    setUpdatingId(null); load()
  }

 const fmt = (n) => `PKR ${Number(n).toLocaleString('en-PK', { minimumFractionDigits: 0 })}`

  const statusBadge = (s) => {
    const map = { paid:'badge-green', pending:'badge-yellow', processing:'badge-blue', failed:'badge-red' }
    return <span className={`badge ${map[s]||'badge-gray'}`}>{s}</span>
  }

  const net = Number(form.basic_salary||0) + Number(form.allowances||0) + Number(form.overtime_pay||0) - Number(form.deductions||0) - Number(form.tax||0)

  return (
    <div style={{ padding:'2rem', maxWidth:1300 }} className="animate-fade">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'2rem', flexWrap:'wrap', gap:'1rem' }}>
        <div>
          <h1 style={{ fontSize:'1.75rem', fontWeight:700, letterSpacing:'-0.02em' }}>Payroll</h1>
          <p style={{ color:'var(--text-secondary)', marginTop:'0.25rem' }}>Manage salaries and payment processing</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setForm({ employee_id:'', basic_salary:'', allowances:'0', overtime_pay:'0', deductions:'0', tax:'0', payment_method:'bank_transfer', notes:'' }); setShowModal(true) }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M12 5v14M5 12h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/></svg>
          Add Payroll Entry
        </button>
      </div>

     
      <div className="card" style={{ padding:'1rem 1.25rem', marginBottom:'1.5rem', display:'flex', gap:'0.75rem', alignItems:'center', flexWrap:'wrap' }}>
        <select className="input" style={{ width:'auto', minWidth:140 }} value={month} onChange={e => setMonth(Number(e.target.value))}>
          {MONTHS.map((m,i) => <option key={i} value={i+1}>{m}</option>)}
        </select>
        <select className="input" style={{ width:'auto', minWidth:100 }} value={year} onChange={e => setYear(Number(e.target.value))}>
          {[2023,2024,2025,2026].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
        <span style={{ color:'var(--text-muted)', fontSize:'0.85rem' }}>{MONTHS[month-1]} {year} payroll</span>
      </div>

      {summary && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(180px,1fr))', gap:'0.75rem', marginBottom:'1.5rem' }}>
          {[
            { label:'Total Payroll', val: fmt(summary.total_payroll), color:'#5c7cfa' },
            { label:'Total Basic', val: fmt(summary.total_basic), color:'#10b981' },
            { label:'Total Deductions', val: fmt(summary.total_deductions), color:'#ef4444' },
            { label:'Total Tax', val: fmt(summary.total_tax), color:'#f59e0b' },
            { label:'Paid', val: String(summary.paid_count), color:'#10b981' },
            { label:'Pending', val: String(summary.pending_count), color:'#f59e0b' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding:'1rem' }}>
              <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.4rem' }}>{s.label}</div>
              <div style={{ fontSize:'1.2rem', fontWeight:700, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
      )}

      <div className="card" style={{ overflow:'hidden' }}>
        {loading ? (
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', padding:'3rem', color:'var(--text-muted)', gap:'0.75rem' }}>
            <svg className="spin" width="18" height="18" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/></svg>
            Loading payroll...
          </div>
        ) : records.length === 0 ? (
          <div style={{ textAlign:'center', padding:'3rem', color:'var(--text-muted)' }}>
            <div style={{ fontSize:'2.5rem', marginBottom:'0.75rem' }}>💰</div>
            <div style={{ fontWeight:500 }}>No payroll records</div>
            <div style={{ fontSize:'0.85rem', marginTop:'0.25rem' }}>Add payroll entries for {MONTHS[month-1]} {year}</div>
          </div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Basic</th>
                  <th>Allowances</th>
                  <th>Overtime</th>
                  <th>Deductions</th>
                  <th>Tax</th>
                  <th>Net Salary</th>
                  <th>Status</th>
                  <th>Method</th>
                  <th style={{ textAlign:'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {records.map((r, i) => (
                  <tr key={r.id}>
                    <td>
                      <div style={{ display:'flex', alignItems:'center', gap:'0.5rem' }}>
                        <div style={{ width:30, height:30, borderRadius:'50%', background:`linear-gradient(135deg, hsl(${i*60+200},65%,50%), hsl(${i*60+240},65%,40%))`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:700, flexShrink:0 }}>
                          {r.first_name[0]}{r.last_name[0]}
                        </div>
                        <div>
                          <div style={{ fontWeight:500, fontSize:'0.875rem' }}>{r.first_name} {r.last_name}</div>
                          <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>{r.emp_code}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ fontFamily:'DM Mono, monospace', fontSize:'0.82rem' }}>{fmt(r.basic_salary)}</td>
                    <td style={{ fontFamily:'DM Mono, monospace', fontSize:'0.82rem', color:'#10b981' }}>+{fmt(r.allowances)}</td>
                    <td style={{ fontFamily:'DM Mono, monospace', fontSize:'0.82rem', color:'#3b82f6' }}>+{fmt(r.overtime_pay)}</td>
                    <td style={{ fontFamily:'DM Mono, monospace', fontSize:'0.82rem', color:'#ef4444' }}>-{fmt(r.deductions)}</td>
                    <td style={{ fontFamily:'DM Mono, monospace', fontSize:'0.82rem', color:'#f59e0b' }}>-{fmt(r.tax)}</td>
                    <td style={{ fontFamily:'DM Mono, monospace', fontSize:'0.85rem', fontWeight:700 }}>{fmt(r.net_salary)}</td>
                    <td>{statusBadge(r.payment_status)}</td>
                    <td style={{ fontSize:'0.8rem', color:'var(--text-secondary)', textTransform:'capitalize' }}>{r.payment_method?.replace('_',' ')}</td>
                    <td>
                      <div style={{ display:'flex', gap:'0.375rem', justifyContent:'flex-end' }}>
                        {r.payment_status !== 'paid' && (
                          <button className="btn btn-ghost btn-sm" style={{ color:'#10b981', borderColor:'rgba(16,185,129,0.3)' }}
                            onClick={() => updateStatus(r.id,'paid')} disabled={updatingId===r.id}>
                            {updatingId===r.id ? '...' : 'Mark Paid'}
                          </button>
                        )}
                        {r.payment_status === 'pending' && (
                          <button className="btn btn-ghost btn-sm" onClick={() => updateStatus(r.id,'processing')} disabled={updatingId===r.id}>
                            Process
                          </button>
                        )}
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
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:'1rem' }}>
          <div className="card animate-fade" style={{ width:'100%', maxWidth:560, maxHeight:'90vh', overflow:'auto' }}>
            <div style={{ padding:'1.5rem', borderBottom:'1px solid var(--border)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'var(--bg-card)', zIndex:1 }}>
              <h2 style={{ fontWeight:600, fontSize:'1.1rem' }}>Add Payroll Entry — {MONTHS[month-1]} {year}</h2>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowModal(false)} style={{ padding:'0.3rem 0.6rem' }}>✕</button>
            </div>
            <div style={{ padding:'1.5rem', display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
              <div style={{ gridColumn:'span 2' }}>
                <label className="form-label">Employee</label>
                <select className="input" value={form.employee_id} onChange={e => {
                  const emp = employees.find(x => x.id === Number(e.target.value))
                  setForm(p => ({...p, employee_id:e.target.value, basic_salary: emp?.salary ? String(emp.salary) : p.basic_salary}))
                }}>
                  <option value="">Select Employee</option>
                  {employees.map(e => <option key={e.id} value={e.id}>{e.first_name} {e.last_name} ({e.employee_id})</option>)}
                </select>
              </div>
              {[
                { label:'Basic Salary (PKR)', key:'basic_salary' },
                { label:'Allowances (PKR)', key:'allowances' },
                { label:'Overtime Pay (PKR)', key:'overtime_pay' },
                { label:'Deductions (PKR)', key:'deductions' },
                { label:'Tax (PKR)', key:'tax' },
              ].map(f => (
                <div key={f.key}>
                  <label className="form-label">{f.label}</label>
                  <input className="input" type="number" value={(form)[f.key]}
                    onChange={e => setForm(p => ({...p, [f.key]:e.target.value}))} />
                </div>
              ))}
              <div>
                <label className="form-label">Payment Method</label>
                <select className="input" value={form.payment_method} onChange={e => setForm(p => ({...p, payment_method:e.target.value}))}>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="cash">Cash</option>
                  <option value="cheque">Cheque</option>
                </select>
              </div>
              <div style={{ gridColumn:'span 2' }}>
                <label className="form-label">Notes</label>
                <input className="input" placeholder="Optional notes..." value={form.notes} onChange={e => setForm(p => ({...p, notes:e.target.value}))} />
              </div>

              <div style={{ gridColumn:'span 2', background:'var(--bg-elevated)', borderRadius:8, padding:'1rem', border:'1px solid var(--border)' }}>
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600, marginBottom:'0.5rem', textTransform:'uppercase', letterSpacing:'0.05em' }}>Net Salary Preview</div>
                <div style={{ fontSize:'1.5rem', fontWeight:700, color: net >= 0 ? '#10b981' : '#ef4444' }}>PKR {net.toLocaleString()}</div>
              </div>
            </div>
            <div style={{ padding:'1rem 1.5rem', borderTop:'1px solid var(--border)', display:'flex', gap:'0.75rem', justifyContent:'flex-end' }}>
              <button className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave} disabled={saving || !form.employee_id || !form.basic_salary}>
                {saving ? 'Saving...' : 'Add Payroll'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
