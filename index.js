require('dotenv').config();
const express = require('express');
const cors = require('cors'); 
const produtosRoutes = require('./src/routes/produtos');
const authRoutes = require('./src/routes/auth');
const pedidosRoutes = require('./src/routes/pedidos');


const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use(cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use('/auth', authRoutes);
app.use('/api/produtos', produtosRoutes);
app.use('/pedidos', pedidosRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
