'use client'
import { useRouter } from 'next/navigation'
import { Calendar, ChevronRight } from 'lucide-react'

export interface Parcela {
  id: string
  numero: number
  totalParcelas: number
  valor: number
  vencimento: string
  status: 'Pendente' | 'Pago' | 'Vencido'
}

function formatarData(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR')
}

function formatarValor(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export default function ParcelaCard({ parcela }: { parcela: Parcela }) {
  const router = useRouter()

  const badgeClass =
    parcela.status === 'Pago' ? 'badge-paid' :
    parcela.status === 'Vencido' ? 'badge-overdue' : 'badge-pending'

  const emoji = parcela.status === 'Pago' ? '✅' : parcela.status === 'Vencido' ? '❌' : '⏳'

  return (
    <div
      className="card"
      style={{ marginBottom: 10, cursor: 'pointer' }}
      onClick={() => {
        if (parcela.status !== 'Pago') {
          if (navigator.vibrate) navigator.vibrate(10)
          router.push(`/pagamento/${parcela.id}`)
        }
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ flex: 1 }}>
          <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: 'var(--text-main)' }}>
            Parcela {parcela.numero} de {parcela.totalParcelas}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
            <Calendar size={13} color="var(--text-muted)" />
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
              Vence em {formatarData(parcela.vencimento)}
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-main)' }}>
            {formatarValor(parcela.valor)}
          </span>
          <span className={badgeClass}>{emoji} {parcela.status}</span>
        </div>
        {parcela.status !== 'Pago' && (
          <div style={{ marginLeft: 10 }}>
            <div className="badge-blue" style={{ cursor: 'pointer' }}>
              Pagar
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
