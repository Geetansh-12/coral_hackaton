import { NextResponse } from 'next/server'

// We use a global variable to persist mode across hot reloads in dev
declare global {
  var DEMO_MODE: boolean | undefined;
}

if (typeof global.DEMO_MODE === 'undefined') {
  global.DEMO_MODE = process.env.DEMO_MODE !== 'false';
}

export async function GET() {
  return NextResponse.json({ demoMode: global.DEMO_MODE })
}

export async function POST(req: Request) {
  try {
    const { demoMode } = await req.json()
    global.DEMO_MODE = !!demoMode
    return NextResponse.json({ success: true, demoMode: global.DEMO_MODE })
  } catch (err) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }
}
