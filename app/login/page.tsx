'use client'
import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Eye, EyeOff, HelpCircle } from 'lucide-react'
import { login } from '@/lib/api'
import { salvarUsuario } from '@/lib/auth'

function LoginPageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams?.get('redirect') || '/menu'

  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [verSenha, setVerSenha] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [mounted, setMounted] = useState(false)
  const [showReset, setShowReset] = useState(false)
  const [emailReset, setEmailReset] = useState('')
  const [resetMsg, setResetMsg] = useState('')

  useEffect(() => { setMounted(true) }, [])

  const handleLogin = async () => {
    if (!email || !senha) { setErro('Preencha todos os campos.'); return }
    setErro('')
    setLoading(true)
    if (navigator.vibrate) navigator.vibrate(10)

    const res = await login(email.trim().toLowerCase(), senha)
    setLoading(false)

    if (res.ok && res.data) {
      salvarUsuario(res.data as any)
      router.push(redirect)
    } else {
      setErro(res.erro || 'E-mail ou senha incorretos.')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleLogin()
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column' }}>
      {/* ÁREA AZUL */}
      <div style={{
        background: 'linear-gradient(135deg, #5B6FE8 0%, #7B8FF5 60%, #9BB0FF 100%)',
        paddingTop: 'env(safe-area-inset-top, 20px)',
        minHeight: 240,
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
      }}>
        {/* Blobs */}
        <div style={{ position: 'absolute', width: 200, height: 200, borderRadius: '50%', background: 'rgba(255,255,255,0.1)', top: -80, right: -60 }} />
        <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', background: 'rgba(255,255,255,0.08)', bottom: -40, left: -30 }} />
        <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.06)', top: 30, left: 20 }} />

        {/* Logo */}
        <div style={{
          width: 100, height: 100, borderRadius: '50%',
          background: 'white', boxShadow: '0 8px 40px rgba(0,0,0,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1, position: 'relative',
          animation: mounted ? 'logo-in 0.7s cubic-bezier(0.34,1.56,0.64,1) both' : 'none',
        }}>
          <img src="/logo-deep.png" alt="Acamp Deep" width={76} height={76} style={{ objectFit: 'contain' }} />
        </div>
      </div>

      {/* FORMULÁRIO */}
      <div style={{
        flex: 1, padding: '28px 24px', display: 'flex', flexDirection: 'column',
        animation: mounted ? 'fade-up 0.5s ease 0.2s both' : 'none',
      }}>
        <h2 style={{
          fontFamily: 'Poppins, sans-serif', fontWeight: 700, fontSize: 22,
          color: 'var(--text-main)', margin: '0 0 24px', letterSpacing: '-0.02em',
        }}>
          Login
        </h2>

        {erro && (
          <div style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 16,
            color: '#DC2626', fontSize: 13, fontFamily: 'Poppins, sans-serif',
          }}>
            {erro}
          </div>
        )}

        <div className="input-group">
          <label className="input-label">E-mail</label>
          <input
            className="input-field"
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="email@exemplo.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        <div className="input-group">
          <label className="input-label">Senha</label>
          <div style={{ position: 'relative' }}>
            <input
              className="input-field"
              type={verSenha ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="**************"
              value={senha}
              onChange={e => setSenha(e.target.value)}
              onKeyDown={handleKeyDown}
              style={{ paddingRight: 46 }}
            />
            <button
              type="button"
              onClick={() => setVerSenha(!verSenha)}
              style={{
                position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                padding: 4, display: 'flex',
              }}
            >
              {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          <div style={{ textAlign: 'right', marginTop: 8 }}>
            <button
              type="button"
              onClick={() => setShowReset(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: 'var(--primary)', fontSize: 13, fontFamily: 'Poppins, sans-serif',
                fontWeight: 500, padding: 0,
              }}
            >
              Esqueci a senha
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12, marginTop: 8 }}>
          <button
            className="btn-outline btn-full"
            onClick={() => router.push('/cadastro')}
            style={{ flex: 1 }}
          >
            Cadastrar
          </button>
          <button
            className="btn-primary btn-full"
            onClick={handleLogin}
            disabled={loading}
            style={{ flex: 1, opacity: loading ? 0.7 : 1 }}
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
        </div>
      </div>

      {/* ÍCONE AJUDA FLUTUANTE */}
      <button
        onClick={() => router.push('/ajuda')}
        style={{
          position: 'fixed', bottom: 24, right: 20,
          width: 52, height: 52, borderRadius: '50%',
          background: 'linear-gradient(135deg, #5B6FE8, #9BB0FF)',
          border: 'none', cursor: 'pointer', boxShadow: '0 4px 16px rgba(91,111,232,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', transition: 'transform 150ms ease',
        }}
        onMouseDown={e => { e.currentTarget.style.transform = 'scale(0.92)' }}
        onMouseUp={e => { e.currentTarget.style.transform = 'scale(1)' }}
      >
        <HelpCircle size={24} />
      </button>

      {/* MODAL RECUPERAR SENHA */}
      {showReset && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100,
          display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
        }} onClick={() => { setShowReset(false); setResetMsg('') }}>
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: 'white', borderRadius: '20px 20px 0 0',
              padding: '24px 24px calc(24px + env(safe-area-inset-bottom, 0px))',
              width: '100%', maxWidth: 430,
              animation: 'slide-up 0.3s ease',
            }}
          >
            <h3 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, margin: '0 0 6px', color: 'var(--text-main)' }}>
              Recuperar Senha
            </h3>
            <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)', margin: '0 0 20px' }}>
              Digite seu e-mail para receber o link de recuperação.
            </p>
            {resetMsg && (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#059669', fontSize: 13, fontFamily: 'Poppins' }}>
                {resetMsg}
              </div>
            )}
            <div className="input-group">
              <label className="input-label">E-mail</label>
              <input className="input-field" type="email" placeholder="email@exemplo.com" value={emailReset} onChange={e => setEmailReset(e.target.value)} />
            </div>
            <button
              className="btn-primary btn-full"
              onClick={async () => {
                const { recuperarSenha } = await import('@/lib/api')
                const res = await recuperarSenha(emailReset)
                if (res.ok) setResetMsg('Link enviado! Verifique sua caixa de entrada.')
                else setResetMsg(res.erro || 'Erro ao enviar.')
              }}
            >
              Enviar link
            </button>
          </div>
        </div>
      )}

      <style>{`
        @keyframes logo-in { from { transform: scale(0.5) translateY(20px); opacity: 0; } to { transform: scale(1) translateY(0); opacity: 1; } }
        @keyframes fade-up { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
        @keyframes slide-up { from { transform: translateY(100%); } to { transform: translateY(0); } }
      `}</style>
    </main>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageContent />
    </Suspense>
  )
}
