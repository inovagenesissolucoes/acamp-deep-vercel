'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import HeaderInterno from '@/components/HeaderInterno'
import { getInscricaoDetalhe } from '@/lib/api'
import { getUsuarioLocal, isLider } from '@/lib/auth'
import { Calendar, FileText, MessageCircle } from 'lucide-react'

interface Parcela {
  id: string
  numero: number
  totalParcelas: number
  valor: number
  vencimento: string
  status: string
  comprovanteUrl?: string
  pagoEm?: string
}

interface Detalhe {
  id: string
  nome: string
  sobrenome: string
  telefone: string
  email: string
  eventoNome: string
  whatsappResponsavel?: string
  parcelas: Parcela[]
}

export default function DetalheInscricaoPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [dados, setDados] = useState<Detalhe | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = getUsuarioLocal()
    if (!u || !isLider(u)) { router.replace('/menu'); return }
    getInscricaoDetalhe(id).then(r => {
      if (r.ok && r.data) setDados(r.data as Detalhe)
      setLoading(false)
    })
  }, [id, router])

  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
  const fmtData = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }) : '—'

  const whatsapp = (tel: string) => {
    const limpo = tel.replace(/\D/g, '')
    window.location.href = `https://wa.me/55${limpo}`
  }

  if (loading) {
    return <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="skeleton" style={{ width: 200, height: 40 }} /></main>
  }

  if (!dados) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
        <HeaderInterno titulo="Detalhe do Inscrito" />
        <div style={{ padding: 40, textAlign: 'center' }}>
          <p style={{ fontFamily: 'Poppins', fontSize: 14, color: 'var(--text-muted)' }}>Inscrição não encontrada.</p>
        </div>
      </main>
    )
  }

  const totalPago = dados.parcelas.filter(p => p.status === 'Pago').reduce((s, p) => s + p.valor, 0)
  const totalGeral = dados.parcelas.reduce((s, p) => s + p.valor, 0)

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <HeaderInterno titulo="Detalhe do Inscrito" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', paddingBottom: 32 }}>

        {/* Cabeçalho da pessoa */}
        <div className="card-solid" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 16, color: 'var(--text-main)', margin: '0 0 3px' }}>
              {dados.nome} {dados.sobrenome}
            </p>
            <p style={{ fontFamily: 'Poppins', fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
              {dados.eventoNome} · {fmt(totalPago)} / {fmt(totalGeral)}
            </p>
          </div>
          <button
            onClick={() => whatsapp(dados.telefone)}
            style={{ width: 40, height: 40, borderRadius: '50%', background: '#25D366', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
          >
            <MessageCircle size={19} color="white" />
          </button>
        </div>

        {dados.whatsappResponsavel && (
          <div className="card-solid" style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <p style={{ fontFamily: 'Poppins', fontSize: 12, color: 'var(--text-muted)', margin: '0 0 2px' }}>WhatsApp do responsável</p>
              <p style={{ fontFamily: 'Poppins', fontSize: 13, fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{dados.whatsappResponsavel}</p>
            </div>
            <button
              onClick={() => whatsapp(dados.whatsappResponsavel!)}
              style={{ width: 36, height: 36, borderRadius: '50%', background: '#25D366', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              <MessageCircle size={16} color="white" />
            </button>
          </div>
        )}

        {/* Parcelas */}
        <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 14, color: 'var(--text-main)', margin: '0 0 10px' }}>
          Parcelas
        </p>
        {dados.parcelas.map(p => {
          const pago = p.status === 'Pago'
          return (
            <div key={p.id} className="card-solid" style={{ marginBottom: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13.5, color: 'var(--text-main)', margin: 0 }}>
                  Parcela {p.numero} de {p.totalParcelas}
                </p>
                <span style={{
                  fontFamily: 'Poppins', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999,
                  background: pago ? 'rgba(16,185,129,0.12)' : 'rgba(217,119,6,0.12)',
                  color: pago ? '#059669' : '#D97706',
                }}>
                  {pago ? '✅ Pago' : p.status}
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Calendar size={13} color="var(--text-muted)" />
                <span style={{ fontFamily: 'Poppins', fontSize: 12.5, color: 'var(--text-muted)' }}>
                  Vence em {fmtData(p.vencimento)}{pago && p.pagoEm ? ` · pago em ${fmtData(p.pagoEm)}` : ''}
                </span>
              </div>
              <p style={{ fontFamily: 'Poppins', fontSize: 14, fontWeight: 700, color: 'var(--primary)', margin: '4px 0 0' }}>
                {fmt(p.valor)}
              </p>
              {p.comprovanteUrl && (
                <a
                  href={p.comprovanteUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    marginTop: 10, display: 'inline-flex', alignItems: 'center', gap: 6,
                    fontFamily: 'Poppins', fontSize: 12.5, fontWeight: 600, color: 'var(--primary)',
                    textDecoration: 'none', background: 'rgba(91,111,232,0.08)', padding: '7px 12px', borderRadius: 8,
                  }}
                >
                  <FileText size={14} /> Ver comprovante
                </a>
              )}
            </div>
          )
        })}
      </div>
    </main>
  )
}
