import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false,
});

export async function addToWaitlist(
  name: string,
  email: string
): Promise<void> {
  try {
    await pool.query(
      "INSERT INTO waitlist_entries (name, email) VALUES ($1, $2)",
      [name, email]
    );
  } catch (error: unknown) {
    // PostgreSQL unique constraint violation code
    if (
      error instanceof Error &&
      "code" in error &&
      (error as { code: string }).code === "23505"
    ) {
      throw new Error("DUPLICATE_EMAIL");
    }
    throw error;
  }
}

export async function getWaitlistCount(): Promise<number> {
  const result = await pool.query(
    "SELECT COUNT(*) AS count FROM waitlist_entries"
  );
  return parseInt(result.rows[0].count, 10);
}
