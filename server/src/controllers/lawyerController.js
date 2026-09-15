import { lawyerService } from '../services/lawyerService.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiResponse } from '../utils/ApiResponse.js';

export const getLawyers = asyncHandler(async (req, res) => {
  const lawyers = await lawyerService.getLawyers(req.query);
  return res.status(200).json(new ApiResponse(200, { lawyers }, 'Lawyers directory fetched'));
});

export const getLawyerDetail = asyncHandler(async (req, res) => {
  const lawyer = await lawyerService.getLawyerDetail(req.params.id);
  return res.status(200).json(new ApiResponse(200, { lawyer }, 'Lawyer details fetched'));
});
