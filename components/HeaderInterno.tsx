'use client'
import { useRouter } from 'next/navigation'
import { ChevronLeft } from 'lucide-react'

interface Props {
  titulo: string
  voltar?: boolean
  voltarUrl?: string
  direita?: React.ReactNode
}

export default function HeaderInterno({ titulo, voltar = true, voltarUrl, direita }: Props) {
  const router = useRouter()

  const handleVoltar = () => {
    if (voltarUrl) router.push(voltarUrl)
    else router.back()
  }

  return (
    <header className="header-interno" style={{ paddingTop: 'env(safe-area-inset-top, 0px)' }}>
      {voltar && (
        <button className="header-back" onClick={handleVoltar} aria-label="Voltar">
          <ChevronLeft size={24} />
        </button>
      )}
      <h1 className="header-title">{titulo}</h1>
      {direita && <div className="header-action">{direita}</div>}
    </header>
  )
}
