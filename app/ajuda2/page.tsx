'use client'
import HeaderInterno from '@/components/HeaderInterno'

const faqs2 = [
  { q: 'Como instalar o app no celular?', r: 'No Android: toque nos 3 pontos do Chrome e selecione "Adicionar à tela inicial". No iPhone: toque no ícone de compartilhamento no Safari e selecione "Adicionar à tela de início".' },
  { q: 'Como funciona o parcelamento?', r: 'Você define a quantidade de parcelas. O sistema divide o valor total igualmente e distribui as datas de vencimento de forma proporcional até o limite do evento.' },
  { q: 'Posso me inscrever sem internet?', r: 'Algumas telas funcionam offline, mas para realizar inscrições e pagamentos é necessário conexão com a internet.' },
  { q: 'Como um líder cria um evento?', r: 'Líderes acessam a Área do Líder na tela inicial e tocam em "Novo Evento". Preencha todos os campos e salve. O evento ficará disponível para inscrições conforme o status definido.' },
  { q: 'Como funciona a galeria de fotos?', r: 'Líderes podem fazer upload de fotos e vídeos de eventos passados. O conteúdo fica disponível na tela inicial pública, acessível antes mesmo do login.' },
  { q: 'Esqueci minha senha, o que fazer?', r: 'Na tela de login, toque em "Esqueci a senha". Digite seu e-mail e você receberá um link para redefinição.' },
  { q: 'Como entrar em contato com o suporte?', r: 'Fale com um dos líderes da sua célula ou envie mensagem pelo WhatsApp da coordenação do Acamp Deep.' },
]

export default function Ajuda2Page() {
  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <HeaderInterno titulo="Manual" voltarUrl="/ajuda" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px', paddingBottom: 32 }}>
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>📖</div>
          <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 18, color: 'var(--text-main)', margin: 0 }}>Manual do Usuário</h2>
          <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)', marginTop: 6 }}>Guia completo do Acamp Deep</p>
        </div>

        {faqs2.map((faq, i) => (
          <div key={i} className="card-solid" style={{ marginBottom: 12 }}>
            <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, color: 'var(--primary)', margin: '0 0 8px' }}>
              {faq.q}
            </p>
            <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              {faq.r}
            </p>
          </div>
        ))}
      </div>
    </main>
  )
}
