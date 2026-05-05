'use client'
import { usePathname, useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button, Menu } from 'antd'
import {
  DashboardOutlined,
  TeamOutlined,
  CalendarOutlined,
  DollarOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  LogoutOutlined,
  EuroOutlined,
} from '@ant-design/icons'

export default function Sidebar({ userName = '', userRole = '' }) {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  const toggleCollapsed = () => {
    setCollapsed(!collapsed)
  }

  async function handleLogout() {
    setLoggingOut(true)
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
  }

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
    },
    {
      key: '/employees',
      icon: <TeamOutlined />,
      label: 'Employees',
    },
    {
      key: '/attendance',
      icon: <CalendarOutlined />,
      label: 'Attendance',
    },
    {
      key: '/payroll',
      icon: <DollarOutlined />,
      label: 'Payroll',
    },
     {
      key: '/erd',
      icon: <EuroOutlined />,
      label: 'ERD',
    },
  ]
  
  return (

    <aside
      style={{
        width: collapsed ? 80 : 240,
        height: '100vh',
        background: '#001529',
        display: 'flex',
        flexDirection: 'column',
        position: 'sticky',
        top: 0,
      }}
    >

      <div style={{ padding: 16 }}>
        <Button type="primary" onClick={toggleCollapsed} style={{ width: '100%' }}>
          {collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        </Button>
      </div>

      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={[pathname]}
        inlineCollapsed={collapsed}
        items={menuItems}
        onClick={({ key }) => router.push(key)}
      />

      <div style={{ marginTop: 'auto', padding: 16 }}>
        {!collapsed && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontWeight: 600 }}>{userName || 'Loading...'}</div>
            <div style={{ fontSize: 12, opacity: 0.7 }}>
              {userRole || '—'}
            </div>
          </div>
        )}

        <Button
          danger
          icon={<LogoutOutlined />}
          loading={loggingOut}
          onClick={handleLogout}
          style={{ width: '100%' }}
        >
          {!collapsed && 'Logout'}
        </Button>
        
      </div>
    </aside>
  )
}