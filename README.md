# Lixeira-EcoBin
# 🗑️ EcoBin Smart — Painel de Monitoramento de Lixeiras Urbanas

Sistema de monitoramento inteligente de lixeiras urbanas com dashboard em tempo real, mapa interativo e cadastro de dispositivos via API REST.

---

## 📋 Visão Geral

O **EcoBin** é uma aplicação web para gerenciamento de lixeiras inteligentes instaladas em áreas urbanas. Através do painel, é possível visualizar o status de ocupação de cada lixeira, sua localização no mapa e cadastrar novos dispositivos no sistema.

---

## 🚀 Funcionalidades

- **Dashboard** — resumo com total de lixeiras, ativas e inativas, além de tabela com nível de ocupação em tempo real
- **Mapa interativo** — visualização das lixeiras georreferenciadas com marcadores coloridos por nível de ocupação (Leaflet.js + OpenStreetMap)
- **Cadastro de lixeira** — formulário para registrar novos dispositivos via `POST /lixeiras`
- **Cadastro de usuário** — formulário para criação de usuários via `POST /usuarios`
- **Recarregamento dinâmico** — botão para atualizar os dados da API sem recarregar a página

---

## 🗂️ Estrutura de Arquivos

```
Lixeira-EcoBin/
├── index.html                  # Painel principal (frontend completo)
├── script-buttons/
│   └── script.js               # Scripts auxiliares de navegação (legado)
├── map.js                      # Lógica do mapa (legado — integrada ao index.html)
|──login.html
├── fetch-lixeira/
│   └── lixeira.js              # Fetch de lixeiras (legado — integrado ao index.html)
└── README.md
```

> **Nota:** A lógica de navegação, mapa e fetch da API foi consolidada diretamente no `index.html` para simplificar a integração.

---

## 🔌 API — Endpoints Utilizados

O painel consome uma API REST. Certifique-se de que o servidor esteja rodando e acessível pelo frontend.

### `GET /lixeiras`

Retorna a lista de todas as lixeiras cadastradas.

**Resposta esperada:**
```json
[
  {
    "id": 1,
    "nome": "Lixeira Praça Central",
    "identificador_unico": "LX-001",
    "endereco": "Praça Marechal Floriano, Centro, Passo Fundo - RS",
    "latitude": -28.2622,
    "longitude": -52.4069,
    "capacidade_total_estimada": 120,
    "nivel_atual_ocupacao": 35,
    "status_tampa": "fechada",
    "status_operacional": "ativa"
  }
]
```

**Campos:**

| Campo | Tipo | Descrição |
|---|---|---|
| `id` | `integer` | Identificador interno |
| `nome` | `string` | Nome descritivo da lixeira |
| `identificador_unico` | `string` | Código único do dispositivo (ex: `LX-001`) |
| `endereco` | `string` | Endereço completo |
| `latitude` | `float` | Coordenada geográfica |
| `longitude` | `float` | Coordenada geográfica |
| `capacidade_total_estimada` | `float` | Capacidade máxima em litros |
| `nivel_atual_ocupacao` | `float` | Nível atual em litros |
| `status_tampa` | `string` | `"aberta"` ou `"fechada"` |
| `status_operacional` | `string` | `"ativa"` ou `"inativa"` |

---

### `POST /lixeiras`

Cadastra uma nova lixeira. Dados enviados via formulário HTML (`application/x-www-form-urlencoded`).

**Campos do formulário:** mesmos campos do GET acima, exceto `id`.

---

### `POST /usuarios`

Cadastra um novo usuário no sistema.

**Campos:**

| Campo | Tipo |
|---|---|
| `email` | `string` |
| `senha` | `string` |

---

## 🎨 Interface

O painel é um arquivo HTML único, sem dependências de framework. Utiliza:

| Tecnologia | Uso |
|---|---|
| HTML/CSS/JS puro | Estrutura, estilos e lógica do painel |
| [Leaflet.js 1.9.4](https://leafletjs.com/) | Mapa interativo |
| [OpenStreetMap](https://www.openstreetmap.org/) | Tiles do mapa |
| `fetch()` | Consumo da API REST |

### Cores dos marcadores no mapa e barra de nível

| Cor | Faixa de ocupação |
|---|---|
| 🟢 Verde | 0% – 49% |
| 🟡 Amarelo | 50% – 79% |
| 🔴 Vermelho | 80% – 100% |

O nível percentual é calculado como:

```
nível (%) = (nivel_atual_ocupacao / capacidade_total_estimada) × 100
```

---

## ⚙️ Como Executar

### Pré-requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Servidor backend rodando com os endpoints `/lixeiras` e `/usuarios`

### Desenvolvimento local

Se o backend rodar em uma porta diferente (ex: `http://localhost:3000`), configure um proxy no servidor de desenvolvimento ou ajuste as URLs de fetch no `index.html`:

```js
const res = await fetch('/lixeiras');

const res = await fetch('http://localhost:3000/lixeiras');
```
### Servir o arquivo localmente

```bash
# Node.js
node index.js
```

Acesse: `http://localhost:8080`

## 📌 Observações

- O mapa é inicializado apenas quando o usuário acessa a aba **Mapa** (lazy initialization), evitando erros de renderização do Leaflet em elementos ocultos.
- Os dados do dashboard e do mapa são buscados de forma independente — o mapa faz sua própria requisição ao ser aberto pela primeira vez.
- Os formulários de cadastro usam `method="POST"` e `action` apontando para o backend; não há interceptação via JavaScript por padrão.