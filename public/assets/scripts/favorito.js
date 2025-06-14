function mostrarFavoritos() {
  const usuarioJSON = sessionStorage.getItem('usuarioCorrente');
  if (!usuarioJSON) {
    alert('Nenhum usuário logado.');
    return;
  }
  const usuario = JSON.parse(usuarioJSON);
  const favoritos = usuario.favoritos || [];
  if (favoritos.length === 0) {
    const container = document.getElementById('container-favoritos');
    if (container) {
      container.innerHTML = '<p>Você não tem receitas favoritas.</p>';
    }
    return;
  }

  fetch('http://localhost:3000/receitas')
    .then(res => res.json())
    .then(receitas => {
      const receitasFavoritas = receitas.filter(r => favoritos.includes(r.id));
      const container = document.getElementById('container-favoritos');
      if (!container) return;

      if (receitasFavoritas.length === 0) {
        container.innerHTML = '<p>Você não tem receitas favoritas.</p>';
        return;
      }

      let html = '';
      receitasFavoritas.forEach(r => {
        html += `
          <div class="col-md-4 mb-4">
            <div class="card h-100">
              <a href="detalhes.html?id=${r.id}">
                <img src="${r.images[0].img}" class="card-img-top" alt="${r.titulo}">
              </a>
              <div class="card-body">
                <h5 class="card-title">${r.titulo}</h5>
                <h6 class="card-subtitle mb-2">${r.ocasiao}</h6>
                <p class="card-text">${r.descricao}</p>
                <a href="detalhes.html?id=${r.id}" class="btn btn-success">Ver detalhes</a>
              </div>
            </div>
          </div>
        `;
      });
      container.innerHTML = html;
    })
    .catch(err => {
      console.error('Erro ao buscar receitas:', err);
    });
}

// Você pode chamar essa função no load da página:
// Exemplo:
document.addEventListener('DOMContentLoaded', () => {
  mostrarFavoritos();
});