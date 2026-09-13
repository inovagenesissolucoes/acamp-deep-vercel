'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import HeaderInterno from '@/components/HeaderInterno'
import { getUsuario, editarUsuario } from '@/lib/api'
import { getUsuarioLocal, isLider } from '@/lib/auth'
import { Edit2, Save } from 'lucide-react'

export default function DetalheUsuarioPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [dados, setDados] = useState<any>(null)
  const [editando, setEditando] = useState(false)
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const usuarioLogado = typeof window !== 'undefined' ? getUsuarioLocal() : null
  const ehLider = isLider(usuarioLogado)

  useEffect(() => {
    if (!ehLider) { router.replace('/menu'); return }
    getUsuario(id).then(r => { if (r.ok && r.data) { setDados(r.data); setForm(r.data) } })
  }, [id, ehLider, router])

  const set = (campo: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f: any) => ({ ...f, [campo]: e.target.value }))

  const handleSalvar = async () => {
    setLoading(true)
    const res = await editarUsuario(form)
    setLoading(false)
    if (res.ok) { setDados({ ...dados, ...form }); setEditando(false) }
  }

  if (!dados) return <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="skeleton" style={{ width: 200, height: 40 }} /></main>

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <HeaderInterno titulo="Detalhe do Cadastro"
        direita={!editando ? <button onClick={() => setEditando(true)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'white' }}><Edit2 size={20} /></button> : undefined} />
      <div style={{ flex: 1, padding: '20px 20px', paddingBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg, #5B6FE8, #9BB0FF)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ fontFamily: 'Poppins', fontWeight: 700, fontSize: 24, color: 'white' }}>{dados.nome?.[0]}{dados.sobrenome?.[0]}</span>
          </div>
        </div>
        <div className="card-solid" style={{ marginBottom: 16 }}>
          {[
            { label: 'Nome', campo: 'nome', editavel: true },
            { label: 'Sobrenome', campo: 'sobrenome', editavel: true },
            { label: 'E-mail', campo: 'email', editavel: false },
            { label: 'Telefone', campo: 'telefone', editavel: true },
            { label: 'Acesso', campo: 'acesso', editavel: true, tipo: 'select' },
          ].map(({ label, campo, editavel, tipo }) => (
            <div key={campo} style={{ padding: '10px 0', borderBottom: '1px solid #F5F5F5' }}>
              <p style={{ fontFamily: 'Poppins', fontSize: 11, color: 'var(--text-muted)', margin: '0 0 3px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</p>
              {editando && editavel ? (
                tipo === 'select' ? (
                  <select className="input-field" value={form[campo]} onChange={set(campo)}>
                    <option value="Jovem">Jovem</option>
                    <option value="Lider">Líder</option>
                  </select>
                ) : (
                  <input className="input-field" value={form[campo] || ''} onChange={set(campo)} />
                )
              ) : (
                <p style={{ fontFamily: 'Poppins', fontSize: 15, fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{dados[campo] || '—'}</p>
              )}
            </div>
          ))}
        </div>
        {editando && (
          <div style={{ display: 'flex', gap: 12 }}>
            <button className="btn-outline" style={{ flex: 1 }} onClick={() => setEditando(false)}>Cancelar</button>
            <button className="btn-primary" style={{ flex: 1 }} onClick={handleSalvar} disabled={loading}>
              <Save size={16} />{loading ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        )}
      </div>
    </main>
  )
}
