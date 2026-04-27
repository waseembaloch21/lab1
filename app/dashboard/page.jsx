'use client'
import { useEffect, useState } from 'react'

const fmt = (n) => {
  return new Intl.NumberFormat('en-PK').format(n || 0)
}

export default function DashboardPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/dashboard').then(r => r.json()).then(d => { setData(d); setLoading(false) })
  }, [])

  if (loading) return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--text-muted)', gap:'0.75rem' }}>
      <svg className="spin" width="20" height="20" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10"/></svg>
      Loading dashboard...
    </div>
  )

  if (!data) return null

  return (
    <div style={{ padding:'2rem', maxWidth:1200 }} className="animate-fade">
      {/* Header */}
      <div style={{ marginBottom:'2rem' }}>
        <h1 style={{ fontSize:'1.75rem', fontWeight:700, letterSpacing:'-0.02em' }}>Dashboard</h1>
        <p style={{ color:'var(--text-secondary)', marginTop:'0.25rem' }}>
          {new Date().toLocaleDateString('en-US', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}
        </p>
      </div>

      {/* Stat Cards */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(220px,1fr))', gap:'1rem', marginBottom:'1.5rem' }}>
        {[
          { label:'Total Employees', value: fmt(data.empStats.total), sub:`${data.empStats.active} active`, icon:'👥', cls:'stat-blue' },
          { label:'Present Today', value: fmt(data.attStats.present), sub:`${data.attStats.late} late · ${data.attStats.remote} remote`, icon:'✅', cls:'stat-green' },
          { label:'Monthly Payroll', value:`PKR ${fmt(data.payStats.total_payroll)}`, sub:`${data.payStats.pending} pending`, icon:'💰', cls:'stat-yellow' },
          { label:'On Leave', value: fmt(data.empStats.on_leave), sub:`${data.empStats.new_this_month} new this month`, icon:'🏖️', cls:'stat-purple' },
        ].map(s => (
          <div key={s.label} className={`card stat-card ${s.cls}`} style={{ padding:'1.25rem' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
              <div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.05em', marginBottom:'0.5rem' }}>{s.label}</div>
                <div style={{ fontSize:'1.75rem', fontWeight:700, letterSpacing:'-0.02em' }}>{s.value}</div>
                <div style={{ fontSize:'0.8rem', color:'var(--text-secondary)', marginTop:'0.25rem' }}>{s.sub}</div>
              </div>
              <div style={{ fontSize:'1.75rem', opacity:0.8 }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1.5rem' }}>
        {/* Recent Employees */}
        <div className="card" style={{ padding:'1.5rem' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.25rem' }}>
            <h2 style={{ fontWeight:600, fontSize:'1rem' }}>Recent Employees</h2>
            <a href="/employees" style={{ fontSize:'0.8rem', color:'var(--brand)', textDecoration:'none' }}>View all →</a>
          </div>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.875rem' }}>
            {data.recentEmployees.map((emp, i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
                <div style={{ width:36, height:36, borderRadius:'50%', background:`linear-gradient(135deg, hsl(${i*60+200},70%,50%), hsl(${i*60+240},70%,40%))`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.85rem', fontWeight:700, flexShrink:0 }}>
                  {emp.first_name[0]}{emp.last_name[0]}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:500, fontSize:'0.9rem' }}>{emp.first_name} {emp.last_name}</div>
                  <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{emp.position} · {emp.department_name}</div>
                </div>
                <div style={{ fontSize:'0.75rem', color:'var(--text-muted)', flexShrink:0 }}>
                  {new Date(emp.hire_date).toLocaleDateString('en-US', { month:'short', day:'numeric' })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dept Breakdown */}
        <div className="card" style={{ padding:'1.5rem' }}>
          <h2 style={{ fontWeight:600, fontSize:'1rem', marginBottom:'1.25rem' }}>Department Overview</h2>
          <div style={{ display:'flex', flexDirection:'column', gap:'0.75rem' }}>
            {data.deptBreakdown.map((d, i) => {
              const max = Math.max(...data.deptBreakdown.map(x => Number(x.count)))
              const pct = max > 0 ? (Number(d.count) / max) * 100 : 0
              const colors = ['#5c7cfa','#10b981','#f59e0b','#ef4444','#8b5cf6','#3b82f6']
              return (
                <div key={i}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'0.25rem' }}>
                    <span style={{ fontSize:'0.85rem' }}>{d.name}</span>
                    <span style={{ fontSize:'0.85rem', fontWeight:600, color:'var(--text-secondary)' }}>{d.count}</span>
                  </div>
                  <div style={{ height:6, borderRadius:3, background:'var(--bg-elevated)' }}>
                    <div style={{ height:'100%', borderRadius:3, width:`${pct}%`, background:colors[i%colors.length], transition:'width 0.6s ease' }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'1rem', marginTop:'1.5rem' }}>
        {[
          { href:'/employees', label:'Manage Employees', desc:'Add, edit employee records', icon:'👤', color:'#5c7cfa' },
          { href:'/attendance', label:'Mark Attendance', desc:'Track daily attendance', icon:'📅', color:'#10b981' },
          { href:'/payroll', label:'Process Payroll', desc:'Manage salary & payments', icon:'💳', color:'#f59e0b' },
        ].map(q => (
          <a key={q.href} href={q.href} style={{ textDecoration:'none' }}>
            <div className="card" style={{ padding:'1.25rem', cursor:'pointer', display:'flex', gap:'1rem', alignItems:'center' }}>
              <div style={{ width:44, height:44, borderRadius:10, background:`${q.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.25rem', flexShrink:0 }}>{q.icon}</div>
              <div>
                <div style={{ fontWeight:600, fontSize:'0.9rem' }}>{q.label}</div>
                <div style={{ fontSize:'0.78rem', color:'var(--text-muted)', marginTop:'0.15rem' }}>{q.desc}</div>
              </div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
