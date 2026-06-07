import mysql from 'mysql2/promise.js';

const connection = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '*****',
    database: 'clinica_espaco_sorriso'
});

console.log('Conectado ao banco de dados com sucesso!');

export { connection };