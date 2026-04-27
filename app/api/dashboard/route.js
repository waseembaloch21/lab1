import { NextResponse } from "next/server"
import sql from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function GET() {
  const user = getAuthUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const now = new Date()
  const month = now.getMonth() + 1
  const year = now.getFullYear()
  const today = now.toISOString().split("T")[0]

  const [empStats] = await sql`
    SELECT
      COUNT(*) as total,
      COUNT(*) FILTER (WHERE status='active') as active,
      COUNT(*) FILTER (WHERE status='on-leave') as on_leave,
      COUNT(*) FILTER (WHERE hire_date >= NOW() - INTERVAL '30 days') as new_this_month
    FROM employees`

  const [attStats] = await sql`
    SELECT
      COUNT(*) FILTER (WHERE status='present') as present,
      COUNT(*) FILTER (WHERE status='absent') as absent,
      COUNT(*) FILTER (WHERE status='late') as late,
      COUNT(*) FILTER (WHERE status='remote') as remote
    FROM attendance WHERE date=${today}`

  const [payStats] = await sql`
    SELECT
      COALESCE(SUM(net_salary),0) as total_payroll,
      COUNT(*) FILTER (WHERE payment_status='paid') as paid,
      COUNT(*) FILTER (WHERE payment_status='pending') as pending
    FROM payroll WHERE month=${month} AND year=${year}`

  const recentEmployees = await sql`
    SELECT e.first_name, e.last_name, e.position, e.hire_date, d.name as department_name
    FROM employees e LEFT JOIN departments d ON e.department_id = d.id
    ORDER BY e.created_at DESC LIMIT 5`

  const deptBreakdown = await sql`
    SELECT d.name, COUNT(e.id) as count
    FROM departments d LEFT JOIN employees e ON e.department_id = d.id AND e.status='active'
    GROUP BY d.name ORDER BY count DESC`

  return NextResponse.json({
    empStats,
    attStats,
    payStats,
    recentEmployees,
    deptBreakdown
  })
}
