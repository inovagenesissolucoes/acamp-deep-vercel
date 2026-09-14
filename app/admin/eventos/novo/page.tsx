'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import HeaderInterno from '@/components/HeaderInterno'
import { criarEvento, setEventoAtivo } from '@/lib/api'
import { getUsuarioLocal, isLider } from '@/lib/auth'
import { useEffect } from 'react'

function Campo({ label, value, onChange, type = 'text', placeholder = '', as = 'input' }: {
  label: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void
  type?: string
  placeholder?: string
  as?: 'input' | 'textarea'
}) {
  return (
    <div className="input-group">
      <label className="input-label">{label} *</label>
      {as === 'textarea' ? (
        <textarea className="input-field" placeholder={placeholder} value={value} onChange={onChange} rows={3} style={{ resize: 'none', lineHeight: 1.5 }} />
      ) : (
        <input className="input-field" type={type} placeholder={placeholder} value={value} onChange={onChange} />
      )}
    </div>
  )
}

function placeholderChave(tipo: string) {
  switch (tipo) {
    case 'cpf': return '000.000.000-00'
    case 'cnpj': return '00.000.000/0000-00'
    case 'telefone': return '(11) 98765-4321'
    case 'email': return 'nome@exemplo.com'
    case 'aleatoria': return 'Cole a chave aleatória (UUID)'
    default: return ''
  }
}

export default function NovoEventoPage() {
  const router = useRouter()
  const [form, setForm] = useState({
    nome: '', dataInicio: '', dataFim: '', horario: '',
    dataLimite: '', valor: '', status: 'aberto',
    recomendacoes: '', chavePix: '', idadeAutorizacao: '14',
    senhaExcecao: '', tipoChavePix: 'cpf' as 'cpf' | 'cnpj' | 'telefone' | 'email' | 'aleatoria',
  })
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    const u = getUsuarioLocal()
    if (!u || !isLider(u)) router.replace('/menu')
  }, [router])

  const set = (campo: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [campo]: e.target.value }))

  const handleSalvar = async () => {
    if (!form.nome || !form.dataInicio || !form.dataFim || !form.dataLimite || !form.valor || !form.chavePix) {
      setErro('Preencha todos os campos obrigatórios.')
      return
    }
    setErro('')
    setLoading(true)
    if (navigator.vibrate) navigator.vibrate(10)

    const res = await criarEvento({
      nome: form.nome.trim(),
      dataInicio: form.dataInicio,
      dataFim: form.dataFim,
      horario: form.horario.trim(),
      dataLimite: form.dataLimite,
      valor: parseFloat(form.valor.replace(',', '.')),
      status: form.status,
      recomendacoes: form.recomendacoes.trim(),
      chavePix: form.chavePix.trim(),
      idadeAutorizacao: parseInt(form.idadeAutorizacao) || 14,
      senhaExcecao: form.senhaExcecao.trim(),
      tipoChavePix: form.tipoChavePix,
    })
    setLoading(false)

    if (res.ok) {
      const eventoId = (res.data as any)?.id
      if (eventoId) await setEventoAtivo(eventoId)
      setSucesso(true)
      setTimeout(() => router.push('/menu'), 2000)
    } else {
      setErro(res.erro || 'Erro ao criar evento.')
    }
  }

  if (sucesso) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🏕️</div>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, color: 'var(--text-main)', margin: '0 0 8px', textAlign: 'center' }}>Evento criado!</h2>
        <p style={{ fontFamily: 'Poppins', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>Redirecionando para o dashboard...</p>
      </main>
    )
  }


  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <HeaderInterno titulo="Novo Evento" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px', paddingBottom: 32 }}>
        {erro && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#DC2626', fontSize: 13, fontFamily: 'Poppins' }}>
            {erro}
          </div>
        )}

        <div className="card-solid" style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, color: 'var(--primary)', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Informações</p>
          <Campo label="Nome do Evento" value={form.nome} onChange={set('nome')} placeholder="Ex.: Acamp 2025" />
          <Campo label="Data de Início" value={form.dataInicio} onChange={set('dataInicio')} type="date" />
          <Campo label="Data de Fim" value={form.dataFim} onChange={set('dataFim')} type="date" />
          <Campo label="Horário" value={form.horario} onChange={set('horario')} placeholder="Ex.: 18 Hrs" />
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Status *</label>
            <select className="input-field" value={form.status} onChange={set('status')}>
              <option value="aberto">Aberto</option>
              <option value="fechado">Fechado</option>
            </select>
          </div>
        </div>

        <div className="card-solid" style={{ marginBottom: 14 }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, color: 'var(--primary)', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Financeiro</p>
          <Campo label="Valor de Investimento R$" value={form.valor} onChange={set('valor')} type="number" placeholder="Ex.: 200" />
          <Campo label="Data Limite para Pagamento" value={form.dataLimite} onChange={set('dataLimite')} type="date" />
          <div className="input-group" style={{ marginBottom: 12 }}>
            <label className="input-label">Tipo de Chave PIX *</label>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['cpf', 'cnpj', 'telefone', 'email', 'aleatoria'] as const).map(tipo => (
                <button
                  key={tipo}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, tipoChavePix: tipo }))}
                  style={{
                    padding: '7px 12px', borderRadius: 8,
                    border: form.tipoChavePix === tipo ? '2px solid var(--primary)' : '1px solid #E5E7EB',
                    background: form.tipoChavePix === tipo ? 'rgba(91,111,232,0.08)' : 'white',
                    color: form.tipoChavePix === tipo ? 'var(--primary)' : 'var(--text-muted)',
                    fontFamily: 'Poppins', fontWeight: 600, fontSize: 12.5, cursor: 'pointer', textTransform: 'capitalize',
                  }}
                >
                  {tipo === 'cpf' ? 'CPF' : tipo === 'cnpj' ? 'CNPJ' : tipo === 'aleatoria' ? 'Aleatória' : tipo}
                </button>
              ))}
            </div>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Chave PIX do Evento *</label>
            <input className="input-field" type="text" placeholder={placeholderChave(form.tipoChavePix)} value={form.chavePix} onChange={set('chavePix')} />
          </div>
        </div>

        <div className="card-solid" style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, color: 'var(--primary)', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Configurações</p>
          <div className="input-group">
            <label className="input-label">Idade mínima para autorização de responsável</label>
            <input className="input-field" type="number" placeholder="Ex.: 14" value={form.idadeAutorizacao} onChange={set('idadeAutorizacao')} />
          </div>
          <div className="input-group">
            <label className="input-label">Recomendações</label>
            <textarea className="input-field" placeholder="Ex.: Levar toalha, kit de higiene pessoal..." value={form.recomendacoes} onChange={set('recomendacoes')} rows={3} style={{ resize: 'none', lineHeight: 1.5 }} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Senha de exceção (opcional)</label>
            <input className="input-field" type="text" placeholder="Libera inscrição após o prazo" value={form.senhaExcecao} onChange={set('senhaExcecao')} />
            <p style={{ fontFamily: 'Poppins', fontSize: 11.5, color: 'var(--text-muted)', margin: '6px 0 0' }}>
              Se definida, quem souber essa senha pode se inscrever mesmo após a data limite.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-outline" style={{ flex: 1 }} onClick={() => router.back()}>Cancelar</button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={handleSalvar} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Evento'}
          </button>
        </div>
      </div>
    </main>
  )
}
