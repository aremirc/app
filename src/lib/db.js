// import { Client } from 'pg';
import { Pool } from 'pg';

// Crea una instancia del cliente para PostgreSQL
// const client = new Client({
//   host: process.env.DB_HOST,
//   port: process.env.DB_PORT,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
// });

// Crea un pool de conexiones
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  max: 20,  // Número máximo de conexiones en el pool
  idleTimeoutMillis: 30000,  // Tiempo de espera antes de cerrar conexiones inactivas
  connectionTimeoutMillis: 2000,  // Tiempo de espera para una nueva conexión
  ssl: {
    rejectUnauthorized: false,  // Configura SSL si es necesario
  },
});

// export default async function connectToDatabase() {
//   if (!client._connected) {
//     await client.connect();
//   }
//   return client;
// }

export default async function connectToDatabase() {
  const client = await pool.connect();
  return client;
}