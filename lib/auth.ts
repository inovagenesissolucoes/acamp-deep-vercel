/**
 * Helpers de autenticação no lado do cliente.
 * A sessão real é gerenciada via cookie httpOnly no servidor (Apps Script + Next.js proxy).
 */

export interface Usuario {
  id: string
  nome: string
  sobrenome: string
  email: string
  telefone: string
  dataNascimento: string
  membroDeep: boolean
  membroIgreja: boolean
  acesso: 'Lider' | 'Jovem'
  createdAt: string
}

const STORAGE_KEY = 'acamp_user'

export function salvarUsuario(usuario: Usuario): void {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(usuario))
  } catch {}
}

export function getUsuarioLocal(): Usuario | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function limparSessao(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY)
  } catch {}
}

export function isLider(usuario: Usuario | null): boolean {
  return usuario?.acesso === 'Lider'
}

export function calcularIdade(dataNascimento: string): number {
  const nasc = new Date(dataNascimento)
  const hoje = new Date()
  let idade = hoje.getFullYear() - nasc.getFullYear()
  const m = hoje.getMonth() - nasc.getMonth()
  if (m < 0 || (m === 0 && hoje.getDate() < nasc.getDate())) idade--
  return idade
}
