async function buscaLixeiras() {
    const rota = "http://localhost:8080/lixeiras"

    try {
        const response = await fetch(rota)

        if (!response.ok) {
            throw new Error(`Erro HTTP: ${response.status}`)
        }

        const dados = await response.json()
        return dados
    } catch (error) {
        console.error("Erro ao buscar lixeiras:", error)
    }
}

async function init() {
    const teste = await buscaLixeiras()
    console.log(teste)
}
init()