'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import HeaderInterno from '@/components/HeaderInterno'
import { getEvento, editarEvento, setEventoAtivo } from '@/lib/api'
import { getUsuarioLocal, isLider } from '@/lib/auth'

export default function EditarEventoPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string
  const [form, setForm] = useState<any>({})
  const [loading, setLoading] = useState(false)
  const [carregando, setCarregando] = useState(true)

  useEffect(() => {
    const u = getUsuarioLocal()
    if (!u || !isLider(u)) { router.replace('/menu'); return }
    getEvento(id).then(r => { if (r.ok && r.data) setForm(r.data); setCarregando(false) })
  }, [id, router])

  const set = (campo: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm((f: any) => ({ ...f, [campo]: e.target.value }))

  const handleSalvar = async () => {
    setLoading(true)
    await editarEvento(form)
    setLoading(false)
    router.push(`/evento/${id}`)
  }

  if (carregando) return <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div className="skeleton" style={{ width: 200, height: 40 }} /></main>

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <HeaderInterno titulo="Editar Evento" voltarUrl={`/evento/${id}`} />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px', paddingBottom: 32 }}>
        <div className="card-solid" style={{ marginBottom: 14 }}>
          {[
            { label: 'Nome do Evento', campo: 'nome', type: 'text', placeholder: 'Ex.: Acamp 2025' },
            { label: 'Data de Início', campo: 'dataInicio', type: 'date' },
            { label: 'Data de Fim', campo: 'dataFim', type: 'date' },
            { label: 'Horário', campo: 'horario', type: 'text', placeholder: 'Ex.: 18 Hrs' },
            { label: 'Data Limite', campo: 'dataLimite', type: 'date' },
            { label: 'Valor (R$)', campo: 'valor', type: 'number' },
            { label: 'Chave PIX', campo: 'chavePix', type: 'text' },
          ].map(({ label, campo, type, placeholder }) => (
            <div key={campo} className="input-group">
              <label className="input-label">{label}</label>
              <input className="input-field" type={type} placeholder={placeholder} value={form[campo] || ''} onChange={set(campo)} />
            </div>
          ))}
          <div className="input-group">
            <label className="input-label">Status</label>
            <select className="input-field" value={form.status || 'aberto'} onChange={set('status')}>
              <option value="aberto">Aberto</option>
              <option value="fechado">Fechado</option>
            </select>
          </div>
          <div className="input-group" style={{ marginBottom: 0 }}>
            <label className="input-label">Recomendações</label>
            <textarea className="input-field" value={form.recomendacoes || ''} onChange={set('recomendacoes')} rows={3} style={{ resize: 'none' }} />
          </div>
        </div>

        <button className="btn-outline btn-full" style={{ marginBottom: 10 }} onClick={async () => {
          await setEventoAtivo(id)
          alert('Evento definido como ativo!')
        }}>
          ⭐ Definir como Evento Ativo
        </button>

        <div style={{ display: 'flex', gap: 12 }}>
          <button className="btn-outline" style={{ flex: 1 }} onClick={() => router.back()}>Cancelar</button>
          <button className="btn-primary" style={{ flex: 1 }} onClick={handleSalvar} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar'}
          </button>
        </div>
      </div>
    </main>
  )
}
