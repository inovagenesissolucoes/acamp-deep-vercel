'use client'
import { useEffect, useState, useRef } from 'react'

interface Props {
  dataAlvo: string // ISO string
}

interface Tempo { dias: number; horas: number; minutos: number; segundos: number }

function calcular(alvo: Date): Tempo {
  const diff = Math.max(0, alvo.getTime() - Date.now())
  return {
    dias: Math.floor(diff / 86400000),
    horas: Math.floor((diff % 86400000) / 3600000),
    minutos: Math.floor((diff % 3600000) / 60000),
    segundos: Math.floor((diff % 60000) / 1000),
  }
}

function Digito({ valor, label }: { valor: number; label: string }) {
  const [prev, setPrev] = useState(valor)
  const [flip, setFlip] = useState(false)
  const str = String(valor).padStart(2, '0')
  const prevStr = String(prev).padStart(2, '0')

  useEffect(() => {
    if (valor !== prev) {
      setFlip(true)
      const t = setTimeout(() => { setPrev(valor); setFlip(false) }, 280)
      return () => clearTimeout(t)
    }
  }, [valor, prev])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        background: 'rgba(255,255,255,0.15)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(255,255,255,0.3)',
        borderRadius: 12,
        width: 64, height: 64,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden', position: 'relative',
      }}>
        <span style={{
          fontFamily: 'Poppins, sans-serif', fontSize: 28, fontWeight: 700,
          color: 'white', letterSpacing: '-0.02em',
          display: 'block',
          transition: 'transform 280ms ease, opacity 280ms ease',
          transform: flip ? 'rotateX(-90deg)' : 'rotateX(0deg)',
          opacity: flip ? 0 : 1,
        }}>
          {flip ? prevStr : str}
        </span>
      </div>
      <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
        {label}
      </span>
    </div>
  )
}

export default function Countdown({ dataAlvo }: Props) {
  const alvo = new Date(dataAlvo)
  const [tempo, setTempo] = useState<Tempo>(calcular(alvo))

  useEffect(() => {
    const id = setInterval(() => setTempo(calcular(alvo)), 1000)
    return () => clearInterval(id)
  }, [dataAlvo])

  const encerrado = tempo.dias === 0 && tempo.horas === 0 && tempo.minutos === 0 && tempo.segundos === 0

  if (encerrado) {
    return (
      <div style={{ textAlign: 'center', color: 'rgba(255,255,255,0.8)', fontFamily: 'Poppins, sans-serif', fontSize: 15, fontWeight: 500 }}>
        🎉 O evento começou!
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', justifyContent: 'center' }}>
      <Digito valor={tempo.dias} label="dias" />
      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 28, fontWeight: 700, marginTop: 16 }}>:</span>
      <Digito valor={tempo.horas} label="horas" />
      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 28, fontWeight: 700, marginTop: 16 }}>:</span>
      <Digito valor={tempo.minutos} label="min" />
      <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: 28, fontWeight: 700, marginTop: 16 }}>:</span>
      <Digito valor={tempo.segundos} label="seg" />
    </div>
  )
}
