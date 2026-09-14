import { vaultService } from '../services/vaultService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const uploadVaultFile = asyncHandler(async (req, res) => {
  const document = await vaultService.processVaultUpload(req.user.id, req.file);
  return res.status(201).json(new ApiResponse(201, { document }, 'File uploaded to vault successfully'));
});
