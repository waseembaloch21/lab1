export async function GET() {
  return Response.json({
    stats: {
      tables: 5,
      relations: 4,
      columns: 32
    },
    tables: [
      { name: 'employees', columns: 10 },
      { name: 'departments', columns: 3 },
      { name: 'attendance', columns: 6 },
      { name: 'payroll', columns: 8 }
    ]
  })
}