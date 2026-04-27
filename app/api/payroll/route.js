import { NextResponse } from "next/server"
import sql from "@/lib/db"
import { getAuthUser } from "@/lib/auth"

export async function GET(req) {
  const user = getAuthUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const month = searchParams.get("month") || new Date().getMonth() + 1
  const year = searchParams.get("year") || new Date().getFullYear()

  const records = await sql`
    SELECT p.*, e.first_name, e.last_name, e.employee_id as emp_code, e.position, d.name as department_name
    FROM payroll p
    JOIN employees e ON p.employee_id = e.id
    LEFT JOIN departments d ON e.department_id = d.id
    WHERE p.month=${month} AND p.year=${year}
    ORDER BY e.first_name`

  const summary = await sql`
    SELECT
      SUM(net_salary) as total_payroll,
      SUM(basic_salary) as total_basic,
      SUM(deductions) as total_deductions,
      SUM(tax) as total_tax,
      COUNT(*) FILTER (WHERE payment_status='paid') as paid_count,
      COUNT(*) FILTER (WHERE payment_status='pending') as pending_count
    FROM payroll WHERE month=${month} AND year=${year}`

  return NextResponse.json({ records, summary: summary[0] })
}

export async function POST(req) {
  const user = getAuthUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const body = await req.json()
    const {
      employee_id,
      month,
      year,
      basic_salary,
      allowances,
      overtime_pay,
      deductions,
      tax,
      payment_method,
      notes
    } = body

    const net_salary =
      Number(basic_salary) +
      Number(allowances || 0) +
      Number(overtime_pay || 0) -
      Number(deductions || 0) -
      Number(tax || 0)

    const result = await sql`
      INSERT INTO payroll (employee_id, month, year, basic_salary, allowances, overtime_pay, deductions, tax, net_salary, payment_method, notes)
      VALUES (${employee_id}, ${month}, ${year}, ${basic_salary}, ${allowances ||
      0}, ${overtime_pay || 0}, ${deductions || 0}, ${tax ||
      0}, ${net_salary}, ${payment_method || "bank_transfer"}, ${notes || null})
      ON CONFLICT (employee_id, month, year)
      DO UPDATE SET basic_salary=${basic_salary}, allowances=${allowances ||
      0}, overtime_pay=${overtime_pay || 0}, deductions=${deductions ||
      0}, tax=${tax ||
      0}, net_salary=${net_salary}, payment_method=${payment_method ||
      "bank_transfer"}, notes=${notes || null}
      RETURNING *`

    return NextResponse.json({ record: result[0] }, { status: 201 })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}

export async function PUT(req) {
  const user = getAuthUser()
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  try {
    const { id, payment_status } = await req.json()
    const payment_date =
      payment_status === "paid" ? new Date().toISOString().split("T")[0] : null

    const result = await sql`
      UPDATE payroll SET payment_status=${payment_status}, payment_date=${payment_date}
      WHERE id=${id} RETURNING *`

    return NextResponse.json({ record: result[0] })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
