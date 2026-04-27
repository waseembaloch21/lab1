'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/><rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="2"/></svg>
  )},
  { href: '/employees', label: 'Employees', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><circle cx="9" cy="7" r="4" stroke="currentColor" strokeWidth="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
  )},
  { href: '/attendance', label: 'Attendance', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M16 2v4M8 2v4M3 10h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="m9 16 2 2 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
  )},
  { href: '/payroll', label: 'Payroll', icon: (
    <svg width="18" height="18" fill="none" viewBox="0 0 24 24"><rect x="2" y="5" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M2 10h20" stroke="currentColor" strokeWidth="2"/><circle cx="8" cy="15" r="1" fill="currentColor"/><circle cx="12" cy="15" r="1" fill="currentColor"/></svg>
  )},
]

export default function Sidebar({ userName = '', userRole = '' }) {
  const pathname = usePathname()
  const router = useRouter()
  const [loggingOut, setLoggingOut] = useState(false)

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const displayInitial = userName ? userName.charAt(0).toUpperCase() : '?'

  return (
    <aside style={{ width: 240, background:'var(--bg-card)', borderRight:'1px solid var(--border)', display:'flex', flexDirection:'column', height:'100vh', position:'sticky', top:0, flexShrink:0 }}>
     
      <div style={{ padding:'1.5rem 1.25rem', borderBottom:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <div style={{ width:36, height:36, borderRadius:9, background:'linear-gradient(135deg, var(--brand), #3b82f6)', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="#fff" strokeWidth="2" strokeLinecap="round"/>
              <circle cx="9" cy="7" r="4" stroke="#fff" strokeWidth="2"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" stroke="rgba(255,255,255,0.7)" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div>
            <div style={{ fontWeight:700, fontSize:'0.95rem', letterSpacing:'-0.01em' }}>HRMS</div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)' }}>Management System</div>
          </div>
        </div>
      </div>

     
      <nav style={{ padding:'1rem 0.75rem', flex:1, display:'flex', flexDirection:'column', gap:'0.25rem' }}>
        <div style={{ fontSize:'0.7rem', fontWeight:600, letterSpacing:'0.08em', color:'var(--text-muted)', padding:'0 0.5rem', marginBottom:'0.5rem' }}>NAVIGATION</div>
        {navItems.map(item => (
          <a key={item.href} href={item.href}
            className={`sidebar-link ${pathname.startsWith(item.href) ? 'active' : ''}`}>
            {item.icon}
            {item.label}
          </a>
        ))}
      </nav>

     
      <div style={{ padding:'1rem 0.75rem', borderTop:'1px solid var(--border)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.625rem', padding:'0.625rem', borderRadius:8, marginBottom:'0.5rem' }}>
          <div style={{ width:32, height:32, borderRadius:'50%', background:'linear-gradient(135deg, var(--brand), #8b5cf6)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.8rem', fontWeight:700, flexShrink:0 }}>
            {displayInitial}
          </div>
          <div style={{ overflow:'hidden' }}>
            <div style={{ fontSize:'0.85rem', fontWeight:600, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {userName || 'Loading...'}
            </div>
            <div style={{ fontSize:'0.72rem', color:'var(--text-muted)', textTransform:'capitalize' }}>
              {userRole || '—'}
            </div>
          </div>
        </div>
        <button className="btn btn-ghost" onClick={handleLogout} disabled={loggingOut}
          style={{ width:'100%', justifyContent:'flex-start', gap:'0.5rem', fontSize:'0.85rem' }}>
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          {loggingOut ? 'Signing out...' : 'Sign Out'}
        </button>
      </div>
    </aside>
  )
}