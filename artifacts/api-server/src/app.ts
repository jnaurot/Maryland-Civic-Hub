import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();
const corsOrigin =
  process.env.CORS_ORIGIN ??
  (process.env.NODE_ENV === "production" ? false : true);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors({ origin: corsOrigin }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Serve the frontend build when FRONTEND_DIST_PATH is set (production).
// Vite outputs content-hashed filenames under /assets/ so those get a
// 1-year immutable cache. Everything else (index.html, favicon, etc.)
// gets no-cache so the browser always re-validates.
const distPath = process.env.FRONTEND_DIST_PATH
  ? path.resolve(process.env.FRONTEND_DIST_PATH)
  : null;

if (distPath) {
  app.use(
    "/assets",
    express.static(path.join(distPath, "assets"), {
      maxAge: "1y",
      immutable: true,
      etag: false,
      lastModified: false,
    }),
  );
  app.use(
    express.static(distPath, {
      maxAge: 0,
      etag: true,
      index: false,
    }),
  );
  // SPA fallback — serve index.html for any non-API, non-asset route
  app.get(/^(?!\/api\/).*/, (_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
  logger.info({ distPath }, "Serving frontend static files");
}

export default app;
