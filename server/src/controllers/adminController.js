import { adminService } from '../services/adminService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await adminService.getAllUsers();
  return res.status(200).json(new ApiResponse(200, { users }, 'Admin users list fetched'));
});

export const updateUserStatus = asyncHandler(async (req, res) => {
  const user = await adminService.updateUserStatus(req.user.id, req.params.id, req.body.status);
  return res.status(200).json(new ApiResponse(200, { user }, 'User status updated'));
});

export const getLawyers = asyncHandler(async (req, res) => {
  const lawyers = await adminService.getAllLawyers();
  return res.status(200).json(new ApiResponse(200, { lawyers }, 'Admin lawyers list fetched'));
});

export const verifyLawyer = asyncHandler(async (req, res) => {
  const lawyer = await adminService.verifyLawyer(req.user.id, req.params.id, req.body.isVerified);
  return res.status(200).json(new ApiResponse(200, { lawyer }, 'Lawyer verification status updated'));
});

export const getAuditLogs = asyncHandler(async (req, res) => {
  const auditLogs = await adminService.getAuditLogs();
  return res.status(200).json(new ApiResponse(200, { auditLogs }, 'System audit logs fetched'));
});
