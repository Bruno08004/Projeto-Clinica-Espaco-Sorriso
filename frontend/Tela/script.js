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
      alert("🚧 Gestão de Atendimentos em desenvolvimento");
      cards.forEach(card => card.style.opacity = '1');
      break;

    case "pagamentos":
      alert("🚧 Gestão de Pagamentos em desenvolvimento");
      cards.forEach(card => card.style.opacity = '1');
      break;

    case "comissao":
      alert("🚧 Gestão de Comissão em desenvolvimento");
      cards.forEach(card => card.style.opacity = '1');
      break;

    case "procedimentos":
      alert("🚧 Gestão de Procedimentos em desenvolvimento");
      cards.forEach(card => card.style.opacity = '1');
      break;

    default:
      alert("Essa parte ainda não foi criada");
      cards.forEach(card => card.style.opacity = '1');
  }
}

function logout() {
  if (confirm("Tem certeza que deseja sair?")) {
    alert("Até logo!");
    // Pode redirecionar para uma página de login ou home
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