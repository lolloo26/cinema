interface Film {
  id: number;
  title: string;
  genre: string;
  duration: number;
  director: string;
  description: string;
  poster_url: string;
  year: number;
  rating: string;
}

interface Screening {
  id: number;
  starts_at: string;
  hall: {
    id: number;
    name: string;
    capacity: number;
  };
  available_seats: number;
}

const api = "https://its-cinema.vercel.app/api";
const params = new URLSearchParams(window.location.search);
const filmId = Number(params.get("id"));
let screeningId: number | null = null;

async function caricaDettaglio(): Promise<void> {
  const box = document.getElementById("dettaglio-film");
  if (!box) return;

  try {
    const response = await fetch(`${api}/films/${filmId}`);
    if (!response.ok) {
      throw new Error(`Errore ${response.status}`);
    }
    const film: Film = await response.json();

    box.innerHTML = `
      <div class="dettaglio-container">
        <div class="dettaglio-img">
          <img src="${film.poster_url}" alt="${film.title}">
        </div>
        <div class="dettaglio-info">
          <h2>${film.title}</h2>
          <p>${film.genre} • ${film.year} • ${film.rating} • ${film.duration} min</p>
          <p>Regista: ${film.director}</p>
          <p>${film.description}</p>
        </div>
      </div>
    `;
  } catch (error) {
    box.innerHTML = `<p class="error">Impossibile caricare i dettagli del film.</p>`;
    console.error(error);
  }
}

async function caricaSpettacoli(): Promise<void> {
  const box = document.getElementById("lista-spettacoli");
  if (!box) return;

  try {
    const response = await fetch(`${api}/films/${filmId}/screenings`);
    if (!response.ok) {
      throw new Error(`Errore ${response.status}`);
    }
    const screenings: Screening[] = await response.json();

    box.innerHTML = "";

    if (screenings.length === 0) {
      box.innerHTML = `<p>Nessuno spettacolo disponibile per questo film.</p>`;
      return;
    }

    screenings.forEach((s) => {
      const data = new Date(s.starts_at);
      const dataFormattata = data.toLocaleDateString("it-IT");
      const oraFormattata = data.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
      const postiPrenotati = s.hall.capacity - s.available_seats;
      const disponibile = s.available_seats > 0;

      const item = document.createElement("button");
      item.type = "button";
      item.className = "spettacolo-item";
      item.disabled = !disponibile;
      if (!disponibile) item.style.opacity = "0.5";

      item.innerHTML = `
        <div class="spettacolo-item-info">
          <strong>${dataFormattata} • ${oraFormattata}</strong>
          <span>${s.hall.name}</span>
        </div>
        <div class="spettacolo-item-posti">
          ${postiPrenotati}/${s.hall.capacity} posti
        </div>
        <div class="spettacolo-item-btn">
          ${disponibile ? "Prenota" : "Esaurito"}
        </div>
      `;

      if (disponibile) {
        item.addEventListener("click", () => {
          screeningId = s.id;
          apriModale();
        });
      }

      box.appendChild(item);
    });
  } catch (error) {
    box.innerHTML = `<p class="error">Impossibile caricare gli spettacoli.</p>`;
    console.error(error);
  }
}

async function prenota(event: Event): Promise<void> {
  event.preventDefault();
  const nome = (document.getElementById("nome") as HTMLInputElement).value;
  const cognome = (document.getElementById("cognome") as HTMLInputElement).value;
  const email = (document.getElementById("email") as HTMLInputElement).value;
  const messaggio = document.getElementById("booking-message");

  try {
    const response = await fetch(`${api}/bookings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filmId, screeningId, nome, cognome, email }),
    });

    if (messaggio) {
      messaggio.textContent = response.ok ? "Prenotazione confermata!" : "Errore, riprova.";
      messaggio.className = response.ok ? "success" : "error";
    }

    if (response.ok) {
      setTimeout(() => {
        chiudiModale();
        caricaSpettacoli(); 
      }, 1200);
    }
  } catch (error) {
    if (messaggio) {
      messaggio.textContent = "Errore di rete, riprova.";
      messaggio.className = "error";
    }
    console.error(error);
  }
}

function apriModale(): void {
  document.getElementById("modale-prenotazione")?.classList.remove("hidden");
}

function chiudiModale(): void {
  document.getElementById("modale-prenotazione")?.classList.add("hidden");
  const messaggio = document.getElementById("booking-message");
  if (messaggio) messaggio.textContent = "";
  (document.getElementById("form-prenotazione") as HTMLFormElement)?.reset();
}

caricaDettaglio();
caricaSpettacoli();
document.getElementById("form-prenotazione")?.addEventListener("submit", prenota);
document.getElementById("btn-annulla")?.addEventListener("click", chiudiModale);