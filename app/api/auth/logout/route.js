import { NextResponse } from "next/server"

export async function POST() {
  const res = NextResponse.json({ success: true })
  res.cookies.set("hrms_token", "", { maxAge: 0 })
  return res
}
