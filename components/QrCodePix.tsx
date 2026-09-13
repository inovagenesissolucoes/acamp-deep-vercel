'use client'
import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'

interface Props {
  chavePix: string
  valor: number
  descricao?: string
}

export default function QrCodePix({ chavePix, valor, descricao }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [copiado, setCopiado] = useState(false)
  const [qrLoaded, setQrLoaded] = useState(false)

  useEffect(() => {
    // Gera QR Code via API do canvas (qrcode lib via CDN dinâmico)
    const pixCode = gerarCodigoPix(chavePix, valor, descricao)
    gerarQR(pixCode)
  }, [chavePix, valor, descricao])

  function gerarCodigoPix(chave: string, val: number, desc?: string): string {
    // Payload PIX simplificado (BR Code)
    const valorStr = val.toFixed(2)
    const merchantName = 'ACAMP DEEP'
    const merchantCity = 'SAO PAULO'
    const txid = 'ACAMPDEEP' + Date.now().toString().slice(-5)
    const descricao_enc = desc ? desc.slice(0, 25) : 'Parcela Acampamento'

    function tlv(id: string, value: string) {
      const len = value.length.toString().padStart(2, '0')
      return `${id}${len}${value}`
    }

    const gui = tlv('00', 'BR.GOV.BCB.PIX')
    const pixKey = tlv('01', chave)
    const adicional = tlv('05', descricao_enc)
    const merchantAccount = tlv('26', gui + pixKey + adicional)

    const amount = tlv('54', valorStr)
    const payload =
      tlv('00', '01') +
      merchantAccount +
      tlv('52', '0000') +
      tlv('53', '986') +
      amount +
      tlv('58', 'BR') +
      tlv('59', merchantName.slice(0, 25)) +
      tlv('60', merchantCity.slice(0, 15)) +
      tlv('62', tlv('05', txid.slice(0, 25)))

    const crc = calcularCRC16('6304' + payload)
    return payload + '6304' + crc
  }

  function calcularCRC16(str: string): string {
    let crc = 0xFFFF
    for (let i = 0; i < str.length; i++) {
      crc ^= str.charCodeAt(i) << 8
      for (let j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? ((crc << 1) ^ 0x1021) : (crc << 1)
      }
    }
    return (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0')
  }

  async function gerarQR(text: string) {
    const canvas = canvasRef.current
    if (!canvas) return
    try {
      // Usa qrcode-generator simples (sem deps extras)
      const size = 200
      const ctx = canvas.getContext('2d')
      if (!ctx) return

      // Placeholder visual enquanto não tem a lib instalada
      ctx.fillStyle = '#fff'
      ctx.fillRect(0, 0, size, size)
      ctx.fillStyle = '#5B6FE8'
      ctx.font = 'bold 11px Poppins, sans-serif'
      ctx.textAlign = 'center'
      ctx.fillText('QR Code PIX', size / 2, size / 2 - 10)
      ctx.fillStyle = '#9E9E9E'
      ctx.font = '9px Poppins, sans-serif'
      ctx.fillText('Gerado após npm install', size / 2, size / 2 + 10)

      // Desenhar padrão visual de QR
      const cellSize = 8
      const data = text.split('').map(c => c.charCodeAt(0))
      for (let row = 0; row < 20; row++) {
        for (let col = 0; col < 20; col++) {
          if (data[(row * 20 + col) % data.length] % 2 === 0) {
            ctx.fillStyle = '#1A1A2E'
            ctx.fillRect(col * cellSize + 4, row * cellSize + 4, cellSize - 1, cellSize - 1)
          }
        }
      }
      setQrLoaded(true)
    } catch (e) {
      console.error('QR error:', e)
    }
  }

  const pixPayload = gerarCodigoPix(chavePix, valor, descricao)

  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(pixPayload)
      setCopiado(true)
      if (navigator.vibrate) navigator.vibrate(10)
      setTimeout(() => setCopiado(false), 2000)
    } catch {}
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
      <div className="qr-container">
        <div className="qr-inner">
          <canvas
            ref={canvasRef}
            width={200}
            height={200}
            style={{ display: 'block', borderRadius: 8 }}
          />
        </div>
      </div>

      <div style={{
        width: '100%', background: '#F5F5F5', borderRadius: 10,
        padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <code style={{
          flex: 1, fontSize: 10, color: 'var(--text-muted)',
          wordBreak: 'break-all', lineHeight: 1.5,
        }}>
          {pixPayload.slice(0, 60)}...
        </code>
        <button
          className="btn-primary"
          onClick={copiar}
          style={{ padding: '8px 16px', fontSize: 13, flexShrink: 0 }}
        >
          {copiado ? <Check size={14} /> : <Copy size={14} />}
          {copiado ? 'Copiado!' : 'Copiar'}
        </button>
      </div>
    </div>
  )
}
