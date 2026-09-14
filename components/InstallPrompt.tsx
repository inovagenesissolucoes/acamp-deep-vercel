'use client'
import { useEffect, useState } from 'react'
import { Download, X, Share } from 'lucide-react'

const CHAVE_DISPENSADO = 'acamp_install_dispensado'

function estaInstalado(): boolean {
  if (typeof window === 'undefined') return false
  const standalone = window.matchMedia('(display-mode: standalone)').matches
  const iosStandalone = (window.navigator as any).standalone === true
  return standalone || iosStandalone
}

function ehIOS(): boolean {
  if (typeof navigator === 'undefined') return false
  return /iphone|ipad|ipod/i.test(navigator.userAgent) && !(window as any).MSStream
}

function jaFoiDispensado(): boolean {
  try { return localStorage.getItem(CHAVE_DISPENSADO) === '1' } catch { return false }
}

export default function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<any>(null)
  const [mostrarIOS, setMostrarIOS] = useState(false)
  const [fechado, setFechado] = useState(false)

  useEffect(() => {
    if (estaInstalado() || jaFoiDispensado()) return

    if (ehIOS()) {
      setMostrarIOS(true)
      return
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setPromptEvent(e)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dispensar = () => {
    setFechado(true)
    try { localStorage.setItem(CHAVE_DISPENSADO, '1') } catch {}
  }

  if (fechado) return null
  if (!promptEvent && !mostrarIOS) return null

  const instalar = async () => {
    if (!promptEvent) return
    promptEvent.prompt()
    await promptEvent.userChoice
    setPromptEvent(null)
    try { localStorage.setItem(CHAVE_DISPENSADO, '1') } catch {}
  }

  return (
    <div style={{
      position: 'fixed', left: 14, right: 14,
      bottom: 'calc(env(safe-area-inset-bottom, 0px) + 14px)',
      background: 'white', borderRadius: 16, padding: '14px 14px',
      boxShadow: '0 8px 28px rgba(0,0,0,0.18)', zIndex: 300,
      display: 'flex', alignItems: 'center', gap: 12,
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 12, flexShrink: 0, overflow: 'hidden',
        background: 'linear-gradient(135deg, #5B6FE8, #9BB0FF)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <img src="/logo-deep.png" alt="Acamp Deep" width={42} height={42} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 13.5, color: 'var(--text-main)', margin: '0 0 2px' }}>
          Instale o Acamp Deep
        </p>
        {mostrarIOS ? (
          <p style={{ fontFamily: 'Poppins', fontSize: 12, color: 'var(--text-muted)', margin: 0, display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
            Toque em <Share size={13} style={{ display: 'inline' }} /> e depois em "Adicionar à Tela de Início"
          </p>
        ) : (
          <p style={{ fontFamily: 'Poppins', fontSize: 12, color: 'var(--text-muted)', margin: 0 }}>
            Acesso rápido direto da tela inicial do seu celular
          </p>
        )}
      </div>

      {!mostrarIOS && (
        <button
          onClick={instalar}
          style={{
            flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6,
            background: 'var(--primary)', color: 'white', border: 'none',
            borderRadius: 10, padding: '9px 14px', fontFamily: 'Poppins', fontWeight: 700, fontSize: 12.5,
            cursor: 'pointer',
          }}
        >
          <Download size={14} /> Instalar
        </button>
      )}

      <button
        onClick={dispensar}
        style={{
          flexShrink: 0, width: 28, height: 28, borderRadius: '50%',
          background: '#F0F1FB', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)',
        }}
      >
        <X size={15} />
      </button>
    </div>
  )
}
