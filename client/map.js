const map = L.map('mapa-central');

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

async function buscaMapa() {
  try {
    const response = await fetch("http://localhost:8080/lixeiras");

    if (!response.ok) {
      throw new Error(`Response Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error(error);
    return [];
  }
}

async function exibeLixeiras() {
  const lixeiras = await buscaMapa();

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
      <b>Capacidade:</b> ${lixeira.capacidade_total_estimada}<br>
      <b>Ocupação atual:</b> ${lixeira.nivel_atual_ocupacao}%
    `;

    L.marker([lat, lng])
      .addTo(map)
      .bindPopup(popup);
  });

  if (bounds.length > 0) {
    map.fitBounds(bounds);
  } else {
    map.setView([-28.223, -53.501], 13);
  }
}

exibeLixeiras();