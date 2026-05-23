import pg from "pg";

const { Pool } = pg;

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL must be set");
}

const pool = new Pool({ connectionString: DATABASE_URL });

const signedPattern =
  "(signed|became public law|became law|public law|enacted|approved by the governor)";
const passedPattern =
  "(passed house|passed senate|passed/agreed|agreed to in house|agreed to in senate|passed by|passed enrolled|returned passed|third reading passed|adopted|adopted by)";
const committeePattern = "(committee|referred|reported)";
const floorVotePattern = "\\m(roll|yea|nay|vote|floor)\\M|agreed to";
// "not agreed to in Senate/House" is a failed vote. Must be tested before passedPattern
// because passedPattern's "agreed to in senate/house" is a substring of "not agreed to ...".
const notAgreedToPattern = "not agreed to";
const deadPattern =
  "(died|dead|failed|vetoed|tabled indefinitely|indefinitely postponed|withdrawn)";

async function main() {
  try {
    const federal = await pool.query(
      `
      update federal_bills
      set
        stage_introduced = true,
        stage_committee = coalesce(latest_action, '') ~* $1,
        stage_floor_vote = coalesce(latest_action, '') ~* $2,
        stage_signed_enacted = coalesce(latest_action, '') ~* $3,
        stage_passed = (
          not (coalesce(latest_action, '') ~* $4)
          and (coalesce(latest_action, '') ~* $3 or coalesce(latest_action, '') ~* $5)
        ),
        stage_dead = (
          coalesce(latest_action, '') ~* $4
          or coalesce(latest_action, '') ~* $6
        )
      `,
      [
        committeePattern,
        floorVotePattern,
        signedPattern,
        notAgreedToPattern,
        passedPattern,
        deadPattern,
      ],
    );

    const state = await pool.query(
      `
      update state_bills
      set
        stage_introduced = true,
        stage_committee = (coalesce(status, '') || ' ' || coalesce(raw->>'latest_action_description', '')) ~* $1,
        stage_floor_vote = (coalesce(status, '') || ' ' || coalesce(raw->>'latest_action_description', '')) ~* $2,
        stage_signed_enacted = (coalesce(status, '') || ' ' || coalesce(raw->>'latest_action_description', '')) ~* $3,
        stage_passed = (
          not ((coalesce(status, '') || ' ' || coalesce(raw->>'latest_action_description', '')) ~* $4)
          and (
            (coalesce(status, '') || ' ' || coalesce(raw->>'latest_action_description', '')) ~* $3
            or (coalesce(status, '') || ' ' || coalesce(raw->>'latest_action_description', '')) ~* $5
          )
        ),
        stage_dead = (
          (coalesce(status, '') || ' ' || coalesce(raw->>'latest_action_description', '')) ~* $4
          or (coalesce(status, '') || ' ' || coalesce(raw->>'latest_action_description', '')) ~* $6
        )
      `,
      [
        committeePattern,
        floorVotePattern,
        signedPattern,
        notAgreedToPattern,
        passedPattern,
        deadPattern,
      ],
    );

    console.log(
      JSON.stringify(
        {
          federalBillsUpdated: federal.rowCount,
          stateBillsUpdated: state.rowCount,
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
