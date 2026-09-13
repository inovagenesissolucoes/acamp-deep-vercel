import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

const APPS_SCRIPT_URL = process.env.APPS_SCRIPT_URL!

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const cookieStore = cookies()
    const sessao = cookieStore.get('acamp_sessao')?.value

    // O Apps Script não lê headers customizados (Cookie) da requisição,
    // só query params e o corpo do POST — então o token vai no body.
    const res = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...body, _token: sessao }),
      redirect: 'follow',
    })

    const data = await res.json()

    // O Apps Script não suporta Set-Cookie, então o token de sessão vem
    // dentro do JSON (data._token). É o Next.js quem cria o cookie httpOnly.
    const response = NextResponse.json(data)
    if (data?._token) {
      response.cookies.set('acamp_sessao', data._token, {
        httpOnly: true,
        path: '/',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 dias
      })
      delete data._token
    }

    return response
  } catch (e) {
    console.error('[RPC]', e)
    return NextResponse.json({ ok: false, erro: 'Erro interno do servidor.' }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ status: 'ok' })
}
