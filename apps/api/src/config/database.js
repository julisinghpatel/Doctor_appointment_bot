import postgres from "postgres";
import env from "./env.js";
import logger from "../utils/logger.js";

const sql = postgres(env.DATABASE_URL, {
  max: 20,
  idle_timeout: 20,
  connect_timeout: 10,
  transform: {
    column: {}, // keep snake_case from DB as-is
  },
});

export default sql;

export async function connectDB() {
  try {
    const [result] = await sql`SELECT current_database() AS db`;
    logger.info(`PostgreSQL connected: ${result.db}`);
  } catch (err) {
    logger.error("PostgreSQL connection failed:", err.message);
    process.exit(1);
  }
}
