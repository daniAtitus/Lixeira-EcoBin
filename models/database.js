
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

db.prepare(`
  CREATE TABLE IF NOT EXISTS logs_lixeiras (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    identificador_unico TEXT NOT NULL,
    nome TEXT NOT NULL,
    nivel_atual_ocupacao REAL NOT NULL,
    status_tampa TEXT NOT NULL,
    tempo_aberta_segundos REAL,
    data_hora DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`).run();

const Lixeira = {
  listarLixeiras() {
    return db.prepare(`SELECT * FROM lixeiras`).all();
  },

  listarLixeiraEspecifica(id) {
    return db.prepare(`SELECT * FROM lixeiras WHERE id = ?`).get(id);
  },


  deletarLixeira(id) {
  return db.prepare(`DELETE FROM lixeiras WHERE id = ?`).run(id);
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

const LogLixeira = {
  registrarLog(dados) {
    const { id_lixeira, nome, porcentagem_cheia, tampa_aberta, tempo_aberta_segundos } = dados;
    
    const status_tampa = tampa_aberta ? 'aberta' : 'fechada';

    return db.prepare(`
      INSERT INTO logs_lixeiras (
        identificador_unico, nome, nivel_atual_ocupacao, status_tampa, tempo_aberta_segundos
      ) VALUES (?, ?, ?, ?, ?)
    `).run(id_lixeira, nome, porcentagem_cheia, status_tampa, tempo_aberta_segundos);
  },

  obterTodosLogs() {
    return db.prepare(`SELECT * FROM logs_lixeiras ORDER BY data_hora DESC`).all();
  }
};

module.exports = { User, Lixeira, LogLixeira };