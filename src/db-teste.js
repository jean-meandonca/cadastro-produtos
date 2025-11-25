const pool = require("./db");

async function test(){
    try {
        const result = await pool.query("SELECT NOW()");
        console.log(result.rows);
    } catch(error){
        console.log("Erro  conectando ao banco:", error);
    }
}

test();