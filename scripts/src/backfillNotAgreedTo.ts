import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: DATABASE_URL });

async function main() {
  try {
    const federal = await pool.query(`
      update federal_bills
      set
        stage_passed = false,
        stage_dead = true
      where coalesce(latest_action, '') ilike '%not agreed to%'
    `);

    const state = await pool.query(`
      update state_bills
      set
        stage_passed = false,
        stage_dead = true
      where
        (coalesce(status, '') || ' ' || coalesce(raw->>'latest_action_description', ''))
        ilike '%not agreed to%'
    `);

    console.log(
      JSON.stringify(
        {
          federalBillsFixed: federal.rowCount,
          stateRowsFixed: state.rowCount,
        },
        null,
        2,
      ),
    );
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
