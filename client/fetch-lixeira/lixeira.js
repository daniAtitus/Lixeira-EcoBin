  const form = document.getElementById("formCadastroLixeira");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();

    const dados = {
      nome: document.getElementById("nome").value,
      identificador_unico: document.getElementById("identificador_unico").value,
      endereco: document.getElementById("endereco").value,
      latitude: parseFloat(document.getElementById("latitude").value),
      longitude: parseFloat(document.getElementById("longitude").value),
      capacidade_total_estimada: parseFloat(
        document.getElementById("capacidade_total_estimada").value
      ),
      nivel_atual_ocupacao: parseFloat(
        document.getElementById("nivel_atual_ocupacao").value
      ),
      status_tampa: document.getElementById("status_tampa").value,
      status_operacional: document.getElementById("status_operacional").value
    };

    try {
      const response = await fetch("http://localhost:8080/lixeiras", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(dados)
      });

      if (response.ok) {
        alert("Lixeira cadastrada com sucesso!");

        form.reset();
      } else {
        alert("Erro ao cadastrar lixeira");
      }

    } catch (erro) {
      console.error("Erro:", erro);
      alert("Erro na requisição");
    }
  });


async function carregarLixeiras() {
  try {
    const res = await fetch('/lixeiras');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const dados = await res.json();
    renderTabela(dados); 
  } catch (err) {
    
  }
}
carregarLixeiras();
