import { BadRequestError } from "./errors";
import {
  CreateIssueBody,
  IssueStatus,
  IssueType,
  LoginBody,
  SignupBody,
  UpdateIssueBody,
  UserRole,
} from "../types";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateSignup(body: SignupBody): SignupBody {
  const { name, email, password, role } = body;

  if (!name || typeof name !== "string" || name.trim().length === 0) {
    throw new BadRequestError("Name is required");
  }
  if (!email || typeof email !== "string" || !EMAIL_REGEX.test(email)) {
    throw new BadRequestError("Valid email is required");
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    throw new BadRequestError("Password is required");
  }

  const resolvedRole: UserRole = role ?? "contributor";
  if (resolvedRole !== "contributor" && resolvedRole !== "maintainer") {
    throw new BadRequestError("Role must be contributor or maintainer");
  }

  return {
    name: name.trim(),
    email: email.trim().toLowerCase(),
    password,
    role: resolvedRole,
  };
}

export function validateLogin(body: LoginBody): LoginBody {
  const { email, password } = body;

  if (!email || typeof email !== "string") {
    throw new BadRequestError("Email is required");
  }
  if (!password || typeof password !== "string") {
    throw new BadRequestError("Password is required");
  }

  return { email: email.trim().toLowerCase(), password };
}

export function validateCreateIssue(body: CreateIssueBody): CreateIssueBody {
  const { title, description, type } = body;

  if (!title || typeof title !== "string" || title.trim().length === 0) {
    throw new BadRequestError("Title is required");
  }
  if (title.trim().length > 150) {
    throw new BadRequestError("Title must not exceed 150 characters");
  }
  if (
    !description ||
    typeof description !== "string" ||
    description.trim().length < 20
  ) {
    throw new BadRequestError("Description must be at least 20 characters");
  }
  if (type !== "bug" && type !== "feature_request") {
    throw new BadRequestError("Type must be bug or feature_request");
  }

  return {
    title: title.trim(),
    description: description.trim(),
    type,
  };
}

export function validateUpdateIssue(body: UpdateIssueBody): UpdateIssueBody {
  const updates: UpdateIssueBody = {};

  if (body.title !== undefined) {
    if (typeof body.title !== "string" || body.title.trim().length === 0) {
      throw new BadRequestError("Title cannot be empty");
    }
    if (body.title.trim().length > 150) {
      throw new BadRequestError("Title must not exceed 150 characters");
    }
    updates.title = body.title.trim();
  }

  if (body.description !== undefined) {
    if (
      typeof body.description !== "string" ||
      body.description.trim().length < 20
    ) {
      throw new BadRequestError("Description must be at least 20 characters");
    }
    updates.description = body.description.trim();
  }

  if (body.type !== undefined) {
    if (body.type !== "bug" && body.type !== "feature_request") {
      throw new BadRequestError("Type must be bug or feature_request");
    }
    updates.type = body.type;
  }

  if (
    updates.title === undefined &&
    updates.description === undefined &&
    updates.type === undefined
  ) {
    throw new BadRequestError("At least one field must be provided to update");
  }

  return updates;
}

export function parseIssueType(value: string | undefined): IssueType | undefined {
  if (!value) return undefined;
  if (value === "bug" || value === "feature_request") return value;
  throw new BadRequestError("Invalid type filter. Use bug or feature_request");
}

export function parseIssueStatus(
  value: string | undefined
): IssueStatus | undefined {
  if (!value) return undefined;
  if (value === "open" || value === "in_progress" || value === "resolved") {
    return value;
  }
  throw new BadRequestError(
    "Invalid status filter. Use open, in_progress, or resolved"
  );
}

export function parseSort(value: string | undefined): "newest" | "oldest" {
  if (!value || value === "newest") return "newest";
  if (value === "oldest") return "oldest";
  throw new BadRequestError("Invalid sort parameter. Use newest or oldest");
}
