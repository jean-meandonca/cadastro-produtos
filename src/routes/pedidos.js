const express = require('express')
const pool = require('../db')
const auth = require('../middleware/auth');
const router = express.Router();

router.post('/', auth, async (req, res) => {
    const { itens } = req.body;
    const userId = req.user.id;

    if(!itens || itens.length === 0) {
        return res.status(400).json({
            error: "Itens não enviados"
        });
    }

    try {
        await pool.query('BEGIN');

        const pedido = await pool.query("INSERT INTO pedidos (id_usuario, valor_total) VALUES ($1, $2) RETURNING *",
            [userId, 0]
        );

        let total = 0;

        for (const item of itens) {
            const produto = await pool.query(
                "SELECT preco FROM produtos WHERE id=$1",
                [item.id_produto]
            );

            if (produto.rows.length === 0) {
                throw new Error("Produto não existe");
            }

            const preco = produto.rows[0].preco;
            total += preco * item.quantidade;

            await pool.query(
                `INSERT INTO pedidos_itens
                (id_pedido, id_produto, quantidade, valor_unitario)
                VALUES ($1, $2, $3, $4)`,
                [pedido.rows[0].id, item.id_produto, item.quantidade, preco]
            );
        }

        await pool.query(
            "UPDATE pedidos SET valor_total=$1 WHERE id=$2",
            [total, pedido.rows[0].id]
        );

        await pool.query('COMMIT');

        res.status(201).json({
            pedido_id: pedido.rows[0].id,
            valor_total: total
        });

    } catch (error) {
        await pool.query('ROLLBACK');
        console.log(error);
        res.status(500).json({
            error: "Erro ao criar pedido"
        });
    }
})

router.get('/', auth, async (req, res) => {
    const { id } = req.query;

    try {
        if(id){
            const pedido = await pool.query("SELECT * FROM pedidos WHERE id = $1 AND id_usuario = $2",
                [id, req.user.id]
            );

            if (pedido.rowCount === 0) {
                return res.status(404).json({
                    error: "Pedido não encontrado"
                })
            }

            const itens = await pool.query(`
                    SELECT p.nome, pi.quantidade, pi.valor_unitario
                    FROM pedidos_itens pi
                    JOIN produtos p ON p.id = pi.id_produto
                    WHERE pi.id_pedido = $1
                `, [id]);

            return res.json({
                pedido: pedido.rows[0],
                itens: itens.rows
            });
        }

        const result = await pool.query(
            "SELECT * FROM pedidos WHERE id_usuario = $1 ORDER BY id DESC",
            [req.user.id]
        )
        
        res.json(result.rows);

    } catch (err) {
        console.log(err);
        res.status(500).json({
            error: "Erro ao Bucar pedidos"
        })
    }
});

// router.put

router.put('/:id/itens', auth, async (req, res) => {
    const { itens } = req.body;
    const pedidoId = req.params.id;

    if(!itens || itens.length === 0){
        return res.status(400).json({
            error: 'Itens não enviados'
        })
    }

    try {
        await pool.query('BEGIN');

        const pedido = await pool.query("SELECT * FROM pedidos WHERE id = $1 AND id_usuario = $2",
            [pedidoId, req.user.id]
        );

        if(pedido.rowCount === 0) {
            throw new Error("Pedido não encontrado");
        }

        await pool.query(
            "DELETE FROM pedidos_itens WHERE id_pedido=$1",
            [pedidoId]
        );

        let total = 0;

        for (const item of itens) {
            const produto = await pool.query(
                "SELECT preco FROM produtos WHERE id=$1",
                [item.id_produto]
            );

            if (produto.rowCount === 0) {
                throw new Error("Produto inválido");
            }

            const preco = produto.rows[0].preco;
            total += preco * item.quantidade;

            await pool.query(
                `INSERT INTO pedidos_itens
                (id_pedido, id_produto, quantidade, valor_unitario)
                VALUES ($1, $2, $3, $4)`,
                [pedidoId, item.id_produto, item.quantidade, preco]
            );
        }
        await pool.query(
            "UPDATE pedidos SET valor_total=$1 WHERE id=$2",
            [total, pedidoId]
        );

        await pool.query('COMMIT');

        res.json({
            message: "Itens atualizados",
            valor_total: total
        });

    } catch (err) {
        console.log(err);
        await pool.query('ROOLBACK');
        res.status(500).json({
            error: "Erro ao atualizar itens"
        })
    }
    
})

module.exports = router;
