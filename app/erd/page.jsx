'use client'

import { useEffect, useState } from 'react'
import { Spin } from 'antd'

export default function ErdPage() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/erd')
      .then(res => res.json())
      .then(d => {
        setData(d)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh'
      }}>
        <Spin size="large" />
      </div>
    )
  }

  if (!data) return null

  return (
    <div style={{ padding: '2rem', maxWidth: 1200 }}>

      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700 }}>
          ERD Overview
        </h1>
        <p style={{ color: 'var(--text-secondary)' }}>
          Visual representation of your database structure
        </p>
      </div>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px,1fr))',
        gap: '1rem',
        marginBottom: '2rem'
      }}>
        {[
          { label: 'Total Tables', value: data.stats.tables, icon: '📦' },
          { label: 'Relationships', value: data.stats.relations, icon: '🔗' },
          { label: 'Columns', value: data.stats.columns, icon: '📊' },
        ].map((s, i) => (
          <div key={i} className="card" style={{ padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: 'gray' }}>
                  {s.label}
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>
                  {s.value}
                </div>
              </div>
              <div style={{ fontSize: '1.5rem' }}>{s.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tables List */}
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <h2 style={{ fontWeight: 600, marginBottom: '1rem' }}>
          Database Tables
        </h2>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {data.tables.map((t, i) => (
            <div key={i} style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderBottom: '1px solid #eee',
              paddingBottom: '0.5rem'
            }}>
              <span>{t.name}</span>
              <span style={{ color: 'gray', fontSize: '0.8rem' }}>
                {t.columns} columns
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* PDF Viewer (Keep it like before) */}
      <div className="card" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontWeight: 600, marginBottom: '1rem' }}>
          ERD Diagram
        </h2>

        <iframe
          src="/Erd.pdf"
          style={{ width: '100%', height: '500px', borderRadius: 10 }}
        />

        <div style={{ marginTop: '1rem', display: 'flex', gap: '1rem' }}>
          <a href="/Erd.pdf" target="_blank">Open Full Screen</a>
          <a href="/Erd.pdf" download>Download</a>
        </div>
      </div>

    </div>
  )
}