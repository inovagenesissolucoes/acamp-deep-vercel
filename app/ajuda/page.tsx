'use client'
import { useRouter } from 'next/navigation'
import HeaderInterno from '@/components/HeaderInterno'

const faqs = [
  { q: 'Como me inscrever em um evento?', r: 'Na tela inicial, toque no card do evento ativo para ver os detalhes. Se as inscrições estiverem abertas, clique em "Inscrever-se" e escolha a quantidade de parcelas.' },
  { q: 'Como pagar uma parcela?', r: 'Na tela inicial, na seção "Minhas Parcelas", toque no botão "Pagar" na parcela desejada. Você poderá gerar o QR Code PIX e enviar o comprovante.' },
  { q: 'Posso pagar uma parcela vencida?', r: 'Sim! Parcelas vencidas não bloqueiam o pagamento. Você pode pagar a qualquer momento através do botão "Pagar".' },
  { q: 'Preciso de autorização de responsável?', r: 'Participantes menores de uma certa idade (definida pelo líder) precisam informar o WhatsApp de um responsável no momento da inscrição.' },
  { q: 'Como saber se meu pagamento foi confirmado?', r: 'Após enviar o comprovante, a parcela ficará com status "Pago ✅". O líder também receberá uma notificação.' },
]

export default function AjudaPage() {
  const router = useRouter()
  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <HeaderInterno titulo="Ajuda" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px', paddingBottom: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🙋</div>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, color: 'var(--text-main)', margin: 0 }}>Perguntas Frequentes</h2>
          <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Dúvidas sobre o Acamp Deep</p>
        </div>

        {faqs.map((faq, i) => (
          <div key={i} className="card-solid" style={{ marginBottom: 12 }}>
            <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, color: 'var(--primary)', margin: '0 0 8px' }}>
              {faq.q}
            </p>
            <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              {faq.r}
            </p>
          </div>
        ))}

        <button className="btn-outline btn-full" style={{ marginTop: 8 }} onClick={() => router.push('/ajuda2')}>
          Ver mais dúvidas →
        </button>
      </div>
    </main>
  )
}
