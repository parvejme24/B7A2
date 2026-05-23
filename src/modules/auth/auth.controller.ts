import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { LoginBody, SignupBody } from "../../types";
import { sendSuccess } from "../../utils/response";
import { validateLogin, validateSignup } from "../../utils/validators";
import * as authService from "./auth.service";

export async function signup(req: Request, res: Response): Promise<void> {
  const input = validateSignup(req.body as SignupBody);
  const user = await authService.registerUser(input);
  sendSuccess(res, StatusCodes.CREATED, user, "User registered successfully");
}

export async function login(req: Request, res: Response): Promise<void> {
  const input = validateLogin(req.body as LoginBody);
  const result = await authService.loginUser(input);
  sendSuccess(res, StatusCodes.OK, result, "Login successful");
}
