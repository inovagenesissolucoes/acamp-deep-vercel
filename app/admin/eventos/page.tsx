'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Star, Pencil, Plus, Calendar } from 'lucide-react'
import HeaderInterno from '@/components/HeaderInterno'
import { listarEventos, getEventoAtivo, setEventoAtivo } from '@/lib/api'
import { getUsuarioLocal, isLider } from '@/lib/auth'

interface EventoItem {
  id: string
  nome: string
  dataInicio: string
  dataFim: string
  status: string
  valor: string | number
}

export default function ListaEventosPage() {
  const router = useRouter()
  const [eventos, setEventos] = useState<EventoItem[]>([])
  const [ativoId, setAtivoId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [ativando, setAtivando] = useState<string | null>(null)

  const carregar = useCallback(async () => {
    setLoading(true)
    const [listaRes, ativoRes] = await Promise.all([
      listarEventos(),
      getEventoAtivo(),
    ])
    if (listaRes.ok && listaRes.data) setEventos(listaRes.data as EventoItem[])
    if (ativoRes.ok && ativoRes.data) setAtivoId((ativoRes.data as any).id)
    setLoading(false)
  }, [])

  useEffect(() => {
    const u = getUsuarioLocal()
    if (!u || !isLider(u)) { router.replace('/menu'); return }
    carregar()
  }, [carregar, router])

  const ativar = async (id: string) => {
    setAtivando(id)
    const res = await setEventoAtivo(id)
    setAtivando(null)
    if (res.ok) setAtivoId(id)
  }

  const fmtData = (d: string) => {
    if (!d) return '—'
    const data = new Date(d)
    if (isNaN(data.getTime())) return d
    return data.toLocaleDateString('pt-BR', { timeZone: 'UTC' })
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <HeaderInterno titulo="Eventos" voltarUrl="/menu" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 16px', paddingBottom: 32 }}>

        <button
          className="btn-primary btn-full"
          style={{ marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
          onClick={() => router.push('/admin/eventos/novo')}
        >
          <Plus size={18} /> Novo Evento
        </button>

        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 84, marginBottom: 12 }} />)
        ) : eventos.length === 0 ? (
          <div className="card-solid" style={{ textAlign: 'center', padding: 28 }}>
            <span style={{ fontSize: 32 }}>🏕️</span>
            <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 0' }}>
              Nenhum evento criado ainda
            </p>
          </div>
        ) : (
          eventos
            .slice()
            .reverse()
            .map(ev => {
              const ativo = ev.id === ativoId
              return (
                <div key={ev.id} className="card-solid" style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8, marginBottom: 8 }}>
                    <div>
                      <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 15, color: 'var(--text-main)', margin: 0 }}>
                        {ev.nome}
                      </p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                        <Calendar size={13} color="var(--text-muted)" />
                        <span style={{ fontFamily: 'Poppins', fontSize: 12.5, color: 'var(--text-muted)' }}>
                          {fmtData(ev.dataInicio)} — {fmtData(ev.dataFim)}
                        </span>
                      </div>
                    </div>
                    {ativo && (
                      <span style={{
                        display: 'flex', alignItems: 'center', gap: 4, padding: '3px 10px', borderRadius: 999,
                        background: 'rgba(91,111,232,0.12)', fontFamily: 'Poppins', fontSize: 11, fontWeight: 700,
                        color: 'var(--primary)', flexShrink: 0,
                      }}>
                        <Star size={11} fill="var(--primary)" /> ATIVO
                      </span>
                    )}
                  </div>

                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn-outline"
                      style={{ flex: 1, padding: '9px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                      onClick={() => router.push(`/admin/eventos/${ev.id}/editar`)}
                    >
                      <Pencil size={14} /> Editar
                    </button>
                    {!ativo && (
                      <button
                        className="btn-primary"
                        style={{ flex: 1, padding: '9px', fontSize: 13 }}
                        onClick={() => ativar(ev.id)}
                        disabled={ativando === ev.id}
                      >
                        {ativando === ev.id ? 'Ativando...' : 'Definir como Ativo'}
                      </button>
                    )}
                  </div>
                </div>
              )
            })
        )}
      </div>
    </main>
  )
}
