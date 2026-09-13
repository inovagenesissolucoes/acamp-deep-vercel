'use client'
import { useEffect, useRef, useState } from 'react'
import { Check, Copy } from 'lucide-react'
import QRCode from 'qrcode'

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

  function limparChavePix(chaveOriginal: string): string {
    const chave = chaveOriginal.trim()
    // E-mail: mantém como está
    if (chave.includes('@')) return chave
    // Chave aleatória (EVP): formato UUID com hífens — mantém como está
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(chave)) return chave

    const temParenteses = chave.includes('(')
    const apenasNumeros = chave.replace(/[^\d+]/g, '')

    // Telefone: tem parênteses, começa com "+", ou já parece ter DDI 55
    if (temParenteses || chave.startsWith('+') || (apenasNumeros.length === 13 && apenasNumeros.startsWith('55'))) {
      const numerosPuros = apenasNumeros.replace(/^\+/, '')
      const comDDI = numerosPuros.startsWith('55') && numerosPuros.length >= 12 ? numerosPuros : '55' + numerosPuros
      return '+' + comDDI
    }

    // CPF (11 dígitos) ou CNPJ (14 dígitos)
    if (apenasNumeros.length === 11 || apenasNumeros.length === 14) return apenasNumeros

    // Não reconhecido: retorna como veio (evita quebrar chaves em formatos não previstos)
    return chave
  }

  function gerarCodigoPix(chave: string, val: number, desc?: string): string {
    // Payload PIX simplificado (BR Code)
    const chaveLimpa = limparChavePix(chave)
    const valorStr = val.toFixed(2)
    const merchantName = 'ACAMP DEEP'
    const merchantCity = 'SAO PAULO'
    const txid = 'ACAMPDEEP' + Date.now().toString().slice(-5)
    const descricao_enc = desc ? desc.slice(0, 25) : 'Parcela Acampamento'

    function tlv(id: string, value: string) {
      const len = value.length.toString().padStart(2, '0')
      return `${id}${len}${value}`
    }

    const gui = tlv('00', 'br.gov.bcb.pix')
    const pixKey = tlv('01', chaveLimpa)
    const adicional = tlv('02', descricao_enc)
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
      await QRCode.toCanvas(canvas, text, {
        width: 260,
        margin: 1,
        color: { dark: '#1A1A2E', light: '#FFFFFF' },
      })
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
            width={260}
            height={260}
            style={{ display: 'block' }}
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
