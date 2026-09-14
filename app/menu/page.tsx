'use client'
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { User, HelpCircle, BookOpen, LogOut, Menu, X, ClipboardList, Users, Tent, LayoutDashboard, Home, CreditCard, ChevronRight } from 'lucide-react'
import EventoCard, { Evento } from '@/components/EventoCard'
import type { Parcela } from '@/components/ParcelaCard'
import GaleriaCarousel, { MidiaItem } from '@/components/GaleriaCarousel'
import { getEventoAtivo, getMinhasInscricoes, listarGaleria, logout } from '@/lib/api'
import { getUsuarioLocal, isLider, limparSessao } from '@/lib/auth'

export default function MenuPage() {
  const router = useRouter()
  const [usuario, setUsuario] = useState<ReturnType<typeof getUsuarioLocal>>(null)
  const [evento, setEvento] = useState<Evento | null>(null)
  const [parcelas, setParcelas] = useState<Parcela[]>([])
  const [galeria, setGaleria] = useState<MidiaItem[]>([])
  const [loadingEvento, setLoadingEvento] = useState(true)
  const [loadingParcelas, setLoadingParcelas] = useState(true)
  const [pullY, setPullY] = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [menuAberto, setMenuAberto] = useState(false)
  const [eventosInscritos, setEventosInscritos] = useState<string[]>([])

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
      setEventosInscritos(inscricoes.map((i: any) => i.eventoId))
    }
    setLoadingParcelas(false)

    listarGaleria().then(r => { if (r.ok && r.data) setGaleria(r.data as MidiaItem[]) })
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

  const proximaParcela = parcelas
    .filter(p => p.status !== 'Pago')
    .sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime())[0]

  const icones = [
    { label: 'Início', icon: <Home size={22} />, href: '/menu' },
    { label: 'Perfil', icon: <User size={22} />, href: '/meu-cadastro' },
    { label: 'Ajuda', icon: <HelpCircle size={22} />, href: '/ajuda' },
    { label: 'Manual', icon: <BookOpen size={22} />, href: '/ajuda2' },
  ]

  const itensLider = [
    { label: 'Inscritos', icon: <ClipboardList size={20} />, href: '/admin/inscricoes' },
    { label: 'Cadastrados', icon: <Users size={20} />, href: '/admin/cadastrados' },
    { label: 'Eventos', icon: <Tent size={20} />, href: '/admin/eventos' },
    { label: 'Dashboard', icon: <LayoutDashboard size={20} />, href: '/admin/dashboard' },
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
        padding: `calc(env(safe-area-inset-top, 0px) + 18px) 20px 22px`,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Blobs */}
        <div style={{ position: 'absolute', width: 160, height: 160, borderRadius: '50%', background: 'rgba(255,255,255,0.09)', top: -60, right: -50, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
            <div style={{
              width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(255,255,255,0.22)', border: '2px solid rgba(255,255,255,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 16, color: 'white' }}>
                {(usuario?.nome?.[0] || '') + (usuario?.sobrenome?.[0] || '')}
              </span>
            </div>
            <div style={{ minWidth: 0 }}>
              <p style={{
                fontFamily: 'Poppins', fontSize: 17, fontWeight: 700, color: 'white',
                margin: 0, letterSpacing: '-0.01em', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                Olá, {usuario?.nome || 'Usuário'}
              </p>
              <p style={{
                fontFamily: 'Poppins', fontSize: 12, color: 'rgba(255,255,255,0.8)', margin: '2px 0 0',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {usuario?.email}
              </p>
            </div>
          </div>
          <button onClick={() => setMenuAberto(true)} style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Menu size={19} />
          </button>
        </div>
      </div>

      {/* CORPO */}
      <div style={{ flex: 1, overflowY: 'auto', paddingBottom: 110 }}>

        {/* Evento Ativo */}
        <div style={{ marginTop: 24 }}>
          <h2 className="section-title">Evento Ativo</h2>
          {loadingEvento ? (
            <div style={{ margin: '0 16px' }}>
              <div className="skeleton" style={{ height: 180 }} />
            </div>
          ) : evento ? (
            evento.status === 'concluido' ? (
              <div style={{ margin: '0 16px', background: 'white', borderRadius: 14, padding: 24, textAlign: 'center' }}>
                <span style={{ fontSize: 36 }}>🎉</span>
                <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, color: 'var(--text-main)', margin: '10px 0 2px' }}>
                  {evento.nome} concluído!
                </p>
                <p style={{ fontFamily: 'Poppins', fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                  Aguardando o próximo acampamento ✨
                </p>
              </div>
            ) : (
              <EventoCard evento={evento} inscrito={eventosInscritos.includes(evento.id)} />
            )
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', marginBottom: 10 }}>
            <h2 className="section-title" style={{ padding: 0, margin: 0 }}>Minhas parcelas</h2>
            <button
              onClick={() => router.push('/parcelas')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 2, fontFamily: 'Poppins', fontSize: 13, fontWeight: 600, color: 'var(--primary)', padding: 0 }}
            >
              Ver todas <ChevronRight size={15} />
            </button>
          </div>
          <div style={{ padding: '0 16px' }}>
            {loadingParcelas ? (
              <div className="skeleton" style={{ height: 76 }} />
            ) : proximaParcela ? (
              <div
                className="card-solid"
                style={{ display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
                onClick={() => router.push(`/pagamento/${proximaParcela.id}`)}
              >
                <div style={{
                  width: 46, height: 46, borderRadius: '50%', flexShrink: 0,
                  background: 'rgba(91,111,232,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <CreditCard size={20} color="var(--primary)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: 'Poppins', fontSize: 12.5, color: 'var(--text-muted)', margin: '0 0 2px' }}>
                    Próxima parcela
                  </p>
                  <p style={{ fontFamily: 'Poppins', fontSize: 19, fontWeight: 700, color: 'var(--text-main)', margin: '0 0 2px', letterSpacing: '-0.01em' }}>
                    {proximaParcela.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                  <p style={{ fontFamily: 'Poppins', fontSize: 12.5, color: 'var(--text-muted)', margin: 0 }}>
                    Vencimento em {new Date(proximaParcela.vencimento).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <ChevronRight size={20} color="var(--text-muted)" style={{ flexShrink: 0 }} />
              </div>
            ) : parcelas.length > 0 ? (
              <div className="card-solid" style={{ textAlign: 'center' }}>
                <span style={{ fontSize: 28 }}>🎉</span>
                <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 0' }}>
                  Todas as parcelas estão pagas!
                </p>
              </div>
            ) : (
              <div style={{ background: 'white', borderRadius: 14, padding: 20, textAlign: 'center' }}>
                <span style={{ fontSize: 28 }}>💳</span>
                <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 0' }}>
                  Você não possui parcelas no momento
                </p>
                {evento && evento.status !== 'concluido' && (
                  <button className="btn-primary" style={{ marginTop: 14, padding: '10px 24px', fontSize: 13 }} onClick={() => router.push(`/inscricao/${evento!.id}`)}>
                    Inscrever-se no evento
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Momentos inesquecíveis */}
        <div style={{ marginTop: 28 }}>
          <h2 className="section-title">Momentos inesquecíveis 📷</h2>
          <GaleriaCarousel itens={galeria} />
        </div>

        {/* Ações rápidas para Líder foram movidas para o menu lateral (ícone ☰) */}
      </div>

      {/* MENU LATERAL */}
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
        position: 'fixed', top: 0, left: 0, bottom: 0, width: '82%', maxWidth: 320,
        background: '#F7F8FC', zIndex: 201, boxShadow: '8px 0 32px rgba(0,0,0,0.18)',
        transform: menuAberto ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.28s cubic-bezier(0.32,0.72,0,1)',
        display: 'flex', flexDirection: 'column',
      }}>
        {/* Cabeçalho com dados do usuário */}
        <div style={{
          background: 'linear-gradient(135deg, #5B6FE8 0%, #7B8FF5 60%, #9BB0FF 100%)',
          padding: `calc(env(safe-area-inset-top, 0px) + 24px) 20px 24px`,
          position: 'relative', overflow: 'hidden', flexShrink: 0,
        }}>
          <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', top: -50, right: -40, pointerEvents: 'none' }} />
          <button
            onClick={() => setMenuAberto(false)}
            style={{
              position: 'absolute', top: 'calc(env(safe-area-inset-top, 0px) + 16px)', right: 16,
              width: 32, height: 32, borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
              border: 'none', cursor: 'pointer', color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            <X size={18} />
          </button>

          <div style={{
            width: 56, height: 56, borderRadius: '50%',
            background: 'rgba(255,255,255,0.22)', border: '2px solid rgba(255,255,255,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 12, position: 'relative', zIndex: 1,
          }}>
            <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, color: 'white' }}>
              {(usuario?.nome?.[0] || '') + (usuario?.sobrenome?.[0] || '')}
            </span>
          </div>

          <p style={{
            fontFamily: 'Poppins', fontWeight: 700, fontSize: 17, color: 'white',
            margin: '0 0 3px', position: 'relative', zIndex: 1,
          }}>
            {usuario?.nome} {usuario?.sobrenome}
          </p>
          <p style={{
            fontFamily: 'Poppins', fontSize: 12.5, color: 'rgba(255,255,255,0.8)',
            margin: 0, position: 'relative', zIndex: 1,
          }}>
            {usuario?.email}
          </p>
          {lider && (
            <span style={{
              display: 'inline-block', marginTop: 10, padding: '3px 10px', borderRadius: 999,
              background: 'rgba(255,255,255,0.2)', fontFamily: 'Poppins', fontSize: 11, fontWeight: 600,
              color: 'white', letterSpacing: 0.3, position: 'relative', zIndex: 1,
            }}>
              LÍDER
            </span>
          )}
        </div>

        {/* Itens do menu */}
        <div style={{ padding: '18px 14px', display: 'flex', flexDirection: 'column', gap: 6, flex: 1 }}>
          {lider && (
            <>
              <span style={{ fontFamily: 'Poppins', fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', letterSpacing: 0.4, padding: '0 10px 6px' }}>
                ÁREA DO LÍDER
              </span>
              {itensLider.map(item => (
                <button
                  key={item.href}
                  onClick={() => irPara(item.href)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px', borderRadius: 14, border: 'none',
                    background: 'white', cursor: 'pointer', textAlign: 'left',
                    fontFamily: 'Poppins', fontSize: 14, fontWeight: 600,
                    color: 'var(--text-main)', boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
                  }}
                >
                  <span style={{
                    width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: 'linear-gradient(135deg, #5B6FE8, #9BB0FF)',
                    color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {item.icon}
                  </span>
                  {item.label}
                </button>
              ))}
            </>
          )}
        </div>

        {/* Sair */}
        <div style={{ padding: '14px', borderTop: '1px solid #EAEAEA' }}>
          <button
            onClick={handleLogout}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              width: '100%', padding: '12px', borderRadius: 14, border: 'none',
              background: 'rgba(220,38,38,0.08)', cursor: 'pointer',
              fontFamily: 'Poppins', fontSize: 14, fontWeight: 600, color: '#DC2626',
            }}
          >
            <LogOut size={18} /> Sair
          </button>
        </div>
      </div>

      {/* Navegação inferior fixa */}
      <div style={{
        position: 'fixed', left: 0, right: 0, bottom: 0,
        background: 'white', borderTopLeftRadius: 22, borderTopRightRadius: 22,
        boxShadow: '0 -4px 20px rgba(0,0,0,0.08)',
        display: 'flex', justifyContent: 'space-around',
        padding: `10px 4px calc(env(safe-area-inset-bottom, 0px) + 10px)`,
        zIndex: 50,
      }}>
        {icones.map(item => {
          const ativo = item.href === '/menu'
          return (
            <button
              key={item.label}
              style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, padding: '4px 12px' }}
              onClick={() => {
                if (navigator.vibrate) navigator.vibrate(10)
                router.push(item.href)
              }}
            >
              <div style={{ color: ativo ? 'var(--primary)' : 'var(--text-muted)' }}>{item.icon}</div>
              <span style={{ fontFamily: 'Poppins', fontSize: 10.5, fontWeight: 600, color: ativo ? 'var(--primary)' : 'var(--text-muted)' }}>{item.label}</span>
              {ativo && <span style={{ width: 4, height: 4, borderRadius: '50%', background: 'var(--primary)' }} />}
            </button>
          )
        })}
      </div>
    </main>
  )
}
