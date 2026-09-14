'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import HeaderInterno from '@/components/HeaderInterno'
import QrCodePix from '@/components/QrCodePix'
import { getParcelasInscricao, registrarPagamento } from '@/lib/api'
import { Calendar, Upload, Check } from 'lucide-react'

interface ParcelaDetalhe {
  id: string
  numero: number
  totalParcelas: number
  valor: number
  vencimento: string
  status: string
  chavePix?: string
  tipoChavePix?: string
  eventoNome?: string
}

export default function PagamentoPage() {
  const router = useRouter()
  const params = useParams()
  const parcelaId = params?.parcelaId as string

  const [parcela, setParcela] = useState<ParcelaDetalhe | null>(null)
  const [mostrarQR, setMostrarQR] = useState(false)
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [progresso, setProgresso] = useState(0)
  const [enviando, setEnviando] = useState(false)
  const [pago, setPago] = useState(false)
  const [erro, setErro] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (!parcelaId) return
    // Buscar detalhes da parcela via inscrição
    getParcelasInscricao(parcelaId).then(r => {
      if (r.ok && r.data) {
        const dados = r.data as any
        setParcela(dados)
      }
    })
  }, [parcelaId])

  const handleArquivo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (!f) return
    setArquivo(f)
    const reader = new FileReader()
    reader.onload = ev => setPreview(ev.target?.result as string)
    reader.readAsDataURL(f)
  }

  const handleEnviar = async () => {
    if (!arquivo || !preview) { setErro('Selecione o comprovante.'); return }
    setErro('')
    setEnviando(true)
    if (navigator.vibrate) navigator.vibrate(10)

    // Simular progresso
    const interval = setInterval(() => {
      setProgresso(p => Math.min(p + 15, 90))
    }, 200)

    const base64 = preview.split(',')[1]
    const res = await registrarPagamento({
      parcelaId,
      comprovanteBase64: base64,
      mimeType: arquivo.type,
    })
    clearInterval(interval)
    setProgresso(100)
    setEnviando(false)

    if (res.ok) {
      setPago(true)
    } else {
      setErro(res.erro || 'Erro ao registrar pagamento.')
      setProgresso(0)
    }
  }

  if (pago) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ animation: 'pop-in 0.5s cubic-bezier(0.34,1.56,0.64,1)', fontSize: 64, marginBottom: 16 }}>✅</div>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, color: 'var(--text-main)', margin: '0 0 8px', textAlign: 'center' }}>
          Pagamento registrado!
        </h2>
        <p style={{ fontFamily: 'Poppins', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center', margin: '0 0 24px' }}>
          O líder será notificado para confirmar.
        </p>
        <button className="btn-primary" onClick={() => router.push('/menu')}>
          Voltar ao início
        </button>
        <style>{`@keyframes pop-in { from { transform: scale(0.4); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <HeaderInterno titulo="Pagamento PIX" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px', paddingBottom: 32 }}>

        {/* Info da parcela */}
        {parcela ? (
          <div className="card-solid" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 16, color: 'var(--text-main)', margin: '0 0 6px' }}>
                  Parcela {parcela.numero} de {parcela.totalParcelas}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Calendar size={13} color="var(--text-muted)" />
                  <span style={{ fontFamily: 'Poppins', fontSize: 12, color: 'var(--text-muted)' }}>
                    Vence em {new Date(parcela.vencimento).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>
              <div>
                <p style={{ fontFamily: 'Poppins', fontSize: 24, fontWeight: 700, color: 'var(--primary)', margin: 0, letterSpacing: '-0.02em' }}>
                  {parcela.valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="skeleton" style={{ height: 90, marginBottom: 20 }} />
        )}

        {/* Botão gerar PIX */}
        {!mostrarQR ? (
          <button
            className="btn-primary btn-full"
            style={{ marginBottom: 20 }}
            onClick={() => {
              if (navigator.vibrate) navigator.vibrate(10)
              setMostrarQR(true)
            }}
          >
            Gerar QR Code PIX
          </button>
        ) : (
          <div className="card-solid" style={{ marginBottom: 20 }}>
            <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, color: 'var(--text-main)', textAlign: 'center', margin: '0 0 16px' }}>
              📱 Escaneie o QR Code ou copie o código
            </p>
            <QrCodePix
              chavePix={parcela?.chavePix || ''}
              tipoChavePix={parcela?.tipoChavePix}
              valor={parcela?.valor || 0}
              descricao={`Parcela ${parcela?.numero || ''} - Acamp`}
            />
            <p style={{ fontFamily: 'Poppins', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', margin: '12px 0 0' }}>
              ⚠️ Após o pagamento, envie o comprovante abaixo
            </p>
          </div>
        )}

        {/* Upload comprovante */}
        <div className="card-solid" style={{ marginBottom: 20 }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, color: 'var(--text-main)', margin: '0 0 4px' }}>
            Comprovante de Pagamento
          </p>
          <p style={{ fontFamily: 'Poppins', fontSize: 12, color: 'var(--text-muted)', margin: '0 0 16px' }}>
            Envie uma foto ou PDF do comprovante PIX
          </p>

          <input
            ref={fileRef}
            type="file"
            accept="image/*,application/pdf"
            onChange={handleArquivo}
            style={{ display: 'none' }}
            capture="environment"
          />

          {preview ? (
            <div style={{ marginBottom: 12 }}>
              {arquivo?.type.startsWith('image/') ? (
                <img src={preview} alt="Comprovante" style={{ width: '100%', borderRadius: 10, maxHeight: 200, objectFit: 'cover' }} />
              ) : (
                <div style={{ background: '#F5F5F5', borderRadius: 10, padding: 16, textAlign: 'center' }}>
                  <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-main)', margin: 0 }}>
                    📄 {arquivo?.name}
                  </p>
                </div>
              )}
              <button
                onClick={() => { setArquivo(null); setPreview(null); setProgresso(0) }}
                style={{ fontFamily: 'Poppins', fontSize: 12, color: 'var(--text-muted)', background: 'none', border: 'none', cursor: 'pointer', marginTop: 8, padding: 0 }}
              >
                Trocar comprovante
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileRef.current?.click()}
              style={{
                width: '100%', border: '2px dashed #D0D0D0', borderRadius: 12,
                padding: '24px 20px', background: 'none', cursor: 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
                transition: 'border-color 150ms',
              }}
              onMouseEnter={e => { (e.currentTarget as any).style.borderColor = 'var(--primary)' }}
              onMouseLeave={e => { (e.currentTarget as any).style.borderColor = '#D0D0D0' }}
            >
              <Upload size={28} color="var(--text-muted)" />
              <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)', margin: 0 }}>
                Toque para selecionar o comprovante
              </p>
              <p style={{ fontFamily: 'Poppins', fontSize: 11, color: '#C0C0C0', margin: 0 }}>
                Foto, print ou PDF
              </p>
            </button>
          )}

          {progresso > 0 && (
            <div style={{ marginTop: 12 }}>
              <div className="upload-progress">
                <div className="upload-progress-bar" style={{ width: `${progresso}%` }} />
              </div>
              <p style={{ fontFamily: 'Poppins', fontSize: 11, color: 'var(--text-muted)', margin: '4px 0 0', textAlign: 'center' }}>
                {progresso < 100 ? 'Enviando...' : 'Enviado!'}
              </p>
            </div>
          )}
        </div>

        {erro && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#DC2626', fontSize: 13, fontFamily: 'Poppins' }}>
            {erro}
          </div>
        )}

        <button
          className="btn-primary btn-full"
          onClick={handleEnviar}
          disabled={!arquivo || enviando}
          style={{ opacity: (!arquivo || enviando) ? 0.6 : 1 }}
        >
          {enviando ? 'Enviando comprovante...' : 'Confirmar Pagamento'}
        </button>

        <p style={{ fontFamily: 'Poppins', fontSize: 11, color: 'var(--text-muted)', textAlign: 'center', margin: '12px 0 0' }}>
          Parcelas vencidas podem ser pagas a qualquer momento
        </p>
      </div>
    </main>
  )
}
