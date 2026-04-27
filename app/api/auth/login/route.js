import { NextResponse } from 'next/server'


const users = [
  {
    email: 'admin@hrms.com',
    password: 'admin123',
    name: 'Admin'
  }
]

export async function POST(req) {
  try {
    const body = await req.json()

    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password required' },
        { status: 400 }
      )
    }

    const user = users.find(
      (u) => u.email === email && u.password === password
    )

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      message: 'Login successful',
      user: {
        email: user.email,
        name: user.name
      }
    })

  } catch (err) {
    console.error('LOGIN ERROR:', err)

    return NextResponse.json(
      { error: 'Server error' },
      { status: 500 }
    )
  }
}