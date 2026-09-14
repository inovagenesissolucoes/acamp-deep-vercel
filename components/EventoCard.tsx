'use client'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, DollarSign } from 'lucide-react'
import { useEffect, useState } from 'react'

export interface Evento {
  id: string
  nome: string
  dataInicio: string
  dataFim: string
  horario: string
  dataLimite: string
  valor: number
  status: 'aberto' | 'fechado'
  recomendacoes?: string
  chavePix?: string
  idadeAutorizacao?: number
  temExcecaoPrazo?: boolean
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

interface Tempo { dias: number; horas: number; minutos: number }

function calcularTempo(dataFimIso: string): Tempo {
  const diff = Math.max(0, new Date(dataFimIso).getTime() - Date.now())
  return {
    dias: Math.floor(diff / 86400000),
    horas: Math.floor((diff % 86400000) / 3600000),
    minutos: Math.floor((diff % 3600000) / 60000),
  }
}

export default function EventoCard({ evento, onClick }: { evento: Evento; onClick?: () => void }) {
  const router = useRouter()
  const [tempo, setTempo] = useState<Tempo | null>(null)

  useEffect(() => {
    setTempo(calcularTempo(evento.dataFim))
    const id = setInterval(() => setTempo(calcularTempo(evento.dataFim)), 30000)
    return () => clearInterval(id)
  }, [evento.dataFim])

  const handleClick = () => {
    if (navigator.vibrate) navigator.vibrate(10)
    onClick ? onClick() : router.push(`/evento/${evento.id}`)
  }

  return (
    <div className="card" style={{ cursor: 'pointer', margin: '0 16px' }} onClick={handleClick}>
      {/* Header do card */}
      <div style={{
        background: 'linear-gradient(135deg, #5B6FE8 0%, #9BB0FF 100%)',
        borderRadius: '10px',
        padding: '14px 16px',
        marginBottom: 14,
        display: 'flex',
        alignItems: 'center',
        gap: 12,
      }}>
        {/* Logo placeholder circular */}
        <div style={{
          width: 44, height: 44, borderRadius: '50%',
          background: 'white', flexShrink: 0,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20,
        }}>
          🏕️
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'white', letterSpacing: '-0.01em' }}>
            {evento.nome}
          </p>
          <span className="badge-blue" style={{ marginTop: 4, fontSize: 11, background: 'rgba(255,255,255,0.25)' }}>
            {evento.status === 'aberto' ? '🟢 Inscrições Abertas' : '🔴 Encerrado'}
          </span>
        </div>

        {tempo !== null && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 6,
            background: 'rgba(255,255,255,0.18)', borderRadius: 10, padding: '6px 10px', flexShrink: 0,
          }}>
            {[
              { v: tempo.dias, l: 'd' },
              { v: tempo.horas, l: 'h' },
              { v: tempo.minutos, l: 'm' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1 }}>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 15, color: 'white' }}>
                  {item.v}
                </span>
                <span style={{ fontFamily: 'Poppins, sans-serif', fontSize: 8.5, color: 'rgba(255,255,255,0.75)', textTransform: 'uppercase', marginTop: 2 }}>
                  {item.l}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Detalhes */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar size={14} color="var(--primary)" />
          <span style={{ fontSize: 13, color: 'var(--text-main)' }}>
            {formatarData(evento.dataInicio)} até {formatarData(evento.dataFim)}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Clock size={14} color="var(--primary)" />
          <span style={{ fontSize: 13, color: 'var(--text-main)' }}>{evento.horario}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <DollarSign size={14} color="var(--primary)" />
            <span style={{ fontSize: 13, color: 'var(--text-main)' }}>
              {evento.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
          <span className="badge-blue">Inscrição</span>
        </div>
      </div>

      <p style={{ margin: '12px 0 0', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center' }}>
        Toque no card para mais detalhes
      </p>
    </div>
  )
}
