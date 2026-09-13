import { NextRequest, NextResponse } from 'next/server'
import webpush from 'web-push'

webpush.setVapidDetails(
  `mailto:${process.env.VAPID_EMAIL}`,
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!,
)

export async function POST(req: NextRequest) {
  try {
    const { subscription, title, body, url } = await req.json()

    if (!subscription?.endpoint) {
      return NextResponse.json({ ok: false, erro: 'Subscription inválida.' }, { status: 400 })
    }

    await webpush.sendNotification(
      subscription,
      JSON.stringify({ title, body, url }),
    )

    return NextResponse.json({ ok: true })
  } catch (e) {
    console.error('[PUSH]', e)
    return NextResponse.json({ ok: false, erro: 'Falha ao enviar notificação.' }, { status: 500 })
  }
}
