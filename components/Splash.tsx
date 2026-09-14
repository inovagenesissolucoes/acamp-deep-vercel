'use client'
import { useEffect, useState } from 'react'

const DURACAO = 3200
const FADE = 500

const TUBES_URL = 'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js'
const TUBES_OPTIONS = {
  tubes: {
    colors: ['#5B6FE8', '#9BB0FF', '#7B8FF5'],
    lights: {
      intensity: 200,
      colors: ['#C5CCFF', '#9BB0FF', '#5B6FE8', '#7B8FF5'],
    },
  },
}

function supportsWebGL(): boolean {
  try {
    const c = document.createElement('canvas')
    return !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch { return false }
}

function loadTubesModule(): Promise<any> {
  const importer = new Function('u', 'return import(u)')
  return importer(TUBES_URL)
}

type Estado = 'carregando' | 'webgl-ok' | 'fallback'

export default function Splash({ onDone }: { onDone: () => void }) {
  const [saindo, setSaindo] = useState(false)
  const [estado, setEstado] = useState<Estado>('carregando')

  useEffect(() => {
    let app: any = null
    let stopped = false
    let canvas: HTMLCanvasElement | null = null

    // Se WebGL falhar em até 1200ms, cai no fallback em CSS
    const tFallback = setTimeout(() => {
      if (!stopped) setEstado(prev => (prev === 'carregando' ? 'fallback' : prev))
    }, 1200)

    if (supportsWebGL()) {
      loadTubesModule()
        .then((mod: any) => {
          if (stopped) return
          const TubesCursor = mod?.default || mod
          canvas = document.getElementById('acamp-neon-canvas') as HTMLCanvasElement | null
          if (typeof TubesCursor === 'function' && canvas) {
            app = TubesCursor(canvas, TUBES_OPTIONS)
            try { window.dispatchEvent(new Event('resize')) } catch {}

            requestAnimationFrame(() => {
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  setTimeout(() => {
                    if (!stopped) {
                      clearTimeout(tFallback)
                      setEstado('webgl-ok')
                    }
                  }, 400)
                })
              })
            })
          } else {
            clearTimeout(tFallback)
            setEstado('fallback')
          }
        })
        .catch(() => {
          if (stopped) return
          clearTimeout(tFallback)
          setEstado('fallback')
        })
    } else {
      clearTimeout(tFallback)
      setEstado('fallback')
    }

    const t1 = setTimeout(() => setSaindo(true), DURACAO)
    const t2 = setTimeout(() => onDone(), DURACAO + FADE)

    return () => {
      stopped = true
      clearTimeout(tFallback); clearTimeout(t1); clearTimeout(t2)
      try { app?.destroy?.() } catch {}
      try {
        if (canvas) {
          const gl = canvas.getContext('webgl2') || canvas.getContext('webgl')
          const lose = (gl as any)?.getExtension?.('WEBGL_lose_context')
          lose?.loseContext?.()
        }
      } catch {}
    }
  }, [onDone])

  return (
    <div
      aria-hidden
      className={`acamp-loader acamp-estado-${estado}`}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: '#0A0F2C',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        opacity: saindo ? 0 : 1,
        transition: `opacity ${FADE}ms ease-out`,
        pointerEvents: saindo ? 'none' : 'auto',
        overflow: 'hidden', isolation: 'isolate',
      }}
    >
      <canvas id="acamp-neon-canvas" className="acamp-neon-canvas" aria-hidden />
      <div className="acamp-neon-fallback" aria-hidden />

      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18,
        position: 'relative', zIndex: 4, pointerEvents: 'none',
      }}>
        <div className="acamp-logo-wrap">
          <img
            src="/logo-deep.png"
            alt="Acamp Deep"
            width={120}
            height={120}
            className="acamp-logo"
            style={{ width: 120, height: 120, display: 'block', borderRadius: '50%' }}
          />
        </div>
        <div className="acamp-nome">ACAMP DEEP</div>
        <div className="acamp-tag">Um encontro com Deus vem aí</div>
      </div>

      <style>{`
        .acamp-neon-canvas, .acamp-neon-fallback {
          position: absolute; inset: 0; width: 100%; height: 100%;
        }
        .acamp-neon-canvas {
          z-index: 1; display: block; opacity: 0;
          transition: opacity 900ms ease; touch-action: none;
        }
        .acamp-neon-fallback {
          z-index: 0; overflow: hidden; opacity: 0; pointer-events: none;
          background:
            radial-gradient(circle at 28% 40%, rgba(91,111,232,.28), transparent 21%),
            radial-gradient(circle at 43% 28%, rgba(123,143,245,.24), transparent 26%),
            radial-gradient(circle at 57% 25%, rgba(155,176,255,.18), transparent 25%),
            radial-gradient(circle at 34% 34%, rgba(197,204,255,.16), transparent 31%),
            #0A0F2C;
          transition: opacity 700ms ease;
        }
        .acamp-neon-fallback::before, .acamp-neon-fallback::after {
          content: ''; position: absolute; left: 20%; top: 24%;
          width: 44vw; height: 24vw; max-height: 360px;
          border-radius: 50%; transform: rotate(-13deg);
          border-top: 3px solid #5B6FE8;
          box-shadow:
            0 -6px 18px #9BB0FF,
            0 -12px 28px #7B8FF5,
            0 -18px 38px #5B6FE8,
            0 -24px 48px #C5CCFF;
          filter: blur(.3px); opacity: .8;
        }
        .acamp-neon-fallback::after {
          left: 24%; top: 29%; width: 38vw; height: 19vw;
          border-top-color: #7B8FF5; opacity: .55;
        }

        .acamp-loader.acamp-estado-carregando .acamp-neon-canvas,
        .acamp-loader.acamp-estado-carregando .acamp-neon-fallback { opacity: 0; }

        .acamp-loader.acamp-estado-webgl-ok .acamp-neon-canvas { opacity: 1; }
        .acamp-loader.acamp-estado-webgl-ok .acamp-neon-fallback { opacity: 0; }

        .acamp-loader.acamp-estado-fallback .acamp-neon-canvas { opacity: 0; }
        .acamp-loader.acamp-estado-fallback .acamp-neon-fallback { opacity: 1; }

        .acamp-logo-wrap {
          border-radius: 50%;
          box-shadow: 0 8px 40px rgba(0,0,0,.35);
          opacity: 0;
          animation: acamp-logo-in .8s ease-out .15s forwards, acamp-logo-glow 2.6s ease-in-out 1s infinite;
        }
        @keyframes acamp-logo-in {
          0%   { opacity: 0; transform: translateY(20px) scale(.85); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes acamp-logo-glow {
          0%,100% { filter: drop-shadow(0 0 10px rgba(91,111,232,.3)); }
          50%     { filter: drop-shadow(0 0 26px rgba(91,111,232,.6)) drop-shadow(0 0 46px rgba(155,176,255,.35)); }
        }

        .acamp-nome {
          font-family: 'Poppins', sans-serif;
          font-size: 26px; font-weight: 800;
          color: #fff; letter-spacing: 4px;
          opacity: 0;
          text-shadow:
            0 0 20px rgba(255,255,255,.4),
            0 0 36px rgba(123,143,245,.35);
          animation: acamp-text-in .8s ease-out .65s forwards;
        }
        .acamp-tag {
          color: rgba(255,255,255,.7);
          font-family: 'Poppins', sans-serif;
          font-size: 13px; letter-spacing: .5px;
          font-weight: 400;
          opacity: 0;
          animation: acamp-text-in .8s ease-out .9s forwards;
        }
        @keyframes acamp-text-in {
          0%   { opacity: 0; transform: translateY(12px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @media (prefers-reduced-motion: reduce) {
          .acamp-logo-wrap, .acamp-nome, .acamp-tag {
            animation-duration: 300ms !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>
    </div>
  )
}
