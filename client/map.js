const map = L.map('mapa-central').setView([-28.3875, -53.9147], 15);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap'
}).addTo(map);

async function buscaLixeiras() {
  const rota = "http://localhost:8080/lixeiras";

  const response = await fetch(rota);

  if (!response.ok) {
    throw new Error(`Erro HTTP: ${response.status}`);
  }

  return await response.json();
}

async function init() {
  const lixeiras = await buscaLixeiras();

  lixeiras.forEach(lixeira => {
    const lat = lixeira.latitude;
    const lng = lixeira.longitude;

    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(`
        <b>${lixeira.nome}</b><br>
        Ocupação: ${lixeira.nivel_atual_ocupacao}%<br>
        Tampa: ${lixeira.status_tampa}<br>
        Status: ${lixeira.status_operacional}
      `);
  });
}

init();