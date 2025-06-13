fetch('http://localhost:3000/receitas')
  .then(response => response.json())
  .then(receitas => {

    //CARROSSEL
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
              <img
                src="${r.images[0].img}"
                class="d-block w-100"
                alt="${r.titulo}">
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

    /*CARDS*/
    if (document.getElementById('container-cards')) {
      const todas = receitas;
      let txtHTMLCards = '';

      for (let i = 0; i < todas.length; i++) {
        const r = todas[i];
        txtHTMLCards += `
          <div class="col">
            <div class="card h-100">
              <a href="detalhes.html?id=${r.id}">
                <img src="${r.images[0].img}"
                     class="card-img-top"
                     alt="${r.titulo}">
              </a>
              <div class="card-body">
                <h5 class="card-title">${r.titulo}</h5>
                <h6 class="card-subtitle mb-2">${r.ocasiao}</h6>
                <p class="card-text">
                  ${r.descricao}
                </p>
                <a href="detalhes.html?id=${r.id}" class="link-light">
                  <button type="button"
                          class="btn"
                          style="background-color:#4c9628;">
                    Ver mais
                  </button>
                </a>
              </div>
            </div>
          </div>
        `;
      }

      document.getElementById('container-cards').innerHTML = txtHTMLCards;
    }
  });

/*Página Detalhes*/
fetch('http://localhost:3000/receitas')
  .then(response => response.json())
  .then(receitas => {
      //id
      const params = new URLSearchParams(window.location.search);
      const id = parseInt(params.get('id'), 10);
      const receita = receitas.find(r => r.id === id);

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
      if (tituloEl) tituloEl.textContent = receita.titulo;

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
