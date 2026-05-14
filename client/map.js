let mapaInstance = null;

function iniciarMapa() {
  mapaIniciado = true;

  mapaInstance = L.map('mapa-central');

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(mapaInstance);

  exibeLixeiras();
}

async function exibeLixeiras() {
  try {
    const res = await fetch('/lixeiras');
    if (!res.ok) throw new Error(`Erro HTTP ${res.status}`);
    const lixeiras = await res.json();

    // Limpa marcadores anteriores
    marcadores.forEach(m => mapaInstance.removeLayer(m));
    marcadores = [];

    const bounds = [];

    lixeiras.forEach(lixeira => {
      const lat = Number(lixeira.latitude);
      const lng = Number(lixeira.longitude);
      if (isNaN(lat) || isNaN(lng)) return;

      bounds.push([lat, lng]);

      const popup = `
        <b>${lixeira.nome}</b><br>
        <b>ID:</b> ${lixeira.identificador_unico}<br>
        <b>Status tampa:</b> ${lixeira.status_tampa}<br>
        <b>Status operacional:</b> ${lixeira.status_operacional}<br>
        <b>Capacidade:</b> ${lixeira.capacidade_total_estimada} L<br>
        <b>Ocupação atual:</b> ${lixeira.nivel_atual_ocupacao} L
      `;

      const marker = L.marker([lat, lng])
        .addTo(mapaInstance)
        .bindPopup(popup);

      marcadores.push(marker);
    });

    if (bounds.length > 0) {
      mapaInstance.fitBounds(bounds);
    } else {
      mapaInstance.setView([-28.223, -53.501], 13);
    }

  } catch (err) {
    console.error('Erro ao carregar lixeiras no mapa:', err);
  }
}