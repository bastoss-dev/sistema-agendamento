const express = require("express");
const cors = require("cors");
const sqlite3 = require("sqlite3").verbose();

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database("database.db");

// Criar tabela
db.run(`
CREATE TABLE IF NOT EXISTS agendamentos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nome TEXT,
  data TEXT,
  hora TEXT
)
`);

// Criar agendamento (com verificação)
app.post("/agendar", (req, res) => {
  const { nome, data, hora } = req.body;

  db.get(
    "SELECT * FROM agendamentos WHERE data = ? AND hora = ?",
    [data, hora],
    (err, row) => {
      if (row) {
        return res.status(400).json({ error: "Horário já ocupado!" });
      }

      db.run(
        "INSERT INTO agendamentos (nome, data, hora) VALUES (?, ?, ?)",
        [nome, data, hora],
        function (err) {
          if (err) return res.status(500).json(err);
          res.json({ id: this.lastID });
        }
      );
    }
  );
});

// Listar agendamentos
app.get("/agendamentos", (req, res) => {
  db.all("SELECT * FROM agendamentos", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// Deletar agendamento
app.delete("/agendamentos/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM agendamentos WHERE id = ?", [id], function(err) {
    if (err) return res.status(500).json(err);
    res.json({ message: "Deletado com sucesso" });
  });
});

app.listen(3000, () => console.log("Servidor rodando na porta 3000"));