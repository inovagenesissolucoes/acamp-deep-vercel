function extrairIdYoutube(url: string): string | null {
  const padroes = [
    /(?:youtube\.com\/watch\?v=)([^&]+)/,
    /(?:youtu\.be\/)([^?]+)/,
    /(?:youtube\.com\/shorts\/)([^?]+)/,
    /(?:youtube\.com\/embed\/)([^?]+)/,
  ]
  for (const padrao of padroes) {
    const m = url.match(padrao)
    if (m) return m[1]
  }
  return null
}

export default function VideoChamada({ url, titulo }: { url: string; titulo?: string }) {
  const videoId = extrairIdYoutube(url)
  if (!videoId) return null

  return (
    <div style={{
      position: 'relative', width: '100%', paddingTop: '56.25%',
      borderRadius: 14, overflow: 'hidden', background: '#000',
      boxShadow: '0 2px 10px rgba(0,0,0,0.08)',
    }}>
      <iframe
        src={`https://www.youtube.com/embed/${videoId}`}
        title={titulo || 'Vídeo de chamada do evento'}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  )
}
