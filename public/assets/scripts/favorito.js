function mostrarFavoritos() {
  const usuarioJSON = sessionStorage.getItem('usuarioCorrente');
  if (!usuarioJSON) {
    alert('Nenhum usuário logado.');
    return;
  }

  const usuario = JSON.parse(usuarioJSON);
  const container = document.getElementById('container-favoritos');
  if (!container) return;


  fetch(`http://localhost:3000/usuarios/${usuario.id}`)
    .then(res => res.ok ? res.json() : Promise.reject('Usuário não encontrado.'))
    .then(usuarioAtualizado => {
      const favoritos = (usuarioAtualizado.favoritos || []).map(Number);

      if (favoritos.length === 0) {
        container.innerHTML = '<p>Você não tem receitas favoritas.</p>';
        return;
      }

      return fetch('http://localhost:3000/receitas')
        .then(res => res.json())
        .then(receitas => {
          const receitasFavoritas = receitas.filter(r =>
            favoritos.includes(Number(r.id))
          );

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
        });
    })
    .catch(erro => {
      console.error('Erro ao buscar favoritos:', erro);
      container.innerHTML = '<p>Erro ao carregar favoritos.</p>';
    });
}

document.addEventListener('DOMContentLoaded', mostrarFavoritos);