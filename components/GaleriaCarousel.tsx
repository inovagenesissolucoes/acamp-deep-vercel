'use client'
import { useEffect, useState } from 'react'

export interface MidiaItem {
  id: string
  tipo: 'foto' | 'video'
  url: string
  eventoId: string
}

interface Props {
  itens: MidiaItem[]
}

export default function GaleriaCarousel({ itens }: Props) {
  const [indice, setIndice] = useState(0)

  if (!itens.length) {
    return (
      <div style={{
        margin: '0 16px', height: 220, borderRadius: 16,
        background: 'rgba(255,255,255,0.12)', backdropFilter: 'blur(8px)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 36 }}>📸</span>
        <p style={{ color: 'rgba(255,255,255,0.7)', fontFamily: 'Poppins', fontSize: 13, margin: 0 }}>
          Em breve: fotos e vídeos dos eventos
        </p>
      </div>
    )
  }

  return (
    <div style={{ position: 'relative' }}>
      <div className="carousel-container">
        {itens.map((item, i) => (
          <div key={item.id} className="carousel-item" style={{ position: 'relative' }}>
            {item.tipo === 'video' ? (
              <video
                src={item.url}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                controls
                playsInline
              />
            ) : (
              <img
                src={item.url}
                alt="Foto do evento"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                loading="lazy"
              />
            )}
            {item.tipo === 'video' && (
              <div style={{
                position: 'absolute', top: 10, right: 10,
                background: 'rgba(0,0,0,0.5)', color: 'white',
                fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 20,
                fontFamily: 'Poppins',
              }}>
                ▶ Vídeo
              </div>
            )}
          </div>
        ))}
      </div>
      {/* Indicadores */}
      {itens.length > 1 && (
        <div style={{
          display: 'flex', gap: 6, justifyContent: 'center',
          marginTop: 10,
        }}>
          {itens.map((_, i) => (
            <div key={i} style={{
              width: i === indice ? 20 : 6,
              height: 6, borderRadius: 3,
              background: i === indice ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.35)',
              transition: 'all 300ms ease',
            }} />
          ))}
        </div>
      )}
    </div>
  )
}
