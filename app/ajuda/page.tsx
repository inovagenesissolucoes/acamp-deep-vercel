'use client'
import { MessageCircle } from 'lucide-react'
import HeaderInterno from '@/components/HeaderInterno'

const faqs = [
  { q: 'Como me inscrever em um evento?', r: 'Na tela inicial, toque no card do evento ativo para ver os detalhes. Se as inscrições estiverem abertas, clique em "Inscrever-se" e escolha a quantidade de parcelas.' },
  { q: 'Como pagar uma parcela?', r: 'Na tela inicial, na seção "Minhas Parcelas", toque no botão "Pagar" na parcela desejada. Você poderá gerar o QR Code PIX e enviar o comprovante.' },
  { q: 'Posso pagar uma parcela vencida?', r: 'Sim! Parcelas vencidas não bloqueiam o pagamento. Você pode pagar a qualquer momento através do botão "Pagar".' },
  { q: 'Preciso de autorização de responsável?', r: 'Participantes menores de uma certa idade (definida pelo líder) precisam informar o WhatsApp de um responsável no momento da inscrição.' },
  { q: 'Como saber se meu pagamento foi confirmado?', r: 'Após enviar o comprovante, a parcela ficará com status "Pago ✅". O líder também receberá uma notificação.' },
]

const lideres = [
  { nome: 'Paloma Clécia', telefone: '11986693746' },
  { nome: 'Felipe Arruda', telefone: '11981221385' },
  { nome: 'Pamela Cristina', telefone: '11951482052' },
  { nome: 'Rafael da Silva', telefone: '11975364000' },
]

const suporteDev = { nome: 'Wesley Ferreira', telefone: '11934658783' }

function formatarTelefone(numero: string) {
  const ddd = numero.slice(0, 2)
  const parte1 = numero.slice(2, numero.length - 4)
  const parte2 = numero.slice(-4)
  return `(${ddd}) ${parte1}-${parte2}`
}

function linkWhatsapp(numero: string) {
  return `https://wa.me/55${numero}`
}

function CardContato({ nome, telefone, tag }: { nome: string; telefone: string; tag: string }) {
  return (
    <div className="card-solid" style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 14, color: 'var(--text-main)', margin: 0 }}>{nome}</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <MessageCircle size={14} color="var(--text-muted)" />
          <span style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)' }}>{formatarTelefone(telefone)}</span>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6 }}>
        <span style={{ fontFamily: 'Poppins', fontSize: 11, color: 'var(--text-muted)' }}>{tag}</span>
        <a
          href={linkWhatsapp(telefone)}
          target="_blank"
          rel="noopener noreferrer"
          className="btn-primary"
          style={{ padding: '7px 16px', fontSize: 12.5, textDecoration: 'none' }}
        >
          Conversar
        </a>
      </div>
    </div>
  )
}

export default function AjudaPage() {
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

        <div style={{ marginBottom: 28 }} />

        {/* Contatos */}
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 16, color: 'var(--text-main)', margin: '0 0 12px' }}>
          Contatos
        </h2>
        {lideres.map(l => (
          <CardContato key={l.telefone} nome={l.nome} telefone={l.telefone} tag="Líder" />
        ))}

        {/* Problemas com o app */}
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 16, color: 'var(--text-main)', margin: '24px 0 12px' }}>
          Problemas com o aplicativo
        </h2>
        <CardContato nome={suporteDev.nome} telefone={suporteDev.telefone} tag="Dev" />
      </div>
    </main>
  )
}
