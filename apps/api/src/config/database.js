import postgres from "postgres";
import env from "./env.js";
import logger from "../utils/logger.js";

// console.log("DATABASE_URL:", env.DATABASE_URL);

const sql = postgres(env.databaseUrl, {
  max: 20,

  // Close idle connections after 20 seconds.
  // Useful on Render to avoid keeping stale connections while idle.
  idle_timeout: 20,

  // How long to wait when establishing a connection.
  connect_timeout: 10,

  // Optional: helps avoid problems with long-lived/stale connections.
  max_lifetime: 60 * 30, // 30 minutes

  transform: {
    column: {},
  },

  onnotice: (notice) => {
    logger.info(`PostgreSQL notice: ${notice.message}`);
  },

  onclose: (connection) => {
    logger.warn("PostgreSQL connection closed");
  },

  onparameter: (key, value) => {
    logger.debug(`PostgreSQL parameter: ${key}=${value}`);
  },
});

export default sql;

export async function connectDB() {
  try {
    const [result] = await sql`
      SELECT current_database() AS db
    `;

    logger.info(`PostgreSQL connected: ${result.db}`);
    return true;
  } catch (err) {
    logger.error(`PostgreSQL connection check failed: ${err.message}`);

    // DON'T process.exit(1) here.
    // Render may have just restarted service and DB connection may not be immediately available.
    return false;
  }
}

export async function dbHealthCheck() {
  try {
    await sql`SELECT 1`;
    return true;
  } catch (err) {
    logger.error(`Database unavailable: ${err.message}`);
    return false;
  }
}

export async function withDbRetry(fn, retries = 2) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;

      logger.warn(
        `Database query failed (attempt ${attempt + 1}/${retries + 1}): ${err.message}`
      );

      if (attempt < retries) {
        await new Promise((resolve) =>
          setTimeout(resolve, 500 * (attempt + 1))
        );
      }
    }
  }

  throw lastError;
}
