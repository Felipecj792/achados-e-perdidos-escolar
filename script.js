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
    // Inicializa usuários
    if (!localStorage.getItem(STORAGE_USERS)) {
        const users = [
            { id: "1", nome: "Secretaria Escola", email: "admin@escola.com", senha: "admin123", tipo: "admin" },
            { id: "2", nome: "Ana Aluno", email: "ana@email.com", senha: "123456", tipo: "comum" },
            { id: "3", nome: "Carlos Silva", email: "carlos@email.com", senha: "123456", tipo: "comum" }
        ];
        localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
    }
    
    // Inicializa objetos
    if (!localStorage.getItem(STORAGE_OBJETOS)) {
        const objetos = [
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
        localStorage.setItem(STORAGE_OBJETOS, JSON.stringify(objetos));
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
    if (email) {
        localStorage.setItem(STORAGE_SESSION, email);
    } else {
        localStorage.removeItem(STORAGE_SESSION);
    }
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
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return str.replace(/[&<>"']/g, function(m) { return map[m]; });
}

function formatarData(data) {
    if (!data) return '';
    const partes = data.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return data;
}

function gerarId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

// ========== RENDERIZAÇÃO DE CARDS ==========
function renderCard(obj, showActions = false, currentUser = null) {
    const isDisponivel = obj.status === 'disponivel';
    const statusClass = isDisponivel ? 'status-disponivel' : 'status-devolvido';
    const statusIcon = isDisponivel ? 'fa-check-circle' : 'fa-check-double';
    const statusText = isDisponivel ? 'Disponível' : 'Já retirado';
    
    return `
        <div class="objeto-card" data-id="${obj.id}">
            <div class="card-img">
                ${obj.fotoUrl ? `<img src="${obj.fotoUrl}" alt="${escapeHtml(obj.titulo)}" loading="lazy">` : '<i class="fas fa-box-open fa-3x"></i>'}
            </div>
            <div class="card-info">
                <h3>${escapeHtml(obj.titulo)}</h3>
                <div class="categoria-badge"><i class="fas fa-tag"></i> ${escapeHtml(obj.categoria)}</div>
                <p><i class="fas fa-map-marker-alt"></i> <strong>Local:</strong> ${escapeHtml(obj.localEncontrado)}</p>
                <p><i class="far fa-calendar-alt"></i> <strong>Data:</strong> ${formatarData(obj.dataEncontrado)}</p>
                <p><small>${obj.descricao ? escapeHtml(obj.descricao.substring(0, 80)) + (obj.descricao.length > 80 ? '...' : '') : ''}</small></p>
                <span class="status ${statusClass}">
                    <i class="fas ${statusIcon}"></i> ${statusText}
                </span>
                <div style="margin-top:10px">
                    <button class="btn-detalhe" data-id="${obj.id}" style="background:#eef; color:#1F497D; padding:5px 12px; border-radius:20px; border:none; cursor:pointer;">
                        <i class="fas fa-eye"></i> Ver detalhes
                    </button>
                    ${showActions && isDisponivel ? `<button class="btn-reivindicar" data-id="${obj.id}" style="background:#F5C518; color:#1F497D; padding:5px 12px; margin-left:5px; border-radius:20px; border:none; cursor:pointer;">
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
                ${objetos.length === 0 ? '<p style="text-align:center; padding:2rem 0;">Nenhum objeto cadastrado ainda. <a href="#" id="empty-cadastrar">Seja o primeiro a cadastrar!</a></p>' : ''}
            </div>
        </div>
    `;
}

function renderRegistrar() {
    const user = getCurrentUser();
    if (!user) return renderLogin();
    
    const today = new Date().toISOString().slice(0, 10);
    
    return `
        <div class="card">
            <h2><i class="fas fa-camera"></i> Cadastrar Item Encontrado</h2>
            <p style="margin-bottom:1rem; color:#666;">Você encontrou algum objeto na escola? Cadastre aqui para ajudar o dono a recuperar!</p>
            <form id="formRegistro">
                <div class="form-group">
                    <label for="titulo"><i class="fas fa-tag"></i> Nome do objeto*</label>
                    <input type="text" id="titulo" placeholder="Ex: Estojo azul, Chaveiro do Homem-Aranha" required maxlength="100">
                </div>
                <div class="form-group">
                    <label for="categoria"><i class="fas fa-list"></i> Categoria*</label>
                    <select id="categoria" required>
                        <option value="">Selecione...</option>
                        <option value="Mochila">Mochila</option>
                        <option value="Eletrônicos">Eletrônicos</option>
                        <option value="Documentos">Documentos</option>
                        <option value="Chaveiro">Chaveiro</option>
                        <option value="Óculos">Óculos</option>
                        <option value="Roupas">Roupas</option>
                        <option value="Livros">Livros</option>
                        <option value="Outro">Outro</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="local"><i class="fas fa-map-marker-alt"></i> Local onde foi encontrado*</label>
                    <input type="text" id="local" placeholder="Ex: Sala 12, Pátio, Quadra" required maxlength="100">
                </div>
                <div class="form-group">
                    <label for="data"><i class="far fa-calendar-alt"></i> Data que foi encontrado*</label>
                    <input type="date" id="data" required max="${today}">
                </div>
                <div class="form-group">
                    <label for="descricao"><i class="fas fa-align-left"></i> Descrição detalhada</label>
                    <textarea id="descricao" rows="3" placeholder="Cor, marca, detalhes que ajudem a identificar..." maxlength="500"></textarea>
                </div>
                <div class="form-group">
                    <label for="fotoUrl"><i class="fas fa-image"></i> Foto do objeto (URL ou deixe em branco)</label>
                    <input type="url" id="fotoUrl" placeholder="https://exemplo.com/foto.jpg">
                </div>
                <div class="form-group">
                    <label for="contato"><i class="fas fa-phone"></i> Como o dono pode te contatar? (opcional)</label>
                    <input type="text" id="contato" placeholder="Sala, telefone, e-mail..." maxlength="100">
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
    
    const categorias = [...new Set(objetos.map(o => o.categoria))];
    const categoriaOptions = categorias.map(cat => 
        `<option value="${escapeHtml(cat)}">${escapeHtml(cat)}</option>`
    ).join('');
    
    return `
        <div class="card">
            <h2><i class="fas fa-search"></i> Buscar Objetos Perdidos</h2>
            <p>Encontre seu objeto perdido ou veja o que foi achado na escola!</p>
            <div class="filtros">
                <input type="text" id="filtroTexto" placeholder="Palavra-chave" style="flex:1; min-width:150px;">
                <select id="filtroCategoria" style="flex:1; min-width:150px;">
                    <option value="">Todas categorias</option>
                    ${categoriaOptions}
                </select>
                <input type="text" id="filtroLocal" placeholder="Local" style="flex:1; min-width:150px;">
                <button id="btnFiltrar" class="btn-destaque"><i class="fas fa-filter"></i> Filtrar</button>
                <button id="btnLimparFiltros" class="btn"><i class="fas fa-undo"></i> Limpar</button>
            </div>
            <div id="resultadosBusca" class="grid-cards">
                ${objetos.map(obj => renderCard(obj, !!user, user)).join('')}
                ${objetos.length === 0 ? '<p style="text-align:center; padding:2rem 0;">Nenhum objeto disponível no momento.</p>' : ''}
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
                '<p style="text-align:center; padding:2rem 0;">Você ainda não cadastrou nenhum objeto. <a href="#" id="cadastrar-agora">Clique aqui para cadastrar</a></p>' : 
                `<div class="grid-cards">
                    ${meusObjetos.map(obj => `
                        <div class="objeto-card">
                            <div class="card-img">
                                ${obj.fotoUrl ? `<img src="${obj.fotoUrl}" alt="${escapeHtml(obj.titulo)}" loading="lazy">` : '<i class="fas fa-box-open fa-3x"></i>'}
                            </div>
                            <div class="card-info">
                                <h3>${escapeHtml(obj.titulo)}</h3>
                                <div class="categoria-badge"><i class="fas fa-tag"></i> ${escapeHtml(obj.categoria)}</div>
                                <p><strong>Status:</strong> ${obj.status === 'disponivel' ? '✅ Disponível para devolução' : '📦 Já devolvido ao dono'}</p>
                                <p><strong>Local:</strong> ${escapeHtml(obj.localEncontrado)}</p>
                                <p><strong>Data:</strong> ${formatarData(obj.dataEncontrado)}</p>
                                <div style="margin-top:10px; display:flex; flex-wrap:wrap; gap:5px;">
                                    ${obj.status === 'disponivel' ? 
                                        `<button class="btn-marcar-retirado" data-id="${obj.id}" class="btn-sucesso" style="background:#28a745; padding:5px 12px; border:none; border-radius:20px; color:white; cursor:pointer;">
                                            <i class="fas fa-handshake"></i> Marcar como Devolvido
                                        </button>` : ''}
                                    <button class="btn-editar" data-id="${obj.id}" style="background:#1F497D; padding:5px 12px; border:none; border-radius:20px; color:white; cursor:pointer;">
                                        <i class="fas fa-edit"></i> Editar
                                    </button>
                                    <button class="btn-excluir" data-id="${obj.id}" style="background:#dc3545; padding:5px 12px; border:none; border-radius:20px; color:white; cursor:pointer;">
                                        <i class="fas fa-trash"></i> Excluir
                                    </button>
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
    const totalUsuarios = JSON.parse(localStorage.getItem(STORAGE_USERS) || '[]').length;
    
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
                <div class="stat-card">
                    <h3>${totalUsuarios}</h3>
                    <p>Usuários cadastrados</p>
                </div>
            </div>
            <h3>Lista completa de objetos</h3>
            <div class="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Objeto</th>
                            <th>Categoria</th>
                            <th>Local</th>
                            <th>Status</th>
                            <th>Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${objetos.length === 0 ? 
                            '<tr><td colspan="5" style="text-align:center;">Nenhum objeto cadastrado.</td></tr>' :
                            objetos.map(obj => `
                                <tr>
                                    <td><strong>${escapeHtml(obj.titulo)}</strong></td>
                                    <td>${escapeHtml(obj.categoria)}</td>
                                    <td>${escapeHtml(obj.localEncontrado)}</td>
                                    <td>${obj.status === 'disponivel' ? '📦 Disponível' : '✅ Devolvido'}</td>
                                    <td>
                                        ${obj.status === 'disponivel' ? 
                                            `<button class="admin-devolver" data-id="${obj.id}" style="background:#28a745; padding:5px 10px; border:none; border-radius:20px; color:white; cursor:pointer;">
                                                <i class="fas fa-check"></i> Registrar Devolução
                                            </button>` : 
                                            '<span style="color:#999;">Finalizado</span>'
                                        }
                                    </td>
                                </tr>
                            `).join('')
                        }
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
                    <label for="emailLogin">E-mail</label>
                    <input type="email" id="emailLogin" required placeholder="ana@email.com">
                </div>
                <div class="form-group">
                    <label for="senhaLogin">Senha</label>
                    <input type="password" id="senhaLogin" required placeholder="123456" minlength="4">
                </div>
                <button type="submit" class="btn-destaque" style="width:100%;"><i class="fas fa-sign-in-alt"></i> Entrar</button>
            </form>
            <p style="margin-top:1rem; text-align:center;">Não tem conta? <a href="#" id="linkCadastro">Cadastre-se gratuitamente</a></p>
            <div id="msgLogin"></div>
            <hr style="margin:1rem 0">
            <p style="text-align:center; font-size:0.9rem; color:#666;">
                <strong>Teste:</strong> ana@email.com / 123456 | admin@escola.com / admin123
            </p>
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
                    <label for="nomeCad">Nome completo*</label>
                    <input type="text" id="nomeCad" required placeholder="Seu nome" maxlength="100">
                </div>
                <div class="form-group">
                    <label for="emailCad">E-mail*</label>
                    <input type="email" id="emailCad" required placeholder="email@exemplo.com">
                </div>
                <div class="form-group">
                    <label for="senhaCad">Senha* (mínimo 4 caracteres)</label>
                    <input type="password" id="senhaCad" required placeholder="mínimo 4 caracteres" minlength="4">
                </div>
                <button type="submit" class="btn-sucesso" style="width:100%;"><i class="fas fa-user-plus"></i> Cadastrar</button>
            </form>
            <div id="msgCadastro"></div>
            <p style="margin-top:1rem; text-align:center;">Já tem conta? <a href="#" id="linkLogin">Faça login</a></p>
        </div>
    `;
}

// ========== FUNÇÃO PRINCIPAL DE RENDERIZAÇÃO ==========
function renderPage(page) {
    const app = document.getElementById("appContainer");
    if (!app) return;
    
    switch(page) {
        case "home": app.innerHTML = renderHome(); break;
        case "registrar": app.innerHTML = renderRegistrar(); break;
        case "buscar": app.innerHTML = renderBuscar(); break;
        case "meusItens": app.innerHTML = renderMeusItens(); break;
        case "admin": app.innerHTML = renderAdmin(); break;
        case "login": app.innerHTML = renderLogin(); break;
        case "cadastro": app.innerHTML = renderCadastro(); break;
        default: app.innerHTML = renderHome();
    }

    attachPageEvents(page);
}

// ========== EVENTOS DE NAVEGAÇÃO ==========
function attachNavEvents() {
    const navMap = {
        "nav-home": "home",
        "nav-registrar": "registrar",
        "nav-buscar": "buscar",
        "nav-meus-itens": "meusItens",
        "nav-admin": "admin",
        "nav-login": "login",
        "nav-cadastro": "cadastro",
        "nav-buscar-publico": "buscar"
    };
    
    Object.keys(navMap).forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener("click", (e) => {
                e.preventDefault();
                currentPage = navMap[id];
                renderPage(currentPage);
            });
        }
    });
    
    document.getElementById("logoutBtn")?.addEventListener("click", () => {
        if (confirm("Deseja realmente sair?")) {
            setSessionUser(null);
            currentPage = "home";
            renderPage(currentPage);
        }
    });
}

// ========== EVENTOS ESPECÍFICOS DAS PÁGINAS ==========
function attachPageEvents(page) {
    // Eventos da home
    document.getElementById("hero-cadastrar")?.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = getCurrentUser() ? "registrar" : "cadastro";
        renderPage(currentPage);
    });
    
    document.getElementById("hero-buscar")?.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = "buscar";
        renderPage(currentPage);
    });
    
    document.getElementById("hero-login")?.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = "login";
        renderPage(currentPage);
    });
    
    document.getElementById("empty-cadastrar")?.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = getCurrentUser() ? "registrar" : "cadastro";
        renderPage(currentPage);
    });
    
    document.getElementById("cadastrar-agora")?.addEventListener("click", (e) => {
        e.preventDefault();
        currentPage = "registrar";
        renderPage(currentPage);
    });

    // Eventos de detalhes e reivindicação
    document.querySelectorAll(".btn-detalhe").forEach(btn => {
        btn.addEventListener("click", function(e) {
            verDetalhes(this.dataset.id);
        });
    });
    
    document.querySelectorAll(".btn-reivindicar").forEach(btn => {
        btn.addEventListener("click", function(e) {
            const id = this.dataset.id;
            if (confirm("Confirmar reivindicação? A equipe será notificada.")) {
                updateObjeto(id, { status: "devolvido" });
                showMessage("Objeto marcado como retirado! Obrigado.", "sucesso");
                renderPage(currentPage);
            }
        });
    });

    // Filtro da página de busca
    document.getElementById("btnFiltrar")?.addEventListener("click", function() {
        aplicarFiltros();
    });
    
    document.getElementById("btnLimparFiltros")?.addEventListener("click", function() {
        document.getElementById("filtroTexto").value = "";
        document.getElementById("filtroCategoria").value = "";
        document.getElementById("filtroLocal").value = "";
        aplicarFiltros();
    });
    
    // Enter nos campos de filtro
    document.querySelectorAll("#filtroTexto, #filtroCategoria, #filtroLocal").forEach(el => {
        el?.addEventListener("keyup", function(e) {
            if (e.key === "Enter") {
                aplicarFiltros();
            }
        });
    });

    // Formulário de registro
    document.getElementById("formRegistro")?.addEventListener("submit", function(e) {
        e.preventDefault();
        const user = getCurrentUser();
        if (!user) {
            showMessage("Você precisa estar logado!", "erro");
            return;
        }
        
        const titulo = document.getElementById("titulo").value.trim();
        const categoria = document.getElementById("categoria").value;
        const local = document.getElementById("local").value.trim();
        const data = document.getElementById("data").value;
        const descricao = document.getElementById("descricao").value.trim();
        const fotoUrl = document.getElementById("fotoUrl").value.trim();
        const contato = document.getElementById("contato").value.trim();
        
        if (!titulo || !local || !data || !categoria) {
            showMessage("Preencha todos os campos obrigatórios!", "erro");
            return;
        }
        
        const novoObjeto = {
            titulo,
            categoria,
            localEncontrado: local,
            dataEncontrado: data,
            descricao,
            fotoUrl,
            contato,
            status: "disponivel",
            usuario_id: user.id,
            dataRegistro: new Date().toISOString().slice(0, 10)
        };
        
        addObjeto(novoObjeto);
        showMessage("✅ Objeto cadastrado com sucesso!", "sucesso");
        
        setTimeout(() => {
            currentPage = "buscar";
            renderPage(currentPage);
        }, 1500);
    });

    // Meus Itens
    document.querySelectorAll(".btn-marcar-retirado").forEach(btn => {
        btn.addEventListener("click", function() {
            const id = this.dataset.id;
            if (confirm("Confirmar que este objeto foi devolvido ao dono?")) {
                updateObjeto(id, { status: "devolvido" });
                renderPage("meusItens");
            }
        });
    });
    
    document.querySelectorAll(".btn-editar").forEach(btn => {
        btn.addEventListener("click", function() {
            const id = this.dataset.id;
            const obj = getObjetos().find(o => o.id === id);
            if (!obj) return;
            
            const novoNome = prompt("Digite o novo título do objeto:", obj.titulo);
            if (novoNome && novoNome.trim() !== "") {
                updateObjeto(id, { titulo: novoNome.trim() });
                renderPage("meusItens");
            }
        });
    });
    
    document.querySelectorAll(".btn-excluir").forEach(btn => {
        btn.addEventListener("click", function() {
            const id = this.dataset.id;
            if (confirm("Tem certeza que deseja excluir este objeto? Esta ação não pode ser desfeita.")) {
                deleteObjeto(id);
                renderPage("meusItens");
            }
        });
    });

    // Admin
    document.querySelectorAll(".admin-devolver").forEach(btn => {
        btn.addEventListener("click", function() {
            const id = this.dataset.id;
            if (confirm("Registrar devolução deste objeto?")) {
                updateObjeto(id, { status: "devolvido" });
                renderPage("admin");
            }
        });
    });

    // Login
    document.getElementById("formLogin")?.addEventListener("submit", function(e) {
        e.preventDefault();
        const email = document.getElementById("emailLogin").value.trim();
        const senha = document.getElementById("senhaLogin").value;
        const users = JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];
        const user = users.find(u => u.email === email && u.senha === senha);
        
        if (user) {
            setSessionUser(email);
            currentPage = "home";
            renderPage(currentPage);
        } else {
            showMessage("❌ E-mail ou senha inválidos", "erro", "msgLogin");
        }
    });
    
    document.getElementById("linkCadastro")?.addEventListener("click", function(e) {
        e.preventDefault();
        currentPage = "cadastro";
        renderPage(currentPage);
    });

    // Cadastro
    document.getElementById("formCadastro")?.addEventListener("submit", function(e) {
        e.preventDefault();
        const nome = document.getElementById("nomeCad").value.trim();
        const email = document.getElementById("emailCad").value.trim();
        const senha = document.getElementById("senhaCad").value;
        
        if (!nome || !email || !senha || senha.length < 4) {
            showMessage("Preencha todos os campos. A senha deve ter no mínimo 4 caracteres.", "erro", "msgCadastro");
            return;
        }
        
        let users = JSON.parse(localStorage.getItem(STORAGE_USERS)) || [];
        if (users.find(u => u.email === email)) {
            showMessage("❌ Este e-mail já está cadastrado!", "erro", "msgCadastro");
            return;
        }
        
        const novoUsuario = {
            id: Date.now().toString(),
            nome,
            email,
            senha,
            tipo: "comum"
        };
        users.push(novoUsuario);
        localStorage.setItem(STORAGE_USERS, JSON.stringify(users));
        setSessionUser(email);
        showMessage("✅ Cadastro realizado com sucesso!", "sucesso", "msgCadastro");
        
        setTimeout(() => {
            currentPage = "home";
            renderPage(currentPage);
        }, 1500);
    });
    
    document.getElementById("linkLogin")?.addEventListener("click", function(e) {
        e.preventDefault();
        currentPage = "login";
        renderPage(currentPage);
    });
}

// ========== FUNÇÃO DE FILTRO ==========
function aplicarFiltros() {
    const objetos = getObjetos().filter(o => o.status === "disponivel");
    const texto = document.getElementById("filtroTexto")?.value.toLowerCase().trim() || "";
    const cat = document.getElementById("filtroCategoria")?.value || "";
    const local = document.getElementById("filtroLocal")?.value.toLowerCase().trim() || "";
    
    let filtrados = objetos;
    if (texto) {
        filtrados = filtrados.filter(o => 
            o.titulo.toLowerCase().includes(texto) || 
            (o.descricao && o.descricao.toLowerCase().includes(texto))
        );
    }
    if (cat) filtrados = filtrados.filter(o => o.categoria === cat);
    if (local) filtrados = filtrados.filter(o => o.localEncontrado.toLowerCase().includes(local));
    
    const resultadosDiv = document.getElementById("resultadosBusca");
    if (resultadosDiv) {
        const user = getCurrentUser();
        resultadosDiv.innerHTML = filtrados.length > 0 ?
            filtrados.map(obj => renderCard(obj, !!user, user)).join('') :
            '<p style="text-align:center; padding:2rem 0;">Nenhum objeto encontrado com os filtros selecionados.</p>';
        
        // Reatribuir eventos aos novos elementos
        document.querySelector
