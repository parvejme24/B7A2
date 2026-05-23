import { Router } from "express";
import { asyncHandler } from "../../utils/asyncHandler";
import * as authController from "./auth.controller";

const router = Router();

router.post("/signup", asyncHandler(authController.signup));
router.post("/login", asyncHandler(authController.login));

export default router;
