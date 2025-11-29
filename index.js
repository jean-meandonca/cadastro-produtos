require('dotenv').config();
const express = require('express');
const produtosRoutes = require('./src/routes/produtos');
const authRoutes = require('./src/routes/auth');


const app = express();
const port = process.env.PORT;

app.use(express.json());

app.use('/auth', authRoutes);
app.use('/api/produtos', produtosRoutes);

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
