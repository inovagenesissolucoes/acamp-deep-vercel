'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Splash from '@/components/Splash'
import Countdown from '@/components/Countdown'
import GaleriaCarousel from '@/components/GaleriaCarousel'
import { listarGaleria, getEventoAtivo } from '@/lib/api'
import type { MidiaItem } from '@/components/GaleriaCarousel'
import type { Evento } from '@/components/EventoCard'

export default function HomePage() {
  const router = useRouter()
  const [showSplash, setShowSplash] = useState(true)
  const [galeria, setGaleria] = useState<MidiaItem[]>([])
  const [evento, setEvento] = useState<Evento | null>(null)

  useEffect(() => {
    listarGaleria().then(r => { if (r.ok && r.data) setGaleria(r.data as MidiaItem[]) })
    getEventoAtivo().then(r => { if (r.ok && r.data) setEvento(r.data as Evento) })
  }, [])

  if (showSplash) {
    return <Splash onDone={() => setShowSplash(false)} />
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* HERO com gradiente */}
      <div style={{
        background: 'linear-gradient(135deg, #5B6FE8 0%, #7B8FF5 60%, #9BB0FF 100%)',
        padding: '48px 16px 40px',
        position: 'relative',
        overflow: 'hidden',
        flexShrink: 0,
      }}>
        {/* Blobs */}
        <div style={{ position: 'absolute', width: 220, height: 220, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: -80, right: -60, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', bottom: -40, left: -40, pointerEvents: 'none' }} />

        {/* Logo */}
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'white', boxShadow: '0 6px 30px rgba(0,0,0,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            animation: 'fade-up 0.6s ease both',
          }}>
            <img src="/logo-deep.png" alt="Acamp Deep" width={62} height={62} style={{ objectFit: 'contain' }} />
          </div>
        </div>

        <h1 style={{
          fontFamily: 'Poppins, sans-serif', fontWeight: 800, fontSize: 26,
          color: 'white', textAlign: 'center', margin: '0 0 6px',
          letterSpacing: '-0.03em', animation: 'fade-up 0.6s ease 0.1s both',
        }}>
          Acamp Deep
        </h1>
        <p style={{
          fontFamily: 'Poppins, sans-serif', fontSize: 14, color: 'rgba(255,255,255,0.75)',
          textAlign: 'center', margin: '0 0 32px',
          animation: 'fade-up 0.6s ease 0.2s both',
        }}>
          Inscrições abertas para o próximo acampamento ✨
        </p>

        {/* Countdown */}
        {evento && (
          <div style={{ animation: 'fade-up 0.6s ease 0.3s both' }}>
            <p style={{
              fontFamily: 'Poppins, sans-serif', fontSize: 12, color: 'rgba(255,255,255,0.65)',
              textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.1em',
              margin: '0 0 14px',
            }}>
              Faltam para o {evento.nome}
            </p>
            <Countdown dataAlvo={evento.dataInicio} />
          </div>
        )}

        {/* Botão Entrar */}
        <div style={{ marginTop: 32, display: 'flex', justifyContent: 'center' }}>
          <button
            className="btn-primary"
            style={{ padding: '14px 40px', fontSize: 16 }}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10)
              router.push('/login')
            }}
          >
            Entrar no App
          </button>
        </div>
      </div>

      {/* GALERIA */}
      <div style={{ background: '#F5F5F5', padding: '28px 0', flex: 1 }}>
        <h2 style={{
          fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 16,
          color: 'var(--text-main)', letterSpacing: '-0.02em',
          padding: '0 16px', margin: '0 0 16px',
        }}>
          Momentos inesquecíveis 📷
        </h2>
        <GaleriaCarousel itens={galeria} />
      </div>

      <style>{`
        @keyframes fade-up {
          from { transform: translateY(16px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </main>
  )
}
