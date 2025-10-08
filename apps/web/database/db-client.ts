import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (err) => {
  if (err) {
    console.log("db connection error occured: ", err);
    process.exit(-1);
  }
});

export { pool };
