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

  const navCadastro = document.getElementById('cadastro');
  if (resultadoLogin && usuarioLogadoJSON) {
    const usuario = JSON.parse(usuarioLogadoJSON);
    if (usuario.admin === true && navCadastro) {
      navCadastro.style.display = 'block';
      cadastro();
    } else if (navCadastro) {
      navCadastro.style.display = 'none';
    }
  } else if (navCadastro) {
    navCadastro.style.display = 'none';
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

    //Função para montar cards
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

      // Pega o usuário logado e verifica se ele tem favoritos
      const resultadoLogin = localStorage.getItem('resultadoLogin') === 'true';
      const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');

      let usuarioLogado = null;
      let favoritos = [];

      if (resultadoLogin && usuarioCorrenteJSON) {
        usuarioLogado = JSON.parse(usuarioCorrenteJSON);
      }

      fetch(`http://localhost:3000/usuarios/${usuarioLogado?.id}`)
        .then(res => res.ok ? res.json() : null)
        .then(usuario => {
          if (usuario && Array.isArray(usuario.favoritos)) {
            favoritos = usuario.favoritos.map(Number);
          }

          let html = '';
          lista.forEach(r => {
            const favoritado = favoritos.includes(Number(r.id));
            const iconeFavorito = favoritado
              ? '<i class="bi bi-heart-fill favorito" style="color:red"></i>'
              : '<i class="bi bi-heart favorito"></i>';

            html += `
        <div class="col">
          <div class="card h-100">
            <a href="detalhes.html?id=${r.id}">
              <img src="${r.images?.[0]?.img}" class="card-img-top" alt="${r.titulo}">
            </a>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-start">
                <h5 class="card-title">${r.titulo}</h5>
                <button class="btn btn-outline-danger btn-fav" data-id="${r.id}" title="Favoritar">${iconeFavorito}</button>
              </div>
              <h6 class="card-subtitle mb-2">${r.ocasiao}</h6>
              <p class="card-text">${r.descricao}</p>
              <a href="detalhes.html?id=${r.id}" class="link-light">
                <button type="button" class="btn" style="background-color:#4c9628;">Ver mais</button>
              </a>
            </div>
          </div>
        </div>
        `;
          });

          container.innerHTML = html;

          //favoritar
          document.querySelectorAll('.btn-fav').forEach(botao => {
            botao.addEventListener('click', () => {
              if (!usuarioLogado) {
                alert('Você precisa estar logado para favoritar.');
                return;
              }

              const idReceita = Number(botao.getAttribute('data-id'));
              const jaFavoritado = favoritos.includes(idReceita);

              let novosFavoritos = jaFavoritado
                ? favoritos.filter(id => id !== idReceita)
                : [...new Set([...favoritos, idReceita])];

              // Atualiza servidor
              fetch(`http://localhost:3000/usuarios/${usuarioLogado.id}`, {
                method: 'PATCH',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ favoritos: novosFavoritos })
              })
                .then(() => {
                  favoritos = novosFavoritos;
                  const icone = botao.querySelector('i');
                  icone.className = favoritos.includes(idReceita)
                    ? 'bi bi-heart-fill favorito'
                    : 'bi bi-heart favorito';
                  if (favoritos.includes(idReceita)) {
                    icone.style.color = 'red';
                  } else {
                    icone.style.color = '';
                  }
                });
            });
          });

        });
    }

    // Exibir cards ao carregar
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

      const btnFavorito = document.createElement('button');
      btnFavorito.id = 'btn-favorito';
      btnFavorito.className = 'btn btn-outline-danger ms-3 col-md-1 col-sm-12';
      btnFavorito.innerHTML = '<i class="bi bi-heart"></i>';
      tituloEl.parentNode.insertBefore(btnFavorito, tituloEl.nextSibling);
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
    //favoritos detalhes
    const btnFavorito = document.getElementById('btn-favorito');
    const usuarioCorrenteJSON = sessionStorage.getItem('usuarioCorrente');
    const resultadoLogin = localStorage.getItem('resultadoLogin') === 'true';

    if (btnFavorito && resultadoLogin && usuarioCorrenteJSON) {
      const usuarioCorrente = JSON.parse(usuarioCorrenteJSON);


      fetch(`http://localhost:3000/usuarios/${usuarioCorrente.id}`)
        .then(res => res.json())
        .then(usuario => {
          let jaFavoritado = usuario.favoritos.includes(receita.id);


          btnFavorito.innerHTML = jaFavoritado
            ? '<i class="bi bi-heart-fill"></i>'
            : '<i class="bi bi-heart"></i>';


          btnFavorito.addEventListener('click', () => {
            let novosFavoritos;

            if (jaFavoritado) {
              novosFavoritos = usuario.favoritos
                .map(Number)
                .filter(favId => favId !== Number(receita.id));
            } else {
              novosFavoritos = [...new Set([
                ...usuario.favoritos.map(Number),
                Number(receita.id)
              ])];
            }

            fetch(`http://localhost:3000/usuarios/${usuario.id}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ favoritos: novosFavoritos })
            })
              .then(() => {
                jaFavoritado = !jaFavoritado;
                btnFavorito.innerHTML = jaFavoritado
                  ? '<i class="bi bi-heart-fill"></i>'
                  : '<i class="bi bi-heart"></i>';
              });
          });
        });
    } else if (btnFavorito) {

      btnFavorito.disabled = true;
      btnFavorito.title = "Faça login para favoritar";
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



//Tela de cadastros de receitas
function cadastro() {
  fetch('http://localhost:3000/receitas').then(res => res.json()) //tabela
    .then(listaReceitas => {
      console.log('Dados requisitados com sucesso!');
      console.log(listaReceitas);
      txtHTMLTabela = '';
      for (let i = 0; i < listaReceitas.length; i++) {
        let receita = listaReceitas[i];
        txtHTMLTabela += `<tr>
      <td>${receita.titulo}</td>
      <td>${receita.descricao}</td>
      <td>${receita.ingredientes}</td>
      <td>${receita.preparo}</td>
      <td>${receita.ocasiao}</td>
      <td>${receita.prepTime}</td>
      <td>${receita.dificuldade}</td>
    </tr>`
      }
      document.getElementById('info').innerHTML = txtHTMLTabela;

      //para selecionar cada linha da tabela e preencher o formulário
      let receitaSelecionadaID = null;

      const linhas = document.querySelectorAll('#info tr');
      linhas.forEach((linha, index) => {
        linha.addEventListener('click', () => {
          const coluna = linha.querySelectorAll('td');
          let receita = listaReceitas[index];
          receitaSelecionadaID = receita.id;
          document.getElementById('titulo').value = coluna[0].textContent;
          document.getElementById('descricao').value = coluna[1].textContent;
          document.getElementById('ingredientes').value = coluna[2].textContent;
          document.getElementById('preparo').value = coluna[3].textContent;
          document.getElementById('ocasiao').value = coluna[4].textContent;
          document.getElementById('tempo').value = coluna[5].textContent;
          document.getElementById('dificuldade').value = coluna[6].textContent;
        });
      });

      //adicionar dados
      document.getElementById('postar').addEventListener('click', adicionarReceita);
      //atualizar dados
      document.getElementById('atualizar').addEventListener('click', () => {
        atualizarReceita(receitaSelecionadaID);
      });
      //apagar dados
      document.getElementById('deletar').addEventListener('click', () => {
        deletarReceita(receitaSelecionadaID);
      });
    });

  function adicionarReceita() { //adiciona receita
    console.log('Adquirindo dados do formulário...');

    const titulo = document.getElementById('titulo').value;
    const descricao = document.getElementById('descricao').value;
    const ingrediente = document.getElementById('ingredientes').value;
    const modoPreparo = document.getElementById('preparo').value;
    const ocasiao = document.getElementById('ocasiao').value;
    const prepTime = document.getElementById('tempo').value;
    const dificuldade = document.getElementById('dificuldade').value;

    const novaReceita = {
      titulo: titulo,
      descricao: descricao,
      ingredientes: ingrediente,
      preparo: modoPreparo,
      ocasiao: ocasiao,
      prepTime: prepTime,
      dificuldade: dificuldade
    };

    fetch('http://localhost:3000/receitas', {
      method: 'POST',
      headers: {
        'Content-type': 'application/json'
      },
      body: JSON.stringify(novaReceita)
    })
      .then(res => {
        if (res.ok) {
          console.log('Receita enviada!');
          alert('Receita foi enviada com sucesso!');
          document.querySelector('form').reset();
        }
        else {
          alert('Erro ao enviar.');
        }
        return res.json();
      })
      .then(receitas => {
        console.log('Resposta ao servidor:', receitas);
      })
      .catch(erro => {
        console.log('Erro:', erro);
      })
  }

  function atualizarReceita(id) { //atualiza receita
    const atualizada = {
      titulo: document.getElementById('titulo').value,
      descricao: document.getElementById('descricao').value,
      ingredientes: document.getElementById('ingredientes').value,
      preparo: document.getElementById('preparo').value,
      prepTime: document.getElementById('tempo').value,
      ocasiao: document.getElementById('ocasiao').value,
      dificuldade: document.getElementById('dificuldade').value
    };
    fetch(`http://localhost:3000/receitas/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(atualizada)
    })
      .then(res => {
        if (res.ok) {
          console.log('Receita atualizada!');
          alert('Receita atualizada!');
          window.location.reload();
        }
        else {
          alert('Erro ao atualizar a receita!');
        }
      })
      .catch(erro => {
        console.error(erro);
        alert('Erro', erro);
      });
  }

  function deletarReceita(id) { //deletar receita
    fetch(`http://localhost:3000/receitas/${id}`, {
      method: 'DELETE'
    })
      .then(res => {
        if (res.ok) {
          console.log('Receita deletada!');
          alert('Receita deletada!');
          window.location.reload();
        }
        else {
          alert('Erro ao deletar a receita!');
        }
      })
      .catch(erro => {
        console.error(erro);
        alert('Erro ao deletar');
      });
  }
}
