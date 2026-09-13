'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ClipboardList, User, HelpCircle, BookOpen, LogOut, Menu, X, Users, Tent } from 'lucide-react'
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
  const [menuAberto, setMenuAberto] = useState(false)

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

  const itensLider = [
    { label: 'Inscritos', icon: <ClipboardList size={20} />, href: '/admin/inscricoes' },
    { label: 'Cadastrados', icon: <Users size={20} />, href: '/admin/cadastrados' },
    { label: 'Novo Evento', icon: <Tent size={20} />, href: '/admin/eventos/novo' },
  ]

  const irPara = (href: string) => {
    setMenuAberto(false)
    router.push(href)
  }

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 18 }}>
          <div>
            <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'rgba(255,255,255,0.75)', margin: '0 0 4px', fontWeight: 400 }}>
              Seja Bem-Vindo
            </p>
            <p style={{
              fontFamily: 'Poppins', fontSize: 22, fontWeight: 700,
              margin: 0, letterSpacing: '-0.02em',
              background: 'linear-gradient(90deg, #fff 0%, #c5ccff 100%)',
              WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text',
            }}>
              {usuario?.nome || 'Usuário'} ✨
            </p>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {lider && (
              <button onClick={() => setMenuAberto(true)} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Menu size={18} />
              </button>
            )}
            <button onClick={handleLogout} style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>

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

        {/* Ações rápidas para Líder foram movidas para o menu lateral (ícone ☰) */}
      </div>

      {/* MENU LATERAL (LÍDER) */}
      {lider && (
        <>
          <div
            onClick={() => setMenuAberto(false)}
            style={{
              position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
              zIndex: 200, opacity: menuAberto ? 1 : 0,
              pointerEvents: menuAberto ? 'auto' : 'none',
              transition: 'opacity 0.25s ease',
            }}
          />
          <div style={{
            position: 'fixed', top: 0, right: 0, bottom: 0, width: '78%', maxWidth: 300,
            background: 'white', zIndex: 201, boxShadow: '-4px 0 24px rgba(0,0,0,0.15)',
            transform: menuAberto ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 0.28s cubic-bezier(0.32,0.72,0,1)',
            display: 'flex', flexDirection: 'column',
            paddingTop: 'env(safe-area-inset-top, 0px)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 20px 16px', borderBottom: '1px solid #EEE' }}>
              <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 16, color: 'var(--text-main)' }}>Área do Líder</span>
              <button onClick={() => setMenuAberto(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                <X size={22} />
              </button>
            </div>
            <div style={{ padding: '8px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {itensLider.map(item => (
                <button
                  key={item.href}
                  onClick={() => irPara(item.href)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '13px 12px', borderRadius: 12, border: 'none',
                    background: 'none', cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'Poppins', fontSize: 14, fontWeight: 500,
                    color: 'var(--text-main)',
                  }}
                >
                  <span style={{ color: '#5B6FE8', display: 'flex' }}>{item.icon}</span>
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </main>
  )
}
