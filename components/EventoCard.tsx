'use client'
import { useRouter } from 'next/navigation'
import { Calendar, Clock, DollarSign, Check } from 'lucide-react'
import Countdown from './Countdown'
import VideoChamada from './VideoChamada'

export interface Evento {
  id: string
  nome: string
  dataInicio: string
  dataFim: string
  horario: string
  dataLimite: string
  valor: number
  status: 'aberto' | 'fechado' | 'concluido'
  recomendacoes?: string
  chavePix?: string
  idadeAutorizacao?: number
  temExcecaoPrazo?: boolean
  videoUrl?: string
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
}

export default function EventoCard({ evento, inscrito, onClick }: { evento: Evento; inscrito?: boolean; onClick?: () => void }) {
  const router = useRouter()

  const handleClick = () => {
    if (navigator.vibrate) navigator.vibrate(10)
    onClick ? onClick() : router.push(`/evento/${evento.id}`)
  }

  const handleInscricao = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (inscrito) return
    if (navigator.vibrate) navigator.vibrate(10)
    router.push(`/inscricao/${evento.id}`)
  }

  return (
    <div className="card" style={{ cursor: 'pointer', margin: '0 16px' }} onClick={handleClick}>
      {/* Header do card */}
      <div style={{
        background: 'linear-gradient(135deg, #5B6FE8 0%, #9BB0FF 100%)',
        borderRadius: '10px',
        padding: '16px',
        marginBottom: 14,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'rgba(255,255,255,0.18)', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 17,
          }}>
            🏕️
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, fontWeight: 700, fontSize: 15, color: 'white', letterSpacing: '-0.01em', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {evento.nome}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: 11.5, color: 'rgba(255,255,255,0.8)', lineHeight: 1.3 }}>
              Um encontro com Deus vem aí.
            </p>
          </div>
          <span style={{
            flexShrink: 0, fontSize: 10.5, fontWeight: 600, color: 'white',
            background: 'rgba(255,255,255,0.18)', padding: '4px 9px', borderRadius: 999,
            whiteSpace: 'nowrap',
          }}>
            {evento.status === 'aberto' ? '🟢 Abertas' : evento.status === 'concluido' ? '✅ Concluído' : '🔴 Encerrado'}
          </span>
        </div>

        <div style={{ height: 1, background: 'rgba(255,255,255,0.15)', margin: '14px 0' }} />

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
          <Countdown dataAlvo={evento.dataInicio} tamanho="compacto" />
        </div>
        <button
          onClick={handleInscricao}
          disabled={inscrito}
          style={{
            width: '100%', border: 'none', cursor: inscrito ? 'default' : 'pointer',
            padding: '10px 14px', borderRadius: 10, fontSize: 13, fontWeight: 700,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: inscrito ? 'rgba(255,255,255,0.15)' : 'white',
            color: inscrito ? 'white' : 'var(--primary)',
          }}
        >
          {inscrito ? (<><Check size={14} /> Inscrito</>) : 'Inscreva-se'}
        </button>
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <DollarSign size={14} color="var(--primary)" />
          <span style={{ fontSize: 13, color: 'var(--text-main)' }}>
            {evento.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </span>
        </div>
      </div>

      {evento.videoUrl && (
        <div style={{ marginTop: 14 }} onClick={e => e.stopPropagation()}>
          <VideoChamada url={evento.videoUrl} titulo={`Chamada — ${evento.nome}`} />
        </div>
      )}
    </div>
  )
}
