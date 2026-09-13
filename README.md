# 🏕️ Acamp Deep — PWA

App de inscrição e gestão de acampamentos da igreja Deep.

**Stack:** Next.js 14 · Apps Script · Google Sheets · Vercel · PWA

---

## 🚀 Setup em 4 passos

### 1. Google Sheets — Criar a planilha

1. Acesse [sheets.google.com](https://sheets.google.com) → **Criar nova planilha**
2. Anote o **ID da planilha** (está na URL: `spreadsheets/d/{ID}/edit`)
3. Na planilha, vá em **Extensões → Apps Script**
4. Cole o conteúdo de `apps-script/Código.gs`
5. Cole o ID da planilha na variável `PLANILHA_ID` no topo do script
6. Execute a função **`setupPlanilha()`** (cria todas as abas automaticamente)
7. Clique em **Implantar → Novo implante**:
   - Tipo: **Aplicativo da Web**
   - Executar como: **Eu mesmo**
   - Quem tem acesso: **Qualquer pessoa**
8. Clique em **Implantar** e copie a **URL de implantação**

> 💡 Crie **duas planilhas**: uma para produção e uma para testes (ambientes separados).

---

### 2. Chaves VAPID (Push Notifications)

```bash
npx web-push generate-vapid-keys
```

Copie as chaves geradas (public + private).

---

### 3. Deploy no Vercel

1. Faça push do projeto para o GitHub:
```bash
git init
git add .
git commit -m "feat: Acamp Deep PWA"
git remote add origin https://github.com/SEU_USUARIO/acamp-deep.git
git push -u origin main
```

2. Acesse [vercel.com](https://vercel.com) → **Add New Project** → importe o repositório

3. Configure as variáveis de ambiente em **Settings → Environment Variables**:

| Variável | Valor | Ambiente |
|---|---|---|
| `APPS_SCRIPT_URL` | URL do Apps Script de PRODUÇÃO | Production |
| `APPS_SCRIPT_URL` | URL do Apps Script de TESTE | Preview |
| `VAPID_PUBLIC_KEY` | Chave pública VAPID | All |
| `VAPID_PRIVATE_KEY` | Chave privada VAPID | All |
| `VAPID_EMAIL` | Seu e-mail | All |
| `NEXT_PUBLIC_VAPID_PUBLIC_KEY` | Chave pública VAPID (mesma) | All |

4. Clique em **Deploy** ✅

---

### 4. Primeiro cadastro — Criar o Líder inicial

Como não há usuários, o primeiro cadastro precisa ser feito diretamente na planilha:

1. Abra a aba `usuarios` na planilha
2. Adicione uma linha com:
   - `id`: qualquer UUID (ex: `00000000-0000-0000-0000-000000000001`)
   - `nome`: seu nome
   - `sobrenome`: seu sobrenome
   - `email`: seu e-mail
   - `telefone`: seu telefone
   - `dataNascimento`: `1990-01-01`
   - `membroDeep`: `true`
   - `membroIgreja`: `true`
   - `acesso`: `Lider`
   - `senha`: use o Apps Script para gerar o hash: `hashSenha("SUA_SENHA")`
   - `createdAt`: data atual ISO

3. Faça login no app com este líder — agora ele pode cadastrar outros líderes pelo app!

---

## 📱 Instalação PWA

### Android (Chrome)
Ao acessar o site, aparecerá um banner "Adicionar à tela inicial" automaticamente.

### iPhone (Safari)
1. Abra o site no Safari
2. Toque no ícone de compartilhar (quadrado com seta)
3. Selecione "Adicionar à Tela de Início"

---

## 🗂️ Estrutura

```
acamp-deep/
├── app/                    # Páginas Next.js (App Router)
│   ├── page.tsx            # Home pública (galeria + countdown)
│   ├── login/              # Login
│   ├── cadastro/           # Cadastro
│   ├── menu/               # Home logada
│   ├── evento/[id]/        # Detalhe do evento
│   ├── inscricao/[id]/     # Inscrição
│   ├── pagamento/[id]/     # Pagamento PIX
│   ├── meu-cadastro/       # Perfil do usuário
│   ├── ajuda/              # FAQ 1
│   ├── ajuda2/             # FAQ 2 / Manual
│   ├── admin/              # Área do Líder
│   │   ├── dashboard/      # Dashboard com gráficos
│   │   ├── inscricoes/     # Lista de inscritos
│   │   ├── cadastrados/    # Lista de usuários
│   │   ├── eventos/novo/   # Criar evento
│   │   └── usuarios/[id]/  # Detalhe do usuário
│   └── api/
│       ├── rpc/            # Proxy para Apps Script (evita CORS)
│       └── push/           # Disparo de push notifications
├── components/             # Componentes reutilizáveis
├── lib/                    # Utilitários (api.ts, auth.ts, push.ts)
├── public/                 # Assets estáticos + manifest.json
├── apps-script/            # Código.gs (copiar para Apps Script)
└── middleware.ts            # Proteção de rotas por sessão
```

---

## 🎨 Identidade Visual

| Token | Valor |
|---|---|
| Primária | `#5B6FE8` |
| Gradiente | `linear-gradient(135deg, #5B6FE8, #7B8FF5, #9BB0FF)` |
| Fundo | `#F5F5F5` |
| Texto principal | `#1A1A2E` |
| Texto secundário | `#9E9E9E` |
| Fonte | Poppins (400, 500, 600, 700) |

---

## 🔒 Segurança

- Senhas armazenadas como **SHA-256** no Apps Script
- Sessão via **cookie httpOnly** (`acamp_sessao`)
- Rotas protegidas pelo **middleware Next.js**
- Validação de acesso **Líder** no servidor (Apps Script)
- Token VAPID para push seguro

---

## 📊 Google Sheets — Abas

| Aba | Descrição |
|---|---|
| `usuarios` | Cadastros de usuários |
| `sessoes` | Sessões ativas |
| `eventos` | Eventos/acampamentos |
| `eventoAtivo` | ID do evento em destaque |
| `inscricoes` | Inscrições em eventos |
| `parcelas` | Parcelas geradas por inscrição |
| `galeria` | Fotos e vídeos de eventos |
| `pushSubscriptions` | Subscriptions VAPID dos usuários |

---

## 🐛 Dúvidas?

1. **CORS error**: Verifique se o Apps Script está publicado com acesso "Qualquer pessoa"
2. **Login não funciona**: Confirme o ID da planilha e a URL do Apps Script nas env vars
3. **Push não chega**: Verifique as chaves VAPID e se o SW está registrado
4. **PWA não instala**: O site precisa estar em HTTPS (Vercel já garante isso)
