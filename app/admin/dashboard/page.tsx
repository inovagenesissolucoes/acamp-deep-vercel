'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HeaderInterno from '@/components/HeaderInterno'
import { listarInscricoes, getEventoAtivo } from '@/lib/api'
import { getUsuarioLocal, isLider, calcularIdade } from '@/lib/auth'
import { MessageCircle, Users, DollarSign, AlertCircle, TrendingUp } from 'lucide-react'

interface InscritoComParcelas {
  id: string
  usuarioId: string
  nome: string
  sobrenome: string
  telefone: string
  parcelas: Array<{ valor: number; status: 'Pendente' | 'Pago' | 'Vencido' }>
  dataNascimento: string
}

export default function DashboardPage() {
  const router = useRouter()
  const [inscritos, setInscritos] = useState<InscritoComParcelas[]>([])
  const [evento, setEvento] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [pesquisa, setPesquisa] = useState('')

  useEffect(() => {
    const u = getUsuarioLocal()
    if (!u || !isLider(u)) { router.replace('/menu'); return }

    getEventoAtivo().then(async r => {
      if (r.ok && r.data) {
        const ev = r.data as any
        setEvento(ev)
        const inscRes = await listarInscricoes(ev.id)
        if (inscRes.ok && inscRes.data) setInscritos(inscRes.data as InscritoComParcelas[])
      }
      setLoading(false)
    })
  }, [router])

  const filtrados = inscritos.filter(i =>
    `${i.nome} ${i.sobrenome}`.toLowerCase().includes(pesquisa.toLowerCase())
  )

  const totalArrecadado = inscritos.reduce((acc, i) =>
    acc + i.parcelas.filter(p => p.status === 'Pago').reduce((s, p) => s + p.valor, 0), 0)

  const totalPendente = inscritos.reduce((acc, i) =>
    acc + i.parcelas.filter(p => p.status !== 'Pago').reduce((s, p) => s + p.valor, 0), 0)

  const totalEsperado = evento ? inscritos.length * evento.valor : 0

  // Faixas etárias
  const faixas = { '< 15': 0, '15-17': 0, '18-24': 0, '25-35': 0, '> 35': 0 }
  inscritos.forEach(i => {
    const idade = calcularIdade(i.dataNascimento)
    if (idade < 15) faixas['< 15']++
    else if (idade < 18) faixas['15-17']++
    else if (idade < 25) faixas['18-24']++
    else if (idade < 36) faixas['25-35']++
    else faixas['> 35']++
  })
  const maxFaixa = Math.max(...Object.values(faixas), 1)

  function whatsapp(tel: string) {
    const limpo = tel.replace(/\D/g, '')
    window.location.href = `https://wa.me/55${limpo}`
  }

  function fmt(v: number) { return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <HeaderInterno titulo="Dashboard" />

      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 32 }}>
        {loading ? (
          <div style={{ padding: '20px 16px' }}>
            <div className="skeleton" style={{ height: 40, marginBottom: 16 }} />
            <div className="bento-grid">
              {[1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 100, borderRadius: 16 }} />)}
            </div>
          </div>
        ) : (
          <>
            {/* Bento Grid totalizadores */}
            <div style={{ padding: '20px 0 0' }}>
              <div className="bento-grid">
                <div className="bento-card bento-card-1">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <Users size={18} color="rgba(255,255,255,0.8)" />
                    <span style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Inscritos</span>
                  </div>
                  <p style={{ fontFamily: 'Poppins', fontSize: 28, fontWeight: 700, color: 'white', margin: 0, letterSpacing: '-0.03em' }}>
                    {inscritos.length}
                  </p>
                </div>
                <div className="bento-card bento-card-2">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <DollarSign size={18} color="rgba(255,255,255,0.8)" />
                    <span style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Arrecadado</span>
                  </div>
                  <p style={{ fontFamily: 'Poppins', fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }}>
                    {fmt(totalArrecadado)}
                  </p>
                </div>
                <div className="bento-card bento-card-3">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <AlertCircle size={18} color="rgba(255,255,255,0.8)" />
                    <span style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Pendente</span>
                  </div>
                  <p style={{ fontFamily: 'Poppins', fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }}>
                    {fmt(totalPendente)}
                  </p>
                </div>
                <div className="bento-card bento-card-4">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <TrendingUp size={18} color="rgba(255,255,255,0.8)" />
                    <span style={{ fontFamily: 'Poppins', fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>Meta</span>
                  </div>
                  <p style={{ fontFamily: 'Poppins', fontSize: 16, fontWeight: 700, color: 'white', margin: 0 }}>
                    {fmt(totalEsperado)}
                  </p>
                </div>
              </div>
            </div>

            {/* Gráfico faixa etária */}
            <div style={{ padding: '24px 16px 0' }}>
              <h3 className="section-title" style={{ padding: 0, marginBottom: 16 }}>Faixa Etária</h3>
              <div className="card-solid">
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 100, justifyContent: 'space-between' }}>
                  {Object.entries(faixas).map(([label, val], i) => (
                    <div key={label} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, height: '100%', justifyContent: 'flex-end' }}>
                      <span style={{ fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, color: 'var(--primary)' }}>{val}</span>
                      <div
                        className="chart-bar"
                        style={{
                          width: '100%',
                          height: `${(val / maxFaixa) * 70}px`,
                          minHeight: val > 0 ? 6 : 0,
                          animationDelay: `${i * 100}ms`,
                        }}
                      />
                      <span style={{ fontFamily: 'Poppins', fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>{label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Lista de inscritos */}
            <div style={{ padding: '24px 16px 0' }}>
              <h3 className="section-title" style={{ padding: 0, marginBottom: 12 }}>Inscritos</h3>
              <div className="search-wrapper" style={{ marginBottom: 14 }}>
                <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
                </svg>
                <input
                  className="search-input"
                  type="search"
                  placeholder="Pesquisar..."
                  value={pesquisa}
                  onChange={e => setPesquisa(e.target.value)}
                />
              </div>

              {filtrados.map(inscrito => {
                const pago = inscrito.parcelas.filter(p => p.status === 'Pago').reduce((s, p) => s + p.valor, 0)
                const total = inscrito.parcelas.reduce((s, p) => s + p.valor, 0)
                const perc = total > 0 ? (pago / total) * 100 : 0

                return (
                  <div key={inscrito.id} className="card-solid" style={{ marginBottom: 10, cursor: 'pointer' }} onClick={() => router.push(`/admin/inscritos/${inscrito.id}`)}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ flex: 1 }}>
                        <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, color: 'var(--text-main)', margin: '0 0 4px' }}>
                          {inscrito.nome} {inscrito.sobrenome}
                        </p>
                        <div style={{ marginBottom: 6 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                            <span style={{ fontFamily: 'Poppins', fontSize: 11, color: 'var(--text-muted)' }}>
                              {fmt(pago)} / {fmt(total)}
                            </span>
                            <span style={{ fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, color: perc >= 100 ? '#059669' : perc > 0 ? '#D97706' : '#DC2626' }}>
                              {perc.toFixed(0)}%
                            </span>
                          </div>
                          <div style={{ height: 4, background: '#F0F0F0', borderRadius: 2 }}>
                            <div style={{ height: '100%', width: `${perc}%`, background: perc >= 100 ? '#10B981' : perc > 0 ? '#F59E0B' : '#EF4444', borderRadius: 2, transition: 'width 0.5s ease' }} />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={(e) => { e.stopPropagation(); whatsapp(inscrito.telefone) }}
                        style={{ marginLeft: 12, width: 38, height: 38, borderRadius: '50%', background: '#25D366', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                )
              })}

              {filtrados.length === 0 && (
                <div style={{ textAlign: 'center', padding: '20px 0' }}>
                  <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)' }}>Nenhum inscrito encontrado</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
