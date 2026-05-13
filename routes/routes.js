const express = require('express')
const router = express.Router()
const { User, Lixeira } = require("../models/database")

router.use(express.json())


router.get("/usuarios", async (req, res) => {
  try {
    const usuarios = await User.listAllUsers();
    const seguros = usuarios.map(({ id, email }) => ({ id, email }));
    res.json(seguros);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao listar usuários" });
  }
});

router.post("/usuarios", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ erro: "Email e senha são obrigatórios" });
    }

    const usuario = await User.createUser(email, senha);
    res.status(201).json({ mensagem: "Usuário criado com sucesso", usuario });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao criar usuário" });
  }
});

const CAMPOS_LIXEIRA = [
  'nome', 'identificador_unico', 'endereco',
  'latitude', 'longitude', 'capacidade_total_estimada',
  'nivel_atual_ocupacao', 'status_tampa', 'status_operacional'
];

function validarLixeira(dados) {
  const faltando = CAMPOS_LIXEIRA.filter(campo => dados[campo] === undefined);
  return faltando;
}

router.get("/lixeiras", async (req, res) => {
  try {
    const lixeiras = await Lixeira.listarLixeiras();
    res.json(lixeiras);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao listar lixeiras" });
  }
});

router.get("/lixeiras/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const lixeira = await Lixeira.listarLixeiraEspecifica(id);

    if (!lixeira) {
      return res.status(404).json({ erro: "Lixeira não encontrada" });
    }

    res.json(lixeira);
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao buscar lixeira" });
  }
});

router.post("/lixeiras", async (req, res) => {
  try {
    const faltando = validarLixeira(req.body);
    if (faltando.length > 0) {
      return res.status(400).json({
        erro: "Campos obrigatórios ausentes",
        campos: faltando
      });
    }
    const lixeira = await Lixeira.cadastrarLixeiras(req.body);
    res.status(201).json({ mensagem: "Lixeira cadastrada com sucesso", lixeira });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao cadastrar lixeira" });
  }
});

router.put("/lixeiras/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const existente = await Lixeira.listarLixeiraEspecifica(id);
    if (!existente) {
      return res.status(404).json({ erro: "Lixeira não encontrada" });
    }

    const resultado = await Lixeira.editarDadosLixeira(id, req.body);
    res.json({ mensagem: "Lixeira atualizada com sucesso", resultado });
  } catch (error) {
    console.error(error);
    res.status(500).json({ erro: "Erro ao atualizar lixeira" });
  }
});

module.exports = router;