'use client'
import { useEffect, useState } from 'react'

export default function Splash({ onDone }: { onDone: () => void }) {
  const [fase, setFase] = useState<'logo' | 'saindo'>('logo')

  useEffect(() => {
    const t1 = setTimeout(() => setFase('saindo'), 1800)
    const t2 = setTimeout(() => onDone(), 2200)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [onDone])

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'linear-gradient(135deg, #5B6FE8 0%, #7B8FF5 60%, #9BB0FF 100%)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        transition: 'opacity 400ms ease',
        opacity: fase === 'saindo' ? 0 : 1,
        pointerEvents: fase === 'saindo' ? 'none' : 'all',
      }}
    >
      {/* Blobs decorativos */}
      <div style={{
        position: 'absolute', width: 200, height: 200, borderRadius: '50%',
        background: 'rgba(255,255,255,0.08)', top: -60, right: -60,
      }} />
      <div style={{
        position: 'absolute', width: 160, height: 160, borderRadius: '50%',
        background: 'rgba(255,255,255,0.06)', bottom: -40, left: -40,
      }} />

      {/* Logo */}
      <div
        style={{
          width: 110, height: 110, borderRadius: '50%',
          background: 'white',
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          animation: 'splash-logo-in 0.6s cubic-bezier(0.34,1.56,0.64,1) forwards',
          overflow: 'hidden',
        }}
      >
        <img src="/logo-deep.png" alt="Acamp Deep" width={110} height={110} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <p style={{
        color: 'rgba(255,255,255,0.9)', fontFamily: 'Poppins, sans-serif',
        fontSize: 22, fontWeight: 700, marginTop: 20,
        letterSpacing: '-0.02em', animation: 'fade-up 0.5s ease 0.3s both',
      }}>
        Acamp Deep
      </p>
      <p style={{
        color: 'rgba(255,255,255,0.6)', fontFamily: 'Poppins, sans-serif',
        fontSize: 13, fontWeight: 400, marginTop: 4,
        animation: 'fade-up 0.5s ease 0.5s both',
      }}>
        Sua jornada começa aqui ✨
      </p>

      <style>{`
        @keyframes splash-logo-in {
          from { transform: scale(0.4) rotate(-10deg); opacity: 0; }
          to { transform: scale(1) rotate(0deg); opacity: 1; }
        }
        @keyframes fade-up {
          from { transform: translateY(12px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  )
}
