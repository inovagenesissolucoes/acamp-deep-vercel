'use client'
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import HeaderInterno from '@/components/HeaderInterno'
import { getEvento, getMinhasInscricoes } from '@/lib/api'
import { getUsuarioLocal, isLider } from '@/lib/auth'
import { Calendar, Clock, DollarSign, AlertCircle, Edit, Check } from 'lucide-react'
import type { Evento } from '@/components/EventoCard'

export default function EventoDetalhe() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [evento, setEvento] = useState<Evento | null>(null)
  const [inscrito, setInscrito] = useState(false)
  const [loading, setLoading] = useState(true)
  const usuario = typeof window !== 'undefined' ? getUsuarioLocal() : null
  const lider = isLider(usuario)

  useEffect(() => {
    if (!id) return
    Promise.all([getEvento(id), getMinhasInscricoes()]).then(([evR, insR]) => {
      if (evR.ok && evR.data) setEvento(evR.data as Evento)
      if (insR.ok && insR.data) {
        const jaInscrito = (insR.data as any[]).some(i => i.eventoId === id)
        setInscrito(jaInscrito)
      }
      setLoading(false)
    })
  }, [id])

  function fmt(iso: string) { return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' }) }

  const acao = lider ? (
    <button onClick={() => router.push(`/admin/eventos/${id}/editar`)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
      <Edit size={20} />
    </button>
  ) : undefined

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <HeaderInterno titulo="Detalhe do Evento" direita={acao} />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px', paddingBottom: 32 }}>
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 80, marginBottom: 12 }} />)
        ) : evento ? (
          <>
            {/* Banner */}
            <div style={{
              background: 'linear-gradient(135deg, #5B6FE8 0%, #9BB0FF 100%)',
              borderRadius: 16, padding: '20px 20px', marginBottom: 20,
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26 }}>
                🏕️
              </div>
              <div>
                <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, color: 'white', margin: '0 0 6px', letterSpacing: '-0.02em' }}>
                  {evento.nome}
                </h2>
                <span style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(255,255,255,0.8)', background: 'rgba(255,255,255,0.2)', padding: '3px 10px', borderRadius: 20 }}>
                  {evento.status === 'aberto' ? '🟢 Inscrições Abertas' : evento.status === 'concluido' ? '✅ Concluído' : '🔴 Prazo Encerrado'}
                </span>
              </div>
            </div>

            {/* Infos */}
            <div className="card-solid" style={{ marginBottom: 14 }}>
              {[
                { icon: <Calendar size={16} color="var(--primary)" />, label: 'Início', val: fmt(evento.dataInicio) },
                { icon: <Calendar size={16} color="var(--primary)" />, label: 'Fim', val: fmt(evento.dataFim) },
                { icon: <Clock size={16} color="var(--primary)" />, label: 'Horário', val: evento.horario },
                { icon: <Calendar size={16} color="var(--primary)" />, label: 'Limite de pagamento', val: fmt(evento.dataLimite) },
                { icon: <DollarSign size={16} color="var(--primary)" />, label: 'Investimento', val: evento.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) },
              ].map(item => (
                <div key={item.label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid #F0F0F0' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {item.icon}
                    <span style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)' }}>{item.label}</span>
                  </div>
                  <span style={{ fontFamily: 'Poppins', fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{item.val}</span>
                </div>
              ))}
            </div>

            {/* Recomendações */}
            {evento.recomendacoes && (
              <div className="card-solid" style={{ marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                  <AlertCircle size={16} color="var(--primary)" />
                  <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, color: 'var(--text-main)', margin: 0 }}>Recomendações</p>
                </div>
                <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
                  {evento.recomendacoes}
                </p>
              </div>
            )}

            {/* CTA */}
            {evento.status !== 'concluido' && (
              inscrito ? (
                <div style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                  background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)',
                  borderRadius: 12, padding: '14px', color: '#059669',
                  fontFamily: 'Poppins', fontWeight: 600, fontSize: 14,
                }}>
                  <Check size={18} /> Você já está inscrito neste evento
                </div>
              ) : (
                <button
                  className="btn-primary btn-full"
                  onClick={() => {
                    if (navigator.vibrate) navigator.vibrate(10)
                    router.push(`/inscricao/${evento.id}`)
                  }}
                >
                  🏕️ Quero me inscrever!
                </button>
              )
            )}
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontFamily: 'Poppins', color: 'var(--text-muted)' }}>Evento não encontrado.</p>
          </div>
        )}
      </div>
    </main>
  )
}
