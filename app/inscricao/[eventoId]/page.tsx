'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import HeaderInterno from '@/components/HeaderInterno'
import { getEvento, inscrever } from '@/lib/api'
import { getUsuarioLocal, calcularIdade } from '@/lib/auth'
import { Minus, Plus, Calendar, DollarSign } from 'lucide-react'
import type { Evento } from '@/components/EventoCard'

export default function InscricaoPage() {
  const router = useRouter()
  const params = useParams()
  const eventoId = params?.eventoId as string

  const [evento, setEvento] = useState<Evento | null>(null)
  const [parcelas, setParcelas] = useState(1)
  const [whatsappResponsavel, setWhatsappResponsavel] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [loadingEvento, setLoadingEvento] = useState(true)
  const [sucesso, setSucesso] = useState(false)

  const usuario = typeof window !== 'undefined' ? getUsuarioLocal() : null
  const idadeUsuario = usuario ? calcularIdade(usuario.dataNascimento) : 18
  const precisaResponsavel = evento?.idadeAutorizacao ? idadeUsuario < evento.idadeAutorizacao : false

  useEffect(() => {
    if (!eventoId) return
    getEvento(eventoId).then(r => {
      if (r.ok && r.data) setEvento(r.data as Evento)
      setLoadingEvento(false)
    })
  }, [eventoId])

  const valorParcela = evento ? (evento.valor / parcelas) : 0

  function formatarData(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR')
  }

  function calcularVencimentos() {
    if (!evento) return []
    const inicio = new Date()
    const fim = new Date(evento.dataLimite)
    const intervalo = (fim.getTime() - inicio.getTime()) / parcelas
    return Array.from({ length: parcelas }, (_, i) => {
      const d = new Date(inicio.getTime() + intervalo * (i + 1))
      return d.toLocaleDateString('pt-BR')
    })
  }

  const handleInscrever = async () => {
    if (precisaResponsavel && !whatsappResponsavel) {
      setErro('Informe o WhatsApp do responsável (obrigatório para menores).')
      return
    }
    setErro('')
    setLoading(true)
    if (navigator.vibrate) navigator.vibrate(10)

    const res = await inscrever({
      eventoId,
      quantidadeParcelas: parcelas,
      ...(precisaResponsavel ? { whatsappResponsavel } : {}),
    })
    setLoading(false)

    if (res.ok) {
      setSucesso(true)
      setTimeout(() => router.push('/menu'), 2500)
    } else {
      setErro(res.erro || 'Erro ao realizar inscrição.')
    }
  }

  if (sucesso) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, color: 'var(--text-main)', margin: '0 0 8px', textAlign: 'center' }}>
          Inscrição realizada!
        </h2>
        <p style={{ fontFamily: 'Poppins', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>
          Suas parcelas foram geradas. Confira na tela inicial!
        </p>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <HeaderInterno titulo="Inscrição" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px', paddingBottom: 32 }}>
        {loadingEvento ? (
          <div className="skeleton" style={{ height: 120, marginBottom: 16 }} />
        ) : evento ? (
          <>
            {/* Card do evento */}
            <div className="card-solid" style={{ marginBottom: 16 }}>
              <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, color: 'var(--text-main)', margin: '0 0 14px', letterSpacing: '-0.02em' }}>
                {evento.nome}
              </h2>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <DollarSign size={14} color="var(--primary)" />
                  <span style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-main)', fontWeight: 600 }}>
                    {evento.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={14} color="var(--primary)" />
                  <span style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)' }}>
                    Limite: {formatarData(evento.dataLimite)}
                  </span>
                </div>
              </div>
            </div>

            {/* Parcelas */}
            <div className="card-solid" style={{ marginBottom: 16 }}>
              <label className="input-label" style={{ marginBottom: 12 }}>
                Quantidade de Parcelas
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', marginBottom: 16 }}>
                <button className="counter-btn" onClick={() => setParcelas(Math.max(1, parcelas - 1))}>
                  <Minus size={16} />
                </button>
                <span style={{ fontFamily: 'Poppins', fontSize: 28, fontWeight: 700, color: 'var(--primary)', minWidth: 40, textAlign: 'center' }}>
                  {parcelas}
                </span>
                <button className="counter-btn" onClick={() => setParcelas(parcelas + 1)}>
                  <Plus size={16} />
                </button>
              </div>

              <div style={{ background: 'rgba(91,111,232,0.06)', borderRadius: 10, padding: 14 }}>
                <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 4px' }}>
                  Valor por parcela
                </p>
                <p style={{ fontFamily: 'Poppins', fontSize: 22, fontWeight: 700, color: 'var(--primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  {valorParcela.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
                <p style={{ fontFamily: 'Poppins', fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0' }}>
                  Total: {evento.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} em {parcelas}x
                </p>
              </div>
            </div>

            {/* Vencimentos */}
            {parcelas > 1 && (
              <div className="card-solid" style={{ marginBottom: 16 }}>
                <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, color: 'var(--text-main)', margin: '0 0 12px' }}>
                  Datas de Vencimento
                </p>
                {calcularVencimentos().map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < parcelas - 1 ? '1px solid #F0F0F0' : 'none' }}>
                    <span style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)' }}>Parcela {i + 1}</span>
                    <span style={{ fontFamily: 'Poppins', fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{d}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Responsável (menores) */}
            {precisaResponsavel && (
              <div className="card-solid" style={{ marginBottom: 16, borderLeft: '3px solid var(--primary)' }}>
                <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--primary)', fontWeight: 600, margin: '0 0 4px' }}>
                  ⚠️ Autorização de Responsável
                </p>
                <p style={{ fontFamily: 'Poppins', fontSize: 12, color: 'var(--text-muted)', margin: '0 0 12px' }}>
                  Participantes com menos de {evento?.idadeAutorizacao} anos precisam de autorização.
                </p>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">WhatsApp do Responsável *</label>
                  <input className="input-field" type="tel" inputMode="tel" placeholder="(11) 99999-9999" value={whatsappResponsavel} onChange={e => setWhatsappResponsavel(e.target.value)} />
                </div>
              </div>
            )}

            {erro && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#DC2626', fontSize: 13, fontFamily: 'Poppins' }}>
                {erro}
              </div>
            )}

            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn-outline" style={{ flex: 1 }} onClick={() => router.back()}>Cancelar</button>
              <button className="btn-primary" style={{ flex: 1 }} onClick={handleInscrever} disabled={loading}>
                {loading ? 'Inscrevendo...' : 'Inscrever-se'}
              </button>
            </div>
          </>
        ) : (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <p style={{ fontFamily: 'Poppins', fontSize: 14, color: 'var(--text-muted)' }}>Evento não encontrado.</p>
          </div>
        )}
      </div>
    </main>
  )
}
