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

export type WaitlistEntry = {
  id: number;
  name: string;
  email: string;
  created_at: string;
};

export async function getWaitlistEntries(): Promise<WaitlistEntry[]> {
  const result = await pool.query(
    "SELECT id, name, email, created_at FROM waitlist_entries ORDER BY created_at ASC"
  );
  return result.rows;
}

export async function removeFromWaitlist(id: number): Promise<boolean> {
  const result = await pool.query(
    "DELETE FROM waitlist_entries WHERE id = $1",
    [id]
  );
  return (result.rowCount ?? 0) > 0;
}
