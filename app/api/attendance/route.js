import { NextResponse } from "next/server"
import sql from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function GET(req) {
  try {
    const user = getAuthUser()

    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(req.url)

    const month = Number(searchParams.get("month")) || (new Date().getMonth() + 1)
    const year = Number(searchParams.get("year")) || new Date().getFullYear()
    const employee_id = searchParams.get("employee_id")

    let records

    if (employee_id) {
      records = await sql`
        SELECT a.*, e.first_name, e.last_name, e.employee_id as emp_code
        FROM attendance a 
        JOIN employees e ON a.employee_id = e.id
        WHERE a.employee_id = ${Number(employee_id)}
        AND EXTRACT(MONTH FROM a.date) = ${month}
        AND EXTRACT(YEAR FROM a.date) = ${year}
        ORDER BY a.date DESC
      `
    } else {
      records = await sql`
        SELECT a.*, e.first_name, e.last_name, e.employee_id as emp_code, d.name as department_name
        FROM attendance a
        JOIN employees e ON a.employee_id = e.id
        LEFT JOIN departments d ON e.department_id = d.id
        WHERE EXTRACT(MONTH FROM a.date) = ${month}
        AND EXTRACT(YEAR FROM a.date) = ${year}
        ORDER BY a.date DESC, e.first_name
      `
    }

    const stats = await sql`
      SELECT
        COUNT(*) FILTER (WHERE status='present') as present,
        COUNT(*) FILTER (WHERE status='absent') as absent,
        COUNT(*) FILTER (WHERE status='late') as late,
        COUNT(*) FILTER (WHERE status='half-day') as half_day,
        COUNT(*) FILTER (WHERE status='remote') as remote
      FROM attendance
      WHERE EXTRACT(MONTH FROM date) = ${month}
      AND EXTRACT(YEAR FROM date) = ${year}
    `

    return NextResponse.json({
      records,
      stats: stats[0] || {},
    })

  } catch (err) {
    console.error("ATTENDANCE GET ERROR:", err)

    return NextResponse.json(
      { error: err.message || "Server error" },
      { status: 500 }
    )
  }
}

export async function POST(req) {
  try {
    const user = getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    if (!body.employee_id || !body.date) {
      return NextResponse.json(
        { error: 'Employee and date are required' },
        { status: 400 }
      )
    }

    
    let hours_worked = null
    if (body.check_in && body.check_out) {
      const [inH, inM] = body.check_in.split(':').map(Number)
      const [outH, outM] = body.check_out.split(':').map(Number)
      hours_worked = ((outH * 60 + outM) - (inH * 60 + inM)) / 60
    }

    const result = await sql`
      INSERT INTO attendance (employee_id, date, check_in, check_out, hours_worked, status, notes)
      VALUES (
        ${Number(body.employee_id)},
        ${body.date},
        ${body.check_in || null},
        ${body.check_out || null},
        ${hours_worked},
        ${body.status || 'present'},
        ${body.notes || null}
      )
      ON CONFLICT (employee_id, date)
      DO UPDATE SET
        check_in      = EXCLUDED.check_in,
        check_out     = EXCLUDED.check_out,
        hours_worked  = EXCLUDED.hours_worked,
        status        = EXCLUDED.status,
        notes         = EXCLUDED.notes
      RETURNING *
    `

    return NextResponse.json({ record: result[0] }, { status: 201 })

  } catch (err) {
    console.error('Attendance POST error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  try {
    const user = getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 })
    }

    await sql`DELETE FROM attendance WHERE id = ${Number(id)}`
    return NextResponse.json({ success: true })

  } catch (err) {
    console.error('Attendance DELETE error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}