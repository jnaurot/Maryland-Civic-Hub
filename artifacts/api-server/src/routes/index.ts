import { Router, type IRouter } from "express";
import healthRouter from "./health";
import representativesRouter from "./representatives";
import federalRouter from "./federal";
import stateRouter from "./state";
import financeRouter from "./finance";

const router: IRouter = Router();

router.use(healthRouter);
router.use(representativesRouter);
router.use(federalRouter);
router.use(stateRouter);
router.use(financeRouter);

export default router;
