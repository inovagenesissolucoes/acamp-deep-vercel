import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const cookieStore = cookies()
    const sessao = cookieStore.get('acamp_sessao')?.value

    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(sessao ? { Cookie: `acamp_sessao=${sessao}` } : {}),
      },
      body: JSON.stringify(body),
      redirect: 'follow',
    })

    const data = await res.json()

    // Propagar cookie httpOnly do Apps Script para o browser
    const resHeaders = new Headers()
    const setCookie = res.headers.get('set-cookie')
    if (setCookie) resHeaders.set('set-cookie', setCookie)

    return NextResponse.json(data, { headers: resHeaders })
  } catch (e) {
    console.error('[RPC]', e)
    return NextResponse.json({ ok: false, erro: 'Erro interno do servidor.' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
