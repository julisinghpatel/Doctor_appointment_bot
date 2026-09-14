import postgres from "postgres";
import env from "./env.js";
import logger from "../utils/logger.js";

console.log("DATABASE_URL:", env.DATABASE_URL);

const sql = postgres(env.databaseUrl, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
  transform: {
    column: {},
  },
});

export default sql;

export async function connectDB() {
  try {
    const [result] = await sql`
      SELECT current_database() AS db
    `;

    logger.info(`PostgreSQL connected: ${result.db}`);
  } catch (err) {
    logger.error(`PostgreSQL connection failed: ${err.message}`);
    process.exit(1);
  }
}
