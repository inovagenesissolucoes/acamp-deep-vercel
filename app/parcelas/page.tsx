'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import HeaderInterno from '@/components/HeaderInterno'
import ParcelaCard, { Parcela } from '@/components/ParcelaCard'
import { getMinhasInscricoes } from '@/lib/api'
import { getUsuarioLocal } from '@/lib/auth'

export default function MinhasParcelasPage() {
  const router = useRouter()
  const [parcelas, setParcelas] = useState<Parcela[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const u = getUsuarioLocal()
    if (!u) { router.replace('/login'); return }
    getMinhasInscricoes().then(r => {
      if (r.ok && r.data) {
        const inscricoes = r.data as any[]
        const todasParcelas: Parcela[] = inscricoes.flatMap((i: any) => i.parcelas || [])
        todasParcelas.sort((a, b) => new Date(a.vencimento).getTime() - new Date(b.vencimento).getTime())
        setParcelas(todasParcelas)
      }
      setLoading(false)
    })
  }, [router])

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', flexDirection: 'column', background: '#F5F5F5' }}>
      <HeaderInterno titulo="Minhas Parcelas" />
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px', paddingBottom: 32 }}>
        {loading ? (
          [1, 2, 3].map(i => <div key={i} className="skeleton" style={{ height: 76, marginBottom: 10 }} />)
        ) : parcelas.length > 0 ? (
          parcelas.map(p => <ParcelaCard key={p.id} parcela={p} />)
        ) : (
          <div style={{ background: 'white', borderRadius: 14, padding: 24, textAlign: 'center' }}>
            <span style={{ fontSize: 28 }}>💳</span>
            <p style={{ fontFamily: 'Poppins', fontSize: 13, color: 'var(--text-muted)', margin: '8px 0 0' }}>
              Você não possui parcelas no momento
            </p>
          </div>
        )}
      </div>
    </main>
  )
}
