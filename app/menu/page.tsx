'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, User, HelpCircle, BookOpen, LogOut, LayoutDashboard } from 'lucide-react'
import EventoCard, { Evento } from '@/components/EventoCard'
import ParcelaCard, { Parcela } from '@/components/ParcelaCard'
import { getEventoAtivo, getMinhasInscricoes, logout } from '@/lib/api'
import { getUsuarioLocal, isLider, limparSessao } from '@/lib/auth'

export default function MenuPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<ReturnType<typeof getUsuarioLocal>>(null)
  const [evento, setEvento] = useState<Evento | null>(null)
  const [parcelas, setParcelas] = useState<Parcela[]>([])
  const [loadingEvento, setLoadingEvento] = useState(true)
  const [loadingParcelas, setLoadingParcelas] = useState(true)
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)

  const carregar = useCallback(async () => {
    setLoadingEvento(true)
    setLoadingParcelas(true)

    const [eventoRes, inscRes] = await Promise.all([
      getEventoAtivo(),
      getMinhasInscricoes(),
    ])

    if (eventoRes.ok && eventoRes.data) setEvento(eventoRes.data as Evento)
    setLoadingEvento(false)

    if (inscRes.ok && inscRes.data) {
      const inscricoes = inscRes.data as any[]
      const todasParcelas: Parcela[] = inscricoes.flatMap((i: any) => i.parcelas || [])
      setParcelas(todasParcelas)
    }
    setLoadingParcelas(false)
  }, [])

  useEffect(() => {
    const u = getUsuarioLocal()
    if (!u) { router.replace('/login'); return }
    setUsuario(u)
    carregar()
  }, [carregar, router])

  const handleLogout = async () => {
    await logout()
    limparSessao()
    router.replace('/login')
  }

  const lider = isLider(usuario)

  const icones = [
    { label: 'Inscrições', icon: <ClipboardList size={24} />, href: lider ? '/admin/inscricoes' : '/menu' },
    { label: 'Meu Cadastro', icon: <User size={24} />, href: '/meu-cadastro' },
    { label: 'Ajuda', icon: <HelpCircle size={24} />, href: '/ajuda' },
    { label: 'Manual', icon: <BookOpen size={24} />, href: '/ajuda2' },
  ]

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      {/* HEADER AZUL */}
      <div style={{
        background: 'linear-gradient(135deg, #5B6FE8 0%, #7B8FF5 60%, #9BB0FF 100%)',
        borderBottomLeftRadius: 28,
        borderBottomRightRadius: 28,
        padding: `calc(env(safe-area-inset-top, 0px) + 20px) 20px 28px`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Blobs */}
        <div style={{ position: 'absolute', width: 180, height: 180, borderRadius: '50%', background: 'rgba(255,255,255,0.07)', top: -60, right: -50, pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', background: 'rgba(255,255,255,0.05)', bottom: -30, left: -20, pointerEvents: 'none' }} />

        {/* Barra topo */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          {/* Logo pequena */}
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg viewBox="0 0 100 100" width="24" height="24" xmlns="http://www.w3.org/2000/svg">
              <ellipse cx="50" cy="32" rx="12" ry="12" fill="white"/>
              <path d="M38 44 Q28 62 33 78 L42 73 Q45 58 50 55 Q55 58 58 73 L67 78 Q72 62 62 44Z" fill="white"/>
            </svg>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {lider && (
              <button onClick={() => router.push('/admin/dashboard')} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LayoutDashboard size={18} />
              </button>
            )}
            <button onClick={handleLogout} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>

        {/* Boas-vindas */}
        <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '0 0 4px', fontWeight: 400 }}>
          Seja Bem-Vindo
        </p>
        <p style={{
          fontFamily: 'Poppins', fontSize: 22, fontWeight: 700,
          margin: '0 0 24px', letterSpacing: '-0.02em',
          background: 'linear-gradient(90deg, #fff 0%, #c5ccff 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
        }}>
          {usuario?.nome || 'Usuário'} ✨
        </p>

        {/* 4 ícones */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 4 }}>
          {icones.map(item => (
            <button
              key={item.label}
              className="menu-icon"
              style={{ background: 'none', border: 'none', padding: '8px 4px' }}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10)
                router.push(item.href)
              }}
            >
              <div className="menu-icon-circle">{item.icon}</div>
              <span className="menu-icon-label">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* CORPO */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 24 }}>

        {/* Evento Ativo */}
        <div style={{ marginTop: 24 }}>
          <h2 className="section-title">Evento Ativo</h2>
          {loadingEvento ? (
            <div style={{ margin: '0 16px' }}>
              <div className="skeleton" style={{ height: 180 }} />
            </div>
          ) : evento ? (
            <EventoCard evento={evento} />
          ) : (
            <div style={{ margin: '0 16px', background: 'white', borderRadius: 14, padding: 20, textAlign: 'center' }}>
              <span style={{ fontSize: 32 }}>🏕️</span>
              <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 0' }}>
                Nenhum evento ativo no momento
              </p>
            </div>
          )}
        </div>

        {/* Minhas Parcelas */}
        <div style={{ marginTop: 28 }}>
          <h2 className="section-title">Minhas Parcelas</h2>
          <div style={{ padding: '0 16px' }}>
            {loadingParcelas ? (
              [1, 2].map(i => (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div className="skeleton" style={{ height: 76 }} />
                </div>
              ))
            ) : parcelas.length > 0 ? (
              parcelas.map(p => <ParcelaCard key={p.id} parcela={p} />)
            ) : (
              <div style={{ background: 'white', borderRadius: 14, padding: 20, textAlign: 'center' }}>
                <span style={{ fontSize: 28 }}>💳</span>
                <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 0' }}>
                  Você não possui parcelas no momento
                </p>
                {evento && (
                  <button className="btn-primary" style={{ marginTop: 14, padding: '10px 24px', fontSize: 13 }} onClick={() => router.push(`/inscricao/${evento!.id}`)}>
                    Inscrever-se no evento
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Ações rápidas para Líder */}
        {lider && (
          <div style={{ marginTop: 28 }}>
            <h2 className="section-title">Área do Líder</h2>
            <div style={{ display: 'flex', gap: 10, padding: '0 16px', overflowX: 'auto', paddingBottom: 4 }}>
              {[
                { label: '📋 Inscritos', href: '/admin/inscricoes' },
                { label: '👥 Cadastrados', href: '/admin/cadastrados' },
                { label: '🏕️ Novo Evento', href: '/admin/eventos/novo' },
                { label: '📊 Dashboard', href: '/admin/dashboard' },
              ].map(a => (
                <button key={a.href} onClick={() => router.push(a.href)} className="badge-blue" style={{ flexShrink: 0, cursor: 'pointer', padding: '10px 16px', fontSize: 13, fontFamily: 'Poppins', fontWeight: 500, border: 'none' }}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  )
}
