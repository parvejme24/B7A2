import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  CreateIssueBody,
  IssuesQueryParams,
  UpdateIssueBody,
} from "../../types";
import { sendSuccess } from "../../utils/response";
import {
  parseIssueStatus,
  parseIssueType,
  parseSort,
  validateCreateIssue,
  validateUpdateIssue,
} from "../../utils/validators";
import * as issuesService from "./issues.service";

export async function createIssue(req: Request, res: Response): Promise<void> {
  const input = validateCreateIssue(req.body as CreateIssueBody);
  const reporterId = req.user!.id;
  await issuesService.validateReporterExists(reporterId);
  const issue = await issuesService.createIssue(reporterId, input);
  sendSuccess(res, StatusCodes.CREATED, issue, "Issue created successfully");
}

export async function getAllIssues(req: Request, res: Response): Promise<void> {
  const params: IssuesQueryParams = {
    sort: parseSort(req.query.sort as string | undefined),
    type: parseIssueType(req.query.type as string | undefined),
    status: parseIssueStatus(req.query.status as string | undefined),
  };
  const issues = await issuesService.getAllIssues(params);
  sendSuccess(res, StatusCodes.OK, issues, "Issues retrived successfully");
}

function parseIdParam(idParam: string | string[]): number {
  const raw = Array.isArray(idParam) ? idParam[0] : idParam;
  return parseInt(raw, 10);
}

export async function getIssueById(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req.params.id);
  if (isNaN(id)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid issue ID",
    });
    return;
  }
  const issue = await issuesService.getIssueById(id);
  sendSuccess(res, StatusCodes.OK, issue, "Issue retrived successfully");
}

export async function updateIssue(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req.params.id);
  if (isNaN(id)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid issue ID",
    });
    return;
  }
  const updates = validateUpdateIssue(req.body as UpdateIssueBody);
  const issue = await issuesService.updateIssue(id, req.user!, updates);
  sendSuccess(res, StatusCodes.OK, issue, "Issue updated successfully");
}

export async function deleteIssue(req: Request, res: Response): Promise<void> {
  const id = parseIdParam(req.params.id);
  if (isNaN(id)) {
    res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: "Invalid issue ID",
    });
    return;
  }
  await issuesService.deleteIssue(id);
  sendSuccess(res, StatusCodes.OK, undefined, "Issue deleted successfully");
}
