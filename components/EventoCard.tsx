'use client'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, DollarSign } from 'lucide-react'

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

export default function EventoCard({ evento, onClick }: { evento: Evento; onClick?: () => void }) {
  const router = useRouter()

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
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'white', letterSpacing: '-0.01em' }}>
            {evento.nome}
          </p>
          <span className="badge-blue" style={{ marginTop: 4, fontSize: 11, background: 'rgba(255,255,255,0.25)' }}>
            {evento.status === 'aberto' ? '🟢 Inscrições Abertas' : '🔴 Encerrado'}
          </span>
        </div>
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
