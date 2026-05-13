
const Database = require("better-sqlite3");

const db = new Database("database.db");

db.prepare(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    password TEXT NOT NULL
  )
`).run();

db.prepare(`
  CREATE TABLE IF NOT EXISTS lixeiras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nome TEXT NOT NULL,
    identificador_unico TEXT NOT NULL UNIQUE,
    endereco TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    capacidade_total_estimada REAL NOT NULL,
    nivel_atual_ocupacao REAL NOT NULL,
    status_tampa TEXT NOT NULL CHECK(status_tampa IN ('aberta', 'fechada')),
    status_operacional TEXT NOT NULL CHECK(status_operacional IN ('ativa', 'inativa'))
  )
`).run();

const Lixeira = {
  listarLixeiras() {
    return db.prepare(`SELECT * FROM lixeiras`).all();
  },

  listarLixeiraEspecifica(id) {
    return db.prepare(`SELECT * FROM lixeiras WHERE id = ?`).get(id);
  },

  cadastrarLixeiras(dados) {
    const {
      nome, identificador_unico, endereco, latitude, longitude,
      capacidade_total_estimada, nivel_atual_ocupacao, status_tampa, status_operacional
    } = dados;

    return db.prepare(`
      INSERT INTO lixeiras (
        nome, identificador_unico, endereco, latitude, longitude,
        capacidade_total_estimada, nivel_atual_ocupacao, status_tampa, status_operacional
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      nome, identificador_unico, endereco, latitude, longitude,
      capacidade_total_estimada, nivel_atual_ocupacao, status_tampa, status_operacional
    );
  },

  editarDadosLixeira(id, dados) {
    const {
      nome, endereco, latitude, longitude,
      capacidade_total_estimada, nivel_atual_ocupacao, status_tampa, status_operacional
    } = dados;

    return db.prepare(`
      UPDATE lixeiras
      SET nome = ?, endereco = ?, latitude = ?, longitude = ?,
          capacidade_total_estimada = ?, nivel_atual_ocupacao = ?,
          status_tampa = ?, status_operacional = ?
      WHERE id = ?
    `).run(
      nome, endereco, latitude, longitude,
      capacidade_total_estimada, nivel_atual_ocupacao,
      status_tampa, status_operacional, id
    );
  }
};

const User = {
  createUser(email, password) {
    const result = db.prepare(`
      INSERT INTO users (email, password) VALUES (?, ?)
    `).run(email, password);

    return { id: result.lastInsertRowid, email };
  },

  listAllUsers() {
    return db.prepare(`SELECT id, email FROM users`).all();
  }
};

module.exports = { User, Lixeira };