import express from "express";
import cors from "cors";
import pkg from "pg";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const { Pool } = pkg;

const app = express();
app.use(cors());
app.use(express.json());

// ===== CONFIG BANCO =====
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

// ===== TESTE DE VIDA =====
app.get("/", (req, res) => {
  res.send("Clinicpaytek ON 🚀");
});

// ===== LOGIN REAL =====
app.post("/login", async (req, res) => {
  try {
    const { email, senha } = req.body;

    if (!email || !senha) {
      return res.status(400).json({ error: "Email e senha são obrigatórios" });
    }

    const result = await pool.query(
      "SELECT id, name, email, password_hash, role FROM users WHERE email = $1 AND active = true",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }

    const user = result.rows[0];

    const senhaOk = bcrypt.compareSync(senha, user.password_hash);
    if (!senhaOk) {
      return res.status(401).json({ error: "Usuário ou senha inválidos" });
    }

    const token = jwt.sign(
      {
        id: user.id,
        email: user.email,
        role: user.role
      },
      process.env.JWT_SECRET || "clinicpaytek_secret",
      { expiresIn: "8h" }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro interno no servidor" });
  }
});

// ===== PORTA =====
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Clinicpaytek rodando na porta ${PORT}`);
});
