import { redirect } from 'next/navigation'
import { getAuthUser } from '@/lib/auth'
import Sidebar from '@/components/Sidebar'

export default function AppLayout({ children }) {
  const user = getAuthUser()
  if (!user) redirect('/login')

  return (
    <div style={{ display:'flex', minHeight:'100vh' }}>
      <Sidebar userName={user.name} userRole={user.role} />
      <main style={{ flex:1, overflow:'auto', minHeight:'100vh' }}>
        {children}
      </main>
    </div>
  )
}
