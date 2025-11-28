require('dotenv').config();
const express = require('express');
const pool = require('./src/db');
const app = express();
const port = process.env.PORT;

app.use(express.json());

const users = [];

app.get('/', (req, res) => {
    res.send("Hello world!")
})

app.post('/users', (req, res) => {
    const {nome, telefone, email} = req.body;

    if (!nome || !telefone || !email){
        return res.status(400).json({
            error: "Nome, telefone e email são obrigatórios!"
        });
    }

    const newUser = {nome , telefone, email};

    users.push(newUser);

    res.status(201).json({
        message: "Usuário criado com sucesso!",
        data: newUser
    });
})

app.post('/produtos' , async (req,res) => {
    const { nome , preco , descricao} = req.body;

    if (!nome || !preco || !descricao){
        return res.status(400).json({
            error: "Nome e preço são obrigatórios."
        });
    }

    try{
        const query = `
            INSERT INTO produtos (nome, preco, descricao)
            VALUES ($1, $2, $3)
            RETURNING *;
            `;
        const values = [nome,preco,descricao];
        const result = await pool.query(query, values);

        res.status(201).json({
            message: "Produto cadastrado com sucesso!",
            data: result.rows[0]
        });
 
    } catch(error){
        console.error(error);
        res.status(500).json({
            error: "Erro interno no servidor."
        })
    }
})

app.get('/produtos' , async (req,res) => {

    const { nome } = req.query;


    try{
        let result;

        if (nome){
            result = await pool.query(
                'SELECT *  FROM produtos WHERE nome ILIKE $1',
                [`%${nome}%`]
            );
        }

        else {
            result = await pool.query('SELECT * FROM produtos ORDER BY id');
        }

        res.status(200).json(result.rows);

    } catch(error){
        console.error(error);
        res.status(500).json({
            error: "Erro ao buscar produtos."
        })
    }
});

app.put('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, preco, descricao } = req.body;

    try {
        if(!nome){
            return res.status(400).json({
                error: "Nome é obrigatório."
            });
        }
        const sql = `
            UPDATE produtos
            SET nome = $1, preco = $2, descricao = $3
            WHERE id = $4
            RETURNING *;
        `;

        const result = await pool.query(sql, [
            nome,
            preco,
            descricao,
            id
        ]);

        if (result.rowCount === 0){
            return res.status(404).json({
                error: "Produto não encontrado."
            })
        }

        return res.status(200).json({
            message: "Produto atualizado!",
            data: result.rows[0]
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Erro ao atualizar produto."
        });
    }
});

app.patch('/produtos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome, preco, descricao } = req.body;

    try {
        const fields = [];
        const values = [];
        let count = 1;

        if(nome) {
            fields.push(`nome = $${count++}`);
            values.push(nome);
        }

        if(preco) {
            fields.push(`preco = $${count++}`);
            values.push(preco);
        }

        if(descricao) {
            fields.push(`descricao = $${count++}`);
            values.push(descricao);
        }

        if(fields.length === 0) {
            return res.status(400).json({
                error: "Nenhum campo enviado para atualizar."
            });
        }

        const sql = `
            UPDATE produtos
            SET ${fields.join(", ")}
            WHERE id = $${count}
        `;

        values.push(id);

        const result = await pool.query(sql, values);

        if (result.rowCount === 0) {
            return res.status(404).json({ error: "Produto não encontrado."});
        }

        return res.status(200).json({
            message: "Produto atualizado!",
            data: result.rows[0]
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({error: "Erro ao atualizar produto."});
    }
});

app.delete('/produtos/:id', async (req, res) => {
    const { id } = req.params;

    try{
        const result = await pool.query(
            'DELETE FROM produtos WHERE id = $1',
            [id]
        );

        if(result.rowCount === 0) {
            return res.status(404).json({
                error: "Produto não encontrado."
            });
        }

        return res.status(200).json({
            message: "Produto deletado com sucesso."
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Erro ao deletar o produto."
        });
    }
})


app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})