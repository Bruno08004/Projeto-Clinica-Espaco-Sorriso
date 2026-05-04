// ===== FUNÇÕES DE MODAL =====
function showModal(title, message, type = 'info', buttons = []) {
  const modal = document.getElementById('modal');
  const iconEl = document.getElementById('modal-icon');
  const titleEl = document.getElementById('modal-title');
  const messageEl = document.getElementById('modal-message');
  const buttonsEl = document.getElementById('modal-buttons');

  // Definir ícone e classe baseado no tipo
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ',
    confirm: '?'
  };

  modal.className = 'modal-overlay active modal-' + type;
  iconEl.textContent = icons[type] || icons.info;
  titleEl.textContent = title;
  messageEl.textContent = message;
  
  // Limpar botões antigos
  buttonsEl.innerHTML = '';

  // Adicionar botões
  buttons.forEach(btn => {
    const button = document.createElement('button');
    button.className = 'modal-btn ' + (btn.className || 'modal-btn-secondary');
    button.textContent = btn.text;
    button.onclick = () => {
      btn.action();
      modal.classList.remove('active');
    };
    buttonsEl.appendChild(button);
  });

  // Fechar ao clicar no overlay
  modal.onclick = (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  };
}

function showAlert(title, message, type = 'info') {
  showModal(title, message, type, [
    {
      text: 'OK',
      className: 'modal-btn-primary',
      action: () => {}
    }
  ]);
}

function showConfirm(title, message, onConfirm, onCancel = null) {
  showModal(title, message, 'confirm', [
    {
      text: 'Cancelar',
      className: 'modal-btn-secondary',
      action: onCancel || (() => {})
    },
    {
      text: 'Confirmar',
      className: 'modal-btn-danger',
      action: onConfirm
    }
  ]);
}

// ===== FUNÇÕES PRINCIPAIS =====
function navigate(page) {
  // Adiciona efeito de carregamento
  const cards = document.querySelectorAll('.card');
  cards.forEach(card => {
    if (card.getAttribute('onclick').includes(page)) {
      card.style.opacity = '0.6';
    }
  });

  switch (page) {
    case "pacientes":
      setTimeout(() => {
        window.location.href = "../paciente/Paciente/index.html";
      }, 200);
      break;

    case "dentistas":
      setTimeout(() => {
        window.location.href = "../dentista/Dentista/index.html";
      }, 200);
      break;

    case "atendimentos":
      showAlert('Em Desenvolvimento', '🚧 Gestão de Atendimentos em desenvolvimento', 'warning');
      cards.forEach(card => card.style.opacity = '1');
      break;

    case "pagamentos":
      showAlert('Em Desenvolvimento', '🚧 Gestão de Pagamentos em desenvolvimento', 'warning');
      cards.forEach(card => card.style.opacity = '1');
      break;

    case "comissao":
      showAlert('Em Desenvolvimento', '🚧 Gestão de Comissão em desenvolvimento', 'warning');
      cards.forEach(card => card.style.opacity = '1');
      break;

    case "procedimentos":
      showAlert('Em Desenvolvimento', '🚧 Gestão de Procedimentos em desenvolvimento', 'warning');
      cards.forEach(card => card.style.opacity = '1');
      break;

    default:
      showAlert('Atenção', 'Essa parte ainda não foi criada', 'warning');
      cards.forEach(card => card.style.opacity = '1');
  }
}

function logout() {
  showConfirm(
    'Sair do Sistema',
    'Tem certeza que deseja sair?',
    () => {
      showAlert('Até Logo!', 'Você foi desconectado do sistema.', 'success');
    }
  );
}

function pesquisarTela() {
  const input = document.getElementById('tela-busca-input');
  const termo = input.value.trim().toLowerCase();
  const cards = Array.from(document.querySelectorAll('.card'));

  if (!termo) {
    showAlert('Busca vazia', 'Digite algo para pesquisar', 'warning');
    return;
  }

  const rotas = {
    pacientes: 'pacientes',
    dentistas: 'dentistas',
    atendimentos: 'atendimentos',
    pagamentos: 'pagamentos',
    comissao: 'comissao',
    procedimentos: 'procedimentos'
  };

  for (const chave of Object.keys(rotas)) {
    if (termo.includes(chave)) {
      navigate(rotas[chave]);
      return;
    }
  }

  let encontrou = false;
  cards.forEach(card => {
    const texto = card.textContent.toLowerCase();
    if (texto.includes(termo)) {
      card.style.display = 'flex';
      encontrou = true;
    } else {
      card.style.display = 'none';
    }
  });

  if (!encontrou) {
    showAlert('Nenhum resultado', 'Nenhum item corresponde à busca.', 'warning');
  }
}

// Adiciona transição suave ao carregar a página
document.addEventListener('DOMContentLoaded', () => {
  console.log('Sistema Espaço Sorriso carregado com sucesso! ✅');
  
  // Anima os cards ao carregar
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, index) => {
    card.style.opacity = '0';
    card.style.animation = `fadeIn 0.5s ease ${index * 0.1}s forwards`;
  });
});

// Define a animação de fade-in
const style = document.createElement('style');
style.textContent = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;
document.head.appendChild(style);

const telaBuscaBtn = document.getElementById('tela-busca-btn');
const telaBuscaInput = document.getElementById('tela-busca-input');
if (telaBuscaBtn && telaBuscaInput) {
  telaBuscaBtn.addEventListener('click', pesquisarTela);
  telaBuscaInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      pesquisarTela();
    }
  });
}