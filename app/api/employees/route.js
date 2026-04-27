import { NextResponse } from 'next/server'
import { neon } from '@neondatabase/serverless'

const sql = neon(process.env.DATABASE_URL)

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)

    const search = searchParams.get("search") || ""
    const dept = searchParams.get("department") || ""
    const status = searchParams.get("status") || ""

    const employees = await sql`
      SELECT e.*, d.name AS department_name
      FROM employees e
      LEFT JOIN departments d ON e.department_id = d.id
      WHERE 1=1
      ${search ? sql`AND (e.first_name ILIKE ${'%' + search + '%'} OR e.last_name ILIKE ${'%' + search + '%'})` : sql``}
      ${dept ? sql`AND e.department_id = ${dept}` : sql``}
      ${status ? sql`AND e.status = ${status}` : sql``}
      ORDER BY e.created_at DESC
    `

    const departments = await sql`
      SELECT * FROM departments ORDER BY name
    `

    return NextResponse.json({ employees, departments })

  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const body = await req.json();

    const required = ['first_name', 'last_name', 'email', 'position', 'employment_type', 'hire_date'];
    const missing = required.filter(field => !body[field]);

    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(', ')}` },
        { status: 400 }
      );
    }

    const result = await sql`
      INSERT INTO employees (
        employee_id, first_name, last_name, email, phone,
        department_id, position, employment_type, status,
        hire_date, salary, address
      )
      VALUES (
      ${body.employee_id || `EMP-${Date.now()}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`},
        ${body.first_name},
        ${body.last_name},
        ${body.email},
        ${body.phone || null},          
        ${body.department_id || null},
        ${body.position},
        ${body.employment_type},
        ${body.status || 'active'},
        ${body.hire_date},
        ${body.salary || 0},
        ${body.address || null}         
      )
      RETURNING *
    `;
   return NextResponse.json({ employee: result[0] }, { status: 201 });

  } catch (err) {
    if (err.code === '23505') {
      return NextResponse.json(
        { error: 'An employee with this email or ID already exists' },
        { status: 409 }
      );
    }
      console.error('DB ERROR CODE:', err.code)
  console.error('DB ERROR MSG:', err.message)
    console.error('Employee POST error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(req) {
  try {
    const body = await req.json()

    if (!body.id) {
      return NextResponse.json({ error: 'Employee ID is required' }, { status: 400 })
    }

    const result = await sql`
      UPDATE employees SET
        first_name = ${body.first_name},
        last_name = ${body.last_name},
        email = ${body.email},
        phone = ${body.phone || null},
        department_id = ${body.department_id || null},
        position = ${body.position},
        employment_type = ${body.employment_type},
        status = ${body.status},
        hire_date = ${body.hire_date},
        salary = ${body.salary || 0},
        address = ${body.address || null}
      WHERE id = ${body.id}
      RETURNING *
    `

    return NextResponse.json({ employee: result[0] })

  } catch (err) {
    console.error('Employee PUT error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

export async function DELETE(req) {
  const { searchParams } = new URL(req.url)
  const id = searchParams.get('id')

  await sql`DELETE FROM employees WHERE id=${id}`

  return NextResponse.json({ success: true })
}