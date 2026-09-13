/**
 * Funções de chamada ao backend (Apps Script via /api/rpc)
 * Todas as requisições passam pelo proxy Next.js para evitar CORS.
 */

export type AcaoAPI =
  | 'login' | 'logout' | 'cadastrar' | 'recuperarSenha'
  | 'listarEventos' | 'getEventoAtivo' | 'getEvento' | 'criarEvento' | 'editarEvento' | 'setEventoAtivo'
  | 'inscrever' | 'listarInscricoes' | 'getMinhasInscricoes'
  | 'registrarPagamento' | 'getParcelasInscricao'
  | 'listarUsuarios' | 'getUsuario' | 'editarUsuario'
  | 'uploadMidia' | 'listarGaleria'
  | 'salvarSubscription' | 'notificarLideres' | 'notificarUsuario'

export interface RespostaAPI<T = unknown> {
  ok: boolean
  data?: T
  erro?: string
}

async function rpc<T = unknown>(acao: AcaoAPI, payload?: Record<string, unknown>): Promise<RespostaAPI<T>> {
  try {
    const res = await fetch('/api/rpc', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ acao, ...payload }),
    })
    const json = await res.json()
    return json as RespostaAPI<T>
  } catch (e) {
    return { ok: false, erro: 'Erro de conexão. Tente novamente.' }
  }
}

// ---- AUTH ----
export const login = (email: string, senha: string) =>
  rpc('login', { email, senha })

export const logout = () =>
  rpc('logout')

export const cadastrar = (dados: {
  nome: string; sobrenome: string; dataNascimento: string;
  telefone: string; email: string; senha: string;
  membroDeep: boolean; membroIgreja: boolean; acesso: 'Lider' | 'Jovem'
}) => rpc('cadastrar', dados)

export const recuperarSenha = (email: string) =>
  rpc('recuperarSenha', { email })

// ---- EVENTOS ----
export const listarEventos = () => rpc('listarEventos')
export const getEventoAtivo = () => rpc('getEventoAtivo')
export const getEvento = (id: string) => rpc('getEvento', { id })
export const criarEvento = (dados: Record<string, unknown>) => rpc('criarEvento', dados)
export const editarEvento = (dados: Record<string, unknown>) => rpc('editarEvento', dados)
export const setEventoAtivo = (eventoId: string) => rpc('setEventoAtivo', { eventoId })

// ---- INSCRIÇÕES ----
export const inscrever = (dados: {
  eventoId: string; quantidadeParcelas: number; whatsappResponsavel?: string
  diaVencimento?: number; senhaExcecao?: string
}) => rpc('inscrever', dados)

export const listarInscricoes = (eventoId: string) =>
  rpc('listarInscricoes', { eventoId })

export const getMinhasInscricoes = () => rpc('getMinhasInscricoes')

// ---- PAGAMENTOS ----
export const registrarPagamento = (dados: {
  parcelaId: string; comprovanteBase64: string; mimeType: string
}) => rpc('registrarPagamento', dados)

export const getParcelasInscricao = (parcelaId: string) =>
  rpc('getParcelasInscricao', { parcelaId })

// ---- USUÁRIOS ----
export const listarUsuarios = () => rpc('listarUsuarios')
export const getUsuario = (id: string) => rpc('getUsuario', { id })
export const editarUsuario = (dados: Record<string, unknown>) => rpc('editarUsuario', dados)

// ---- GALERIA ----
export const uploadMidia = (dados: {
  eventoId: string; tipo: 'foto' | 'video'; base64: string; mimeType: string
}) => rpc('uploadMidia', dados)

export const listarGaleria = () => rpc('listarGaleria')

// ---- PUSH ----
export const salvarSubscription = (subscription: PushSubscription) =>
  rpc('salvarSubscription', { subscription: subscription.toJSON() })
