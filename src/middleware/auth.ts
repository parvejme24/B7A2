import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { JwtPayload, UserRole } from "../types";
import { ForbiddenError, UnauthorizedError } from "../utils/errors";
import { asyncHandler } from "../utils/asyncHandler";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

function extractToken(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  const trimmed = authHeader.trim();
  if (trimmed.toLowerCase().startsWith("bearer ")) {
    return trimmed.slice(7).trim();
  }
  return trimmed;
}

export const authenticate = asyncHandler(
  async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const token = extractToken(req.headers.authorization);
    if (!token) {
      throw new UnauthorizedError("Missing or invalid authentication token");
    }

    try {
      const decoded = jwt.verify(token, env.jwtSecret) as JwtPayload;
      if (!decoded.id || !decoded.role) {
        throw new UnauthorizedError("Invalid token payload");
      }
      req.user = decoded;
      next();
    } catch {
      throw new UnauthorizedError("Missing, expired, or invalid JWT token");
    }
  }
);

export function requireRole(...roles: UserRole[]) {
  return asyncHandler(
    async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
      if (!req.user) {
        throw new UnauthorizedError("Authentication required");
      }
      if (!roles.includes(req.user.role)) {
        throw new ForbiddenError("Insufficient permissions");
      }
      next();
    }
  );
}

export const requireMaintainer = requireRole("maintainer");
