import { getStateLegislator } from "../../artifacts/api-server/src/lib/stateLegislatorCache";

/**
 * Seed known Maryland legislators into the state_legislators cache.
 * Run this script when OpenStates rate limits are not active.
 *
 * Usage:
 *   OPENSTATES_API_KEY=xxx DATABASE_URL=xxx pnpm --filter @workspace/scripts tsx ./src/seedMdLegislators.ts
 */

const KNOWN_MD_IDS = [
  "ocd-person/b6c25db2-72d7-47d0-a70d-f598d135180a",
  "ocd-person/04eec23c-719e-46b1-ae56-f34de9207e8c",
  "ocd-person/2b26dc52-cb0c-4750-af6b-9c00e12eef29",
  "ocd-person/d09ea440-65a0-4e4f-81dd-201202f1ff3c",
  "ocd-person/a07dd6a0-012b-41a7-901d-754d1cd194bb",
  "ocd-person/d848993b-65e9-4ea3-ab2a-dfaf796142cc",
  "ocd-person/9ec0fe7d-36ae-437b-9bcf-754da8e4e247",
  "ocd-person/8ae09510-12a7-41f7-ae83-82b48e3b9af4",
  "ocd-person/55cb04cb-cd28-44ed-a4a4-dcb2b064ede9",
  "ocd-person/1403e204-8965-4cb4-adcb-6754808e119a",
  "ocd-person/1dcca9f3-9880-4ed6-95fc-c8a8435f63fd",
  "ocd-person/d0e4f14b-c4a3-485e-88f7-ea7a86f67ca1",
  "ocd-person/86f0d40f-05f4-46a2-9c24-21ff52fdc6fe",
];

async function main() {
  console.log(`Seeding ${KNOWN_MD_IDS.length} MD legislators...`);
  let success = 0;
  let failed = 0;

  for (const id of KNOWN_MD_IDS) {
    try {
      const result = await getStateLegislator(id, console);
      console.log(`  ✓ ${result.legislator.name} (${result.legislator.chamber} ${result.legislator.district})`);
      success++;
    } catch (err) {
      console.error(`  ✗ ${id}:`, err);
      failed++;
    }
  }

  console.log(`\nDone. ${success} seeded, ${failed} failed.`);
  process.exit(failed > 0 ? 1 : 0);
}

main();
