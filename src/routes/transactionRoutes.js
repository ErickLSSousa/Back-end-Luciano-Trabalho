import { Router } from "express";
import {
    deposit,
    withdraw,
    transfer,
} from "../controllers/transactionController";
import { authMiddleware } from "../middlewares/authMiddleware";

const router = Router();

router.use(authMiddleware);

router.post("/deposit", deposit);
router.post("/withdraw", withdraw);
router.post("/transfer", transfer);

export default router;