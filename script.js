/* ============================================
   ACHADOS & PERDIDOS - LÓGICA PRINCIPAL
   ============================================ */

// ========== CONSTANTES E CONFIGURAÇÕES ==========
const STORAGE_USERS = "achados_usuarios";
const STORAGE_OBJETOS = "achados_objetos";
const STORAGE_SESSION = "achados_session";

let currentPage = "home";

// ========== INICIALIZAÇÃO DOS DADOS ==========
function initData() {
    let users = localStorage.getItem(STORAGE_USERS);
    if (!users) {
        const admin = {
            id: "1",
            nome: "Secretaria Escola",
            email: "admin@escola.com",
            senha: "admin123",
            tipo: "admin"
        };
        const aluno = {
            id: "2",
            nome: "Ana Aluno",
            email: "ana@email.com",
            senha: "123456",
            tipo: "comum"
        };
        const aluno2 = {
            id: "3",
            nome: "Carlos Silva",
            email: "carlos@email.com",
            senha: "123456",
            tipo: "comum"
        };
        localStorage.setItem(STORAGE_USERS, JSON.stringify([admin, aluno, aluno2]));
    }
    
    let objetos = localStorage.getItem(STORAGE_OBJETOS);
    if (!objetos) {
        const exemplos = [
            { 
                id: "obj1", 
                titulo: "Mochila preta Nike", 
                descricao: "Mochila preta com cadernos e estojo", 
                categoria: "Mochila", 
                localEncontrado: "Pátio coberto", 
                dataEncontrado: "2025-06-10", 
                fotoUrl: "", 
                status: "disponivel", 
                usuario_id: "1", 
                dataRegistro: "2025-06-10", 
                contato: "Secretaria" 
            },
            { 
                id: "obj2", 
                titulo: "Carregador USB-C", 
                descricao: "Carregador branco da Samsung", 
                categoria: "Eletrônicos", 
                localEncontrado: "Laboratório de informática", 
                dataEncontrado: "2025-06-12", 
                fotoUrl: "", 
                status: "disponivel", 
                usuario_id: "2", 
                dataRegistro: "2025-06-12", 
                contato: "Ana - Sala 23" 
            },
            { 
                id: "obj3", 
                titulo: "Óculos de grau", 
                descricao: "Óculos armação preta, grau leve", 
                categoria: "Óculos", 
                localEncontrado: "Biblioteca", 
                dataEncontrado: "2025-06-14", 
                fotoUrl: "", 
                status: "disponivel", 
                usuario_id: "3", 
                dataRegistro: "2025-06-14", 
                contato: "Carlos" 
            }
        ];
        localStorage.setItem(STORAGE_OBJETOS, JSON.stringify(exemplos));
    }
}

// ========== FUNÇÕES DE USUÁRIO ==========
function getCurrentUser() {
    const email = localStorage.getItem(STORAGE_SESSION);
    if (!email) return null;
    const users = JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];
    return users.find(u => u.email === email) || null;
}

function setSessionUser(email) {
    if (email) localStorage.setItem(STORAGE_SESSION, email);
    else localStorage.removeItem(STORAGE_SESSION);
}

// ========== FUNÇÕES DE OBJETOS ==========
function getObjetos() {
    return JSON.parse(localStorage.getItem(STORAGE_OBJETOS)) || [];
}

function saveObjetos(objetos) {
    localStorage.setItem(STORAGE_OBJETOS, JSON.stringify(objetos));
}

function addObjeto(obj) {
    const objetos = getObjetos();
    obj.id = Date.now().toString();
    objetos.push(obj);
    saveObjetos(objetos);
    return obj;
}

function updateObjeto(id, novosDados) {
    let objetos = getObjetos();
    const index = objetos.findIndex(o => o.id === id);
    if (index !== -1) {
        objetos[index] = { ...objetos[index], ...novosDados };
        saveObjetos(objetos);
        return true;
    }
    return false;
}

function deleteObjeto(id) {
    let objetos = getObjetos();
    objetos = objetos.filter(o => o.id !== id);
    saveObjetos(objetos);
}

// ========== FUNÇÕES AUXILIARES ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatarData(data) {
    if (!data) return '';
    const partes = data.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return data;
}

// ========== RENDERIZAÇÃO DE CARDS ==========
function renderCard(obj, showActions = false, currentUser = null) {
    return `
        <div class="objeto-card">
            <div class="card-img">
                ${obj.fotoUrl ? `<img src="${obj.fotoUrl}" alt="${escapeHtml(obj.titulo)}">` : '<i class="fas fa-box-open fa-3x"></i>'}
            </div>
            <div class="card-info">
                <h3>${escapeHtml(obj.titulo)}</h3>
                <div class="categoria-badge"><i class="fas fa-tag"></i> ${obj.categoria}</div>
                <p><i class="fas fa-map-marker-alt"></i> <strong>Local:</strong> ${escapeHtml(obj.localEncontrado)}</p>
                <p><i class="far fa-calendar-alt"></i> <strong>Data:</strong> ${formatarData(obj.dataEncontrado)}</p>
                <p><small>${obj.descricao ? escapeHtml(obj.descricao.substring(0, 80)) : ''}</small></p>
                <span class="status ${obj.status === 'disponivel' ? 'status-disponivel' : 'status-devolvido'}">
                    ${obj.status === 'disponivel' ? '<i class="fas fa-check-circle"></i> Disponível' : '<i class="fas fa-check-double"></i> Já retirado'}
                </span>
                <div style="margin-top:10px">
                    <button class="btn-detalhe" data-id="${obj.id}" style="background:#eef; color:#1F497D; padding:5px 12px;">
                        <i class="fas fa-eye"></i> Ver detalhes
                    </button>
                    ${showActions && obj.status === 'disponivel' ? `<button class="btn-reivindicar" data-id="${obj.id}" style="background:#F5C518; color:#1F497D; padding:5px 12px; margin-left:5px;">
                        <i class="fas fa-hand-holding-heart"></i> É meu!
                    </button>` : ''}
                </div>
            </div>
        </div>
    `;
}

// ========== PÁGINAS ==========
function renderHome() {
    const user = getCurrentUser();
    const objetos = getObjetos().filter(o => o.status === "disponivel").slice(0, 6);
    
    return `
        <div class="hero-section">
            <h2><i class="fas fa-search-location"></i> Perdeu algum objeto? Encontrou algo?</h2>
            <p>O Achados & Perdidos da escola ajuda você a encontrar seus pertences e devolver o que achou!</p>
            <div class="hero-buttons">
                ${!user ? '<a href="#" id="hero-login" class="btn btn-grande" style="background:white; color:#1F497D;"><i class="fas fa-sign-in-alt"></i> Login para cadastrar</a>' : ''}
                <a href="#" id="hero-cadastrar" class="btn btn-grande btn-destaque"><i class="fas fa-plus-circle"></i> ${user ? 'Cadastrar Item Encontrado' : 'Cadastre-se Grátis'}</a>
                <a href="#" id="hero-buscar" class="btn btn-grande" style="background:rgba(255,255,255,0.2);"><i class="fas fa-search"></i> Buscar Itens</a>
            </div>
        </div>
        <div class="card">
            <h3><i class="fas fa-clock"></i> Últimos objetos encontrados</h3>
            <div class="grid-cards" id="ultimos-objetos">
                ${objetos.map(obj => renderCard(obj, !!user, user)).join('')}
                ${objetos.length === 0 ? '<p style="text-align:center">Nenhum objeto cadastrado ainda. <a href="#" id="empty-cadastrar">Seja o primeiro a cadastrar!</a></p>' : ''}
            </div>
        </div>
    `;
}

function renderRegistrar() {
    const user = getCurrentUser();
    if (!user) return renderLogin();
    
    return `
        <div class="card">
            <h2><i class="fas fa-camera"></i> Cadastrar Item Encontrado</h2>
            <p style="margin-bottom:1rem; color:#666;">Você encontrou algum objeto na escola? Cadastre aqui para ajudar o dono a recuperar!</p>
            <form id="formRegistro">
                <div class="form-group">
                    <label><i class="fas fa-tag"></i> Nome do objeto*</label>
                    <input type="text" id="titulo" placeholder="Ex: Estojo azul, Chaveiro do Homem-Aranha" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-list"></i> Categoria*</label>
                    <select id="categoria" required>
                        <option value="">Selecione...</option>
                        <option>Mochila</option>
                        <option>Eletrônicos</option>
                        <option>Documentos</option>
                        <option>Chaveiro</option>
                        <option>Óculos</option>
                        <option>Roupas</option>
                        <option>Livros</option>
                        <option>Outro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-map-marker-alt"></i> Local onde foi encontrado*</label>
                    <input id="local" placeholder="Ex: Sala 12, Pátio, Quadra" required>
                </div>
                <div class="form-group">
                    <label><i class="far fa-calendar-alt"></i> Data que foi encontrado*</label>
                    <input type="date" id="data" required>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-align-left"></i> Descrição detalhada</label>
                    <textarea id="descricao" rows="3" placeholder="Cor, marca, detalhes que ajudem a identificar..."></textarea>
                </div>
                <div class="form-group">
                    <label><i class="fas fa-image"></i> Foto do objeto (URL ou deixe em branco)</label>
                    <input id="fotoUrl" placeholder="https://...">
                </div>
                <div class="form-group">
                    <label><i class="fas fa-phone"></i> Como o dono pode te contatar? (opcional)</label>
                    <input id="contato" placeholder="Sala, telefone, e-mail...">
                </div>
                <button type="submit" class="btn-sucesso"><i class="fas fa-save"></i> Cadastrar Item Encontrado</button>
            </form>
            <div id="msgRegistro"></div>
        </div>
    `;
}

function renderBuscar() {
    const user = getCurrentUser();
    const objetos = getObjetos().filter(o => o.status === "disponivel");
    
    return `
        <div class="card">
            <h2><i class="fas fa-search"></i> Buscar Objetos Perdidos</h2>
            <p>Encontre seu objeto perdido ou veja o que foi achado na escola!</p>
            <div class="filtros">
                <input type="text" id="filtroTexto" placeholder="Palavra-chave" style="width:200px">
                <select id="filtroCategoria">
                    <option value="">Todas categorias</option>
                    <option>Mochila</option>
                    <option>Eletrônicos</option>
                    <option>Documentos</option>
                    <option>Chaveiro</option>
                    <option>Óculos</option>
                    <option>Roupas</option>
                    <option>Livros</option>
                </select>
                <input type="text" id="filtroLocal" placeholder="Local">
                <button id="btnFiltrar" class="btn-destaque"><i class="fas fa-filter"></i> Filtrar</button>
            </div>
            <div id="resultadosBusca" class="grid-cards">
                ${objetos.map(obj => renderCard(obj, !!user, user)).join('')}
                ${objetos.length === 0 ? '<p style="text-align:center">Nenhum objeto disponível no momento.</p>' : ''}
            </div>
        </div>
    `;
}

function renderMeusItens() {
    const user = getCurrentUser();
    if (!user) return '<div class="card"><p>Faça login para ver seus itens.</p></div>';
    
    const meusObjetos = getObjetos().filter(obj => obj.usuario_id === user.id);
    
    return `
        <div class="card">
            <h2><i class="fas fa-boxes"></i> Meus Itens Cadastrados</h2>
            <p>Itens que você encontrou e cadastrou no sistema.</p>
            ${meusObjetos.length === 0 ? 
                '<p style="text-align:center">Você ainda não cadastrou nenhum objeto. <a href="#" id="cadastrar-agora">Clique aqui para cadastrar</a></p>' : 
                `<div class="grid-cards">
                    ${meusObjetos.map(obj => `
                        <div class="objeto-card">
                            <div class="card-info">
                                <h3>${escapeHtml(obj.titulo)}</h3>
                                <p><strong>Status:</strong> ${obj.status === 'disponivel' ? 'Disponível para devolução' : 'Já devolvido ao dono'}</p>
                                <p><strong>Local:</strong> ${escapeHtml(obj.localEncontrado)}</p>
                                <p><strong>Data:</strong> ${formatarData(obj.dataEncontrado)}</p>
                                <div style="margin-top:10px">
                                    ${obj.status === 'disponivel' ? 
                                        `<button class="btn-marcar-retirado" data-id="${obj.id}" class="btn-sucesso" style="background:#28a745;"><i class="fas fa-handshake"></i> Marcar como Devolvido</button>` : ''}
                                    <button class="btn-editar" data-id="${obj.id}" style="background:#1F497D;"><i class="fas fa-edit"></i> Editar</button>
                                    <button class="btn-excluir" data-id="${obj.id}" style="background:#dc3545;"><i class="fas fa-trash"></i> Excluir</button>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>`
            }
            <div id="msgAcao"></div>
        </div>
    `;
}

function renderAdmin() {
    const user = getCurrentUser();
    if (!user || user.tipo !== 'admin') return '<div class="card"><p>Acesso restrito a administradores.</p></div>';
    
    const objetos = getObjetos();
    const devolvidos = objetos.filter(o => o.status === 'devolvido').length;
    const disponiveis = objetos.filter(o => o.status === 'disponivel').length;
    
    return `
        <div class="card">
            <h2><i class="fas fa-chart-line"></i> Painel Administrativo</h2>
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>${objetos.length}</h3>
                    <p>Total cadastrados</p>
                </div>
                <div class="stat-card">
                    <h3>${devolvidos}</h3>
                    <p>Já devolvidos</p>
                </div>
                <div class="stat-card">
                    <h3>${disponiveis}</h3>
                    <p>Aguardando dono</p>
                </div>
            </div>
            <h3>Lista completa de objetos</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr><th>Objeto</th><th>Categoria</th><th>Local</th><th>Status</th><th>Ações</th></tr>
                    </thead>
                    <tbody>
                        ${objetos.map(obj => `
                            <tr>
                                <td>${escapeHtml(obj.titulo)}</td>
                                <td>${obj.categoria}</td>
                                <td>${escapeHtml(obj.localEncontrado)}</td>
                                <td>${obj.status === 'disponivel' ? '📦 Disponível' : '✅ Devolvido'}</td>
                                <td>
                                    ${obj.status === 'disponivel' ? 
                                        `<button class="admin-devolver" data-id="${obj.id}" style="background:#28a745; padding:5px 10px;">Registrar Devolução</button>` : ''}
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

function renderLogin() {
    return `
        <div class="card" style="max-width:450px; margin:auto;">
            <h2><i class="fas fa-sign-in-alt"></i> Login</h2>
            <p>Faça login para cadastrar objetos encontrados ou reivindicar seus pertences!</p>
            <form id="formLogin">
                <div class="form-group">
                    <label>E-mail</label>
                    <input type="email" id="emailLogin" required placeholder="ana@email.com">
                </div>
                <div class="form-group">
                    <label>Senha</label>
                    <input type="password" id="senhaLogin" required placeholder="123456">
                </div>
                <button type="submit" class="btn-destaque">Entrar</button>
            </form>
            <p style="margin-top:1rem">Não tem conta? <a href="#" id="linkCadastro">Cadastre-se gratuitamente</a></p>
            <div id="msgLogin"></div>
            <hr style="margin:1rem 0">
            <p><small>Teste: ana@email.com / 123456 | admin@escola.com / admin123</small></p>
        </div>
    `;
}

function renderCadastro() {
    return `
        <div class="card" style="max-width:450px; margin:auto;">
            <h2><i class="fas fa-user-plus"></i> Cadastro de Usuário</h2>
            <p>Cadastre-se para começar a ajudar na devolução de objetos!</p>
            <form id="formCadastro">
                <div class="form-group">
                    <label>Nome completo</label>
                    <input id="nomeCad" required placeholder="Seu nome">
                </div>
                <div class="form-group">
                    <label>E-mail</label>
                    <input type="email" id="emailCad" required placeholder="email@exemplo.com">
                </div>
                <div class="form-group">
                    <label>Senha</label>
                    <input type="password" id="senhaCad" required placeholder="mínimo 4 caracteres">
                </div>
                <button type="submit" class="btn-sucesso">Cadastrar</button>
            </form>
            <div id="msgCadastro"></div>
        </div>
    `;
}

// ========== EVENTOS ESPECÍFICOS ==========
function attachPageEvents(page) {
    // Eventos da home
    document.getElementById("hero-cadastrar")?.addEventListener("click", (e) => {
        e.preventDefault();
        if(getCurrentUser()) { currentPage = "registrar"; render(); }
        else { currentPage = "cadastro"; render(); }
    });
    
    document.getElementById("hero-buscar")?.addEventListener("click", (e) => { 
        e.preventDefault(); 
        currentPage = "buscar"; 
        render(); 
    });
    
    document.getElementById("hero-login")?.addEventListener("click", (e) => { 
        e.preventDefault(); 
        currentPage = "login"; 
        render(); 
    });
    
    document.getElementById("empty-cadastrar
