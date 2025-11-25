require('dotenv').config();
const express = require('express');
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

// app.post('/produtos' , (req,res) => {
//     const {}
// })

app.get('/users', (req, res) => {
    return res.json(users);
})

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
})