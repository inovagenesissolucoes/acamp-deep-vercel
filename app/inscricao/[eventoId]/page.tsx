'use client'
import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import HeaderInterno from '@/components/HeaderInterno'
import { getEvento, getMinhasInscricoes, inscrever } from '@/lib/api'
import { getUsuarioLocal, calcularIdade } from '@/lib/auth'
import { Minus, Plus, Calendar, DollarSign, Clock, Info, Lock } from 'lucide-react'
import type { Evento } from '@/components/EventoCard'

const DIAS_DISPONIVEIS = [5, 10, 15, 20, 25]

function apenasData(d: string): string {
  return d ? d.slice(0, 10) : d
}

function gerarVencimentosPorDia(diaVencimento: number, dataLimite: string, maxParcelas: number): Date[] {
  const limite = new Date(apenasData(dataLimite) + 'T23:59:59')
  const hoje = new Date()
  let ano = hoje.getFullYear()
  let mes = hoje.getMonth()
  let candidato = new Date(ano, mes, diaVencimento)
  if (candidato <= hoje) {
    mes += 1
    candidato = new Date(ano, mes, diaVencimento)
  }
  const datas: Date[] = []
  while (candidato <= limite && datas.length < maxParcelas) {
    datas.push(new Date(candidato))
    mes += 1
    candidato = new Date(ano, mes, diaVencimento)
  }
  return datas
}

export default function InscricaoPage() {
  const router = useRouter()
  const params = useParams()
  const eventoId = params?.eventoId as string

  const [evento, setEvento] = useState<Evento | null>(null)
  const [parcelas, setParcelas] = useState(1)
  const [diaVencimento, setDiaVencimento] = useState(DIAS_DISPONIVEIS[0])
  const [whatsappResponsavel, setWhatsappResponsavel] = useState('')
  const [senhaExcecao, setSenhaExcecao] = useState('')
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [loadingEvento, setLoadingEvento] = useState(true)
  const [sucesso, setSucesso] = useState(false)
  const [jaInscrito, setJaInscrito] = useState(false)

  const usuario = typeof window !== 'undefined' ? getUsuarioLocal() : null
  const idadeUsuario = usuario ? calcularIdade(usuario.dataNascimento) : 18
  const precisaResponsavel = evento?.idadeAutorizacao ? idadeUsuario < evento.idadeAutorizacao : false

  useEffect(() => {
    if (!eventoId) return
    Promise.all([getEvento(eventoId), getMinhasInscricoes()]).then(([evR, insR]) => {
      if (evR.ok && evR.data) setEvento(evR.data as Evento)
      if (insR.ok && insR.data) {
        setJaInscrito((insR.data as any[]).some(i => i.eventoId === eventoId))
      }
      setLoadingEvento(false)
    })
  }, [eventoId])

  const concluido = evento?.status === 'concluido'

  const prazoEncerrado = useMemo(() => {
    if (!evento) return false
    return new Date() > new Date(apenasData(evento.dataLimite) + 'T23:59:59')
  }, [evento])

  const vencimentosMaximos = useMemo(() => {
    if (!evento) return []
    return gerarVencimentosPorDia(diaVencimento, evento.dataLimite, 24)
  }, [evento, diaVencimento])

  const maxParcelasPossivel = Math.max(1, vencimentosMaximos.length)

  // Garante que a quantidade escolhida nunca ultrapasse o que cabe até a data limite
  useEffect(() => {
    if (parcelas > maxParcelasPossivel) setParcelas(maxParcelasPossivel)
  }, [maxParcelasPossivel, parcelas])

  const valorParcela = evento ? (evento.valor / parcelas) : 0
  const vencimentosExibidos = vencimentosMaximos.slice(0, parcelas)

  function formatarData(iso: string) {
    return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
  }

  const handleInscrever = async () => {
    if (concluido) {
      setErro('Este evento já foi concluído.')
      return
    }
    if (precisaResponsavel && !whatsappResponsavel) {
      setErro('Informe o WhatsApp do responsável (obrigatório para menores).')
      return
    }
    if (prazoEncerrado && !senhaExcecao) {
      setErro('O prazo de inscrição encerrou. Informe a senha de exceção para continuar.')
      return
    }
    setErro('')
    setLoading(true)
    if (navigator.vibrate) navigator.vibrate(10)

    const res = await inscrever({
      eventoId,
      quantidadeParcelas: parcelas,
      diaVencimento,
      ...(precisaResponsavel ? { whatsappResponsavel } : {}),
      ...(prazoEncerrado ? { senhaExcecao } : {}),
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
            {/* Card do evento — mesmo padrão visual do EventoCard */}
            <div className="card" style={{ marginBottom: 16 }}>
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
                    {concluido ? '✅ Concluído' : prazoEncerrado ? '🔴 Prazo Encerrado' : '🟢 Inscrições Abertas'}
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
                {evento.horario && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Clock size={14} color="var(--primary)" />
                    <span style={{ fontSize: 13, color: 'var(--text-main)' }}>{evento.horario}</span>
                  </div>
                )}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <DollarSign size={14} color="var(--primary)" />
                  <span style={{ fontSize: 13, color: 'var(--text-main)' }}>
                    {evento.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Calendar size={14} color={prazoEncerrado ? '#DC2626' : 'var(--primary)'} />
                  <span style={{ fontSize: 13, color: prazoEncerrado ? '#DC2626' : 'var(--text-main)', fontWeight: prazoEncerrado ? 600 : 400 }}>
                    Limite de inscrição: {formatarData(evento.dataLimite)}{prazoEncerrado ? ' (encerrado)' : ''}
                  </span>
                </div>
              </div>

              {evento.recomendacoes && (
                <div style={{ display: 'flex', gap: 8, marginTop: 14, padding: 12, background: 'rgba(91,111,232,0.06)', borderRadius: 10 }}>
                  <Info size={15} color="var(--primary)" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12.5, color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    {evento.recomendacoes}
                  </p>
                </div>
              )}
            </div>

            {/* Já inscrito: bloqueia por completo */}
            {jaInscrito ? (
              <div className="card-solid" style={{ textAlign: 'center', padding: 28 }}>
                <span style={{ fontSize: 36 }}>✅</span>
                <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, color: 'var(--text-main)', margin: '10px 0 4px' }}>
                  Você já está inscrito neste evento
                </p>
                <p style={{ fontFamily: 'Poppins', fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                  Confira suas parcelas na tela inicial.
                </p>
                <button className="btn-outline" style={{ marginTop: 18 }} onClick={() => router.push('/menu')}>
                  Voltar ao início
                </button>
              </div>
            ) : concluido ? (
              <div className="card-solid" style={{ textAlign: 'center', padding: 28 }}>
                <span style={{ fontSize: 36 }}>🎉</span>
                <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, color: 'var(--text-main)', margin: '10px 0 4px' }}>
                  Este evento já foi concluído
                </p>
                <p style={{ fontFamily: 'Poppins', fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                  Fique de olho no próximo acampamento!
                </p>
                <button className="btn-outline" style={{ marginTop: 18 }} onClick={() => router.push('/menu')}>
                  Voltar ao início
                </button>
              </div>
            ) : (
              <>
            {/* Bloqueio de prazo */}
            {prazoEncerrado && (
              <div className="card-solid" style={{ marginBottom: 16, borderLeft: '3px solid #DC2626' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <Lock size={16} color="#DC2626" />
                  <p style={{ fontFamily: 'Poppins', fontSize: 13.5, fontWeight: 700, color: '#DC2626', margin: 0 }}>
                    Prazo de inscrição encerrado
                  </p>
                </div>
                <p style={{ fontFamily: 'Poppins', fontSize: 12.5, color: 'var(--text-muted)', margin: '0 0 12px' }}>
                  Se o seu líder liberou uma exceção, informe a senha abaixo para continuar.
                </p>
                <div className="input-group" style={{ marginBottom: 0 }}>
                  <label className="input-label">Senha de exceção</label>
                  <input className="input-field" type="text" placeholder="Peça ao seu líder" value={senhaExcecao} onChange={e => setSenhaExcecao(e.target.value)} />
                </div>
              </div>
            )}

            {/* Parcelas */}
            <div className="card-solid" style={{ marginBottom: 16 }}>
              <label className="input-label" style={{ marginBottom: 10 }}>
                Dia de vencimento
              </label>
              <div style={{ display: 'flex', gap: 8, marginBottom: 18, flexWrap: 'wrap' }}>
                {DIAS_DISPONIVEIS.map(dia => (
                  <button
                    key={dia}
                    onClick={() => setDiaVencimento(dia)}
                    style={{
                      flex: 1, minWidth: 56, padding: '9px 0', borderRadius: 10,
                      border: dia === diaVencimento ? '2px solid var(--primary)' : '1px solid #E5E7EB',
                      background: dia === diaVencimento ? 'rgba(91,111,232,0.08)' : 'white',
                      color: dia === diaVencimento ? 'var(--primary)' : 'var(--text-muted)',
                      fontFamily: 'Poppins', fontWeight: 700, fontSize: 14, cursor: 'pointer',
                    }}
                  >
                    Dia {dia}
                  </button>
                ))}
              </div>

              <label className="input-label" style={{ marginBottom: 12 }}>
                Quantidade de Parcelas
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center', marginBottom: 8 }}>
                <button className="counter-btn" onClick={() => setParcelas(Math.max(1, parcelas - 1))}>
                  <Minus size={16} />
                </button>
                <span style={{ fontFamily: 'Poppins', fontSize: 28, fontWeight: 700, color: 'var(--primary)', minWidth: 40, textAlign: 'center' }}>
                  {parcelas}
                </span>
                <button className="counter-btn" onClick={() => setParcelas(Math.min(maxParcelasPossivel, parcelas + 1))}>
                  <Plus size={16} />
                </button>
              </div>
              <p style={{ fontFamily: 'Poppins', fontSize: 11.5, color: 'var(--text-muted)', textAlign: 'center', margin: '0 0 16px' }}>
                Máximo de {maxParcelasPossivel}x até a data limite, vencendo todo dia {diaVencimento}
              </p>

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
                {vencimentosExibidos.map((d, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 0', borderBottom: i < parcelas - 1 ? '1px solid #F0F0F0' : 'none' }}>
                    <span style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)' }}>Parcela {i + 1}</span>
                    <span style={{ fontFamily: 'Poppins', fontSize: 13, fontWeight: 600, color: 'var(--text-main)' }}>{d.toLocaleDateString('pt-BR')}</span>
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
            )}
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
