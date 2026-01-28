import express from "express";
import pkg from "pg";

const { Pool } = pkg;

const app = express();
app.use(express.json());

// 🔐 conexão Neon (via variável do Render)
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// rota de teste
app.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "OK",
      database: "Conectado ao Neon",
      time: result.rows[0]
    });
  } catch (err) {
    res.status(500).json({
      error: "Erro ao conectar no banco",
      details: err.message
    });
  }
});

// ⚠️ ESSENCIAL PARA O RENDER NÃO DAR TIMEOUT
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 Server rodando na porta ${PORT}`);
});
