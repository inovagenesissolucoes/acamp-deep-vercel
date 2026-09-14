'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import HeaderInterno from '@/components/HeaderInterno'
import { cadastrar } from '@/lib/api'
import { Eye, EyeOff } from 'lucide-react'

export default function CadastroPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    nome: '', sobrenome: '', dataNascimento: '',
    telefone: '', email: '', senha: '', confirmarSenha: '',
    membroDeep: '', membroIgreja: '', acesso: 'Jovem', codigoLider: '',
  })
  const [verSenha, setVerSenha] = useState(false)
  const [verConfirma, setVerConfirma] = useState(false)
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  const set = (campo: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [campo]: e.target.value }))

  const validar = () => {
    if (!form.nome || !form.sobrenome || !form.dataNascimento || !form.telefone || !form.email || !form.senha)
      return 'Preencha todos os campos obrigatórios.'
    if (form.senha !== form.confirmarSenha) return 'As senhas não coincidem.'
    if (form.senha.length < 6) return 'A senha deve ter pelo menos 6 caracteres.'
    if (!form.membroDeep || !form.membroIgreja) return 'Selecione as opções de membro.'
    if (form.acesso === 'Lider' && form.codigoLider.trim() !== 'Deep2019') return 'Código de líder inválido.'
    return ''
  }

  const handleCadastrar = async () => {
    const v = validar()
    if (v) { setErro(v); return }
    setErro('')
    setLoading(true)
    if (navigator.vibrate) navigator.vibrate(10)

    const res = await cadastrar({
      nome: form.nome.trim(),
      sobrenome: form.sobrenome.trim(),
      dataNascimento: form.dataNascimento,
      telefone: form.telefone.trim(),
      email: form.email.trim().toLowerCase(),
      senha: form.senha,
      membroDeep: form.membroDeep === 'Sim',
      membroIgreja: form.membroIgreja === 'Sim',
      acesso: form.acesso as 'Lider' | 'Jovem',
    })
    setLoading(false)

    if (res.ok) {
      setSucesso(true)
      setTimeout(() => router.push('/login'), 2000)
    } else {
      setErro(res.erro || 'Erro ao cadastrar.')
    }
  }

  if (sucesso) {
    return (
      <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: 24 }}>
        <div style={{ fontSize: 60, marginBottom: 16 }}>🎉</div>
        <h2 style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 20, color: 'var(--text-main)', margin: '0 0 8px', textAlign: 'center' }}>
          Cadastro realizado!
        </h2>
        <p style={{ fontFamily: 'Poppins', fontSize: 14, color: 'var(--text-muted)', textAlign: 'center' }}>
          Redirecionando para o login...
        </p>
      </main>
    )
  }

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <HeaderInterno titulo="Cadastro" />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', paddingBottom: 32 }}>
        {erro && (
          <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#DC2626', fontSize: 13, fontFamily: 'Poppins' }}>
            {erro}
          </div>
        )}

        <div className="card-solid" style={{ marginBottom: 16 }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, color: 'var(--primary)', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Dados Pessoais
          </p>
          <div className="input-group">
            <label className="input-label">Nome *</label>
            <input className="input-field" type="text" placeholder="Seu nome" value={form.nome} onChange={set('nome')} />
          </div>
          <div className="input-group">
            <label className="input-label">Sobrenome *</label>
            <input className="input-field" type="text" placeholder="Seu sobrenome" value={form.sobrenome} onChange={set('sobrenome')} />
          </div>
          <div className="input-group">
            <label className="input-label">Data de Nascimento *</label>
            <input className="input-field" type="date" value={form.dataNascimento} onChange={set('dataNascimento')} />
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Telefone *</label>
            <input className="input-field" type="tel" inputMode="tel" placeholder="(11) 99999-9999" value={form.telefone} onChange={set('telefone')} />
          </div>
        </div>

        <div className="card-solid" style={{ marginBottom: 16 }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, color: 'var(--primary)', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Acesso
          </p>
          <div className="input-group">
            <label className="input-label">E-mail *</label>
            <input className="input-field" type="email" inputMode="email" placeholder="email@exemplo.com" value={form.email} onChange={set('email')} autoComplete="email" />
          </div>
          <div className="input-group">
            <label className="input-label">Senha *</label>
            <div style={{ position: 'relative' }}>
              <input className="input-field" type={verSenha ? 'text' : 'password'} placeholder="**********" value={form.senha} onChange={set('senha')} style={{ paddingRight: 46 }} autoComplete="new-password" />
              <button type="button" onClick={() => setVerSenha(!verSenha)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                {verSenha ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Confirme a Senha *</label>
            <div style={{ position: 'relative' }}>
              <input className="input-field" type={verConfirma ? 'text' : 'password'} placeholder="**************" value={form.confirmarSenha} onChange={set('confirmarSenha')} style={{ paddingRight: 46 }} autoComplete="new-password" />
              <button type="button" onClick={() => setVerConfirma(!verConfirma)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex' }}>
                {verConfirma ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
        </div>

        <div className="card-solid" style={{ marginBottom: 24 }}>
          <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 13, color: 'var(--primary)', margin: '0 0 14px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Perfil
          </p>
          <div className="input-group">
            <label className="input-label">Membro Deep? *</label>
            <select className="input-field" value={form.membroDeep} onChange={set('membroDeep')}>
              <option value="">Selecione...</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
          <div className="input-group">
            <label className="input-label">Membro Igreja? *</label>
            <select className="input-field" value={form.membroIgreja} onChange={set('membroIgreja')}>
              <option value="">Selecione...</option>
              <option value="Sim">Sim</option>
              <option value="Não">Não</option>
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Acesso *</label>
            <select className="input-field" value={form.acesso} onChange={set('acesso')}>
              <option value="Jovem">Jovem</option>
              <option value="Lider">Líder</option>
            </select>
          </div>
          {form.acesso === 'Lider' && (
            <div className="input-group" style={{ marginTop: 14, marginBottom: 0 }}>
              <label className="input-label">Código de Líder *</label>
              <input className="input-field" type="text" placeholder="Peça ao seu líder" value={form.codigoLider} onChange={set('codigoLider')} />
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-outline" style={{ flex: 1 }} onClick={() => router.back()}>
            Cancelar
          </button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={handleCadastrar} disabled={loading}>
            {loading ? 'Salvando...' : 'Cadastrar'}
          </button>
        </div>
      </div>
    </main>
  )
}
