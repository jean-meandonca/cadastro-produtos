const express = require('express');
const bcrypt = require('bcrypt');
const pool = require('../db');
const router = express.Router();
const jwt = require('jsonwebtoken');

router.post('/register', async (req, res) => {
    const { nome, email, senha } = req.body;

    try {
        if(!nome || !email || !senha){
            return res.status(400).json({
                error: "Dados obrigatórios faltando"
            });
        }

        const existe = await pool.query("SELECT * FROM usuarios WHERE email = $1", [email]);
        if (existe.rowCount > 0) {
            return res.status(409).json({
                error: "Email já registrado."
            });
        }

        const hash = await bcrypt.hash(senha, 10);

        const user = await pool.query(
            "INSERT INTO usuarios (nome, email, senha) VALUES ($1, $2, $3) RETURNING id, nome, email",
            [nome, email, hash]
        );

        res.status(201).json({
            message: "Usuário criado",
            data: user.rows[0]
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "Erro no servidor"
        })
    }
});


router.post('/login', async (req, res) => {
    const { email, senha } = req.body;

    try{
        const result = await pool.query(
            "SELECT * FROM usuarios WHERE email = $1",
            [email]
        );

        if (result.rowCount === 0 ){
            return res.status(404).json({
                error: "Usuários não encontrado"
            });
        }

        const user = result.rows[0];

        const ok = await bcrypt.compare(senha, user.senha);

        if(!ok) {
            return res.status(401).json({ error: "Senha incorreta"});
        }

        const token = jwt.sign(
            {id: user.id, email: user.email },
            process.env.JWT_SECRET,
            {expiresIn: process.env.JWT_EXPIRES}
        );

        res.json({
            message: "Login OK",
            token
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Erro no login"});
    }
})

module.exports = router;