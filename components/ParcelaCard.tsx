'use client'
import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'

export interface Parcela {
  id: string
  numero: number
  totalParcelas: number
  valor: number
  vencimento: string
  status: 'Pendente' | 'Pago' | 'Vencido'
}

function formatarData(iso: string) {
  return new Date(iso).toLocaleDateString('pt-BR')
}

function formatarValor(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ParcelaCard({ parcela }: { parcela: Parcela }) {
  const router = useRouter()

  const statusInfo = {
    Pago: { emoji: '✅', texto: 'Pago', bg: 'rgba(16,185,129,0.12)', cor: '#059669' },
    Pendente: { emoji: '⏳', texto: 'Pendente', bg: 'rgba(217,119,6,0.12)', cor: '#D97706' },
    Vencido: { emoji: '❌', texto: 'Vencido', bg: 'rgba(220,38,38,0.1)', cor: '#DC2626' },
  }[parcela.status]

  return (
    <div
      className="card-solid"
      style={{ marginBottom: 10, cursor: 'pointer', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}
      onClick={() => {
        if (parcela.status !== 'Pago') {
          if (navigator.vibrate) navigator.vibrate(10)
          router.push(`/pagamento/${parcela.id}`)
        }
      }}
    >
      <div>
        <p style={{ margin: 0, fontWeight: 700, fontSize: 14.5, color: 'var(--text-main)' }}>
          Parcela {parcela.numero} de {parcela.totalParcelas}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
          <Calendar size={13} color="var(--text-muted)" />
          <span style={{ fontSize: 12.5, color: 'var(--text-muted)' }}>
            Vence em {formatarData(parcela.vencimento)}
          </span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 7 }}>
        <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-main)' }}>
          {formatarValor(parcela.valor)}
        </span>
        <span style={{
          fontFamily: 'Poppins', fontSize: 11.5, fontWeight: 700, padding: '4px 11px', borderRadius: 999,
          background: statusInfo.bg, color: statusInfo.cor, whiteSpace: 'nowrap',
        }}>
          {statusInfo.emoji} {statusInfo.texto}
        </span>
      </div>
    </div>
  )
}
