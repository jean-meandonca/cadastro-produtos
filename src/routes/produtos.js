const express = require('express');
const pool = require('../db');
const router = express.Router();
const auth = require('../middleware/auth')


router.post('/', auth, async (req, res) => {
    const { nome, preco } = req.body;
    const result = await pool.query(
        "INSERT INTO produtos (nome, preco) VALUES ($1, $2) RETURNING *",
        [nome, preco]
    );
    res.status(201).json(result.rows[0]);
});


router.get('/', async (req, res) => {
    const result = await pool.query("SELECT * FROM produtos");
    res.json(result.rows);
});


router.put('/:id', auth, async (req, res) => {
    const { nome, preco } = req.body;
    const { id } = req.params;

    const result = await pool.query(
        "UPDATE produtos SET nome=$1, preco=$2 WHERE id=$3 RETURNING *",
        [nome, preco, id]
    );

    res.json(result.rows[0]);
});


router.patch('/:id', auth, async (req, res) => {
    const fields = [];
    const values = [];
    let index = 1;

    for (const key in req.body) {
        fields.push(`${key} = $${index}`);
        values.push(req.body[key]);
        index++;
    }

    values.push(req.params.id);

    const query = `
        UPDATE produtos
        SET ${fields.join(', ')}
        WHERE id = $${index}
        RETURNING *
    `;

    const result = await pool.query(query, values);
    res.json(result.rows[0]);
});


router.delete('/:id', auth, async (req, res) => {
    await pool.query("DELETE FROM produtos WHERE id=$1", [req.params.id]);
    res.json({ message: "Produto deletado" });
});

module.exports = router;
