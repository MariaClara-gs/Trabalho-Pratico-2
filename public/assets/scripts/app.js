document.addEventListener('DOMContentLoaded', () => {
  const resultadoLogin = localStorage.getItem('resultadoLogin') === 'true';
  const usuarioLogadoJSON = sessionStorage.getItem('usuarioCorrente');
  const logEl = document.getElementById('log');

  if (logEl) {
    if (resultadoLogin) {
      logEl.textContent = 'Logout';
      logEl.href = '';
      logEl.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('resultadoLogin');
        sessionStorage.removeItem('usuarioCorrente');
        window.location.href = 'index.html';
      })
    } else {
      logEl.textContent = 'Login';
      logEl.href = 'login.html';
    }
  }
});

fetch('http://localhost:3000/receitas')
  .then(response => response.json())
  .then(receitas => {
    // CARROSSEL
    if (document.getElementById('ads')) {
      const receitasDestaque = receitas.slice(0, 3);

      let indicadoresHTML = '';
      receitasDestaque.forEach((receita, i) => {
        indicadoresHTML += `
          <button
            type="button"
            data-bs-target="#ads"
            data-bs-slide-to="${i}"
            ${i === 0 ? 'class="active" aria-current="true"' : ''}
            aria-label="Slide ${i + 1}">
          </button>
        `;
      });
      document.querySelector('#ads .carousel-indicators').innerHTML = indicadoresHTML;

      let innerHTML = '';
      receitasDestaque.forEach((r, i) => {
        innerHTML += `
          <div class="carousel-item ${i === 0 ? 'active' : ''}" data-bs-interval="3000">
            <a href="detalhes.html?id=${r.id}">
              <img src="${r.images[0].img}" class="d-block w-100" alt="${r.titulo}">
              <div class="carousel-caption d-none d-md-block">
                <h5>${r.titulo}</h5>
                <p>${r.descricao}</p>
              </div>
            </a>
          </div>
        `;
      });
      document.querySelector('#ads .carousel-inner').innerHTML = innerHTML;
    }

    const ul = document.getElementById('listaReceitas');
    receitas.forEach((item) => {
      const li = document.createElement('li');
      li.innerHTML = `<a href="detalhes.html?id=${item.id}"><span class="item-name">${item.titulo}</span></a>`;
      ul.appendChild(li);
    });

    // Função para montar os cards
    function gerarCards(lista) {
  const container = document.getElementById('container-cards');
  if (!container) return;

  if (lista.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center mt-4 erro-card">
        <h4>Nenhuma receita encontrada.</h4>
        <p>Tente outra palavra ou <a href="index.html" class="btn btn-success mt-2 voltar">volte à página inicial</a>.</p>
      </div>
    `;
    return;
  }

  const resultadoLogin = localStorage.getItem('resultadoLogin') === 'true';
  let favoritosUsuario = [];
  
  if (resultadoLogin) {
    const usuario = JSON.parse(sessionStorage.getItem('usuarioCorrente'));
    if (usuario && usuario.favoritos) {
      favoritosUsuario = usuario.favoritos;
    }
  }

  let html = '';
  lista.forEach(r => {
    const estaFavorito = favoritosUsuario.includes(r.id);
    html += `
      <div class="col">
        <div class="card h-100">
          <a href="detalhes.html?id=${r.id}">
            <img src="${r.images[0].img}" class="card-img-top" alt="${r.titulo}">
          </a>
          <div class="card-body">
            <h5 class="card-title">${r.titulo}</h5>
            <h6 class="card-subtitle mb-2">${r.ocasiao}</h6>
            <p class="card-text">${r.descricao}</p>
            <a href="detalhes.html?id=${r.id}" class="link-light">
              <button type="button" class="btn" style="background-color:#4c9628;">Ver mais</button>
            </a>
            ${resultadoLogin ? `
              <button class="btn btn-outline-danger mt-2 btn-favoritar" data-id="${r.id}">
                <i class="bi ${estaFavorito ? 'bi-heart-fill' : 'bi-heart'}"></i>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  if (resultadoLogin) {
    document.querySelectorAll('.btn-favoritar').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = parseInt(btn.getAttribute('data-id'));
        favoritarReceita(id);
        // Alterar o ícone no clique, enquanto aguarda o fetch:
        const icon = btn.querySelector('i');
        if (icon.classList.contains('bi-heart-fill')) {
          icon.classList.remove('bi-heart-fill');
          icon.classList.add('bi-heart');
        } else {
          icon.classList.remove('bi-heart');
          icon.classList.add('bi-heart-fill');
        }
      });
    });
  }
}


    // Exibir todos ao carregar
    gerarCards(receitas);

    // Quando clicar no botão de pesquisa
    const btnPesquisar = document.getElementById('btn-pesquisar');
    const inputPesquisa = document.getElementById('barra-pesquisa');

    btnPesquisar.addEventListener('click', () => {
      const termo = inputPesquisa.value.trim().toLowerCase();

      if (termo === '') {
        gerarCards(receitas); // Mostra todas
      } else {
        const filtradas = receitas.filter(r =>
          r.titulo.toLowerCase().includes(termo)
        );
        gerarCards(filtradas);
      }
    });
  });

/*Página Detalhes*/
fetch('http://localhost:3000/receitas')
  .then(response => response.json())
  .then(receitas => {
    //id
    const params = new URLSearchParams(window.location.search);
    const id = parseInt(params.get('id'), 10);
    const receita = receitas.find(r => {
      console.log('Comparando:', r.id, '===', id);
      return String(r.id) === String(id);
    });

    if (!receita) {
      const main = document.getElementById('main-detalhes');
      main.innerHTML = `
        <div class="text-center" style="margin-top: 2rem;">
          <h3>Receita não encontrada!</h3>
          <p>Desculpe, não foi possível encontrar a receita solicitada.</p>
          <a href="index.html" class="btn btn-success">Voltar para a página inicial</a>
        </div>
      `;
      return; // Para o restante da execução
    }

    //título
    const tituloEl = document.querySelector('main .display-5.text-center');

    if (tituloEl) {
      tituloEl.textContent = receita.titulo;
      const resultadoLogin = localStorage.getItem('resultadoLogin') === 'true';

      if (resultadoLogin) {
        const usuario = JSON.parse(sessionStorage.getItem('usuarioCorrente'));
        let estaFavorito = false;

        if (usuario && usuario.favoritos) {
          estaFavorito = usuario.favoritos.includes(receita.id);
        }

        const btnFavorito = document.createElement('button');
        btnFavorito.className = 'btn btn-outline-danger ms-3 btn-favoritar';
        // Ícone preenchido ou vazio conforme favorito
        btnFavorito.innerHTML = `<i class="bi ${estaFavorito ? 'bi-heart-fill' : 'bi-heart'}"></i>`;
        btnFavorito.setAttribute('data-id', receita.id);

        tituloEl.appendChild(btnFavorito);

        btnFavorito.addEventListener('click', () => {
          favoritarReceita(receita.id);
          // Toggle visual imediato do coração:
          const icon = btnFavorito.querySelector('i');
          if (icon.classList.contains('bi-heart-fill')) {
            icon.classList.remove('bi-heart-fill');
            icon.classList.add('bi-heart');
          } else {
            icon.classList.remove('bi-heart');
            icon.classList.add('bi-heart-fill');
          }
        });
      }
    }

    //imagem da receita
    const imgPrincipal = document.querySelector('.div-img .img-conteudo');
    if (imgPrincipal) {
      imgPrincipal.src = receita.images[0].img;
      imgPrincipal.alt = receita.titulo;
    }

    //dica de ocasião
    const subtituloEl = document.querySelector('.titulo-2');
    if (subtituloEl) subtituloEl.textContent = receita.ocasiao;

    //descrição
    const descEl = document.querySelector('.texto-layout');
    if (descEl) descEl.textContent = receita.descricao;

    //tempo de preparo
    const tempoP = document.querySelector('.fa-clock-o')
      ?.closest('.card-body')
      ?.querySelector('.texto-card');
    if (tempoP) tempoP.textContent = receita.prepTime;

    //nível de dificuldade da receita
    const diffP = document.querySelector('.fa-cutlery')
      ?.closest('.card-body')
      ?.querySelector('.texto-card');
    if (diffP) diffP.textContent = receita.dificuldade;

    //ingredientes
    const ulIng = document.getElementById('ingredientes');
    if (ulIng) {
      ulIng.innerHTML = '';
      receita.ingredientes.forEach(item => {
        const li = document.createElement('li');
        li.className = 'col-md-6';
        li.innerHTML = `<p>${item}</p>`;
        ulIng.appendChild(li);
      });
    }

    //modo de preparo
    const olPrep = document.getElementById('modo-de-preparo');
    if (olPrep) {
      olPrep.innerHTML = '';
      receita.preparo.forEach(step => {
        const li = document.createElement('li');
        li.textContent = step;
        olPrep.appendChild(li);
      });
    }

    //fotos da receita
    const fotosContainer = document.querySelector('.fotos-item');
    if (fotosContainer) {
      fotosContainer.innerHTML = '';
      receita.images.forEach(imgObj => {
        const div = document.createElement('div');
        div.className = 'col-md-3 text-center';
        div.innerHTML = `
            <img
              src="${imgObj.img}"
              class="img-thumbnail img-fluid"
              alt="${imgObj.legenda}"
              style="height: 300px; width: 200px;">
            <p class="text-break mt-2">${imgObj.legenda}</p>
          `;
        fotosContainer.appendChild(div);
      });
    }
  });

//filtrar por pesquisa
function filtrarPesquisa() {
  var input = document.getElementById('barra-pesquisa');
  var filter = input.value.toUpperCase();
  var ul = document.getElementById('listaReceitas');
  var li = ul.getElementsByTagName('li');
  var count = 0;
  var span;

  if (filter === "") {
    ul.style.display = "none";
    return;
  }


  for (let i = 0; i < li.length; i++) {
    var a = li[i].getElementsByTagName('a')[0];
    var txtValue = a.textContent || a.innerText;
    if (txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = '';
      count++;
      span = li[i].querySelector(".item-name");
      if (span) {
        span.innerHTML = txtValue.replace(new RegExp(filter, 'gi'), (match) => {
          return "<strong>" + match + "</strong>";
        });
      } else {
        li[i].style.display = "none";
      }
    } else {
      li[i].style.display = 'none';
    }
  }

  if (count === 0) {
    ul.style.display = 'none';
  } else {
    ul.style.display = 'block';
  }
}

//Tela da funcionalidade com Mapbox

window.onload = () => {
  fetch('http://localhost:3000/receitas').then(res => res.json())
    .then(receitas => {
      //Mapbox
      montarMapa(receitas);
    });
}

//contrução do mapa
function montarMapa(receitas) {
  const centralLatLong = [-51.9253, -14.2350];
  let map;
  mapboxgl.accessToken = 'pk.eyJ1IjoibWFyaWEtY2xhcjQiLCJhIjoiY21iY2RtbjF1MXRvbzJycTU2bHg2aHNjcCJ9.O-GR7NBIwc5m8XZmZR2g3w';
  map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/maria-clar4/cmbcggkcy003b01s1e1zihwh0',
    center: centralLatLong,
    zoom: 3
  });

  receitas.forEach((uni) => {
    let popup = new mapboxgl.Popup({ offset: 25 })
      .setHTML(`<h3><a href="${uni.url}" target="_blank">${uni.titulo}</a></h3><br>${uni.descricao}<br>${uni.cidade} <br> ${uni.pais}`);
    const marker = new mapboxgl.Marker({ color: uni.cor })
      .setLngLat(uni.latlong)
      .setPopup(popup)
      .addTo(map);
  });
}

//favoritos
function favoritarReceita(idReceita) {
  const usuario = JSON.parse(sessionStorage.getItem('usuarioCorrente'));
  if (!usuario || !usuario.id) {
    alert('Você precisa estar logado para favoritar receitas.');
    return;
  }

  fetch(`http://localhost:3000/usuarios/${usuario.id}`)
    .then(res => {
      if (!res.ok) {
        throw new Error('Erro ao buscar dados do usuário.');
      }
      return res.json();
    })
    .then(usuarioCompleto => {
      console.log('Usuário do servidor:', usuarioCompleto);

      const favoritosAtuais = usuarioCompleto.favoritos || [];

      const jaFavoritado = favoritosAtuais.includes(idReceita);

      let novosFavoritos;
      if (jaFavoritado) {
        novosFavoritos = favoritosAtuais.filter(id => id !== idReceita);
      } else {
        novosFavoritos = [...favoritosAtuais, idReceita];
      }

      const usuarioAtualizado = {
        ...usuarioCompleto,
        favoritos: novosFavoritos
      };

      fetch(`http://localhost:3000/usuarios/${usuario.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(usuarioAtualizado)
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Erro ao atualizar favoritos.');
          }
          return response.json();
        })
        .then(() => {
          alert(jaFavoritado
            ? 'Receita removida dos favoritos.'
            : 'Receita adicionada aos favoritos.');
        })
        .catch(error => {
          console.error('Erro na operação de favoritar:', error);
          alert('Ocorreu um erro ao processar sua solicitação de favoritos.');
        });
    })
    .catch(error => {
      console.error('Erro ao buscar usuário:', error);
      alert('Ocorreu um erro ao carregar os dados do usuário.');
    });
}

