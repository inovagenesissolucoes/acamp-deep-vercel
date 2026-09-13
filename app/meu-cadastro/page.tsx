'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HeaderInterno from '@/components/HeaderInterno'
import { getUsuario, editarUsuario } from '@/lib/api'
import { getUsuarioLocal, salvarUsuario } from '@/lib/auth'
import { Edit2, Save, User, Mail, Phone, Calendar, Shield } from 'lucide-react'

export default function MeuCadastroPage() {
  const router = useRouter()
  const [dados, setDados] = useState<any>(null)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [erro, setErro] = useState('')
  const [sucesso, setSucesso] = useState(false)

  useEffect(() => {
    const u = getUsuarioLocal()
    if (!u) { router.replace('/login'); return }
    getUsuario(u.id).then(r => {
      if (r.ok && r.data) {
        setDados(r.data)
        setForm(r.data)
      } else {
        setDados(u)
        setForm(u)
      }
    })
  }, [router])

  const set = (campo: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f: any) => ({ ...f, [campo]: e.target.value }))

  const handleSalvar = async () => {
    setErro('')
    setLoading(true)
    if (navigator.vibrate) navigator.vibrate(10)

    const res = await editarUsuario({
      id: dados.id,
      nome: form.nome,
      sobrenome: form.sobrenome,
      dataNascimento: form.dataNascimento,
      telefone: form.telefone,
    })
    setLoading(false)

    if (res.ok) {
      const atualizado = { ...dados, ...form }
      setDados(atualizado)
      salvarUsuario(atualizado)
      setEditando(false)
      setSucesso(true)
      setTimeout(() => setSucesso(false), 3000)
    } else {
      setErro(res.erro || 'Erro ao salvar.')
    }
  }

  const campos = [
    { label: 'Nome', campo: 'nome', icon: <User size={14} />, editavel: true },
    { label: 'Sobrenome', campo: 'sobrenome', icon: <User size={14} />, editavel: true },
    { label: 'Data de Nascimento', campo: 'dataNascimento', icon: <Calendar size={14} />, editavel: true, type: 'date' },
    { label: 'Telefone', campo: 'telefone', icon: <Phone size={14} />, editavel: true, type: 'tel' },
    { label: 'E-mail', campo: 'email', icon: <Mail size={14} />, editavel: false },
    { label: 'Acesso', campo: 'acesso', icon: <Shield size={14} />, editavel: false },
  ]

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <HeaderInterno
        titulo="Meu Cadastro"
        direita={
          !editando ? (
            <button onClick={() => setEditando(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}>
              <Edit2 size={20} />
            </button>
          ) : undefined
        }
      />

      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px', paddingBottom: 32 }}>
        {dados ? (
          <>
            {/* Avatar */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 24 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%',
                background: 'linear-gradient(135deg, #5B6FE8, #9BB0FF)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                boxShadow: '0 4px 20px rgba(91,111,232,0.3)',
              }}>
                <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 28, color: 'white' }}>
                  {dados.nome?.[0]}{dados.sobrenome?.[0]}
                </span>
              </div>
            </div>

            {sucesso && (
              <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#059669', fontSize: 13, fontFamily: 'Poppins', textAlign: 'center' }}>
                ✅ Dados salvos com sucesso!
              </div>
            )}

            {erro && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: '10px 14px', marginBottom: 16, color: '#DC2626', fontSize: 13, fontFamily: 'Poppins' }}>
                {erro}
              </div>
            )}

            <div className="card-solid" style={{ marginBottom: 20 }}>
              {campos.map(({ label, campo, icon, editavel, type = 'text' }) => (
                <div key={campo} style={{ padding: '12px 0', borderBottom: '1px solid #F5F5F5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ color: 'var(--primary)' }}>{icon}</span>
                    <span style={{ fontFamily: 'Poppins', fontSize: 11, fontWeight: 500, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
                  </div>
                  {editando && editavel ? (
                    <input
                      className="input-field"
                      type={type}
                      value={form[campo] || ''}
                      onChange={set(campo)}
                      style={{ marginTop: 4 }}
                    />
                  ) : (
                    <p style={{ fontFamily: 'Poppins', fontSize: 15, fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>
                      {campo === 'dataNascimento'
                        ? dados[campo] ? new Date(dados[campo]).toLocaleDateString('pt-BR') : '—'
                        : dados[campo] || '—'}
                    </p>
                  )}
                </div>
              ))}

              {/* Badges */}
              <div style={{ padding: '12px 0', display: 'flex', gap: 8 }}>
                <span style={{ fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: dados.membroDeep ? 'rgba(91,111,232,0.1)' : '#F5F5F5', color: dados.membroDeep ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {dados.membroDeep ? '✅' : '❌'} Membro Deep
                </span>
                <span style={{ fontFamily: 'Poppins', fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 20, background: dados.membroIgreja ? 'rgba(91,111,232,0.1)' : '#F5F5F5', color: dados.membroIgreja ? 'var(--primary)' : 'var(--text-muted)' }}>
                  {dados.membroIgreja ? '✅' : '❌'} Membro Igreja
                </span>
              </div>
            </div>

            {editando && (
              <div style={{ display: 'flex', gap: 12 }}>
                <button className="btn-outline" style={{ flex: 1 }} onClick={() => { setEditando(false); setForm(dados); setErro('') }}>
                  Cancelar
                </button>
                <button className="btn-primary" style={{ flex: 1 }} onClick={handleSalvar} disabled={loading}>
                  <Save size={16} />
                  {loading ? 'Salvando...' : 'Salvar'}
                </button>
              </div>
            )}
          </>
        ) : (
          [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 12 }} />)
        )}
      </div>
    </main>
  )
}
