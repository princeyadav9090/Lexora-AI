import { authService } from '../services/authService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const register = asyncHandler(async (req, res) => {
  const result = await authService.register(req.body);
  return res
    .status(201)
    .json(new ApiResponse(201, result, 'Registration successful'));
});

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(req.body);
  return res
    .status(200)
    .json(new ApiResponse(200, result, 'Login successful'));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { user: req.user }, 'Current user fetched'));
});

export const logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user?.id);
  return res
    .status(200)
    .json(new ApiResponse(200, null, 'Logged out successfully'));
});
