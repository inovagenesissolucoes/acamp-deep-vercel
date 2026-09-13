'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HeaderInterno from '@/components/HeaderInterno'
import { listarInscricoes, getEventoAtivo } from '@/lib/api'
import { getUsuarioLocal, isLider } from '@/lib/auth'

interface Inscrito {
  id: string; nome: string; sobrenome: string; telefone: string;
  parcelas: Array<{ valor: number; status: string }>
}

export default function InscricoesPage() {
  const router = useRouter()
  const [inscritos, setInscritos] = useState<Inscrito[]>([])
  const [eventoNome, setEventoNome] = useState('')
  const [pesquisa, setPesquisa] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = getUsuarioLocal()
    if (!u || !isLider(u)) { router.replace('/menu'); return }
    getEventoAtivo().then(async r => {
      if (r.ok && r.data) {
        const ev = r.data as any
        setEventoNome(ev.nome)
        const res = await listarInscricoes(ev.id)
        if (res.ok && res.data) setInscritos(res.data as Inscrito[])
      }
      setLoading(false)
    })
  }, [router])

  const filtrados = inscritos.filter(i => `${i.nome} ${i.sobrenome}`.toLowerCase().includes(pesquisa.toLowerCase()))
  const totalArrecadado = inscritos.reduce((a, i) => a + i.parcelas.filter(p => p.status === 'Pago').reduce((s, p) => s + p.valor, 0), 0)
  const totalPendente = inscritos.reduce((a, i) => a + i.parcelas.filter(p => p.status !== 'Pago').reduce((s, p) => s + p.valor, 0), 0)
  const fmt = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <HeaderInterno titulo="Inscrições" voltarUrl="/menu" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', paddingBottom: 24 }}>
        {eventoNome && (
          <p style={{ fontFamily: 'Poppins', fontSize: 12, color: 'var(--text-muted)', margin: '0 0 14px' }}>
            Evento: <strong style={{ color: 'var(--primary)' }}>{eventoNome}</strong>
          </p>
        )}

        {/* Totais */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Inscritos', val: inscritos.length, cor: '#5B6FE8' },
            { label: 'Arrecadado', val: fmt(totalArrecadado), cor: '#059669' },
            { label: 'Pendente', val: fmt(totalPendente), cor: '#D97706' },
          ].map(t => (
            <div key={t.label} style={{ flex: 1, background: 'white', borderRadius: 12, padding: '10px 12px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
              <p style={{ fontFamily: 'Poppins', fontSize: 10, color: 'var(--text-muted)', margin: '0 0 2px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t.label}</p>
              <p style={{ fontFamily: 'Poppins', fontSize: t.label === 'Inscritos' ? 22 : 12, fontWeight: 700, color: t.cor, margin: 0 }}>{t.val}</p>
            </div>
          ))}
        </div>

        {/* Busca */}
        <div className="search-wrapper" style={{ marginBottom: 14 }}>
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="search-input" type="search" placeholder="Pesquisar..." value={pesquisa} onChange={e => setPesquisa(e.target.value)} />
        </div>

        {loading ? (
          [1,2,3].map(i => <div key={i} className="skeleton" style={{ height: 70, marginBottom: 10 }} />)
        ) : filtrados.map(inscrito => {
          const pago = inscrito.parcelas.filter(p => p.status === 'Pago').reduce((s, p) => s + p.valor, 0)
          const total = inscrito.parcelas.reduce((s, p) => s + p.valor, 0)
          return (
            <div key={inscrito.id} className="card-solid" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, color: 'var(--text-main)', margin: '0 0 3px' }}>{inscrito.nome} {inscrito.sobrenome}</p>
                <p style={{ fontFamily: 'Poppins', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>{fmt(pago)} / {fmt(total)}</p>
              </div>
              <button
                onClick={() => { const limpo = inscrito.telefone.replace(/\D/g, ''); window.open(`https://wa.me/55${limpo}`, '_blank') }}
                style={{ width: 38, height: 38, borderRadius: '50%', background: '#25D366', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              </button>
            </div>
          )
        })}
        {!loading && filtrados.length === 0 && (
          <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Nenhum inscrito encontrado</p>
        )}
      </div>
    </main>
  )
}
