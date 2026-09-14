// ============================================================
// ACAMP DEEP — Google Apps Script (Backend)
// Deploy como: "Aplicativo da Web" → Acesso: Qualquer pessoa
// ============================================================

const PLANILHA_ID = ''; // <-- Coloque o ID da planilha aqui
const DRIVE_PASTA_ID = ''; // <-- ID da pasta no Drive para comprovantes

function getSheet(nome) {
  return SpreadsheetApp.openById(PLANILHA_ID).getSheetByName(nome);
}

function gerarId() {
  return Utilities.getUuid();
}

function hashSenha(senha) {
  const bytes = Utilities.computeDigest(
    Utilities.DigestAlgorithm.SHA_256,
    senha,
    Utilities.Charset.UTF_8
  );
  return bytes.map(b => ('0' + (b & 0xFF).toString(16)).slice(-2)).join('');
}

// ---- CORS ----
// OBS: ContentService do Apps Script não suporta setHeader() para CORS ou Set-Cookie.
// Como a chamada é feita servidor-a-servidor (Next.js -> Apps Script), CORS não é necessário aqui.
function doOptions(e) {
  return ContentService.createTextOutput('').setMimeType(ContentService.MimeType.TEXT);
}

// ---- SESSÃO ----
function criarSessao(usuarioId) {
  const token = Utilities.getUuid();
  const agora = new Date();
  const expira = new Date(agora.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 dias

  const sheet = getSheet('sessoes');
  sheet.appendRow([token, usuarioId, agora.toISOString(), expira.toISOString()]);

  return token;
}

function validarSessao(token) {
  if (!token) return null;
  const sheet = getSheet('sessoes');
  const dados = sheet.getDataRange().getValues();

  for (let i = 1; i < dados.length; i++) {
    if (dados[i][0] === token) {
      const expira = new Date(dados[i][3]);
      if (expira > new Date()) {
        return dados[i][1]; // usuarioId
      }
    }
  }
  return null;
}

function getSessaoDaRequest(e) {
  const cookie = e.parameter?.cookie || '';
  const match = cookie.match(/acamp_sessao=([^;]+)/);
  if (match) return match[1];

  // Também aceitar token no body
  const body = e.postData?.contents ? JSON.parse(e.postData.contents) : {};
  return body._token || null;
}

// ---- ENTRADA PRINCIPAL ----
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents || '{}');
    const acao = body.acao;
    const token = getSessaoDaRequest(e);
    const usuarioId = token ? validarSessao(token) : null;

    let resultado;

    switch (acao) {
      // AUTH
      case 'login': resultado = acaoLogin(body); break;
      case 'logout': resultado = acaoLogout(token); break;
      case 'cadastrar': resultado = acaoCadastrar(body, usuarioId); break;
      case 'recuperarSenha': resultado = acaoRecuperarSenha(body); break;

      // EVENTOS
      case 'listarEventos': resultado = acaoListarEventos(); break;
      case 'getEventoAtivo': resultado = acaoGetEventoAtivo(usuarioId); break;
      case 'getEvento': resultado = acaoGetEvento(body, usuarioId); break;
      case 'criarEvento': resultado = acaoCriarEvento(body, usuarioId); break;
      case 'editarEvento': resultado = acaoEditarEvento(body, usuarioId); break;
      case 'setEventoAtivo': resultado = acaoSetEventoAtivo(body, usuarioId); break;

      // INSCRIÇÕES
      case 'inscrever': resultado = acaoInscrever(body, usuarioId); break;
      case 'listarInscricoes': resultado = acaoListarInscricoes(body, usuarioId); break;
      case 'getInscricaoDetalhe': resultado = acaoGetInscricaoDetalhe(body, usuarioId); break;
      case 'getMinhasInscricoes': resultado = acaoGetMinhasInscricoes(usuarioId); break;

      // PAGAMENTOS
      case 'registrarPagamento': resultado = acaoRegistrarPagamento(body, usuarioId); break;
      case 'getParcelasInscricao': resultado = acaoGetParcelasInscricao(body); break;

      // USUÁRIOS
      case 'listarUsuarios': resultado = acaoListarUsuarios(usuarioId); break;
      case 'getUsuario': resultado = acaoGetUsuario(body, usuarioId); break;
      case 'editarUsuario': resultado = acaoEditarUsuario(body, usuarioId); break;

      // GALERIA
      case 'uploadMidia': resultado = acaoUploadMidia(body, usuarioId); break;
      case 'listarGaleria': resultado = acaoListarGaleria(); break;

      // PUSH
      case 'salvarSubscription': resultado = acaoSalvarSubscription(body, usuarioId); break;

      default: resultado = { ok: false, erro: 'Ação desconhecida: ' + acao };
    }

    // O token de sessão vai no corpo do JSON (não em cookie/header, pois o
    // Apps Script não suporta Set-Cookie). Quem cria o cookie httpOnly pro
    // navegador é a rota /api/rpc do Next.js.
    return ContentService.createTextOutput(JSON.stringify(resultado))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ ok: false, erro: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput(JSON.stringify({ status: 'ok', app: 'Acamp Deep' }))
    .setMimeType(ContentService.MimeType.JSON);
}

// ============================================================
// AÇÕES — AUTH
// ============================================================

function acaoLogin(body) {
  const { email, senha } = body;
  if (!email || !senha) return { ok: false, erro: 'Dados incompletos.' };

  const sheet = getSheet('usuarios');
  const dados = sheet.getDataRange().getValues();
  const cabecalho = dados[0];

  for (let i = 1; i < dados.length; i++) {
    const linha = {};
    cabecalho.forEach((col, j) => linha[col] = dados[i][j]);
    if (linha.email === email.toLowerCase() && linha.senha === hashSenha(senha)) {
      const token = criarSessao(linha.id);
      return {
        ok: true,
        data: {
          id: linha.id,
          nome: linha.nome,
          sobrenome: linha.sobrenome,
          email: linha.email,
          telefone: linha.telefone,
          dataNascimento: linha.dataNascimento,
          membroDeep: linha.membroDeep === true || linha.membroDeep === 'true',
          membroIgreja: linha.membroIgreja === true || linha.membroIgreja === 'true',
          acesso: linha.acesso,
          createdAt: linha.createdAt,
        },
        _token: token,
      };
    }
  }
  return { ok: false, erro: 'E-mail ou senha incorretos.' };
}

function acaoLogout(token) {
  if (!token) return { ok: true };
  const sheet = getSheet('sessoes');
  const dados = sheet.getDataRange().getValues();
  for (let i = 1; i < dados.length; i++) {
    if (dados[i][0] === token) {
      sheet.deleteRow(i + 1);
      break;
    }
  }
  return { ok: true };
}

function acaoCadastrar(body, usuarioLogadoId) {
  const { nome, sobrenome, dataNascimento, telefone, email, senha, membroDeep, membroIgreja, acesso } = body;
  if (!nome || !sobrenome || !email || !senha) return { ok: false, erro: 'Dados incompletos.' };

  // Validar acesso Lider
  if (acesso === 'Lider') {
    if (!usuarioLogadoId) return { ok: false, erro: 'Somente um líder autenticado pode cadastrar outro líder.' };
    const lideres = getSheet('usuarios').getDataRange().getValues();
    const cabecalho = lideres[0];
    const lider = lideres.slice(1).find(l => {
      const obj = {};
      cabecalho.forEach((c, j) => obj[c] = l[j]);
      return obj.id === usuarioLogadoId && obj.acesso === 'Lider';
    });
    if (!lider) return { ok: false, erro: 'Somente um líder pode cadastrar outro líder.' };
  }

  const sheet = getSheet('usuarios');
  const dados = sheet.getDataRange().getValues();
  const cabecalho = dados[0];

  // Verificar duplicata de email
  for (let i = 1; i < dados.length; i++) {
    const linha = {};
    cabecalho.forEach((col, j) => linha[col] = dados[i][j]);
    if (linha.email === email.toLowerCase()) {
      return { ok: false, erro: 'Já existe um cadastro com este e-mail.' };
    }
  }

  const id = gerarId();
  const agora = new Date().toISOString();
  sheet.appendRow([id, nome.trim(), sobrenome.trim(), email.toLowerCase(), telefone || '', dataNascimento || '', membroDeep ? 'true' : 'false', membroIgreja ? 'true' : 'false', acesso || 'Jovem', hashSenha(senha), agora]);
  return { ok: true, data: { id } };
}

function acaoRecuperarSenha(body) {
  const { email } = body;
  if (!email) return { ok: false, erro: 'E-mail obrigatório.' };

  const sheet = getSheet('usuarios');
  const dados = sheet.getDataRange().getValues();
  const cabecalho = dados[0];
  let encontrado = false;
  let nomeUsuario = '';

  for (let i = 1; i < dados.length; i++) {
    const linha = {};
    cabecalho.forEach((col, j) => linha[col] = dados[i][j]);
    if (linha.email === email.toLowerCase()) {
      encontrado = true;
      nomeUsuario = linha.nome;
      break;
    }
  }

  if (!encontrado) return { ok: false, erro: 'E-mail não encontrado.' };

  try {
    MailApp.sendEmail({
      to: email,
      subject: 'Acamp Deep — Recuperação de Senha',
      body: `Olá ${nomeUsuario},\n\nVocê solicitou a recuperação de senha do Acamp Deep.\n\nEntre em contato com um líder para redefinir sua senha.\n\nAcamp Deep ✨`,
    });
    return { ok: true };
  } catch (e) {
    return { ok: false, erro: 'Erro ao enviar e-mail.' };
  }
}

// ============================================================
// AÇÕES — EVENTOS
// ============================================================

function sheetToObjects(sheet) {
  const dados = sheet.getDataRange().getValues();
  if (dados.length < 2) return [];
  const cabecalho = dados[0];
  return dados.slice(1).map(linha => {
    const obj = {};
    cabecalho.forEach((col, j) => obj[col] = linha[j]);
    return obj;
  });
}

function fimDoDia(dataStr) {
  const d = new Date(dataStr);
  d.setHours(23, 59, 59, 999);
  return d;
}

// Calcula o status "de verdade" do evento com base nas datas, sem depender
// de nenhuma tarefa agendada: concluído (passou a data fim), fechado
// (passou o prazo de pagamento, mas o evento ainda não aconteceu) ou o
// status manual que o líder definiu (normalmente "aberto").
function statusEfetivo(evento) {
  const hoje = new Date();
  if (evento.dataFim && hoje > fimDoDia(evento.dataFim)) return 'concluido';
  if (evento.dataLimite && hoje > fimDoDia(evento.dataLimite)) return 'fechado';
  return evento.status || 'aberto';
}

function acaoListarEventos() {
  const eventos = sheetToObjects(getSheet('eventos')).map(e => ({ ...e, status: statusEfetivo(e) }));
  return { ok: true, data: eventos };
}

function acaoGetEventoAtivo(usuarioId) {
  const ativos = getSheet('eventoAtivo').getDataRange().getValues();
  if (ativos.length < 2) return { ok: false, erro: 'Nenhum evento ativo.' };
  const eventoId = ativos[1][0];
  return acaoGetEvento({ id: eventoId }, usuarioId);
}

function buscarEventoBruto(id) {
  const eventos = sheetToObjects(getSheet('eventos'));
  return eventos.find(e => e.id === id) || null;
}

function acaoGetEvento(body, usuarioId) {
  const { id } = body;
  const evento = buscarEventoBruto(id);
  if (!evento) return { ok: false, erro: 'Evento não encontrado.' };
  const { senhaExcecao, ...eventoPublico } = evento;
  const dados = {
    ...eventoPublico,
    status: statusEfetivo(evento),
    valor: parseFloat(evento.valor) || 0,
    temExcecaoPrazo: !!(senhaExcecao && senhaExcecao.toString().trim()),
  };
  if (verificarLider(usuarioId)) dados.senhaExcecao = senhaExcecao || '';
  return { ok: true, data: dados };
}

function verificarLider(usuarioId) {
  if (!usuarioId) return false;
  const usuarios = sheetToObjects(getSheet('usuarios'));
  const u = usuarios.find(u => u.id === usuarioId);
  return u && u.acesso === 'Lider';
}

function acaoCriarEvento(body, usuarioId) {
  if (!verificarLider(usuarioId)) return { ok: false, erro: 'Acesso negado.' };
  const { nome, dataInicio, dataFim, horario, dataLimite, valor, status, recomendacoes, chavePix, idadeAutorizacao, senhaExcecao, tipoChavePix, videoUrl } = body;
  if (!nome || !dataInicio || !dataFim || !dataLimite || !valor) return { ok: false, erro: 'Dados incompletos.' };

  const id = gerarId();
  const agora = new Date().toISOString();
  getSheet('eventos').appendRow([id, nome, dataInicio, dataFim, horario || '', dataLimite, valor, status || 'aberto', recomendacoes || '', chavePix || '', idadeAutorizacao || 14, agora, senhaExcecao || '', tipoChavePix || '', videoUrl || '']);
  return { ok: true, data: { id } };
}

function acaoEditarEvento(body, usuarioId) {
  if (!verificarLider(usuarioId)) return { ok: false, erro: 'Acesso negado.' };
  const sheet = getSheet('eventos');
  const dados = sheet.getDataRange().getValues();
  const cabecalho = dados[0];

  for (let i = 1; i < dados.length; i++) {
    if (dados[i][0] === body.id) {
      cabecalho.forEach((col, j) => {
        if (body[col] !== undefined) sheet.getRange(i + 1, j + 1).setValue(body[col]);
      });
      return { ok: true };
    }
  }
  return { ok: false, erro: 'Evento não encontrado.' };
}

function acaoSetEventoAtivo(body, usuarioId) {
  if (!verificarLider(usuarioId)) return { ok: false, erro: 'Acesso negado.' };
  const sheet = getSheet('eventoAtivo');
  if (sheet.getLastRow() < 2) {
    sheet.appendRow([body.eventoId]);
  } else {
    sheet.getRange(2, 1).setValue(body.eventoId);
  }
  // Um evento ativo passa a aceitar inscrições automaticamente
  acaoEditarEvento({ id: body.eventoId, status: 'aberto' }, usuarioId);
  return { ok: true };
}

// ============================================================
// AÇÕES — INSCRIÇÕES
// ============================================================

function distribuirVencimentos(dataLimite, quantidade, diaVencimento) {
  const limite = new Date(dataLimite);

  if (diaVencimento) {
    // Gera vencimentos no dia fixo escolhido (ex: todo dia 10), mês a mês,
    // nunca ultrapassando a data limite do evento.
    const hoje = new Date();
    let ano = hoje.getFullYear();
    let mes = hoje.getMonth();
    let candidato = new Date(ano, mes, diaVencimento);
    if (candidato <= hoje) {
      mes += 1;
      candidato = new Date(ano, mes, diaVencimento);
    }
    const datas = [];
    while (candidato <= limite && datas.length < quantidade) {
      datas.push(candidato.toISOString().split('T')[0]);
      mes += 1;
      candidato = new Date(ano, mes, diaVencimento);
    }
    // Se não deu pra gerar todas as parcelas pedidas, preenche o resto na data limite
    while (datas.length < quantidade) datas.push(limite.toISOString().split('T')[0]);
    return datas;
  }

  // Fallback: distribuição igual entre hoje e a data limite (comportamento antigo)
  const inicio = new Date();
  const intervalo = (limite.getTime() - inicio.getTime()) / quantidade;
  return Array.from({ length: quantidade }, (_, i) => {
    const d = new Date(inicio.getTime() + intervalo * (i + 1));
    return d.toISOString().split('T')[0];
  });
}

function acaoInscrever(body, usuarioId) {
  if (!usuarioId) return { ok: false, erro: 'Não autenticado.' };
  const { eventoId, quantidadeParcelas, whatsappResponsavel, diaVencimento, senhaExcecao } = body;
  if (!eventoId || !quantidadeParcelas) return { ok: false, erro: 'Dados incompletos.' };

  // Verificar se já inscrito
  const inscricoes = sheetToObjects(getSheet('inscricoes'));
  const jaInscrito = inscricoes.find(i => i.eventoId === eventoId && i.usuarioId === usuarioId);
  if (jaInscrito) return { ok: false, erro: 'Você já está inscrito neste evento.' };

  const evento = buscarEventoBruto(eventoId);
  if (!evento) return { ok: false, erro: 'Evento não encontrado.' };
  if (evento.status === 'fechado') return { ok: false, erro: 'As inscrições para este evento estão fechadas.' };

  // Evento já concluído (passou a data fim): não aceita nem com senha de exceção
  if (evento.dataFim && new Date() > fimDoDia(evento.dataFim)) {
    return { ok: false, erro: 'Este evento já foi concluído.' };
  }

  // Prazo de pagamento encerrado, mas evento ainda não aconteceu: exige senha de exceção
  const prazoEncerrado = new Date() > fimDoDia(evento.dataLimite);
  if (prazoEncerrado) {
    const senhaCadastrada = (evento.senhaExcecao || '').toString().trim();
    if (!senhaCadastrada || (senhaExcecao || '').toString().trim() !== senhaCadastrada) {
      return { ok: false, erro: 'O prazo de inscrição para este evento já encerrou.' };
    }
  }

  const inscricaoId = gerarId();
  const agora = new Date().toISOString();
  getSheet('inscricoes').appendRow([inscricaoId, eventoId, usuarioId, whatsappResponsavel || '', agora]);

  // Gerar parcelas
  const valorParcela = parseFloat(evento.valor) / quantidadeParcelas;
  const vencimentos = distribuirVencimentos(evento.dataLimite, quantidadeParcelas, diaVencimento ? parseInt(diaVencimento) : null);
  const sheetParcelas = getSheet('parcelas');

  for (let i = 0; i < quantidadeParcelas; i++) {
    sheetParcelas.appendRow([gerarId(), inscricaoId, i + 1, quantidadeParcelas, valorParcela.toFixed(2), vencimentos[i], 'Pendente', '', '']);
  }

  return { ok: true, data: { inscricaoId } };
}

function acaoListarInscricoes(body, usuarioId) {
  if (!verificarLider(usuarioId)) return { ok: false, erro: 'Acesso negado.' };
  const { eventoId } = body;

  const inscricoes = sheetToObjects(getSheet('inscricoes')).filter(i => i.eventoId === eventoId);
  const parcelas = sheetToObjects(getSheet('parcelas'));
  const usuarios = sheetToObjects(getSheet('usuarios'));

  const resultado = inscricoes.map(insc => {
    const usuario = usuarios.find(u => u.id === insc.usuarioId) || {};
    const parcelasInsc = parcelas.filter(p => p.inscricaoId === insc.id).map(p => ({
      ...p,
      valor: parseFloat(p.valor) || 0,
    }));
    return {
      id: insc.id,
      usuarioId: insc.usuarioId,
      nome: usuario.nome || '',
      sobrenome: usuario.sobrenome || '',
      telefone: usuario.telefone || '',
      dataNascimento: usuario.dataNascimento || '',
      parcelas: parcelasInsc,
    };
  });

  return { ok: true, data: resultado };
}

function acaoGetInscricaoDetalhe(body, usuarioId) {
  if (!verificarLider(usuarioId)) return { ok: false, erro: 'Acesso negado.' };
  const { inscricaoId } = body;

  const inscricoes = sheetToObjects(getSheet('inscricoes'));
  const insc = inscricoes.find(i => i.id === inscricaoId);
  if (!insc) return { ok: false, erro: 'Inscrição não encontrada.' };

  const usuarios = sheetToObjects(getSheet('usuarios'));
  const usuario = usuarios.find(u => u.id === insc.usuarioId) || {};
  const evento = buscarEventoBruto(insc.eventoId) || {};

  const parcelas = sheetToObjects(getSheet('parcelas'))
    .filter(p => p.inscricaoId === inscricaoId)
    .map(p => ({ ...p, valor: parseFloat(p.valor) || 0 }))
    .sort((a, b) => Number(a.numero) - Number(b.numero));

  return {
    ok: true,
    data: {
      id: insc.id,
      nome: usuario.nome || '',
      sobrenome: usuario.sobrenome || '',
      telefone: usuario.telefone || '',
      email: usuario.email || '',
      dataNascimento: usuario.dataNascimento || '',
      eventoNome: evento.nome || '',
      whatsappResponsavel: insc.whatsappResponsavel || '',
      parcelas,
    },
  };
}

function acaoGetMinhasInscricoes(usuarioId) {
  if (!usuarioId) return { ok: false, erro: 'Não autenticado.' };

  const inscricoes = sheetToObjects(getSheet('inscricoes')).filter(i => i.usuarioId === usuarioId);
  const parcelas = sheetToObjects(getSheet('parcelas'));
  const eventos = sheetToObjects(getSheet('eventos'));

  const resultado = inscricoes.map(insc => {
    const evento = eventos.find(e => e.id === insc.eventoId) || {};
    const parcelasInsc = parcelas.filter(p => p.inscricaoId === insc.id).map(p => {
      const venc = new Date(p.vencimento);
      const hoje = new Date();
      let status = p.status;
      if (status === 'Pendente' && venc < hoje) status = 'Vencido';
      return { ...p, status, valor: parseFloat(p.valor) || 0 };
    });
    return { ...insc, evento, parcelas: parcelasInsc };
  });

  return { ok: true, data: resultado };
}

// ============================================================
// AÇÕES — PAGAMENTOS
// ============================================================

function acaoRegistrarPagamento(body, usuarioId) {
  if (!usuarioId) return { ok: false, erro: 'Não autenticado.' };
  const { parcelaId, comprovanteBase64, mimeType } = body;
  if (!parcelaId || !comprovanteBase64) return { ok: false, erro: 'Dados incompletos.' };

  // Salvar comprovante no Drive
  let comprovanteUrl = '';
  try {
    const ext = mimeType.includes('pdf') ? '.pdf' : '.jpg';
    const blob = Utilities.newBlob(Utilities.base64Decode(comprovanteBase64), mimeType, `comprovante_${parcelaId}${ext}`);
    const pasta = DriveApp.getFolderById(DRIVE_PASTA_ID || 'root');
    const arquivo = pasta.createFile(blob);
    arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    comprovanteUrl = arquivo.getUrl();
  } catch (e) {
    console.error('Erro ao salvar no Drive:', e);
  }

  // Atualizar parcela
  const sheet = getSheet('parcelas');
  const dados = sheet.getDataRange().getValues();
  const cabecalho = dados[0];

  for (let i = 1; i < dados.length; i++) {
    if (dados[i][0] === parcelaId) {
      const colStatus = cabecalho.indexOf('status');
      const colComprovante = cabecalho.indexOf('comprovanteUrl');
      const colPagoEm = cabecalho.indexOf('pagoEm');
      sheet.getRange(i + 1, colStatus + 1).setValue('Pago');
      sheet.getRange(i + 1, colComprovante + 1).setValue(comprovanteUrl);
      sheet.getRange(i + 1, colPagoEm + 1).setValue(new Date().toISOString());

      // Notificar líderes via push (interno — chama notificarLideres)
      notificarLideresInterno(`💰 Comprovante recebido!`, `Um participante enviou comprovante de pagamento.`, '/admin/inscricoes');

      return { ok: true, data: { comprovanteUrl } };
    }
  }
  return { ok: false, erro: 'Parcela não encontrada.' };
}

function acaoGetParcelasInscricao(body) {
  const { parcelaId } = body;

  // Buscar a parcela e os detalhes do evento via a inscrição
  const parcelas = sheetToObjects(getSheet('parcelas'));
  const parcela = parcelas.find(p => p.id === parcelaId);
  if (!parcela) return { ok: false, erro: 'Parcela não encontrada.' };

  const inscricoes = sheetToObjects(getSheet('inscricoes'));
  const inscricao = inscricoes.find(i => i.id === parcela.inscricaoId);
  const eventoRes = inscricao ? acaoGetEvento({ id: inscricao.eventoId }) : { ok: false };
  const evento = eventoRes.ok ? eventoRes.data : {};

  return {
    ok: true,
    data: {
      ...parcela,
      valor: parseFloat(parcela.valor) || 0,
      chavePix: evento.chavePix || '',
      tipoChavePix: evento.tipoChavePix || '',
      eventoNome: evento.nome || '',
    }
  };
}

// ============================================================
// AÇÕES — USUÁRIOS
// ============================================================

function acaoListarUsuarios(usuarioId) {
  if (!verificarLider(usuarioId)) return { ok: false, erro: 'Acesso negado.' };
  const usuarios = sheetToObjects(getSheet('usuarios')).map(u => ({
    id: u.id, nome: u.nome, sobrenome: u.sobrenome,
    email: u.email, acesso: u.acesso,
  }));
  return { ok: true, data: usuarios };
}

function acaoGetUsuario(body, usuarioId) {
  const { id } = body;
  // Pode ver o próprio perfil ou líder vê qualquer um
  if (usuarioId !== id && !verificarLider(usuarioId)) return { ok: false, erro: 'Acesso negado.' };

  const usuarios = sheetToObjects(getSheet('usuarios'));
  const usuario = usuarios.find(u => u.id === id);
  if (!usuario) return { ok: false, erro: 'Usuário não encontrado.' };

  const { senha, ...semSenha } = usuario;
  return { ok: true, data: semSenha };
}

function acaoEditarUsuario(body, usuarioId) {
  const { id, nome, sobrenome, dataNascimento, telefone, acesso } = body;
  if (usuarioId !== id && !verificarLider(usuarioId)) return { ok: false, erro: 'Acesso negado.' };

  const sheet = getSheet('usuarios');
  const dados = sheet.getDataRange().getValues();
  const cabecalho = dados[0];

  for (let i = 1; i < dados.length; i++) {
    if (dados[i][0] === id) {
      if (nome) sheet.getRange(i + 1, cabecalho.indexOf('nome') + 1).setValue(nome);
      if (sobrenome) sheet.getRange(i + 1, cabecalho.indexOf('sobrenome') + 1).setValue(sobrenome);
      if (dataNascimento) sheet.getRange(i + 1, cabecalho.indexOf('dataNascimento') + 1).setValue(dataNascimento);
      if (telefone) sheet.getRange(i + 1, cabecalho.indexOf('telefone') + 1).setValue(telefone);
      // Acesso só pode ser alterado por Líder
      if (acesso && verificarLider(usuarioId)) sheet.getRange(i + 1, cabecalho.indexOf('acesso') + 1).setValue(acesso);
      return { ok: true };
    }
  }
  return { ok: false, erro: 'Usuário não encontrado.' };
}

// ============================================================
// AÇÕES — GALERIA
// ============================================================

function acaoUploadMidia(body, usuarioId) {
  if (!verificarLider(usuarioId)) return { ok: false, erro: 'Acesso negado.' };
  const { eventoId, tipo, base64, mimeType } = body;
  if (!base64 || !tipo) return { ok: false, erro: 'Dados incompletos.' };

  try {
    const ext = mimeType.includes('mp4') ? '.mp4' : mimeType.includes('pdf') ? '.pdf' : '.jpg';
    const blob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, `galeria_${Date.now()}${ext}`);
    const pasta = DriveApp.getFolderById(DRIVE_PASTA_ID || 'root');
    const arquivo = pasta.createFile(blob);
    arquivo.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
    const url = `https://drive.google.com/uc?id=${arquivo.getId()}`;

    const id = gerarId();
    getSheet('galeria').appendRow([id, eventoId || '', tipo, url, usuarioId, new Date().toISOString()]);
    return { ok: true, data: { id, url } };
  } catch (e) {
    return { ok: false, erro: 'Erro ao fazer upload.' };
  }
}

function acaoListarGaleria() {
  const galeria = sheetToObjects(getSheet('galeria'));
  return { ok: true, data: galeria };
}

// ============================================================
// AÇÕES — PUSH NOTIFICATIONS
// ============================================================

function acaoSalvarSubscription(body, usuarioId) {
  if (!usuarioId) return { ok: false, erro: 'Não autenticado.' };
  const { subscription } = body;
  if (!subscription?.endpoint) return { ok: false, erro: 'Subscription inválida.' };

  const sheet = getSheet('pushSubscriptions');
  const dados = sheet.getDataRange().getValues();

  // Atualizar se já existe para este usuário
  for (let i = 1; i < dados.length; i++) {
    if (dados[i][1] === usuarioId) {
      sheet.getRange(i + 1, 3).setValue(subscription.endpoint);
      sheet.getRange(i + 1, 4).setValue(JSON.stringify(subscription.keys));
      return { ok: true };
    }
  }

  getSheet('pushSubscriptions').appendRow([gerarId(), usuarioId, subscription.endpoint, JSON.stringify(subscription.keys || {})]);
  return { ok: true };
}

function notificarLideresInterno(titulo, corpo, url) {
  // Esta função dispara push para todos os líderes via URL do Next.js
  // (chamada opcional via UrlFetchApp para /api/push)
  const NEXT_URL = ''; // <-- URL do Vercel, ex: https://acamp-deep.vercel.app

  if (!NEXT_URL) return;

  const subscriptions = sheetToObjects(getSheet('pushSubscriptions'));
  const usuarios = sheetToObjects(getSheet('usuarios'));
  const liderIds = usuarios.filter(u => u.acesso === 'Lider').map(u => u.id);

  subscriptions
    .filter(s => liderIds.includes(s.usuarioId))
    .forEach(s => {
      try {
        UrlFetchApp.fetch(`${NEXT_URL}/api/push`, {
          method: 'POST',
          contentType: 'application/json',
          payload: JSON.stringify({
            subscription: { endpoint: s.endpoint, keys: JSON.parse(s.keys || '{}') },
            title: titulo,
            body: corpo,
            url: url,
          }),
          muteHttpExceptions: true,
        });
      } catch (e) {
        console.error('Push falhou:', e);
      }
    });
}

// ============================================================
// SETUP INICIAL — Criar abas da planilha
// ============================================================
function setupPlanilha() {
  const ss = SpreadsheetApp.openById(PLANILHA_ID);

  const abas = {
    'usuarios': ['id', 'nome', 'sobrenome', 'email', 'telefone', 'dataNascimento', 'membroDeep', 'membroIgreja', 'acesso', 'senha', 'createdAt'],
    'sessoes': ['token', 'usuarioId', 'createdAt', 'expiresAt'],
    'eventos': ['id', 'nome', 'dataInicio', 'dataFim', 'horario', 'dataLimite', 'valor', 'status', 'recomendacoes', 'chavePix', 'idadeAutorizacao', 'createdAt', 'senhaExcecao', 'tipoChavePix', 'videoUrl'],
    'eventoAtivo': ['eventoId'],
    'inscricoes': ['id', 'eventoId', 'usuarioId', 'whatsappResponsavel', 'createdAt'],
    'parcelas': ['id', 'inscricaoId', 'numero', 'totalParcelas', 'valor', 'vencimento', 'status', 'comprovanteUrl', 'pagoEm'],
    'galeria': ['id', 'eventoId', 'tipo', 'url', 'uploadPor', 'createdAt'],
    'pushSubscriptions': ['id', 'usuarioId', 'endpoint', 'keys'],
  };

  Object.entries(abas).forEach(([nome, colunas]) => {
    let sheet = ss.getSheetByName(nome);
    if (!sheet) {
      sheet = ss.insertSheet(nome);
    }
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(colunas);
    }
  });

  Logger.log('Planilha configurada com sucesso!');
}
