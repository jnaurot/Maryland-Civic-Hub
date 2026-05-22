import app from "./app";
import { logger } from "./lib/logger";
import { pool, initTriggers } from "@workspace/db";
import {
  checkAndIngestIfStale,
  ingestAllFederalMembers,
  logRefreshEvent,
} from "./lib/ingestFederalMembers";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

function getMsUntilNextSundayMidnight(): number {
  const now = new Date();
  const next = new Date(now);
  const daysUntilSunday = (7 - now.getDay()) % 7 || 7;
  next.setDate(now.getDate() + daysUntilSunday);
  next.setHours(0, 0, 0, 0);
  return next.getTime() - now.getTime();
}

async function runWeeklyRefresh(): Promise<void> {
  logger.info("Running scheduled weekly federal member refresh");
  logRefreshEvent({ event: "weekly_refresh_start" });
  try {
    const { count } = await ingestAllFederalMembers();
    logRefreshEvent({ event: "weekly_refresh_complete", count });
  } catch (err) {
    logger.warn({ err }, "Weekly federal member refresh failed, retrying in 1 hour");
    logRefreshEvent({ event: "weekly_refresh_failed_retrying", error: String(err) });
    setTimeout(async () => {
      try {
        const { count } = await ingestAllFederalMembers();
        logRefreshEvent({ event: "weekly_refresh_retry_complete", count });
      } catch (retryErr) {
        logger.error({ err: retryErr }, "Weekly federal member refresh retry failed, giving up until next week");
        logRefreshEvent({ event: "weekly_refresh_retry_failed", error: String(retryErr) });
      }
    }, 60 * 60 * 1000);
  }
}

function scheduleWeeklyRefresh(): void {
  const ms = getMsUntilNextSundayMidnight();
  const nextRun = new Date(Date.now() + ms);
  logger.info({ nextRun: nextRun.toISOString() }, "Federal member weekly refresh scheduled");
  setTimeout(async () => {
    await runWeeklyRefresh();
    scheduleWeeklyRefresh();
  }, ms);
}

async function start() {
  try {
    await initTriggers(pool);
    logger.info("DB triggers and extensions initialized");
  } catch (err) {
    logger.warn({ err }, "DB trigger initialization failed — continuing");
  }

  // Fire in background — server starts immediately; DB queries fall back to Congress.gov if empty
  checkAndIngestIfStale().catch((err) =>
    logger.error({ err }, "Federal member ingestion failed at startup"),
  );

  scheduleWeeklyRefresh();

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }
    logger.info({ port }, "Server listening");
  });
}

start().catch((err) => {
  logger.error({ err }, "Failed to start server");
  process.exit(1);
});
