import { pool } from "../../config/database";
import {
  CreateIssueBody,
  IssueRow,
  IssuesQueryParams,
  IssueWithReporter,
  JwtPayload,
  ReporterSummary,
  UpdateIssueBody,
  UserRow,
} from "../../types";
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
} from "../../utils/errors";

async function fetchReportersByIds(
  ids: number[]
): Promise<Map<number, ReporterSummary>> {
  const map = new Map<number, ReporterSummary>();
  if (ids.length === 0) return map;

  const uniqueIds = [...new Set(ids)];
  const placeholders = uniqueIds.map((_, i) => `$${i + 1}`).join(", ");
  const result = await pool.query<Pick<UserRow, "id" | "name" | "role">>(
    `SELECT id, name, role FROM users WHERE id IN (${placeholders})`,
    uniqueIds
  );

  for (const row of result.rows) {
    map.set(row.id, { id: row.id, name: row.name, role: row.role });
  }
  return map;
}

function attachReporter(
  issue: IssueRow,
  reporters: Map<number, ReporterSummary>
): IssueWithReporter {
  const reporter = reporters.get(issue.reporter_id);
  if (!reporter) {
    throw new NotFoundError("Reporter not found for issue");
  }
  return {
    id: issue.id,
    title: issue.title,
    description: issue.description,
    type: issue.type,
    status: issue.status,
    reporter,
    created_at: issue.created_at,
    updated_at: issue.updated_at,
  };
}

export async function createIssue(
  reporterId: number,
  input: CreateIssueBody
): Promise<IssueRow> {
  const result = await pool.query<IssueRow>(
    `INSERT INTO issues (title, description, type, reporter_id)
     VALUES ($1, $2, $3, $4)
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    [input.title, input.description, input.type, reporterId]
  );
  return result.rows[0];
}

export async function getAllIssues(
  params: IssuesQueryParams
): Promise<IssueWithReporter[]> {
  const conditions: string[] = [];
  const values: (string | IssueRow["status"] | IssueRow["type"])[] = [];
  let paramIndex = 1;

  if (params.type) {
    conditions.push(`type = $${paramIndex++}`);
    values.push(params.type);
  }
  if (params.status) {
    conditions.push(`status = $${paramIndex++}`);
    values.push(params.status);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const orderDirection = params.sort === "oldest" ? "ASC" : "DESC";

  const issuesResult = await pool.query<IssueRow>(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues
     ${whereClause}
     ORDER BY created_at ${orderDirection}`,
    values
  );

  const reporterIds = issuesResult.rows.map((i) => i.reporter_id);
  const reporters = await fetchReportersByIds(reporterIds);

  return issuesResult.rows.map((issue) => attachReporter(issue, reporters));
}

export async function getIssueById(id: number): Promise<IssueWithReporter> {
  const result = await pool.query<IssueRow>(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues WHERE id = $1`,
    [id]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Issue not found");
  }

  const issue = result.rows[0];
  const reporters = await fetchReportersByIds([issue.reporter_id]);
  return attachReporter(issue, reporters);
}

export async function updateIssue(
  issueId: number,
  user: JwtPayload,
  updates: UpdateIssueBody
): Promise<IssueRow> {
  const existing = await pool.query<IssueRow>(
    `SELECT id, title, description, type, status, reporter_id, created_at, updated_at
     FROM issues WHERE id = $1`,
    [issueId]
  );

  if (existing.rows.length === 0) {
    throw new NotFoundError("Issue not found");
  }

  const issue = existing.rows[0];

  if (updates.status !== undefined && user.role !== "maintainer") {
    throw new ForbiddenError("Only maintainers can change issue status");
  }

  if (user.role !== "maintainer") {
    if (issue.reporter_id !== user.id) {
      throw new ForbiddenError(
        "Contributors can only update their own issues"
      );
    }
    if (issue.status !== "open") {
      throw new ConflictError(
        "Cannot update issue unless status is open"
      );
    }
  }

  const fields: string[] = [];
  const values: (string | IssueRow["type"] | IssueRow["status"] | number)[] =
    [];
  let paramIndex = 1;

  if (updates.title !== undefined) {
    fields.push(`title = $${paramIndex++}`);
    values.push(updates.title);
  }
  if (updates.description !== undefined) {
    fields.push(`description = $${paramIndex++}`);
    values.push(updates.description);
  }
  if (updates.type !== undefined) {
    fields.push(`type = $${paramIndex++}`);
    values.push(updates.type);
  }
  if (updates.status !== undefined) {
    fields.push(`status = $${paramIndex++}`);
    values.push(updates.status);
  }

  fields.push("updated_at = NOW()");
  values.push(issueId);

  const result = await pool.query<IssueRow>(
    `UPDATE issues SET ${fields.join(", ")}
     WHERE id = $${paramIndex}
     RETURNING id, title, description, type, status, reporter_id, created_at, updated_at`,
    values
  );

  return result.rows[0];
}

export async function deleteIssue(issueId: number): Promise<void> {
  const result = await pool.query<{ id: number }>(
    "DELETE FROM issues WHERE id = $1 RETURNING id",
    [issueId]
  );

  if (result.rows.length === 0) {
    throw new NotFoundError("Issue not found");
  }
}

export async function validateReporterExists(reporterId: number): Promise<void> {
  const result = await pool.query<{ id: number }>(
    "SELECT id FROM users WHERE id = $1",
    [reporterId]
  );
  if (result.rows.length === 0) {
    throw new BadRequestError("Reporter user does not exist");
  }
}
