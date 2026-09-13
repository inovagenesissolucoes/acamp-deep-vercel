'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HeaderInterno from '@/components/HeaderInterno'
import { listarUsuarios } from '@/lib/api'
import { getUsuarioLocal, isLider } from '@/lib/auth'
import { ChevronRight } from 'lucide-react'

interface Usuario { id: string; nome: string; sobrenome: string; email: string; acesso: 'Lider' | 'Jovem' }

export default function CadastradosPage() {
  const router = useRouter()
  const [usuarios, setUsuarios] = useState<Usuario[]>([])
  const [pesquisa, setPesquisa] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = getUsuarioLocal()
    if (!u || !isLider(u)) { router.replace('/menu'); return }
    listarUsuarios().then(r => {
      if (r.ok && r.data) setUsuarios(r.data as Usuario[])
      setLoading(false)
    })
  }, [router])

  const filtrados = usuarios.filter(u =>
    `${u.nome} ${u.sobrenome} ${u.email}`.toLowerCase().includes(pesquisa.toLowerCase())
  )

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <HeaderInterno titulo="Cadastrados" voltarUrl="/menu" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', paddingBottom: 24 }}>
        <div className="search-wrapper" style={{ marginBottom: 14 }}>
          <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input className="search-input" type="search" placeholder="Pesquisar..." value={pesquisa} onChange={e => setPesquisa(e.target.value)} />
        </div>

        {loading ? (
          [1,2,3,4].map(i => <div key={i} className="skeleton" style={{ height: 60, marginBottom: 10 }} />)
        ) : filtrados.map(u => (
          <div
            key={u.id}
            className="card-solid"
            style={{ marginBottom: 10, display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
            onClick={() => router.push(`/admin/usuarios/${u.id}`)}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: u.acesso === 'Lider'
                  ? 'linear-gradient(135deg, #5B6FE8, #9BB0FF)'
                  : 'linear-gradient(135deg, #E0E0E0, #F0F0F0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'Poppins', fontWeight: 700, fontSize: 15,
                color: u.acesso === 'Lider' ? 'white' : 'var(--text-muted)',
              }}>
                {u.nome[0]}{u.sobrenome[0]}
              </div>
              <div>
                <p style={{ fontFamily: 'Poppins', fontWeight: 600, fontSize: 14, color: 'var(--text-main)', margin: '0 0 2px' }}>
                  {u.nome} {u.sobrenome}
                </p>
                <p style={{ fontFamily: 'Poppins', fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>{u.email}</p>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={u.acesso === 'Lider' ? 'badge-blue' : ''} style={u.acesso !== 'Lider' ? { fontFamily: 'Poppins', fontSize: 11, color: 'var(--text-muted)' } : { fontSize: 11 }}>
                {u.acesso === 'Lider' ? '⭐ Líder' : 'Jovem'}
              </span>
              <ChevronRight size={16} color="var(--text-muted)" />
            </div>
          </div>
        ))}
        {!loading && filtrados.length === 0 && (
          <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>Nenhum usuário encontrado</p>
        )}
      </div>
    </main>
  )
}
