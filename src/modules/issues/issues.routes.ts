import { Router } from "express";
import { authenticate, requireMaintainer } from "../../middleware/auth";
import { asyncHandler } from "../../utils/asyncHandler";
import * as issuesController from "./issues.controller";

const router = Router();

router.get("/", asyncHandler(issuesController.getAllIssues));
router.get("/:id", asyncHandler(issuesController.getIssueById));

router.post("/", authenticate, asyncHandler(issuesController.createIssue));

router.patch("/:id", authenticate, asyncHandler(issuesController.updateIssue));

router.delete(
  "/:id",
  authenticate,
  requireMaintainer,
  asyncHandler(issuesController.deleteIssue)
);

export default router;
