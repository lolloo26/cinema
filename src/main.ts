interface Film {
  id: number;
  title: string;
  genre: string;
  duration: number;
  description: string;
  poster_url: string;
  year: number;
  rating: string;
}

const api = "https://its-cinema.vercel.app/api";

async function caricamentoFilm(): Promise<void> {
  const card = document.getElementById("lista-film");
  if (!card) return;

  try {
    const response = await fetch(`${api}/films`);
    if (!response.ok) {
      throw new Error(`Errore ${response.status}`);
    }
    const films: Film[] = await response.json();
    card.innerHTML = "";
    films.forEach((film) => {
      const filmCard = document.createElement("div");
            filmCard.innerHTML = `
        <img src="${film.poster_url}" alt="${film.title}">
        <div class="film-content">
          <h2>${film.title} (${film.year})</h2>
          <p>Genere: ${film.genre}</p>
          <p>Durata: ${film.duration} minuti</p>
          <p>Valutazione: ${film.rating}</p>
          <p>${film.description}</p>
          <a href="/dettaglio.html?id=${film.id}">Scopri di più</a>
        </div>
      `;
      card.appendChild(filmCard);
    });
  } catch (error) {
    card.innerHTML = `<p class="error">Impossibile caricare i film.</p>`;
    console.error(error);
  }
}
caricamentoFilm();